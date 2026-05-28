// import React, { useState, useEffect } from "react";
// import config from "../Config";
// import "../App.css";
// import AddIcon from "../assets/Add.png";

// import {
//   showSuccessToast,
//   showErrorToast,
//   showInfoToast,
//   showWarningToast,
//   showTextToast,
//   ToastContainerComponent,
// } from "./Toastify.jsx";

// const AddTags = () => {
//   const [components, setComponents] = useState([]);
//   const [availableTags, setAvailableTags] = useState([]);
//   const [selectedComponents, setSelectedComponents] = useState([]);
//   const [newTag, setNewTag] = useState("");
//   const [showPopup, setShowPopup] = useState(false);
//   const [message, setMessage] = useState("");
//   const [popupMode, setPopupMode] = useState("");
//   const [singleComponentId, setSingleComponentId] = useState(null);

//   // 🔹 Search state
//   const [searchQuery, setSearchQuery] = useState("");

//   useEffect(() => {
//     fetchComponents();
//     fetchAvailableTags();
//   }, []);

//   const fetchAvailableTags = async () => {
//     try {
//       const response = await fetch(`${config.apiBaseURL}/meta_tags/`);
//       const data = await response.json();
//       setAvailableTags(data);
//     } catch (error) {
//       console.error("Error fetching tags:", error);
//     }
//   };

//   const fetchComponents = async () => {
//     try {
//       const response = await fetch(`${config.apiBaseURL}/component/`);
//       const data = await response.json();
//       setComponents(data);
//     } catch (error) {
//       console.error("Error fetching components:", error);
//       setMessage("Failed to load components.");
//     }
//   };

//   const getTagsForComponent = (componentId) => {
//     return availableTags.filter((tag) => tag.component_id === componentId);
//   };

//   const handleCheckboxChange = (componentId) => {
//     if (selectedComponents.includes(componentId)) {
//       setSelectedComponents(
//         selectedComponents.filter((id) => id !== componentId)
//       );
//     } else {
//       setSelectedComponents([...selectedComponents, componentId]);
//     }
//   };

//   const handleAddTagClick = () => {
//     if (selectedComponents.length === 0) {
//       showInfoToast("Please select at least one component.");
//       return;
//     }
//     setPopupMode("multiple");
//     setNewTag("");
//     setShowPopup(true);
//   };

//   const handleTagColumnClick = (componentId) => {
//     setPopupMode("single");
//     setSingleComponentId(componentId);
//     setNewTag("");
//     setShowPopup(true);
//   };

//   const handleAddTag = async () => {
//     if (!newTag.trim()) {
//       showWarningToast("Please enter a valid tag.");
//       return;
//     }
//     // ... unchanged (your tag logic here)
//   };

//   const handleDeleteTag = async (tagId) => {
//     try {
//       const response = await fetch(`${config.apiBaseURL}/meta_tags/${tagId}/`, {
//         method: "DELETE",
//       });
//       if (response.ok) {
//         showSuccessToast("Tag deleted successfully!");
//         fetchAvailableTags();
//       } else {
//         showErrorToast("Failed to delete the tag.");
//       }
//     } catch (error) {
//       console.error("Error deleting tag:", error);
//       showErrorToast("An error occurred. Please try again.");
//     }
//   };

//   // 🔹 Filtered components based on search
//   const filteredComponents = components.filter((component) =>
//     component.component_specification
//       ?.toLowerCase()
//       .includes(searchQuery.toLowerCase())
//   );

//   return (
//     <div className="addingtags-container">
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//         }}
//       >
//         <h2>Available Meta Tags</h2>

