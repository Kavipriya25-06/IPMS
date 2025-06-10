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

const ComponentDetailsPage = () => {
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
  const [tagsDropdownOpen, setTagsDropdownOpen] = useState(false);

  const [tagsChoices, setTagsChoices] = useState(""); // Tags filter
  const [selectedSpecification, setSelectedSpecification] = useState("");
  const isInitialMount = useRef(true); // Track if it's the first render
  const [editTallyRefId, setEditTallyRefId] = useState(null); // which row is editing
  const [editedTallyRef, setEditedTallyRef] = useState(""); // input value

  const [sortField, setSortField] = useState();
  const [sortOrder, setSortOrder] = useState("asc");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [componentTypeDropdownOpen, setComponentTypeDropdownOpen] =
    React.useState(false);

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

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const componentTypeDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        componentTypeDropdownRef.current &&
        !componentTypeDropdownRef.current.contains(event.target)
      ) {
        setComponentTypeDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
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
      const response = await fetch(
        `${config.apiBaseURL}/component/${componentId}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        showSuccessToast("Tally Reference updated!");
        setEditTallyRefId(null);

        // Update the components state locally
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

  const imageList = [
    "https://gppro.in/wp-content/uploads/2022/10/Nikon-Z6-Mirrorless-Camera-with-24-70mm-Lens-3.jpg",
    "https://in.canon/media/image/2018/09/05/77740ca8ea0548dca1c5eb62b9ac3b2f_EOS+R+Body+Top.png",
    "https://rukminim2.flixcart.com/image/850/1000/jr0y9ow0/dslr-camera/z/m/b/na-eos-r-canon-original-imafcwzc79pzxeye.jpeg?q=20&crop=false",
    "https://tiimg.tistatic.com/fp/1/006/416/canon-eos-r-mirrorless-digital-camera-body-with-accessories--543.jpg",
  ];

  const [mainImage, setMainImage] = useState(imageList[0]);
  const [lensVisible, setLensVisible] = useState(false);
  const [lensStyle, setLensStyle] = useState({});
  const imgRef = useRef();

  const handleMouseMove = (e) => {
    const rect = imgRef.current.getBoundingClientRect();
    const lensSize = Math.min(window.innerWidth * 0.25, 250); // max 250px

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const backgroundX = (x / rect.width) * 100;
    const backgroundY = (y / rect.height) * 100;

    setLensStyle({
      top: `${y - lensSize / 2}px`,
      left: `${x - lensSize / 2}px`,
      width: `${lensSize}px`,
      height: `${lensSize}px`,
      backgroundImage: `url(${mainImage})`,
      backgroundSize: "300% 300%",
      backgroundPosition: `${backgroundX}% ${backgroundY}%`,
    });
  };

  return (
    <div className="product-detail-container">
      <div className="product-row">
        <div className="product-left">
          <div className="product-images">
            <div
              className="main-image"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setLensVisible(true)}
              onMouseLeave={() => setLensVisible(false)}
            >
              <img
                ref={imgRef}
                src={mainImage}
                alt="Main Camera"
                className="main-img"
              />
              {lensVisible && <div className="zoom-lens" style={lensStyle} />}
            </div>
            <div className="thumbnails-wrapper">
              <div className="thumbnails">
                {imageList.map((src, index) => (
                  <img
                    key={index}
                    src={src}
                    alt={`Thumbnail ${index + 1}`}
                    className={mainImage === src ? "active-thumbnail" : ""}
                    onClick={() => setMainImage(src)}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="action-buttons">
            <button className="btn btn-add">Add to Cart</button>
            <button className="btn btn-buy">Buy Now</button>
          </div>
        </div>
        <div className="product-right">
          <div className="product-header">
            <a href="/components" className="back-link">
              ← Back
            </a>
            <span className="share">🔗 Share</span>
          </div>
          <h2 className="product-title">
            Canon EOS R Mirrorless Camera Body with Single Lens: RF24-105 mm
            f/4L IS USM Lens (Black)
          </h2>
          {/* <div className="price-details">
            <span className="actual-price">₹2,28,525</span>
            <span className="discounted-price">₹2,56,995</span>
            <span className="discount">11% off</span>
          </div> */}
          <div className="highlights-container">
            <div className="highlights">
              <h3>Categories:</h3>
              <p>Accessories</p>
            </div>
            <div className="highlights">
              <h3>Components:</h3>
              <p>Carry Case</p>
            </div>
          </div>

          <div className="description">
            <h3>Description</h3>
            <p>
              The Canon EOS R camera is a delight for photographers. It comes
              with an RF mount for lens compatibility, a Multi-function Bar, and
              a customizable touchscreen LCD.
            </p>
          </div>
          <div className="specifications">
            <h3>Specifications</h3>
            <ul>
              <li>
                <strong>Brand:</strong> Canon
              </li>
              <li>
                <strong>Model Number:</strong> EOS R
              </li>
              <li>
                <strong>Type:</strong> Mirrorless
              </li>
              <li>
                <strong>Effective Pixels:</strong> 30.3 MP
              </li>
              <li>
                <strong>WiFi:</strong> Yes
              </li>
              <li>
                <strong>Lens Mount:</strong> Canon EF Mount
              </li>
              <li>
                <strong>Image Sensor Size:</strong> 36 x 24 mm
              </li>
              <li>
                <strong>Shutter Speed:</strong> 1/8000 - 30 sec
              </li>
              <li>
                <strong>Display Type:</strong> TFT, 3.15 inch
              </li>
              <li>
                <strong>Compatible Card:</strong> SD Card
              </li>
              <li>
                <strong>Battery Type:</strong> Lithium
              </li>
              <li>
                <strong>Weight:</strong> 0.66 kg
              </li>
            </ul>
          </div>
          <div>
            <table>
              <thead>
                <tr>
                  <th>Vendor Name</th>
                  <th>Price</th>
                  <th>Tax%</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>gk</td>
                  <td>1000</td>
                  <td>11%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComponentDetailsPage;
