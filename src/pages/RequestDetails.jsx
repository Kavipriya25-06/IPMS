
// import React, { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";

// const RequestDetails = () => {
//   const { requestId } = useParams();
//   const [details, setDetails] = useState([]);
//   const [vendorNames, setVendorNames] = useState([]);
//   const [inventoryData, setInventoryData] = useState({});
//   const [cartItems, setCartItems] = useState([]);
//   const [showCart, setShowCart] = useState(false);
//   const [showSerialPopup, setShowSerialPopup] = useState(false);
//   const [serialNumbers, setSerialNumbers] = useState([]);
//   const [selectedComponent, setSelectedComponent] = useState(null);
//   const [disabledSerialNumbers, setDisabledSerialNumbers] = useState([]);
//   const [assignedComponents, setAssignedComponents] = useState({}); // Track assigned components

//   useEffect(() => {
//     fetchRequestDetails();
//     fetchInventoryData();
//     fetchVendorList();
//   }, [requestId]);

//   const fetchRequestDetails = async () => {
//     try {
//       const response = await fetch("http://127.0.0.1:8000/request_master/");
//       const data = await response.json();
//       const filteredDetails = data.filter(
//         (detail) => String(detail.request_id) === String(requestId)
//       );
//       setDetails(filteredDetails);
//     } catch (error) {
//       console.error("Error fetching request details:", error);
//     }
//   };

//   const fetchInventoryData = async () => {
//     try {
//       const response = await fetch("http://127.0.0.1:8000/inventory/");
//       const data = await response.json();

//       const inventoryMap = data.reduce((acc, item) => {
//         if (!acc[item.com_id]) {
//           acc[item.com_id] = { qty: 0, serialNumbers: [] };
//         }

//         if (item.status === true) {
//           acc[item.com_id].qty += 1; // Increment qty if status is true
//         }

//         acc[item.com_id].serialNumbers.push({
//           serialNumber: item.serial_number,
//           status: item.status,
//         });

//         return acc;
//       }, {});

//       setInventoryData(inventoryMap);
//     } catch (error) {
//       console.error("Error fetching inventory data:", error);
//     }
//   };

//   const fetchVendorList = async () => {
//     try {
//       const response = await fetch("http://127.0.0.1:8000/vendor_list/");
//       const data = await response.json();
//       const uniqueVendors = data.map((vendor) => ({
//         vendor_id: vendor.vendor_id,
//         vendor_name: vendor.vendor_name,
//       }));
//       setVendorNames(uniqueVendors);
//     } catch (error) {
//       console.error("Error fetching vendor list:", error);
//     }
//   };


//   ////

//   const handleOrder = async (detail) => {
//       if (!detail.vendor_name) {
//            alert("Please select a vendor for this component.");
//            return;
//          }
    
//          const selectedVendor = vendorNames.find(
//            (vendor) => vendor.vendor_name === detail.vendor_name
//          );
//          const vendor_id = selectedVendor ? selectedVendor.vendor_id : null;
    
//          if (!vendor_id) {
//            alert("Invalid vendor selected.");
//            return;
//          }
    
//          const orderData = {
//            component_id: detail.component_id,
//            component_type: detail.component_type,
//            component_specification: detail.component_specification,
//            quantity: detail.qty,
//            request_id: requestId,
//            vendor_name: detail.vendor_name,
//            vendor_id: vendor_id,
//            category: detail.category,
//            unit_of_measurement: detail.unit_of_measurement,
//          };
    
//          try {
//            const response = await fetch("http://127.0.0.1:8000/cart/", {
//              method: "POST",
//              headers: {
//                "Content-Type": "application/json",
//              },
//              body: JSON.stringify(orderData),
//            });
    
//            if (response.ok) {
//              alert(`Component ${detail.component_id} added to cart.`);
//              fetchCartItems();
//            } else {
//              console.error("Error adding component to cart:", response.statusText);
//            }
//          } catch (error) {
//            console.error("Error posting to cart:", error);
//          }
//        };
    






//   /////

//   const handleAssign = async (componentId, qty) => {
//     const componentData = inventoryData[componentId];
  
//     if (componentData && componentData.qty >= qty) {
//       const availableSerialNumbers = componentData.serialNumbers
//         .filter((sn) => sn.status === true)
//         .map((sn) => sn.serialNumber);
  
//       if (availableSerialNumbers.length >= qty) {
//         setSerialNumbers(availableSerialNumbers);
//         setSelectedComponent(componentId);
//         setShowSerialPopup(true);
//       } else {
//         alert("Insufficient available serial numbers in inventory for this component.");
//       }
//     } else {
//       alert("Insufficient quantity in inventory.");
//     }
//   };

