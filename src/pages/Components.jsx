// Third set of code
// do the development here
// src\pages\Components.jsx

import React, { useState, useEffect, useCallback, useRef } from "react";
import tagIcon from "../assets/Tag_icon.png";
import config from "../Config"; // Import config for API endpoints
import "../App.css";


import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  ToastContainerComponent,
} from "./Toastify.jsx"; // Import Toastify utilities

const debounce = (func, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

const Component = () => {
  const [components, setComponents] = useState([]);
  const [tags, setTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]); // List of attributes for tags
  const [selectedComponent, setSelectedComponent] = useState(null); // Component being edited
  const [newTag, setNewTag] = useState(""); // New tag to add
  const [newTagName, setNewTagName] = useState(""); // Add this state for the pop-up input value
  const [showPopup, setShowPopup] = useState(false);
  const [testTags, setTestTags] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [nextPageUrl, setNextPageUrl] = useState(null); // Initial API URL
  const [loading, setLoading] = useState(false); // Track loading state
  const [hasMore, setHasMore] = useState(true); // Track if more data is available
  const [showScrollTop, setShowScrollTop] = useState(false); // Track visibility of scroll-to-top button

  const [selectedComponentType, setSelectedComponentType] = useState(""); // For filtering by Component Type
  const [selectedCategory, setSelectedCategory] = useState(""); // For filtering by Category
  const [selectedTag, setSelectedTag] = useState(""); // Component specification selected for filtering

  const [tagsChoices, setTagsChoices] = useState(""); // Tags filter
  const [selectedSpecification, setSelectedSpecification] = useState("");
  const isInitialMount = useRef(true); // Track if it's the first render
  const [editTallyRefId, setEditTallyRefId] = useState(null); // which row is editing
  const [editedTallyRef, setEditedTallyRef] = useState(""); // input value

  const [sortField, setSortField] = useState();
  const [sortOrder, setSortOrder] = useState("asc");
  


  // Function to get unique component types based on the selected component type
  const getFilteredComponentTypes = () => {
    const filtered = testTags.filter((tag) => {
      const matchesCategory =
        !selectedCategory || tag.component_id.category === selectedCategory;
      const matchesTags = !tagsChoices || tag.tags.includes(tagsChoices);
      const matchesSpecification =
        !selectedSpecification ||
        tag.component_id.component_specification
          .toLowerCase()
          .includes(selectedSpecification.toLowerCase());

      return matchesCategory && matchesTags && matchesSpecification;
    });

    return [...new Set(filtered.map((tag) => tag.component_id.component_type))];
  };

  // Function to get unique categories based on the selected Category

  const getFilteredCategories = () => {
    const filtered = testTags.filter((tag) => {
      const matchesComponentType =
        !selectedComponentType ||
        tag.component_id.component_type === selectedComponentType;
      const matchesTags = !tagsChoices || tag.tags.includes(tagsChoices);
      const matchesSpecification =
        !selectedSpecification ||
        tag.component_id.component_specification
          .toLowerCase()
          .includes(selectedSpecification.toLowerCase());
      // console.log("Matches component type", matchesComponentType);
      return matchesComponentType && matchesTags && matchesSpecification;
    });
    // console.log("Filtered", filtered);
    return [...new Set(filtered.map((tag) => tag.component_id.category))];
  };

  // Function to get unique component types based on the selected tags

  const getFilteredTags = () => {
    const filtered = testTags.filter((tag) => {
      const matchesComponentType =
        !selectedComponentType ||
        tag.component_id.component_type === selectedComponentType;
      const matchesCategory =
        !selectedCategory || tag.component_id.category === selectedCategory;
      const matchesSpecification =
        !selectedSpecification ||
        tag.component_id.component_specification
          .toLowerCase()
          .includes(selectedSpecification.toLowerCase());

      return matchesComponentType && matchesCategory && matchesSpecification;
    });

    return [...new Set(filtered.flatMap((tag) => tag.tags))];
  };

  useEffect(() => {
    fetchTags();
    fetchTestTags();
    fetchAvailableTags();
  }, []);

  // Function to fetch data from the API
  const fetchComponents = async (isFiltering = false, resetPage = false) => {
    if ((!nextPageUrl && !isFiltering) || loading) {
      return;
    } // Stop if there's no next page or already loading

    try {
      setLoading(true);
      const pageParam = resetPage || isFiltering ? 1 : currentPage;

      // Construct the API URL with filters
      const url = new URL(`${config.apiBaseURL}/tag_search/`);
      url.searchParams.append("page", pageParam);
      if (selectedSpecification)
        url.searchParams.append("search", selectedSpecification);
      if (selectedCategory)
        url.searchParams.append("category", selectedCategory);
      if (selectedComponentType)
        url.searchParams.append("component_type", selectedComponentType);
      if (tagsChoices)
        url.searchParams.append("tags_choices__tags", tagsChoices);

      console.log("Fetching data from URL:", url.toString());
      const response = await fetch(url);
      const data = await response.json();
      console.log("API Response:", data);

      if (!data || !Array.isArray(data.results)) {
        console.error("Invalid API response structure:", data);
        setLoading(false);
        return;
      }

      setComponents((prevComponents) => {
        if (resetPage || isFiltering) {
          return data.results; // Replace results when filtering
        }
        const componentMap = new Map(
          prevComponents.map((c) => [c.component_id, c])
        );

        data.results.forEach((c) => {
          if (!componentMap.has(c.component_id)) {
            componentMap.set(c.component_id, c);
          }
        });

        return Array.from(componentMap.values());
      });
      // Update next page URL and hasMore
      // console.log("Next page URL:", data.next);
      setNextPageUrl(data.next); // Update next page URL
      setHasMore(data.next !== null); // Check if more data is available

      // Increment page only if not filtering
      if (!resetPage) {
        setCurrentPage((prevPage) => prevPage + 1);
      }
    } catch (error) {
      console.error("Error fetching components:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false; // Mark the first render as complete
      setNextPageUrl(`${config.apiBaseURL}/tag_search/?page=1`);
      // fetchComponents(false, true); // Reset and fetch initial data
      fetchComponents(true);
      // fetchComponents();
      return;
    }

    // Fetch components whenever filters change
    setComponents([]);
    setCurrentPage(1);
    setNextPageUrl(`${config.apiBaseURL}/tag_search/?page=1`);
    fetchComponents(true);
  }, [
    selectedSpecification,
    selectedCategory,
    selectedComponentType,
    tagsChoices,
  ]);

  // Infinite scroll handler
  const handleScroll = () => {
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 &&
      hasMore &&
      !loading
    ) {
      fetchComponents(); // Fetch next page when scrolled near bottom
    }

    // Show or hide scroll-to-top button
    if (window.scrollY > 300) {
      setShowScrollTop(true);
    } else {
      setShowScrollTop(false);
    }
  };

  // Wrap the scroll handler with debounce
  const debouncedHandleScroll = useCallback(debounce(handleScroll, 200), [
    hasMore,
    loading,
    nextPageUrl,
  ]);

  // Attach scroll event listener
  useEffect(() => {
    window.addEventListener("scroll", debouncedHandleScroll);
    return () => window.removeEventListener("scroll", debouncedHandleScroll); // Cleanup
  }, [debouncedHandleScroll]);

  // Scroll to top handler
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Smooth scroll effect
    });
  };

  const fetchTags = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/tags/`);
      const data = await response.json();
      setTags(data);
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  const fetchTestTags = async () => {
    try {
      // const response = await fetch(`${config.apiBaseURL}/tags/`);
      const response = await fetch(`${config.apiBaseURL}/test_tags/`);
      const data = await response.json();
      setTestTags(data);
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  const fetchAvailableTags = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/create_tag/`);
      const data = await response.json();
      setAvailableTags(data); // Directly set the list of tags from the API
    } catch (error) {
      console.error("Error fetching available tags:", error);
    }
  };

  // Helper function to get tags for a component
  const getTagsForComponent = (componentId) => {
    // return tags.filter((tag) => tag.component_id.component_id === componentId);
    return tags.filter((tag) => tag.component_id === componentId); // check here Suriya
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
      const response = await fetch(`${config.apiBaseURL}/tags/`, {
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
      const response = await fetch(`${config.apiBaseURL}/tags/${tagId}/`, {
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

  const handleTagIconClick = () => {
    setShowPopup(true); // Show the pop-up when the tag image is clicked
  };

  const handlePopupClose = () => {
    setShowPopup(false); // Close the pop-up when clicking outside
  };


  const handleSaveTallyReference = async (componentId) => {
    const target = components.find(
      (c) => (c.component_id?.component_id || c.component_id) === componentId
    );
  
    const payload = {
      ...target.component_id,
      tally_reference: editedTallyRef,
    };
  
    try {
      const response = await fetch(`${config.apiBaseURL}/component/${componentId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      if (response.ok) {
        showSuccessToast("Tally Reference updated!");
        setEditTallyRefId(null);
  
        // Update the components state locally
        setComponents((prev) =>
          prev.map((item) =>
            (item.component_id?.component_id || item.component_id) === componentId
              ? {
                  ...item,
                  component_id: {
                    ...item.component_id,
                    tally_reference: editedTallyRef,
                  },
                }
              : item
          )
        );
      } else {
        showErrorToast("Failed to update tally reference.");
      }
    } catch (error) {
      console.error("Error updating tally reference:", error);
      showErrorToast("Error while updating tally reference.");
    }
  };

  const handleSort = (field) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };
  
  // Corrected sorting logic
  const sortedComponents = [...components].sort((a, b) => {
    const getValue = (item, field) => {
      const component = item.component_id || {};
  
      if (field === "component_id") {
        const match = component.component_id.match(/(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      } else {
        return (component[field] || "").toLowerCase();
      }
    };
  
    const aValue = getValue(a, sortField);
    const bValue = getValue(b, sortField);
  
    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });
  

  return (
    <div>
      <div className="header">
        <h2>Component List</h2>
        <button
          style={{
            cursor: "pointer",
            marginLeft: "auto",
            marginRight: 20,
          }}
          onClick={handleTagIconClick}
        >
          Create Tag
        </button>
        {/* <img
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
        /> */}
        <div className="search-bar-container">
          <input
            type="text"
            className="search-bar"
            placeholder="Search by Spec..."
            value={selectedSpecification}
            onChange={(e) => setSelectedSpecification(e.target.value)}
          />
          <span className="search-icon">
            <i className="fa fa-search" aria-hidden="true"></i>
          </span>
        </div>
      </div>
      <table>
        <thead>
          <tr>
          <th
            style={{ textDecoration: "underline", cursor: "pointer" }}
            onClick={() => handleSort("component_id")}
          >
            Component ID {sortField === "component_id" ? (sortOrder === "asc" ? "🔼" : "🔽") : ""}
          </th>

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
            <th
              style={{ textDecoration: "underline", cursor: "pointer" }}
              onClick={() => handleSort("component_specification")}
            >
              Specification {sortField === "component_specification" ? (sortOrder === "asc" ? "🔼" : "🔽") : ""}
            </th>
            <th>Tally Reference</th>
            <th>UOM</th>
            
           
            <th>
              Tags
              <select
                value={tagsChoices}
                onChange={(e) => setTagsChoices(e.target.value)}
              >
                <option value="">All</option>
                {getFilteredTags().map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedComponents.length > 0 ? (
            sortedComponents.map((item, index) => {
              const component = item.component_id || {};
              return (
                <tr key={index}>
                  <td>{component.component_id}</td>
                  <td>{component.category}</td>
                  <td>{component.component_type}</td>
                  <td>{component.component_specification}</td>
                  <td>
                    {editTallyRefId === component.component_id ? (
                      <>
                        <input
                          type="text"
                          value={editedTallyRef}
                          onChange={(e) => setEditedTallyRef(e.target.value)}
                          style={{ width: "80px" }}
                        />
                        <button
                          style={{ marginLeft: "4px" }}
                          onClick={() => handleSaveTallyReference(component.component_id)}
                        >
                          Save
                        </button>
                        <button onClick={() => setEditTallyRefId(null)}>Cancel</button>
                      </>
                    ) : (
                      <span
                        style={{ cursor: "pointer", color: "#007bff" }}
                        title="Click to edit"
                        onClick={() => {
                          setEditTallyRefId(component.component_id);
                          setEditedTallyRef(component.tally_reference || "");
                        }}
                      >
                        {component.tally_reference || "Click to add"}
                      </span>
                    )}
                  </td>
                  <td>{component.unit_of_measurement}</td>
                  
                  <td>
                    <div>
                      {getTagsForComponent(component.component_id).length >
                      0 ? (
                        getTagsForComponent(component.component_id).map(
                          (tag) => (
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
                          )
                        )
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
                        onClick={() =>
                          handleAddTagClick(component.component_id)
                        }
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
              );
            })
          ) : (
            <tr>
              <td colSpan="8" style={{ textAlign: "center" }}>
                No components found for the given search.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {loading && <p>Loading...</p>}
      {!hasMore && <p>No more data available</p>}

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
                  `${config.apiBaseURL}/create_tag/`,
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
