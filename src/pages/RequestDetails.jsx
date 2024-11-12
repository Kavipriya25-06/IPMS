
// import React, { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";

// const RequestDetails = () => {
//   const { requestId } = useParams();
//   const [details, setDetails] = useState([]);
//   const [vendorNames, setVendorNames] = useState([]);
//   const [inventoryData, setInventoryData] = useState({});
//   const [cartItems, setCartItems] = useState([]);
//   const [showCart, setShowCart] = useState(false);

//   useEffect(() => {
//     fetchRequestDetails();
//     fetchInventoryData();
//     fetchVendorList(); // Fetch complete vendor list
//   }, [requestId]);

//   // Fetch request details from request_master and filter based on requestId
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

//   // Fetch inventory data to get available counts for each component
//   const fetchInventoryData = async () => {
//     try {
//       const response = await fetch("http://127.0.0.1:8000/inventory/");
//       const data = await response.json();
//       const inventoryMap = data.reduce((acc, item) => {
//         acc[item.com_id] = item.qty;
//         return acc;
//       }, {});
//       setInventoryData(inventoryMap);
//     } catch (error) {
//       console.error("Error fetching inventory data:", error);
//     }
//   };

//   // Fetch the complete vendor list from vendor_list API
//   const fetchVendorList = async () => {
//     try {
//       const response = await fetch("http://127.0.0.1:8000/vendor_list/");
//       const data = await response.json();
//       const uniqueVendors = data.map((vendor) => vendor.vendor_name); // Extract vendor names
//       setVendorNames(uniqueVendors);
//     } catch (error) {
//       console.error("Error fetching vendor list:", error);
//     }
//   };

//   const handleOrder = (detail) => {
//     setCartItems((prevItems) => [...prevItems, detail]); // Add item to cart
//     alert(`Component ${detail.component_id} added to cart.`);
//   };

//   const handleAssign = async (componentId, requiredQty) => {
//     const availableQty = inventoryData[componentId] || 0;
//     if (availableQty >= requiredQty) {
//       try {
//         const response = await fetch(
//           `http://127.0.0.1:8000/inventory/${componentId}/`,
//           {
//             method: "PATCH",
//             headers: {
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify({ qty: availableQty - requiredQty }),
//           }
//         );

//         if (response.ok) {
//           setInventoryData((prevData) => ({
//             ...prevData,
//             [componentId]: availableQty - requiredQty,
//           }));
//         } else {
//           console.error("Error assigning component:", response.statusText);
//         }
//       } catch (error) {
//         console.error("Error assigning component:", error);
//       }
//     } else {
//       alert("Not enough stock available to assign this component.");
//     }
//   };

//   const handleVendorChange = (component_id, selectedVendor) => {
//     const updatedDetails = details.map((detail) => {
//       if (detail.component_id === component_id) {
//         return { ...detail, vendor_name: selectedVendor };
//       }
//       return detail;
//     });
//     setDetails(updatedDetails);
//   };

//   const toggleCartView = () => {
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
//           {cartItems.length === 0 ? (
//             <p>Your cart is empty.</p>
//           ) : (
//             <table>
//               <thead>
//                 <tr>
//                   <th>Component ID</th>
//                   <th>Component Type</th>
//                   <th>Specification</th>
//                   <th>Quantity</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {cartItems.map((item, index) => (
//                   <tr key={index}>
//                     <td>{item.component_id}</td>
//                     <td>{item.component_type}</td>
//                     <td>{item.component_specification}</td>
//                     <td>{item.qty}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
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
//                   const availableQty = inventoryData[detail.component_id] || 0;

