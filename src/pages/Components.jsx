// import React, { useState, useEffect } from "react";
// import config from "../config"; // Import config for API endpoints


// const Component = () => {
//   const [components, setComponents] = useState([]);
//   const [newComponentVisible, setNewComponentVisible] = useState(false);
//   const [newComponent, setNewComponent] = useState({
//     component_type: "",
//     component_specification: "",
//     unit_of_measurement: "",
//     category: "",
//   });
//   const [editComponentId, setEditComponentId] = useState(null);
//   const [editComponentData, setEditComponentData] = useState({});

//   useEffect(() => {
//     fetchComponents();
//   }, []);

//   const fetchComponents = () => {
//     fetch(`${config.apiBaseURL}${config.endpoints.component}`)
//       .then((response) => response.json())
//       .then((data) => setComponents(data))
//       .catch((error) => console.error("Error fetching components:", error));
//   };

//   const handleInputChange = (e) => {
//     setNewComponent({
//       ...newComponent,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleEditChange = (e) => {
//     setEditComponentData({
//       ...editComponentData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleAddComponent = () => {
//     fetch(`${config.apiBaseURL}${config.endpoints.component}`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(newComponent),
//     })
//       .then((response) => response.json())
//       .then(() => {
//         fetchComponents();
//         setNewComponentVisible(false);
//         setNewComponent({
//           component_type: "",
//           component_specification: "",
//           unit_of_measurement: "",
//           category: "",
//         });
//       })
//       .catch((error) => console.error("Error adding component:", error));
//   };

//   const handleEditComponent = (component) => {
//     setEditComponentId(component.component_id);
//     setEditComponentData(component);
//   };

//   const handleSaveEdit = (component_id) => {
//     fetch(`${config.apiBaseURL}${config.endpoints.componentDetail(component_id)}`, {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(editComponentData),
//     })
//       .then((response) => response.json())
//       .then(() => {
//         fetchComponents();
//         setEditComponentId(null);
//       })
//       .catch((error) => console.error("Error updating component:", error));
//   };

//   const handleCancelEdit = () => {
//     setEditComponentId(null);
//     setEditComponentData({});
//   };

//   const handleDeleteComponent = (component_id) => {
//     fetch(`${config.apiBaseURL}${config.endpoints.componentDetail(component_id)}`, {
//       method: "DELETE",
//     })
//       .then((response) => {
//         if (response.ok) {
//           fetchComponents();
//         }
//       })
//       .catch((error) => console.error("Error deleting component:", error));
//   };

//   return (
//     <div>
//       <h2>Component List</h2>
//       <table>
//         <thead>
//           <tr>
//             <th>Component Type</th>
//             <th>Specification</th>
//             <th>UOM</th>
//             <th>Category</th>
//             <th>Component ID</th>
//             <th>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {components.map((component) => (
//             <tr key={component.component_id}>
//               {editComponentId === component.component_id ? (
//                 <>
//                   <td>
//                     <input
//                       name="component_type"
//                       value={editComponentData.component_type}
//                       onChange={handleEditChange}
//                     />
//                   </td>
//                   <td>
//                     <input
//                       name="component_specification"
//                       value={editComponentData.component_specification}
//                       onChange={handleEditChange}
//                     />
//                   </td>
//                   <td>
//                     <input
//                       name="unit_of_measurement"
//                       value={editComponentData.unit_of_measurement}
//                       onChange={handleEditChange}
//                     />
//                   </td>
//                   <td>
//                     <input
//                       name="category"
//                       value={editComponentData.category}
//                       onChange={handleEditChange}
//                     />
//                   </td>
//                   <td>{component.component_id}</td>
//                   <td>
//                     <button onClick={() => handleSaveEdit(component.component_id)}>Save</button>
//                     <button onClick={handleCancelEdit}>Cancel</button>
//                   </td>
//                 </>
//               ) : (
//                 <>
//                   <td>{component.component_type}</td>
//                   <td>{component.component_specification}</td>
//                   <td>{component.unit_of_measurement}</td>
//                   <td>{component.category}</td>
//                   <td>{component.component_id}</td>
//                   <td>
//                     <button onClick={() => handleEditComponent(component)}>Edit</button>
//                     <button onClick={() => handleDeleteComponent(component.component_id)}>Delete</button>
//                   </td>
//                 </>
//               )}
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {!newComponentVisible && (
//         <button onClick={() => setNewComponentVisible(true)}>Add Component</button>
//       )}

//       {newComponentVisible && (
//         <div>
//           <h3>Add New Component</h3>
//           <input
//             name="component_type"
//             placeholder="Component Type"
//             value={newComponent.component_type}
//             onChange={handleInputChange}
//           />
//           <input
//             name="component_specification"
//             placeholder="Specification"
//             value={newComponent.component_specification}
//             onChange={handleInputChange}
//           />
//           <input
//             name="unit_of_measurement"
//             placeholder="Unit of Measurement"
//             value={newComponent.unit_of_measurement}
//             onChange={handleInputChange}
//           />
//           <input
//             name="category"
//             placeholder="Category"
//             value={newComponent.category}
//             onChange={handleInputChange}
//           />
//           <button onClick={handleAddComponent}>Save Component</button>
//           <button onClick={() => setNewComponentVisible(false)}>Cancel</button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Component;


import React, { useState, useEffect } from "react";
import config from "../config"; // Import config for API endpoints

const Component = () => {
  const [components, setComponents] = useState([]);

  useEffect(() => {
    fetchComponents();
  }, []);

  const fetchComponents = () => {
    fetch(`${config.apiBaseURL}${config.endpoints.component}`)
      .then((response) => response.json())
      .then((data) => setComponents(data))
      .catch((error) => console.error("Error fetching components:", error));
  };

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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Component;
