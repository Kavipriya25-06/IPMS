// Vendors.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import config from "../Config"; // Import config for API endpoints
import Add from "../assets/Add.png";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  showMessageToast,
  ToastContainerComponent,
} from "./Toastify.jsx";

// Popup Modal Component
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="popup">
      <button className="x-button" onClick={onClose}>
        &times;
      </button>
      {children}
    </div>
  );
};

const Vendors = () => {
  const [vendorData, setVendorData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [pocData, setPocData] = useState([]);
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [primaryPocSelection, setPrimaryPocSelection] = useState({}); // selecting Primary POC in a Dictionary
  const [isAddingVendor, setIsAddingVendor] = useState(false);
  const [isAddingSubVendor, setIsAddingSubVendor] = useState(false);
  const [showPocPopup, setShowPocPopup] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  const [showAddVendorPopup, setShowAddVendorPopup] = useState(false);
  const [isEditingVendor, setIsEditingVendor] = useState(null);
  const [editedVendorName, setEditedVendorName] = useState({
    vendor_name: "",
    gstn: "",
  });
  const [showScrollTop, setShowScrollTop] = useState(false); // Track visibility of scroll-to-top button
  const [tempEditPoc, setTempEditPoc] = useState(null);

  const navigate = useNavigate();
  const [newVendor, setNewVendor] = useState({
    vendor_name: "",
    gstn: "",
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
  const [loadingVendors, setLoadingVendors] = useState(true);

  const [visibleVendors, setVisibleVendors] = useState(10);
  const [hasMoreVendors, setHasMoreVendors] = useState(true);
  const [isLoadingMoreVendors, setIsLoadingMoreVendors] = useState(false);
  const [filteredVendorData, setFilteredVendorData] = useState([]);

  const handleClosePriceHistory = () => {
    setShowPocPopup(false);
  };

  useEffect(() => {
    fetchVendorData();
    fetchPocData();
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

  // 1️ Fetch vendors
  const fetchVendorData = async () => {
    try {
      setLoadingVendors(true);
      setVisibleVendors(0);
      setHasMoreVendors(true);
      setIsLoadingMoreVendors(false);

      const response = await fetch(`${config.apiBaseURL}/vendor_list/`);
      const data = await response.json();

      setFilteredVendorData(data);

      if (data.length <= 20) {
        setVisibleVendors(data.length);
        setHasMoreVendors(false);
      } else {
        setVisibleVendors(10);
        setHasMoreVendors(true);
      }
    } catch (error) {
      console.error("Error fetching vendor data:", error);
    } finally {
      setLoadingVendors(false);
    }
  };

  // 2 Auto-load if container can't scroll
  const checkAndLoadMoreVendors = () => {
    const container = document.getElementById("vendor-table-wrapper");

    if (
      container &&
      container.scrollHeight <= container.clientHeight &&
      hasMoreVendors &&
      !isLoadingMoreVendors
    ) {
      setIsLoadingMoreVendors(true);

      const nextVisible = visibleVendors + 10;

      if (nextVisible >= filteredVendorData.length) {
        setVisibleVendors(filteredVendorData.length);
        setHasMoreVendors(false);
        setIsLoadingMoreVendors(false);
      } else {
        setVisibleVendors(nextVisible);
        setIsLoadingMoreVendors(false);
        setTimeout(checkAndLoadMoreVendors, 300);
      }
    }
  };

  // 4 Keep checking after load
  useEffect(() => {
    if (!loadingVendors && filteredVendorData.length > 0 && hasMoreVendors) {
      setTimeout(checkAndLoadMoreVendors, 300);
    }
  }, [loadingVendors, filteredVendorData, hasMoreVendors]);

  useEffect(() => {
    if (filteredVendorData.length > 0) {
      setVisibleVendors(10);
      setHasMoreVendors(filteredVendorData.length > 10);
    }
  }, [filteredVendorData]);

  const fetchPocData = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/vendor_sub_list/`);
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

  // Get the default POC for a given vendor
  const getDefaultPocForVendor = (vendorId) => {
    const defaultPoc = pocData.find(
      (poc) => poc.vendor === vendorId && poc.default_poc
    );
    return defaultPoc ? defaultPoc.point_of_contact : "N/A";
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
    if (!tempEditPoc) return;
    try {
      const response = await fetch(
        `${config.apiBaseURL}/vendor_sub_list/${pocId}/`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(tempEditPoc),
        }
      );
      if (response.ok) {
        // Replace old entry with updated one
        setPocData((prev) =>
          prev.map((p) => (p.id === pocId ? tempEditPoc : p))
        );
        showSuccessToast("POC updated successfully");
        setIsEditing(null);
        setTempEditPoc(null);
      } else {
        showErrorToast("Failed to update POC");
      }
    } catch (error) {
      console.error("Update error:", error);
      showErrorToast("Error occurred while updating");
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Smooth scroll effect
    });
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
      const isFirstPoc = !pocData.some(
        (poc) => poc.vendor === selectedVendorId
      );
      const payload = {
        ...newPOC,
        vendor: selectedVendorId,
        default_poc: isFirstPoc, // Set default_poc to true if it's the first POC
      };

      const response = await fetch(`${config.apiBaseURL}/vendor_sub_list/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const addedPOC = await response.json();
        setPocData([...pocData, addedPOC]);
        setNewPOC({
          point_of_contact: "",
          email: "",
          phone_number: "",
          location: "",
          default_poc: isFirstPoc,
        });
        setIsAdding(false);
        showSuccessToast("POC Added successfully");
      } else {
        console.error("Error adding POC:", response.statusText);
      }
    } catch (error) {
      console.error("Error adding POC:", error);
    }
  };

  const handleDefaultPocChange = async (pocId) => {
    try {
      // Update all POCs for the vendor to set default_poc
      const updatedPocData = pocData.map((poc) =>
        poc.vendor === selectedVendorId
          ? { ...poc, default_poc: poc.id === pocId }
          : poc
      );

      setPocData(updatedPocData);

      // Update backend
      await Promise.all(
        updatedPocData.map((poc) =>
          fetch(`${config.apiBaseURL}/vendor_sub_list/${poc.id}/`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              default_poc: poc.default_poc,
              point_of_contact: poc.point_of_contact,
              email: poc.email,
              phone_number: poc.phone_number,
              location: poc.location,
              vendor: poc.vendor,
            }),
          })
        )
      );
      showSuccessToast("Default POC updated successfully");
    } catch (error) {
      console.error("Error updating default POC:", error);
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
      const response = await fetch(`${config.apiBaseURL}/vendor_list/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newVendor),
      });

      if (response.ok) {
        const addedVendor = await response.json();

        // update both lists so table updates immediately
        setVendorData((prev) => [...prev, addedVendor]);
        setFilteredVendorData((prev) => [...prev, addedVendor]);

        setNewVendorId(addedVendor.vendor_id);
        setShowAddVendorPopup(false);
        setNewVendor({ vendor_name: "", gstn: "" });
        showSuccessToast("Vendor added successfully.");
      } else {
        console.error("Error adding vendor:", response.statusText);
        showErrorToast("Failed to add vendor.");
      }
    } catch (error) {
      console.error("Error adding vendor:", error);
      showErrorToast("Something went wrong.");
    }
  };

  // Function to add a new sub-vendor (POC) linked to the new vendor_id
  const handleAddSubVendor = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/vendor_sub_list/`, {
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
        showSuccessToast("Vendor added successfully.");
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
        `${config.apiBaseURL}/vendor_sub_list/${pocId}/`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        // Remove deleted POC from state
        showSuccessToast("POC deleted successfully");

        setPocData((prevPocData) =>
          prevPocData.filter((poc) => poc.id !== pocId)
        );
      } else {
        console.error("Error deleting POC:", response.statusText);
        showErrorToast("Failed to delete POC");
      }
    } catch (error) {
      console.error("Error deleting POC:", error);
      showErrorToast("Error occurred while deleting");
    }
  };

  // Start editing vendor name
  const handleEditVendorName = (vendor) => {
    setIsEditingVendor(vendor.vendor_id);
    setEditedVendorName({
      vendor_name: vendor.vendor_name,
      gstn: vendor.gstn,
    });
  };

  // Save the updated vendor name
  const handleSaveVendorName = async (vendor_id) => {
    try {
      const response = await fetch(
        `${config.apiBaseURL}/vendor_list/${vendor_id}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editedVendorName),
        }
      );
      if (response.ok) {
        // Update the vendorData state with the new name
        setVendorData((prevData) =>
          prevData.map((vendor) =>
            vendor.vendor_id === vendor_id
              ? { ...vendor, ...editedVendorName }
              : vendor
          )
        );
        setIsEditingVendor(null); // Exit editing mode
        showSuccessToast("Vendor details updated successfully");
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
    setEditedVendorName({ vendor_name: "", gstn: "" }); // Reset the edited name
  };

  const toggleVendorStatus = async (vendorId, currentStatus, vendorName) => {
    try {
      const updatedStatus = !currentStatus; // Toggle status

      const response = await fetch(
        `${config.apiBaseURL}/vendor_list/${vendorId}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ active: updatedStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update vendor_list status");
      }

      // Update local vendorData and filteredVendorData immediately
      setVendorData((prevData) =>
        prevData.map((vendor) =>
          vendor.vendor_id === vendorId
            ? { ...vendor, active: updatedStatus }
            : vendor
        )
      );

      setFilteredVendorData((prevData) =>
        prevData.map((vendor) =>
          vendor.vendor_id === vendorId
            ? { ...vendor, active: updatedStatus }
            : vendor
        )
      );

      showSuccessToast(
        `Vendor ${vendorName} marked as ${
          updatedStatus ? "Active" : "Inactive"
        } successfully`
      );

      // If marking inactive, also update vendor_master products
      if (!updatedStatus) {
        const masterResponse = await fetch(
          `${config.apiBaseURL}/vendor_master/`
        );
        if (!masterResponse.ok) {
          throw new Error("Failed to fetch vendor_master data");
        }

        const masterData = await masterResponse.json();
        const vendorProducts = masterData.filter(
          (product) => product.vendor === vendorId
        );

        await Promise.all(
          vendorProducts.map(async (product) => {
            if (product.product_id) {
              const updateMasterResponse = await fetch(
                `${config.apiBaseURL}/vendor_master/${product.product_id}/`,
                {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ active: false }),
                }
              );
              if (!updateMasterResponse.ok) {
                console.error(
                  `Failed to update vendor_master for product_id: ${product.product_id}`
                );
              }
            }
          })
        );
      }

      //  Optionally: sync backend data again (not required unless needed)
      // await fetchVendorData();
    } catch (error) {
      console.error("Error updating vendor status:", error);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);

    if (query.trim() === "") {
      fetchVendorData(); // Reset if query is empty
      return;
    }

    try {
      setLoadingVendors(true); // Show loader while searching
      const response = await fetch(
        `${config.apiBaseURL}/vendor_search/?search=${query}`
      );
      if (response.ok) {
        const filteredVendors = await response.json();
        setVendorData(filteredVendors); // Update base vendor list
        setFilteredVendorData(filteredVendors); // Also update filtered list
        setVisibleVendors(10); // Reset visible count
        setHasMoreVendors(filteredVendors.length > 10);
      } else {
        console.error("Search failed:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
    } finally {
      setLoadingVendors(false); // Done loading
    }
  };

  return (
    <div>
      <div
        className="header"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h2>Vendors</h2>
        {/* Modal for Adding New Vendor */}
        {showAddVendorPopup && (
          <div
            className="modal-overlay"
            onClick={() => setShowAddVendorPopup(false)}
          >
            <div
              className="modal-contents"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
            >
              <h4>Add New Vendor</h4>
              <input
                type="text"
                placeholder="Vendor Name"
                value={newVendor.vendor_name}
                onChange={(e) =>
                  handleVendorInputChange("vendor_name", e.target.value)
                }
              />
              <input
                type="text"
                placeholder="GSTN"
                value={newVendor.gstn}
                onChange={(e) =>
                  handleVendorInputChange("gstn", e.target.value)
                }
              />
              <div className="modal-buttons">
                <button
                  className="modal-button save-button"
                  onClick={handleAddVendor}
                >
                  Save Vendor
                </button>
                <button
                  className="modal-button cancel-button"
                  onClick={() => setShowAddVendorPopup(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal for Adding New Sub-Vendor (POC) */}
        <Modal
          isOpen={isAddingSubVendor}
          onClose={() => setIsAddingSubVendor(false)}
        >
          <div className="modal-contents">
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
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
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
              placeholder="Address"
              value={newSubVendor.location}
              onChange={(e) =>
                handleSubVendorInputChange("location", e.target.value)
              }
            />
            <div className="modal-buttons">
              <button
                className="modal-button save-button"
                onClick={handleAddSubVendor}
              >
                Save Vendor
              </button>
              <button
                className="modal-button cancel-button"
                onClick={() => setIsAddingSubVendor(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      </div>
      <div className="search-wrapper-container">
        {/* Centered search bar */}
        <div className="search-wrapper">
          <div className="search-bar-container">
            <input
              type="text"
              className="search-bar"
              placeholder="Search by Component Type or Spec"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <span className="search-icon">
              <i className="fa fa-search" aria-hidden="true"></i>
            </span>
          </div>
        </div>
        <button
          className="plus-button"
          title="Add Vendor"
          onClick={() => setShowAddVendorPopup(true)}
          style={{
            cursor: "pointer",
            background: "transparent",
            border: "none",
            padding: "4px",
            marginBottom: "-25px",
          }}
        >
          <img src={Add} alt="Add Vendor" />
        </button>

        {/* Add Vendor Button */}
      </div>
      <div
        id="vendor-table-wrapper"
        className="table-container"
        style={{
          overflowY: loadingVendors ? "hidden" : "auto",
        }}
        onScroll={(e) => {
          const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
          if (
            scrollTop + clientHeight >= scrollHeight - 10 &&
            !isLoadingMoreVendors &&
            hasMoreVendors
          ) {
            setIsLoadingMoreVendors(true);
            setTimeout(() => {
              const nextVisible = visibleVendors + 10;
              if (nextVisible >= filteredVendorData.length) {
                setVisibleVendors(filteredVendorData.length);
                setHasMoreVendors(false);
              } else {
                setVisibleVendors(nextVisible);
              }
              setIsLoadingMoreVendors(false);
            }, 500); // Simulate delay
          }
        }}
      >
        <table border="1" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Vendor Name</th>
              <th>GSTIN</th>
              <th>Primary POC</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
              {/* <th>Categosfbry</th> */}
              <th>Actions</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loadingVendors ? (
              //  Show spinner or loading text while data is loading
              <tr>
                <td
                  colSpan="8"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  <div className="spinner"></div>
                  Loading vendors...
                </td>
              </tr>
            ) : filteredVendorData.length > 0 ? (
              //  Show vendor rows if data is loaded

              filteredVendorData.slice(0, visibleVendors).map((vendor) => {
                const vendorPocs = getVendorPocs(vendor.vendor_id);
                const selectedPocId = primaryPocSelection[vendor.vendor_id];
                const defaultPoc =
                  vendorPocs.find((poc) => poc.default_poc) || {};
                const primaryPoc =
                  vendorPocs.find((poc) => poc.id === selectedPocId) ||
                  vendorPocs[0] ||
                  {};

                return (
                  <tr key={vendor.vendor_id}>
                    <td
                      className="specification-cell"
                      title={vendor.vendor_name || ""}
                    >
                      {isEditingVendor === vendor.vendor_id ? (
                        <input
                          type="text"
                          value={editedVendorName.vendor_name}
                          style={{
                            width: "150px",
                            padding: "5px",
                            borderRadius: "5px",
                            border: "1px solid #ccc",
                          }}
                          onChange={(e) =>
                            setEditedVendorName({
                              ...editedVendorName,
                              vendor_name: e.target.value,
                            })
                          }
                          autoFocus
                        />
                      ) : (
                        <span
                          onClick={() =>
                            handleVendorNameClick(vendor.vendor_id)
                          }
                          style={{
                            cursor: "pointer",
                            textDecoration: "underline",
                          }}
                        >
                          {vendor.vendor_name}
                        </span>
                      )}
                    </td>
                    <td>
                      {isEditingVendor === vendor.vendor_id ? (
                        <input
                          type="text"
                          value={editedVendorName.gstn}
                          style={{
                            width: "150px",
                            padding: "5px",
                            borderRadius: "5px",
                            border: "1px solid #ccc",
                          }}
                          onChange={(e) =>
                            setEditedVendorName({
                              ...editedVendorName,
                              gstn: e.target.value,
                            })
                          }
                        />
                      ) : (
                        vendor.gstn
                      )}
                    </td>
                    <td
                      onClick={() => handlePocClick(vendor.vendor_id)}
                      style={{ cursor: "pointer", textDecoration: "underline" }}
                    >
                      {defaultPoc.point_of_contact || "N/A"}
                    </td>
                    <td>{defaultPoc.email || "N/A"}</td>
                    <td>{defaultPoc.phone_number || "N/A"}</td>
                    <td
                      className="specification-cell"
                      title={defaultPoc.location || ""}
                    >
                      {defaultPoc.location || "N/A"}
                    </td>
                    <td>
                      {isEditingVendor === vendor.vendor_id ? (
                        <>
                          <button
                            className="edit-button"
                            onClick={() =>
                              handleSaveVendorName(vendor.vendor_id)
                            }
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="cancel-button"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleEditVendorName(vendor)}
                          className="vendor-button"
                          aria-label="Edit vendor"
                          style={{ border: "none", cursor: "pointer" }}
                        >
                          <PencilSquareIcon className="text-black" />
                        </button>
                      )}
                    </td>
                    <td>
                      <button
                        className={`vendor-status-button ${
                          vendor.active ? "active" : "inactive"
                        }`}
                        onClick={() =>
                          toggleVendorStatus(
                            vendor.vendor_id,
                            vendor.active,
                            vendor.vendor_name
                          )
                        }
                      >
                        {vendor.active ? "Active" : "Inactive"}
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : vendorData.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  style={{
                    textAlign: "center",
                    color: "gray",
                    padding: "20px",
                  }}
                >
                  No vendor data found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>

        {isLoadingMoreVendors && (
          <div className="loading-message">Loading...</div>
        )}
        {!hasMoreVendors && filteredVendorData.length > 0 && (
          <div className="no-message">No more data</div>
        )}
      </div>

      {showPocPopup && (
        <div className="modal-overlay">
          <div className="popup-wrapper">
            <div className={`popups ${isAdding ? "popup-expanded" : ""}`}>
              {" "}
              <span className="x-button" onClick={handleClosePriceHistory}>
                &times;
              </span>
              <h3>Point of Contacts</h3>
              <div className="button-wrapper">
                             <button
                  className="action-button add-button"
                  onClick={() => setIsAdding(true)}
                  style={{ marginBottom: "10px" }}
                >
                  Add POC
                </button>
              
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Default</th>
                      <th>POC Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Address</th>
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
                            name={`primaryPoc-${selectedVendorId}`}
                            checked={poc.default_poc}
                            onChange={() => handleDefaultPocChange(poc.id)}
                          />
                        </td>

                        {/* POC Name */}
                        <td>
                          {isEditing === poc.id ? (
                            <input
                              type="text"
                              style={{
                                width: "200px",
                                padding: "8px",
                                fontSize: "14px",
                              }}
                              value={tempEditPoc?.point_of_contact || ""}
                              onChange={(e) =>
                                setTempEditPoc({
                                  ...tempEditPoc,
                                  point_of_contact: e.target.value,
                                })
                              }
                            />
                          ) : (
                            poc.point_of_contact
                          )}
                        </td>

                        {/* Email */}
                        <td>
                          {isEditing === poc.id ? (
                            <input
                              type="email"
                              style={{
                                width: "200px",
                                padding: "8px",
                                fontSize: "14px",
                              }}
                              value={tempEditPoc?.email || ""}
                              onChange={(e) => {
                                const value = e.target.value;
                                setTempEditPoc({
                                  ...tempEditPoc,
                                  email: value,
                                });
                                setErrors((prev) => ({
                                  ...prev,
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

                        {/* Phone */}
                        <td>
                          {isEditing === poc.id ? (
                            <input
                              type="text"
                              style={{
                                width: "200px",
                                padding: "8px",
                                fontSize: "14px",
                              }}
                              value={tempEditPoc?.phone_number || ""}
                              onChange={(e) => {
                                const value = e.target.value;
                                setTempEditPoc({
                                  ...tempEditPoc,
                                  phone_number: value,
                                });
                                setErrors((prev) => ({
                                  ...prev,
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

                        {/* Location */}
                        <td
                          className="specification-cell"
                          title={poc.location || ""}
                        >
                          {isEditing === poc.id ? (
                            <input
                              type="text"
                              style={{
                                width: "200px",
                                padding: "8px",
                                fontSize: "14px",
                              }}
                              value={tempEditPoc?.location || ""}
                              onChange={(e) =>
                                setTempEditPoc({
                                  ...tempEditPoc,
                                  location: e.target.value,
                                })
                              }
                            />
                          ) : (
                            poc.location
                          )}
                        </td>

                        {/* Actions */}
                        <td>
                          {isEditing === poc.id ? (
                            <>
                              <button
                                className="edit-button"
                                onClick={() => handleSavePoc(poc.id)}
                              >
                                Save
                              </button>
                              <button
                                className="delete-button"
                                onClick={() => {
                                  setIsEditing(null);
                                  setTempEditPoc(null); // discard edits
                                }}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              className="edit-button"
                              onClick={() => {
                                setIsEditing(poc.id);
                                setTempEditPoc({ ...poc }); // capture editable copy
                              }}
                            >
                              Edit
                            </button>
                          )}
                          <button
                            className="delete-button"
                            onClick={() => handleDeletePoc(poc.id)}
                          >
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
                            style={{
                              width: "200px",
                              padding: "8px",
                              fontSize: "14px",
                            }}
                            onChange={(e) =>
                              handleInputChange(
                                "point_of_contact",
                                e.target.value
                              )
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="email"
                            placeholder="Email"
                            value={newPOC.email}
                            style={{
                              width: "200px",
                              padding: "8px",
                              fontSize: "14px",
                            }}
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
                            <span className="error-message">
                              {errors.email}
                            </span>
                          )}
                        </td>
                        <td>
                          <input
                            type="text"
                            placeholder="Phone"
                            value={newPOC.phone_number}
                            style={{
                              width: "200px",
                              padding: "8px",
                              fontSize: "14px",
                            }}
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
                            placeholder="Address"
                            value={newPOC.location}
                            style={{
                              width: "200px",
                              padding: "8px",
                              fontSize: "14px",
                            }}
                            onChange={(e) =>
                              handleInputChange("location", e.target.value)
                            }
                          />
                        </td>
                      
                                              <td>
                          <button
                            className="edit-button"
                            onClick={handleAddPOC}
                          >
                            Save
                          </button>
                          <button
                            className="delete-button"
                            onClick={() => setIsAdding(false)}
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
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
      <ToastContainerComponent />
    </div>
  );
};

export default Vendors;
