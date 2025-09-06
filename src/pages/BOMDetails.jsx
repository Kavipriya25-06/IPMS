import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import config from "../Config"; // Import config for API endpoints
import DeleteIcon from "../assets/Delete.png"; //
import AddIcon from "../assets/Add.png";
import Back from "../assets/Back.png";
import { format, parseISO } from "date-fns";

import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  ToastContainerComponent,
} from "./Toastify.jsx"; // Import Toastify utilities
import { FaArrowLeft } from "react-icons/fa";
import { useAuth } from "../AuthContext.jsx";

//
const BOMDetails = () => {
  const { user, logout } = useAuth();
  const { bomId } = useParams(); // Retrieve bomId from URL
  const navigate = useNavigate(); // Initialize useNavigate
  const [selectedBom, setSelectedBom] = useState(null);
  const [selectedComponents, setSelectedComponents] = useState([]);
  const [showAddComponentForm, setShowAddComponentForm] = useState(false);
  const [searchText, setSearchText] = useState("");

  const [newComponent, setNewComponent] = useState({
    componentType: "",
    component: "",
    vendor: "",
    quantity: "",
    price: "",
    tax: "",
  });
  const [vendors, setVendors] = useState([]);
  const [components, setComponents] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [loadingComponents, setLoadingComponents] = useState(true);
  const [priceTables, setPriceTables] = useState([]);
  const [showLatestPrice, setShowLatestPrice] = useState(false);
  const [loading, setLoading] = useState(true);

  const [vendorMasterData, setVendorMasterData] = useState([]);

  // Sum of quantities in this BOM (same definition as Number of Components in the list)
  const totalQuantity = useMemo(
    () =>
      (selectedComponents || []).reduce(
        (sum, row) => sum + (Number(row?.quantity) || 0),
        0
      ),
    [selectedComponents]
  );

  // Fetch BOM details and related components
  useEffect(() => {
    const fetchBomDetails = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${config.apiBaseURL}/bom_list/`);
        const data = await response.json();
        const bom = data.find((b) => b.bom_id === bomId);
        setSelectedBom(bom);
      } catch (error) {
        console.error("Error fetching BOM details:", error);
      } finally {
        setLoading(false); // Stop loading after both calls
      }
    };

    const fetchBomComponents = async () => {
      try {
        const response = await fetch(`${config.apiBaseURL}/bom_master/`);
        const data = await response.json();
        const bomComponents = data.filter((b) => b.bom === bomId); // Filter components by BOM ID
        setSelectedComponents(bomComponents); // Store BOM components
      } catch (error) {
        console.error("Error fetching BOM components:", error);
      }
    };

    const fetchVendors = async () => {
      try {
        setLoadingVendors(true); // Set loading to true
        const response = await fetch(`${config.apiBaseURL}/vendor_list/`);
        const data = await response.json();
        setVendors(data); // Store the vendor list
      } catch (error) {
        console.error("Error fetching vendors:", error);
      } finally {
        setLoadingVendors(false); // Set loading to false
      }
    };

    const fetchVendorMaster = async () => {
      try {
        const response = await fetch(`${config.apiBaseURL}/vendor_master/`);
        const data = await response.json();
        setVendorMasterData(data);
      } catch (error) {
        console.error("Error fetching vendor master data:", error);
      }
    };

    const fetchComponents = async () => {
      try {
        setLoadingComponents(true);
        const response = await fetch(`${config.apiBaseURL}/component/`);
        const data = await response.json();
        setComponents(data);
      } catch (error) {
        console.error("Error fetching components:", error);
      } finally {
        setLoadingComponents(false);
      }
    };

    const fetchAllData = async () => {
      try {
        const [bomRes, bomMasterRes, vendorRes, componentRes, priceRes] =
          await Promise.all([
            fetch(`${config.apiBaseURL}/bom_list/`),
            fetch(`${config.apiBaseURL}/bom_master/`),
            fetch(`${config.apiBaseURL}/vendor_list/`),
            fetch(`${config.apiBaseURL}/component/`),
            fetch(`${config.apiBaseURL}/price_tables/`),
          ]);

        const [bomData, bomMasterData, vendorData, componentData, priceData] =
          await Promise.all([
            bomRes.json(),
            bomMasterRes.json(),
            vendorRes.json(),
            componentRes.json(),
            priceRes.json(),
          ]);

        setSelectedBom(bomData.find((b) => b.bom_id === bomId));
        setSelectedComponents(bomMasterData.filter((b) => b.bom === bomId));
        setVendors(vendorData);
        setComponents(componentData);
        setPriceTables(priceData);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoadingComponents(false);
        setLoadingVendors(false);
      }
    };

    // Fetch all data
    fetchBomDetails();
    fetchBomComponents();
    fetchVendors();
    fetchVendorMaster();
    fetchComponents();
    fetchAllData();
  }, [bomId]);

  const fmtINR = (n) =>
    `₹${(Number.isFinite(n) ? n : 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const getLatestPriceInfo = (componentObj, vendorObj) => {
    if (!componentObj || !vendorObj) return { price: "-", tax: "-", date: "-" };

    const { component_id } = componentObj;
    const { vendor_id } = vendorObj;

    // Find matching vendor master entry to get the product_id
    const vendorEntry = vendorMasterData.find(
      (entry) =>
        entry.component_id === component_id && entry.vendor === vendor_id
    );

    if (!vendorEntry) return { price: "-", tax: "-", date: "-" };

    const productId = vendorEntry.product_id;

    // Now find matching price table entry
    const prices = priceTables.filter((entry) => entry.product === productId);
    if (prices.length === 0) return { price: "-", tax: "-", date: "-" };

    const latest = prices.sort(
      (a, b) => new Date(b.current_time) - new Date(a.current_time)
    )[0];

    return {
      price: parseFloat(latest.price),
      tax: parseFloat(latest?.tax ?? 0),
      date: format(parseISO(latest.current_time), "dd-MM-yyyy"),
    };
  };

  const handleAddComponent = async () => {
    try {
      const exists = selectedComponents.some(
        (component) =>
          component.component.component_id === newComponent.component
      );

      if (exists) {
        showWarningToast("This component is already added to the BOM.");
        return;
      }

      if (
        !newComponent.component ||
        !newComponent.vendor ||
        !newComponent.quantity
      ) {
        showInfoToast("All fields are required.");
        return;
      }

      // Step 1: Get matching vendor_master entry for component and vendor
      const matchedEntry = vendorMasterData.find(
        (entry) =>
          entry.component_id === newComponent.component &&
          entry.vendor === newComponent.vendor
      );

      if (!matchedEntry) {
        showInfoToast("No vendor entry found for the selected component.");
        return;
      }

      const productId = matchedEntry.product_id;

      // Step 2: Get latest price info for the product
      const matchingPrices = priceTables.filter(
        (entry) => entry.product === productId
      );
      const latestPriceEntry = matchingPrices.sort(
        (a, b) => new Date(b.current_time) - new Date(a.current_time)
      )[0];

      if (!latestPriceEntry) {
        showInfoToast("No price data found for this component.");
        return;
      }

      const latestDate = latestPriceEntry.current_time.split("T")[0];

      const payload = {
        bom: bomId,
        component: newComponent.component,
        vendor: newComponent.vendor,
        quantity: newComponent.quantity,
        price: latestPriceEntry.price,
        tax: latestPriceEntry.tax,
        date: latestDate,
      };

      const response = await fetch(`${config.apiBaseURL}/bom_master/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        showSuccessToast("Component added successfully!");
        const refreshed = await fetch(`${config.apiBaseURL}/bom_master/`);
        const updated = await refreshed.json();
        setSelectedComponents(updated.filter((b) => b.bom === bomId));
        setShowAddComponentForm(false);
        setNewComponent({
          component: "",
          quantity: "",
          vendor: "",
          price: "",
          tax: "",
        });
      } else {
        const error = await response.json();
        showErrorToast`Failed to add component: ${JSON.stringify(error)}`;
      }
    } catch (error) {
      console.error("Error adding component:", error);
    }
  };

  const handleDeleteComponent = async (bomComponentId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this component from the BOM?"
      )
    )
      return;

    try {
      const response = await fetch(
        `${config.apiBaseURL}/bom_master/${bomComponentId}/`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        showSuccessToast("Component deleted successfully.");
        setSelectedComponents((prev) =>
          prev.filter((component) => component.id !== bomComponentId)
        );
      } else {
        showErrorToast("Failed to delete component.");
      }
    } catch (error) {
      console.error("Error deleting component:", error);
      showErrorToast("An error occurred while deleting.");
    }
  };
  const calculateTotalPrice = (useLatest = false) => {
    let baseTotal = 0;
    let totalTaxAmount = 0;

    selectedComponents.forEach((row) => {
      const qty = parseFloat(row.quantity || 0);

      let unitPrice = parseFloat(row.price || 0);
      let taxRate = parseFloat(row.tax || 0);

      if (useLatest) {
        const latest = getLatestPriceInfo(row.component, row.vendor);
        if (Number.isFinite(latest.price)) unitPrice = latest.price;
        if (Number.isFinite(latest.tax)) taxRate = latest.tax;
      }

      const base = unitPrice * qty;
      const taxAmount = (base * taxRate) / 100;

      baseTotal += base;
      totalTaxAmount += taxAmount;
    });

    return {
      baseTotal,
      totalTaxAmount,
      grandTotal: baseTotal + totalTaxAmount,
    };
  };

  ///

  const handleShowLatestPrice = (productId) => {
    const matchingPrices = priceTables.filter((p) => p.product === productId);
    if (matchingPrices.length === 0) {
      showWarningToast("No price entry found for this component.");
      return;
    }

    const latest = matchingPrices.sort(
      (a, b) => new Date(b.current_time) - new Date(a.current_time)
    )[0];

    const formattedDate = new Date(latest.current_time).toLocaleDateString(
      "en-IN"
    );

    showInfoToast(
      `Latest Price: ₹${latest.price}, Tax: ${latest.tax}%, Date: ${formattedDate}`
    );
  };

  const generateCSV = (data, totals, filename = "BOM_Report") => {
    const headers = [
      "S.No",
      "Category",
      "Component Type",
      "Specification",
      "UOM",
      "Quantity",
      "Vendor",
      "Date",
      "Price",
      "Tax",
      "Latest Price",
      "Latest Date",
    ];

    // Convert each row to CSV format and escape quotes
    const rows = data.map((item) =>
      headers
        .map((h) => `"${String(item[h] ?? "").replace(/"/g, '""')}"`)
        .join(",")
    );

    // Add an empty row and total summary rows
    const totalRows = [
      [], // Empty row for separation
      [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "Total Base Price:", // up to column 6
        `₹${totals.baseTotal}`,
        "",
        "",
        "", // base total at column 7
      ],
      [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "Total Tax (GST):",
        `₹${totals.totalTax}`,
        "",
        "",
        "",
      ],
      [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "Grand Total:",
        `₹${totals.grandTotal}`,
        "",
        "",
        "",
      ],
    ].map((row) => row.join(","));

    const csvContent = [headers.join(","), ...rows, ...totalRows].join("\n");

    // Add BOM to ensure Excel renders ₹ correctly
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerateReport = () => {
    if (!selectedComponents || selectedComponents.length === 0) {
      showInfoToast("No components selected for report.");
      return;
    }

    const data = selectedComponents.map((component, index) => {
      const { price, tax, date } = getLatestPriceInfo(
        component.component,
        component.vendor
      );

      return {
        "S.No": index + 1,
        Category: component.component.category,
        "Component Type": component.component.component_type,
        Specification: component.component.component_specification,
        UOM: component.component.unit_of_measurement,
        Quantity: component.quantity,
        Vendor: component.vendor.vendor_name,
        Date: component.date
          ? format(parseISO(component.date), "dd-MM-yyyy")
          : "-",
        Price: `₹${parseFloat(component.price || 0).toFixed(2)}`,
        Tax: `${component.tax}%`,
        "Latest Price": showLatestPrice
          ? `₹${parseFloat(price || 0).toFixed(2)}`
          : "",
        "Latest Date": showLatestPrice && date ? date : "",
      };
    });

    const { baseTotal, totalTaxAmount, grandTotal } = calculateTotalPrice();

    generateCSV(data, {
      baseTotal: baseTotal.toFixed(2),
      totalTax: totalTaxAmount.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
    });
  };

  if (loading)
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <div className="spinner"></div>
        Loading BOM Details...
      </div>
    );

  // if (noData) return <p>No information available for this BOM</p>;

  ///
  return (
    <div style={{ padding: "20px" }}>
      {selectedBom && (
        <>
          <div className="header-back">
            <button
              className="back-btn"
              onClick={() => navigate(-1)}
              title="Back to BOM List"
            >
              <FaArrowLeft />
            </button>
            <h3>Selected BOM: {selectedBom.bom_name}</h3>
          </div>{" "}
          <p>
            <strong>BOM ID:</strong> {selectedBom.bom_id}
          </p>
          {selectedBom.wbom && (
            <p style={{ color: "gray", marginTop: "10px" }}>
              This is a Final BOM. Components cannot be added or removed.
            </p>
          )}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            {user?.role !== "Finance" && (
              <button
                onClick={() => {
                  if (!selectedBom.wbom) setShowAddComponentForm(true);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: selectedBom.wbom ? "not-allowed" : "pointer",
                  padding: "4px",
                  opacity: selectedBom.wbom ? 0.5 : 1,
                }}
                title={
                  selectedBom.wbom
                    ? "Cannot add component in Final BOM"
                    : "Add New Component"
                }
                disabled={selectedBom.wbom}
              >
                <img
                  src={AddIcon}
                  alt="Add"
                  style={{ width: "20px", height: "20px" }}
                />
              </button>
            )}
          </div>
          {!selectedBom.wbom && showAddComponentForm && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h4>Add New Component</h4>
                <div className="form-grid">
                  <label>Component Type</label>
                  <select
                    value={newComponent.componentType || ""}
                    onChange={(e) => {
                      const selectedType = e.target.value;
                      setNewComponent({
                        ...newComponent,
                        componentType: selectedType,
                        component: "",
                        vendor: "",
                      });
                    }}
                  >
                    <option value="">Select Component Type</option>
                    {Array.from(
                      new Set(components.map((c) => c.component_type))
                    ).map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>

                  <label>Specification</label>
                  <select
                    value={newComponent.component}
                    onChange={async (e) => {
                      const componentId = e.target.value;
                      const selectedComp = components.find(
                        (comp) => comp.component_id === componentId
                      );

                      setNewComponent((prev) => ({
                        ...prev,
                        component: componentId,
                        vendor: "",
                        price: "",
                        tax: "",
                      }));

                      if (selectedComp) {
                        try {
                          setLoadingVendors(true);
                          const response = await fetch(
                            `${config.apiBaseURL}/vendor_list/`
                          );
                          const allVendors = await response.json();
                          const matchedVendor = allVendors.find(
                            (vendor) =>
                              vendor.vendor_id === selectedComp.vendor_id
                          );

                          const productId = selectedComp.product_id;
                          const matchingPrices = priceTables.filter(
                            (p) => p.product === productId
                          );
                          const latestPriceEntry = matchingPrices.sort(
                            (a, b) =>
                              new Date(b.current_time) -
                              new Date(a.current_time)
                          )[0];

                          setNewComponent((prev) => ({
                            ...prev,
                            vendor: matchedVendor?.vendor_id || "",
                            price: latestPriceEntry?.price || "",
                            tax: latestPriceEntry?.tax?.toString() || "",
                          }));

                          // if (matchedVendor) setVendors([matchedVendor]);
                          // else setVendors([]);
                        } catch (error) {
                          console.error(
                            "Error processing vendor/price info:",
                            error
                          );
                          setVendors([]);
                        } finally {
                          setLoadingVendors(false);
                        }
                      }
                    }}
                  >
                    <option value="">Select Specification</option>
                    {components
                      .filter(
                        (comp) =>
                          comp.component_type === newComponent.componentType
                      )
                      .map((comp) => (
                        <option
                          key={comp.component_id}
                          value={comp.component_id}
                        >
                          {comp.component_specification}
                        </option>
                      ))}
                  </select>

                  <label>Quantity</label>
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={newComponent.quantity}
                    onChange={(e) =>
                      setNewComponent({
                        ...newComponent,
                        quantity: e.target.value,
                      })
                    }
                  />

                  <label>Vendor</label>
                  <select
                    value={newComponent.vendor}
                    onChange={(e) => {
                      const vendorId = e.target.value;
                      const componentId = newComponent.component;

                      setNewComponent((prev) => ({
                        ...prev,
                        vendor: vendorId,
                        price: "",
                        tax: "",
                      }));

                      if (componentId && vendorId) {
                        const matchedEntry = vendorMasterData.find(
                          (entry) =>
                            entry.component_id === componentId &&
                            entry.vendor === vendorId
                        );

                        if (!matchedEntry) {
                          showWarningToast(
                            "No matching vendor entry found for this component."
                          );
                          return;
                        }

                        const productId = matchedEntry.product_id;

                        const matchingPrices = priceTables
                          .filter((p) => p.product === productId)
                          .sort(
                            (a, b) =>
                              new Date(b.current_time) -
                              new Date(a.current_time)
                          );

                        const latest = matchingPrices[0];

                        if (!latest) {
                          showWarningToast(
                            "No price found for this vendor-product match."
                          );
                          return;
                        }

                        setNewComponent((prev) => ({
                          ...prev,
                          price: latest.price,
                          tax: latest.tax?.toString(),
                        }));
                      }
                    }}
                  >
                    <option value="">Select Vendor</option>
                    {vendorMasterData
                      .filter(
                        (v) =>
                          v.component_type === newComponent.componentType &&
                          v.component_id === newComponent.component
                      )
                      .map((v) => {
                        const vendorName =
                          vendors.find((ven) => ven.vendor_id === v.vendor)
                            ?.vendor_name || "Unnamed Vendor";
                        return (
                          <option key={v.product_id} value={v.vendor}>
                            {vendorName}
                          </option>
                        );
                      })}
                  </select>

                  <label>Price</label>
                  <input
                    type="text"
                    value={newComponent.price}
                    readOnly
                    placeholder="Auto-filled based on vendor"
                  />
                </div>

                <div className="modal-actions">
                  <button onClick={handleAddComponent}>Submit</button>
                  <button onClick={() => setShowAddComponentForm(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          <div className="price-button-wrapper">
            <button
              onClick={() => setShowLatestPrice(true)}
              className="show-latest-price-btn"
              title="Show Latest Price Info"
            >
              Show Latest Price Info
            </button>

            <button
              className="generate-report-btn"
              onClick={handleGenerateReport}
            >
              Generate Report
            </button>
          </div>
          {/* <h4>Components:</h4> */}
          <div className="table-container">
            <table
              border="1"
              style={{ width: "100%", borderCollapse: "collapse" }}
            >
              <thead>
                <tr>
                  <th>Component ID</th>
                  <th>Category</th>
                  <th>Component Type</th>
                  <th>Specification</th>
                  <th>UOM</th>
                  <th>Quantity</th>
                  <th>Vendor</th>
                  <th>Date</th>
                  <th>Price</th>
                  <th>Tax</th>
                  <th style={{ backgroundColor: "#82817f" }}>
                    Latest Date
                  </th>{" "}
                  <th style={{ backgroundColor: "#82817f" }}>Latest Price</th>{" "}
                  {/* New column */}
                  <th style={{ backgroundColor: "#82817f" }}>Latest Tax</th>
                  {/* New column */}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {selectedComponents.map((component, index) => {
                  const { price, tax, date } = getLatestPriceInfo(
                    component.component,
                    component.vendor
                  );

                  return (
                    <tr key={index}>
                      <td>
                        <Link
                          to={`/components/${component.component.component_id}`}
                          style={{
                            textDecoration: "underline",
                            color: "inherit",
                          }}
                          title={`Open ${component.component.component_id} in CDP`}
                        >
                          {component.component.component_id}
                        </Link>
                      </td>
                      <td>{component.component.category}</td>
                      <td>{component.component.component_type}</td>
                      <td
                        className="specification-cell"
                        title={component.component.component_specification}
                      >
                        {component.component.component_specification}
                      </td>
                      <td>{component.component.unit_of_measurement}</td>
                      <td>{component.quantity}</td>
                      <td className="specification-cell">
                        {component.vendor.vendor_name}
                      </td>
                      <td>
                        {component.date
                          ? format(parseISO(component.date), "dd-MM-yyyy")
                          : "-"}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        ₹
                        {parseFloat(component.price || 0).toLocaleString(
                          "en-IN",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </td>
                      <td>{component.tax}%</td>
                      <td>{showLatestPrice ? date : ""}</td>
                      <td style={{ textAlign: "right" }}>
                        {showLatestPrice
                          ? `₹${parseFloat(price || 0).toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}`
                          : ""}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {showLatestPrice
                          ? `${Number.isFinite(tax) ? tax : 0}%`
                          : ""}
                      </td>
                      <td>
                        <button
                          style={{
                            border: "none",
                            background: "transparent",
                            padding: "5px",
                            cursor: selectedBom.wbom
                              ? "not-allowed"
                              : "pointer",
                            opacity: selectedBom.wbom ? 0.5 : 1,
                          }}
                          onClick={() => {
                            if (!selectedBom.wbom) {
                              handleDeleteComponent(component.id);
                            }
                          }}
                          title={
                            selectedBom.wbom
                              ? "Cannot delete component in Final BOM"
                              : "Delete Component"
                          }
                          disabled={selectedBom.wbom}
                        >
                          <img
                            src={DeleteIcon}
                            alt="Delete"
                            style={{ width: "20px", height: "20px" }}
                          />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                {(() => {
                  const { baseTotal, totalTaxAmount, grandTotal } =
                    calculateTotalPrice(false);
                  const latestTotals = calculateTotalPrice(true);
                  const cell = { textAlign: "right", fontWeight: "bold" };

                  return (
                    <>
                      {/* Row 1: Quantity + Base Price (+ latest base price on the right) */}
                      <tr>
                        <td colSpan="5" style={cell}>
                          Total Quantity:
                        </td>
                        <td colSpan="1" style={cell}>
                          {totalQuantity.toLocaleString("en-IN")}
                        </td>
                        <td colSpan="2" style={cell}>
                          Total Base Price:
                        </td>
                        <td colSpan="1" style={cell}>
                          {fmtINR(baseTotal)}
                        </td>

                        {showLatestPrice ? (
                          <>
                            {/* under Latest Date + Latest Price */}
                            <td colSpan="2" style={cell}>
                              Total Base Price (Latest):
                            </td>
                            {/* under Latest Tax */}
                            <td style={cell}>
                              {fmtINR(latestTotals.baseTotal)}
                            </td>
                          </>
                        ) : (
                          <>
                            <td colSpan="2" />
                            <td />
                          </>
                        )}

                        {/* Actions col to keep grid/borders intact */}
                        <td />
                      </tr>

                      {/* Row 2: Tax */}
                      <tr>
                        <td colSpan="8" style={cell}>
                          Total Tax (GST):
                        </td>
                        <td colSpan="1" style={cell}>
                          {fmtINR(totalTaxAmount)}
                        </td>

                        {showLatestPrice ? (
                          <>
                            <td colSpan="2" style={cell}>
                              Total Tax (GST) (Latest):
                            </td>
                            <td style={cell}>
                              {fmtINR(latestTotals.totalTaxAmount)}
                            </td>
                          </>
                        ) : (
                          <>
                            <td colSpan="2" />
                            <td />
                          </>
                        )}

                        <td />
                      </tr>

                      {/* Row 3: Grand total */}
                      <tr>
                        <td colSpan="8" style={cell}>
                          Grand Total (Price + GST):
                        </td>
                        <td colSpan="1" style={cell}>
                          {fmtINR(grandTotal)}
                        </td>

                        {showLatestPrice ? (
                          <>
                            <td colSpan="2" style={cell}>
                              Grand Total (Price + GST) (Latest):
                            </td>
                            <td style={cell}>
                              {fmtINR(latestTotals.grandTotal)}
                            </td>
                          </>
                        ) : (
                          <>
                            <td colSpan="2" />
                            <td />
                          </>
                        )}

                        <td />
                      </tr>
                    </>
                  );
                })()}
              </tfoot>
            </table>
          </div>
        </>
      )}

      <ToastContainerComponent />
    </div>
  );
};

export default BOMDetails;
