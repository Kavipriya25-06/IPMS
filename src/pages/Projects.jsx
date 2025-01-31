import React, { useState, useEffect } from "react";
import config from "../Config"; // Import config for API endpoints

const Project = () => {
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({
    project_name: "",
    description: "",
    start_date: "",
  });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

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
        setProjects([...projects, addedProject]);
        setNewProject({ project_name: "", description: "", start_date: "" }); // Reset form
        setShowAddForm(false); // Hide the form after adding
      } else {
        console.error("Failed to add project.");
      }
    } catch (error) {
      console.error("Error adding project:", error);
    }
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ textAlign: "left" }}>Project List</h2>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "20px",
        }}
      >
        <thead>
          <tr>
            <th>Project ID</th>
            <th>Project Name</th>
            <th>Description</th>
            <th>Start Date</th>
          </tr>
        </thead>
        <tbody>
          {projects.length > 0 ? (
            projects.map((project) => (
              <tr key={project.project_id}>
                <td>{project.project_id}</td>
                <td>{project.project_name}</td>
                <td>{project.description}</td>
                <td>{project.start_date}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="4"
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "center",
                }}
              >
                No projects available
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div style={{ textAlign: "left" }}>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            border: "1px solid #ccc",
            padding: "10px 20px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {showAddForm ? "Cancel" : "Add Project"}
        </button>
      </div>

      {showAddForm && (
        <form
          onSubmit={handleAddProject}
          style={{
            marginTop: "20px",
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "5px",
            backgroundColor: "#f9f9f9",
            maxWidth: "800px",
            margin: "20px auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginRight: "10px",
            }}
          >
            <label style={{ marginRight: "5px" }}>Project Name:</label>
            <input
              type="text"
              name="project_name"
              value={newProject.project_name}
              onChange={handleInputChange}
              required
              style={{
                padding: "10px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginRight: "10px",
            }}
          >
            <label style={{ marginRight: "5px" }}>Description:</label>
            <input
              type="text"
              name="description"
              value={newProject.description}
              onChange={handleInputChange}
              required
              style={{
                padding: "10px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginRight: "10px",
            }}
          >
            <label style={{ marginRight: "5px" }}>Start Date:</label>
            <input
              type="date"
              name="start_date"
              value={newProject.start_date}
              onChange={handleInputChange}
              required
              style={{
                padding: "10px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              border: "1px solid #ccc",
              padding: "10px 20px",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Add Project
          </button>
        </form>
      )}
    </div>
  );
};

export default Project;
