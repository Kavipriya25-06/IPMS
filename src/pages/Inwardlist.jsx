import React, { useEffect, useState } from "react";
import CustomMessagebox from "./CustomMessageBox.jsx";
import config from "../Config";
import { useNavigate } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";
import Filter from "../assets/Filter_icon.svg";
import { useAuth } from "../AuthContext";

import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  ToastContainerComponent,
} from "./Toastify.jsx"; // Import Toastify utilities

const Inwardlist = () => {
  const [inwardData, setInwardData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Filters
  const [poIdFilter, setPoIdFilter] = useState("");
  const [vendorNameFilter, setVendorNameFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const [editingIndex, setEditingIndex] = useState(null);
  const [invoiceNumberInput, setInvoiceNumberInput] = useState("");
  const [invoiceDateInput, setInvoiceDateInput] = useState("");
  const [filterDate, setFilterDate] = useState(null);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nameFilter, setNameFilter] = useState("");
  const { user } = useAuth();

  const navigate = useNavigate();

  // Utility function to safely access nested fields
  const getNestedValue = (obj, keyPath, defaultValue = "Not Available") => {
    try {
      return (
        keyPath.split(".").reduce((acc, key) => acc && acc[key], obj) ||
        defaultValue
      );
    } catch {
      return defaultValue;
    }
  };

  const fetchInwardData = async () => {
    try {
      // 1) Get ALL inward rows (do NOT filter by mode_to_inventory here)
      setLoading(true);
      const [inwardRes, deliveryRes] = await Promise.all([
        fetch(`${config.apiBaseURL}/inward/`),
        fetch(`${config.apiBaseURL}/po_delivery/`),
      ]);
      const allInward = await inwardRes.json();
      const deliveryData = await deliveryRes.json();

      // 2) Group by PO + Component
      const grouped = new Map();

      allInward.forEach((item) => {
        const poId = getNestedValue(item, "po_master.PO_id", "");
        const componentId = getNestedValue(
          item,
          "po_master.cart.component_id",
          ""
        );
        const key = `${poId}_${componentId}`;

        if (!grouped.has(key)) {
          grouped.set(key, {
            ...item,
            // we'll treat these more clearly:
            quantity: 0, // Pending qty (mode_to_inventory === true)
            movedQuantity: 0, // Already moved/outward (mode_to_inventory === false)
            totalQuantity: 0, // From po_delivery
            totalPrice: 0,
            gst: item.gst || 0,
          });
        }

        const g = grouped.get(key);
        if (item.mode_to_inventory) g.quantity += 1;
        else g.movedQuantity += 1;

        g.totalPrice += item.price || 0;
        grouped.set(key, g);
      });

      // 3) Fill totalQuantity from po_delivery (sum of all received_quantity)
      grouped.forEach((g) => {
        const poKey = String(getNestedValue(g, "po_master.PO_id", ""));
        const compKey = String(
          getNestedValue(g, "po_master.cart.component_id", "")
        );
        g.totalQuantity = deliveryData
          .filter(
            (d) =>
              String(d.PO_id) === poKey && String(d.component_id) === compKey
          )
          .reduce((sum, d) => sum + Number(d.received_quantity || 0), 0);
      });
      const groupedData = Array.from(grouped.values());

      // IMPORTANT: don't filter out rows with quantity === 0
      setInwardData(groupedData);
      setFilteredData(groupedData);
    } catch (err) {
      console.error("Error fetching inward data:", err);
    } finally {
      setLoading(false); // Stop loading after both calls
    }
  };

  useEffect(() => {
    fetchInwardData();
  }, []);

  useEffect(() => {
    const container = document.getElementById("inward-table-wrapper");

    const handleScroll = () => {
      if (container.scrollTop > 200) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const scrollToTop = () => {
    const container = document.getElementById("inward-table-wrapper");
    if (container) {
      container.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const calculateGrandTotal = (unitPrice, totalQuantity, gst) => {
    const subtotal = unitPrice * totalQuantity;
    const gstAmount = subtotal * (gst / 100);
    return subtotal + gstAmount;
  };

  const CustomDateInput = React.forwardRef(({ value, onClick }, ref) => (
    <div
      onClick={onClick}
      ref={ref}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        border: "1px solid #ccc",
        padding: "4px 6px",
        borderRadius: "4px",
        cursor: "pointer",
        width: "100%",
        maxWidth: "120px", // keeps inside cell
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        backgroundColor: "#fff",
        boxSizing: "border-box", // prevent overflow from padding
      }}
    >
      <span
        style={{
          flex: 1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          fontSize: "12px",
          whiteSpace: "nowrap",
        }}
      >
        {value || "dd-mm-yyyy"}
      </span>
      <FaCalendarAlt
        style={{ color: "#333", marginLeft: "6px", flexShrink: 0 }}
      />
    </div>
  ));

  const updateInvoiceForPO = async (poId, invoiceNumber, invoiceDate) => {
    if (!invoiceNumber && !invoiceDate) {
      showWarningToast("Invoice Number and Invoice Date are required");
      return;
    }
    if (!invoiceNumber) {
      showWarningToast("Invoice Number is required");
      return;
    }
    if (!invoiceDate) {
      showWarningToast("Invoice Date is required");
      return;
    }

    // 🔹 Optimistically update state immediately
    const updatedData = inwardData.map((item) => {
      if (item.po_master?.PO_id === poId) {
        return {
          ...item,
          invoice_number: invoiceNumber,
          invoice_date: invoiceDate,
        };
      }
      return item;
    });
    setInwardData(updatedData);
    setFilteredData(updatedData);

    try {
      // 🔹 Get only matching inward IDs from existing state
      const matchingInwards = inwardData.filter(
        (item) => item.po_master?.PO_id === poId
      );

      // 🔹 Send PATCH requests in parallel, but don’t block UI
      await Promise.allSettled(
        matchingInwards.map((item) =>
          fetch(`${config.apiBaseURL}/inward/${item.inward_id}/`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              invoice_number: invoiceNumber,
              invoice_date: invoiceDate,
            }),
          })
        )
      );

      showSuccessToast("Invoice details updated.");
    } catch (err) {
      console.error("Update error:", err);
      showErrorToast("Failed to update invoice details");
    }
  };

  const generateInwardReport = () => {
    if (!filteredData || filteredData.length === 0) {
      showInfoToast("No data available to export.");
      return;
    }

    const formatDate = (val) =>
      val ? new Date(val).toLocaleDateString("en-GB") : "-";

    const formatCurrency = (value) =>
      value ? `₹${parseFloat(value).toFixed(2)}` : "-";

    const formatGST = (gst) =>
      gst % 1 === 0 ? `${parseInt(gst)}%` : `${parseFloat(gst)}%`;

    const calculateGrandTotal = (unitPrice, qty, gst) => {
      const total = (parseFloat(unitPrice) || 0) * (parseInt(qty) || 0);
      const gstAmount = (total * (parseFloat(gst) || 0)) / 100;
      return total + gstAmount;
    };

    const getNestedValue = (obj, path, defaultVal = "-") => {
      return (
        path.split(".").reduce((acc, part) => acc?.[part], obj) ?? defaultVal
      );
    };

    const formattedData = filteredData.map((item, index) => {
      const price = item.price || 0;
      const quantity = item.quantity || 0;
      const totalQuantity = item.totalQuantity || 0;
      const gst = item.gst || 0;

      return {
        "S.No": index + 1,
        PO_ID: getNestedValue(item, "po_master.PO_id"),
        "Component ID": getNestedValue(item, "po_master.cart.component_id"),
        "Component Specification": getNestedValue(
          item,
          "po_master.cart.component_specification"
        ),
        "Vendor Name": getNestedValue(item, "po_master.cart.vendor_name"),
        Date: formatDate(item.date),
        "Invoice No": item.invoice_number || "-",
        "Invoice Date": formatDate(item.invoice_date),
        Quantity: quantity,
        TotalQuantity: totalQuantity,
        "Unit Price": formatCurrency(price),
        GST: formatGST(gst),
        "Grand Total": formatCurrency(
          calculateGrandTotal(price, totalQuantity, gst)
        ),
      };
    });

    generateCSV(formattedData, "Inward_Report");
  };

  const generateCSV = (data, filename) => {
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((row) =>
      Object.values(row)
        .map((val) => `"${val}"`)
        .join(",")
    );
    const csvContent = [headers, ...rows].join("\n");

    // Add UTF-8 BOM for Excel to recognize ₹ and other characters correctly
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const filteredByDate =
    fromDate && toDate
      ? filteredData.filter((item) => {
          if (!item.date) return false;
          const itemDate = new Date(item.date);
          return itemDate >= fromDate && itemDate <= toDate;
        })
      : filteredData;

  useEffect(() => {
    if (fromDate && toDate) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [fromDate, toDate]);

  useEffect(() => {
    if (filterDate) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [filterDate]);

  const formatPrice = (value) => {
    if (value == null || value === "") return "-";

    const strVal = value.toString();

    if (strVal.includes(".")) {
      const [intPart, fracPart] = strVal.split(".");

      // Case 1: fractional part is all zeros → return .00
      if (/^0+$/.test(fracPart)) {
        return `${intPart}.00`;
      }

      // Case 2: keep fractional part exactly as is
      return `${intPart}.${fracPart}`;
    }

    // Case 3: no decimal → add .00
    return `${strVal}.00`;
  };

  const displayedData = filteredByDate.filter((item) => {
    const poId = getNestedValue(item, "po_master.PO_id", "").toLowerCase();
    const vendorName = getNestedValue(
      item,
      "po_master.cart.vendor_name",
      ""
    ).toLowerCase();

    if (!nameFilter) return true; // no filter
    return (
      poId.includes(nameFilter.toLowerCase()) ||
      vendorName.includes(nameFilter.toLowerCase())
    );
  });

  // Utility function
  const formatUnitPrice = (value) => {
    if (value == null) return "-";
    const num = parseFloat(value);

    // If it has more than 2 decimals
    if (Number.isInteger(num * 100)) {
      return num.toFixed(2); // exactly 2 decimals
    }

    // Else, keep up to 3 decimals (remove trailing zeros automatically)
    return parseFloat(num.toFixed(2));
  };

  return (
    <div>
      <div className="header">
        <h2>Inward</h2>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {(fromDate || toDate) && (
            <div style={{ fontSize: "14px", margin: "10px 0", color: "#555" }}>
              🗓️ {fromDate && `From: ${format(fromDate, "dd-MM-yyyy")}`}
              {fromDate && toDate && " | "}
              {toDate && `To: ${format(toDate, "dd-MM-yyyy")}`}
              <button
                className="clear-date-button"
                onClick={() => {
                  setFromDate(null);
                  setToDate(null);
                }}
                title="Clear Date Filter"
              >
                Clear
              </button>
            </div>
          )}

          <div style={{ position: "relative", display: "inline-block" }}>
            <button
              style={{
                cursor: "pointer",
                background: "transparent",
                border: "none",
                padding: "0",
              }}
              title="Filter by Date"
              onClick={() => setShowDateFilter((prev) => !prev)}
            >
              <img
                src={Filter}
                alt="Filter"
                style={{ width: "25px", height: "30px" }}
              />
            </button>
          </div>

          <button
            className="generate-report-btn"
            onClick={generateInwardReport}
          >
            Generate Report
          </button>
        </div>
      </div>
      <div class="center-wrapper">
        <div className="search-bar-container">
          <input
            type="text"
            placeholder="Filter by PO-ID  or Vendor Name"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="search-bar"
          />
          <span className="search-icon">
            <i className="fa fa-search" aria-hidden="true"></i>
          </span>
        </div>
      </div>

      <div id="inward-table-wrapper" className="table-container">
        <table>
          <thead>
            <tr>
              <th>PO_ID</th>
              <th>Component ID</th>
              <th>Component Specification</th>
              <th>Vendor Name</th>
              <th>Date</th>
              <th>Invoice No</th>
              <th>Invoice Date</th>
              <th>Total Qty</th>
              <th style={{ textAlign: "right" }}>Quantity</th>
              <th style={{ textAlign: "right" }}>Unit Price</th>
              <th style={{ textAlign: "right" }}>GST</th>
              <th style={{ textAlign: "right" }}>Grand Total</th>
              {user?.role !== "Procurement" && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="13"
                  style={{ textAlign: "center", padding: "10px" }}
                >
                  <div className="spinner"></div>
                  Loading Inward Data...
                </td>
              </tr>
            ) : filteredByDate.length === 0 && fromDate && toDate ? (
              <tr>
                <td
                  colSpan="13"
                  style={{
                    textAlign: "center",
                    color: "gray",
                    padding: "10px",
                  }}
                >
                  No data for selected date range:{" "}
                  {format(fromDate, "dd-MM-yyyy")} to{" "}
                  {format(toDate, "dd-MM-yyyy")}{" "}
                </td>
              </tr>
            ) : displayedData.length === 0 && nameFilter ? (
              <tr>
                <td
                  colSpan="13"
                  style={{
                    textAlign: "center",
                    color: "gray",
                    padding: "10px",
                  }}
                >
                  No data for your search: "{nameFilter}"
                </td>
              </tr>
            ) : displayedData.length === 0 ? (
              <tr>
                <td
                  colSpan="13"
                  style={{
                    textAlign: "center",
                    color: "gray",
                    padding: "10px",
                  }}
                >
                  No inward data available.
                </td>
              </tr>
            ) : (
              displayedData.map((item, index) => (
                <tr key={index}>
                  <td>{getNestedValue(item, "po_master.PO_id")}</td>
                  <td>{getNestedValue(item, "po_master.cart.component_id")}</td>
                  <td
                    className="specification-cell"
                    title={item.po_master.cart.component_specification}
                  >
                    {getNestedValue(
                      item,
                      "po_master.cart.component_specification"
                    )}
                  </td>
                  <td
                    className="specification-cell"
                    title={item.po_master.cart.vendor_name}
                  >
                    {getNestedValue(item, "po_master.cart.vendor_name")}
                  </td>
                  <td>
                    {item.date
                      ? format(new Date(item.date), "dd-MM-yyyy")
                      : "-"}
                  </td>
                  <td>
                    {editingIndex === index ? (
                      <input
                        type="text"
                        value={invoiceNumberInput}
                        onChange={(e) => setInvoiceNumberInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            updateInvoiceForPO(
                              item.po_master.PO_id,
                              invoiceNumberInput,
                              invoiceDateInput
                            );
                            setEditingIndex(null);
                          }
                        }}
                        placeholder="Enter Invoice No"
                        style={{
                          width: "100%",
                          border: "1px solid #ccc",
                          borderRadius: "3px",
                          padding: "4px",
                          marginLeft: "-5px",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{ flex: 1 }}
                          className="specification-cell"
                          title={item.invoice_number}
                        >
                          {item.invoice_number || "-"}
                        </span>
                        {user?.role !== "Procurement" && (
                          <FaEdit
                            onClick={() => {
                              setEditingIndex(index);
                              setInvoiceNumberInput(item.invoice_number || "");
                              setInvoiceDateInput(
                                item.invoice_date
                                  ? item.invoice_date.slice(0, 10)
                                  : ""
                              );
                            }}
                            style={{ marginLeft: "8px", cursor: "pointer" }}
                          />
                        )}
                      </div>
                    )}
                  </td>

                  <td
                    style={{
                      minWidth: "110px",
                      maxWidth: "130px",
                      overflow: "hidden",
                    }}
                  >
                    {editingIndex === index ? (
                      <DatePicker
                        selected={
                          invoiceDateInput ? new Date(invoiceDateInput) : null
                        }
                        onChange={(date) => {
                          const formattedDate = format(date, "yyyy-MM-dd"); // stays in local timezone
                          setInvoiceDateInput(formattedDate);
                          updateInvoiceForPO(
                            item.po_master.PO_id,
                            invoiceNumberInput,
                            formattedDate
                          );
                          setEditingIndex(null);
                        }}
                        dateFormat="dd-MM-yyyy"
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select"
                        customInput={<CustomDateInput />}
                        wrapperClassName="date-picker-wrapper"
                      />
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          width: "100%",
                          maxWidth: "130px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        <span>
                          {item.invoice_date
                            ? format(new Date(item.invoice_date), "dd-MM-yyyy")
                            : "-"}
                        </span>
                        {user?.role !== "Procurement" && (
                          <FaEdit
                            onClick={() => {
                              setEditingIndex(index);
                              setInvoiceNumberInput(item.invoice_number || "");
                              setInvoiceDateInput(
                                item.invoice_date
                                  ? item.invoice_date.slice(0, 10)
                                  : ""
                              );
                            }}
                            style={{ cursor: "pointer", flexShrink: 0 }}
                          />
                        )}
                      </div>
                    )}
                  </td>

                  <td style={{ textAlign: "right" }}>{item.totalQuantity}</td>
                  <td style={{ textAlign: "right" }}>{item.quantity}</td>
                  <td style={{ textAlign: "right" }} title={`₹${item.price}`}>
                    ₹{formatUnitPrice(item.price)}
                  </td>

                  <td style={{ textAlign: "right" }}>
                    {item.gst % 1 === 0
                      ? parseInt(item.gst)
                      : parseFloat(item.gst)}
                    %
                  </td>
                  <td style={{ textAlign: "right" }}>
                    ₹
                    {calculateGrandTotal(
                      item.price,
                      item.totalQuantity,
                      item.gst
                    ).toFixed(2)}
                  </td>
                  {user?.role !== "Procurement" && (
                    <td className="action-buttons-cell">
                      <button
                        className="qc-button"
                        onClick={() =>
                          navigate(
                            `/inward?po_id=${getNestedValue(
                              item,
                              "po_master.PO_id"
                            )}&component_id=${getNestedValue(
                              item,
                              "po_master.cart.component_id"
                            )}`
                          )
                        }
                      >
                        QC
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
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
                  setShowDateFilter(false); // just close the popup
                }}
              >
                Apply
              </button>

              <button
                onClick={() => {
                  setFromDate(null);
                  setToDate(null);
                }}
              >
                Cancel
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

      <ToastContainerComponent />
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

export default Inwardlist;
