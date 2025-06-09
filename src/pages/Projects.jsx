// import React, { useState, useEffect } from "react";
// import config from "../Config"; // Import config for API endpoints

// const Project = () => {
//   const [projects, setProjects] = useState([]);
//   const [selectedProjectDetails, setSelectedProjectDetails] = useState(null);
//   const [newProject, setNewProject] = useState({
//     project_name: "",
//     description: "",
//     start_date: "",
//   });
//   const [showAddForm, setShowAddForm] = useState(false);

//   useEffect(() => {
//     fetchProjects();
//   }, []);

//   const fetchProjects = async () => {
//     try {
//       const response = await fetch(`${config.apiBaseURL}/project/`);
//       const data = await response.json();
//       setProjects(data);
//     } catch (error) {
//       console.error("Error fetching projects:", error);
//     }
//   };

//    const fetchProjectDetails = async (projectId) => {
//     try {
//       const response = await fetch(`${config.apiBaseURL}/projects_details/${projectId}/`);
//       if (response.ok) {
//         const data = await response.json();

//         // Extract only the required details
//         const formattedDetails = {
//           project_id: data.project.project_id,
//           project_name: data.project.project_name,
//           request_id: data.request_lists.length > 0 ? data.request_lists[0].request_id : "N/A",
//           requester_name: data.request_lists.length > 0 ? data.request_lists[0].requester_name : "N/A",
//           bom_id: data.bom_lists.length > 0 ? data.bom_lists[0].bom_id : "N/A",
//           bom_name: data.bom_lists.length > 0 ? data.bom_lists[0].bom_name : "N/A",
//           PO_id: data.po_master.length > 0 ? data.po_master[0].PO_id : "N/A",
//           cart_id: data.po_master.length > 0 ? data.po_master[0].cart_id : "N/A",
//         };

//         setSelectedProjectDetails(formattedDetails);
//       } else {
//         console.error("Failed to fetch project details.");
//       }
//     } catch (error) {
//       console.error("Error fetching project details:", error);
//     }
//   };

//   const handleProjectClick = (projectId) => {
//     fetchProjectDetails(projectId);
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setNewProject({ ...newProject, [name]: value });
//   };

//   const handleAddProject = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await fetch(`${config.apiBaseURL}/project/`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(newProject),
//       });
//       if (response.ok) {
//         const addedProject = await response.json();
//         setProjects([...projects, addedProject]);
//         setNewProject({ project_name: "", description: "", start_date: "" }); // Reset form
//         setShowAddForm(false); // Hide the form after adding
//       } else {
//         console.error("Failed to add project.");
//       }
//     } catch (error) {
//       console.error("Error adding project:", error);
//     }
//   };

//   return (
//     <div style={{ fontFamily: "Arial, sans-serif" }}>
//       <h2 style={{ textAlign: "left" }}>Project List</h2>
//       <table
//         style={{
//           width: "100%",
//           borderCollapse: "collapse",
//           marginBottom: "20px",
//         }}
//       >
//         <thead>
//           <tr>
//             <th>Project ID</th>
//             <th>Project Name</th>
//             <th>Description</th>
//             <th>Start Date</th>
//           </tr>
//         </thead>
//         <tbody>
//           {projects.length > 0 ? (
//             projects.map((project) => (
//               <tr key={project.project_id}>
//                 <td
//                   onClick={() => handleProjectClick(project.project_id)}
//                   style={{
//                     cursor: "pointer",
//                     color: "blue",
//                     textDecoration: "underline",
//                   }}
//                 >
//                   {project.project_id}
//                 </td>
//                 <td>{project.project_name}</td>
//                 <td>{project.description}</td>
//                 <td>{project.start_date}</td>
//               </tr>
//             ))
//           ) : (
//             <tr>
//               <td
//                 colSpan="4"
//                 style={{
//                   border: "1px solid #ddd",
//                   padding: "8px",
//                   textAlign: "center",
//                 }}
//               >
//                 No projects available
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </table>

//       {selectedProjectDetails && (
//         <div
//           style={{
//             marginTop: "20px",
//             padding: "15px",
//             border: "1px solid #ddd",
//             borderRadius: "5px",
//             backgroundColor: "#f0f0f0",
//           }}
//         >
//           <h3>Project Details</h3>
//           <table style={{ width: "100%", borderCollapse: "collapse" }}>
//             <tbody>
//               <tr>
//                 <td style={{ fontWeight: "bold", padding: "5px" }}>Project ID:</td>
//                 <td>{selectedProjectDetails.project_id}</td>
//               </tr>
//               <tr>
//                 <td style={{ fontWeight: "bold", padding: "5px" }}>Project Name:</td>
//                 <td>{selectedProjectDetails.project_name}</td>
//               </tr>
//               <tr>
//                 <td style={{ fontWeight: "bold", padding: "5px" }}>Request ID:</td>
//                 <td>{selectedProjectDetails.request_id}</td>
//               </tr>
//               <tr>
//                 <td style={{ fontWeight: "bold", padding: "5px" }}>Requester Name:</td>
//                 <td>{selectedProjectDetails.requester_name}</td>
//               </tr>
//               <tr>
//                 <td style={{ fontWeight: "bold", padding: "5px" }}>BOM ID:</td>
//                 <td>{selectedProjectDetails.bom_id}</td>
//               </tr>
//               <tr>
//                 <td style={{ fontWeight: "bold", padding: "5px" }}>BOM Name:</td>
//                 <td>{selectedProjectDetails.bom_name}</td>
//               </tr>
//               <tr>
//                 <td style={{ fontWeight: "bold", padding: "5px" }}>PO ID:</td>
//                 <td>{selectedProjectDetails.PO_id}</td>
//               </tr>
//               <tr>
//                 <td style={{ fontWeight: "bold", padding: "5px" }}>Cart ID:</td>
//                 <td>{selectedProjectDetails.cart_id}</td>
//               </tr>
//             </tbody>
//           </table>
//         </div>
//       )}

