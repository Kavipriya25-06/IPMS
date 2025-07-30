import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import config from "../Config.js";
import AddIcon from "../assets/Add.png";
import CancelIcon from "../assets/cancel.png";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, parseISO } from "date-fns";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  ToastContainerComponent,
} from "./Toastify.jsx";

const Outward = () => {
  const [reportType, setReportType] = useState("Defects");
  const [tableData, setTableData] = useState([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [showSalesForm, setShowSalesForm] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableVendors, setAvailableVendors] = useState([]);
  const [componentSpecList, setComponentSpecList] = useState([]);
  const [projectList, setProjectList] = useState([]);
  const [serialNumberList, setSerialNumberList] = useState([]);
  const [showSerialDropdown, setShowSerialDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSerialDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [salesForm, setSalesForm] = useState({
    outDate: new Date(),
    time: format(new Date(), "hh:mm a"),
    invoice: "",
    specification: "",
    bom: "",
    client: "",
    typeOfOutward: "",
    remarks: "",
  });

  const [serviceForm, setServiceForm] = useState({
    outDate: new Date(),
    time: format(new Date(), "hh:mm a"),
    gatePass: "",
    specification: "",
    componentId: "",
    vendor: "",
    project: "",
    typeOfOutward: "",
    quantity: "",
    returnDate: null,
    remarks: "",
    serialNumbers: [],
  });

  const [eventForm, setEventForm] = useState({
    outDate: new Date(),
    time: format(new Date(), "hh:mm a"),
    eventName: "",
    project: "",
    typeOfOutward: "",
    returnDate: null,
    remarks: "",
  });

  //to fetch dropdown spec in select
  useEffect(() => {
    const fetchSpecs = async () => {
      try {
        const res = await fetch(`${config.apiBaseURL}/vendor_master/`);
        const data = await res.json();
        const uniqueSpecs = [
          ...new Set(data.map((item) => item.component_specification)),
        ];
        setComponentSpecList(uniqueSpecs);
      } catch (err) {
        console.error("Failed to fetch component specs", err);
      }
    };

    fetchSpecs();
  }, []);

  //after selecting id and vendor to fetch
  const handleSpecChange = async (e) => {
    const selectedSpec = e.target.value;
    setServiceForm((prev) => ({ ...prev, specification: selectedSpec }));

    try {
      const resVendor = await fetch(`${config.apiBaseURL}/vendor_master/`);
      const vendorData = await resVendor.json();

      const filtered = vendorData.filter(
        (item) => item.component_specification === selectedSpec
      );

      if (filtered.length === 0) {
        setAvailableVendors([]);
        setServiceForm((prev) => ({
          ...prev,
          componentId: "",
          vendor: "",
          serialNumbers: [],
        }));
        setSerialNumberList([]);
        return;
      }

      const componentId = filtered[0].component_id;
      const vendors = [...new Set(filtered.map((item) => item.vendor_name))];

      setServiceForm((prev) => ({
        ...prev,
        componentId,
        vendor: vendors.length === 1 ? vendors[0] : "",
      }));
      setAvailableVendors(vendors);

      // Fetch from inventory
      const resInventory = await fetch(`${config.apiBaseURL}/inventory/`);
      const inventoryData = await resInventory.json();

      const availableSerials = inventoryData
        .filter(
          (item) =>
            item.component_id === componentId && item.status === "Available"
        )
        .map((item) => item.serial_number);

      setSerialNumberList(availableSerials);
    } catch (err) {
      console.error("Error loading data:", err);
    }
  };

  const handleEventChange = (e) => {
    const { name, value } = e.target;
    setEventForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setServiceForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleReportChange = (e) => {
    setReportType(e.target.value);
  };

  const handleSalesChange = (e) => {
    const { name, value } = e.target;
    setSalesForm((prev) => ({ ...prev, [name]: value }));
  };

  // Table headers for each category
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

  // Fetch data from API when reportType changes
  const fetchData = async () => {
    try {
      const response = await axios.get(
        `${config.apiBaseURL}/outward/${reportType}/`
      );
      setTableData(response.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setTableData([]);
    }
  };

  useEffect(() => {
    fetchData(); // call on report type change
  }, [reportType]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch(`${config.apiBaseURL}/project/`);
        const data = await res.json();
        setProjectList(data); // Save full project list
      } catch (err) {
        console.error("Error fetching project list:", err);
      }
    };

    fetchProjects();
  }, []);

  // To display project name in table
  const getProjectName = (projectId) => {
    const project = projectList.find((p) => p.project_id === projectId);
    return project?.project_name || "-";
  };

  //Submit the Manufacturer
  const handleManufactureSubmit = async () => {
    const payload = {
      category: "Manufacture",
      date: serviceForm.outDate?.toISOString().split("T")[0],
      time: serviceForm.time,
      gatepass: serviceForm.gatePass,
      specification: serviceForm.specification,
      component_id: serviceForm.componentId,
      serial_numbers: serviceForm.serialNumbers,
      vendor: serviceForm.vendor,
      quantity: serviceForm.quantity,
      project: serviceForm.project,
      type_of_outward: serviceForm.typeOfOutward,
      remarks: serviceForm.remarks,
      return_date: serviceForm.returnDate?.toISOString().split("T")[0] || null,
    };

    try {
      const res = await fetch(`${config.apiBaseURL}/outward/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showSuccessToast("Outward entry saved!");
        setShowServiceForm(false);
        setServiceForm({
          outDate: new Date(),
          time: format(new Date(), "hh:mm a"),
          gatePass: "",
          specification: "",
          componentId: "",
          vendor: "",
          project: "",
          typeOfOutward: "",
          quantity: "",
          returnDate: null,
          remarks: "",
          serialNumbers: [],
        });
        fetchData();
      } else {
        const err = await res.json();
        console.error("Error saving:", err);
      }
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  const handleSalesSubmit = async () => {
    const payload = {
      category: "Sales",
      date: salesForm.outDate?.toISOString().split("T")[0],
      time: salesForm.time,
      invoice_no: salesForm.invoice,
      specification: salesForm.specification,
      bom: salesForm.bom,
      client: salesForm.client,
      type_of_outward: salesForm.typeOfOutward,
      remarks: salesForm.remarks,
    };

    try {
      const res = await fetch(`${config.apiBaseURL}/outward/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showSuccessToast("Sales entry saved!");
        setShowSalesForm(false);

        // Reset form values just like you do in manufacture
        setSalesForm({
          outDate: new Date(),
          time: format(new Date(), "hh:mm a"),
          invoice: "",
          specification: "",
          bom: "",
          client: "",
          typeOfOutward: "",
          remarks: "",
        });

        fetchData(); // Refresh table after save
      } else {
        const err = await res.json();
        console.error("Save failed:", err);
      }
    } catch (err) {
      console.error("Network error:", err);
    }
  };

  const handleEventSubmit = async () => {
    const payload = {
      category: "Event",
      date: eventForm.outDate?.toISOString().split("T")[0],
      time: eventForm.time,
      event_name: eventForm.eventName,
      project: eventForm.project,
      type_of_outward: eventForm.typeOfOutward,
      return_date: eventForm.returnDate?.toISOString().split("T")[0] || null,
      remarks: eventForm.remarks,
    };

    try {
      const res = await fetch(`${config.apiBaseURL}/outward/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showSuccessToast("Event saved!");
        setShowEventForm(false);

        //  Reset the form after save
        setEventForm({
          outDate: new Date(),
          time: format(new Date(), "hh:mm a"),
          eventName: "",
          project: "",
          typeOfOutward: "",
          returnDate: null,
          remarks: "",
        });

        fetchData(); // Refresh list
      } else {
        const err = await res.json();
        console.error("Save error:", err);
      }
    } catch (error) {
      console.error("Error submitting event:", error);
    }
  };

  const generateReport = async () => {
    const endpoints = {
      Sales: "/outward/sales/",
      Manufacture: "/outward/manufacture/",
      Event: "/outward/event/",
      Defects: "/outward/defects/",
    };

    const headers = tableHeaders[reportType];
    const endpoint = endpoints[reportType];

    if (!headers || !endpoint) {
      console.error("Invalid report type:", reportType);
      return;
    }

    try {
      const response = await fetch(`${config.apiBaseURL}${endpoint}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Backend error:", errText);
        throw new Error("Failed to fetch report data");
      }

      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        showInfoToast(`No data found for ${reportType}`);
        return;
      }

      const formatDate = (val) =>
        val ? new Date(val).toLocaleDateString("en-GB") : "N/A";

      const formatTime = (val) =>
        val
          ? new Date(`1970-01-01T${val}`).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })
          : "N/A";

      // Map fields dynamically based on reportType
      const formattedData = data.map((item, index) => {
        const row = {
          "S.No": index + 1, // Add serial number here
        };

        headers.forEach((header) => {
          switch (header) {
            case "Date":
            case "Out Date":
              row[header] = formatDate(item.date);
              break;
            case "Time":
              row[header] = formatTime(item.time || item.date);
              break;
            case "Return Date":
              row[header] = formatDate(item.return_date);
              break;
            case "Invoice Number":
              row[header] = item.invoice_no || "N/A";
              break;
            case "Gate Pass":
              row[header] = item.gatepass || "N/A";
              break;
            case "Component Spec":
              row[header] = item.specification || "N/A";
              break;
            case "Comp id":
              row[header] = item.component_id || "N/A";
              break;
            case "Vendor":
              row[header] = item.vendor || item.vendor_name || "N/A";
              break;
            case "Client":
              row[header] = item.client || "N/A";
              break;
            case "Description":
              row[header] = item.specification || "N/A";
              break;
            case "Event Name":
              row[header] = item.event_name || "N/A";
              break;
            case "Quantity":
            case "No. of Components":
              row[header] = item.quantity ?? "N/A";
              break;
            case "Project":
              row[header] = item.project || "N/A";
              break;
            case "Type of Outward":
              row[header] = item.type || item.type_of_outward || "N/A";
              break;
            case "Remarks":
              row[header] = item.remarks || "N/A";
              break;
            default:
              row[header] = "N/A";
          }
        });

        return row;
      });

      generateCSV(formattedData, `${reportType}_Report`);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  const generateCSV = (data, filename) => {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((row) =>
      Object.values(row)
        .map((val) => `"${val}"`)
        .join(",")
    );

    const csvContent = [headers, ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const generateManufacturePDF = (row) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(16);
    doc.text("DELIVERY NOTE", 80, 20);

    // Company Details
    doc.setFontSize(10);
    doc.text("Dronix Technologies Pvt Ltd", 15, 30);
    doc.text("133, Gandhi Rd, Alappakam,New Perungalathur,", 15, 35);
    doc.text(" Chennai, Sadhanathapuram, Tamil Nadu 600063", 15, 40);
    doc.text("GSTIN/UIN: 33AACGD1081K1ZS", 15, 45);

    // Delivery Info
    doc.text(`Delivery Note No: ${row.gatepass || "-"}`, 140, 30);
    doc.text(`Date: ${row.date || "-"}`, 140, 35);

    // Table using autoTable plugin
    autoTable(doc, {
      startY: 55,
      head: [
        ["Sl No", "Description of Goods", "HSN/SAC", "Quantity", "Remarks"],
      ],
      body: [
        [
          "1",
          row.specification || "-",
          row.component_id || "-",
          row.quantity || "-",
          row.remarks || "-",
        ],
      ],
    });

    // Footer
    const finalY = doc.lastAutoTable.finalY || 90;
    doc.text("Recd. in Good Condition", 15, finalY + 20);
    doc.text("for Dronix Technologies Pvt Ltd", 140, finalY + 20);

    // Download
    doc.save(`DeliveryNote_${row.gatepass || "NA"}.pdf`);
  };

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
          <button className="generate-report-btn" onClick={generateReport}>
            Generate Report
          </button>
          {reportType === "Sales" && (
            <button
              style={{
                cursor: "pointer",
                marginLeft: "auto",
                marginRight: 10,
                background: "transparent",
                border: "none",
              }}
              className="plus-button"
              title={showSalesForm ? "Cancel" : "Add Sales List"}
              onClick={() => setShowSalesForm(!showSalesForm)}
            >
              <img
                src={showSalesForm ? CancelIcon : AddIcon}
                alt={showSalesForm ? "Cancel" : "Add Sales List"}
                style={{ width: "20px", height: "20px" }}
              />
            </button>
          )}

          {reportType === "Manufacture" && (
            <button
              style={{
                cursor: "pointer",
                marginLeft: "auto",
                marginRight: 10,
                background: "transparent",
                border: "none",
              }}
              className="plus-button"
              title={showSalesForm ? "Cancel" : "Add Sales List"}
              onClick={() => setShowServiceForm(true)}
            >
              <img
                src={showServiceForm ? CancelIcon : AddIcon}
                alt={showServiceForm ? "Cancel" : "Add Sales List"}
                style={{ width: "20px", height: "20px" }}
              />
            </button>
          )}

          {reportType === "Event" && (
            <button
              style={{
                cursor: "pointer",
                marginLeft: "auto",
                marginRight: 10,
                background: "transparent",
                border: "none",
              }}
              className="plus-button"
              title={showSalesForm ? "Cancel" : "Add Sales List"}
              onClick={() => setShowEventForm(true)}
            >
              <img
                src={showEventForm ? CancelIcon : AddIcon}
                alt={showEventForm ? "Cancel" : "Add Sales List"}
                style={{ width: "20px", height: "20px" }}
              />
            </button>
          )}
        </div>
      </div>

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
            {tableData.length > 0 ? (
              tableData.map((row, index) => (
                <tr key={row.id}>
                  <td>{index + 1}</td>
                  {reportType === "Defects" && (
                    <>
                      <td>
                        {row.date
                          ? format(new Date(row.date), "dd-MM-yyyy")
                          : "-"}
                      </td>
                      <td>
                        {row.time
                          ? format(
                              new Date(`1970-01-01T${row.time}`),
                              "hh:mm a"
                            )
                          : "-"}
                      </td>

                      <td>{row.invoice_no || "-"}</td>
                      <td>{row.vendor || "-"}</td>
                      <td>{row.specification || "-"}</td>
                      <td>{row.quantity || "-"}</td>
                      <td>{row.project || "-"}</td>
                      <td>{row.type_of_outward || "-"}</td>
                      <td>{row.remarks || "-"}</td>
                    </>
                  )}
                  {reportType === "Sales" && (
                    <>
                      <td>
                        {row.date
                          ? format(new Date(row.date), "dd-MM-yyyy")
                          : "-"}
                      </td>
                      <td>
                        {row.time
                          ? format(
                              new Date(`1970-01-01T${row.time}`),
                              "hh:mm a"
                            )
                          : "-"}
                      </td>
                      <td>{row.invoice_no || "-"}</td>
                      <td>{row.specification || "-"}</td>
                      <td>{row.client || "-"}</td>
                      <td>{row.type_of_outward || "-"}</td>
                      <td>{row.remarks || "-"}</td>
                    </>
                  )}
                  {reportType === "Manufacture" && (
                    <>
                      <td>
                        {row.date
                          ? format(new Date(row.date), "dd-MM-yyyy")
                          : "-"}
                      </td>
                      <td>
                        {row.time
                          ? format(
                              new Date(`1970-01-01T${row.time}`),
                              "hh:mm a"
                            )
                          : "-"}
                      </td>
                      <td>{row.gatepass || "-"}</td>
                      <td>{row.specification || "-"}</td>
                      <td>{row.component_id || "-"}</td>
                      <td>{row.vendor || "-"}</td>
                      <td>{row.quantity || "-"}</td>
                      <td>{getProjectName(row.project)}</td>
                      <td>{row.type_of_outward || "-"}</td>
                      <td>{row.remarks || "-"}</td>

                      {/* New Column - PDF Button */}
                      <td>
                        <button
                          style={{
                            cursor: "pointer",
                            background: "transparent",
                            border: "none",
                          }}
                          title="Generate PDF"
                          onClick={() => generateManufacturePDF(row)}
                        >
                          📄
                        </button>
                      </td>
                    </>
                  )}

                  {reportType === "Event" && (
                    <>
                      <td>
                        {row.date
                          ? format(new Date(row.date), "dd-MM-yyyy")
                          : "-"}
                      </td>
                      <td>
                        {row.time
                          ? format(
                              new Date(`1970-01-01T${row.time}`),
                              "hh:mm a"
                            )
                          : "-"}
                      </td>
                      <td>{row.invoice_no || "-"}</td>
                      <td>{row.event_name || "-"}</td>
                      <td>{row.project || "-"}</td>
                      <td>{row.type_of_outward || "-"}</td>
                      <td>{row.quantity || "-"}</td>
                      <td>
                        {row.return_date
                          ? format(new Date(row.return_date), "dd-MM-yyyy")
                          : "-"}
                      </td>{" "}
                      <td>{row.remarks || "-"}</td>
                    </>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={currentHeaders.length + 1}>No data found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showSalesForm && (
        <div className="modal-overlay" onClick={() => setShowSalesForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: "5px" }}>Add Sales List</h2>

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
                value={salesForm.time}
                readOnly
                placeholder="Time"
              />
              <label htmlFor="">Invoice/Gate Pass</label>

              <input
                type="text"
                name="invoice"
                value={salesForm.invoice}
                onChange={handleSalesChange}
                required
                placeholder="gate pass"
              />
              <label htmlFor="">Description</label>
              <input
                type="text"
                name="specification"
                value={salesForm.specification}
                onChange={handleSalesChange}
                required
                placeholder="Description"
              />

              <label htmlFor="">Client</label>
              <input
                type="text"
                name="client"
                value={salesForm.client}
                onChange={handleSalesChange}
                required
                placeholder="client"
              />

              <label htmlFor="">Type Of Outward</label>
              <select
                name="typeOfOutward"
                value={salesForm.typeOfOutward}
                onChange={handleSalesChange}
                required
              >
                <option value="">Select Type</option>
                <option value="Return">Return</option>
                <option value="Non-Return">Non-Return</option>
              </select>

              <label htmlFor="">Remarks</label>

              <input
                type="text"
                name="remarks"
                value={salesForm.remarks}
                onChange={handleSalesChange}
                required
                placeholder="remarks"
              />
            </div>
            <div className="modal-actions">
              <button onClick={handleSalesSubmit}>Create</button>
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
            <h2 style={{ marginTop: "5px" }}>Add Event List</h2>

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
                value={eventForm.time}
                readOnly
                placeholder="Time"
              />
              <label>Event Name</label>
              <input
                type="text"
                name="eventName"
                value={eventForm.eventName}
                onChange={handleEventChange}
                placeholder="Event Name"
                required
              />
              <label>Project</label>
              <select
                name="project"
                value={eventForm.project}
                onChange={handleEventChange}
                required
              >
                <option value="">Select Project</option>
                {projectList.map((proj) => (
                  <option key={proj.project_id} value={proj.project_id}>
                    {proj.project_name}
                  </option>
                ))}
              </select>
              <label>Type of Outward</label>
              <select
                name="typeOfOutward"
                value={eventForm.typeOfOutward}
                onChange={handleEventChange}
                required
              >
                <option value="">Select Type</option>
                <option value="Return">Return</option>
                <option value="Non-Return">Non-Return</option>
              </select>
              <label>Return Date</label>
              <div className="date-input-container">
                <DatePicker
                  selected={eventForm.returnDate}
                  onChange={(date) =>
                    setEventForm((prev) => ({ ...prev, returnDate: date }))
                  }
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
              <input
                type="text"
                name="remarks"
                value={eventForm.remarks}
                onChange={handleEventChange}
                required
                placeholder="Remarks"
              />{" "}
            </div>

            <div className="modal-actions">
              <button className="modal-button save" onClick={handleEventSubmit}>
                Create
              </button>
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
            <h2 style={{ marginTop: "5px" }}>Add Service List</h2>

            {/* Your form fields go here */}
            <div className="form-grid">
              <label>Out Date</label>
              <div className="date-input-container">
                <DatePicker
                  selected={serviceForm.outDate}
                  dateFormat="dd-MM-yyyy"
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
                name="time"
                value={serviceForm.time}
                readOnly
                placeholder="Time"
              />

              <label>Gate Pass</label>
              <input
                type="text"
                name="gatePass"
                value={serviceForm.gatePass}
                onChange={handleChange}
                required
                placeholder="gate pass"
              />

              <label>Component Spec</label>
              <select
                name="specification"
                value={serviceForm.specification}
                onChange={handleSpecChange}
                required
              >
                <option value="">Select Spec</option>
                {componentSpecList.map((spec, index) => (
                  <option key={index} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>

              <label>Component ID</label>
              <input
                type="text"
                name="componentId"
                value={serviceForm.componentId}
                readOnly
                placeholder="Component ID"
              />

              <label>Serial Numbers</label>
              <div className="custom-multiselect" ref={dropdownRef}>
                <div
                  className="dropdown-display"
                  onClick={() => setShowSerialDropdown((prev) => !prev)}
                >
                  {serviceForm.serialNumbers.length > 0
                    ? serviceForm.serialNumbers.join(", ")
                    : "Select Serial Numbers"}
                  <span className="arrow">&#9662;</span>
                </div>

                {showSerialDropdown && (
                  <div className="dropdown-options">
                    {serialNumberList.map((sn, index) => (
                      <label key={index} className="dropdown-option">
                        <input
                          type="checkbox"
                          value={sn}
                          checked={serviceForm.serialNumbers.includes(sn)}
                          onChange={(e) => {
                            const selected = [...serviceForm.serialNumbers];
                            if (e.target.checked) {
                              selected.push(sn);
                            } else {
                              const i = selected.indexOf(sn);
                              if (i > -1) selected.splice(i, 1);
                            }
                            setServiceForm((prev) => ({
                              ...prev,
                              serialNumbers: selected,
                              quantity: selected.length,
                            }));
                          }}
                        />
                        {sn}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <label>Vendor</label>
              <select
                name="vendor"
                value={serviceForm.vendor}
                onChange={handleChange}
                required
              >
                <option value="">Select Vendor</option>
                {availableVendors.map((v, i) => (
                  <option key={i} value={v}>
                    {v}
                  </option>
                ))}
              </select>

              <label>Project</label>
              <select
                name="project"
                value={serviceForm.project}
                onChange={handleChange}
                required
              >
                <option value="">Select Project</option>
                {projectList.map((proj) => (
                  <option key={proj.project_id} value={proj.project_id}>
                    {proj.project_name}
                  </option>
                ))}
              </select>

              <label>Type Of Outward</label>
              <select
                name="typeOfOutward"
                value={serviceForm.typeOfOutward}
                onChange={handleChange}
                required
              >
                <option value="">Select Type</option>
                <option value="Return">Return</option>
                <option value="Non-Return">Non-Return</option>
              </select>

              <label>Quantity</label>
              <input
                type="number"
                name="quantity"
                value={serviceForm.serialNumbers.length}
                readOnly
                placeholder="Quantity"
              />

              <label>Return Date</label>
              <div className="date-input-container">
                <DatePicker
                  selected={serviceForm.returnDate}
                  onChange={(date) =>
                    setServiceForm((prev) => ({ ...prev, returnDate: date }))
                  }
                  dateFormat="dd-MM-yyyy"
                  placeholderText="dd-mm-yyyy"
                  className="input1"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                />
                <i className="fas fa-calendar-alt calendar-icon"></i>
              </div>

              <label>Remarks</label>
              <input
                type="text"
                name="remarks"
                value={serviceForm.remarks}
                onChange={handleChange}
                required
                placeholder="Remarks"
              />
            </div>

            <div className="modal-actions">
              <button onClick={handleManufactureSubmit}>Create</button>
              <button onClick={() => setShowServiceForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <ToastContainerComponent />
    </div>
  );
};

export default Outward;
