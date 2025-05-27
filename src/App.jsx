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
import Projects from "./pages/Projects";
import Cart from "./pages/Cart";
import Roles from "./pages/Roles";
import AddTags from "./pages/AddTags";
import ProjectMaster from "./pages/ProjectMaster";
import Mrf from "./pages/Mrf";
import MrfRequest from "./pages/MrfRequest";
import MRFCreate from "./pages/MRFCreate";
import ProfileDropdown from "./pages/ProfileDropdown";
import CartIcon from "./pages/CartIcon";
import TagIcon from "./pages/AddTagsIcon";
import MRFIcon from "./pages/MRFIcon";
import IPMSLogo from "./assets/IPMS.png";
import ResetPassword from "./pages/ResetPassword";

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
            alignItems: "flex-start",
          }}
        >
          <h1>
            <NavLink
              to="/"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <img
                src={IPMSLogo}
                alt="IPMS Logo"
                style={{ height: "70px", width: "200px", objectFit: "contain" }} // Adjust height as needed
              />
            </NavLink>
          </h1>
          {/* {user ? (
            <div style={{ textAlign: "right" }}>
              <p style={{ border: 0, marginBlockStart: 0, marginBlockEnd: 0 }}>
                Logged in as: <strong>{user.email}</strong> (
                <em>{user.role}</em>)
              </p>
              <div style={{ paddingBottom: 10, paddingTop: 10 }}>
                <button onClick={logout}>Logout</button>
              </div>
            </div>
          ) : null} */}
          <div
            style={{
              display: "flex",
            }}
          >
            <div
              style={{
                display: "flex",
                paddingLeft: "10px",
              }}
            >
              <CartIcon />
            </div>
            <div
              style={{
                display: "flex",
                paddingLeft: "10px",
              }}
            >
              <MRFIcon />
            </div>
            <div
              style={{
                display: "flex",
                paddingLeft: "10px",
              }}
            >
              <TagIcon />
            </div>
            <div
              style={{
                display: "flex",
                paddingLeft: "10px",
              }}
            >
              <ProfileDropdown />
            </div>
          </div>
        </header>

        <nav>
          <ul>
            <li
              className={
                isTabEnabled(["Admin", "Sub-Admin", "Procurement", "Inventory"])
                  ? ""
                  : "disabled"
              }
            >
              <NavLink to="/components">Components</NavLink>
            </li>
            <li
              className={
                isTabEnabled(["Admin", "Sub-Admin", "Inventory", "Finance"])
                  ? ""
                  : "disabled"
              }
            >
              <NavLink to="/inventory">Inventory</NavLink>
            </li>
            <li
              className={
                isTabEnabled(["Admin", "Sub-Admin", "Procurement"])
                  ? ""
                  : "disabled"
              }
            >
              <NavLink to="/vendor">Vendor</NavLink>
            </li>
            <li
              className={
                isTabEnabled(["Admin", "Sub-Admin", "Procurement"])
                  ? ""
                  : "disabled"
              }
            >
              <NavLink to="/bom">BOM</NavLink>
            </li>
            <li
              className={
                isTabEnabled([
                  "Admin",
                  "Sub-Admin",
                  "Inventory",
                  "User",
                  "Procurement",
                  "Finance",
                ])
                  ? ""
                  : "disabled"
              }
            >
              <NavLink to="/projects">Projects</NavLink>
            </li>
            <li
              className={
                isTabEnabled(["Admin", "Sub-Admin", "Procurement", "User","Inventory"])
                  ? ""
                  : "disabled"
              }
            >
              <NavLink to="/requests">Requests</NavLink>
            </li>
            {/* <li
              className={
                isTabEnabled(["Admin", "Procurement"]) ? "" : "disabled"
              }
            >
              <NavLink to="/cart">Cart</NavLink>
            </li> */}
            <li
              className={
                isTabEnabled(["Admin", "Sub-Admin", "Procurement", "Finance"])
                  ? ""
                  : "disabled"
              }
            >
              <NavLink to="/po-list">PO List</NavLink>
            </li>
            <li
              className={
                isTabEnabled(["Admin", "Sub-Admin", "Inventory"])
                  ? ""
                  : "disabled"
              }
            >
              <NavLink to="/inward">Inward</NavLink>
            </li>

            {/* <li
              className={
                isTabEnabled(["Admin", "Inventory", "Procurement"])
                  ? ""
                  : "disabled"
              }
            >
              <NavLink to="/addtags">Add Tags</NavLink>
            </li> */}
            {/* <li
              className={
                isTabEnabled(["Admin", "Procurement", "Inventory", "User"])
                  ? ""
                  : "disabled"
              }
            >
              <NavLink to="/Mrf">MRF List</NavLink>
            </li> */}
            {/* <li
              className={
                isTabEnabled(["Admin", "Procurement", "Inventory", "User"])
                  ? ""
                  : "disabled"
              }
            >
              <NavLink to="/MrfRequest">MRFRequest</NavLink>
            </li> */}
            {/* <li className={isTabEnabled(["Admin"]) ? "" : "disabled"}>
              <NavLink to="/roles">Roles</NavLink>
            </li> */}
          </ul>
        </nav>

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<HomePage />} />
          {/* Admin, Procurement, and Finance access */}
          <Route
            path="/components"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "Admin",
                  "Sub-Admin",
                  "Procurement",
                  "Inventory",
                ]}
              >
                <Components />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute
                allowedRoles={["Admin", "Sub-Admin", "Inventory", "Finance"]}
              >
                <Inventory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor"
            element={
              <ProtectedRoute
                allowedRoles={["Admin", "Sub-Admin", "Procurement"]}
              >
                <Vendors />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/:vendorId"
            element={
              <ProtectedRoute
                allowedRoles={["Admin", "Sub-Admin", "Procurement"]}
              >
                <VendorDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bom"
            element={
              <ProtectedRoute
                allowedRoles={["Admin", "Sub-Admin", "Procurement"]}
              >
                <BOMDisplay />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bom/:bomId"
            element={
              <ProtectedRoute
                allowedRoles={["Admin", "Sub-Admin", "Procurement"]}
              >
                <BOMDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/requests"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "Admin",
                  "Sub-Admin",
                  "User",
                  "Procurement",
                  "Inventory",
                ]}
              >
                <Requests />
              </ProtectedRoute>
            }
          />
          <Route
            path="request-form"
            element={
              <ProtectedRoute
                allowedRoles={["Admin", "Sub-Admin", "User", "Procurement"]}
              >
                <RequestForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/requests/:requestId"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "Admin",
                  "Sub-Admin",
                  "User",
                  "Procurement",
                  "Inventory",
                ]}
              >
                <RequestDetails user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/po-list"
            element={
              <ProtectedRoute
                allowedRoles={["Admin", "Sub-Admin", "Procurement", "Finance"]}
              >
                <POOrderList user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/po-details/:poId"
            element={
              <ProtectedRoute
                allowedRoles={["Admin", "Sub-Admin", "Procurement", "Finance"]}
              >
                <POOrderMaster user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inward"
            element={
              <ProtectedRoute
                allowedRoles={["Admin", "Sub-Admin", "Inventory"]}
              >
                <Inward />
              </ProtectedRoute>
            }
          />
          <Route
            path="/purchase-order/:id"
            element={
              <ProtectedRoute
                allowedRoles={["Admin", "Sub-Admin", "Procurement", "Finance"]}
              >
                <PurchaseOrder />
              </ProtectedRoute>
            }
          />

          {/* New Route for Project Master */}
          <Route
            path="/projects/:projectId"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "Admin",
                  "Sub-Admin",
                  "Procurement",
                  "Inventory",
                  "Finance",
                  "User",
                ]}
              >
                <ProjectMaster />
              </ProtectedRoute>
            }
          />

          <Route
            path="/Projects"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "Admin",
                  "Sub-Admin",
                  "User",
                  "Procurement",
                  "Inventory",
                  "Finance",
                ]}
              >
                <Projects />
              </ProtectedRoute>
            }
          />

          <Route
            path="/cart"
            element={
              <ProtectedRoute
                allowedRoles={["Admin", "Sub-Admin", "Procurement"]}
              >
                <Cart user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/roles"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <Roles />
              </ProtectedRoute>
            }
          />
          <Route
            path="/addtags"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "Admin",
                  "Sub-Admin",
                  "Inventory",
                  "Procurement",
                ]}
              >
                <AddTags />
              </ProtectedRoute>
            }
          />

          <Route
            path="/Mrf"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "Procurement",
                  "Admin",
                  "Sub-Admin",
                  "Inventory",
                  "User",
                ]}
              >
                <Mrf />
              </ProtectedRoute>
            }
          />

          <Route
            path="/MRFCreate"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "Procurement",
                  "Admin",
                  "Sub-Admin",
                  "Inventory",
                  "User",
                ]}
              >
                <MRFCreate />
              </ProtectedRoute>
            }
          />

          <Route
            path="/MrfRequest/:MRF_id"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "Procurement",
                  "Admin",
                  "Sub-Admin",
                  "Inventory",
                  "User",
                ]}
              >
                <MrfRequest />
              </ProtectedRoute>
            }
          />
        </Routes>

        <Routes>
          {/* other routes */}

          <Route
            path="/reset-password/:id/:token"
            element={<ResetPassword />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
