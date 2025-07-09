import React, { useState } from "react";
import Add from "../assets/Add.png";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const TABS = [
  "Business Development Team",
  "Training & Hand-Over Role",
  "List of Deliverables",
  "BOM Selection",
  "Integration / QC",
  "UIN / Drone Details",
  "Packing Delivery",
  "Attachments",
];

const JobOrderSheet = () => {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [deliverables, setDeliverables] = useState([
    { title: "", quantity: "", remarks: "" },
  ]);
  const [selectedDate, setSelectedDate] = useState(null);

  const handleDeliverableChange = (index, field, value) => {
    const updated = [...deliverables];
    updated[index][field] = value;
    setDeliverables(updated);
  };

  const addDeliverable = () => {
    setDeliverables([
      ...deliverables,
      { title: "", quantity: "", remarks: "" },
    ]);
  };

  const removeDeliverable = (index) => {
    const updated = [...deliverables];
    updated.splice(index, 1);
    setDeliverables(updated);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "Business Development Team":
        return (
          <div className="form-section">
            <div className="individual-tabs">
              <label>Client Name</label>
              <input type="text" placeholder="Enter the client name" />
            </div>
            <div className="individual-tabs">
              <label>Contact Number</label>
              <input type="text" placeholder="Enter the contact number" />
            </div>
            <div className="individual-tabs">
              <label>Shipping Address</label>
              <input type="text" placeholder="Enter the shipping address" />
            </div>
            <div className="individual-tabs">
              <label>Sales Incharge</label>
              <input type="text" placeholder="Enter the sales incharge" />
            </div>
            <div className="individual-tabs">
              <label>Drone Type</label>
              <input type="text" placeholder="Enter team lead name" />
            </div>
            <div className="individual-tabs">
              <label>Order Date</label>
              <div className="date-input-container">
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  dateFormat="dd-MM-yyyy"
                  placeholderText="dd-mm-yyyy"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  required
                />
                <i className="fas fa-calendar-alt calendar-icon"></i>
              </div>{" "}
            </div>
            <div className="individual-tabs">
              <label>Expected Delivery Date</label>
              <div className="date-input-container">
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  dateFormat="dd-MM-yyyy"
                  placeholderText="dd-mm-yyyy"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  required
                />
                <i className="fas fa-calendar-alt calendar-icon"></i>
              </div>{" "}
            </div>
            <div className="forms-buttons">
              <button className="save-btn">Submit</button>
              <button className="cancel-btn">Cancel</button>
            </div>
          </div>
        );

      case "Training & Hand-Over Role":
        return (
          <div className="form-section">
            <div className="individual-tabs">
              <label>Pilot Name</label>
              <input type="text" placeholder="Enter the pilot name" />
            </div>
            <div className="individual-tabs">
              <label>Technical Person</label>
              <input
                type="text"
                placeholder="Enter the name of technical person"
              />
            </div>
            <div className="individual-tabs">
              <label>Co-Pilot Name</label>
              <input
                type="text"
                placeholder="Enter the name of co-pilot person"
              />
            </div>
            <div className="individual-tabs checkbox-group">
              <label>
                <input type="checkbox" name="onsite" />
                Onsite
              </label>

              <label>
                <input type="checkbox" name="online" />
                Online
              </label>
            </div>

            <div className="individual-tabs">
              <label>Departure Date</label>
              <div className="date-input-container">
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  dateFormat="dd-MM-yyyy"
                  placeholderText="dd-mm-yyyy"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  required
                />
                <i className="fas fa-calendar-alt calendar-icon"></i>
              </div>{" "}
            </div>
            <div className="individual-tabs">
              <label>Training Commencement Date</label>
              <div className="date-input-container">
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  dateFormat="dd-MM-yyyy"
                  placeholderText="dd-mm-yyyy"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  required
                />
                <i className="fas fa-calendar-alt calendar-icon"></i>
              </div>{" "}
            </div>
            <div className="individual-tabs">
              <label>Expected Delivery Date</label>
              <div className="date-input-container">
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  dateFormat="dd-MM-yyyy"
                  placeholderText="dd-mm-yyyy"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  required
                />
                <i className="fas fa-calendar-alt calendar-icon"></i>
              </div>{" "}
            </div>
            <div className="forms-buttons">
              <button className="save-btn">Submit</button>
              <button className="cancel-btn">Cancel</button>
            </div>
          </div>
        );

      case "List of Deliverables":
        return (
          <div>
            {/* Right-aligned Add Button */}
            <div className="deliverables-header">
              <button
                onClick={addDeliverable}
                title="Add Deliverable"
                style={{
                  cursor: "pointer",
                  background: "transparent",
                  border: "none",
                }}
              >
                <img
                  src={Add}
                  alt="Add"
                  style={{ width: "20px", height: "20px" }}
                />
              </button>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Specification</th>
                    <th>Quantity</th>
                    <th>Packed</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {deliverables.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) =>
                            handleDeliverableChange(
                              index,
                              "title",
                              e.target.value
                            )
                          }
                          style={{
                            padding: "4px",
                            borderRadius: "4px",
                            border: "1.4px solid #ccc",
                            width: "70%",
                          }}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={item.quantity}
                          onChange={(e) =>
                            handleDeliverableChange(
                              index,
                              "quantity",
                              e.target.value
                            )
                          }
                          style={{
                            padding: "4px",
                            borderRadius: "4px",
                            border: "1.4px solid #ccc",
                            width: "70%",
                          }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={item.remarks}
                          onChange={(e) =>
                            handleDeliverableChange(
                              index,
                              "remarks",
                              e.target.value
                            )
                          }
                          style={{
                            padding: "4px",
                            borderRadius: "4px",
                            border: "1.4px solid #ccc",
                            width: "70%",
                          }}
                        />
                      </td>
                      <td></td>
                      <td className="event-buttons">
                        <button>Save</button>
                        <button onClick={() => removeDeliverable(index)}>
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table> 
            </div>
          </div>
        );

      case "BOM Selection":
        return (
          <div className="form-section">
            <div className="individual-tabs">
              <label>Project ID</label>
              <input type="text" placeholder="Enter the project id" />
            </div>
            <div className="individual-tabs">
              <label>Project Name</label>
              <input type="text" placeholder="Enter the project name" />
            </div>
            <div className="individual-tabs">
              <label>BOM</label>
              <input type="text" placeholder="Enter the BOM" />
            </div>
            <div className="individual-tabs">
              <label>Drone Serial Number</label>
              <input type="text" placeholder="Enter the serial number" />
            </div>
            <div className="individual-tabs">
              <label>Drone Name</label>
              <input type="text" placeholder="Enter the drone name" />
            </div>
            <div className="forms-buttons">
              <button className="save-btn">Submit</button>
              <button className="cancel-btn">Cancel</button>
            </div>
          </div>
        );

      case "Integration / QC":
        return (
          <div className="form-section">
            <div className="individual-tabs">
              <label>Team Lead</label>
              <input type="text" placeholder="Enter the teamlead name" />
            </div>
            <div className="individual-tabs">
              <label>QC Technician</label>
              <input type="text" placeholder="Enter the technician name" />
            </div>
            <div className="individual-tabs">
              <label>Assembly Technician 1</label>
              <input type="text" placeholder="Enter the tech1" />
            </div>
            <div className="individual-tabs">
              <label>Pilot/Co-Pilot</label>
              <input type="text" placeholder="Enter the pilot name" />
            </div>
            <div className="individual-tabs">
              <label>Assembly Technician 2</label>
              <input type="text" placeholder="Enter the tech2" />
            </div>
            <div className="forms-buttons">
              <button className="save-btn">Submit</button>
              <button className="cancel-btn">Cancel</button>
            </div>
          </div>
        );

      case "UIN / Drone Details":
        return (
          <div className="form-section">
            <div className="individual-tabs">
              <label>UIN Number</label>
              <input type="text" placeholder="Enter the uin number" />
            </div>
            <div className="individual-tabs">
              <label>Drone Serial Number</label>
              <input type="text" placeholder="Enter the serial number" />
            </div>
            <div className="individual-tabs">
              <label>Remote Controller Serial Number</label>
              <input
                type="text"
                placeholder="Enter the remote controller serial number"
              />
            </div>
            <div className="individual-tabs">
              <label>Flight Controller Serial Number</label>
              <input
                type="text"
                placeholder="Enter the flight controller serial number"
              />
            </div>
            <div className="individual-tabs">
              <label>Battery 1 Serial Number</label>
              <input type="text" placeholder="Enter the battery 1" />
            </div>
            <div className="individual-tabs">
              <label>Battery 2 Serial Number</label>
              <input type="text" placeholder="Enter the battery 2" />
            </div>
            <div className="individual-tabs">
              <label>Battery Charger Serial Number</label>
              <input type="text" placeholder="Enter the battery-charger" />
            </div>
            <div className="forms-buttons">
              <button className="save-btn">Submit</button>
              <button className="cancel-btn">Cancel</button>
            </div>
          </div>
        );

      case "Packing Delivery":
        return (
          <div className="form-section">
            <div className="individual-tabs">
              <label>User Manual</label>
              <input type="text" placeholder="Enter the user-manual" />
            </div>
            <div className="individual-tabs">
              <label>Maintenance Manual</label>
              <input type="text" placeholder="Enter the maintenance-manual" />
            </div>
            <div className="individual-tabs">
              <label>Drone Costing Submission</label>
              <input
                type="text"
                placeholder="Enter the drone-costing-submission"
              />
            </div>
            <div className="individual-tabs">
              <label>Packed By</label>
              <input type="text" placeholder="Enter the packed person name" />
            </div>
            <div className="individual-tabs">
              <label>Verified By</label>
              <input type="text" placeholder="Enter the verified person name" />
            </div>
            <div className="individual-tabs">
              <label>E-way Bill No</label>
              <input type="text" placeholder="Enter the bill no" />
            </div>
            <div className="individual-tabs">
              <label>Invoice No.</label>
              <input type="text" placeholder="Enter the invoice-no" />
            </div>
            <div className="individual-tabs">
              <label>Mode of Transport 1</label>
              <input type="text" placeholder="Enter the mode-of-transport" />
            </div>
            <div className="individual-tabs">
              <label>Date of Delivery</label>
              <div className="date-input-container">
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  dateFormat="dd-MM-yyyy"
                  placeholderText="dd-mm-yyyy"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  required
                />
                <i className="fas fa-calendar-alt calendar-icon"></i>
              </div>{" "}
            </div>
            <div className="individual-tabs">
              <label>Mode of Transport 2:</label>
              <input type="text" placeholder="Enter the mode-of-transport" />
            </div>{" "}
            <div className="individual-tabs">
              <label>Vehicle No</label>
              <input type="text" placeholder="Enter the vehicle no" />
            </div>
            <div className="individual-tabs">
              <label>Tracking ID</label>
              <input type="text" placeholder="Enter the tracking-id" />
            </div>
            <div className="forms-buttons">
              <button className="save-btn">Submit</button>
              <button className="cancel-btn">Cancel</button>
            </div>
          </div>
        );

      case "Attachments":
        return (
          <div className="form-section">
            <div className="individual-tabs">
              <label>Invoice</label>
              <input type="file" multiple />
            </div>
            <div className="individual-tabs">
              <label>E-Way Bill</label>
              <input type="file" multiple />
            </div>
            <div className="individual-tabs">
              <label>Photo</label>
              <input type="file" multiple />
            </div>
            <div className="individual-tabs">
              <label>MRF</label>
              <input type="file" multiple />
            </div>
            <div className="forms-buttons">
              <button className="save-btn">Submit</button>
              <button className="cancel-btn">Cancel</button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="joborder-container">
      <h2>Job Order Sheet</h2>

      <div className="tab-selector">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="tab-content">{renderTabContent()}</div>
    </div>
  );
};

export default JobOrderSheet;
