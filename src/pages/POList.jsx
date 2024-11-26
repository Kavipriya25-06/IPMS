// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// const POOrderList = () => {
//   const [poOrders, setPOOrders] = useState([]); // State to store PO orders
//   const navigate = useNavigate(); // Navigation hook

//   // Function to fetch PO orders from the API
//   const fetchPOOrders = async () => {
//     try {
//       const response = await fetch("http://127.0.0.1:8000/po_list/");
//       const result = await response.json();
//       console.log("API Response:", result);

//       if (Array.isArray(result)) {
//         setPOOrders(result); // Use the array directly
//       } else {
//         console.error("Unexpected API response format:", result);
//         setPOOrders([]); // Reset to empty state if the response is invalid
//       }
//     } catch (error) {
//       console.error("Error fetching PO Order List:", error);
//     }
//   };

//   // Fetch data on component mount
//   useEffect(() => {
//     fetchPOOrders();
//   }, []);

//   // Render the table
//   return (
//     <div>
//       <h2>PO Order List</h2>
//       {poOrders.length === 0 ? (
//         <p>No Purchase Orders found.</p>
//       ) : (
//         <table>
//           <thead>
//             <tr>
//               <th>PO ID</th>
//               <th>Vendor Name</th>
//               <th>Status</th>
//               <th>Total Cost</th>
//               <th>Date</th>
//             </tr>
//           </thead>
//           <tbody>
//             {poOrders.map((order) => (
//               <tr key={order.id}>
//                 <td
//                   style={{ cursor: "pointer", textDecoration: "underline" }}
//                   onClick={() => navigate(`/po-details/${order.id}`)} // Navigate to PO details
//                 >
//                   {order.id}
//                 </td>
//                 <td>{order.cart_details.vendor_name}</td>
//                 <td>{order.status}</td>
//                 <td>{order.cart_details.total_cost}</td>
//                 <td>{order.date}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// };

// export default POOrderList;

// second set of code

// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// const POOrderList = () => {
//   const [poOrders, setPOOrders] = useState([]); // State to store PO orders
//   const [orderStatuses, setOrderStatuses] = useState([]); // State to store statuses for each PO
//   const [statusPopup, setStatusPopup] = useState(null); // State for status popup
//   const navigate = useNavigate(); // Navigation hook

//   // Fetch PO orders
//   const fetchPOOrders = async () => {
//     try {
//       const response = await fetch("http://127.0.0.1:8000/po_list/");
//       const result = await response.json();
//       console.log("Fetched PO orders", result);
//       if (Array.isArray(result)) {
//         setPOOrders(result);
//       } else {
//         console.error("Unexpected PO List API response:", result);
//         setPOOrders([]);
//       }
//     } catch (error) {
//       console.error("Error fetching PO List:", error);
//     }
//   };

//   // Fetch order statuses
//   const fetchOrderStatuses = async () => {
//     try {
//       const response = await fetch("http://127.0.0.1:8000/order_view/");
//       const result = await response.json();
//       console.log("Order statuses", result);
//       if (Array.isArray(result)) {
//         setOrderStatuses(result);
//       } else {
//         console.error("Unexpected Order Status API response:", result);
//         setOrderStatuses([]);
//       }
//     } catch (error) {
//       console.error("Error fetching Order Status:", error);
//     }
//   };

//   // Combine PO and Statuses
//   const getAggregatedStatus = (poId) => {
//     const relevantStatuses = orderStatuses.filter(
//       (status) => status.po_master_id === poId
//     );
//     console.log("PO ID given to filtering status", poId);
//     console.log("relevant status", relevantStatuses);
//     console.log("All Order status", orderStatuses);

//     if (relevantStatuses.length === 0) {
//       return { status: "Pending zero", mixed: false };
//     }

//     const uniqueStatuses = new Set(
//       relevantStatuses.map((status) => {
//         if (status.received_status === "Received") return "Received";
//         if (status.customer_status === "Shipped") return "Shipped";
//         if (status.order_placed_status === "Ordered") return "Ordered";
//         return "Pending mixed";
//       })
//     );

//     if (uniqueStatuses.size === 1) {
//       return { status: Array.from(uniqueStatuses)[0], mixed: false };
//     }

//     return { status: "In Progress", mixed: true };
//   };

//   // Open Status Popup
//   const handleStatusClick = (poId) => {
//     const relevantStatuses = orderStatuses.filter(
//       (status) => status.po_master_id === poId
//     );

//     const groupedStatuses = {
//       Received: [],
//       Shipped: [],
//       Ordered: [],
//       Pending: [],
//     };

