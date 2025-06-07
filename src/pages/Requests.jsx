import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import config from "../Config"; // Import config for API endpoints
import Add from "../assets/Add.png";

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [requestMaster, setRequestMaster] = useState([]);
  const [requestStatus, setRequestStatus] = useState([]);
  const [showstatus, setShowstatus] = useState(false);
  const [requestStatusView, setRequestStatusView] = useState([]); // Status details for popup
  const navigate = useNavigate();

  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showScrollTop, setShowScrollTop] = useState(false); // Track visibility of scroll-to-top button

  useEffect(() => {
    fetch(`${config.apiBaseURL}/request_list/`)
      .then((response) => response.json())
      .then((data) => setRequests(data))
      .catch((error) => console.error("Error fetching requests:", error));
    fetchRequestDetails();
    fetchRequestStatus();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Smooth scroll effect
    });
  };

  const handleRequestClick = (requestId) => {
    navigate(`/requests/${requestId}`); // Navigate to request details
  };

  const handleNewRequest = () => {
    navigate("/request-form"); // Navigate to the New Request form
  };

  const fetchRequestDetails = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/request_master/`);
      const data = await response.json();
      setRequestMaster(data);
      console.log("Request master", data);
    } catch (error) {
      console.error("Error fetching request details:", error);
    }
  };

  const fetchRequestStatus = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/update_request/`);
      const data = await response.json();
      setRequestStatus(data);
      // console.log("Status", data);
    } catch (error) {
      console.error("Error fetching request details:", error);
    }
  };

  const statusPopup = (requestId) => {
    const relevantStatuses = requestStatus.filter(
      (po) => po.request_list_id === requestId
    );

    const popupView = relevantStatuses.map((detail) => ({
      request_id: detail.request_list_id,
      requestMaster_id: detail.request_id,
      po_id: detail.po_id,
      po_status: detail.po_status,
      component_specification:
        requestMaster.find((request) => request.id === detail.request_id)
          ?.component_specification || "",
    }));
    console.log("request popup", popupView);
    // return popupView;
    setShowstatus(true); // Show the popup
    setRequestStatusView(popupView); // Set the status data for the popup
  };

  const handleCloseStatus = () => {
    setShowstatus(false);
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

  // Function to handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      // If clicking the same field, toggle the sort order.
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Set new sort field and default to ascending.
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Sorting the requests array based on the sortField and sortOrder.
  const sortedRequests = [...requests].sort((a, b) => {
    if (!sortField) return 0;
    let aVal = a[sortField];
    let bVal = b[sortField];

    // For the date field, convert the values to Date objects.
    if (sortField === "date") {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    }

    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div>
      <div
        className="header"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h2>Request List</h2>
        <button
          style={{
            cursor: "pointer",
            marginLeft: "auto",
            marginRight: 20,
            background: "transparent",
            border: "none",
          }}
          title="New Request"
          onClick={handleNewRequest}
        >
          <img
            src={Add}
            alt="New Request"
            style={{ width: "20px", height: "20px" }}
          />
        </button>

        {/* <button
        onClick={handleNewRequest}
        style={{
          marginTop: "10px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "4px",
        }}
        title="New Request"
      >
        <img
          src={Add}
          alt="New Request"
          style={{ width: "20px", height: "20px" }}
        />
      </button> */}
      </div>

      <table>
        <thead>
          <tr>
            <th
              onClick={() => handleSort("request_id")}
              style={{ cursor: "pointer", textDecoration: "underline" }}
            >
              Request ID
              {sortField === "request_id"
                ? sortOrder === "asc"
                  ? " 🔼"
                  : " 🔽"
                : ""}
            </th>
            {/* <th>BOM ID</th> */}
            <th>Requester Name</th>
            <th
              onClick={() => handleSort("date")}
              style={{ cursor: "pointer", textDecoration: "underline" }}
            >
              Date{" "}
              {sortField === "date"
                ? sortOrder === "asc"
                  ? " 🔼"
                  : " 🔽"
                : ""}
            </th>
            <th>Status</th>
            <th>Last Modified By</th>
          </tr>
        </thead>
        <tbody>
          {sortedRequests.map((request) => {
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
                <td
                  onClick={() => statusPopup(request.request_id)}
                  style={{ cursor: "pointer", textDecoration: "underline" }}
                >
                  {status}
                </td>
                <td>{request.last_modified_by}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {showstatus && (
        <div className="popup">
          <span className="close-button" onClick={handleCloseStatus}>
            &times;
          </span>
          <h3>Status Details</h3>

          <table>
            <thead>
              <tr>
                <th>PO ID</th>
                <th>Request ID</th>
                <th>Component Spec</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {requestStatusView.map((status, index) => (
                <tr key={index}>
                  <td>{status.po_id}</td>
                  <td>{status.request_id}</td>
                  <td>{status.component_specification}</td>
                  <td>{status.po_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
       {showScrollTop && (
        <button
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            padding: "10px 15px",
            fontSize: "18px",
            backgroundColor: "#f57c00",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            zIndex: 1000,
          }}
          onClick={scrollToTop}
        >
          ↑
        </button>
      )}
    </div>
  );
};

export default Requests;
