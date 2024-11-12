// // Vendors.jsx
// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import VendorDetails from "./VendorDetails"; // Import the VendorDetails component

// const Vendors = () => {
//   const [vendorData, setVendorData] = useState([]);
//   const navigate = useNavigate();
//   const [selectedVendorData, setSelectedVendorData] = useState([]);
//   const [isEditingVendorList, setIsEditingVendorList] = useState(null);
//   const [showNewVendorRow, setShowNewVendorRow] = useState(false);
//   const [newVendor, setNewVendor] = useState({
//     vendor_name: "",
//     point_of_contact: "",
//     email: "",
//     phone_number: "",
//     location: "",
//     category: "",
//   });

//   useEffect(() => {
//     const fetchVendorData = async () => {
//       try {
//         const response = await fetch("http://127.0.0.1:8000/vendor_list/");
//         const data = await response.json();
//         setVendorData(data);
//       } catch (error) {
//         console.error("Error fetching vendor data:", error);
//       }
//     };
//     fetchVendorData();
//   }, []);

//   const handleVendorClick = async (vendor_id) => {
//     try {
//       const response = await fetch("http://127.0.0.1:8000/vendor_master/");
//       const allVendorProducts = await response.json();
//       const matchedProducts = allVendorProducts.filter(
//         (product) => product.vendor === vendor_id
//       );

//       setSelectedVendorData(matchedProducts);
//       // setNewVendor((prevVendor) => ({ ...prevVendor, vendor: vendor_id }));
//     } catch (error) {
//       console.error("Error fetching vendor products:", error);
//     }
//     // Navigate to the VendorDetails page with the vendor_id in the URL
//     navigate(`/vendor/${vendor_id}`);
//     console.log(`Navigating to /vendor/${vendor_id}`);
//   };

//   const handleEditClickVendorList = (index) => {
//     setIsEditingVendorList(index);
//   };

//   const handleSaveClickVendorList = async (index) => {
//     const updatedVendor = vendorData[index];
//     try {
//       const response = await fetch(
//         `http://127.0.0.1:8000/vendor_list/${updatedVendor.vendor_id}/`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(updatedVendor),
//         }
//       );

//       if (response.ok) {
//         const savedVendor = await response.json();
//         const updatedVendors = [...vendorData];
//         updatedVendors[index] = savedVendor;
//         setVendorData(updatedVendors);
//         setIsEditingVendorList(null);
//       } else {
//         console.error("Error updating vendor:", response.statusText);
//       }
//     } catch (error) {
//       console.error("Error updating vendor:", error);
//     }
//   };

//   const handleInputChange = (index, field, value, table) => {
//     if (table === "vendor_list") {
//       const updatedVendors = [...vendorData];
//       updatedVendors[index][field] = value;
//       setVendorData(updatedVendors);
//     } else {
//       const updatedProducts = [...selectedVendorData];
//       updatedProducts[index][field] = value;
//       setSelectedVendorData(updatedProducts);
//     }
//   };

//   const handleAddNewVendor = async () => {
//     if (
//       newVendor.vendor_name &&
//       newVendor.point_of_contact &&
//       newVendor.email &&
//       newVendor.phone_number
//     ) {
//       try {
//         const response = await fetch("http://127.0.0.1:8000/vendor_list/", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(newVendor),
//         });

//         if (response.ok) {
//           const addedVendor = await response.json();
//           setVendorData([...vendorData, addedVendor]);
//           setNewVendor({
//             vendor_name: "",
//             point_of_contact: "",
//             email: "",
//             phone_number: "",
//             location: "",
//             category: "",
//           });
//           setShowNewVendorRow(false);
//         } else {
//           console.error("Error adding vendor:", response.statusText);
//         }
//       } catch (error) {
//         console.error("Error adding vendor:", error);
//       }
//     } else {
//       console.error("Please fill all required fields.");
//     }
//   };

