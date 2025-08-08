import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import config from "../Config"; // API Configuration

const ProjectMaster = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [projectDetails, setProjectDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noData, setNoData] = useState(false);

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  const fetchProjectDetails = async () => {
    setLoading(true);
    setNoData(false);

    try {
      const response = await fetch(
        `${config.apiBaseURL}/projects_details/${projectId}/`
      );
      if (response.ok) {
        const data = await response.json();

        if (!data || Object.keys(data).length === 0) {
          setNoData(true);
        } else {
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
            bom_id: data.bom_lists?.length > 0
              ? data.bom_lists[0].bom_id
              : "N/A",
            bom_name: data.bom_lists?.length > 0
              ? data.bom_lists[0].bom_name
              : "N/A",
            PO_id: data.po_master?.length > 0
              ? data.po_master[0].PO_id
              : "N/A",
          };

          setProjectDetails(formattedDetails);
        }
      } else {
        console.error("Failed to fetch project details.");
        setNoData(true);
      }
    } catch (error) {
      console.error("Error fetching project details:", error);
      setNoData(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <button onClick={() => navigate(-1)} className="back-button">
        Back to Project List
      </button>
      <h2>Project Master Details</h2>

      {loading ? (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <div className="spinner"></div>
          Loading project details...
        </div>
      ) : noData ? (
        <p style={{ textAlign: "center", padding: "20px", color: "gray" }}>
          No project data available.
        </p>
      ) : (
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
      )}
    </div>
  );
};

export default ProjectMaster;
