// import React, { useState, useEffect } from "react";

// const Inward = () => {
//   const [inwardData, setInwardData] = useState([]); // State to store inward data
//   const [showQCPopup, setShowQCPopup] = useState(false); // QC popup visibility
//   const [selectedRow, setSelectedRow] = useState(null); // Row selected for QC

//   // Fetch the inward data
//   const fetchInwardData = async () => {
//     try {
//       const response = await fetch("http://127.0.0.1:8000/inward_data/"); // Adjust API endpoint as required
//       const data = await response.json();
//       setInwardData(data);
//     } catch (error) {
//       console.error("Error fetching inward data:", error);
//     }
//   };

//   useEffect(() => {
//     fetchInwardData();
//   }, []);

//   // Handle QC button click
//   const handleQCClick = (row) => {
//     setSelectedRow(row);
//     setShowQCPopup(true);
//   };

//   // Handle QC submission
//   const handleQCSubmit = (isGood) => {
//     // Send the QC status to the backend
//     console.log(
//       `QC result for row ${selectedRow.component_id}: ${
//         isGood ? "Good" : "Bad"
//       }`
//     );
//     setShowQCPopup(false);
//     setSelectedRow(null);
//   };

//   // Generate Serial Number (dummy function for now)
//   const handleGenerateSerialNumber = (row) => {
//     console.log(`Generate serial number for row: ${row.component_id}`);
//     // Logic for serial number generation can be added here
//   };

//   return (
//     <div>
//       <h2>Inward</h2>
//       {inwardData.length === 0 ? (
//         <p>No inward records found.</p>
//       ) : (
//         <table>
//           <thead>
//             <tr>
//               <th>Component ID</th>
//               <th>Component Specification</th>
//               <th>Vendor Name</th>
//               <th>Serial Number</th>
//               <th>Date</th>
//               <th>QC</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {inwardData.map((row) => (
//               <tr key={row.component_id}>
//                 <td>{row.component_id}</td>
//                 <td>{row.component_specification}</td>
//                 <td>{row.vendor_name}</td>
//                 <td>{row.serial_number || "N/A"}</td>
//                 <td>{row.date || "N/A"}</td>
//                 <td>
//                   <button onClick={() => handleQCClick(row)}>Perform QC</button>
//                 </td>
//                 <td>
//                   <button onClick={() => handleGenerateSerialNumber(row)}>
//                     Generate Serial Number
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}

//       {/* QC Popup */}
//       {showQCPopup && selectedRow && (
//         <div className="popup">
//           <h3>Quality Check for {selectedRow.component_id}</h3>
//           <p>Is the quality of the component satisfactory?</p>
//           <div>
//             <button onClick={() => handleQCSubmit(true)}>Good</button>
//             <button onClick={() => handleQCSubmit(false)}>Bad</button>
//             <button onClick={() => setShowQCPopup(false)}>Cancel</button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Inward;

// import React, { useState } from "react";

// const Inward = () => {
//   // Dummy data for the table
//   const [inwardData, setInwardData] = useState([
//     {
//       id: 1,
//       component_id: "C_00001",
//       component_specification: "Mauch BEC",
//       vendor_name: "Macfos",
//       serial_number: "S12345",
//       date: "2024-11-20",
//       qc: null, // Null initially
//     },
//     {
//       id: 2,
//       component_id: "C_00002",
//       component_specification: "Nighthawk Camera",
//       vendor_name: "Amuse",
//       serial_number: "S12346",
//       date: "2024-11-21",
//       qc: null,
//     },
//   ]);

//   // State for the QC popup
//   const [showQCPopup, setShowQCPopup] = useState(false);
//   const [selectedItem, setSelectedItem] = useState(null);

//   // Open the QC popup
//   const handleQCClick = (item) => {
//     setSelectedItem(item);
//     setShowQCPopup(true);
//   };

//   // Handle QC selection
//   const handleQCSubmit = (qcStatus) => {
//     setInwardData((prevData) =>
//       prevData.map((item) =>
//         item.id === selectedItem.id ? { ...item, qc: qcStatus } : item
//       )
//     );
//     setShowQCPopup(false);
//   };

//   // Generate serial number
//   const handleGenerateSerialNumber = (id) => {
//     setInwardData((prevData) =>
//       prevData.map((item) =>
//         item.id === id
//           ? { ...item, serial_number: `SN${Math.floor(Math.random() * 100000)}` }
//           : item
//       )
//     );
//     alert("Serial number generated successfully!");
//   };