//   return (
//     <div>
//       {selectedVendorData.length > 0 ? (
//         <VendorDetails
//           selectedVendorData={selectedVendorData}
//           setSelectedVendorData={setSelectedVendorData}
//         />
//       ) : (
//         <div>
//           <h4>Vendor Details</h4>
//           <table>
//             <thead>
//               <tr>
//                 <th>Vendor</th>
//                 <th>Point of Contact</th>
//                 <th>Email</th>
//                 <th>Phone Number</th>
//                 <th>Location</th>
//                 <th>Category</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {vendorData.map((vendor, index) => (
//                 <tr
//                   key={vendor.vendor_id}
//                   onClick={() => {
//                     // Only trigger row click if not in editing mode for this row
//                     if (isEditingVendorList !== index) {
//                       handleVendorClick(vendor.vendor_id);
//                     }
//                   }}
//                 >
//                   <td>
//                     {isEditingVendorList === index ? (
//                       <input
//                         type="text"
//                         value={vendor.vendor_name}
//                         onChange={(e) =>
//                           handleInputChange(
//                             index,
//                             "vendor_name",
//                             e.target.value,
//                             "vendor_list"
//                           )
//                         }
//                         onClick={(e) => e.stopPropagation()} // Prevent row click when interacting with input
//                       />
//                     ) : (
//                       vendor.vendor_name
//                     )}
//                   </td>
//                   <td>
//                     {isEditingVendorList === index ? (
//                       <input
//                         type="text"
//                         value={vendor.point_of_contact}
//                         onChange={(e) =>
//                           handleInputChange(
//                             index,
//                             "point_of_contact",
//                             e.target.value,
//                             "vendor_list"
//                           )
//                         }
//                         onClick={(e) => e.stopPropagation()}
//                       />
//                     ) : (
//                       vendor.point_of_contact
//                     )}
//                   </td>
//                   <td>
//                     {isEditingVendorList === index ? (
//                       <input
//                         type="text"
//                         value={vendor.email}
//                         onChange={(e) =>
//                           handleInputChange(
//                             index,
//                             "email",
//                             e.target.value,
//                             "vendor_list"
//                           )
//                         }
//                         onClick={(e) => e.stopPropagation()}
//                       />
//                     ) : (
//                       vendor.email
//                     )}
//                   </td>
//                   <td>
//                     {isEditingVendorList === index ? (
//                       <input
//                         type="text"
//                         value={vendor.phone_number}
//                         onChange={(e) =>
//                           handleInputChange(
//                             index,
//                             "phone_number",
//                             e.target.value,
//                             "vendor_list"
//                           )
//                         }
//                         onClick={(e) => e.stopPropagation()}
//                       />
//                     ) : (
//                       vendor.phone_number
//                     )}
//                   </td>
//                   <td>
//                     {isEditingVendorList === index ? (
//                       <input
//                         type="text"
//                         value={vendor.location}
//                         onChange={(e) =>
//                           handleInputChange(
//                             index,
//                             "location",
//                             e.target.value,
//                             "vendor_list"
//                           )
//                         }
//                         onClick={(e) => e.stopPropagation()}
//                       />
//                     ) : (
//                       vendor.location
//                     )}
//                   </td>
//                   <td>
//                     {isEditingVendorList === index ? (
//                       <input
//                         type="text"
//                         value={vendor.category}
//                         onChange={(e) =>
//                           handleInputChange(
//                             index,
//                             "category",
//                             e.target.value,
//                             "vendor_list"
//                           )
//                         }
//                         onClick={(e) => e.stopPropagation()}
//                       />
//                     ) : (
//                       vendor.category
//                     )}
//                   </td>
//                   <td>
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         handleEditClickVendorList(index);
//                       }}
//                     >
//                       Edit
//                     </button>
//                     {isEditingVendorList === index && (
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           handleSaveClickVendorList(index);
//                         }}
//                       >
//                         Save
//                       </button>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           {showNewVendorRow && (
//             <div>
//               <input
//                 type="text"
//                 placeholder="Vendor Name"
//                 value={newVendor.vendor_name}
//                 onChange={(e) =>
//                   setNewVendor({ ...newVendor, vendor_name: e.target.value })
//                 }
//               />
//               <input
//                 type="text"
//                 placeholder="Point of Contact"
//                 value={newVendor.point_of_contact}
//                 onChange={(e) =>
//                   setNewVendor({
//                     ...newVendor,
//                     point_of_contact: e.target.value,
//                   })
//                 }
//               />
//               <input
//                 type="email"
//                 placeholder="Email"
//                 value={newVendor.email}
//                 onChange={(e) =>
//                   setNewVendor({ ...newVendor, email: e.target.value })
//                 }
//               />
//               <input
//                 type="text"
//                 placeholder="Phone Number"
//                 value={newVendor.phone_number}
//                 onChange={(e) =>
//                   setNewVendor({ ...newVendor, phone_number: e.target.value })
//                 }
//               />
//               <input
//                 type="text"
//                 placeholder="Location"
//                 value={newVendor.location}
//                 onChange={(e) =>
//                   setNewVendor({ ...newVendor, location: e.target.value })
//                 }
//               />
//               <input
//                 type="text"
//                 placeholder="Category"
//                 value={newVendor.category}
//                 onChange={(e) =>
//                   setNewVendor({ ...newVendor, category: e.target.value })
//                 }
//               />
//               <button onClick={handleAddNewVendor}>Add Vendor</button>
//             </div>
//           )}

