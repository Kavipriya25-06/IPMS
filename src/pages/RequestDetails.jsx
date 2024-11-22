import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import CustomMessagebox from "./CustomMessageBox.jsx";

const RequestDetails = () => {
  const { requestId } = useParams();
  const [details, setDetails] = useState([]);
  const [vendorNames, setVendorNames] = useState([]);
  const [inventoryData, setInventoryData] = useState({});
  const [cartItems, setCartItems] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showSerialPopup, setShowSerialPopup] = useState(false);
  const [serialNumbers, setSerialNumbers] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [disabledSerialNumbers, setDisabledSerialNumbers] = useState([]);
  const [assignedComponents, setAssignedComponents] = useState({}); // Track assigned components
  const [selectedSerialNumbers, setSelectedSerialNumbers] = useState([]);
  const [requiredQty, setRequiredQty] = useState(0); 
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [messageBoxContent, setMessageBoxContent] = useState("");
  

  useEffect(() => {
    fetchRequestDetails();
    fetchInventoryData();
    fetchVendorList();
    fetchCartItems();
  }, [requestId]);

  const fetchRequestDetails = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/request_master/");
      const data = await response.json();
      const filteredDetails = data.filter(
        (detail) => String(detail.request_id) === String(requestId)
      );
      setDetails(filteredDetails);
    } catch (error) {
      console.error("Error fetching request details:", error);
    }
  };

  const fetchInventoryData = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/inventory/");
      const data = await response.json();

      const inventoryMap = data.reduce((acc, item) => {
        if (!acc[item.com_id]) {
          acc[item.com_id] = { qty: 0, serialNumbers: [] };
        }

        if (item.status === true) {
          acc[item.com_id].qty += 1; // Increment qty if status is true
        }

        acc[item.com_id].serialNumbers.push({
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
      const response = await fetch("http://127.0.0.1:8000/vendor_list/");
      const data = await response.json();
      const uniqueVendors = data.map((vendor) => ({
        vendor_id: vendor.vendor_id,
        vendor_name: vendor.vendor_name,
      }));
      setVendorNames(uniqueVendors);
    } catch (error) {
      console.error("Error fetching vendor list:", error);
    }
  };

  const fetchCartItems = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/cart/");
      if (!response.ok) {
        console.error("Error fetching cart items:", response.statusText);
        alert("Failed to fetch cart items.");
        return;
      }
  
      const data = await response.json();
  
      // Set cart items directly from grouped data
      setCartItems(data);
    } catch (error) {
      console.error("Error fetching cart items:", error);
      alert("An error occurred while fetching cart items.");
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
  
    if (!vendor_id) {
      alert("Invalid vendor selected.");
      return;
    }
  
    let productId = null;
    let price = 0;
    let tax = 0;
  
    try {
      // Fetch product_id from the component API
      const componentResponse = await fetch("http://127.0.0.1:8000/component/");
      if (!componentResponse.ok) {
        console.error("Error fetching component data.");
        alert("Failed to fetch component data.");
        return;
      }
  
      const componentData = await componentResponse.json();
      const component = componentData.find(
        (comp) => comp.component_id === detail.component_id
      );
  
      if (component) {
        productId = component.product_id; // Extract product_id
      } else {
        alert(`Component data not found for component_id: ${detail.component_id}`);
        return;
      }
  
      // Fetch price and tax from the price table API
      const priceTableResponse = await fetch("http://127.0.0.1:8000/price_tables/");
      if (!priceTableResponse.ok) {
        console.error("Error fetching price table data.");
        alert("Failed to fetch price table data.");
        return;
      }
  
      const priceTableData = await priceTableResponse.json();
      const priceEntry = priceTableData.find(
        (entry) => entry.product === productId
      );
  
      if (priceEntry) {
        price = priceEntry.price;
        tax = priceEntry.tax;
      } else {
        alert(`Price table data not found for product_id: ${productId}`);
        return;
      }
    } catch (error) {
      console.error("Error fetching required data:", error);
      alert("An error occurred while fetching data.");
      return;
    }
  
    // Calculate total cost
    const gstAmount = (price * tax) / 100;
    const totalCost = (price + gstAmount) * detail.qty;
  
    // Prepare payload for cart API
    const orderData = {
      component_id: detail.component_id,
      component_type: detail.component_type,
      component_specification: detail.component_specification,
      quantity: detail.qty,
      request_id: detail.request_id,
      vendor_name: detail.vendor_name,
      vendor_id: vendor_id,
      category: detail.category,
      unit_of_measurement: detail.unit_of_measurement,
      unit_price: price, // Add price as unit_price
      GST: tax, // Add tax as GST
      total_cost: totalCost, // Add calculated total cost
      assign: true, // Set assign to true after adding to cart
    };
  
    try {
      const response = await fetch("http://127.0.0.1:8000/cart/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });
  
      if (response.ok) {
        setMessageBoxContent(`Component ${detail.component_id} added to cart.`);
        setShowMessageBox(true);
        
        // Update the request_master API to mark the item as assigned
        const updatePayload = {
          request_id: detail.request_id,
          component_id: detail.component_id,
          status: detail.status,
          vendor_id: vendor_id,
          component_type: detail.component_type,
          component_specification: detail.component_specification,
          unit_of_measurement: detail.unit_of_measurement,
          category: detail.category,
          qty: 0, // Set quantity to 0
          assign: true, // Mark as assigned
        };
  
        const updateResponse = await fetch(
          `http://127.0.0.1:8000/request_master/${detail.request_id}/${detail.id}/`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatePayload),
          }
        );
  
        if (!updateResponse.ok) {
          const errorDetails = await updateResponse.json();
          console.error("Error updating request master:", errorDetails);
          alert(`Failed to update request master: ${errorDetails.error}`);
          return;
        }
  
        // Refresh cart and update UI
        fetchCartItems();
        setDetails((prevDetails) =>
          prevDetails.map((d) =>
            d.component_id === detail.component_id
              ? { ...d, qty: 0, assign: true } // Update qty to 0 and assign to true
              : d
          )
        );
      } else {
        const errorResponse = await response.json();
        console.error("Error adding component to cart:", errorResponse);
        alert(`Failed to add component to cart: ${JSON.stringify(errorResponse)}`);
      }
    } catch (error) {
      console.error("Error posting to cart:", error);
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
      .filter((sn) => sn.status === true)
      .map((sn) => sn.serialNumber);

    if (availableSerialNumbers.length >= qty) {
      setSerialNumbers(availableSerialNumbers); // Set available serials
      setSelectedComponent(componentId);
      setSelectedSerialNumbers([]); // Reset selection
      setRequiredQty(qty); // Set required quantity for exact selection
      setShowSerialPopup(true);
    } else {
      alert("Insufficient available serial numbers in inventory for this component.");
    }
  } else {
    alert("Insufficient quantity in inventory.");
  }
};

