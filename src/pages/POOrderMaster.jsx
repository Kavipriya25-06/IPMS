import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const POOrderMaster = () => {
  const { poId } = useParams(); // Extract PO ID from the route
  const [poDetails, setPODetails] = useState([]);
  const [orderStatus, setOrderStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [statusInput, setStatusInput] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [imageInput, setImageInput] = useState(null);
  const [selectedComponent, setSelectedComponent] = useState(null);

  // Fetch PO Details
  const fetchPODetails = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/po_master/");
      const result = await response.json();

      if (Array.isArray(result)) {
        const filteredPO = result.filter((order) => order.PO_id === poId);
        setPODetails(filteredPO);
        if (filteredPO.length === 0)
          setError("No details found for this PO ID.");
      } else {
        throw new Error("Unexpected API response format");
      }
    } catch (error) {
      console.error("Error fetching PO details:", error.message);
      setError("Failed to retrieve PO details.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Order Status
  const fetchOrderStatus = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/order_view/");
      const result = await response.json();

      if (Array.isArray(result)) {
        const filteredStatus = result.filter((status) =>
          poDetails.some(
            (po) =>
              po.id === status.po_master_id 
          )
        );
        setOrderStatus(filteredStatus);
      } else {
        throw new Error("Unexpected API response format");
      }
    } catch (error) {
      console.error("Error fetching order status:", error.message);
    }
  };

  // Update Order Status
  // const updateOrderStatus = async () => {
  //   if (!poDetails.length || !selectedComponent) return;

  //   try {
  //     const payload = {
  //       order_placed_status:
  //         statusInput === "Order Placed"
  //           ? "Ordered"
  //           : orderStatus[0]?.order_placed_status || "",
  //       order_placed_date_time:
  //         statusInput === "Order Placed"
  //           ? new Date().toISOString()
  //           : orderStatus[0]?.order_placed_date_time || null,
  //       customer_status:
  //         statusInput === "Shipped"
  //           ? "Shipped"
  //           : orderStatus[0]?.customer_status || "",
  //       customer_date_time:
  //         statusInput === "Shipped"
  //           ? new Date().toISOString()
  //           : orderStatus[0]?.customer_date_time || null,
  //       received_status:
  //         statusInput === "Received"
  //           ? "Received"
  //           : orderStatus[0]?.received_status || "",
  //       received_date:
  //         statusInput === "Received"
  //           ? new Date().toISOString()
  //           : orderStatus[0]?.received_date || null,
  //       po_master_id: poDetails[0].id, // Assume the first PO for this operation
  //     };

  //     console.log("Payload being sent:", payload);

  //     const method = orderStatus.length > 0 ? "PUT" : "POST";
  //     const apiUrl =
  //       orderStatus.length > 0
  //         ? `http://127.0.0.1:8000/order_view/${orderStatus[0].id}/`
  //         : `http://127.0.0.1:8000/order_view/`;

  //     const response = await fetch(apiUrl, {
  //       method,
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(payload),
  //     });

  //     if (response.ok) {
  //       console.log(`${statusInput} status updated successfully.`);
  //       fetchOrderStatus(); // Refresh the order status
  //     } else {
  //       const errorDetails = await response.json();
  //       console.error(
  //         "Error updating status:",
  //         response.statusText,
  //         errorDetails
  //       );
  //     }
  //   } catch (error) {
  //     console.error("Error updating order status:", error.message);
  //   }
  // };

  const updateOrderStatus = async () => {
    if (!poDetails.length || !selectedComponent) return;

    try {
      const payload = {
        order_placed_status:
          statusInput === "Order Placed"
            ? "Ordered"
            : orderStatus.find(
                (status) => status.component_id === selectedComponent
              )?.order_placed_status || "",
        order_placed_date_time:
          statusInput === "Order Placed"
            ? dateInput // Use the selected date
            : orderStatus.find(
                (status) => status.component_id === selectedComponent
              )?.order_placed_date_time || null,
        customer_status:
          statusInput === "Shipped"
            ? "Shipped"
            : orderStatus.find(
                (status) => status.component_id === selectedComponent
              )?.customer_status || "",
        customer_date_time:
          statusInput === "Shipped"
            ? dateInput // Use the selected date
            : orderStatus.find(
                (status) => status.component_id === selectedComponent
              )?.customer_date_time || null,
        received_status:
          statusInput === "Received"
            ? "Received"
            : orderStatus.find(
                (status) => status.component_id === selectedComponent
              )?.received_status || "",
        received_date:
          statusInput === "Received"
            ? dateInput // Use the selected date
            : orderStatus.find(
                (status) => status.component_id === selectedComponent
              )?.received_date || null,
        po_master_id: poDetails[0].id, // Assume the first PO for this operation
        component_id: selectedComponent, // Selected component for the operation
      };

      console.log("Payload being sent:", payload);

      const existingStatus = orderStatus.find(
        (status) => status.component_id === selectedComponent
      );
      const method = existingStatus ? "PUT" : "POST";
      const apiUrl = existingStatus
        ? `http://127.0.0.1:8000/order_view/${existingStatus.id}/`
        : `http://127.0.0.1:8000/order_view/`;

      const response = await fetch(apiUrl, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log(`${statusInput} status updated successfully.`);
        await fetchOrderStatus(); // Refresh the order status
      } else {
        const errorDetails = await response.json();
        console.error("Error updating status:", errorDetails);
      }
    } catch (error) {
      console.error("Error updating order status:", error.message);
    }
  };

  // Fetch PO Details and Order Status on Component Mount
  useEffect(() => {
    fetchPODetails();
  }, [poId]);

  useEffect(() => {
    if (poDetails.length > 0) {
      fetchOrderStatus();
    }
  }, [poDetails]);

  const handleButtonClick = (status, componentId) => {
    setStatusInput(status);
    setSelectedComponent(componentId);
    setShowPopup(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    await updateOrderStatus();
    setShowPopup(false);
    setDateInput("");
    setImageInput(null);
  };

  return (
    <div>
      <h2>PO Details</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Component ID</th>
              <th>Category</th>
              <th>Component Type</th>
              <th>Specification</th>
              <th>UOM</th>
              <th>Vendor Name</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>GST</th>
              <th>Total Cost</th>
              <th>Status</th>
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
                <td>{po.cart_details.vendor_name}</td>
                <td>{po.cart_details.quantity}</td>
                <td>{po.cart_details.unit_price}</td>
                <td>{po.cart_details.GST}</td>
                <td>{po.cart_details.total_cost}</td>
                <td>
                  {orderStatus.some(
                    (status) =>
                      status.component_id === po.cart_details.component_id
                  ) ? (
                    orderStatus
                      .filter(
                        (status) =>
                          status.component_id === po.cart_details.component_id
                      )
                      .map((status, idx) => (
                        <div key={idx}>
                          {status.received_status ||
                            status.customer_status ||
                            status.order_placed_status ||
                            "Pending"}
                        </div>
                      ))
                  ) : (
                    <div>Pending</div>
                  )}
                </td>

                <td>
                  <button
                    onClick={() =>
                      handleButtonClick(
                        "Order Placed",
                        po.cart_details.component_id
                      )
                    }
                    disabled={orderStatus.some(
                      (status) =>
                        status.component_id === po.cart_details.component_id
                    )}
                  >
                    Order Placed
                  </button>
                  <button
                    onClick={() =>
                      handleButtonClick("Shipped", po.cart_details.component_id)
                    }
                    disabled={
                      !orderStatus.some(
                        (status) =>
                          status.component_id ===
                            po.cart_details.component_id &&
                          status.order_placed_status === "Ordered" &&
                          status.customer_status !== "Shipped"
                      )
                    }
                  >
                    Shipped
                  </button>
                  <button
                    onClick={() =>
                      handleButtonClick(
                        "Received",
                        po.cart_details.component_id
                      )
                    }
                    disabled={
                      !orderStatus.some(
                        (status) =>
                          status.component_id ===
                            po.cart_details.component_id &&
                          status.customer_status === "Shipped" &&
                          status.received_status !== "Received"
                      )
                    }
                  >
                    Received
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* <div style={{ marginTop: "20px" }}>
        <button onClick={() => handleButtonClick("Order Placed")}>
          Order Placed
        </button>
        <button onClick={() => handleButtonClick("Shipped")}>Shipped</button>
        <button onClick={() => handleButtonClick("Received")}>Received</button>
      </div> */}

      {showPopup && (
        <div className="popup">
          <form onSubmit={handleFormSubmit}>
            <h3>Update Status</h3>
            <label>
              Date:
              <input
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                required
              />
            </label>
            <label>
              Status:
              <input type="text" value={statusInput} readOnly />
            </label>
            {statusInput === "Received" && (
              <label>
                Upload Image:
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageInput(e.target.files[0])}
                />
              </label>
            )}
            <button type="submit">Submit</button>
            <button type="button" onClick={() => setShowPopup(false)}>
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default POOrderMaster;
