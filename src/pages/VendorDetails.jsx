// Second set of code

// src/pages/VendorDetails.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const VendorDetails = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const [priceHistory, setPriceHistory] = useState([]);
  const [showPriceHistory, setShowPriceHistory] = useState(false); // State to control the modal
  const [isEditingVendorMaster, setIsEditingVendorMaster] = useState(null);
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

  const handleClosePriceHistory = () => {
    setShowPriceHistory(false);
  };

  const handlePriceClick = (productId) => {
    fetchPriceHistory(productId);
  };

  const handleInputChange = (index, field, value) => {
    if (index !== null && index !== undefined) {
      const updatedProducts = [...selectedVendorData];
      updatedProducts[index][field] = value;
      setSelectedVendorData(updatedProducts);
    } else {
      setNewProduct({ ...newProduct, [field]: value });
    }
  };

  const handleEditClickVendorMaster = (index) => {
    setIsEditingVendorMaster(index);
  };

  const handleSaveClickVendorMaster = async (index) => {
    const updatedProduct = selectedVendorData[index];
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/vendor_master/${updatedProduct.product_id}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedProduct),
        }
      );

      if (response.ok) {
        const savedProduct = await response.json();
        const updatedProducts = [...selectedVendorData];
        updatedProducts[index] = savedProduct;
        setSelectedVendorData(updatedProducts);
        setIsEditingVendorMaster(null); // Exit editing mode after saving
      } else {
        console.error("Error updating product:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const handleDeleteClick = async (index) => {
    const productToDelete = selectedVendorData[index];
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/vendor_master/${productToDelete.product_id}/`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        const updatedProducts = selectedVendorData.filter(
          (_, i) => i !== index
        );
        setSelectedVendorData(updatedProducts);
      } else {
        console.error("Error deleting product:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleAddNewProduct = async () => {
    const formData = {
      ...newProduct,
      vendor: vendorId,
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/vendor_master/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
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

      {showAddProductForm && (
        <div>
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
            placeholder="Tax"
            value={newProduct.tax}
            onChange={(e) =>
              handleInputChange(null, "tax", e.target.value)
            }
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
              handleInputChange(null, "component_specification", e.target.value)
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
            onChange={(e) => handleInputChange(null, "img", e.target.files[0])}
          />
          <input
            type="file"
            onChange={(e) =>
              handleInputChange(null, "attachments", e.target.files[0])
            }
          />
          <button onClick={handleAddNewProduct}>Save Product</button>
        </div>
      )}

      {/* Price History Modal */}
      {showPriceHistory && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-button" onClick={handleClosePriceHistory}>
              &times;
            </span>
            <h3>Price History</h3>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Price</th>
                  <th>Tax</th>
                </tr>
              </thead>
              <tbody>
                {priceHistory.map((entry, index) => (
                  <tr key={index}>
                    <td>{new Date(entry.current_time).toLocaleDateString()}</td>
                    <td>{entry.price}</td>
                    <td>{entry.tax}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
            <th>Tax</th>
            <th>Image</th>
            <th>Attachments</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {selectedVendorData.map((product, index) => (
            <tr key={product.product_id || index}>
              <td>{product.product_id}</td>
              <td>
                {isEditingVendorMaster === index ? (
                  <input
                    type="text"
                    value={product.product_description}
                    onChange={(e) =>
                      handleInputChange(
                        index,
                        "product_description",
                        e.target.value
                      )
                    }
                  />
                ) : (
                  product.product_description
                )}
              </td>
              <td>
                {isEditingVendorMaster === index ? (
                  <input
                    type="text"
                    value={product.unit_of_measurement}
                    onChange={(e) =>
                      handleInputChange(
                        index,
                        "unit_of_measurement",
                        e.target.value
                      )
                    }
                  />
                ) : (
                  product.unit_of_measurement
                )}
              </td>
              <td>{getComponentId(product.product_id)}</td>
              <td
                onClick={() => handlePriceClick(product.product_id)}
                style={{ cursor: "pointer", textDecoration: "underline" }}
              >
                {isEditingVendorMaster === index ? (
                  <input
                    type="text"
                    value={product.last_price}
                    onChange={(e) =>
                      handleInputChange(index, "last_price", e.target.value)
                    }
                  />
                ) : (
                  product.last_price
                )}
              </td>
              <td>
                {isEditingVendorMaster === index ? (
                  <input
                    type="text"
                    value={product.tax}
                    onChange={(e) =>
                      handleInputChange(index, "tax", e.target.value)
                    }
                  />
                ) : (
                  product.tax
                )}
              </td>
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
                {isEditingVendorMaster === index ? (
                  <button onClick={() => handleSaveClickVendorMaster(index)}>
                    Save
                  </button>
                ) : (
                  <button onClick={() => handleEditClickVendorMaster(index)}>
                    Edit
                  </button>
                )}
                <button onClick={() => handleDeleteClick(index)}>Delete</button>
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
