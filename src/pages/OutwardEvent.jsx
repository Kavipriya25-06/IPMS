import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import config from "../Config"; // Import config for API endpoints
import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  showMessageToast,
  ToastContainerComponent,
} from "./Toastify.jsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Add from "../assets/Add.png";

const Outward = () => {
  const [showScrollTop, setShowScrollTop] = useState(false); // Track visibility of scroll-to-top button
  const [newRow, setNewRow] = useState(null);

  const [componentOptions, setComponentOptions] = useState([
    "Component A",
    "Component B",
    "Component C",
  ]);

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
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Smooth scroll effect
    });
  };

  const handleAddRow = () => {
    setNewRow({
      component: "",
      vendor: "",
      serial: "",
    });
  };

  const handleSaveRow = () => {
    if (!newRow.component || !newRow.vendor || !newRow.serial) {
      showErrorToast("Please fill all fields.");
      return;
    }

    // Save logic goes here — API call or local state update
    console.log("Saving row:", newRow);

    setNewRow(null);
    showSuccessToast("Row added.");
  };

  const handleCancelRow = () => {
    setNewRow(null); // Clear the new row, effectively cancelling
  };

  return (
    <div>
      <div
        className="header"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "-10px",
        }}
      >
        <h2>Outward List</h2>
        <div className="date-row">
          <h5>Date:</h5>
          <DatePicker
            selected={new Date()}
            dateFormat="dd-MMM-yyyy"
            placeholderText="dd-mm-yyyy"
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            readOnly
            className="date-picker"
          />
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
        </div>{" "}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Component</th>
              <th>Quantity</th>
              {newRow && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Backend BOM List table changes</td>
              <td>12</td>
            </tr>
            {newRow && (
              <tr>
                <td>2</td>
                <td>
                  <input
                    type="text"
                    value={newRow.vendor}
                    onChange={(e) =>
                      setNewRow({ ...newRow, vendor: e.target.value })
                    }
                    placeholder="Component Name"
                    style={{
                      padding: "4px",
                      borderRadius: "4px",
                      border: "1.4px solid #ccc",
                      width: "60%",
                    }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={newRow.vendor}
                    onChange={(e) =>
                      setNewRow({ ...newRow, vendor: e.target.value })
                    }
                    placeholder="Quantity"
                    style={{
                      padding: "4px",
                      borderRadius: "4px",
                      border: "1.4px solid #ccc",
                      width: "60%",
                    }}
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

export default Outward;