//   const handleSerialSelection = async (serialNumber) => {
//     setShowSerialPopup(false);
  
//     try {
//       // Find the selected component details
//       const selectedDetail = details.find(
//         (detail) => detail.component_id === selectedComponent
//       );
  
//       if (!selectedDetail) {
//         console.error("Component details not found.");
//         return;
//       }
  
//       // Construct the payload for inventory update
//       const inventoryPayload = {
//         component: selectedComponent,
//         serial_number: serialNumber,
//         vendor: selectedDetail.vendor_name || "V_00001",
//         com_id: selectedComponent,
//         qty: 1,
//         status: false,
//       };
  
//       // Send the PUT request to update inventory
//       const inventoryResponse = await fetch(
//         `http://127.0.0.1:8000/inventory/${serialNumber}`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(inventoryPayload),
//         }
//       );
  
//       if (inventoryResponse.ok) {
//         // Fetch the current quantity from request_master
//         const requestMasterFetchResponse = await fetch(
//           `http://127.0.0.1:8000/request_master/${requestId}/`
//         );
  
//         if (requestMasterFetchResponse.ok) {
//           const requestData = await requestMasterFetchResponse.json();
//           const currentQty = requestData.qty || 1;
//           const updatedQty = currentQty - 1;
  
//           // Construct the payload for request master update
//           const requestMasterPayload = {
//             assign: true,
//             qty: updatedQty,
//             status: "Assigned", // Set the status to "Assigned"
//           };
  
//           // Send the PUT request to update request master
//           const requestMasterResponse = await fetch(
//             `http://127.0.0.1:8000/request_master/${requestId}/`,
//             {
//               method: "PUT",
//               headers: {
//                 "Content-Type": "application/json",
//               },
//               body: JSON.stringify(requestMasterPayload),
//             }
//           );
  
//           if (requestMasterResponse.ok) {
//             setInventoryData((prevData) => {
//               const currentComponentData = prevData[selectedComponent] || {};
//               const currentSerialNumbers = currentComponentData.serialNumbers || [];
  
//               return {
//                 ...prevData,
//                 [selectedComponent]: {
//                   ...currentComponentData,
//                   qty: currentComponentData.qty - 1,
//                   serialNumbers: currentSerialNumbers.filter(
//                     (sn) => sn.serialNumber !== serialNumber
//                   ),
//                 },
//               };
//             });
  
//             setAssignedComponents((prevAssigned) => ({
//               ...prevAssigned,
//               [selectedComponent]: true,
//             }));
  
//             setDisabledSerialNumbers((prev) => [...prev, serialNumber]);
//           } else {
//             console.error("Error updating request master status.");
//             alert("Could not update the request master status.");
//           }
//         } else {
//           console.error("Error fetching request master data.");
//           alert("Could not fetch the current quantity for the request.");
//         }
//       } else {
//         const errorData = await inventoryResponse.json();
//         console.error(
//           "Error assigning serial number:",
//           errorData.error || inventoryResponse.statusText
//         );
//         alert("Could not assign the serial number. Please check and try again.");
//       }
//     } catch (error) {
//       console.error("Error assigning serial number:", error);
//       alert("An unexpected error occurred while assigning the serial number.");
//     }
//   };


// /////////////

// const handleUnassign = async (componentId) => {
//   try {
//     const componentData = inventoryData[componentId];
//     const assignedSerial = componentData.serialNumbers.find(
//       (sn) => sn.status === false
//     );

//     if (!assignedSerial) {
//       alert("No assigned serial number found to unassign.");
//       return;
//     }

//     // Construct the inventory payload to reset status to true
//     const inventoryPayload = {
//       component: componentId,
//       serial_number: assignedSerial.serialNumber,
//       vendor: componentData.vendor || "V_00001",
//       com_id: componentId,
//       qty: 1,
//       status: true,
//     };

//     // Update inventory to set status back to true
//     const inventoryResponse = await fetch(
//       `http://127.0.0.1:8000/inventory/${assignedSerial.serialNumber}`,
//       {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(inventoryPayload),
//       }
//     );

//     if (inventoryResponse.ok) {
//       // Fetch the updated qty from the backend to ensure consistency
//       const updatedInventoryResponse = await fetch(
//         `http://127.0.0.1:8000/inventory/`
//       );
//       const updatedInventoryData = await updatedInventoryResponse.json();

