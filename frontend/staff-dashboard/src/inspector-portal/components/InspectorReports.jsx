import React, { useEffect, useState } from 'react';
import axios from 'axios';

const InspectorReports = () => {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await axios.get('http://localhost:4000/api/auth/reports/my-reports', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setReports(res.data);
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError('Failed to fetch reports');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handleDownload = (report) => {
    if (report.fileUrl) {
      window.open(report.fileUrl, '_blank');
    } else {
      alert('Report file not available');
    }
  };

  const handleDelete = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`http://localhost:4000/api/auth/reports/${reportId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setReports(reports.filter(r => r._id !== reportId));
    } catch (err) {
      console.error('Error deleting report:', err);
      alert('Failed to delete report');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center p-8">
      <div className="text-brown-primary">Loading reports...</div>
    </div>
  );

  if (error) return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      {error}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="border-b border-brown-primary-300 pb-4">
        <h2 className="text-2xl font-bold text-brown-primary flex items-center space-x-2">
          <span>📄</span>
          <span>My Inspection Reports</span>
        </h2>
        <p className="text-brown-secondary mt-1">View, download and manage your inspection reports</p>
      </div>

      {reports.length === 0 ? (
        <div className="bg-cream-light rounded-lg p-8 text-center border border-brown-primary-300">
          <p className="text-brown-primary-300">No reports found. Complete inspection forms to generate reports.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden border border-brown-primary-300">
          <table className="min-w-full divide-y divide-brown-primary-200">
            <thead className="bg-brown-primary text-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Inspection Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-brown-primary-200">
              {reports.map(report => (
                <tr key={report._id} className="hover:bg-cream-light">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brown-primary">
                    {report.inspectionDate ? new Date(report.inspectionDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brown-primary">
                    {report.clientName || report.reportData?.clientName || 'Unknown Client'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      report.status === 'completed' ? 'bg-green-100 text-green-800' : 
                      report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {report.status || 'completed'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button 
                      onClick={() => setSelectedReport(report)}
                      className="bg-brown-primary text-white px-3 py-1 rounded hover:bg-brown-secondary transition-colors"
                    >
                      View
                    </button>
                    <button 
                      onClick={() => handleDownload(report)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
                    >
                      Download
                    </button>
                    <button 
                      onClick={() => handleDelete(report._id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-96 overflow-y-auto m-4 border border-brown-primary-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-brown-primary">Report Details</h3>
              <button 
                onClick={() => setSelectedReport(null)}
                className="text-brown-primary hover:text-brown-secondary text-2xl"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <strong>Title:</strong> {selectedReport.title || 'Inspection Report'}
              </div>
              <div>
                <strong>Client:</strong> {selectedReport.clientName || selectedReport.reportData?.clientName || 'Unknown'}
              </div>
              <div>
                <strong>Date:</strong> {selectedReport.inspectionDate ? new Date(selectedReport.inspectionDate).toLocaleDateString() : 'N/A'}
              </div>
              <div>
                <strong>Status:</strong> {selectedReport.status || 'completed'}
              </div>
              {selectedReport.reportData && (
                <div>
                  <strong>Report Data:</strong>
                  <pre className="bg-gray-100 p-3 rounded mt-2 text-sm overflow-x-auto">
                    {JSON.stringify(selectedReport.reportData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
            <div className="mt-6 flex space-x-3">
              <button 
                onClick={() => handleDownload(selectedReport)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
              >
                Download Report
              </button>
              <button 
                onClick={() => setSelectedReport(null)}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectorReports;