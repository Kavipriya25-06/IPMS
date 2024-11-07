
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const RequestDetails = () => {
  const { requestId } = useParams();
  const [details, setDetails] = useState([]);
  const [vendorNames, setVendorNames] = useState([]);
  const [inventoryData, setInventoryData] = useState({});
  const [cartItems, setCartItems] = useState([]);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    fetchRequestDetails();
    fetchInventoryData();
    fetchVendorList(); // Fetch complete vendor list
  }, [requestId]);

  // Fetch request details from request_master and filter based on requestId
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

  // Fetch inventory data to get available counts for each component
  const fetchInventoryData = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/inventory/");
      const data = await response.json();
      const inventoryMap = data.reduce((acc, item) => {
        acc[item.com_id] = item.qty;
        return acc;
      }, {});
      setInventoryData(inventoryMap);
    } catch (error) {
      console.error("Error fetching inventory data:", error);
    }
  };

  // Fetch the complete vendor list from vendor_list API
  const fetchVendorList = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/vendor_list/");
      const data = await response.json();
      const uniqueVendors = data.map((vendor) => vendor.vendor_name); // Extract vendor names
      setVendorNames(uniqueVendors);
    } catch (error) {
      console.error("Error fetching vendor list:", error);
    }
  };

  const handleOrder = (detail) => {
    setCartItems((prevItems) => [...prevItems, detail]); // Add item to cart
    alert(`Component ${detail.component_id} added to cart.`);
  };

  const handleAssign = async (componentId, requiredQty) => {
    const availableQty = inventoryData[componentId] || 0;
    if (availableQty >= requiredQty) {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/inventory/${componentId}/`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ qty: availableQty - requiredQty }),
          }
        );

        if (response.ok) {
          setInventoryData((prevData) => ({
            ...prevData,
            [componentId]: availableQty - requiredQty,
          }));
        } else {
          console.error("Error assigning component:", response.statusText);
        }
      } catch (error) {
        console.error("Error assigning component:", error);
      }
    } else {
      alert("Not enough stock available to assign this component.");
    }
  };

  const handleVendorChange = (component_id, selectedVendor) => {
    const updatedDetails = details.map((detail) => {
      if (detail.component_id === component_id) {
        return { ...detail, vendor_name: selectedVendor };
      }
      return detail;
    });
    setDetails(updatedDetails);
  };

  const toggleCartView = () => {
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
          {cartItems.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Component ID</th>
                  <th>Component Type</th>
                  <th>Specification</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item, index) => (
                  <tr key={index}>
                    <td>{item.component_id}</td>
                    <td>{item.component_type}</td>
                    <td>{item.component_specification}</td>
                    <td>{item.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                  const availableQty = inventoryData[detail.component_id] || 0;

                  return (
                    <tr key={detail.component_id}>
                      <td>{detail.status}</td>
                      <td>{detail.component_type}</td>
                      <td>{detail.component_specification}</td>
                      <td>{detail.unit_of_measurement}</td>
                      <td>{detail.category}</td>
                      <td>
                        <select
                          value={detail.vendor_name}
                          onChange={(e) =>
                            handleVendorChange(detail.component_id, e.target.value)
                          }
                        >
                          <option value="">Select Vendor</option>
                          {vendorNames.map((vendor, index) => (
                            <option key={index} value={vendor}>
                              {vendor}
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
                          disabled={availableQty < detail.qty}
                        >
                          Assign
                        </button>
                        <button onClick={() => handleOrder(detail)}>
                          Order
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
    </div>
  );
};

export default RequestDetails;