//       // Find the updated qty for the specific componentId
//       const updatedComponentData = updatedInventoryData.find(
//         (item) => item.com_id === componentId
//       );

//       // Full payload for request_master update with assign = false
//       const requestMasterPayload = {
//         request_id: requestId,
//         component_id: componentId,
//         bom_master_id: componentData.bom_master_id,
//         status: "Unassigned",
//         vendor_id: componentData.vendor || "V_00001",
//         component_type: componentData.component_type,
//         component_specification: componentData.component_specification,
//         unit_of_measurement: componentData.unit_of_measurement,
//         category: componentData.category,
//         bom_detail: componentData.bom_detail,
//         bom_name: componentData.bom_name,
//         quantity: componentData.quantity,
//         qty: updatedComponentData.qty, // Update with the latest qty from backend
//         assign: false,
//       };

//       // Update request master to set assign to false
//       const requestMasterResponse = await fetch(
//         `http://127.0.0.1:8000/request_master/${requestId}/`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(requestMasterPayload),
//         }
//       );

//       if (requestMasterResponse.ok) {
//         setInventoryData((prevData) => {
//           const currentComponentData = prevData[componentId] || {};
//           const updatedSerialNumbers = currentComponentData.serialNumbers.map(
//             (sn) =>
//               sn.serialNumber === assignedSerial.serialNumber
//                 ? { ...sn, status: true }
//                 : sn
//           );

//           return {
//             ...prevData,
//             [componentId]: {
//               ...currentComponentData,
//               qty: updatedComponentData.qty, // Set qty to latest value from backend
//               serialNumbers: updatedSerialNumbers,
//             },
//           };
//         });

//         setAssignedComponents((prevAssigned) => ({
//           ...prevAssigned,
//           [componentId]: false,
//         }));
//       } else {
//         console.error("Error updating request master status.");
//       }
//     } else {
//       console.error("Error unassigning serial number in inventory.");
//     }
//   } catch (error) {
//     console.error("Error unassigning serial number:", error);
//   }
// };






//   ////////////////


//   const handleVendorChange = (component_id, selectedVendorName) => {
//     const updatedDetails = details.map((detail) => {
//       if (detail.component_id === component_id) {
//         return { ...detail, vendor_name: selectedVendorName };
//       }
//       return detail;
//     });
//     setDetails(updatedDetails);
//   };

//   const fetchCartItems = async () => {
//     try {
//       const response = await fetch("http://127.0.0.1:8000/cart/");
//       const data = await response.json();

//       const groupedByVendor = data.grouped_data.reduce((acc, vendorGroup) => {
//         const { vendor_id, vendor_name, requests } = vendorGroup;
//         acc[vendor_name] = acc[vendor_name] || [];
//         acc[vendor_name].push(...requests.map((request) => ({
//           ...request,
//           vendor_id,
//           vendor_name,
//         })));
//         return acc;
//       }, {});

//       setCartItems(groupedByVendor);
//     } catch (error) {
//       console.error("Error fetching cart items:", error);
//     }
//   };

//   const toggleCartView = async () => {
//     if (!showCart) {
//       await fetchCartItems();
//     }
//     setShowCart((prevShowCart) => !prevShowCart);
//   };

//   return (
//     <div>
//       <h2>Request Details for {requestId}</h2>
//       <button onClick={toggleCartView}>
//         {showCart ? "Hide Cart" : "View Cart"}
//       </button>
  
//       {showCart ? (
//         <div>
//           <h3>Cart</h3>
//           {Object.keys(cartItems).length === 0 ? (
//             <p>Your cart is empty.</p>
//           ) : (
//             Object.keys(cartItems).map((vendorName) => (
//               <div key={vendorName}>
//                 <h4>Vendor: {vendorName}</h4>
//                 <table>
//                   <thead>
//                     <tr>
//                       <th>Component ID</th>
//                       <th>Component Type</th>
//                       <th>Specification</th>
//                       <th>Quantity</th>
//                       <th>Category</th>
//                       <th>Unit of Measurement</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {cartItems[vendorName].map((item, index) => (
//                       <tr key={index}>
//                         <td>{item.component_id}</td>
//                         <td>{item.component_type}</td>
//                         <td>{item.component_specification}</td>
//                         <td>{item.quantity}</td>
//                         <td>{item.category}</td>
//                         <td>{item.unit_of_measurement}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             ))
//           )}
//         </div>
//       ) : (
//         <>
//           {details.length === 0 ? (
//             <p>No request details found for this ID.</p>
//           ) : (
//             <table>
//               <thead>
//                 <tr>
//                   <th>Status</th>
//                   <th>Component Type</th>
//                   <th>Specification</th>
//                   <th>Unit of Measurement</th>
//                   <th>Category</th>
//                   <th>Vendor Name</th>
//                   <th>BOM Name</th>
//                   <th>Quantity</th>
//                   <th>Available Quantity</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {details.map((detail) => {
//                   const availableQty = inventoryData[detail.component_id]?.qty || 0;
//                   const isAssigned = assignedComponents[detail.component_id] || detail.qty === 0;
  
