import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaFileUpload, FaDownload } from 'react-icons/fa';

export default function ProgressReports() {
  // Form state
  const [reportType, setReportType] = useState('Weekly Progress Report');
  const [project, setProject] = useState('');
  const [projects, setProjects] = useState([]);
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [includeProgress, setIncludeProgress] = useState(true);
  const [includeIssues, setIncludeIssues] = useState(true);
  const [includeMaterialList, setIncludeMaterialList] = useState(true);
  const [summary, setSummary] = useState('');
  const [files, setFiles] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatedFiles, setGeneratedFiles] = useState([]);

  useEffect(() => {
    async function fetchProjectsAndReports() {
      try {
        const projRes = await fetch(`/api/projects`);
        const projectsData = await projRes.json();
        setProjects(projectsData);
        if (projectsData.length > 0) setProject(projectsData[0]._id);

        // Fetch reports for first project
        if (projectsData[0]) {
          const repRes = await fetch(`/api/reports/project/${projectsData[0]._id}`);
          const repData = await repRes.json();
          setReports(repData);
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    }
    fetchProjectsAndReports();
  }, []);

  // File upload handler (only allow images)
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const imageFiles = selectedFiles.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length !== selectedFiles.length) {
      alert('Only image files are allowed for supporting files.');
    }
    setFiles(imageFiles);
  };

  // Delete report handler
  const handleDeleteReport = async (reportId) => {
    if (!confirm('Are you sure you want to delete this report?')) return;

    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove from reports list
        setReports(prev => prev.filter(r => r._id !== reportId));
        // Remove from generated files if it exists there
        setGeneratedFiles(prev => prev.filter(f => f.id !== reportId));
        alert('Report deleted successfully!');
      } else {
        alert('Failed to delete report');
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      alert('Error deleting report. Please try again.');
    }
  };

  // Generate PDF report handler
  const handleGenerateReport = async () => {
    if (!project || !reportType) {
      alert('Please select a project and report type.');
      return;
    }

    // Only allow Weekly Progress Report and Final Completion Report
    if (!['Weekly Progress Report', 'Final Completion Report'].includes(reportType)) {
      alert('Only Weekly Progress Report and Final Completion Report are supported.');
      return;
    }

    try {
      const reportData = {
        projectId: project,
        reportType,
        dateStart,
        dateEnd,
        summary,
  includeProgress,
  includeIssues,
  includeMaterialList
      };

      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      if (response.ok) {
        const result = await response.json();

        // Determine public URL: prefer fileUrl on saved report, else use filePath returned
        const publicUrl = result.report?.fileUrl || result.filePath || '';
        const normalizedUrl = publicUrl.startsWith('http') ? publicUrl : `${window.location.origin}${publicUrl}`;

        // Add to generated files
        setGeneratedFiles(prev => ([...prev, { 
          name: result.fileName, 
          url: normalizedUrl,
          id: result.report?._id
        }]));

        // Add to reports list to show in existing reports section
        setReports(prev => [result.report, ...prev]);

        // Reset form
        setSummary('');
        setFiles([]);

        // Open the generated PDF in a new tab if available
        if (normalizedUrl) {
          window.open(normalizedUrl, '_blank');
        }

        alert('Report generated successfully! The PDF will open in a new tab.');
      } else {
        let errorMsg = 'Failed to generate report.';
        try {
          const error = await response.json();
          errorMsg = error.error || error.message || errorMsg;
        } catch (e) {
          // ignore
        }
        alert(`Failed to generate report: ${errorMsg}`);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report. Please try again.');
    }
  };

  if (loading) return <div className="p-8 text-brown-primary">Loading progress reports...</div>;

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-brown-primary mb-6">Reporting &amp; Updates</h2>

      {/* Generate New Report UI */}
      <div className="bg-cream-light rounded-lg shadow-md mb-8 overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4 bg-transparent">
          <span className="font-semibold text-brown-primary text-lg">Generate New Report</span>
        </div>
        <form className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-brown-primary mb-1">Report Type</label>
            <select
              value={reportType}
              onChange={e => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-primary"
            >
              <option>Weekly Progress Report</option>
              <option>Final Completion Report</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-brown-primary mb-1">Project</label>
            <select
              value={project}
              onChange={e => setProject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-primary"
            >
              {projects.map(p => (
                <option key={p._id} value={p._id}>{p.projectName || p.name}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <label className="block text-sm font-medium text-brown-primary mb-1">Date Range</label>
              <input
                type="date"
                value={dateStart}
                onChange={e => setDateStart(e.target.value)}
                className="w-full h-10 px-3 border border-gray-200 rounded-md bg-white"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-brown-primary mb-1">&nbsp;</label>
              <input
                type="date"
                value={dateEnd}
                onChange={e => setDateEnd(e.target.value)}
                className="w-full h-10 px-3 border border-gray-200 rounded-md bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-brown-primary mb-1">Include Data</label>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={includeProgress}
                  onChange={e => setIncludeProgress(e.target.checked)}
                  className="form-checkbox h-4 w-4 text-green-primary"
                />
                <span className="text-sm text-brown-primary">Progress Updates</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={includeIssues}
                  onChange={e => setIncludeIssues(e.target.checked)}
                  className="form-checkbox h-4 w-4 text-green-primary"
                />
                <span className="text-sm text-brown-primary">Issues &amp; Delays</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={includeMaterialList}
                  onChange={e => setIncludeMaterialList(e.target.checked)}
                  className="form-checkbox h-4 w-4 text-green-primary"
                />
                <span className="text-sm text-brown-primary">Material List</span>
              </label>
            </div>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-brown-primary mb-1">Report Summary</label>
            <textarea
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="Enter a summary of the report..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 rounded-md resize-vertical min-h-[100px] bg-white"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-brown-primary mb-1">Supporting Files</label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center gap-3 bg-white">
              <FaFileUpload className="text-2xl text-brown-primary mb-2" />
              <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" id="file-upload" />
              <label htmlFor="file-upload" className="px-4 py-2 bg-brown-primary text-white rounded-md cursor-pointer hover:bg-brown-secondary transition">Browse Images</label>
              <span className="text-xs text-brown-primary">Drag and drop image files here, or click to select images</span>
              {files.length > 0 && (
                <div className="mt-2 text-xs text-brown-primary w-full text-left">{files.map(f => f.name).join(', ')}</div>
              )}
            </div>
          </div>

          <div className="col-span-2 flex justify-end gap-3 mt-4">
            <button type="button" className="px-4 py-2 border border-brown-primary rounded text-brown-primary bg-white hover:bg-cream-primary transition">Save as Draft</button>
            <button type="button" className="px-4 py-2 bg-brown-primary text-white rounded hover:bg-brown-secondary transition" onClick={handleGenerateReport}>Generate Report</button>
          </div>
        </form>
      </div>

      {/* Display and Download Generated Files */}
      {generatedFiles.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-brown-secondary mb-4">Generated Files</h3>
          <ul className="space-y-2">
            {generatedFiles.map((file, idx) => (
              <li key={idx} className="flex items-center justify-between border-b border-gray-100 py-2">
                <span className="text-brown-primary font-medium">{file.name}</span>
                <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-green-primary flex items-center gap-2 hover:underline">
                  <FaDownload /> Download
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Existing Reports List (unchanged) */}
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
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded ${
                      report.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : report.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {report.status}
                    </span>
                        {(() => {
                          const rawUrl = report.fileUrl || report.filePath || '';
                          const downloadUrl = rawUrl && /^https?:\/\//i.test(rawUrl) ? rawUrl : (rawUrl ? `${window.location.origin}${rawUrl}` : '');
                          return (downloadUrl && report.status === 'completed') ? (
                            <a
                              href={downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-xs flex items-center gap-1"
                            >
                              <FaDownload size={12} /> Download
                            </a>
                          ) : null;
                        })()}
                    <button
                      onClick={() => handleDeleteReport(report._id)}
                      className="text-red-600 hover:text-red-800 text-xs px-2 py-1 rounded border border-red-300 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-2">{report.summary || 'No summary provided'}</p>
                <div className="text-xs text-gray-500 space-y-1">
                  <p><strong>Period:</strong> {
                    report.dateStart && report.dateEnd 
                      ? `${report.dateStart} - ${report.dateEnd}`
                      : report.dateRange?.start && report.dateRange?.end
                      ? `${new Date(report.dateRange.start).toLocaleDateString()} - ${new Date(report.dateRange.end).toLocaleDateString()}`
                      : 'N/A'
                  }</p>
                  <p><strong>Created:</strong> {new Date(report.createdAt).toLocaleDateString()}</p>
                  <div className="flex space-x-4 mt-2">
                    <span className={`px-2 py-1 text-xs rounded ${report.includeProgress ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                      {report.includeProgress ? '✓' : '✗'} Progress
                    </span>
                    <span className={`px-2 py-1 text-xs rounded ${report.includeIssues ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'}`}>
                      {report.includeIssues ? '✓' : '✗'} Issues
                    </span>
                    <span className={`px-2 py-1 text-xs rounded ${report.includeMaterialList ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {report.includeMaterialList ? '✓' : '✗'} Material List
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
