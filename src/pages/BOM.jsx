// src/pages/BOM.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import config from "../Config"; // Import config for API endpoints

const BOM = () => {
  const [boms, setBoms] = useState([]); // List of all BOMs
  const [bomQuantities, setBomQuantities] = useState({});
  const navigate = useNavigate(); // Initialize useNavigate

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

  return (
    <div>
      <h2>BOM List</h2>
      <table>
        <thead>
          <tr>
            <th>BOM ID</th>
            <th>BOM Name</th>
            <th>Number of Components</th>
            <th>Created By</th>
            <th>Created Date</th>
            <th>Last Modified By</th>
            <th>Last Modified Date</th>
          </tr>
        </thead>
        <tbody>
          {boms.map((bom) => (
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BOM;
