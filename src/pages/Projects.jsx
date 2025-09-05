import React, { useState, useEffect } from "react"; // add useContext
import { useNavigate } from "react-router-dom";
import config from "../Config"; // API Configuration
import AddIcon from "../assets/Add.png";
import CancelIcon from "../assets/cancel.png";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, parseISO } from "date-fns";
import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  ToastContainerComponent,
} from "./Toastify.jsx"; // Import Toastify utilities
import { useAuth } from "../AuthContext.jsx";

const ProjectList = () => {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({
    project_name: "",
    description: "",
    start_date: "",
    project_type: "",
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const navigate = useNavigate();
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
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
      behavior: "smooth", // Smooth scroll effect sffb
    });
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${config.apiBaseURL}/project/`);
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false); // Stop loading after both calls
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject({ ...newProject, [name]: value });
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${config.apiBaseURL}/project/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProject),
      });
      if (response.ok) {
        const addedProject = await response.json();
        setProjects([...projects, addedProject]); // Update list
        setNewProject({
          project_name: "",
          description: "",
          start_date: "",
          project_type: "",
        }); // Reset form
        setShowAddForm(false); // Hide form
        showSuccessToast("Project created successfully!"); // Show success toast
      } else {
        console.error("Failed to add project.");
        showErrorToast("Failed to add project. Please try again."); // Show error toast
      }
    } catch (error) {
      console.error("Error adding project:", error);
    }
  };

  const handleSort = (field) => {
    const order = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(order);

    const sorted = [...projects].sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];

      if (aVal < bVal) return order === "asc" ? -1 : 1;
      if (aVal > bVal) return order === "asc" ? 1 : -1;
      return 0;
    });

    setProjects(sorted);
  };

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
        <h2>Project List</h2>
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
              placeholder="Search by Project Name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="search-icon">
              <i className="fa fa-search" aria-hidden="true"></i>
            </span>
          </div>
        </div>
        {(user?.role === "Admin" || user?.role === "Sub-Admin") && (
          <button
            style={{
              cursor: "pointer",
              background: "transparent",
              border: "none",
              padding: "4px",
              marginBottom: "-20px",
            }}
            className="plus-button"
            title={showAddForm ? "Cancel" : "Add Project"}
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <img
              src={showAddForm ? CancelIcon : AddIcon}
              alt={showAddForm ? "Cancel" : "Add Project"}
              style={{ width: "20px", height: "20px", marginBottom: "5px" }}
            />
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h4>Add New Project</h4>
            {/* Add Project Form */}
            <div className="form-grid">
              <label htmlFor="">Project Type</label>
              <select
                name="project_type"
                value={newProject.project_type}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Project Type</option>
                <option value="R&D">R&D</option>
                <option value="OPS">OPS</option>
                <option value="SER">SER</option>
                <option value="MISC">MISC</option>
                <option value="U/D">U/D</option>
              </select>

              <label htmlFor="">Project Name</label>

              <input
                type="text"
                name="project_name"
                value={newProject.project_name}
                onChange={handleInputChange}
                required
                placeholder="Project Name"
              />
              <label htmlFor="">Description</label>

              <input
                type="text"
                name="description"
                value={newProject.description}
                onChange={handleInputChange}
                required
                placeholder="Description"
              />
              <label htmlFor="">Select Date</label>

              <div className="date-input-container">
                <DatePicker
                  selected={
                    newProject.start_date
                      ? typeof newProject.start_date === "string"
                        ? parseISO(newProject.start_date)
                        : newProject.start_date
                      : null
                  }
                  onChange={(date) =>
                    handleInputChange({
                      target: {
                        name: "start_date",
                        value: date ? format(date, "yyyy-MM-dd") : "",
                      },
                    })
                  }
                  dateFormat="dd-MM-yyyy"
                  placeholderText="dd-mm-yyyy"
                  className="input1"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  required
                />
                <i className="fas fa-calendar-alt calendar-icon"></i>{" "}
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={handleAddProject}>Create</button>
              <button onClick={() => setShowAddForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="table-container" style={{ marginTop: "-15px" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid #ddd",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f4f4f4" }}>
              <th
                onClick={() => handleSort("project_id")}
                style={{
                  textDecoration: "underline",
                  cursor: "pointer",
                  padding: "10px",
                }}
              >
                Project ID{" "}
                {sortField === "project_id"
                  ? sortOrder === "asc"
                    ? " 🔼"
                    : " 🔽"
                  : ""}
              </th>
              <th style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                Project Name
              </th>
              <th style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                Description
              </th>
              <th
                onClick={() => handleSort("start_date")}
                style={{
                  textDecoration: "underline",
                  cursor: "pointer",
                  padding: "10px",
                }}
              >
                Start Date{" "}
                {sortField === "start_date"
                  ? sortOrder === "asc"
                    ? " 🔼"
                    : " 🔽"
                  : ""}
              </th>
              <th style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                Project Type
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="8"
                  style={{ textAlign: "center", padding: "10px" }}
                >
                  <div className="spinner"></div>
                  Loading Projects...
                </td>
              </tr>
            ) : projects.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", color: "gray" }}>
                  No projects available
                </td>
              </tr>
            ) : projects.filter((project) =>
                project.project_name
                  ?.toLowerCase()
                  .includes(searchQuery.toLowerCase())
              ).length > 0 ? (
              projects
                .filter((project) =>
                  project.project_name
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase())
                )
                .map((project) => (
                  <tr
                    key={project.project_id}
                    style={{ borderBottom: "1px solid #ddd" }}
                  >
                    <td
                      onClick={() =>
                        navigate(`/projects/${project.project_id}`)
                      }
                      style={{
                        cursor: "pointer",
                        color: "black",
                        textDecoration: "underline",
                        padding: "10px",
                      }}
                    >
                      {project.project_id}
                    </td>
                    <td style={{ padding: "10px" }}>{project.project_name}</td>
                    <td style={{ padding: "10px" }}>{project.description}</td>
                    <td style={{ padding: "10px" }}>
                      {project.start_date
                        ? format(parseISO(project.start_date), "dd-MM-yyyy")
                        : "--"}
                    </td>
                    <td style={{ padding: "10px" }}>{project.project_type}</td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", color: "gray" }}>
                  No projects found for "<strong>{searchQuery}</strong>"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
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

export default ProjectList;
