// // src/pages/MRFCreate.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import config from "../Config"; // Import config for API endpoints

const MRFCreate = () => {
  const [requestList, setRequestList] = useState([]);
  const [requestDetails, setRequestDetails] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState("");
  const [materialRequest, setMaterialRequest] = useState([]);
  const [projectDetails, setProjectDetails] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [selectedItems, setSelectedItems] = useState({}); // Stores selected rows
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequestList();
    fetchProjectDetails();
  }, []);

  const fetchRequestList = async () => {
    try {
      // const response = await fetch(`${config.apiBaseURL}/request_master/`);
      const response = await fetch(`${config.apiBaseURL}/inventory/`);
      const data = await response.json();
      const filteredRequests = data.filter(
        (item) => item.status === "Reserved"
      );
      const uniqueRequests = [
        ...new Set(filteredRequests.map((item) => item.Request_id_assign)),
      ];
      setRequestList(uniqueRequests);
    } catch (err) {
      console.error("Error fetching request list:", err);
    }
  };

  const fetchProjectDetails = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/request_inventory/`);
      const data = await response.json();
      setProjectDetails(data);
    } catch (err) {
      console.error("Error fetching project details: ", err);
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
        (item) =>
          item.Request_id_assign === requestId && item.status === "Reserved"
      );
      setRequestDetails(filteredData);

      const filteredProjectData = projectDetails.filter(
        (item) => item.request_id === requestId
      );

      if (filteredProjectData.length > 0) {
        setProjectName(filteredProjectData[0].project_details.project_name);
      }
    } catch (err) {
      console.error("Error fetching material request details:", err);
    }
  };

  const handleCheckboxChange = (serialNumber) => {
    setSelectedItems((prev) => ({
      ...prev,
      [serialNumber]: !prev[serialNumber], // Toggle the selection
    }));
  };

  const handleCreateMRF = async () => {
    // Filter only selected rows
    const selectedRows = requestDetails.filter(
      (row) => selectedItems[row.serial_number]
    );

    if (selectedRows.length === 0) {
      alert("Please select at least one item.");
      return;
    }

    // Send only ONE object at a time (not an array)
    for (const row of selectedRows) {
      const payload = {
        create_date: new Date().toISOString().split("T")[0], // YYYY-MM-DD format
        name: name,
        date: date,
        action: true, //Ensure this field is sent
        component_type: row.component_type, //Now sent at the root level
        component_specification: row.specification, //Correct field name
        unit_of_measurement: row.UOM, //  Correct field name
        category: row.category, //Now sent at the root level
        status: row.status || "", //Ensures status is not null
        serial_number: row.serial_number, // Now sent at the root level
      };

      try {
        const response = await fetch(`${config.apiBaseURL}/create_MRF/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload), // Sending a single object
        });

        if (!response.ok) {
          const errorResponse = await response.json();
          console.error("Error creating MRF:", errorResponse);
          alert(`Error creating MRF: ${JSON.stringify(errorResponse)}`);
          return;
        }
      } catch (err) {
        console.error("Error during MRF creation:", err);
        alert("An error occurred while creating the MRF.");
        return;
      }
    }

    alert("MRF created successfully!");
    navigate("/MrfRequest");
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
          <h3>Project Name: {projectName || ""}</h3>
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
              <tr key={row.serial_number}>
                <td>{row.component_type}</td>
                <td>{row.specification}</td>
                <td>{row.UOM}</td>
                <td>{row.category}</td>
                <td>{row.vendor_name}</td>
                <td>{row.serial_number}</td>
                <td>{row.status}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedItems[row.serial_number] || false}
                    onChange={() => handleCheckboxChange(row.serial_number)}
                  />
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
