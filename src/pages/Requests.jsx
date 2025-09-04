import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import config from "../Config"; // Import config for API endpoints
import Add from "../assets/Add.png";
import { format, parseISO } from "date-fns";
import { useAuth } from "../AuthContext";

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [requestMaster, setRequestMaster] = useState([]);
  const [requestStatus, setRequestStatus] = useState([]);
  const [showstatus, setShowstatus] = useState(false);
  const [requestStatusView, setRequestStatusView] = useState([]); // Status details for popup
  const navigate = useNavigate();

  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const loggedInEmail = user?.email || "";
  const loggedInName = loggedInEmail.split("@")[0] || "";
  const loggedInRole = user?.role || "";

  useEffect(() => {
    fetch(`${config.apiBaseURL}/request_list/`)
      .then((response) => response.json())
      .then((data) => {
        // Sort by request_id number ascending
        const sortedData = [...data].sort((a, b) => {
          const numA = parseInt(String(a.request_id).replace(/\D/g, ""), 10);
          const numB = parseInt(String(b.request_id).replace(/\D/g, ""), 10);
          return numA - numB;
        });

        // Role-based filtering after sorting
        if (
          loggedInRole === "Admin" ||
          loggedInRole === "Sub-Admin" ||
          loggedInRole === "Inventory"
        ) {
          setRequests(sortedData); // See all requests
        } else {
          setRequests(
            sortedData.filter((req) => req.requester_name === loggedInName) // Only own requests
          );
        }
      })
      .catch((error) => console.error("Error fetching requests:", error));

    fetchRequestDetails();
    fetchRequestStatus();
  }, [loggedInRole, loggedInName]);

  useEffect(() => {
    const container = document.getElementById("request-table-wrapper");

    const handleScroll = () => {
      if (container.scrollTop > 200) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const scrollToTop = () => {
    const container = document.getElementById("request-table-wrapper");
    if (container) {
      container.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleRequestClick = (requestId) => {
    navigate(`/requests/${requestId}`); // Navigate to request details
  };

  const handleNewRequest = () => {
    navigate("/request-form"); // Navigate to the New Request form
  };

  const fetchRequestDetails = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${config.apiBaseURL}/request_master/`);
      const data = await response.json();
      setRequestMaster(data);
      console.log("Request master", data);
    } catch (error) {
      console.error("Error fetching request details:", error);
    } finally {
      setLoading(false); // Stop loading after both calls
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
    let newOrder = sortOrder;

    if (sortField === field) {
      // If clicking the same field, toggle the sort order.
      newOrder = sortOrder === "asc" ? "desc" : "asc";
      setSortOrder(newOrder);
    } else {
      // Set new sort field and default to ascending.
      setSortField(field);
      newOrder = "asc";
      setSortOrder(newOrder);
    }

    // Apply sorting immediately
    const sorted = [...sortedRequests].sort((a, b) => {
      if (field === "request_id") {
        // Numeric sort for request_id
        return newOrder === "asc"
          ? Number(a.request_id) - Number(b.request_id)
          : Number(b.request_id) - Number(a.request_id);
      } else if (field === "date") {
        // Sort dates
        return newOrder === "asc"
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date);
      } else {
        // String sort
        return newOrder === "asc"
          ? String(a[field] || "").localeCompare(String(b[field] || ""))
          : String(b[field] || "").localeCompare(String(a[field] || ""));
      }
    });

    setSortedRequests(sorted);
  };

  // Sorting the requests array based on the sortField and sortOrder.
  // Sorting the requests array based on the sortField and sortOrder.
  const sortedRequests = [...requests].sort((a, b) => {
    if (!sortField) return 0;

    // numeric extractor for IDs like "REQ_00012"
    const idNum = (v) => {
      const n = parseInt(String(v ?? "").replace(/\D/g, ""), 10);
      return Number.isFinite(n) ? n : 0;
    };

    let aVal = a[sortField];
    let bVal = b[sortField];

    if (sortField === "request_id") {
      aVal = idNum(a.request_id);
      bVal = idNum(b.request_id);
    } else if (sortField === "date") {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    }

    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const filteredRequests = React.useMemo(() => {
    const q = (searchQuery || "").trim().toLowerCase();
    if (!q) return sortedRequests;

    return sortedRequests.filter((request) => {
      const name = (request.requester_name || "").toLowerCase();
      const idStr = String(request.request_id || "").toLowerCase(); // supports REQ_00012
      return name.includes(q) || idStr.includes(q);
    });
  }, [sortedRequests, searchQuery]);

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
      </div>
      <div
        className="search-wrapper-container"
        style={{ marginBottom: "10px" }}
      >
        <div className="search-wrapper">
          <div className="search-bar-container">
            <input
              type="text"
              className="search-bar"
              placeholder="Search by Requester ID or Name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="search-icon">
              <i className="fa fa-search" aria-hidden="true"></i>
            </span>
          </div>
        </div>
        <button
          onClick={handleNewRequest}
          style={{
            cursor: "pointer",
            background: "transparent",
            border: "none",
            padding: "4px",
            marginBottom: "-20px",
          }}
          title="New Request"
        >
          <img
            src={Add}
            alt="New Request"
            style={{ width: "20px", height: "20px" }}
          />
        </button>
      </div>

      <div
        id="request-table-wrapper"
        className="table-container"
        style={{ marginTop: "-15px" }}
      >
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
            {loading ? (
              <tr>
                <td
                  colSpan="8"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  <div className="spinner"></div>
                  Loading Requests...
                </td>
              </tr>
            ) : filteredRequests.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", color: "gray" }}>
                  No requests found for "<strong>{searchQuery}</strong>"
                </td>
              </tr>
            ) : (
              filteredRequests.map((request) => {
                const { status } = getAggregatedStatus(request.request_id);
                return (
                  <tr
                    key={request.request_id}
                    style={{ borderBottom: "1px solid #ddd" }}
                  >
                    <td
                      onClick={() => handleRequestClick(request.request_id)}
                      style={{
                        cursor: "pointer",
                        textDecoration: "underline",
                        padding: "10px",
                      }}
                    >
                      {request.request_id}
                    </td>
                    <td style={{ padding: "10px" }}>
                      {request.requester_name}
                    </td>
                    <td style={{ padding: "10px" }}>
                      {request.date
                        ? format(parseISO(request.date), "dd-MM-yyyy")
                        : "--"}
                    </td>
                    <td
                      onClick={() => statusPopup(request.request_id)}
                      style={{
                        cursor: "pointer",
                        textDecoration: "underline",
                        padding: "10px",
                      }}
                    >
                      {status}
                    </td>
                    <td style={{ padding: "10px" }}>
                      {request.last_modified_by}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {showstatus && (
        <div className="modal-overlay">
          <div
            className="popup"
            style={{ width: "40%", maxHeight: "60vh", overflowY: "auto" }}
          >
            <span className="x-button" onClick={handleCloseStatus}>
              &times;
            </span>
            <h3>Status Details</h3>
            <div className="table-container">
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
                  {requestStatusView.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        style={{ textAlign: "center", padding: "1rem" }}
                      >
                        No data available
                      </td>
                    </tr>
                  ) : (
                    requestStatusView.map((status, index) => (
                      <tr key={index}>
                        <td>{status.po_id}</td>
                        <td>{status.request_id}</td>
                        <td className="specification-cell">
                          {status.component_specification}
                        </td>
                        <td>{status.po_status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
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
