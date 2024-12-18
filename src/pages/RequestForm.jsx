import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CustomMessagebox from "./CustomMessageBox.jsx";

const RequestForm = () => {
  const [boms, setBoms] = useState([]);
  const [selectedBom, setSelectedBom] = useState(null);
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

  useEffect(() => {
    fetch("http://127.0.0.1:8000/bom_list/")
      .then((response) => response.json())
      .then((data) => setBoms(data))
      .catch((error) => console.error("Error fetching BOMs:", error));

    // Fetch available components for adding
    fetch("http://127.0.0.1:8000/component/")
      .then((response) => response.json())
      .then((data) => setAvailableComponents(data))
      .catch((error) => console.error("Error fetching components:", error));

    // Fetch vendor master to get vendor_id by component_id
    fetch("http://127.0.0.1:8000/vendor_master/")
      .then((response) => response.json())
      .then((data) => setVendorMaster(data))
      .catch((error) => console.error("Error fetching vendor master:", error));

    // Fetch vendor list to get vendor names by vendor_id
    fetch("http://127.0.0.1:8000/vendor_list/")
      .then((response) => response.json())
      .then((data) => setVendorList(data))
      .catch((error) => console.error("Error fetching vendor list:", error));
  }, []);

  const handleBomChange = (event) => {
    const selectedBomId = event.target.value;
    const bom = boms.find((b) => b.bom_id === selectedBomId);
    setSelectedBom(bom);

    fetch("http://127.0.0.1:8000/bom_master/")
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
      alert("All available components have already been added.");
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
  
    if (!selectedComponent) {
      alert("Invalid component selected.");
      return;
    }
  
    // Check if the component is already in the table
    const isComponentAlreadySelected = selectedComponents.some(
      (comp, i) =>
        comp.component?.component_id === selectedComponent.component_id && i !== index
    );
  
    if (isComponentAlreadySelected) {
      alert("This component is already in the table.");
      return;
    }
  
    const updatedComponents = [...selectedComponents];
    updatedComponents[index].component = selectedComponent;
  
    // Step 1: Find vendor_id from vendor_master using component_id
    const vendorData = vendorMaster.find(
      (vendor) => vendor.product_id === selectedComponent.product_id
    );
  
    // Step 2: Use vendor_id to find vendor_name from vendor_list
    if (vendorData) {
      const vendor = vendorList.find(
        (v) => v.vendor_id === vendorData.vendor
      );
      updatedComponents[index].vendor = {
        vendor_name: vendor ? vendor.vendor_name : "N/A",
        vendor_id: vendor ? vendor.vendor_id : "",
        product_id: vendor ? vendor.product_id : "",
      };
    } else {
      updatedComponents[index].vendor = { vendor_name: "N/A" };
    }
  
    setSelectedComponents(updatedComponents);
  };
  
  // const bom_id_list = selectedBom ? selectedBom.bom_id : "";
  // const firstComponentId = selectedComponents[0]?.id || 3; // Default component added

  const handlePopupSubmit = async () => {
    // Validate popup input fields
    if (!popupData.name || !popupData.projectName || !popupData.bomId) {
      alert("Please fill in all fields.");
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


      
  
      const bomlistresponse = await fetch(
        "http://127.0.0.1:8000/bom_list/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bom_list),
        }
      );
  
      if (!bomlistresponse.ok) {
        const errorData = await bomlistresponse.json();
        console.error("Error in BOM list submission:", errorData);
        alert("Failed to save BOM. Please check the inputs.");
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
        fetch("http://127.0.0.1:8000/bom_master/", {
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
        date: date,
        status: "In Progress",
        last_modified_by: popupData.name,
      };
  
      const requestListResponse = await fetch(
        "http://127.0.0.1:8000/request_list/",
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
        alert("Failed to save the request. Please try again.");
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
      }));
  
      await Promise.all(
        requestMasterEntries.map((entry) =>
          fetch("http://127.0.0.1:8000/request_master/", {
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
      setTimeout(() => navigate("/"), 3000);
    } catch (error) {
      console.error("Error in submission process:", error);
      alert("An error occurred during submission. Please try again.");
    } finally {
      setShowPopup(false);
    }
  };
  
  const handleSubmit = async () => {
    if (newComponentsAdded || newComponentsDeleted) {
      // Show a confirmation dialog
      const saveNewBom = window.confirm("Do you want to save a new BOM?");
      
      if (saveNewBom) {
        // Show popup for entering details (name, BOM name, BOM ID)
        setShowPopup(true);
        return; // Wait for user to fill the popup and handle submission in the popup logic
      }
    }
  
    // If user doesn't want to save a new BOM or no new components were added/removed
    try {
      const requestListResponse = await fetch(
        "http://127.0.0.1:8000/request_list/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requester_name: requesterName,
            project_name: selectedBom ? selectedBom.bom_name : "Unnamed Project",
            bom_id: selectedBom ? selectedBom.bom_id : "",
            date,
            status: "In Progress",
            last_modified_by: requesterName,
          }),
        }
      );
  
      if (!requestListResponse.ok) {
        const errorData = await requestListResponse.json();
        console.error("Error in request list submission:", errorData);
        alert("Failed to save the request. Please try again.");
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
      }));
  
      await Promise.all(
        requestMasterEntries.map((entry) =>
          fetch("http://127.0.0.1:8000/request_master/", {
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
      setMessageBoxContent("Request submitted successfully!");
      setTimeout(() => navigate("/"), 3000);
    } catch (error) {
      console.error("Error in submission process:", error);
      alert("An error occurred during submission. Please try again.");
    }
  };

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
  
        <h1 style={{ marginBottom: "20px" }}>Create a Request</h1>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            padding: "20px",
            borderRadius: "5px",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            width: "300px",
          }}
        >
          <div style={{ marginBottom: "15px", width: "100%" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>
              Requester Name:
            </label>
            <input
              type="text"
              value={requesterName}
              onChange={(e) => setRequesterName(e.target.value)}
              placeholder="Enter requester name"
              required
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </div>
          <div style={{ marginBottom: "15px", width: "100%" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>Date:</label>
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
          </div>
        </div>
      </div>
  
      {selectedBom && (
        <div>
          <h3>Selected BOM: {selectedBom.bom_name}</h3>
          <h4>Components:</h4>
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
                  <td>
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
                            {comp.component_type}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td>
                    {component.component
                      ? component.component.component_specification
                      : "-"}
                  </td>
                  <td>
                    {component.component
                      ? component.component.unit_of_measurement
                      : "-"}
                  </td>
  
                  <td>
                    <input
                      type="number"
                      min="1"
                      value={component.quantity}
                      onChange={(e) =>
                        handleQuantityChange(index, e.target.value)
                      }
                    />
                  </td>
                  <td>{component.vendor.vendor_name}</td>
                  <td>
                    <button onClick={() => handleDeleteComponent(index)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={handleAddComponent}
            style={{
              padding: "10px 20px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              cursor: "pointer",
            }}
          >
            Add Component
          </button>
        </div>
      )}
  
      <button
        onClick={handleSubmit}
        style={{
          padding: "10px 20px",
          borderRadius: "5px",
          border: "1px solid #ccc",
          cursor: "pointer",
        }}
      >
        Submit Request
      </button>
      <button
        onClick={() => navigate("/")}
        style={{
          padding: "10px 20px",
          borderRadius: "5px",
          border: "1px solid #ccc",
          cursor: "pointer",
        }}
      >
        Save and Exit
      </button>
    </div>
  );
  };

export default RequestForm;