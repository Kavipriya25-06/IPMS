import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import config from "../Config";
import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
  showInfoToast,
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

  const location = useLocation();
  const outwardId = location.state?.outwardId;

  const [eventName, setEventName] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch Event details
  useEffect(() => {
    if (!outwardId) return;

    setLoading(true);

    fetch(`${config.apiBaseURL}/outward/event/`)
      .then((res) => res.json())
      .then((data) => {
        // find event record by outwardId
        const eventRecord = data.find((item) => item.id === outwardId);

        if (eventRecord) {
          setEventName(eventRecord.event_name || "No event linked");
        } else {
          setEventName("No event linked");
        }

        setLoading(false);
      })
      .catch(() => {
        setEventName("No event linked");
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
    showWarningToast("Please fill or save the event data first.");
    return;
  }
  setNewRow({ component: "", serialNumber: "", quantity: "",remarks: "" });
};
  // Validate serialNumber as well
  const handleSaveRow = () => {
    if (!newRow.component || !newRow.serialNumber || !newRow.quantity || !newRow.remarks) {
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
              style={{ fontSize: "20px", padding: "4px 6px" }}
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
              <td>Sample Component</td>
              <td>WERT32145382583</td>
              <td>10</td>
              <td>good</td>
            </tr>

            {newRow && (
              <tr>
                <td>2</td>
                <td>
                  <input
                    type="text"
                    value={newRow.component}
                    onChange={(e) =>
                      setNewRow({ ...newRow, component: e.target.value })
                    }
                    placeholder="Component Name"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={newRow.serialNumber}
                    onChange={(e) =>
                      setNewRow({ ...newRow, serialNumber: e.target.value })
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
                    placeholder="remarks"
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

      {/* Scroll to top */}
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

      <ToastContainerComponent />
    </div>
  );
};

export default OutwardEvent;
