// src/App.jsx
import React from "react";
import "./App.css";
import { useAuth } from "./AuthContext";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  NavLink,
} from "react-router-dom";
import Components from "./pages/Components";
import Inventory from "./pages/Inventory";
import Vendors from "./pages/Vendors";
import BOMDisplay from "./pages/BOM";
import Requests from "./pages/Requests";
import RequestDetails from "./pages/RequestDetails";
import VendorDetails from "./pages/VendorDetails";
import BOMDetails from "./pages/BOMDetails";
import RequestForm from "./pages/RequestForm";
import HomePage from "./pages/HomePage";
import POOrderMaster from "./pages/POOrderMaster";
import POOrderList from "./pages/POList";
import Inward from "./pages/Inward";
import PurchaseOrder from "./pages/POTemplate";
import Login from "./pages/Login";
import ProtectedRoute from "./ProtectedRoute";
// import { useAuth } from "./AuthContext";
// import PODetails from "./pages/PODetails";

function App() {
  const { user, logout } = useAuth();

  // Role-based access control for navigation tabs
  const isTabEnabled = (allowedRoles) =>
    user && allowedRoles.includes(user.role);

  return (
    <Router>
      <div className="App">
        {/* <h1>
          <NavLink to="/" style={{ textDecoration: "none", color: "inherit" }}>
            Inventory Management
          </NavLink>
        </h1>
        {user && (
          <button onClick={logout} style={{ float: "right" }}>
            Logout
          </button>
        )} */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h1>
            <NavLink
              to="/"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              Inventory and Procurement Management
            </NavLink>
          </h1>
          {user ? (
            <div style={{ textAlign: "right" }}>
              <p>
                Logged in as: <strong>{user.email}</strong> (
                <em>{user.role}</em>)
              </p>
              <button onClick={logout}>Logout</button>
            </div>
          ) : null}
        </header>

        <nav>
          <ul>
            <li
              className={
                isTabEnabled(["Admin", "Procurement", "Finance"])
                  ? ""
                  : "disabled"
              }
            >
              <NavLink to="/components">Components</NavLink>
            </li>
            <li
              className={isTabEnabled(["Admin", "Inventory"]) ? "" : "disabled"}
            >
              <NavLink to="/inventory">Inventory</NavLink>
            </li>
            <li
              className={
                isTabEnabled(["Admin", "Procurement", "Finance"])
                  ? ""
                  : "disabled"
              }
            >
              <NavLink to="/vendor">Vendor</NavLink>
            </li>
            <li
              className={
                isTabEnabled(["Admin", "Procurement", "Finance"])
                  ? ""
                  : "disabled"
              }
            >
              <NavLink to="/bom">BOM</NavLink>
            </li>
            <li
              className={
                isTabEnabled(["Admin", "User", "Procurement"]) ? "" : "disabled"
              }
            >
              <NavLink to="/requests">Requests</NavLink>
            </li>
            <li
              className={
                isTabEnabled(["Admin", "Procurement", "Finance"])
                  ? ""
                  : "disabled"
              }
            >
              <NavLink to="/po-list">PO List</NavLink>
            </li>
            <li
              className={isTabEnabled(["Admin", "Inventory"]) ? "" : "disabled"}
            >
              <NavLink to="/inward">Inward</NavLink>
            </li>
          </ul>
        </nav>

        {/* <nav>
          <ul>
            <li>
              <NavLink
                to="/components"
                className={({ isActive }) => (isActive ? "active" : "")}
                style={{
                  color: isTabEnabled(["Admin", "Procurement", "Finance"])
                    ? ""
                    : "gray",
                  pointerEvents: isTabEnabled([
                    "Admin",
                    "Procurement",
                    "Finance",
                  ])
                    ? "auto"
                    : "none",
                }}
              >
                Components
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/inventory"
                className={({ isActive }) => (isActive ? "active" : "")}
                style={{
                  color: isTabEnabled(["Admin", "Inventory"]) ? "" : "gray",
                  pointerEvents: isTabEnabled(["Admin", "Inventory"])
                    ? "auto"
                    : "none",
                }}
              >
                Inventory
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/vendor"
                className={({ isActive }) => (isActive ? "active" : "")}
                style={{
                  color: isTabEnabled(["Admin", "Procurement", "Finance"])
                    ? ""
                    : "gray",
                  pointerEvents: isTabEnabled([
                    "Admin",
                    "Procurement",
                    "Finance",
                  ])
                    ? "auto"
                    : "none",
                }}
              >
                Vendor
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/bom"
                className={({ isActive }) => (isActive ? "active" : "")}
                style={{
                  color: isTabEnabled(["Admin", "Procurement", "Finance"])
                    ? ""
                    : "gray",
                  pointerEvents: isTabEnabled([
                    "Admin",
                    "Procurement",
                    "Finance",
                  ])
                    ? "auto"
                    : "none",
                }}
              >
                BOM
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/requests"
                className={({ isActive }) => (isActive ? "active" : "")}
                style={{
                  color: isTabEnabled(["Admin", "User", "Procurement"])
                    ? ""
                    : "gray",
                  pointerEvents: isTabEnabled(["Admin", "User", "Procurement"])
                    ? "auto"
                    : "none",
                }}
              >
                Requests
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/po-list"
                className={({ isActive }) => (isActive ? "active" : "")}
                style={{
                  color: isTabEnabled(["Admin", "Procurement", "Finance"])
                    ? ""
                    : "gray",
                  pointerEvents: isTabEnabled([
                    "Admin",
                    "Procurement",
                    "Finance",
                  ])
                    ? "auto"
                    : "none",
                }}
              >
                PO List
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/inward"
                className={({ isActive }) => (isActive ? "active" : "")}
                style={{
                  color: isTabEnabled(["Admin", "Inventory"]) ? "" : "gray",
                  pointerEvents: isTabEnabled(["Admin", "Inventory"])
                    ? "auto"
                    : "none",
                }}
              >
                Inward
              </NavLink>
            </li>
          </ul>
        </nav> */}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<HomePage />} />
          {/* Admin, Procurement, and Finance access */}
          <Route
            path="/components"
            element={
              <ProtectedRoute
                allowedRoles={["Admin", "Procurement", "Finance"]}
              >
                <Components />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute
                allowedRoles={["Admin", "Inventory", "Procurement", "Finance"]}
              >
                <Inventory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor"
            element={
              <ProtectedRoute
                allowedRoles={["Admin", "Procurement", "Finance"]}
              >
                <Vendors />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/:vendorId"
            element={
              <ProtectedRoute
                allowedRoles={["Admin", "Procurement", "Finance"]}
              >
                <VendorDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bom"
            element={
              <ProtectedRoute
                allowedRoles={["Admin", "Procurement", "Finance"]}
              >
                <BOMDisplay />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bom/:bomId"
            element={
              <ProtectedRoute
                allowedRoles={["Admin", "Procurement", "Finance"]}
              >
                <BOMDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/requests"
            element={
              <ProtectedRoute allowedRoles={["Admin", "User", "Procurement"]}>
                <Requests />
              </ProtectedRoute>
            }
          />
          <Route
            path="request-form"
            element={
              <ProtectedRoute allowedRoles={["Admin", "User", "Procurement"]}>
                <RequestForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/requests/:requestId"
            element={
              <ProtectedRoute allowedRoles={["Admin", "User", "Procurement"]}>
                <RequestDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/po-list"
            element={
              <ProtectedRoute
                allowedRoles={["Admin", "Procurement", "Finance"]}
              >
                <POOrderList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/po-details/:poId"
            element={
              <ProtectedRoute
                allowedRoles={["Admin", "Procurement", "Finance"]}
              >
                <POOrderMaster />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inward"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Inventory"]}>
                <Inward />
              </ProtectedRoute>
            }
          />
          <Route
            path="/purchase-order/:id"
            element={
              <ProtectedRoute
                allowedRoles={["Admin", "Procurement", "Finance"]}
              >
                <PurchaseOrder />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
