import { useState, useEffect } from "react";
import { FaDownload } from "react-icons/fa";

export default function ReportsManagement() {
  const [activeTab, setActiveTab] = useState("inspection");
  const [teamLeaderReports, setTeamLeaderReports] = useState([]);
  const [submittedInspectionReports, setSubmittedInspectionReports] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch submitted inspection reports from API
  useEffect(() => {
    const fetchSubmittedInspectionReports = async () => {
      if (activeTab !== "inspection") return;
      
      setLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/project/submitted-inspection-reports', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        
        if (response.ok) {
          const reports = await response.json();
          setSubmittedInspectionReports(reports);
        } else {
          console.error('Failed to fetch submitted inspection reports');
          setSubmittedInspectionReports([]);
        }
      } catch (error) {
        console.error('Error fetching submitted inspection reports:', error);
        setSubmittedInspectionReports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmittedInspectionReports();
  }, [activeTab]);

  // Fetch team leader reports from API
  useEffect(() => {
    const fetchTeamLeaderReports = async () => {
      if (activeTab !== "teamLeader") return;
      
      setLoading(true);
      try {
        // Get all projects first
        const projectsRes = await fetch('/api/projects');
        const projects = await projectsRes.json();
        
        // Get reports for all projects
        const allReports = [];
        for (const project of projects) {
          try {
            const reportsRes = await fetch(`/api/reports/project/${project._id}`);
            if (reportsRes.ok) {
              const reports = await reportsRes.json();
              const reportsWithProject = reports.map(report => ({
                ...report,
                projectName: project.projectName || project.name
              }));
              allReports.push(...reportsWithProject);
            }
          } catch (error) {
            console.warn(`Failed to fetch reports for project ${project._id}:`, error);
          }
        }
        
        // Sort by creation date (newest first)
        allReports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setTeamLeaderReports(allReports);
      } catch (error) {
        console.error('Error fetching team leader reports:', error);
        setTeamLeaderReports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamLeaderReports();
  }, [activeTab]);

  return (
    <div className="bg-cream-primary min-h-screen p-8">
      <h2 className="text-2xl font-bold text-brown-primary mb-6">
        Reports Management
      </h2>

      {/* Toggle Tabs */}
      <div className="flex space-x-4 mb-6">
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "inspection"
              ? "bg-brown-primary text-white"
              : "bg-cream-light text-brown-primary"
          }`}
          onClick={() => setActiveTab("inspection")}
        >
          Inspection Reports
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "teamLeader"
              ? "bg-brown-primary text-white"
              : "bg-cream-light text-brown-primary"
          }`}
          onClick={() => setActiveTab("teamLeader")}
        >
          Team Leader Reports
        </button>
      </div>

      {/* Report Lists */}
  <div className="bg-cream-light shadow-md rounded-lg p-6">
        {activeTab === "inspection" && (
          <div>
            <h3 className="text-lg font-semibold text-brown-primary mb-4">
              Inspection Reports
            </h3>
            {loading ? (
              <div className="text-brown-primary p-4">Loading inspection reports...</div>
            ) : (
              <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brown-primary text-white">
                  <th className="p-3">Title</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Client</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Download</th>
                </tr>
              </thead>
              <tbody>
                {/* Submitted inspection reports */}
                {submittedInspectionReports.map((report, i) => (
                  <tr key={`submitted-${report._id || i}`} className="border-b">
                    <td className="p-3">{report.title}</td>
                    <td className="p-3">{report.date}</td>
                    <td className="p-3">{report.location}</td>
                    <td className="p-3">{report.client}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 text-xs rounded ${
                        report.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {report.status || 'Completed'}
                      </span>
                    </td>
                    <td className="p-3">
                      {report.fileUrl ? (
                        <a
                          href={report.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1 text-green-primary hover:underline"
                        >
                          <FaDownload size={18} /> <span>View PDF</span>
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">Processing...</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </div>
        )}

        {activeTab === "teamLeader" && (
          <div>
            <h3 className="text-lg font-semibold text-brown-primary mb-4">
              Team Leader Reports
            </h3>
            {loading ? (
              <div className="text-brown-primary p-4">Loading reports...</div>
            ) : (
                <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-brown-primary text-white">
                    <th className="p-3">Report Type</th>
                    <th className="p-3">Project</th>
                    <th className="p-3">Period</th>
                    <th className="p-3">Created Date</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Download</th>
                  </tr>
                </thead>
                <tbody>
                  {teamLeaderReports.length > 0 ? (
                    teamLeaderReports.map((report, i) => (
                      <tr key={report._id || i} className="border-b">
                        <td className="p-3">{report.reportType}</td>
                        <td className="p-3">{report.projectName}</td>
                        <td className="p-3">
                          {report.dateStart && report.dateEnd 
                            ? `${report.dateStart} to ${report.dateEnd}` 
                            : 'N/A'
                          }
                        </td>
                        <td className="p-3">{new Date(report.createdAt).toLocaleDateString()}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 text-xs rounded ${
                            report.status === 'completed' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {report.status}
                          </span>
                        </td>
                        <td className="p-3">
                          {report.filePath && report.status === 'completed' ? (
                            <a
                              href={`http://localhost:4000${report.filePath}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-1 text-green-primary hover:underline"
                            >
                              <FaDownload size={18} /> <span>Download</span>
                            </a>
                          ) : (
                            <span className="text-gray-400">Not available</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="p-4 text-center text-gray-500">
                        No team leader reports found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
