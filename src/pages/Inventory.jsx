// import React, { useState, useEffect } from "react";

// const Inventory = () => {
//   const [inventoryData, setInventoryData] = useState([]);
//   const [componentData, setComponentData] = useState({}); // Store component data as an object with component_id as keys
//   const [vendorData, setVendorData] = useState({});
//   const [showForm, setShowForm] = useState(false);
//   const [selectedComponent, setSelectedComponent] = useState("");
//   const [serialNumber, setSerialNumber] = useState("");
//   const [count, setCount] = useState("");
//   const [createdDate, setCreatedDate] = useState("");

//   useEffect(() => {
//     fetchInventoryData();
//     fetchComponentMasterData();
//     fetchVendorMasterData();
//   }, []);

//   // Fetch inventory data
//   const fetchInventoryData = async () => {
//     try {
//       const response = await fetch("http://127.0.0.1:8000/inventory/");
//       const data = await response.json();
//       setInventoryData(data);
//     } catch (error) {
//       console.error("Error fetching inventory data:", error);
//     }
//   };

//   // Fetch component master data and store it in a dictionary for easy lookup
//   const fetchComponentMasterData = async () => {
//     try {
//       const response = await fetch("http://127.0.0.1:8000/component/");
//       const data = await response.json();
//       const formattedData = data.reduce((acc, component) => {
//         acc[component.component_id] = component; // Store each component by component_id for quick lookup
//         return acc;
//       }, {});
//       setComponentData(formattedData);
//     } catch (error) {
//       console.error("Error fetching component data:", error);
//     }
//   };

//   // Fetch vendor master data for component_id → vendor_id mapping
//   const fetchVendorMasterData = async () => {
//     try {
//       const response = await fetch("http://127.0.0.1:8000/vendor_master/");
//       const data = await response.json();
//       const formattedData = data.reduce((acc, vendor) => {
//         acc[vendor.component_id] = vendor.vendor_id; // Map component_id to vendor_id
//         return acc;
//       }, {});
//       setVendorData(formattedData);
//     } catch (error) {
//       console.error("Error fetching vendor data:", error);
//     }
//   };

//   const handleAddItemClick = () => {
//     setShowForm(true);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Fetch additional details of selected component from componentData
//     const component = componentData[selectedComponent];
//     const vendorId = vendorData[selectedComponent] || "V_00001";

//     if (!component) {
//       console.error("Component not found in component master");
//       return;
//     }

//     // Prepare the data for posting and display purposes
//     const newItem = {
//       component: component.component_id,
//       serial_number: serialNumber,
//       vendor: vendorId,
//       com_id: component.component_id,
//       qty: count,
//       created_date: createdDate || new Date().toISOString(), // Set to current date if not provided
//     };

//     const displayItem = {
//       ...newItem,
//       category: component.category,
//       component_type: component.component_type,
//       component_specification: component.component_specification,
//       unit_of_measurement: component.unit_of_measurement,
//     };

//     // Update state with full display data and send required fields to backend
//     setInventoryData([...inventoryData, displayItem]);

//     // POST new item to inventory backend
//     try {
//       const response = await fetch("http://127.0.0.1:8000/inventory/", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(newItem),
//       });
//       if (response.ok) {
//         console.log("New item added to inventory successfully.");
//       } else {
//         console.error("Error adding item to inventory:", response.statusText);
//       }
//     } catch (error) {
//       console.error("Error posting new inventory item:", error);
//     }

//     setSelectedComponent("");
//     setSerialNumber("");
//     setCount("");
//     setCreatedDate("");
//     setShowForm(false);
//   };

//   return (
//     <div className="inventory-container">
//       <h4>Inventory Data</h4>
//       <button onClick={handleAddItemClick} className="add-item-button">
//         Add Item
//       </button>
//       {showForm && (
//         <form onSubmit={handleSubmit} className="add-item-form">
//           <label>Component:</label>
//           <select
//             value={selectedComponent}
//             onChange={(e) => setSelectedComponent(e.target.value)}
//             required
//           >
//             <option value="">Select Component</option>
//             {Object.values(componentData).map((component) => (
//               <option
//                 key={component.component_id}
//                 value={component.component_id}
//               >
//                 {component.component_type} - {component.component_specification}
//               </option>
//             ))}
//           </select>

//           <label>Count:</label>
//           <input
//             type="number"
//             value={count}
//             onChange={(e) => setCount(e.target.value)}
//             required
//           />

//           <label>Created Date:</label>
//           <input
//             type="date"
//             value={createdDate}
//             onChange={(e) => setCreatedDate(e.target.value)}
//             required
//           />

//           <button type="submit">Add to Inventory</button>
//         </form>
//       )}

//       <table className="inventory-table">
//         <thead>
//           <tr>
//             <th>Component ID</th>
//             <th>Serial Number</th>
//             <th>Category</th>
//             <th>Component Type</th>
//             <th>Specification</th>
//             <th>UOM</th>
//             <th>Vendor</th>
//             <th>Created Date</th> {/* Added Created Date column header */}
//             <th>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {inventoryData.length > 0 ? (
//             inventoryData.map((item, index) => {
//               const component = componentData[item.com_id] || {}; // Look up full component details by com_id
//               return (
//                 <tr key={index}>
//                   <td>{item.com_id}</td>
//                   <td>{item.serial_number}</td>
//                   <td>{component.category || ""}</td>
//                   <td>{component.component_type || ""}</td>
//                   <td>{component.component_specification || ""}</td>
//                   <td>{component.unit_of_measurement || ""}</td>
//                   <td>{item.vendor || ""}</td>
//                   <td>
//                     {item.created_date || new Date().toLocaleDateString()}
//                   </td>{" "}
//                   {/* Display Created Date */}
//                   <td>
//                     <button>Edit</button>
//                   </td>
//                 </tr>
//               );
//             })
//           ) : (
//             <tr>
//               <td colSpan="9" className="no-data">
//                 No inventory data available
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default Inventory;