//   return (
//     <div>
//       <h2>Inward</h2>
//       <table>
//         <thead>
//           <tr>
//             <th>Component ID</th>
//             <th>Component Specification</th>
//             <th>Vendor Name</th>
//             <th>Serial Number</th>
//             <th>Date</th>
//             <th>QC</th>
//             <th>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {inwardData.map((item) => (
//             <tr key={item.id}>
//               <td>{item.component_id}</td>
//               <td>{item.component_specification}</td>
//               <td>{item.vendor_name}</td>
//               <td>{item.serial_number}</td>
//               <td>{item.date}</td>
//               <td>{item.qc || "Pending"}</td>
//               <td>
//                 <button onClick={() => handleQCClick(item)}>QC</button>
//                 <button onClick={() => handleGenerateSerialNumber(item.id)}>
//                   S.No. Gen
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {/* QC Popup */}
//       {showQCPopup && selectedItem && (
//         <div className="popup">
//           <h3>Quality Check</h3>
//           <p>Component: {selectedItem.component_specification}</p>
//           <button onClick={() => handleQCSubmit("Good")}>Good</button>
//           <button onClick={() => handleQCSubmit("Bad")}>Bad</button>
//           <button onClick={() => setShowQCPopup(false)}>Cancel</button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Inward;

// import React, { useEffect, useState } from "react";

// const Inward = () => {
//   const [inwardData, setInwardData] = useState([]); // State to store inward data
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [showQCPopup, setShowQCPopup] = useState(false);
//   const [selectedItem, setSelectedItem] = useState(null);

//   // Fetch Inward Data from API
//   const fetchInwardData = async () => {
//     try {
//       const response = await fetch("http://127.0.0.1:8000/inward/");
//       const result = await response.json();

//       if (Array.isArray(result)) {
//         setInwardData(result);
//       } else {
//         console.error("Unexpected API response format:", result);
//         setError("Failed to fetch inward data.");
//       }
//     } catch (err) {
//       console.error("Error fetching inward data:", err);
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Generate Serial Number
//   const handleGenerateSerialNumber = (item) => {
//     alert(`Serial number for ${item.po_master.cart.component_id} already exists: ${item.serial_number}`);
//   };

//   // Open QC Popup
//   const handleQCClick = (item) => {
//     setSelectedItem(item);
//     setShowQCPopup(true);
//   };

//   // Handle QC submission
//   const handleQCSubmit = (qcStatus) => {
//     setInwardData((prevData) =>
//       prevData.map((item) =>
//         item === selectedItem ? { ...item, quality_check: qcStatus } : item
//       )
//     );
//     setShowQCPopup(false);
//   };

//   useEffect(() => {
//     fetchInwardData();
//   }, []);

//   if (loading) {
//     return <p>Loading inward data...</p>;
//   }

//   if (error) {
//     return <p>Error: {error}</p>;
//   }

//   return (
//     <div>
//       <h2>Inward</h2>
//       {inwardData.length === 0 ? (
//         <p>No inward data available.</p>
//       ) : (
//         <table>
//           <thead>
//             <tr>
//               <th>Component ID</th>
//               <th>Component Specification</th>
//               <th>Vendor Name</th>
//               <th>Serial Number</th>
//               <th>Date</th>
//               <th>QC</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {inwardData.map((item, index) => (
//               <tr key={index}>
//                 <td>{item.po_master.cart.component_id}</td>
//                 <td>{item.po_master.cart.component_specification}</td>
//                 <td>{item.po_master.cart.vendor_name}</td>
//                 <td>{item.serial_number}</td>
//                 <td>{new Date(item.date).toLocaleDateString()}</td>
//                 <td>{item.quality_check || "Pending"}</td>
//                 <td>
//                   <button onClick={() => handleQCClick(item)}>QC</button>
//                   <button onClick={() => handleGenerateSerialNumber(item)}>
//                     Generate Serial Number
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}

//       {/* QC Popup */}
//       {showQCPopup && selectedItem && (
//         <div className="popup">
//           <h3>Quality Check</h3>
//           <p>
//             Component: {selectedItem.po_master.cart.component_specification}
//           </p>
//           <button onClick={() => handleQCSubmit("Pass")}>Pass</button>
//           <button onClick={() => handleQCSubmit("Fail")}>Fail</button>
//           <button onClick={() => setShowQCPopup(false)}>Cancel</button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Inward;

import React, { useEffect, useState } from "react";

