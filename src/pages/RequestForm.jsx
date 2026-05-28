import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CustomMessagebox from "./CustomMessageBox.jsx";
import config from "../Config"; // Import config for API endpoints
import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  showMessageToast,
  ToastContainerComponent,
} from "./Toastify.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, parseISO } from "date-fns";
import AddIcon from "../assets/Add.png";
import { useAuth } from "../AuthContext.jsx";

const RequestForm = () => {
  const [boms, setBoms] = useState([]);
  const [projects, setProjects] = useState([]); // State to store projects
  const [selectedBom, setSelectedBom] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null); // State for selected project
  const [selectedComponents, setSelectedComponents] = useState([]);
  const [availableComponents, setAvailableComponents] = useState([]);
  const navigate = useNavigate();
  const [vendorMaster, setVendorMaster] = useState([]); // Store data from vendor_master
  const [vendorList, setVendorList] = useState([]); // Store data from vendor_list
  const [requesterName, setRequesterName] = useState("");
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [messageBoxContent, setMessageBoxContent] = useState("");
  const [date, setDate] = useState("");
  const [showPopup, setShowPopup] = useState(false); // State to manage the popup visibility
  const [newComponentsAdded, setNewComponentsAdded] = useState(false);
  const [newComponentsDeleted, setNewComponentsDeleted] = useState(false);
  const [popupData, setPopupData] = useState({
    name: "",
    projectName: "",
    bomId: "",
  }); // State to manage popup input fields
  const { user, logout } = useAuth();

  useEffect(() => {
    if (user?.email) {
      setRequesterName(user.email.split("@")[0]);
    }
  }, [user]);

  useEffect(() => {
    fetch(`${config.apiBaseURL}/bom_list/`)
      .then((response) => response.json())
      .then((data) => setBoms(data))
      .catch((error) => console.error("Error fetching BOMs:", error));

    // Fetch available components for adding
    fetch(`${config.apiBaseURL}/component/`)
      .then((response) => response.json())
      .then((data) => setAvailableComponents(data))
      .catch((error) => console.error("Error fetching components:", error));

    // Fetch vendor master to get vendor_id by component_id
    fetch(`${config.apiBaseURL}/vendor_master/`)
      .then((response) => response.json())
      .then((data) => setVendorMaster(data))
      .catch((error) => console.error("Error fetching vendor master:", error));

    fetch(`${config.apiBaseURL}/project/`)
      .then((response) => response.json())
      .then((data) => setProjects(data))
      .catch((error) => console.error("Error fetching projects:", error));

    // Fetch vendor list to get vendor names by vendor_id
    fetch(`${config.apiBaseURL}/vendor_list/`)
      .then((response) => response.json())
      .then((data) => setVendorList(data))
      .catch((error) => console.error("Error fetching vendor list:", error));
  }, []);

  const handleBomChange = (event) => {
    const selectedBomId = event.target.value;
    const bom = boms.find((b) => b.bom_id === selectedBomId);
    setSelectedBom(bom);

    fetch(`${config.apiBaseURL}/bom_master/`)
      .then((response) => response.json())
      .then((data) => {
        // Filter components for the selected BOM
        const bomComponents = data.filter((b) => b.bom === selectedBomId);

        // Add vendor info and mark as fixed
        const componentsWithVendors = bomComponents.map((component) => {
          let vendorName = "N/A";
          if (component.vendor.vendor_name) {
            vendorName = component.vendor.vendor_name;
          } else {
            const vendorData = vendorList.find(
              (v) => v.vendor_id === component.vendor.vendor_id,
            );
            if (vendorData) vendorName = vendorData.vendor_name;
          }

          return {
            ...component,
            vendor: {
              ...component.vendor,
              vendor_name: vendorName,
            },
            fixed: true, // mark as pre-existing/fixed
          };
        });

        setSelectedComponents(componentsWithVendors);
      })
      .catch((error) => console.error("Error fetching BOM components:", error));
  };

  const handleProjectChange = (event) => {
    const selectedProjectId = event.target.value;
    const project = projects.find((p) => p.project_id === selectedProjectId);
    setSelectedProject(project);
  };

  const handleAddComponent = () => {
    // Check if all components are already added
    const availableIds = availableComponents.map((comp) => comp.component_id);
    const selectedIds = selectedComponents
      .filter((c) => c.component)
      .map((c) => c.component.component_id);

    const remainingIds = availableIds.filter((id) => !selectedIds.includes(id));

    if (remainingIds.length === 0) {
      showInfoToast("All available components have already been added.");
      return;
    }

    // Add new row at the top with vendorOptions initialized
    setSelectedComponents([
      {
        component: null,
        quantity: 1,
        vendor: { vendor_name: "N/A", vendor_id: "" },
        vendorOptions: [],
      },
      ...selectedComponents,
    ]);

    setNewComponentsAdded(true);
  };

  const handleDeleteComponent = (index) => {
    setSelectedComponents(selectedComponents.filter((_, i) => i !== index));
    setNewComponentsDeleted(true);
  };

  const handleQuantityChange = (index, quantity) => {
    const updatedComponents = [...selectedComponents];
    updatedComponents[index].quantity = quantity;
    setSelectedComponents(updatedComponents);
  };

  const handleComponentSelect = (index, componentId) => {
    const selectedComponent = availableComponents.find(
      (comp) => comp.component_id === componentId,
    );

    console.log("Selected component:", selectedComponent);

    if (!selectedComponent) {
      showErrorToast("Invalid component selected.");
      return;
    }

    const updatedComponents = [...selectedComponents];
    updatedComponents[index].component = selectedComponent;

    // Match vendors from vendor_master
    const vendorMatches = vendorMaster.filter(
      (vendorEntry) => vendorEntry.component_id === componentId,
    );

    console.log("Vendor matches found:", vendorMatches);

    const vendorOptions = vendorMatches
      .map((vm) => {
        const vendorDetails = vendorList.find((v) => v.vendor_id === vm.vendor);
        console.log("Vendor detail for vm.vendor", vm.vendor, vendorDetails);
        return vendorDetails;
      })
      .filter(Boolean);

    console.log("Vendor options resolved:", vendorOptions);

    updatedComponents[index].vendorOptions = vendorOptions;

    // Auto-select first vendor if available
    if (vendorOptions.length > 0) {
      updatedComponents[index].vendor = {
        vendor_id: vendorOptions[0].vendor_id,
        vendor_name: vendorOptions[0].vendor_name,
      };
    } else {
      updatedComponents[index].vendor = {
        vendor_id: "",
        vendor_name: "N/A",
      };
    }

    setSelectedComponents(updatedComponents);
  };

  // const bom_id_list = selectedBom ? selectedBom.bom_id : "";
  // const firstComponentId = selectedComponents[0]?.id || 3; // Default component added

  const handlePopupSubmit = async () => {
    // Validate popup input fields
    if (!popupData.name || !popupData.projectName || !popupData.bomId) {
      showInfoToast("Please fill in all fields.");
      return;
    }

    try {
      const bom_list = {
        bom_name: popupData.projectName,
        bom_id: popupData.bomId,
        created_by: popupData.name,
        last_modified_by: popupData.name,
        number_of_components: 1,
      };

      const bomlistresponse = await fetch(`${config.apiBaseURL}/bom_list/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bom_list),
      });

      if (!bomlistresponse.ok) {
        const errorData = await bomlistresponse.json();
        console.error("Error in BOM list submission:", errorData);
        showErrorToast("Failed to save BOM. Please check the inputs.");
        return;
      }

      console.log("BOM list added successfully.");

      // Step 2: Fetch the bom_id to use for BOM Master
      const bomlistData = await bomlistresponse.json();
      const bomId = bomlistData.bom_id;

      // Step 3: POST to bom_master for each selected component
      const bomMasterEntries = selectedComponents.map((component) => ({
        bom: bomId,
        component: component.component.component_id,
        vendor: component.vendor.vendor_id,
        quantity: component.quantity,
      }));

      const bomMasterPromises = bomMasterEntries.map((entry) =>
        fetch(`${config.apiBaseURL}/bom_master/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(entry),
        }),
      );

      await Promise.all(bomMasterPromises);
      console.log("All BOM master entries successfully added.");

      const newRequest = {
        requester_name: popupData.name,
        project_name: popupData.projectName,
        bom_id: popupData.bomId,
        bom: selectedBom ? selectedBom.bom_id : "",
        bom_name: selectedBom ? selectedBom.bom_name : "",
        date: date,
        status: "In Progress",
        last_modified_by: popupData.name,
      };

      const requestListResponse = await fetch(
        `${config.apiBaseURL}/request_list/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newRequest),
        },
      );

      if (!requestListResponse.ok) {
        const errorData = await requestListResponse.json();
        console.error("Error in request list submission:", errorData);
        showErrorToast("Failed to save the request. Please try again.");
        return;
      }

      const requestListData = await requestListResponse.json();
      const generatedRequestId = requestListData.request_id;

      const requestMasterEntries = selectedComponents.map((component) => ({
        request: generatedRequestId,
        component: component.component.component_id,
        vendor: component.vendor.vendor_id,
        qty: component.quantity,
        status: "Pending",
        assign: false,
        project_id: selectedProject ? selectedProject.project_id : null,
      }));

      await Promise.all(
        requestMasterEntries.map((entry) =>
          fetch(`${config.apiBaseURL}/request_master/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(entry),
          }),
        ),
      );

      console.log("All request master entries successfully added.");
      setShowMessageBox(true);
      setMessageBoxContent("Request and BOM added successfully!");
      setTimeout(() => navigate("/requests"), 3000);
    } catch (error) {
      console.error("Error in submission process:", error);
      showErrorToast("An error occurred during submission. Please try again.");
    } finally {
      setShowPopup(false);
    }
  };

  const handleSubmit = async () => {
    // If user doesn't want to save a new BOM or no new components were added/removed
    try {
      const requestListResponse = await fetch(
        `${config.apiBaseURL}/request_list/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requester_name: requesterName, // use the state here
            project_id: selectedProject ? selectedProject.project_id : null,
            project_name: selectedBom
              ? selectedBom.bom_name
              : "Unnamed Project",
            bom: selectedBom ? selectedBom.bom_id : "",
            bom_name: selectedBom ? selectedBom.bom_name : "",
            date,
            status: "In Progress",
            last_modified_by: requesterName,
          }),
        },
      );

      if (!requestListResponse.ok) {
        const errorData = await requestListResponse.json();
        console.error("Error in request list submission:", errorData);
        showErrorToast("Failed to save the request. Please try again.");
        return;
      }

      const requestListData = await requestListResponse.json();
      const generatedRequestId = requestListData.request_id;

      const requestMasterEntries = selectedComponents.map((component) => ({
        request: generatedRequestId,
        component: component.component.component_id,
        vendor: component.vendor.vendor_id,
        qty: component.quantity,
        status: "Pending",
        assign: false,
        project_id: selectedProject.project_id,
      }));

      await Promise.all(
        requestMasterEntries.map((entry) =>
          fetch(`${config.apiBaseURL}/request_master/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(entry),
          }),
        ),
      );

      // PATCH to the project endpoint using the generated request ID
      if (!selectedProject || !selectedProject.project_id) {
        throw new Error("Project ID is missing.");
      }

      const patchData = {
        RequestList_id: generatedRequestId,
        // project_status: "Updated", // Example field, replace with the actual field if needed
      };

      const projectPatchResponse = await fetch(
        `${config.apiBaseURL}/project/${selectedProject.project_id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(patchData),
        },
      );

      if (!projectPatchResponse.ok) {
        const patchErrorData = await projectPatchResponse.json();
        console.error("Error in project PATCH submission:", patchErrorData);
        showErrorToast("Failed to update the project. Please try again.");
        return;
      }

      console.log("All request master entries successfully added.");
      console.log("Project successfully updated with new request ID.");
      showSuccessToast("Request submitted successfully!");
      setTimeout(() => navigate("/requests"), 2000);
    } catch (error) {
      console.error("Error in submission process:", error);
      showErrorToast("An error occurred during submission. Please try again.");
    }
  };

  const formattedDate = format(new Date(), "dd-MM-yyyy");
  const handleCancel = () => {
    setSelectedProject(""); // clear project dropdown
    setSelectedBom(""); // clear bom dropdown
    navigate(-1);
  };

  const [componentOpenIndex, setComponentOpenIndex] = useState(null); // which row's dropdown is open
  const [componentSearches, setComponentSearches] = useState({}); // per-row search
  const [componentTypeCoords, setComponentTypeCoords] = useState({
    top: 0,
    left: 0,
  });
  const [dropdownHeight, setDropdownHeight] = useState(0);

  const dropdownRef = useRef(null);
  const componentDropdownRefs = useRef([]); // array of refs for each row

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        componentDropdownRefs.current.every(
          (ref) => ref && !ref.contains(e.target),
        )
      ) {
        setComponentOpenIndex(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDropdownTop = (index) => {
    const rect = componentDropdownRefs.current[index]?.getBoundingClientRect();
    if (!rect) return 0;

    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow >= dropdownHeight || spaceBelow >= spaceAbove) {
      return rect.bottom; // open downward
    } else {
      return rect.top - dropdownHeight; // open upward
    }
  };

  useEffect(() => {
    if (dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      setDropdownHeight(rect.height);
    }
  }, [componentOpenIndex]);

  return (
    <div>
      {/* Render Popup when showPopup is true */}
      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>Enter Submission Details</h3>
            <label>Name:</label>
            <input
              type="text"
              value={popupData.name}
              onChange={(e) =>
                setPopupData({ ...popupData, name: e.target.value })
              }
              placeholder="Enter Name"
            />
            <label>Project Name:</label>
            <input
              type="text"
              value={popupData.projectName}
              onChange={(e) =>
                setPopupData({ ...popupData, projectName: e.target.value })
              }
              placeholder="Enter Project Name"
            />
            <label>BOM ID:</label>
            <input
              type="text"
              value={popupData.bomId}
              onChange={(e) =>
                setPopupData({ ...popupData, bomId: e.target.value })
              }
              placeholder="Enter BOM ID"
            />
            <div style={{ marginTop: "10px" }}>
              <button onClick={handlePopupSubmit}>Submit</button>
              <button onClick={() => setShowPopup(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div>
        {/* Render CustomMessagebox when showMessageBox is true */}
        {showMessageBox && (
          <CustomMessagebox
            message={messageBoxContent}
            onClose={() => setShowMessageBox(false)}
          />
        )}

        <h1
          style={{
            marginBottom: "20px",
            marginTop: "20px",
            fontSize: "24px",
          }}
        >
          Create a Request
        </h1>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px 20px",
            alignItems: "end",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
            width: "1200px",
            maxWidth: "100%",
            backgroundColor: "#fff",
          }}
        >
          <div style={{ width: "100%" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "500",
              }}
            >
              Requester Name:
            </label>
            <input
              type="text"
              value={requesterName}
              readOnly
              placeholder="Enter requester name"
              required
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                backgroundColor: "#f5f5f5",
                cursor: "not-allowed",
                color: "#555",
                boxSizing: "border-box",
                height: "38px",
              }}
            />
          </div>

          <div className="date-input-container" style={{ width: "100%" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "500",
              }}
            >
              Date:
            </label>
            <input
              type="text"
              value={formattedDate}
              readOnly
              className="input1"
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                backgroundColor: "#f5f5f5",
                cursor: "not-allowed",
                color: "#555",
                boxSizing: "border-box",
                height: "38px",
              }}
            />
          </div>
          <div style={{ width: "100%" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "500",
              }}
            >
              Select Project:
            </label>
            <select
              onChange={handleProjectChange}
              value={selectedProject?.project_id || ""}
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                boxSizing: "border-box",
                height: "38px",
                backgroundColor: "#fff",
              }}
            >
              <option value="">Select Project</option>
              {projects.map((project) => (
                <option key={project.project_id} value={project.project_id}>
                  {`${project.project_id} - ${project.project_name}`}
                </option>
              ))}
            </select>
          </div>
          <div style={{ width: "100%" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "500",
              }}
            >
              Select BOM:
            </label>
            <select
              onChange={handleBomChange}
              value={selectedBom?.bom_id || ""}
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                boxSizing: "border-box",
                height: "38px",
                backgroundColor: "#fff",
              }}
            >
              <option value="">Select BOM</option>
              {boms.map((bom) => (
                <option key={bom.bom_id} value={bom.bom_id}>
                  {bom.bom_name}
                </option>
              ))}
            </select>
          </div>
          <div
            style={{
              gridColumn: "1 / -1",
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              marginTop: "5px",
            }}
          >
            <button
              className="edit-btn"
              style={{
                borderRadius: "5px",
                cursor: "pointer",
                padding: "8px 16px",
              }}
              onClick={handleSubmit}
            >
              Submit Request
            </button>

            <button
              className="cancel-btn"
              style={{
                borderRadius: "5px",
                cursor: "pointer",
                padding: "8px 16px",
              }}
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {selectedBom && (
        <div style={{ marginTop: "20px" }}>
          <h3>Selected BOM: {selectedBom.bom_name}</h3>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "10px",
            }}
          >
            <h4 style={{ margin: 0 }}>Components:</h4>

            <button
              onClick={handleAddComponent}
              style={{
                cursor: "pointer",
                background: "transparent",
                border: "none",
                padding: "6px",
              }}
              title="Add Component"
            >
              <img
                src={AddIcon}
                alt="Add Component"
                style={{ width: "20px", height: "20px" }}
              />
            </button>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Component Type</th>
                  <th>Specification</th>
                  <th>Unit</th>
                  <th>Quantity</th>
                  <th>Vendor Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {selectedComponents.map((component, index) => (
                  <tr key={index}>
                    <td
                      className="specification-cells"
                      ref={(el) => (componentDropdownRefs.current[index] = el)}
                    >
                      {component.fixed ? (
                        // Pre-existing/fixed component → show as text only
                        <span>{component.component.component_type}</span>
                      ) : (
                        // Newly added component → show dropdown with search
                        <div className="multi-select">
                          <div
                            className="multi-select-box"
                            onClick={() =>
                              setComponentOpenIndex(
                                componentOpenIndex === index ? null : index,
                              )
                            }
                          >
                            <span className="selected-names">
                              {component.component
                                ? component.component.component_type
                                : "Select Component"}
                            </span>
                            <span className="dropdown-caret">▾</span>
                          </div>

                          {componentOpenIndex === index && (
                            <div
                              ref={dropdownRef}
                              className="multi-select-dropdown"
                              style={{
                                position: "fixed",
                                top: getDropdownTop(index),
                                left:
                                  componentTypeCoords.left ||
                                  componentDropdownRefs.current[
                                    index
                                  ]?.getBoundingClientRect().left,
                                minWidth:
                                  componentDropdownRefs.current[index]
                                    ?.offsetWidth,
                                zIndex: 9999,
                              }}
                            >
                              <input
                                type="text"
                                placeholder="Search components..."
                                value={componentSearches[index] || ""}
                                onChange={(e) =>
                                  setComponentSearches({
                                    ...componentSearches,
                                    [index]: e.target.value,
                                  })
                                }
                                className="multi-select-input"
                              />
                              {(() => {
                                const filteredComponents =
                                  availableComponents.filter(
                                    (comp) =>
                                      comp.component_type
                                        .toLowerCase()
                                        .includes(
                                          (
                                            componentSearches[index] || ""
                                          ).toLowerCase(),
                                        ) ||
                                      comp.component_specification
                                        .toLowerCase()
                                        .includes(
                                          (
                                            componentSearches[index] || ""
                                          ).toLowerCase(),
                                        ) ||
                                      (comp.component_code || "")
                                        .toLowerCase()
                                        .includes(
                                          (
                                            componentSearches[index] || ""
                                          ).toLowerCase(),
                                        ) ||
                                      (comp.ref || "")
                                        .toLowerCase()
                                        .includes(
                                          (
                                            componentSearches[index] || ""
                                          ).toLowerCase(),
                                        ),
                                  );

                                if (filteredComponents.length === 0) {
                                  return (
                                    <div className="multi-select-no-results">
                                      No results found for "
                                      {componentSearches[index]}"
                                    </div>
                                  );
                                }

                                return filteredComponents.map((comp) => (
                                  <div
                                    key={comp.component_id}
                                    className="multi-select-item"
                                    onClick={() => {
                                      handleComponentSelect(
                                        index,
                                        comp.component_id,
                                      );
                                      setComponentOpenIndex(null);
                                      setComponentSearches({
                                        ...componentSearches,
                                        [index]: "",
                                      });
                                    }}
                                  >
                                    {comp.component_type} -{" "}
                                    {comp.component_specification}{" "}
                                    {comp.component_code
                                      ? `(${comp.component_code})`
                                      : ""}{" "}
                                    {comp.ref ? `[${comp.ref}]` : ""}
                                  </div>
                                ));
                              })()}
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Other cells remain the same */}
                    <td
                      className="specification-cell"
                      title={
                        component.component?.component_specification || "-"
                      }
                    >
                      {component.component?.component_specification || "-"}
                    </td>
                    <td>{component.component?.unit_of_measurement || "-"}</td>
                    <td className="quantity-cell">
                      <input
                        type="number"
                        min="1"
                        value={component.quantity}
                        onChange={(e) =>
                          handleQuantityChange(index, e.target.value)
                        }
                      />
                    </td>
                    <td className="specification-cells">
                      {component.vendorOptions?.length > 0 ? (
                        <select
                          value={component.vendor?.vendor_id || ""}
                          onChange={(e) => {
                            const updated = [...selectedComponents];
                            const vendor = component.vendorOptions.find(
                              (v) => v.vendor_id === e.target.value,
                            );
                            updated[index].vendor = {
                              vendor_name: vendor.vendor_name,
                              vendor_id: vendor.vendor_id,
                            };
                            setSelectedComponents(updated);
                          }}
                        >
                          <option value="">Select Vendor</option>
                          {component.vendorOptions.map((v) => (
                            <option key={v.vendor_id} value={v.vendor_id}>
                              {v.vendor_name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        component.vendor?.vendor_name || "N/A"
                      )}
                    </td>
                    <td>
                      <button
                        className="cancel-button"
                        onClick={() => handleDeleteComponent(index)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default RequestForm;
