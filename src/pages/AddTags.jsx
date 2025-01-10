import React, { useState, useEffect } from "react";
import config from "../config"; // Adjust the config for API URLs
import "../App.css";
import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  ToastContainerComponent,
} from "./Toastify.jsx"; // Import Toastify utilities

const AddTags = () => {
  const [components, setComponents] = useState([]); // List of all components
  const [availableTags, setAvailableTags] = useState([]); // List of available tags
  const [selectedComponents, setSelectedComponents] = useState([]); // List of selected component IDs
  const [newTag, setNewTag] = useState(""); // New tag input
  const [showPopup, setShowPopup] = useState(false); // Controls the visibility of the pop-up
  const [message, setMessage] = useState(""); // Feedback message for the user
  const [popupMode, setPopupMode] = useState(""); // Mode for the pop-up ("single" or "multiple")
  const [singleComponentId, setSingleComponentId] = useState(null); // Single component ID for tag addition

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

  const getTagsForComponent = (componentId) => {
    return availableTags.filter((tag) => tag.component_id === componentId);
  };

  const handleCheckboxChange = (componentId) => {
    if (selectedComponents.includes(componentId)) {
      setSelectedComponents(
        selectedComponents.filter((id) => id !== componentId)
      );
    } else {
      setSelectedComponents([...selectedComponents, componentId]);
    }
  };

  const handleAddTagClick = () => {
    if (selectedComponents.length === 0) {
      alert("Please select at least one component.");
      return;
    }
    setPopupMode("multiple");
    setNewTag("");
    setShowPopup(true);
  };

  const handleTagColumnClick = (componentId) => {
    setPopupMode("single");
    setSingleComponentId(componentId);
    setNewTag("");
    setShowPopup(true);
  };

  const handleAddTag = async () => {
    if (!newTag.trim()) {
      alert("Please enter a valid tag.");
      return;
    }

    if (popupMode === "multiple") {
      // Handle adding tag to multiple selected components
      const componentsToTag = selectedComponents.filter((componentId) => {
        const existingTags = getTagsForComponent(componentId);
        return !existingTags.some(
          (tag) => tag.tags.toLowerCase() === newTag.trim().toLowerCase()
        );
      });

      if (componentsToTag.length === 0) {
        alert("The tag already exists for all selected components.");
        return;
      }

      const payloads = componentsToTag.map((componentId) => ({
        component_id: componentId,
        tags: newTag,
      }));

      try {
        const responses = await Promise.all(
          payloads.map((payload) =>
            fetch("http://127.0.0.1:8000/meta_tags/", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
            })
          )
        );

        if (responses.every((response) => response.ok)) {
          showSuccessToast("Tag added successfully to selected components!");
          fetchAvailableTags(); // Refresh the tags list
          setShowPopup(false); // Close the pop-up
          setSelectedComponents([]); // Clear the selected components
        } else {
          alert("Failed to add the tag to some components.");
        }
      } catch (error) {
        console.error("Error adding tag:", error);
        alert("An error occurred. Please try again.");
      }
    } else if (popupMode === "single") {
      // Handle adding tag to a single component
      const existingTags = getTagsForComponent(singleComponentId);
      const isDuplicate = existingTags.some(
        (tag) => tag.tags.toLowerCase() === newTag.trim().toLowerCase()
      );

      if (isDuplicate) {
        alert("This tag already exists for the selected component.");
        return;
      }

      const payload = {
        component_id: singleComponentId,
        tags: newTag,
      };

      try {
        const response = await fetch("http://127.0.0.1:8000/meta_tags/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          showSuccessToast("Tag added successfully!");
          fetchAvailableTags(); // Refresh the tags list
          setShowPopup(false); // Close the pop-up
        } else {
          alert("Failed to add the tag.");
        }
      } catch (error) {
        console.error("Error adding tag:", error);
        alert("An error occurred. Please try again.");
      }
    }
  };

  const handleDeleteTag = async (tagId) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/meta_tags/${tagId}/`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        showSuccessToast("Tag deleted successfully!");
        fetchAvailableTags(); // Refresh the tags list
      } else {
        alert("Failed to delete the tag.");
      }
    } catch (error) {
      console.error("Error deleting tag:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="addingtags-container">
      <h2>Available Meta Tags</h2>

      <button
        onClick={handleAddTagClick}
        style={{
          // marginTop: "20px",
          padding: "8px 12px",
          background: "#fc9d03",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Add Tag to Selected Components
      </button>

      <div className="table-container">
        <table className="full-width-table">
          <thead>
            <tr>
              <th>Select</th>
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
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedComponents.includes(
                        component.component_id
                      )}
                      onChange={() =>
                        handleCheckboxChange(component.component_id)
                      }
                    />
                  </td>
                  <td>{component.component_type}</td>
                  <td>{component.component_specification}</td>
                  <td>{component.unit_of_measurement}</td>
                  <td>{component.category}</td>
                  <td>{component.component_id}</td>
                  <td>
                    <div
                      style={{ cursor: "pointer", color: "blue" }}
                      onClick={() =>
                        handleTagColumnClick(component.component_id)
                      }
                    >
                      {getTagsForComponent(component.component_id).length >
                      0 ? (
                        getTagsForComponent(component.component_id).map(
                          (tag) => (
                            <span key={tag.id} className="tag">
                              {tag.tags}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent triggering the parent click
                                  handleDeleteTag(tag.id);
                                }}
                                // style={{
                                //   marginLeft: "8px",
                                //   background: "none",
                                //   border: "none",
                                //   color: "red",
                                //   fontWeight: "bold",
                                //   cursor: "pointer",
                                // }}
                              >
                                ×
                              </button>
                            </span>
                          )
                        )
                      ) : (
                        <span>No tags available (Click to add)</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  No components available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {message && <p className="feedback-message">{message}</p>}
      </div>



      {/* Pop-up for adding a new tag */}
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
            width: "300px",
          }}
        >
          <h3>
            {popupMode === "multiple"
              ? "Add a New Tag to Selected Components"
              : "Add a New Tag to Component"}
          </h3>
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Enter tag"
            style={{
              width: "100%",
              padding: "8px",
              marginBottom: "10px",
              boxSizing: "border-box",
            }}
          />
          <button
            onClick={handleAddTag}
            style={{
              padding: "8px 12px",
              background: "#4caf50",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              marginRight: "10px",
            }}
          >
            Add Tag
          </button>
          <button
            onClick={() => setShowPopup(false)}
            style={{
              padding: "8px 12px",
              background: "#f44336",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Overlay for pop-up */}
      {showPopup && (
        <div
          onClick={() => setShowPopup(false)}
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

export default AddTags;

////////////////////////////////// src/pages/AddTags.jsx

// import React, { useState, useEffect } from "react";
// import config from "../config"; // Adjust the config for API URLs
// import "../App.css";

// const AddTags = () => {
//   const [components, setComponents] = useState([]); // List of all components
//   const [availableTags, setAvailableTags] = useState([]); // List of all available tags
//   const [message, setMessage] = useState(""); // Feedback message for the user

//   // Fetch all components and tags on component mount
//   useEffect(() => {
//     fetchComponents();
//     fetchAvailableTags();
//   }, []);

//   const fetchAvailableTags = async () => {
//     try {
//       const response = await fetch("http://127.0.0.1:8000/meta_tags/");
//       const data = await response.json();
//       setAvailableTags(data);
//       console.log("Fetched tags ", data);
//     } catch (error) {
//       console.error("Error fetching tags:", error);
//     }
//   };

//   const fetchComponents = async () => {
//     try {
//       const response = await fetch("http://127.0.0.1:8000/component/");
//       const data = await response.json();
//       setComponents(data);
//       console.log("Fetched components", data);
//     } catch (error) {
//       console.error("Error fetching components:", error);
//       setMessage("Failed to load components.");
//     }
//   };

//   // Helper function to get tags for a specific component
//   const getTagsForComponent = (componentId) => {
//     return availableTags.filter((tag) => tag.component_id === componentId);
//   };

//   return (
//     <div className="addingtags">
//       <div>
//         <h2>Available Meta Tags</h2>
//         <table>
//           <thead>
//             <tr>
//               <th>Component Type</th>
//               <th>Specification</th>
//               <th>UOM</th>
//               <th>Category</th>
//               <th>Component ID</th>
//               <th>Tags</th>
//             </tr>
//           </thead>
//           <tbody>
//             {components.length > 0 ? (
//               components.map((component) => (
//                 <tr key={component.component_id}>
//                   <td>{component.component_type}</td>
//                   <td>{component.component_specification}</td>
//                   <td>{component.unit_of_measurement}</td>
//                   <td>{component.category}</td>
//                   <td>{component.component_id}</td>
//                   <td>
//                     {getTagsForComponent(component.component_id).length > 0 ? (
//                       getTagsForComponent(component.component_id).map((tag) => (
//                         <span key={tag.id} className="metatag">
//                           {tag.tags}
//                         </span>
//                       ))
//                     ) : (
//                       <span>No tags available</span>
//                     )}
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="6" style={{ textAlign: "center" }}>
//                   No components available.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//         {message && <p className="feedback-message">{message}</p>}
//       </div>
//     </div>
//   );
// };

// export default AddTags;
