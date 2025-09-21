import React, { useState, useEffect } from 'react';

export default function ProgressReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      try {
        // Get first project for demo
        const projRes = await fetch(`http://localhost:4000/api/projects`);
        const projects = await projRes.json();
        const firstProject = projects[0];
        
        if (firstProject) {
          const repRes = await fetch(`http://localhost:4000/api/reports/project/${firstProject._id}`);
          const repData = await repRes.json();
          setReports(repData);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching reports:', error);
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  if (loading) return <div className="p-8 text-brown-primary">Loading progress reports...</div>;

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-brown-primary mb-6">Progress Reports</h2>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-brown-secondary">Project Reports</h3>
          <button className="bg-brown-primary text-white px-4 py-2 rounded hover:bg-brown-secondary">
            Create Report
          </button>
        </div>
        
        {reports.length > 0 ? (
          <div className="space-y-4">
            {reports.map((report, index) => (
              <div key={report._id || index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-brown-primary">{report.reportType}</h4>
                  <span className={`px-2 py-1 text-xs rounded ${
                    report.status === 'completed' 
                      ? 'bg-green-100 text-green-800'
                      : report.status === 'draft'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {report.status}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-2">{report.summary}</p>
                
                <div className="text-xs text-gray-500 space-y-1">
                  <p><strong>Period:</strong> {new Date(report.dateRange.start).toLocaleDateString()} - {new Date(report.dateRange.end).toLocaleDateString()}</p>
                  <p><strong>Created:</strong> {new Date(report.createdAt).toLocaleDateString()}</p>
                  
                  <div className="flex space-x-4 mt-2">
                    <span className={`px-2 py-1 text-xs rounded ${report.includeProgress ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                      {report.includeProgress ? '✓' : '✗'} Progress
                    </span>
                    <span className={`px-2 py-1 text-xs rounded ${report.includeIssues ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'}`}>
                      {report.includeIssues ? '✓' : '✗'} Issues
                    </span>
                    <span className={`px-2 py-1 text-xs rounded ${report.includeResourceUsage ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {report.includeResourceUsage ? '✓' : '✗'} Resources
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No progress reports found.</p>
        )}
      </div>
    </div>
  );
}