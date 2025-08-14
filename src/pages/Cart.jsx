import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CustomMessagebox from "./CustomMessageBox.jsx";
import config from "../Config"; // Import config for API endpoints
import { parseISO, format } from "date-fns";

import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  showMessageToast,
  ToastContainerComponent,
} from "./Toastify.jsx"; // Import Toastify utilities

const Cart = ({ user }) => {
  const { requestId } = useParams();
  const [cartItems, setCartItems] = useState([]);
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [messageBoxContent, setMessageBoxContent] = useState("");

  useEffect(() => {
    fetchCartItems();
  }, [requestId]);

  // Function to fetch cart items from the API
  const fetchCartItems = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/cart/`);
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

  // Function to handle placing an order for a group
  const handlePlaceOrder = async (group) => {
    try {
      // Get the cart_id from the first item's ID
      const cartId = getFirstItemId(group);

      if (!cartId) {
        showWarningToast("Unable to find a valid cart_id for the group.");
        return;
      }

      console.log("Input group:", group);

      // Step 1: Post to PO_list and retrieve PO ID
      const poListPayload = {
        status: "In Progress", // Order status
        cart_id: cartId,
      };

      console.log("PO list sending payload:", poListPayload);

      const poListResponse = await fetch(`${config.apiBaseURL}/po_list/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(poListPayload),
      });

      if (!poListResponse.ok) {
        const error = await poListResponse.json();
        console.error("Error posting to PO_list:", error);
        showErrorToast(`Failed to create PO_list: ${JSON.stringify(error)}`);
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
                  status: "Pending", // Order status
                };

                return fetch(`${config.apiBaseURL}/po_master/`, {
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
        showErrorToast("Failed to post some items to PO_master.");
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

                return fetch(`${config.apiBaseURL}/cart/${item.id}/`, {
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
        showErrorToast("Failed to update some items in the cart.");
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

      showSuccessToast("Order placed successfully!");
    } catch (error) {
      console.error("Error placing order:", error);
      showErrorToast("An error occurred while placing the order.");
    }
  };

  const handleRemoveFromCart = (item) => {
    showMessageToast({
      message: `Remove ${item.component_type} - ${item.component_specification} from cart?`,
      onConfirm: async () => {
        try {
          // Step 1: DELETE from cart
          const deleteRes = await fetch(
            `${config.apiBaseURL}/cart/${item.id}/`,
            {
              method: "DELETE",
            }
          );

          if (!deleteRes.ok) {
            showErrorToast("Failed to delete item from cart.");
            return;
          }

          // Step 2: PATCH request_master to set cart_assign = false
          const requestFormatted = item.request_list_id;
          const requestMasterId = item.request_id;

          if (requestFormatted && requestMasterId) {
            const patchRes = await fetch(
              `${config.apiBaseURL}/request_master/${requestFormatted}/${requestMasterId}/`,
              {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cart_assign: false }),
              }
            );

            if (!patchRes.ok) {
              const error = await patchRes.json();
              console.warn("Failed to patch request_master:", error);
            }
          }

          showSuccessToast("Removed from cart successfully.");
          fetchCartItems(); // Refresh UI
        } catch (error) {
          console.error("Error removing from cart:", error);
          showErrorToast("Error removing item from cart.");
        }
      },
      onCancel: () => {
        showWarningToast("Action cancelled.");
      },
    });
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
        <h2>Cart</h2>
        {cartItems.length === 0 ||
        !cartItems.some((group) =>
          Object.values(group.requests_by_date || {}).some(
            (requestsGroupedByStatus) =>
              Object.values(requestsGroupedByStatus || {}).some((requests) =>
                requests.some((item) => !item.order_placed)
              )
          )
        ) ? (
          <p style={{ fontWeight: "bold", fontSize: "18px" }}>
            Your cart is empty.
          </p>
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
                      <h5>Date: {format(parseISO(date), "dd-MM-yyyy")}</h5>
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
                                <div className="table-container">
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
                                        <th>GST %</th>
                                        <th>Total Cost</th>
                                        <th>Actions</th>
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
                                            <td style={{ textAlign: "right" }}>
                                              ₹
                                              {parseFloat(
                                                item.unit_price
                                              ).toLocaleString("en-IN", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                              })}
                                            </td>
                                            <td style={{ textAlign: "right" }}>
                                              {item.GST}%
                                            </td>
                                            <td style={{ textAlign: "right" }}>
                                              ₹
                                              {parseFloat(
                                                item.total_cost
                                              ).toLocaleString("en-IN", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                              })}
                                            </td>

                                            <td>
                                              <button
                                                onClick={() =>
                                                  handleRemoveFromCart(item)
                                                }
                                                style={{
                                                  backgroundColor: "#b0aeae",
                                                  color: "black",
                                                  border: "none",
                                                  padding: "5px 15px",
                                                  cursor: "pointer",
                                                  borderRadius: "5px",
                                                }}
                                              >
                                                Remove
                                              </button>
                                            </td>
                                          </tr>
                                        ))}
                                    </tbody>
                                  </table>
                                </div>
                                <button
                                  onClick={() => handlePlaceOrder(group, date)}
                                  disabled={requests.every(
                                    (item) => item.order_placed
                                  )}
                                  className="place-order-btn"
                                >
                                  Submit PO
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
      <ToastContainerComponent />
    </div>
  );
};

export default Cart;
