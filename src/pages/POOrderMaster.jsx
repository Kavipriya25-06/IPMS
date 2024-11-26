//
// Final code, this works correctly
//

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const POOrderMaster = () => {
  const { poId } = useParams(); // Extract PO ID from the route
  const [poDetails, setPODetails] = useState([]);
  const [poData, setPOData] = useState(null); // State for storing PO data
  const [orderStatus, setOrderStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch PO Details
  const fetchPODetails = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/po_master/");
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
      const response = await fetch("http://127.0.0.1:8000/order_view/");
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
  const updateOrderStatus = async (newStatus) => {
    if (!poDetails.length) return;

    const poMasterId = poDetails[0].id;
    const payload = {
      order_placed_status:
        newStatus === "Ordered"
          ? "Ordered"
          : orderStatus?.order_placed_status || "",
      order_placed_date_time:
        newStatus === "Ordered"
          ? new Date().toISOString()
          : orderStatus?.order_placed_date_time || null,
      customer_status:
        newStatus === "Shipped"
          ? "Shipped"
          : orderStatus?.customer_status || "",
      customer_date_time:
        newStatus === "Shipped"
          ? new Date().toISOString()
          : orderStatus?.customer_date_time || null,
      received_status:
        newStatus === "Received"
          ? "Received"
          : orderStatus?.received_status || "",
      received_date:
        newStatus === "Received"
          ? new Date().toISOString()
          : orderStatus?.received_date || null,
      po_master_id: poMasterId,
    };

    try {
      const method = orderStatus?.id ? "PUT" : "POST";
      const apiUrl = orderStatus?.id
        ? `http://127.0.0.1:8000/order_view/${orderStatus.id}/`
        : "http://127.0.0.1:8000/order_view/";

      const response = await fetch(apiUrl, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log(`${newStatus} status updated successfully.`);
        fetchOrderStatus(); // Refresh status
      } else {
        console.error("Failed to update order status:", await response.json());
      }
    } catch (error) {
      console.error("Error updating order status:", error.message);
    }
  };

  // Fetch PO Data for PO ID
  const fetchPOData = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/po_list/");
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

  const handleInward = async (item) => {
    try {
      // Destructure the necessary fields from the item
      const {
        component_id,
        component_type,
        component_specification,
        category,
        unit_of_measurement,
        quantity,
        vendor_name,
        vendor_id,
      } = item;

      // Hardcode po_master_id
      const po_master_id = 1; // Hardcoded

      // Loop through the quantity to post each unit individually
      for (let i = 0; i < quantity; i++) {
        const inwardPayload = {
          component_id,
          component_type,
          component_specification,
          category,
          unit_of_measurement,
          unit: 1, // Post each unit as 1
          vendor_name,
          vendor_id,
          po_master_id, // Include the hardcoded po_master_id
          quality_check: "Pending", // Set quality_check as "Pending"
        };

        // POST request to the inward API
        const response = await fetch("http://127.0.0.1:8000/inward/", {
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

      // Success message after all POST requests
      alert(
        `Inward operation completed successfully for ${quantity} units of Component ID: ${component_id}.`
      );
    } catch (error) {
      console.error("Error during inward operation:", error);
      alert("An error occurred while performing the inward operation.");
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

  // Compute Total Price, GST, and Final Total
  const computeTotals = () => {
    const totals = poDetails.reduce(
      (acc, po) => {
        const totalCost = parseFloat(po.cart_details.unit_price || 0);
        const gst = parseFloat(po.cart_details.GST || 0);
        acc.totalPrice += totalCost; // Exclude GST from total price
        acc.gst += gst;
        acc.finalTotal += totalCost + gst; // Include GST in final total
        return acc;
      },
      { totalPrice: 0, gst: 0, finalTotal: 0 }
    );

    return {
      totalPrice: totals.totalPrice.toFixed(2),
      gst: totals.gst.toFixed(2),
      finalTotal: totals.finalTotal.toFixed(2),
    };
  };

  const vendorName = poData?.cart_details?.vendor_name || "N/A";
  const { totalPrice, gst, finalTotal } = computeTotals();

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
                <th>Actions</th>
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
                  <td>{po.cart_details.unit_price}</td>
                  <td>{po.cart_details.GST}</td>
                  <td>{po.cart_details.total_cost}</td>
                  <td>
                    <button onClick={() => handleInward(po.cart_details)}>
                      Inward
                    </button>
                  </td>
                </tr>
              ))}

              {/* Totals Row */}
              <tr style={{ fontWeight: "bold" }}>
                <td colSpan="6">Totals</td>
                <td>{totalPrice}</td>
                <td>{gst}</td>
                <td>{finalTotal}</td>
              </tr>
            </tbody>
          </table>

          {/* Order Status Buttons */}
          <div style={{ marginTop: "20px" }}>
            <button
              onClick={() => updateOrderStatus("Ordered")}
              disabled={orderStatus.order_placed_status === "Ordered"}
            >
              Order Placed
            </button>
            <button
              onClick={() => updateOrderStatus("Shipped")}
              disabled={
                orderStatus.customer_status === "Shipped" ||
                orderStatus.order_placed_status !== "Ordered"
              }
            >
              Shipped
            </button>
            <button
              onClick={() => updateOrderStatus("Received")}
              disabled={
                orderStatus.received_status === "Received" ||
                orderStatus.customer_status !== "Shipped"
              }
            >
              Received
            </button>
          </div>

          {/* Current Status */}
          <div style={{ marginTop: "10px" }}>
            <p>
              <strong>Current Status:</strong> {currentStatus.status}
            </p>
            {currentStatus.date && (
              <p>
                <strong>Last Updated:</strong>{" "}
                {new Date(currentStatus.date).toLocaleString()}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default POOrderMaster;
