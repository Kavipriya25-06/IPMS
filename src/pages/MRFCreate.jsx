import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import config from "../Config"; // Import config for API endpoints
import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  ToastContainerComponent,
} from "./Toastify.jsx"; // Import Toastify utilities
import AddIcon from "../assets/Add.png";
import { useAuth } from "../AuthContext"; // adjust the path
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

const MRFCreate = () => {
  const [requestList, setRequestList] = useState([]);
  const [availableRequests, setAvailableRequests] = useState([]);
  const [requestDetails, setRequestDetails] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState("");
  const [materialRequest, setMaterialRequest] = useState([]);
  const [projectDetails, setProjectDetails] = useState([]);
  const [projectName, setProjectName] = useState("");
  const { user } = useAuth(); //  gets the current user
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [selectedItems, setSelectedItems] = useState({}); // Stores selected rows
  const [newRows, setNewRows] = useState([]); // Store added rows
  const navigate = useNavigate();
  const [requesterName, setRequesterName] = useState("");

  const [mrfOpenIndex, setMrfOpenIndex] = useState(null);
  const [mrfSearches, setMrfSearches] = useState({});
  const [dropdownHeight, setDropdownHeight] = useState(0);

  const mrfDropdownRefs = useRef([]); // array of refs for each row
  const dropdownRef = useRef(null);
  const [mrfTypeCoords, setMrfTypeCoords] = useState({
    top: 0,
    left: 0,
  });

  useEffect(() => {
    if (user?.email) {
      setRequesterName(user.email.split("@")[0]);
    }
  }, [user]);
  useEffect(() => {
    if (dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      setDropdownHeight(rect.height);
    }
  }, [mrfOpenIndex]);

  useEffect(() => {
    fetchRequestList();
    fetchProjectDetails();
  }, []);

  const fetchRequestList = async () => {
    try {
      // const response = await fetch(`${config.apiBaseURL}/request_master/`);
      const response = await fetch(`${config.apiBaseURL}/inventory/`);
      const data = await response.json();
      const filteredRequests = data.filter(
        (item) => item.status === "Reserved"
      );
      const availableRequests = data.filter(
        (item) => item.status === "Available"
      );
      setAvailableRequests(availableRequests);
      const uniqueRequests = [
        ...new Set(filteredRequests.map((item) => item.Request_id_assign)),
      ];
      setRequestList(uniqueRequests);
    } catch (err) {
      console.error("Error fetching request list:", err);
    }
  };

  const fetchProjectDetails = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/request_inventory/`);
      const data = await response.json();
      setProjectDetails(data);
    } catch (err) {
      console.error("Error fetching project details: ", err);
    }
  };

  const handleRequestChange = async (event) => {
    const requestId = event.target.value;
    setSelectedRequest(requestId);
    try {
      //const response = await fetch(`${config.apiBaseURL}/request_master/`);
      const response = await fetch(`${config.apiBaseURL}/inventory/`);
      const data = await response.json();
      const filteredData = data.filter(
        (item) =>
          item.Request_id_assign === requestId && item.status === "Reserved"
      );
      setRequestDetails(filteredData);

      const filteredProjectData = projectDetails.filter(
        (item) => item.request_id === requestId
      );

      if (filteredProjectData.length > 0) {
        setProjectName(filteredProjectData[0].project_details.project_name);
      }
    } catch (err) {
      console.error("Error fetching material request details:", err);
    }
  };

  const handleCheckboxChange = (serialNumber) => {
    setSelectedItems((prev) => ({
      ...prev,
      [serialNumber]: !prev[serialNumber], // Toggle the selection
    }));
  };

  const handleAddRow = () => {
    setNewRows([
      ...newRows,
      {
        component_type: "",
        specification: "",
        serial_number: "",
        checked: false,
      },
    ]);
  };

  const handleNewRowChange = (index, value) => {
    const [componentType, specification] = value.split("||");

    // Count how many times this component is already selected
    const alreadySelectedCount = newRows.filter(
      (row) =>
        row.component_type === componentType &&
        row.specification === specification
    ).length;

    const availableComponentSerials = availableRequests.filter(
      (item) =>
        item.component_type === componentType &&
        item.specification === specification &&
        item.status === "Available"
    );

    if (alreadySelectedCount >= availableComponentSerials.length) {
      showWarningToast(
        "This component has been selected more than available quantity."
      );
      return;
    }

    const assignedSerials = newRows
      .filter(
        (row) =>
          row.component_type === componentType &&
          row.specification === specification
      )
      .map((row) => row.serial_number);

    const nextAvailable = availableComponentSerials.find(
      (item) => !assignedSerials.includes(item.serial_number)
    );

    if (!nextAvailable) {
      showWarningToast("No more available serial numbers for this component.");
      return;
    }

    const updatedRows = [...newRows];
    updatedRows[index] = {
      component_type: componentType,
      specification: specification,
      serial_number: nextAvailable.serial_number,
      checked: true,
    };
    setNewRows(updatedRows);
  };

  const handleNewRowCheckbox = (index) => {
    const updatedRows = [...newRows];
    updatedRows[index].checked = !updatedRows[index].checked;
    setNewRows(updatedRows);
  };
  //  Select All handler
  const handleToggleSelectAll = () => {
    // determine if currently everything is selected
    const allRequestSelected =
      requestDetails.length > 0 &&
      requestDetails.every((row) => selectedItems[row.serial_number]);
    const allNewRowsSelected =
      newRows.length === 0 || newRows.every((row) => row.checked);
    const currentlyAllSelected =
      requestDetails.length + newRows.length > 0 &&
      allRequestSelected &&
      allNewRowsSelected;

    const newValue = !currentlyAllSelected;

    // update reserved rows selection
    const updatedSelectedItems = { ...selectedItems };
    requestDetails.forEach((row) => {
      updatedSelectedItems[row.serial_number] = newValue;
    });
    setSelectedItems(updatedSelectedItems);
    // update new rows selection
    setNewRows((prev) => prev.map((row) => ({ ...row, checked: newValue })));
  };

  // computed "select all" checked state
  const allRequestSelected =
    requestDetails.length > 0 &&
    requestDetails.every((row) => selectedItems[row.serial_number]);
  const allNewRowsSelected =
    newRows.length === 0 || newRows.every((row) => row.checked);
  const isAllSelected =
    requestDetails.length + newRows.length > 0 &&
    allRequestSelected &&
    allNewRowsSelected;

  const handleCreateMRF = async () => {
    const selectedRows = requestDetails.filter(
      (row) => selectedItems[row.serial_number]
    );

    const formattedDate = date ? format(date, "yyyy-MM-dd") : null;

    // Include newly added rows
    const additionalSelectedRows = newRows
      .filter((row) => row.checked && row.serial_number)
      .map((row) =>
        availableRequests.find(
          (item) => item.serial_number === row.serial_number
        )
      );

    const finalRows = [...selectedRows, ...additionalSelectedRows];
    console.log("FInal rows", finalRows);

    // if (selectedRows.length === 0) {
    //   showWarningToast("Please select at least one item.");
    //   return;
    // }

    if (finalRows.length === 0) {
      showWarningToast("Please select at least one item.");
      return;
    }

    if (!requesterName) {
      showWarningToast("Please enter a name.");
      return;
    }
    if (!date) {
      showWarningToast("Please enter a date.");
      return;
    }

    // Step 1: Create MRF Entry
    const mrfPayload = {
      name: requesterName, // use the state here
      date: formattedDate,
      Request_id_assign: selectedRequest ? selectedRequest : "",
    };

    try {
      const mrfResponse = await fetch(`${config.apiBaseURL}/create_MRF/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mrfPayload),
      });

      if (!mrfResponse.ok) {
        const errorResponse = await mrfResponse.json();
        console.error("Error creating MRF:", errorResponse);
        showErrorToast(`Error creating MRF: ${JSON.stringify(errorResponse)}`);
        return;
      }

      const mrfData = await mrfResponse.json();
      const mrfId = mrfData.MRF_id;

      // Step 2: Add Items to MRF List
      for (const row of finalRows) {
        const mrfListPayload = {
          MRF_id: mrfId, // Link to created MRF
          serial_number: row.serial_number,
          component_type: row.component_type,
          component_specification: row.specification,
          unit_of_measurement: row.UOM,
          category: row.category,
          status: row.status || "",
          action: true,
        };

        const mrfListResponse = await fetch(`${config.apiBaseURL}/MRFList/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(mrfListPayload),
        });

        if (!mrfListResponse.ok) {
          const errorResponse = await mrfListResponse.json();
          console.error("Error adding item to MRF List:", errorResponse);
          showErrorToast(`Error adding item: ${JSON.stringify(errorResponse)}`);
          return;
        }
      }

      showSuccessToast("MRF and items created successfully!");
      // navigate("/MrfRequest");
      setTimeout(() => navigate("/Mrf"), 1500);
    } catch (err) {
      console.error("Error during MRF creation:", err);
      showErrorToast("An error occurred while creating the MRF.");
    }
  };

  return (
    <div style={{ paddingBottom: "50px", fontFamily: "Arial, sans-serif" }}>
      <h2>Material Request Form</h2>

      <div
        style={{
          marginTop: "20px",
          display: "flex",
          alignContent: "space-between",
          gap: "50px",
        }}
        className="material-form"
      >
        <div>
          <label className="request-selector-label">
            Products for Request ID:
          </label>
          <select
            value={selectedRequest}
            onChange={handleRequestChange}
            className="request-selector-dropdown"
          >
            <option value="">-- Select Request --</option>
            {requestList.map((request) => (
              <option key={request} value={request}>
                {request}
              </option>
            ))}
          </select>
          <h3 className="project-name-display">
            Project Name: {projectName || ""}
          </h3>
        </div>

        <div className="custom-form-wrapper">
          <div className="custom-form-field">
            <label className="custom-form-label">Name:</label>
            <input
              type="text"
              value={requesterName}
              readOnly
              className="custom-form-input"
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
          <div className="custom-form-field">
            <label className="custom-form-label">Date:</label>
            <div className="date-input-container" style={{ width: "220px" }}>
              <DatePicker
                selected={date}
                onChange={(date) => setDate(date)}
                dateFormat="dd-MM-yyyy"
                placeholderText="dd-mm-yyyy"
                className="input1"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                required
              />
              <i className="fas fa-calendar-alt calendar-icon"></i>{" "}
            </div>
          </div>
        </div>
      </div>

      <div className="table-container" style={{ marginTop: "20px" }}>
        <table border="1" cellPadding="5" cellSpacing="0" width="100%">
          <thead>
            <tr style={{ backgroundColor: "#f2f2f2" }}>
              <th>Component Type</th>
              <th>Component Specification</th>
              <th>Unit of Measurement</th>
              <th>Category</th>
              <th>Vendor Name</th>
              <th>Serial Number</th>
              <th>Status</th>
              <th>
                <div style={{ marginTop: "4px" }}>
                  <input
                    type="checkbox"
                    checked={isAllSelected} // <-- from state we computed
                    onChange={handleToggleSelectAll} // <-- toggles all checkboxes
                  />{" "}
                  Actions
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {requestDetails.map((row) => (
              <tr key={row.serial_number}>
                <td>{row.component_type}</td>
                <td>{row.specification}</td>
                <td>{row.UOM}</td>
                <td>{row.category}</td>
                <td>{row.vendor_name}</td>
                <td>{row.serial_number}</td>
                <td>{row.status}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedItems[row.serial_number] || false}
                    onChange={() => handleCheckboxChange(row.serial_number)}
                  />
                </td>
              </tr>
            ))}
            {newRows.map((row, index) => {
              // const selectedItem = availableRequests.find(
              //   (item) => item.serial_number === row.serial_number
              // );

              const uniqueOptions = Array.from(
                new Map(
                  availableRequests.map((item) => [
                    item.component_id, // deduplicate key
                    item,
                  ])
                ).values()
              );

              const selectedItem = availableRequests.find(
                (item) => item.serial_number === row.serial_number
              );

              return (
                <tr key={`new-${index}`}>
                  <td
                    className="specification-cells"
                    style={{ position: "relative" }}
                    ref={(el) => (mrfDropdownRefs.current[index] = el)}
                  >
                    <div className="multi-select">
                      <div
                        className="multi-select-box"
                        onClick={() =>
                          setMrfOpenIndex(mrfOpenIndex === index ? null : index)
                        }
                      >
                        <span className="selected-names">
                          {row.component_type
                            ? `${row.component_type} - ${row.specification}`
                            : "Select Component"}
                        </span>
                        <span className="dropdown-caret">▾</span>
                      </div>

                      {mrfOpenIndex === index && (
                        <div
                          ref={dropdownRef}
                          className="multi-select-dropdown"
                          style={{
                            position: "fixed",
                            top: (() => {
                              const rect =
                                mrfDropdownRefs.current[
                                  index
                                ]?.getBoundingClientRect();
                              if (!rect) return 0;
                              const viewportHeight = window.innerHeight;
                              const dropdownHeight =
                                dropdownRef.current?.offsetHeight || 200;
                              const spaceBelow = viewportHeight - rect.bottom;
                              const spaceAbove = rect.top;

                              return spaceBelow >= dropdownHeight ||
                                spaceBelow >= spaceAbove
                                ? rect.bottom + window.scrollY
                                : rect.top + window.scrollY - dropdownHeight;
                            })(),
                            left:
                              mrfDropdownRefs.current[
                                index
                              ]?.getBoundingClientRect().left + "px",
                            minWidth:
                              mrfDropdownRefs.current[
                                index
                              ]?.getBoundingClientRect().width + "px",
                            zIndex: 9999,
                            maxHeight: "200px",
                            overflowY: "auto",
                            background: "#fff",
                            border: "1px solid #ccc",
                          }}
                        >
                          <input
                            type="text"
                            placeholder="Search components..."
                            value={mrfSearches[index] || ""}
                            onChange={(e) =>
                              setMrfSearches({
                                ...mrfSearches,
                                [index]: e.target.value,
                              })
                            }
                            className="multi-select-input"
                            style={{
                              padding: "5px",
                              width: "100%",
                              boxSizing: "border-box",
                            }}
                          />

                          {(() => {
                            const filteredComponents = availableRequests
                              .filter((item) => item.status === "Available")
                              .filter((item) =>
                                `${item.component_type} - ${item.specification}`
                                  .toLowerCase()
                                  .includes(
                                    (mrfSearches[index] || "").toLowerCase()
                                  )
                              );

                            if (filteredComponents.length === 0) {
                              return (
                                <div
                                  className="multi-select-no-results"
                                  style={{ padding: "5px" }}
                                >
                                  No components found for "{mrfSearches[index]}"
                                </div>
                              );
                            }

                            return filteredComponents.map((item) => (
                              <div
                                key={item.serial_number}
                                className="multi-select-item"
                                onClick={() => {
                                  handleNewRowChange(
                                    index,
                                    `${item.component_type}||${item.specification}`
                                  );
                                  setMrfOpenIndex(null);
                                  setMrfSearches({
                                    ...mrfSearches,
                                    [index]: "",
                                  });
                                }}
                                style={{ padding: "5px", cursor: "pointer" }}
                              >
                                {item.component_type} - {item.specification}
                              </div>
                            ));
                          })()}
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="specification-cell">
                    {selectedItem?.specification || "-"}
                  </td>
                  <td>{selectedItem?.UOM || "-"}</td>
                  <td>{selectedItem?.category || "-"}</td>
                  <td>{selectedItem?.vendor_name || "-"}</td>
                  <td>-</td>
                  <td>{selectedItem ? selectedItem.status : "Available"}</td>

                  <td>
                    <input
                      type="checkbox"
                      checked={row.checked || false}
                      onChange={() => handleNewRowCheckbox(index)}
                    />
                  </td>
                </tr>
              );
            })}
            <tr>
              <td>
                <button
                  style={{
                    cursor: "pointer",
                    marginLeft: "auto",
                    marginRight: 20,
                    background: "transparent",
                    border: "none",
                  }}
                  className="plus-button"
                  title={"Add MRF"}
                  onClick={handleAddRow}
                >
                  <img
                    src={AddIcon}
                    alt=""
                    style={{ width: "17px", height: "17px" }}
                  />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "10px",
          marginTop: "20px",
        }}
      >
        <button
          onClick={handleCreateMRF}
          disabled={!selectedRequest && newRows.length === 0}
          style={{
            padding: "10px 15px",
            border: "none",
            cursor: "pointer",
            borderRadius: "5px",
          }}
          className="save-button"
        >
          Create MRF
        </button>{" "}
        <button
          onClick={() => navigate("/mrf")}
          style={{
            padding: "10px 15px",

            border: "none",
            cursor: "pointer",
            borderRadius: "5px",
          }}
          className="delete-button"
        >
          Cancel
        </button>
      </div>
      <ToastContainerComponent />
    </div>
  );
};

export default MRFCreate;
