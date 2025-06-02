// Second set of code

// src/pages/VendorDetails.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  });
  const [editPriceEntry, setEditPriceEntry] = useState({
    date: "",
    price: "",
    tax: "",
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
    component: "",
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

            // Set the latest price in the product data
            return {
              ...product,
              last_price: productPrices[0]?.price || product.last_price,
              tax: productPrices[0]?.tax || product.tax,
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
        setNewPriceEntry({ date: "", price: "", tax: "" });
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
      product: currentProductId, // Replace with the actual product ID if needed
    });
  };

  const handleSavePriceEntry = async (index) => {
    const payload = {
      current_time: editPriceEntry.date,
      price: editPriceEntry.price,
      tax: editPriceEntry.tax,
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

  const saveImage = async (index) => {
    const formData = new FormData();
    formData.append("img", selectedVendorData[index].img);

    try {
      const response = await fetch(
        `${config.apiBaseURL}/vendor_master/${selectedVendorData[index].product_id}/`, // Use a specific endpoint for updating the image
        {
          method: "PATCH",
          body: formData,
        }
      );

      if (response.ok) {
        const updatedProduct = await response.json();
        setSelectedVendorData((prevState) => {
          const updatedProducts = [...prevState];
          updatedProducts[index] = { ...updatedProduct, isEditingImage: false };
          return updatedProducts;
        }); // Update state with the new image
        alert("Image updated successfully!");
      } else {
        console.error("Failed to update image:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating image:", error);
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
  const handleImageChange = (index, file) => {
    setSelectedVendorData((prevState) => {
      const updatedProducts = [...prevState];
      updatedProducts[index] = { ...updatedProducts[index], img: file };
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
      "last_price",
      "tax",
      "category",
      "component_type",
      "component_specification",
      "unit_of_measurement",
    ];

    const emptyFields = requiredFields.filter(
      (field) => !newProduct[field] || newProduct[field].trim() === ""
    );

    if (emptyFields.length > 0) {
      setMessageBoxContent(
        `Please fill in the following fields: ${emptyFields
          .map((field) => field.replace(/_/g, " "))
          .join(", ")}`
      );
      setShowMessageBox(true);
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
        });
        setShowAddProductForm(false);

        // Extract price and tax from the added product
        const { last_price, tax, product_id } = addedProduct;

        // Second API call to update the price_tables with tax and price
        const priceTablePayload = {
          current_time: new Date().toISOString(), // Set the current date and time
          tax: tax,
          price: last_price,
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
  const handleAddComponent = async (product) => {
    const payload = {
      product_id: product.product_id,
      component_type: product.component_type,
      component_specification: product.component_specification,
      unit_of_measurement: product.unit_of_measurement,
      category: product.category,
      vendor_id: vendorId,
    };

    try {
      const response = await fetch(`${config.apiBaseURL}/component/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Component successfully added:", data);

        // Update the componentMasterData state with the new component_id
        setComponentMasterData((prevData) => ({
          ...prevData,
          [product.product_id]: data.component_id, // Assume `data` contains the new component_id
        }));
        showSuccessToast("Component added successfully!");
      } else {
        console.error("Error adding component:", response.statusText);
        alert("Failed to add component.");
      }
    } catch (error) {
      console.error("Error adding component:", error);
      alert("Error occurred while adding component.");
    }
  };

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
        setVendorMasterData((prevData) =>
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

      {/* Render CustomMessagebox when showMessageBox is true */}
      {showMessageBox && (
        <CustomMessagebox
          message={messageBoxContent}
          onClose={() => setShowMessageBox(false)}
        />
      )}

      {/* Add Product Modal */}
      {showAddProductForm && (
        <div className="popup">
          <h3>Add New Product</h3>

          <input
            type="text"
            placeholder="Product Description"
            value={newProduct.product_description}
            onChange={(e) =>
              handleInputChange("product_description", e.target.value)
            }
          />
          <input
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
          />
          <select
            value={newProduct.category}
            onChange={(e) => handleInputChange("category", e.target.value)}
          >
            <option value="">Select Category</option>
            {choices.category_choices.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select
            value={newProduct.component_type}
            onChange={(e) =>
              handleInputChange("component_type", e.target.value)
            }
          >
            <option value="">Select Component Type</option>
            {choices.component_type_list.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Component Specification"
            value={newProduct.component_specification}
            onChange={(e) =>
              handleInputChange("component_specification", e.target.value)
            }
          />
          <input
            type="text"
            placeholder="Unit of Measurement"
            value={newProduct.unit_of_measurement}
            onChange={(e) =>
              handleInputChange("unit_of_measurement", e.target.value)
            }
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

      {/* Edit Product Modal */}
      {showEditProductForm && (
        <div className="popup">
          <h3>Edit Product</h3>
          <input
            type="text"
            placeholder="Product Description"
            value={editProduct.product_description || ""}
            onChange={(e) =>
              handleInputChange("product_description", e.target.value, true)
            }
          />
          {/* <input
            type="number"
            placeholder="Last Price"
            value={editProduct.last_price || ""}
            onChange={(e) =>
              handleInputChange("last_price", e.target.value, true)
            }
          />
          <input
            type="number"
            placeholder="Tax"
            value={editProduct.tax || ""}
            onChange={(e) => handleInputChange("tax", e.target.value, true)}
          /> */}
          <select
            value={editProduct.category || ""}
            onChange={(e) =>
              handleInputChange("category", e.target.value, true)
            }
          >
            <option value="">Select Category</option>
            {/* <option value="Airframe">Airframe</option>
            <option value="Communication">Communication</option>
            <option value="Electricals">Electricals</option>
            <option value="Electronics">Electronics</option>
            <option value="Payload">Payload</option> */}
            {choices.category_choices.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <select
            value={editProduct.component_type || ""}
            onChange={(e) =>
              handleInputChange("component_type", e.target.value, true)
            }
          >
            <option value="">Select Component Type</option>
            {/* <option value="Controller">Controller</option>
            <option value="Frame parts & Tank">Frame parts & Tank</option>
            <option value="Battery">Battery</option>
            <option value="Sensor">Sensor</option>
            <option value="Motors ESC & Propeller Combo">
              Motors ESC & Propeller Combo
            </option>
            <option value="Flight controller">Flight controller</option>
            <option value="3D Printed parts">3D Printed parts</option>
            <option value="Carrycase">Carrycase</option>
            <option value="Battery Charger">Battery Charger</option>
            <option value="GPS">GPS</option>
            <option value="Aluminium Mount">Aluminium Mount</option>
            <option value="CF Sheet">CF Sheet</option>
            <option value="Sprayer System">Sprayer System</option>
            <option value="BEC">BEC</option>
            <option value="PDB">PDB</option>
            <option value="Connectors">Connectors</option>
            <option value="Cables">Cables</option>
            <option value="Water Jet cutting">Water Jet cutting</option>
            <option value="Consumables">Consumables</option> */}
            {choices.component_type_list.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Component Specification"
            value={editProduct.component_specification || ""}
            onChange={(e) =>
              handleInputChange("component_specification", e.target.value, true)
            }
          />
          <input
            type="text"
            placeholder="Unit of Measurement"
            value={editProduct.unit_of_measurement || ""}
            onChange={(e) =>
              handleInputChange("unit_of_measurement", e.target.value, true)
            }
          />
          {/* <input
            type="file"
            onChange={(e) => handleInputChange("img", e.target.files[0], true)}
          />
          <input
            type="file"
            onChange={(e) =>
              handleInputChange("attachments", e.target.files[0], true)
            }
          /> */}

          {/* Show existing image preview */}
          <div>
            <p>Current Image:</p>
            {editProduct.img ? (
              <img
                src={`${config.apiBaseURL}${editProduct.img}`}
                alt="Product"
                style={{ width: "100px", height: "100px" }}
              />
            ) : (
              "No Image Available"
            )}
          </div>

          {/* Show existing attachment preview */}
          <div>
            <p>Current Attachment:</p>
            {editProduct.attachments ? (
              <a
                href={`${config.apiBaseURL}${editProduct.attachments}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Attachment
              </a>
            ) : (
              "No Attachments Available"
            )}
          </div>

          <div className="popup-actions">
            <button className="" onClick={handleSaveEditProduct}>
              Save Changes
            </button>
            <button onClick={() => setShowEditProductForm(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Price History Modal */}
      {showPriceHistory && (
        <div className="popup">
          <span className="close-button" onClick={handleClosePriceHistory}>
            &times;
          </span>
          <h3>Price History</h3>
          <button onClick={() => setShowAddPriceEntryForm(true)}>
            Add Price Entry
          </button>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Price</th>
                <th>Tax %</th>
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
                      />
                    ) : (
                      `${parseFloat(entry.tax).toLocaleString("en-IN", {
                        // minimumFractionDigits: 2,
                        // maximumFractionDigits: 2
                      })}%`
                    )}
                  </td>
                  <td>
                    {isEditingPriceEntry === index ? (
                      <>
                        <button onClick={() => handleSavePriceEntry(index)}>
                          Save
                        </button>
                        <button onClick={() => setIsEditingPriceEntry(null)}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditPriceEntry(index, entry)}
                        >
                          Edit
                        </button>
                        <button onClick={() => handleDeletePriceEntry(index)}>
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Price Entry Modal */}
      {showAddPriceEntryForm && (
        <div className="popup">
          <h3>Add New Price Entry</h3>
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
          <button onClick={handleAddPriceEntry}>Add</button>
          <button onClick={() => setShowAddPriceEntryForm(false)}>
            Cancel
          </button>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Product ID</th>
              <th>Product Description</th>
              <th>Component Type</th>
              <th>UOM</th>
              <th>Component ID</th>
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
                  <td>{product.product_id}</td>
                  <td>{product.product_description}</td>
                  <td>{product.component_type}</td>
                  <td>{product.unit_of_measurement}</td>
                  <td>{getComponentId(product.product_id)}</td>
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
                      {/* Top: Image or No Image */}
                      <div className="image-preview">
                        {product.img ? (
                          <img
                            src={`${config.apiBaseURL}${product.img}`}
                            alt="Product"
                            className="product-thumbnail"
                          />
                        ) : (
                          <span>No Image</span>
                        )}
                      </div>

                      {/* Bottom: Edit/Save/Cancel Buttons */}
                      <div className="image-edit">
                        {product.isEditingImage ? (
                          <>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleImageChange(index, e.target.files[0])
                              }
                            />
                            <button onClick={() => saveImage(index)}>
                              Save
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
                            Edit Image
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
                    <div style={{ display: "flex",
                       gap: "10px",}}>
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
                      <>
                        <input
                          type="text"
                          value={product.editableRemarks || ""}
                          onChange={(e) => {
                            const updated = [...selectedVendorData];
                            updated[index].editableRemarks = e.target.value;
                            setSelectedVendorData(updated);
                          }}
                          placeholder="Enter remarks"
                        />
                        <button onClick={() => saveRemarks(index)}>Save</button>
                        <button
                          onClick={() =>
                            cancelEditField(index, "isEditingRemarks")
                          }
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <span
                          onClick={() =>
                            enableEditField(index, "isEditingRemarks")
                          }
                          style={{ cursor: "pointer", color: "#007bff" }}
                        >
                          {product.remarks || "Click to add remarks"}
                        </span>
                      </>
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

//  <button onClick={handleNewRequest}style={{marginTop: "10px",background: "transparent",border: "none",cursor: "pointer",padding: "4px",}}
//       title="New Request">
//       <img src= {Add} alt="New Request"style={{ width: "20px", height: "20px" }}/>
//       </button>