//                   return (
//                     <tr key={detail.component_id}>
//                       <td>{detail.status}</td>
//                       <td>{detail.component_type}</td>
//                       <td>{detail.component_specification}</td>
//                       <td>{detail.unit_of_measurement}</td>
//                       <td>{detail.category}</td>
//                       <td>
//                         <select
//                           value={detail.vendor_name || ""}
//                           onChange={(e) =>
//                             handleVendorChange(detail.component_id, e.target.value)
//                           }
//                         >
//                           <option value="">Select Vendor</option>
//                           {vendorNames.map((vendor) => (
//                             <option key={vendor.vendor_id} value={vendor.vendor_name}>
//                               {vendor.vendor_name}
//                             </option>
//                           ))}
//                         </select>
//                       </td>
//                       <td>{detail.bom_name}</td>
//                       <td>{detail.qty}</td>
//                       <td>{availableQty}</td>
//                       <td>
//                         {isAssigned || availableQty === 0 || detail.quantity === 0 ? (
//                           <button onClick={() => handleUnassign(detail.component_id)}>
//                             Unassign
//                           </button>
//                         ) : (
//                           <button
//                             onClick={() => handleAssign(detail.component_id, detail.qty)}
//                             disabled={availableQty < detail.qty || detail.qty === 0}
//                           >
//                             Assign
//                           </button>
//                         )}
//                         <button onClick={() => handleOrder(detail)}>
//                           Add to Cart
//                         </button>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           )}
//         </>
//       )}
  
//       {showSerialPopup && (
//         <div className="modal">
//           <div className="modal-content">
//             <h3>Select Serial Number</h3>
//             <ul>
//               {serialNumbers.map((serial, index) => (
//                 <li key={index}>
//                   <button
//                     onClick={() => handleSerialSelection(serial)}
//                     disabled={disabledSerialNumbers.includes(serial)}
//                     style={{
//                       color: disabledSerialNumbers.includes(serial) ? "grey" : "black",
//                       cursor: disabledSerialNumbers.includes(serial) ? "not-allowed" : "pointer",
//                     }}
//                   >
//                     {serial}
//                   </button>
//                 </li>
//               ))}
//             </ul>
//             <button onClick={() => setShowSerialPopup(false)}>Close</button>
//           </div>
//         </div>
//       )}
  
//       <style jsx>{`
//         .modal {
//           position: fixed;
//           top: 0;
//           left: 0;
//           right: 0;
//           bottom: 0;
//           background: rgba(0, 0, 0, 0.5);
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           z-index: 1000;
//         }
//         .modal-content {
//           background: #fff;
//           padding: 20px;
//           border-radius: 8px;
//           width: 300px;
//           text-align: center;
//         }
//         .modal-content ul {
//           list-style: none;
//           padding: 0;
//         }
//         .modal-content button {
//           margin-top: 10px;
//         }
//       `}</style>
//     </div>
//   );
//   };

// export default RequestDetails;



