import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import config from "../Config"; // Import config for API endpoints
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";
import { format } from "date-fns";
import { showErrorToast, showSuccessToast, showWarningToast } from "./Toastify";
import Filter from "../assets/Filter_icon.svg";

const POOrderList = ({ user }) => {
  const [poOrders, setPOOrders] = useState([]); // State to store PO orders
  const [poMaster, setPOMaster] = useState([]); // State to store PO master data
  const [vendorContact, setVendorContact] = useState(null);
  const [vendorName, setVendorName] = useState(null);
  const [poListData, setPOListData] = useState(null);
  const [orderStatuses, setOrderStatuses] = useState([]); // State to store statuses for each PO
  const [statusPopup, setStatusPopup] = useState(null); // State for status popup
  const navigate = useNavigate(); // Navigation hook
  const [showModal, setShowModal] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false); // Track visibility of scroll-to-top button
  const datePickerRef = React.useRef(null);

  const [currentPO, setCurrentPO] = useState(null); // Store the current PO for email

  const [nameFilter, setNameFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef(null);

  const [dateFilter, setDateFilter] = useState("");

  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [loading, setLoading] = useState(true);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  useEffect(() => {
    fetchPOOrders();
    fetchPOMaster();
    fetchOrderStatuses();
  }, []);

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

  // The user object is now passed as a prop
  const isAdmin = user?.role === "Admin";
  const isProcurement = user?.role === "Procurement";
  const isFinance = user?.role === "Finance";

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Smooth scroll effect
    });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target)
      ) {
        setStatusDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch Vendor Contact and Name
  const fetchVendorDetails = async (vendorId) => {
    try {
      // Fetch vendor contact details
      const contactResponse = await fetch(
        `${config.apiBaseURL}/vendor_sub_list/`
      );
      const contactResult = await contactResponse.json();
      const contactDetails = contactResult.find(
        (contact) => contact.vendor === vendorId
      );
      // console.log("Fetched vendor", vendorId);
      // console.log("Contact details", contactResult);

      // Fetch vendor name
      const vendorResponse = await fetch(`${config.apiBaseURL}/vendor_list/`);
      const vendorResult = await vendorResponse.json();
      const vendorDetails = vendorResult.find(
        (vendor) => vendor.vendor_id === vendorId
      );

      setVendorContact(contactDetails);
      setVendorName(vendorDetails?.vendor_name);
    } catch (err) {
      console.error("Error fetching vendor details:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const fetchPOListData = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/po_list/`);
      const result = await response.json();
      const filteredPO = result.find((po) => po.id === currentPO.id);
      if (filteredPO) {
        setPOListData(filteredPO);
        fetchVendorDetails(filteredPO.cart_details.vendor_id); // Fetch vendor details
      }
    } catch (error) {
      console.error("Error fetching PO list data:", error);
    }
  };

  // Fetch PO orders
  const fetchPOOrders = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${config.apiBaseURL}/po_list/`);
      const result = await response.json();
      if (Array.isArray(result)) {
        setPOOrders(result);
      } else {
        console.error("Unexpected PO List API response:", result);
        setPOOrders([]);
      }
    } catch (error) {
      console.error("Error fetching PO List:", error);
    } finally {
      setLoading(false); // Stop loading after both calls
    }
  };

  // Fetch PO master
  const fetchPOMaster = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/po_master/`);
      const result = await response.json();
      if (Array.isArray(result)) {
        setPOMaster(result);
      } else {
        console.error("Unexpected PO Master API response:", result);
        setPOMaster([]);
      }
    } catch (error) {
      console.error("Error fetching PO Master:", error);
    }
  };

  // Fetch order statuses
  const fetchOrderStatuses = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/order_view/`);
      const result = await response.json();
      if (Array.isArray(result)) {
        setOrderStatuses(result);
      } else {
        console.error("Unexpected Order Status API response:", result);
        setOrderStatuses([]);
      }
    } catch (error) {
      console.error("Error fetching Order Status:", error);
    }
  };

  const finalCost = (poId) => {
    const relevantPOMaster = poMaster.filter((po) => po.PO_id === poId);
    const finalPrice = relevantPOMaster.reduce((acc, po) => {
      const final_cost = parseFloat(po.cart_details.total_cost || 0);
      return (acc += final_cost);
    }, 0);
    return finalPrice;
  };

  // Combine PO and Statuses
  const getAggregatedStatus = (poId) => {
    const relevantPOMaster = poMaster.filter((po) => po.PO_id === poId);
    const poMasterIds = relevantPOMaster.map((po) => po.id);
    const relevantStatuses = orderStatuses.filter((status) =>
      poMasterIds.includes(status.po_master_id)
    );

    if (relevantStatuses.length === 0)
      return { status: "Pending", mixed: false };

    const uniqueStatuses = new Set(
      relevantStatuses.map((status) => {
        if (status.received_status === "Received") return "Received";
        if (status.customer_status === "Shipped") return "Shipped";
        if (status.order_placed_status === "Ordered") return "Ordered";
        return "Pending";
      })
    );

    if (uniqueStatuses.size === 1) {
      return { status: Array.from(uniqueStatuses)[0], mixed: false };
    }
    return { status: "In Progress", mixed: true };
  };

  const handleSendEmail = async () => {
    if (!currentPO) {
      showWarningToast("No Purchase Order selected!");
      return;
    }

    try {
      // Step 1: Generate the PDF as a Blob
      const pdfBlob = generatePDF(currentPO, poMaster);
      // console.log("The PO details here", currentPO);

      // Step 2: Upload the PDF to the backend
      const formDataUpload = new FormData();
      const pdfFileName = `PO_${currentPO.id}.pdf`;

      // Split comma-separated emails into lists
      const recipientList = formData.recipient
        .split(",")
        .map((email) => email.trim());
      const ccList = formData.cc.split(",").map((email) => email.trim());
      const bccList = formData.bcc.split(",").map((email) => email.trim());

      // console.log("PDF Blob:", pdfBlob, "Blob size", pdfBlob.size);
      // formDataUpload.append("file", new File([pdfBlob], pdfFileName)); // Attach file as FormData
      formDataUpload.append(
        "file",
        new File([pdfBlob], pdfFileName, { type: "application/pdf" })
      );

      const uploadResponse = await fetch(
        `${config.apiBaseURL}/file_upload_view/`,
        {
          method: "POST",
          body: formDataUpload,
        }
      );

      if (!uploadResponse.ok) {
        const uploadError = await uploadResponse.json();
        console.error("Error uploading file:", uploadError);
        showErrorToast(`Failed to upload file: ${uploadError.error}`);
        return;
      }

      const uploadData = await uploadResponse.json();
      const uploadedFilePath = uploadData.file_path; // Extract the file path from the response

      // Append email lists as JSON strings
      formDataUpload.append("recipient", JSON.stringify(recipientList));
      formDataUpload.append("cc", JSON.stringify(ccList));
      formDataUpload.append("bcc", JSON.stringify(bccList));
      formDataUpload.append(
        "sender_title",
        `Order Details for PO ID: ${currentPO.id}`
      );
      formDataUpload.append(
        "subject",
        formData.subject || `Order Details for PO ID: ${currentPO.id}`
      );
      formDataUpload.append(
        "body",
        formData.body || `Please find attached the PO ID: ${currentPO.id}`
      );
      formDataUpload.append(
        "filename",
        new File([pdfBlob], pdfFileName, { type: "application/pdf" })
      ); // Attach the generated PDF

      // console.log("The payload we are sending", formDataUpload);

      // sending the email step

      const response = await fetch(`${config.apiBaseURL}/send-email/`, {
        method: "POST",
        body: formDataUpload,
      });

      if (response.ok) {
        const emailData = await response.json();
        showSuccessToast(`Email sent successfully: ${emailData.message}`);
        setShowModal(false);
      } else {
        const emailError = await response.json();
        console.error("Error sending email:", emailError);
        showErrorToast(`Failed to send email: ${emailError.error}`);
      }
    } catch (error) {
      console.error("Error during file upload or email send:", error);
      showErrorToast(
        "An error occurred while uploading the file or sending the email."
      );
    }
  };

  // Generating the PDF is below

  const generatePDF = (poDetails, poMaster) => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text("Purchase Order", 105, 10, { align: "center" });
    doc.text(`PO ID: ${poDetails.id}`, 10, 20);
    doc.text(`Vendor Name: ${poDetails.cart_details.vendor_name}`, 10, 30);
    doc.text(`Date: ${poDetails.date}`, 10, 40);
    doc.text(`GSTIN: ${poDetails.cart_details.gstn}`, 10, 50);
    doc.text("Order Details:", 10, 60);

    const tableColumns = [
      "Description of goods",
      "Per",
      "Quantity",
      "Unit Price",
      "GST (%)",
      "Total Cost",
    ];

    const tableRows = poMaster
      .filter((item) => item.PO_id === poDetails.id)
      .map((item) => [
        item.cart_details.component_specification,
        item.cart_details.unit_of_measurement,
        item.cart_details.quantity,
        item.cart_details.unit_price,
        item.cart_details.GST,
        item.cart_details.total_cost,
      ]);

    // Use autoTable correctly
    autoTable(doc, {
      head: [tableColumns],
      body: tableRows,
      startY: 70,
    });

    return doc.output("blob");
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString("en-CA") : "";

  const filteredPOOrders = poOrders
    .filter((order) => {
      const { status } = getAggregatedStatus(order.id);

      const q = (nameFilter || "").trim().toLowerCase();
      const matchesQuery =
        !q ||
        (order?.cart_details?.vendor_name || "").toLowerCase().includes(q) ||
        String(order?.id || "")
          .toLowerCase()
          .includes(q); // ← PO ID match

      const matchesStatus = statusFilter ? status === statusFilter : true;

      const matchesDate =
        fromDate && toDate
          ? (() => {
              const orderDate = new Date(order.date);
              orderDate.setHours(0, 0, 0, 0);
              return (
                orderDate >= new Date(fromDate.setHours(0, 0, 0, 0)) &&
                orderDate <= new Date(toDate.setHours(23, 59, 59, 999))
              );
            })()
          : true;

      return matchesQuery && matchesStatus && matchesDate;
    })
    .sort((a, b) => {
      if (!sortField) return 0;

      let aValue, bValue;
      if (sortField === "id") {
        aValue = a.id;
        bValue = b.id;
      } else if (sortField === "total_cost") {
        aValue = finalCost(a.id);
        bValue = finalCost(b.id);
      } else if (sortField === "date") {
        aValue = new Date(a.date);
        bValue = new Date(b.date);
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  // Close Status Popup
  const handleClosePopup = () => {
    setStatusPopup(null);
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchPOOrders();
    fetchPOMaster();
    fetchOrderStatuses();
  }, []);

  useEffect(() => {
    if (currentPO) {
      fetchPOListData();
    }
  }, [currentPO]); // Dependency array includes currentPO

  const [dropdownCoords, setDropdownCoords] = useState({ top: 0, left: 0 });
  useEffect(() => {
    if (statusDropdownOpen && statusDropdownRef.current) {
      const rect = statusDropdownRef.current.getBoundingClientRect();
      setDropdownCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
    }
  }, [statusDropdownOpen]);

  return (
    <div>
      <div className="header">
        <h2>PO Order List</h2>
        <button
          style={{
            cursor: "pointer",
            background: "transparent",
            border: "none",
          }}
          title="Filter by Date"
          onClick={() => setShowDateFilter(true)}
        >
          <img
            src={Filter}
            alt="Filter"
            style={{ width: "25px", height: "30px" }}
          />
        </button>
        {(fromDate || toDate) && (
          <div style={{ fontSize: "14px", margin: "10px 0", color: "#555" }}>
            🗓️ {fromDate && `From: ${format(fromDate, "dd-MM-yyyy")}`}
            {fromDate && toDate && " | "}
            {toDate && `To: ${format(toDate, "dd-MM-yyyy")}`}
            <button
              className="clear-date-button"
              onClick={() => {
                setFromDate(null);
                setToDate(null);
              }}
              title="Clear Date Filter"
            >
              Clear
            </button>
          </div>
        )}
      </div>
      <div class="center-wrapper">
        <div className="search-bar-container">
          <input
            type="text"
            placeholder="Filter by PO-ID  or Vendor Name"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="search-bar"
          />
          <span className="search-icon">
            <i className="fa fa-search" aria-hidden="true"></i>
          </span>
        </div>
      </div>

      <div className="table-container">
        {poOrders.length === 0 ? (
          <p style={{ color: "gray" }}>No Purchase Orders found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th
                  onClick={() => handleSort("id")}
                  style={{ cursor: "pointer", textDecoration: "underline" }}
                >
                  PO ID{" "}
                  {sortField === "id"
                    ? sortOrder === "asc"
                      ? " 🔼"
                      : " 🔽"
                    : ""}
                </th>
                <th className="vendor-name-filters">Vendor Name</th>

                <th className="status-dropdown-wrapper" ref={statusDropdownRef}>
                  <div
                    className="status-dropdown"
                    onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                  >
                    {statusFilter || "Status"}
                    <span className="status-dropdown-icon">▼</span>
                  </div>

                  {statusDropdownOpen && (
                    <div
                      className="status-dropdown-options"
                      style={{
                        position: "fixed",
                        top: dropdownCoords.top,
                        left: dropdownCoords.left,
                        zIndex: 9999,
                        width: "150px",
                      }}
                    >
                      <div
                        className="status-dropdown-option"
                        onClick={() => {
                          setStatusFilter("");
                          setStatusDropdownOpen(false);
                        }}
                      >
                        All
                      </div>
                      {[
                        "Pending",
                        "Ordered",
                        "Shipped",
                        "Received",
                        "In Progress",
                      ].map((status) => (
                        <div
                          key={status}
                          className="status-dropdown-option"
                          onClick={() => {
                            setStatusFilter(status);
                            setStatusDropdownOpen(false);
                          }}
                        >
                          {status}
                        </div>
                      ))}
                    </div>
                  )}
                </th>

                <th
                  onClick={() => handleSort("total_cost")}
                  style={{ cursor: "pointer", textDecoration: "underline" }}
                >
                  Total Cost{" "}
                  {sortField === "total_cost"
                    ? sortOrder === "asc"
                      ? " 🔼"
                      : " 🔽"
                    : ""}
                </th>
                <th style={{ cursor: "pointer" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    {!dateFilter && <span style={{}}>Date</span>}
                    {/* <DatePicker
                      selected={dateFilter}
                      onChange={(date) => setDateFilter(date)}
                      ref={datePickerRef}
                      dateFormat="yyyy-MM-dd"
                      customInput={<div />}
                      popperPlacement="bottom-end"
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                    />

                    {dateFilter && (
                      <span style={{ fontSize: "16px", color: "White" }}>
                        {format(dateFilter, "dd-MM-yyyy")}
                      </span>
                    )} */}

                    <FaCalendarAlt
                      style={{
                        fontSize: "14px",
                        cursor: "pointer",
                        color: "#333",
                      }}
                      // onClick={() => datePickerRef.current.setOpen(true)}
                    />
                  </div>
                </th>

                {/* {(isAdmin || isProcurement) && <th>Actions</th>} */}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    style={{ textAlign: "center", padding: "10px" }}
                  >
                    <div className="spinner"></div>
                    Loading PO List...
                  </td>
                </tr>
              ) : filteredPOOrders.length === 0 && fromDate && toDate ? (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      textAlign: "center",
                      color: "gray",
                      padding: "10px",
                    }}
                  >
                    No data for selected date range:{" "}
                    {format(fromDate, "dd-MM-yyyy")} to{" "}
                    {format(toDate, "dd-MM-yyyy")}
                  </td>
                </tr>
              ) : filteredPOOrders.length === 0 && nameFilter.trim() ? (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      textAlign: "center",
                      color: "gray",
                      padding: "10px",
                    }}
                  >
                    No data found for name "{nameFilter}"
                  </td>
                </tr>
              ) : filteredPOOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      textAlign: "center",
                      color: "gray",
                      padding: "10px",
                    }}
                  >
                    No purchase orders available.
                  </td>
                </tr>
              ) : (
                filteredPOOrders.map((order) => {
                  const { status } = getAggregatedStatus(order.id);
                  const finalPrice = finalCost(order.id);
                  return (
                    <tr key={order.id}>
                      <td
                        style={{
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                        onClick={() => navigate(`/po-details/${order.id}`)}
                      >
                        {order.id}
                      </td>
                      <td>{order.cart_details.vendor_name}</td>
                      <td>{order.status}</td>
                      <td style={{ textAlign: "right" }}>
                        ₹
                        {parseFloat(finalPrice).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td>{format(new Date(order.date), "dd-MM-yyyy")}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
      {/* Email Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="popup">
            <h3>Send Email for PO ID: {currentPO?.id}</h3>
            <form style={{ marginTop: "5px" }}>
              <div
                style={{
                  padding: 5,
                  display: "flex",
                  justifyContent: "space-between",
                }}
                className="form-row"
              >
                <label>Recipient:</label>
                <input
                  type="text"
                  name="recipient"
                  value={formData.recipient}
                  onChange={handleChange}
                  placeholder="Enter multiple emails separated by commas"
                  required
                />
              </div>

              <div
                style={{
                  padding: 5,
                  display: "flex",
                  justifyContent: "space-between",
                }}
                className="form-row"
              >
                <label>CC:</label>
                <input
                  type="text"
                  name="cc"
                  value={formData.cc}
                  onChange={handleChange}
                  placeholder="Enter multiple emails separated by commas"
                />
              </div>

              <div
                style={{
                  padding: 5,
                  display: "flex",
                  justifyContent: "space-between",
                }}
                className="form-row"
              >
                <label>BCC:</label>
                <input
                  type="text"
                  name="bcc"
                  value={formData.bcc}
                  onChange={handleChange}
                  placeholder="Enter multiple emails separated by commas"
                />
              </div>

              <div
                style={{
                  padding: 5,
                  display: "flex",
                  justifyContent: "space-between",
                }}
                className="form-row"
              >
                <label>Body:</label>
                <textarea
                  name="body"
                  value={formData.body}
                  onChange={handleChange}
                />
              </div>

              <div className="actions-button" style={{ marginTop: "20px" }}>
                <button
                  className="edit-button"
                  type="button"
                  onClick={handleSendEmail}
                >
                  Send Email
                </button>
                <button
                  className="cancel-button"
                  type="button"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status Popup */}
      {statusPopup && (
        <div className="popup">
          <h3>Status for PO ID: {statusPopup.poId}</h3>
          {Object.entries(statusPopup.groupedStatuses).map(
            ([statusType, components]) => (
              <div key={statusType}>
                <h4>{statusType}</h4>
                {components.length > 0 ? (
                  <ul>
                    {components.map((componentId, idx) => (
                      <li key={idx}>{componentId}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No components</p>
                )}
              </div>
            )
          )}
          <button onClick={handleClosePopup}>Close</button>
        </div>
      )}

      {showDateFilter && (
        <div className="modal-overlay" onClick={() => setShowDateFilter(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span
              className="x-button"
              style={{ fontWeight: "lighter" }}
              onClick={() => setShowDateFilter(false)}
            >
              &times;
            </span>

            <h4 style={{ marginTop: "20px", marginBottom: "10px" }}>
              Filter Date
            </h4>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
              className=""
            >
              <label style={{ whiteSpace: "nowrap" }}>From Date:</label>
              <div className="date-input-container">
                <DatePicker
                  selected={fromDate}
                  onChange={(date) => setFromDate(date)} // required to update the value
                  dateFormat="dd-MM-yyyy"
                  placeholderText="dd-mm-yyyy"
                  className="input1"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  popperPlacement="bottom"
                  portalId="datepicker-portal-target"
                  style={{ marginTop: "20px" }}
                />

                <i
                  className="fas fa-calendar-alt calendar-icon"
                  style={{ marginTop: "-4px" }}
                ></i>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <label style={{ whiteSpace: "nowrap" }}>To Date:</label>
              <div className="date-input-container">
                <DatePicker
                  selected={toDate}
                  onChange={(date) => setToDate(date)}
                  dateFormat="dd-MM-yyyy"
                  placeholderText="dd-mm-yyyy"
                  className="input1"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  popperPlacement="bottom-start"
                  portalId="datepicker-portal-target"
                />

                <i
                  className="fas fa-calendar-alt calendar-icon"
                  style={{ marginTop: "-4px" }}
                ></i>
              </div>
            </div>

            <div
              className="modal-actions"
              style={{
                marginTop: "10px",
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => {
                  setShowDateFilter(false); // just close the popup
                }}
              >
                Apply
              </button>

              <button
                onClick={() => {
                  setFromDate(null);
                  setToDate(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
          <div id="datepicker-portal-target"></div>
        </div>
      )}
      <style>{`
              .disabled-row {
                background-color: #e0e0e0;
                color: #a0a0a0;
                pointer-events: none;
              }
              .disabled-row button {
                cursor: not-allowed;
              }
      
              .react-datepicker__day,
              .react-datepicker__day-name {
                width: 2em;
                line-height: 2em;
              }
      
              .react-datepicker__current-month,
              .react-datepicker__header {
                font-size: 14px;
              }
      
              .return-button {
                background-color: red;
                color: white;
                border: none;
                padding: 5px 10px;
                cursor: pointer;
                border-radius: 4px;
                font-size: 12px;
                margin-left: 10px;
              }
              .return-button:hover {
                background-color: darkred;
              }
              .modal {
                position: fixed;
                top: 50%;
                left: 50%;
                display: flex;
                justify-content: center;
                align-items: center;
                transform: translate(-50%, -50%);
              }
              .modal-content {
                background: white;
                padding: 15px; 
                width: 350px;
                text-align: center;
                position:absolute;
              }
              .modal-content input {
                width: 100%;
                padding: 8px;
                margin-top: 5px;
                margin-bottom: 10px;
                border: 1px solid #ccc;
                border-radius: 5px;
              }
              .modal-buttons {
                display: flex;
                justify-content: space-between;
              }
              .confirm-button {
                background-color: green;
                color: white;
                padding: 8px 12px;
                border: none;
                cursor: pointer;
                border-radius: 5px;
              }
              .confirm-button:hover {
                background-color: darkgreen;
              }
              .cancel-button {
                background-color: gray;
                color: white;
                padding: 8px 12px;
                border: none;
                cursor: pointer;
                border-radius: 5px;
              }
              .cancel-button:hover {
                background-color: darkgray;
              }
      
      
            `}</style>

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
    </div>
  );
};

export default POOrderList;
