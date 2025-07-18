import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import config from "../Config"; // Import config for API endpoints
import axios from "axios";

import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  ToastContainerComponent,
} from "./Toastify.jsx"; // Import Toastify utilities
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const POOrderMaster = ({ user }) => {
  const { poId } = useParams(); // Extract PO ID from the route
  const [poDetails, setPODetails] = useState([]);
  const [poData, setPOData] = useState(null); // State for storing PO data
  const [orderStatus, setOrderStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDateInput, setShowDateInput] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [inwardLoadingIds, setInwardLoadingIds] = useState([]);

  const [showPlaceOrderPopup, setShowPlaceOrderPopup] = useState(false);
  const [placeOrderDateTime, setPlaceOrderDateTime] = useState("");

  const [showOrderedTable, setShowOrderedTable] = useState(false);
  const [orderedItems, setOrderedItems] = useState([]);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    recipient: "",
    cc: "",
    bcc: "",
    subject: "",
    body: "",
  });

  // The user object is now passed as a prop
  const isAdmin = user?.role === "Admin";
  const isProcurement = user?.role === "Procurement";
  const isFinance = user?.role === "Finance";

  // Fetch PO Details
  const fetchPODetails = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/po_master/`);
      const result = await response.json();
      const filteredPO = result.filter((order) => order.PO_id === poId);
      setPODetails(filteredPO);
      setLoading(false);
    } catch (error) {
      setError("Failed to fetch PO details");
      console.error(error);
    }
  };

  // Fetch Order Status
  const fetchOrderStatus = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/order_view/`);
      const result = await response.json();
      const filteredStatus = result.find(
        (status) => status.po_master_id === poDetails[0]?.id
      );
      setOrderStatus(filteredStatus || {});
    } catch (error) {
      console.error("Failed to fetch order status:", error.message);
    }
  };

  // Update Order Status
  const updateOrderStatus = async (newStatus, date) => {
    if (!poDetails.length) return;
    if (!date) {
      alert("Please select a date before updating the status.");
      return;
    }

    const poMasterId = poDetails[0].id;
    const payload = {
      order_placed_status:
        newStatus === "Ordered"
          ? "Ordered"
          : orderStatus?.order_placed_status || "",
      order_placed_date_time:
        newStatus === "Ordered"
          ? date
          : orderStatus?.order_placed_date_time || null,
      customer_status:
        newStatus === "Shipped"
          ? "Shipped"
          : orderStatus?.customer_status || "",
      customer_date_time:
        newStatus === "Shipped"
          ? date
          : orderStatus?.customer_date_time || null,
      received_status:
        newStatus === "Received"
          ? "Received"
          : orderStatus?.received_status || "",
      received_date:
        newStatus === "Received" ? date : orderStatus?.received_date || null,
      po_master_id: poMasterId,
    };

    try {
      const method = orderStatus?.id ? "PUT" : "POST";
      const apiUrl = orderStatus?.id
        ? `${config.apiBaseURL}/order_view/${orderStatus.id}/`
        : `${config.apiBaseURL}/order_view/`;

      const response = await fetch(apiUrl, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log(`${newStatus} status updated successfully.`);
        fetchOrderStatus(); // Refresh status
        // setShowDateInput(false); // Hide date input
        setSelectedDate(""); // Reset selected date
        setSelectedStatus(null); // Reset selected status
      } else {
        console.error("Failed to update order status:", await response.json());
      }
    } catch (error) {
      console.error("Error updating order status:", error.message);
    }
  };

  const handleStatusButtonClick = (status) => {
    setSelectedStatus(status);
    // setShowDateInput(true);
    setShowPopup(true); // Show the popup
  };

  const handleUpdateStatus = () => {
    if (!selectedDate) {
      alert("Please select a date and time.");
      return;
    }
    updateOrderStatus(selectedStatus, selectedDate);
    updatePOStatus(poId, selectedStatus);
    updatePOMasterStatuses(poId, selectedStatus);
    setShowPopup(false); // Close the popup
  };

  // Fetch PO Data for PO ID
  const fetchPOData = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/po_list/`);
      const result = await response.json();

      if (Array.isArray(result)) {
        const filteredPO = result.find((order) => order.id === poId);
        setPOData(filteredPO || null);
      } else {
        throw new Error("Unexpected API response format");
      }
    } catch (error) {
      console.error("Error fetching PO data:", error.message);
    }
  };

  const updatePOStatus = async (poId, newStatus) => {
    try {
      const payload = {
        status: newStatus,
      };

      const response = await fetch(`${config.apiBaseURL}/po_list/${poId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log(`PO status updated to "${newStatus}" successfully.`);
        fetchPOData(); // Refresh PO data after updating status
      } else {
        const errorData = await response.json();
        console.error("Failed to update PO status:", errorData);
        alert(`Failed to update status: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error("Error updating PO status:", error.message);
      alert("An error occurred while updating the status.");
    }
  };

  const updatePOMasterStatuses = async (poId, newStatus) => {
    try {
      // Fetch all PO Master data
      const response = await fetch(`${config.apiBaseURL}/po_master/`);
      if (!response.ok) {
        throw new Error("Failed to fetch PO Master data.");
      }
      const poMasterData = await response.json();

      // Filter entries matching the poId
      const matchingEntries = poMasterData.filter(
        (entry) => entry.PO_id === poId
      );

      if (matchingEntries.length === 0) {
        alert(`No entries found for PO ID: ${poId}`);
        return;
      }

      // Loop through matching entries and update their status
      for (const entry of matchingEntries) {
        const payload = {
          status: newStatus,
        };

        const updateResponse = await fetch(
          `${config.apiBaseURL}/po_master/${entry.id}/`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        if (updateResponse.ok) {
          console.log(
            `Updated PO Master entry ID: ${entry.id} to "${newStatus}"`
          );
        } else {
          const errorData = await updateResponse.json();
          console.error(
            `Failed to update PO Master entry ID: ${entry.id}`,
            errorData
          );
          alert(`Error updating entry ID: ${entry.id}`);
        }
      }

      `Successfully updated all entries for PO ID: ${poId}`;
    } catch (error) {
      console.error("Error updating PO Master statuses:", error.message);
      alert("An error occurred while updating the PO Master statuses.");
    }
    setPOData((prevData) => ({
      ...prevData,
      status: newStatus,
    }));
  };

  useEffect(() => {
    if (poId) {
      fetchPODetails();
      fetchPOData();
      // fetchOrderedItems(); // only when poId is valid
    }
  }, [poId]);

  useEffect(() => {
    if (poDetails[0]?.PO_id) {
      fetchOrderedItems(poDetails[0].PO_id);
    }
  }, [poDetails]);

  // useEffect(() => {
  //   if (poData?.PO_id) {
  //     fetchOrderedItems(poData.PO_id);
  //   }
  // }, [poData]);

  useEffect(() => {
    if (poDetails.length > 0) {
      fetchOrderStatus();
    }
  }, [poDetails]);

  const getCurrentStatus = () => {
    if (orderStatus.received_status === "Received") {
      return { status: "Received", date: orderStatus.received_date };
    } else if (orderStatus.customer_status === "Shipped") {
      return { status: "Shipped", date: orderStatus.customer_date_time };
    } else if (orderStatus.order_placed_status === "Ordered") {
      return { status: "Ordered", date: orderStatus.order_placed_date_time };
    } else {
      return { status: "Not Started", date: null };
    }
  };

  const currentStatus = getCurrentStatus();

  // Compute Total Price, GST, and Final Total
  const computeTotals = () => {
    const totals = poDetails.reduce(
      (acc, po) => {
        const totalquantity = parseFloat(po.cart_details.quantity || 0);
        const totalcost = parseFloat(po.cart_details.total_cost || 0);
        acc.totalquantity += totalquantity; // Exclude GST from total price
        acc.totalcost += totalcost;
        // acc.finalTotal += totalCost + gst; // Include GST in final total
        return acc;
      },
      { totalquantity: 0, totalcost: 0 }
    );

    return {
      totalquantity: totals.totalquantity.toFixed(),
      totalcost: totals.totalcost.toFixed(2),
      // finalTotal: totals.finalTotal.toFixed(2),
    };
  };

  const vendorName = poData?.cart_details?.vendor_name || "N/A";
  const vendor_gstn = poData?.cart_details?.gstn || "";
  const { totalquantity, totalcost } = computeTotals();

  const handleOpenModal = () => {
    setFormData((prev) => ({
      ...prev,
      subject: `Order Details for PO ID: ${poId}`,
      sender_title: `Order Details for PO ID: ${poId}`,
    }));
    setShowModal(true);
  };

  const handleChange = (e, index) => {
    const { name, value } = e.target;
    const updatedItems = [...orderedItems];
    updatedItems[index][name] = value;
    setOrderedItems(updatedItems);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text("Purchase Order", 105, 10, { align: "center" });
    doc.text(`PO ID: ${poId}`, 10, 20);
    doc.text(`Vendor Name: ${vendorName}`, 10, 30);
    doc.text(`Date: ${poData?.date || "N/A"}`, 10, 40);
    doc.text(`GSTIN: ${vendor_gstn}`, 10, 50);
    doc.text("Order Details:", 10, 60);

    const columns = ["Description", "UOM", "Qty", "Unit Price", "GST", "Total"];
    const rows = poDetails.map((po) => [
      po.cart_details.component_specification,
      po.cart_details.unit_of_measurement,
      po.cart_details.quantity,
      po.cart_details.unit_price,
      po.cart_details.GST,
      po.cart_details.total_cost,
    ]);

    doc.autoTable({
      head: [columns],
      body: rows,
      startY: 70,
    });

    return doc.output("blob");
  };

  const handleSendEmail = async () => {
    try {
      const pdfBlob = generatePDF();
      const pdfFileName = `PO_${poId}.pdf`;

      const recipientList = formData.recipient.split(",").map((s) => s.trim());
      const ccList = formData.cc.split(",").map((s) => s.trim());
      const bccList = formData.bcc.split(",").map((s) => s.trim());

      const formDataUpload = new FormData();
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
        const err = await uploadResponse.json();
        alert(`File upload failed: ${err.error}`);
        return;
      }

      const emailPayload = new FormData();
      emailPayload.append("recipient", JSON.stringify(recipientList));
      emailPayload.append("cc", JSON.stringify(ccList));
      emailPayload.append("bcc", JSON.stringify(bccList));
      emailPayload.append(
        "subject",
        formData.subject || `Order Details for PO ID: ${poId}`
      );
      emailPayload.append("sender_title", `Order Details for PO ID: ${poId}`);
      emailPayload.append(
        "body",
        formData.body || `Please find attached the PO ID: ${poId}`
      );
      emailPayload.append(
        "filename",
        new File([pdfBlob], pdfFileName, { type: "application/pdf" })
      );

      const sendResponse = await fetch(`${config.apiBaseURL}/send-email/`, {
        method: "POST",
        body: emailPayload,
      });

      if (sendResponse.ok) {
        const emailData = await sendResponse.json();
        alert(`Email sent successfully: ${emailData.message}`);
        setShowModal(false);
      } else {
        const emailError = await sendResponse.json();
        alert(`Failed to send email: ${emailError.error}`);
      }
    } catch (error) {
      console.error("Error sending email:", error);
      alert("An error occurred while uploading the file or sending the email.");
    }
  };

  const fetchOrderedItems = async (poId) => {
    try {
      const response = await axios.get(
        `${config.apiBaseURL}/po_delivery/?po_id=${poId}`
      );
      if (Array.isArray(response.data)) {
        setOrderedItems(response.data);
      } else {
        console.warn(
          "Ordered items API did not return an array:",
          response.data
        );
        setOrderedItems([]);
      }
    } catch (error) {
      console.error("Error fetching ordered items:", error);
    }
  };

  const handlePlaceOrder = async () => {
    if (!placeOrderDateTime) {
      alert("Please select a date and time.");
      return;
    }

    try {
      const uniquePoMasterIds = [...new Set(poDetails.map((po) => po.id))];

      // 1. Post po_delivery entries
      for (const po of poDetails) {
        const item = po.cart_details;
        const payload = {
          po_master: po.id,
          component_id: item.component_id,
          specification: item.component_specification,
          quantity: item.quantity,
          order_placed_date_time: new Date(placeOrderDateTime).toISOString(),
        };

        const response = await fetch(`${config.apiBaseURL}/po_delivery/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const error = await response.json();
          alert(`Failed to place order: ${JSON.stringify(error)}`);
          return;
        }
      }

      // 2. Patch each po_master
      for (const poMasterId of uniquePoMasterIds) {
        const patchResponse = await fetch(
          `${config.apiBaseURL}/po_master/${poMasterId}/`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status: "Ordered",
              inward_status: false,
            }),
          }
        );

        if (!patchResponse.ok) {
          const error = await patchResponse.json();
          alert(
            `Failed to update PO Master ${poMasterId}: ${JSON.stringify(error)}`
          );
          return;
        }
      }

      alert("All order items placed successfully!");
      setShowPlaceOrderPopup(false);
      setPlaceOrderDateTime("");
      setOrderPlaced(true); //  use this to hide buttons

      // 3. Fetch ordered components using the first po_master ID
      const currentPoId = uniquePoMasterIds[0]; // pick the first one
      const fetchOrdered = await fetch(
        `${config.apiBaseURL}/po_delivery/?po_id=${poId}` // again use poId
      );

      const orderedData = await fetchOrdered.json();
      setOrderedItems(orderedData);
      setShowOrderedTable(true); //  show the new table

      // 4. Re-fetch updated poData to hide Place/Send Email buttons
      const fetchPoMaster = await fetch(
        `${config.apiBaseURL}/po_master/${currentPoId}/`
      );
      const updatedPoData = await fetchPoMaster.json();
      setPOData(updatedPoData);
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Error while placing order.");
    }
  };

  return (
    <div>
      <h2>PO Details</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <>
          <h3>PO Number: {poId}</h3>
          <h3>Vendor Name: {vendorName}</h3>
          <h3>GSTIN: {vendor_gstn}</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Component ID</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Specification</th>
                  <th>UOM</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>GST</th>
                  <th>Total Cost</th>
                  {/* {(isAdmin || isProcurement) && <th>Actions</th>} */}
                </tr>
              </thead>
              <tbody>
                {poDetails.map((po, index) => (
                  <tr key={index}>
                    <td>{po.cart_details.component_id}</td>
                    <td>{po.cart_details.category}</td>
                    <td>{po.cart_details.component_type}</td>
                    <td>{po.cart_details.component_specification}</td>
                    <td>{po.cart_details.unit_of_measurement}</td>
                    <td>{po.cart_details.quantity}</td>

                    <td style={{ textAlign: "right" }}>
                      ₹
                      {parseFloat(po.cart_details.unit_price).toLocaleString(
                        "en-IN",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {parseFloat(po.cart_details.GST).toLocaleString("en-IN", {
                        // minimumFractionDigits: 2,
                        // maximumFractionDigits: 2
                      })}
                      %
                    </td>
                    <td style={{ textAlign: "right" }}>
                      ₹
                      {parseFloat(po.cart_details.total_cost).toLocaleString(
                        "en-IN",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </td>
                  </tr>
                ))}

                {/* Totals Row */}
                <tr style={{ fontWeight: "bold" }}>
                  <td colSpan="5">Totals</td>
                  <td>{totalquantity}</td>
                  <td></td>
                  <td></td>
                  <td style={{ textAlign: "right" }}>
                    ₹
                    {parseFloat(totalcost).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
      <div style={{ marginTop: "30px" }}>
        {/* Approved → Show 3 main buttons */}
        <div className="po-actions">
          {poData?.status === "Approved" && (
            <>
              <button className="email-button" onClick={handleOpenModal}>
                Send Email
              </button>
              <button
                className="place-order-button"
                onClick={() => setShowPlaceOrderPopup(true)}
              >
                Place Order
              </button>
              {/* <button
              style={{
                marginRight: "10px",
                backgroundColor: "red",
                color: "white",
                padding: "8px 16px",
              }}
            >
              Cancel Order
            </button> */}
            </>
          )}

          {(poData?.status === "Approved" || poData?.status === "Ordered") && (
            <button
              className="cancel-button"
              onClick={() => updatePOMasterStatuses(poId, "Cancelled")}
            >
              Cancel Order
            </button>
          )}

          {poData?.status === "Rejected" && (
            <span className="rejected-label">Rejected</span>
          )}
        </div>

        {/* Pending → Show Approve/Reject */}
        {poData?.status !== "Approved" &&
          poData?.status !== "Rejected" &&
          poData?.status !== "Ordered" && (
            <div className="po-actions">
              <button
                onClick={() => updatePOMasterStatuses(poId, "Approved")}
                className="approve-button"
              >
                Approve
              </button>
              <button
                onClick={() => updatePOMasterStatuses(poId, "Rejected")}
                className="reject-button"
              >
                Reject
              </button>
            </div>
          )}
      </div>
      {showModal && (
        <div className="modal-overlay">
          <div className="popup">
            <h3>Send Email for PO ID: {poId}</h3>
            <form style={{ marginTop: "5px" }}>
              {/* <div>
              <label>Sender:</label>
              <input
                type="email"
                name="sender"
                value={formData.sender}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label>Recipient:</label>
              <input
                type="email"
                name="recipient"
                value={formData.recipient}
                onChange={handleChange}
                required
              />
            </div> */}

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

      {/* {showModal && (
        <div className="popup">
          <h3>Send Email for PO ID: {poId}</h3>
          <form style={{ marginTop: "5px" }}>
            <div
              style={{
                padding: 5,
                display: "flex",
                justifyContent: "space-between",
              }}
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
            >
              <label>Body:</label>
              <textarea
                name="body"
                value={formData.body}
                onChange={handleChange}
              />
            </div>

            <div style={{ marginTop: "20px", textAlign: "center" }}>
              <button
                type="button"
                onClick={handleSendEmail}
                style={{
                  backgroundColor: "#f7931e",
                  color: "white",
                  marginRight: 10,
                  padding: "8px 20px",
                }}
              >
                Send Email
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  backgroundColor: "gray",
                  color: "white",
                  padding: "8px 20px",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )} */}

      {/* Naveen Added */}

      {showPlaceOrderPopup && (
        <div className="modal-overlay">
          <div className="popup" style={{marginTop:"-80px"}}>
            <div className="popup-content">
              <h3>Place Order - Date & Time</h3>
              <label>Select Date and Time:</label>
              <div className="date-input-containers">
                <DatePicker
                  selected={
                    placeOrderDateTime ? new Date(placeOrderDateTime) : null
                  }
                  onChange={(date) => setPlaceOrderDateTime(date)}
                  showTimeSelect
                  timeFormat="HH:mm"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  timeIntervals={1}
                  dateFormat="dd-MM-yyyy HH:mm"
                  placeholderText="dd-mm-yyyy hh:mm"
                  className="input1"
                />
                <i className="fas fa-calendar-alt calendar-icon"></i>
              </div>

              <div className="modal-actions">
                <button className="edit-btn" onClick={handlePlaceOrder}>
                  Submit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => setShowPlaceOrderPopup(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {orderedItems.length > 0 && (
        <div className="table-container">
          <h3 style={{ marginTop: "30px" }}>Ordered Items</h3>
          <table>
            <thead>
              <tr>
                <th>Component ID</th>
                <th>Specification</th>
                <th>Ordered Qty</th>
                <th>Ordered Date</th>
                <th>Shipping Qty</th>
                <th>Shipping Date</th>
                <th>Received Qty</th>
                <th>Received Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orderedItems.map((item, index) => {
                const orderedQtyFilled = !!item.quantity;
                const orderedDateFilled = !!item.order_placed_date_time;

                const shippingEnabled = orderedQtyFilled && orderedDateFilled;
                const shippingQtyFilled = !!item.shipping_qty;
                const shippingDateFilled = !!item.shipping_date;

                const receivedEnabled = shippingQtyFilled && shippingDateFilled;
                const receivedQtyFilled = !!item.received_qty;
                const receivedDateFilled = !!item.received_date;

                const inwardEnabled = receivedQtyFilled && receivedDateFilled;

                return (
                  <tr key={index}>
                    <td>{item.component_id}</td>
                    <td>{item.specification}</td>
                    <td>{item.quantity}</td>
                    <td>
                      {item.order_placed_date_time &&
                        format(
                          new Date(item.order_placed_date_time),
                          "dd-MM-yyyy"
                        )}
                    </td>

                    <td>
                      <input
                        type="number"
                        name="shipping_qty"
                        value={item.shipping_qty || ""}
                        disabled={!shippingEnabled}
                        onChange={(e) => handleChange(e, index)}
                      />
                    </td>
                    <td>
                      <div className="date-input-container">
                        <DatePicker
                          selected={
                            item.shipping_date
                              ? new Date(item.shipping_date)
                              : null
                          }
                          onChange={(date) => {
                            const fakeEvent = {
                              target: {
                                name: "shipping_date",
                                value: date.toISOString().split("T")[0], // or format with date-fns
                              },
                            };
                            handleChange(fakeEvent, index);
                          }}
                          dateFormat="dd-MM-yyyy"
                          placeholderText="dd-mm-yyyy"
                          className="input2"
                          showMonthDropdown
                          showYearDropdown
                          dropdownMode="select"
                          popperPlacement="bottom"
                          portalId="datepicker-portal-target"
                          disabled={!shippingEnabled}
                        />
                        <i className="fas fa-calendar-alt calendar-icon"></i>
                      </div>
                    </td>

                    <td>
                      <input
                        type="number"
                        name="received_qty"
                        value={item.received_qty || ""}
                        disabled={!receivedEnabled}
                        onChange={(e) => handleChange(e, index)}
                      />
                    </td>
                    <td>
                      <div className="date-input-container">
                        <DatePicker
                          selected={
                            item.received_date
                              ? new Date(item.received_date)
                              : null
                          }
                          onChange={(date) => {
                            const fakeEvent = {
                              target: {
                                name: "received_date",
                                value: date.toISOString().split("T")[0], // Or format with date-fns if needed
                              },
                            };
                            handleChange(fakeEvent, index);
                          }}
                          dateFormat="dd-MM-yyyy"
                          placeholderText="dd-mm-yyyy"
                          className="input2"
                          showMonthDropdown
                          showYearDropdown
                          dropdownMode="select"
                          popperPlacement="bottom"
                          portalId="datepicker-portal-target"
                          disabled={!receivedEnabled}
                        />
                        <i className="fas fa-calendar-alt calendar-icon"></i>
                      </div>
                    </td>
                    <td>
                      <button
                        disabled={!inwardEnabled}
                        onClick={() => handleInward(index)}
                      >
                        Inward
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <ToastContainerComponent />
    </div>
  );
};

export default POOrderMaster;
