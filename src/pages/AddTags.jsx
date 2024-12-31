// src/pages/AddTags.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import config from "../config"; // Adjust the config for API URLs
import "../App.css";
//import { float } from "html2canvas/dist/types/css/property-descriptors/float";
import html2canvas from "html2canvas";

const AddTags = () => {
  const [components, setComponents] = useState([]); // List of all components
  const [selectedComponent, setSelectedComponent] = useState(""); // Component ID selected by the user
  const [tag, setTag] = useState(""); // Tag entered by the user
  const [message, setMessage] = useState(""); // Feedback message for the user
  const [availableTags, setAvailableTags] = useState([]);

  // Fetch all components on component mount
  useEffect(() => {
    fetchComponents();
    fetchAvailableTags();
  }, []);

  const fetchAvailableTags = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/meta_tags/");
      const data = await response.json();
      setAvailableTags(data);
      console.log("Fetched tags ", data);
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  // Helper function to get tags for a component
  const getTagsForComponent = (componentId) => {
    const componentTags = availableTags.filter(
      (tag) => tag.component_id === componentId
    );
    // return componentTags.map((tag) => tag.tags); //
    return componentTags; //
  };

  const fetchComponents = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/component/");
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
    <div className="addingtags">
      <div>
        <h2>Available Meta tags</h2>
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
            {components.length > 0 ? (
              components.map((component) => (
                <tr key={component.component_id}>
                  <td>{component.component_type}</td>
                  <td>{component.component_specification}</td>
                  <td>{component.unit_of_measurement}</td>
                  <td>{component.category}</td>
                  <td>{component.component_id}</td>
                  <td>
                    {getTagsForComponent(component.component_id).length > 0 ? (
                      getTagsForComponent(component.component_id).map((tag) => (
                        <span key={tag.id} className="metatag">
                          {tag.tags}
                        </span>
                      ))
                    ) : (
                      <span>No tags available</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
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
              <option
                key={component.component_id}
                value={component.component_id}
              >
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
    </div>
  );
};

export default AddTags;
