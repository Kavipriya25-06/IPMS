import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import config from "../Config"; // API Configuration

const ProjectMaster = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [projectDetails, setProjectDetails] = useState(null);

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  const fetchProjectDetails = async () => {
    try {
      const response = await fetch(
        `${config.apiBaseURL}/projects_details/${projectId}/`
      );
      if (response.ok) {
        const data = await response.json();

        const formattedDetails = {
          project_id: data.project?.project_id || "N/A",
          project_name: data.project?.project_name || "N/A",
          request_id:
            data.request_lists?.length > 0
              ? data.request_lists[0].request_id
              : "N/A",
          requester_name:
            data.request_lists?.length > 0
              ? data.request_lists[0].requester_name
              : "N/A",
          bom_id: data.bom_lists?.length > 0 ? data.bom_lists[0].bom_id : "N/A",
          bom_name:
            data.bom_lists?.length > 0 ? data.bom_lists[0].bom_name : "N/A",
          PO_id: data.po_master?.length > 0 ? data.po_master[0].PO_id : "N/A",
          //   cart_id: data.po_master?.length > 0 ? data.po_master[0].cart_id : "N/A",
        };

        setProjectDetails(formattedDetails);
      } else {
        console.error("Failed to fetch project details.");
      }
    } catch (error) {
      console.error("Error fetching project details:", error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
<button onClick={() => navigate(-1)} className="back-button">
  Back to Project List
</button>
      <h2>Project Master Details</h2>
      {projectDetails ? (
        <table>
          <tbody>
            {Object.entries(projectDetails).map(([key, value]) => (
              <tr key={key}>
                <td>{key.replace("_", " ").toUpperCase()}:</td>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Loading project details...</p>
      )}
    </div>
  );
};

export default ProjectMaster;
