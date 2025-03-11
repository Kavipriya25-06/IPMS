// import React, { useState, useEffect } from "react";
// src\pages\Inventory.jsx

import React, { useState, useEffect } from "react";
import config from "../Config"; // Import config for API endpoints

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
  const [returnModal, setReturnModal] = useState(false);
  const [returnItem, setReturnItem] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [reportedBy, setReportedBy] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Damaged"); // Default status selection



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
      const response = await fetch(`${config.apiBaseURL}/inventory/`);
      const data = await response.json();
      setInventoryData(data);
    } catch (error) {
      console.error("Error fetching inventory data:", error);
    }
  };

  const fetchComponentMasterData = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/component/`);
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
      const response = await fetch(`${config.apiBaseURL}/vendor_master/`);
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
      const response = await fetch(`${config.apiBaseURL}/meta_tags/`);
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
        `${config.apiBaseURL}/inventory/${item.serial_number}/`,
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





  const handleGenerateReport = async () => {
    const validSerialNumbers = filteredInventory
      .filter((item) => item.status === true)
      .map((item) => item.serial_number);

    if (validSerialNumbers.length === 0) {
      alert("No valid inventory items available to generate the report.");
      return;
    }

    try {
      const fetchDetailsPromises = validSerialNumbers.map(async (serial) => {
        const response = await fetch(`http://127.0.0.1:8000/inventory_details/${serial}/`);
        if (!response.ok) {
          console.error(`Failed to fetch details for ${serial}`);
          return {
            Serial_Number: serial,
            po_id: "N/A",
            request_id: "N/A",
            project_id: "N/A",
            project_name: "N/A",
            bom_id: "N/A",
            bom_name: "N/A",
            price: "N/A",
            create_date: "N/A",
          };
        }

        const data = await response.json();
        console.log(`API Response for ${serial}:`, data); // Debugging purpose

        return {
          Serial_Number: serial,
          po_id: data.po_master?.[0]?.PO_id || "N/A", // Fetch PO ID from first entry
          request_id: data.request_master?.[0]?.request || "N/A", // Get request ID
          project_id: data.project?.[0]?.project_id || "N/A", // Get Project ID
          project_name: data.project?.[0]?.project_name || "N/A", // Get Project Name
          bom_id: data.bom_list?.[0]?.bom_id || "N/A", // Get BOM ID
          bom_name: data.bom_list?.[0]?.bom_name || "N/A", // Get BOM Name
          price: data.inventory_item?.price || "N/A", // Fetch Price from inventory_item
          create_date: data.inventory_item?.create_date || "N/A", // Fetch Created Date from inventory_item
        };
      });

      const reportData = await Promise.all(fetchDetailsPromises);

      if (reportData.length > 0) {
        generateCSV(reportData);
      } else {
        alert("No report data available.");
      }
    } catch (error) {
      console.error("Error generating report:", error);
    }
  };

  const generateCSV = (data) => {
    let csvContent = "Serial Number,PO ID,Request ID,Project ID,Project Name,BOM ID,BOM Name,Price,Created Date\n";

    data.forEach((row) => {
      csvContent += `${row.Serial_Number},${row.po_id},${row.request_id},${row.project_id},${row.project_name},${row.bom_id},${row.bom_name},${row.price},${row.create_date}\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Inventory_Report.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };



  // const openReturnModal = (item) => {
  //   console.log("Opening return modal for:", item);
  //   setReturnItem(item);
  //   setRemarks("");
  //   setReportedBy("");
  //   setSelectedStatus("Damaged"); // Default to "Damaged" when modal opens
  //   setReturnModal(true);
  // };

  // const closeReturnModal = () => {
  //   setReturnModal(false);
  //   setReturnItem(null);
  // };




  // const handleReturn = async () => {
  //   if (!remarks || !reportedBy) {
  //     alert("Please enter Remarks and Reported By.");
  //     return;
  //   }
  
  //   try {
  //     // POST request to report the item as damaged
  //     const response = await fetch(`${config.apiBaseURL}/damaged/${returnItem.serial_number}/`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         serial_number: returnItem.serial_number,
  //         remarks,
  //         reported_by: reportedBy,
  //         status: selectedStatus, // Use selectedStatus from dropdown
  //       }),
  //     });
  
  //     if (!response.ok) {
  //       console.error("Failed to report damaged item:", response.statusText);
  //       alert("Failed to report damaged item.");
  //       return;
  //     }
  
  //     alert(`Item ${returnItem.serial_number} reported as damaged successfully!`);

  //       // Step 2: Update inventory status to true
  //     const patchResponse = await fetch(`${config.apiBaseURL}/inventory/${returnItem.serial_number}/`, {
  //       method: "PATCH",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         status: true,
  //       }),
  //     });

  //     if (!patchResponse.ok) {
  //       console.error("Failed to update inventory status:", patchResponse.statusText);
  //       alert("Failed to update inventory status.");
  //       return;
  //     }

  //     alert(`Inventory status for ${returnItem.serial_number} updated successfully!`);
  
  //     // Update UI state to reflect the change
  //     setFilteredInventory((prev) =>
  //       prev.map((row) =>
  //         row.serial_number === returnItem.serial_number ? { ...row, status: true } : row
  //       )
  //     );
  
  //     closeReturnModal();
  
  //   } catch (error) {
  //     console.error("Error reporting damaged item:", error);
  //     alert("Error reporting damaged item.");
  //   }
  // };


  return (
    <div className="inventory-container">
      <div className="header">
        <h2>Inventory Data</h2>
        <button className="generate-report-button" onClick={handleGenerateReport}>
          Generate Report
        </button>
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
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(groupedData).length > 0 ? (
            Object.keys(groupedData).map((componentId) => {
              const componentRows = groupedData[componentId];
              const componentRowsCount =
                groupedData[componentId].filter((row) => row.status === "Available")
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
                      backgroundColor: componentRows.some((row) => row.status !== "Available")
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
                    <td></td>
                  </tr>

                  {isExpanded &&
                    componentRows.map((row, index) => (
                      <tr
                        key={index}
                        className="expanded-row"
                        style={{
                          backgroundColor: !row.status ? "#e0e0e0" : "#ededed", // Highlight disabled items
                          color: row.status !== "Available" ? "#a0a0a0" : "inherit",
                        }}
                      >
                        <td>{row.component_id}</td>
                        <td>{row.serial_number} {" "}
                        {/* {!row.status && (
                            <button
                              className="return-button"
                              onClick={() => openReturnModal(row)}
                            >
                              Return
                            </button>
                          )} */}
                        </td>
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
                        <td>{row.status}</td>
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
              {filteredInventory.filter((row) => row.status === "Available").length ||
                0}
            </td>
            <td colSpan="10" className="no-data"></td>
          </tr>
        </tbody>
      </table>


      {returnModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Return Item</h3>
            <p><strong>Serial Number:</strong> {returnItem.serial_number}</p>
            <p><strong>Component Type:</strong> {returnItem.component_type}</p>
            <p><strong>Specification:</strong> {returnItem.specification}</p>
              {/* Dropdown for Status Selection */}
      <label>
        <strong>Status:</strong>
        <select
          value={selectedStatus}
          onChange={(e) => {
            console.log("Status changed to:", e.target.value); // Debugging
            setSelectedStatus(e.target.value);
          }}
        >
          <option value="damaged">Damaged</option>
          <option value="repairable">Repairable</option>
          <option value="returned">Returned</option>
        </select>
      </label>
            <label>
              <strong>Remarks:</strong>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter remarks"
              />
            </label>
            <label>
              <strong>Reported By:</strong>
              <input
                type="text"
                value={reportedBy}
                onChange={(e) => setReportedBy(e.target.value)}
                placeholder="Enter your name"
              />
            </label>
            <div className="modal-buttons">
              <button className="confirm-button" onClick={handleReturn}>Confirm Return</button>
              <button className="cancel-button" onClick={closeReturnModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .disabled-row {
          background-color: #e0e0e0;
          color: #a0a0a0;
          pointer-events: none;
        }
        .disabled-row button {
          cursor: not-allowed;
        }


        .return-button {
          background-color: red;
          color: white;
          border: none;
          padding: 5px 10px;
          cursor: pointer;
          border-radius: 4px;
          font-size: 12px;
          margin-left: 10px;
        }
        .return-button:hover {
          background-color: darkred;
        }
        .modal {
          position: fixed;
          top: 50%;
          left: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          transform: translate(-50%, -50%);
        }
        .modal-content {
          background: white;
          padding: 20px; 
          width: 400px;
          text-align: center;
        }
        .modal-content input {
          width: 100%;
          padding: 8px;
          margin-top: 5px;
          margin-bottom: 10px;
          border: 1px solid #ccc;
          border-radius: 5px;
        }
        .modal-buttons {
          display: flex;
          justify-content: space-between;
        }
        .confirm-button {
          background-color: green;
          color: white;
          padding: 8px 12px;
          border: none;
          cursor: pointer;
          border-radius: 5px;
        }
        .confirm-button:hover {
          background-color: darkgreen;
        }
        .cancel-button {
          background-color: gray;
          color: white;
          padding: 8px 12px;
          border: none;
          cursor: pointer;
          border-radius: 5px;
        }
        .cancel-button:hover {
          background-color: darkgray;
        }


      `}</style>
    </div>
  );
};

export default Inventory;
