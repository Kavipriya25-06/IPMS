//
// Eighth set of code
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const RequestForm = () => {
  const [boms, setBoms] = useState([]);
  const [selectedBom, setSelectedBom] = useState(null);
  const [selectedComponents, setSelectedComponents] = useState([]);
  const [availableComponents, setAvailableComponents] = useState([]);
  const navigate = useNavigate();
  const [vendorMaster, setVendorMaster] = useState([]); // Store data from vendor_master
  const [vendorList, setVendorList] = useState([]); // Store data from vendor_list
  const [requesterName, setRequesterName] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/bom_list/")
      .then((response) => response.json())
      .then((data) => setBoms(data))
      .catch((error) => console.error("Error fetching BOMs:", error));

    // Fetch available components for adding
    fetch("http://127.0.0.1:8000/component/")
      .then((response) => response.json())
      .then((data) => setAvailableComponents(data))
      .catch((error) => console.error("Error fetching components:", error));

    // Fetch vendor master to get vendor_id by component_id
    fetch("http://127.0.0.1:8000/vendor_master/")
      .then((response) => response.json())
      .then((data) => setVendorMaster(data))
      .catch((error) => console.error("Error fetching vendor master:", error));

    // Fetch vendor list to get vendor names by vendor_id
    fetch("http://127.0.0.1:8000/vendor_list/")
      .then((response) => response.json())
      .then((data) => setVendorList(data))
      .catch((error) => console.error("Error fetching vendor list:", error));
  }, []);

  const handleBomChange = (event) => {
    const selectedBomId = event.target.value;
    const bom = boms.find((b) => b.bom_id === selectedBomId);
    setSelectedBom(bom);

    fetch("http://127.0.0.1:8000/bom_master/")
      .then((response) => response.json())
      .then((data) => {
        const bomComponents = data.filter((b) => b.bom === selectedBomId);

        // If vendor_name is already provided, use it; otherwise, look up by vendor_id
        const componentsWithVendors = bomComponents.map((component) => {
          if (component.vendor.vendor_name) {
            return component; // Use the vendor_name from BOM data
          } else {
            // If vendor_name isn't in the BOM data, use vendor_id lookup
            const vendorData = vendorList.find(
              (v) => v.vendor_id === component.vendor.vendor_id
            );
            return {
              ...component,
              vendor: {
                ...component.vendor,
                vendor_name: vendorData ? vendorData.vendor_name : "N/A",
              },
            };
          }
        });
        setSelectedComponents(componentsWithVendors);
        // setSelectedComponents(bomComponents);
      })
      .catch((error) => console.error("Error fetching BOM components:", error));
  };

  const handleAddComponent = () => {
    // Add a blank row with default values
    setSelectedComponents([
      ...selectedComponents,
      { component: null, quantity: 1, vendor: { vendor_name: "N/A" } }, // Check here
    ]);
  };

  const handleDeleteComponent = (index) => {
    setSelectedComponents(selectedComponents.filter((_, i) => i !== index));
  };

  const handleQuantityChange = (index, quantity) => {
    const updatedComponents = [...selectedComponents];
    updatedComponents[index].quantity = quantity;
    setSelectedComponents(updatedComponents);
  };

  const handleComponentSelect = (index, componentId) => {
    const selectedComponent = availableComponents.find(
      (comp) => comp.component_id === componentId
    );
    console.log("Fetched component id: ", componentId);

    const updatedComponents = [...selectedComponents];
    updatedComponents[index].component = selectedComponent;
    // updatedComponents[index].component.id = 3;

    console.log("Added component API response:", selectedComponent);

    // Step 1: Find vendor_id from vendor_master using component_id
    const vendorData = vendorMaster.find(
      (vendor) => vendor.product_id === selectedComponent.product_id // Vendor master has component_id as component
    );
    console.log("Selected components API response:", selectedComponents);
    console.log("fetched vendor response:", vendorData);

    // Step 2: Use vendor_id to find vendor_name from vendor_list
    if (vendorData) {
      const vendor = vendorList.find(
        (v) => v.vendor_id === vendorData.vendor // Vendor master also has vendor_id as vendor
      );
      updatedComponents[index].vendor = {
        vendor_name: vendor ? vendor.vendor_name : "iruku",
        vendor_id: vendor ? vendor.vendor_id : "",
        product_id: vendor ? vendor.product_id : "",
      };
    } else {
      updatedComponents[index].vendor = { vendor_name: "illa" };
    }

    //updatedComponents[index].vendor_name = vendor ? vendor.product_id : "N/A";
    setSelectedComponents(updatedComponents);
  };

  const bom_id_list = selectedBom ? selectedBom.bom_id : "";
  const firstComponentId = selectedComponents[0]?.id;

  const handleSubmit = async () => {
    try {
      const newRequest = {
        requester_name: requesterName,
        date: date,
        status: "In Progress",
        last_modified_by: "Arun",
        bom: firstComponentId,
        bom_id: bom_id_list,
      };

      // Step 1: Submit to request_list to get the generated request_id
      const requestListResponse = await fetch(
        "http://127.0.0.1:8000/request_list/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newRequest),
        }
      );

      const requestListData = await requestListResponse.json();

      // Debugging log to inspect API response
      console.log("request_list API response:", requestListData);

      const generatedRequestId = requestListData.request_id;
      console.log("Generated Request ID:", generatedRequestId);

      if (!generatedRequestId) {
        throw new Error("Request ID was not generated or returned.");
      }

      // Step 2: Submit each entry to request_master with the generated request_id
      const requestMasterEntries = selectedComponents.map((component) => ({
        request: generatedRequestId,
        component: component.component.component_id,
        vendor: component.vendor.vendor_id,
        bom: component.id ? component.id : 3, // For the components added we give a default bom master id
        qty: component.quantity,
        status: "pending",
      }));

      const requestMasterPromises = requestMasterEntries.map((entry) =>
        fetch("http://127.0.0.1:8000/request_master/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(entry),
        })
          .then((response) => response.json())
          .then((data) => console.log("Request Master Entry Added:", data))
          .catch((error) =>
            console.error("Error updating request master entry:", error)
          )
      );

      await Promise.all(requestMasterPromises);
      console.log("All request master entries successfully added.");
    } catch (error) {
      console.error("Error in submission process:", error);
    }
  };

  return (
    <div>
      <h1>Create a Request</h1>
      <div>
        <label>Requester Name:</label>
        <input
          type="text"
          value={requesterName}
          onChange={(e) => setRequesterName(e.target.value)}
          placeholder="Enter requester name"
          required
        />
      </div>
      <div>
        <label>Date:</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Select BOM:</label>
        <select onChange={handleBomChange}>
          <option value="">Select BOM</option>
          {boms.map((bom) => (
            <option key={bom.bom_id} value={bom.bom_id}>
              {bom.bom_name}
            </option>
          ))}
        </select>
      </div>

      {selectedBom && (
        <div>
          <h3>Selected BOM: {selectedBom.bom_name}</h3>
          <h4>Components:</h4>
          <table>
            <thead>
              <tr>
                <th>Component Type</th>
                <th>Specification</th>
                <th>Unit</th>
                <th>Quantity</th>
                <th>Vendor Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {selectedComponents.map((component, index) => (
                <tr key={index}>
                  <td>
                    {component.component ? (
                      component.component.component_type
                    ) : (
                      <select
                        onChange={(e) =>
                          handleComponentSelect(index, e.target.value)
                        }
                      >
                        <option value="">Select Component</option>
                        {availableComponents.map((comp) => (
                          <option
                            key={comp.component_id}
                            value={comp.component_id}
                          >
                            {comp.component_type}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td>
                    {component.component
                      ? component.component.component_specification
                      : "-"}
                  </td>
                  <td>
                    {component.component
                      ? component.component.unit_of_measurement
                      : "-"}
                  </td>

                  <td>
                    <input
                      type="number"
                      min="1"
                      value={component.quantity}
                      onChange={(e) =>
                        handleQuantityChange(index, e.target.value)
                      }
                    />
                  </td>
                  <td>{component.vendor.vendor_name}</td>
                  <td>
                    <button onClick={() => handleDeleteComponent(index)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={handleAddComponent}>Add Component</button>
        </div>
      )}

      <button onClick={handleSubmit}>Submit Request</button>
      <button onClick={() => navigate("/")}>Save and exit</button>
    </div>
  );
};

export default RequestForm;
