import React, { useState, useEffect, useCallback, useRef } from "react";
import tagIcon from "../assets/Tag_icon.png";
import config from "../Config"; // Import config for API endpoints
import "../App.css";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import { format, parseISO } from "date-fns";
import { FaArrowLeft } from "react-icons/fa";
import { FaEdit } from "react-icons/fa"; // import edit icon

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
  const usernameFromEmail = user?.email?.split("@")[0] || "";
  const todayDate = format(new Date(), "yyyy-MM-dd"); // YYYY-MM-DD

  const [showScrollTop, setShowScrollTop] = useState(false); // Track visibility of scroll-to-top button
  const [loading, setLoading] = useState(true);

  // Reason inline-edit state
  const [editingReasonId, setEditingReasonId] = useState(null);
  const [reasonDraft, setReasonDraft] = useState("");
  const [savingReason, setSavingReason] = useState(false);

  const startEditReason = (item) => {
    setEditingReasonId(item.id);
    setReasonDraft(item.reason || "");
  };

  const cancelEditReason = () => {
    setEditingReasonId(null);
    setReasonDraft("");
  };

  const saveReason = async (item) => {
    if (savingReason) return;
    setSavingReason(true);
    try {
      const res = await fetch(
        `${config.apiBaseURL}/request_component/${item.id}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: reasonDraft?.trim() || null }),
        }
      );

      if (!res.ok) {
        showErrorToast("Failed to save reason");
        setSavingReason(false);
        return;
      }

      // Optimistic UI update
      setComponentList((prev) =>
        prev.map((rc) =>
          rc.id === item.id
            ? { ...rc, reason: reasonDraft?.trim() || null }
            : rc
        )
      );

      showSuccessToast("Reason saved");
      setEditingReasonId(null);
      setReasonDraft("");
    } catch (e) {
      console.error(e);
      showErrorToast("Network error while saving reason");
    } finally {
      setSavingReason(false);
    }
  };

  const [formData, setFormData] = useState({
    name: usernameFromEmail,
    request_date: todayDate,

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

  useEffect(() => {
    if (user?.email) {
      setFormData((prev) => ({
        ...prev,
        name: user.email.split("@")[0],
        request_date: new Date().toISOString().split("T")[0],
      }));
    }
  }, [user]);

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
    const fetchData = async () => {
      setLoading(true);
      let url = `${config.apiBaseURL}/request_component/`;

      if (user?.role === "Procurement") {
        url += "?status=Added";
      }

      try {
        const res = await fetch(url);
        const data = await res.json();

        // Role-based filtering
        let filteredData = data;
        if (user?.role === "User") {
          const username = user.email.split("@")[0];
          filteredData = data.filter((item) => item.name === username);
        }

        setComponentList(filteredData);
      } catch (err) {
        console.error("Error fetching request data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
        const newItem = await response.json(); // get the created record from backend

        showSuccessToast("Component request submitted!");
        setShowModal(false);

        // Reset form
        setFormData({
          name: usernameFromEmail,
          category: "",
          component_type: "",
          component_specification: "",
          product_link: "",
          uom: "",
        });

        // Add new item to top of list instantly
        setComponentList((prev) => [newItem, ...prev]);
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
    let reasonText = item.reason || "";

    showTextToast({
      message: ({ closeToast }) => (
        <div>
          <p style={{ marginBottom: 8, fontWeight: 600 }}>Reject Request</p>

          <label style={{ display: "block", marginTop: 6, fontSize: 13 }}>
            Component ID (optional)
          </label>
          <input
            type="text"
            defaultValue={componentId}
            onChange={(e) => {
              componentId = e.target.value.trim();
            }}
            style={{
              marginTop: 4,
              padding: "6px",
              width: "100%",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
            placeholder="E.g., CMP-00123 (leave blank if none)"
          />

          <label style={{ display: "block", marginTop: 10, fontSize: 13 }}>
            Reason{" "}
            {componentId ? (
              "(optional)"
            ) : (
              <span style={{ color: "red" }}>*</span>
            )}
          </label>
          <textarea
            defaultValue={reasonText}
            onChange={(e) => {
              reasonText = e.target.value;
            }}
            style={{
              marginTop: 4,
              padding: "6px",
              width: "100%",
              minHeight: 70,
              border: "1px solid #ccc",
              borderRadius: "4px",
              resize: "vertical",
            }}
            placeholder="Enter the reason for rejection"
          />
        </div>
      ),
      confirmText: "Reject",
      cancelText: "Cancel",

      onConfirm: async () => {
        // Rule: if NO componentId, reason is mandatory
        if (!componentId && (!reasonText || !reasonText.trim())) {
          showErrorToast(
            "Reason is required when Component ID is not provided."
          );
          return;
        }

        try {
          // If componentId is provided → validate
          if (componentId) {
            const response = await fetch(`${config.apiBaseURL}/component/`);
            const componentMasterData = await response.json();

            const componentExists = componentMasterData.some(
              (comp) => comp.component_id === componentId
            );

            if (!componentExists) {
              showErrorToast(
                `Component ID "${componentId}" does not exist in Component Master.`
              );
              return;
            }
          }

          // Build PATCH body
          const patchBody = {
            status: "Rejected",
          };
          if (componentId) patchBody.component_id = componentId;
          if (reasonText && reasonText.trim())
            patchBody.reason = reasonText.trim();

          await fetch(`${config.apiBaseURL}/request_component/${item.id}/`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(patchBody),
          });

          showWarningToast("Request rejected.");

          // Refresh list
          const updatedList = await fetch(
            `${config.apiBaseURL}/request_component/`
          ).then((res) => res.json());
          setComponentList(updatedList);
        } catch (error) {
          console.error("Reject error:", error);
          showErrorToast("Failed to reject request.");
        }
      },

      onCancel: () => {
        showWarningToast("Rejection cancelled.");
      },
    });
  };

  return (
    <div>
      <div className="header-requests">
        <div className="header-back">
          <button
            className="back-btn"
            onClick={() => navigate(-1)}
            title="Back to Component List"
          >
            <FaArrowLeft />
          </button>
          <h2>New Component</h2>
          <h3 style={{ marginLeft: "60px" }}>
            Total Requests: {filteredComponents.length}
          </h3>
        </div>{" "}
        <div className="header-center">
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
        <div className="button-group">
          <button className="add-comp" onClick={() => setShowModal(true)}>
            Request Component
          </button>
          {showModal && (
            <div className="modal-overlays">
              <div className="modals" ref={modalRef}>
                <h2>Request Component</h2>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "10px",
                    marginBottom: "15px",
                  }}
                >
                  <div>
                    <strong>User Name:</strong> <span>{formData.name}</span>
                  </div>
                  <div>
                    <strong>Request Date:</strong>{" "}
                    <span>
                      {format(new Date(formData.request_date), "dd-MM-yyyy")}
                    </span>
                  </div>
                </div>

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
                      // required
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

                <th
                  style={{ textDecoration: "underline", cursor: "pointer" }}
                  onClick={() => handleSort("component_id")}
                >
                  Component ID
                </th>
                {user.role === "User" && (
                  <th>
                    <>Status</>
                  </th>
                )}

                {(user.role === "Inventory" || user.role === "Procurement") && (
                  <th>
                    {" "}
                    <>Actions</>
                  </th>
                )}

                {(user.role === "Inventory" ||
                  user.role === "Procurement" ||
                  user.role === "Admin" ||
                  user.role === "Sub-Admin" ||
                  user.role === "User") && (
                  <th>
                    {" "}
                    <>Reason</>
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                //  Show spinner or loading text while data is loading
                <tr>
                  <td
                    colSpan="8"
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    <div className="spinner"></div>
                    Loading request_component...
                  </td>
                </tr>
              ) : filteredComponents.length === 0 ? (
                <tr>
                  <td
                    colSpan={
                      user.role === "Inventory" ||
                      user.role === "Procurement" ||
                      user.role === "Admin"
                        ? 10
                        : 9
                    }
                    style={{
                      textAlign: "center",
                      padding: "15px",
                      fontSize: "16px",
                      color: "#888",
                    }}
                  >
                    No more data available
                  </td>
                </tr>
              ) : (
                filteredComponents.map((item) => (
                  <tr key={item.id}>
                    {(user.role === "Inventory" ||
                      user.role === "Procurement" ||
                      user.role === "Admin") && (
                      <td>
                        {item.name?.includes("@")
                          ? item.name.split("@")[0]
                          : item.name}
                      </td>
                    )}

                    <td>{item.category}</td>
                    <td>{item.component_type}</td>
                    <td
                      className="specification-cell"
                      title={item.component_specification}
                    >
                      {item.component_specification}
                    </td>
                    <td>
                      {item.product_link ? (
                        <a
                          href={item.product_link}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Link
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td>{item.uom}</td>
                    <td>{format(parseISO(item.request_date), "dd-MM-yyyy")}</td>
                    <td>
                      {(item.status === "Added" ||
                        item.status === "Rejected") &&
                      item.component_id ? (
                        user.role === "Procurement" ? (
                          <Link
                            to={`/components/${item.component_id}`}
                            className="link-to-component"
                          >
                            {item.component_id}
                          </Link>
                        ) : (
                          item.component_id
                        )
                      ) : (
                        ""
                      )}
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
                          <button
                            className={
                              item.vendor_added ? "btn-added" : "btn-reject"
                            }
                            disabled={item.vendor_added}
                            onClick={() =>
                              !item.vendor_added &&
                              navigate("/vendor/", {
                                state: { component: item },
                              })
                            }
                          >
                            {item.vendor_added
                              ? "Added to Vendor"
                              : "Add to Vendor"}
                          </button>
                        )}

                        {user.role === "User" && <>Pending</>}
                      </td>
                    )}
                    <td style={{ minWidth: 180 }}>
                      {user.role === "Inventory" ? (
                        editingReasonId === item.id ? (
                          <div className="reason-input-container">
                            <input
                              type="text"
                              value={reasonDraft}
                              onChange={(e) => setReasonDraft(e.target.value)}
                              placeholder="Enter reason"
                              className="reason-input"
                              disabled={savingReason}
                            />
                            <button
                              className="btn-edit-added"
                              onClick={() => saveReason(item)}
                              disabled={savingReason}
                              title="Save"
                            >
                              {savingReason ? "Saving..." : "Save"}
                            </button>
                            <button
                              className="btn-edit-reject"
                              onClick={cancelEditReason}
                              disabled={savingReason}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              gap: 8,
                              alignItems: "center",
                            }}
                          >
                            <span
                              style={{
                                color: item.reason ? "inherit" : "#888",
                              }}
                            >
                              {item.reason || "N/A"}
                            </span>
                            <button
                              className="btn-edit-icon"
                              onClick={() => startEditReason(item)}
                              title="Edit reason"
                            >
                              <FaEdit />
                            </button>
                          </div>
                        )
                      ) : (
                        <span
                          style={{ color: item.reason ? "inherit" : "#888" }}
                        >
                          {item.reason || "N/A"}
                        </span>
                      )}
                    </td>
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
