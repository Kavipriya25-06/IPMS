import React, { useState, useEffect } from "react";

const Project = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/project/");
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  return (
    <div>
      <h2>Project List</h2>
      <table>
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
              <td colSpan="4">No projects available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Project;
