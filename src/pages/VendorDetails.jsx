// Second set of code

// src/pages/VendorDetails.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const VendorDetails = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();
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
        setSelectedVendorData(matchedProducts);
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
            type="text"
            placeholder="Category"
            value={newProduct.category}
            onChange={(e) =>
              handleInputChange(null, "category", e.target.value)
            }
          />
          <input
            type="text"
            placeholder="Component Type"
            value={newProduct.component_type}
            onChange={(e) =>
              handleInputChange(null, "component_type", e.target.value)
            }
          />
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

      <table>
        <thead>
          <tr>
            <th>Product ID</th>
            <th>Product Description</th>
            <th>UOM</th>
            <th>Component ID</th>
            <th>Last Price</th>
            <th>Image</th>
            <th>Attachments</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {selectedVendorData.map((product, index) => (
            <tr
              key={product.product_id}
              onClick={() => {
                // Only trigger row click if not in editing mode for this row
                if (isEditingVendorMaster !== index) {
                }
              }}
            >
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
                        "product.unit_of_measurement",
                        e.target.value
                      )
                    }
                  />
                ) : (
                  product.unit_of_measurement
                )}
              </td>

              <td>{getComponentId(product.product_id)}</td>

              <td>
                {isEditingVendorMaster === index ? (
                  <input
                    type="text"
                    value={product.last_price}
                    onChange={(e) =>
                      handleInputChange(
                        index,
                        "product.last_price",
                        e.target.value
                      )
                    }
                  />
                ) : (
                  product.last_price
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
