// Second set of code
// src\pages\Components.jsx

import React, { useState, useEffect } from "react";
import config from "../config"; // Import config for API endpoints

const Component = () => {
  const [components, setComponents] = useState([]);
  const [tags, setTags] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // Stores the search term
  const [filteredComponents, setFilteredComponents] = useState([]); // Stores the filtered components based on search
  const [availableTags, setAvailableTags] = useState([]); // List of attributes for tags
  const [selectedComponent, setSelectedComponent] = useState(null); // Component being edited
  const [newTag, setNewTag] = useState(""); // New tag to add

  useEffect(() => {
    fetchComponents();
    fetchTags();
    fetchAvailableTags();
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

  const fetchAvailableTags = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/tags_list/");
      const data = await response.json();
      const processTags = (data) => {
        // Assuming `data` is the JSON object with `tags`
        return data.tags.map((tagPair) => tagPair[0]); // Extract the first element of each sub-array
      };
      const simplifiedTags = processTags(data);
      setAvailableTags(simplifiedTags); // Assume the API returns a list of tag attributes
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
    const componentTags = tags.filter(
      (tag) => tag.component_id === componentId
    );
    // return componentTags.map((tag) => tag.tags); //
    return componentTags; //
  };

  const handleAddTagClick = (componentId) => {
    setSelectedComponent(componentId); // Set the component ID for which tags will be added
  };

  const handleAddTag = async () => {
    if (!newTag) return;

    // Check if the tag already exists for the selected component
    const existingTags = getTagsForComponent(selectedComponent);
    const isDuplicate = existingTags.some((tag) => tag.tags === newTag);

    if (isDuplicate) {
      alert("This tag already exists for the selected component.");
      return;
    }

    const payload = {
      component_id: selectedComponent,
      tags: newTag,
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
        setTags([...tags, newTagEntry]); // Add the new tag to the list
        setNewTag(""); // Clear the input field
        setSelectedComponent(null); // Close the dropdown/modal
      } else {
        console.error("Failed to add tag:", response.statusText);
      }
    } catch (error) {
      console.error("Error adding tag:", error);
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
    if (!searchTerm.trim()) {
      // If no search term, show all components
      setFilteredComponents(components);
      return;
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    const filtered = components.filter((component) => {
      const componentTags = getTagsForComponent(component.component_id);
      return componentTags.some((tag) =>
        tag.tags.toLowerCase().includes(lowerCaseSearchTerm)
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
                        {availableTags.map((tag, index) => (
                          <option key={index} value={tag}>
                            {tag}
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
    </div>
  );
};

export default Component;
