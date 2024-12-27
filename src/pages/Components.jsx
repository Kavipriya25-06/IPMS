// Second set of code
// src\pages\Components.jsx

import React, { useState, useEffect } from "react";
import config from "../config"; // Import config for API endpoints

const Component = () => {
  const [components, setComponents] = useState([]);
  const [tags, setTags] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // Stores the search term
  const [filteredComponents, setFilteredComponents] = useState([]); // Stores the filtered components based on search

  useEffect(() => {
    fetchComponents();
    fetchTags();
  }, []);

  useEffect(() => {
    filterComponentsBySearch();
  }, [searchTerm, components, tags]);

  const fetchTags = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/tags/");
      const data = await response.json();
      setTags(data);
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  const fetchComponents = () => {
    fetch(`${config.apiBaseURL}${config.endpoints.component}`)
      .then((response) => response.json())
      .then((data) => setComponents(data))
      .catch((error) => console.error("Error fetching components:", error));
  };

  // Helper function to get tags for a component
  const getTagsForComponent = (componentId) => {
    const componentTags = tags.filter(
      (tag) => tag.component_id === componentId
    );
    return componentTags.map((tag) => tag.tags); //
  };

  const filterComponentsBySearch = () => {
    if (!searchTerm.trim()) {
      // If no search term, show all components
      setFilteredComponents(components);
      return;
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    const filtered = components.filter((component) => {
      const componentTags = getTagsForComponent(component.component_id);
      return componentTags.some((tag) =>
        tag.toLowerCase().includes(lowerCaseSearchTerm)
      );
    });

    setFilteredComponents(filtered);
  };

  return (
    <div>
      <div style={{ alignItems: "center" }}>
        <div>
          <h2>Component List</h2>
        </div>
        {/* Search Bar */}
        <div style={{ marginBottom: "20px" }}>
          <input
            type="text"
            placeholder="Search by tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: "8px",
              width: "300px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Component Type</th>
            <th>Specification</th>
            <th>UOM</th>
            <th>Category</th>
            <th>Component ID</th>
            <th>Tags</th>
          </tr>
        </thead>
        <tbody>
          {filteredComponents.length > 0 ? (
            filteredComponents.map((component) => (
              <tr key={component.component_id}>
                <td>{component.component_type}</td>
                <td>{component.component_specification}</td>
                <td>{component.unit_of_measurement}</td>
                <td>{component.category}</td>
                <td>{component.component_id}</td>
                <td>
                  {getTagsForComponent(component.component_id).length > 0 ? (
                    getTagsForComponent(component.component_id).map(
                      (tag, index) => (
                        <span key={index} className="tag">
                          {tag}
                        </span>
                      )
                    )
                  ) : (
                    <span>No tags available</span>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                No components found for the given search.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Component;
