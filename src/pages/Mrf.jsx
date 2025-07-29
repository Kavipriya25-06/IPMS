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

  const handleSearch = async (query) => {
    setSearchQuery(query);

    if (query.trim() === "") {
      fetchMRFs(); // Reset to full data
      return;
    }

    try {
      const response = await fetch(
        `${config.apiBaseURL}/create_MRF/?search=${query}`
      );
      if (response.ok) {
        const results = await response.json();
        setMrfData(results);
      } else {
        console.error("Error fetching MRF search results");
      }
    } catch (err) {
      console.error("Search fetch error:", err);
    }
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
        {/* Centered search bar */}
        <div className="search-wrapper">
          <div className="search-bar-container">
            <input
              type="text"
              className="search-bar"
              placeholder="Search by Project Name, MRF ID"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <span className="search-icon">
              <i className="fa fa-search" aria-hidden="true"></i>
            </span>
          </div>
        </div>

        {/* Add Vendor Button */}
        <button
          className="plus-button"
          title="Create MRF"
          onClick={() => navigate("/MRFCreate")}
        >
          <img src={Add} alt="Add Vendor" />
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
                  No data available for this date
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
