import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import config from "../Config";
import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
  ToastContainerComponent,
} from "./Toastify.jsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Add from "../assets/Add.png";
import { FaArrowLeft } from "react-icons/fa";

const OutwardEvent = () => {
  const navigate = useNavigate();

  const [showScrollTop, setShowScrollTop] = useState(false);
  const [newRow, setNewRow] = useState(null);
  const [eventItems, setEventItems] = useState([]);
  const [eventName, setEventName] = useState("");
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const outwardId = location.state?.outwardId;

  // Fetch Event details and items
  useEffect(() => {
    if (!outwardId) return;

    setLoading(true);
    fetch(`${config.apiBaseURL}/outward/event/${outwardId}/`)
      .then((res) => res.json())
      .then((data) => {
        setEventName(data.event_name || "No event linked");
        setEventItems(data.event_items || []);
        setLoading(false);
      })
      .catch(() => {
        setEventName("No event linked");
        setLoading(false);
      });
  }, [outwardId]);

  // Scroll to top logic
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
      showWarningToast("Please fill or save the current row first.");
      return;
    }
    setNewRow({ component: "", serial_number: "", quantity: "", remarks: "" });
  };

  // Save single row to backend
  const handleSaveRow = async () => {
    if (
      !newRow.component ||
      !newRow.serial_number ||
      !newRow.quantity ||
      !newRow.remarks
    ) {
      showErrorToast("Please fill all fields.");
      return;
    }

    if (!outwardId) {
      showErrorToast("No event selected.");
      return;
    }

    // Prepare payload for a single item
   const payload = {
  component: newRow.component,
  serial_number: newRow.serial_number, // use the correct state field
  quantity: newRow.quantity,
  remarks: newRow.remarks,
};


    try {
      const res = await fetch(
        `${config.apiBaseURL}/outward/event/${outwardId}/items/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (res.ok) {
        // Add the row to frontend state after backend confirms success
        setEventItems((prev) => [...prev, payload]);
        setNewRow(null);
        showSuccessToast("Row saved successfully!");
      } else {
        const errText = await res.text(); // Use text to avoid JSON parse error
        console.error("Error saving item:", errText);
        showErrorToast("Failed to save row: " + errText);
      }
    } catch (err) {
      console.error(err);
      showErrorToast("Network error while saving row.");
    }
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
                navigate("/outward", { state: { reportType: "Event" } })
              }
              title="Back to Event List"
            >
              <FaArrowLeft />
            </button>
            <h2 style={{ margin: 0 }}>
              Event Name : {loading ? "Loading..." : eventName}
            </h2>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "20px",
              marginTop: "5px",
            }}
          >
            <span style={{ color: "black", fontWeight: "bold" }}>Date:</span>
            <DatePicker
              selected={new Date()}
              dateFormat="dd-MMM-yyyy"
              readOnly
              className="date-sales-picker"
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
            {eventItems.map((item, idx) => (
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
                <td>{eventItems.length + 1}</td>
                <td>
                  <input
                    type="text"
                    value={newRow.component}
                    onChange={(e) =>
                      setNewRow({ ...newRow, component: e.target.value })
                    }
                    placeholder="Component"
                    className="outward-sales-input"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={newRow.serial_number}
                    onChange={(e) =>
                      setNewRow({ ...newRow, serial_number: e.target.value })
                    }
                    placeholder="Serial Number"
                    className="outward-sales-input"
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
                    className="outward-sales-input"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={newRow.remarks}
                    onChange={(e) =>
                      setNewRow({ ...newRow, remarks: e.target.value })
                    }
                    placeholder="Remarks"
                    className="outward-sales-input"
                  />
                </td>
                <td>
                  <button
                    className="outward-sales-btn save-btn"
                    onClick={handleSaveRow}
                  >
                    Save
                  </button>
                  <button
                    className="outward-sales-btn cancel-btn"
                    onClick={handleCancelRow}
                  >
                    Cancel
                  </button>
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

export default OutwardEvent;