import React, { useState, useEffect } from "react";

const Inventory = () => {
  const [inventoryData, setInventoryData] = useState([]);
  const [componentData, setComponentData] = useState({});
  const [vendorData, setVendorData] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [count, setCount] = useState("");
  const [createdDate, setCreatedDate] = useState("");

  useEffect(() => {
    fetchInventoryData();
    fetchComponentMasterData();
    fetchVendorMasterData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/inventory/");
      const data = await response.json();
      setInventoryData(data);
    } catch (error) {
      console.error("Error fetching inventory data:", error);
    }
  };

  const fetchComponentMasterData = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/component/");
      const data = await response.json();
      // Create an object where the key is component_id and the value is the component details
      const formattedData = data.reduce((acc, component) => {
        acc[component.component_id] = component;
        return acc;
      }, {});
      setComponentData(formattedData);
    } catch (error) {
      console.error("Error fetching component data:", error);
    }
  };

  const fetchVendorMasterData = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/vendor_master/");
      const data = await response.json();
      const formattedData = data.reduce((acc, vendor) => {
        acc[vendor.product_id] = vendor.vendor;
        return acc;
      }, {});
      setVendorData(formattedData);
    } catch (error) {
      console.error("Error fetching vendor data:", error);
    }
  };

  const handleAddItemClick = () => {
    setShowForm(true);
  };

  // const handleDeleteClick = async (serialNumber) => {
  //   try {
  //     const response = await fetch(
  //       `http://127.0.0.1:8000/inventory/${serialNumber}`,
  //       {
  //         method: "DELETE",
  //       }
  //     );
  //     if (response.ok) {
  //       console.log("Item deleted successfully");
  //       fetchInventoryData(); // Refresh data to reflect deletion
  //     } else {
  //       console.error("Error deleting item:", response.statusText);
  //     }
  //   } catch (error) {
  //     console.error("Error deleting inventory item:", error);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const component = componentData[selectedComponent];
    const vendorId = vendorData[selectedComponent] || "V_00001";

    if (!component) {
      console.error("Component not found in component master");
      return;
    }

    for (let i = 1; i <= count; i++) {
      const newItem = {
        component: component.component_id,
        vendor: vendorId,
        com_id: component.component_id,
        qty: 1,
        created_date: createdDate || new Date().toISOString(),
        status: true,
      };

      try {
        const response = await fetch("http://127.0.0.1:8000/inventory/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newItem),
        });
        if (response.ok) {
          console.log(`Item ${i} added to inventory successfully.`);
        } else {
          console.error("Error adding item to inventory:", response.statusText);
        }
      } catch (error) {
        console.error("Error posting new inventory item:", error);
      }
    }

    fetchInventoryData();

    setSelectedComponent("");
    setSerialNumber("");
    setCount("");
    setCreatedDate("");
    setShowForm(false);
  };
 
  return (
    <div className="inventory-container">
      <h4>Inventory Data</h4>
      {/* <button onClick={handleAddItemClick} className="add-item-button">
        Add Item
      </button> */}
      {showForm && (
        <form onSubmit={handleSubmit} className="add-item-form">
          <label>Component:</label>
          <select
            value={selectedComponent}
            onChange={(e) => setSelectedComponent(e.target.value)}
            required
          >
            <option value="">Select Component</option>
            {Object.values(componentData).map((component) => (
              <option
                key={component.component_id}
                value={component.component_id}
              >
                {component.component_type} - {component.component_specification}
              </option>
            ))}
          </select>

          <label>Count:</label>
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            required
          />

          <label>Created Date:</label>
          <input
            type="date"
            value={createdDate}
            onChange={(e) => setCreatedDate(e.target.value)}
            required
          />

          <button type="submit">Add to Inventory</button>
        </form>
      )}

      <table className="inventory-table">
        <thead>
          <tr>
            <th>Component ID</th>
            <th>Serial Number</th>
            <th>Category</th>
            <th>Component Type</th>
            <th>Specification</th>
            <th>UOM</th>
            <th>Vendor</th>
            <th>Created Date</th>
            <th>Price</th>
            {/* <th>Actions</th> */}
          </tr>
        </thead>
        <tbody>
          {inventoryData.length > 0 ? (
            inventoryData.map((item, index) => {
              const component = componentData[item.component_id] || {};

              const isDisabled = item.status === false;

              return (
                <tr key={index} className={isDisabled ? "disabled-row" : ""}>
                  <td>{item.component_id}</td>
                  <td>{item.serial_number}</td>
                  <td>{component.category || ""}</td>
                  <td>{component.component_type || ""}</td>
                  <td>{item.specification || ""}</td> {/* Ensure specification is shown */}
                  <td>{item.UOM || ""}</td> {/* Ensure UOM is shown */}
                  <td>{item.vendor_name || ""}</td>
                  <td>
                    {item.create_date || new Date().toLocaleDateString()}
                  </td>
                  <td>{item.price}</td>
                  {/* <td>
                    <button
                      onClick={() => handleDeleteClick(item.serial_number)}
                    >
                      Delete
                    </button>
                  </td> */}
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="9" className="no-data">
                No inventory data available
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <style>{`
        .disabled-row {
          background-color: #e0e0e0;
          color: #a0a0a0;
          pointer-events: none;
        }
        .disabled-row button {
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default Inventory;
