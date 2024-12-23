// Second set of code
// src\pages\Components.jsx

import React, { useState, useEffect } from "react";
import config from "../config"; // Import config for API endpoints

const Component = () => {
  const [components, setComponents] = useState([]);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    fetchComponents();
    //fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/tags_table/");
      const data = await response.json();
      setTags(data);
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  const fetchComponents = () => {
    fetch(`${config.apiBaseURL}${config.endpoints.component}`)
      .then((response) => response.json())
      .then((data) => setComponents(data))
      .catch((error) => console.error("Error fetching components:", error));
  };

  // Helper function to get tags for a component
  // const getTagsForComponent = (componentId) => {
  //   const componentTags = tags.filter(
  //     (tag) => tag.component_id === componentId
  //   );
  //   return componentTags.map((tag) => tag.tag_name); //
  // };

  return (
    <div>
      <h2>Component List</h2>
      <table>
        <thead>
          <tr>
            <th>Component Type</th>
            <th>Specification</th>
            <th>UOM</th>
            <th>Category</th>
            <th>Component ID</th>
            <th>Tags</th>
          </tr>
        </thead>
        <tbody>
          {components.map((component) => (
            <tr key={component.component_id}>
              <td>{component.component_type}</td>
              <td>{component.component_specification}</td>
              <td>{component.unit_of_measurement}</td>
              <td>{component.category}</td>
              <td>{component.component_id}</td>
              <td>
                {/* {getTagsForComponent(component.component_id).map(
                  (tag, index) => (
                    <span key={index} className="tag">
                      {tag}
                    </span>
                  )
                )} */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Component;
