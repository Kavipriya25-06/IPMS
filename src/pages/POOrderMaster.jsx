//
// Final code, this works correctly
//

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import config from "../Config"; // Import config for API endpoints

import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  ToastContainerComponent,
} from "./Toastify.jsx"; // Import Toastify utilities

const POOrderMaster = ({ user }) => {
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [selectedDeliveryDetails, setSelectedDeliveryDetails] = useState(null);
  const [enteredQuantity, setEnteredQuantity] = useState("");

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
  };

  // const handleInward = async (item) => {
  //   try {
  //     // Destructure the necessary fields from the item
  //     const {
  //       component_id,
  //       component_type,
  //       component_specification,
  //       category,
  //       unit_of_measurement,
  //       quantity,
  //       vendor_name,
  //       vendor_id,
  //     } = item;

  //     // Hardcode po_master_id
  //     const po_master_id = 1; // Hardcoded

  //     // Loop through the quantity to post each unit individually
  //     for (let i = 0; i < quantity; i++) {
  //       const inwardPayload = {
  //         component_id,
  //         component_type,
  //         component_specification,
  //         category,
  //         unit_of_measurement,
  //         unit: 1, // Post each unit as 1
  //         vendor_name,
  //         vendor_id,
  //         po_master_id, // Include the hardcoded po_master_id
  //         quality_check: "Pending", // Set quality_check as "Pending"
  //       };

  //       // POST request to the inward API
  //       const response = await fetch(`${config.apiBaseURL}/inward/`, {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify(inwardPayload),
  //       });

  //       if (!response.ok) {
  //         const error = await response.json();
  //         console.error(`Error posting inward data for unit ${i + 1}:`, error);
  //         alert(`Failed to post inward data for unit ${i + 1}.`);
  //         return;
  //       }
  //     }

  //     // Success message after all POST requests
  //     alert(
  //       `Inward operation completed successfully for ${quantity} units of Component ID: ${component_id}.`
  //     );
  //   } catch (error) {
  //     console.error("Error during inward operation:", error);
  //     alert("An error occurred while performing the inward operation.");
  //   }
  // };

  const handleInwardWithPatch = async (delivery) => {
    const item = {
      component_id: selectedDeliveryDetails.cart_details.component_id,
      component_type: selectedDeliveryDetails.cart_details.component_type,
      component_specification:
        selectedDeliveryDetails.cart_details.component_specification,
      category: selectedDeliveryDetails.cart_details.category,
      unit_of_measurement:
        selectedDeliveryDetails.cart_details.unit_of_measurement,
      vendor_name: selectedDeliveryDetails.cart_details.vendor_name,
      vendor_id: selectedDeliveryDetails.cart_details.vendor_id,
      quantity: delivery.quantity,
      id: selectedDeliveryDetails.id, // PO Master ID
    };

    try {
      await handleInward(item); //  Existing inward logic

      //  PATCH delivery.inward = true
      const patchResponse = await fetch(
        `${config.apiBaseURL}/po_delivery/${delivery.id}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ inward: true }),
        }
      );

      if (!patchResponse.ok) {
        const patchError = await patchResponse.json();
        console.error("Failed to patch delivery inward status:", patchError);
        alert("Inward successful, but marking delivery as completed failed.");
        return;
      }

      // Update UI to disable button
      setSelectedDeliveryDetails((prevDetails) => {
        const updatedDeliveries = prevDetails.deliveries.map((d) =>
          d.id === delivery.id ? { ...d, inward: true } : d
        );
        return { ...prevDetails, deliveries: updatedDeliveries };
      });
    } catch (err) {
      console.error("Error in handleInwardWithPatch:", err);
      alert("An error occurred while performing the inward operation.");
    }
  };

  const handleInward = async (item) => {
    const componentKey = item.component_id;

    // Prevent if already processing this component
    if (inwardLoadingIds.includes(componentKey)) return;

    setInwardLoadingIds((prev) => [...prev, componentKey]);
    try {
      const {
        id,
        component_id,
        component_type,
        component_specification,
        category,
        unit_of_measurement,
        quantity,
        vendor_name,
        vendor_id,
      } = item;

      // Fetch PO Master Data
      const poResponse = await fetch(`${config.apiBaseURL}/po_master/`);
      if (!poResponse.ok) {
        throw new Error("Failed to fetch PO Master data.");
      }

      const poData = await poResponse.json();

      // Debug: Log the fetched PO Master data
      console.log("Fetched PO Master Data:", poData);

      // Filter to find the matching PO entry
      const matchedPO = poData.filter((po) => {
        const matches =
          po.PO_id === poId &&
          po.id === id &&
          po.cart_details?.component_id === component_id &&
          po.cart_details?.vendor_id === vendor_id &&
          po.cart_details?.component_type === component_type &&
          po.cart_details?.component_specification ===
            component_specification &&
          po.cart_details?.category === category &&
          po.cart_details?.unit_of_measurement === unit_of_measurement &&
          (po.cart_details?.vendor_name || "").toLowerCase().trim() ===
            (vendor_name || "").toLowerCase().trim();

        // Log each condition for debugging
        console.log(`PO ID ${po.id}:`, {
          po_id_match: po.PO_id === poId,
          po_master_id_match: po.cart_details?.po_master_id === id,
          component_id_match: po.cart_details?.component_id === component_id,
          vendor_id_match: po.cart_details?.vendor_id === vendor_id,
          component_type_match:
            po.cart_details?.component_type === component_type,
          specification_match:
            po.cart_details?.component_specification ===
            component_specification,
          category_match: po.cart_details?.category === category,
          uom_match:
            po.cart_details?.unit_of_measurement === unit_of_measurement,
          vendor_name_match:
            (po.cart_details?.vendor_name || "").toLowerCase().trim() ===
            (vendor_name || "").toLowerCase().trim(),
        });

        return matches;
      });

      // Debug: Log matched PO entries
      console.log("Matched PO Entries:", matchedPO);

      if (matchedPO.length === 0) {
        alert("No matching PO Master ID found for the selected item.");
        return;
      }

      const po_master_id = matchedPO[0]?.id;
      const unit_price = matchedPO[0]?.cart_details?.unit_price || 0;

      // Debug: Log the extracted PO Master ID and Unit Price
      console.log("Extracted PO Master ID:", po_master_id);
      console.log("Unit Price for PO:", unit_price);

      if (!po_master_id) {
        alert("PO Master ID is missing or invalid.");
        return;
      }

      // Perform inward operations for the quantity specified
      for (let i = 0; i < quantity; i++) {
        const inwardPayload = {
          component_id,
          component_type,
          component_specification,
          category,
          unit_of_measurement,
          unit: 1,
          vendor_name,
          vendor_id,
          po_master_id,
          quality_check: "Pending",
          price: unit_price,
        };

        console.log(`Inward Payload for Unit ${i + 1}:`, inwardPayload);

        const response = await fetch(`${config.apiBaseURL}/inward/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(inwardPayload),
        });

        if (!response.ok) {
          const error = await response.json();
          console.error(`Error posting inward data for unit ${i + 1}:`, error);
          alert(`Failed to post inward data for unit ${i + 1}.`);
          return;
        }
      }

      showSuccessToast(
        `Inward operation completed successfully for ${quantity} units of Component ID: ${component_id}.`
      );

      // Update PO Master Status
      const updatePayload = {
        PO_id: matchedPO[0]?.PO_id,
        status: matchedPO[0]?.status,
        cart_id: matchedPO[0]?.cart_id,
        inward_status: false,
      };

      console.log("Update Payload for PO Master:", updatePayload);

      const updateResponse = await fetch(
        `${config.apiBaseURL}/po_master/${po_master_id}/`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatePayload),
        }
      );

      if (!updateResponse.ok) {
        const updateError = await updateResponse.json();
        console.error("Error updating PO Master status:", updateError);
        alert("Failed to update PO Master status.");
        return;
      }

      // Refresh PO Details
      fetchPODetails();
    } catch (error) {
      console.error("Error in handleInward function:", error);
      alert("An error occurred while performing the inward operation.");
    } finally {
      setTimeout(() => {
        setInwardLoadingIds((prev) => prev.filter((id) => id !== componentKey));
      }, 1000);
    }
  };

  useEffect(() => {
    fetchPODetails();
    fetchPOData();
  }, [poId]);

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

  // // Compute Total Price, GST, and Final Total
  // const computeTotals = () => {
  //   const totals = poDetails.reduce(
  //     (acc, po) => {
  //       const totalCost = parseFloat(po.cart_details.unit_price || 0);
  //       const gst = parseFloat(po.cart_details.GST || 0);
  //       acc.totalPrice += totalCost; // Exclude GST from total price
  //       acc.gst += gst;
  //       acc.finalTotal += totalCost + gst; // Include GST in final total
  //       return acc;
  //     },
  //     { totalPrice: 0, gst: 0, finalTotal: 0 }
  //   );

  //   return {
  //     totalPrice: totals.totalPrice.toFixed(2),
  //     gst: totals.gst.toFixed(2),
  //     finalTotal: totals.finalTotal.toFixed(2),
  //   };
  // };

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

  const handleQuantitySubmit = async () => {
    if (!selectedDeliveryDetails) {
      alert("PO not selected");
      return;
    }

    const quantity = parseInt(enteredQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      alert("Enter a valid quantity greater than 0");
      return;
    }

    const totalOrderedQuantity = selectedDeliveryDetails.cart_details.quantity;

    // First, fetch existing deliveries before posting
    const currentDeliveriesRes = await fetch(
      `${config.apiBaseURL}/po_delivery/?po_master=${selectedDeliveryDetails.id}`
    );
    const currentDeliveries = await currentDeliveriesRes.json();

    const alreadyDelivered = currentDeliveries.reduce(
      (acc, d) => acc + d.quantity,
      0
    );

    const remaining = totalOrderedQuantity - alreadyDelivered;

    // If already exceeded, block immediately
    if (remaining <= 0) {
      alert("The full ordered quantity has already been delivered.");
      return;
    }

    if (quantity > remaining) {
      alert(`Only ${remaining} more units can be delivered.`);
      return;
    }

    // Proceed with posting
    const payload = {
      po_master: selectedDeliveryDetails.id,
      quantity,
      order_placed_status: "Ordered",
      order_placed_date_time: new Date().toISOString(),
    };

    try {
      const response = await fetch(`${config.apiBaseURL}/po_delivery/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Quantity submitted successfully");
        setEnteredQuantity("");

        // Fetch updated delivery data to refresh UI
        const updatedDeliveryRes = await fetch(
          `${config.apiBaseURL}/po_delivery/?po_master=${selectedDeliveryDetails.id}`
        );

        const updatedDeliveries = await updatedDeliveryRes.json();

        setSelectedDeliveryDetails((prev) => ({
          ...prev,
          deliveries: updatedDeliveries,
        }));

        setShowDeliveryModal(false);
      } else {
        const err = await response.json();
        alert("Failed to submit: " + JSON.stringify(err));
      }
    } catch (error) {
      console.error("Error submitting delivery:", error);
      alert("Error submitting delivery.");
    }
  };

  const thStyle = {
    border: "1px solid #ddd",
    padding: "10px",
    textAlign: "left",
  };

  const tdStyle = {
    border: "1px solid #ddd",
    padding: "10px",
  };

  const formatDateTime = (datetime) => {
    if (!datetime) return "-";
    const date = new Date(datetime);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
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
                    <td
                      style={{ cursor: "pointer", textDecoration: "underline" }}
                      onClick={async () => {
                        // Fetch deliveries first
                        const res = await fetch(
                          `${config.apiBaseURL}/po_delivery/?po_master=${po.id}`
                        );
                        const deliveries = await res.json();

                        // Now safely set the modal data
                        setSelectedDeliveryDetails({
                          ...po,
                          deliveries, // attach fetched delivery list
                        });

                        setShowDeliveryModal(true);
                      }}
                    >
                      {po.cart_details.quantity}
                    </td>

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
                    {/* {(isAdmin || isProcurement) && (
                      <td>
                        <button
                          onClick={() => handleInward(po.cart_details)}
                          disabled={
                            inwardLoadingIds.includes(
                              po.cart_details.component_id
                            ) || // actively processing
                            orderStatus.received_status !== "Received" || // not yet received
                            !po.inward_status // already inwarded
                          }
                        >
                          {inwardLoadingIds.includes(
                            po.cart_details.component_id
                          )
                            ? "Processing..."
                            : "Inward"}
                        </button>
                      </td>
                    )} */}
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

          {/* <button onClick={() => updatePOMasterStatuses(poId, "Approved")}>
            Approve
          </button>
          <button onClick={() => updatePOMasterStatuses(poId, "Rejected")}>
            Reject
          </button> */}

          {showDeliveryModal && selectedDeliveryDetails && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                backgroundColor: "rgba(0,0,0,0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 999,
              }}
              onClick={() => setShowDeliveryModal(false)}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  backgroundColor: "white",
                  padding: "24px",
                  borderRadius: "10px",
                  width: "90%",
                  maxWidth: "1000px",
                  height: "auto",
                }}
              >
                <h3 style={{ marginBottom: "16px" }}>
                  {selectedDeliveryDetails.cart_details.component_specification}
                </h3>

                {/* Quantity Entry */}
                <div
                  style={{
                    display: "flex",
                    marginBottom: "20px",
                    alignItems: "center",
                  }}
                >
                  <label style={{ marginRight: "10px" }}>Enter Quantity</label>
                  <input
                    type="number"
                    min="0"
                    style={{ padding: "5px", width: "150px" }}
                    value={enteredQuantity}
                    onChange={(e) => setEnteredQuantity(e.target.value)}
                  />
                  <button
                    onClick={handleQuantitySubmit}
                    style={{
                      marginLeft: "10px",
                      padding: "6px 12px",
                      backgroundColor: "#007BFF",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Enter
                  </button>
                </div>

                {/*  Table Format for Deliveries */}
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginTop: "10px",
                  }}
                >
                  <thead>
                    <tr style={{ backgroundColor: "#f2f2f2" }}>
                      <th style={thStyle}>Quantity</th>
                      <th style={thStyle}>Order Placed</th>
                      <th style={thStyle}>Shipped</th>
                      <th style={thStyle}>Received</th>
                      <th style={thStyle}>Inward</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDeliveryDetails.deliveries?.map(
                      (delivery, index) => {
                        const fullyReceived = !!delivery.received_date;

                        const handleFieldUpdate = async (field, value) => {
                          try {
                            const patchPayload = {
                              [field]: value,
                            };
                            const res = await fetch(
                              `${config.apiBaseURL}/po_delivery/${delivery.id}/`,
                              {
                                method: "PATCH",
                                headers: {
                                  "Content-Type": "application/json",
                                },
                                body: JSON.stringify(patchPayload),
                              }
                            );

                            if (res.ok) {
                              // Update local state to reflect changes
                              const updatedDelivery = await res.json();
                              setSelectedDeliveryDetails((prev) => {
                                const updatedDeliveries = [...prev.deliveries];
                                updatedDeliveries[index] = updatedDelivery;
                                return {
                                  ...prev,
                                  deliveries: updatedDeliveries,
                                };
                              });
                            } else {
                              alert("Failed to update.");
                            }
                          } catch (err) {
                            console.error("Update error", err);
                            alert("Error updating date.");
                          }
                        };

                        return (
                          <tr key={index}>
                            <td style={tdStyle}>{delivery.quantity || "-"}</td>

                            {/* Order Placed */}
                            <td style={tdStyle}>
                              {formatDateTime(delivery.order_placed_date_time)}
                            </td>

                            {/* Shipped */}
                            <td style={tdStyle}>
                              {delivery.customer_date_time ? (
                                formatDateTime(delivery.customer_date_time)
                              ) : (
                                <div>
                                  <input
                                    type="datetime-local"
                                    onChange={(e) =>
                                      handleFieldUpdate(
                                        "customer_date_time",
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                              )}
                            </td>

                            {/* Received */}
                            <td style={tdStyle}>
                              {delivery.received_date ? (
                                formatDateTime(delivery.received_date)
                              ) : (
                                <div>
                                  <input
                                    type="datetime-local"
                                    onChange={(e) =>
                                      handleFieldUpdate(
                                        "received_date",
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                              )}
                            </td>

                            {/* Inward */}
                            <td style={tdStyle}>
                              <button
                                style={{
                                  backgroundColor:
                                    fullyReceived && !delivery.inward
                                      ? "#d66f00"
                                      : "#ccc",
                                  color: "#fff",
                                  border: "none",
                                  padding: "5px 12px",
                                  borderRadius: "5px",
                                  cursor:
                                    fullyReceived && !delivery.inward
                                      ? "pointer"
                                      : "not-allowed",
                                }}
                                disabled={!fullyReceived || delivery.inward}
                                onClick={() =>
                                  fullyReceived &&
                                  !delivery.inward &&
                                  handleInwardWithPatch(delivery)
                                }
                              >
                                Inward
                              </button>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>

                {/* Summary Section */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: "30px",
                  }}
                >
                  <div>
                    {/* <div>
                      Ordered Quantity:{" "}
                      {selectedDeliveryDetails.cart_details?.ordered_quantity ||
                        "-"}
                    </div>
                    <div>
                      Remaining Quantity:{" "}
                      {selectedDeliveryDetails.cart_details
                        ?.remaining_quantity || "-"}
                    </div> */}
                  </div>
                </div>

                {/* Close Button */}
                <div style={{ marginTop: "20px", textAlign: "right" }}>
                  <button
                    onClick={() => setShowDeliveryModal(false)}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#000",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Order Status Buttons
          {(isAdmin || isProcurement) && (
            <div style={{ marginTop: "20px" }}>
              <button
                onClick={() => {
                  handleStatusButtonClick("Ordered");
                  // updatePOStatus(poId, "Ordered");
                }}
                disabled={orderStatus.order_placed_status === "Ordered"}
              >
                Order Placed
              </button>
              <button
                onClick={() => {
                  handleStatusButtonClick("Shipped");
                  // updatePOStatus(poId, "Shipped");
                }}
                disabled={
                  orderStatus.customer_status === "Shipped" ||
                  orderStatus.order_placed_status !== "Ordered"
                }
              >
                Shipped
              </button>
              <button
                onClick={() => {
                  handleStatusButtonClick("Received");
                  // updatePOStatus(poId, "Received");
                }}
                disabled={
                  orderStatus.received_status === "Received" ||
                  orderStatus.customer_status !== "Shipped"
                }
              >
                Received
              </button>
            </div>
          )} */}

          {/* Date Input Section
          {showPopup && (
            <div className="popup">
              <div className="popup-content">
                <h3>{`Update Status: ${selectedStatus}`}</h3>
                <label>
                  Select Date and Time:
                  <input
                    type="datetime-local"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </label>
                <div style={{ marginTop: "20px" }}>
                  <button onClick={handleUpdateStatus}>Confirm</button>
                  <button onClick={() => setShowPopup(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )} */}

          {/* Current Status
          <div
            style={{
              marginTop: "10px",
              padding: "15px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              backgroundColor: "#f9f9f9",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ textAlign: "center", flex: 1 }}>
              <p style={{ fontSize: "16px", color: "#333" }}>
                <strong>Order Placed</strong>
              </p>
              <p style={{ fontSize: "14px", color: "#555" }}>
                {orderStatus.order_placed_date_time
                  ? new Date(
                      orderStatus.order_placed_date_time
                    ).toLocaleString()
                  : "Not yet placed"}
              </p>
            </div>
            <div style={{ textAlign: "center", flex: 1 }}>
              <p style={{ fontSize: "16px", color: "#333" }}>
                <strong>Shipped</strong>
              </p>
              <p style={{ fontSize: "14px", color: "#555" }}>
                {orderStatus.customer_date_time
                  ? new Date(orderStatus.customer_date_time).toLocaleString()
                  : "Not yet shipped"}
              </p>
            </div>
            <div style={{ textAlign: "center", flex: 1 }}>
              <p style={{ fontSize: "16px", color: "#333" }}>
                <strong>Received</strong>
              </p>
              <p style={{ fontSize: "14px", color: "#555" }}>
                {orderStatus.received_date
                  ? new Date(orderStatus.received_date).toLocaleString()
                  : "Not yet received"}
              </p>
            </div>
          </div> */}
        </>
      )}

      <div style={{ marginTop: "30px" }}>
        {/* Approved → Show 3 main buttons */}
        {poData?.status === "Approved" && (
          <>
            <button
              style={{
                marginRight: "10px",
                backgroundColor: "black",
                color: "white",
                padding: "8px 16px",
              }}
            >
              Send Email
            </button>
            <button
              style={{
                marginRight: "10px",
                backgroundColor: "green",
                color: "white",
                padding: "8px 16px",
              }}
            >
              Place Order
            </button>
            <button
              style={{
                marginRight: "10px",
                backgroundColor: "red",
                color: "white",
                padding: "8px 16px",
              }}
            >
              Cancel Order
            </button>
            {/* <span
              style={{
                marginLeft: "20px",
                color: "green",
                fontWeight: "bold",
                fontSize: "16px",
              }}
            >
              Approved
            </span> */}
          </>
        )}

        {/*  Rejected → Only show rejected label */}
        {poData?.status === "Rejected" && (
          <span
            style={{
              marginLeft: "10px",
              color: "red",
              fontWeight: "bold",
              fontSize: "16px",
            }}
          >
            Rejected
          </span>
        )}

        {/* Pending → Show Approve/Reject */}
        {poData?.status !== "Approved" && poData?.status !== "Rejected" && (
          <>
            <button
              onClick={() => updatePOMasterStatuses(poId, "Approved")}
              style={{
                marginRight: "10px",
                backgroundColor: "green",
                color: "#fff",
                padding: "8px 16px",
              }}
            >
              Approve
            </button>
            <button
              onClick={() => updatePOMasterStatuses(poId, "Rejected")}
              style={{
                marginRight: "10px",
                backgroundColor: "red",
                color: "#fff",
                padding: "8px 16px",
              }}
            >
              Reject
            </button>
          </>
        )}
      </div>

      <ToastContainerComponent />
    </div>
  );
};

export default POOrderMaster;
