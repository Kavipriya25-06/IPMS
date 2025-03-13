// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import config from "../Config"; // Ensure this file exists

// function Mrf() {
//   const [reservedProducts, setReservedProducts] = useState([]); // Ensure an array

//   // Fetch reserved products from API on component mount
//   useEffect(() => {
//     fetchReservedProducts();
//   }, []);

//   const fetchReservedProducts = async () => {
//     try {
//       const response = await axios.get(`${config.API_URL}/reserved-products`);
//       if (Array.isArray(response.data)) {
//         setReservedProducts(response.data);
//       } else {
//         setReservedProducts([]);
//         console.error("Invalid response format:", response.data);
//       }
//     } catch (error) {
//       console.error("Error fetching reserved products:", error);
//       setReservedProducts([]); // Prevent crashing
//     }
//   };

//   // Handle Dereserve Action
//   const handleDereserve = async (serialNumber) => {
//     try {
//       await axios.post(`${config.API_URL}/dereserve`, { serialNumber });
//       setReservedProducts((prev) =>
//         prev.filter((item) => item.serialNumber !== serialNumber)
//       );
//     } catch (error) {
//       console.error("Error dereserving product:", error);
//     }
//   };

//   return (
//     <div >
//       <h2 style={{ fontWeight: "bold" }}>Reserved products</h2>
//       <div style={{ display: "flex", justifyContent: "space-between" }}>
//         <h4>Request ID - R_00001</h4>
//         <button
//           style={{
//             backgroundColor: "#ff6600",
//             color: "white",
//             border: "none",
//             // padding: "1px 5px",
//             cursor: "pointer",
//             fontSize: "14px",
//             borderRadius: "4px",
//           }}
//         >
//           Create Material Request
//         </button>
//       </div>

//       {/* Table */}
//       <table
//         style={{
//           width: "100%",
//           borderCollapse: "collapse",
//           marginTop: "20px",
//           border: "1px solid #ddd",
//         }}
//       >
//         <thead>
//           <tr style={{ backgroundColor: "#ff6600", color: "white" }}>
//             <th style={tableHeaderStyle}>Component Type</th>
//             <th style={tableHeaderStyle}>Specification</th>
//             <th style={tableHeaderStyle}>Unit of Measurement</th>
//             <th style={tableHeaderStyle}>Category</th>
//             <th style={tableHeaderStyle}>Vendor Name</th>
//             <th style={tableHeaderStyle}>Serial Number</th>
//             <th style={tableHeaderStyle}>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {Array.isArray(reservedProducts) && reservedProducts.length > 0 ? (
//             reservedProducts.map((product, index) => (
//               <tr key={index} style={{ borderBottom: "1px solid #ddd" }}>
//                 <td style={tableCellStyle}>{product.componentType}</td>
//                 <td style={tableCellStyle}>{product.specification}</td>
//                 <td style={tableCellStyle}>{product.unit}</td>
//                 <td style={tableCellStyle}>{product.category}</td>
//                 <td style={tableCellStyle}>{product.vendorName}</td>
//                 <td style={tableCellStyle}>{product.serialNumber}</td>
//                 <td style={tableCellStyle}>
//                   <button
//                     onClick={() => handleDereserve(product.serialNumber)}
//                     style={{
//                       backgroundColor: "#ccc",
//                       border: "none",
//                       padding: "5px 10px",
//                       cursor: "pointer",
//                       fontSize: "12px",
//                       borderRadius: "5px",
//                     }}
//                   >
//                     Dereserve
//                   </button>
//                 </td>
//               </tr>
//             ))
//           ) : (
//             <tr>
//               <td colSpan="7" style={{ textAlign: "center", padding: "10px" }}>
//                 No reserved products available.
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </table>

//       {/* Empty Request ID Field */}
//       <div style={{ marginTop: "20px" }}>
//         <h4>Request ID - </h4>
//       </div>
//     </div>
//   );
// }

// // Table styling
// const tableHeaderStyle = {
//   padding: "10px",
//   textAlign: "left",
//   fontWeight: "bold",
// };

// const tableCellStyle = {
//   padding: "10px",
//   borderBottom: "1px solid #ddd",
// };

// export default Mrf;


import React, { useEffect, useState } from "react";
import config from "../Config"; // Import config for API endpoints

const Mrf = () => {
  const [data, setData] = useState({});

  useEffect(() => {
    fetch(`${config.apiBaseURL}/inventory/`)
      .then((response) => response.json())
      .then((jsonData) => {
        // Filter only "Reserved" items
        const reservedItems = jsonData.filter(
          (item) => item.status === "Reserved"
        );

        // Group by Request_id_assign
        const groupedData = reservedItems.reduce((acc, item) => {
          const requestId = item.Request_id_assign;
          if (!acc[requestId]) {
            acc[requestId] = [];
          }
          acc[requestId].push(item);
          return acc;
        }, {});

        setData(groupedData);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
    <div>
      <h2>Reserved products</h2>

      {Object.keys(data).map((requestId) => (
        <div key={requestId}>
          <h3>Request ID - {requestId}</h3>
          <table border="1" width="100%">
            <thead>
              <tr style={{ backgroundColor: "orange", color: "white" }}>
                <th>Component Type</th>
                <th>Specification</th>
                <th>Unit of Measurement</th>
                <th>Category</th>
                <th>Vendor Name</th>
                <th>Serial Number</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data[requestId].length === 0 ? (
                <tr>
                  <td colSpan="7">No reserved products available.</td>
                </tr>
              ) : (
                data[requestId].map((item) => (
                  <tr key={item.serial_number}>
                    <td>{item.component_type}</td>
                    <td>{item.specification}</td>
                    <td>{item.UOM}</td>
                    <td>{item.category}</td>
                    <td>{item.vendor_name}</td>
                    <td>{item.serial_number}</td>
                    <td>
                      <button>Action</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default Mrf;


//////////////////////////// Sort by Request ID
// {Object.keys(data)
//   .sort((a, b) => {
//     // Extract numeric parts from request IDs (e.g., "R_00001" -> 1)
//     const numA = parseInt(a.replace(/\D/g, ""), 10);
//     const numB = parseInt(b.replace(/\D/g, ""), 10);
//     return numA - numB;
//   })
