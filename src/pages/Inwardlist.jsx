import React, { useEffect, useState } from "react";
import CustomMessagebox from "./CustomMessageBox.jsx";
import config from "../Config";
import { useNavigate } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";

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
    const [loading, setLoading] = useState(true);
  

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

  // Fetch Inward Data
  const fetchInwardData = async () => {
    try {
            setLoading(true);

      const response = await fetch(`${config.apiBaseURL}/inward/`);
      const data = await response.json();
      const result = data.filter((item) => item.mode_to_inventory === true);

      const grouped = {};
      result.forEach((item) => {
        const poId = getNestedValue(item, "po_master.PO_id", "");
        const componentId = getNestedValue(
          item,
          "po_master.cart.component_id",
          ""
        );
        const key = `${poId}_${componentId}`;

        if (!grouped[key]) {
          grouped[key] = {
            ...item,
            quantity: 1,
            totalPrice: item.price || 0,
            gst: item.gst || 0,
          };
        } else {
          grouped[key].quantity += 1;
          grouped[key].totalPrice += item.price || 0;
        }
      });

      const groupedData = Object.values(grouped);
      setInwardData(groupedData);
      setFilteredData(groupedData);
    } catch (err) {
      console.error("Error fetching inward data:", err);
    }finally {
      setLoading(false); // Stop loading after both calls
    }
  };

  useEffect(() => {
    fetchInwardData();
  }, []);

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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const calculateGrandTotal = (unitPrice, quantity, gst) => {
    const subtotal = unitPrice * quantity;
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
        maxWidth: "120px", // prevent overflow
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        backgroundColor: "#fff",
      }}
    >
      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>
        {value || "dd-mm-yyyy"}
      </span>
      <FaCalendarAlt style={{ color: "#333", marginLeft: "6px" }} />
    </div>
  ));

  const updateInvoiceForPO = async (poId, invoiceNumber, invoiceDate) => {
    try {
      const res = await fetch(`${config.apiBaseURL}/inward/`);
      const inwardList = await res.json();

      const matchingInwards = inwardList.filter(
        (item) => item.po_master?.PO_id === poId
      );

      const updatePromises = matchingInwards.map((item) =>
        fetch(`${config.apiBaseURL}/inward/${item.inward_id}/`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            invoice_number: invoiceNumber,
            invoice_date: invoiceDate,
          }),
        })
      );

      const responses = await Promise.all(updatePromises);
      const failed = responses.filter((r) => !r.ok);
      if (failed.length > 0) {
        throw new Error(`${failed.length} updates failed`);
      }

      //  Update state locally to reflect changes without refresh
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
      setFilteredData(updatedData); // if you're using filteredData separately

      showSuccessToast("Invoice details updated for all inward items.");
    } catch (err) {
      console.error("Update error:", err);
      showErrorToast("Failed to update invoice details");
    }
  };

  return (
    <div>
      <div className="header">
        <h2>Inward</h2>
      </div>

      <div className="table-container" style={{ marginTop: "-10px" }}>
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
              <th style={{ textAlign: "right" }}>Quantity</th>
              <th style={{ textAlign: "right" }}>Unit Price</th>
              <th style={{ textAlign: "right" }}>GST</th>
              <th style={{ textAlign: "right" }}>Grand Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="12"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  <div className="spinner"></div>
                  Loading Projects...
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan="12" style={{ textAlign: "center", color: "gray" }}>
                  No Inward available
                </td>
              </tr>
            ) :filteredData.map((item, index) => (
              <tr key={index}>
                <td>{getNestedValue(item, "po_master.PO_id")}</td>
                <td>{getNestedValue(item, "po_master.cart.component_id")}</td>
                <td>
                  {getNestedValue(
                    item,
                    "po_master.cart.component_specification"
                  )}
                </td>
                <td>{getNestedValue(item, "po_master.cart.vendor_name")}</td>
                <td>
                  {item.date ? format(new Date(item.date), "dd-MM-yyyy") : "-"}
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
                        padding: "3px",
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
                      <span style={{ flex: 1 }}>
                        {item.invoice_number || "-"}
                      </span>
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
                    </div>
                  )}
                </td>

                <td style={{ minWidth: "130px" }}>
                  {editingIndex === index ? (
                    <DatePicker
                      selected={
                        invoiceDateInput ? new Date(invoiceDateInput) : null
                      }
                      onChange={(date) => {
                        const formattedDate = date.toISOString().split("T")[0]; // Format to yyyy-MM-dd
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
                      }}
                    >
                      <span>
                        {item.invoice_date
                          ? format(new Date(item.invoice_date), "dd-MM-yyyy")
                          : "-"}
                      </span>
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
                        style={{ cursor: "pointer" }}
                      />
                    </div>
                  )}
                </td>

                <td style={{ textAlign: "right" }}>{item.quantity}</td>
                <td style={{ textAlign: "right" }}>₹{item.price || "-"}</td>
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
                    item.quantity,
                    item.gst
                  ).toFixed(2)}
                </td>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
