// Second set of code

// src/pages/VendorDetails.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const VendorDetails = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const [priceHistory, setPriceHistory] = useState([]);
  const [showPriceHistory, setShowPriceHistory] = useState(false); // State to control the Price modal
  const [showEditProductForm, setShowEditProductForm] = useState(false); // State for showing edit modal
  const [editProduct, setEditProduct] = useState({}); // State to hold product data for editing
  const [showAddPriceEntryForm, setShowAddPriceEntryForm] = useState(false); // State to control Add Price Entry modal
  const [currentProductId, setCurrentProductId] = useState(""); // State to store the product ID for adding price entries
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
  const [componentMasterData, setComponentMasterData] = useState({});
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
  });

  useEffect(() => {
    const fetchVendorDetails = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/vendor_master/");
        const data = await response.json();
        const matchedProducts = data.filter(
          (product) => product.vendor === vendorId
        );

        // Fetch and add the latest price for each product
        const updatedProducts = await Promise.all(
          matchedProducts.map(async (product) => {
            const priceResponse = await fetch(
              "http://127.0.0.1:8000/price_tables/"
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

    const fetchComponentMasterData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/component/");
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

    fetchVendorDetails();
    fetchComponentMasterData();
  }, [vendorId]);

  const getComponentId = (product_id) => {
    return componentMasterData[product_id] || "null";
  };

  // Fetch price history for a product
  const fetchPriceHistory = async (productId) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/price_tables/");
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
      const response = await fetch("http://127.0.0.1:8000/price_tables/", {
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
        `http://127.0.0.1:8000/price_tables/${entryId}/`,
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
        `http://127.0.0.1:8000/price_tables/${priceHistory[index].id}/`,
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
    setEditProduct({ ...productToEdit });
    setShowEditProductForm(true);
  };

  const handleSaveEditProduct = async () => {
    const formData = new FormData();
    Object.entries(editProduct).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/vendor_master/${editProduct.product_id}/`,
        {
          method: "PUT",
          body: formData,
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

  const handleAddNewProduct = async () => {
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
      const response = await fetch("http://127.0.0.1:8000/vendor_master/", {
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
          "http://127.0.0.1:8000/price_tables/",
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
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/component/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Component successfully added:", data);
        alert("Component added successfully!");
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

  return (
    <div>
      <h4>Vendor Data for {vendorId}</h4>
      <button onClick={() => setShowAddProductForm(!showAddProductForm)}>
        {showAddProductForm ? "Cancel New Product" : "Add New Product"}
      </button>

      {/* Add Product Modal */}
      {showAddProductForm && (
        <div className="vm-modal-overlay">
          <div className="vm-modal">
            <h3>Add New Product</h3>
            <input
              type="text"
              placeholder="Product Description"
              value={newProduct.product_description}
              onChange={(e) =>
                handleInputChange(null, "product_description", e.target.value)
              }
            />
            <input
              type="number"
              placeholder="Last Price"
              value={newProduct.last_price}
              onChange={(e) =>
                handleInputChange(null, "last_price", e.target.value)
              }
            />

            <input
              type="number"
              placeholder="Tax %"
              value={newProduct.tax}
              onChange={(e) => handleInputChange(null, "tax", e.target.value)}
            />

            <select
              value={newProduct.category}
              onChange={(e) =>
                handleInputChange(null, "category", e.target.value)
              }
            >
              <option value="">Select Category</option>
              <option value="Airframe">Airframe</option>
              <option value="Communication">Communication</option>
              <option value="Electricals">Electricals</option>
              <option value="Electronics">Electronics</option>
              <option value="Payload">Payload</option>
            </select>

            <select
              value={newProduct.component_type}
              onChange={(e) =>
                handleInputChange(null, "component_type", e.target.value)
              }
            >
              <option value="">Select Component Type</option>
              <option value="type-1">component_type-1</option>
              <option value="type-2">component_type-2</option>
              <option value="type-3">component_type-3</option>
              <option value="type-4">component_type-4</option>
              <option value="type-5">component_type-5</option>
              <option value="type-6">component_type-6</option>
            </select>
            <input
              type="text"
              placeholder="Component Specification"
              value={newProduct.component_specification}
              onChange={(e) =>
                handleInputChange(
                  null,
                  "component_specification",
                  e.target.value
                )
              }
            />
            <input
              type="text"
              placeholder="Unit of Measurement"
              value={newProduct.unit_of_measurement}
              onChange={(e) =>
                handleInputChange(null, "unit_of_measurement", e.target.value)
              }
            />
            <input
              type="file"
              onChange={(e) =>
                handleInputChange(null, "img", e.target.files[0])
              }
            />
            <input
              type="file"
              onChange={(e) =>
                handleInputChange(null, "attachments", e.target.files[0])
              }
            />
            <button onClick={handleAddNewProduct}>Save Product</button>
            <button onClick={() => setShowAddProductForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditProductForm && (
        <div className="vm-modal-overlay">
          <div className="vm-modal">
            <h3>Edit Product</h3>
            <input
              type="text"
              placeholder="Product Description"
              value={editProduct.product_description || ""}
              onChange={(e) =>
                handleInputChange("product_description", e.target.value, true)
              }
            />
            <input
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
            />
            <select
              value={editProduct.category || ""}
              onChange={(e) =>
                handleInputChange("category", e.target.value, true)
              }
            >
              <option value="">Select Category</option>
              <option value="Airframe">Airframe</option>
              <option value="Communication">Communication</option>
              <option value="Electricals">Electricals</option>
              <option value="Electronics">Electronics</option>
              <option value="Payload">Payload</option>
            </select>

            <select
              value={editProduct.component_type || ""}
              onChange={(e) =>
                handleInputChange("component_type", e.target.value, true)
              }
            >
              <option value="">Select Component Type</option>
              <option value="type-1">component_type-1</option>
              <option value="type-2">component_type-2</option>
              <option value="type-3">component_type-3</option>
              <option value="type-4">component_type-4</option>
              <option value="type-5">component_type-5</option>
              <option value="type-6">component_type-6</option>
            </select>

            <input
              type="text"
              placeholder="Component Specification"
              value={editProduct.component_specification || ""}
              onChange={(e) =>
                handleInputChange(
                  "component_specification",
                  e.target.value,
                  true
                )
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
            <input
              type="file"
              onChange={(e) =>
                handleInputChange("img", e.target.files[0], true)
              }
            />
            <input
              type="file"
              onChange={(e) =>
                handleInputChange("attachments", e.target.files[0], true)
              }
            />
            <button onClick={handleSaveEditProduct}>Save Changes</button>
            <button onClick={() => setShowEditProductForm(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Price History Modal */}
      {showPriceHistory && (
        <div className="vm-modal-overlay">
          <div className="vm-modal">
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
                    <td>
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
                        entry.price
                      )}
                    </td>
                    <td>
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
                        entry.tax
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
        </div>
      )}

      {/* Add Price Entry Modal */}
      {showAddPriceEntryForm && (
        <div className="vm-modal-overlay">
          <div className="vm-modal">
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
        </div>
      )}

      <table>
        <thead>
          <tr>
            <th>Product ID</th>
            <th>Product Description</th>
            <th>UOM</th>
            <th>Component ID</th>
            <th>Last Price</th>
            <th>Tax %</th>
            <th>Image</th>
            <th>Attachments</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {selectedVendorData.map((product, index) => (
            <tr key={product.product_id || index}>
              <td>{product.product_id}</td>
              <td>{product.product_description}</td>
              <td>{product.unit_of_measurement}</td>
              <td>{getComponentId(product.product_id)}</td>
              <td
                onClick={() => handlePriceClick(product.product_id)}
                style={{ cursor: "pointer", textDecoration: "underline" }}
              >
                {product.last_price}
              </td>
              <td>{product.tax}</td>
              <td>
                {product.img ? (
                  <img
                    src={product.img}
                    alt="Product"
                    style={{ width: "50px", height: "50px" }}
                  />
                ) : (
                  "No Image"
                )}
              </td>
              <td>
                {product.attachments ? (
                  <a
                    href={product.attachments}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Attachment
                  </a>
                ) : (
                  "No Attachments"
                )}
              </td>
              <td>
                <button onClick={() => handleEditClickVendorMaster(index)}>
                  Edit
                </button>

                <button onClick={() => handleAddComponent(product)}>
                  Add to Comp
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleBackClick}>Back to Vendor List</button>
    </div>
  );
};

export default VendorDetails;
