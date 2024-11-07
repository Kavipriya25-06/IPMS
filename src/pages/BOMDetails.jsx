// src/pages/BOMDetails.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const BOMDetails = () => {
  const { bomId } = useParams(); // Retrieve bomId from URL
  const navigate = useNavigate(); // Initialize useNavigate
  const [selectedBom, setSelectedBom] = useState(null);
  const [selectedComponents, setSelectedComponents] = useState([]);

  useEffect(() => {
    const fetchBomDetails = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/bom_list/");
        const data = await response.json();
        const bom = data.find((b) => b.bom_id === bomId);
        setSelectedBom(bom);
      } catch (error) {
        console.error("Error fetching BOM details:", error);
      }
    };

    const fetchBomComponents = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/bom_master/");
        const data = await response.json();
        const bomComponents = data.filter((b) => b.bom === bomId);
        setSelectedComponents(bomComponents);
      } catch (error) {
        console.error("Error fetching BOM components:", error);
      }
    };

    fetchBomDetails();
    fetchBomComponents();
  }, [bomId]);

  return (
    <div>
      {selectedBom && (
        <>
          <h3>Selected BOM: {selectedBom.bom_name}</h3>
          <p><strong>BOM ID:</strong> {selectedBom.bom_id}</p>
          <h4>Components:</h4>
          <table>
            <thead>
              <tr>
                <th>Component Type</th>
                <th>Specification</th>
                <th>UOM</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Vendor</th>
              </tr>
            </thead>
            <tbody>
              {selectedComponents.map((component, index) => (
                <tr key={index}>
                  <td>{component.component.component_type}</td>
                  <td>{component.component.component_specification}</td>
                  <td>{component.component.unit_of_measurement}</td>
                  <td>{component.component.category}</td>
                  <td>{component.quantity}</td>
                  <td>{component.vendor.vendor_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      <button onClick={() => navigate("/bom")}>Back to BOM List</button>
    </div>
  );
};

export default BOMDetails;