//         <div
//           style={{
//             flex: 1,
//             display: "flex",
//             justifyContent: "center",
//             marginBottom: "10px",
//           }}
//         >
//           <div className="search-wrapper">
//             <div
//               className="search-bar-container"
//               style={{ position: "relative", width: "300px" }}
//             >
//               <input
//                 type="text"
//                 className="search-bar"
//                 placeholder="Search by Component Spec"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 style={{
//                   width: "100%",
//                   padding: "6px 30px 6px 10px",
//                   borderRadius: "4px",
//                 }}
//               />
//               <span
//                 className="search-icon"
//                 style={{
//                   position: "absolute",
//                   right: "8px",
//                   top: "50%",
//                   transform: "translateY(-50%)",
//                   color: "#666",
//                 }}
//               >
//                 <i className="fa fa-search" aria-hidden="true"></i>
//               </span>
//             </div>
//           </div>
//         </div>
//         {/* 🔍 Search bar */}
//         {/* <input
//           type="text"
//           placeholder="Search by Specification..."
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           style={{
//             padding: "6px 10px",
//             borderRadius: "4px",
//             border: "1px solid #ccc",
//             marginRight: "10px",
//           }}
//         /> */}

//         <button
//           style={{
//             cursor: "pointer",
//             marginLeft: "auto",
//             marginRight: 20,
//             background: "transparent",
//             border: "none",
//           }}
//           title="Add Tag for Selected Components"
//           onClick={handleAddTagClick}
//         >
//           <img src={AddIcon} alt="" style={{ width: "20px", height: "20px" }} />
//         </button>
//       </div>

//       <div className="table-container" style={{ marginTop: "-14px" }}>
//         <table className="full-width-table">
//           <thead>
//             <tr>
//               <th>Select</th>
//               <th>Component Type</th>
//               <th>Specification</th>
//               <th>UOM</th>
//               <th>Category</th>
//               <th>Component ID</th>
//               <th>Tags</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredComponents.length > 0 ? (
//               filteredComponents.map((component) => (
//                 <tr key={component.component_id}>
//                   <td>
//                     <input
//                       type="checkbox"
//                       checked={selectedComponents.includes(
//                         component.component_id
//                       )}
//                       onChange={() =>
//                         handleCheckboxChange(component.component_id)
//                       }
//                     />
//                   </td>
//                   <td>{component.component_type}</td>
//                   <td className="specification-cell">
//                     {component.component_specification}
//                   </td>
//                   <td>{component.unit_of_measurement}</td>
//                   <td>{component.category}</td>
//                   <td>{component.component_id}</td>
//                   <td>
//                     <div
//                       style={{ cursor: "pointer", color: "blue" }}
//                       onClick={() =>
//                         handleTagColumnClick(component.component_id)
//                       }
//                     >
//                       {getTagsForComponent(component.component_id).length >
//                       0 ? (
//                         getTagsForComponent(component.component_id).map(
//                           (tag) => (
//                             <span key={tag.id} className="tag">
//                               {tag.tags}
//                               <button
//                                 onClick={(e) => {
//                                   e.stopPropagation();
//                                   handleDeleteTag(tag.id);
//                                 }}
//                               >
//                                 ×
//                               </button>
//                             </span>
//                           )
//                         )
//                       ) : (
//                         <span>No tags available (Click to add)</span>
//                       )}
//                     </div>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="7" style={{ textAlign: "center" }}>
//                   No components found.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//         {message && <p className="feedback-message">{message}</p>}
//       </div>

//       {showPopup && (
//         <div className="modal-overlay">
//           <div
//             style={{
//               position: "fixed",
//               top: "50%",
//               left: "50%",
//               transform: "translate(-50%, -50%)",
//               background: "#fff",
//               padding: "20px",
//               borderRadius: "8px",
//               boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
//               zIndex: 1000,
//               width: "300px",
//             }}
//           >
//             <h3>
//               {popupMode === "multiple"
//                 ? "Add a New Tag to Selected Components"
//                 : "Add a New Tag to Component"}
//             </h3>
//             <input
//               type="text"
//               value={newTag}
//               onChange={(e) => setNewTag(e.target.value)}
//               placeholder="Enter tag"
//               style={{
//                 width: "100%",
//                 padding: "8px",
//                 marginBottom: "10px",
//                 boxSizing: "border-box",
//               }}
//             />
//             <div style={{ display: "flex", justifyContent: "flex-end" }}>
//               <button
//                 onClick={handleAddTag}
//                 style={{
//                   padding: "8px 12px",
//                   background: "#f58720",
//                   color: "#fff",
//                   border: "none",
//                   borderRadius: "4px",
//                   cursor: "pointer",
//                   marginRight: "10px",
//                   justifyContent: "end",
//                 }}
//               >
//                 Add Tag
//               </button>
//               <button
//                 onClick={() => setShowPopup(false)}
//                 style={{
//                   padding: "8px 12px",
//                   background: "gray",
//                   color: "#fff",
//                   border: "none",
//                   borderRadius: "4px",
//                   cursor: "pointer",
//                   alignItems: "flexend",
//                 }}
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//       <ToastContainerComponent />
//     </div>
//   );
// };

// export default AddTags;

import React, { useState, useEffect } from "react";
import config from "../Config";
import "../App.css";
import AddIcon from "../assets/Add.png";

import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  showTextToast,
  ToastContainerComponent,
} from "./Toastify.jsx";

const AddTags = () => {
  const [components, setComponents] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedComponents, setSelectedComponents] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");
  const [popupMode, setPopupMode] = useState("");
  const [singleComponentId, setSingleComponentId] = useState(null);

  // 🔹 Search state
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchComponents();
    fetchAvailableTags();
  }, []);

  const fetchAvailableTags = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/meta_tags/`);
      const data = await response.json();
      setAvailableTags(data);
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  const fetchComponents = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/component/`);
      const data = await response.json();
      setComponents(data);
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
        selectedComponents.filter((id) => id !== componentId),
      );
    } else {
      setSelectedComponents([...selectedComponents, componentId]);
    }
  };

  const handleAddTagClick = () => {
    if (selectedComponents.length === 0) {
      showInfoToast("Please select at least one component.");
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
      showWarningToast("Please enter a valid tag.");
      return;
    }
    // ... unchanged (your tag logic here)
  };

  const handleDeleteTag = async (tagId) => {
    try {
      const response = await fetch(`${config.apiBaseURL}/meta_tags/${tagId}/`, {
        method: "DELETE",
      });
      if (response.ok) {
        showSuccessToast("Tag deleted successfully!");
        fetchAvailableTags();
      } else {
        showErrorToast("Failed to delete the tag.");
      }
    } catch (error) {
      console.error("Error deleting tag:", error);
      showErrorToast("An error occurred. Please try again.");
    }
  };

  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const handleSort = (field) => {
    const order = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(order);
  };

  const filteredComponents = components.filter((component) => {
    const search = searchQuery.toLowerCase();

    const type = component.component_type?.toLowerCase() || "";
    const spec = component.component_specification?.toLowerCase() || "";
    const uom = component.unit_of_measurement?.toLowerCase() || "";
    const category = component.category?.toLowerCase() || "";
    const componentId = component.component_id?.toLowerCase() || "";

    // 🔹 Get tags as string
    const tags = getTagsForComponent(component.component_id)
      .map((tag) => tag.tags?.toLowerCase() || "")
      .join(" ");

    if (!search) return true;

    return (
      type.includes(search) ||
      spec.includes(search) ||
      uom.includes(search) ||
      category.includes(search) ||
      componentId.includes(search) ||
      tags.includes(search)
    );
  });

  return (
    <div className="addingtags-container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Available Meta Tags</h2>

        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            marginBottom: "10px",
          }}
        >
          <div className="search-wrapper">
            <div
              className="search-bar-container"
              style={{ position: "relative", width: "300px" }}
            >
              <input
                type="text"
                className="search-bar"
                placeholder="Search by Component Spec"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px 30px 6px 10px",
                  borderRadius: "4px",
                }}
              />
              <span
                className="search-icon"
                style={{
                  position: "absolute",
                  right: "8px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#666",
                }}
              >
                <i className="fa fa-search" aria-hidden="true"></i>
              </span>
            </div>
          </div>
        </div>
        {/* 🔍 Search bar */}
        {/* <input
          type="text"
          placeholder="Search by Specification..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: "6px 10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            marginRight: "10px",
          }}
        /> */}

        <button
          style={{
            cursor: "pointer",
            marginLeft: "auto",
            marginRight: 20,
            background: "transparent",
            border: "none",
          }}
          title="Add Tag for Selected Components"
          onClick={handleAddTagClick}
        >
          <img src={AddIcon} alt="" style={{ width: "20px", height: "20px" }} />
        </button>
      </div>

      <div className="table-container" style={{ marginTop: "-14px" }}>
        <table className="full-width-table">
          <thead>
            <tr>
              <th>Select</th>

              <th
                onClick={() => handleSort("component_type")}
                style={{ cursor: "pointer", textDecoration: "underline" }}
              >
                Component Type{" "}
                {sortField === "component_type"
                  ? sortOrder === "asc"
                    ? " 🔼"
                    : " 🔽"
                  : ""}
              </th>

              <th
                onClick={() => handleSort("component_specification")}
                style={{ cursor: "pointer", textDecoration: "underline" }}
              >
                Specification{" "}
                {sortField === "component_specification"
                  ? sortOrder === "asc"
                    ? " 🔼"
                    : " 🔽"
                  : ""}
              </th>

              <th
                onClick={() => handleSort("unit_of_measurement")}
                style={{ cursor: "pointer", textDecoration: "underline" }}
              >
                UOM{" "}
                {sortField === "unit_of_measurement"
                  ? sortOrder === "asc"
                    ? " 🔼"
                    : " 🔽"
                  : ""}
              </th>

              <th
                onClick={() => handleSort("category")}
                style={{ cursor: "pointer", textDecoration: "underline" }}
              >
                Category{" "}
                {sortField === "category"
                  ? sortOrder === "asc"
                    ? " 🔼"
                    : " 🔽"
                  : ""}
              </th>

              <th
                onClick={() => handleSort("component_id")}
                style={{ cursor: "pointer", textDecoration: "underline" }}
              >
                Component ID{" "}
                {sortField === "component_id"
                  ? sortOrder === "asc"
                    ? " 🔼"
                    : " 🔽"
                  : ""}
              </th>

              <th>Tags</th>
            </tr>
          </thead>
          <tbody>
            {filteredComponents.length > 0 ? (
              filteredComponents.map((component) => (
                <tr key={component.component_id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedComponents.includes(
                        component.component_id,
                      )}
                      onChange={() =>
                        handleCheckboxChange(component.component_id)
                      }
                    />
                  </td>
                  <td>{component.component_type}</td>
                  <td className="specification-cell">
                    {component.component_specification}
                  </td>
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
                                  e.stopPropagation();
                                  handleDeleteTag(tag.id);
                                }}
                              >
                                ×
                              </button>
                            </span>
                          ),
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
                  No components found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {message && <p className="feedback-message">{message}</p>}
      </div>

      {showPopup && (
        <div className="modal-overlay">
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
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={handleAddTag}
                style={{
                  padding: "8px 12px",
                  background: "#f58720",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  marginRight: "10px",
                  justifyContent: "end",
                }}
              >
                Add Tag
              </button>
              <button
                onClick={() => setShowPopup(false)}
                style={{
                  padding: "8px 12px",
                  background: "gray",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  alignItems: "flexend",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainerComponent />
    </div>
  );
};

export default AddTags;
