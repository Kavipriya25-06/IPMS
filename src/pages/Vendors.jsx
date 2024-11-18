// Vendors.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Popup Modal Component
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="popup">
      <button className="close-button" onClick={onClose}>
        &times;
      </button>
      {children}
    </div>
  );
};

const Vendors = () => {
  const [vendorData, setVendorData] = useState([]);
  const [pocData, setPocData] = useState([]);
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [primaryPocSelection, setPrimaryPocSelection] = useState({}); // selecting Primary POC in a Dictionary
  const [isAddingVendor, setIsAddingVendor] = useState(false);
  const [isAddingSubVendor, setIsAddingSubVendor] = useState(false);
  const [showPocPopup, setShowPocPopup] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  const [isEditingVendor, setIsEditingVendor] = useState(null);
  const [editedVendorName, setEditedVendorName] = useState("");
  const navigate = useNavigate();
  const [newVendor, setNewVendor] = useState({
    vendor_name: "",
  });
  const [newSubVendor, setNewSubVendor] = useState({
    point_of_contact: "",
    email: "",
    phone_number: "",
    location: "",
    default_poc: true,
    // category: "",
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

  const handlePrimaryPocSelect = (vendorId, pocId) => {
    setPrimaryPocSelection((prevSelection) => ({
      ...prevSelection,
      [vendorId]: pocId, // Update only the POC for the specific vendor
    }));
  };

  const handleEditPocChange = (pocId, field, value) => {
    // const updatedPocData = [...pocData];
    // updatedPocData[index][field] = value;
    const updatedPocData = pocData.map((poc) =>
      poc.id === pocId ? { ...poc, [field]: value } : poc
    );
    setPocData(updatedPocData);
  };

  const handleSavePoc = async (pocId) => {
    const updatedPoc = pocData.find((poc) => poc.id === pocId); // Find POC by ID
    if (!updatedPoc) {
      console.error("POC not found for the provided ID:", pocId);
      return;
    }
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/vendor_sub_list/${pocId}/`,
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
    default_poc: true,
    // category: "",
  });

  // Validating the email and phone number for the POC

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phoneNumber) => {
    const phoneRegex = /^[0-9]{10}$/; // Adjust this based on your phone number format
    return phoneRegex.test(phoneNumber);
  };

  const [errors, setErrors] = useState({
    email: "",
    phone_number: "",
  });

  // Handle input change for new POC
  const handleInputChange = (field, value) => {
    setNewPOC((prevPOC) => ({ ...prevPOC, [field]: value }));
  };

  const handleAddPOC = async () => {
    try {

      const isFirstPoc = !pocData.some((poc) => poc.vendor === selectedVendorId);
      const payload = {
        ...newPOC,
        vendor: selectedVendorId,
        default_poc: isFirstPoc, // Set default_poc to true if it's the first POC
      };

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
          default_poc: true,
          // category: "",
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
    if (isEditingVendor === vendor_id) return;
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
          default_poc: true,
          // category: "",
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

  const handleDeletePoc = async (pocId) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/vendor_sub_list/${pocId}/`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        // Remove deleted POC from state
        setPocData((prevPocData) =>
          prevPocData.filter((poc) => poc.id !== pocId)
        );
      } else {
        console.error("Error deleting POC:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting POC:", error);
    }
  };

  // Start editing vendor name
  const handleEditVendorName = (vendor_id, currentName) => {
    setIsEditingVendor(vendor_id);
    setEditedVendorName(currentName);
  };

  // Save the updated vendor name
  const handleSaveVendorName = async (vendor_id) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/vendor_list/${vendor_id}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ vendor_name: editedVendorName }),
        }
      );
      if (response.ok) {
        // Update the vendorData state with the new name
        setVendorData((prevData) =>
          prevData.map((vendor) =>
            vendor.vendor_id === vendor_id
              ? { ...vendor, vendor_name: editedVendorName }
              : vendor
          )
        );
        setIsEditingVendor(null); // Exit editing mode
      } else {
        console.error("Error updating vendor name:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating vendor name:", error);
    }
  };

  // Cancel editing vendor name
  const handleCancelEdit = () => {
    setIsEditingVendor(null);
    setEditedVendorName(""); // Reset the edited name
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
          onChange={(e) => {
            const value = e.target.value;
            handleSubVendorInputChange("email", value);
            setErrors((prevErrors) => ({
              ...prevErrors,
              email: validateEmail(value) ? "" : "Invalid email address",
            }));
          }}
        />
        {errors.email && <span className="error-message">{errors.email}</span>}
        <input
          type="text"
          placeholder="Phone Number"
          value={newSubVendor.phone_number}
          onChange={(e) => {
            const value = e.target.value;
            handleSubVendorInputChange("phone_number", value);
            setErrors((prevErrors) => ({
              ...prevErrors,
              phone_number: validatePhoneNumber(value)
                ? ""
                : "Phone number must be 10 digits",
            }));
          }}
        />
        {errors.phone_number && (
          <span className="error-message">{errors.phone_number}</span>
        )}
        <input
          type="text"
          placeholder="Location"
          value={newSubVendor.location}
          onChange={(e) =>
            handleSubVendorInputChange("location", e.target.value)
          }
        />
        {/* <select
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
        </select> */}
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
            {/* <th>Category</th> */}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {vendorData.map((vendor) => {
            const vendorPocs = getVendorPocs(vendor.vendor_id);
            const selectedPocId = primaryPocSelection[vendor.vendor_id];
            const primaryPoc =
              vendorPocs.find((poc) => poc.id === selectedPocId) ||
              vendorPocs[0] ||
              {};

            // const primaryPoc = vendorPocs[0] || {}; // Use the first POC as the primary one
            return (
              <tr key={vendor.vendor_id}>
                <td>
                  {isEditingVendor === vendor.vendor_id ? (
                    <div>
                      <input
                        type="text"
                        value={editedVendorName}
                        onChange={(e) => setEditedVendorName(e.target.value)}
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveVendorName(vendor.vendor_id)}
                      >
                        Save
                      </button>
                      <button onClick={handleCancelEdit}>Cancel</button>
                    </div>
                  ) : (
                    <span
                      onClick={() => handleVendorNameClick(vendor.vendor_id)}
                      style={{
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                    >
                      {vendor.vendor_name}
                    </span>
                  )}
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
                {/* <td>{primaryPoc.category || "N/A"}</td> */}
                <td>
                  {isEditingVendor !== vendor.vendor_id && (
                    <button
                      onClick={() =>
                        handleEditVendorName(
                          vendor.vendor_id,
                          vendor.vendor_name
                        )
                      }
                    >
                      Edit
                    </button>
                  )}
                </td>
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
                <th>Default</th>
                <th>POC Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Location</th>
                {/* <th>Category</th> */}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {getVendorPocs(selectedVendorId).map((poc, index) => (
                <tr key={poc.id}>
                  <td>
                    <input
                      type="radio"
                      name={`primaryPoc-${selectedVendorId}`} // Scoped to the vendor
                      checked={primaryPocSelection[selectedVendorId] === poc.id}
                      onChange={() =>
                        handlePrimaryPocSelect(selectedVendorId, poc.id)
                      }
                    />
                  </td>
                  <td>
                    {isEditing === poc.id ? (
                      <input
                        type="text"
                        value={poc.point_of_contact}
                        onChange={(e) =>
                          handleEditPocChange(
                            poc.id,
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
                    {isEditing === poc.id ? (
                      <input
                        type="email"
                        value={poc.email}
                        onChange={(e) => {
                          handleEditPocChange(poc.id, "email", e.target.value);
                          setErrors((prevErrors) => ({
                            ...prevErrors,
                            email: validateEmail(value)
                              ? ""
                              : "Invalid email address",
                          }));
                        }}
                      />
                    ) : (
                      poc.email
                    )}
                  </td>
                  <td>
                    {isEditing === poc.id ? (
                      <input
                        type="text"
                        value={poc.phone_number}
                        onChange={(e) => {
                          handleEditPocChange(
                            poc.id,
                            "phone_number",
                            e.target.value
                          );
                          setErrors((prevErrors) => ({
                            ...prevErrors,
                            phone_number: validatePhoneNumber(value)
                              ? ""
                              : "Phone number must be 10 digits",
                          }));
                        }}
                      />
                    ) : (
                      poc.phone_number
                    )}
                  </td>
                  <td>
                    {isEditing === poc.id ? (
                      <input
                        type="text"
                        value={poc.location}
                        onChange={(e) =>
                          handleEditPocChange(
                            poc.id,
                            "location",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      poc.location
                    )}
                  </td>
                  {/* <td>
                    {isEditing === poc.id ? (
                      <select
                        value={poc.category}
                        onChange={(e) =>
                          handleEditPocChange(
                            poc.id,
                            "category",
                            e.target.value
                          )
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
                  </td> */}

                  <td>
                    {isEditing === poc.id ? (
                      <>
                        <button onClick={() => handleSavePoc(poc.id)}>
                          Save
                        </button>
                        <button onClick={() => setIsEditing(null)}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button onClick={() => setIsEditing(poc.id)}>Edit</button>
                    )}
                    <button onClick={() => handleDeletePoc(poc.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {isAdding && (
                <tr>
                  <td></td>
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
                      onChange={(e) => {
                        const value = e.target.value;
                        handleInputChange("email", value);
                        setErrors((prevErrors) => ({
                          ...prevErrors,
                          email: validateEmail(value)
                            ? ""
                            : "Invalid email address",
                        }));
                      }}
                    />
                    {errors.email && (
                      <span className="error-message">{errors.email}</span>
                    )}
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="Phone"
                      value={newPOC.phone_number}
                      onChange={(e) => {
                        const value = e.target.value;
                        handleInputChange("phone_number", value);
                        setErrors((prevErrors) => ({
                          ...prevErrors,
                          phone_number: validatePhoneNumber(value)
                            ? ""
                            : "Phone number must be 10 digits",
                        }));
                      }}
                    />
                    {errors.phone_number && (
                      <span className="error-message">
                        {errors.phone_number}
                      </span>
                    )}
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
                  {/* <td>
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
                  </td> */}
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
