import React, { useEffect, useState } from "react";
import config from "../Config"; // Import config for API endpoints
import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
  showMessageToast,
} from "./Toastify.jsx"; //  Removed ToastContainerComponent import here

const Roles = () => {
  const [users, setUsers] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "User",
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
          const updatedUsers = users.map((user) =>
            user.id === userId ? { ...user, role: newRole } : user,
          );
          setUsers(updatedUsers);

          const response = await fetch(
            `${config.apiBaseURL}/register/${userId}/`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ role: newRole }),
            },
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

  // Handle add user
  const handleAddUser = async () => {
    try {
      const emailExists = users.some(
        (user) => user.email.toLowerCase() === newUser.email.toLowerCase(),
      );
      if (emailExists) {
        showWarningToast(
          "This email is already registered. Please add another one.",
        );
        return;
      }

      const response = await fetch(`${config.apiBaseURL}/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          role: newUser.role,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        showErrorToast(
          error?.email
            ? `Error: ${error.email}`
            : "Error adding user. Please try again.",
        );
        return;
      }

      const addedUser = await response.json();
      setUsers((prevUsers) => [...prevUsers, addedUser]);
      setShowPopup(false);
      setNewUser({ name: "", email: "", password: "", role: "User" });
      showSuccessToast("User added successfully");
    } catch (error) {
      console.error("Error adding user:", error);
      showErrorToast("Something went wrong. Please try again.");
    }
  };

  // Prevent double toasts
  let isToggling = false;
  const toggleUserStatus = async (userId, currentStatus) => {
    if (isToggling) return;
    isToggling = true;

    try {
      const response = await fetch(`${config.apiBaseURL}/register/${userId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: !currentStatus }),
      });

      if (response.ok) {
        showSuccessToast(
          !currentStatus
            ? "User activated successfully"
            : "User inactivated successfully",
        );
        fetchUsers();
      } else {
        const error = await response.json();
        showErrorToast("Failed to update status: " + JSON.stringify(error));
      }
    } catch (err) {
      console.error("Error toggling user status:", err);
      showErrorToast("Something went wrong while updating status.");
    } finally {
      isToggling = false;
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
              <th>Name</th>
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
                <td>{user.name}</td>
                <td>{user.email}</td>
                {roles.map((role) => (
                  <td key={role}>
                    <input
                      type="radio"
                      className="custom-radios"
                      name={`role-${user.id}`}
                      value={role}
                      checked={user.role === role}
                      onChange={() =>
                        setTimeout(() => {
                          handleRoleChangeConfirmation(
                            user.id,
                            role,
                            user.email,
                          );
                        }, 0)
                      }
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
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <h3 className="popup-title">Add New User</h3>
            <form
              className="popup-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleAddUser(); 
              }}
            >
              <div className="form-group">
                <label className="form-label">Name:</label>
                <input
                  className="form-input"
                  type="text"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                  required
                />
              </div>

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
    </div>
  );
};

export default Roles;
