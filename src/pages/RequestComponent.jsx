import React, { useState, useEffect, useCallback, useRef } from "react";
import tagIcon from "../assets/Tag_icon.png";
import config from "../Config"; // Import config for API endpoints
import "../App.css";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import { format, parseISO } from "date-fns";

import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  ToastContainerComponent,
  showTextToast,
} from "./Toastify.jsx"; // Import Toastify utilities
import { th } from "date-fns/locale";

const debounce = (func, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

const RequestComponent = () => {
  const [showModal, setShowModal] = useState(false);
  const { user, logout } = useAuth();
  const [showScrollTop, setShowScrollTop] = useState(false); // Track visibility of scroll-to-top button

  const [formData, setFormData] = useState({
    name: "Dronix",
    category: "",
    component_type: "",
    component_specification: "",
    product_link: "",
    uom: "",
  });

  const [dropdownOptions, setDropdownOptions] = useState({
    category_choices: [],
    component_type_list: [],
  });

  const [componentList, setComponentList] = useState([]); //  State for table data
  const modalRef = useRef(null);
  const [addedComponentIds, setAddedComponentIds] = useState([]);
  const [searchSpec, setSearchSpec] = useState("");

  const navigate = useNavigate();

  // Fetch dropdown options
  useEffect(() => {
    fetch(`${config.apiBaseURL}/component_options/`)
      .then((res) => res.json())
      .then((data) => {
        setDropdownOptions({
          category_choices: data.category_choices || [],
          component_type_list: data.component_type_list || [],
        });
      })
      .catch((err) => console.error("Error fetching options:", err));
  }, []);

  // Fetch submitted component requests
  useEffect(() => {
    let url = `${config.apiBaseURL}/request_component/`;
    if (user?.role === "Procurement") {
      url += "?status=Added";
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => setComponentList(data))
      .catch((err) => console.error("Error fetching request data:", err));
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const filteredComponents = componentList.filter((item) =>
    item.component_specification
      .toLowerCase()
      .includes(searchSpec.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${config.apiBaseURL}/request_component/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        showSuccessToast("Component request submitted!");
        setShowModal(false);
        setFormData({
          name: "Dronix",
          category: "",
          component_type: "",
          component_specification: "",
          product_link: "",
          uom: "",
        });
        // Refresh table data
        const updatedList = await fetch(
          `${config.apiBaseURL}/request_component/`
        ).then((res) => res.json());
        setComponentList(updatedList);
      } else {
        showErrorToast("Submission failed");
      }
    } catch (error) {
      console.error("Submission error:", error);
      showErrorToast("Network error");
    }
  };

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

  const handleAddToComponentMaster = async (item) => {
    const payload = {
      component_type: item.component_type,
      component_specification: item.component_specification,
      unit_of_measurement: item.uom,
      category: item.category,
      tally_reference: "",
    };

    try {
      const response = await fetch(`${config.apiBaseURL}/component/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        const generatedComponentId = result.component_id;

        showSuccessToast(`Added to Component Master: ${generatedComponentId}`);

        //  Update request_component with component_id
        await fetch(`${config.apiBaseURL}/request_component/${item.id}/`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "Added",
            component_id: generatedComponentId, //  Save to request_component
          }),
        });

        const updatedList = await fetch(
          `${config.apiBaseURL}/request_component/`
        ).then((res) => res.json());
        setComponentList(updatedList);
      } else {
        const errorData = await response.json();
        showErrorToast("Error adding to Component Master");
        console.error("Response Error:", errorData);
      }
    } catch (error) {
      showErrorToast("Network error while posting");
      console.error("Add to Component Master error:", error);
    }
  };

  const handleRejectRequest = (item) => {
    let componentId = item.component_id || "";

    showTextToast({
      message: ({ closeToast }) => (
        <div>
          <p>Enter Component ID for rejection:</p>
          <input
            type="text"
            defaultValue={componentId}
            onChange={(e) => {
              componentId = e.target.value.trim();
            }}
            style={{
              marginTop: "8px",
              padding: "6px",
              width: "100%",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
        </div>
      ),
      confirmText: "Reject",
      cancelText: "Cancel",
      onConfirm: async () => {
        if (!componentId) {
          showErrorToast("Component ID is required for rejection.");
          return;
        }

        try {
          // --- 1. Fetch Component Master data ---
          const response = await fetch(`${config.apiBaseURL}/component/`);
          const componentMasterData = await response.json();

          // --- 2. Check if entered componentId exists in Component Master ---
          const componentExists = componentMasterData.some(
            (comp) => comp.component_id === componentId
          );

          if (!componentExists) {
            showErrorToast(
              `Component ID "${componentId}" does not exist in Component Master.`
            );
            return; // stop rejection
          }

          //  3. Proceed with rejection ---
          await fetch(`${config.apiBaseURL}/request_component/${item.id}/`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status: "Rejected",
              component_id: componentId,
            }),
          });

          showWarningToast(`Component ${componentId} rejected.`);

          const updatedList = await fetch(
            `${config.apiBaseURL}/request_component/`
          ).then((res) => res.json());

          setComponentList(updatedList);
        } catch (error) {
          showErrorToast("Failed to reject request.");
          console.error("Reject error:", error);
        }
      },
      onCancel: () => {
        showWarningToast("Rejection cancelled.");
      },
    });
  };

  return (
    <div>
      <div className="header">
        <h2>New Component</h2>
        <div className="button-group">
          <button className="add-comp" onClick={() => setShowModal(true)}>
            Request Component
          </button>
          {showModal && (
            <div className="modal-overlays">
              <div className="modals" ref={modalRef}>
                <h2>Request Component</h2>
                <form onSubmit={handleSubmit}>
                  <div className="forms-group">
                    <label htmlFor="">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Category</option>
                      {dropdownOptions.category_choices.map(
                        ([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                  <div className="forms-group">
                    <label htmlFor="">Component</label>
                    <select
                      name="component_type"
                      value={formData.component_type}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Type</option>
                      {dropdownOptions.component_type_list.map(
                        ([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                  <div className="forms-group">
                    <label htmlFor="">Specification</label>
                    <input
                      type="text"
                      name="component_specification"
                      value={formData.component_specification}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="forms-group">
                    <label htmlFor="">Product Link</label>
                    <input
                      type="url"
                      name="product_link"
                      value={formData.product_link}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="forms-group">
                    <label htmlFor="">UOM</label>
                    <input
                      type="text"
                      name="uom"
                      value={formData.uom}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="popup-actions">
                    <button type="submit">Submit</button>
                    <button type="button" onClick={() => setShowModal(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
      <div class="center-wrapper">
        <div className="search-bar-container">
          <input
            type="text"
            className="search-bar"
            placeholder="Search by Spec..."
            value={searchSpec}
            onChange={(e) => setSearchSpec(e.target.value)}
          />
          <span className="search-icon">
            <i className="fa fa-search" aria-hidden="true"></i>
          </span>
        </div>
      </div>
      <div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                {(user.role === "Inventory" ||
                  user.role === "Procurement" ||
                  user.role === "Admin") && (
                  <th>
                    <>UserName</>
                  </th>
                )}

                <th>Category</th>

                <th>Component Type</th>

                <th>Specification</th>
                <th>Product Link</th>
                <th>UOM</th>

                <th>Date</th>

                {user.role === "User" && (
                  <th>
                    <>Status</>
                  </th>
                )}

                <th
                  style={{ textDecoration: "underline", cursor: "pointer" }}
                  onClick={() => handleSort("component_id")}
                >
                  Component ID
                </th>

                {(user.role === "Inventory" || user.role === "Procurement") && (
                  <th>
                    {" "}
                    <>Actions</>
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {filteredComponents.length === 0 ? (
                <tr>
                  <td colSpan="9">No data available</td>
                </tr>
              ) : (
                filteredComponents.map((item) => (
                  <tr key={item.id}>
                    {(user.role === "Inventory" ||
                      user.role === "Procurement" ||
                      user.role === "Admin") && <td>{item.name}</td>}
                    <td>{item.category}</td>
                    <td>{item.component_type}</td>
                    <td>{item.component_specification}</td>
                    <td>
                      <a
                        href={item.product_link}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Link
                      </a>
                    </td>
                    <td>{item.uom}</td>
                    <td>{format(parseISO(item.request_date), "dd-MM-yyyy")}</td>
                    <td>
                      {item.status === "Added" || item.status === "Rejected"
                        ? item.component_id
                        : ""}
                    </td>
                    {(user.role === "Inventory" ||
                      user.role === "Procurement" ||
                      user.role === "User") && (
                      <td className="action-btn">
                        {user.role === "Inventory" && (
                          <>
                            {item.status === "Added" ? (
                              <button className="btn-added" disabled>
                                Component Added
                              </button>
                            ) : item.status === "Rejected" ? (
                              <button className="btn-reject" disabled>
                                Rejected
                              </button>
                            ) : (
                              <>
                                <button
                                  className="btn-reject"
                                  onClick={() =>
                                    handleAddToComponentMaster(item)
                                  }
                                >
                                  Add
                                </button>
                                <button
                                  className="btn-reject"
                                  onClick={() => handleRejectRequest(item)}
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </>
                        )}
                        {user.role === "Procurement" && (
                          <>
                            {item.vendor_added ? (
                              <button className="btn-added" disabled>
                                Added to Vendor
                              </button>
                            ) : (
                              <button
                                className="btn-reject"
                                onClick={() =>
                                  navigate("/vendor/", {
                                    state: { component: item },
                                  })
                                }
                              >
                                Add to Vendor
                              </button>
                            )}
                          </>
                        )}
                        {user.role === "User" && <>Pending</>}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
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

      <ToastContainerComponent />
    </div>
  );
};

export default RequestComponent;