const handleSerialSelection = (serialNumber) => {
  setSelectedSerialNumbers((prevSelectedSerials) => {
    if (prevSelectedSerials.includes(serialNumber)) {
      return prevSelectedSerials.filter((sn) => sn !== serialNumber);
    } else if (prevSelectedSerials.length < requiredQty) {
      return [...prevSelectedSerials, serialNumber];
    } else {
      alert(`You must select exactly ${requiredQty} serial numbers.`);
      return prevSelectedSerials;
    }
  });
};

const handleConfirmAssignment = async () => {
  if (selectedSerialNumbers.length !== requiredQty) {
    alert(`Please select exactly ${requiredQty} serial numbers.`);
    return;
  }

  setShowSerialPopup(false);

  try {
    // Fetch the ID for the selected component's request master
    const selectedDetail = details.find(
      (detail) => detail.component_id === selectedComponent
    );

    if (!selectedDetail || !selectedDetail.id) {
      console.error("Request ID not found for the selected component.");
      alert("Error: Unable to find the request ID for the selected component.");
      return;
    }

    const { id } = selectedDetail; // Extract the `id` from the selected detail
    const requestId = selectedDetail.request_id; // Extract the `request_id` if needed

    // Update inventory serial numbers
    for (const serialNumber of selectedSerialNumbers) {
      const inventoryPayload = {
        component: selectedComponent,
        serial_number: serialNumber,
        vendor: selectedDetail.vendor_name || "V_00001",
        com_id: selectedComponent,
        status: false, // Mark as assigned
      };

      const inventoryResponse = await fetch(
        `http://127.0.0.1:8000/inventory/${serialNumber}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(inventoryPayload),
        }
      );

      if (!inventoryResponse.ok) {
        console.error(`Error updating inventory for serial: ${serialNumber}`);
        alert(`Could not update inventory for serial number ${serialNumber}`);
        return;
      }
    }

    // Fetch current qty from request master using the ID
    const requestMasterFetchResponse = await fetch(
      `http://127.0.0.1:8000/request_master/${requestId}/${id}/`
    );

    if (!requestMasterFetchResponse.ok) {
      console.error("Error fetching request master data.");
      alert("Could not fetch the current quantity for the request.");
      return;
    }

    const requestMasterData = await requestMasterFetchResponse.json();

    // Prepare request master payload
    const requestMasterPayload = {
      assign: true, // Mark as assigned
      qty: requiredQty, // Use the current qty value
      status: "Assigned", // Update status
    };

    console.log("Request ID:", requestId); // Debug
    console.log("Request Master ID:", id); // Debug
    console.log("Request Master Payload:", requestMasterPayload); // Debug

    // Update request_master
    const requestMasterResponse = await fetch(
      `http://127.0.0.1:8000/request_master/${requestId}/${id}/`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestMasterPayload),
      }
    );

    if (!requestMasterResponse.ok) {
      const errorDetails = await requestMasterResponse.json(); // Capture backend error
      console.error("Request Master Error:", errorDetails);
      alert("Error updating request master: " + JSON.stringify(errorDetails));
      return;
    }

    // Update the frontend state
    setDetails((prevDetails) =>
      prevDetails.map((detail) =>
        detail.component_id === selectedComponent
          ? { ...detail, assign: true } // Update assign status in the UI
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
          serialNumbers: updatedSerialNumbers, // Remove used serial numbers
        },
      };
    });
  } catch (error) {
    console.error("Error confirming assignment:", error);
    alert("An error occurred while confirming assignment.");
  }
};

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
//         `http://127.0.0.1:8000/inventory/${serial.serialNumber}`,
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
//       `http://127.0.0.1:8000/request_master/${requestId}/`,
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

