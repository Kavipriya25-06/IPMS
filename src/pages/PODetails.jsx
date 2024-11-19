// src/pages/PODetails.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const PODetails = () => {
  const { poId } = useParams();
  const [poDetails, setPoDetails] = useState(null);

  const fetchPODetails = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/po_list/${poId}`);
      const result = await response.json();

      if (result && result.message === "PO retrieved successfully.") {
        setPoDetails(result.data);
      } else {
        console.error("Unexpected API response format:", result);
      }
    } catch (error) {
      console.error("Error fetching PO details:", error);
    }
  };

  useEffect(() => {
    fetchPODetails();
  }, [poId]);

  if (!poDetails) {
    return <div>Loading PO Details...</div>;
  }

  // Ensure cart_details is treated as an array
  const cartDetails = Array.isArray(poDetails.cart_details)
    ? poDetails.cart_details
    : [poDetails.cart_details];

  const totalCost = cartDetails.reduce(
    (total, item) => total + (item.total_cost || 0),
    0
  );

  return (
    <div>
      <h2>PO Details</h2>
      <p>
        <strong>PO ID:</strong> {poDetails.PO_id}
      </p>
      <p>
        <strong>Status:</strong> {poDetails.status}
      </p>
      <p>
        <strong>Total Cost:</strong> {totalCost}
      </p>
      <h3>Cart Details</h3>
      <table>
        <thead>
          <tr>
            <th>Component ID</th>
            <th>Component Type</th>
            <th>Specification</th>
            <th>Unit of Measurement</th>
            <th>Vendor Name</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>GST</th>
            <th>Total Cost</th>
          </tr>
        </thead>
        <tbody>
          {cartDetails.map((item, index) => (
            <tr key={index}>
              <td>{item.component_id}</td>
              <td>{item.component_type}</td>
              <td>{item.component_specification}</td>
              <td>{item.unit_of_measurement}</td>
              <td>{item.vendor_name}</td>
              <td>{item.quantity}</td>
              <td>{item.unit_price}</td>
              <td>{item.GST}</td>
              <td>{item.total_cost}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PODetails;