import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

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
      const data = await response.json();

      const groupedByVendor = data.grouped_data.reduce((acc, vendorGroup) => {
        const { vendor_id, vendor_name, requests } = vendorGroup;
        acc[vendor_name] = acc[vendor_name] || [];
        acc[vendor_name].push(
          ...requests.map((request) => ({
            ...request,
            vendor_id,
            vendor_name,
          }))
        );
        return acc;
      }, {});

      setCartItems(groupedByVendor);
    } catch (error) {
      console.error("Error fetching cart items:", error);
    }
  };


  ////

  const handleOrder = async (detail) => {
      if (!detail.vendor_name) {
           alert("Please select a vendor for this component.");
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

           // Check if component is already in the cart for this vendor
          if (cartItems[vendor_id] && cartItems[vendor_id][detail.component_id]) {
            alert(`Component ${detail.component_id} is already in the cart.`);
            return;
          }
    
         const orderData = {
           component_id: detail.component_id,
           component_type: detail.component_type,
           component_specification: detail.component_specification,
           quantity: detail.qty,
           request_id: requestId,
           vendor_name: detail.vendor_name,
           vendor_id: vendor_id,
           category: detail.category,
           unit_of_measurement: detail.unit_of_measurement,
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
             alert(`Component ${detail.component_id} added to cart.`);
            // Update qty to 0 in frontend
           setDetails((prevDetails) =>
           prevDetails.map((d) =>
            d.component_id === detail.component_id ? { ...d, qty: 0 } : d
          )
        );

        // Update qty to 0 in backend request_master table
         // Update qty to 0 and set required fields in the backend
      const requestMasterPayload = {
        qty: 0,
        status: "Added to cart", // Set status as "Added to cart"
        assign: true, // Set assign as true
      };

      const requestMasterResponse = await fetch(`http://127.0.0.1:8000/request_master/${requestId}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestMasterPayload),
      });

      if (requestMasterResponse.ok) {
        fetchCartItems(); // Refresh the cart items
      } else {
        console.error("Error updating request master status:", requestMasterResponse.statusText);
      }
    } else {
      console.error("Error adding component to cart:", response.statusText);
    }
  } catch (error) {
    console.error("Error posting to cart:", error);
  }
};
    






  /////

  const handleAssign = async (componentId, qty) => {
    const componentData = inventoryData[componentId];
  
    if (componentData && componentData.qty >= qty) {
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
  
  // Update `handleConfirmAssignment` to only allow confirmation with exact selections
  const handleConfirmAssignment = async () => {
    if (selectedSerialNumbers.length !== requiredQty) {
      alert(`Please select exactly ${requiredQty} serial numbers.`);
      return;
    }
  
    setShowSerialPopup(false);
  
    try {
      for (const serialNumber of selectedSerialNumbers) {
        const selectedDetail = details.find(
          (detail) => detail.component_id === selectedComponent
        );
  
        if (!selectedDetail) {
          console.error("Component details not found.");
          return;
        }
  
        const inventoryPayload = {
          component: selectedComponent,
          serial_number: serialNumber,
          vendor: selectedDetail.vendor_name || "V_00001",
          com_id: selectedComponent,
          qty: 1,
          status: false,
        };
  
        await fetch(`http://127.0.0.1:8000/inventory/${serialNumber}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(inventoryPayload),
        });
      }
  
      const requestMasterFetchResponse = await fetch(
        `http://127.0.0.1:8000/request_master/${requestId}/`
      );
  
      if (requestMasterFetchResponse.ok) {
        const requestData = await requestMasterFetchResponse.json();
        const currentQty = requestData.qty || 1;
        const updatedQty = currentQty - requiredQty;
  
        const requestMasterPayload = {
          assign: true,
          qty: updatedQty,
          status: "Assigned",
        };
  
        const requestMasterResponse = await fetch(
          `http://127.0.0.1:8000/request_master/${requestId}/`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestMasterPayload),
          }
        );
  
        if (requestMasterResponse.ok) {
          setInventoryData((prevData) => {
            const currentComponentData = prevData[selectedComponent] || {};
            const updatedSerialNumbers = currentComponentData.serialNumbers.filter(
              (sn) => !selectedSerialNumbers.includes(sn.serialNumber)
            );
  
            return {
              ...prevData,
              [selectedComponent]: {
                ...currentComponentData,
                qty: currentComponentData.qty - requiredQty,
                serialNumbers: updatedSerialNumbers,
              },
            };
          });
        } else {
          console.error("Error updating request master status.");
          alert("Could not update the request master status.");
        }
      } else {
        console.error("Error fetching request master data.");
        alert("Could not fetch the current quantity for the request.");
      }
    } catch (error) {
      console.error("Error assigning serial numbers:", error);
      alert("An error occurred during assignment.");
    }
  };


/////////////

