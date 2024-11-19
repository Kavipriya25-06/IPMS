import React, { useEffect, useState } from "react";

const POOrderMaster = () => {
  const [poOrders, setPOOrders] = useState([]); // State to store PO orders

  // Function to fetch PO orders from the API
  const fetchPOOrders = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/po_list/");
      const result = await response.json();
      console.log("API Response:", result);

      if (result && result.message === "All POs retrieved successfully.") {
        setPOOrders(result.data); // Use the array directly
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
            {poOrders.map((order, index) => (
              <tr key={index}>
                <td>{order.PO_id}</td>
                <td>{order.cart_details.component_id}</td>
                <td>{order.cart_details.category}</td>
                <td>{order.cart_details.component_type}</td>
                <td>{order.cart_details.component_specification}</td>
                <td>{order.cart_details.unit_of_measurement}</td>
                <td>{order.cart_details.vendor_name}</td>
                <td>{order.cart_details.quantity}</td>
                <td>{order.cart_details.unit_price}</td>
                <td>{order.cart_details.GST}</td>
                <td>{order.cart_details.total_cost}</td>
                <td>{order.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default POOrderMaster;
