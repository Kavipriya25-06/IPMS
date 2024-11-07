// import React, { useState, useEffect } from "react";

// const BOMDisplay = () => {
//   const [boms, setBoms] = useState([]); // List of all BOMs
//   const [selectedBom, setSelectedBom] = useState(null); // Selected BOM details
//   const [selectedComponents, setSelectedComponents] = useState([]); // Components for selected BOM
//   const [bomQuantities, setBomQuantities] = useState({});

//   useEffect(() => {
//     // Fetch BOM list from the API
//     fetch("http://127.0.0.1:8000/bom_list/")
//       .then((response) => response.json())
//       .then((data) => setBoms(data))
//       .catch((error) => console.error("Error fetching BOMs:", error));
//     fetchBomQuantities();
//   }, []);

//   const fetchBomQuantities = () => {
//     fetch("http://127.0.0.1:8000/bom_master/")
//       .then((response) => response.json())
//       .then((data) => {
//         const quantities = {};
//         data.forEach((component) => {
//           if (!quantities[component.bom]) {
//             quantities[component.bom] = 0;
//           }
//           quantities[component.bom] += component.quantity; // Sum quantities for each BOM
//         });
//         setBomQuantities(quantities); // Store the total quantities
//       })
//       .catch((error) => console.error("Error fetching BOM quantities:", error));
//   };

//   const handleBomClick = (bomId) => {
//     // Find and set the selected BOM from the list
//     const bom = boms.find((b) => b.bom_id === bomId);
//     setSelectedBom(bom);

//     // Fetch BOM details from the API for the selected BOM ID
//     fetch("http://127.0.0.1:8000/bom_master/")
//       .then((response) => response.json())
//       .then((data) => {
//         const bomComponents = data.filter((b) => b.bom === bomId);
//         setSelectedComponents(bomComponents);
//       })
//       .catch((error) => console.error("Error fetching BOM components:", error));
//   };

//   return (
//     <div>
//       {!selectedBom ? (
//         // Display BOM list table if no BOM is selected
//         <div>
//           <h2>BOM List</h2>
//           <table>
//             <thead>
//               <tr>
//                 <th>BOM ID</th>
//                 <th>BOM Name</th>
//                 <th>Number of Components</th>
//                 <th>Created By</th>
//                 <th>Created Date</th>
//                 <th>Last Modified By</th>
//                 <th>Last Modified Date</th>
//               </tr>
//             </thead>
//             <tbody>
//               {boms.map((bom) => (
//                 <tr
//                   key={bom.bom_id}
//                   onClick={() => handleBomClick(bom.bom_id)}
//                   style={{ cursor: "pointer" }}
//                 >
//                   <td>{bom.bom_id}</td>
//                   <td>{bom.bom_name}</td>
//                   <td>{bomQuantities[bom.bom_id] || 0}</td>{""}
//                   {/* <-- Display total quantity */}
//                   <td>{bom.created_by}</td>
//                   <td>{bom.created_date}</td>
//                   <td>{bom.last_modified_by}</td>
//                   <td>{bom.last_modified_date}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       ) : (
//         // Display selected BOM details and components if a BOM is selected
//         <div>
//           <h3>Selected BOM: {selectedBom.bom_name}</h3>
//           <p>
//             <strong>BOM ID:</strong> {selectedBom.bom_id}
//           </p>

//           <h4>Components:</h4>
//           <table>
//             <thead>
//               <tr>
//                 <th>Component Type</th>
//                 <th>Specification</th>
//                 <th>Unit of Measurement</th>
//                 <th>Category</th>
//                 <th>Quantity</th>
//                 <th>Vendor Name</th>
//               </tr>
//             </thead>
//             <tbody>
//               {selectedComponents.map((component, index) => (
//                 <tr key={index}>
//                   <td>{component.component.component_type}</td>
//                   <td>{component.component.component_specification}</td>
//                   <td>{component.component.unit_of_measurement}</td>
//                   <td>{component.component.category}</td>
//                   <td>{component.quantity}</td>
//                   <td>{component.vendor.vendor_name}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//           <button onClick={() => setSelectedBom(null)}>Back to BOM List</button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default BOMDisplay;

// src/pages/BOM.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const BOM = () => {
  const [boms, setBoms] = useState([]); // List of all BOMs
  const [bomQuantities, setBomQuantities] = useState({});
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    // Fetch BOM list from the API
    fetch("http://127.0.0.1:8000/bom_list/")
      .then((response) => response.json())
      .then((data) => setBoms(data))
      .catch((error) => console.error("Error fetching BOMs:", error));

    fetchBomQuantities();
  }, []);

  const fetchBomQuantities = () => {
    fetch("http://127.0.0.1:8000/bom_master/")
      .then((response) => response.json())
      .then((data) => {
        const quantities = {};
        data.forEach((component) => {
          if (!quantities[component.bom]) {
            quantities[component.bom] = 0;
          }
          quantities[component.bom] += component.quantity;
        });
        setBomQuantities(quantities);
      })
      .catch((error) => console.error("Error fetching BOM quantities:", error));
  };

  const handleBomClick = (bomId) => {
    navigate(`/bom/${bomId}`); // Navigate to BOM details page for the selected BOM
  };

  return (
    <div>
      <h2>BOM List</h2>
      <table>
        <thead>
          <tr>
            <th>BOM ID</th>
            <th>BOM Name</th>
            <th>Number of Components</th>
            <th>Created By</th>
            <th>Created Date</th>
            <th>Last Modified By</th>
            <th>Last Modified Date</th>
          </tr>
        </thead>
        <tbody>
          {boms.map((bom) => (
            <tr
              key={bom.bom_id}
              onClick={() => handleBomClick(bom.bom_id)}
              style={{ cursor: "pointer" }}
            >
              <td>{bom.bom_id}</td>
              <td>{bom.bom_name}</td>
              <td>{bomQuantities[bom.bom_id] || 0}</td>
              <td>{bom.created_by}</td>
              <td>{bom.created_date}</td>
              <td>{bom.last_modified_by}</td>
              <td>{bom.last_modified_date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BOM;
