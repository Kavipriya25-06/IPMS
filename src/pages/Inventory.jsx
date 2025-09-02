import React, { useState, useEffect, useRef } from "react";
import config from "../Config"; // Import config for API endpoints
import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  ToastContainerComponent,
} from "./Toastify.jsx"; // Import Toastify utilities
import { format, parseISO } from "date-fns";
import { isAfter } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Add from "../assets/Add.png";
import Filter from "../assets/Filter_icon.svg";

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
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownCoords, setDropdownCoords] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef();
  const [editingToolRow, setEditingToolRow] = useState(null);
  const [editToolRowData, setEditToolRowData] = useState({});
  const [visibleInventory, setVisibleInventory] = useState(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [editingRemarks, setEditingRemarks] = useState(null); // which row is being edited
  const [tempRemarks, setTempRemarks] = useState(""); // temp value for input

  const [componentTypeDropdownOpen, setComponentTypeDropdownOpen] =
    useState(false);
  const [componentTypeCoords, setComponentTypeCoords] = useState({
    top: 0,
    left: 0,
  });
  const [selectedComponentTypes, setSelectedComponentTypes] = useState([]);

  const componentTypeRef = useRef(null);

  const [vendorDropdownOpen, setVendorDropdownOpen] = useState(false);
  const [vendorCoords, setVendorCoords] = useState({ top: 0, left: 0 });
  const [selectedVendors, setSelectedVendors] = useState([]);
  const vendorRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        componentTypeRef.current &&
        !componentTypeRef.current.contains(event.target)
      ) {
        setComponentTypeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (vendorRef.current && !vendorRef.current.contains(event.target)) {
        setVendorDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getAllCategories = () => {
    const categories = filteredInventory.map((item) => item.category);
    return [...new Set(categories)];
  };

  const getAllComponentTypes = () => {
    const allTypes = filteredInventory.map((item) => item.component_type);
    return [...new Set(allTypes)].filter(Boolean); // unique + remove undefined/null
  };

  const getAllVendors = () => {
    const allVendors = filteredInventory.map((item) => item.vendor_name);
    return [...new Set(allVendors)].filter(Boolean);
  };

  // Apply filter
  // Step 2: Apply the category filter

  const categoryFilteredInventory = filteredInventory.filter((item) => {
    const categoryMatch =
      selectedCategory.length === 0 || selectedCategory.includes(item.category);

    const typeMatch =
      selectedComponentTypes.length === 0 ||
      selectedComponentTypes.includes(item.component_type);

    const vendorMatch =
      selectedVendors.length === 0 ||
      selectedVendors.includes(item.vendor_name);

    return categoryMatch && typeMatch && vendorMatch;
  });

  // Step: Group by component_id after filtering
  const groupedData = categoryFilteredInventory.reduce((acc, item) => {
    acc[item.component_id] = acc[item.component_id] || [];
    acc[item.component_id].push(item);
    return acc;
  }, {});

  const resetDateFilter = () => {
    setFromDate(null);
    setToDate(null);
  };

  useEffect(() => {
    const loadData = async () => {
      if (statusFilter === "Tool") {
        await fetchToolInventoryData();
      } else {
        await fetchInventoryData(statusFilter);
      }
      fetchComponentMasterData();
      fetchVendorMasterData();
      fetchMetaTags();
    };
    loadData();
  }, [statusFilter]);

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

  // Fetch inventory data from API (filtered by status)

  const fetchInventoryData = async (status = "Available") => {
    try {
      setLoading(true);
      setVisibleInventory(0); // Reset visible count
      setHasMore(true); // Enable infinite scroll
      setIsLoadingMore(false); // Reset loading state

      let allData = [];

      if (status === "Available") {
        const [availableRes, reservedRes] = await Promise.all([
          fetch(`${config.apiBaseURL}/inventory/?status=Available`),
          fetch(`${config.apiBaseURL}/inventory/?status=Reserved`),
        ]);

        if (!availableRes.ok || !reservedRes.ok)
          throw new Error("Failed to fetch Available or Reserved");

        const available = await availableRes.json();
        const reserved = await reservedRes.json();

        allData = [...available, ...reserved];
      } else {
        const response = await fetch(
          `${config.apiBaseURL}/inventory/?status=${status}`
        );
        if (!response.ok) throw new Error("Failed to fetch inventory");
        allData = await response.json();
      }

      // Set the data
      setInventoryData(allData);
      setFilteredInventory(allData);

      // Show first 10, or all if less than or equal to 10
      if (allData.length <= 10) {
        setVisibleInventory(allData.length);
        setHasMore(false); // Nothing left to load
      } else {
        setVisibleInventory(10);
        setHasMore(true); // More to scroll
      }
    } catch (error) {
      console.error("Error fetching inventory data:", error);
      showErrorToast("Failed to fetch inventory data");
    } finally {
      setLoading(false);
    }
  };

  const fetchToolInventoryData = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/tool_inventory/`); // <-- Tool inventory API endpoint
      if (!response.ok) throw new Error("Failed to fetch tool inventory");

      const data = await response.json();
      setToolInventory(data); // set tool inventory data separately
      console.log("Fetched tool inventory data:", data);
    } catch (error) {
      console.error("Error fetching tool inventory:", error);
      showErrorToast("Failed to fetch tool inventory");
    }
  };

  const autoLoadUntilScrollable = () => {
    const container = document.getElementById("inventory-scroll-container");

    if (
      container &&
      container.scrollHeight <= container.clientHeight &&
      hasMore &&
      !isLoadingMore
    ) {
      setIsLoadingMore(true);

      const nextVisible = visibleInventory + 10;
      const moreToLoad = nextVisible < filteredInventory.length;

      setVisibleInventory(moreToLoad ? nextVisible : filteredInventory.length);
      setHasMore(moreToLoad);
      setIsLoadingMore(false);

      if (moreToLoad) {
        setTimeout(autoLoadUntilScrollable, 300); // Keep loading until scroll appears
      }
    }
  };

  useEffect(() => {
    if (!loading && filteredInventory.length > 0 && hasMore) {
      setTimeout(autoLoadUntilScrollable, 300);
    }
  }, [loading, filteredInventory, hasMore]);

  useEffect(() => {
    if (filteredInventory.length > 0) {
      setVisibleInventory(10);
      setHasMore(filteredInventory.length > 10);
    }
  }, [filteredInventory]);

  const handleUpdateToolRow = async () => {
    try {
      const response = await fetch(
        `${config.apiBaseURL}/tool_inventory/${editingToolRow}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editToolRowData),
        }
      );

      if (response.ok) {
        showSuccessToast("Tool updated successfully.");
        setEditingToolRow(null); // exit edit mode
        await fetchToolInventoryData(); // Refresh data
      } else {
        showErrorToast("Failed to update tool.");
      }
    } catch (error) {
      console.error("Error updating tool:", error);
      showErrorToast("Something went wrong.");
    }
  };

  useEffect(() => {
    fetchToolInventoryData();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Smooth scroll effect
    });
  };

  const filterByDate = () => {
    if (fromDate && toDate && isAfter(fromDate, toDate)) {
      showWarningToast("From date cannot be after To date.");
      setFromDate(null);
      setToDate(null);
      return;
    }

    let filtered;

    if (statusFilter === "Tool") {
      filtered = [...toolInventory];
      if (fromDate && toDate) {
        filtered = filtered.filter((item) => {
          const createdDate = new Date(item.created_at);
          createdDate.setHours(0, 0, 0, 0);
          return (
            createdDate >= new Date(fromDate.setHours(0, 0, 0, 0)) &&
            createdDate <= new Date(toDate.setHours(0, 0, 0, 0))
          );
        });
      }
      setToolInventory(filtered);
    } else {
      filtered = [...inventoryData];
      if (fromDate && toDate) {
        filtered = filtered.filter((item) => {
          const createdDate = new Date(item.create_date);
          createdDate.setHours(0, 0, 0, 0);
          return (
            createdDate >= new Date(fromDate.setHours(0, 0, 0, 0)) &&
            createdDate <= new Date(toDate.setHours(0, 0, 0, 0))
          );
        });
      }
      setFilteredInventory(filtered);
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

  // Safe date formatting helper
  const formatDate = (date) => {
    try {
      if (!date) return "";
      const d = typeof date === "string" ? parseISO(date) : date;
      return format(d, "dd-MM-yyyy");
    } catch (e) {
      return "";
    }
  };

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

  // Enter edit mode
  const handleDoubleClick = (serialNumber, currentSKU) => {
    setEditingSKU(serialNumber); //use unique serial_number
    setTempSKU(currentSKU || "");
  };

  // Track typing
  const handleSKUChange = (value) => setTempSKU(value);

  // Save
  const handleSaveSKU = async (serialNumber) => {
    const item = filteredInventory.find(
      (row) => row.serial_number === serialNumber
    );
    if (!item) return;

    try {
      const response = await fetch(
        `${config.apiBaseURL}/inventory/${serialNumber}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sku_number_inventory: tempSKU }),
        }
      );

      if (!response.ok) {
        showErrorToast("Failed to update SKU number.");
      } else {
        setFilteredInventory((prev) =>
          prev.map((row) =>
            row.serial_number === serialNumber
              ? { ...row, sku_number_inventory: tempSKU }
              : row
          )
        );
        showSuccessToast("SKU number updated successfully!");
      }
    } catch (error) {
      console.error("Error updating SKU number:", error);
      showErrorToast("Error updating SKU number.");
    } finally {
      setEditingSKU(null);
      setTempSKU("");
    }
  };

  // Cancel
  const handleCancelEdit = () => {
    setEditingSKU(null);
    setTempSKU("");
  };

  const handleGenerateReport = () => {
    let reportData;
    let status = statusFilter;

    if (status === "Tool") {
      reportData = toolInventory; //  from state
    } else {
      reportData = filteredInventory.filter((item) => item.status === status);
    }

    if (!reportData || reportData.length === 0) {
      showInfoToast(`No inventory items found for status: ${status}`);
      return;
    }

    const formattedData =
      status === "Tool"
        ? reportData.map((item, index) => ({
            "S.No": index + 1,
            "Component ID": item.component_id || "N/A",
            "Tool Name": item.tool_name || "N/A",
            Quantity: item.quantity ?? 0,
            "In Inventory": item.in_inventory ?? 0,
            Team: item.team || "N/A",
            Remarks: item.remarks || "N/A",
          }))
        : reportData.map((item, index) => {
            const basePrice = item?.price ?? null;
            const gstVal = item?.gst ?? null;
            const computedTotal =
              basePrice != null && gstVal != null && !isNaN(Number(gstVal))
                ? Number(basePrice) * (1 + Number(gstVal) / 100)
                : basePrice;
            const totalPrice = item?.total_price ?? computedTotal;

            return {
              "S.No": index + 1,
              "Component ID": item.component_id || "N/A",
              "Serial Number": item.serial_number || "N/A",
              "SKU Number Inventory": item.sku_number_inventory || "N/A",
              Category: item.category || "N/A",
              "Component Type": item.component_type || "N/A",
              Specification: item.specification || "N/A",
              UOM: item.UOM || "N/A",
              "Vendor Name": item.vendor_name || "N/A",
              "Created Date": item.create_date || "N/A",
              Price: basePrice != null ? formatINR(basePrice) : "N/A",
              "GST (%)":
                gstVal != null && !isNaN(Number(gstVal))
                  ? `${Number(gstVal)}%`
                  : "N/A",
              "Total Price": totalPrice != null ? formatINR(totalPrice) : "N/A",
              Status: item.status || "N/A",
              Remarks: item.remarks || "",
            };
          });

    generateCSV(formattedData, status);
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
    let headers;

    if (selectedStatus?.trim().toLowerCase() === "tool") {
      headers = [
        "S.No",
        "Component ID",
        "Tool Name",
        "Quantity",
        "In Inventory",
        "Team",
        "Remarks",
      ];
    } else {
      headers = [
        "S.No",
        "Component ID",
        "Serial Number",
        "SKU Number Inventory",
        "Category",
        "Component Type",
        "Specification",
        "UOM",
        "Vendor Name",
        "Created Date",
        "Price",
        "GST (%)",
        "Total Price",
        "Status",
        "Remarks",
      ];
    }

    const rows = data.map((row) =>
      headers.map((header) => `"${row[header] || ""}"`).join(",")
    );

    const csvContent = [headers.join(","), ...rows].join("\n");
    const BOM = "\uFEFF";

    const indianTime = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const formattedTime = indianTime
      .replace(/:/g, "-")
      .replace(/, /g, "_")
      .toLowerCase();

    const filename = `Inventory_Report_${selectedStatus}_${formattedTime}.csv`;

    const blob = new Blob([BOM + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const clearDateFilter = () => {
    setFromDate(null);
    setToDate(null);

    if (statusFilter === "Tool") {
      fetchToolInventoryData(); // reset to full list
    } else {
      setFilteredInventory(
        inventoryData.filter((item) => item.status === statusFilter)
      );
    }
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
      showErrorToast("Failed to update specification.");
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

  const filteredStatusInventory = filteredInventory;

  // Prevent autoLoadUntilScrollable from running on the first mount
  const firstLoad = useRef(true);
  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }
    if (!loading && filteredInventory.length > 0 && hasMore) {
      setTimeout(autoLoadUntilScrollable, 300);
    }
  }, [loading, filteredInventory, hasMore]);

  const handleSaveToolRow = async () => {
    const toolToSave = {
      ...newToolRow,
      create_date: new Date().toISOString(), // Auto-set current timestamp
    };

    try {
      const response = await fetch(`${config.apiBaseURL}/tool_inventory/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(toolToSave),
      });

      if (response.ok) {
        showSuccessToast("Tool saved successfully.");
        setNewToolRow(null); // clear input
        await fetchToolInventoryData(); // Refresh data
      } else {
        showErrorToast("Failed to save tool.");
      }
    } catch (error) {
      console.error("Error saving tool:", error);
      showErrorToast("Something went wrong.");
    }
  };

  const handleChangeStatusToAvailable = async (serialNumber) => {
    try {
      const response = await fetch(
        `
        ${config.apiBaseURL}/inventory/${serialNumber}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "Available" }),
        }
      );

      if (response.ok) {
        showSuccessToast("Serial ${serialNumber} moved to Available");
        // Refresh inventory after update
        fetchInventoryData("Repair");
      } else {
        showErrorToast("Failed to update status");
      }
    } catch (error) {
      console.error("Error changing status:", error);
      showErrorToast("Network error while updating status");
    }
  };

  // ---- Add below your other functions, above `return` ----
  const getStatusScopedItems = () => {
    if (statusFilter === "Tool") return []; // tools don't have price in your table

    if (statusFilter === "Available") {
      // Available includes Reserved in your UI
      return filteredInventory.filter(
        (item) => item.status === "Available" || item.status === "Reserved"
      );
    }

    return filteredInventory.filter((item) => item.status === statusFilter);
  };

  const computeTotalCost = () => {
    const items = getStatusScopedItems();
    return items.reduce((sum, item) => {
      // prefer total_price; fallback to price
      const n = Number(item?.total_price ?? item?.price ?? 0);
      return sum + (isNaN(n) ? 0 : n);
    }, 0);
  };

  const formatINR = (amount) =>
    `₹${Number(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // Enter edit mode
  const handleDoubleClickRemarks = (serialNumber, currentRemarks) => {
    setEditingRemarks(serialNumber);
    setTempRemarks(currentRemarks || "");
  };

  // Track typing
  const handleRemarksChange = (value) => {
    setTempRemarks(value);
  };

  // Save
  const handleSaveRemarks = async (serialNumber) => {
    const item = filteredInventory.find(
      (row) => row.serial_number === serialNumber
    );
    if (!item) return;

    try {
      const response = await fetch(
        `${config.apiBaseURL}/inventory/${serialNumber}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ remarks: tempRemarks }),
        }
      );

      if (!response.ok) {
        showErrorToast("Failed to update Remarks.");
      } else {
        setFilteredInventory((prev) =>
          prev.map((row) =>
            row.serial_number === serialNumber
              ? { ...row, remarks: tempRemarks }
              : row
          )
        );
        showSuccessToast("Remarks updated successfully!");
      }
    } catch (error) {
      console.error("Error updating remarks:", error);
      showErrorToast("Error updating remarks.");
    } finally {
      setEditingRemarks(null); // exit edit mode
      setTempRemarks(""); // reset
    }
  };

  // Cancel
  const handleCancelRemarks = () => {
    setEditingRemarks(null);
    setTempRemarks("");
  };

  return (
    <div className="inventory-container">
      <div className="header">
        <h2>Inventory Data</h2>
        <div className="right-wrapper">
          <div className="search-bar-container" style={{ width: "300px" }}>
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
          onClick={() => {
            resetDateFilter(); // <-- clear date
            setStatusFilter("Available");
          }}
        >
          Available
        </button>
        <button
          className={`tab-btn ${statusFilter === "In_drone" ? "active" : ""}`}
          onClick={() => {
            resetDateFilter();
            setStatusFilter("In_drone");
          }}
        >
          In Drone
        </button>
        <button
          className={`tab-btn ${statusFilter === "Repair" ? "active" : ""}`}
          onClick={() => {
            resetDateFilter();
            setStatusFilter("Repair");
          }}
        >
          Repair
        </button>
        <button
          className={`tab-btn ${statusFilter === "Damaged" ? "active" : ""}`}
          onClick={() => {
            resetDateFilter();
            setStatusFilter("Damaged");
          }}
        >
          Scrap
        </button>
        <button
          className={`tab-btn ${statusFilter === "Tool" ? "active" : ""}`}
          onClick={() => {
            resetDateFilter();

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
          justifyContent: "space-between",
          alignItems: "center",
          margin: "10px 0",
          gap: "10px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "10px",
          }}
        >
          <span style={{ fontWeight: "bold", fontSize: "20px" }}>
            Total Inventory Count:
          </span>
          <span style={{ fontWeight: "bold", fontSize: "20px" }}>
            {(() => {
              if (statusFilter === "Tool") return toolInventory.length || 0;
              if (statusFilter === "Available") {
                return filteredInventory.filter(
                  (item) =>
                    item.status === "Available" || item.status === "Reserved"
                ).length;
              }
              return filteredInventory.filter(
                (item) => item.status === statusFilter
              ).length;
            })()}
          </span>

          {statusFilter !== "Tool" && (
            <>
              <span
                style={{
                  marginLeft: "20px",
                  fontWeight: "bold",
                  fontSize: "20px",
                  color: "#333",
                }}
              >
                Total Cost:
              </span>
              <span style={{ fontWeight: "bold", fontSize: "20px" }}>
                {statusFilter === "Tool" ? "—" : formatINR(computeTotalCost())}
              </span>
            </>
          )}
        </div>
        {(fromDate || toDate) && (
          <div style={{ fontSize: "14px", color: "#555" }}>
            🗓️ {fromDate && `From: ${format(fromDate, "dd-MM-yyyy")}`}
            {fromDate && toDate && " | "}
            {toDate && `To: ${format(toDate, "dd-MM-yyyy")}`}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            style={{
              cursor: "pointer",
              background: "transparent",
              border: "none",
            }}
            title="Filter by Date"
            onClick={() => setShowDateFilter(true)}
          >
            <img
              src={Filter}
              alt="Filter"
              style={{ width: "25px", height: "30px" }}
            />
          </button>

          <button
            onClick={handleGenerateReport}
            className="generate-report-btn"
          >
            Generate Report
          </button>

          {statusFilter === "Tool" && (
            <button
              style={{
                cursor: "pointer",
                background: "transparent",
                border: "none",
              }}
              title="Add Tool Inventory"
              onClick={() =>
                setNewToolRow({
                  component_id: "",
                  tool_name: "",
                  quantity: 0,
                  in_inventory: 0,
                  team: "",
                  remark: "",
                })
              }
            >
              <img
                src={Add}
                alt="Add"
                style={{ width: "20px", height: "20px" }}
              />
            </button>
          )}
        </div>
      </div>

      <div
        id="inventory-scroll-container"
        className="table-inventory-container"
        style={{
          overflowY: loading ? "hidden" : "auto",
        }}
        onScroll={(e) => {
          const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
          if (
            scrollTop + clientHeight >= scrollHeight - 10 &&
            !isLoadingMore &&
            hasMore
          ) {
            setIsLoadingMore(true);
            setTimeout(() => {
              const nextVisible = visibleInventory + 10;
              const isMore = nextVisible < filteredInventory.length;

              setVisibleInventory(
                isMore ? nextVisible : filteredInventory.length
              );
              setHasMore(isMore);
              setIsLoadingMore(false);
            }, 300);
          }
        }}
      >
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
                <th className="category-dropdown-wrapper" ref={dropdownRef}>
                  <div
                    className="category-dropdown"
                    onClick={(e) => {
                      const rect = e.target.getBoundingClientRect();
                      setDropdownCoords({ top: rect.bottom, left: rect.left });
                      setDropdownOpen(!dropdownOpen);
                    }}
                  >
                    {selectedCategory.length > 0
                      ? `Selected (${selectedCategory.length})`
                      : "Category"}
                  </div>

                  {dropdownOpen && (
                    <div
                      className="category-dropdown-options"
                      style={{
                        position: "fixed",
                        top: dropdownCoords.top,
                        left: dropdownCoords.left,
                        zIndex: 9999,
                        // width: "150px",
                        // maxWidth:"300px"
                      }}
                    >
                      <label className="category-dropdown-option">
                        <input
                          type="checkbox"
                          checked={selectedCategory.length === 0}
                          onChange={() => setSelectedCategory([])}
                        />
                        All
                      </label>
                      {getAllCategories().map((category) => (
                        <label
                          key={category}
                          className="category-dropdown-option"
                        >
                          <input
                            type="checkbox"
                            checked={selectedCategory.includes(category)}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              setSelectedCategory((prev) =>
                                isChecked
                                  ? [...prev, category]
                                  : prev.filter((c) => c !== category)
                              );
                            }}
                          />
                          {category}
                        </label>
                      ))}
                    </div>
                  )}
                </th>

                <th
                  className="component-type-dropdown-wrapper"
                  ref={componentTypeRef}
                >
                  <div
                    className="component-dropdown"
                    onClick={(e) => {
                      const rect = e.target.getBoundingClientRect();
                      setComponentTypeCoords({
                        top: rect.bottom,
                        left: rect.left,
                      });
                      setComponentTypeDropdownOpen(!componentTypeDropdownOpen);
                    }}
                  >
                    {selectedComponentTypes.length > 0
                      ? `Selected (${selectedComponentTypes.length})`
                      : "Component Type"}
                  </div>

                  {componentTypeDropdownOpen && (
                    <div
                      className="component-dropdown-options"
                      style={{
                        position: "fixed",
                        top: componentTypeCoords.top,
                        left: componentTypeCoords.left,
                        zIndex: 9999,
                      }}
                    >
                      <label className="component-dropdown-option">
                        <input
                          type="checkbox"
                          checked={selectedComponentTypes.length === 0}
                          onChange={() => setSelectedComponentTypes([])}
                        />
                        All
                      </label>
                      {getAllComponentTypes().map((type) => (
                        <label key={type} className="component-dropdown-option">
                          <input
                            type="checkbox"
                            checked={selectedComponentTypes.includes(type)}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              setSelectedComponentTypes((prev) =>
                                isChecked
                                  ? [...prev, type]
                                  : prev.filter((t) => t !== type)
                              );
                            }}
                          />
                          {type}
                        </label>
                      ))}
                    </div>
                  )}
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
                <th className="vendor-dropdown-wrapper" ref={vendorRef}>
                  <div
                    className="component-dropdown"
                    onClick={(e) => {
                      const rect = e.target.getBoundingClientRect();
                      setVendorCoords({ top: rect.bottom, left: rect.left });
                      setVendorDropdownOpen(!vendorDropdownOpen);
                    }}
                    // style={{ textDecoration: "underline", cursor: "pointer" }}
                  >
                    {selectedVendors.length > 0
                      ? `Selected (${selectedVendors.length})`
                      : "Vendor"}
                    {sortField === "vendor_name"
                      ? sortOrder === "asc"
                        ? " 🔼"
                        : " 🔽"
                      : ""}
                  </div>

                  {vendorDropdownOpen && (
                    <div
                      className="component-dropdown-options"
                      style={{
                        position: "fixed",
                        top: vendorCoords.top,
                        left: vendorCoords.left,
                        zIndex: 9999,
                      }}
                    >
                      <label className="component-dropdown-option">
                        <input
                          type="checkbox"
                          checked={selectedVendors.length === 0}
                          onChange={() => setSelectedVendors([])}
                        />
                        All
                      </label>
                      {getAllVendors().map((vendor) => (
                        <label
                          key={vendor}
                          className="component-dropdown-option"
                        >
                          <input
                            type="checkbox"
                            checked={selectedVendors.includes(vendor)}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              setSelectedVendors((prev) =>
                                isChecked
                                  ? [...prev, vendor]
                                  : prev.filter((v) => v !== vendor)
                              );
                            }}
                          />
                          {vendor}
                        </label>
                      ))}
                    </div>
                  )}
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
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="12"
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    <div className="spinner" />
                    <span>Loading...</span>
                  </td>
                </tr>
              ) : Object.keys(groupedData).length > 0 ? (
                Object.keys(groupedData)
                  .slice(0, visibleInventory)
                  .map((componentId) => {
                    const componentRows = groupedData[componentId];
                    const componentRowsCount =
                      groupedData[componentId].filter(
                        (row) =>
                          row.status === "Available" ||
                          row.status === "Reserved" ||
                          row.status === "Repair" ||
                          row.status === "Damaged" ||
                          row.status === "In_drone"
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
                              setTempSpecification(
                                firstRow.specification || ""
                              );
                            }}
                            style={{ cursor: "pointer" }}
                            className="specification-cell"
                            title={firstRow.specification}
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
                                <button
                                  onClick={() => cancelSpecificationEdit()}
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <span>{firstRow.specification || "No data"}</span>
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
                            {firstRow.create_date
                              ? format(
                                  parseISO(firstRow.create_date),
                                  "dd-MM-yyyy"
                                )
                              : format(new Date(), "dd-MM-yyyy")}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            ₹
                            {parseFloat(firstRow.total_price).toLocaleString(
                              "en-IN",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}
                          </td>
                          <td></td>
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
                              <td>{row.serial_number} </td>
                              <td
                                onDoubleClick={() =>
                                  handleDoubleClick(
                                    row.serial_number,
                                    row.sku_number_inventory
                                  )
                                }
                                style={{ cursor: "pointer" }}
                              >
                                <div className="remarks-edit-container">
                                  {editingSKU === row.serial_number ? (
                                    <>
                                      <input
                                        type="text"
                                        className="remarks-input"
                                        value={tempSKU}
                                        onChange={(e) =>
                                          handleSKUChange(e.target.value)
                                        }
                                        autoFocus
                                      />
                                      <button
                                        className="remarks-btn save-btn"
                                        onClick={() =>
                                          handleSaveSKU(row.serial_number)
                                        }
                                      >
                                        Save
                                      </button>
                                      <button
                                        className="remarks-btn cancel-btn"
                                        onClick={handleCancelEdit}
                                      >
                                        Cancel
                                      </button>
                                    </>
                                  ) : (
                                    <span
                                      style={{
                                        color:
                                          row.sku_number_inventory &&
                                          row.sku_number_inventory.trim() !== ""
                                            ? "black"
                                            : "gray",
                                      }}
                                    >
                                      {row.sku_number_inventory &&
                                      row.sku_number_inventory.trim() !== ""
                                        ? row.sku_number_inventory
                                        : "Not Available"}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td>{component.category || ""}</td>
                              <td>{component.component_type || ""}</td>
                              <td
                                className="specification-cell"
                                title={row.specification}
                              >
                                {row.specification || ""}
                              </td>
                              <td>{row.UOM || ""}</td>
                              <td>{row.vendor_name || ""}</td>
                              <td>
                                {row.create_date
                                  ? format(
                                      parseISO(row.create_date),
                                      "dd-MM-yyyy"
                                    )
                                  : format(new Date(), "dd-MM-yyyy")}
                              </td>
                              <td style={{ textAlign: "right" }}>
                                ₹
                                {parseFloat(row.total_price).toLocaleString(
                                  "en-IN",
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }
                                )}
                              </td>
                              <td>
                                {row.status}
                                {statusFilter === "Repair" &&
                                  row.status === "Repair" && (
                                    <button
                                      className="make-available-btn"
                                      onClick={() =>
                                        handleChangeStatusToAvailable(
                                          row.serial_number
                                        )
                                      }
                                    >
                                      Make Available
                                    </button>
                                  )}
                              </td>{" "}
                              <td
                                onDoubleClick={() =>
                                  handleDoubleClickRemarks(
                                    row.serial_number,
                                    row.remarks
                                  )
                                }
                                style={{ cursor: "pointer" }}
                              >
                                <div className="remarks-edit-container">
                                  {editingRemarks === row.serial_number ? (
                                    <>
                                      <input
                                        type="text"
                                        className="remarks-input"
                                        value={tempRemarks}
                                        onChange={(e) =>
                                          handleRemarksChange(e.target.value)
                                        }
                                        autoFocus
                                      />
                                      <button
                                        className="remarks-btn save-btn"
                                        onClick={() =>
                                          handleSaveRemarks(row.serial_number)
                                        }
                                      >
                                        Save
                                      </button>
                                      <button
                                        className="remarks-btn cancel-btn"
                                        onClick={handleCancelRemarks}
                                      >
                                        Cancel
                                      </button>
                                    </>
                                  ) : (
                                    <span
                                      style={{
                                        color:
                                          row.remarks &&
                                          row.remarks.trim() !== ""
                                            ? "black"
                                            : "gray",
                                      }}
                                    >
                                      {row.remarks && row.remarks.trim() !== ""
                                        ? row.remarks
                                        : "No data"}
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                      </React.Fragment>
                    );
                  })
              ) : (
                <tr>
                  <td
                    colSpan="11"
                    style={{ textAlign: "center", color: "gray" }}
                  >
                    {selectedTag.trim() ? (
                      <>
                        No results found for tag "<strong>{selectedTag}</strong>
                        "
                      </>
                    ) : fromDate && toDate ? (
                      <>
                        No data available from{" "}
                        <strong>{formatDate(fromDate)}</strong> to{" "}
                        <strong>{formatDate(toDate)}</strong>.
                      </>
                    ) : (
                      "No inventory data available."
                    )}
                  </td>
                </tr>
              )}

              {/* NO MORE DATA MESSAGE */}
              {!isLoadingMore &&
                !loading &&
                Object.keys(groupedData).length > 0 &&
                visibleInventory >= Object.keys(groupedData).length && (
                  <tr>
                    <td
                      colSpan="12"
                      style={{
                        textAlign: "center",
                        padding: "10px",
                        color: "#888",
                      }}
                    >
                      No more data to load.
                    </td>
                  </tr>
                )}

              {/* LOADING MORE SPINNER */}
              {isLoadingMore && (
                <tr>
                  <td
                    colSpan="11"
                    style={{
                      textAlign: "center",
                      padding: "10px",
                      color: "#555",
                    }}
                  >
                    Loading more...
                  </td>
                </tr>
              )}
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
                  <th>Team</th>
                  <th>Remarks</th>
                  <th>Create Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {/* Adding new tool row */}
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
                            quantity: parseInt(e.target.value) || 0,
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
                            in_inventory: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={newToolRow.team}
                        onChange={(e) =>
                          setNewToolRow({ ...newToolRow, team: e.target.value })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={newToolRow.remarks}
                        onChange={(e) =>
                          setNewToolRow({
                            ...newToolRow,
                            remarks: e.target.value,
                          })
                        }
                      />
                    </td>
                    <td style={{ textAlign: "center", color: "gray" }}>Auto</td>

                    <td className="event-buttons">
                      <button onClick={handleSaveToolRow}>Save</button>
                      <button onClick={() => setNewToolRow(null)}>
                        Cancel
                      </button>
                    </td>
                  </tr>
                )}

                {/* Existing tool rows with edit functionality */}
                {toolInventory.length > 0 ? (
                  toolInventory.map((tool, idx) =>
                    editingToolRow === tool.id ? (
                      <tr key={tool.id}>
                        <td>
                          <input
                            type="text"
                            value={editToolRowData.component_id}
                            onChange={(e) =>
                              setEditToolRowData({
                                ...editToolRowData,
                                component_id: e.target.value,
                              })
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={editToolRowData.tool_name}
                            onChange={(e) =>
                              setEditToolRowData({
                                ...editToolRowData,
                                tool_name: e.target.value,
                              })
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={editToolRowData.quantity}
                            onChange={(e) =>
                              setEditToolRowData({
                                ...editToolRowData,
                                quantity: parseInt(e.target.value) || 0,
                              })
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={editToolRowData.in_inventory}
                            onChange={(e) =>
                              setEditToolRowData({
                                ...editToolRowData,
                                in_inventory: parseInt(e.target.value) || 0,
                              })
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={editToolRowData.team}
                            onChange={(e) =>
                              setEditToolRowData({
                                ...editToolRowData,
                                team: e.target.value,
                              })
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={editToolRowData.remarks}
                            onChange={(e) =>
                              setEditToolRowData({
                                ...editToolRowData,
                                remarks: e.target.value,
                              })
                            }
                          />
                        </td>
                        <td>
                          {tool.created_at
                            ? format(new Date(tool.created_at), "dd-MM-yyyy")
                            : "N/A"}
                        </td>

                        <td className="event-buttons">
                          <button
                            onClick={handleUpdateToolRow}
                            className="edit-btn"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingToolRow(null)}
                            className="delete-btn"
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    ) : (
                      <tr key={tool.id}>
                        <td>{tool.component_id}</td>
                        <td>{tool.tool_name || "N/A"}</td>
                        <td>{tool.quantity || 0}</td>
                        <td>{tool.in_inventory || 0}</td>
                        <td>{tool.team || "0"}</td>
                        <td
                          className="specification-cell"
                          title={tool.remarks || ""}
                        >
                          {tool.remarks || "null"}
                        </td>
                        <td>
                          {tool.created_at
                            ? format(new Date(tool.created_at), "dd-MM-yyyy")
                            : "N/A"}
                        </td>

                        <td>
                          <button
                            onClick={() => {
                              setEditingToolRow(tool.id);
                              setEditToolRowData(tool);
                            }}
                            className="edit-btn"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    )
                  )
                ) : (
                  <tr>
                    <td
                      colSpan="11"
                      style={{ textAlign: "center", color: "gray" }}
                    >
                      {selectedTag.trim() ? (
                        <>
                          No results found for tag "
                          <strong>{selectedTag}</strong>"
                        </>
                      ) : fromDate && toDate ? (
                        <>
                          No tool data available from{" "}
                          <strong>{formatDate(fromDate)}</strong> to{" "}
                          <strong>{formatDate(toDate)}</strong>.
                        </>
                      ) : (
                        "No Tool Inventory data available."
                      )}
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
          right: 0; bottom: 0;background:rgba(0, 0, 0, 0.4);display: flex;justify-content: center;align-items: center;z-index: 9999;}

        .modal-content {background: #fff;padding: 20px 40px;border-radius: 8px;box-shadow: 0 0 12px rgba(0, 0, 0, 0.25);font-size: 15px;font-weight: bold;color: #333;}
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
      {showDateFilter && (
        <div className="modal-overlay" onClick={() => setShowDateFilter(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span
              className="x-button"
              style={{ fontWeight: "lighter" }}
              onClick={() => setShowDateFilter(false)}
            >
              &times;
            </span>

            <h4 style={{ marginTop: "20px", marginBottom: "10px" }}>
              Filter Date
            </h4>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
              className=""
            >
              <label style={{ whiteSpace: "nowrap" }}>From Date:</label>
              <div className="date-input-container">
                <DatePicker
                  selected={fromDate}
                  onChange={(date) => setFromDate(date)} // required to update the value
                  dateFormat="dd-MM-yyyy"
                  placeholderText="dd-mm-yyyy"
                  className="input1"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  popperPlacement="bottom"
                  portalId="datepicker-portal-target"
                  style={{ marginTop: "20px" }}
                />

                <i
                  className="fas fa-calendar-alt calendar-icon"
                  style={{ marginTop: "-4px" }}
                ></i>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <label style={{ whiteSpace: "nowrap" }}>To Date:</label>
              <div className="date-input-container">
                <DatePicker
                  selected={toDate}
                  onChange={(date) => setToDate(date)}
                  dateFormat="dd-MM-yyyy"
                  placeholderText="dd-mm-yyyy"
                  className="input1"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  popperPlacement="bottom-start"
                  portalId="datepicker-portal-target"
                />

                <i
                  className="fas fa-calendar-alt calendar-icon"
                  style={{ marginTop: "-4px" }}
                ></i>
              </div>
            </div>

            <div
              className="modal-actions"
              style={{
                marginTop: "10px",
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => {
                  filterByDate();
                  setShowDateFilter(false);
                }}
              >
                Apply
              </button>
              <button
                onClick={() => {
                  clearDateFilter();
                }}
              >
                Clear
              </button>
            </div>
          </div>
          <div id="datepicker-portal-target"></div>
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

        .react-datepicker__day,
        .react-datepicker__day-name {
          width: 2em;
          line-height: 2em;
        }

        .react-datepicker__current-month,
        .react-datepicker__header {
          font-size: 14px;
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
          padding: 15px; 
          width: 350px;
          text-align: center;
          position:absolute;
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
