import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import CustomMessagebox from "./CustomMessageBox.jsx";
import config from "../Config";
import Add from "../assets/Add.png";
import Cancel from "../assets/cancel.png";
import Back from "../assets/Back.png";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  ToastContainerComponent,
} from "./Toastify.jsx";

const VendorDetails = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();

  // ---------- UI/state ----------
  const [priceHistory, setPriceHistory] = useState([]);
  const [showPriceHistory, setShowPriceHistory] = useState(false);
  const [showEditProductForm, setShowEditProductForm] = useState(false);
  const [editProduct, setEditProduct] = useState({});
  const [showAddPriceEntryForm, setShowAddPriceEntryForm] = useState(false);
  const [currentProductId, setCurrentProductId] = useState("");
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [messageBoxContent, setMessageBoxContent] = useState("");

  const [newPriceEntry, setNewPriceEntry] = useState({
    date: "",
    price: "",
    tax: "",
    delivery_days: "",
  });
  const [editPriceEntry, setEditPriceEntry] = useState({
    date: "",
    price: "",
    tax: "",
    delivery_days: "",
  });
  const [isEditingPriceEntry, setIsEditingPriceEntry] = useState(null);

  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [selectedVendorData, setSelectedVendorData] = useState([]);
  const [vendorData, setVendorData] = useState([]);
  const [componentMasterData, setComponentMasterData] = useState({});
  const [choices, setChoices] = useState({
    component_type_list: [],
    category_choices: [],
  });
  const [componentList, setComponentList] = useState([]);

  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 });
  const dateInputRef = useRef(null);

  const [showEditCalendar, setShowEditCalendar] = useState(false);
  const [editCalendarPosition, setEditCalendarPosition] = useState({
    top: 0,
    left: 0,
  });
  const editDateInputRef = useRef(null);

  const [loadingVendors, setLoadingVendors] = useState(true);

  // Cache to avoid re-fetching all price tables repeatedly
  const [priceTablesCache, setPriceTablesCache] = useState(null);

  // ---------- helpers ----------
  const formatDateToYYYYMMDD = (date) => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const fetchImagesForComponent = async (componentId) => {
    try {
      const res = await fetch(
        `${config.apiBaseURL}/component_images/by-component/${componentId}/`
      );
      if (res.ok) {
        const data = await res.json();
        return data.map((item) => ({
          id: item.id,
          image: item.image,
        }));
      }
    } catch (err) {
      console.error("Error fetching images:", err);
    }
    return [];
  };

  // ---------- initial load (optimized & parallelized) ----------
  useEffect(() => {
    const loadAll = async () => {
      setLoadingVendors(true);
      try {
        // Fetch everything we need in parallel
        const [
          vendorMasterResp,
          vendorListResp,
          componentResp,
          choicesResp,
          priceTablesResp,
        ] = await Promise.all([
          fetch(`${config.apiBaseURL}/vendor_master/`),
          fetch(`${config.apiBaseURL}/vendor_list/`),
          fetch(`${config.apiBaseURL}/component/`),
          fetch(`${config.apiBaseURL}/get_choices/`),
          fetch(`${config.apiBaseURL}/price_tables/`), // <-- single fetch for all price rows
        ]);

        const [vendorMaster, vendorList, components, choicesData, priceTables] =
          await Promise.all([
            vendorMasterResp.json(),
            vendorListResp.json(),
            componentResp.json(),
            choicesResp.ok ? choicesResp.json() : Promise.resolve({}),
            priceTablesResp.json(),
          ]);

        setVendorData(vendorList);
        setChoices((prev) => ({ ...prev, ...(choicesData || {}) }));
        setComponentList(components);

        // Map: product_id -> latest price row
        // We pick the latest by current_time
        const latestPriceByProduct = new Map();
        for (const row of priceTables) {
          const pid = row.product;
          const prev = latestPriceByProduct.get(pid);
          if (!prev) {
            latestPriceByProduct.set(pid, row);
          } else {
            const prevTime = new Date(prev.current_time).getTime();
            const curTime = new Date(row.current_time).getTime();
            if (curTime > prevTime) latestPriceByProduct.set(pid, row);
          }
        }
        setPriceTablesCache(priceTables); // keep for history caching

        // Filter vendor_master for selected vendor **once**
        const matchedProducts = vendorMaster.filter(
          (product) => product.vendor === vendorId
        );

        // Component master map: product_id -> component_id (as in your original logic)
        const componentMap = components.reduce((acc, comp) => {
          acc[comp.product_id] = comp.component_id || "null";
          return acc;
        }, {});
        setComponentMasterData(componentMap);

        // Merge latest price & do NOT fetch images yet (lazy later)
        const merged = matchedProducts.map((product) => {
          const latest = latestPriceByProduct.get(product.product_id);
          return {
            ...product,
            last_price: latest?.price ?? product.last_price ?? 0,
            tax: latest?.tax ?? product.tax ?? 0,
            delivery_days: latest?.delivery_days ?? product.delivery_days ?? 0,
            images: [], // lazy
            newImages: [],
            isEditingImage: false,
            isEditingAttachment: false,
            isEditingRemarks: false,
            editableRemarks: "",
            imagesLoaded: false, // mark as not loaded
          };
        });

        setSelectedVendorData(merged);
      } catch (error) {
        console.error("Initial load error:", error);
        showErrorToast("Failed to load vendor details");
      } finally {
        setLoadingVendors(false);
      }
    };

    loadAll();
  }, [vendorId]);

  const getComponentId = (product_id) => componentMasterData[product_id] || "-";

  // ---------- price history (uses cache if available) ----------
  const fetchPriceHistory = async (productId) => {
    try {
      let allRows = priceTablesCache;
      if (!allRows) {
        const resp = await fetch(`${config.apiBaseURL}/price_tables/`);
        allRows = await resp.json();
        setPriceTablesCache(allRows);
      }

      const filtered = allRows
        .filter((entry) => entry.product === productId)
        .sort(
          (a, b) =>
            new Date(b.current_time).getTime() -
            new Date(a.current_time).getTime()
        );

      setPriceHistory(filtered);
      setCurrentProductId(productId);

      // Reflect latest price immediately in main table (from filtered[0])
      setSelectedVendorData((prev) =>
        prev.map((p) =>
          p.product_id === productId
            ? { ...p, last_price: filtered[0]?.price ?? p.last_price }
            : p
        )
      );

      setShowPriceHistory(true);
    } catch (error) {
      console.error("Error fetching price history:", error);
      showErrorToast("Failed to load price history");
    }
  };

  const handleAddPriceEntry = async () => {
    const { date, price, tax, delivery_days } = newPriceEntry;

    if (!date || price === "" || tax === "" || delivery_days === "") {
      showInfoToast("Please fill all the fields");
      return;
    }

    const payload = {
      current_time: newPriceEntry.date,
      price: newPriceEntry.price,
      tax: newPriceEntry.tax,
      delivery_days: newPriceEntry.delivery_days,
      product: currentProductId,
    };

    try {
      const response = await fetch(`${config.apiBaseURL}/price_tables/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const addedEntry = await response.json();

        // Update cache
        setPriceTablesCache((prev) =>
          prev ? [...prev, addedEntry] : [addedEntry]
        );

        // Refresh visible history (in-memory)
        await fetchPriceHistory(currentProductId);

        // Update main table last_price/tax/delivery_days
        setSelectedVendorData((prevData) =>
          prevData.map((product) =>
            product.product_id === currentProductId
              ? {
                  ...product,
                  last_price: addedEntry.price,
                  tax: addedEntry.tax,
                  delivery_days: addedEntry.delivery_days,
                }
              : product
          )
        );

        setNewPriceEntry({ date: "", price: "", tax: "", delivery_days: "" });
        setShowAddPriceEntryForm(false);
        showSuccessToast("Price entry saved successfully");
      } else {
        showErrorToast("Failed to save price entry");
      }
    } catch (error) {
      console.error("Error adding price entry:", error);
      showErrorToast("Error adding price entry");
    }
  };

  const handleEditPriceEntry = (index, entry) => {
    setIsEditingPriceEntry(index);
    setEditPriceEntry({
      date: entry.current_time,
      price: entry.price,
      tax: entry.tax,
      delivery_days: entry.delivery_days,
      product: currentProductId,
    });
  };

  const handleSavePriceEntry = async (index) => {
    const payload = {
      current_time: editPriceEntry.date,
      price: editPriceEntry.price,
      tax: editPriceEntry.tax,
      delivery_days: editPriceEntry.delivery_days,
      product: currentProductId,
    };

    const entryId = priceHistory[index].id;

    try {
      const response = await fetch(
        `${config.apiBaseURL}/price_tables/${entryId}/`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (response.ok) {
        const updatedEntry = await response.json();

        // Update local history
        const updatedHistory = [...priceHistory];
        updatedHistory[index] = updatedEntry;
        setPriceHistory(updatedHistory);

        // Update cache (replace same id)
        setPriceTablesCache((prev) =>
          (prev || []).map((e) => (e.id === updatedEntry.id ? updatedEntry : e))
        );

        // Update main table latest
        setSelectedVendorData((prevData) =>
          prevData.map((product) =>
            product.product_id === currentProductId
              ? {
                  ...product,
                  last_price: updatedEntry.price,
                  tax: updatedEntry.tax,
                  delivery_days: updatedEntry.delivery_days,
                }
              : product
          )
        );

        setIsEditingPriceEntry(null);
        showSuccessToast("Price Details Updated Successfully");
      } else {
        console.error("Failed to update price entry:", response.statusText);
        showErrorToast("Failed to update price entry");
      }
    } catch (error) {
      console.error("Error updating price entry:", error);
      showErrorToast("Error updating price entry");
    }
  };

  const handleDeletePriceEntry = async (index) => {
    try {
      const entryToDelete = priceHistory[index];

      const response = await fetch(
        `${config.apiBaseURL}/price_tables/${entryToDelete.id}/`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        showSuccessToast("Deleted successfully");

        // Update cache
        setPriceTablesCache((prev) =>
          (prev || []).filter((e) => e.id !== entryToDelete.id)
        );

        const updatedHistory = priceHistory.filter((_, i) => i !== index);
        setPriceHistory(updatedHistory);

        // Latest remaining
        const latest =
          updatedHistory.length > 0
            ? updatedHistory.reduce((a, b) =>
                new Date(a.current_time) > new Date(b.current_time) ? a : b
              )
            : null;

        // Update main table
        setSelectedVendorData((prevData) =>
          prevData.map((product) =>
            product.product_id === currentProductId
              ? {
                  ...product,
                  last_price: latest?.price ?? "NaN",
                  tax: latest?.tax ?? 0,
                  delivery_days: latest?.delivery_days ?? 0,
                }
              : product
          )
        );
      } else {
        const errorText = await response.text();
        console.error("Delete failed:", errorText);
        showErrorToast("Failed to delete price entry");
      }
    } catch (error) {
      console.error("Error deleting price entry:", error);
      showErrorToast("Error deleting price entry");
    }
  };

  const handleClosePriceHistory = () => setShowPriceHistory(false);

  const handlePriceClick = (productId) => fetchPriceHistory(productId);

  const handleInputChange = (field, value, isEditing = false) => {
    if (isEditing) {
      setEditProduct({ ...editProduct, [field]: value });
    } else {
      setNewProduct((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleEditClickVendorMaster = (index) => {
    const productToEdit = selectedVendorData[index];
    // Keep as-is, just open modal
    setEditProduct({ ...productToEdit });
    setShowEditProductForm(true);
  };

  // ---------- Lazy load images per row ----------
  const loadImagesForRow = async (index) => {
    setSelectedVendorData((prev) => {
      const copy = [...prev];
      if (copy[index].imagesLoaded) return copy;
      copy[index].imagesLoaded = true; // optimistic flag to prevent double-click spam
      return copy;
    });

    const product = selectedVendorData[index];
    const componentId = product.component_id;
    const imgs = await fetchImagesForComponent(componentId);

    setSelectedVendorData((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        images: imgs,
        imagesLoaded: true,
      };
      return updated;
    });
  };

  const saveImages = async (index) => {
    const product = selectedVendorData[index];
    const componentId = product.component_id;

    if (!product.newImages || product.newImages.length === 0) {
      showInfoToast("No new images selected.");
      return;
    }

    const formData = new FormData();
    product.newImages.forEach((file) => formData.append("images", file));

    try {
      const response = await fetch(
        `${config.apiBaseURL}/component_images/by-component/${componentId}/`,
        { method: "POST", body: formData }
      );

      if (response.ok) {
        const uploaded = await response.json();
        const uploadedImages = uploaded.map((item) => ({
          id: item.id,
          image: item.image,
        }));

        setSelectedVendorData((prevState) => {
          const updated = [...prevState];
          updated[index] = {
            ...updated[index],
            images: [...(updated[index].images || []), ...uploadedImages],
            newImages: [],
            isEditingImage: false,
            imagesLoaded: true,
          };
          return updated;
        });

        showSuccessToast("Images uploaded successfully!");
      } else {
        console.error("Upload failed:", response.statusText);
        showErrorToast("Failed to upload images.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      showErrorToast("Error uploading images.");
    }
  };

  const handleImageChange = (index, files) => {
    setSelectedVendorData((prevState) => {
      const updatedProducts = [...prevState];
      const product = updatedProducts[index];

      const existingImages = (product.images || []).map((imgObj) =>
        String(imgObj.image).toLowerCase()
      );

      const alreadySelected = (product.newImages || []).map(
        (f) => `${f.name.toLowerCase()}-${f.size}`
      );

      const added = [];
      files.forEach((file) => {
        const uniqueKey = `${file.name.toLowerCase()}-${file.size}`;

        if (alreadySelected.includes(uniqueKey)) {
          showInfoToast(`"${file.name}" is already selected — skipping.`);
          return;
        }

        const baseName = file.name.toLowerCase().split(".")[0];
        const isSaved = existingImages.some((saved) =>
          saved.includes(baseName)
        );
        if (isSaved) {
          showInfoToast(`"${file.name}" already exists in saved images.`);
          return;
        }

        added.push(file);
      });

      updatedProducts[index] = {
        ...product,
        newImages: [...(product.newImages || []), ...added],
      };

      return updatedProducts;
    });
  };

  const saveAttachment = async (index) => {
    const formData = new FormData();
    formData.append("attachments", selectedVendorData[index].attachments);

    try {
      const response = await fetch(
        `${config.apiBaseURL}/vendor_master/${selectedVendorData[index].product_id}/`,
        { method: "PATCH", body: formData }
      );

      if (response.ok) {
        const updatedProduct = await response.json();
        setSelectedVendorData((prevState) => {
          const updatedProducts = [...prevState];
          updatedProducts[index] = {
            ...updatedProduct,
            isEditingAttachment: false,
          };
          return updatedProducts;
        });
        showSuccessToast("Attachment updated successfully!");
      } else {
        console.error("Failed to update attachment:", response.statusText);
        showErrorToast("Failed to update attachment.");
      }
    } catch (error) {
      console.error("Error updating attachment:", error);
      showErrorToast("Error updating attachment.");
    }
  };

  const [newProduct, setNewProduct] = useState({
    product_id: "",
    product_description: "",
    unit_of_measurement: "",
    component_id: "",
    last_price: "",
    tax: "",
    img: null,
    attachments: null,
    category: "",
    component_type: "",
    component_specification: "",
    vendor: vendorId,
    active: "",
  });

  const handleSaveEditProduct = async () => {
    const payload = {
      product_id: editProduct.product_id,
      product_description: editProduct.product_description,
      last_price: editProduct.last_price,
      category: editProduct.category,
      component_type: editProduct.component_type,
      component_specification: editProduct.component_specification,
      unit_of_measurement: editProduct.unit_of_measurement,
      tax: editProduct.tax,
      vendor: editProduct.vendor,
    };

    try {
      const response = await fetch(
        `${config.apiBaseURL}/vendor_master/${editProduct.product_id}/`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        const savedProduct = await response.json();
        setSelectedVendorData((prev) =>
          prev.map((p) =>
            p.product_id === savedProduct.product_id ? savedProduct : p
          )
        );
        setShowEditProductForm(false);
      } else {
        console.error("Error updating product:", response.statusText);
        showErrorToast("Failed to update product");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      showErrorToast("Error updating product");
    }
  };

  const handleAttachmentChange = (index, file) => {
    setSelectedVendorData((prevState) => {
      const updatedProducts = [...prevState];
      updatedProducts[index] = { ...updatedProducts[index], attachments: file };
      return updatedProducts;
    });
  };

  const enableEditField = (index, field) => {
    setSelectedVendorData((prevState) => {
      const updatedProducts = [...prevState];
      updatedProducts[index] = { ...updatedProducts[index], [field]: true };
      return updatedProducts;
    });
  };

  const cancelEditField = (index, field) => {
    setSelectedVendorData((prevState) => {
      const updatedProducts = [...prevState];
      updatedProducts[index] = { ...updatedProducts[index], [field]: false };
      return updatedProducts;
    });
  };

  const handleAddNewProduct = async () => {
    const requiredFields = [
      "product_description",
      "category",
      "component_type",
      "component_specification",
      "unit_of_measurement",
      "component_id",
    ];

    const emptyFields = requiredFields.filter(
      (field) => !newProduct[field] || String(newProduct[field]).trim() === ""
    );

    if (emptyFields.length > 0) {
      setMessageBoxContent(
        `Please fill in the following fields: ${emptyFields
          .map((field) => field.replace(/_/g, " "))
          .join(", ")}`
      );
      setShowMessageBox(true);
      showWarningToast("Please fill all the required fields");
      return;
    }

    const formData = new FormData();
    Object.entries(newProduct).forEach(([key, value]) => {
      if (value !== null) formData.append(key, value);
    });
    formData.append("vendor", vendorId);

    try {
      const response = await fetch(`${config.apiBaseURL}/vendor_master/`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const addedProduct = await response.json();
        showSuccessToast("Product saved successfully");

        const componentId = addedProduct.component_id;

        try {
          await fetch(
            `${config.apiBaseURL}/request_component/status/Added/${componentId}/`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ vendor_added: true }),
            }
          );
        } catch (patchError) {
          console.error("Failed to patch request_component:", patchError);
        }

        setSelectedVendorData((prev) => [...prev, addedProduct]);
        setNewProduct({
          product_description: "",
          img: null,
          attachments: null,
          last_price: "",
          tax: "",
          category: "",
          component_type: "",
          component_specification: "",
          unit_of_measurement: "",
          vendor: vendorId,
          active: true,
          component_id: "",
        });
        setShowAddProductForm(false);

        const { last_price, tax, product_id, delivery_days } = addedProduct;
        const priceTablePayload = {
          current_time: new Date().toISOString(),
          tax: tax,
          price: last_price,
          delivery_days: delivery_days,
          product: product_id,
        };

        const priceResponse = await fetch(
          `${config.apiBaseURL}/price_tables/`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(priceTablePayload),
          }
        );

        if (priceResponse.ok) {
          const newRow = await priceResponse.json();
          // Update cache
          setPriceTablesCache((prev) => (prev ? [...prev, newRow] : [newRow]));
        } else {
          console.error(
            "Error updating price table:",
            priceResponse.statusText
          );
        }
      } else {
        showErrorToast("Failed to save product");
      }
    } catch (error) {
      showErrorToast("Something went wrong. Please try again");
      console.error("Error adding product:", error);
    }
  };

  const handleBackClick = () => navigate("/vendor");

  const getVendorName = (vendor_id) => {
    const VendorName =
      vendorData.find((vendor) => vendor.vendor_id === vendor_id)
        ?.vendor_name || "";
    return VendorName;
  };

  const toggleVendorStatus = async (
    productId,
    currentStatus,
    vendorIdArg,
    componentId
  ) => {
    try {
      const updatedStatus = !currentStatus;

      const vendorResponse = await fetch(`${config.apiBaseURL}/vendor_list/`);
      if (!vendorResponse.ok) throw new Error("Failed to fetch vendor list");

      const vendorList = await vendorResponse.json();
      const matchedVendor = vendorList.find((v) => v.vendor_id === vendorIdArg);
      if (!matchedVendor) {
        showErrorToast("Vendor not found.");
        return;
      }

      if (matchedVendor.active === false && updatedStatus === true) {
        showInfoToast(
          "Cannot activate product because the vendor is inactive."
        );
        return;
      }

      const response = await fetch(
        `${config.apiBaseURL}/vendor_master/${productId}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ active: updatedStatus }),
        }
      );

      if (response.ok) {
        setSelectedVendorData((prevData) =>
          prevData.map((product) =>
            product.product_id === productId
              ? { ...product, active: updatedStatus }
              : product
          )
        );
        showSuccessToast(
          `Vendor ${componentId} marked as ${
            updatedStatus ? "Active" : "Inactive"
          } successfully`
        );
      } else {
        console.error("Error updating vendor status:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating vendor status:", error);
    }
  };

  const saveRemarks = async (index) => {
    const product = selectedVendorData[index];
    const payload = { remarks: product.editableRemarks || "" };

    try {
      const response = await fetch(
        `${config.apiBaseURL}/vendor_master/${product.product_id}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        const updatedProduct = await response.json();
        const updatedList = [...selectedVendorData];
        updatedList[index] = {
          ...updatedProduct,
          isEditingRemarks: false,
          editableRemarks: "",
        };
        setSelectedVendorData(updatedList);
        showSuccessToast("Remarks updated successfully!");
      } else {
        console.error("Failed to update remarks:", response.statusText);
        showErrorToast("Failed to update remarks.");
      }
    } catch (error) {
      console.error("Error updating remarks:", error);
      showErrorToast("Error occurred while updating remarks.");
    }
  };

  const handleDeleteImage = async (productIndex, imageId) => {
    try {
      const response = await fetch(
        `${config.apiBaseURL}/component_images/${imageId}/`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        const updatedData = [...selectedVendorData];
        updatedData[productIndex].images = updatedData[
          productIndex
        ].images.filter((img) => img.id !== imageId);
        setSelectedVendorData(updatedData);
        showSuccessToast("Image deleted successfully");
      } else {
        showErrorToast("Failed to delete image");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      showErrorToast("An error occurred");
    }
  };

  // ---------- render ----------
  return (
    <div>
      <h4>
        Vendor Data for {getVendorName(vendorId)} - {vendorId}
      </h4>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "10px",
        }}
      >
        <button
          onClick={handleBackClick}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "4px",
          }}
          title="Back to vendor List"
        >
          <img
            src={Back}
            alt="Back to Vendor list "
            style={{ width: "20px", height: "20px" }}
          />
        </button>

        <img
          src={showAddProductForm ? Cancel : Add}
          alt={showAddProductForm ? "Cancel New Product" : "Add New Product"}
          title={showAddProductForm ? "Cancel New Product" : "Add New Product"}
          style={{ width: "24px", height: "24px", cursor: "pointer" }}
          onClick={() => setShowAddProductForm(!showAddProductForm)}
        />
      </div>

      {/* Add Product Modal */}
      {showAddProductForm && (
        <div className="modal-overlay">
          <div className="popup">
            <h3>Add New Product</h3>

            {/* Component ID Dropdown */}
            <select
              value={newProduct.component}
              onChange={(e) => {
                const selectedComponentId = e.target.value;
                const selectedComponent = componentList.find(
                  (comp) => comp.component_id === selectedComponentId
                );

                setNewProduct({
                  ...newProduct,
                  component_id: selectedComponentId,
                  category: selectedComponent?.category || "",
                  component_type: selectedComponent?.component_type || "",
                  component_specification:
                    selectedComponent?.component_specification || "",
                  unit_of_measurement:
                    selectedComponent?.unit_of_measurement || "",
                });
              }}
            >
              <option value="">Select Component ID</option>
              {componentList.map((comp) => (
                <option key={comp.component_id} value={comp.component_id}>
                  {comp.component_id}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Product Description"
              value={newProduct.product_description}
              onChange={(e) =>
                handleInputChange("product_description", e.target.value)
              }
            />

            <input
              type="text"
              placeholder="Category"
              value={newProduct.category}
              readOnly
            />
            <input
              type="text"
              placeholder="Component Type"
              value={newProduct.component_type}
              readOnly
            />
            <input
              type="text"
              placeholder="Component Specification"
              value={newProduct.component_specification}
              readOnly
            />
            <input
              type="text"
              placeholder="Unit of Measurement"
              value={newProduct.unit_of_measurement}
              readOnly
            />

            <div className="popup-actions">
              <button onClick={handleAddNewProduct}>Save Product</button>
              <button onClick={() => setShowAddProductForm(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Price History Modal */}
      {showPriceHistory && (
        <div className="modal-overlay">
          <div className="popup-wrapper">
            <div
              className={`popups ${
                showAddPriceEntryForm ? "popup-expanded" : ""
              }`}
            >
              <span className="x-button" onClick={handleClosePriceHistory}>
                &times;
              </span>
              <h3>Price History</h3>
              <div className="button-wrapper">
                <button
                  onClick={() => {
                    setNewPriceEntry({
                      date: "",
                      price: "",
                      tax: "",
                      delivery_days: "",
                    });
                    setShowAddPriceEntryForm(true);
                  }}
                  className="price-entry-button"
                  style={{ marginBottom: "10px" }}
                >
                  Add Price Entry
                </button>
              </div>

              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Price</th>
                      <th>Tax %</th>
                      <th>Delivery Days</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {priceHistory.map((entry, index) => (
                      <tr key={index}>
                        <td>
                          {isEditingPriceEntry === index ? (
                            <>
                              <div
                                ref={editDateInputRef}
                                className="fake-date-input"
                                onClick={() => {
                                  if (editDateInputRef.current) {
                                    const rect =
                                      editDateInputRef.current.getBoundingClientRect();
                                    setEditCalendarPosition({
                                      top: rect.bottom + window.scrollY,
                                      left: rect.left + window.scrollX,
                                    });
                                    setShowEditCalendar(true);
                                  }
                                }}
                              >
                                {editPriceEntry.date
                                  ? new Date(
                                      editPriceEntry.date
                                    ).toLocaleDateString("en-GB")
                                  : "dd-mm-yyyy"}
                                <i className="fas fa-calendar-alt calendar-icon"></i>
                              </div>
                            </>
                          ) : (
                            new Date(entry.current_time).toLocaleDateString(
                              "en-GB"
                            )
                          )}
                        </td>

                        <td style={{ textAlign: "right" }} title={entry.price} >
                          {isEditingPriceEntry === index ? (
                            <input
                              type="number"
                              value={editPriceEntry.price}
                              onChange={(e) =>
                                setEditPriceEntry({
                                  ...editPriceEntry,
                                  price: e.target.value,
                                })
                              }
                              style={{ width: "100px" }}
                            />
                          ) : (
                            `₹${parseFloat(entry.price).toLocaleString(
                              "en-IN",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}`
                          )}
                        </td>

                        <td style={{ textAlign: "right" }}>
                          {isEditingPriceEntry === index ? (
                            <input
                              type="number"
                              value={editPriceEntry.tax}
                              onChange={(e) =>
                                setEditPriceEntry({
                                  ...editPriceEntry,
                                  tax: e.target.value,
                                })
                              }
                              style={{ width: "100px" }}
                            />
                          ) : (
                            `${parseFloat(entry.tax).toLocaleString("en-IN")}%`
                          )}
                        </td>

                        <td style={{ textAlign: "right" }}>
                          {isEditingPriceEntry === index ? (
                            <input
                              type="number"
                              value={editPriceEntry.delivery_days}
                              onChange={(e) =>
                                setEditPriceEntry({
                                  ...editPriceEntry,
                                  delivery_days: e.target.value,
                                })
                              }
                              style={{ width: "100px" }}
                            />
                          ) : (
                            `${parseFloat(entry.delivery_days).toLocaleString(
                              "en-IN"
                            )}`
                          )}
                        </td>

                        <td>
                          {isEditingPriceEntry === index ? (
                            <div className="actions-button">
                              <button
                                className="edit-btn"
                                onClick={() => handleSavePriceEntry(index)}
                              >
                                Save
                              </button>
                              <button
                                className="cancel-btn"
                                onClick={() => {
                                  setIsEditingPriceEntry(null);
                                  setEditPriceEntry({
                                    date: null,
                                    price: "",
                                    tax: "",
                                    delivery_days: "",
                                  });
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="actions-button">
                              <button
                                className="edit-btn"
                                onClick={() =>
                                  handleEditPriceEntry(index, entry)
                                }
                              >
                                Edit
                              </button>
                              <button
                                className="cancel-btn"
                                onClick={() => handleDeletePriceEntry(index)}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}

                    {showAddPriceEntryForm && (
                      <tr>
                        <td>
                          <div
                            ref={dateInputRef}
                            className="fake-date-input"
                            onClick={() => {
                              if (dateInputRef.current) {
                                const rect =
                                  dateInputRef.current.getBoundingClientRect();
                                setCalendarPosition({
                                  top: rect.bottom + window.scrollY,
                                  left: rect.left + window.scrollX,
                                });
                                setShowCalendar(true);
                              }
                            }}
                          >
                            {newPriceEntry.date
                              ? new Date(newPriceEntry.date).toLocaleDateString(
                                  "en-GB"
                                )
                              : "dd-mm-yyyy"}
                            <i className="fas fa-calendar-alt calendar-icon"></i>
                          </div>
                        </td>

                        <td>
                          <input
                            type="number"
                            placeholder="Add Price"
                            style={{
                              width: "100px",
                              padding: "8px",
                              fontSize: "14px",
                            }}
                            value={newPriceEntry.price}
                            onChange={(e) =>
                              setNewPriceEntry({
                                ...newPriceEntry,
                                price: e.target.value,
                              })
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            placeholder="Add Tax%"
                            style={{
                              width: "100px",
                              padding: "8px",
                              fontSize: "14px",
                            }}
                            value={newPriceEntry.tax}
                            onChange={(e) =>
                              setNewPriceEntry({
                                ...newPriceEntry,
                                tax: e.target.value,
                              })
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            placeholder="Delivery Days"
                            style={{
                              width: "120px",
                              padding: "8px",
                              fontSize: "14px",
                            }}
                            value={newPriceEntry.delivery_days}
                            onChange={(e) =>
                              setNewPriceEntry({
                                ...newPriceEntry,
                                delivery_days: e.target.value,
                              })
                            }
                          />
                        </td>
                        <td>
                          <div className="actions-button">
                            <button
                              className="edit-btn"
                              onClick={handleAddPriceEntry}
                            >
                              Save
                            </button>
                            <button
                              className="cancel-btn"
                              onClick={() => setShowAddPriceEntryForm(false)}
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCalendar && (
        <div
          className="floating-datepicker"
          style={{
            position: "absolute",
            top: `${calendarPosition.top}px`,
            left: `${calendarPosition.left}px`,
            zIndex: 9999,
          }}
        >
          <DatePicker
            selected={newPriceEntry.date ? new Date(newPriceEntry.date) : null}
            onChange={(date) => {
              setNewPriceEntry({
                ...newPriceEntry,
                date: formatDateToYYYYMMDD(date),
              });
              setShowCalendar(false);
            }}
            onClickOutside={() => setShowCalendar(false)}
            inline
          />
        </div>
      )}

      {showEditCalendar && (
        <div
          className="floating-datepicker"
          style={{
            position: "absolute",
            top: `${editCalendarPosition.top}px`,
            left: `${editCalendarPosition.left}px`,
            zIndex: 9999,
          }}
        >
          <DatePicker
            selected={
              editPriceEntry.date ? new Date(editPriceEntry.date) : null
            }
            onChange={(date) => {
              setEditPriceEntry({
                ...editPriceEntry,
                date: formatDateToYYYYMMDD(date),
              });
              setShowEditCalendar(false);
            }}
            onClickOutside={() => setShowEditCalendar(false)}
            inline
          />
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Component ID</th>
              <th>Component Type</th>
              <th>Specification</th>
              <th>UOM</th>
              <th>Last Price</th>
              <th>Tax %</th>
              <th>Image</th>
              <th>Attachments</th>
              <th>Status</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {loadingVendors ? (
              <tr>
                <td
                  colSpan="10"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  <div className="spinner"></div>
                  Loading component details...
                </td>
              </tr>
            ) : selectedVendorData.length === 0 ? (
              <tr>
                <td
                  colSpan="10"
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    color: "#888",
                  }}
                >
                  No data available for this vendor.
                </td>
              </tr>
            ) : (
              selectedVendorData.map((product, index) => {
                return (
                  <tr key={product.product_id || index}>
                    <td>
                      <Link
                        to={`/components/${product.component_id}`}
                        style={{ textDecoration: "line", color: "inherit" }}
                      >
                        {product.component_id}
                      </Link>
                    </td>

                    <td>{product.component_type}</td>
                    <td
                      className="specification-cell"
                      title={product.component_specification}
                    >
                      {product.component_specification}
                    </td>
                    <td>{product.unit_of_measurement}</td>

                    <td
                      onClick={() => handlePriceClick(product.product_id)}
                      style={{
                        cursor: "pointer",
                        textDecoration: "underline",
                        textAlign: "right",
                      }}
                    >
                      ₹
                      {parseFloat(product.last_price || 0).toLocaleString(
                        "en-IN",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </td>

                    <td style={{ textAlign: "right" }}>{product.tax}%</td>

                    {/* Image cell (lazy loaded) */}
                    <td>
                      <div className="image-cell">
                        {/* show button to load images first time */}
                        {!product.imagesLoaded ? (
                          <button
                            onClick={() => loadImagesForRow(index)}
                            style={{ width: "100%" }}
                            className="load-images-btn"
                          >
                            Preview Images
                          </button>
                        ) : (
                          <>
                            {/* SAVED IMAGES */}
                            <div
                              className="image-preview"
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "6px",
                                marginBottom: "6px",
                              }}
                            >
                              {product.images && product.images.length > 0 ? (
                                product.images.map((imgObj, i) => (
                                  <div
                                    key={i}
                                    style={{
                                      position: "relative",
                                      width: "45px",
                                      height: "45px",
                                    }}
                                  >
                                    <img
                                      src={`${config.apiBaseURL}${imgObj.image}`}
                                      alt={`Product-${i}`}
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        border: "1px solid #ccc",
                                        borderRadius: "4px",
                                      }}
                                    />
                                    <span
                                      onClick={() =>
                                        handleDeleteImage(index, imgObj.id)
                                      }
                                      style={{
                                        position: "absolute",
                                        top: "-5px",
                                        right: "-5px",
                                        backgroundColor: "#e68a00",
                                        color: "white",
                                        borderRadius: "50%",
                                        width: "16px",
                                        height: "16px",
                                        fontSize: "11px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                      }}
                                      title="Delete Image"
                                    >
                                      ×
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <span
                                  style={{ fontSize: "15px", color: "#888" }}
                                >
                                  No Images
                                </span>
                              )}
                            </div>

                            {/* NEWLY SELECTED PREVIEW (not uploaded yet) */}
                            {product.newImages &&
                              product.newImages.length > 0 && (
                                <div
                                  className="new-image-preview"
                                  style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: "6px",
                                    marginBottom: "6px",
                                  }}
                                >
                                  {product.newImages.map((file, i) => (
                                    <div
                                      key={i}
                                      style={{
                                        position: "relative",
                                        width: "45px",
                                        height: "45px",
                                      }}
                                    >
                                      <img
                                        src={URL.createObjectURL(file)}
                                        alt={file.name}
                                        style={{
                                          width: "100%",
                                          height: "100%",
                                          objectFit: "cover",
                                          border: "1px solid #999",
                                          borderRadius: "4px",
                                        }}
                                      />
                                      <span
                                        onClick={() => {
                                          setSelectedVendorData((prev) => {
                                            const updated = [...prev];
                                            updated[index] = {
                                              ...updated[index],
                                              newImages: updated[
                                                index
                                              ].newImages.filter(
                                                (_, j) => j !== i
                                              ),
                                            };
                                            return updated;
                                          });
                                        }}
                                        style={{
                                          position: "absolute",
                                          top: "-5px",
                                          right: "-5px",
                                          backgroundColor: "#cc0000",
                                          color: "white",
                                          borderRadius: "50%",
                                          width: "16px",
                                          height: "16px",
                                          fontSize: "11px",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          cursor: "pointer",
                                        }}
                                        title="Remove File"
                                      >
                                        ×
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}

                            {/* EDIT MODE BUTTONS */}
                            <div className="image-edit">
                              {product.isEditingImage ? (
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    border: "1px solid #ccc",
                                    borderRadius: "6px",
                                    padding: "5px",
                                    backgroundColor: "#fff",
                                  }}
                                >
                                  {/* file input */}
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "8px",
                                      flex: 1,
                                    }}
                                  >
                                    <input
                                      type="file"
                                      id={`file-input-${index}`}
                                      accept="image/*"
                                      multiple
                                      style={{ flex: 1 }}
                                      onChange={(e) =>
                                        handleImageChange(
                                          index,
                                          Array.from(e.target.files)
                                        )
                                      }
                                    />
                                  </div>

                                  {/* upload + cancel */}
                                  <div
                                    style={{
                                      display: "flex",
                                      gap: "8px",
                                      flexShrink: 0,
                                    }}
                                  >
                                    <button
                                      className="save-btn"
                                      onClick={() => saveImages(index)}
                                    >
                                      Save
                                    </button>
                                    <button
                                      className="cancel-btn"
                                      onClick={() =>
                                        cancelEditField(index, "isEditingImage")
                                      }
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() =>
                                    enableEditField(index, "isEditingImage")
                                  }
                                  style={{ width: "100%" }}
                                >
                                  Upload Images
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Attachment Editing Section */}
                    <td>
                      <div className="attachment-cell">
                        <div className="attachment-view">
                          {product.attachments ? (
                            <a
                              href={`${config.apiBaseURL}${product.attachments}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View Attachment
                            </a>
                          ) : (
                            <span style={{ fontSize: "15px", color: "#888" }}>
                              No Attachments
                            </span>
                          )}
                        </div>

                        <div className="attachment-edit">
                          {product.isEditingAttachment ? (
                            <>
                              <input
                                type="file"
                                onChange={(e) =>
                                  handleAttachmentChange(
                                    index,
                                    e.target.files[0]
                                  )
                                }
                              />
                              <button onClick={() => saveAttachment(index)}>
                                Save
                              </button>
                              <button
                                onClick={() =>
                                  cancelEditField(index, "isEditingAttachment")
                                }
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() =>
                                enableEditField(index, "isEditingAttachment")
                              }
                            >
                              Edit Attachment
                            </button>
                          )}
                        </div>
                      </div>
                    </td>

                    <td>
                      <button
                        className={`vendor-status-button ${
                          product.active ? "active" : "inactive"
                        }`}
                        onClick={() =>
                          toggleVendorStatus(
                            product.product_id,
                            product.active,
                            product.vendor,
                            product.component_id
                          )
                        }
                      >
                        {product.active ? "Active" : "Inactive"}
                      </button>
                    </td>

                    <td>
                      {product.isEditingRemarks ? (
                        <div className="remarks-edit-container">
                          <input
                            type="text"
                            className="remarks-input"
                            value={product.editableRemarks || ""}
                            onChange={(e) => {
                              const updated = [...selectedVendorData];
                              updated[index].editableRemarks = e.target.value;
                              setSelectedVendorData(updated);
                            }}
                            placeholder="Enter remarks"
                          />
                          <button
                            className="remarks-btn save-btn"
                            onClick={() => saveRemarks(index)}
                          >
                            Save
                          </button>
                          <button
                            className="remarks-btn cancel-btn"
                            onClick={() =>
                              cancelEditField(index, "isEditingRemarks")
                            }
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <span
                          className="remarks-display"
                          onClick={() =>
                            enableEditField(index, "isEditingRemarks")
                          }
                        >
                          {product.remarks || "Click to add remarks"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <ToastContainerComponent />
    </div>
  );
};

export default VendorDetails;
