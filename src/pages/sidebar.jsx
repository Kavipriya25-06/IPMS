import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";

export default function Sidebar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUserRole, setCurrentUserRole] = useState("");

  // Load role from localStorage (or replace with your actual role-fetching logic)
  useEffect(() => {
    const role = localStorage.getItem("userRole"); // Default to 'User'
    console.log("Normalized role:", role);
    setCurrentUserRole(role);
  }, []);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  const handleTileClick = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const isTabEnabled = (allowedRoles) => {
    return allowedRoles.includes(currentUserRole);
  };

  const tiles = [
    {
      label: "Components",
      path: "/components",
      roles: ["Admin", "Sub-Admin", "Procurement", "Inventory", "Finance","User"],
    },
    {
      label: "Inventory",
      path: "/inventory",
      roles: ["Admin", "Sub-Admin", "Inventory", "Finance","Procurement"],
    },
    {
      label: "Vendor",
      path: "/vendor",
      roles: ["Admin", "Sub-Admin", "Procurement"],
    },
    {
      label: "BOM",
      path: "/bom",
      roles: ["Admin", "Sub-Admin", "Procurement","Inventory","Finance","User"],
    },
    {
      label: "Projects",
      path: "/projects",
      roles: [
        "Admin",
        "Sub-Admin",
        "Inventory",
        "User",
        "Procurement",
        "Finance",
      ],
    },
    {
      label: "Requests",
      path: "/requests",
      roles: ["Admin", "Sub-Admin", "Procurement", "User", "Inventory"],
    },
    {
      label: "PO List",
      path: "/po-list",
      roles: ["Admin", "Sub-Admin", "Procurement", "Finance"],
    },
    {
      label: "Inward",
      path: "/inwardlist",
      roles: ["Admin", "Sub-Admin", "Inventory", "Procurement"],
    },
     {
      label: "Outward",
      path: "/outward",
      roles: ["Admin", "Sub-Admin", "Inventory", "Procurement"],
    },

  ];

  const topLevelPaths = tiles.map((tile) => tile.path);
  const currentTab = location.pathname;
  const showSidebar = topLevelPaths.includes(currentTab);

  return (
    <div className="layout-container">
      <aside className={`sidebar ${isMenuOpen ? "open" : "closed"}`} style={{  zIndex: 10 }}>
        <div className="hamburger-menu">
          <button
            className={`hamburger-button ${
              isMenuOpen ? "change" : "unchanged"
            }`}
            onClick={toggleMenu}
            aria-expanded={isMenuOpen}
            aria-label="Toggle Menu"
          >
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
          </button>
        </div>

        {isMenuOpen && (
          <div className="sidebar-content">
            {tiles
              .filter((tile) => isTabEnabled(tile.roles))
              .map((tile, idx) => (
                <div
                  key={idx}
                  className={`dashboard-tile ${
                    currentTab === tile.path ? "active-tile" : ""
                  }`}
                  onClick={() => handleTileClick(tile.path)}
                >
                  {tile.label}
                </div>
              ))}
          </div>
        )}
      </aside>
      <main
        className={`main-content ${
          isMenuOpen ? "sidebar-open" : "sidebar-closed"
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
}