//           <button onClick={() => setShowNewVendorRow(!showNewVendorRow)}>
//             {showNewVendorRow ? "Cancel" : "Add New Vendor"}
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Vendors;

// Vendors.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Popup Modal Component
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

const Vendors = () => {
  const [vendorData, setVendorData] = useState([]);
  const [pocData, setPocData] = useState([]);
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [isAddingVendor, setIsAddingVendor] = useState(false);
  const [isAddingSubVendor, setIsAddingSubVendor] = useState(false);
  const [showPocPopup, setShowPocPopup] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  const navigate = useNavigate();
  const [newVendor, setNewVendor] = useState({
    vendor_name: "",
  });
  const [newSubVendor, setNewSubVendor] = useState({
    point_of_contact: "",
    email: "",
    phone_number: "",
    location: "",
    category: "",
  });
  const [newVendorId, setNewVendorId] = useState(null);

  useEffect(() => {
    fetchVendorData();
    fetchPocData();
  }, []);

  const fetchVendorData = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/vendor_list/");
      const data = await response.json();
      setVendorData(data);
    } catch (error) {
      console.error("Error fetching vendor data:", error);
    }
  };

  const fetchPocData = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/vendor_sub_list/");
      const data = await response.json();
      setPocData(data);
    } catch (error) {
      console.error("Error fetching POC data:", error);
    }
  };

  // Filter POCs for the selected vendor
  const getVendorPocs = (vendor_id) => {
    return pocData.filter((poc) => poc.vendor === vendor_id);
  };

  // Show popup with all POCs for a specific vendor
  const handlePocClick = (vendor_id) => {
    setSelectedVendorId(vendor_id);
    setShowPocPopup(true);
  };

  const handleEditPocChange = (index, field, value) => {
    const updatedPocData = [...pocData];
    updatedPocData[index][field] = value;
    setPocData(updatedPocData);
  };

  const handleSavePoc = async (index) => {
    const updatedPoc = pocData[index];
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/vendor_sub_list/${updatedPoc.id}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedPoc),
        }
      );
      if (response.ok) {
        setIsEditing(null); // Exit editing mode after saving
      } else {
        console.error("Error updating POC:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating POC:", error);
    }
  };

  const [isAdding, setIsAdding] = useState(false);
  const [newPOC, setNewPOC] = useState({
    point_of_contact: "",
    email: "",
    phone_number: "",
    location: "",
    category: "",
  });

  // Handle input change for new POC
  const handleInputChange = (field, value) => {
    setNewPOC((prevPOC) => ({ ...prevPOC, [field]: value }));
  };

  const handleAddPOC = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/vendor_sub_list/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...newPOC, vendor: selectedVendorId }),
      });
      if (response.ok) {
        const addedPOC = await response.json();
        setPocData([...pocData, addedPOC]);
        setNewPOC({
          point_of_contact: "",
          email: "",
          phone_number: "",
          location: "",
          category: "",
        });
        setIsAdding(false);
      } else {
        console.error("Error adding POC:", response.statusText);
      }
    } catch (error) {
      console.error("Error adding POC:", error);
    }
  };

  // Navigate to the Vendor Details page
  const handleVendorNameClick = (vendor_id) => {
    navigate(`/vendor/${vendor_id}`);
  };

  // Handle input change for the new vendor form
  const handleVendorInputChange = (field, value) => {
    setNewVendor((prevVendor) => ({ ...prevVendor, [field]: value }));
  };

  // Handle input change for the new sub-vendor (POC) form
  const handleSubVendorInputChange = (field, value) => {
    setNewSubVendor((prevSubVendor) => ({ ...prevSubVendor, [field]: value }));
  };

  // Function to add a new vendor and generate a vendor_id
  const handleAddVendor = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/vendor_list/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ vendor_name: newVendor.vendor_name }),
      });
      if (response.ok) {
        const addedVendor = await response.json();
        setVendorData([...vendorData, addedVendor]);
        setNewVendorId(addedVendor.vendor_id); // Store the generated vendor_id
        setIsAddingVendor(false);
        setIsAddingSubVendor(true); // Show the form for adding sub-vendor
        setNewVendor({ vendor_name: "" });
      } else {
        console.error("Error adding vendor:", response.statusText);
      }
    } catch (error) {
      console.error("Error adding vendor:", error);
    }
  };

  // Function to add a new sub-vendor (POC) linked to the new vendor_id
  const handleAddSubVendor = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/vendor_sub_list/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newSubVendor,
          vendor: newVendorId, // Link the new vendor_id
        }),
      });
      if (response.ok) {
        const addedSubVendor = await response.json();
        setNewSubVendor({
          point_of_contact: "",
          email: "",
          phone_number: "",
          location: "",
          category: "",
        });
        setIsAddingSubVendor(false);
        fetchVendorData(); // Refresh the vendor list to show the new vendor and sub-vendor
      } else {
        console.error("Error adding sub-vendor:", response.statusText);
      }
    } catch (error) {
      console.error("Error adding sub-vendor:", error);
    }
  };

  return (
    <div>
      <h4>Vendors</h4>
      <button onClick={() => setIsAddingVendor(true)}>Add Vendor</button>

      {/* Modal for Adding New Vendor */}
      <Modal isOpen={isAddingVendor} onClose={() => setIsAddingVendor(false)}>
        <h4>Add New Vendor</h4>
        <input
          type="text"
          placeholder="Vendor Name"
          value={newVendor.vendor_name}
          onChange={(e) =>
            handleVendorInputChange("vendor_name", e.target.value)
          }
        />
        <button onClick={handleAddVendor}>Save Vendor</button>
        <button onClick={() => setIsAddingVendor(false)}>Cancel</button>
      </Modal>

      {/* Modal for Adding New Sub-Vendor (POC) */}
      <Modal
        isOpen={isAddingSubVendor}
        onClose={() => setIsAddingSubVendor(false)}
      >
        <h4>Add Point of Contact for Vendor: {newVendorId}</h4>
        <input
          type="text"
          placeholder="Point of Contact"
          value={newSubVendor.point_of_contact}
          onChange={(e) =>
            handleSubVendorInputChange("point_of_contact", e.target.value)
          }
        />
        <input
          type="email"
          placeholder="Email"
          value={newSubVendor.email}
          onChange={(e) => handleSubVendorInputChange("email", e.target.value)}
        />
        <input
          type="text"
          placeholder="Phone Number"
          value={newSubVendor.phone_number}
          onChange={(e) =>
            handleSubVendorInputChange("phone_number", e.target.value)
          }
        />
        <input
          type="text"
          placeholder="Location"
          value={newSubVendor.location}
          onChange={(e) =>
            handleSubVendorInputChange("location", e.target.value)
          }
        />
        <select
          value={newSubVendor.category}
          onChange={(e) =>
            handleSubVendorInputChange("category", e.target.value)
          }
        >
          <option value="">Select Category</option>
          <option value="Airframe">Airframe</option>
          <option value="Communication">Communication</option>
          <option value="Electricals">Electricals</option>
          <option value="Electronics">Electronics</option>
          <option value="Payload">Payload</option>
        </select>
        <button onClick={handleAddSubVendor}>Save Point of Contact</button>
        <button onClick={() => setIsAddingSubVendor(false)}>Cancel</button>
      </Modal>
      <table>
        <thead>
          <tr>
            <th>Vendor Name</th>
            <th>Primary POC</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Location</th>
            <th>Category</th>
          </tr>
        </thead>
        <tbody>
          {vendorData.map((vendor) => {
            const vendorPocs = getVendorPocs(vendor.vendor_id);
            const primaryPoc = vendorPocs[0] || {}; // Use the first POC as the primary one
            return (
              <tr key={vendor.vendor_id}>
                <td
                  onClick={() => handleVendorNameClick(vendor.vendor_id)}
                  style={{ cursor: "pointer", textDecoration: "underline" }}
                >
                  {vendor.vendor_name}
                </td>
                <td
                  onClick={() => handlePocClick(vendor.vendor_id)}
                  style={{ cursor: "pointer", textDecoration: "underline" }}
                >
                  {primaryPoc.point_of_contact || "N/A"}
                </td>
                <td>{primaryPoc.email || "N/A"}</td>
                <td>{primaryPoc.phone_number || "N/A"}</td>
                <td>{primaryPoc.location || "N/A"}</td>
                <td>{primaryPoc.category || "N/A"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {showPocPopup && (
        <div className="popup">
          <h4>Point of Contacts</h4>
          <table>
            <thead>
              <tr>
                <th>POC Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Location</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {getVendorPocs(selectedVendorId).map((poc, index) => (
                <tr key={poc.id}>
                  <td>
                    {isEditing === index ? (
                      <input
                        type="text"
                        value={poc.point_of_contact}
                        onChange={(e) =>
                          handleEditPocChange(
                            index,
                            "point_of_contact",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      poc.point_of_contact
                    )}
                  </td>
                  <td>
                    {isEditing === index ? (
                      <input
                        type="email"
                        value={poc.email}
                        onChange={(e) =>
                          handleEditPocChange(index, "email", e.target.value)
                        }
                      />
                    ) : (
                      poc.email
                    )}
                  </td>
                  <td>
                    {isEditing === index ? (
                      <input
                        type="text"
                        value={poc.phone_number}
                        onChange={(e) =>
                          handleEditPocChange(
                            index,
                            "phone_number",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      poc.phone_number
                    )}
                  </td>
                  <td>
                    {isEditing === index ? (
                      <input
                        type="text"
                        value={poc.location}
                        onChange={(e) =>
                          handleEditPocChange(index, "location", e.target.value)
                        }
                      />
                    ) : (
                      poc.location
                    )}
                  </td>
                  <td>
                    {isEditing === index ? (
                      <select
                        value={poc.category}
                        onChange={(e) =>
                          handleEditPocChange(index, "category", e.target.value)
                        }
                      >
                        <option value="">Select Category</option>
                        <option value="Airframe">Airframe</option>
                        <option value="Communication">Communication</option>
                        <option value="Electricals">Electricals</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Payload">Payload</option>
                      </select>
                    ) : (
                      poc.category
                    )}
                  </td>

                  <td>
                    {isEditing === index ? (
                      <button onClick={() => handleSavePoc(index)}>Save</button>
                    ) : (
                      <button onClick={() => setIsEditing(index)}>Edit</button>
                    )}
                  </td>
                </tr>
              ))}
              {isAdding && (
                <tr>
                  <td>
                    <input
                      type="text"
                      placeholder="POC Name"
                      value={newPOC.point_of_contact}
                      onChange={(e) =>
                        handleInputChange("point_of_contact", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="email"
                      placeholder="Email"
                      value={newPOC.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="Phone"
                      value={newPOC.phone_number}
                      onChange={(e) =>
                        handleInputChange("phone_number", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="Location"
                      value={newPOC.location}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <select
                      value={newPOC.category}
                      onChange={(e) =>
                        handleInputChange("category", e.target.value)
                      }
                    >
                      <option value="">Select Category</option>
                      <option value="Airframe">Airframe</option>
                      <option value="Communication">Communication</option>
                      <option value="Electricals">Electricals</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Payload">Payload</option>
                    </select>
                  </td>
                  <td>
                    <button onClick={handleAddPOC}>Save</button>
                    <button onClick={() => setIsAdding(false)}>Cancel</button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <button onClick={() => setIsAdding(true)}>Add POC</button>
          <button onClick={() => setShowPocPopup(false)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default Vendors;
