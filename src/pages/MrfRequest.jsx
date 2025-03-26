import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import config from "../Config"; // Ensure this file exists
import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
} from "./Toastify.jsx"; // Import Toastify utilities

const Mrfrequest = () => {
  const { MRF_id } = useParams();
  const navigate = useNavigate();

  const [mrfData, setMrfData] = useState([]); // Stores create_MRF data
  const [mrfListData, setMrfListData] = useState([]); // Stores mrf_list data
  const [approvalStatus, setApprovalStatus] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const [showSerialPopup, setShowSerialPopup] = useState(false); // new popup
  const [alternativeSerials, setAlternativeSerials] = useState([]); // new state
  const [selectedItemForAssign, setSelectedItemForAssign] = useState(null); // new state

  const [selectedSerial, setSelectedSerial] = useState(null);
  const [selectedMRF, setSelectedMRF] = useState(null);
  const [reportedBy, setReportedBy] = useState("");
  const [remarks, setRemarks] = useState("");
  const [returnStatus, setReturnStatus] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showQCPopup, setShowQCPopup] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    qc_select: "",
    description: "",
    Good: false,
    bad: false,
    remark: "",
    component_id: null,
  }); // State for new question

  useEffect(() => {
    fetchMrfData();
    fetchMrfListData();
  }, [MRF_id]);

  // Fetch `create_MRF` data
  const fetchMrfData = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/create_MRF/`);
      const data = await response.json();
      const filteredData = data.find((item) => item.MRF_id === MRF_id);
      setMrfData(data);
      setMrfData(filteredData)
      setApprovalStatus(filteredData.approval);
      console.log("Approval", filteredData);
      console.log("Approval");
    } catch (error) {
      console.error("Error fetching MRF data:", error);
    }
  };

  // Fetch `mrf_list` data
  const fetchMrfListData = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/MRFList/`);
      const data = await response.json();
      const filtered = data.filter((item) => item.MRF_id === MRF_id);
      setMrfListData(filtered);
    } catch (error) {
      console.error("Error fetching MRF List data:", error);
    }
  };

  const handleApproval = async () => {
    try {
      const response = await fetch(
        `${config.apiBaseURL}/create_MRF/${MRF_id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ approval: true }),
        }
      );
      if (response.ok) {
        showSuccessToast("MRF Approved Successfully");
        setApprovalStatus(true);
      } else {
        showErrorToast("Failed to approve MRF");
      }
    } catch (error) {
      console.error("Error updating approval status:", error);
    }
  };

  const handleAssign = async (serialNumber, MRFListId, item) => {
    try {
      // Fetch all inventory data
      const response = await fetch(`${config.apiBaseURL}/inventory/`);
      if (!response.ok) {
        throw new Error("Failed to fetch inventory data");
      }
      const inventoryData = await response.json();
  
      // If status is not "Available", assign directly
      const currentItem = inventoryData.find(inv => inv.serial_number === serialNumber);
      if (!currentItem) {
        showErrorToast("Serial number not found in inventory.");
        return;
      }
  
      if (currentItem.status !== "Available") {
        await assignSerial(serialNumber, MRFListId);
        return;
      }
  
      // Else, find the next available serial number matching component & specification
      const availableOptions = inventoryData.filter(
        (inv) =>
          inv.component_type?.toLowerCase().trim() === item.component_type?.toLowerCase().trim() &&
          inv.specification?.toLowerCase().trim() ===
            (item.component_specification?.toLowerCase().trim() || item.specification?.toLowerCase().trim()) &&
          inv.status === "Available"
      );
  
      if (availableOptions.length === 0) {
        showWarningToast("No available serial numbers found for this component.");
        return;
      }
  
      // Assign the first available serial number
      await assignSerial(availableOptions[0].serial_number, MRFListId);
    } catch (error) {
      console.error("Error during assignment:", error);
      showErrorToast("Error during direct assignment process");
    }
  };

  const handleQCClick = async (item) => {
    const componentType = item.component_type.toLowerCase();

    if (!componentType) {
      alert("Component Type not available. Cannot fetch QC questions.");
      return;
    }

    try {
      const response = await fetch(`${config.apiBaseURL}/qc_question/`);
      if (!response.ok) {
        console.error("Error fetching QC questions:", await response.text());
        alert("Failed to fetch QC questions.");
        return;
      }

      const qcQuestions = await response.json();

      // Filter questions based on the component_type
      const filteredQuestions = qcQuestions.filter(
        (question) => question.component_type.toLowerCase() === componentType
      );

      if (filteredQuestions.length === 0) {
        console.log("No questions available");
        return;
      }
      console.log("available questions ", filteredQuestions);

      // Store the filtered questions and selected item
      setSelectedItem(item);
      setNewQuestion({
        qc_select: "",
        description: "",
        Good: false,
        bad: false,
        remark: "",
        component_id: item.component_id,
      });
      setNewQuestion((prev) => ({
        ...prev,
        qcQuestions: filteredQuestions.map((q) => ({
          id: q.id,
          question: q.question,
          answer: null, // Initialize answer as null
        })),
      }));
      // setShowQCPopup(true);
    } catch (error) {
      console.error("Error fetching QC questions:", error);
      alert("An error occurred while fetching QC questions.");
    }
  };

  const handleQuestionAnswer = (questionId, answer) => {
    setNewQuestion((prev) => ({
      ...prev,
      qcQuestions: prev.qcQuestions.map((q) =>
        q.id === questionId ? { ...q, answer } : q
      ),
    }));
  };


  // Function to assign the selected serial number from popup
const assignSerial = async (serialNumber, MRFListId) => {
  try {
    const response = await fetch(`${config.apiBaseURL}/inventory/${serialNumber}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "In_drone" }),
    });

    if (!response.ok) {
      throw new Error("Failed to update inventory status");
    }

    const updateMRFResponse = await fetch(`${config.apiBaseURL}/MRFList/${MRFListId}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: false,
        serial_number: serialNumber, 
      }),
    });


    if (!updateMRFResponse.ok) {
      throw new Error("Failed to update MRF action status");
    }

    setMrfListData((prevData) =>
      prevData.map((item) =>
        item.id === MRFListId
          ? { ...item, status: "In_drone", action: false, serial_number: serialNumber }
          : item
      )
    );

    setShowSerialPopup(false);
    showSuccessToast(`Serial ${serialNumber} assigned successfully`);
  } catch (error) {
    console.error("Error during assignment:", error);
    showErrorToast("Error while assigning serial number");
  }
};

  const handleSubmitQC = async () => {
    if (!newQuestion.qcQuestions || newQuestion.qcQuestions.length === 0) {
      alert("No questions available to submit.");
      return;
    }

    // Validate that all questions have been answered
    const unanswered = newQuestion.qcQuestions.filter((q) => q.answer === null);
    if (unanswered.length > 0) {
      alert("Please answer all questions before submitting.");
      return;
    }

    const serial_number = selectedItem?.serial_number || "";

    if (!serial_number || serial_number === "Not Available") {
      alert("serial number not found. Unable to submit QC answers.");
      return;
    }

    try {
      // Iterate over each question and make a separate POST request
      for (const question of newQuestion.qcQuestions) {
        const payload = {
          serial_number: serial_number,
          qc_question: question.id,
          yes: question.answer === "Yes",
          no: question.answer === "No",
        };

        const response = await fetch(`${config.apiBaseURL}/qc_return_answer/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorDetails = await response.json();
          console.error(
            `Error submitting QC answer for question ${question.id}:`,
            errorDetails
          );
          alert(
            `Failed to submit QC answer for question ${
              question.id
            }: ${JSON.stringify(errorDetails)}`
          );
          return; // Stop further submissions on failure
        }
      }

      // Success feedback
      showSuccessToast("QC process completed successfully!");
      // setShowMessageBox(true);
      setShowQCPopup(false);
      // fetchInwardData(); // Refresh the inward data
    } catch (error) {
      console.error("Error during QC submission process:", error);
      alert("An error occurred while submitting QC answers.");
    }
  };

  const handleReturnClick = (serialNumber, MRF_id, item) => {
    setSelectedSerial(serialNumber);
    setSelectedMRF(MRF_id);
    setShowPopup(true);
    handleQCClick(item);
  };

  const handleReturnSubmit = async () => {
    if (!returnStatus) {
      alert("Please select a return status.");
      return;
    }

    const formattedStatus =
      returnStatus === "Move to Inventory" ? "Available" : returnStatus;

    try {
      await fetch(`${config.apiBaseURL}/inventory/${selectedSerial}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: formattedStatus }),
      });

      // Update MRF entry with return details
      await fetch(`${config.apiBaseURL}/MRFList/${selectedMRF}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          returns: "true",
          reported_by: reportedBy,
          remarks: remarks,
        }),
      });

      setMrfListData((prevData) =>
        prevData.map((item) =>
          item.serial_number === selectedSerial
            ? { ...item, status: formattedStatus, returns: true, action: false }
            : item
        )
      );

      setShowPopup(false);
      setReportedBy("");
      setRemarks("");
    } catch (error) {
      console.error("Error updating return status:", error);
    }
  };

  return (
    <div>
      <h2>Material Request Data for {MRF_id}</h2>
      <div style={{ display: "flex", gap: "20px", marginBottom: "10px", alignItems: "center" }}>
        <div>
          <strong>Requester Name:</strong> {mrfData.name}
        </div>
        <div>
          <strong>Date:</strong> {mrfData.date}
        </div>
        <div>
          <strong>Request ID:</strong> {mrfData.Request_id_assign}
        </div>
      </div>
      <div style={{ marginBottom: "15px" }}>
        <strong>Approval Status:</strong>{" "}
        {approvalStatus ? "Approved" : "Pending"}
        {!approvalStatus && (
          <button
            onClick={handleApproval}
            style={{
              marginLeft: "10px",
              padding: "5px 10px",
              backgroundColor: "green",
              color: "white",
            }}
          >
            Approve MRF
          </button>
        )}
      </div>

      <table>
        <thead>
          <tr>
            {/* <th>MRF ID</th> */}
            {/* <th>Create Date</th>
            <th>Name</th> */}
            <th>Component Type</th>
            <th>Component Specification</th>
            <th>Unit of Measurement</th>
            <th>Category</th>
            <th>Serial Number</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {mrfListData.length === 0 ? (
            <tr>
              <td colSpan="8" style={{ textAlign: "center" }}>
                No material requests available.
              </td>
            </tr>
          ) : (
            mrfListData.map((item) => (
              <tr key={item.serial_number}>
                {/* <td>{item.MRF_id}</td> */}
                {/* <td>{item.create_date}</td>
                <td>{item.name}</td> */}
                <td>{item.component_type}</td>
                <td>{item.component_specification}</td>
                <td>{item.unit_of_measurement}</td>
                <td>{item.category}</td>
                <td>{item.action === false ? item.serial_number : "-"}</td>

                <td>
                  {item.returns ? (
                    <button
                      disabled
                      style={{
                        padding: "5px 10px",
                        backgroundColor: "#b8730b",
                        color: "white",
                        border: "none",
                      }}
                    >
                      Returned
                    </button>
                  ) : item.action ? (
                    <button
                      onClick={() => handleAssign(item.serial_number, item.id,item)}
                      disabled={!approvalStatus}
                      style={{
                        padding: "5px 10px",
                        backgroundColor: approvalStatus ? "green" : "grey",
                        color: approvalStatus ? "white" : "black",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Assign
                    </button>
                  ) : (
                    <>
                      <button
                        disabled
                        style={{
                          padding: "5px 10px",
                          backgroundColor: "grey",
                          color: "white",
                          border: "none",
                        }}
                      >
                        Assigned
                      </button>
                      <button
                        onClick={() =>
                          handleReturnClick(item.serial_number, item.id, item)
                        }
                        style={{
                          padding: "5px 10px",
                          backgroundColor: "orange",
                          color: "white",
                          border: "none",
                          cursor: "pointer",
                          marginLeft: "5px",
                        }}
                      >
                        Return
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {showPopup && (
        <div className="popup">
          <h3>Return Details</h3>
          <label>Reported By:</label>
          <input
            type="text"
            value={reportedBy}
            onChange={(e) => setReportedBy(e.target.value)}
          />
          <label>Remarks:</label>
          <input
            type="text"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
          <div style={{ paddingTop: 10, paddingBottom: 10 }}>
            <button onClick={() => setShowQCPopup(true)}>
              QC for return item
            </button>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="returnStatus"
                value="Move to Inventory"
                onChange={(e) => setReturnStatus(e.target.value)}
              />{" "}
              Move to Inventory
            </label>
            <label>
              <input
                type="radio"
                name="returnStatus"
                value="Repair"
                onChange={(e) => setReturnStatus(e.target.value)}
              />{" "}
              Repair
            </label>
            <label>
              <input
                type="radio"
                name="returnStatus"
                value="Damaged"
                onChange={(e) => setReturnStatus(e.target.value)}
              />{" "}
              Damaged
            </label>
          </div>
          <button onClick={handleReturnSubmit}>Submit</button>
          <button onClick={() => setShowPopup(false)}>Cancel</button>
        </div>
      )}

      {showQCPopup && selectedItem && (
        <div className="popup">
          <h3>Quality Check for {selectedItem.serial_number}</h3>
          <div>
            {/* Render QC Questions */}
            {newQuestion.qcQuestions?.map((q) => (
              <div key={q.id}>
                <p>{q.question}</p>
                <label>
                  Yes
                  <input
                    type="radio"
                    name={`question-${q.id}`}
                    onChange={() => handleQuestionAnswer(q.id, "Yes")}
                  />
                </label>
                <label>
                  No
                  <input
                    type="radio"
                    name={`question-${q.id}`}
                    onChange={() => handleQuestionAnswer(q.id, "No")}
                  />
                </label>
              </div>
            ))}
          </div>
          <div>
            <h4>Overall Status</h4>
            <label>
              Pass
              <input
                type="radio"
                name="overall-status"
                onChange={() =>
                  setNewQuestion((prev) => ({ ...prev, overallStatus: "Pass" }))
                }
              />
            </label>
            <label>
              Fail
              <input
                type="radio"
                name="overall-status"
                onChange={() =>
                  setNewQuestion((prev) => ({ ...prev, overallStatus: "Fail" }))
                }
              />
            </label>
          </div>
          <button onClick={handleSubmitQC}>Submit QC</button>
          <button onClick={() => setShowQCPopup(false)}>Close</button>
        </div>
      )}

{/* {showSerialPopup && selectedItemForAssign && (
  <div className="popup">
    <h3>Choose Available Serial Number</h3>
    {alternativeSerials.length > 0 ? (
      alternativeSerials.map((serial) => (
        <div key={serial.serial_number} style={{ marginBottom: "8px" }}>
          <span>{serial.serial_number}</span>
          <button
            style={{
              marginLeft: "10px",
              padding: "3px 8px",
              backgroundColor: "green",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
            onClick={() => assignSerial(serial.serial_number, selectedItemForAssign.MRFListId)}
          >
           Assign
          </button>
        </div>
      ))
    ) : (
      <p>No available serial numbers found matching the criteria.</p>
    )}
    <button onClick={() => setShowSerialPopup(false)} style={{ marginTop: "10px" }}>
      Close
    </button>
  </div>
)} */}

    </div>
  );
};

export default Mrfrequest;



// const handleAssign = async (serialNumber, MRFListId, item) => {
//   try {
//     // Fetch all inventory data
//     const response = await fetch(`${config.apiBaseURL}/inventory/`);
//     if (!response.ok) {
//       throw new Error("Failed to fetch inventory data");
//     }
//     const inventoryData = await response.json();

//     // Get the current serial number record
//     const inventoryItem = inventoryData.find(inv => inv.serial_number === serialNumber);

//     if (!inventoryItem) {
//       showErrorToast("Serial number not found in inventory.");
//       return;
//     }

//     // If reserved (not available), follow normal assign flow
//     if (inventoryItem.status !== "Available") {
//       await assignSerial(serialNumber, MRFListId);
//       return;
//     }

//     // If status is Available, fetch alternative serials
//     const alternatives = inventoryData.filter(
//       (inv) =>
//         inv.component_type?.toLowerCase().trim() === item.component_type?.toLowerCase().trim() &&
//         inv.specification?.toLowerCase().trim() === 
//           (item.component_specification?.toLowerCase().trim() || item.specification?.toLowerCase().trim()) &&
//         inv.status === "Available"
//     );

//     setAlternativeSerials(alternatives);
//     setSelectedItemForAssign({ MRFListId });
//     setShowSerialPopup(true);
//   } catch (error) {
//     console.error("Error during assign process:", error);
//     showErrorToast("Error during assignment process");
//   }
// };