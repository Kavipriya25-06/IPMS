// third set of code

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";

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
  const [formData, setFormData] = useState({
    sender: "",
    sender_title: "",
    recipient: "",
    cc: "",
    bcc: "",
    subject: "",
    body: "",
    filename: "",
  });
  const [currentPO, setCurrentPO] = useState(null); // Store the current PO for email

  // The user object is now passed as a prop
  const isAdmin = user?.role === "Admin";
  const isProcurement = user?.role === "Procurement";
  const isFinance = user?.role === "Finance";

  // Fetch Vendor Contact and Name
  const fetchVendorDetails = async (vendorId) => {
    try {
      // Fetch vendor contact details
      const contactResponse = await fetch(
        "http://127.0.0.1:8000/vendor_sub_list/"
      );
      const contactResult = await contactResponse.json();
      const contactDetails = contactResult.find(
        (contact) => contact.vendor === vendorId
      );
      // console.log("Fetched vendor", vendorId);
      // console.log("Contact details", contactResult);

      // Fetch vendor name
      const vendorResponse = await fetch("http://127.0.0.1:8000/vendor_list/");
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
      const response = await fetch("http://127.0.0.1:8000/po_list/");
      const result = await response.json();
      // console.log("Fetched PO list", result);
      // console.log("Current PO ID", currentPO);
      const filteredPO = result.find((po) => po.id === currentPO.id);
      if (filteredPO) {
        setPOListData(filteredPO);
        fetchVendorDetails(filteredPO.cart_details.vendor_id); // Fetch vendor details
        // console.log(
        //   "Filtered PO Vendor details",
        //   filteredPO.cart_details.vendor_id
        // );
      }
    } catch (error) {
      console.error("Error fetching PO list data:", error);
    }
  };

  // Fetch PO orders
  const fetchPOOrders = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/po_list/");
      const result = await response.json();
      if (Array.isArray(result)) {
        setPOOrders(result);
      } else {
        console.error("Unexpected PO List API response:", result);
        setPOOrders([]);
      }
    } catch (error) {
      console.error("Error fetching PO List:", error);
    }
  };

  // Fetch PO master
  const fetchPOMaster = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/po_master/");
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
      const response = await fetch("http://127.0.0.1:8000/order_view/");
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

    if (relevantStatuses.length === 0) {
      return { status: "Pending", mixed: false };
    }

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
      alert("No Purchase Order selected!");
      return;
    }

    try {
      // Step 1: Generate the PDF as a Blob
      const pdfBlob = generatePDF(currentPO, poMaster);
      // console.log("The PO details here", currentPO);

      // Step 2: Upload the PDF to the backend
      const formDataUpload = new FormData();
      const pdfFileName = `PO_${currentPO.id}.pdf`;
      // console.log("PDF Blob:", pdfBlob, "Blob size", pdfBlob.size);
      // formDataUpload.append("file", new File([pdfBlob], pdfFileName)); // Attach file as FormData
      formDataUpload.append(
        "file",
        new File([pdfBlob], pdfFileName, { type: "application/pdf" })
      );

      const uploadResponse = await fetch(
        "http://127.0.0.1:8000/file_upload_view/",
        {
          method: "POST",
          body: formDataUpload,
        }
      );

      if (!uploadResponse.ok) {
        const uploadError = await uploadResponse.json();
        console.error("Error uploading file:", uploadError);
        alert(`Failed to upload file: ${uploadError.error}`);
        return;
      }

      const uploadData = await uploadResponse.json();
      const uploadedFilePath = uploadData.file_path; // Extract the file path from the response

      // console.log("Uploaded file path:", uploadedFilePath);

      // next step

      formDataUpload.append("sender", formData.sender);
      formDataUpload.append("recipient", formData.recipient);
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

      const response = await fetch("http://127.0.0.1:8000/send-email/", {
        method: "POST",
        body: formDataUpload,
      });

      if (response.ok) {
        const emailData = await response.json();
        alert(`Email sent successfully: ${emailData.message}`);
        setShowModal(false);
      } else {
        const emailError = await response.json();
        console.error("Error sending email:", emailError);
        alert(`Failed to send email: ${emailError.error}`);
      }
    } catch (error) {
      console.error("Error during file upload or email send:", error);
      alert("An error occurred while uploading the file or sending the email.");
    }
  };

  // Generating the PDF is below

  const generatePDF = (poDetails, poMaster) => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text("Purchase Order", 105, 10, { align: "center" });
    doc.text(`PO ID: ${poDetails.id}`, 10, 20);
    doc.text(
      `Vendor Name: ${poDetails.cart_details.vendor_name} (${
        vendorContact?.location || "Location not available"
      })`,
      10,
      30
    );
    doc.text(`Date: ${poDetails.date}`, 10, 40);
    doc.text("Order Details:", 10, 50);

    // const tableColumns = ["Item", "Quantity", "Unit Price", "Total Cost"];
    // const tableRows = [
    //   [
    //     "Component",
    //     poDetails.cart_details.quantity.toString(),
    //     poDetails.cart_details.unit_price || "N/A",
    //     poDetails.cart_details.total_cost,
    //   ],
    // ];

    // Table columns
    const tableColumns = [
      "Description of goods",
      "Per",
      "Quantity",
      "Unit Price",
      "GST (%)",
      "Total Cost",
    ];

    // Filter rows for the current PO ID
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

    doc.autoTable({
      head: [tableColumns],
      body: tableRows,
      startY: 60,
    });

    // // Calculate totals
    // const totalCost = tableRows.reduce(
    //   (acc, row) => acc + parseFloat(row[8]),
    //   0
    // );
    // const totalGST = tableRows.reduce(
    //   (acc, row) => acc + (parseFloat(row[8]) * parseFloat(row[7])) / 100,
    //   0
    // );

    // doc.text(
    //   `Total GST: ${totalGST.toFixed(2)}`,
    //   10,
    //   doc.lastAutoTable.finalY + 10
    // );
    // doc.text(
    //   `Grand Total: ${totalCost.toFixed(2)}`,
    //   10,
    //   doc.lastAutoTable.finalY + 20
    // );

    return doc.output("blob"); // Return PDF as a Blob object
  };

  const handleOpenModal = (po) => {
    setCurrentPO(po); // Set the current PO details
    setFormData((prev) => ({
      ...prev,
      subject: `Order Details for PO ID: ${po.id}`, // Add PO ID to subject
      sender_title: `Order Details for PO ID: ${po.id}`,
    }));
    setShowModal(true);
  };

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

  return (
    <div>
      <h2>PO Order List</h2>
      {poOrders.length === 0 ? (
        <p>No Purchase Orders found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>PO ID</th>
              <th>Vendor Name</th>
              <th>Status</th>
              <th>Total Cost</th>
              <th>Date</th>
              {(isAdmin || isProcurement) && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {poOrders.map((order) => {
              const { status, mixed } = getAggregatedStatus(order.id);
              const finalPrice = finalCost(order.id);
              return (
                <tr key={order.id}>
                  <td
                    style={{ cursor: "pointer", textDecoration: "underline" }}
                    onClick={() => navigate(`/po-details/${order.id}`)}
                  >
                    {order.id}
                  </td>
                  <td>{order.cart_details.vendor_name}</td>
                  <td>{status}</td>
                  <td>{finalPrice}</td>
                  <td>{order.date}</td>
                  {(isAdmin || isProcurement) && (
                    <td>
                      <button onClick={() => handleOpenModal(order)}>
                        {" "}
                        Send Email{" "}
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* Email Modal */}
      {showModal && (
        <div className="popup">
          <h3>Send Email for PO ID: {currentPO?.id}</h3>
          <form>
            <div>
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
            </div>

            <div>
              <label>Body:</label>
              <textarea
                name="body"
                value={formData.body}
                onChange={handleChange}
              />
            </div>

            <button type="button" onClick={handleSendEmail}>
              Send Email
            </button>
            <button type="button" onClick={() => setShowModal(false)}>
              Cancel
            </button>
          </form>
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
    </div>
  );
};

export default POOrderList;
