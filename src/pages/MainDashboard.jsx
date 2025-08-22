import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import config from "../Config";

const MainDashboard = () => {
  const navigate = useNavigate();
  const [currentUserRole, setCurrentUserRole] = useState("");
  const [componentCount, setComponentCount] = useState(0);
  const [requestComponentCount, setRequestComponentCount] = useState(0);
  const [inventoryCount, setInventoryCount] = useState(0);
  const [vendorCount, setVendorCount] = useState(0);
  const [bomCounts, setBomCounts] = useState({ wbom: 0, fbom: 0 });
  const [projectCount, setProjectCount] = useState(0);
  const [pendingInwardCount, setPendingInwardCount] = useState(0);
  const [defectOutwardCount, setDefectOutwardCount] = useState(0);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setCurrentUserRole(role || "");

    // Components
    fetch(`${config.apiBaseURL}/component/`)
      .then((res) => res.json())
      .then((data) => setComponentCount(data.length))
      .catch((err) => console.error("Component fetch error:", err));

    // Request Components
    fetch(`${config.apiBaseURL}/request_component/`)
      .then((res) => res.json())
      .then((data) => setRequestComponentCount(data.length))
      .catch((err) => console.error("Request component fetch error:", err));

    // Inventory
    fetch(`${config.apiBaseURL}/inventory/`)
      .then((res) => res.json())
      .then((data) => setInventoryCount(data.length))
      .catch((err) => console.error("Inventory fetch error:", err));

    // Vendors
    fetch(`${config.apiBaseURL}/vendor_list/`)
      .then((res) => res.json())
      .then((data) => setVendorCount(data.length))
      .catch((err) => console.error("Vendor fetch error:", err));

    // BOM
    fetch(`${config.apiBaseURL}/bom_list/`)
      .then((res) => res.json())
      .then((data) => {
        const wbomCount = data.filter((item) => item.wbom === false).length;
        const fbomCount = data.filter((item) => item.wbom === true).length;
        setBomCounts({ wbom: wbomCount, fbom: fbomCount });
      })
      .catch((err) => console.error("BOM fetch error:", err));

    // Projects
    fetch(`${config.apiBaseURL}/project/`)
      .then((res) => res.json())
      .then((data) => setProjectCount(data.length))
      .catch((err) => console.error("Project fetch error:", err));

    // Inwards: count only those with mode_to_inventory = false
    fetch(`${config.apiBaseURL}/inward/`)
      .then((res) => res.json())
      .then((data) => {
        const pending = data.filter((item) => item.mode_to_inventory === true);
        setPendingInwardCount(pending.length);
      })
      .catch((err) => console.error("Inward fetch error:", err));

    // Outward: count only those with category = "Defects"
    
    fetch(`${config.apiBaseURL}/outward/defects/`)
      .then((res) => res.json())
      .then((data) => {
        // const defects = data.filter((item) => item.category === "Defects");
        setDefectOutwardCount(data.length);
      })
      .catch((err) => console.error("Outward fetch error:", err));
  }, []);

  const handleRequestComponentClick = () => {
    navigate("/components/addcomponents");
  };

  const tiles = [
    {
      label: "Components",
      path: "components",
      roles: [
        "Admin",
        "Sub-Admin",
        "Procurement",
        "Inventory",
        "Finance",
        "User",
      ],
      counts: {
        components: componentCount,
        requests: requestComponentCount,
      },
    },
    {
      label: "Inventory",
      path: "inventory",
      roles: ["Admin", "Sub-Admin", "Inventory", "Finance", "Procurement"],
      counts: {
        inventory: inventoryCount,
      },
    },
    {
      label: "Vendors",
      path: "vendor",
      roles: ["Admin", "Sub-Admin", "Procurement"],
      counts: {
        vendor: vendorCount,
      },
    },
    {
      label: "BOM",
      path: "bom",
      roles: [
        "Admin",
        "Sub-Admin",
        "Procurement",
        "Inventory",
        "Finance",
        "User",
      ],
      counts: {
        wbom: bomCounts.wbom,
        fbom: bomCounts.fbom,
      },
    },
    {
      label: "Projects",
      path: "projects",
      roles: [
        "Admin",
        "Sub-Admin",
        "Inventory",
        "User",
        "Procurement",
        "Finance",
      ],
      counts: {
        project: projectCount,
      },
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
      counts: { pendingInward: pendingInwardCount },
    },
    {
      label: "Outward",
      path: "outward",
      roles: ["Admin", "Sub-Admin", "Inventory"],
      counts: { defects: defectOutwardCount },
    },

    {
      label: "Roles",
      path: "roles",
      roles: ["Admin"],
    },
  ];

  const visibleTiles = tiles.filter((tile) =>
    tile.roles.includes(currentUserRole)
  );

  return (
    <div className="main-dashboard-container">
      {visibleTiles.map((tile, idx) => (
        <div
          key={idx}
          className="dashboard-tile-main"
          onClick={() => navigate(`/${tile.path}`)}
        >
          <div className="tile-content">
            <div className="tile-label">{tile.label}</div>

            {tile.counts && (
              <div className="tile-counts-grid">
                {tile.counts.components !== undefined && (
                  <div className="count-column">
                    <div className="count-number">{tile.counts.components}</div>
                    <div className="count-label">Total Components</div>
                  </div>
                )}

                {tile.counts.requests !== undefined && (
                  <div className="count-column">
                    <div className="count-number">{tile.counts.requests}</div>
                    <div
                      className="count-label"
                      onClick={handleRequestComponentClick}
                      style={{ textDecoration: "underline", cursor: "pointer" }}
                    >
                      Requests Component
                    </div>
                  </div>
                )}

                {tile.counts.inventory !== undefined && (
                  <div className="count-column">
                    <div className="count-number">{tile.counts.inventory}</div>
                    <div className="count-label">Total Inventory Stock</div>
                  </div>
                )}

                {tile.counts.vendor !== undefined && (
                  <div className="count-column">
                    <div className="count-number">{tile.counts.vendor}</div>
                    <div className="count-label">Total Vendor Stock</div>
                  </div>
                )}

                {tile.counts.wbom !== undefined && (
                  <div className="count-column">
                    <div className="count-number">{tile.counts.wbom}</div>
                    <div className="count-label">WBOM</div>
                  </div>
                )}

                {tile.counts.fbom !== undefined && (
                  <div className="count-column">
                    <div className="count-number">{tile.counts.fbom}</div>
                    <div className="count-label">FBOM</div>
                  </div>
                )}

                {tile.counts.project !== undefined && (
                  <div className="count-column">
                    <div className="count-number">{tile.counts.project}</div>
                    <div className="count-label">Total Projects</div>
                  </div>
                )}

                {tile.counts.pendingInward !== undefined && (
                  <div className="count-column">
                    <div className="count-number">
                      {tile.counts.pendingInward}
                    </div>
                    <div className="count-label">Pending Items</div>
                  </div>
                )}

                {tile.counts.defects !== undefined && (
                  <div className="count-column">
                    <div className="count-number">{tile.counts.defects}</div>
                    <div className="count-label">Defect Outwards</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MainDashboard;
