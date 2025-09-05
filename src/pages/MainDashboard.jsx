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
  const [activeVendorCount, setActiveVendorCount] = useState(0);
  const [inactiveVendorCount, setInactiveVendorCount] = useState(0);
  const [bomCounts, setBomCounts] = useState({ wbom: 0, fbom: 0 });
  const [projectCount, setProjectCount] = useState(0);
  const [pendingInwardCount, setPendingInwardCount] = useState(0);
  const [defectOutwardCount, setDefectOutwardCount] = useState(0);
  const [requestListCount, setRequestListCount] = useState(0);
  const [poMasterCount, setPoMasterCount] = useState(0);

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
      .then((data) => {
        const role = localStorage.getItem("userRole");
        const loggedInEmail = localStorage.getItem("email")?.toLowerCase();
        const username = loggedInEmail?.split("@")[0];

        if (role === "Admin" || role === "Sub-Admin") {
          // Admin sees all requests
          setRequestComponentCount(data.length);
        } else if (role === "Inventory") {
          // Inventory → count only Pending requests
          const pending = data.filter((req) => req.status === "Pending");
          setRequestComponentCount(pending.length);
        } else if (role === "Procurement") {
          // Procurement → vendor_added = false
          const vendorActions = data.filter(
            (req) => req.status === "Added" && req.vendor_added === false
          );
          setRequestComponentCount(vendorActions.length);
        } else {
          // Normal User → only their requests
          const userRequests = data.filter(
            (req) =>
              req.name?.toLowerCase() === username ||
              req.name?.toLowerCase() === loggedInEmail
          );
          setRequestComponentCount(userRequests.length);
        }
      })
      .catch((err) => console.error("Request component fetch error:", err));

    // Inventory
    fetch(`${config.apiBaseURL}/inventory/`)
      .then((res) => res.json())
      .then((data) => setInventoryCount(data.length))
      .catch((err) => console.error("Inventory fetch error:", err));

    // Vendors
    // Vendors
    fetch(`${config.apiBaseURL}/vendor_list/`)
      .then((res) => res.json())
      .then((data) => {
        setVendorCount(data.length);

        const active = data.filter((v) => v.active === true).length;
        const inactive = data.filter((v) => v.active === false).length;

        setActiveVendorCount(active);
        setInactiveVendorCount(inactive);
      })
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

//Requests
fetch(`${config.apiBaseURL}/request_list/`)
  .then((res) => res.json())
  .then((data) => {
    const role = localStorage.getItem("userRole");
    const loggedInEmail = localStorage.getItem("email")?.toLowerCase();
    const username = loggedInEmail?.split("@")[0];

    if (role === "User") {
      // User → only their requests (match requester_name)
      const userRequests = data.filter(
        (req) =>
          req.requester_name?.toLowerCase() === username ||
          req.requester_name?.toLowerCase() === loggedInEmail
      );
      setRequestListCount(userRequests.length);
    } else {
      // Other roles → all requests
      setRequestListCount(data.length || 0);
    }
  })
  .catch((err) => console.error("request_list error:", err));



    //PO Master
    fetch(`${config.apiBaseURL}/po_master/`)
      .then((res) => res.json())
      .then((data) => setPoMasterCount(data.length || 0))
      .catch((err) => console.error("po_master error:", err));
  }, []);

  const handleRequestComponentClick = () => {
    navigate("/components/addcomponents/");
  };

  const handleActionComplete = () => {
    setRequestComponentCount((prev) => Math.max(prev - 1, 0));
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
        activeVendor: activeVendorCount,
        inactiveVendor: inactiveVendorCount,
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
      counts: {
        request: requestListCount,
      },
    },
    {
      label: "PO Orders",
      path: "po-list",
      roles: ["Admin", "Sub-Admin", "Procurement", "Finance"],
      counts: {
        pomaster: poMasterCount,
      },
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

    // {
    //   label: "Roles",
    //   path: "roles",
    //   roles: ["Admin"],
    // },
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
                      onClick={(e) => {
                        e.stopPropagation(); // prevent parent tile click
                        handleRequestComponentClick();
                      }}
                      style={{ textDecoration: "underline", cursor: "pointer" }}
                    >
                      {currentUserRole === "Admin" ||
                      currentUserRole === "Sub-Admin"
                        ? "Total Requests"
                        : currentUserRole === "Inventory"
                        ? "Pending Actions"
                        : currentUserRole === "Procurement"
                        ? "To Be Added to Vendor"
                        : "My Requests"}
                    </div>
                  </div>
                )}

                {tile.counts.inventory !== undefined && (
                  <div className="count-column">
                    <div className="count-number">{tile.counts.inventory}</div>
                    <div className="count-label">Total Inventory Stock</div>
                  </div>
                )}

                {/* {tile.counts.vendor !== undefined && (
  <div className="count-column">
    <div className="count-number">{tile.counts.vendor}</div>
    <div className="count-label">Total Vendors</div>
  </div>
)} */}

                {tile.counts.activeVendor !== undefined && (
                  <div className="count-column">
                    <div className="count-number">
                      {tile.counts.activeVendor}
                    </div>
                    <div className="count-label">Active Vendors</div>
                  </div>
                )}

                {tile.counts.inactiveVendor !== undefined && (
                  <div className="count-column">
                    <div className="count-number">
                      {tile.counts.inactiveVendor}
                    </div>
                    <div className="count-label">Inactive Vendors</div>
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

              {tile.counts.request !== undefined && (
  <div className="count-column">
    <div className="count-number">{tile.counts.request}</div>
    <div className="count-label">
      {currentUserRole === "User"
        ? "My Requests"
        : "Total Requests"}
    </div>
  </div>
)}


                {tile.counts.pomaster !== undefined && (
                  <div className="count-column">
                    <div className="count-number">{tile.counts.pomaster}</div>
                    <div className="count-label">Po Master Count</div>
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
