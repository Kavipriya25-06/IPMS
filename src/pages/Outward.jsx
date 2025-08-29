import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import config from "../Config.js";
import AddIcon from "../assets/Add.png";
import CancelIcon from "../assets/cancel.png";
import { useNavigate, useLocation } from "react-router-dom";

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
  const location = useLocation();
  const [reportType, setReportType] = useState(
    location.state?.reportType || "Defects"
  );
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
  const navigate = useNavigate();
  const [allVendors, setAllVendors] = useState([]);

  useEffect(() => {
    if (location.state?.reportType) {
      setReportType(location.state.reportType);
    }
  }, [location.state]);

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
    productName: "",
    bom: "",
    client: "",
    typeOfOutward: "",
    remarks: "",
    listOfDeliverables: "",
  });

  const [serviceForm, setServiceForm] = useState({
    outDate: new Date(),
    time: format(new Date(), "hh:mm a"),
    gatepass: "",
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
    num_components: 0, // 👈 match backend
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
      // Fetch component_id based on selected specification
      const resVendor = await fetch(`${config.apiBaseURL}/vendor_master/`);
      const vendorData = await resVendor.json();
      const filtered = vendorData.filter(
        (item) => item.component_specification === selectedSpec
      );

      const componentId = filtered.length > 0 ? filtered[0].component_id : "";
      setServiceForm((prev) => ({
        ...prev,
        componentId,
        // Don't auto-select vendor
        vendor: "",
      }));

      // Fetch serial numbers for selected component
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
    if (name === "typeOfOutward" && value === "Non-Return") {
      setEventForm((prev) => ({
        ...prev,
        typeOfOutward: value,
        returnDate: null,
      }));
    } else {
      setEventForm((prev) => ({ ...prev, [name]: value }));
    }
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
      // "Project",
      "Type of Outward",
      "Remarks",
    ],
    Sales: [
      "Out Date",
      "Time",
      "Invoice Number",
      "Product Name",
      "Client",
      "List of Deliverable",
      "Type of Outward",
      "Remarks",
    ],
    Manufacture: [
      "Out Date",
      "Time",
      "Gate Pass",
      "Component Spec",
      "Comp id",
      "Serial Number",
      "Vendor",
      "Quantity",
      "Project",
      "Return Date",
      "Type of Outward",
      "Remarks",
    ],
    Event: [
      "Out Date",
      "Time",
      "Gate Pass",
      "Event Name",
      "No.of Components",
      "Type of Outward",
      "Return Date",
      "Remarks",
    ],
  };

  const currentHeaders = tableHeaders[reportType] || [];

  // Fetch data from API when reportType changes
  // Fetch data from API when reportType changes
  const fetchData = async () => {
    try {
      if (!reportType) {
        setTableData([]);
        return;
      }

      // Convert reportType (e.g., "Defects") → lowercase ("defects")
      const endpoint = reportType.toLowerCase();

      const response = await axios.get(
        `${config.apiBaseURL}/outward/${endpoint}/`
      );

      setTableData(response.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setTableData([]);
    }
  };

  useEffect(() => {
    fetchData();
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

    const fetchVendors = async () => {
      try {
        const res = await fetch(`${config.apiBaseURL}/vendor_list/`);
        const data = await res.json();
        // Get unique vendor names
        const vendors = [...new Set(data.map((item) => item.vendor_name))];
        setAllVendors(vendors);
      } catch (err) {
        console.error("Failed to fetch all vendors", err);
      }
    };

    fetchProjects();
    fetchVendors();
  }, []);

  // To display project name in table
  const getProjectName = (projectId) => {
    const project = projectList.find(
      (p) => String(p.project_id) === String(projectId)
    );
    return project?.project_name || "-";
  };

  //Submit the Manufacturer
  const handleManufactureSubmit = async () => {
    if (!serviceForm.typeOfOutward) {
      showWarningToast("Please select Type of Outward.");
      return;
    }
    const payload = {
      category: "Manufacture",
      date: serviceForm.outDate?.toISOString().split("T")[0],
      time: serviceForm.time,
      gatepass: serviceForm.gatepass,
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
      const res = await fetch(`${config.apiBaseURL}/outward/manufacture/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        // --- Update serial number status to Repair ---
        for (const sn of serviceForm.serialNumbers) {
          try {
            await fetch(`${config.apiBaseURL}/inventory/${sn}/`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: "Repair" }),
            });
          } catch (err) {
            console.error(`Failed to update serial ${sn} status:`, err);
          }
        }

        showSuccessToast("Outward entry saved & serials moved to Repair!");
        setShowServiceForm(false);

        // Reset form after submit
        setServiceForm({
          outDate: new Date(),
          time: format(new Date(), "hh:mm a"),
          gatepass: "",
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
        showErrorToast("Failed to save outward entry");
      }
    } catch (err) {
      console.error("Save failed", err);
      showErrorToast("Network error while saving");
    }
  };

  const handleSalesSubmit = async () => {
    if (!salesForm.typeOfOutward) {
      showWarningToast("Please select Type of Outward.");
      return;
    }
    const payload = {
      category: "Sales",
      date: salesForm.outDate?.toISOString().split("T")[0],
      time: salesForm.time,
      invoice_no: salesForm.invoice,
      product_name: salesForm.productName,
      bom: salesForm.bom,
      client: salesForm.client,
      type_of_outward: salesForm.typeOfOutward,
      remarks: salesForm.remarks,
      list_of_deliverables: salesForm.listOfDeliverables,
    };

    try {
      const res = await fetch(`${config.apiBaseURL}/outward/sales/`, {
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
          productName: "",
          bom: "",
          client: "",
          typeOfOutward: "",
          remarks: "",
          listOfDeliverables: "",
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
    if (!eventForm.typeOfOutward) {
      showWarningToast("Please select Type of Outward.");
      return;
    }
    const payload = {
      category: "Event",
      date: eventForm.outDate?.toISOString().split("T")[0],
      time: eventForm.time,
      gatepass: eventForm.gatepass,
      event_name: eventForm.eventName,
      num_components: eventForm.num_components || 0, // 👈 consistent
      type_of_outward: eventForm.typeOfOutward,
      return_date: eventForm.returnDate?.toISOString().split("T")[0] || null,
      remarks: eventForm.remarks,
    };

    try {
      const res = await fetch(`${config.apiBaseURL}/outward/event/`, {
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
          num_components: "", // reset new field
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

      // Special formatters
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

      // Field mapping (header -> backend key)
      const headerFieldMap = {
        Date: "date",
        "Out Date": "date",
        Time: "time",
        "Return Date": "return_date",
        "Invoice Number": "invoice_no",
        "Gate Pass": "gatepass",
        "Component Spec": "specification",
        "Comp id": "component_id",
        Vendor: "vendor",
        Client: "client",
        Description: "specification",
        "Event Name": "event_name",
        Quantity: "quantity",
        Project: "project",
        "Type of Outward": "type_of_outward",
        Remarks: "remarks",
        "Serial Number": "serial_numbers",
        "List of Deliverables": "list_of_deliverables",
      };

      // Formatter overrides
      const headerFormatters = {
        Date: formatDate,
        "Out Date": formatDate,
        Time: formatTime,
        "Return Date": formatDate,
      };

      // Map fields dynamically based on reportType
      const formattedData = data.map((item, index) => {
        const row = { "S.No": index + 1 };

        headers.forEach((header) => {
          const field = headerFieldMap[header];
          const formatter = headerFormatters[header];

          if (field) {
            const value = item[field];
            row[header] = formatter ? formatter(value) : value ?? "N/A";
          } else {
            // If header not in mapping, try to pick directly from item
            row[header] = item[header.toLowerCase()] ?? "N/A";
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

  const generateManufacturePDF = async (row) => {
    try {
      // (vendor fetching code stays same...)

      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("DELIVERY NOTE", 80, 20);

      // Company details...
      // ...

      // Dynamic table
      const tableHead = ["Sl No"];
      const tableRow = ["1"];

      Object.entries(headerFieldMap).forEach(([header, field]) => {
        if (row[field]) {
          tableHead.push(header);
          tableRow.push(row[field]);
        }
      });

      autoTable(doc, {
        startY: 105,
        head: [tableHead],
        body: [tableRow],
      });

      doc.save(`DeliveryNote_${row.gatepass || "NA"}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      showErrorToast("Failed to fetch vendor details for PDF");
    }
  };

  // Generate next GatePass ID
  // Generate next GatePass ID (shared between Manufacture + Event)
  const generateNextGatePass = async () => {
    try {
      // Fetch latest manufacture + event records
      const [manufactureRes, eventRes] = await Promise.all([
        fetch(`${config.apiBaseURL}/outward/manufacture/`),
        fetch(`${config.apiBaseURL}/outward/event/`),
      ]);

      if (!manufactureRes.ok || !eventRes.ok)
        throw new Error("Failed to fetch outward records");

      const [manufactureData, eventData] = await Promise.all([
        manufactureRes.json(),
        eventRes.json(),
      ]);

      const allData = [...manufactureData, ...eventData];

      const gatePasses = allData
        .map((item) => item.gatepass)
        .filter((gp) => gp && gp.startsWith("GP-"));

      let maxNum = 0;
      gatePasses.forEach((gp) => {
        const num = parseInt(gp.replace("GP-", ""), 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      });

      const nextNum = (maxNum + 1).toString().padStart(5, "0");
      return `GP-${nextNum}`;
    } catch (err) {
      console.error("Error generating gatepass:", err);
      return `GP-00001`;
    }
  };

  const openServiceForm = async () => {
    const newGP = await generateNextGatePass(); // always fetch latest
    setServiceForm((prev) => ({ ...prev, gatepass: newGP }));
    setShowServiceForm(true);
  };

  const openEventForm = async () => {
    const newGP = await generateNextGatePass(); // always fetch latest
    setEventForm((prev) => ({ ...prev, gatepass: newGP }));
    setShowEventForm(true);
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
        <select
          className="report-select"
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
        >
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
              title="Add Service List"
              onClick={openServiceForm}
            >
              <img
                src={showServiceForm ? CancelIcon : AddIcon}
                alt={showServiceForm ? "Cancel" : "Add Service List"}
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
              title="Add Event List"
              onClick={openEventForm}
            >
              <img
                src={showEventForm ? CancelIcon : AddIcon}
                alt={showEventForm ? "Cancel" : "Add Event List"}
                style={{ width: "20px", height: "20px" }}
              />
            </button>
          )}
        </div>
      </div>

      <div className="table-container" style={{ marginTop: "-10px" }}>
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
                      {/* <td>{getProjectName(row.project?.project_id) || "-"}</td> */}
                      <td>{row.type_of_outward || "-"}</td>
                      <td className="specification-cell" title={row.remarks}>
                        {row.remarks || "-"}
                      </td>
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
                      <td className="specification-cell" title={row.invoice_no}>
                        {row.invoice_no || "-"}
                      </td>
                      <td
                        style={{
                          color: "black",
                          cursor: row.product_name ? "pointer" : "default",
                          textDecoration: row.product_name
                            ? "underline"
                            : "none",
                        }}
                        onClick={() =>
                          row.product_name &&
                          navigate("/outward/add-sales-list", {
                            state: { outwardId: row.id },
                          })
                        }
                        className="specification-cell"
                        title={row.product_name || ""}
                      >
                        {row.product_name || "-"}
                      </td>

                      <td>{row.client || "-"}</td>
                      <td
                        className="deliverables-cell"
                        title={row.list_of_deliverables}
                      >
                        {row.list_of_deliverables || "-"}
                      </td>
                      <td>{row.type_of_outward || "-"}</td>
                      <td className="specification-cell" title={row.remarks}>
                        {row.remarks || "-"}
                      </td>
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
                      <td
                        className="specification-cell"
                        title={row.specification}
                      >
                        {row.specification || "-"}
                      </td>
                      <td>{row.component_id || "-"}</td>
                      <td>{row.serial_numbers || "-"}</td>
                      <td className="specification-cell" title={row.vendor}>
                        {row.vendor || "-"}
                      </td>
                      <td>{row.quantity || "-"}</td>
                      <td>{getProjectName(row.project) || "-"}</td>
                      <td>
                        {row.return_date
                          ? format(new Date(row.return_date), "dd-MM-yyyy")
                          : "-"}
                      </td>
                      <td>{row.type_of_outward || "-"}</td>
                      <td className="specification-cell" title={row.remarks}>
                        {row.remarks || "-"}
                      </td>

                      {/* New Column - PDF Button */}
                      {/* <td>
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
                      </td> */}
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
                      <td>{row.gatepass || "-"}</td>
                      <td
                        style={{
                          color: "black",
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                        onClick={() =>
                          navigate("/outward/add-event-list", {
                            state: { outwardId: row.id },
                          })
                        }
                        className="specification-cell"
                        title={row.event_name}
                      >
                        {row.event_name || "-"}
                      </td>
                      <td>{row.num_components || "-"}</td>
                      <td>{row.type_of_outward || "-"}</td>
                      <td>
                        {row.return_date
                          ? format(new Date(row.return_date), "dd-MM-yyyy")
                          : "-"}
                      </td>{" "}
                      <td className="specification-cell" title={row.remarks}>
                        {row.remarks || "-"}
                      </td>
                    </>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={currentHeaders.length + 1}
                  style={{ textAlign: "center", color: "gray" }}
                >
                  No data found
                </td>
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
                  className="input1 disabled-date"
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
                style={{
                  backgroundColor: "#f0f0f0ff",
                  color: "gray",
                  cursor: "not-allowed",
                }}
              />
              <label htmlFor="">Invoice Number</label>

              <input
                type="text"
                name="invoice"
                value={salesForm.invoice}
                onChange={handleSalesChange}
                required
                placeholder="Invoice no"
              />
              <label htmlFor="">Product Name</label>
              <input
                type="text"
                name="productName"
                value={salesForm.productName}
                onChange={handleSalesChange}
                required
                placeholder="product name"
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

              <label>List of Deliverables</label>
              <input
                type="text"
                name="listOfDeliverables"
                value={salesForm.listOfDeliverables}
                onChange={(e) =>
                  setSalesForm({
                    ...salesForm,
                    listOfDeliverables: e.target.value,
                  })
                }
                placeholder="Enter deliverables"
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
                  className="input1 disabled-date"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  readOnly
                  disabled
                />
                <i className="fas fa-calendar-alt calendar-icon disabled-icon"></i>
              </div>
              <label>Time</label>
              <input
                type="text"
                value={eventForm.time}
                readOnly
                placeholder="Time"
                style={{
                  backgroundColor: "#f0f0f0ff",
                  color: "gray",
                  cursor: "not-allowed",
                }}
              />
              <label htmlFor="">Gate Pass</label>
              <input
                type="text"
                name="gatepass"
                value={eventForm.gatepass}
                readOnly
                placeholder="Auto Generated Gate Pass"
                style={{
                  backgroundColor: "#f0f0f0ff",
                  color: "gray",
                  cursor: "not-allowed",
                }}
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
              <label>No.Of Components</label>
              <input
                type="number"
                placeholder="No. of Components"
                value={
                  eventForm.num_components === 0 ? "" : eventForm.num_components
                }
                onChange={(e) => {
                  let val = e.target.value.replace(/^0+(?=\d)/, ""); // remove leading zeros
                  setEventForm({
                    ...eventForm,
                    num_components: val ? Number(val) : "", // keep empty if nothing
                  });
                }}
                style={{
                  padding: "6px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  width: "100%",
                }}
              />
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
                  className={`input1 ${
                    eventForm.typeOfOutward === "Non-Return"
                      ? "disabled-date"
                      : ""
                  }`}
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  disabled={eventForm.typeOfOutward === "Non-Return"}
                  required={eventForm.typeOfOutward === "Return"}
                />
                <i
                  className={`fas fa-calendar-alt calendar-icon ${
                    eventForm.typeOfOutward === "Non-Return"
                      ? "disabled-icon"
                      : ""
                  }`}
                ></i>
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
                  className="input1 disabled-date"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  disabled
                  style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
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
                style={{
                  backgroundColor: "#f0f0f0ff",
                  color: "gray",
                  cursor: "not-allowed",
                }}
              />

              <label htmlFor="">Gate Pass</label>
              <input
                type="text"
                name="gatepass"
                value={serviceForm.gatepass}
                readOnly
                placeholder="Auto Generated Gate Pass"
                style={{
                  backgroundColor: "#f0f0f0ff",
                  color: "gray",
                  cursor: "not-allowed",
                }}
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
                {allVendors.map((v, i) => (
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
                    setServiceForm((prev) => ({
                      ...prev,
                      returnDate: date,
                    }))
                  }
                  dateFormat="dd-MM-yyyy"
                  placeholderText="dd-mm-yyyy"
                  className={`input1 ${
                    serviceForm.typeOfOutward === "Non-Return"
                      ? "disabled-date"
                      : ""
                  }`}
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  disabled={serviceForm.typeOfOutward === "Non-Return"}
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
