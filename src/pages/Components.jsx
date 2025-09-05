import React, { useState, useEffect, useRef } from "react";
import config from "../Config";
import "../App.css";
import { Link, useNavigate } from "react-router-dom";
import Tags from "../assets/tags.png";

import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  ToastContainerComponent,
} from "./Toastify.jsx";
import { useAuth } from "../AuthContext.jsx";

const Component = () => {
  const [components, setComponents] = useState([]);
  const [tags, setTags] = useState([]);
  const { user, logout } = useAuth();
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [newTag, setNewTag] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [testTags, setTestTags] = useState([]);

  // paging / loading
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false); // first page spinner
  const [isLoadingMore, setIsLoadingMore] = useState(false); // bottom spinner
  const [hasMore, setHasMore] = useState(true);

  // scroll UI
  const [showScrollTop, setShowScrollTop] = useState(false);

  // filters
  const [selectedComponentType, setSelectedComponentType] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [tagsChoices, setTagsChoices] = useState("");
  const [selectedSpecification, setSelectedSpecification] = useState("");

  // tally editor
  const [editTallyRefId, setEditTallyRefId] = useState(null);
  const [editedTallyRef, setEditedTallyRef] = useState("");

  // sorting
  const [sortField, setSortField] = useState();
  const [sortOrder, setSortOrder] = useState("asc");

  // dropdowns
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [componentTypeDropdownOpen, setComponentTypeDropdownOpen] =
    useState(false);
  const [tagTypeDropdownOpen, setTagTypeDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);
  const componentTypeDropdownRef = useRef(null);
  const tagTypeDropdownRef = useRef(null);

  const navigate = useNavigate();

  // -------------------------------------------------
  // initial auxiliary data
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch(`${config.apiBaseURL}/tags/`);
        const data = await response.json();
        setTags(data);
      } catch (e) {
        console.error("Error fetching tags:", e);
      }
    };
    const fetchTestTags = async () => {
      try {
        const response = await fetch(`${config.apiBaseURL}/test_tags/`);
        const data = await response.json();
        setTestTags(data);
      } catch (e) {
        console.error("Error fetching test_tags:", e);
      }
    };
    const fetchAvailableTags = async () => {
      try {
        const response = await fetch(`${config.apiBaseURL}/create_tag/`);
        const data = await response.json();
        setAvailableTags(data);
      } catch (e) {
        console.error("Error fetching available tags:", e);
      }
    };
    fetchTags();
    fetchTestTags();
    fetchAvailableTags();
  }, []);

  // -------------------------------------------------
  // dropdown click-outside close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (
        componentTypeDropdownRef.current &&
        !componentTypeDropdownRef.current.contains(event.target)
      ) {
        setComponentTypeDropdownOpen(false);
      }
      if (
        tagTypeDropdownRef.current &&
        !tagTypeDropdownRef.current.contains(event.target)
      ) {
        setTagTypeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // -------------------------------------------------
  // helpers for dropdown source lists
  const getFilteredComponentTypes = () => {
    const filtered = testTags.filter((tag) => {
      const matchesCategory =
        !selectedCategory || tag.component_id.category === selectedCategory;
      const matchesTags = !tagsChoices || tag.tags.includes(tagsChoices);
      const matchesSpecification =
        !selectedSpecification ||
        tag.component_id.component_specification
          ?.toLowerCase()
          .includes(selectedSpecification.toLowerCase());
      return matchesCategory && matchesTags && matchesSpecification;
    });
    return [...new Set(filtered.map((t) => t.component_id.component_type))];
  };

  const getFilteredCategories = () => {
    const filtered = testTags.filter((tag) => {
      const matchesComponentType =
        !selectedComponentType ||
        tag.component_id.component_type === selectedComponentType;
      const matchesTags = !tagsChoices || tag.tags.includes(tagsChoices);
      const matchesSpecification =
        !selectedSpecification ||
        tag.component_id.component_specification
          ?.toLowerCase()
          .includes(selectedSpecification.toLowerCase());
      return matchesComponentType && matchesTags && matchesSpecification;
    });
    return [...new Set(filtered.map((t) => t.component_id.category))];
  };

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
          ?.toLowerCase()
          .includes(selectedSpecification.toLowerCase());
      return matchesComponentType && matchesCategory && matchesSpecification;
    });
    return [...new Set(filtered.flatMap((t) => t.tags))];
  };

  // -------------------------------------------------
  // build URL with filters
  const buildPageURL = (page) => {
    const url = new URL(`${config.apiBaseURL}/tag_search/`);
    url.searchParams.append("page", page);
    if (selectedSpecification)
      url.searchParams.append("search", selectedSpecification);
    if (selectedCategory) url.searchParams.append("category", selectedCategory);
    if (selectedComponentType)
      url.searchParams.append("component_type", selectedComponentType);
    if (tagsChoices) url.searchParams.append("tags_choices__tags", tagsChoices);
    return url.toString();
  };

  // avoid parallel fetches
  const inFlightRef = useRef(false);

  const fetchPage = async (page, isFirst = false) => {
    if (inFlightRef.current) return;
    if (!hasMore && !isFirst) return;

    try {
      inFlightRef.current = true;
      if (isFirst) setLoading(true);
      else setIsLoadingMore(true);

      const res = await fetch(buildPageURL(page));
      const data = await res.json();
      const pageResults = Array.isArray(data?.results) ? data.results : [];

      // merge and dedupe by component id
      setComponents((prev) => {
        const merged = [...prev, ...pageResults];
        const seen = new Set();
        return merged.filter((item) => {
          const cid =
            item?.component_id?.component_id ??
            item?.component_id ??
            item?.id ??
            JSON.stringify(item);
          if (seen.has(cid)) return false;
          seen.add(cid);
          return true;
        });
      });

      if (data?.next) {
        setCurrentPage(page + 1);
        setHasMore(true);
      } else {
        setHasMore(false);
      }
    } catch (e) {
      console.error("Failed to fetch page", e);
      showErrorToast("Failed to load components.");
    } finally {
      inFlightRef.current = false;
      if (isFirst) setLoading(false);
      else setIsLoadingMore(false);
    }
  };

  // reset & load first page when filters change
  useEffect(() => {
    setComponents([]);
    setCurrentPage(1);
    setHasMore(true);
    fetchPage(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedSpecification,
    selectedCategory,
    selectedComponentType,
    tagsChoices,
  ]);

  // auto-fill: if the list isn't tall enough to scroll, fetch more pages
  useEffect(() => {
    const el = document.getElementById("component-table-wrapper");
    if (!el) return;
    const tryFill = async () => {
      // give DOM a tick to layout
      await new Promise((r) => setTimeout(r, 50));
      while (
        el.scrollHeight <= el.clientHeight &&
        hasMore &&
        !loading &&
        !isLoadingMore &&
        !inFlightRef.current
      ) {
        await fetchPage(currentPage);
        await new Promise((r) => setTimeout(r, 50));
      }
    };
    tryFill();
    // rerun when list grows or paging state changes
  }, [components.length, hasMore, loading, isLoadingMore, currentPage]);

  // -------------------------------------------------
  // sort
  const handleSort = (field) => {
    if (field === sortField) {
      setSortOrder((p) => (p === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedComponents = React.useMemo(() => {
    const data = [...components];
    if (!sortField) return data;

    const getValue = (item, field) => {
      const component = item.component_id || {};
      if (field === "component_id") {
        const match = component.component_id?.match?.(/(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      }
      return (component[field] || "").toString().toLowerCase();
    };

    data.sort((a, b) => {
      const av = getValue(a, sortField);
      const bv = getValue(b, sortField);
      if (av < bv) return sortOrder === "asc" ? -1 : 1;
      if (av > bv) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return data;
  }, [components, sortField, sortOrder]);

  // -------------------------------------------------
  // tags per row
  const getTagsForComponent = (componentId) => {
    return tags.filter((t) => t.component_id === componentId);
  };

  const handleAddTagClick = (componentId) => {
    setSelectedComponent(componentId);
    setNewTag("");
  };

  const handleAddTag = async () => {
    if (!newTag) return;

    const selectedCompTags = tags
      .filter((t) => t.component_id === selectedComponent)
      .map((t) => t.tags);
    if (selectedCompTags.includes(newTag)) {
      showWarningToast("Tag already added to this component.");
      return;
    }

    const selectedTag = availableTags.find((t) => t.tags === newTag);
    if (!selectedTag) {
      showErrorToast("Invalid tag selection.");
      return;
    }

    const payload = {
      component_id: selectedComponent,
      tags_choices: selectedTag.id,
      tags: selectedTag.tags,
    };

    try {
      const response = await fetch(`${config.apiBaseURL}/tags/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const newTagEntry = await response.json();

        setTags((prev) => [
          ...prev,
          {
            id: newTagEntry.id,
            tags: selectedTag.tags,
            component_id: selectedComponent,
          },
        ]);

        setTestTags((prev) => [
          ...prev,
          {
            id: newTagEntry.id,
            tags: [selectedTag.tags],
            component_id: {
              component_type:
                components.find(
                  (c) =>
                    (c.component_id?.component_id || c.component_id) ===
                    selectedComponent
                )?.component_id?.component_type || "",
              category:
                components.find(
                  (c) =>
                    (c.component_id?.component_id || c.component_id) ===
                    selectedComponent
                )?.component_id?.category || "",
              component_specification:
                components.find(
                  (c) =>
                    (c.component_id?.component_id || c.component_id) ===
                    selectedComponent
                )?.component_id?.component_specification || "",
            },
          },
        ]);

        setNewTag("");
        setSelectedComponent(null);
      } else {
        showErrorToast("Failed to add tag.");
      }
    } catch (error) {
      console.error("Error adding tag:", error);
      showErrorToast("An error occurred while adding the tag.");
    }
  };

  const deleteTag = async (tagId, componentId) => {
    try {
      const response = await fetch(`${config.apiBaseURL}/tags/${tagId}/`, {
        method: "DELETE",
      });

      if (response.ok) {
        const deletedTag = tags.find((t) => t.id === tagId)?.tags;
        setTags((prevTags) => prevTags.filter((t) => t.id !== tagId));

        setTestTags((prev) =>
          prev.filter(
            (t) =>
              !(
                t.tags.includes(deletedTag) &&
                t.component_id.component_id === componentId
              )
          )
        );

        showSuccessToast("Tag deleted successfully!");
      } else {
        console.error("Failed to delete the tag:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting the tag:", error);
    }
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
      const response = await fetch(
        `${config.apiBaseURL}/component/${componentId}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        showSuccessToast("Tally Reference updated!");
        setEditTallyRefId(null);

        setComponents((prev) =>
          prev.map((item) =>
            (item.component_id?.component_id || item.component_id) ===
            componentId
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

  // -------------------------------------------------
  // dropdown positions (kept from your code)
  const [dropdownCoords, setDropdownCoords] = useState({ top: 0, left: 0 });
  const [componentdropdownCoords, setCompoentDropdownCoords] = useState({
    top: 0,
    left: 0,
  });
  const [tagdropdownCoords, setTagDropdownCoords] = useState({
    top: 0,
    left: 0,
  });

  useEffect(() => {
    if (dropdownOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      setDropdownCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
    }
  }, [dropdownOpen]);

  useEffect(() => {
    if (componentTypeDropdownOpen && componentTypeDropdownRef.current) {
      const rect = componentTypeDropdownRef.current.getBoundingClientRect();
      setCompoentDropdownCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
    }
  }, [componentTypeDropdownOpen]);

  useEffect(() => {
    if (tagTypeDropdownOpen && tagTypeDropdownRef.current) {
      const rect = tagTypeDropdownRef.current.getBoundingClientRect();
      setTagDropdownCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
    }
  }, [tagTypeDropdownOpen]);

  // -------------------------------------------------
  // render
  const onScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    setShowScrollTop(scrollTop > 200);

    const nearBottom = scrollTop + clientHeight >= scrollHeight - 10;
    if (
      nearBottom &&
      hasMore &&
      !loading &&
      !isLoadingMore &&
      !inFlightRef.current
    ) {
      fetchPage(currentPage);
    }
  };

  // State for button visibility

  useEffect(() => {
    const container = document.getElementById("component-table-wrapper");

    const handleScroll = () => {
      if (container.scrollTop > 200) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const scrollToTop = () => {
    const container = document.getElementById("component-table-wrapper");
    if (container) {
      container.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div>
      <div className="header">
        <h2>Component List</h2>
        <div className="button-group">
          <button
            className="create-tag-button"
            onClick={() => setShowPopup(true)}
          >
            <img src={Tags} alt="icon" />
          </button>
          <button
            className="add-comp"
            onClick={() => navigate(`addcomponents/`)}
          >
            Add Component
          </button>
        </div>
      </div>

      <div className="center-wrapper">
        <div className="search-bar-container" style={{ width: "300px" }}>
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

      <div>
        <div
          id="component-table-wrapper"
          className="table-container"
          style={{ overflowY: loading ? "hidden" : "auto" }}
          onScroll={onScroll}
        >
          <table>
            <thead>
              <tr>
                <th
                  style={{ textDecoration: "underline", cursor: "pointer" }}
                  onClick={() => handleSort("component_id")}
                >
                  Component ID{" "}
                  {sortField === "component_id"
                    ? sortOrder === "asc"
                      ? "🔼"
                      : "🔽"
                    : ""}
                </th>

                <th className="category-dropdown-wrapper" ref={dropdownRef}>
                  <div
                    className="category-dropdown"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    {!selectedCategory ? "Category" : selectedCategory}
                  </div>

                  {dropdownOpen && (
                    <div
                      className="category-dropdown-options"
                      style={{
                        position: "fixed",
                        top: dropdownCoords.top,
                        left: dropdownCoords.left,
                        zIndex: 9999,
                        width: "150px",
                        marginLeft: "20px",
                        marginTop: "4px",
                      }}
                    >
                      <div
                        className="category-dropdown-option"
                        onClick={() => setSelectedCategory("")}
                        style={{ padding: "6px 12px", cursor: "pointer" }}
                      >
                        All
                      </div>

                      {getFilteredCategories().map((category) => (
                        <div
                          key={category}
                          className="category-dropdown-option"
                          onClick={() => setSelectedCategory(category)}
                          style={{ padding: "6px 12px", cursor: "pointer" }}
                        >
                          {category}
                        </div>
                      ))}
                    </div>
                  )}
                </th>

                <th
                  className="component-type-dropdown-wrapper"
                  ref={componentTypeDropdownRef}
                >
                  <div
                    className="component-dropdown"
                    onClick={() =>
                      setComponentTypeDropdownOpen(!componentTypeDropdownOpen)
                    }
                  >
                    {!selectedComponentType
                      ? "Component Type"
                      : selectedComponentType}
                  </div>

                  {componentTypeDropdownOpen && (
                    <div
                      className="component-dropdown-options"
                      style={{
                        position: "fixed",
                        top: componentdropdownCoords.top,
                        left: componentdropdownCoords.left,
                        zIndex: 9999,
                        marginLeft: "20px",
                        marginTop: "4px",
                      }}
                    >
                      <div
                        className="component-dropdown-option"
                        onClick={() => setSelectedComponentType("")}
                        style={{ padding: "6px 12px", cursor: "pointer" }}
                      >
                        All
                      </div>

                      {getFilteredComponentTypes().map((type) => (
                        <div
                          key={type}
                          className="component-dropdown-option"
                          onClick={() => setSelectedComponentType(type)}
                          style={{ padding: "6px 12px", cursor: "pointer" }}
                        >
                          {type}
                        </div>
                      ))}
                    </div>
                  )}
                </th>

                <th
                  style={{ textDecoration: "underline", cursor: "pointer" }}
                  onClick={() => handleSort("component_specification")}
                >
                  Specification{" "}
                  {sortField === "component_specification"
                    ? sortOrder === "asc"
                      ? "🔼"
                      : "🔽"
                    : ""}
                </th>

                {user?.role !== "User" && <th>Tally Reference</th>}
                <th>UOM</th>

                <th
                  className="tags-dropdown-wrapper"
                  style={{ position: "relative" }}
                  ref={tagTypeDropdownRef}
                >
                  <div
                    className="tags-dropdown"
                    onClick={() => setTagTypeDropdownOpen(!tagTypeDropdownOpen)}
                    style={{ cursor: "pointer", userSelect: "none" }}
                  >
                    {tagsChoices || "Tags"}
                  </div>

                  {tagTypeDropdownOpen && (
                    <div
                      className="tags-dropdown-options"
                      style={{
                        position: "fixed",
                        top: tagdropdownCoords.top,
                        left: tagdropdownCoords.left,
                        zIndex: 9999,
                        width: "150px",
                      }}
                    >
                      <div
                        className="tags-dropdown-option"
                        onClick={() => {
                          setTagsChoices("");
                          setTagTypeDropdownOpen(false);
                        }}
                      >
                        All
                      </div>
                      {getFilteredTags().map((tag) => (
                        <div
                          key={tag}
                          className="tags-dropdown-option"
                          onClick={() => {
                            setTagsChoices(tag);
                            setTagTypeDropdownOpen(false);
                          }}
                        >
                          {tag}
                        </div>
                      ))}
                    </div>
                  )}
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="8"
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    <div className="spinner"></div>
                    Loading components...
                  </td>
                </tr>
              ) : sortedComponents.length > 0 ? (
                sortedComponents.map((item, index) => {
                  const component = item.component_id || {};
                  // unique + stable key
                  const rowKey =
                    component.component_id || item.id || `row-${index}`;
                  return (
                    <tr key={rowKey}>
                      <td>
                        <Link
                          to={`/components/${component.component_id}`}
                          style={{ textDecoration: "line", color: "inherit" }}
                          state={{ component }}
                        >
                          {component.component_id}
                        </Link>
                      </td>
                      <td>{component.category}</td>
                      <td>{component.component_type}</td>
                      <td
                        className="specification-cell"
                        title={component.component_specification || ""}
                      >
                        {component.component_specification}
                      </td>
                      {user?.role !== "User" && (
                      <td>
                        {editTallyRefId === component.component_id ? (
                          <div className="tally-edit-container">
                            <input
                              type="text"
                              value={editedTallyRef}
                              onChange={(e) =>
                                setEditedTallyRef(e.target.value)
                              }
                              className="tally-input"
                            />
                            <div className="tally-actions">
                              <button
                                className="tally-button save-button"
                                onClick={() =>
                                  handleSaveTallyReference(
                                    component.component_id
                                  )
                                }
                              >
                                Save
                              </button>
                              <button
                                className="tally-button cancel-button"
                                onClick={() => setEditTallyRefId(null)}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <span
                            style={{ cursor: "pointer", color: "#007bff" }}
                            title="Click to edit"
                            onClick={() => {
                              setEditTallyRefId(component.component_id);
                              setEditedTallyRef(
                                component.tally_reference || ""
                              );
                            }}
                          >
                            {component.tally_reference || "Click to add"}
                          </span>
                        )}
                      </td>
                  )}
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
                            <span></span>
                          )}
                          <button
                            style={{
                              marginLeft: "8px",
                              background: "#e2dede",
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

                        {selectedComponent === component.component_id && (
                          <div className="add-tag-wrapper">
                            <select
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              className="tag-select"
                            >
                              <option value="">Select a tag</option>
                              {availableTags.map((tag) => (
                                <option key={tag.id} value={tag.tags}>
                                  {tag.tags}
                                </option>
                              ))}
                            </select>
                            <div className="tag-buttons">
                              <button
                                className="tag-button save-button"
                                onClick={handleAddTag}
                              >
                                Add Tag
                              </button>
                              <button
                                className="tag-button cancel-button"
                                onClick={() => setSelectedComponent(null)}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="8"
                    style={{
                      textAlign: "center",
                      color: "gray",
                      padding: "20px",
                    }}
                  >
                    No components found for the given search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {isLoadingMore && <div className="loading-message">Loading...</div>}
          {!hasMore && !loading && components.length > 0 && (
            <div className="no-message">No more data</div>
          )}
        </div>
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

      {showPopup && (
        <div className="modal-overlay" onClick={() => setShowPopup(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
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
              width: "300px",
              textAlign: "center",
            }}
            className="add-tag-popup"
          >
            <h3>Enter a Tag</h3>
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Enter tag name"
              style={{
                width: "100%",
                padding: "10px 20px",
                marginBottom: "10px",
                marginTop: "20px",
              }}
            />
            <div className="popup-actions">
              <button
                onClick={async () => {
                  if (!newTagName.trim()) {
                    showWarningToast("Please enter a valid tag name.");
                    return;
                  }
                  const existingTag = availableTags.find(
                    (tag) =>
                      tag.tags.toLowerCase() === newTagName.trim().toLowerCase()
                  );
                  if (existingTag) {
                    showInfoToast(`The tag "${newTagName}" already exists.`);
                    setNewTagName("");
                    return;
                  }
                  const payload = { tags: newTagName };
                  try {
                    const response = await fetch(
                      `${config.apiBaseURL}/create_tag/`,
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                      }
                    );
                    if (response.ok) {
                      showSuccessToast("Tag created successfully!");
                      const newTag = await response.json();
                      setAvailableTags([...availableTags, newTag]);
                      setNewTagName("");
                      setShowPopup(false);
                    } else {
                      showErrorToast("Failed to create tag.");
                    }
                  } catch (error) {
                    showErrorToast("An error occurred while creating the tag.");
                  }
                }}
              >
                Create
              </button>
              <button onClick={() => setShowPopup(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <ToastContainerComponent />
    </div>
  );
};

export default Component;
