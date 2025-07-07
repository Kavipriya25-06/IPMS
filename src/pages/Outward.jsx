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
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Outward = () => {
  const [showScrollTop, setShowScrollTop] = useState(false); // Track visibility of scroll-to-top button
  const [showEventForm, setShowEventForm] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [showSalesForm, setShowSalesForm] = useState(false);

  const [showPopup, setShowPopup] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [reportType, setReportType] = useState("Defects");
  

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

  const handlePopupClose = () => {
    setShowPopup(false); // Close the pop-up when clicking outside
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Smooth scroll effect
    });
  };

  // On component mount, set time
  useEffect(() => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    setCurrentTime(formattedTime);
  }, []);

  const navigate = useNavigate();

  const handleAddEventClick = () => {
    navigate("/outward/add-event-list");
  };

  const handleAddServiceClick = () => {
    navigate("/outward/add-service-list");
  };

    const handleAddSalesClick = () => {
    navigate("/outward/add-sales-list");
  };

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

  const tableDataByType = {
    Defects: [
      {
        Date: "01-07-2024",
        Time: "10:00 AM",
        "Invoice Number": "INV-D001",
        Vendor: "Vendor A",
        Specification: "Spec 1",
        Quantity: 5,
        Project: "Project X",
        "Type of Outward": "Return",
        Remarks: "Defective item",
      },
      {
        Date: "02-07-2024",
        Time: "11:30 AM",
        "Invoice Number": "INV-D002",
        Vendor: "Vendor B",
        Specification: "Spec 2",
        Quantity: 3,
        Project: "Project Y",
        "Type of Outward": "Repair",
        Remarks: "Minor defect",
      },
    ],

    Sales: [
      {
        Date: "03-07-2024",
        Time: "12:00 PM",
        "Invoice Number": "INV-S001",
        Description: "Camera Lens",
        Client: "Client A",
        "Type of Outward": "Sale",
        Remarks: "Delivered on time",
      },
      {
        Date: "04-07-2024",
        Time: "02:00 PM",
        "Invoice Number": "INV-S002",
        Description: "Tripod",
        Client: "Client B",
        "Type of Outward": "Sale",
        Remarks: "COD",
      },
    ],

    Manufacture: [
      {
        "Out Date": "01-07-2024",
        Time: "09:00 AM",
        "Gate Pass": "GP001",
        "Component Spec": "Metal Frame",
        "Comp id": "C-101",
        Vendor: "Vendor X",
        Quantity: 10,
        Project: "Alpha",
        "Type of Outward": "Manufacture",
        Remarks: "Urgent",
      },
      {
        "Out Date": "05-07-2024",
        Time: "03:00 PM",
        "Gate Pass": "GP002",
        "Component Spec": "Plastic Body",
        "Comp id": "C-102",
        Vendor: "Vendor Y",
        Quantity: 15,
        Project: "Beta",
        "Type of Outward": "Manufacture",
        Remarks: "Normal",
      },
    ],

    Event: [
      {
        "Out Date": "01-07-2024",
        Time: "08:00 AM",
        "Invoice Number": "EVT001",
        "Event Name": "Product Launch",
        Project: "EventX",
        "Type of Outward": "Event",
        "No. of Components": 50,
        "Return Date": "2024-07-03",
        Remarks: "Successful",
      },
      {
        "Out Date": "06-07-2024",
        Time: "10:30 AM",
        "Invoice Number": "EVT002",
        "Event Name": "Tech Fair",
        Project: "EventY",
        "Type of Outward": "Event",
        "No. of Components": 30,
        "Return Date": "2024-07-08",
        Remarks: "Pending return",
      },
    ],
  };

  const currentHeaders = tableHeaders[reportType] || [];
  const currentData = tableDataByType[reportType] || [];

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
        <div className="table-action-buttons">
          <button className="generate-report-btn">Generate Report</button>
          {reportType === "Sales" && (
            <button
              className="add-sales-btn"
              onClick={() => setShowSalesForm(true)}
            >
              Add Sales List
            </button>
          )}
          {reportType === "Manufacture" && (
            <button
              className="add-sales-btn"
              onClick={() => setShowServiceForm(true)}
            >
              Add Service List
            </button>
          )}
          {reportType === "Event" && (
            <button
              className="add-sales-btn"
              onClick={() => setShowEventForm(true)}
            >
              Add Event List
            </button>
          )}
        </div>
      </div>
      <table>{/* your table here */}</table>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>S.No</th>
              {currentHeaders.map((header, index) => (
                <th key={index}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td>{rowIndex + 1}</td>
                {currentHeaders.map((header, colIndex) => {
                  const value = row[header] || "-";

                  // If it's the Event Name column, render as a link
                  if (header === "Event Name") {
                    return (
                      <td
                        key={colIndex}
                        onClick={handleAddEventClick}
                        style={{
                          color: "#1976d2",
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                      >
                        {value}
                      </td>
                    );
                  }

                  // If it's the Component Spec column, render as a link
                  if (header === "Component Spec") {
                    return (
                      <td
                        key={colIndex}
                        onClick={handleAddServiceClick}
                        style={{
                          color: "#1976d2",
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                      >
                        {value}
                      </td>
                    );
                  }

                    if (header === "Description") {
                    return (
                      <td
                        key={colIndex}
                        onClick={handleAddSalesClick}
                        style={{
                          color: "#1976d2",
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                      >
                        {value}
                      </td>
                    );
                  }

                  // Default rendering
                  return <td key={colIndex}>{value}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

       {showSalesForm && (
        <div
          className="modal-overlay"
          onClick={() => setShowSalesForm(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add Sales List</h2>

            {/* Your form fields go here */}
            <div className="form-grid">
              <label htmlFor="">Out Date</label>

              <div className="date-input-container">
                <DatePicker
                  selected={new Date()} //
                  dateFormat="dd-MM-yyyy"
                  placeholderText="dd-mm-yyyy"
                  className="input1"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  readOnly
                />
                <i className="fas fa-calendar-alt calendar-icon"></i>{" "}
              </div>
              <label htmlFor="">Time</label>

              <input
                type="text"
                name="Time"
                value={currentTime}
                readOnly
                placeholder="Time"
              />
              <label htmlFor="">Invoice/Gate Pass</label>

              <input
                type="text"
                name="gate pass"
                // value={newProject.description}
                // onChange={handleInputChange}
                required
                placeholder="gate pass"
              />
              <label htmlFor="">Component Name</label>
              <select name="project_type" required>
                <option value="">Select Component</option>
                <option value="R&D">R&D</option>
                <option value="OPS">OPS</option>
                <option value="SER">SER</option>
                <option value="MISC">MISC</option>
                <option value="U/D">U/D</option>
              </select>

              <label htmlFor="">BOM</label>
              <select name="project_type" required>
                <option value="">Select BOM</option>
                <option value="R&D">R&D</option>
                <option value="OPS">OPS</option>
                <option value="SER">SER</option>
                <option value="MISC">MISC</option>
                <option value="U/D">U/D</option>
              </select>

              <label htmlFor="">Client</label>
              <select name="project_type" required>
                <option value="">Select your client</option>
                <option value="R&D">R&D</option>
                <option value="OPS">OPS</option>
                <option value="SER">SER</option>
                <option value="MISC">MISC</option>
                <option value="U/D">U/D</option>
              </select>

              <label htmlFor="">Type Of Outward</label>
              <select name="project_type" required>
                <option value="">Select Type</option>
                <option value="R&D">R&D</option>
                <option value="OPS">OPS</option>
                <option value="SER">SER</option>
                <option value="MISC">MISC</option>
                <option value="U/D">U/D</option>
              </select>

              <label htmlFor="">Remarks</label>

              <input
                type="text"
                name="remarks"
                // value={newProject.description}
                // onChange={handleInputChange}
                required
                placeholder="remarks"
              />
            </div>
            <div className="modal-actions">
              <button>Create</button>
              <button onClick={() => setShowSalesForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}


      {showEventForm && (
        <div
          className="modal-overlay"
          onClick={() => setShowEventForm(false)} // Close on outside click
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()} // Prevent modal close on inner click
          >
            <h2>Add Event List</h2>

            <div className="form-grid">
              <label>Out Date</label>
              <div className="date-input-container">
                <DatePicker
                  selected={new Date()}
                  dateFormat="dd-MM-yyyy"
                  placeholderText="dd-mm-yyyy"
                  className="input1"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  readOnly
                />
                <i className="fas fa-calendar-alt calendar-icon"></i>
              </div>

              <label>Time</label>
              <input
                type="text"
                value={currentTime}
                readOnly
                placeholder="Time"
              />

              <label>Event Name</label>
              <input type="text" placeholder="Event Name" required />

              <label>Project</label>
              <input type="text" placeholder="Project Name" required />

              <label>Type of Outward</label>
              <select required>
                <option value="">Select Type</option>
                <option value="R&D">R&D</option>
                <option value="OPS">OPS</option>
                <option value="SER">SER</option>
                <option value="MISC">MISC</option>
                <option value="U/D">U/D</option>
              </select>

              <label>Return Date</label>
              <div className="date-input-container">
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  dateFormat="dd-MM-yyyy"
                  placeholderText="dd-mm-yyyy"
                  className="input1"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  required
                />
                <i className="fas fa-calendar-alt calendar-icon"></i>
              </div>

              <label>Remarks</label>
              <input type="text" placeholder="Remarks" required />
            </div>

            <div className="modal-actions">
              <button className="modal-button save">Create</button>
              <button
                className="modal-button cancel"
                onClick={() => setShowEventForm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showServiceForm && (
        <div
          className="modal-overlay"
          onClick={() => setShowServiceForm(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add Service List</h2>

            {/* Your form fields go here */}
            <div className="form-grid">
              <label htmlFor="">Out Date</label>

              <div className="date-input-container">
                <DatePicker
                  selected={new Date()} //
                  dateFormat="dd-MM-yyyy"
                  placeholderText="dd-mm-yyyy"
                  className="input1"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  readOnly
                />
                <i className="fas fa-calendar-alt calendar-icon"></i>{" "}
              </div>
              <label htmlFor="">Time</label>

              <input
                type="text"
                name="Time"
                value={currentTime}
                readOnly
                placeholder="Time"
              />
              <label htmlFor="">Gate Pass</label>

              <input
                type="text"
                name="gate pass"
                // value={newProject.description}
                // onChange={handleInputChange}
                required
                placeholder="gate pass"
              />
              <label htmlFor="">Component Spec</label>
              <select name="project_type" required>
                <option value="">Select Component</option>
                <option value="R&D">R&D</option>
                <option value="OPS">OPS</option>
                <option value="SER">SER</option>
                <option value="MISC">MISC</option>
                <option value="U/D">U/D</option>
              </select>

              <label htmlFor="">Component ID</label>

              <input
                type="text"
                name="compoenent_id"
                // value={newProject.description}
                // onChange={handleInputChange}
                required
                placeholder="component id"
              />

              <label htmlFor="">Vendor</label>
              <select name="project_type" required>
                <option value="">Select Vendor</option>
                <option value="R&D">R&D</option>
                <option value="OPS">OPS</option>
                <option value="SER">SER</option>
                <option value="MISC">MISC</option>
                <option value="U/D">U/D</option>
              </select>

              <label htmlFor="">Project</label>
              <select name="project_type" required>
                <option value="">Select Project Type</option>
                <option value="R&D">R&D</option>
                <option value="OPS">OPS</option>
                <option value="SER">SER</option>
                <option value="MISC">MISC</option>
                <option value="U/D">U/D</option>
              </select>

              <label htmlFor="">Type Of Outward</label>
              <select name="project_type" required>
                <option value="">Select Type</option>
                <option value="R&D">R&D</option>
                <option value="OPS">OPS</option>
                <option value="SER">SER</option>
                <option value="MISC">MISC</option>
                <option value="U/D">U/D</option>
              </select>

              <label htmlFor="">Quantity</label>

              <input
                type="number"
                name="quantity"
                // value={newProject.description}
                // onChange={handleInputChange}
                required
                placeholder="quantity"
              />

              <label htmlFor="">Return Date</label>

              <div className="date-input-container">
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  dateFormat="dd-MM-yyyy"
                  placeholderText="dd-mm-yyyy"
                  className="input1"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  required
                />
                <i className="fas fa-calendar-alt calendar-icon"></i>{" "}
              </div>
              <label htmlFor="">Remarks</label>

              <input
                type="text"
                name="description"
                // value={newProject.description}
                // onChange={handleInputChange}
                required
                placeholder="Remarks"
              />
            </div>
            <div className="modal-actions">
              <button>Create</button>
              <button onClick={() => setShowServiceForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

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
