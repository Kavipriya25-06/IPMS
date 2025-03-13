// import React, { useState, useEffect } from "react";

// const Inward = () => {
//   const [inwardData, setInwardData] = useState([]); // State to store inward data
//   const [showQCPopup, setShowQCPopup] = useState(false); // QC popup visibility
//   const [selectedRow, setSelectedRow] = useState(null); // Row selected for QC

//   // Fetch the inward data
//   const fetchInwardData = async () => {
//     try {
//       const response = await fetch(`${config.apiBaseURL}/inward_data/`); // Adjust API endpoint as required
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
//       const response = await fetch(`${config.apiBaseURL}/inward/`);
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
import CustomMessagebox from "./CustomMessageBox.jsx";
import config from "../Config"; // Import config for API endpoints

import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  ToastContainerComponent,
} from "./Toastify.jsx"; // Import Toastify utilities

const Inward = () => {
  const [inwardData, setInwardData] = useState([]); // State to store inward data
  const [showQCPopup, setShowQCPopup] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [messageBoxContent, setMessageBoxContent] = useState("");
  const [skuPopupVisible, setSkuPopupVisible] = useState(false);
  const [skuSerialNumber, setSkuSerialNumber] = useState("");
  const [skuSelectedItem, setSkuSelectedItem] = useState(null);
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
      return (
        keyPath.split(".").reduce((acc, key) => acc && acc[key], obj) ||
        defaultValue
      );
    } catch {
      return defaultValue;
    }
  };

  // Fetch Inward Data
  const fetchInwardData = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/inward/`);
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

  /////////
  ////////////////////

  const handleQCClick = async (item) => {
    const component_Type = getNestedValue(
      item,
      "po_master.cart.component_type"
    );
    const componentType = component_Type.toLowerCase();

    if (!componentType) {
      alert("Component Type not available. Cannot fetch QC questions.");
      return;
    }

    try {
      const response = await fetch(`${config.apiBaseURL}/qc_question/`);
      if (!response.ok) {
        console.error("Error fetching QC questions:", await response.text());
        alert("Failed to fetch QC questions.");
        return;
      }

      const qcQuestions = await response.json();

      // Filter questions based on the component_type
      const filteredQuestions = qcQuestions.filter(
        (question) => question.component_type.toLowerCase() === componentType
      );

      if (filteredQuestions.length === 0) {
        setMessageBoxContent(
          "No questions available for the selected component type."
        );
        setShowMessageBox(true);
        return;
      }

      // Store the filtered questions and selected item
      setSelectedItem(item);
      setNewQuestion({
        qc_select: "",
        description: "",
        Good: false,
        bad: false,
        remark: "",
        component_id: getNestedValue(item, "po_master.cart.component_id"),
      });
      setNewQuestion((prev) => ({
        ...prev,
        qcQuestions: filteredQuestions.map((q) => ({
          id: q.id,
          question: q.question,
          answer: null, // Initialize answer as null
        })),
      }));
      setShowQCPopup(true);
    } catch (error) {
      console.error("Error fetching QC questions:", error);
      alert("An error occurred while fetching QC questions.");
    }
  };

  const handleQuestionAnswer = (questionId, answer) => {
    setNewQuestion((prev) => ({
      ...prev,
      qcQuestions: prev.qcQuestions.map((q) =>
        q.id === questionId ? { ...q, answer } : q
      ),
    }));
  };

  ///////////////////////////////////////////

  const handleSubmitQC = async () => {
    if (!newQuestion.qcQuestions || newQuestion.qcQuestions.length === 0) {
      alert("No questions available to submit.");
      return;
    }

    // Validate that all questions have been answered
    const unanswered = newQuestion.qcQuestions.filter((q) => q.answer === null);
    if (unanswered.length > 0) {
      alert("Please answer all questions before submitting.");
      return;
    }

    const inwardId =
      selectedItem?.inward_id || getNestedValue(selectedItem, "inward_id");

    if (!inwardId || inwardId === "Not Available") {
      alert("Inward ID not found. Unable to submit QC answers.");
      return;
    }

    try {
      // Iterate over each question and make a separate POST request
      for (const question of newQuestion.qcQuestions) {
        const payload = {
          Inward_id: inwardId,
          qc_question: question.id,
          yes: question.answer === "Yes",
          no: question.answer === "No",
        };

        const response = await fetch(`${config.apiBaseURL}/qc_answer/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorDetails = await response.json();
          console.error(
            `Error submitting QC answer for question ${question.id}:`,
            errorDetails
          );
          alert(
            `Failed to submit QC answer for question ${
              question.id
            }: ${JSON.stringify(errorDetails)}`
          );
          return; // Stop further submissions on failure
        }
      }

      // Extract the price from the selectedItem
      const price =
        selectedItem?.price || getNestedValue(selectedItem, "price");

      if (!price || isNaN(price)) {
        alert("Invalid price. Unable to update QC status.");
        return;
      }

      // Prepare the PATCH payload with all required fields
      const patchPayload = {
        quality_check: newQuestion.overallStatus, // Pass or Fail
        component_id: getNestedValue(
          selectedItem,
          "po_master.cart.component_id"
        ),
        price: parseInt(price, 10), // Ensure the price is a valid integer
        po_master_id: getNestedValue(selectedItem, "po_master.id"),
      };

      // PATCH request to update the overall status in the inward API
      const patchResponse = await fetch(
        `${config.apiBaseURL}/inward/${inwardId}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patchPayload),
        }
      );

      if (!patchResponse.ok) {
        const patchError = await patchResponse.json();
        console.error("Error updating QC status in inward:", patchError);
        alert("Failed to update QC status.");
        return;
      }

      // Success feedback
      showSuccessToast("QC process completed successfully!");
      // setShowMessageBox(true);
      setShowQCPopup(false);
      fetchInwardData(); // Refresh the inward data
    } catch (error) {
      console.error("Error during QC submission process:", error);
      alert("An error occurred while submitting QC answers.");
    }
  };

  ////////////////////////

  const handleOverallStatusUpdate = async (overallStatus) => {
    const inwardId =
      selectedItem?.inward_id || getNestedValue(selectedItem, "inward_id");

    if (!inwardId || inwardId === "Not Available") {
      alert("Inward ID not found. Unable to update overall status.");
      return;
    }

    try {
      const response = await fetch(`${config.apiBaseURL}/inward/${inwardId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quality_check: overallStatus }),
      });

      if (!response.ok) {
        const errorDetails = await response.json();
        console.error("Error updating overall QC status:", errorDetails);
        alert("Failed to update overall QC status.");
        return;
      }

      // Success feedback
      setMessageBoxContent(`QC status updated to: ${overallStatus}`);
      setShowMessageBox(true);
      setShowQCPopup(false);
      fetchInwardData(); // Refresh the inward data
    } catch (error) {
      console.error("Error updating overall QC status:", error);
      alert("An error occurred while updating QC status.");
    }
  };

  ///////////
  /////////////////

  const handleMoveToInventory = async (item) => {
    try {
      // Extract necessary values using getNestedValue and ensure data integrity
      const componentId = getNestedValue(item, "po_master.cart.component_id");
      const componentSpecification = getNestedValue(
        item,
        "po_master.cart.component_specification"
      );
      const vendorName = getNestedValue(item, "po_master.cart.vendor_name");
      const serialNumber = item.serial_number || "Not Available"; // Ensure serial number is available
      const skuNumber = item.sku_number || "Not Available";
      const date = item.date || new Date().toISOString(); // Use current date if not available
      const qualityCheck = item.quality_check || "Not Available"; // Default to "Not Available" if no quality check
      const qty = 1; // Default quantity to 1 as specified

      if (qualityCheck !== "Pass") {
        setMessageBoxContent(
          "The quality check has not passed. Cannot move to inventory."
        );
        setShowMessageBox(true);
        return;
      }

      // Fetch the PO Master details to get the price (unit_price)
      const poMasterResponse = await fetch(`${config.apiBaseURL}/po_master/`);
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

      const price = poMasterEntry?.cart_details?.unit_price || "Not Available"; // Extract price (unit_price)

      if (!price || price === "Not Available") {
        alert(
          "Price not found in PO Master details. Cannot move to inventory."
        );
        return;
      }

      // Fetch the components from the component API
      const componentResponse = await fetch(`${config.apiBaseURL}/component/`);
      if (!componentResponse.ok) {
        const errorDetails = await componentResponse.json();
        console.error("Error fetching component details:", errorDetails);
        alert("Failed to retrieve component details.");
        return;
      }

      // Extract the component list from the response
      const components = await componentResponse.json();

      // Filter the components based on the component_id
      const selectedComponent = components.find(
        (component) => component.component_id === componentId
      );

      if (!selectedComponent) {
        console.error(`Component with ID ${componentId} not found.`);
        alert("Component not found.");
        return;
      }

      // Extract the component type and category from the selected component
      const componentType =
        selectedComponent.component_type || "DefaultComponentType"; // Default if not available
      const category = selectedComponent.category || "DefaultCategory"; // Default if not available

      // Prepare the data for posting to the inventory API
      const postData = {
        component_id: componentId,
        component_specification: componentSpecification,
        vendor_name: vendorName,
        serial_number: serialNumber,
        sku_number_inventory: skuNumber,
        date: date,
        quality_check: qualityCheck,
        qty: qty, // Using the default qty value
        component_type: componentType, // Dynamic value fetched from component API
        category: category, // Dynamic value fetched from component API
        specification: componentSpecification, // Mapping component_specification to specification
        UOM: "Nos", // Unit of measurement is set to "Nos"
        price: price, // Include price from PO Master
      };

      // Make the POST request to the inventory API
      const response = await fetch(`${config.apiBaseURL}/inventory/`, {
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
      showSuccessToast("Successfully moved to inventory.");
      setShowMessageBox(false);

      // Update mode_to_inventory to false via a PUT request
      const updatePayload = {
        mode_to_inventory: false,
        quality_check: item.quality_check, // Include existing quality_check value
        component_id: item.po_master.cart.component_id, // Include component_id
        po_master_id: item.po_master.id, // Include po_master_id
        price: price,
      };

      const updateResponse = await fetch(
        `${config.apiBaseURL}/inward/${item.inward_id}/`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatePayload),
        }
      );

      if (!updateResponse.ok) {
        const updateError = await updateResponse.json();
        console.error("Error updating mode_to_inventory:", updateError);
        alert("Failed to update mode_to_inventory.");
        return;
      }

      // ////////////////////////////////// Email Notification

      //        // POST to inward_send_email endpoint
      //        const emailNotificationData = {
      //         inward_id: item.inward_id,
      //         message: "Item successfully moved to inventory.",
      //       };

      //       const emailResponse = await fetch(
      //         `${config.apiBaseURL}/inward_send_email/`,
      //         {
      //           method: "POST",
      //           headers: { "Content-Type": "application/json" },
      //           body: JSON.stringify(emailNotificationData),
      //         }
      //       );

      //       if (!emailResponse.ok) {
      //         const emailErrorDetails = await emailResponse.json();
      //         console.error("Error sending email notification:", emailErrorDetails);
      //         alert("Failed to send email notification.");
      //         return;
      //       }

      fetchInwardData(); // Refresh data after posting
    } catch (error) {
      // Handle any error that occurs during the fetch
      console.error("Error moving to inventory:", error);
      alert("An error occurred while moving to inventory.");
    }
  };

  /////////////////

  // Handle SKU Number click
  const handleSkuNumberClick = (item) => {
    setSkuSelectedItem(item);
    setSkuSerialNumber(""); // Clear the input field
    setSkuPopupVisible(true);
  };

  // Handle SKU popup submit
  const handleSkuSubmit = async () => {
    const inwardId =
      skuSelectedItem?.inward_id ||
      getNestedValue(skuSelectedItem, "inward_id");

    if (!inwardId || inwardId === "Not Available") {
      alert("Inward ID not found. Cannot update SKU.");
      return;
    }

    try {
      const payload = {
        inward_id: inwardId,
        sku_number: skuSerialNumber.trim() || null, // Allow null for empty serial number
      };

      const response = await fetch(`${config.apiBaseURL}/inward/${inwardId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorDetails = await response.json();
        console.error("Error updating SKU:", errorDetails);
        alert("Failed to update SKU.");
        return;
      }

      showSuccessToast("SKU updated successfully.");
      setSkuPopupVisible(false);
      setSkuSerialNumber("");
      fetchInwardData(); // Refresh data after updating
    } catch (error) {
      console.error("Error updating SKU:", error);
      alert("An error occurred while updating SKU.");
    }
  };

  ////////////////////

  useEffect(() => {
    fetchInwardData();
  }, []);

  return (
    <div>
      <h2>Inward</h2>

      {/* Render CustomMessagebox when showMessageBox is true */}
      {showMessageBox && (
        <CustomMessagebox
          message={messageBoxContent}
          onClose={() => setShowMessageBox(false)}
        />
      )}

      <table>
        <thead>
          <tr>
            <th>Component ID</th>
            <th>Component Specification</th>
            <th>Vendor Name</th>
            <th>Serial Number</th>
            <th>Date</th>
            <th>QC</th>
            <th>SKU Number</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {inwardData.map((item, index) => (
            <tr key={index}>
              <td>{getNestedValue(item, "po_master.cart.component_id")}</td>
              <td>
                {getNestedValue(item, "po_master.cart.component_specification")}
              </td>
              <td>{getNestedValue(item, "po_master.cart.vendor_name")}</td>
              <td>{item.serial_number || "Not Available"}</td>
              <td>
                {new Date(item.date).toLocaleDateString() || "Not Available"}
              </td>
              <td>{item.quality_check || "Not Available"}</td>
              <td>
                {/* Show SKU number or Add SKU button based on presence of SKU number */}
                {item.sku_number ? (
                  <span>{item.sku_number}</span>
                ) : (
                  <button onClick={() => handleSkuNumberClick(item)}>
                    Add SKU
                  </button>
                )}
              </td>
              <td>
                <button
                  onClick={() => handleQCClick(item)}
                  disabled={
                    item.quality_check === "Pass" ||
                    item.quality_check === "Fail"
                  }
                >
                  QC
                </button>
                <button
                  onClick={() => handleMoveToInventory(item)}
                  disabled={item.mode_to_inventory === false} // Disable button if mode_to_inventory is false
                >
                  Move to Inventory
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showQCPopup && selectedItem && (
        <div className="popup">
          <h3>
            Quality Check for{" "}
            {getNestedValue(selectedItem, "po_master.cart.component_id")}
          </h3>
          <div>
            {/* Render QC Questions */}
            {newQuestion.qcQuestions?.map((q) => (
              <div key={q.id}>
                <p>{q.question}</p>
                <label>
                  Yes
                  <input
                    type="radio"
                    name={`question-${q.id}`}
                    onChange={() => handleQuestionAnswer(q.id, "Yes")}
                  />
                </label>
                <label>
                  No
                  <input
                    type="radio"
                    name={`question-${q.id}`}
                    onChange={() => handleQuestionAnswer(q.id, "No")}
                  />
                </label>
              </div>
            ))}
          </div>
          <div>
            <h4>Overall Status</h4>
            <label>
              Pass
              <input
                type="radio"
                name="overall-status"
                onChange={() =>
                  setNewQuestion((prev) => ({ ...prev, overallStatus: "Pass" }))
                }
              />
            </label>
            <label>
              Fail
              <input
                type="radio"
                name="overall-status"
                onChange={() =>
                  setNewQuestion((prev) => ({ ...prev, overallStatus: "Fail" }))
                }
              />
            </label>
          </div>
          <button onClick={handleSubmitQC}>Submit QC</button>
          <button onClick={() => setShowQCPopup(false)}>Close</button>
        </div>
      )}

      {/* SKU Popup */}
      {skuPopupVisible && (
        <div className="popup">
          <h3>Enter SKU Number</h3>
          <input
            type="text"
            value={skuSerialNumber}
            onChange={(e) => setSkuSerialNumber(e.target.value)}
            placeholder="SKU Number (optional)"
          />
          <button onClick={handleSkuSubmit}>Submit</button>
          <button onClick={() => setSkuPopupVisible(false)}>Cancel</button>
        </div>
      )}

      <ToastContainerComponent />
    </div>
  );
};

export default Inward;
