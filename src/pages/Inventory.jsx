// import React, { useState, useEffect } from "react";
// src\pages\Inventory.jsx

import React, { useState, useEffect } from "react";

const Inventory = () => {
  const [inventoryData, setInventoryData] = useState([]);
  const [componentData, setComponentData] = useState({});
  const [vendorData, setVendorData] = useState({});
  const [expandedComponents, setExpandedComponents] = useState({});
  const [metaTags, setMetaTags] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]); // Stores the filtered inventory
  const [selectedTag, setSelectedTag] = useState(""); // Tag selected for filtering
  const [editingSKU, setEditingSKU] = useState(null); // Tracks which row is being edited for SKU
  const [tempSKU, setTempSKU] = useState(""); // Temporary SKU value for editing

  useEffect(() => {
    fetchInventoryData();
    fetchComponentMasterData();
    fetchVendorMasterData();
    fetchMetaTags();
  }, []);

  useEffect(() => {
    filterInventory();
  }, [selectedTag, inventoryData, componentData, metaTags]);

  const fetchInventoryData = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/inventory/");
      const data = await response.json();
      setInventoryData(data);
    } catch (error) {
      console.error("Error fetching inventory data:", error);
    }
  };

  const fetchComponentMasterData = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/component/");
      const data = await response.json();
      // Create an object where the key is component_id and the value is the component details
      const formattedData = data.reduce((acc, component) => {
        acc[component.component_id] = component;
        return acc;
      }, {});
      setComponentData(formattedData);
    } catch (error) {
      console.error("Error fetching component data:", error);
    }
  };

  const fetchVendorMasterData = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/vendor_master/");
      const data = await response.json();
      const formattedData = data.reduce((acc, vendor) => {
        acc[vendor.product_id] = vendor.vendor;
        return acc;
      }, {});
      setVendorData(formattedData);
    } catch (error) {
      console.error("Error fetching vendor data:", error);
    }
  };

  const toggleExpand = (componentId) => {
    setExpandedComponents((prev) => ({
      ...prev,
      [componentId]: !prev[componentId],
    }));
  };

  const groupedData = filteredInventory.reduce((acc, item) => {
    acc[item.component_id] = acc[item.component_id] || [];
    acc[item.component_id].push(item);
    return acc;
  }, {});

  const fetchMetaTags = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/meta_tags/");
      const data = await response.json();
      setMetaTags(data);
    } catch (error) {
      console.error("Error fetching Meta tags:", error);
    }
  };

  const filterInventory = () => {
    let filtered = inventoryData;
    // console.log("Filtered inventory data", filtered);

    // console.log("Selected tag", selectedTag);

    // Filter by selected meta tag
    if (selectedTag) {
      filtered = filtered.filter((item) => {
        const component = componentData[item.component_id];
        // console.log("Meta tags", metaTags);

        const lowerCaseSearchTerm = selectedTag.toLowerCase();
        return metaTags.some(
          (tag) =>
            tag.component_id === component?.component_id &&
            tag.tags.toLowerCase().includes(lowerCaseSearchTerm)
        );
      });
    }
    // console.log("Filtered inventory data 2", filtered);

    setFilteredInventory(filtered);
  };

  const handleDoubleClick = (id, currentSKU) => {
    setEditingSKU(id); // Set edit mode for the row
    setTempSKU(currentSKU); // Set the temporary SKU value
  };

  const handleSKUChange = (value) => {
    setTempSKU(value); // Update the temporary SKU value
  };

  const handleSaveSKU = async (id) => {
    const item = filteredInventory.find((row) => row.id === id);
    if (!item) return;

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/inventory/${item.serial_number}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sku_number_inventory: tempSKU }),
        }
      );

      if (!response.ok) {
        console.error("Failed to update SKU number:", response.statusText);
        alert("Failed to update SKU number.");
      } else {
        // Update the state after a successful PATCH request
        setFilteredInventory((prev) =>
          prev.map((row) =>
            row.id === id ? { ...row, sku_number: tempSKU } : row
          )
        );
        alert("SKU number updated successfully!");
      }
    } catch (error) {
      console.error("Error updating SKU number:", error);
      alert("Error updating SKU number.");
    } finally {
      setEditingSKU(null); // Exit edit mode
    }
  };

  const handleCancelEdit = () => {
    setEditingSKU(null);
    setTempSKU("");
  };

  return (
    <div className="inventory-container">
      <div className="header">
        <h2>Inventory Data</h2>
        <div className="search-bar-container">
          <input
            type="text"
            className="search-bar"
            placeholder="Search by tag..."
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
          />
          <span className="search-icon">
            <i className="fa fa-search" aria-hidden="true"></i>
          </span>
        </div>
      </div>
      <table className="inventory-table">
        <thead>
          <tr>
            <th>Component ID</th>
            <th>Serial Number</th>
            <th>SKU Number</th>
            <th>Category</th>
            <th>Component Type</th>
            <th>Specification</th>
            <th>UOM</th>
            <th>Vendor</th>
            <th>Created Date</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(groupedData).length > 0 ? (
            Object.keys(groupedData).map((componentId) => {
              const componentRows = groupedData[componentId];
              const componentRowsCount =
                groupedData[componentId].filter((row) => row.status === true)
                  .length || 0;
              const firstRow = componentRows[0];
              const component = componentData[componentId] || {};
              const isExpanded = expandedComponents[componentId];

              return (
                <React.Fragment key={componentId}>
                  <tr
                    onClick={() => toggleExpand(componentId)}
                    className="clickable-row"
                    style={{
                      cursor: "pointer",
                      backgroundColor: componentRows.some((row) => !row.status)
                        ? "white"
                        : "", // Highlight disabled rows
                    }}
                  >
                    <td
                      style={{
                        textDecoration:
                          componentRows.length > 1 ? "underline" : "none",
                      }}
                    >
                      {componentId}
                    </td>
                    <td
                      style={{ color: "Grey", fontStyle: "italic" }}
                    >{`Quantity: ${componentRowsCount}`}</td>
                    <td>{component.sku_number}</td>
                    <td>{component.category || ""}</td>
                    <td>{component.component_type || ""}</td>
                    <td>{component.component_specification || ""}</td>
                    <td>{firstRow.UOM || ""}</td>
                    <td>{firstRow.vendor_name || ""}</td>
                    <td>
                      {firstRow.create_date || new Date().toLocaleDateString()}
                    </td>
                    <td>{firstRow.price}</td>
                  </tr>

                  {isExpanded &&
                    componentRows.map((row, index) => (
                      <tr
                        key={index}
                        className="expanded-row"
                        style={{
                          backgroundColor: !row.status ? "#e0e0e0" : "#ededed", // Highlight disabled items
                          color: !row.status ? "#a0a0a0" : "inherit",
                        }}
                      >
                        <td>{row.component_id}</td>
                        <td>{row.serial_number}</td>
                        <td
                          onDoubleClick={() =>
                            handleDoubleClick(row.id, row.sku_number)
                          }
                          style={{ cursor: "pointer" }}
                        >
                          {editingSKU === row.id ? (
                            <>
                              <input
                                type="text"
                                value={tempSKU}
                                onChange={(e) =>
                                  handleSKUChange(e.target.value)
                                }
                                autoFocus
                              />
                              <button onClick={() => handleSaveSKU(row.id)}>
                                Save
                              </button>
                              <button onClick={handleCancelEdit}>Cancel</button>
                            </>
                          ) : (
                            <span>{row.sku_number_inventory}</span>
                          )}
                        </td>
                        <td>{component.category || ""}</td>
                        <td>{component.component_type || ""}</td>
                        <td>{row.specification || ""}</td>
                        <td>{row.UOM || ""}</td>
                        <td>{row.vendor_name || ""}</td>
                        <td>
                          {row.create_date || new Date().toLocaleDateString()}
                        </td>
                        <td>{row.price}</td>
                      </tr>
                    ))}
                </React.Fragment>
              );
            })
          ) : (
            <tr>
              <td colSpan="9" className="no-data">
                No inventory data available
              </td>
            </tr>
          )}
          <tr>
            <td style={{ fontWeight: "bold" }}>Total Inventory count</td>
            <td>
              {filteredInventory.filter((row) => row.status === true).length ||
                0}
            </td>
            <td colSpan="8" className="no-data"></td>
          </tr>
        </tbody>
      </table>

      <style>{`
        .disabled-row {
          background-color: #e0e0e0;
          color: #a0a0a0;
          pointer-events: none;
        }
        .disabled-row button {
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default Inventory;
