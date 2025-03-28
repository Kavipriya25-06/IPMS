import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import config from "../Config"; // Import config for API endpoints

import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  ToastContainerComponent,
} from "./Toastify.jsx"; // Import Toastify utilities
//
const BOMDetails = () => {
  const { bomId } = useParams(); // Retrieve bomId from URL
  const navigate = useNavigate(); // Initialize useNavigate
  const [selectedBom, setSelectedBom] = useState(null);
  const [selectedComponents, setSelectedComponents] = useState([]);
  const [showAddComponentForm, setShowAddComponentForm] = useState(false);
  const [newComponent, setNewComponent] = useState({
    component: "",
    quantity: "",
    vendor: "",
  });
  const [vendors, setVendors] = useState([]);
  const [components, setComponents] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [loadingComponents, setLoadingComponents] = useState(true);
  const [priceTables, setPriceTables] = useState([]);

  

  // Fetch BOM details and related components
  useEffect(() => {
    const fetchBomDetails = async () => {
      try {
        const response = await fetch(`${config.apiBaseURL}/bom_list/`);
        const data = await response.json();
        const bom = data.find((b) => b.bom_id === bomId);
        setSelectedBom(bom);
      } catch (error) {
        console.error("Error fetching BOM details:", error);
      }
    };

    const fetchBomComponents = async () => {
      try {
        const response = await fetch(`${config.apiBaseURL}/bom_master/`);
        const data = await response.json();
        const bomComponents = data.filter((b) => b.bom === bomId); // Filter components by BOM ID
        setSelectedComponents(bomComponents); // Store BOM components
      } catch (error) {
        console.error("Error fetching BOM components:", error);
      }
    };

    const fetchVendors = async () => {
      try {
        setLoadingVendors(true); // Set loading to true
        const response = await fetch(`${config.apiBaseURL}/vendor_list/`);
        const data = await response.json();
        setVendors(data); // Store the vendor list
      } catch (error) {
        console.error("Error fetching vendors:", error);
      } finally {
        setLoadingVendors(false); // Set loading to false
      }
    };

    const fetchComponents = async () => {
      try {
        setLoadingComponents(true);
        const response = await fetch(`${config.apiBaseURL}/component/`);
        const data = await response.json();
        setComponents(data);
      } catch (error) {
        console.error("Error fetching components:", error);
      } finally {
        setLoadingComponents(false);
      }
    };

    const fetchAllData = async () => {
      try {
        const [bomRes, bomMasterRes, vendorRes, componentRes, priceRes] = await Promise.all([
          fetch(`${config.apiBaseURL}/bom_list/`),
          fetch(`${config.apiBaseURL}/bom_master/`),
          fetch(`${config.apiBaseURL}/vendor_list/`),
          fetch(`${config.apiBaseURL}/component/`),
          fetch(`${config.apiBaseURL}/price_tables/`),
        ]);

        const [bomData, bomMasterData, vendorData, componentData, priceData] = await Promise.all([
          bomRes.json(),
          bomMasterRes.json(),
          vendorRes.json(),
          componentRes.json(),
          priceRes.json(),
        ]);

        setSelectedBom(bomData.find((b) => b.bom_id === bomId));
        setSelectedComponents(bomMasterData.filter((b) => b.bom === bomId));
        setVendors(vendorData);
        setComponents(componentData);
        setPriceTables(priceData);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoadingComponents(false);
        setLoadingVendors(false);
      }
    };

    // Fetch all data
    fetchBomDetails();
    fetchBomComponents();
    fetchVendors();
    fetchComponents();
    fetchAllData();
  }, [bomId]);

  const getLatestPriceInfo = (productId) => {
    const entries = priceTables.filter((e) => e.product === productId);
    if (entries.length === 0) return { price: "-", tax: "-" };
    const latest = entries.sort(
      (a, b) => new Date(b.current_time) - new Date(a.current_time)
    )[0];
    return { price: latest.price, tax: `${latest.tax}%` };
  };

  // Handle adding a new component to the BOM
  const handleAddComponent = async () => {
    try {
      // Check if the component already exists in the selectedComponents list
      const exists = selectedComponents.some(
        (component) =>
          component.component.component_id === newComponent.component
      );

      if (exists) {
        alert("This component is already added to the BOM.");
        return;
      }

      // Validate input fields
      if (
        !newComponent.component ||
        !newComponent.vendor ||
        !newComponent.quantity
      ) {
        alert("All fields are required.");
        return;
      }

      const payload = {
        bom: bomId, // Use the current BOM ID
        component: newComponent.component, // Selected component ID
        vendor: newComponent.vendor, // Selected vendor ID
        quantity: newComponent.quantity, // User-provided quantity
      };

      console.log("Payload to POST:", payload);

      const response = await fetch(`${config.apiBaseURL}/bom_master/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedComponents([...selectedComponents, data]);
        showSuccessToast("Component added successfully!");
        setShowAddComponentForm(false);
        setNewComponent({
          component: "",
          quantity: "",
          vendor: "",
        });
      } else {
        const error = await response.json();
        console.error("Error from API:", error);
        alert(`Failed to add component: ${JSON.stringify(error)}`);
      }
    } catch (error) {
      console.error("Error adding component:", error);
    }
  };

  const handleDeleteComponent = async (bomComponentId) => {
  if (!window.confirm("Are you sure you want to delete this component from the BOM?")) return;

  try {
    const response = await fetch(`${config.apiBaseURL}/bom_master/${bomComponentId}/`, {
      method: "DELETE",
    });

    if (response.ok) {
      showSuccessToast("Component deleted successfully.");
      setSelectedComponents((prev) =>
        prev.filter((component) => component.id !== bomComponentId)
      );
    } else {
      showErrorToast("Failed to delete component.");
    }
  } catch (error) {
    console.error("Error deleting component:", error);
    showErrorToast("An error occurred while deleting.");
  }
};

  return (
    <div style={{ padding: "20px" }}>
      {selectedBom && (
        <>
          <h3>Selected BOM: {selectedBom.bom_name}</h3>
          <p>
            <strong>BOM ID:</strong> {selectedBom.bom_id}
          </p>

          <button
            onClick={() => setShowAddComponentForm(true)}
            // style={{
            //   marginTop: "20px",
            //   padding: "10px 20px",
            //   // backgroundColor: "#007bff",
            //   // color: "#fff",
            //   border: "none",
            //   borderRadius: "5px",
            //   cursor: "pointer",
            // }}
          >
            Add Component
          </button>

          {showAddComponentForm && (
        <div style={{ marginTop: "20px" }}>
          <h4>Add New Component</h4>
          <div>
            <label>Component</label>
            <select
              value={newComponent.component}
              onChange={async (e) => {
                const componentId = e.target.value;
                setNewComponent({
                  ...newComponent,
                  component: componentId,
                  vendor: "",
                });

                if (componentId) {
                  try {
                    setLoadingVendors(true);

                    // Find the selected component from the component list
                    const selectedComp = components.find(
                      (comp) => comp.component_id === componentId
                    );

                    if (selectedComp) {
                      // Fetch data from the bom_master_view API
                      const response = await fetch(
                        `${config.apiBaseURL}/bom_master_view`
                      );
                      const data = await response.json();

                      // Filter matching entries based on component type and specification
                      const matchingVendors = data
                        .filter(
                          (entry) =>
                            entry.component_type ===
                              selectedComp.component_type &&
                            entry.component_specification ===
                              selectedComp.component_specification
                        )
                        .map((entry) => entry.product_details.vendor);

                      // Remove duplicate vendors by vendor_id
                      const uniqueVendors = matchingVendors.filter(
                        (vendor, index, self) =>
                          index ===
                          self.findIndex(
                            (v) => v.vendor_id === vendor.vendor_id
                          )
                      );

                      setVendors(uniqueVendors);
                    } else {
                      setVendors([]);
                    }
                  } catch (error) {
                    console.error(
                      "Error fetching vendors for the selected component:",
                      error
                    );
                  } finally {
                    setLoadingVendors(false);
                  }
                } else {
                  setVendors([]);
                }
              }}
            >
              <option value="">Select Component</option>
              {loadingComponents ? (
                <option>Loading components...</option>
              ) : (
                components.map((comp) => (
                  <option key={comp.component_id} value={comp.component_id}>
                    {`${comp.component_type} - ${comp.component_specification} - ${comp.vendor_id}`}
                  </option>
                ))
              )}
            </select>

            <label>Quantity</label>
            <input
              type="number"
              placeholder="Quantity"
              value={newComponent.quantity}
              onChange={(e) =>
                setNewComponent({ ...newComponent, quantity: e.target.value })
              }
            />

            <label>Vendor</label>
            <select
              value={newComponent.vendor}
              onChange={(e) =>
                setNewComponent({ ...newComponent, vendor: e.target.value })
              }
            >
              <option value="">Select Vendor</option>
              {loadingVendors ? (
                <option>Loading vendors...</option>
              ) : (
                vendors.map((vendor) => (
                  <option key={vendor.vendor_id} value={vendor.vendor_id}>
                   {`${vendor.vendor_id} -  ${vendor.vendor_name}`}
                  </option>
                ))
              )}
            </select>

            <button onClick={handleAddComponent}>Submit</button>
            <button onClick={() => setShowAddComponentForm(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

          {/* <h4>Components:</h4> */}
          <table
            border="1"
            style={{ width: "100%", borderCollapse: "collapse" }}
          >
            <thead>
              <tr>
                <th>Component Type</th>
                <th>Specification</th>
                <th>UOM</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Vendor</th>
                <th>Price</th>
                <th>Tax</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {selectedComponents.map((component, index) => {
                const { price, tax } = getLatestPriceInfo(component.component.product_id);
                return (
                  <tr key={index}>
                    <td>{component.component.component_type}</td>
                    <td>{component.component.component_specification}</td>
                    <td>{component.component.unit_of_measurement}</td>
                    <td>{component.component.category}</td>
                    <td>{component.quantity}</td>
                    <td>{component.vendor.vendor_name}</td>
                    <td style={{ textAlign: "right" }}>
                      ₹
                      {parseFloat(
                        price !== "-" ? price : 0
                      ).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td>{tax}</td>
                    <td>
                      <button
                        style={{ backgroundColor: "red", color: "white", border: "none", padding: "5px 10px", cursor: "pointer" }}
                        onClick={() => handleDeleteComponent(component.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
         
        </>
      )}

      

      <button
        onClick={() => navigate("/bom")}
        // style={{
        //   marginTop: "20px",
        //   padding: "10px 20px",
        //   // backgroundColor: "#6c757d",
        //   // color: "#fff",
        //   border: "none",
        //   borderRadius: "5px",
        //   cursor: "pointer",
        // }}
      >
        Back to BOM List
      </button>
      <ToastContainerComponent />
    </div>
  );
};

export default BOMDetails;
