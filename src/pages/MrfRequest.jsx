// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import config from "../Config"; // Ensure this file exists
// import MRFCreate from "./MRFCreate";

// function Mrfrequest() {
//     const navigate = useNavigate();
// return(
//     <div><button onClick={() => navigate("/MRFCreate")}> 
//         Create Material Request Form
//         </button></div>
// )
// };

// export default Mrfrequest;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import config from "../Config"; // Ensure this file exists

function Mrfrequest() {
  const navigate = useNavigate();
  const [requestData, setRequestData] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedSerial, setSelectedSerial] = useState(null);
  const [selectedMRF, setSelectedMRF] = useState(null);
  const [reportedBy, setReportedBy] = useState("");
  const [remarks, setRemarks] = useState("");
  const [returnStatus, setReturnStatus] = useState("");


  useEffect(() => {
    fetchRequestData();
  }, []);

  const fetchRequestData = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/create_MRF/`);
      const data = await response.json();
      setRequestData(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleAssign = async (serialNumber, MRF_id) => {
    try {
      const response = await fetch(`${config.apiBaseURL}/inventory/${serialNumber}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "In_drone" }),
      });

      if (!response.ok) {
        throw new Error("Failed to update inventory status");
      }

      const updateMRFResponse = await fetch(`${config.apiBaseURL}/create_MRF/${MRF_id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: false }),
      });

      if (!updateMRFResponse.ok) {
        throw new Error("Failed to update MRF action status");
      }

      setRequestData((prevData) =>
        prevData.map((item) =>
          item.serial_number === serialNumber ? { ...item, status: "In_drone" , action: false} : item
        )
      );
    } catch (error) {
      console.error("Error updating inventory status:", error);
    }
  };

  const handleReturnClick = (serialNumber, MRF_id) => {
    setSelectedSerial(serialNumber);
    setSelectedMRF(MRF_id);
    setShowPopup(true);
  };

  const handleReturnSubmit = async () => {
    if (!returnStatus) { 
      alert("Please select a return status.");
      return;
    }

    const formattedStatus = returnStatus === "Move to Inventory" ? "Available" : returnStatus;

    try {
      await fetch(`${config.apiBaseURL}/inventory/${selectedSerial}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: formattedStatus  }),
      });

      // Update MRF entry with return details
    await fetch(`${config.apiBaseURL}/create_MRF/${selectedMRF}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ returns: "true", reported_by: reportedBy, remarks: remarks }),
    });

      setRequestData((prevData) =>
        prevData.map((item) =>
          item.serial_number === selectedSerial
            ? { ...item, status: formattedStatus , returns: true, action: false }
            : item
        )
      );

      setShowPopup(false);
      setReportedBy("");
      setRemarks("");
    } catch (error) {
      console.error("Error updating return status:", error);
    }
  };


  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>Material Request Data</h2>

      <button
        onClick={() => navigate("/MRFCreate")}
        style={{
          padding: "10px 15px",
          backgroundColor: "orange",
          color: "white",
          border: "none",
          cursor: "pointer",
          marginBottom: "20px",
        }}
      >
        Create Material Request Form
      </button>

      <table border="1" cellPadding="5" cellSpacing="0" width="100%">
        <thead>
          <tr style={{ backgroundColor: "#f2f2f2" }}>
            <th>MRF ID</th>
            <th>Create Date</th>
            <th>Name</th>
            <th>Component Type</th>
            <th>Component Specification</th>
            <th>Unit of Measurement</th>
            <th>Category</th>
            <th>Serial Number</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requestData.length === 0 ? (
            <tr>
              <td colSpan="8" style={{ textAlign: "center" }}>No material requests available.</td>
            </tr>
          ) : (
            requestData.map((item) => (
              <tr key={item.serial_number}>
                <td>{item.MRF_id}</td>
                <td>{item.create_date}</td>
                <td>{item.name}</td>
                <td>{item.component_type}</td>
                <td>{item.component_specification}</td>
                <td>{item.unit_of_measurement}</td>
                <td>{item.category}</td>
                <td>{item.serial_number}</td>
                <td>
                  {item.returns ? (
                    <button disabled style={{ padding: "5px 10px", backgroundColor: "#b8730b", color: "white", border: "none" }}>Returned</button>
                  ) : item.action ? (
                    <button onClick={() => handleAssign(item.serial_number, item.MRF_id)} style={{ padding: "5px 10px", backgroundColor: "green", color: "white", border: "none", cursor: "pointer" }}>Assign</button>
                  ) : (
                    <>
                      <button disabled style={{ padding: "5px 10px", backgroundColor: "grey", color: "white", border: "none" }}>Assigned</button>
                      <button onClick={() => handleReturnClick(item.serial_number, item.MRF_id)} style={{ padding: "5px 10px", backgroundColor: "orange", color: "white", border: "none", cursor: "pointer", marginLeft: "5px" }}>Return</button>
                    </>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {showPopup && (
        <div className="popup">
          <h3>Return Details</h3>
          <label>Reported By:</label>
          <input type="text" value={reportedBy} onChange={(e) => setReportedBy(e.target.value)} />
          <label>Remarks:</label>
          <input type="text" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
          <div>
            <label><input type="radio" name="returnStatus" value="Move to Inventory" onChange={(e) => setReturnStatus(e.target.value)} /> Move to Inventory</label>
            <label><input type="radio" name="returnStatus" value="Repair" onChange={(e) => setReturnStatus(e.target.value)} /> Repair</label>
            <label><input type="radio" name="returnStatus" value="Damaged" onChange={(e) => setReturnStatus(e.target.value)} /> Damaged</label>
          </div>
          <button onClick={handleReturnSubmit}>Submit</button>
          <button onClick={() => setShowPopup(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
}

export default Mrfrequest;