const Inward = () => {
  const [inwardData, setInwardData] = useState([]); // State to store inward data
  const [poMasterData, setPOMasterData] = useState([]); // State to store PO Master data
  const [showQCPopup, setShowQCPopup] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [qcQuestions, setQCQuestions] = useState([]); // State to store QC questions
  const [newQuestion, setNewQuestion] = useState({
    qc_select: "",
    description: "",
    Good: false,
    bad: false,
    remark: "",
  }); // State for new question

  // Fetch PO Master Data
  const fetchPOMasterData = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/po_master/");
      const result = await response.json();

      if (Array.isArray(result)) {
        setPOMasterData(result);
      } else {
        console.error("Unexpected API response format:", result);
      }
    } catch (err) {
      console.error("Error fetching PO Master data:", err);
    }
  };

  // Add Row
  const handleAddRow = () => {
    const newRow = {
      component_id: "",
      component_specification: "",
      vendor_name: "",
      serial_number: "",
      date: new Date().toLocaleDateString(),
      quality_check: "Pending",
    };
    setInwardData([...inwardData, newRow]);
  };

  // Handle Component Selection
  const handleComponentSelect = (index, selectedComponentId) => {
    const selectedComponent = poMasterData.find(
      (po) => po.cart_details.component_id === selectedComponentId
    );

    if (selectedComponent) {
      const componentDetails = Array(selectedComponent.cart_details.quantity)
        .fill(null)
        .map(() => ({
          component_id: selectedComponent.cart_details.component_id,
          component_specification:
            selectedComponent.cart_details.component_specification,
          vendor_name: selectedComponent.cart_details.vendor_name,
          serial_number: "",
          date: new Date().toLocaleDateString(),
          quality_check: "Pending",
        }));

      setInwardData([
        ...inwardData.slice(0, index),
        ...componentDetails,
        ...inwardData.slice(index + 1),
      ]);
    }
  };

  // Open QC Popup
  const handleQCClick = (item) => {
    setSelectedItem(item);
    setShowQCPopup(true);
  };

  // Add QC Question
  const handleAddQCQuestion = () => {
    setQCQuestions([
      ...qcQuestions,
      { ...newQuestion, component_id: selectedItem.component_id },
    ]);
    setNewQuestion({
      qc_select: "",
      description: "",
      Good: false,
      bad: false,
      remark: "",
    });
  };

  // Save QC Questions
  const handleSaveQC = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/qc/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(qcQuestions),
      });
      console.log("QC response", response);

      if (response.ok) {
        console.log("QC saved successfully.");
      } else {
        console.error("Error saving QC:", response.statusText);
      }
    } catch (error) {
      console.error("Error saving QC:", error);
    }
    setShowQCPopup(false);
  };

  useEffect(() => {
    fetchPOMasterData();
  }, []);

  return (
    <div>
      <h2>Inward</h2>
      <button onClick={handleAddRow}>Add Row</button>
      <table>
        <thead>
          <tr>
            <th>Component ID</th>
            <th>Component Specification</th>
            <th>Vendor Name</th>
            <th>Serial Number</th>
            <th>Date</th>
            <th>QC</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {inwardData.map((item, index) => (
            <tr key={index}>
              <td>
                <select
                  onChange={(e) => handleComponentSelect(index, e.target.value)}
                  value={item.component_id}
                >
                  <option value="">Select Component</option>
                  {poMasterData.map((po) => (
                    <option key={po.id} value={po.cart_details.component_id}>
                      {po.cart_details.component_id}
                    </option>
                  ))}
                </select>
              </td>
              <td>{item.component_specification || "N/A"}</td>
              <td>{item.vendor_name || "N/A"}</td>
              <td>{item.serial_number || "N/A"}</td>
              <td>{item.date}</td>
              <td>{item.quality_check}</td>
              <td>
                <button onClick={() => handleQCClick(item)}>QC</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* QC Popup */}
      {showQCPopup && selectedItem && (
        <div className="popup">
          <h3>Quality Check for {selectedItem.component_id}</h3>
          <div>
            <h4>Questions</h4>
            {qcQuestions
              .filter((q) => q.component_id === selectedItem.component_id)
              .map((q, idx) => (
                <div key={idx}>
                  <p>{q.description}</p>
                  <p>
                    Good: {q.Good ? "Yes" : "No"}, Bad: {q.bad ? "Yes" : "No"}
                  </p>
                  <p>Remark: {q.remark}</p>
                </div>
              ))}
          </div>
          <div>
            <h4>Add Question</h4>
            <label>
              Type:
              <select
                value={newQuestion.qc_select}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, qc_select: e.target.value })
                }
              >
                <option value="">Select</option>
                <option value="visual_check">Visual Check</option>
                <option value="function_check">Function Check</option>
              </select>
            </label>
            <label>
              Question:
              <input
                type="text"
                value={newQuestion.description}
                onChange={(e) =>
                  setNewQuestion({
                    ...newQuestion,
                    description: e.target.value,
                  })
                }
              />
            </label>
            <label>
              Good:
              <input
                type="checkbox"
                checked={newQuestion.Good}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, Good: e.target.checked })
                }
              />
            </label>
            <label>
              Bad:
              <input
                type="checkbox"
                checked={newQuestion.bad}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, bad: e.target.checked })
                }
              />
            </label>
            <label>
              Remark:
              <input
                type="text"
                value={newQuestion.remark}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, remark: e.target.value })
                }
              />
            </label>
            <button onClick={handleAddQCQuestion}>Add Question</button>
          </div>
          <button onClick={handleSaveQC}>Save QC</button>
          <button onClick={() => setShowQCPopup(false)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default Inward;