const handleUnassign = async (componentId) => {
  try {
    const componentData = inventoryData[componentId];
    const assignedSerials = componentData.serialNumbers.filter(
      (sn) => sn.status === false
    );

    if (assignedSerials.length === 0) {
      alert("No assigned serial numbers found to unassign.");
      return;
    }

    // Unassign each assigned serial number
    for (const serial of assignedSerials) {
      const inventoryPayload = {
        component: componentId,
        serial_number: serial.serialNumber,
        vendor: componentData.vendor || "V_00001",
        com_id: componentId,
        qty: 1,
        status: true, // Reverting status to true in inventory
      };

      // Update each serial in inventory to set status back to true
      const inventoryResponse = await fetch(
        `http://127.0.0.1:8000/inventory/${serial.serialNumber}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(inventoryPayload),
        }
      );

      if (!inventoryResponse.ok) {
        console.error("Error unassigning serial number in inventory.");
        alert("Could not unassign the serial number. Please try again.");
        return;
      }
    }

    // Update request_master to reflect all quantities are unassigned
    const updatedQty = componentData.qty-1 ; // Recalculate the qty
    const requestMasterPayload = {
      request_id: requestId,
      component_id: componentId,
      bom_master_id: componentData.bom_master_id,
      status: "Unassigned",
      vendor_id: componentData.vendor || "V_00001",
      component_type: componentData.component_type,
      component_specification: componentData.component_specification,
      unit_of_measurement: componentData.unit_of_measurement,
      category: componentData.category,
      bom_detail: componentData.bom_detail,
      bom_name: componentData.bom_name,
      quantity: componentData.quantity,
      qty: updatedQty, // Set qty back with total after unassigning all serials
      assign: false,
    };

    // Update request_master with the new qty and assign status
    const requestMasterResponse = await fetch(
      `http://127.0.0.1:8000/request_master/${requestId}/`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestMasterPayload),
      }
    );

    if (requestMasterResponse.ok) {
      setInventoryData((prevData) => {
        const currentComponentData = prevData[componentId] || {};
        const updatedSerialNumbers = currentComponentData.serialNumbers.map(
          (sn) => (assignedSerials.includes(sn.serialNumber) ? { ...sn, status: true } : sn)
        );

        return {
          ...prevData,
          [componentId]: {
            ...currentComponentData,
            qty: updatedQty, // Update with the new qty after unassigning all serials
            serialNumbers: updatedSerialNumbers,
          },
        };
      });

      setAssignedComponents((prevAssigned) => ({
        ...prevAssigned,
        [componentId]: false,
      }));
    } else {
      console.error("Error updating request master status.");
      alert("Could not update the request master status.");
    }
  } catch (error) {
    console.error("Error unassigning serial numbers:", error);
  }
};







  ////////////////


  const handleVendorChange = (component_id, selectedVendorName) => {
    const updatedDetails = details.map((detail) => {
      if (detail.component_id === component_id) {
        return { ...detail, vendor_name: selectedVendorName };
      }
      return detail;
    });
    setDetails(updatedDetails);
  };

  // const fetchCartItems = async () => {
  //   try {
  //     const response = await fetch("http://127.0.0.1:8000/cart/");
  //     const data = await response.json();

  //     const groupedByVendor = data.grouped_data.reduce((acc, vendorGroup) => {
  //       const { vendor_id, vendor_name, requests } = vendorGroup;
  //       acc[vendor_name] = acc[vendor_name] || [];
  //       acc[vendor_name].push(...requests.map((request) => ({
  //         ...request,
  //         vendor_id,
  //         vendor_name,
  //       })));
  //       return acc;
  //     }, {});

  //     setCartItems(groupedByVendor);
  //   } catch (error) {
  //     console.error("Error fetching cart items:", error);
  //   }
  // };

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
  
      {showCart ? (
        <div>
          <h3>Cart</h3>
          {Object.keys(cartItems).length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            Object.keys(cartItems).map((vendorName) => (
              <div key={vendorName}>
                <h4>Vendor: {vendorName}</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Component ID</th>
                      <th>Component Type</th>
                      <th>Specification</th>
                      <th>Quantity</th>
                      <th>Category</th>
                      <th>Unit of Measurement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems[vendorName].map((item, index) => (
                      <tr key={index}>
                        <td>{item.component_id}</td>
                        <td>{item.component_type}</td>
                        <td>{item.component_specification}</td>
                        <td>{item.quantity}</td>
                        <td>{item.category}</td>
                        <td>{item.unit_of_measurement}</td>
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
                      <td>{detail.qty}</td>
                      <td>{availableQty}</td>
                      <td>
                        {isAssigned || availableQty === 0 || detail.quantity === 0 ? (
                          <button onClick={() => handleUnassign(detail.component_id)}>
                            Unassign
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAssign(detail.component_id, detail.qty)}
                            disabled={availableQty < detail.qty || detail.qty === 0}
                          >
                            Assign
                          </button>
                        )}
                       <button
                          onClick={() => handleOrder(detail)}
                          disabled={detail.qty === 0}
                        >
                          Add to Cart
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
  );
  };

export default RequestDetails;
