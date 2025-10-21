import React, { useEffect, useState } from 'react';
import axios from 'axios';

const InspectorReports = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterDate, setFilterDate] = useState('');
  const [filterType, setFilterType] = useState('inspection'); // 'inspection' or 'submission'

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await axios.get('/api/auth-reports/my-reports', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setReports(res.data);
        setFilteredReports(res.data); // Initially show all reports
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError('Failed to fetch reports');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  // Filter reports based on selected date and filter type
  useEffect(() => {
    if (!filterDate) {
      setFilteredReports(reports);
      return;
    }

    const filtered = reports.filter(report => {
      let dateToCheck;
      
      if (filterType === 'inspection') {
        dateToCheck = report.reportData?.inspectionDate;
      } else {
        dateToCheck = report.submittedAt || report.generatedAt;
      }

      if (!dateToCheck) return false;

      const reportDate = new Date(dateToCheck).toLocaleDateString('en-CA'); // YYYY-MM-DD format
      return reportDate === filterDate;
    });

    setFilteredReports(filtered);
  }, [reports, filterDate, filterType]);

  const clearFilter = () => {
    setFilterDate('');
    setFilteredReports(reports);
  };

  const handleDownload = (report) => {
    if (report.pdfPath) {
      // Construct proper URL for PDF access through proxy
      const pdfUrl = report.pdfPath.startsWith('/') ? report.pdfPath : `/${report.pdfPath}`;
      
      // Open PDF in new tab for viewing instead of downloading
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');
    } else {
      alert('PDF file not available. Please try generating the report again.');
    }
  };

  const handleDelete = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`/api/auth-reports/${reportId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const updatedReports = reports.filter(r => r._id !== reportId);
      setReports(updatedReports);
      setFilteredReports(updatedReports.filter(report => {
        if (!filterDate) return true;
        
        let dateToCheck;
        if (filterType === 'inspection') {
          dateToCheck = report.reportData?.inspectionDate;
        } else {
          dateToCheck = report.submittedAt || report.generatedAt;
        }
        
        if (!dateToCheck) return false;
        const reportDate = new Date(dateToCheck).toLocaleDateString('en-CA');
        return reportDate === filterDate;
      }));
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

      {/* Date Filter Section */}
      <div className="bg-cream-light rounded-lg p-4 border border-brown-primary-300">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center space-x-2">
            <label className="text-brown-primary font-medium">Filter by:</label>
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-brown-primary-300 rounded px-3 py-1 bg-white text-brown-primary focus:outline-none focus:ring-2 focus:ring-brown-primary"
            >
              <option value="inspection">Inspection Date</option>
              <option value="submission">Submission Date</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-brown-primary font-medium">Date:</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="border border-brown-primary-300 rounded px-3 py-1 bg-white text-brown-primary focus:outline-none focus:ring-2 focus:ring-brown-primary"
            />
          </div>

          {filterDate && (
            <button
              onClick={clearFilter}
              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors text-sm"
            >
              Clear Filter
            </button>
          )}

          <div className="text-sm text-brown-secondary">
            Showing {filteredReports.length} of {reports.length} reports
          </div>
        </div>
      </div>

      {filteredReports.length === 0 ? (
        <div className="bg-cream-light rounded-lg p-8 text-center border border-brown-primary-300">
          <p className="text-brown-primary-300">
            {filterDate ? 'No reports found for the selected date.' : 'No reports found. Complete inspection forms to generate reports.'}
          </p>
          {filterDate && (
            <button
              onClick={clearFilter}
              className="mt-2 text-brown-primary underline hover:text-brown-secondary"
            >
              Clear filter to see all reports
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow border border-brown-primary-300 overflow-x-auto">
          <table className="min-w-full divide-y divide-brown-primary-200">
            <thead className="bg-brown-primary text-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Inspection Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Report Submitted Date
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
              {filteredReports.map(report => (
                <tr key={report._id} className="hover:bg-cream-light">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brown-primary">
                    {report.reportData?.inspectionDate ? new Date(report.reportData.inspectionDate).toLocaleDateString('en-US') : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brown-primary">
                    {report.submittedAt ? new Date(report.submittedAt).toLocaleDateString('en-US') : (report.generatedAt ? new Date(report.generatedAt).toLocaleDateString('en-US') : new Date().toLocaleDateString('en-US'))}
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setSelectedReport(report)}
                        className="bg-brown-primary text-white px-3 py-1 text-sm rounded hover:bg-brown-secondary transition-colors"
                      >
                        View
                      </button>
                      <button 
                        onClick={() => handleDelete(report._id)}
                        className="bg-red-600 text-white px-3 py-1 text-sm rounded hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-cream-light rounded-lg p-8 max-w-4xl max-h-96 overflow-y-auto m-4 border-2 border-brown-primary shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b border-brown-primary pb-4">
              <h3 className="text-2xl font-bold text-brown-primary">📄 Inspection Report</h3>
              <button 
                onClick={() => setSelectedReport(null)}
                className="text-brown-primary hover:text-brown-secondary text-3xl font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Report Header */}
              <div className="bg-white rounded-lg p-4 border border-brown-primary-300">
                <h4 className="text-lg font-semibold text-brown-primary mb-3">Report Information</h4>
                <div className="space-y-4">
                  <div>
                    <span className="font-medium text-brown-secondary">Report Title:</span>
                    <p className="text-brown-primary">{selectedReport.title || 'Inspection Report'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-brown-secondary">Report Status:</span>
                    <p className="text-brown-primary capitalize">{selectedReport.status || 'completed'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-brown-secondary">Report Submitted Date:</span>
                    <p className="text-brown-primary">
                      {selectedReport.submittedAt 
                        ? new Date(selectedReport.submittedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long', 
                            day: 'numeric'
                          })
                        : (selectedReport.generatedAt 
                            ? new Date(selectedReport.generatedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long', 
                                day: 'numeric'
                              })
                            : 'Date not recorded'
                          )
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* PDF Viewer */}
              {selectedReport.pdfPath ? (
                <div className="bg-white rounded-lg p-4 border border-brown-primary-300">
                  <h4 className="text-lg font-semibold text-brown-primary mb-3">Inspection Report PDF</h4>
                  <div className="border border-brown-primary-300 rounded">
                    <iframe
                      src={selectedReport.pdfPath.startsWith('/') ? selectedReport.pdfPath : `/${selectedReport.pdfPath}`}
                      width="100%"
                      height="500px"
                      title="Inspection Report PDF"
                      className="rounded"
                    >
                      <p>Your browser does not support PDFs. <a href={selectedReport.pdfPath.startsWith('/') ? selectedReport.pdfPath : `/${selectedReport.pdfPath}`} target="_blank" rel="noopener noreferrer">Download the PDF</a> instead.</p>
                    </iframe>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg p-4 border border-brown-primary-300">
                  <h4 className="text-lg font-semibold text-brown-primary mb-3">Report Status</h4>
                  <p className="text-brown-secondary">PDF is being generated. Please refresh the page in a moment.</p>
                </div>
              )}
            </div>

            <div className="mt-8 flex space-x-3 border-t border-brown-primary pt-4">
              <button 
                onClick={() => handleDownload(selectedReport)}
                className="bg-brown-primary text-white px-6 py-2 rounded hover:bg-brown-secondary transition-colors font-medium"
                disabled={!selectedReport.pdfPath}
              >
                📥 Download Report
              </button>
              <button 
                onClick={() => setSelectedReport(null)}
                className="bg-brown-secondary text-white px-6 py-2 rounded hover:bg-brown-primary transition-colors font-medium"
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
