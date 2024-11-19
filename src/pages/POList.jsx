import React, { useEffect, useState } from "react";

const POOrderList = () => {
  const [poOrders, setPOOrders] = useState([]); // State to store PO orders
  const [statusMessage, setStatusMessage] = useState(""); // State to display the status message
  const [showPopup, setShowPopup] = useState(false); // State to control popup visibility
  const [statusInput, setStatusInput] = useState(""); // State to store status input
  const [dateInput, setDateInput] = useState(""); // State to store date input
  const [imageInput, setImageInput] = useState(null); // State to store uploaded image

  // Function to fetch PO orders from the API
  const fetchPOOrders = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/po_list/");
      const result = await response.json();
      console.log("API Response:", result);

      if (result && result.message === "All POs retrieved successfully.") {
        setPOOrders(result.data); // Use the array directly
      } else {
        console.error("Unexpected API response format:", result);
        setPOOrders([]); // Reset to empty state if the response is invalid
      }
    } catch (error) {
      console.error("Error fetching PO Order List:", error);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchPOOrders();
  }, []);

  // Handle button click to show popup
  const handleButtonClick = (status) => {
    setStatusInput(status);
    setShowPopup(true);
  };

  // Handle form submission in the popup
  const handleFormSubmit = (e) => {
    e.preventDefault();
    console.log("Date:", dateInput, "Status:", statusInput, "Image:", imageInput);

    // Example: Update status logic here (API call if necessary)
    setStatusMessage(
      `Status updated to "${statusInput}" with date: ${dateInput} ${
        imageInput ? "and an uploaded image." : ""
      }`
    );
    setShowPopup(false); // Close the popup
    setDateInput(""); // Clear inputs
    setImageInput(null);
  };

  // Render the table
  return (
    <div>
      <h2>PO Order List</h2>
      {poOrders.length === 0 ? (
        <p>No Purchase Orders found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>PO ID</th>
              <th>Component ID</th>
              <th>Category</th>
              <th>Component Type</th>
              <th>Specification</th>
              <th>UOM</th>
              <th>Vendor Name</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>GST</th>
              <th>Total Cost</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {poOrders.map((order, index) => (
              <tr key={index}>
                <td>{order.PO_id}</td>
                <td>{order.cart_details.component_id}</td>
                <td>{order.cart_details.category}</td>
                <td>{order.cart_details.component_type}</td>
                <td>{order.cart_details.component_specification}</td>
                <td>{order.cart_details.unit_of_measurement}</td>
                <td>{order.cart_details.vendor_name}</td>
                <td>{order.cart_details.quantity}</td>
                <td>{order.cart_details.unit_price}</td>
                <td>{order.cart_details.GST}</td>
                <td>{order.cart_details.total_cost}</td>
                <td>{order.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Buttons below the table */}
      <div style={{ marginTop: "20px" }}>
        <button onClick={() => handleButtonClick("Order Placed")}>
          Order Placed
        </button>
        <button onClick={() => handleButtonClick("Shipped")}>Shipped</button>
        <button onClick={() => handleButtonClick("Received")}>Received</button>
      </div>

      {/* Status message */}
      {statusMessage && <p style={{ marginTop: "10px" }}>{statusMessage}</p>}

      {/* Popup for updating date, status, and image */}
      {showPopup && (
        <div className="popup">
          <form onSubmit={handleFormSubmit}>
            <h3>Update Status</h3>
            <label>
              Date:
              <input
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                required
              />
            </label>
            <label>
              Status:
              <input type="text" value={statusInput} readOnly />
            </label>
            {statusInput === "Received" && (
              <label>
                Upload Image:
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageInput(e.target.files[0])}
                />
              </label>
            )}
            <button type="submit">Submit</button>
            <button type="button" onClick={() => setShowPopup(false)}>
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default POOrderList;
