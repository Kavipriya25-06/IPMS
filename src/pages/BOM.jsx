// src/pages/BOM.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import config from "../Config"; // Import config for API endpoints
import {
  sortData,
  toggleSortDirection,
  renderSortArrow
} from "../Sort"; 
import AddIcon from "../assets/Add.png";
import Delete from "../assets/Delete.png";


const BOM = () => {
  const [boms, setBoms] = useState([]); // List of all BOMs
  const [bomQuantities, setBomQuantities] = useState({});
  const navigate = useNavigate(); // Initialize useNavigate
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" });

  const [showForm, setShowForm] = useState(false); 
  const [formData, setFormData] = useState({ 
    bom_name: "",
    created_by: "",
    last_modified_by: "",
    number_of_components:0
  });

  useEffect(() => {
    // Fetch BOM list from the API
    fetch(`${config.apiBaseURL}/bom_list/`)
      .then((response) => response.json())
      .then((data) => setBoms(data))
      .catch((error) => console.error("Error fetching BOMs:", error));

    fetchBomQuantities();
  }, []);

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
  const handleBomClick = (bomId) => {
    navigate(`/bom/${bomId}`); // Navigate to BOM details page for the selected BOM
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
      try {
        const response = await fetch(`${config.apiBaseURL}/bom_list/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
  
        if (response.ok) {
          alert("BOM created successfully!");
          setShowForm(false);
          setFormData({ bom_name: "", created_by: "", last_modified_by: "" });
  
          const refreshed = await fetch(`${config.apiBaseURL}/bom_list/`);
          setBoms(await refreshed.json());
        } else {
          const error = await response.json();
          alert("Error: " + JSON.stringify(error));
        }
      } catch (error) {
        console.error("Error submitting BOM:", error);
      }
    };

    const handleDelete = async (bomId) => {
      if (window.confirm(`Are you sure you want to delete BOM ID: ${bomId}?`)) {
        try {
          const response = await fetch(`${config.apiBaseURL}/bom_list/${bomId}/`, {
            method: "DELETE",
          });
    
          if (response.ok) {
            alert("BOM deleted successfully!");
            // Refresh list after deletion
            const refreshed = await fetch(`${config.apiBaseURL}/bom_list/`);
            setBoms(await refreshed.json());
          } else {
            const error = await response.json();
            alert("Error deleting BOM: " + JSON.stringify(error));
          }
        } catch (error) {
          console.error("Error deleting BOM:", error);
        }
      }
    };
  

  return (
    <div>
      <h2>BOM List</h2>

      <button style={{marginTop: "10px",background: "transparent",border: "none",cursor: "pointer"}}
                title="AddBOM"   onClick={() => setShowForm(!showForm)}>
                  <img src={AddIcon} alt="" style={{width:"20px",height:"20px"}}/>
                </button>

                {showForm && (
        <div style={{ marginBottom: "20px", marginTop: "10px" }}>
          <input
            type="text"
            name="bom_name"
            placeholder="BOM Name"
            value={formData.bom_name}
            onChange={handleInputChange}
            style={{ marginRight: "10px" }}
            required
          />
          <input
            type="text"
            name="created_by"
            placeholder="Created By"
            value={formData.created_by}
            onChange={handleInputChange}
            style={{ marginRight: "10px" }}
            required
          />
          <button onClick={handleSubmit}>Submit</button>
        </div>
      )}

      <table>
        <thead>
          <tr>
           <th onClick={() => handleSort("bom_id")} style={{ textDecoration: "underline", cursor: "pointer" }}>BOM ID {renderSortArrow(sortConfig, "bom_id")}</th>
          <th onClick={() => handleSort("bom_name")} style={{ textDecoration: "underline", cursor: "pointer" }}>BOM Name {renderSortArrow(sortConfig, "bom_name")}</th>
          <th onClick={() => handleSort("quantity")} style={{ textDecoration: "underline", cursor: "pointer" }}>Number of Components {renderSortArrow(sortConfig, "quantity")}</th>
          <th>Created By </th>
          <th onClick={() => handleSort("created_date")} style={{ textDecoration: "underline", cursor: "pointer" }}>Created Date {renderSortArrow(sortConfig, "created_date")}</th>
          <th>Last Modified By </th>
          <th onClick={() => handleSort("last_modified_date")} style={{ textDecoration: "underline", cursor: "pointer" }}>Last Modified Date {renderSortArrow(sortConfig,"last_modified_date")}</th>
          <th>Actions</th>
          </tr>
        </thead>
        <tbody>
        {sortData(boms, sortConfig, (item, key) => {
            if (key === "quantity") return bomQuantities[item.bom_id] || 0;
            if (key === "created_date" || key === "last_modified_date")
              return new Date(item[key]);
            return item[key];
          }).map((bom) => (
            <tr key={bom.bom_id}>
              <td
                onClick={() => handleBomClick(bom.bom_id)}
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
              <td>{bom.created_date}</td>
              <td>{bom.last_modified_by}</td>
              <td>{bom.last_modified_date}</td>
              <td>
  <button
    onClick={() => handleDelete(bom.bom_id)}
    style={{
      background: "transparent",
      border: "none",
      cursor: "pointer",
      padding: "4px",
    }}
    title="Delete"
  >
    <img
      src={Delete}
      alt="Delete"
      style={{ width: "20px", height: "20px" }}
    />
  </button>
</td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BOM;
