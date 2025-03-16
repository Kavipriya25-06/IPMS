import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import CustomMessagebox from "./CustomMessageBox.jsx";
import config from "../Config"; // Import config for API endpoints

import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  ToastContainerComponent,
} from "./Toastify.jsx"; // Import Toastify utilities

const RequestDetails = ({ user }) => {
  const { requestId } = useParams();
  const [details, setDetails] = useState([]); // to fetch the request details
  const [vendorNames, setVendorNames] = useState([]);
  const [inventoryData, setInventoryData] = useState({});
  const [cartItems, setCartItems] = useState([]);
  const [showSerialPopup, setShowSerialPopup] = useState(false);
  const [serialNumbers, setSerialNumbers] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [disabledSerialNumbers, setDisabledSerialNumbers] = useState([]);
  const [assignedComponents, setAssignedComponents] = useState({}); // Track assigned components
  const [selectedSerialNumbers, setSelectedSerialNumbers] = useState([]);
  const [requiredQty, setRequiredQty] = useState(0);
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [messageBoxContent, setMessageBoxContent] = useState("");
  const [priceViewData, setPriceViewData] = useState([]);

  const [showVendorPopup, setShowVendorPopup] = useState(false); // Popup visibility state
  const [selectedComponentId, setSelectedComponentId] = useState(null); // Track the selected component
  const [vendorPopupData, setVendorPopupData] = useState([]); // Store vendors for the popup
  const [pricePopupData, setPricePopupData] = useState(null);
  const [showPricePopup, setShowPricePopup] = useState(false);
  const [project, setProject] = useState([]);
  const [requestStatus, setRequestStatus] = useState([]);
  const [bomName, setBomName] = useState([]);

  // The user object is now passed as a prop
  const isAdmin = user?.role === "Admin";
  const isProcurement = user?.role === "Procurement";

  useEffect(() => {
    fetchPriceViewData();
    fetchRequestDetails();
    fetchInventoryData();
    fetchVendorList();
    fetchRequestStatus();
    fetchRequestList();
    // fetchCartItems();
  }, [requestId]);

  useEffect(() => {
    if (details.length) {
      fetchProjectDetails();
    }
  }, [details]);

  const fetchRequestDetails = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/request_master/`);
      const data = await response.json();
      const filteredDetails = data.filter(
        (detail) => String(detail.request_id) === String(requestId)
      );
      setDetails(filteredDetails);
    } catch (error) {
      console.error("Error fetching request details:", error);
    }
  };

  const fetchRequestList = async () => {
    try {
      const response = await fetch(
        `${config.apiBaseURL}/request_list/${requestId}/`
      );
      const data = await response.json();
      if (!data.length) return;
      const bom_name = data[0].bom_name;
      console.log("The data", data);
      console.log("The bom", bom_name);
      setBomName(bom_name);
    } catch (error) {
      console.error("Error fetching BOM details:", error);
    }
  };

  const fetchProjectDetails = async () => {
    // console.log("first details", details);
    try {
      const response = await fetch(`${config.apiBaseURL}/project/`);
      const data = await response.json();
      if (!details.length) return;
      const projects = data.find(
        (project) =>
          String(project.project_id) === String(details[0].project_id)
      );
      setProject(projects);
      // console.log("Projects", projects);
      // console.log("details", details);
    } catch (error) {
      console.error("Error fetching Project details:", error);
    }
  };

  const fetchRequestStatus = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/update_request/`);
      const data = await response.json();
      setRequestStatus(data);
      // console.log("Status", data);
    } catch (error) {
      console.error("Error fetching request details:", error);
    }
  };

  const fetchInventoryData = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/inventory/`);
      const data = await response.json();

      const inventoryMap = data.reduce((acc, item) => {
        if (!acc[item.component_id]) {
          acc[item.component_id] = { qty: 0, serialNumbers: [] };
        }

        if (item.status === "Available") {
          acc[item.component_id].qty += 1; // Increment qty if status is true
        }

        acc[item.component_id].serialNumbers.push({
          serialNumber: item.serial_number,
          status: item.status,
        });

        return acc;
      }, {});

      setInventoryData(inventoryMap);
    } catch (error) {
      console.error("Error fetching inventory data:", error);
    }
  };

  const fetchVendorList = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/vendor_list/`);
      const data = await response.json();
      const uniqueVendors = data.map((vendor) => ({
        vendor_id: vendor.vendor_id,
        vendor_name: vendor.vendor_name,
        gstn: vendor.gstn,
      }));
      setVendorNames(uniqueVendors);
    } catch (error) {
      console.error("Error fetching vendor list:", error);
    }
  };

  const fetchCartItems = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/cart/`);
      if (!response.ok) {
        console.error("Error fetching cart items:", response.statusText);
        // alert("Failed to fetch cart items.");
        return;
      }

      const data = await response.json();

      // Ensure po_master_id is included in cart items
      setCartItems(data);
    } catch (error) {
      console.error("Error fetching cart items:", error);
      // alert("An error occurred while fetching cart items.");
    }
  };
  const handleOrder = async (detail) => {
    if (!detail.vendor_name) {
      setMessageBoxContent("Please select a vendor for this component.");
      setShowMessageBox(true);
      return;
    }

    const selectedVendor = vendorNames.find(
      (vendor) => vendor.vendor_name === detail.vendor_name
    );
    const vendor_id = selectedVendor ? selectedVendor.vendor_id : null;
    const vendor_gstn = selectedVendor ? selectedVendor.gstn : null;

    if (!vendor_id) {
      alert("Invalid vendor selected.");
      return;
    }

    let productId = null;
    const price = detail.price;
    const tax = detail.tax;

    try {
      // Fetch product_id from the component API
      const componentResponse = await fetch(`${config.apiBaseURL}/component/`);
      const componentData = await componentResponse.json();
      const component = componentData.find(
        (comp) => comp.component_id === detail.component_id
      );

      if (component) {
        productId = component.product_id;
      } else {
        alert(`Component not found for component_id: ${detail.component_id}`);
        return;
      }
    } catch (error) {
      console.error("Error fetching required data:", error);
      alert("Error occurred while fetching data.");
      return;
    }

    // Calculate total cost
    const gstAmount = (price * tax) / 100;
    const totalCost = Math.round((price + gstAmount) * detail.qty * 100) / 100;

    // Prepare payload for cart API
    const orderData = {
      component_id: detail.component_id,
      component_type: detail.component_type,
      component_specification: detail.component_specification,
      quantity: detail.qty,
      request_id: detail.id,
      vendor_name: detail.vendor_name,
      vendor_id: detail.vendor_id,
      category: detail.category,
      unit_of_measurement: detail.unit_of_measurement,
      unit_price: detail.price,
      GST: detail.tax,
      total_cost: totalCost,
      assign: true,
      gstn: vendor_gstn,
    };

    try {
      // Send POST request to add to cart
      const response = await fetch(`${config.apiBaseURL}/cart/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        showSuccessToast(`Component ${detail.component_id} added to cart.`);
        // setShowMessageBox(true);

        // Send PUT request to update 'assign', 'status', and 'qty'
        const updatePayload = {
          status: detail.status, // Retain existing status
          qty: detail.qty, // Retain existing quantity
          cart_assign: true, // Set cart assign to true
          assign: false,
        };

        const updateResponse = await fetch(
          `${config.apiBaseURL}/request_master/${detail.request_id}/${detail.id}/`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatePayload),
          }
        );

        if (!updateResponse.ok) {
          const errorDetails = await updateResponse.json();
          console.error("Error updating request master:", errorDetails);
          alert(`Failed to update request: ${JSON.stringify(errorDetails)}`);
          return;
        }

        // Update state to reflect assign = true
        setDetails((prevDetails) =>
          prevDetails.map((d) =>
            d.component_id === detail.component_id
              ? { ...d, cart_assign: true }
              : d
          )
        );
      } else {
        const errorResponse = await response.json();
        console.error("Error adding to cart:", errorResponse);
        alert(`Failed to add to cart: ${JSON.stringify(errorResponse)}`);
      }
    } catch (error) {
      console.error("Error handling order:", error);
      alert("An error occurred while processing the order.");
    }
  };

  const handleAssign = async (componentId, qty) => {
    const componentData = inventoryData[componentId];

    if (!componentData) {
      alert("Component data not found in inventory.");
      return;
    }

    if (componentData.qty >= qty) {
      const availableSerialNumbers = componentData.serialNumbers
        .filter((sn) => sn.status === "Available")
        .map((sn) => sn.serialNumber);

      if (availableSerialNumbers.length >= qty) {
        setSerialNumbers(availableSerialNumbers); // Set available serials
        setSelectedComponent(componentId);
        setSelectedSerialNumbers([]); // Reset selection
        setRequiredQty(qty); // Set required quantity for exact selection
        setShowSerialPopup(true);
      } else {
        alert(
          "Insufficient available serial numbers in inventory for this component."
        );
      }
    } else {
      alert("Insufficient quantity in inventory.");
    }
  };

  const handleUnassign = async (componentId, serialNumbersToDereserve) => {
    try {
      const componentData = inventoryData[componentId];

      if (!componentData) {
        alert("Component data not found in inventory.");
        return;
      }

      // Filter serial numbers that are actually reserved
      const reservedSerials = componentData.serialNumbers.filter(
        (sn) => sn.status === "Reserved"
      );

      if (reservedSerials.length === 0) {
        showWarningToast("No reserved serial numbers found to unassign.");
        return;
      }

      // Create a payload to update the inventory status for each serial number
      for (const serial of reservedSerials) {
        const inventoryPayload = {
          component_id: componentId,
          serial_number: serial.serialNumber,
          vendor_name: componentData.vendor_name || "V_00001",
          component_type: componentData.component_type,
          category: componentData.category,
          specification: componentData.specification,
          UOM: componentData.UOM,
          status: "Available", // Revert status to Available
          price: componentData.price,
          Request_id_assign: "", // Remove request assignment
        };

        // Send a PUT request to update the inventory
        const inventoryResponse = await fetch(
          `${config.apiBaseURL}/inventory/${serial.serialNumber}/`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(inventoryPayload),
          }
        );

        if (!inventoryResponse.ok) {
          console.error(
            `Error unassigning serial number: ${serial.serialNumber}`
          );
          alert(
            `Could not unassign the serial number ${serial.serialNumber}. Please try again.`
          );
          return;
        }
      }

      // Get the request details for this component
      const selectedDetail = details.find(
        (detail) => detail.component_id === componentId
      );

      if (!selectedDetail || !selectedDetail.id) {
        alert(
          "Error: Unable to find the request ID for the selected component."
        );
        return;
      }

      const { id } = selectedDetail;
      const requestId = selectedDetail.request_id;

      // Fetch current request master data
      const requestMasterFetchResponse = await fetch(
        `${config.apiBaseURL}/request_master/${requestId}/${id}/`
      );

      if (!requestMasterFetchResponse.ok) {
        console.error("Error fetching request master data.");
        alert("Could not fetch the current quantity for the request.");
        return;
      }

      const newQty = selectedDetail.qty + reservedSerials.length; // Update quantity by adding back unassigned serials
      const updatedStatus =
        newQty === selectedDetail.qty ? "Assigned" : "Partially Assigned";

      // Update the request master
      const requestMasterPayload = {
        assign: false, // Set assign to false as items are being dereserved
        // qty: newQty, // Update qty to reflect available quantity
        status: updatedStatus,
      };

      const requestMasterResponse = await fetch(
        `${config.apiBaseURL}/request_master/${requestId}/${id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestMasterPayload),
        }
      );

      if (!requestMasterResponse.ok) {
        const errorDetails = await requestMasterResponse.json();
        console.error("Request Master Error:", errorDetails);
        alert("Error updating request master: " + JSON.stringify(errorDetails));
        return;
      }

      showSuccessToast(
        "Selected serial numbers have been dereserved successfully."
      );
    } catch (error) {
      console.error("Error unassigning serial numbers:", error);
      showErrorToast("An error occurred while unassigning serial numbers.");
    }
  };

  const handleSerialSelection = (serialNumber) => {
    setSelectedSerialNumbers((prevSelectedSerials) => {
      if (prevSelectedSerials.includes(serialNumber)) {
        return prevSelectedSerials.filter((sn) => sn !== serialNumber);
      } else if (prevSelectedSerials.length < requiredQty) {
        return [...prevSelectedSerials, serialNumber];
      } else {
        showWarningToast(
          `You cannot select more than ${requiredQty} serial numbers.`
        );
        return prevSelectedSerials;
      }
    });
  };

  const handleConfirmAssignment = async () => {
    if (selectedSerialNumbers.length === 0) {
      alert(`Please select at least 1 serial number.`);
      return;
    }

    setShowSerialPopup(false);

    try {
      const selectedDetail = details.find(
        (detail) => detail.component_id === selectedComponent
      );

      if (!selectedDetail || !selectedDetail.id) {
        console.error("Request ID not found for the selected component.");
        alert(
          "Error: Unable to find the request ID for the selected component."
        );
        return;
      }

      const { id } = selectedDetail;
      const requestId = selectedDetail.request_id;

      for (const serialNumber of selectedSerialNumbers) {
        const inventoryResponse = await fetch(
          `${config.apiBaseURL}/inventory/${serialNumber}/`
        );

        if (!inventoryResponse.ok) {
          console.error(
            `Error fetching inventory data for serial: ${serialNumber}`
          );
          alert(`Could not fetch data for serial number ${serialNumber}`);
          return;
        }

        const inventoryData = await inventoryResponse.json();

        // Create payload with the current data and change only the status to false
        const inventoryPayload = {
          component: inventoryData.component,
          serial_number: serialNumber,
          vendor_name: inventoryData.vendor_name || "V_00001",
          component_id: inventoryData.component_id,
          component_type: inventoryData.component_type,
          category: inventoryData.category,
          specification: inventoryData.specification,
          UOM: inventoryData.UOM,
          status: "Reserved",
          price: inventoryData.price,
          Request_id_assign: requestId,
        };

        // Update the inventory status for the serial number
        const updateResponse = await fetch(
          `${config.apiBaseURL}/inventory/${serialNumber}/`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(inventoryPayload),
          }
        );

        if (!updateResponse.ok) {
          console.error(`Error updating inventory for serial: ${serialNumber}`);
          alert(`Could not update inventory for serial number ${serialNumber}`);
          return;
        }
      }

      // Fetch current qty from request master using the ID
      const requestMasterFetchResponse = await fetch(
        `${config.apiBaseURL}/request_master/${requestId}/${id}/`
      );

      if (!requestMasterFetchResponse.ok) {
        console.error("Error fetching request master data.");
        alert("Could not fetch the current quantity for the request.");
        return;
      }

      const newRequiredQty = requiredQty - selectedSerialNumbers.length;

      const requestMasterPayload = {
        assign: newRequiredQty > 0 ? false : true, // Keep assign false if more are needed
        // qty: newRequiredQty, // Update qty to match remaining required quantity
        status: newRequiredQty > 0 ? "Partially Assigned" : "Fully Assigned", // Dynamic status
        cart_assign: true,
      };

      const requestMasterResponse = await fetch(
        `${config.apiBaseURL}/request_master/${requestId}/${id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestMasterPayload),
        }
      );

      if (!requestMasterResponse.ok) {
        const errorDetails = await requestMasterResponse.json();
        console.error("Request Master Error:", errorDetails);
        alert("Error updating request master: " + JSON.stringify(errorDetails));
        return;
      }

      // Update the frontend state
      setDetails((prevDetails) =>
        prevDetails.map((detail) =>
          detail.component_id === selectedComponent
            ? {
                ...detail,
                assign: newRequiredQty > 0 ? false : true,
                qty: newRequiredQty,
              }
            : detail
        )
      );

      setInventoryData((prevData) => {
        const currentComponentData = prevData[selectedComponent] || {};
        const updatedSerialNumbers = currentComponentData.serialNumbers.filter(
          (sn) => !selectedSerialNumbers.includes(sn.serialNumber)
        );

        return {
          ...prevData,
          [selectedComponent]: {
            ...currentComponentData,
            serialNumbers: updatedSerialNumbers,
          },
        };
      });
    } catch (error) {
      console.error("Error confirming assignment:", error);
      alert("An error occurred while confirming assignment.");
    }
  };

  // handle place order button version 2

  const getFirstItemId = (group) => {
    // Get the requests_by_date object
    const requestsByDate = group.requests_by_date;

    if (!requestsByDate || typeof requestsByDate !== "object") {
      console.error("Invalid requests_by_date structure:", requestsByDate);
      return null;
    }

    console.log("Requests grouped by date:", requestsByDate);

    // Get the first date key
    const firstDateKey = Object.keys(requestsByDate)[0];

    if (!firstDateKey) {
      console.error("No dates found in requests_by_date.");
      return null;
    }

    // Get requests grouped by status for the first date
    const requestsGroupedByStatus = requestsByDate[firstDateKey];

    if (
      !requestsGroupedByStatus ||
      typeof requestsGroupedByStatus !== "object"
    ) {
      console.error(
        "Invalid requestsGroupedByStatus structure:",
        requestsGroupedByStatus
      );
      return null;
    }

    console.log(
      "Requests grouped by status for date:",
      firstDateKey,
      requestsGroupedByStatus
    );

    // Get the first status key (e.g., "true" or "false")
    const firstStatusKey = Object.keys(requestsGroupedByStatus)[0];

    if (!firstStatusKey) {
      console.error("No statuses found in requestsGroupedByStatus.");
      return null;
    }

    // Get the array of requests for the first status
    const requests = requestsGroupedByStatus[firstStatusKey];

    if (!Array.isArray(requests) || requests.length === 0) {
      console.error("No valid requests found for status:", firstStatusKey);
      return null;
    }

    // Return the ID of the first request
    return requests[0]?.id || null; // Use optional chaining to avoid errors
  };

  const handleVendorChange = (
    componentId,
    vendorId,
    vendorName,
    price,
    tax
  ) => {
    console.log("Inputs to handleVendorChange:", {
      componentId,
      vendorId,
      vendorName,
      price,
      tax,
    });

    setDetails((prevDetails) =>
      prevDetails.map((detail) =>
        detail.component_id === componentId
          ? {
              ...detail,
              vendor_id: vendorId,
              vendor_name: vendorName,
              price, // Update price here
              tax,
            }
          : detail
      )
    );
    console.log("Details state after update:", details);
  };

  const handleVendorSelection = (componentType, componentSpec, componentId) => {
    // Filter price data for matching component_type and component_specification
    const matchingVendors = priceViewData
      .filter(
        (item) =>
          item.component_type.toLowerCase() === componentType.toLowerCase() &&
          item.component_specification.toLowerCase() ===
            componentSpec.toLowerCase()
      )
      .map((item) => ({
        ...item, // Retain all original fields
        component_id: componentId, // Add component_id to each matching vendor
      }));

    // Show popup with filtered data
    // console.log("Matching Vendors for Popup:", matchingVendors); // Debug
    setPricePopupData(matchingVendors);
    console.log("Price Popup Data:", matchingVendors);

    setShowPricePopup(true);
  };

  const fetchPriceViewData = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/price_view_2/`);
      if (!response.ok) {
        throw new Error(`Failed to fetch price data: ${response.statusText}`);
      }
      const data = await response.json();
      setPriceViewData(data); // Cache the entire price view payload
    } catch (error) {
      console.error("Error fetching price view data:", error);
    }
  };

  // Compute Total Price, GST, and Final Total
  const computeTotals = () => {
    const totals = details.reduce(
      (acc, po) => {
        const totalquantity = parseFloat(po.qty || 0);
        const totalcost = parseFloat(po.price || 0);
        acc.totalquantity += totalquantity; // Exclude GST from total price
        acc.totalcost += totalcost;
        // acc.finalTotal += totalCost + gst; // Include GST in final total
        return acc;
      },
      { totalquantity: 0, totalcost: 0 }
    );

    return {
      totalquantity: totals.totalquantity.toFixed(),
      totalcost: totals.totalcost.toFixed(2),
      // finalTotal: totals.finalTotal.toFixed(2),
    };
  };

  const { totalquantity, totalcost } = computeTotals();
  // console.log("Total cost and quantity", totalcost, totalquantity);

  const calculateTotal = () => {
    return details
      .reduce((total, detail) => {
        const price =
          parseFloat(detail.price || 0) ||
          parseFloat(
            priceViewData.find(
              (vendor) => vendor.vendor_id === detail.vendor_id
            )?.latest_price || 0
          );
        const quantity = parseFloat(detail.qty || 0);
        const tax =
          parseFloat(detail.tax || 0) ||
          parseFloat(
            priceViewData.find(
              (vendor) => vendor.vendor_id === detail.vendor_id
            )?.latest_tax || 0
          );

        // Calculate the total cost for this item (including tax)
        const itemTotal = price * quantity * (1 + tax / 100);
        return total + itemTotal;
      }, 0)
      .toFixed(2); // Return the total with two decimal places
  };

  // const handleApproval = async () => {
  //   try {
  //     const approvalPromises = details.map((detail) =>
  //       !detail.approve
  //         ? fetch(
  //             `${config.apiBaseURL}/request_master/${detail.request_id}/`,
  //             {
  //               method: "PATCH",
  //               headers: {
  //                 "Content-Type": "application/json",
  //               },
  //               body: JSON.stringify({ approve: true }),
  //             }
  //           )
  //         : null
  //     );

  //     const results = await Promise.all(approvalPromises);

  //     results.forEach((response, index) => {
  //       if (response && !response.ok) {
  //         console.error(
  //           `Failed to approve request: ${details[index].request_id}`
  //         );
  //       }
  //     });

  //     setDetails((prevDetails) =>
  //       prevDetails.map((detail) => ({
  //         ...detail,
  //         approve: true,
  //       }))
  //     );

  //     console.log("All requests approved successfully.");
  //   } catch (error) {
  //     console.error("Error approving all requests:", error);
  //     alert("Failed to approve all requests.");
  //   }
  // };

  const handleApproval = async () => {
    try {
      // Iterate over each detail and send a PATCH request
      const approvalPromises = details.map((detail) =>
        fetch(
          `${config.apiBaseURL}/request_master/${detail.request_id}/${detail.id}/`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ approve: true }),
          }
        )
      );

      // Wait for all PATCH requests to complete
      const results = await Promise.all(approvalPromises);

      // Check if any request failed
      const failedRequests = results.filter((response) => !response.ok);
      if (failedRequests.length > 0) {
        console.error("Some requests failed:", failedRequests);
        alert("Failed to approve some items.");
      } else {
        console.log("All components approved successfully.");

        // Update the local state
        setDetails((prevDetails) =>
          prevDetails.map((detail) => ({
            ...detail,
            approve: true, // Update approve status to true
          }))
        );
      }
    } catch (error) {
      console.error("Error approving components:", error);
      alert("An error occurred while approving the components.");
    }
  };

  return (
    <div>
      <h2>Request Details for {requestId}</h2>

      {/* Render CustomMessagebox when showMessageBox is true */}
      {showMessageBox && (
        <CustomMessagebox
          message={messageBoxContent}
          onClose={() => setShowMessageBox(false)}
        />
      )}

      {details.length === 0 ? (
        <p>No request details found for this ID.</p>
      ) : (
        <div>
          {/* Single Approve Button Above the Table */}
          <div
            style={{
              marginBottom: "10px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div style={{ margin: 0, alignContent: "center" }}>
              <h4 style={{ margin: 0 }}>
                Project name: {project.project_name} | BOM name: {bomName}
              </h4>
            </div>
            {(isAdmin || isProcurement) && (
              <button
                onClick={() => handleApproval()}
                disabled={details.every((detail) => detail.approve)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: details.every((detail) => detail.approve)
                    ? "#ddd"
                    : "#4caf50",
                  color: details.every((detail) => detail.approve)
                    ? "#888"
                    : "#fff",
                  cursor: details.every((detail) => detail.approve)
                    ? "not-allowed"
                    : "pointer",
                  border: "none",
                  borderRadius: "5px",
                  fontSize: "16px",
                }}
              >
                {details.every((detail) => detail.approve)
                  ? "Approved"
                  : "Approve Request"}
              </button>
            )}
          </div>

          <table>
            <thead>
              <tr>
                <th>Status</th>
                <th>Component Type</th>
                <th>Specification</th>
                <th>Unit of Measurement</th>
                <th>Category</th>
                <th>Vendor Name</th>
                {(isAdmin || isProcurement) && <th>Price</th>}
                {(isAdmin || isProcurement) && <th>Tax %</th>}
                <th>Quantity</th>
                <th>Available Quantity</th>
                {/* <th>Approval</th> */}
                {(isAdmin || isProcurement) && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {details
                .filter((detail) => !detail.order_placed) // Exclude rows where order_placed is true
                .map((detail) => {
                  const availableQty =
                    inventoryData[detail.component_id]?.qty || 0;
                  const isAssigned =
                    assignedComponents[detail.component_id] || detail.qty === 0;

                  return (
                    <tr key={detail.component_id}>
                      <td>
                        {requestStatus.find(
                          (status) => status.request_id === detail.id
                        )?.po_status || ""}
                      </td>
                      <td>{detail.component_type}</td>
                      <td>{detail.component_specification}</td>
                      <td>{detail.unit_of_measurement}</td>
                      <td>{detail.category}</td>
                      <td>
                        {detail.vendor_name ? (
                          <span
                            style={{
                              cursor: "pointer",
                              textDecoration: "underline",
                            }}
                            onClick={() =>
                              handleVendorSelection(
                                detail.component_type,
                                detail.component_specification,
                                detail.component_id
                              )
                            }
                          >
                            {detail.vendor_name}
                          </span>
                        ) : (
                          <span
                            style={{
                              cursor: "pointer",
                              textDecoration: "underline",
                            }}
                            onClick={() =>
                              handleVendorSelection(
                                detail.component_type,
                                detail.component_specification,
                                detail.component_id
                              )
                            }
                          >
                            {vendorNames.find(
                              (vendor) => vendor.vendor_id === detail.vendor_id
                            )?.vendor_name || ""}
                          </span>
                        )}
                      </td>

                      {(isAdmin || isProcurement) && (
                        <td style={{ textAlign: "right" }}>
                          ₹
                          {parseFloat(
                            detail.price !== undefined
                              ? detail.price
                              : priceViewData.find(
                                  (vendor) =>
                                    vendor.vendor_id === detail.vendor_id &&
                                    vendor.component_type ===
                                      detail.component_type &&
                                    vendor.component_specification ===
                                      detail.component_specification
                                )?.latest_price || 0
                          ).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                      )}
                      {(isAdmin || isProcurement) && (
                        <td style={{ textAlign: "right" }}>
                          {detail.tax !== undefined
                            ? `${detail.tax}`
                            : `${
                                priceViewData.find(
                                  (vendor) =>
                                    vendor.vendor_id === detail.vendor_id &&
                                    vendor.component_type ===
                                      detail.component_type &&
                                    vendor.component_specification ===
                                      detail.component_specification
                                )?.latest_tax || ""
                              }`}
                          %
                        </td>
                      )}
                      <td>{detail.assign !== true ? `${detail.qty}` : `0`}</td>
                      <td>{availableQty}</td>
                      {/* <td>
                      <button
                        onClick={() => handleApproval(detail.request_id, detail.id)} // Ensure `detail.id` is used if `id` is a property of `detail`
                        disabled={detail.approve} // Disable button if already approved
                        style={{
                          cursor: detail.approve ? "not-allowed" : "pointer",
                          backgroundColor: detail.approve ? "#ddd" : "#4caf50",
                          color: detail.approve ? "#888" : "#fff",
                        }}
                      >
                        {detail.approve ? "Approved" : "Approve"}
                      </button>
                    </td> */}
                      {(isAdmin || isProcurement) && (
                        <td>
                          {detail.assign || detail.qty === 0 ? (
                            <button
                              style={{
                                padding: "10px 20px",
                                fontSize: "14px",
                                borderRadius: "5px",
                                border: "1px solid #ccc",
                                cursor:
                                  detail.assign && detail.approve
                                    ? "pointer"
                                    : "not-allowed",
                                marginRight: "10px",
                                width: "100px",
                                height: "40px",
                                textAlign: "center",
                                transition: "background-color 0.3s ease",
                              }}
                              onClick={() =>
                                detail.approve &&
                                handleUnassign(detail.component_id, detail.qty)
                              }
                              disabled={!detail.assign || !detail.approve} // Disabled if not approved
                            >
                              Dereserve
                            </button>
                          ) : (
                            <button
                              style={{
                                padding: "10px 20px",
                                fontSize: "14px",
                                borderRadius: "5px",
                                border: "1px solid #ccc",
                                cursor:
                                  availableQty < detail.qty ||
                                  detail.qty === 0 ||
                                  detail.assign ||
                                  !detail.approve
                                    ? "not-allowed"
                                    : "pointer",
                                marginRight: "10px",
                                width: "100px",
                                height: "40px",
                                textAlign: "center",
                                transition: "background-color 0.3s ease",
                              }}
                              onClick={() =>
                                detail.approve &&
                                handleAssign(detail.component_id, detail.qty)
                              }
                              disabled={
                                availableQty < detail.qty ||
                                detail.qty === 0 ||
                                detail.assign ||
                                !detail.approve // Disabled if not approved
                              }
                            >
                              Reserve
                            </button>
                          )}
                          <button
                            style={{
                              padding: "10px 15px",
                              fontSize: "14px",
                              borderRadius: "5px",
                              border: "1px solid #ccc",
                              cursor:
                                detail.cart_assign || !detail.approve
                                  ? "not-allowed"
                                  : "pointer",
                              backgroundColor: detail.cart_assign
                                ? "#f0f0f0"
                                : detail.approve
                                ? "#fff"
                                : "#ddd",
                              color: detail.cart_assign ? "#888" : "#000",
                              transition: "background-color 0.3s ease",
                            }}
                            onClick={() =>
                              detail.approve && handleOrder(detail)
                            }
                            disabled={detail.cart_assign || !detail.approve} // Disabled if not approved or already in cart
                          >
                            {detail.cart_assign
                              ? "Added to Cart"
                              : "Add to Cart"}
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              <tr style={{ fontWeight: "bold" }}>
                <td colSpan="6">Total Cost (Including Tax):</td>
                <td style={{ textAlign: "right" }}>
                  ₹
                  {parseFloat(calculateTotal()).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td colSpan="4"></td>
              </tr>
            </tbody>
          </table>

          {showPricePopup && pricePopupData && (
            <div className="popup">
              <div className="popup-content">
                <h3>Vendor Details</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Vendor Name</th>
                      <th>Price</th>
                      <th>Tax %</th>
                      <th>Select</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pricePopupData.map((vendor) => (
                      <tr key={vendor.vendor_id}>
                        <td>{vendor.vendor_name}</td>
                        <td style={{ textAlign: "right" }}>
                          {vendor.latest_price !== null
                            ? `₹${parseFloat(
                                vendor.latest_price
                              ).toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}`
                            : "N/A"}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          {vendor.latest_tax ? `${vendor.latest_tax}%` : "N/A"}
                        </td>
                        <td>
                          <input
                            type="radio"
                            name="vendorSelection"
                            value={vendor.vendor_id}
                            onChange={() => {
                              handleVendorChange(
                                vendor.component_id, // Component ID
                                vendor.vendor_id,
                                vendor.vendor_name,
                                vendor.latest_price || "N/A", // Handle null price
                                vendor.latest_tax || "N/A"
                              );
                              setShowPricePopup(false); // Close the popup
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button onClick={() => setShowPricePopup(false)}>Close</button>
              </div>
            </div>
          )}

          {showVendorPopup && (
            <div className="popup">
              <div className="popup-content">
                <h3>Select Vendor</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Select</th>
                      <th>Vendor Name</th>
                      <th>Price</th>
                      <th>Tax</th>
                      <th>Total Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendorPopupData.map((vendor, index) => (
                      <tr key={index}>
                        <td>
                          <input
                            type="radio"
                            name="vendor"
                            value={vendor.vendor_id}
                            onChange={() => {
                              // Update selected vendor in details
                              setDetails((prevDetails) =>
                                prevDetails.map((detail) =>
                                  detail.component_id === selectedComponentId
                                    ? {
                                        ...detail,
                                        vendor_name: vendor.vendor_name,
                                        vendor_id: vendor.vendor_id,
                                      }
                                    : detail
                                )
                              );
                              setShowVendorPopup(false); // Close the popup
                            }}
                          />
                        </td>
                        <td>{vendor.vendor_name}</td>
                        <td>
                          {vendor.prices.length > 0
                            ? vendor.prices.map((price, i) => (
                                <div key={i}>₹{price.price}</div>
                              ))
                            : "N/A"}
                        </td>
                        <td>
                          {vendor.prices.length > 0
                            ? vendor.prices.map((price, i) => (
                                <div key={i}>{price.tax}%</div>
                              ))
                            : "N/A"}
                        </td>
                        <td>
                          {vendor.prices.length > 0
                            ? vendor.prices.map((price, i) => (
                                <div key={i}>
                                  ₹
                                  {(
                                    price.price +
                                    (price.price * price.tax) / 100
                                  ).toFixed(2)}
                                </div>
                              ))
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button onClick={() => setShowVendorPopup(false)}>Close</button>
              </div>
            </div>
          )}

          {showSerialPopup && (
            <div className="popup">
              <div className="modal-content">
                <h3>Select Serial Numbers</h3>
                <ul>
                  {serialNumbers.map((serial, index) => (
                    <li key={index}>
                      <button
                        onClick={() => handleSerialSelection(serial)}
                        style={{
                          color: selectedSerialNumbers.includes(serial)
                            ? "blue"
                            : "black",
                          cursor: "pointer",
                        }}
                      >
                        {serial}
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={handleConfirmAssignment}
                  disabled={selectedSerialNumbers.length !== requiredQty}
                >
                  Confirm Assignment
                </button>
                <button onClick={() => setShowSerialPopup(false)}>Close</button>
              </div>
            </div>
          )}

          <style>{`
        .modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: #fff;
          padding: 20px;
          border-radius: 8px;
          width: 300px;
          text-align: center;
        }
        .modal-content ul {
          list-style: none;
          padding: 0;
        }
        .modal-content button {
          margin-top: 10px;
        }
      `}</style>
        </div>
      )}
      <ToastContainerComponent />
    </div>
  );
};

export default RequestDetails;

// UNASSIGN FUNCTION
// const handleUnassign = async (componentId,newQty) => {
//   try {
//     const componentData = inventoryData[componentId];
//     const assignedSerials = componentData.serialNumbers.filter(
//       (sn) => sn.status === false
//     );

//     if (assignedSerials.length === 0) {
//       alert("No assigned serial numbers found to unassign.");
//       return;
//     }

//     // Unassign each assigned serial number
//     for (const serial of assignedSerials) {
//       const inventoryPayload = {
//         component: componentId,
//         serial_number: serial.serialNumber,
//         vendor: componentData.vendor || "V_00001",
//         com_id: componentId,
//         // qty: 1,
//         status: true, // Reverting status to true in inventory
//       };

//       // Update each serial in inventory to set status back to true
//       const inventoryResponse = await fetch(
//         `${config.apiBaseURL}/inventory/${serial.serialNumber}`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(inventoryPayload),
//         }
//       );

//       if (!inventoryResponse.ok) {
//         console.error("Error unassigning serial number in inventory.");
//         alert("Could not unassign the serial number. Please try again.");
//         return;
//       }
//     }

//     // Update request_master to reflect all quantities are unassigned
//     const updatedQty = componentData.qty ; // Recalculate the qty
//     const requestMasterPayload = {
//       request_id: requestId,
//       component_id: componentId,
//       bom_master_id: componentData.bom_master_id,
//       status: "Unassigned",
//       vendor_id: componentData.vendor || "V_00001",
//       component_type: componentData.component_type,
//       component_specification: componentData.component_specification,
//       unit_of_measurement: componentData.unit_of_measurement,
//       category: componentData.category,
//       bom_detail: componentData.bom_detail,
//       bom_name: componentData.bom_name,
//       quantity: componentData.quantity,
//       qty: newQty, // Set qty back with total after unassigning all serials
//       assign: false,
//     };

//     // Update request_master with the new qty and assign status
//     const requestMasterResponse = await fetch(
//       `${config.apiBaseURL}/request_master/${requestId}/`,
//       {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(requestMasterPayload),
//       }
//     );

//     if (requestMasterResponse.ok) {
//       setInventoryData((prevData) => {
//         const currentComponentData = prevData[componentId] || {};
//         const updatedSerialNumbers = currentComponentData.serialNumbers.map(
//           (sn) => (assignedSerials.includes(sn.serialNumber) ? { ...sn, status: true } : sn)
//         );

//         return {
//           ...prevData,
//           [componentId]: {
//             ...currentComponentData,
//             qty: updatedQty, // Update with the new qty after unassigning all serials
//             serialNumbers: updatedSerialNumbers,
//           },
//         };
//       });

//       setAssignedComponents((prevAssigned) => ({
//         ...prevAssigned,
//         [componentId]: false,
//       }));
//     } else {
//       console.error("Error updating request master status.");
//       alert("Could not update the request master status.");
//     }
//   } catch (error) {
//     console.error("Error unassigning serial numbers:", error);
//   }
// };

/////////////////////////////////////////////////////////////
