// src/pages/AddTags.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import config from "../config"; // Adjust the config for API URLs
import "../App.css";

const AddTags = () => {
  const [components, setComponents] = useState([]); // List of all components
  const [selectedComponent, setSelectedComponent] = useState(""); // Component ID selected by the user
  const [tag, setTag] = useState(""); // Tag entered by the user
  const [message, setMessage] = useState(""); // Feedback message for the user

  // Fetch all components on component mount
  useEffect(() => {
    fetchComponents();
  }, []);

  const fetchComponents = async () => {
    try {
      const response = await fetch(
        `${config.apiBaseURL}${config.endpoints.component}`
      );
      const data = await response.json();
      setComponents(data);
      console.log("Fetched components", data);
    } catch (error) {
      console.error("Error fetching components:", error);
      setMessage("Failed to load components.");
    }
  };

  const handleAddTag = async () => {
    if (!selectedComponent || !tag) {
      setMessage("Please select a component and enter a tag.");
      return;
    }

    const payload = {
      component_id: selectedComponent,
      tags: tag,
    };

    try {
      const response = await fetch(`http://127.0.0.1:8000/meta_tags/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setMessage("Tag added successfully!");
        setTag(""); // Reset tag input
        setSelectedComponent(""); // Reset component selection
      } else {
        setMessage("Failed to add tag.");
      }
    } catch (error) {
      console.error("Error adding tag:", error);
      setMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className="assign-meta-tags-container">
      <h2>Assign Meta Tags</h2>
      <div className="form-group">
        <label htmlFor="component">Select Component:</label>
        <select
          id="component"
          value={selectedComponent}
          onChange={(e) => setSelectedComponent(e.target.value)}
        >
          <option value="">-- Select a Component --</option>
          {components.map((component) => (
            <option key={component.component_id} value={component.component_id}>
              {`${component.component_type} - ${component.component_specification}`}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="tag">Enter Tag:</label>
        <input
          id="tag"
          type="text"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          placeholder="Enter a metadata tag"
        />
      </div>
      <button className="add-tag-button" onClick={handleAddTag}>
        Add Tag
      </button>
      {message && <p className="feedback-message">{message}</p>}
    </div>
  );
};

export default AddTags;
