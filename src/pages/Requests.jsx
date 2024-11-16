import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://127.0.0.1:8000/request_list/")
      .then((response) => response.json())
      .then((data) => setRequests(data))
      .catch((error) => console.error("Error fetching requests:", error));
  }, []);

  const handleRequestClick = (requestId) => {
    navigate(`/requests/${requestId}`); // Navigate to request details
  };

  const handleNewRequest = () => {
    navigate("/request-form"); // Navigate to the New Request form
  };

  return (
    <div>
      <h2>Request List</h2>
      <button onClick={handleNewRequest} style={{ marginBottom: "10px" }}>
        New Request
      </button>
      <table>
        <thead>
          <tr>
            <th>Request ID</th>
            {/* <th>BOM ID</th> */}
            <th>Requester Name</th>
            <th>Date</th>
            <th>Status</th>
            <th>Last Modified By</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request.request_id}>
              <td
                onClick={() => handleRequestClick(request.request_id)}
                style={{
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                {request.request_id}
              </td>
              {/* <td>{request.bom_id}</td> */}
              <td>{request.requester_name}</td>
              <td>{request.date}</td>
              <td>{request.status}</td>
              <td>{request.last_modified_by}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Requests;
