import React, { useEffect, useState } from "react";
import config from "../Config"; // Import config for API endpoints
import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  showMessageToast,
  ToastContainerComponent,
} from "./Toastify.jsx";

const Roles = () => {
  const [users, setUsers] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    role: "User",
  });
  const [confirmation, setConfirmation] = useState({
    show: false,
    userId: null,
    newRole: "",
    email: "",
  });

  const roles = [
    "Admin",
    "Sub-Admin",
    "Procurement",
    "Finance",
    "Inventory",
    "User",
  ];

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/register/`);
      if (!response.ok) {
        throw new Error(`Error fetching users: ${response.statusText}`);
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Handle role change confirmation
  const handleRoleChangeConfirmation = (userId, newRole, email) => {
    showMessageToast({
      message: (
        <>
          Are you sure you want to assign <strong>{email}</strong> to the role
          of <strong>{newRole}</strong>?
        </>
      ),
      onConfirm: async () => {
        try {
          // Update local state immediately (optimistic update)
          const updatedUsers = users.map((user) =>
            user.id === userId ? { ...user, role: newRole } : user
          );
          setUsers(updatedUsers);

          // Make API request to update role
          const response = await fetch(
            `${config.apiBaseURL}/register/${userId}/`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ role: newRole }),
            }
          );

          if (response.ok) {
            showSuccessToast("Role updated successfully.");
          } else {
            const error = await response.json();
            showErrorToast("Failed to update role: " + JSON.stringify(error));
          }
        } catch (error) {
          console.error("Error updating role:", error);
          showErrorToast("Failed to update role.");
        }
      },
      onCancel: () => {
        showWarningToast("Role update cancelled.");
      },
    });
  };

  // Handle confirmed role change
  const handleConfirmedRoleChange = async () => {
    const { userId, newRole } = confirmation;
    try {
      const updatedUsers = users.map((user) =>
        user.id === userId ? { ...user, role: newRole } : user
      );
      setUsers(updatedUsers);

      // Make an API call to update the role
      const payload = { role: newRole };
      const response = await fetch(`${config.apiBaseURL}/register/${userId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Error updating role: ${response.statusText}`);
      }
      console.log("Role updated successfully");
      setConfirmation({ show: false, userId: null, newRole: "", email: "" });
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  const handleCancelConfirmation = () => {
    setConfirmation({ show: false, userId: null, newRole: "", email: "" });
  };

  // Handle role change
  const handleRoleChange = async (userId, newRole) => {
    try {
      const updatedUsers = users.map((user) =>
        user.id === userId ? { ...user, role: newRole } : user
      );
      setUsers(updatedUsers);

      // Optional: Make an API call to update the role
      const payload = { role: newRole };
      const response = await fetch(`${config.apiBaseURL}/register/${userId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Error updating role: ${response.statusText}`);
      }
      console.log("Role updated successfully");
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  // Handle add user
  const handleAddUser = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        throw new Error(`Error adding user: ${response.statusText}`);
      }

      const addedUser = await response.json();
      setUsers((prevUsers) => [...prevUsers, addedUser]);
      setShowPopup(false);
      setNewUser({ email: "", password: "", role: "User" });
      console.log("User added successfully");
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await fetch(`${config.apiBaseURL}/register/${userId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: !currentStatus }),
      });
      fetchUsers();
    } catch (err) {
      console.error("Error toggling user status:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <div className="user-roles-header">
        <h2 className="user-roles-title">User Roles</h2>
        <button className="add-user-button" onClick={() => setShowPopup(true)}>
          Add User
        </button>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Email</th>
              {roles.map((role) => (
                <th key={role}>{role}</th>
              ))}
              <th>Active status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.email}</td>
                {roles.map((role) => (
                  <td key={role}>
                    <input
                      type="radio"
                      name={`role-${user.id}`}
                      value={role}
                      checked={user.role === role}
                      onChange={() => {
                        setTimeout(() => {
                          handleRoleChangeConfirmation(
                            user.id,
                            role,
                            user.email
                          );
                        }, 0); // Defer execution until after input change
                      }}
                    />
                  </td>
                ))}

                <td>
                  <button
                    onClick={() => toggleUserStatus(user.id, user.status)}
                    style={{
                      padding: "5px 10px",
                      backgroundColor: user.status ? "green" : "gray",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                      borderRadius: "5px",
                    }}
                  >
                    {user.status ? "Active" : "Inactive"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showPopup && (
        <div className="modal-overlay" onClick={() => setShowPopup(false)}>
          <div className="popup">
            <h3 className="popup-title">Add New User</h3>
            <form
              className="popup-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleAddUser();
              }}
            >
              <div className="form-group">
                <label className="form-label">Email:</label>
                <input
                  className="form-input"
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password:</label>
                <input
                  className="form-input"
                  type={showPassword ? "text" : "password"}
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  required
                />
              </div>
              {/* <div className="form-group checkbox-group">
        <input
          type="checkbox"
          checked={showPassword}
          onChange={() => setShowPassword((prev) => !prev)}
        />
        <label className="form-label">Show Password</label>
      </div> */}
              <div className="form-group">
                <label className="form-label">Role:</label>
                <select
                  className="form-input"
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
              <div className="button-group-bottom">
                <button className="submit-button" type="submit">
                  Add User
                </button>
                <button
                  className="cancel-button"
                  type="button"
                  onClick={() => setShowPopup(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* {confirmation.show && (
        <div className="popup">
          <h3>Confirmation</h3>
          <p>
            Are you sure you want to assign{" "}
            <strong>{confirmation.email}</strong> to the role of{" "}
            <strong>{confirmation.newRole}</strong>?
          </p>
          <div className="modal-actions">
            <button
              style={{
                border: "none",
                borderRadius: "5px",
                padding: "5px 10px",
              }}
              onClick={handleConfirmedRoleChange}
            >
              Yes
            </button>
            <button
              style={{
                border: "none",
                borderRadius: "5px",
                padding: "5px 10px",
              }}
              onClick={handleCancelConfirmation}
            >
              No
            </button>
          </div>
        </div>
      )} */}

      <ToastContainerComponent />
    </div>
  );
};

export default Roles;
