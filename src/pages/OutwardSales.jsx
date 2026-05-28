import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import config from "../Config";
import Add from "../assets/Add.png";
import { FaArrowLeft } from "react-icons/fa";
import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
  ToastContainerComponent,
} from "./Toastify.jsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const OutwardSales = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [newRow, setNewRow] = useState(null);
  const [salesItems, setSalesItems] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();
  const outwardId = location.state?.outwardId;

  const [productName, setProductName] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch sales record
  useEffect(() => {
    if (!outwardId) return;

    setLoading(true);
    fetch(`${config.apiBaseURL}/outward/sales/`)
      .then((res) => res.json())
      .then((data) => {
        const saleRecord = data.find((item) => item.id === outwardId);
        if (saleRecord) {
          setProductName(saleRecord.product_name || "-");
          setSalesItems(saleRecord.sales_items || []);
        } else {
          setProductName("-");
          setSalesItems([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setProductName("-");
        setSalesItems([]);
        setLoading(false);
      });
  }, [outwardId]);

  // Scroll to top
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Add new row
  const handleAddRow = () => {
    if (newRow) {
      showWarningToast("Please fill or save the sales data first.");
      return;
    }
    setNewRow({ component: "", serial: "", quantity: "", remarks: "" });
  };

  // Save row to backend
  const handleSaveRow = async () => {
    if (!newRow.component || !newRow.serial || !newRow.quantity || !newRow.remarks) {
      showErrorToast("Please fill all fields.");
      return;
    }

    if (!outwardId) {
      showErrorToast("No outward selected.");
      return;
    }

    const payload = {
      component: newRow.component,
      serial_number: newRow.serial,
      quantity: newRow.quantity,
      remarks: newRow.remarks,
    };

    try {
      const res = await fetch(`${config.apiBaseURL}/outward/sales/${outwardId}/items/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSalesItems((prev) => [...prev, payload]);
        setNewRow(null);
        showSuccessToast("Row saved successfully!");
      } else {
        const errText = await res.text();
        showErrorToast("Failed to save row: " + errText);
      }
    } catch (err) {
      showErrorToast("Network error while saving row.");
    }
  };

  const handleCancelRow = () => setNewRow(null);

  return (
    <div style={{ marginTop: "10px" }}>
      <div className="header" style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "100px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <button
              className="back-btn"
              onClick={() => navigate("/outward", { state: { reportType: "Sales" } })}
              title="Back to Sales List"
            >
              <FaArrowLeft />
            </button>
            <h2 style={{ margin: 0 }}>Product Name : {loading ? "N/A" : productName}</h2>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "20px", marginTop: "5px" }}>
            <span style={{ color: "black", fontWeight: "bold" }}>Date:</span>
            <DatePicker
              selected={new Date()}
              dateFormat="dd-MMM-yyyy"
              readOnly
              className="date-sales-picker"
              style={{ fontSize: "20px", padding: "4px 6px" }}
            />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", margin: "10px 0", gap: "20px" }}>
          <button className="generate-report-btn">Generate Report</button>
          <button
            style={{ cursor: "pointer", background: "transparent", border: "none" }}
            title="Add Item"
            onClick={handleAddRow}
          >
            <img src={Add} alt="" style={{ width: "20px", height: "20px" }} />
          </button>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Component</th>
              <th>Serial Number</th>
              <th>Quantity</th>
              <th>Remarks</th>
              {newRow && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {salesItems.map((item, idx) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td>{item.component}</td>
                <td>{item.serial_number}</td>
                <td>{item.quantity}</td>
                <td>{item.remarks}</td>
              </tr>
            ))}

       {newRow && (
  <tr>
    <td>{salesItems.length + 1}</td>
    <td>
      <input
        type="text"
        value={newRow.component}
        onChange={(e) => setNewRow({ ...newRow, component: e.target.value })}
        placeholder="Component"
        className="outward-sales-input"
      />
    </td>
    <td>
      <input
        type="text"
        value={newRow.serial}
        onChange={(e) => setNewRow({ ...newRow, serial: e.target.value })}
        placeholder="Serial Number"
        className="outward-sales-input"
      />
    </td>
    <td>
      <input
        type="number"
        value={newRow.quantity}
        onChange={(e) => setNewRow({ ...newRow, quantity: e.target.value })}
        placeholder="Quantity"
        className="outward-sales-input"
      />
    </td>
    <td>
      <input
        type="text"
        value={newRow.remarks}
        onChange={(e) => setNewRow({ ...newRow, remarks: e.target.value })}
        placeholder="Remarks"
        className="outward-sales-input"
      />
    </td>
    <td>
      <button className="outward-sales-btn save-btn" onClick={handleSaveRow}>Save</button>
      <button className="outward-sales-btn cancel-btn" onClick={handleCancelRow}>Cancel</button>
    </td>
  </tr>
)}

          </tbody>
        </table>
      </div>

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
      <ToastContainerComponent position="top-right" autoClose={3000} />
    </div>
  );
};

export default OutwardSales;