//       <div style={{ textAlign: "left" }}>
//         <button
//           onClick={() => setShowAddForm(!showAddForm)}
//           style={{
//             border: "1px solid #ccc",
//             padding: "10px 20px",
//             borderRadius: "5px",
//             cursor: "pointer",
//           }}
//         >
//           {showAddForm ? "Cancel" : "Add Project"}
//         </button>
//       </div>

//       {showAddForm && (
//         <form
//           onSubmit={handleAddProject}
//           style={{
//             marginTop: "20px",
//             padding: "10px",
//             border: "1px solid #ddd",
//             borderRadius: "5px",
//             backgroundColor: "#f9f9f9",
//             maxWidth: "800px",
//             margin: "20px auto",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//           }}
//         >
//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               marginRight: "10px",
//             }}
//           >
//             <label style={{ marginRight: "5px" }}>Project Name:</label>
//             <input
//               type="text"
//               name="project_name"
//               value={newProject.project_name}
//               onChange={handleInputChange}
//               required
//               style={{
//                 padding: "10px",
//                 borderRadius: "4px",
//                 border: "1px solid #ccc",
//               }}
//             />
//           </div>
//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               marginRight: "10px",
//             }}
//           >
//             <label style={{ marginRight: "5px" }}>Description:</label>
//             <input
//               type="text"
//               name="description"
//               value={newProject.description}
//               onChange={handleInputChange}
//               required
//               style={{
//                 padding: "10px",
//                 borderRadius: "4px",
//                 border: "1px solid #ccc",
//               }}
//             />
//           </div>
//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               marginRight: "10px",
//             }}
//           >
//             <label style={{ marginRight: "5px" }}>Start Date:</label>
//             <input
//               type="date"
//               name="start_date"
//               value={newProject.start_date}
//               onChange={handleInputChange}
//               required
//               style={{
//                 padding: "10px",
//                 borderRadius: "4px",
//                 border: "1px solid #ccc",
//               }}
//             />
//           </div>
//           <button
//             type="submit"
//             style={{
//               border: "1px solid #ccc",
//               padding: "10px 20px",
//               borderRadius: "5px",
//               cursor: "pointer",
//             }}
//           >
//             Add Project
//           </button>
//         </form>
//       )}
//     </div>
//   );
// };

// export default Project;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import config from "../Config"; // API Configuration
import AddIcon from "../assets/Add.png";
import CancelIcon from "../assets/cancel.png";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ProjectList = () => {
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
  const [showScrollTop, setShowScrollTop] = useState(false); // Track visibility of scroll-to-top button

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
      behavior: "smooth", // Smooth scroll effect
    });
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/project/`);
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
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
      } else {
        console.error("Failed to add project.");
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
        <button
          style={{
            cursor: "pointer",
            marginLeft: "auto",
            marginRight: 20,
            background: "transparent",
            border: "none",
          }}
          title={showAddForm ? "Cancel" : "Add Project"}
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <img
            src={showAddForm ? CancelIcon : AddIcon}
            alt={showAddForm ? "Cancel" : "Add Project"}
            style={{ width: "20px", height: "20px" }}
          />{" "}
        </button>
        {/* <button
        onClick={() => setShowAddForm(!showAddForm)}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "4px",
          marginTop: "10px",
        }}
        title={showAddForm ? "Cancel" : "Add Project"}
      >
        <img
          src={showAddForm ? CancelIcon : AddIcon}
          alt={showAddForm ? "Cancel" : "Add Project"}
          style={{ width: "20px", height: "20px" }}
        />
      </button> */}
      </div>

      {showAddForm && (
        <div className="add-project-container">
          {/* Add Project Form */}
          <form onSubmit={handleAddProject} className="add-project-form">
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

            <input
              type="text"
              name="project_name"
              value={newProject.project_name}
              onChange={handleInputChange}
              required
              placeholder="Project Name"
            />
            <input
              type="text"
              name="description"
              value={newProject.description}
              onChange={handleInputChange}
              required
              placeholder="Description"
            />
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
                    target: { name: "start_date", value: date },
                  })
                }
                dateFormat="dd-MMM-yyyy"
                placeholderText="dd-mm-yyyy"
                className="input1"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                popperModifiers={[
                  {
                    name: "preventOverflow",
                    options: {
                      mainAxis: false, // allow dropdown to overflow if needed
                    },
                  },
                  {
                    name: "offset",
                    options: {
                      offset: [0, 8], // horizontal offset, vertical offset
                    },
                  },
                ]}
                required
              />
                            <i className="fas fa-calendar-alt calendar-icon"></i>{" "}

              </div>
            <div className="form-buttons">
              <button type="submit" className="add-button">
                Add Project
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-container">
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
            {projects.length > 0 ? (
              projects.map((project) => (
                <tr
                  key={project.project_id}
                  style={{ borderBottom: "1px solid #ddd" }}
                >
                  <td
                    onClick={() => navigate(`/projects/${project.project_id}`)}
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
                  <td style={{ padding: "10px" }}>{project.start_date}</td>
                  <td style={{ padding: "10px" }}>{project.project_type}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  style={{ padding: "10px", textAlign: "center" }}
                >
                  No projects available
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
