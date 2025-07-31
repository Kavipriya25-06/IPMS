import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import config from "../Config";
import Add from "../assets/Add.png";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";
import { format } from "date-fns";

const Mrf = () => {
  const navigate = useNavigate();
  const [mrfData, setMrfData] = useState([]);
  const [projectDetails, setProjectDetails] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const datePickerRef = React.useRef(null);
  const [originalMRFData, setOriginalMRFData] = useState([]);

  // Filter states
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef(null);

  useEffect(() => {
    fetchMRFs();
    fetchProjectDetails();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target)
      ) {
        setStatusDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchMRFs = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/create_MRF/`);
      const data = await response.json();
      setOriginalMRFData(data); // ← full dataset

      setMrfData(data);
    } catch (err) {
      console.error("Error fetching MRFs:", err);
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

  // Helper function to get Project Name by Request ID
  const getProjectName = (requestId) => {
    const project = projectDetails.find(
      (proj) => proj.request_id === requestId
    );
    return project ? project.project_details.project_name : "N/A";
  };

  const handleSearch = (query) => {
    setSearchQuery(query);

    if (query.trim() === "") {
      setMrfData(originalMRFData); // Reset if empty search
      return;
    }

    const filtered = originalMRFData.filter((item) => {
      const mrfId = item.MRF_id?.toLowerCase() || "";
      const projectName = item.project?.project_name?.toLowerCase() || "";
      return (
        mrfId.includes(query.toLowerCase()) ||
        projectName.includes(query.toLowerCase())
      );
    });

    setMrfData(filtered);
  };

  const filteredData = mrfData.filter((item) => {
    const dateMatch = dateFilter
      ? format(new Date(item.create_date), "yyyy-MM-dd") ===
        format(dateFilter, "yyyy-MM-dd")
      : true;
    const statusMatch = statusFilter
      ? statusFilter === "Approved"
        ? item.approval === true
        : item.approval === false
      : true;
    return dateMatch && statusMatch;
  });

  const [dropdownCoords, setDropdownCoords] = useState({ top: 0, left: 0 });
  useEffect(() => {
    if (statusDropdownOpen && statusDropdownRef.current) {
      const rect = statusDropdownRef.current.getBoundingClientRect();
      setDropdownCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
    }
  }, [statusDropdownOpen]);

  // Add this helper at the top (if not already present)
  const formatDate = (value) =>
    value ? format(new Date(value), "dd-MM-yyyy") : "N/A";

  const handleGenerateReport = () => {
    if (filteredData.length === 0) {
      alert("No data available to generate the report.");
      return;
    }

    const formattedData = filteredData.map((item, index) => ({
      "S.No": index + 1,
      "MRF ID": item.MRF_id || "N/A",
      Name: item.name || "N/A",
      "Create Date": formatDate(item.create_date),
      "Request ID": item.Request_id_assign || "N/A",
      "Project Name": getProjectName(item.Request_id_assign),
      Status: item.approval ? "Approved" : "Pending",
    }));

    generateCSV(formattedData, "MRF_Report");
  };

  const generateCSV = (data, filename) => {
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(","), // header row
      ...data.map((row) =>
        headers
          .map(
            (field) => `"${(row[field] || "").toString().replace(/"/g, '""')}"`
          )
          .join(",")
      ),
    ];

    const blob = new Blob([csvRows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [currentUserRole, setCurrentUserRole] = useState("");

  // Load role from localStorage (or replace with your actual role-fetching logic)
  useEffect(() => {
    const role = localStorage.getItem("userRole"); // Default to 'User'
    console.log("Normalized role:", role);
    setCurrentUserRole(role);
  }, []);

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
        <h2>Material Requests (MRF)</h2>
      </div>

      <div className="search-wrapper-container">
        <div className="search-wrapper">
          <div className="search-bar-container">
            <input
              type="text"
              className="search-bar"
              placeholder="Search by MRF ID"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <span className="search-icon">
              <i className="fa fa-search" aria-hidden="true"></i>
            </span>
          </div>
        </div>

        {searchQuery.trim() !== "" && mrfData.length === 0 && (
          <div
            style={{ textAlign: "center", marginTop: "20px", color: "gray" }}
          >
            No data available
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "10px",
          marginBottom: "10px",
          marginTop: "-45px",
        }}
      >
        {currentUserRole === "Inventory" ||
          (currentUserRole === "Admin" && (
            <button
              className="generate-report-btn"
              onClick={handleGenerateReport}
            >
              Generate Report
            </button>
          ))}

        <button
          className="plus-button"
          title="Create MRF"
          onClick={() => navigate("/MRFCreate")}
        >
          <img src={Add} alt="Create MRF" />
        </button>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>MRF ID</th>
              <th>Name</th>
              <th
                className="date-filter-inline"
                style={{ width: "100%", height: "27px" }}
              >
                {!dateFilter && <span>Create Date</span>}

                <DatePicker
                  selected={dateFilter}
                  onChange={(date) => setDateFilter(date)}
                  ref={datePickerRef}
                  dateFormat="yyyy-MM-dd"
                  customInput={<div />} // Hides input field
                  popperPlacement="bottom-end"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                />

                {dateFilter && (
                  <span
                    style={{
                      marginLeft: "10px",
                      fontSize: "16px",
                      color: "white",
                    }}
                  >
                    {format(dateFilter, "dd-MM-yyyy")}
                  </span>
                )}

                <FaCalendarAlt
                  style={{
                    fontSize: "14px",
                    cursor: "pointer",
                    color: "#333",
                  }}
                  onClick={() => datePickerRef.current.setOpen(true)}
                />
              </th>

              <th>Request ID</th>
              <th>Project name</th>
              <th className="status-dropdown-wrapper" ref={statusDropdownRef}>
                <div
                  className="status-dropdown"
                  onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                >
                  {statusFilter || "Status"}
                  <span className="status-dropdown-icon">▼</span>
                </div>

                {statusDropdownOpen && (
                  <div
                    className="status-dropdown-options"
                    style={{
                      position: "fixed",
                      top: dropdownCoords.top,
                      left: dropdownCoords.left,
                      zIndex: 9999,
                      width: "150px",
                    }}
                  >
                    <div
                      className="status-dropdown-option"
                      onClick={() => {
                        setStatusFilter("");
                        setStatusDropdownOpen(false);
                      }}
                    >
                      All
                    </div>
                    {["Approved", "Pending"].map((status) => (
                      <div
                        key={status}
                        className="status-dropdown-option"
                        onClick={() => {
                          setStatusFilter(status);
                          setStatusDropdownOpen(false);
                        }}
                      >
                        {status}
                      </div>
                    ))}
                  </div>
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  style={{
                    textAlign: "center",
                    color: "gray",
                    fontStyle: "italic",
                  }}
                >
                  No data available for this search
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr key={item.MRF_id}>
                  <td
                    onClick={() => navigate(`/MrfRequest/${item.MRF_id}`)}
                    style={{ cursor: "pointer", textDecoration: "underline" }}
                  >
                    {item.MRF_id}
                  </td>
                  <td>{item.name}</td>
                  <td>
                    {item.create_date && !isNaN(new Date(item.create_date))
                      ? format(new Date(item.create_date), "dd-MM-yyyy")
                      : "No Data Available"}
                  </td>
                  <td>{item.Request_id_assign}</td>
                  <td>{getProjectName(item.Request_id_assign)}</td>
                  <td>{item.approval ? "Approved" : "Pending"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Mrf;
