import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import config from "../Config";
import Add from "../assets/Add.png";
import { FaArrowLeft } from "react-icons/fa";

import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
  showInfoToast,
  ToastContainerComponent,
} from "./Toastify.jsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const OutwardSales = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [newRow, setNewRow] = useState(null);

  const [componentOptions, setComponentOptions] = useState([
    "Component A",
    "Component B",
    "Component C",
  ]);
  const navigate = useNavigate();

  const location = useLocation();
  const outwardId = location.state?.outwardId;

  const [productName, setProductName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!outwardId) return;

    setLoading(true);

    // Fetch all Sales records
    fetch(`${config.apiBaseURL}/outward/sales/`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Sales API data:", data);

        // Find the sales record with this outwardId
        const saleRecord = data.find((item) => item.id === outwardId);

        if (saleRecord) {
          setProductName(saleRecord.specification || "No product linked");
        } else {
          setProductName("No product linked");
        }

        setLoading(false);
      })
      .catch(() => {
        setProductName("No product linked");
        setLoading(false);
      });
  }, [outwardId]);

  // --- Scroll to top ---
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAddRow = () => {
    if (newRow) {
      showWarningToast("Please fill or save the sales data first.");
      return;
    }
    setNewRow({ component: "", quantity: "", serial: "", remarks: "" });
  };

  const handleSaveRow = () => {
    if (
      !newRow.component ||
      !newRow.quantity ||
      !newRow.serial ||
      !newRow.remarks
    ) {
      showErrorToast("Please fill all fields.");
      return;
    }
    console.log("Saving row:", newRow);
    setNewRow(null);
    showSuccessToast("Row added.");
  };

  const handleCancelRow = () => setNewRow(null);

  return (
    <div style={{ marginTop: "10px" }}>
      <div
        className="header"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "100px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <button
              className="back-btn"
              onClick={() =>
                navigate("/outward", { state: { reportType: "Sales" } })
              }
              title="Back to Sales List"
            >
              <FaArrowLeft />
            </button>

            <h2 style={{ margin: 0 }}>
              Product Name : {loading ? "N/A" : productName}
            </h2>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px", // space between "Date:" and picker
              fontSize: "20px", // same font size for both
              marginTop: "5px",
            }}
          >
            <span style={{ color: "black", fontWeight: "bold" }}>Date:</span>
            <DatePicker
              selected={new Date()}
              dateFormat="dd-MMM-yyyy"
              placeholderText="dd-mm-yyyy"
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              readOnly
              className="date-sales-picker"
              style={{ fontSize: "20px", padding: "4px 6px" }} // normalize input look
            />
          </div>
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
          <button
            style={{
              cursor: "pointer",
              background: "transparent",
              border: "none",
            }}
            title="Add Vendor"
            onClick={handleAddRow}
          >
            <img src={Add} alt="" style={{ width: "20px", height: "20px" }} />
          </button>
        </div>
      </div>

      {/* Table */}
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
            <tr>
              <td>1</td>
              <td>Backend BOM List table changes</td>
              <td>12</td>
              <td>8000</td>
              <td>8%</td>
            </tr>

            {newRow && (
              <tr>
                <td>2</td>
                <td>
                  <select
                    value={newRow.component}
                    onChange={(e) =>
                      setNewRow({ ...newRow, component: e.target.value })
                    }
                  >
                    <option value="">Select</option>
                    {componentOptions.map((comp) => (
                      <option key={comp} value={comp}>
                        {comp}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="text"
                    value={newRow.serial}
                    onChange={(e) =>
                      setNewRow({ ...newRow, serial: e.target.value })
                    }
                    placeholder="Serial Number"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={newRow.quantity}
                    onChange={(e) =>
                      setNewRow({ ...newRow, quantity: e.target.value })
                    }
                    placeholder="Quantity"
                  />
                </td>
                <td className="specification-cell" title={newRow.remarks}>
                  <input
                    type="text"
                    value={newRow.remarks}
                    onChange={(e) =>
                      setNewRow({ ...newRow, remarks: e.target.value })
                    }
                    placeholder="Remarks"
                  />
                </td>

                <td className="event-buttons">
                  <button onClick={handleSaveRow}>Save</button>
                  <button onClick={handleCancelRow}>Cancel</button>
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
