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
  const [showQCPopup, setShowQCPopup] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newQuestion, setNewQuestion] = useState({
    qc_select: "",
    description: "",
    Good: false,
    bad: false,
    remark: "",
    component_id: null,
  }); // State for new question

  // Utility function to safely access nested fields
  const getNestedValue = (obj, keyPath, defaultValue = "Not Available") => {
    try {
      return keyPath.split(".").reduce((acc, key) => acc && acc[key], obj) || defaultValue;
    } catch {
      return defaultValue;
    }
  };

  // Fetch Inward Data
  const fetchInwardData = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/inward/");
      const result = await response.json();

      if (Array.isArray(result)) {
        setInwardData(result);
      } else {
        console.error("Unexpected API response format:", result);
      }
    } catch (err) {
      console.error("Error fetching inward data:", err);
    }
  };

  const handleQCClick = (item) => {
    setSelectedItem(item); // Ensure the entire selected item is stored
    setNewQuestion({
      qc_select: "",
      description: "",
      Good: false,
      bad: false,
      remark: "",
      component_id: getNestedValue(item, "po_master.cart.component_id"),
    });
    setShowQCPopup(true);
  };

  const handleSaveQC = async () => {
    // Validate fields
    if (
      !newQuestion.qc_select ||
      !newQuestion.description ||
      newQuestion.Good === null ||
      newQuestion.bad === null ||
      !newQuestion.remark
    ) {
      alert("Please fill in all required fields.");
      return;
    }
  
    try {
      const inwardId = selectedItem?.inward_id || getNestedValue(selectedItem, "inward_id");
  
      if (!inwardId || inwardId === "Not Available") {
        alert("Inward ID not found. Unable to update.");
        return;
      }
  
      // Fetch the detailed inward data
      const inwardDetailsResponse = await fetch(`http://127.0.0.1:8000/inward/${inwardId}/`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
  
      if (!inwardDetailsResponse.ok) {
        const errorDetails = await inwardDetailsResponse.json();
        console.error("Error fetching inward details:", errorDetails);
        alert("Failed to fetch inward details.");
        return;
      }
  
      const inwardDetails = await inwardDetailsResponse.json();
      const componentId = inwardDetails?.po_master?.cart?.component_id || null; // Extract component_id
  
      // Debugging: Log the fetched data
      console.log("Fetched Inward Details:", inwardDetails);
      console.log("Extracted Component ID:", componentId);
  
      if (!componentId) {
        alert("Required field is missing: component_id.");
        return;
      }
  
      // Fetch the PO Master details to get the po_master_id
      const poMasterResponse = await fetch(`http://127.0.0.1:8000/po_master/`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
  
      if (!poMasterResponse.ok) {
        const poMasterError = await poMasterResponse.json();
        console.error("Error fetching PO Master details:", poMasterError);
        alert("Failed to fetch PO Master details.");
        return;
      }
  
      const poMasterData = await poMasterResponse.json();
  
      // Find the matching PO Master entry for the component ID
      const poMasterEntry = poMasterData.find(
        (entry) => entry.cart_details.component_id === componentId
      );
  
      const poMasterId = poMasterEntry?.id || null;
  
      if (!poMasterId) {
        alert("Required field is missing: po_master_id.");
        return;
      }
  
      // Debugging: Log the matched PO Master entry
      console.log("Matched PO Master Entry:", poMasterEntry);
      console.log("Extracted PO Master ID:", poMasterId);
  
      // Proceed based on Good/Bad QC
      const payload = {
        quality_check: newQuestion.Good ? "Pass" : "Fail",
        component_id: componentId,
        po_master_id: poMasterId, // Include po_master_id in the payload
      };
  
      const updateResponse = await fetch(`http://127.0.0.1:8000/inward/${inwardId}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      if (!updateResponse.ok) {
        const updateError = await updateResponse.json();
        console.error("Error updating inward data:", updateError);
        alert(`Failed to update inward data: ${updateError.detail || "Unknown error"}`);
        return;
      }
  
      alert(
        newQuestion.Good
          ? "Quality check passed. Serial number will be generated automatically."
          : "Quality check marked as Bad. No serial number generated."
      );
  
      setShowQCPopup(false);
      fetchInwardData(); // Refresh data after updating
    } catch (error) {
      console.error("Error updating inward data:", error);
      alert("An error occurred while updating inward data.");
    }
  };
  
  
  const handleMoveToInventory = async (item) => {
    // Extract necessary values using getNestedValue and ensure data integrity
    const componentId = getNestedValue(item, "po_master.cart.component_id");
    const componentSpecification = getNestedValue(item, "po_master.cart.component_specification");
    const vendorName = getNestedValue(item, "po_master.cart.vendor_name");
    const serialNumber = item.serial_number || "Not Available";  // Ensure serial number is available
    const date = item.date || new Date().toISOString();  // Use current date if not available
    const qualityCheck = item.quality_check || "Not Available";  // Default to "Not Available" if no quality check
    const qty = 1;  // Default quantity to 1 as specified
  

    if (qualityCheck !== "Pass") {
      alert("The quality check has not passed. Cannot move to inventory.");
      return;
    }

    // Fetch the components from the component API
    try {
      const componentResponse = await fetch("http://127.0.0.1:8000/component/");
  
      if (!componentResponse.ok) {
        const errorDetails = await componentResponse.json();
        console.error("Error fetching component details:", errorDetails);
        alert("Failed to retrieve component details.");
        return;
      }
  
      // Extract the component list from the response
      const components = await componentResponse.json();
      
      // Filter the components based on the component_id
      const selectedComponent = components.find(component => component.component_id === componentId);
  
      if (!selectedComponent) {
        console.error(`Component with ID ${componentId} not found.`);
        alert("Component not found.");
        return;
      }
  
      // Extract the component type and category from the selected component
      const componentType = selectedComponent.component_type || "DefaultComponentType"; // Default if not available
      const category = selectedComponent.category || "DefaultCategory"; // Default if not available
  
      // Prepare the data for posting to the inventory API
      const postData = {
        component_id: componentId,
        component_specification: componentSpecification,
        vendor_name: vendorName,
        serial_number: serialNumber,
        date: date,
        quality_check: qualityCheck,
        qty: qty, // Using the default qty value
        component_type: componentType,  // Dynamic value fetched from component API
        category: category,  // Dynamic value fetched from component API
        specification: componentSpecification, // Mapping component_specification to specification
        UOM: "Nos",  // Unit of measurement is set to "Nos"
      };
  
      // Make the POST request to the inventory API
      const response = await fetch("http://127.0.0.1:8000/inventory/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });
  
      // Check for successful response
      if (!response.ok) {
        const errorDetails = await response.json();
        console.error("Error posting to inventory:", errorDetails);
        alert("All ready added to inventory");
        return;
      }
  
      // If successful, show an alert and refresh inward data
      alert("Successfully moved to inventory.");
      fetchInwardData(); // Refresh data after posting
    } catch (error) {
      // Handle any error that occurs during the fetch
      console.error("Error moving to inventory:", error);
      alert("An error occurred while moving to inventory.");
    }
  };
  
  

  useEffect(() => {
    fetchInwardData();
  }, []);

  return (
    <div>
      <h2>Inward</h2>
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
              <td>{getNestedValue(item, "po_master.cart.component_id")}</td>
              <td>{getNestedValue(item, "po_master.cart.component_specification")}</td>
              <td>{getNestedValue(item, "po_master.cart.vendor_name")}</td>
              <td>{item.serial_number || "Not Available"}</td>
              <td>{new Date(item.date).toLocaleDateString() || "Not Available"}</td>
              <td>{item.quality_check || "Not Available"}</td>
              <td>
                <button onClick={() => handleQCClick(item)}>QC</button>
                <button onClick={() => handleMoveToInventory(item)}>Move to Inventory</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* QC Popup */}
      {showQCPopup && selectedItem && (
        <div className="popup">
          <h3>Quality Check for {getNestedValue(selectedItem, "po_master.cart.component_id")}</h3>
          <div>
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
              Description:
              <input
                type="text"
                value={newQuestion.description}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, description: e.target.value })
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
            <button onClick={handleSaveQC}>Save QC</button>
            <button onClick={() => setShowQCPopup(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inward;
