import React, { useState } from 'react';
import { CheckCircle, Filter, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

import { EstimationDetailsModal } from './EstimationDetailsModal';
import { EstimateToEstimateModal } from './EstimateToEstimateModal';

import { useEffect } from 'react';

export const EstimationsHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEstimation, setSelectedEstimation] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [estimations, setEstimations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEstimateToEstimate, setShowEstimateToEstimate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);
  // Handler for creating a new estimate version
  const handleCreateEstimate = async (costs) => {
    if (!selectedEstimation) return;
    setCreating(true);
    setCreateError(null);
    try {
      const payload = {
        projectId: selectedEstimation.projectId,
        materialCost: Number(costs.materialCost),
        laborCost: Number(costs.laborCost),
        serviceCost: Number(costs.serviceCost),
        contingencyCost: Number(costs.contingencyCost),
        total: Number(costs.totalCost),
        baseEstimateId: selectedEstimation._id || selectedEstimation.id,
      };
      const res = await fetch('/api/project-estimation/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to create new estimate');
      setShowEstimateToEstimate(false);
      // Optionally refresh estimations list
      // await fetchEstimations();
    } catch (err) {
      setCreateError(err.message || 'Unknown error');
    } finally {
      setCreating(false);
    }
  };

  const itemsPerPage = 10;

  useEffect(() => {
    const fetchEstimations = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/project-estimation/');
        if (!res.ok) throw new Error('Failed to fetch estimations');
        const data = await res.json();
        setEstimations(data);
      } catch (err) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchEstimations();
  }, []);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredEstimations = estimations
    .filter(
      (est) =>
        (est.projectId && est.projectId.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
        (est.version && est.version.toString().includes(searchTerm)) ||
        (est.total && est.total.toString().includes(searchTerm)) ||
        (est.createdAt && new Date(est.createdAt).toLocaleDateString().toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const totalPages = Math.ceil(filteredEstimations.length / itemsPerPage);
  const paginatedEstimations = filteredEstimations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      {/* Header with Search */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-500 mr-3">
            <CheckCircle size={20} />
          </div>
      <h2 className="text-xl font-semibold">Estimations History</h2>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search approved estimations..."
            className="pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Filter size={16} className="text-gray-400" />
          </button>
        </div>
      </div>


      {/* Table */}
      <div className="bg-white shadow-sm rounded-md overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">{error}</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => handleSort('projectId')}>Project ID <ArrowUpDown size={14} className="inline ml-1" /></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => handleSort('version')}>Version <ArrowUpDown size={14} className="inline ml-1" /></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => handleSort('total')}>Total <ArrowUpDown size={14} className="inline ml-1" /></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => handleSort('createdAt')}>Created Date <ArrowUpDown size={14} className="inline ml-1" /></th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedEstimations.map((item) => (
                    <tr key={item._id || item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.projectId}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{item.version}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">${item.total?.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}</td>
                      <td className="px-6 py-4 text-right text-sm space-x-2">
                        <button
                          onClick={() => { setSelectedEstimation(item); setShowDetailsModal(true); }}
                          className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded-md"
                        >
                          View
                        </button>
                        <button
                          onClick={() => { setSelectedEstimation(item); setShowEstimateToEstimate(true); }}
                          className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded-md"
                        >
                          Generate
                        </button>
                      </td>
                    </tr>
                  ))}
                  {paginatedEstimations.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                        No estimations found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {filteredEstimations.length > 0 && (
              <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                  {Math.min(currentPage * itemsPerPage, filteredEstimations.length)} of {filteredEstimations.length} entries
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-md ${
                      currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-md ${
                        currentPage === page ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-md ${
                      currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Estimation Details Modal */}
      {showDetailsModal && selectedEstimation && (
        <EstimationDetailsModal estimation={selectedEstimation} onClose={() => setShowDetailsModal(false)} />
      )}
      {/* Estimate To Estimate Modal */}
      {showEstimateToEstimate && selectedEstimation && (
        <EstimateToEstimateModal
          estimation={selectedEstimation}
          onClose={() => setShowEstimateToEstimate(false)}
          onCreate={handleCreateEstimate}
        />
      )}
      {createError && (
        <div className="text-center text-red-500 mt-2">{createError}</div>
      )}
    </div>
  );
};
