// // src/pages/MRFCreate.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import config from "../Config"; // Import config for API endpoints
import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  ToastContainerComponent,
} from "./Toastify.jsx"; // Import Toastify utilities

const MRFCreate = () => {
  const [requestList, setRequestList] = useState([]);
  const [availableRequests, setAvailableRequests] = useState([]);
  const [requestDetails, setRequestDetails] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState("");
  const [materialRequest, setMaterialRequest] = useState([]);
  const [projectDetails, setProjectDetails] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [selectedItems, setSelectedItems] = useState({}); // Stores selected rows
  const [newRows, setNewRows] = useState([]); // Store added rows
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
      const availableRequests = data.filter(
        (item) => item.status === "Available"
      );
      setAvailableRequests(availableRequests);
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

  // const handleCreateMRF = async () => {
  //   // Filter only selected rows
  //   const selectedRows = requestDetails.filter(
  //     (row) => selectedItems[row.serial_number]
  //   );

  //   if (selectedRows.length === 0) {
  //     showWarningToast("Please select at least one item.");
  //     return;
  //   }
  //   if (name.length === 0) {
  //     showWarningToast("Please enter name.");
  //     return;
  //   }
  //   if (date.length === 0) {
  //     showWarningToast("Please enter Date.");
  //     return;
  //   }

  //   // Send only ONE object at a time (not an array)
  //   for (const row of selectedRows) {
  //     const payload = {
  //       create_date: new Date().toISOString().split("T")[0], // YYYY-MM-DD format
  //       name: name,
  //       date: date,
  //       action: true, //Ensure this field is sent
  //       component_type: row.component_type, //Now sent at the root level
  //       component_specification: row.specification, //Correct field name
  //       unit_of_measurement: row.UOM, //  Correct field name
  //       category: row.category, //Now sent at the root level
  //       status: row.status || "", //Ensures status is not null
  //       serial_number: row.serial_number, // Now sent at the root level
  //     };

  //     try {
  //       const response = await fetch(`${config.apiBaseURL}/create_MRF/`, {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify(payload), // Sending a single object
  //       });

  //       if (!response.ok) {
  //         const errorResponse = await response.json();
  //         console.error("Error creating MRF:", errorResponse);
  //         showErrorToast(`Error creating MRF: ${JSON.stringify(errorResponse)}`);
  //         return;
  //       }
  //     } catch (err) {
  //       console.error("Error during MRF creation:", err);
  //       showErrorToast("An error occurred while creating the MRF.");
  //       return;
  //     }
  //   }

  //   showSuccessToast("MRF created successfully!");
  //   navigate("/MrfRequest");
  // };

  const handleAddRow = () => {
    setNewRows([...newRows, { serial_number: "", checked: false }]);
  };

  const handleNewRowChange = (index, value) => {
    // Prevent duplicate selection
    const isDuplicate =
      requestDetails.some((item) => item.serial_number === value) ||
      newRows.some((row, i) => i !== index && row.serial_number === value);

    if (isDuplicate) {
      showWarningToast("This serial number is already selected.");
      return;
    }
    const updatedRows = [...newRows];
    updatedRows[index].serial_number = value;
    setNewRows(updatedRows);
  };

  const handleNewRowCheckbox = (index) => {
    const updatedRows = [...newRows];
    updatedRows[index].checked = !updatedRows[index].checked;
    setNewRows(updatedRows);
  };

  const handleCreateMRF = async () => {
    const selectedRows = requestDetails.filter(
      (row) => selectedItems[row.serial_number]
    );

    // Include newly added rows
    const additionalSelectedRows = newRows
      .filter((row) => row.checked && row.serial_number)
      .map((row) =>
        availableRequests.find(
          (item) => item.serial_number === row.serial_number
        )
      );

    const finalRows = [...selectedRows, ...additionalSelectedRows];

    // if (selectedRows.length === 0) {
    //   showWarningToast("Please select at least one item.");
    //   return;
    // }

    if (finalRows.length === 0) {
      showWarningToast("Please select at least one item.");
      return;
    }

    if (!name) {
      showWarningToast("Please enter a name.");
      return;
    }
    if (!date) {
      showWarningToast("Please enter a date.");
      return;
    }

    // Step 1: Create MRF Entry
    const mrfPayload = {
      name: name,
      date: date,
      Request_id_assign: selectedRequest,
    };

    try {
      const mrfResponse = await fetch(`${config.apiBaseURL}/create_MRF/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mrfPayload),
      });

      if (!mrfResponse.ok) {
        const errorResponse = await mrfResponse.json();
        console.error("Error creating MRF:", errorResponse);
        showErrorToast(`Error creating MRF: ${JSON.stringify(errorResponse)}`);
        return;
      }

      const mrfData = await mrfResponse.json();
      const mrfId = mrfData.MRF_id;

      // Step 2: Add Items to MRF List
      for (const row of selectedRows) {
        const mrfListPayload = {
          MRF_id: mrfId, // Link to created MRF
          serial_number: row.serial_number,
          component_type: row.component_type,
          component_specification: row.specification,
          unit_of_measurement: row.UOM,
          category: row.category,
          status: row.status || "",
          action: true,
        };

        const mrfListResponse = await fetch(`${config.apiBaseURL}/MRFList/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(mrfListPayload),
        });

        if (!mrfListResponse.ok) {
          const errorResponse = await mrfListResponse.json();
          console.error("Error adding item to MRF List:", errorResponse);
          showErrorToast(`Error adding item: ${JSON.stringify(errorResponse)}`);
          return;
        }
      }

      showSuccessToast("MRF and items created successfully!");
      // navigate("/MrfRequest");
      setTimeout(() => navigate("/Mrf"), 1500);
    } catch (err) {
      console.error("Error during MRF creation:", err);
      showErrorToast("An error occurred while creating the MRF.");
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
            {newRows.map((row, index) => {
              const selectedItem = availableRequests.find(
                (item) => item.serial_number === row.serial_number
              );
              return (
                <tr key={`new-${index}`}>
                  <td>{selectedItem?.component_type || "-"}</td>
                  <td>{selectedItem?.specification || "-"}</td>
                  <td>{selectedItem?.UOM || "-"}</td>
                  <td>{selectedItem?.category || "-"}</td>
                  <td>{selectedItem?.vendor_name || "-"}</td>
                  <td>
                    <select
                      value={row.serial_number}
                      onChange={(e) =>
                        handleNewRowChange(index, e.target.value)
                      }
                    >
                      <option value="">Select Serial</option>
                      {availableRequests.map((item) => (
                        <option
                          key={item.serial_number}
                          value={item.serial_number}
                        >
                          {item.serial_number}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{selectedItem ? selectedItem.status : "Available"}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={row.checked || false}
                      onChange={() => handleNewRowCheckbox(index)}
                    />
                  </td>
                </tr>
              );
            })}
            <tr>
              <td>
                <button
                  onClick={handleAddRow}
                  style={{
                    padding: "8px",
                    backgroundColor: "green",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Add
                </button>
              </td>
            </tr>
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
      <ToastContainerComponent />
    </div>
  );
};

export default MRFCreate;
