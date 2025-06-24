// Second set of code

// src/pages/VendorDetails.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import CustomMessagebox from "./CustomMessageBox.jsx";
import config from "../Config"; // Import config for API endpoints
import Add from "../assets/Add.png";
import Cancel from "../assets/cancel.png";
import Back from "../assets/Back.png";

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
        setPriceHistory([...priceHistory, addedEntry]);
        setNewPriceEntry({ date: "", price: "", tax: "", delivery_days: "" });
        setShowAddPriceEntryForm(false);
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
        const updatedHistory = [...priceHistory];
        updatedHistory[index] = updatedEntry;
        setPriceHistory(updatedHistory);
        setIsEditingPriceEntry(null);
      } else {
        console.error("Failed to update price entry:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating price entry:", error);
    }
  };

  const handleDeletePriceEntry = async (index) => {
    try {
      const response = await fetch(
        `${config.apiBaseURL}/price_tables/${priceHistory[index].id}/`,
        {
          method: "DELETE",
        }
      );
      console.log("the delete response ", response);
      if (response.ok) {
        setPriceHistory(priceHistory.filter((_, i) => i !== index));
      }
    } catch (error) {
      console.error("Error deleting price entry:", error);
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
        const uploadedImagePaths = uploaded.map((item) => item.image);

        setSelectedVendorData((prevState) => {
          const updated = [...prevState];
          updated[index] = {
            ...updated[index],
            images: uploadedImagePaths, // Save new image URLs
            newImages: [],
            isEditingImage: false,
          };
          return updated;
        });

        alert("Images uploaded successfully!");
      } else {
        console.error("Upload failed:", response.statusText);
        alert("Failed to upload images.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading images.");
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
        alert("Attachment updated successfully!");
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
      updatedProducts[index] = {
        ...updatedProducts[index],
        newImages: files, // Store selected files temporarily
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
      "product_description",
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

  const toggleVendorStatus = async (productId, currentStatus, vendorId) => {
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
        alert("Vendor not found.");
        return;
      }

      // Step 3: Prevent activation if vendor is inactive
      if (matchedVendor.active === false && updatedStatus === true) {
        alert("Cannot activate product because the vendor is inactive.");
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

          <input
            type="file"
            onChange={(e) => handleInputChange("img", e.target.files[0])}
          />
          <input
            type="file"
            onChange={(e) =>
              handleInputChange("attachments", e.target.files[0])
            }
          />

          <div className="popup-actions">
            <button onClick={handleAddNewProduct}>Save Product</button>
            <button onClick={() => setShowAddProductForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Price History Modal */}
      {showPriceHistory && (
        <div className="popup">
          <span className="x-button" onClick={handleClosePriceHistory}>
            &times;
          </span>
          <h3>Price History</h3>
          <div className="button-wrapper">
            <button
              onClick={() => setShowAddPriceEntryForm(true)}
              className="price-entry-button"
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
                        <input
                          type="date"
                          value={editPriceEntry.date}
                          onChange={(e) =>
                            setEditPriceEntry({
                              ...editPriceEntry,
                              date: e.target.value,
                            })
                          }
                        />
                      ) : (
                        new Date(entry.current_time).toLocaleDateString()
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
                        `₹${parseFloat(entry.price).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
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
                            onClick={() => setIsEditingPriceEntry(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="actions-button">
                          <button
                            className="edit-btn"
                            onClick={() => handleEditPriceEntry(index, entry)}
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
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Price Entry Modal */}
      {showAddPriceEntryForm && (
        <div className="popup">
          <h3 style={{ margin: "10px" }}>Add New Price Entry</h3>
          <input
            type="date"
            value={newPriceEntry.date}
            onChange={(e) =>
              setNewPriceEntry({ ...newPriceEntry, date: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Price"
            value={newPriceEntry.price}
            onChange={(e) =>
              setNewPriceEntry({ ...newPriceEntry, price: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Tax %"
            value={newPriceEntry.tax}
            onChange={(e) =>
              setNewPriceEntry({ ...newPriceEntry, tax: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Delivery Days"
            value={newPriceEntry.delivery_days}
            onChange={(e) =>
              setNewPriceEntry({
                ...newPriceEntry,
                delivery_days: e.target.value,
              })
            }
          />
          <div className="actions-button">
            <button className="btn-save" onClick={handleAddPriceEntry}>
              Add
            </button>
            <button
              className="btn-cancel"
              onClick={() => setShowAddPriceEntryForm(false)}
            >
              Cancel
            </button>
          </div>
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
              <th>Actions</th>
              <th>Status</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {selectedVendorData.map((product, index) => {
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
                  <td>{product.component_specification}</td>
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
                      <div
                        className="image-preview"
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "10px",
                        }}
                      >
                        {product.images && product.images.length > 0 ? (
                          product.images.map((imgObj, i) => (
                            <div
                              key={i}
                              style={{
                                position: "relative",
                                width: "60px",
                                height: "60px",
                              }}
                            >
                              <img
                                src={`${config.apiBaseURL}${imgObj.image}`}
                                alt={`Product-${i}`}
                                className="product-thumbnail"
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
                                } // 👈 Use imgObj.id
                                style={{
                                  position: "absolute",
                                  top: "-6px",
                                  right: "-6px",
                                  backgroundColor: "#e68a00",
                                  color: "white",
                                  borderRadius: "50%",
                                  width: "18px",
                                  height: "18px",
                                  fontSize: "12px",
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
                          <span>No Images</span>
                        )}
                      </div>

                      <div className="image-edit" style={{ marginTop: "5px" }}>
                        {product.isEditingImage ? (
                          <>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(e) =>
                                handleImageChange(
                                  index,
                                  Array.from(e.target.files)
                                )
                              }
                            />
                            <button onClick={() => saveImages(index)}>
                              Upload
                            </button>
                            <button
                              onClick={() =>
                                cancelEditField(index, "isEditingImage")
                              }
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() =>
                              enableEditField(index, "isEditingImage")
                            }
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
                          <span>No Attachments</span>
                        )}
                      </div>

                      {/* Bottom: Edit or Save/Cancel Buttons */}
                      <div className="attachment-edit">
                        {product.isEditingAttachment ? (
                          <>
                            <input
                              type="file"
                              onChange={(e) =>
                                handleAttachmentChange(index, e.target.files[0])
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
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        onClick={() => handleEditClickVendorMaster(index)}
                        className="edit-button"
                      >
                        Edit
                      </button>

                      {/* <button
                        onClick={() => handleAddComponent(product)}
                        disabled={isAddedToComp}
                      >
                        {isAddedToComp ? "Already Added" : "Add to Comp"}
                      </button> */}
                    </div>
                  </td>
                  <td>
                    <button
                      onClick={() =>
                        toggleVendorStatus(
                          product.product_id,
                          product.active,
                          product.vendor
                        )
                      }
                      style={{
                        backgroundColor: product.active ? "green" : "red",
                        color: "white",
                        padding: "5px 10px",
                        border: "none",
                        cursor: "pointer",
                        borderRadius: "10px",
                      }}
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
            })}
          </tbody>
        </table>
      </div>
      <ToastContainerComponent />
    </div>
  );
};

export default VendorDetails;

// //  <button onClick={handleNewRequest}style={{marginTop: "10px",background: "transparent",border: "none",cursor: "pointer",padding: "4px",}}
// //       title="New Request">
// //       <img src= {Add} alt="New Request"style={{ width: "20px", height: "20px" }}/>
// //       </button>
