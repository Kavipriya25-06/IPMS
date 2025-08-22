import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import config from "../Config"; // Import config for API endpoints
import { sortData, toggleSortDirection, renderSortArrow } from "../Sort";
import AddIcon from "../assets/Add.png";
import Delete from "../assets/Delete.png";
import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  showMessageToast,
  ToastContainerComponent,
} from "./Toastify.jsx";
import { format, parseISO } from "date-fns";

const BOM = () => {
  const [boms, setBoms] = useState([]); // List of all BOMs
  const [bomQuantities, setBomQuantities] = useState({});
  const navigate = useNavigate(); // Initialize useNavigate
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [loading, setLoading] = useState(true);

  const handleToggleWbom = async (bom) => {
    if (bom.wbom) {
      showErrorToast(
        "This is already marked as Final BOM and cannot be changed."
      );
      return;
    }

    showMessageToast({
      message: "Are you sure you want to mark this as Final BOM?",
      onConfirm: async () => {
        try {
          const response = await fetch(
            `${config.apiBaseURL}/bom_list/${bom.bom_id}/`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ wbom: true }),
            }
          );

          if (response.ok) {
            setBoms((prev) =>
              prev.map((b) =>
                b.bom_id === bom.bom_id ? { ...b, wbom: true } : b
              )
            );
            showSuccessToast("Marked as Final BOM.");
          } else {
            const error = await response.json();
            showErrorToast("Error marking Final BOM: " + JSON.stringify(error));
          }
        } catch (error) {
          console.error("Error:", error);
          showErrorToast("Failed to update Final BOM.");
        }
      },
      onCancel: () => {
        showWarningToast("Action cancelled.");
      },
    });
  };

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    bom_name: "",
    created_by: "",
    last_modified_by: "",
    number_of_components: 0,
  });
  const [showScrollTop, setShowScrollTop] = useState(false); // Track visibility of scroll-to-top button

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Start loading

      try {
        // Fetch BOM list from the API

        const bomRes = await fetch(`${config.apiBaseURL}/bom_list/`);
        const bomData = await bomRes.json();
        setBoms(bomData);

        await fetchBomQuantities(); // Assuming this is also async
      } catch (error) {
        console.error("Error fetching BOMs or quantities:", error);
      } finally {
        setLoading(false); // Stop loading after both calls
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Smooth scroll effect
    });
  };

  // Function to fetch the quantity of components for each BOM
  const fetchBomQuantities = () => {
    fetch(`${config.apiBaseURL}/bom_master/`)
      .then((response) => response.json())
      .then((data) => {
        const quantities = {};
        data.forEach((component) => {
          if (!quantities[component.bom]) {
            quantities[component.bom] = 0;
          }
          quantities[component.bom] += component.quantity;
        });
        setBomQuantities(quantities);
      })
      .catch((error) => console.error("Error fetching BOM quantities:", error));
  };

  // Function to handle a click on a BOM ID
  const handleBomClick = (bomId, isWbom) => {
    navigate(`/bom/${bomId}?readonly=${isWbom}`); // Navigate to BOM details page for the selected BOM
  };

  const handleSort = (key) => {
    setSortConfig((prev) => toggleSortDirection(prev, key));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // If 'created_by' is updated, also set 'last_modified_by'
    if (name === "created_by") {
      setFormData((prev) => ({
        ...prev,
        created_by: value,
        last_modified_by: value,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  //Submit form
  const handleSubmit = async () => {
    const payload = {
      ...formData,
      wbom: false,
      number_of_components: 0,
    };
    try {
      const response = await fetch(`${config.apiBaseURL}/bom_list/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        showSuccessToast("BOM created successfully!");
        setShowForm(false);
        setFormData({ bom_name: "", created_by: "", last_modified_by: "" });

        const refreshed = await fetch(`${config.apiBaseURL}/bom_list/`);
        setBoms(await refreshed.json());
      } else {
        const error = await response.json();
        showErrorToast("Error: " + JSON.stringify(error));
      }
    } catch (error) {
      console.error("Error submitting BOM:", error);
    }
  };

  const handleDelete = (bomId) => {
    showMessageToast({
      message: (
        <>
          Are you sure you want to delete <strong>BOM ID: {bomId}</strong>?
        </>
      ),
      onConfirm: async () => {
        try {
          const response = await fetch(
            `${config.apiBaseURL}/bom_list/${bomId}/`,
            {
              method: "DELETE",
            }
          );

          if (response.ok) {
            showSuccessToast("BOM deleted successfully!");
            const refreshed = await fetch(`${config.apiBaseURL}/bom_list/`);
            setBoms(await refreshed.json());
          } else {
            const error = await response.json();
            showErrorToast("Error deleting BOM: " + JSON.stringify(error));
          }
        } catch (error) {
          console.error("Error deleting BOM:", error);
          showErrorToast("Failed to delete BOM.");
        }
      },
      onCancel: () => {
        showWarningToast("Deletion cancelled.");
      },
    });
  };

  const toggleWbom = async (bom) => {
    const updatedWbom = !bom.wbom;

    try {
      const response = await fetch(
        `${config.apiBaseURL}/bom_list/${bom.bom_id}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wbom: updatedWbom }),
        }
      );

      if (response.ok) {
        // Update local state
        setBoms((prevBoms) =>
          prevBoms.map((b) =>
            b.bom_id === bom.bom_id ? { ...b, wbom: updatedWbom } : b
          )
        );
      } else {
        const error = await response.json();
        showErrorToast("Error updating WBOM: " + JSON.stringify(error));
      }
    } catch (error) {
      console.error("Error updating WBOM:", error);
    }
  };

  return (
    <div>
      <div
        className="header"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h2>BOM List</h2>
        <button
          style={{
            cursor: "pointer",
            marginLeft: "auto",
            marginRight: 20,
            background: "transparent",
            border: "none",
          }}
          title="Add BOM"
          onClick={() => setShowForm(!showForm)}
        >
          <img
            src={AddIcon}
            alt=""
            style={{ width: "20px", height: "20px", marginBottom: "5px" }}
          />
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-contents">
            <h3>Add BOM</h3>
            <div className="form-grid">
              <label htmlFor="">BOM Name</label>
              <input
                type="text"
                name="bom_name"
                placeholder="BOM Name"
                value={formData.bom_name}
                onChange={handleInputChange}
                required
              />
              <label htmlFor="">Created by</label>

              <input
                type="text"
                name="created_by"
                placeholder="Created By"
                value={formData.created_by}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="modal-actions">
              <button onClick={handleSubmit}>Submit</button>
              <button onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="table-container" style={{ marginTop: "-15px" }}>
        <table>
          <thead>
            <tr>
              <th
                onClick={() => handleSort("bom_id")}
                style={{ textDecoration: "underline", cursor: "pointer" }}
              >
                BOM ID {renderSortArrow(sortConfig, "bom_id")}
              </th>
              <th
                onClick={() => handleSort("bom_name")}
                style={{ textDecoration: "underline", cursor: "pointer" }}
              >
                BOM Name {renderSortArrow(sortConfig, "bom_name")}
              </th>
              <th
                onClick={() => handleSort("quantity")}
                style={{ textDecoration: "underline", cursor: "pointer" }}
              >
                Number of Components {renderSortArrow(sortConfig, "quantity")}
              </th>
              <th>Created By </th>
              <th
                onClick={() => handleSort("created_date")}
                style={{ textDecoration: "underline", cursor: "pointer" }}
              >
                Created Date {renderSortArrow(sortConfig, "created_date")}
              </th>
              <th>Last Modified By </th>
              <th
                onClick={() => handleSort("last_modified_date")}
                style={{ textDecoration: "underline", cursor: "pointer" }}
              >
                Last Modified Date{" "}
                {renderSortArrow(sortConfig, "last_modified_date")}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="8"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  <div className="spinner"></div>
                  Loading BOM...
                </td>
              </tr>
            ) : boms.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  style={{ textAlign: "center", padding: "15px", color:"gray" }}
                >
                  No BOM available
                </td>
              </tr>
            ) : (
              sortData(boms, sortConfig, (item, key) => {
                if (key === "quantity") return bomQuantities[item.bom_id] || 0;
                if (key === "created_date" || key === "last_modified_date")
                  return new Date(item[key]);
                return item[key];
              }).map((bom) => (
                <tr key={bom.bom_id}>
                  <td
                    onClick={() => handleBomClick(bom.bom_id, bom.wbom)}
                    style={{
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                  >
                    {bom.bom_id}
                  </td>
                  <td>{bom.bom_name}</td>
                  <td>{bomQuantities[bom.bom_id] || 0}</td>
                  <td>{bom.created_by}</td>
                  <td>
                    {bom.created_date
                      ? format(parseISO(bom.created_date), "dd-MM-yyyy")
                      : "-"}
                  </td>
                  <td>{bom.last_modified_by}</td>
                  <td>
                    {bom.last_modified_date
                      ? format(parseISO(bom.last_modified_date), "dd-MM-yyyy")
                      : "-"}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleToggleWbom(bom)}
                        style={{
                          backgroundColor: bom.wbom ? "#4CAF50" : "#f58720",
                          color: "white",
                          borderRadius: "5px",
                          border: "none",
                          cursor: "pointer",
                        }}
                        title={
                          bom.wbom ? "Maeked as Final BOM" : "Mark as Final BOM"
                        }
                      >
                        {bom.wbom ? "FBOM" : "WBOM"}
                      </button>
                      <button
                        onClick={() => handleDelete(bom.bom_id)}
                        className="delete-button"
                        title="Delete"
                      >
                        {/* <img
                      src={Delete}
                      alt="Delete"
                      style={{ width: "20px", height: "20px" }}
                    /> */}
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {showScrollTop && (
        <button
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            padding: "10px 15px",
            fontSize: "18px",
            backgroundColor: "#f57c00",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            zIndex: 1000,
          }}
          onClick={scrollToTop}
        >
          ↑
        </button>
      )}
      <ToastContainerComponent position="top-right" autoClose={3000} />
    </div>
  );
};

export default BOM;
