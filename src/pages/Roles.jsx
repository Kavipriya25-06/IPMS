import React, { useEffect, useState } from "react";
import config from "../Config"; // Import config for API endpoints

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

  const roles = ["Admin", "Procurement", "Finance", "Inventory", "User"];

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
    setConfirmation({ show: true, userId, newRole, email });
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
      await fetch(`http://127.0.0.1:8000/register/${userId}/`, {
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
      <h2>User Roles</h2>
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
                    onChange={() =>
                      handleRoleChangeConfirmation(user.id, role, user.email)
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
                  }}
                >
                  {user.status ? "Active" : "Inactive"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={() => setShowPopup(true)}>Add User</button>
      {showPopup && (
        <div className="popup">
          <h3>Add New User</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddUser();
            }}
          >
            <div>
              <label>Email:</label>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label>Password:</label>
              <input
                type={showPassword ? "text" : "password"} // toggle password visibility
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                required
              />
            </div>
            <div>
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword((prev) => !prev)}
              />
              <label>Show Password</label>
            </div>
            <div>
              <label>Role:</label>
              <select
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
            <button type="submit">Add User</button>
            <button type="button" onClick={() => setShowPopup(false)}>
              Cancel
            </button>
          </form>
        </div>
      )}
      {confirmation.show && (
        <div className="popup">
          <h3>Confirmation</h3>
          <p>
            Are you sure you want to assign{" "}
            <strong>{confirmation.email}</strong> to the role of{" "}
            <strong>{confirmation.newRole}</strong>?
          </p>
          <button onClick={handleConfirmedRoleChange}>Yes</button>
          <button onClick={handleCancelConfirmation}>No</button>
        </div>
      )}
    </div>
  );
};

export default Roles;
