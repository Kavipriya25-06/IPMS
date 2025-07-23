import React, { useEffect, useState } from "react";
import CustomMessagebox from "./CustomMessageBox.jsx";
import config from "../Config";
import { useLocation, useNavigate } from "react-router-dom";
import { format } from "date-fns";

import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  ToastContainerComponent,
} from "./Toastify.jsx"; // Import Toastify utilities

const Inward = () => {
  const navigate = useNavigate();
  const [inwardData, setInwardData] = useState([]); // State to store inward data
  const [showQCPopup, setShowQCPopup] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [messageBoxContent, setMessageBoxContent] = useState("");
  const [skuPopupVisible, setSkuPopupVisible] = useState(false);
  const [skuSerialNumber, setSkuSerialNumber] = useState("");
  const [skuSelectedItem, setSkuSelectedItem] = useState(null);
  const [poMasterData, setPoMasterData] = useState([]);
  const [components, setComponents] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    qc_select: "",
    description: "",
    Good: false,
    bad: false,
    remark: "",
    component_id: null,
  }); // State for new question

  const [filteredData, setFilteredData] = useState([]);
  const [showScrollTop, setShowScrollTop] = useState(false); // Track visibility of scroll-to-top button

  // Filters
  const [poIdFilter, setPoIdFilter] = useState("");
  const [vendorNameFilter, setVendorNameFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const location = useLocation();
  const po_id = new URLSearchParams(location.search).get("po_id");
  const component_id = new URLSearchParams(location.search).get("component_id");

  // Utility function to safely access nested fields
  const getNestedValue = (obj, keyPath, defaultValue = "Not Available") => {
    try {
      return (
        keyPath.split(".").reduce((acc, key) => acc && acc[key], obj) ||
        defaultValue
      );
    } catch {
      return defaultValue;
    }
  };

  useEffect(() => {
    const fetchFilteredInward = async () => {
      try {
        const response = await fetch(
          `${config.apiBaseURL}/inward/?po_id=${po_id}&component_id=${component_id}`
        );
        const data = await response.json();
        setInwardData(data); // or any state variable you use for QC display
      } catch (error) {
        console.error("Error fetching filtered inward data:", error);
      }
    };

    if (po_id && component_id) {
      fetchFilteredInward();
    }
  }, [po_id, component_id]);

  // Fetch Inward Data
  const fetchInwardData = async () => {
    try {
      const response = await fetch(
        `${config.apiBaseURL}/inward/?po_id=${po_id}&component_id=${component_id}`
      );
      const data = await response.json();
      const result = data.filter((item) => item.mode_to_inventory === true);

      if (Array.isArray(result)) {
        setInwardData(result);
        setFilteredData(result);
      } else {
        console.error("Unexpected API response format:", result);
      }
    } catch (err) {
      console.error("Error fetching inward data:", err);
    }
  };

  const fetchComponent = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/component/`);
      const data = await response.json();
      setComponents(data);
    } catch (err) {
      console.log("unable to fetch components", err);
    }
  };

  const fetchpodetails = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/po_master/`);
      const data = await response.json();
      setPoMasterData(data);
    } catch (err) {
      console.log("unable to fetch PO details", err);
    }
  };

  // Auto pass QC logic here

  const handleAutoPassQC = async (item) => {
    const inwardId = item.inward_id;

    // Prepare the PATCH payload with all required fields
    const patchPayload = {
      quality_check: "pass", // Pass or Fail
    };

    // PATCH request to update the overall status in the inward API
    const patchResponse = await fetch(
      `${config.apiBaseURL}/inward/${inwardId}/`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patchPayload),
      }
    );

    if (!patchResponse.ok) {
      const patchError = await patchResponse.json();
      console.error("Error updating QC status in inward:", patchError);
      alert("Failed to update QC status.");
      return;
    }
  };

  const handleQCClick = async (item) => {
    const component_Type = getNestedValue(
      item,
      "po_master.cart.component_type"
    );
    const componentType = component_Type.toLowerCase();

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
        setMessageBoxContent(
          "No questions available for the selected component type."
        );
        setShowMessageBox(true);
        return;
      }

      // Store the filtered questions and selected item
      setSelectedItem(item);
      setNewQuestion({
        qc_select: "",
        description: "",
        Good: false,
        bad: false,
        remark: "",
        component_id: getNestedValue(item, "po_master.cart.component_id"),
      });
      setNewQuestion((prev) => ({
        ...prev,
        qcQuestions: filteredQuestions.map((q) => ({
          id: q.id,
          question: q.question,
          answer: null, // Initialize answer as null
        })),
      }));
      setShowQCPopup(true);
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

    const inwardId =
      selectedItem?.inward_id || getNestedValue(selectedItem, "inward_id");

    if (!inwardId || inwardId === "Not Available") {
      alert("Inward ID not found. Unable to submit QC answers.");
      return;
    }

    try {
      // Iterate over each question and make a separate POST request
      for (const question of newQuestion.qcQuestions) {
        const payload = {
          Inward_id: inwardId,
          qc_question: question.id,
          yes: question.answer === "Yes",
          no: question.answer === "No",
        };

        const response = await fetch(`${config.apiBaseURL}/qc_answer/`, {
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

      // Extract the price from the selectedItem
      const price =
        selectedItem?.price || getNestedValue(selectedItem, "price");

      if (!price || isNaN(price)) {
        alert("Invalid price. Unable to update QC status.");
        return;
      }

      // Prepare the PATCH payload with all required fields
      const patchPayload = {
        quality_check: newQuestion.overallStatus, // Pass or Fail
        component_id: getNestedValue(
          selectedItem,
          "po_master.cart.component_id"
        ),
        price: parseInt(price, 10), // Ensure the price is a valid integer
        po_master_id: getNestedValue(selectedItem, "po_master.id"),
      };

      // PATCH request to update the overall status in the inward API
      const patchResponse = await fetch(
        `${config.apiBaseURL}/inward/${inwardId}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patchPayload),
        }
      );

      if (!patchResponse.ok) {
        const patchError = await patchResponse.json();
        console.error("Error updating QC status in inward:", patchError);
        alert("Failed to update QC status.");
        return;
      }

      // Success feedback
      showSuccessToast("QC process completed successfully!");
      // setShowMessageBox(true);
      setShowQCPopup(false);
      fetchInwardData(); // Refresh the inward data
    } catch (error) {
      console.error("Error during QC submission process:", error);
      alert("An error occurred while submitting QC answers.");
    }
  };

  const handleOverallStatusUpdate = async (overallStatus) => {
    const inwardId =
      selectedItem?.inward_id || getNestedValue(selectedItem, "inward_id");

    if (!inwardId || inwardId === "Not Available") {
      alert("Inward ID not found. Unable to update overall status.");
      return;
    }

    try {
      const response = await fetch(`${config.apiBaseURL}/inward/${inwardId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quality_check: overallStatus }),
      });

      if (!response.ok) {
        const errorDetails = await response.json();
        console.error("Error updating overall QC status:", errorDetails);
        alert("Failed to update overall QC status.");
        return;
      }

      // Success feedback
      setMessageBoxContent(`QC status updated to: ${overallStatus}`);
      setShowMessageBox(true);
      setShowQCPopup(false);
      fetchInwardData(); // Refresh the inward data
    } catch (error) {
      console.error("Error updating overall QC status:", error);
      alert("An error occurred while updating QC status.");
    }
  };

  const handleAutoMoveToInventory = async (item) => {
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    try {
      // Extract necessary values using getNestedValue and ensure data integrity
      const componentId = getNestedValue(item, "po_master.cart.component_id");
      const componentSpecification = getNestedValue(
        item,
        "po_master.cart.component_specification"
      );
      const vendorName = getNestedValue(item, "po_master.cart.vendor_name");
      const serialNumber = item.serial_number || "Not Available"; // Ensure serial number is available
      const skuNumber = item.sku_number || "Not Available";
      const date = item.date || new Date().toISOString(); // Use current date if not available
      const qualityCheck = item.quality_check || "Not Available"; // Default to "Not Available" if no quality check
      const qty = 1; // Default quantity to 1 as specified

      // Find the matching PO Master entry for the component ID
      const poMasterEntry = poMasterData.find(
        (entry) => entry.cart_details.component_id === componentId
      );

      const price = poMasterEntry?.cart_details?.unit_price || "Not Available"; // Extract price (unit_price)

      if (!price || price === "Not Available") {
        alert(
          "Price not found in PO Master details. Cannot move to inventory."
        );
        return;
      }

      // Filter the components based on the component_id
      const selectedComponent = components.find(
        (component) => component.component_id === componentId
      );

      if (!selectedComponent) {
        console.error(`Component with ID ${componentId} not found.`);
        alert("Component not found.");
        return;
      }

      // Extract the component type and category from the selected component
      const componentType =
        selectedComponent.component_type || "DefaultComponentType"; // Default if not available
      const category = selectedComponent.category || "DefaultCategory"; // Default if not available

      // Prepare the data for posting to the inventory API
      const postData = {
        component_id: componentId,
        component_specification: componentSpecification,
        vendor_name: vendorName,
        serial_number: serialNumber,
        sku_number_inventory: skuNumber,
        date: date,
        quality_check: qualityCheck,
        qty: qty, // Using the default qty value
        component_type: componentType, // Dynamic value fetched from component API
        category: category, // Dynamic value fetched from component API
        specification: componentSpecification, // Mapping component_specification to specification
        UOM: "Nos", // Unit of measurement is set to "Nos"
        price: price, // Include price from PO Master
      };

      // Make the POST request to the inventory API
      const response = await fetch(`${config.apiBaseURL}/inventory/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });

      // Check for successful response
      if (!response.ok) {
        const errorDetails = await response.json();
        console.error("Error posting to inventory:", errorDetails);
        alert("All ready added to inventory");
        return;
      }

      // If successful, show an alert and refresh inward data
      showSuccessToast("Successfully moved to inventory.");
      setShowMessageBox(false);
    } catch (error) {
      // Handle any error that occurs during the fetch
      console.error("Error moving to inventory:", error);
      alert("An error occurred while moving to inventory.");
    }
  };

  const handleMoveToInventory = async (item) => {
    try {
      // Extract necessary values using getNestedValue and ensure data integrity
      const componentId = getNestedValue(item, "po_master.cart.component_id");
      const componentSpecification = getNestedValue(
        item,
        "po_master.cart.component_specification"
      );
      const vendorName = getNestedValue(item, "po_master.cart.vendor_name");
      const serialNumber = item.serial_number || "Not Available"; // Ensure serial number is available
      const skuNumber = item.sku_number || "Not Available";
      const date = item.date || new Date().toISOString(); // Use current date if not available
      const qualityCheck = item.quality_check || "Not Available"; // Default to "Not Available" if no quality check
      const qty = 1; // Default quantity to 1 as specified

      if (qualityCheck !== "Pass") {
        setMessageBoxContent(
          "The quality check has not passed. Cannot move to inventory."
        );
        setShowMessageBox(true);
        return;
      }

      // Find the matching PO Master entry for the component ID
      const poMasterEntry = poMasterData.find(
        (entry) => entry.cart_details.component_id === componentId
      );

      const price = poMasterEntry?.cart_details?.unit_price || "Not Available"; // Extract price (unit_price)

      if (!price || price === "Not Available") {
        alert(
          "Price not found in PO Master details. Cannot move to inventory."
        );
        return;
      }

      // Filter the components based on the component_id
      const selectedComponent = components.find(
        (component) => component.component_id === componentId
      );

      if (!selectedComponent) {
        console.error(`Component with ID ${componentId} not found.`);
        alert("Component not found.");
        return;
      }

      // Extract the component type and category from the selected component
      const componentType =
        selectedComponent.component_type || "DefaultComponentType"; // Default if not available
      const category = selectedComponent.category || "DefaultCategory"; // Default if not available

      // Prepare the data for posting to the inventory API
      const postData = {
        component_id: componentId,
        component_specification: componentSpecification,
        vendor_name: vendorName,
        serial_number: serialNumber,
        sku_number_inventory: skuNumber,
        date: date,
        quality_check: qualityCheck,
        qty: qty, // Using the default qty value
        component_type: componentType, // Dynamic value fetched from component API
        category: category, // Dynamic value fetched from component API
        specification: componentSpecification, // Mapping component_specification to specification
        UOM: "Nos", // Unit of measurement is set to "Nos"
        price: price, // Include price from PO Master
      };

      // Make the POST request to the inventory API
      const response = await fetch(`${config.apiBaseURL}/inventory/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });

      // Check for successful response
      if (!response.ok) {
        const errorDetails = await response.json();
        console.error("Error posting to inventory:", errorDetails);
        alert("All ready added to inventory");
        return;
      }

      // If successful, show an alert and refresh inward data
      showSuccessToast("Successfully moved to inventory.");
      setShowMessageBox(false);

      // Update mode_to_inventory to false via a PUT request
      const updatePayload = {
        mode_to_inventory: false,
        quality_check: item.quality_check, // Include existing quality_check value
        component_id: item.po_master.cart.component_id, // Include component_id
        po_master_id: item.po_master.id, // Include po_master_id
        price: price,
      };

      const updateResponse = await fetch(
        `${config.apiBaseURL}/inward/${item.inward_id}/`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatePayload),
        }
      );

      if (!updateResponse.ok) {
        const updateError = await updateResponse.json();
        console.error("Error updating mode_to_inventory:", updateError);
        alert("Failed to update mode_to_inventory.");
        return;
      }

      fetchInwardData(); // Refresh data after posting
    } catch (error) {
      // Handle any error that occurs during the fetch
      console.error("Error moving to inventory:", error);
      alert("An error occurred while moving to inventory.");
    }
  };

  const handleMoveToOutward = async (item) => {
    try {
      const componentId = getNestedValue(item, "po_master.cart.component_id");
      const componentSpecification = getNestedValue(
        item,
        "po_master.cart.component_specification"
      );
      const quantity = 1;
      const typeOfOutward = "QC Failed";

      // Basic validation
      if (!componentId || !componentSpecification) {
        alert("Missing component ID or specification. Cannot proceed.");
        return;
      }

      const postData = {
        component_id: componentId,
        specification: componentSpecification,
        quantity: quantity,
        type_of_outward: typeOfOutward,
      };

      const response = await fetch(`${config.apiBaseURL}/outward/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const errorDetails = await response.json();
        console.error("Error posting to outward:", errorDetails);
        alert("Failed to move to outward. Please check logs.");
        return;
      }

      showSuccessToast("Successfully moved to Outward due to failed QC.");
      setShowMessageBox(false);

      // Optionally, update the inward entry to reflect the outward move
      const updatePayload = {
        mode_to_inventory: false,
        quality_check: item.quality_check,
        component_id: componentId,
        po_master_id: item.po_master.id,
        price: item.price,
      };

      const updateResponse = await fetch(
        `${config.apiBaseURL}/inward/${item.inward_id}/`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatePayload),
        }
      );

      if (!updateResponse.ok) {
        const updateError = await updateResponse.json();
        console.error(
          "Error updating inward status after outward:",
          updateError
        );
        alert("Failed to update inward record.");
        return;
      }

      fetchInwardData(); // Refresh the inward data
    } catch (error) {
      console.error("Error in handleMoveToOutward:", error);
      alert("An unexpected error occurred while moving to outward.");
    }
  };

  // Handle SKU Number click
  const handleSkuNumberClick = (item) => {
    setSkuSelectedItem(item);
    setSkuSerialNumber(""); // Clear the input field
    setSkuPopupVisible(true);
  };

  // Handle SKU popup submit
  const handleSkuSubmit = async () => {
    const inwardId =
      skuSelectedItem?.inward_id ||
      getNestedValue(skuSelectedItem, "inward_id");

    if (!inwardId || inwardId === "Not Available") {
      alert("Inward ID not found. Cannot update SKU.");
      return;
    }

    try {
      const payload = {
        inward_id: inwardId,
        sku_number: skuSerialNumber.trim() || null, // Allow null for empty serial number
      };

      const response = await fetch(`${config.apiBaseURL}/inward/${inwardId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorDetails = await response.json();
        console.error("Error updating SKU:", errorDetails);
        alert("Failed to update SKU.");
        return;
      }

      showSuccessToast("SKU updated successfully.");
      setSkuPopupVisible(false);
      setSkuSerialNumber("");
      fetchInwardData(); // Refresh data after updating
    } catch (error) {
      console.error("Error updating SKU:", error);
      alert("An error occurred while updating SKU.");
    }
  };

  // Filtering logic
  useEffect(() => {
    let data = [...inwardData];

    if (poIdFilter.trim() !== "") {
      data = data.filter((item) =>
        getNestedValue(item, "po_master.PO_id")
          .toLowerCase()
          .includes(poIdFilter.toLowerCase())
      );
    }

    if (vendorNameFilter.trim() !== "") {
      data = data.filter((item) =>
        getNestedValue(item, "po_master.cart.vendor_name")
          .toLowerCase()
          .includes(vendorNameFilter.toLowerCase())
      );
    }

    if (dateFilter.trim() !== "") {
      data = data.filter((item) => {
        const itemDate = new Date(item.date).toLocaleDateString();
        return itemDate.includes(dateFilter);
      });
    }

    setFilteredData(data);
  }, [poIdFilter, vendorNameFilter, dateFilter, inwardData]);

  useEffect(() => {
    fetchInwardData();
    fetchComponent();
    fetchpodetails();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Smooth scroll effect
    });
  };

  return (
    <div>
      <div className="header">
        {/* <h2>Inward</h2> */}

        <button onClick={() => navigate(-1)} className="back-button">
          Back to Inward List
        </button>
      </div>

      {/* Render CustomMessagebox when showMessageBox is true */}
      {showMessageBox && (
        <CustomMessagebox
          message={messageBoxContent}
          onClose={() => setShowMessageBox(false)}
        />
      )}

      <div className="table-container" style={{ marginTop: "20px" }}>
        <table>
          <thead>
            <tr>
              <th>PO_ID</th>
              <th>Component ID</th>
              <th>Component Specification</th>
              <th>Vendor Name</th>
              <th>Serial Number</th>
              <th>Date</th>
              <th>QC</th>
              <th>SKU Number</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => (
              <tr key={index}>
                <td>{getNestedValue(item, "po_master.PO_id")}</td>
                <td>{getNestedValue(item, "po_master.cart.component_id")}</td>
                <td
                  className="specification-cell"
                  title={
                    getNestedValue(
                      item,
                      "po_master.cart.component_specification"
                    ) || "-"
                  }
                >
                  {getNestedValue(
                    item,
                    "po_master.cart.component_specification"
                  )}
                </td>
                <td
                  className="specification-cell"
                  title={
                    getNestedValue(item, "po_master.cart.vendor_name") || "-"
                  }
                >
                  {getNestedValue(item, "po_master.cart.vendor_name")}
                </td>
                <td>{item.serial_number || "Not Available"}</td>
                <td>
                  {item.date ? format(new Date(item.date), "dd-MM-yyyy") : "-"}
                </td>
                <td>{item.quality_check || "Not Available"}</td>
                <td className="sku-cell">
                  {item.sku_number ? (
                    <span className="sku-number">{item.sku_number}</span>
                  ) : (
                    <button
                      className="add-sku-button"
                      onClick={() => handleSkuNumberClick(item)}
                    >
                      Add SKU
                    </button>
                  )}
                </td>

                <td className="action-buttons-cell">
                  <button
                    className="qc-button"
                    onClick={() => handleQCClick(item)}
                    disabled={
                      item.quality_check === "Pass" ||
                      item.quality_check === "Fail"
                    }
                  >
                    QC
                  </button>
                  {item.quality_check === "Pass" && (
                    <button
                      className="move-inventory-button"
                      onClick={() => handleMoveToInventory(item)}
                      disabled={!item.mode_to_inventory}
                    >
                      Move to Inventory
                    </button>
                  )}
                  {item.quality_check === "Fail" && (
                    <button
                      className="move-outward-button"
                      onClick={() => handleMoveToOutward(item)}
                      // disabled={!item.mode_to_inventory}
                    >
                      Move to Outward
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showQCPopup && selectedItem && (
        <div className="modal-overlay">
          <div className="popup">
            <h3>
              Quality Check for{" "}
              {getNestedValue(selectedItem, "po_master.cart.component_id")}
            </h3>
            <div>
              {/* Render QC Questions */}
              {newQuestion.qcQuestions?.map((q) => (
                <div key={q.id} className="qc-question-block">
                  <h4>
                    Component Spec:&nbsp;
                    <span style={{ fontWeight: "100" }}>
                      {getNestedValue(
                        selectedItem,
                        "po_master.cart.component_specification"
                      ) || "No Specification Available"}
                    </span>
                  </h4>
                  <h4>QC Question</h4>
                  <div className="qc-question-inline">
                    <span className="qc-question-text">{q.question}</span>
                    <label className="custom-radio">
                      <input
                        type="radio"
                        name={`question-${q.id}`}
                        value="Yes"
                        onChange={() => handleQuestionAnswer(q.id, "Yes")}
                      />
                      <span className="checkmark">✓</span>
                      Yes
                    </label>
                    <label className="custom-radio">
                      <input
                        type="radio"
                        name={`question-${q.id}`}
                        value="No"
                        onChange={() => handleQuestionAnswer(q.id, "No")}
                      />
                      <span className="checkmark">✓</span>
                      No
                    </label>
                  </div>
                </div>
              ))}
            </div>
            <div className="overall-status-block">
              <h4>Overall Status</h4>
              <div className="status-button-group">
                <button
                  type="button"
                  className={`status-button ${
                    newQuestion.overallStatus === "Pass" ? "active-pass" : ""
                  }`}
                  onClick={() =>
                    setNewQuestion((prev) => ({
                      ...prev,
                      overallStatus: "Pass",
                    }))
                  }
                >
                  Pass
                </button>
                <button
                  type="button"
                  className={`status-button ${
                    newQuestion.overallStatus === "Fail" ? "active-fail" : ""
                  }`}
                  onClick={() =>
                    setNewQuestion((prev) => ({
                      ...prev,
                      overallStatus: "Fail",
                    }))
                  }
                >
                  Fail
                </button>
              </div>
            </div>

            <div className="modal-actions">
              <button className="edit-btn" onClick={handleSubmitQC}>
                Submit QC
              </button>
              <button
                className="cancel-button"
                onClick={() => setShowQCPopup(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SKU Popup */}
      {skuPopupVisible && (
        <div className="modal-overlay">
          <div className="popup">
            <h3>Enter SKU Number</h3>
            <input
              type="text"
              value={skuSerialNumber}
              onChange={(e) => setSkuSerialNumber(e.target.value)}
              placeholder="SKU Number (optional)"
            />
            <div className="modal-actions">
              <button className="edit-btn" onClick={handleSkuSubmit}>
                Submit
              </button>
              <button
                className="cancel-button"
                onClick={() => setSkuPopupVisible(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainerComponent />
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
    </div>
  );
};

export default Inward;
