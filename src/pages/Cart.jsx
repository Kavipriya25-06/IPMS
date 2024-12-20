import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CustomMessagebox from "./CustomMessageBox.jsx";

const Cart = ({ user }) => {
  const { requestId } = useParams();
  const [cartItems, setCartItems] = useState([]);
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [messageBoxContent, setMessageBoxContent] = useState("");

  useEffect(() => {
    fetchCartItems();
  }, [requestId]);

  const fetchCartItems = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/cart/");
      if (!response.ok) {
        console.error("Error fetching cart items:", response.statusText);
        // alert("Failed to fetch cart items.");
        return;
      }

      const data = await response.json();

      // Ensure po_master_id is included in cart items
      setCartItems(data);
    } catch (error) {
      console.error("Error fetching cart items:", error);
      // alert("An error occurred while fetching cart items.");
    }
  };

  const getFirstItemId = (group) => {
    // Get the requests_by_date object
    const requestsByDate = group.requests_by_date;

    if (!requestsByDate || typeof requestsByDate !== "object") {
      console.error("Invalid requests_by_date structure:", requestsByDate);
      return null;
    }

    console.log("Requests grouped by date:", requestsByDate);

    // Get the first date key
    const firstDateKey = Object.keys(requestsByDate)[0];

    if (!firstDateKey) {
      console.error("No dates found in requests_by_date.");
      return null;
    }

    // Get requests grouped by status for the first date
    const requestsGroupedByStatus = requestsByDate[firstDateKey];

    if (
      !requestsGroupedByStatus ||
      typeof requestsGroupedByStatus !== "object"
    ) {
      console.error(
        "Invalid requestsGroupedByStatus structure:",
        requestsGroupedByStatus
      );
      return null;
    }

    console.log(
      "Requests grouped by status for date:",
      firstDateKey,
      requestsGroupedByStatus
    );

    // Get the first status key (e.g., "true" or "false")
    const firstStatusKey = Object.keys(requestsGroupedByStatus)[0];

    if (!firstStatusKey) {
      console.error("No statuses found in requestsGroupedByStatus.");
      return null;
    }

    // Get the array of requests for the first status
    const requests = requestsGroupedByStatus[firstStatusKey];

    if (!Array.isArray(requests) || requests.length === 0) {
      console.error("No valid requests found for status:", firstStatusKey);
      return null;
    }

    // Return the ID of the first request
    return requests[0]?.id || null; // Use optional chaining to avoid errors
  };

  const handlePlaceOrder = async (group) => {
    try {
      // Get the cart_id from the first item's ID
      const cartId = getFirstItemId(group);

      if (!cartId) {
        alert("Unable to find a valid cart_id for the group.");
        return;
      }

      console.log("Input group:", group);

      // Step 1: Post to PO_list and retrieve PO ID
      const poListPayload = {
        status: "In Progress", // Order status
        cart_id: cartId,
      };

      console.log("PO list sending payload:", poListPayload);

      const poListResponse = await fetch("http://127.0.0.1:8000/po_list/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(poListPayload),
      });

      if (!poListResponse.ok) {
        const error = await poListResponse.json();
        console.error("Error posting to PO_list:", error);
        alert(`Failed to create PO_list: ${JSON.stringify(error)}`);
        return;
      }

      const poListData = await poListResponse.json();
      const poListId = poListData.id;

      console.log("Created PO_list entry with ID:", poListId);

      // Step 2: Post each item with `order_placed: false` in the group to PO_master
      const poMasterPromises = Object.entries(group.requests_by_date).flatMap(
        ([date, statusGroupedRequests]) =>
          Object.entries(statusGroupedRequests)
            .filter(([status]) => status === "false") // Only process items with `order_placed: false`
            .flatMap(([status, requests]) =>
              requests.map((item) => {
                const poMasterPayload = {
                  PO_id: poListId, // Use the generated PO_list ID
                  cart_id: item.id, // Use the cart item ID
                  status: "In Progress", // Order status
                };

                return fetch("http://127.0.0.1:8000/po_master/", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(poMasterPayload),
                });
              })
            )
      );

      const poMasterResponses = await Promise.all(poMasterPromises);

      const failedResponses = poMasterResponses.filter((res) => !res.ok);
      if (failedResponses.length > 0) {
        console.error("Some items failed to post to PO_master.");
        alert("Failed to post some items to PO_master.");
      } else {
        console.log("All items posted to PO_master successfully.");
      }

      // Step 3: Patch each item's `order_placed` status in the cart API
      const cartPatchPromises = Object.entries(group.requests_by_date).flatMap(
        ([date, statusGroupedRequests]) =>
          Object.entries(statusGroupedRequests)
            .filter(([status]) => status === "false") // Only process items with `order_placed: false`
            .flatMap(([status, requests]) =>
              requests.map((item) => {
                const patchPayload = { order_placed: true };

                return fetch(`http://127.0.0.1:8000/cart/${item.id}/`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(patchPayload),
                });
              })
            )
      );

      const patchResponses = await Promise.all(cartPatchPromises);

      const failedPatches = patchResponses.filter((res) => !res.ok);
      if (failedPatches.length > 0) {
        console.error("Some items failed to update in the cart API.");
        alert("Failed to update some items in the cart.");
      } else {
        console.log("All items updated in the cart API successfully.");
      }

      // Step 4: Mark all items with `order_placed: false` in the group as ordered in the UI
      setCartItems((prevCartItems) =>
        prevCartItems.map((cartItem) =>
          cartItem.vendor_id === group.vendor_id
            ? {
                ...cartItem,
                requests_by_date: Object.fromEntries(
                  Object.entries(cartItem.requests_by_date).map(
                    ([date, statusGroupedRequests]) => [
                      date,
                      Object.fromEntries(
                        Object.entries(statusGroupedRequests).map(
                          ([status, requests]) => [
                            status,
                            requests.map((item) =>
                              status === "false"
                                ? { ...item, order_placed: true }
                                : item
                            ),
                          ]
                        )
                      ),
                    ]
                  )
                ),
              }
            : cartItem
        )
      );

      alert("Order placed successfully!");
    } catch (error) {
      console.error("Error placing order:", error);
      alert("An error occurred while placing the order.");
    }
  };

  return (
    <div>
      {/* Render CustomMessagebox when showMessageBox is true */}
      {showMessageBox && (
        <CustomMessagebox
          message={messageBoxContent}
          onClose={() => setShowMessageBox(false)}
        />
      )}

      <div>
        <h3>Cart</h3>
        {cartItems.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          cartItems
            .filter((group) =>
              Object.values(group.requests_by_date || {}).some(
                (requestsGroupedByStatus) =>
                  Object.values(requestsGroupedByStatus || {}).some(
                    (requests) => requests.some((item) => !item.order_placed)
                  )
              )
            ) // Filter out groups where all items are `order_placed`
            .map((group, groupIndex) => (
              <div key={group.vendor_id || groupIndex}>
                <h4>Vendor: {group.vendor_name}</h4>
                {Object.entries(group.requests_by_date || {})
                  .filter(([_, requestsGroupedByStatus]) =>
                    Object.values(requestsGroupedByStatus || {}).some(
                      (requests) => requests.some((item) => !item.order_placed)
                    )
                  ) // Filter out dates where all items are `order_placed`
                  .map(([date, requestsGroupedByStatus]) => (
                    <div key={date}>
                      <h5>Date: {date}</h5>
                      {Object.entries(requestsGroupedByStatus || {})
                        .filter(([_, requests]) =>
                          requests.some((item) => !item.order_placed)
                        ) // Filter out order statuses where all items are `order_placed`
                        .map(
                          ([orderPlaced, requests]) =>
                            orderPlaced === "false" &&
                            requests.filter((item) => !item.order_placed)
                              .length > 0 && (
                              <div key={orderPlaced}>
                                <table>
                                  <thead>
                                    <tr>
                                      <th>Component ID</th>
                                      <th>Component Type</th>
                                      <th>Specification</th>
                                      <th>Quantity</th>
                                      <th>Category</th>
                                      <th>Unit of Measurement</th>
                                      <th>Unit Price</th>
                                      <th>GST (%)</th>
                                      <th>Total Cost</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {requests
                                      .filter((item) => !item.order_placed)
                                      .map((item) => (
                                        <tr key={item.id}>
                                          <td>{item.component_id}</td>
                                          <td>{item.component_type}</td>
                                          <td>
                                            {item.component_specification}
                                          </td>
                                          <td>{item.quantity}</td>
                                          <td>{item.category}</td>
                                          <td>{item.unit_of_measurement}</td>
                                          <td>{item.unit_price}</td>
                                          <td>{item.GST}</td>
                                          <td>{item.total_cost}</td>
                                        </tr>
                                      ))}
                                  </tbody>
                                </table>
                                <button
                                  onClick={() => handlePlaceOrder(group, date)}
                                  disabled={requests.every(
                                    (item) => item.order_placed
                                  )}
                                >
                                  Place Order
                                </button>
                              </div>
                            )
                        )}
                    </div>
                  ))}
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default Cart;
