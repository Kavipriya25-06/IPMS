import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [requestMaster, setRequestMaster] = useState([]);
  const [requestStatus, setRequestStatus] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://127.0.0.1:8000/request_list/")
      .then((response) => response.json())
      .then((data) => setRequests(data))
      .catch((error) => console.error("Error fetching requests:", error));
    fetchRequestDetails();
    fetchRequestStatus();
  }, []);

  const handleRequestClick = (requestId) => {
    navigate(`/requests/${requestId}`); // Navigate to request details
  };

  const handleNewRequest = () => {
    navigate("/request-form"); // Navigate to the New Request form
  };

  const fetchRequestDetails = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/request_master/");
      const data = await response.json();
      setRequestMaster(data);
      console.log("Request master", data);
    } catch (error) {
      console.error("Error fetching request details:", error);
    }
  };

  const fetchRequestStatus = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/update_request/");
      const data = await response.json();
      setRequestStatus(data);
      // console.log("Status", data);
    } catch (error) {
      console.error("Error fetching request details:", error);
    }
  };

  // Combine PO and Statuses
  const getAggregatedStatus = (requestId) => {
    const relevantStatuses = requestStatus.filter(
      (po) => po.request_list_id === requestId
    );
    // const poMasterIds = relevantPOMaster.map((po) => po.request_id);

    // const relevantStatuses = orderStatuses.filter((status) =>
    //   poMasterIds.includes(status.po_master_id)
    // );

    if (relevantStatuses.length === 0) {
      return { status: "Pending", mixed: false };
    }

    const uniqueStatuses = new Set(
      relevantStatuses.map((status) => {
        if (status.po_status === "Received") return "Received";
        if (status.po_status === "Shipped") return "Shipped";
        if (status.po_status === "Ordered") return "Ordered";
        return "Pending";
      })
    );

    if (uniqueStatuses.size === 1) {
      return { status: Array.from(uniqueStatuses)[0], mixed: false };
    }

    return { status: "In Progress", mixed: true };
  };

  return (
    <div>
      <h2>Request List</h2>

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
          {requests.map((request) => {
            const { status, mixed } = getAggregatedStatus(request.request_id);
            return (
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
                {/* <td>{request.status}</td> */}
                <td>{status}</td>
                <td>{request.last_modified_by}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <button onClick={handleNewRequest} style={{ marginTop: "10px" }}>
        New Request
      </button>
    </div>
  );
};

export default Requests;
