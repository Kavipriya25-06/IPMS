import React, { useState, useEffect } from "react";

const POOrderList = () => {
  const [poData, setPOData] = useState([]);

  useEffect(() => {
    // Fetch PO Order List data from the backend API
    const fetchPOData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/po_order_list/");
        const data = await response.json();
        setPOData(data);
      } catch (error) {
        console.error("Error fetching PO Order List data:", error);
      }
    };

    fetchPOData();
  }, []);

  return (
    <div>
      <h4>PO Order List</h4>
      <table>
        <thead>
          <tr>
            <th>PO ID</th>
            <th>Component ID</th>
            <th>Category</th>
            <th>Specifications</th>
            <th>UOM</th>
            <th>Vendor Name</th>
            <th>Status</th>
            <th>Total Amount</th>
          </tr>
        </thead>
        <tbody>
          {poData.map((po, index) => (
            <tr key={index}>
              <td>{po.PO_id}</td>
              <td>{po.Component_id}</td>
              <td>{po.category}</td>
              <td>{po.specifications}</td>
              <td>{po.UOM}</td>
              <td>{po.vendor_name}</td>
              <td>{po.status}</td>
              <td>{po.total_amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default POOrderList;