//                   return (
//                     <tr key={detail.component_id}>
//                       <td>{detail.status}</td>
//                       <td>{detail.component_type}</td>
//                       <td>{detail.component_specification}</td>
//                       <td>{detail.unit_of_measurement}</td>
//                       <td>{detail.category}</td>
//                       <td>
//                         <select
//                           value={detail.vendor_name}
//                           onChange={(e) =>
//                             handleVendorChange(detail.component_id, e.target.value)
//                           }
//                         >
//                           <option value="">Select Vendor</option>
//                           {vendorNames.map((vendor, index) => (
//                             <option key={index} value={vendor}>
//                               {vendor}
//                             </option>
//                           ))}
//                         </select>
//                       </td>
//                       <td>{detail.bom_name}</td>
//                       <td>{detail.qty}</td>
//                       <td>{availableQty}</td>
//                       <td>
//                         <button
//                           onClick={() => handleAssign(detail.component_id, detail.qty)}
//                           disabled={availableQty < detail.qty}
//                         >
//                           Assign
//                         </button>
//                         <button onClick={() => handleOrder(detail)}>
//                           Order
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
//     </div>
//   );
// };

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

  useEffect(() => {
    fetchRequestDetails();
    fetchInventoryData();
    fetchVendorList();
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
        acc[item.com_id] = acc[item.com_id] || { qty: 0, serialNumbers: [] };
        acc[item.com_id].qty += item.qty;
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
        fetchCartItems();
      } else {
        console.error("Error adding component to cart:", response.statusText);
      }
    } catch (error) {
      console.error("Error posting to cart:", error);
    }
  };

  const handleAssign = async (componentId, requiredQty) => {
    const componentData = inventoryData[componentId];
    if (componentData) {
      const availableSerialNumbers = componentData.serialNumbers
        .filter((sn) => sn.status === true)
        .map((sn) => sn.serialNumber);

      if (availableSerialNumbers.length > 0) {
        setSerialNumbers(availableSerialNumbers);
        setSelectedComponent(componentId);
        setShowSerialPopup(true);
      } else {
        alert("No available serial numbers in inventory for this component.");
      }
    } else {
      alert("Component not found in inventory.");
    }
  };

  const handleSerialSelection = async (serialNumber) => {
    setShowSerialPopup(false);

    try {
      const response = await fetch(`http://127.0.0.1:8000/inventory/${serialNumber}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          component: selectedComponent,
          qty: inventoryData[selectedComponent]?.qty,
          serialNumber,
          status: false,
          vendor: "V_00001",
        }),
      });

      if (response.ok) {
        setInventoryData((prevData) => {
          const currentComponentData = prevData[selectedComponent] || {};
          const currentSerialNumbers = currentComponentData.serialNumbers || [];

          return {
            ...prevData,
            [selectedComponent]: {
              ...currentComponentData,
              qty: (currentComponentData.qty || 0) - 1,
              serialNumbers: currentSerialNumbers.filter((sn) => sn.serialNumber !== serialNumber),
            },
          };
        });

        setAssignedComponents((prevAssigned) => ({
          ...prevAssigned,
          [selectedComponent]: true,
        }));

        setDisabledSerialNumbers((prev) => [...prev, serialNumber]);
      } else {
        const errorData = await response.json();
        console.error("Error assigning serial number:", errorData.error || response.statusText);
        alert("Could not assign the serial number. Please check and try again.");
      }
    } catch (error) {
      console.error("Error assigning serial number:", error);
      alert("An unexpected error occurred while assigning the serial number.");
    }
  };

  const handleVendorChange = (component_id, selectedVendorName) => {
    const updatedDetails = details.map((detail) => {
      if (detail.component_id === component_id) {
        return { ...detail, vendor_name: selectedVendorName };
      }
      return detail;
    });
    setDetails(updatedDetails);
  };

  const fetchCartItems = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/cart/");
      const data = await response.json();

      const groupedByVendor = data.grouped_data.reduce((acc, vendorGroup) => {
        const { vendor_id, vendor_name, requests } = vendorGroup;
        acc[vendor_name] = acc[vendor_name] || [];
        acc[vendor_name].push(...requests.map((request) => ({
          ...request,
          vendor_id,
          vendor_name,
        })));
        return acc;
      }, {});

      setCartItems(groupedByVendor);
    } catch (error) {
      console.error("Error fetching cart items:", error);
    }
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
                  <th>BOM Name</th>
                  <th>Quantity</th>
                  <th>Available Quantity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {details.map((detail) => {
                  const availableQty = inventoryData[detail.component_id]?.qty || 0;
                  const isAssigned = assignedComponents[detail.component_id] || false;

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
                      <td>{detail.bom_name}</td>
                      <td>{detail.qty}</td>
                      <td>{availableQty}</td>
                      <td>
                        <button
                          onClick={() => handleAssign(detail.component_id, detail.qty)}
                          disabled={isAssigned || availableQty < detail.qty || detail.qty !== 1}
                        >
                          {isAssigned ? "Unassign" : "Assign"}
                        </button>
                        <button onClick={() => handleOrder(detail)}>
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
        <div className="modal">
          <div className="modal-content">
            <h3>Select Serial Number</h3>
            <ul>
              {serialNumbers.map((serial, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleSerialSelection(serial)}
                    disabled={disabledSerialNumbers.includes(serial)}
                    style={{
                      color: disabledSerialNumbers.includes(serial) ? "grey" : "black",
                      cursor: disabledSerialNumbers.includes(serial) ? "not-allowed" : "pointer",
                    }}
                  >
                    {serial}
                  </button>
                </li>
              ))}
            </ul>
            <button onClick={() => setShowSerialPopup(false)}>Close</button>
          </div>
        </div>
      )}

      <style jsx>{`
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