const handleCartOrder = async (item) => {
  try {
    // Step 1: Construct the payload for po_list
    const payloadForPoList = {
      status: "In Progress", // Order status
      cart_id: item.id, // Use `item.id` as the cart_id
    };

    console.log("Payload to POST (po_list):", payloadForPoList); // Debug the payload

    // POST request to the po_list API
    const poListResponse = await fetch("http://127.0.0.1:8000/po_list/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payloadForPoList),
    });

    if (!poListResponse.ok) {
      const error = await poListResponse.json();
      console.error("Error from po_list API:", error);
      alert(`Failed to place order in po_list: ${JSON.stringify(error)}`);
      return;
    }

    // Extract the generated po_id from the response
    const poListData = await poListResponse.json();
    const PO_id = poListData.id; // Assuming the API returns an `id` field

    console.log("Generated po_id:", PO_id); // Debug the po_id

    // Step 2: Construct the payload for po_master
    const payloadForPoMaster = {
      PO_id, // Use the po_id from po_list response
      status: "In Progress", // Order status
      cart_id: item.id, // Use the same cart_id
    };

    console.log("Payload to POST (po_master):", payloadForPoMaster); // Debug the payload

    // POST request to the po_master API
    const poMasterResponse = await fetch("http://127.0.0.1:8000/po_master/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payloadForPoMaster),
    });

    if (!poMasterResponse.ok) {
      const error = await poMasterResponse.json();
      console.error("Error from po_master API:", error);
      alert(`Failed to record order in po_master: ${JSON.stringify(error)}`);
      return;
    }

    // Step 3: PUT to cart API to set `order_placed` to true
    const cartDetailsResponse = await fetch(`http://127.0.0.1:8000/cart/${item.id}/`);
    if (!cartDetailsResponse.ok) {
      const error = await cartDetailsResponse.json();
      console.error("Error retrieving cart details:", error);
      alert(`Failed to retrieve cart details: ${JSON.stringify(error)}`);
      return;
    }

    const cartDetails = await cartDetailsResponse.json();
    console.log("Cart details retrieved:", cartDetails);

    // Construct the PUT payload
    const putPayload = {
      ...cartDetails.requests[0], // Assuming a single request
      vendor_id: cartDetails.vendor_id,
      vendor_name: cartDetails.vendor_name,
      order_placed: true, // Set order_placed to true
    };

    console.log("Payload to PUT (cart):", putPayload);

    // PUT request to update cart
    const cartResponse = await fetch(`http://127.0.0.1:8000/cart/${item.id}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(putPayload),
    });

    if (!cartResponse.ok) {
      const error = await cartResponse.json();
      console.error("Error updating cart API:", error);
      alert(`Failed to update cart: ${JSON.stringify(error)}`);
      return;
    }

    // Step 4: Update the UI to disable the Order button
    setCartItems((prevCartItems) =>
      prevCartItems.map((cartItem) =>
        cartItem.id === item.id
          ? { ...cartItem, order_placed: true }
          : cartItem
      )
    );

    alert("Order placed successfully!");
  } catch (error) {
    console.error("Error handling cart order:", error);
    alert("An error occurred while processing the order.");
  }
};

////////

  const handleVendorChange = (component_id, selectedVendorName) => {
    const updatedDetails = details.map((detail) => {
      if (detail.component_id === component_id) {
        return { ...detail, vendor_name: selectedVendorName };
      }
      return detail;
    });
    setDetails(updatedDetails);
  };


  const toggleCartView = async () => {
    if (!showCart) {
      await fetchCartItems();
    }
    setShowCart((prevShowCart) => !prevShowCart);
  };

  return (
    <div>
      <h2>Request Details for {requestId}</h2>
      <button onClick={toggleCartView}>
        {showCart ? "Hide Cart" : "View Cart"}
      </button>

       {/* Render CustomMessagebox when showMessageBox is true */}
    {showMessageBox && (
      <CustomMessagebox
        message={messageBoxContent}
        onClose={() => setShowMessageBox(false)}
      />
    )}
  
      {showCart ? (
        <div>
          <h3>Cart</h3>
    {cartItems.length === 0 ? (
      <p>Your cart is empty.</p>
    ) : (
      cartItems.map((group, groupIndex) => (
        <div key={group.vendor_id || groupIndex}>
          <h4>Vendor: {group.vendor_name}</h4>
          <table>
            <thead>
              <tr>
                <th>Component ID</th>
                <th>Component Type</th>
                <th>Specification</th>
                <th>Quantity</th>
                <th>Category</th>
                <th>Unit of Measurement</th>
                <th>Unit Price</th>
                <th>GST (%)</th>
                <th>Total Cost</th>
                <th>Order</th> {/* New column header for Order button */}
              </tr>
            </thead>
            <tbody>
              {group.requests.map((item, index) => (
                <tr key={index}>
                  <td>{item.component_id}</td>
                  <td>{item.component_type}</td>
                  <td>{item.component_specification}</td>
                  <td>{item.quantity}</td>
                  <td>{item.category}</td>
                  <td>{item.unit_of_measurement}</td>
                  <td>{item.unit_price}</td>
                  <td>{item.GST}</td>
                  <td>{item.total_cost}</td>
                  <td>
                  <button
                      onClick={() => handleCartOrder(item)}
                      disabled={item.order_placed}
                    >
                      {item.order_placed ? "Order Placed" : "Place Order"}
                    </button>
                      </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))
    )}
  </div>
      ) : (
        <>
          {details.length === 0 ? (
            <p>No request details found for this ID.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Component Type</th>
                  <th>Specification</th>
                  <th>Unit of Measurement</th>
                  <th>Category</th>
                  <th>Vendor Name</th>
                  {/* <th>BOM Name</th> */}
                  <th>Quantity</th>
                  <th>Available Quantity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {details.map((detail) => {
                  const availableQty = inventoryData[detail.component_id]?.qty || 0;
                  const isAssigned = assignedComponents[detail.component_id] || detail.qty === 0;
                  
  
                  return (
                    <tr key={detail.component_id}>
                      <td>{detail.status}</td>
                      <td>{detail.component_type}</td>
                      <td>{detail.component_specification}</td>
                      <td>{detail.unit_of_measurement}</td>
                      <td>{detail.category}</td>
                      <td>
                        <select
                          value={detail.vendor_name || ""}
                          onChange={(e) =>
                            handleVendorChange(detail.component_id, e.target.value)
                          }
                        >
                          <option value="">Select Vendor</option>
                          {vendorNames.map((vendor) => (
                            <option key={vendor.vendor_id} value={vendor.vendor_name}>
                              {vendor.vendor_name}
                            </option>
                          ))}
                        </select>
                      </td>
                      {/* <td>{detail.bom_name}</td> */}
                      <td>{detail.assign ? 0 : detail.qty}</td>
                     
                      <td>{availableQty}</td>

                      <td>
                      {detail.assign || detail.qty === 0 ? (
                          <button
                          style={{
                            padding: '10px 20px',
                            fontSize: '14px',
                            borderRadius: '5px',
                            border: '1px solid #ccc',
                            cursor: detail.assign ? 'pointer' : 'not-allowed',
                            marginRight: '10px',
                            width: '100px', // Fixed width
                            height: '40px', // Fixed height
                            textAlign: 'center', // Center-align text
                            transition: 'background-color 0.3s ease',
                          }}
                          onClick={() => handleUnassign(detail.component_id, detail.qty)}
                          disabled={!detail.assign}
                        >
                          Assigned
                        </button>
                      ) : (
                        <button
                          style={{
                            padding: '10px 20px',
                            fontSize: '14px',
                            borderRadius: '5px',
                            border: '1px solid #ccc',
                            cursor: availableQty < detail.qty || detail.qty === 0 || detail.assign ? 'not-allowed' : 'pointer',
                            marginRight: '10px',
                            width: '100px', // Fixed width
                            height: '40px', // Fixed height
                            textAlign: 'center', // Center-align text
                            transition: 'background-color 0.3s ease',
                          }}
                          onClick={() => handleAssign(detail.component_id, detail.qty)}
                          disabled={availableQty < detail.qty || detail.qty === 0 || detail.assign}
                        >
                          Assign
                        </button>
                      )}
                     <button
                      style={{
                        padding: '10px 20px',
                        fontSize: '14px',
                        borderRadius: '5px',
                        border: '1px solid #ccc',
                        cursor: detail.qty === 0 || detail.assign ? 'not-allowed' : 'pointer',
                        // backgroundColor: detail.qty === 0 || detail.assign ? '#e0e0e0' : '#2196f3',
                        // color: detail.qty === 0 || detail.assign ? '#a0a0a0' : '#ffffff',
                        transition: 'background-color 0.3s ease',
                      }}
                      onClick={() => handleOrder(detail)}
                      disabled={detail.qty === 0 || detail.assign}
                    >
                      {detail.assign ? 'Added to cart' : 'Add to Cart'}
                    </button>
                    </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </>
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
                    color: selectedSerialNumbers.includes(serial) ? "blue" : "black",
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
  
      <style >{`
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
  );
  };

export default RequestDetails;

