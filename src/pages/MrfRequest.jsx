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
                  <button>
                    Assign
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Mrfrequest;


