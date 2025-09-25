import { useState } from "react";
import { FaDownload } from "react-icons/fa";

export default function ReportsManagement() {
  const [activeTab, setActiveTab] = useState("inspection");

  const inspectionReports = [
    {
      title: "Initial Site Inspection",
      date: "2025-09-10",
      location: "Colombo",
      client: "John Smith",
      fileUrl: "/reports/inspection1.pdf",
    },
    {
      title: "Safety Compliance Check",
      date: "2025-09-15",
      location: "Kandy",
      client: "Sarah Lee",
      fileUrl: "/reports/inspection2.pdf",
    },
  ];

  const teamLeaderReports = [
    {
      title: "Phase 1 Completion",
      project: "Luxury Apartment Interior",
      leader: "Alice Johnson",
      date: "2025-09-05",
      fileUrl: "/reports/teamleader1.pdf",
    },
    {
      title: "Material Procurement Status",
      project: "Office Renovation",
      leader: "David Brown",
      date: "2025-09-12",
      fileUrl: "/reports/teamleader2.pdf",
    },
  ];

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
      <div className="bg-white shadow-md rounded-lg p-6">
        {activeTab === "inspection" && (
          <div>
            <h3 className="text-lg font-semibold text-brown-primary mb-4">
              Inspection Reports
            </h3>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-cream-light text-brown-primary">
                  <th className="p-3">Title</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Client</th>
                  <th className="p-3">Download</th>
                </tr>
              </thead>
              <tbody>
                {inspectionReports.map((report, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-3">{report.title}</td>
                    <td className="p-3">{report.date}</td>
                    <td className="p-3">{report.location}</td>
                    <td className="p-3">{report.client}</td>
                    <td className="p-3">
                      <a
                        href={report.fileUrl}
                        download
                        className="flex items-center space-x-1 text-green-primary hover:underline"
                      >
                        <FaDownload size={18} /> <span>Download</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "teamLeader" && (
          <div>
            <h3 className="text-lg font-semibold text-brown-primary mb-4">
              Team Leader Reports
            </h3>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-cream-light text-brown-primary">
                  <th className="p-3">Title</th>
                  <th className="p-3">Project</th>
                  <th className="p-3">Team Leader</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Download</th>
                </tr>
              </thead>
              <tbody>
                {teamLeaderReports.map((report, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-3">{report.title}</td>
                    <td className="p-3">{report.project}</td>
                    <td className="p-3">{report.leader}</td>
                    <td className="p-3">{report.date}</td>
                    <td className="p-3">
                      <a
                        href={report.fileUrl}
                        download
                        className="flex items-center space-x-1 text-green-primary hover:underline"
                      >
                        <FaDownload size={18} /> <span>Download</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
