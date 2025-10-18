import { useState, useEffect } from "react";
import { FaDownload, FaEye, FaCheck, FaTimes } from "react-icons/fa";

export default function ProjectFinance() {
  const [activeTab, setActiveTab] = useState("estimate");
  const [estimations, setEstimations] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedEstimation, setSelectedEstimation] = useState(null);
  const [rejectRemarks, setRejectRemarks] = useState("");

  useEffect(() => {
    fetchEstimations();
    fetchQuotations();
  }, []);

  const fetchEstimations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch("/api/project/estimations", {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (response.ok) {
        const data = await response.json();
        setEstimations(Array.isArray(data) ? data : []);
      } else {
        setEstimations([]);
      }
    } catch (err) {
      console.error('Error fetching estimations', err);
      setEstimations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuotations = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch("/api/quotations", {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (response.ok) {
        const data = await response.json();
        setQuotations(Array.isArray(data) ? data : []);
      } else {
        setQuotations([]);
      }
    } catch (err) {
      console.error('Error fetching quotations', err);
      setQuotations([]);
    }
  };

  const handleViewEstimation = (estimation) => {
    setSelectedEstimation(estimation);
    setShowViewModal(true);
  };

  const handleApproveEstimation = async (estimationId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/project/estimation/${estimationId}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
      });

      if (response.ok) {
        alert('Estimation approved successfully!');
        fetchEstimations(); // Refresh the list
      } else {
        const errorData = await response.json();
        console.error('Approval error:', errorData);
        alert(`Failed to approve estimation: ${errorData.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error approving estimation:', err);
      alert('Error approving estimation');
    }
  };

  const handleRejectEstimation = (estimation) => {
    setSelectedEstimation(estimation);
    setRejectRemarks("");
    setShowRejectModal(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectRemarks.trim()) {
      alert('Please provide remarks for rejection');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/project/estimation/${selectedEstimation._id}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          remarks: rejectRemarks
        })
      });

      if (response.ok) {
        alert('Estimation rejected successfully!');
        setShowRejectModal(false);
        setSelectedEstimation(null);
        setRejectRemarks("");
        fetchEstimations(); // Refresh the list
      } else {
        const errorData = await response.json();
        console.error('Rejection error:', errorData);
        alert(`Failed to reject estimation: ${errorData.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error rejecting estimation:', err);
      alert('Error rejecting estimation');
    }
  };

  return (
    <div className="bg-cream-primary min-h-screen p-8">
      <h2 className="text-2xl font-bold text-brown-primary mb-6">Finance Management</h2>

      <div className="flex space-x-4 mb-6">
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "estimate" ? "bg-brown-primary text-white" : "bg-cream-light text-brown-primary"
          }`}
          onClick={() => setActiveTab("estimate")}
        >
          Estimated Budgets
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "quotation" ? "bg-brown-primary text-white" : "bg-cream-light text-brown-primary"
          }`}
          onClick={() => setActiveTab("quotation")}
        >
          Quotations
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        {loading ? (
          <div className="text-brown-primary p-4">Loading...</div>
        ) : (
          <>
            {activeTab === "estimate" && (
              <div>
                <h3 className="text-lg font-semibold text-brown-primary mb-4">Estimated Budgets</h3>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-brown-primary text-white">
                      <th className="p-3">Project</th>
                      <th className="p-3">Version</th>
                      <th className="p-3">Total</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estimations.length > 0 ? (
                      estimations.map((est, i) => (
                        <tr key={est._id || i} className="border-b">
                          <td className="p-3">{est.projectName || est.projectId?.projectName || est.projectId}</td>
                          <td className="p-3">{est.version}</td>
                          <td className="p-3">{est.total?.toLocaleString?.() ?? est.total}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              est.status === 'Approved' ? 'bg-green-100 text-green-800' :
                              est.status === 'approved' ? 'bg-green-100 text-green-800' :
                              est.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                              est.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              est.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                              est.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {est.status}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleViewEstimation(est)}
                                className="flex items-center space-x-1 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                                title="View Details"
                              >
                                <FaEye size={12} />
                                <span>View</span>
                              </button>
                              
                              {(est.status === 'Pending' || est.status === 'pending') && (
                                <>
                                  <button
                                    onClick={() => handleApproveEstimation(est._id)}
                                    className="flex items-center space-x-1 px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
                                    title="Accept"
                                  >
                                    <FaCheck size={12} />
                                    <span>Accept</span>
                                  </button>
                                  
                                  <button
                                    onClick={() => handleRejectEstimation(est)}
                                    className="flex items-center space-x-1 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                                    title="Reject"
                                  >
                                    <FaTimes size={12} />
                                    <span>Reject</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="p-4 text-center text-gray-500">No estimations found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "quotation" && (
              <div>
                <h3 className="text-lg font-semibold text-brown-primary mb-4">Quotations</h3>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-brown-primary text-white">
                      <th className="p-3">Project</th>
                      <th className="p-3">Estimate #</th>
                      <th className="p-3">Version</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Grand Total</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotations.length > 0 ? (
                      quotations.map((quo, i) => (
                        <tr key={quo._id || i} className="border-b">
                          <td className="p-3">{quo.projectName || quo.projectId?.projectName || quo.projectId}</td>
                          <td className="p-3">{quo.estimateVersion}</td>
                          <td className="p-3">{quo.version}</td>
                          <td className="p-3">{quo.status}</td>
                          <td className="p-3">{quo.grandTotal?.toLocaleString?.() ?? quo.grandTotal}</td>
                          <td className="p-3">
                            {quo.fileUrl ? (
                              <a href={`${quo.fileUrl}`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 text-green-primary hover:underline">
                                <FaDownload size={16} /> <span>Download</span>
                              </a>
                            ) : (
                              <span className="text-gray-400">Not available</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="p-4 text-center text-gray-500">No quotations found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* View Estimation Modal */}
      {showViewModal && selectedEstimation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-brown-primary">Estimation Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Project Info */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-brown-primary">Project Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-gray-700">Project:</span>
                  <p className="text-gray-900">{selectedEstimation.projectName || selectedEstimation.projectId?.projectName || selectedEstimation.projectId}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Version:</span>
                  <p className="text-gray-900">{selectedEstimation.version}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    selectedEstimation.status === 'Approved' || selectedEstimation.status === 'approved' ? 'bg-green-100 text-green-800' :
                    selectedEstimation.status === 'Rejected' || selectedEstimation.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    selectedEstimation.status === 'Pending' || selectedEstimation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedEstimation.status}
                  </span>
                </div>
                {selectedEstimation.createdAt && (
                  <div>
                    <span className="font-medium text-gray-700">Submitted:</span>
                    <p className="text-gray-900">{new Date(selectedEstimation.createdAt).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-brown-primary">Cost Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-300 border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left text-gray-700">Item</th>
                      <th className="border border-gray-300 px-4 py-2 text-right text-gray-700">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Materials</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">${selectedEstimation.materialCost?.toLocaleString() || 0}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Labor</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">${selectedEstimation.laborCost?.toLocaleString() || 0}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Service</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">${selectedEstimation.serviceCost?.toLocaleString() || 0}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Contingency</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">${selectedEstimation.contingencyCost?.toLocaleString() || 0}</td>
                    </tr>
                    <tr className="bg-gray-50 font-semibold">
                      <td className="border border-gray-300 px-4 py-2">Total</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">${selectedEstimation.total?.toLocaleString() || 0}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Approval/Rejection Info */}
            {(selectedEstimation.approvedBy || selectedEstimation.rejectedBy) && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-brown-primary">Action History</h3>
                {selectedEstimation.approvedBy && (
                  <div className="bg-green-50 border border-green-200 rounded p-3 mb-2">
                    <p className="text-green-800">
                      <span className="font-medium">Approved by:</span> {selectedEstimation.approvedBy}
                    </p>
                    {selectedEstimation.approvedAt && (
                      <p className="text-green-700 text-sm">
                        {new Date(selectedEstimation.approvedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
                {selectedEstimation.rejectedBy && (
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <p className="text-red-800">
                      <span className="font-medium">Rejected by:</span> {selectedEstimation.rejectedBy}
                    </p>
                    {selectedEstimation.rejectedAt && (
                      <p className="text-red-700 text-sm">
                        {new Date(selectedEstimation.rejectedAt).toLocaleString()}
                      </p>
                    )}
                    {selectedEstimation.remarks && (
                      <p className="text-red-700 mt-2">
                        <span className="font-medium">Remarks:</span> {selectedEstimation.remarks}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Estimation Modal */}
      {showRejectModal && selectedEstimation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-brown-primary">Reject Estimation</h2>
              <button
                onClick={() => setShowRejectModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>

            <div className="mb-4">
              <p className="text-gray-700 mb-2">
                Are you sure you want to reject this estimation?
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Project: {selectedEstimation.projectName || selectedEstimation.projectId?.projectName || selectedEstimation.projectId} (Version {selectedEstimation.version})
              </p>
              
              <label htmlFor="rejectRemarks" className="block text-sm font-medium text-gray-700 mb-2">
                Remarks (Required) *
              </label>
              <textarea
                id="rejectRemarks"
                value={rejectRemarks}
                onChange={(e) => setRejectRemarks(e.target.value)}
                placeholder="Please provide the reason for rejection..."
                className="w-full h-24 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brown-primary focus:border-transparent"
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
