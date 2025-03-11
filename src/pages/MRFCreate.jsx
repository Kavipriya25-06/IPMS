// // src/pages/MRFCreate.jsx


import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import config from "../Config"; // Import config for API endpoints

const MRFCreate = () => {
  const [requestList, setRequestList] = useState([]);
  const [requestDetails, setRequestDetails] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState("");
  const [materialRequest, setMaterialRequest] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequestList();
  }, []);

  const fetchRequestList = async () => {
    try {
      // const response = await fetch(`${config.apiBaseURL}/request_master/`);
      const response = await fetch(`${config.apiBaseURL}/inventory/`);
      const data = await response.json();
      const uniqueRequests = [
        ...new Set(data.map((item) => item.Request_id_assign)),
      ];
      setRequestList(uniqueRequests);
    } catch (err) {
      console.error("Error fetching request list:", err);
    }
  };

  const handleRequestChange = async (event) => {
    const requestId = event.target.value;
    setSelectedRequest(requestId);
    try {
      //const response = await fetch(`${config.apiBaseURL}/request_master/`);
      const response = await fetch(`${config.apiBaseURL}/inventory/`);
      const data = await response.json();
      const filteredData = data.filter(
        (item) => item.Request_id_assign === requestId
      );
      setRequestDetails(filteredData);
      if (filteredData.length > 0) {
        setProjectName(filteredData[0].project_id);
      }
    } catch (err) {
      console.error("Error fetching material request details:", err);
    }
  };

  const handleCreateMRF = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/create_mrf/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ request_id: selectedRequest }),
      });

      if (response.ok) {
        alert("MRF created successfully!");
        navigate("/mrf_list");
      } else {
        console.error("Error creating MRF:", await response.json());
      }
    } catch (err) {
      console.error("Error during MRF creation:", err);
    }
  };

  return (
    <div style={{ padding: "0px", fontFamily: "Arial, sans-serif" }}>
      <h2>Material Request Form</h2>

      <div
        style={{
          marginTop: "20px",
          display: "flex",
          alignContent: "space-between",
          justifyContent: "space-between",
        }}
      >
        <div>
          <label>Products for Request ID:</label>
          <select
            value={selectedRequest}
            onChange={handleRequestChange}
            style={{ marginLeft: "10px", padding: "5px" }}
          >
            <option value="">-- Select Request --</option>
            {requestList.map((request) => (
              <option key={request} value={request}>
                {request}
              </option>
            ))}
          </select>
          <h3>Project Name: {projectName}</h3>
        </div>
        <div>
          <div style={{ marginLeft: "10px", padding: "5px" }}>
            <label>Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ marginLeft: "10px", padding: "5px" }}
            />
          </div>
          <div style={{ marginLeft: "10px", padding: "5px" }}>
            <label>Date:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ marginLeft: "10px", padding: "5px" }}
            />
          </div>
        </div>
      </div>

      <div style={{ marginTop: "20px" }}>
        <table border="1" cellPadding="5" cellSpacing="0" width="100%">
          <thead>
            <tr style={{ backgroundColor: "#f2f2f2" }}>
              <th>Component Type</th>
              <th>Component Specification</th>
              <th>Unit of Measurement</th>
              <th>Category</th>
              <th>Vendor Name</th>
              <th>Serial Number</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requestDetails.map((row) => (
              <tr key={row.id}>
                <td>{row.component_type}</td>
                <td>{row.specification}</td>
                <td>{row.UOM}</td>
                <td>{row.category}</td>
                <td>{row.vendor_name}</td>
                <td>{row.component_id}</td>
                <td>{row.status}</td>
                <td>
                  <input type="checkbox" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ alignSelf: "end", justifyContent: "end" }}>
        <button
          onClick={handleCreateMRF}
          disabled={!selectedRequest}
          style={{
            marginTop: "20px",
            padding: "10px 15px",
            backgroundColor: "grey",
            color: "white",
            border: "none",
            cursor: "pointer",
            alignSelf: "end",
            justifyContent: "end",
          }}
        >
          Create MRF
        </button>
      </div>
    </div>
  );
};

export default MRFCreate;
