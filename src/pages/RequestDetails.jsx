import React, { useState, useEffect } from "react";
import CustomMessagebox from "./CustomMessageBox.jsx";
import { useParams, useNavigate } from "react-router-dom";
import Back from "../assets/Back.png";
import config from "../Config"; // Import config for API endpoints
//////////////////////////////////////////////////////////////////////
import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  showMessageToast,
  showTextToast,
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
  const navigate = useNavigate(); // Initialize useNavigate
  const [showVendorPopup, setShowVendorPopup] = useState(false); // Popup visibility state
  const [selectedComponentId, setSelectedComponentId] = useState(null); // Track the selected component
  const [vendorPopupData, setVendorPopupData] = useState([]); // Store vendors for the popup
  const [pricePopupData, setPricePopupData] = useState(null);
  const [showPricePopup, setShowPricePopup] = useState(false);
  const [project, setProject] = useState([]);
  const [requestStatus, setRequestStatus] = useState([]);
  const [bomName, setBomName] = useState([]);
  const [selectedRequestDetailId, setSelectedRequestDetailId] = useState(null);

  const [requestMaster, setRequestMaster] = useState([]);

  // The user object is now passed as a prop
  const isAdmin = user?.role === "Admin";
  const isProcurement = user?.role === "Procurement";
  const isInventory = user?.role === "Inventory";

  useEffect(() => {
    fetchRequestDetails();
    fetchPriceViewData();
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

  // useEffect(() => {
  //   if (details.length && priceViewData.length) {
  //     const updatedDetails = mergePriceWithRequests(details, priceViewData);
  //     setDetails(updatedDetails);
  //     console.log("Updated details", updatedDetails);
  //   }

  // }, [priceViewData]);

  const fetchRequestDetails = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/price_view_new/`);
      const data = await response.json();
      const filteredDetails = data.filter(
        (detail) => String(detail.request_id) === String(requestId)
      );
      setDetails(filteredDetails);
      console.log("Request details", filteredDetails);
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

    const vendor_id = selectedVendor?.vendor_id;
    const vendor_gstn = selectedVendor?.gstn;

    if (!vendor_id) {
      showErrorToast("Invalid vendor selected.");
      return;
    }

    const qtyRef = { current: detail.qty };

    showTextToast({
      message: ({ closeToast }) => (
        <div>
          <p>Enter the quantity (Max: {detail.qty}):</p>
          <input
            type="number"
            min={1}
            max={detail.qty}
            defaultValue={detail.qty}
            onChange={(e) => {
              qtyRef.current = parseInt(e.target.value, 10);
            }}
            style={{
              marginTop: "0px",
              padding: "6px",
              width: "100%",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
        </div>
      ),
      confirmText: "Add to Cart",
      cancelText: "Cancel",
      onConfirm: async () => {
        const enteredQuantity = qtyRef.current;

        if (
          !enteredQuantity ||
          isNaN(enteredQuantity) ||
          enteredQuantity <= 0
        ) {
          showErrorToast("Invalid quantity entered.");
          return;
        }

        if (enteredQuantity > detail.qty) {
          showWarningToast(
            `The entered quantity exceeds available quantity (${detail.qty}).`
          );
          return;
        }

        const price = detail.price;
        const tax = detail.tax;
        const gstAmount = (price * tax) / 100;
        const totalCost =
          Math.round((price + gstAmount) * enteredQuantity * 100) / 100;

        try {
          if (enteredQuantity === detail.qty) {
            const orderData = {
              component_id: detail.component_id,
              component_type: detail.component_type,
              component_specification: detail.component_specification,
              quantity: enteredQuantity,
              request_id: detail.id,
              vendor_name: detail.vendor_name,
              vendor_id,
              category: detail.category,
              unit_of_measurement: detail.unit_of_measurement,
              unit_price: price,
              GST: tax,
              total_cost: totalCost,
              assign: true,
              gstn: vendor_gstn,
              request_list_id: detail.request_id,
              parent_id: null,
            };

            const cartResponse = await fetch(`${config.apiBaseURL}/cart/`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(orderData),
            });

            if (!cartResponse.ok) {
              const error = await cartResponse.json();
              console.error("Failed to add full to cart:", error);
              showErrorToast("Failed to add to cart.");
              return;
            }

            await fetch(
              `${config.apiBaseURL}/request_master/${detail.request_id}/${detail.id}/`,
              {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  cart_assign: true,
                  assign: false,
                  status: "Assigned",
                  vendor: vendor_id,
                }),
              }
            );
          } else {
            // SPLIT flow
            const newRequestPayload = {
              request: detail.request_id,
              component: detail.component_id,
              vendor: vendor_id,
              project_id: detail.project_id,
              component_type: detail.component_type,
              component_specification: detail.component_specification,
              unit_of_measurement: detail.unit_of_measurement,
              category: detail.category,
              qty: enteredQuantity,
              remaining_qty: 0,
              approve: true,
              assign: false,
              cart_assign: true,
              status: "Assigned",
            };

            const requestMasterResponse = await fetch(
              `${config.apiBaseURL}/request_master/${detail.request_id}/`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newRequestPayload),
              }
            );

            if (!requestMasterResponse.ok) {
              const error = await requestMasterResponse.json();
              console.error("Failed to create request_master:", error);
              showErrorToast("Failed to create request_master entry.");
              return;
            }

            const requestMasterData = await requestMasterResponse.json();
            const newRequestMasterId = requestMasterData.id;

            const orderData = {
              component_id: detail.component_id,
              component_type: detail.component_type,
              component_specification: detail.component_specification,
              quantity: enteredQuantity,
              request_id: newRequestMasterId,
              vendor_name: detail.vendor_name,
              vendor_id,
              category: detail.category,
              unit_of_measurement: detail.unit_of_measurement,
              unit_price: price,
              GST: tax,
              total_cost: totalCost,
              assign: true,
              gstn: vendor_gstn,
              request_list_id: requestMasterData.request,
              parent_id: detail.id,
            };

            const cartResponse = await fetch(`${config.apiBaseURL}/cart/`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(orderData),
            });

            if (!cartResponse.ok) {
              const cartError = await cartResponse.json();
              console.error("Failed to POST to cart:", cartError);
              showErrorToast("Failed to add to cart.");
              return;
            }
            // <<<<<<< HEAD
            //         );
            //       }
            //       ``;
            // =======
            // >>>>>>> 51e9f20ca36afde5da76e6dd49c870cfb3d9b9c6

            const remainingQty = detail.qty - enteredQuantity;

            await fetch(
              `${config.apiBaseURL}/request_master/${detail.request_id}/${detail.id}/`,
              {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  qty: remainingQty,
                  status: remainingQty > 0 ? "pending" : "completed",
                  cart_assign: false,
                  assign: false,
                }),
              }
            );
          }

          if (typeof fetchRequestDetails === "function") fetchRequestDetails();
          if (typeof fetchPriceViewData === "function") fetchPriceViewData();
          if (typeof fetchCartItems === "function") fetchCartItems();

          showSuccessToast(`Successfully added ${enteredQuantity} to cart.`);
        } catch (error) {
          console.error("Error during order process:", error);
          showErrorToast("An error occurred while processing the order.");
        }
      },
      onCancel: () => {
        showWarningToast("Order cancelled.");
      },
    });
  };

  const handleAssign = async (componentId, qty, requestDetailId) => {
    const componentData = inventoryData[componentId];

    if (!componentData) {
      showInfoToast("Component data not found in inventory.");
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
        setSelectedRequestDetailId(requestDetailId);
        setShowSerialPopup(true);
      } else {
        showWarningToast(
          "Insufficient available serial numbers in inventory for this component."
        );
      }
    } else {
      showInfoToast("Insufficient quantity in inventory.");
    }
  };

  const handleUnassign = async (
    componentId,
    serialNumbersToDereserve,
    requestDetailId
  ) => {
    try {
      const componentData = inventoryData[componentId];

      if (!componentData) {
        showInfoToast("Component data not found in inventory.");
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

      // PATCH each serial to make status = "Available"
      for (const serial of reservedSerials) {
        const inventoryPayload = {
          component_id: componentId,
          serial_number: serial.serialNumber,
          vendor_name: componentData.vendor_name || "V_00001",
          component_type: componentData.component_type,
          category: componentData.category,
          specification: componentData.specification,
          UOM: componentData.UOM,
          status: "Available",
          price: componentData.price,
          Request_id_assign: "", // Clear the assigned request
        };

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
          showErrorToast(
            `Could not unassign the serial number ${serial.serialNumber}. Please try again.`
          );
          return;
        }
      }

      // Update frontend state: details
      setDetails((prevDetails) =>
        prevDetails.map((detail) =>
          detail.id === requestDetailId
            ? {
                ...detail,
                assign: false,
                qty: reservedSerials.length, // restore qty
              }
            : detail
        )
      );

      // Update frontend state: inventoryData
      setInventoryData((prevInventory) => {
        const updatedSerials = componentData.serialNumbers.map((sn) =>
          sn.status === "Reserved" ? { ...sn, status: "Available" } : sn
        );

        return {
          ...prevInventory,
          [componentId]: {
            ...componentData,
            qty: componentData.qty + reservedSerials.length,
            serialNumbers: updatedSerials,
          },
        };
      });

      // Optional: Update backend request master
      const selectedDetail = details.find(
        (detail) =>
          detail.component_id === componentId && detail.id === requestDetailId
      );

      if (!selectedDetail || !selectedDetail.id) {
        showErrorToast("Error: Unable to find request detail for update.");
        return;
      }

      const requestId = selectedDetail.request_id;
      const updatedStatus = "Unassigned";

      const requestMasterPayload = {
        assign: false,
        status: updatedStatus,
      };

      const requestMasterResponse = await fetch(
        `${config.apiBaseURL}/request_master/${requestId}/${requestDetailId}/`,
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
        showErrorToast("Error updating request master.");
        console.error("Request Master Error:", errorDetails);
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
      showWarningToast(`Please select at least 1 serial number.`);
      return;
    }

    setShowSerialPopup(false);

    try {
      const selectedDetail = details.find(
        (detail) => detail.component_id === selectedComponent
      );

      if (!selectedDetail || !selectedDetail.id) {
        console.error("Request ID not found for the selected component.");
        showErrorToast(
          "Error: Unable to find the request ID for the selected component."
        );
        65;
        return;
      }

      const id = selectedRequestDetailId;
      const requestId = selectedDetail.request_id;

      for (const serialNumber of selectedSerialNumbers) {
        const inventoryResponse = await fetch(
          `${config.apiBaseURL}/inventory/${serialNumber}/`
        );

        if (!inventoryResponse.ok) {
          console.error(
            `Error fetching inventory data for serial: ${serialNumber}`
          );
          showWarningToast(
            `Could not fetch data for serial number ${serialNumber}`
          );
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
          showInfoToast(
            `Could not update inventory for serial number ${serialNumber}`
          );
          return;
        }
      }

      // Fetch current qty from request master using the ID
      const requestMasterFetchResponse = await fetch(
        `${config.apiBaseURL}/request_master/${requestId}/${id}/`
      );

      if (!requestMasterFetchResponse.ok) {
        console.error("Error fetching request master data.");
        showInfoToast("Could not fetch the current quantity for the request.");
        return;
      }

      const newRequiredQty = requiredQty - selectedSerialNumbers.length;

      const newAvailableQty =
        (details.find(
          (d) =>
            d.component_id === selectedComponent &&
            d.id === selectedRequestDetailId
        )?.available_qty || 0) - selectedSerialNumbers.length;

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
        showErrorToast(
          "Error updating request master: " + JSON.stringify(errorDetails)
        );
        return;
      }

      // Update the frontend state
      setDetails((prevDetails) =>
        prevDetails.map((detail) =>
          detail.component_id === selectedComponent &&
          detail.id === selectedRequestDetailId
            ? {
                ...detail,
                assign: newRequiredQty > 0 ? false : true,
                qty: newRequiredQty,
                available_qty: newAvailableQty,
              }
            : detail
        )
      );

      setInventoryData((prevData) => {
        const currentComponentData = prevData[selectedComponent] || {};
        const updatedSerialNumbers = currentComponentData.serialNumbers.map(
          (sn) =>
            selectedSerialNumbers.includes(sn.serialNumber)
              ? { ...sn, status: "Reserved" }
              : sn
        );

        const newAvailableQty = updatedSerialNumbers.filter(
          (sn) => sn.status === "Available"
        ).length;

        setInventoryData((prevData) => ({
          ...prevData,
          [selectedComponent]: {
            ...currentComponentData,
            serialNumbers: updatedSerialNumbers,
            qty: newAvailableQty,
          },
        }));

        return {
          ...prevData,
          [selectedComponent]: {
            ...currentComponentData,
            serialNumbers: updatedSerialNumbers,
            qty: newAvailableQty,
          },
        };
      });
    } catch (error) {
      console.error("Error confirming assignment:", error);
      showErrorToast("An error occurred while confirming assignment.");
    }
  };

  // Here we place the code to update default vendor

  const mergePriceWithRequests = (details, priceViewData) => {
    return details.map((item) => {
      const matched = priceViewData.find(
        (p) =>
          p.vendor_id === item.vendor_id &&
          p.component_type?.toLowerCase().trim() ===
            item.component_type?.toLowerCase().trim() &&
          p.component_specification?.toLowerCase().trim() ===
            item.component_specification?.toLowerCase().trim()
      );

      return {
        ...item,
        vendor_name: matched?.vendor_name ?? item.vendor_name ?? null,
        price: matched?.latest_price ?? item.price ?? null,
        tax: matched?.latest_tax ?? item.tax ?? null,
      };
    });
  };

  // console.log("Details from new code", details);

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
              price: price, // Update price here
              tax: tax,
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

  // const { totalquantity, totalcost } = computeTotals();

  // console.log("Total cost and quantity", totalcost, totalquantity);

  const calculateCostBreakdown = () => {
    let baseTotal = 0;
    let taxTotal = 0;

    details.forEach((detail) => {
      const matchedPrice = priceViewData.find(
        (vendor) => vendor.vendor_id === detail.vendor_id
      );

      const price = parseFloat(detail.price || matchedPrice?.latest_price || 0);
      const quantity = parseFloat(detail.qty || 0);
      const taxPercent = parseFloat(
        detail.tax || matchedPrice?.latest_tax || 0
      );

      const itemBase = price * quantity;
      const itemTax = itemBase * (taxPercent / 100);

      baseTotal += itemBase;
      taxTotal += itemTax;
    });

    return {
      baseTotal: baseTotal.toFixed(2),
      taxTotal: taxTotal.toFixed(2),
      grandTotal: (baseTotal + taxTotal).toFixed(2),
    };
  };

  const { baseTotal, taxTotal, grandTotal } = calculateCostBreakdown();

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
        showErrorToast("Failed to approve some items.");
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
      showErrorToast("An error occurred while approving the components.");
    }
  };

  return (
    <div>
      <h2>Request Details for {requestId}</h2>
      <button
        onClick={() => navigate("/requests")}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "4px",
        }}
        title="Back to BOM List"
      >
        <img
          src={Back}
          alt="Back to BOM list "
          style={{ width: "20px", height: "20px" }}
        />
      </button>

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
                  padding: "10px",
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

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Category</th>
                  <th>Component Type</th>
                  <th>Specification</th>
                  <th>Unit of Measurement</th>
                  <th>Vendor Name</th>
                  {(isAdmin || isProcurement) && <th>Price</th>}
                  {(isAdmin || isProcurement) && <th>Tax %</th>}
                  <th>Quantity</th>
                  <th>Available Quantity</th>
                  {/* <th>Approval</th> */}
                  {(isAdmin || isProcurement || isInventory) && (
                    <th>Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {details
                  .filter((detail) => !detail.order_placed) // Exclude rows where order_placed is true
                  .map((detail) => {
                    const availableQty =
                      inventoryData[detail.component_id]?.qty || 0;
                    const isAssigned =
                      assignedComponents[detail.component_id] ||
                      detail.qty === 0;

                    return (
                      <tr key={`${detail.id}-${detail.component_id}`}>
                        <td>
                          {requestStatus.find(
                            (status) => status.request_id === detail.id
                          )?.po_status || ""}
                        </td>
                        <td>{detail.category}</td>
                        <td>{detail.component_type}</td>
                        <td className="specification-cell">
                          {detail.component_specification}
                        </td>
                        <td>{detail.unit_of_measurement}</td>
                        <td className="specification-cell">
                          {detail.cart_assign ? (
                            <span
                              style={{
                                color: "#555",
                                fontWeight: "bold",
                                fontStyle: "italic",
                              }}
                            >
                              {detail.vendor_name ||
                                vendorNames.find(
                                  (v) => v.vendor_id === detail.vendor_id
                                )?.vendor_name ||
                                "N/A"}
                            </span>
                          ) : detail.vendor_name ? (
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
                                (vendor) =>
                                  vendor.vendor_id === detail.vendor_id
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
                        <td>
                          {detail.assign !== true ? `${detail.qty}` : `0`}
                        </td>
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
                        {(isAdmin || isProcurement || isInventory) && (
                          <td>
                            {detail.assign || detail.qty === 0 ? (
                              <button
                                className={`action-button ${
                                  detail.assign && detail.approve
                                    ? ""
                                    : "disabled-button"
                                }`}
                                onClick={() =>
                                  detail.approve &&
                                  handleUnassign(
                                    detail.component_id,
                                    detail.qty,
                                    detail.id
                                  )
                                }
                                disabled={!detail.assign || !detail.approve}
                              >
                                Dereserve
                              </button>
                            ) : (
                              <button
                                className={`action-button ${
                                  availableQty < detail.qty ||
                                  detail.qty === 0 ||
                                  detail.assign ||
                                  !detail.approve
                                    ? "disabled-button"
                                    : ""
                                }`}
                                onClick={() =>
                                  detail.approve &&
                                  handleAssign(
                                    detail.component_id,
                                    detail.qty,
                                    detail.id
                                  )
                                }
                                disabled={
                                  availableQty < detail.qty ||
                                  detail.qty === 0 ||
                                  detail.assign ||
                                  !detail.approve
                                }
                              >
                                Reserve
                              </button>
                            )}

                            <button
                              className={`cart-button ${
                                detail.cart_assign || !detail.approve
                                  ? "disabled-button"
                                  : ""
                              }`}
                              onClick={() =>
                                detail.approve && handleOrder(detail)
                              }
                              disabled={detail.cart_assign || !detail.approve}
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
                {["admin", "sub-admin", "procurement", "finance"].includes(
                  user?.role?.toLowerCase().trim()
                ) && (
                  <>
                    <tr style={{ fontWeight: "bold" }}>
                      <td colSpan="6" style={{ textAlign: "right" }}>
                        Total Base Price:
                      </td>
                      <td colSpan="1" style={{ textAlign: "right" }}>
                        ₹
                        {parseFloat(baseTotal).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td colSpan="4"></td>
                    </tr>

                    <tr style={{ fontWeight: "bold" }}>
                      <td colSpan="6" style={{ textAlign: "right" }}>
                        Total Tax (GST):
                      </td>
                      <td colSpan="1" style={{ textAlign: "right" }}>
                        ₹
                        {parseFloat(taxTotal).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td colSpan="4"></td>
                    </tr>
                    <tr style={{ fontWeight: "bold" }}>
                      <td colSpan="6" style={{ textAlign: "right" }}>
                        Grand Total (Price + GST):
                      </td>
                      <td colSpan="1" style={{ textAlign: "right" }}>
                        ₹
                        {parseFloat(grandTotal).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td colSpan="4"></td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>

          {showPricePopup && pricePopupData && (
            <div className="popup">
              <span
                className="x-button"
                onClick={() => setShowPricePopup(false)}
              >
                &times;
              </span>
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
                                vendor.latest_price || 0, // Handle null price
                                vendor.latest_tax || 0
                              );
                              setShowPricePopup(false); // Close the popup
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* <button  onClick={() => setShowPricePopup(false)}>Close</button> */}
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
            <div className="modal-overlay">
              <div className="popup">
                <div className="serial-modal">
                  <div>
                    <h3 style={{textAlign:"center"}}>Select Serial Numbers</h3>
                    <button
                      className="x-button"
                      onClick={() => setShowSerialPopup(false)}
                    >
                      &times;
                    </button>
                  </div>

                  <ul className="serial-list">
                    {serialNumbers.map((serial, index) => (
                      <li key={index}>
                        <button
                          className={`serial-button ${
                            selectedSerialNumbers.includes(serial)
                              ? "selected"
                              : ""
                          }`}
                          onClick={() => handleSerialSelection(serial)}
                        >
                          {serial}
                        </button>
                      </li>
                    ))}
                  </ul>

                  <div className="modal-actions">
                    <button
                      className={`confirm-button ${
                        selectedSerialNumbers.length === requiredQty
                          ? ""
                          : "disabled"
                      }`}
                      onClick={handleConfirmAssignment}
                      disabled={selectedSerialNumbers.length !== requiredQty}
                    >
                      Confirm Assignment
                    </button>
                  </div>
                </div>
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
