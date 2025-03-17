// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import config from "../Config"; // Ensure this file exists
// import {
//   showSuccessToast,
//   showErrorToast,
//   showWarningToast,
// } from "./Toastify.jsx"; // Import Toastify utilities

// const Mrf = () => {
//   const navigate = useNavigate();
//   const [requestData, setRequestData] = useState([]);
//   const [data, setData] = useState({});

//   useEffect(() => {
//     fetchRequestData();
//   }, []);

//   const fetchRequestData = async () => {
//     try {
//       const response = await fetch(`${config.apiBaseURL}/create_MRF/`);
//       const data = await response.json();
//       setRequestData(data);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//   };

//   return (
//     <div>
//       <h2>Material requests</h2>

//       {Object.keys(requestData).map((requestId) => (
//         <div key={requestId}>
//           <h3>Request ID - {requestId}</h3>
//           <table border="1" width="100%">
//             <thead>
//               <tr style={{ backgroundColor: "orange", color: "white" }}>
//                 <th>Component Type</th>
//                 <th>Specification</th>
//                 <th>Unit of Measurement</th>
//                 <th>Category</th>
//                 <th>Vendor Name</th>
//                 <th>Serial Number</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {requestData[requestId].length === 0 ? (
//                 <tr>
//                   <td colSpan="7">No reserved products available.</td>
//                 </tr>
//               ) : (
//                 requestData[requestId].map((item) => (
//                   <tr key={item.serial_number}>
//                     <td>{item.component_type}</td>
//                     <td>{item.specification}</td>
//                     <td>{item.UOM}</td>
//                     <td>{item.category}</td>
//                     <td>{item.vendor_name}</td>
//                     <td>{item.serial_number}</td>
//                     <td>
//                       <button>Action</button>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default Mrf;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import config from "../Config";

const Mrf = () => {
  const navigate = useNavigate();
  const [mrfData, setMrfData] = useState([]);
  const [projectDetails, setProjectDetails] = useState([]);
  const [projectName, setProjectName] = useState("");

  useEffect(() => {
    fetchMRFs();
    fetchProjectDetails();
  }, []);

  const fetchMRFs = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/create_MRF/`);
      const data = await response.json();
      setMrfData(data);
    } catch (err) {
      console.error("Error fetching MRFs:", err);
    }
  };

  const fetchProjectDetails = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/request_inventory/`);
      const data = await response.json();
      setProjectDetails(data);
    } catch (err) {
      console.error("Error fetching project details: ", err);
    }
  };

  // Helper function to get Project Name by Request ID
  const getProjectName = (requestId) => {
    const project = projectDetails.find(
      (proj) => proj.request_id === requestId
    );
    return project ? project.project_details.project_name : "N/A";
  };

  return (
    <div>
      <h2>Material Requests (MRF)</h2>
      <button
        onClick={() => navigate("/MRFCreate")}
        style={{
          padding: "10px 15px",
          backgroundColor: "orange",
          color: "white",
          border: "none",
          cursor: "pointer",
          marginBottom: "20px",
        }}
      >
        Create Material Request Form
      </button>
      <table>
        <thead>
          <tr>
            <th>MRF ID</th>
            <th>Name</th>
            <th>Create Date</th>
            <th>Request ID</th>
            <th>Project name</th>
            <th>Approval</th>
          </tr>
        </thead>
        <tbody>
          {mrfData.map((item) => (
            <tr key={item.MRF_id}>
              <td
                onClick={() => navigate(`/MrfRequest/${item.MRF_id}`)}
                style={{
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                {item.MRF_id}
              </td>
              <td>{item.name}</td>
              <td>{item.create_date}</td>
              <td>{item.Request_id_assign}</td>
              <td>{getProjectName(item.Request_id_assign)}</td>
              <td>{item.approval ? "Approved" : "Pending"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Mrf;
