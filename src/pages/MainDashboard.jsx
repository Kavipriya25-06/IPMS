import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const MainDashboard = () => {
  const navigate = useNavigate();
  const [currentUserRole, setCurrentUserRole] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setCurrentUserRole(role || "");
  }, []);

  const tiles = [
    {
      label: "Components",
      path: "components",
      roles: ["Admin", "Sub-Admin", "Procurement", "Inventory", "Finance", "User"],
    },
    {
      label: "Inventory",
      path: "inventory",
      roles: ["Admin", "Sub-Admin", "Inventory", "Finance", "Procurement"],
    },
    {
      label: "Vendors",
      path: "vendor",
      roles: ["Admin", "Sub-Admin", "Procurement"],
    },
    {
      label: "BOM",
      path: "bom",
      roles: ["Admin", "Sub-Admin", "Procurement", "Inventory", "Finance", "User"],
    },
    {
      label: "Requests",
      path: "requests",
      roles: ["Admin", "Sub-Admin", "Procurement", "User", "Inventory"],
    },
    {
      label: "PO Orders",
      path: "po-list",
      roles: ["Admin", "Sub-Admin", "Procurement", "Finance"],
    },
    {
      label: "Inward",
      path: "inwardlist",
      roles: ["Admin", "Sub-Admin", "Inventory"],
    },
    {
      label: "Outward",
      path: "outward",
      roles: ["Admin", "Sub-Admin", "Inventory"],
    },
    {
      label: "Projects",
      path: "projects",
      roles: ["Admin", "Sub-Admin", "Inventory", "User", "Procurement", "Finance"],
    },
    {
      label: "Roles",
      path: "roles",
      roles: ["Admin"],
    },
  ];

  // Filter tiles by role
  const visibleTiles = tiles.filter((tile) => tile.roles.includes(currentUserRole));

  return (
    <div className="main-dashboard-container">
      {visibleTiles.map((tile, idx) => (
        <div
          key={idx}
          className="dashboard-tile-main"
          onClick={() => navigate(`/${tile.path}`)}
        >
          {tile.label}
        </div>
      ))}
    </div>
  );
};

export default MainDashboard;
