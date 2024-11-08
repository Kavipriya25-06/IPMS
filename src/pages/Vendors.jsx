// Vendors.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import VendorDetails from "./VendorDetails"; // Import the VendorDetails component

const Vendors = () => {
  const [vendorData, setVendorData] = useState([]);
  const navigate = useNavigate();
  const [selectedVendorData, setSelectedVendorData] = useState([]);
  const [isEditingVendorList, setIsEditingVendorList] = useState(null);
  const [showNewVendorRow, setShowNewVendorRow] = useState(false);
  const [newVendor, setNewVendor] = useState({
    vendor_name: "",
    point_of_contact: "",
    email: "",
    phone_number: "",
    location: "",
    category: "",
  });

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/vendor_list/");
        const data = await response.json();
        setVendorData(data);
      } catch (error) {
        console.error("Error fetching vendor data:", error);
      }
    };
    fetchVendorData();
  }, []);

  const handleVendorClick = async (vendor_id) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/vendor_master/");
      const allVendorProducts = await response.json();
      const matchedProducts = allVendorProducts.filter(
        (product) => product.vendor === vendor_id
      );

      setSelectedVendorData(matchedProducts);
      // setNewVendor((prevVendor) => ({ ...prevVendor, vendor: vendor_id }));
    } catch (error) {
      console.error("Error fetching vendor products:", error);
    }
    // Navigate to the VendorDetails page with the vendor_id in the URL
    navigate(`/vendor/${vendor_id}`);
    console.log(`Navigating to /vendor/${vendor_id}`);
  };

  const handleEditClickVendorList = (index) => {
    setIsEditingVendorList(index);
  };

  const handleSaveClickVendorList = async (index) => {
    const updatedVendor = vendorData[index];
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/vendor_list/${updatedVendor.vendor_id}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedVendor),
        }
      );

      if (response.ok) {
        const savedVendor = await response.json();
        const updatedVendors = [...vendorData];
        updatedVendors[index] = savedVendor;
        setVendorData(updatedVendors);
        setIsEditingVendorList(null);
      } else {
        console.error("Error updating vendor:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating vendor:", error);
    }
  };

  const handleInputChange = (index, field, value, table) => {
    if (table === "vendor_list") {
      const updatedVendors = [...vendorData];
      updatedVendors[index][field] = value;
      setVendorData(updatedVendors);
    } else {
      const updatedProducts = [...selectedVendorData];
      updatedProducts[index][field] = value;
      setSelectedVendorData(updatedProducts);
    }
  };

  const handleAddNewVendor = async () => {
    if (
      newVendor.vendor_name &&
      newVendor.point_of_contact &&
      newVendor.email &&
      newVendor.phone_number
    ) {
      try {
        const response = await fetch("http://127.0.0.1:8000/vendor_list/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newVendor),
        });

        if (response.ok) {
          const addedVendor = await response.json();
          setVendorData([...vendorData, addedVendor]);
          setNewVendor({
            vendor_name: "",
            point_of_contact: "",
            email: "",
            phone_number: "",
            location: "",
            category: "",
          });
          setShowNewVendorRow(false);
        } else {
          console.error("Error adding vendor:", response.statusText);
        }
      } catch (error) {
        console.error("Error adding vendor:", error);
      }
    } else {
      console.error("Please fill all required fields.");
    }
  };

  return (
    <div>
      {selectedVendorData.length > 0 ? (
        <VendorDetails
          selectedVendorData={selectedVendorData}
          setSelectedVendorData={setSelectedVendorData}
        />
      ) : (
        <div>
          <h4>Vendor Details</h4>
          <table>
            <thead>
              <tr>
                <th>Vendor</th>
                <th>Point of Contact</th>
                <th>Email</th>
                <th>Phone Number</th>
                <th>Location</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendorData.map((vendor, index) => (
                <tr
                  key={vendor.vendor_id}
                  onClick={() => {
                    // Only trigger row click if not in editing mode for this row
                    if (isEditingVendorList !== index) {
                      handleVendorClick(vendor.vendor_id);
                    }
                  }}
                >
                  <td>
                    {isEditingVendorList === index ? (
                      <input
                        type="text"
                        value={vendor.vendor_name}
                        onChange={(e) =>
                          handleInputChange(
                            index,
                            "vendor_name",
                            e.target.value,
                            "vendor_list"
                          )
                        }
                        onClick={(e) => e.stopPropagation()} // Prevent row click when interacting with input
                      />
                    ) : (
                      vendor.vendor_name
                    )}
                  </td>
                  <td>
                    {isEditingVendorList === index ? (
                      <input
                        type="text"
                        value={vendor.point_of_contact}
                        onChange={(e) =>
                          handleInputChange(
                            index,
                            "point_of_contact",
                            e.target.value,
                            "vendor_list"
                          )
                        }
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      vendor.point_of_contact
                    )}
                  </td>
                  <td>
                    {isEditingVendorList === index ? (
                      <input
                        type="text"
                        value={vendor.email}
                        onChange={(e) =>
                          handleInputChange(
                            index,
                            "email",
                            e.target.value,
                            "vendor_list"
                          )
                        }
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      vendor.email
                    )}
                  </td>
                  <td>
                    {isEditingVendorList === index ? (
                      <input
                        type="text"
                        value={vendor.phone_number}
                        onChange={(e) =>
                          handleInputChange(
                            index,
                            "phone_number",
                            e.target.value,
                            "vendor_list"
                          )
                        }
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      vendor.phone_number
                    )}
                  </td>
                  <td>
                    {isEditingVendorList === index ? (
                      <input
                        type="text"
                        value={vendor.location}
                        onChange={(e) =>
                          handleInputChange(
                            index,
                            "location",
                            e.target.value,
                            "vendor_list"
                          )
                        }
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      vendor.location
                    )}
                  </td>
                  <td>
                    {isEditingVendorList === index ? (
                      <input
                        type="text"
                        value={vendor.category}
                        onChange={(e) =>
                          handleInputChange(
                            index,
                            "category",
                            e.target.value,
                            "vendor_list"
                          )
                        }
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      vendor.category
                    )}
                  </td>
                  <td>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClickVendorList(index);
                      }}
                    >
                      Edit
                    </button>
                    {isEditingVendorList === index && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveClickVendorList(index);
                        }}
                      >
                        Save
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {showNewVendorRow && (
            <div>
              <input
                type="text"
                placeholder="Vendor Name"
                value={newVendor.vendor_name}
                onChange={(e) =>
                  setNewVendor({ ...newVendor, vendor_name: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Point of Contact"
                value={newVendor.point_of_contact}
                onChange={(e) =>
                  setNewVendor({
                    ...newVendor,
                    point_of_contact: e.target.value,
                  })
                }
              />
              <input
                type="email"
                placeholder="Email"
                value={newVendor.email}
                onChange={(e) =>
                  setNewVendor({ ...newVendor, email: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={newVendor.phone_number}
                onChange={(e) =>
                  setNewVendor({ ...newVendor, phone_number: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Location"
                value={newVendor.location}
                onChange={(e) =>
                  setNewVendor({ ...newVendor, location: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Category"
                value={newVendor.category}
                onChange={(e) =>
                  setNewVendor({ ...newVendor, category: e.target.value })
                }
              />
              <button onClick={handleAddNewVendor}>Add Vendor</button>
            </div>
          )}

          <button onClick={() => setShowNewVendorRow(!showNewVendorRow)}>
            {showNewVendorRow ? "Cancel" : "Add New Vendor"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Vendors;
