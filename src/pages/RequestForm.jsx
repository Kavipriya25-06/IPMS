import React, { useState, useEffect } from "react";
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
        const bomComponents = data.filter((b) => b.bom === selectedBomId);

        // If vendor_name is already provided, use it; otherwise, look up by vendor_id
        const componentsWithVendors = bomComponents.map((component) => {
          if (component.vendor.vendor_name) {
            return component; // Use the vendor_name from BOM data
          } else {
            // If vendor_name isn't in the BOM data, use vendor_id lookup
            const vendorData = vendorList.find(
              (v) => v.vendor_id === component.vendor.vendor_id
            );
            return {
              ...component,
              vendor: {
                ...component.vendor,
                vendor_name: vendorData ? vendorData.vendor_name : "N/A",
              },
            };
          }
        });
        setSelectedComponents(componentsWithVendors);
        // setSelectedComponents(bomComponents);
      })
      .catch((error) => console.error("Error fetching BOM components:", error));
  };

  const handleProjectChange = (event) => {
    const selectedProjectId = event.target.value;
    const project = projects.find((p) => p.project_id === selectedProjectId);
    setSelectedProject(project);
  };

  const handleAddComponent = () => {
    setSelectedComponents([
      ...selectedComponents,
      { component: null, quantity: 1, vendor: { vendor_name: "N/A" } },
    ]);
    setNewComponentsAdded(true); // Mark that a new component has been added

    // Check if all components are already added
    const availableIds = availableComponents.map((comp) => comp.component_id);
    const remainingIds = availableIds.filter((id) => !selectedIds.includes(id));

    if (remainingIds.length === 0) {
      showInfoToast("All available components have already been added.");
      return;
    }

    // Add a blank row for selecting a new component
    setSelectedComponents([
      ...selectedComponents,
      { component: null, quantity: 1, vendor: { vendor_name: "N/A" } },
    ]);
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
      (comp) => comp.component_id === componentId
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
      (vendorEntry) => vendorEntry.component_id === componentId
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
        })
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
        }
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
        status: "pending",
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
          })
        )
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
    // if (newComponentsAdded || newComponentsDeleted) {
    //   // Show a confirmation dialog
    //   const saveNewBom = window.confirm("Do you want to save a new BOM?");

    //   if (saveNewBom) {
    //     // Show popup for entering details (name, BOM name, BOM ID)
    //     setShowPopup(true);
    //     return; // Wait for user to fill the popup and handle submission in the popup logic
    //   }
    // }

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
        }
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
        status: "pending",
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
          })
        )
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
        }
      );

      if (!projectPatchResponse.ok) {
        const patchErrorData = await projectPatchResponse.json();
        console.error("Error in project PATCH submission:", patchErrorData);
        showErrorToast("Failed to update the project. Please try again.");
        return;
      }

      ///////////////// Email notification
      //  // POST to new_submit_notification endpoint
      //  const notificationData = {
      //   request_id: generatedRequestId,
      //   requester_name: requesterName,
      //   project_id: selectedProject ? selectedProject.project_id : null,
      // };

      // const notificationResponse = await fetch(
      //   `${config.apiBaseURL}/new_submit_notification/`,
      //   {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify(notificationData),
      //   }
      // );

      // if (!notificationResponse.ok) {
      //   const notificationErrorData = await notificationResponse.json();
      //   console.error("Error in notification submission:", notificationErrorData);
      //   alert("Failed to send the notification. Please try again.");
      //   return;
      // }

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
              <button
                onClick={handlePopupSubmit}
                // style={{
                //   padding: "10px",
                //   marginRight: "10px",
                //   borderRadius: "5px",
                //   backgroundColor: "#007bff",
                //   color: "#fff",
                //   cursor: "pointer",
                //   border: "none",
                // }}
              >
                Submit
              </button>
              <button
                onClick={() => setShowPopup(false)}
                // style={{
                //   padding: "10px",
                //   borderRadius: "5px",
                //   backgroundColor: "#6c757d",
                //   color: "#fff",
                //   cursor: "pointer",
                //   border: "none",
                // }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div
      // style={{
      //   display: "flex",
      //   flexDirection: "column",
      //   justifyContent: "flex-start",
      //   height: "55vh",
      //   paddingTop: "20px",
      // }}
      >
        {/* Render CustomMessagebox when showMessageBox is true */}
        {showMessageBox && (
          <CustomMessagebox
            message={messageBoxContent}
            onClose={() => setShowMessageBox(false)}
          />
        )}

        <h1
          style={{ marginBottom: "20px", marginTop: "20px", fontSize: "24px" }}
        >
          Create a Request
        </h1>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            padding: "20px",
            borderRadius: "5px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
            width: "300px",
          }}
        >
          <div style={{ marginBottom: "15px", width: "95%" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>
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
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                backgroundColor: "#f5f5f5", // light gray background
                cursor: "not-allowed", // show "disabled" cursor
                color: "#555", // softer text color
              }}
            />
          </div>

          <div
            className="date-input-container"
            style={{ marginBottom: "15px", width: "100%" }}
          >
            <label style={{ display: "block", marginBottom: "5px" }}>
              Date:
            </label>
            <input
              type="text"
              value={formattedDate}
              readOnly
              className="input1"
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                backgroundColor: "#f5f5f5", // light gray background
                cursor: "not-allowed", // show "disabled" cursor
                color: "#555", // softer text color
              }}
            />
          </div>

          {/* <div style={{ marginBottom: "15px", width: "95%" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>
              Date:
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </div> */}

          <div style={{ marginBottom: "15px", width: "100%" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>
              Select Project:
            </label>
            <select
              onChange={handleProjectChange}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
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
          <div style={{ marginBottom: "15px", width: "100%" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>
              Select BOM:
            </label>
            <select
              onChange={handleBomChange}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            >
              <option value="">Select BOM</option>
              {boms.map((bom) => (
                <option key={bom.bom_id} value={bom.bom_id}>
                  {bom.bom_name}
                </option>
              ))}
            </select>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                className="edit-btn"
                style={{
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  cursor: "pointer",
                  marginTop: "20px",
                }}
                onClick={handleSubmit}
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      </div>

      {selectedBom && (
        <div>
          <h3>Selected BOM: {selectedBom.bom_name}</h3>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
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
                src={AddIcon} // replace with your image path or import
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
                    <td className="specification-cells">
                      {component.component ? (
                        component.component.component_type
                      ) : (
                        <select
                          onChange={(e) =>
                            handleComponentSelect(index, e.target.value)
                          }
                        >
                          <option value="">Select Component</option>
                          {availableComponents.map((comp) => (
                            <option
                              key={comp.component_id}
                              value={comp.component_id}
                            >
                              {`${comp.component_type} - ${comp.component_specification}`}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td
                      className="specification-cell"
                      title={
                        component.component?.component_specification || "-"
                      }
                    >
                      {component.component
                        ? component.component.component_specification
                        : "-"}
                    </td>
                    <td>
                      {component.component
                        ? component.component.unit_of_measurement
                        : "-"}
                    </td>

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
                      {component.vendorOptions &&
                      component.vendorOptions.length > 0 ? (
                        <select
                          value={component.vendor?.vendor_id || ""}
                          onChange={(e) => {
                            const updated = [...selectedComponents];
                            const vendor = component.vendorOptions.find(
                              (v) => v.vendor_id === e.target.value
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
          {/* <button
            onClick={handleAddComponent}
            className="edit-button"
            style={{
              padding: "10px 15px",
              borderRadius: "5px",
              cursor: "pointer",
              marginTop: "-30px",
              zIndex: 1000,
              position: "fixed",
            }}
          >
            Add Component
          </button> */}
        </div>
      )}

      <ToastContainer />
      {/* <button
        onClick={() => navigate("/requests")}
        style={{
          padding: "10px 20px",
          borderRadius: "5px",
          border: "1px solid #ccc",
          cursor: "pointer",
        }}
      >
        Save and Exit
      </button> */}
    </div>
  );
};

export default RequestForm;
