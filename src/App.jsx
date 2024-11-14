// src/App.jsx
import React from "react";

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
import "./App.css";
import RequestForm from "./pages/RequestForm";
import HomePage from "./pages/HomePage";

function App() {
  return (
    <Router>
      <div className="App">
        <h1>
          <NavLink to="/" style={{ textDecoration: "none", color: "inherit" }}>
            Inventory Management
          </NavLink>
        </h1>
        <nav>
          <ul>
            <li>
              <NavLink
                to="/components"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Components
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/inventory"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Inventory
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/vendor"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Vendor
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/bom"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                BOM
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/requests"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Requests
              </NavLink>
            </li>
          </ul>
        </nav>
        <Routes>
          <Route path="/components" element={<Components />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/vendor" element={<Vendors />} />
          <Route path="/vendor/:vendorId" element={<VendorDetails />} />
          <Route path="/bom" element={<BOMDisplay />} />
          <Route path="/bom/:bomId" element={<BOMDetails />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/" element={<HomePage />} />
          <Route path="request-form" element={<RequestForm />} />
          <Route path="/requests/:requestId" element={<RequestDetails />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
