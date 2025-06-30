import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import config from "../Config"; // Import config for API endpoints
import { sortData, toggleSortDirection, renderSortArrow } from "../Sort";
import AddIcon from "../assets/Add.png";
import Delete from "../assets/Delete.png";
import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  showMessageToast,
  ToastContainerComponent,
} from "./Toastify.jsx";
import { format, parseISO } from "date-fns";

const Outward = () => {
  const [showScrollTop, setShowScrollTop] = useState(false); // Track visibility of scroll-to-top button

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

  const [reportType, setReportType] = useState("Defects");

  const handleReportChange = (e) => {
    setReportType(e.target.value);
  };

  const tableHeaders = {
    Defects: [
      "Date",
      "Time",
      "Invoice Number",
      "Vendor",
      "Specification",
      "Quantity",
      "Project",
      "Type of Outward",
      "Remarks",
    ],
    Sales: [
      "Date",
      "Time",
      "Invoice Number",
      "Description",
      "Client",
      "Type of Outward",
      "Remarks",
    ],
    Manufacture: [
      "Out Date",
      "Time",
      "Gate Pass",
      "Component Spec",
      "Comp id",
      "Vendor",
      "Quantity",
      "Project",
      "Type of Outward",
      "Remarks",
    ],
    Event: [
      "Out Date",
      "Time",
      "Invoice Number",
      "Event Name",
      "Project",
      "Type of Outward",
      "No. of Components",
      "Return Date",
      "Remarks",
    ],
  };

  const currentHeaders = tableHeaders[reportType] || [];

  return (
    <div>
      <div
        className="header"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h2>Outward List</h2>
        <select className="report-select" onChange={handleReportChange}>
          <option value="Defects">Defects</option>
          <option value="Sales">Sales</option>
          <option value="Manufacture">Manufacture</option>
          <option value="Event">Event</option>
        </select>
        <button className="generate-report-btn">Generate Report</button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              {currentHeaders.map((header, index) => (
                <th key={index}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {currentHeaders.map((_, index) => (
                <td key={index}>Data</td>
              ))}
            </tr>
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
