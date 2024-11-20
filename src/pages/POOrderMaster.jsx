// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";

// const POOrderMaster = () => {
//   const { poId } = useParams(); // Extract PO ID from the route
//   const [poDetails, setPODetails] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [showPopup, setShowPopup] = useState(false);
//   const [statusInput, setStatusInput] = useState("");
//   const [dateInput, setDateInput] = useState("");
//   const [imageInput, setImageInput] = useState(null);

//   const fetchPODetails = async () => {
//     try {
//       const response = await fetch("http://127.0.0.1:8000/po_master/");
//       const result = await response.json();

//       if (Array.isArray(result)) {
//         const filteredPO = result.filter((order) => order.PO_id === poId);
//         if (filteredPO.length > 0) {
//           setPODetails(filteredPO);
//         } else {
//           setError("No details found for this PO ID.");
//         }
//       } else {
//         console.error("Unexpected API response format:", result);
//         setError("Failed to retrieve PO details.");
//       }
//     } catch (error) {
//       console.error("Error fetching PO details:", error);
//       setError(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchPODetails();
//   }, [poId]);

//   const handleButtonClick = (status) => {
//     setStatusInput(status);
//     setShowPopup(true);
//   };

//   const handleFormSubmit = async (e) => {
//     e.preventDefault();
//     console.log(
//       "Date:",
//       dateInput,
//       "Status:",
//       statusInput,
//       "Image:",
//       imageInput
//     );

//     // Add your API update logic here
//     // Example: Send a PUT request to update the PO status
//     try {
//       const formData = new FormData();
//       formData.append("status", statusInput);
//       formData.append("date", dateInput);
//       if (imageInput) {
//         formData.append("image", imageInput);
//       }

//       const response = await fetch(
//         `http://127.0.0.1:8000/po_master/${poId}/update/`,
//         {
//           method: "PUT",
//           body: formData,
//         }
//       );

//       if (response.ok) {
//         console.log("Status updated successfully");
//         fetchPODetails(); // Refresh PO details
//       } else {
//         console.error("Error updating status:", response.statusText);
//       }
//     } catch (error) {
//       console.error("Error submitting form:", error);
//     }

//     setShowPopup(false);
//     setDateInput("");
//     setImageInput(null);
//   };

//   if (loading) {
//     return <p>Loading PO Details...</p>;
//   }

//   if (error) {
//     return <p>Error: {error}</p>;
//   }

//   if (poDetails.length === 0) {
//     return <p>No details found for this PO.</p>;
//   }

//   return (
//     <div>
//       <h2>PO Details</h2>
//       <table>
//         <thead>
//           <tr>
//             <th>Component ID</th>
//             <th>Category</th>
//             <th>Component Type</th>
//             <th>Specification</th>
//             <th>UOM</th>
//             <th>Vendor Name</th>
//             <th>Quantity</th>
//             <th>Unit Price</th>
//             <th>GST</th>
//             <th>Total Cost</th>
//             <th>Status</th>
//           </tr>
//         </thead>
//         <tbody>
//           {poDetails.map((order, index) => (
//             <tr key={index}>
//               <td>{order.cart_details.component_id}</td>
//               <td>{order.cart_details.category}</td>
//               <td>{order.cart_details.component_type}</td>
//               <td>{order.cart_details.component_specification}</td>
//               <td>{order.cart_details.unit_of_measurement}</td>
//               <td>{order.cart_details.vendor_name}</td>
//               <td>{order.cart_details.quantity}</td>
//               <td>{order.cart_details.unit_price}</td>
//               <td>{order.cart_details.GST}</td>
//               <td>{order.cart_details.total_cost}</td>
//               <td>{order.status}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//       {/* Buttons */}
//       <div style={{ marginTop: "20px" }}>
//         <button onClick={() => handleButtonClick("Order Placed")}>
//           Order Placed
//         </button>
//         <button onClick={() => handleButtonClick("Shipped")}>Shipped</button>
//         <button onClick={() => handleButtonClick("Received")}>Received</button>
//       </div>

//       {/* Popup for updating status */}
//       {showPopup && (
//         <div className="popup">
//           <form onSubmit={handleFormSubmit}>
//             <h3>Update Status</h3>
//             <label>
//               Date:
//               <input
//                 type="date"
//                 value={dateInput}
//                 onChange={(e) => setDateInput(e.target.value)}
//                 required
//               />
//             </label>
//             <label>
//               Status:
//               <input type="text" value={statusInput} readOnly />
//             </label>
//             {statusInput === "Received" && (
//               <label>
//                 Upload Image:
//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={(e) => setImageInput(e.target.files[0])}
//                 />
//               </label>
//             )}
//             <button type="submit">Submit</button>
//             <button type="button" onClick={() => setShowPopup(false)}>
//               Cancel
//             </button>
//           </form>
//         </div>
//       )}
//     </div>
//   );
// };

