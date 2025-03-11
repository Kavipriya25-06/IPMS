import React, { useEffect, useState } from "react";
import axios from "axios";
import config from "../Config"; // Ensure this file exists

function Mrf() {
  const [reservedProducts, setReservedProducts] = useState([]); // Ensure an array

  // Fetch reserved products from API on component mount
  useEffect(() => {
    fetchReservedProducts();
  }, []);

  const fetchReservedProducts = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/reserved-products`);
      if (Array.isArray(response.data)) {
        setReservedProducts(response.data);
      } else {
        setReservedProducts([]);
        console.error("Invalid response format:", response.data);
      }
    } catch (error) {
      console.error("Error fetching reserved products:", error);
      setReservedProducts([]); // Prevent crashing
    }
  };

  // Handle Dereserve Action
  const handleDereserve = async (serialNumber) => {
    try {
      await axios.post(`${config.API_URL}/dereserve`, { serialNumber });
      setReservedProducts((prev) =>
        prev.filter((item) => item.serialNumber !== serialNumber)
      );
    } catch (error) {
      console.error("Error dereserving product:", error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ fontWeight: "bold" }}>Reserved product</h2>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h4>Request ID - R_00001</h4>
        <button
          style={{
            backgroundColor: "#ff6600",
            color: "white",
            border: "none",
            // padding: "1px 5px",
            cursor: "pointer",
            fontSize: "14px",
            borderRadius: "4px",
          }}
        >
          Create Material Request 
        </button>
      </div>

      {/* Table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "20px",
          border: "1px solid #ddd",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#ff6600", color: "white" }}>
            <th style={tableHeaderStyle}>Component Type</th>
            <th style={tableHeaderStyle}>Specification</th>
            <th style={tableHeaderStyle}>Unit of Measurement</th>
            <th style={tableHeaderStyle}>Category</th>
            <th style={tableHeaderStyle}>Vendor Name</th>
            <th style={tableHeaderStyle}>Serial Number</th>
            <th style={tableHeaderStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(reservedProducts) && reservedProducts.length > 0 ? (
            reservedProducts.map((product, index) => (
              <tr key={index} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={tableCellStyle}>{product.componentType}</td>
                <td style={tableCellStyle}>{product.specification}</td>
                <td style={tableCellStyle}>{product.unit}</td>
                <td style={tableCellStyle}>{product.category}</td>
                <td style={tableCellStyle}>{product.vendorName}</td>
                <td style={tableCellStyle}>{product.serialNumber}</td>
                <td style={tableCellStyle}>
                  <button
                    onClick={() => handleDereserve(product.serialNumber)}
                    style={{
                      backgroundColor: "#ccc",
                      border: "none",
                      padding: "5px 10px",
                      cursor: "pointer",
                      fontSize: "12px",
                      borderRadius: "5px",
                    }}
                  >
                    Dereserve
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: "center", padding: "10px" }}>
                No reserved products available.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Empty Request ID Field */}
      <div style={{ marginTop: "20px" }}>
        <h4>Request ID - </h4>
      </div>
    </div>
  );
}

// Table styling
const tableHeaderStyle = {
  padding: "10px",
  textAlign: "left",
  fontWeight: "bold",
};

const tableCellStyle = {
  padding: "10px",
  borderBottom: "1px solid #ddd",
};

export default Mrf;
