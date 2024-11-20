import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const POOrderList = () => {
  const [poOrders, setPOOrders] = useState([]); // State to store PO orders
  const navigate = useNavigate(); // Navigation hook

  // Function to fetch PO orders from the API
  const fetchPOOrders = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/po_list/");
      const result = await response.json();
      console.log("API Response:", result);

      if (Array.isArray(result)) {
        setPOOrders(result); // Use the array directly
      } else {
        console.error("Unexpected API response format:", result);
        setPOOrders([]); // Reset to empty state if the response is invalid
      }
    } catch (error) {
      console.error("Error fetching PO Order List:", error);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchPOOrders();
  }, []);

  // Render the table
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
            </tr>
          </thead>
          <tbody>
            {poOrders.map((order) => (
              <tr key={order.id}>
                <td
                  style={{ cursor: "pointer", textDecoration: "underline" }}
                  onClick={() => navigate(`/po-details/${order.id}`)} // Navigate to PO details
                >
                  {order.id}
                </td>
                <td>{order.cart_details.vendor_name}</td>
                <td>{order.status}</td>
                <td>{order.cart_details.total_cost}</td>
                <td>{order.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default POOrderList;
