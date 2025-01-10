// Second set of code
// src\pages\Components.jsx

import React, { useState, useEffect } from "react";
import tagIcon from "../assets/Tag_icon.png";
import config from "../config"; // Import config for API endpoints
import "../App.css";

import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  ToastContainerComponent,
} from "./Toastify.jsx"; // Import Toastify utilities

const Component = () => {
  const [components, setComponents] = useState([]);
  const [tags, setTags] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // Stores the search term
  const [filteredComponents, setFilteredComponents] = useState([]); // Stores the filtered components based on search
  const [availableTags, setAvailableTags] = useState([]); // List of attributes for tags
  const [selectedComponent, setSelectedComponent] = useState(null); // Component being edited
  const [newTag, setNewTag] = useState(""); // New tag to add
  const [newTagName, setNewTagName] = useState(""); // Add this state for the pop-up input value
  const [showPopup, setShowPopup] = useState(false);

  const [selectedComponentType, setSelectedComponentType] = useState(""); // For filtering by Component Type
  const [selectedCategory, setSelectedCategory] = useState(""); // For filtering by Category
  
  // Function to get unique component types based on the selected category
  const getFilteredComponentTypes = () => {
    const filtered = selectedCategory
      ? components.filter((c) => c.category === selectedCategory)
      : components;
    return [...new Set(filtered.map((c) => c.component_type))];
  };
  
  // Function to get unique categories based on the selected component type
  const getFilteredCategories = () => {
    const filtered = selectedComponentType
      ? components.filter((c) => c.component_type === selectedComponentType)
      : components;
    return [...new Set(filtered.map((c) => c.category))];
  };

  useEffect(() => {
    fetchComponents();
    fetchTags();
    fetchAvailableTags();
  }, []);

  useEffect(() => {
    filterComponentsBySearch();
  }, [searchTerm, components, tags, selectedComponentType, selectedCategory]);

  const fetchTags = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/tags/");
      const data = await response.json();
      setTags(data);
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  const fetchAvailableTags = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/create_tag/");
      const data = await response.json();
      setAvailableTags(data); // Directly set the list of tags from the API
    } catch (error) {
      console.error("Error fetching available tags:", error);
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
    return tags.filter((tag) => tag.component_id === componentId);
  };

  const handleAddTagClick = (componentId) => {
    setSelectedComponent(componentId); // Set the component ID for which tags will be added
    setNewTag(""); // Clear the new tag input when opening the dropdown
  };

  const handleAddTag = async () => {
    if (!newTag) return;

    // Find the selected tag object from availableTags
    const selectedTag = availableTags.find((tag) => tag.tags === newTag);
    if (!selectedTag) {
      alert("Invalid tag selection.");
      return;
    }

    const payload = {
      component_id: selectedComponent,
      tags_choices: selectedTag.id, // Send the tag ID
      tags: selectedTag.tags, // Send the tag name
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/tags/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const newTagEntry = await response.json();
        setTags([
          ...tags,
          {
            id: newTagEntry.id,
            tags: selectedTag.tags,
            component_id: selectedComponent,
          },
        ]);
        setNewTag(""); // Clear the input field
        setSelectedComponent(null); // Close the dropdown/modal
      } else {
        console.error("Failed to add tag:", response.statusText);
        alert("Failed to add tag.");
      }
    } catch (error) {
      console.error("Error adding tag:", error);
      alert("An error occurred while adding the tag.");
    }
  };

  const deleteTag = async (tagId, componentId) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/tags/${tagId}/`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Update the tags state after deletion
        setTags(
          (prevTags) => prevTags.filter((tag) => tag.id !== tagId) // Remove the deleted tag from the state
        );
      } else {
        console.error("Failed to delete the tag:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting the tag:", error);
    }
  };

  const filterComponentsBySearch = () => {
    let filtered = components;

    if (searchTerm.trim()) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter((component) => {
        const componentTags = getTagsForComponent(component.component_id);
        return componentTags.some((tag) =>
          tag.tags.toLowerCase().includes(lowerCaseSearchTerm)
        );
      });
    }

    if (selectedComponentType) {
      filtered = filtered.filter(
        (component) => component.component_type === selectedComponentType
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(
        (component) => component.category === selectedCategory
      );
    }

    setFilteredComponents(filtered);
  };

  const handleTagIconClick = () => {
    setShowPopup(true); // Show the pop-up when the tag image is clicked
  };

  const handlePopupClose = () => {
    setShowPopup(false); // Close the pop-up when clicking outside
  };

  return (
    <div>
      <div className="header">
        <h2>Component List</h2>
        <img
          src={tagIcon}
          alt="Tag Icon"
          title="Add tags"
          style={{
            width: "39px",
            height: "39px",
            cursor: "pointer",
            marginLeft: "auto",
          }}
          onClick={handleTagIconClick}
        />
        <div className="search-bar-container">
          <input
            type="text"
            className="search-bar"
            placeholder="Search by tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">
            <i className="fa fa-search" aria-hidden="true"></i>
          </span>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>
              Component Type
              <select
                value={selectedComponentType}
                onChange={(e) => setSelectedComponentType(e.target.value)}
              >
                <option value="">All</option>
                {getFilteredComponentTypes().map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </th>
            <th>Specification</th>
            <th>UOM</th>
            <th>
              Category
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All</option>
                {getFilteredCategories().map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </th>
            <th>Component ID </th>
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
                  <div>
                    {getTagsForComponent(component.component_id).length > 0 ? (
                      getTagsForComponent(component.component_id).map((tag) => (
                        <span key={tag.id} className="tag">
                          {tag.tags}
                          <button
                            onClick={() =>
                              deleteTag(tag.id, component.component_id)
                            }
                          >
                            ×
                          </button>
                        </span>
                      ))
                    ) : (
                      <span>No tags available</span>
                    )}
                    <button
                      style={{
                        marginLeft: "8px",
                        background: "e2dede",
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        border: "none",
                        cursor: "pointer",
                        color: "blue",
                        fontSize: "16px",
                      }}
                      onClick={() => handleAddTagClick(component.component_id)}
                    >
                      +
                    </button>
                  </div>
                  {/* Add Tag Dropdown/Modal */}
                  {selectedComponent === component.component_id && (
                    <div style={{ marginTop: "8px" }}>
                      <select
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                      >
                        <option value="">Select a tag</option>
                        {availableTags.map((tag) => (
                          <option key={tag.id} value={tag.tags}>
                            {tag.tags}
                          </option>
                        ))}
                      </select>
                      <button onClick={handleAddTag}>Add Tag</button>
                      <button onClick={() => setSelectedComponent(null)}>
                        Cancel
                      </button>
                    </div>
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

      {/* Pop-up for entering a tag */}
      {showPopup && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "#fff",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            zIndex: 1000,
          }}
        >
          <h3>Enter a Tag</h3>
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Enter tag name"
            style={{ width: "100%", padding: "2px", marginTop: "10px" }}
          />
          <button
            onClick={async () => {
              if (!newTagName.trim()) {
                alert("Please enter a valid tag name.");
                return;
              }

              // Check if the tag already exists in availableTags
              const existingTag = availableTags.find(
                (tag) =>
                  tag.tags.toLowerCase() === newTagName.trim().toLowerCase()
              );

              if (existingTag) {
                alert(`The tag "${newTagName}" already exists.`);
                setNewTagName(""); // Clear the input field
                return;
              }

              const payload = {
                tags: newTagName,
              };

              try {
                const response = await fetch(
                  "http://127.0.0.1:8000/create_tag/",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                  }
                );

                if (response.ok) {
                  showSuccessToast("Tag created successfully!");
                  const newTag = await response.json();
                  setAvailableTags([...availableTags, newTag]); // Add the newly created tag to availableTags
                  setNewTagName(""); // Clear the input field
                } else {
                  console.error("Failed to create tag:", response.statusText);
                  alert("Failed to create tag.");
                }
              } catch (error) {
                console.error("Error creating tag:", error);
                alert("An error occurred while creating the tag.");
              }
            }}
            style={{
              marginTop: "10px",
              padding: "8px 12px",
              background: "#4caf50",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Create
          </button>
        </div>
      )}

      {/* Overlay for closing the pop-up */}
      {showPopup && (
        <div
          onClick={handlePopupClose}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0, 0, 0, 0.3)",
            zIndex: 999,
          }}
        />
      )}

      <ToastContainerComponent />
    </div>
  );
};

export default Component;
