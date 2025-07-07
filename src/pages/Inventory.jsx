// import React, { useState, useEffect } from "react";
// src\pages\Inventory.jsx

import React, { useState, useEffect } from "react";
import config from "../Config"; // Import config for API endpoints
import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  ToastContainerComponent,
} from "./Toastify.jsx"; // Import Toastify utilities
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Add from "../assets/Add.png";

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
  const [selectedStatus, setSelectedStatus] = useState(""); // Default status selection
  const [fromDate, setFromDate] = useState(""); // From date state
  const [toDate, setToDate] = useState(""); // To date state
  const [editingComponentSpec, setEditingComponentSpec] = useState(null); // component_id being edited
  const [tempSpecification, setTempSpecification] = useState(""); // temp specification input
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc"); // "asc" or "desc"
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false); // Track visibility of scroll-to-top button
  const [statusFilter, setStatusFilter] = useState("Available");
  const [newToolRow, setNewToolRow] = useState(null);
  const [toolInventory, setToolInventory] = useState([]);

  useEffect(() => {
    fetchInventoryData();
    fetchComponentMasterData();
    fetchVendorMasterData();
    fetchMetaTags();
  }, [selectedStatus]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    filterInventory();
  }, [selectedTag, inventoryData, componentData, metaTags, selectedStatus]);

  // const fetchInventoryData = async () => {
  //   try {
  //     const response = await fetch(`${config.apiBaseURL}/inventory/?status=`);
  //     const data = await response.json();
  //     setInventoryData(data);
  //   } catch (error) {
  //     console.error("Error fetching inventory data:", error);
  //   }
  // };

  // Fetch inventory data from API (filtered by status)
  const fetchInventoryData = async () => {
    try {
      let apiUrl = `${config.apiBaseURL}/inventory/`;
      if (selectedStatus && selectedStatus !== "Tool") {
        apiUrl += `?status=${selectedStatus}`;
      }

      const response = await fetch(apiUrl);
      const data = await response.json();
      setInventoryData(data);

      console.log("Fetched inventory data:", data);
    } catch (error) {
      console.error("Error fetching inventory data:", error);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Smooth scroll effect
    });
  };

  const filterByDate = () => {
    let filtered = inventoryData;

    if (fromDate && toDate) {
      filtered = filtered.filter((item) => {
        const createdDate = new Date(item.create_date);
        return (
          createdDate >= new Date(fromDate) && createdDate <= new Date(toDate)
        );
      });
    }

    setFilteredInventory(filtered);
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

  // const groupedData = filteredInventory.reduce((acc, item) => {
  //   acc[item.component_id] = acc[item.component_id] || [];
  //   acc[item.component_id].push(item);
  //   return acc;
  // }, {});

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
    const validSerialNumbers = filteredInventory.map(
      (item) => item.serial_number
    );

    if (validSerialNumbers.length === 0) {
      alert("No valid inventory items available to generate the report.");
      return;
    }

    setIsGeneratingReport(true);

    const formatPrice = (value) =>
      value !== undefined && value !== null
        ? `₹${parseFloat(value).toFixed(2)}`
        : "N/A";

    const formatPercentage = (value) =>
      value !== undefined && value !== null
        ? `${parseFloat(value).toFixed(2)}%`
        : "N/A";

    const fetchInventoryDetails = async (serial) => {
      try {
        const response = await fetch(
          `${config.apiBaseURL}/inventory_details/${serial}/`
        );
        if (!response.ok) throw new Error();
        const data = await response.json();

        return {
          Serial_Number: serial,
          Component_ID: data.inventory_item?.component_id || "N/A",
          Component_Type: data.inventory_item?.component_type || "N/A",
          Vendor_Name: data.inventory_item?.vendor_name || "N/A",
          Category: data.inventory_item?.category || "N/A",
          Specification: data.inventory_item?.specification || "N/A",
          UOM: data.inventory_item?.UOM || "N/A",
          Create_Date: data.inventory_item?.create_date || "N/A",
          Status: data.inventory_item?.status || "N/A",
          Price: formatPrice(data.inventory_item?.price),
          SKU_Number_Inventory:
            data.inventory_item?.sku_number_inventory || "N/A",
          Request_ID_Assign: data.inventory_item?.Request_id_assign || "N/A",
          PO_ID: data.po_master?.[0]?.PO_id || "N/A",
          Cart_ID: data.po_master?.[0]?.cart_id || "N/A",
          GST: formatPercentage(data.cart?.[0]?.GST),
          GSTN: data.cart?.[0]?.gstn || "N/A",
          Request_ID: data.request_list?.[0]?.request_id || "N/A",
          Requester_Name: data.request_list?.[0]?.requester_name || "N/A",
          BOM_ID: data.request_list?.[0]?.bom || "N/A",
          BOM_Name: data.request_list?.[0]?.bom_name || "N/A",
          Project_ID: data.project?.[0]?.project_id || "N/A",
          Project_Name: data.project?.[0]?.project_name || "N/A",
        };
      } catch {
        return {
          Serial_Number: serial,
          Component_ID: "N/A",
          Component_Type: "N/A",
          Vendor_Name: "N/A",
          Category: "N/A",
          Specification: "N/A",
          UOM: "N/A",
          Create_Date: "N/A",
          Status: "N/A",
          Price: "N/A",
          SKU_Number_Inventory: "N/A",
          Request_ID_Assign: "N/A",
          PO_ID: "N/A",
          Cart_ID: "N/A",
          GST: "N/A",
          GSTN: "N/A",
          Request_ID: "N/A",
          Requester_Name: "N/A",
          BOM_ID: "N/A",
          BOM_Name: "N/A",
          Project_ID: "N/A",
          Project_Name: "N/A",
        };
      }
    };

    const chunkArray = (array, size) => {
      const chunks = [];
      for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
      }
      return chunks;
    };

    const batchSize = 200; // Increase batch size if your backend supports it
    const serialChunks = chunkArray(validSerialNumbers, batchSize);
    let allReportData = [];

    try {
      for (const chunk of serialChunks) {
        // Run each chunk concurrently
        const results = await Promise.all(chunk.map(fetchInventoryDetails));
        allReportData.push(...results);
      }

      if (allReportData.length > 0) {
        generateCSV(allReportData);
      } else {
        alert("No report data available.");
      }
    } catch (error) {
      console.error("Error generating report:", error);
      showErrorToast("Report generation failed.");
    } finally {
      setIsGeneratingReport(false); // Hide the popup when done
    }
  };

  // Function to format price values (₹, commas, two decimal places)
  const formatPrice = (value) => {
    if (!value || isNaN(value)) return "N/A";
    return `₹${parseFloat(value).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Function to format GST percentage (two decimal places)
  const formatPercentage = (value) => {
    if (!value || isNaN(value)) return "N/A";
    return `${parseFloat(value).toFixed(2)}%`;
  };

  const generateCSV = (data, selectedStatus = "") => {
    let csvContent =
      "Serial Number,Component ID,Component Type,Vendor Name,Category,Specification,UOM,Created Date,Status,Price,SKU Number Inventory,Request ID Assign,PO ID,Cart ID,GST,GSTN,Request ID,Requester Name,BOM ID,BOM Name,Project ID,Project Name\n";

    data.forEach((row) => {
      csvContent += `${Object.values(row)
        .map((value) => `"${value}"`)
        .join(",")}\n`;
    });

    // Auto-detect status from data if not explicitly passed
    let statusForFileName = "All";

    if (selectedStatus && selectedStatus.trim() !== "") {
      statusForFileName = selectedStatus;
    } else {
      // Get unique statuses from the data
      const uniqueStatuses = [...new Set(data.map((row) => row.Status))];

      if (uniqueStatuses.length === 1) {
        statusForFileName = uniqueStatuses[0];
      } else {
        statusForFileName = "All";
      }
    }

    // Format the current date in Indian time (DD-MM-YYYY hh:mm am/pm)
    const indianTime = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    // Replace colon and comma to make filename safe
    const formattedTime = indianTime
      .replace(/:/g, "-")
      .replace(/, /g, "_")
      .toLowerCase();

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Inventory_Report_${statusForFileName}_${formattedTime}.csv`;
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

  const clearDateFilter = () => {
    setFromDate("");
    setToDate("");
    filterInventory();

    // Optional: Also clear any filtered data here if needed
  };

  const handleSaveSpecification = async (componentId) => {
    const rowsToUpdate = inventoryData.filter(
      (item) => item.component_id === componentId
    );

    try {
      const updatePromises = rowsToUpdate.map((item) =>
        fetch(`${config.apiBaseURL}/inventory/${item.serial_number}/`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ specification: tempSpecification }),
        })
      );

      await Promise.all(updatePromises);

      showSuccessToast("Specification updated for all matching items.");

      // Update state to reflect changes
      setFilteredInventory((prev) =>
        prev.map((row) =>
          row.component_id === componentId
            ? { ...row, specification: tempSpecification }
            : row
        )
      );

      setEditingComponentSpec(null);
      setTempSpecification("");
    } catch (error) {
      console.error("Error updating specification:", error);
      alert("Failed to update specification.");
    }
  };

  const cancelSpecificationEdit = () => {
    setEditingComponentSpec(null);
    setTempSpecification("");
  };

  const handleSort = (field) => {
    const order = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(order);

    const sorted = [...filteredInventory].sort((a, b) => {
      const aValue = a[field] || "";
      const bValue = b[field] || "";

      if (typeof aValue === "number" && typeof bValue === "number") {
        return order === "asc" ? aValue - bValue : bValue - aValue;
      }

      return order === "asc"
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });

    setFilteredInventory(sorted);
  };

  const filteredStatusInventory = statusFilter
    ? inventoryData.filter((item) => item.status === statusFilter)
    : filteredInventory;

  const groupedData = filteredStatusInventory.reduce((acc, item) => {
    acc[item.component_id] = acc[item.component_id] || [];
    acc[item.component_id].push(item);
    return acc;
  }, {});

  const handleSaveToolRow = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/inventory/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...newToolRow, status: "Tool" }),
      });

      if (response.ok) {
        setNewToolRow(null);
        fetchInventoryData(); // Re-fetch inventory
        showSuccessToast("Tool inventory added.");
      } else {
        throw new Error("Failed to save tool.");
      }
    } catch (error) {
      console.error(error);
      showErrorToast("Error saving tool inventory.");
    }
  };

  return (
    <div className="inventory-container">
      <div className="header">
        <h2>Inventory Data</h2>
        <div className="right-wrapper">
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
      </div>
      <div className="tab-selector">
        <button
          className={`tab-btn ${statusFilter === "Available" ? "active" : ""}`}
          onClick={() => setStatusFilter("Available")}
        >
          Available
        </button>
        <button
          className={`tab-btn ${statusFilter === "In_drone" ? "active" : ""}`}
          onClick={() => setStatusFilter("In_drone")}
        >
          In Drone
        </button>
        <button
          className={`tab-btn ${statusFilter === "Scrap" ? "active" : ""}`}
          onClick={() => setStatusFilter("Scrap")}
        >
          Scrap
        </button>
        <button
          className={`tab-btn ${statusFilter === "Tool" ? "active" : ""}`}
          onClick={() => {
            setStatusFilter("Tool");
            setSelectedStatus("");
          }}
        >
          Tool Inventory
        </button>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          margin: "10px 0",
          gap: "20px",
        }}
      >
        <button className="generate-report-btn">Generate Report</button>
        {statusFilter === "Tool" && (
          <>
            <button
              style={{
                cursor: "pointer",
                background: "transparent",
                border: "none",
              }}
              title="Add Vendor"
              onClick={() =>
                setNewToolRow({
                  component_id: "",
                  tool_name: "",
                  quantity: 0,
                  in_inventory: 0,
                  team1: 0,
                  team2: 0,
                })
              }
            >
              <img src={Add} alt="" style={{ width: "20px", height: "20px" }} />
            </button>
          </>
        )}
      </div>{" "}
      <div className="table-container">
        {statusFilter !== "Tool" ? (
          <table className="inventory-table">
            <thead>
              <tr>
                <th
                  onClick={() => handleSort("component_id")}
                  style={{ textDecoration: "underline", cursor: "pointer" }}
                >
                  Component ID{" "}
                  {sortField === "component_id"
                    ? sortOrder === "asc"
                      ? " 🔼"
                      : " 🔽"
                    : ""}
                </th>
                <th
                  onClick={() => handleSort("serial_number")}
                  style={{ textDecoration: "underline", cursor: "pointer" }}
                >
                  Serial Number{" "}
                  {sortField === "serial_number"
                    ? sortOrder === "asc"
                      ? " 🔼"
                      : " 🔽"
                    : ""}
                </th>
                <th>SKU Number</th>
                <th
                  onClick={() => handleSort("category")}
                  style={{ textDecoration: "underline", cursor: "pointer" }}
                >
                  Category{" "}
                  {sortField === "category"
                    ? sortOrder === "asc"
                      ? " 🔼"
                      : " 🔽"
                    : ""}
                </th>
                <th
                  onClick={() => handleSort("component_type")}
                  style={{ textDecoration: "underline", cursor: "pointer" }}
                >
                  Component Type{" "}
                  {sortField === "component_type"
                    ? sortOrder === "asc"
                      ? " 🔼"
                      : " 🔽"
                    : ""}
                </th>
                <th
                  onClick={() => handleSort("specification")}
                  style={{ textDecoration: "underline", cursor: "pointer" }}
                >
                  Specification{" "}
                  {sortField === "specification"
                    ? sortOrder === "asc"
                      ? " 🔼"
                      : " 🔽"
                    : ""}
                </th>
                <th>UOM</th>
                <th
                  onClick={() => handleSort("vendor_name")}
                  style={{ textDecoration: "underline", cursor: "pointer" }}
                >
                  Vendor{" "}
                  {sortField === "vendor_name"
                    ? sortOrder === "asc"
                      ? " 🔼"
                      : " 🔽"
                    : ""}
                </th>
                <th
                  onClick={() => handleSort("create_date")}
                  style={{ textDecoration: "underline", cursor: "pointer" }}
                >
                  Created Date{" "}
                  {sortField === "create_date"
                    ? sortOrder === "asc"
                      ? " 🔼"
                      : " 🔽"
                    : ""}
                </th>
                <th
                  onClick={() => handleSort("price")}
                  style={{ textDecoration: "underline", cursor: "pointer" }}
                >
                  Price{" "}
                  {sortField === "price"
                    ? sortOrder === "asc"
                      ? " 🔼"
                      : " 🔽"
                    : ""}
                </th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(groupedData).length > 0 ? (
                Object.keys(groupedData).map((componentId) => {
                  const componentRows = groupedData[componentId];
                  const componentRowsCount =
                    groupedData[componentId].filter(
                      (row) =>
                        row.status === "Available" || row.status === "Reserved"
                    ).length || 0;
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
                          backgroundColor: componentRows.some(
                            (row) => row.status !== "Available"
                          )
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
                        <td
                          onDoubleClick={() => {
                            setEditingComponentSpec(componentId);
                            setTempSpecification(firstRow.specification || "");
                          }}
                          style={{ cursor: "pointer" }}
                          className="specification-cell"
                        >
                          {editingComponentSpec === componentId ? (
                            <>
                              <input
                                type="text"
                                value={tempSpecification}
                                onChange={(e) =>
                                  setTempSpecification(e.target.value)
                                }
                                autoFocus
                              />
                              <button
                                onClick={() =>
                                  handleSaveSpecification(componentId)
                                }
                              >
                                Save
                              </button>
                              <button onClick={() => cancelSpecificationEdit()}>
                                Cancel
                              </button>
                            </>
                          ) : (
                            <span>
                              {firstRow.specification || "Not Available"}
                            </span>
                          )}
                        </td>
                        <td>{firstRow.UOM || ""}</td>
                        <td
                          className="specification-cell"
                          title={firstRow.vendor_name || ""}
                        >
                          {firstRow.vendor_name || ""}
                        </td>
                        <td>
                          {firstRow.create_date ||
                            new Date().toLocaleDateString()}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          ₹
                          {parseFloat(firstRow.price).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td></td>
                      </tr>

                      {isExpanded &&
                        componentRows.map((row, index) => (
                          <tr
                            key={index}
                            className="expanded-row"
                            style={{
                              backgroundColor: !row.status
                                ? "#e0e0e0"
                                : "#ededed", // Highlight disabled items
                              color:
                                row.status !== "Available"
                                  ? "#a0a0a0"
                                  : "inherit",
                            }}
                          >
                            <td>{row.component_id}</td>
                            <td>
                              {row.serial_number}{" "}
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
                                  <button onClick={handleCancelEdit}>
                                    Cancel
                                  </button>
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
                              {row.create_date ||
                                new Date().toLocaleDateString()}
                            </td>
                            <td style={{ textAlign: "right" }}>
                              ₹
                              {parseFloat(row.price).toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
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
                  {/* {filteredInventory.filter(
                (row) => row.status === "Available" || row.status === "Reserved"
              ).length || 0} */}
                  {filteredInventory.length || 0}
                </td>
                <td colSpan="10" className="no-data"></td>
              </tr>
            </tbody>
          </table>
        ) : (
          <div className="tool-inventory-table-container">
            <table className="tool-inventory-table">
              <thead>
                <tr>
                  <th>Component ID</th>
                  <th>Tool Name</th>
                  <th>Quantity</th>
                  <th>In Inventory</th>
                  <th>Team-1</th>
                  <th>Team-2</th>
                  {newToolRow && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {newToolRow && (
                  <tr>
                    <td>
                      <input
                        type="text"
                        value={newToolRow.component_id}
                        onChange={(e) =>
                          setNewToolRow({
                            ...newToolRow,
                            component_id: e.target.value,
                          })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={newToolRow.tool_name}
                        onChange={(e) =>
                          setNewToolRow({
                            ...newToolRow,
                            tool_name: e.target.value,
                          })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={newToolRow.quantity}
                        onChange={(e) =>
                          setNewToolRow({
                            ...newToolRow,
                            quantity: parseInt(e.target.value),
                          })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={newToolRow.in_inventory}
                        onChange={(e) =>
                          setNewToolRow({
                            ...newToolRow,
                            in_inventory: parseInt(e.target.value),
                          })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={newToolRow.team1}
                        onChange={(e) =>
                          setNewToolRow({
                            ...newToolRow,
                            team1: parseInt(e.target.value),
                          })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={newToolRow.team2}
                        onChange={(e) =>
                          setNewToolRow({
                            ...newToolRow,
                            team2: parseInt(e.target.value),
                          })
                        }
                      />
                    </td>
                    <td className="event-buttons">
                      <button onClick={handleSaveToolRow}>Save</button>
                      <button onClick={() => setNewToolRow(null)}>
                        Cancel
                      </button>
                    </td>
                  </tr>
                )}

                {toolInventory.length > 0 ? (
                  toolInventory.map((tool, idx) => (
                    <tr key={idx}>
                      <td>{tool.component_id}</td>
                      <td>{tool.tool_name || "N/A"}</td>
                      <td>{tool.quantity || 0}</td>
                      <td>{tool.in_inventory || 0}</td>
                      <td>{tool.team1 || "0"}</td>
                      <td>{tool.team2 || "0"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      style={{ textAlign: "center", color: "gray" }}
                    >
                      No Tool Inventory found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {isGeneratingReport && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>
              Generating Report... Please wait. This may take a few minutes.
            </p>
          </div>
        </div>
      )}
      <style>{`
        .modal-overlay {position: fixed; top: 0; left: 0;
          right: 0; bottom: 0;background:rgba(0, 0, 0, 0.4);display: flex;justify-content: center;align-items: center;z-index: 999;}

        .modal-content {background: #fff;padding: 20px 40px;border-radius: 8px;box-shadow: 0 0 12px rgba(0, 0, 0, 0.25);font-size: 18px;font-weight: bold;color: #333;}
      `}</style>
      {returnModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Return Item</h3>
            <p>
              <strong>Serial Number:</strong> {returnItem.serial_number}
            </p>
            <p>
              <strong>Component Type:</strong> {returnItem.component_type}
            </p>
            <p>
              <strong>Specification:</strong> {returnItem.specification}
            </p>
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
              <button className="confirm-button" onClick={handleReturn}>
                Confirm Return
              </button>
              <button className="cancel-button" onClick={closeReturnModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainerComponent />
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
      {showScrollTop && (
        <button
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            padding: "10px 15px",
            fontSize: "18px",
            backgroundColor: "#f57c00",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            zIndex: 1000,
          }}
          onClick={scrollToTop}
        >
          ↑
        </button>
      )}
    </div>
  );
};

export default Inventory;
