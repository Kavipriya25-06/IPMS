import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import CustomMessagebox from "./CustomMessageBox.jsx";
import config from "../Config"; // Import config for API endpoints
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
} from "./Toastify.jsx"; // Import Toastify utilities

const VendorDetails = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const [priceHistory, setPriceHistory] = useState([]);
  const [showPriceHistory, setShowPriceHistory] = useState(false); // State to control the Price modal
  const [showEditProductForm, setShowEditProductForm] = useState(false); // State for showing edit modal
  const [editProduct, setEditProduct] = useState({}); // State to hold product data for editing
  const [showAddPriceEntryForm, setShowAddPriceEntryForm] = useState(false); // State to control Add Price Entry modal
  const [currentProductId, setCurrentProductId] = useState(""); // State to store the product ID for adding price entries
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
  const [newProduct, setNewProduct] = useState({
    product_id: "",
    product_description: "",
    unit_of_measurement: "",
    component_id: "",
    last_price: "",
    tax: "",
    img: null,
    attachments: null,
    category: "", // Initialize as an empty string
    component_type: "", // Initialize as an empty string
    component_specification: "", // Initialize as an empty string
    vendor: vendorId,
    active: "",
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

  useEffect(() => {
    fetch(`${config.apiBaseURL}/component/`)
      .then((res) => res.json())
      .then((data) => setComponentList(data))
      .catch((err) => console.error("Error fetching component list:", err));
  }, []);

  useEffect(() => {
    const fetchVendorDetails = async () => {
      setLoadingVendors(true);

      try {
        const response = await fetch(`${config.apiBaseURL}/vendor_master/`);
        const data = await response.json();
        const matchedProducts = data.filter(
          (product) => product.vendor === vendorId
        );

        // Fetch and add the latest price for each product
        const updatedProducts = await Promise.all(
          matchedProducts.map(async (product) => {
            const priceResponse = await fetch(
              `${config.apiBaseURL}/price_tables/`
            );
            const priceData = await priceResponse.json();

            // Filter prices for the current product and sort to get the latest price
            const productPrices = priceData
              .filter((entry) => entry.product === product.product_id)
              .sort(
                (a, b) => new Date(b.current_time) - new Date(a.current_time)
              );

            const images = await fetchImagesForComponent(product.component_id);

            // Set the latest price in the product data
            return {
              ...product,
              last_price: productPrices[0]?.price || product.last_price,
              tax: productPrices[0]?.tax || product.tax,
              delivery_days: productPrices[0]?.delivery_days || 0,
              images,
              newImages: [],
              isEditingImage: false,
            };
          })
        );

        setSelectedVendorData(updatedProducts);
      } catch (error) {
        console.error("Error fetching vendor products:", error);
      } finally {
        setLoadingVendors(false); // hide loader
      }
    };

    const fetchVendorData = async () => {
      try {
        const response = await fetch(`${config.apiBaseURL}/vendor_list/`);
        const data = await response.json();
        setVendorData(data);
      } catch (error) {
        console.error("Error fetching vendor data:", error);
      }
    };

    const fetchComponentMasterData = async () => {
      try {
        const response = await fetch(`${config.apiBaseURL}/component/`);
        const data = await response.json();
        const componentMap = data.reduce((acc, component) => {
          acc[component.product_id] = component.component_id || "null";
          return acc;
        }, {});
        setComponentMasterData(componentMap);
      } catch (error) {
        console.error("Error fetching component master data:", error);
      }
    };

    const fetchChoices = async () => {
      try {
        const response = await fetch(`${config.apiBaseURL}/get_choices/`);
        if (!response.ok) {
          throw new Error("Failed to fetch choices");
        }
        const data = await response.json();
        setChoices(data);
      } catch (error) {
        console.error("Error fetching choices:", error);
      }
    };

    fetchVendorDetails();
    fetchVendorData();
    fetchComponentMasterData();
    fetchChoices();
  }, [vendorId]);

  const getComponentId = (product_id) => {
    return componentMasterData[product_id] || "-";
  };

  // Fetch price history for a product
  const fetchPriceHistory = async (productId) => {
    try {
      const response = await fetch(`${config.apiBaseURL}/price_tables/`);
      const data = await response.json();

      // Filter data to include only entries with the specified productId
      const filteredData = data.filter((entry) => entry.product === productId);

      // Sort filtered data by date, if necessary
      const sortedData = filteredData.sort(
        (a, b) => new Date(b.current_time) - new Date(a.current_time)
      );

      setPriceHistory(sortedData);
      console.log("Fetched price history", sortedData);
      setCurrentProductId(productId); // Set the productId for adding price entry

      // Set the latest price in the selectedVendorData for display
      const updatedVendorData = selectedVendorData.map((product) =>
        product.product_id === productId
          ? {
              ...product,
              last_price: sortedData[0]?.price || product.last_price,
            }
          : product
      );
      setSelectedVendorData(updatedVendorData);

      setShowPriceHistory(true); // Open the modal
    } catch (error) {
      console.error("Error fetching price history:", error);
    }
  };

  const handleAddPriceEntry = async () => {
    const { date, price, tax, delivery_days } = newPriceEntry; // Add this

    if (!date || !price || !tax || !delivery_days) {
      showInfoToast("Please fill all the fields");
      return;
    }

    const payload = {
      current_time: newPriceEntry.date,
      price: newPriceEntry.price,
      tax: newPriceEntry.tax,
      delivery_days: newPriceEntry.delivery_days,
      product: currentProductId, // Replace with the actual product ID if needed
    };

    try {
      const response = await fetch(`${config.apiBaseURL}/price_tables/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const addedEntry = await response.json();
        await fetchPriceHistory(currentProductId);

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
        setPriceHistory([...priceHistory, addedEntry]);
        setNewPriceEntry({ date: "", price: "", tax: "", delivery_days: "" });
        setShowAddPriceEntryForm(false);
        showSuccessToast("Price entry saved successfully");
      } else {
        showErrorToast("Failed to save price entry");
      }
    } catch (error) {
      console.error("Error adding price entry:", error);
    }
  };

  const handleEditPriceEntry = (index, entry) => {
    setIsEditingPriceEntry(index);
    setEditPriceEntry({
      date: entry.current_time,
      price: entry.price,
      tax: entry.tax,
      delivery_days: entry.delivery_days,
      product: currentProductId, // Replace with the actual product ID if needed
    });
  };

  const handleSavePriceEntry = async (index) => {
    const payload = {
      current_time: editPriceEntry.date,
      price: editPriceEntry.price,
      tax: editPriceEntry.tax,
      delivery_days: editPriceEntry.delivery_days,
      product: currentProductId, // Replace with the actual product ID if needed
    };

    const entryId = priceHistory[index].id;
    console.log("Updating entry with ID:", entryId); // Log the ID

    try {
      const response = await fetch(
        `${config.apiBaseURL}/price_tables/${entryId}/`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      console.log("the response ", response);
      if (response.ok) {
        const updatedEntry = await response.json();

        //  1. Update priceHistory table
        const updatedHistory = [...priceHistory];
        updatedHistory[index] = updatedEntry;
        setPriceHistory(updatedHistory);

        //2. Update main product table
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
      }
    } catch (error) {
      console.error("Error updating price entry:", error);
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
        // 1. Remove from priceHistory
        showSuccessToast("Deleted successfully");

        const updatedHistory = priceHistory.filter((_, i) => i !== index);
        setPriceHistory(updatedHistory);

        // 2. Find latest remaining price entry
        const latest =
          updatedHistory.length > 0
            ? updatedHistory.reduce((a, b) =>
                new Date(a.current_time) > new Date(b.current_time) ? a : b
              )
            : null;

        // 3. Update selectedVendorData (main table)
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

  const handleClosePriceHistory = () => {
    setShowPriceHistory(false);
  };

  const handlePriceClick = (productId) => {
    fetchPriceHistory(productId);
  };

  const handleInputChange = (field, value, isEditing = false) => {
    if (isEditing) {
      setEditProduct({ ...editProduct, [field]: value });
    } else {
      setNewProduct({ ...newProduct, [field]: value });
    }
  };

  const handleEditClickVendorMaster = (index) => {
    const productToEdit = selectedVendorData[index];
    // Exclude `img` and `attachments` from the product data
    const {
      img, // Destructure to exclude
      attachments, // Destructure to exclude
      ...editableFields
    } = productToEdit;
    setEditProduct({ ...productToEdit });
    setShowEditProductForm(true);
  };

  const saveImages = async (index) => {
    const product = selectedVendorData[index];
    const componentId = product.component_id; // Ensure this exists in your data

    const formData = new FormData();
    product.newImages.forEach((file) => {
      formData.append("images", file); // Django expects key: 'images'
    });

    try {
      const response = await fetch(
        `${config.apiBaseURL}/component_images/by-component/${componentId}/`,
        {
          method: "POST",
          body: formData,
        }
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
            images: [...(updated[index].images || []), ...uploadedImages], // append to existing
            newImages: [],
            isEditingImage: false,
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

  const saveAttachment = async (index) => {
    const formData = new FormData();
    formData.append("attachments", selectedVendorData[index].attachments);

    try {
      const response = await fetch(
        `${config.apiBaseURL}/vendor_master/${selectedVendorData[index].product_id}/`, // Use a specific endpoint for updating the attachment
        {
          method: "PATCH",
          body: formData,
        }
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
      }
    } catch (error) {
      console.error("Error updating attachment:", error);
    }
  };

  const handleSaveEditProduct = async () => {
    // Prepare the payload by excluding `img` and `attachments`
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
    const formData = new FormData();
    Object.entries(editProduct).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    try {
      const response = await fetch(
        `${config.apiBaseURL}/vendor_master/${editProduct.product_id}/`,
        {
          // method: "PUT",
          // body: formData,
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        const savedProduct = await response.json();
        const updatedProducts = selectedVendorData.map((product) =>
          product.product_id === savedProduct.product_id
            ? savedProduct
            : product
        );
        setSelectedVendorData(updatedProducts);
        setShowEditProductForm(false);
      } else {
        console.error("Error updating product:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  // Handler for updating the image
const handleImageChange = (index, files) => {
  setSelectedVendorData((prevState) => {
    const updatedProducts = [...prevState];
    const product = updatedProducts[index];

    // Existing saved images (backend)
    const existingImages = (product.images || []).map((imgObj) =>
      String(imgObj.image).toLowerCase()
    );

    // Already staged (not yet uploaded)
    const alreadySelected = (product.newImages || []).map(
      (f) => `${f.name.toLowerCase()}-${f.size}`
    );

    const added = [];
    files.forEach((file) => {
      const uniqueKey = `${file.name.toLowerCase()}-${file.size}`;

      // Check if already in staged list
      if (alreadySelected.includes(uniqueKey)) {
        showInfoToast(`"${file.name}" is already selected — skipping.`);
        return;
      }

      // Check if already saved in backend
      const baseName = file.name.toLowerCase().split(".")[0];
      const isSaved = existingImages.some((saved) =>
        saved.includes(baseName)
      );
      if (isSaved) {
        showInfoToast(`"${file.name}" already exists in saved images.`);
        return;
      }

      // If unique, add it
      added.push(file);
    });

    // Always merge new files with previous ones
    updatedProducts[index] = {
      ...product,
      newImages: [...(product.newImages || []), ...added],
    };

    return updatedProducts;
  });
};


  // Handler for updating the attachment
  const handleAttachmentChange = (index, file) => {
    setSelectedVendorData((prevState) => {
      const updatedProducts = [...prevState];
      updatedProducts[index] = { ...updatedProducts[index], attachments: file };
      return updatedProducts;
    });
  };

  // Enable edit field
  const enableEditField = (index, field) => {
    setSelectedVendorData((prevState) => {
      const updatedProducts = [...prevState];
      updatedProducts[index] = { ...updatedProducts[index], [field]: true };
      return updatedProducts;
    });
  };

  // Cancelling field
  const cancelEditField = (index, field) => {
    setSelectedVendorData((prevState) => {
      const updatedProducts = [...prevState];
      updatedProducts[index] = { ...updatedProducts[index], [field]: false };
      return updatedProducts;
    });
  };

  const handleAddNewProduct = async () => {
    // Validation: Check if required fields are filled
    const requiredFields = [
      //"product_description",
      // "last_price",
      // "tax",
      "category",
      "component_type",
      "component_specification",
      "unit_of_measurement",
      "component_id",
    ];

    const emptyFields = requiredFields.filter(
      (field) => !newProduct[field] || newProduct[field].trim() === ""
    );
    console.log("Empty fields", emptyFields);

    if (emptyFields.length > 0) {
      setMessageBoxContent(
        `Please fill in the following fields: ${emptyFields
          .map((field) => field.replace(/_/g, " "))
          .join(", ")}`
      );
      setShowMessageBox(true);
      console.log("please fill details");
      return; // Stop execution if validation fails
    }

    const formData = new FormData();

    // Append each property of newProduct to formData
    Object.entries(newProduct).forEach(([key, value]) => {
      if (value !== null) {
        formData.append(key, value);
      }
    });

    // Set the vendor ID explicitly
    formData.append("vendor", vendorId);

    try {
      const response = await fetch(`${config.apiBaseURL}/vendor_master/`, {
        method: "POST",
        body: formData, // Send formData instead of JSON
      });

      if (response.ok) {
        const addedProduct = await response.json();

        const componentId = addedProduct.component_id;

        try {
          await fetch(
            `${config.apiBaseURL}/request_component/status/Added/${componentId}/`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ vendor_added: true }),
            }
          );
          console.log("vendor_added patched in request_component");
        } catch (patchError) {
          console.error("Failed to patch request_component:", patchError);
        }

        setSelectedVendorData([...selectedVendorData, addedProduct]);
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

        // Extract price and tax from the added product
        const { last_price, tax, product_id, delivery_days } = addedProduct;

        // Second API call to update the price_tables with tax and price
        const priceTablePayload = {
          current_time: new Date().toISOString(), // Set the current date and time
          tax: tax,
          price: last_price,
          delivery_days: delivery_days,
          product: product_id,
        };

        const priceResponse = await fetch(
          `${config.apiBaseURL}/price_tables/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(priceTablePayload),
          }
        );

        if (!priceResponse.ok) {
          console.error(
            "Error updating price table:",
            priceResponse.statusText
          );
        }
      } else {
        console.error("Error adding product:", response.statusText);
      }
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  // Handle Add button click
  // const handleAddComponent = async (product) => {
  //   const payload = {
  //     product_id: product.product_id,
  //     component_type: product.component_type,
  //     component_specification: product.component_specification,
  //     unit_of_measurement: product.unit_of_measurement,
  //     category: product.category,
  //     vendor_id: vendorId,
  //   };

  //   try {
  //     const response = await fetch(`${config.apiBaseURL}/component/`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(payload),
  //     });

  //     if (response.ok) {
  //       const data = await response.json();
  //       console.log("Component successfully added:", data);

  //       // Update the componentMasterData state with the new component_id
  //       setComponentMasterData((prevData) => ({
  //         ...prevData,
  //         [product.product_id]: data.component_id, // Assume `data` contains the new component_id
  //       }));
  //       showSuccessToast("Component added successfully!");
  //     } else {
  //       console.error("Error adding component:", response.statusText);
  //       alert("Failed to add component.");
  //     }
  //   } catch (error) {
  //     console.error("Error adding component:", error);
  //     alert("Error occurred while adding component.");
  //   }
  // };

  const handleBackClick = () => {
    navigate("/vendor");
  };

  const getVendorName = (vendor_id) => {
    const VendorName =
      vendorData.find((vendor) => vendor.vendor_id === vendor_id)
        ?.vendor_name || "";
    return VendorName;
  };

  const toggleVendorStatus = async (
    productId,
    currentStatus,
    vendorId,
    componentId
  ) => {
    try {
      const updatedStatus = !currentStatus; // Toggle the status

      // Step 1: Fetch the vendor's status from `vendor_list/`
      const vendorResponse = await fetch(`${config.apiBaseURL}/vendor_list/`);

      if (!vendorResponse.ok) {
        throw new Error("Failed to fetch vendor list");
      }

      const vendorData = await vendorResponse.json();

      console.log("Vendor List API Response:", vendorData); // Debugging

      // Step 2: Find the matching vendor entry
      const matchedVendor = vendorData.find(
        (vendor) => vendor.vendor_id === vendorId
      );

      if (!matchedVendor) {
        console.error("Vendor not found in vendor_list.");
        showErrorToast("Vendor not found.");
        return;
      }

      // Step 3: Prevent activation if vendor is inactive
      if (matchedVendor.active === false && updatedStatus === true) {
        showInfoToast(
          "Cannot activate product because the vendor is inactive."
        );
        return;
      }

      // Step 4: Update product status in `vendor_master/`
      const response = await fetch(
        `${config.apiBaseURL}/vendor_master/${productId}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
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

  // const enableEditField = (index, field) => {
  //   setSelectedVendorData((prevState) => {
  //     const updatedProducts = [...prevState];
  //     updatedProducts[index] = {
  //       ...updatedProducts[index],
  //       [field]: true,
  //       editableRemarks: updatedProducts[index].remarks || "",
  //     };
  //     return updatedProducts;
  //   });
  // };

  // const cancelEditField = (index, field) => {
  //   setSelectedVendorData((prevState) => {
  //     const updatedProducts = [...prevState];
  //     updatedProducts[index] = {
  //       ...updatedProducts[index],
  //       [field]: false,
  //       editableRemarks: "", // Clear temp remarks
  //     };
  //     return updatedProducts;
  //   });
  // };

  const saveRemarks = async (index) => {
    const product = selectedVendorData[index];
    const payload = {
      remarks: product.editableRemarks || "",
    };

    try {
      const response = await fetch(
        `${config.apiBaseURL}/vendor_master/${product.product_id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
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
      {/* // Inside your JSX return block */}
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
  placeholder="Product Description (Optional)"
  value={newProduct.product_description || ""}
  onChange={(e) =>
    handleInputChange("product_description", e.target.value)
  }
/>

            {/* <input
            type="number"
            placeholder="Price"
            value={newProduct.last_price}
            onChange={(e) => handleInputChange("last_price", e.target.value)}
          />
          <input
            type="number"
            placeholder="Tax %"
            value={newProduct.tax}
            onChange={(e) => handleInputChange("tax", e.target.value)}
          /> */}

            {/* Auto-filled category (readonly) */}
            <input
              type="text"
              placeholder="Category"
              value={newProduct.category}
              readOnly
            />

            {/* Auto-filled component type (readonly) */}
            <input
              type="text"
              placeholder="Component Type"
              value={newProduct.component_type}
              readOnly
            />

            {/* Auto-filled component specification (readonly) */}
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

            {/* <input
              type="file"
              onChange={(e) => handleInputChange("img", e.target.files[0])}
            />
            <input
              type="file"
              onChange={(e) =>
                handleInputChange("attachments", e.target.files[0])
              }
            /> */}

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
              {" "}
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

                              {/* Floating calendar rendered outside table */}
                            </>
                          ) : (
                            new Date(entry.current_time).toLocaleDateString(
                              "en-GB"
                            )
                          )}
                        </td>

                        <td style={{ textAlign: "right" }}>
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
                            `${parseFloat(entry.tax).toLocaleString("en-IN", {
                              // minimumFractionDigits: 2,
                              // maximumFractionDigits: 2
                            })}%`
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
                                  setIsEditingPriceEntry(null); // Exit editing mode
                                  setEditPriceEntry({
                                    // Clear edit form values
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
                            value={newPriceEntry.price} //  Fix here
                            onChange={(e) =>
                              setNewPriceEntry({
                                ...newPriceEntry,
                                price: e.target.value, //  Fix here
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
              setShowCalendar(false); // hide after selection
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
              {/* <th>Product ID</th> */}
              <th>Component ID</th>
              <th>Component Type</th>
              <th>Specification</th>
              <th>UOM</th>
              <th>Last Price</th>
              <th>Tax %</th>
              <th>Image</th>
              <th>Attachments</th>
              {/* <th>Actions</th> */}
              <th>Status</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {loadingVendors ? (
              //  Show spinner or loading text while data is loading
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
                const isAddedToComp = !!componentMasterData[product.product_id]; // Check if the product is in component master

                return (
                  <tr key={product.product_id || index}>
                    {/* <td>{product.product_id}</td> */}
                    <td>
                      <Link
                        to={`/components/${product.component_id}`}
                        style={{ textDecoration: "line", color: "inherit" }}
                      >
                        {product.component_id}
                      </Link>
                    </td>
                    {/* <td>{product.component_id}</td> */}
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
                      {parseFloat(product.last_price).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td style={{ textAlign: "right" }}>{product.tax}%</td>
                    {/* Image editing section */}
                    <td>
                      <div className="image-cell">
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
                            <span style={{ fontSize: "15px", color: "#888" }}>
                              No Images
                            </span>
                          )}
                        </div>

                        {/* NEWLY SELECTED PREVIEW (not uploaded yet) */}
                        {product.newImages && product.newImages.length > 0 && (
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
                                    // remove previewed file
                                    setSelectedVendorData((prev) => {
                                      const updated = [...prev];
                                      updated[index] = {
                                        ...updated[index],
                                        newImages: updated[
                                          index
                                        ].newImages.filter((_, j) => j !== i),
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
                              {/* LEFT: File input styled like native */}
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

                              {/* RIGHT: Upload + Cancel */}
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
                      </div>
                    </td>

                    {/* Attachment Editing Section */}
                    <td>
                      <div className="attachment-cell">
                        {/* Top: View Attachment or No Attachments */}
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
                            <span  style={{ fontSize: "15px", color: "#888" }}>No Attachments</span>
                          )}
                        </div>

                        {/* Bottom: Edit or Save/Cancel Buttons */}
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

                    {/* <td>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        onClick={() => handleEditClickVendorMaster(index)}
                        className="edit-button"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleAddComponent(product)}
                        disabled={isAddedToComp}
                      >
                        {isAddedToComp ? "Already Added" : "Add to Comp"}
                      </button>
                    </div>
                  </td> */}
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
