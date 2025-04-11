// src/pages/BOM.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import config from "../Config"; // Import config for API endpoints
import { sortData, toggleSortDirection, renderSortArrow } from "../Sort";

const BOM = () => {
  const [boms, setBoms] = useState([]); // List of all BOMs
  const [bomQuantities, setBomQuantities] = useState({});
  const navigate = useNavigate(); // Initialize useNavigate
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
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

  return (
    <div>
      <h2>BOM List</h2>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BOM;