// export default POOrderMaster;





import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const POOrderMaster = () => {
  const { poId } = useParams(); // Extract PO ID from the route
  const [poDetails, setPODetails] = useState(null);
  const [orderStatus, setOrderStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [statusInput, setStatusInput] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [imageInput, setImageInput] = useState(null);

  // Fetch PO Details
  const fetchPODetails = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/po_master/");
      const result = await response.json();

      if (Array.isArray(result)) {
        const filteredPO = result.find((order) => order.PO_id === poId);
        if (filteredPO) {
          setPODetails(filteredPO);
        } else {
          setError("No details found for this PO ID.");
        }
      } else {
        console.error("Unexpected API response format:", result);
        setError("Failed to retrieve PO details.");
      }
    } catch (error) {
      console.error("Error fetching PO details:", error);
      setError(error.message);
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
        const filteredStatus = result.find(
          (order) => order.po_master_id === poDetails.id
        );
        setOrderStatus(filteredStatus || null);
      } else {
        console.error("Unexpected API response format:", result);
        setOrderStatus(null);
      }
    } catch (error) {
      console.error("Error fetching order status:", error);
    }
  };

  // Update Order Status
  const updateOrderStatus = async () => {
    if (!poDetails) return;
    try {
      const payload = {
        order_placed_status: statusInput === "Order Placed" ? "Ordered" : "",
        order_placed_date_time:
          statusInput === "Order Placed" ? new Date().toISOString() : null,
        customer_status: statusInput === "Shipped" ? "Shipped" : "",
        customer_date_time:
          statusInput === "Shipped" ? new Date().toISOString() : null,
        received_status: statusInput === "Received" ? "Received" : "",
        received_date:
          statusInput === "Received" ? new Date().toISOString() : null,
        po_master_id: poDetails.id,
      };

      const method = orderStatus ? "PUT" : "POST";
      const apiUrl = orderStatus
        ? `http://127.0.0.1:8000/order_view/${orderStatus.id}/`
        : `http://127.0.0.1:8000/order_view/`;

      const response = await fetch(apiUrl, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      console.log("The response",response);

      if (response.ok) {
        console.log(`${statusInput} status updated successfully.`);
        fetchOrderStatus(); // Refresh the order status
      } else {
        console.error("Error updating status:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  // Fetch PO Details and Order Status on Component Mount
  useEffect(() => {
    fetchPODetails();
  }, [poId]);

  useEffect(() => {
    if (poDetails) {
      fetchOrderStatus();
    }
  }, [poDetails]);

  const handleButtonClick = (status) => {
    setStatusInput(status);
    setShowPopup(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    await updateOrderStatus();
    setShowPopup(false);
    setDateInput("");
    setImageInput(null);
  };

  if (loading) {
    return <p>Loading PO Details...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!poDetails) {
    return <p>No details found for this PO.</p>;
  }

  return (
    <div>
      <h2>PO Details</h2>
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
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{poDetails.cart_details.component_id}</td>
            <td>{poDetails.cart_details.category}</td>
            <td>{poDetails.cart_details.component_type}</td>
            <td>{poDetails.cart_details.component_specification}</td>
            <td>{poDetails.cart_details.unit_of_measurement}</td>
            <td>{poDetails.cart_details.vendor_name}</td>
            <td>{poDetails.cart_details.quantity}</td>
            <td>{poDetails.cart_details.unit_price}</td>
            <td>{poDetails.cart_details.GST}</td>
            <td>{poDetails.cart_details.total_cost}</td>
            <td>{orderStatus?.received_status || orderStatus?.customer_status || orderStatus?.order_placed_status || "Pending"}</td>
          </tr>
        </tbody>
      </table>

      {/* Buttons */}
      <div style={{ marginTop: "20px" }}>
        <button onClick={() => handleButtonClick("Order Placed")}>
          Order Placed
        </button>
        <button onClick={() => handleButtonClick("Shipped")}>Shipped</button>
        <button onClick={() => handleButtonClick("Received")}>Received</button>
      </div>

      {/* Popup for updating status */}
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