//     relevantStatuses.forEach((status) => {
//       if (status.received_status === "Received") {
//         groupedStatuses.Received.push(status.component_id);
//       } else if (status.customer_status === "Shipped") {
//         groupedStatuses.Shipped.push(status.component_id);
//       } else if (status.order_placed_status === "Ordered") {
//         groupedStatuses.Ordered.push(status.component_id);
//       } else {
//         groupedStatuses.Pending.push(status.component_id);
//       }
//     });

//     setStatusPopup({ poId, groupedStatuses });
//   };

//   // Close Status Popup
//   const handleClosePopup = () => {
//     setStatusPopup(null);
//   };

//   // Fetch data on component mount
//   useEffect(() => {
//     fetchPOOrders();
//     fetchOrderStatuses();
//   }, []);

//   return (
//     <div>
//       <h2>PO Order List</h2>
//       {poOrders.length === 0 ? (
//         <p>No Purchase Orders found.</p>
//       ) : (
//         <table>
//           <thead>
//             <tr>
//               <th>PO ID</th>
//               <th>Vendor Name</th>
//               <th>Status</th>
//               <th>Total Cost</th>
//               <th>Date</th>
//             </tr>
//           </thead>
//           <tbody>
//             {poOrders.map((order) => {
//               const { status, mixed } = getAggregatedStatus(order.id);
//               return (
//                 <tr key={order.id}>
//                   <td
//                     style={{ cursor: "pointer", textDecoration: "underline" }}
//                     onClick={() => navigate(`/po-details/${order.id}`)}
//                   >
//                     {order.id}
//                   </td>
//                   <td>{order.cart_details.vendor_name}</td>
//                   <td
//                     style={{ cursor: "pointer", color: "blue" }}
//                     onClick={() => handleStatusClick(order.id)}
//                   >
//                     {status}
//                   </td>
//                   <td>{order.cart_details.total_cost}</td>
//                   <td>{order.date}</td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       )}

//       {/* Status Popup */}
//       {statusPopup && (
//         <div className="popup">
//           <h3>Status for PO ID: {statusPopup.poId}</h3>
//           {Object.entries(statusPopup.groupedStatuses).map(
//             ([statusType, components]) => (
//               <div key={statusType}>
//                 <h4>{statusType}</h4>
//                 {components.length > 0 ? (
//                   <ul>
//                     {components.map((componentId, idx) => (
//                       <li key={idx}>{componentId}</li>
//                     ))}
//                   </ul>
//                 ) : (
//                   <p>No components</p>
//                 )}
//               </div>
//             )
//           )}
//           <button onClick={handleClosePopup}>Close</button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default POOrderList;

// third set of code

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const POOrderList = () => {
  const [poOrders, setPOOrders] = useState([]); // State to store PO orders
  const [poMaster, setPOMaster] = useState([]); // State to store PO master data
  const [orderStatuses, setOrderStatuses] = useState([]); // State to store statuses for each PO
  const [statusPopup, setStatusPopup] = useState(null); // State for status popup
  const navigate = useNavigate(); // Navigation hook

  const POviewclick = () => {
    navigate("/purchase-order");
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

  // Open Status Popup
  const handleStatusClick = (poId) => {
    const relevantPOMaster = poMaster.filter((po) => po.PO_id === poId);
    const poMasterIds = relevantPOMaster.map((po) => po.id);

    const relevantStatuses = orderStatuses.filter((status) =>
      poMasterIds.includes(status.po_master_id)
    );

    const groupedStatuses = {
      Received: [],
      Shipped: [],
      Ordered: [],
      Pending: [],
    };

    relevantStatuses.forEach((status) => {
      if (status.received_status === "Received") {
        groupedStatuses.Received.push(status.component_id);
      } else if (status.customer_status === "Shipped") {
        groupedStatuses.Shipped.push(status.component_id);
      } else if (status.order_placed_status === "Ordered") {
        groupedStatuses.Ordered.push(status.component_id);
      } else {
        groupedStatuses.Pending.push(status.component_id);
      }
    });

    setStatusPopup({ poId, groupedStatuses });
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {poOrders.map((order) => {
              const { status, mixed } = getAggregatedStatus(order.id);
              return (
                <tr key={order.id}>
                  <td
                    style={{ cursor: "pointer", textDecoration: "underline" }}
                    onClick={() => navigate(`/po-details/${order.id}`)}
                  >
                    {order.id}
                  </td>
                  <td>{order.cart_details.vendor_name}</td>
                  <td
                    style={{ cursor: "pointer", color: "blue" }}
                    onClick={() => handleStatusClick(order.id)}
                  >
                    {status}
                  </td>
                  <td>{order.cart_details.total_cost}</td>
                  <td>{order.date}</td>
                  <td>
                  <button onClick={POviewclick}> Download </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
