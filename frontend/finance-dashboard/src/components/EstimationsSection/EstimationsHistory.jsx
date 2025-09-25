import React, { useState, useCallback, useEffect } from 'react';
import { CheckCircle, Filter, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

import { EstimationDetailsModal } from './EstimationDetailsModal';
import { EstimateToEstimateModal } from './EstimateToEstimateModal';
import { ViewInspectionEstimationModal } from '../InspectionSection/ViewInspectionEstimationModal';

// Utility to format numbers as currency-ish
const fmt = (n) => (typeof n === 'number' ? n.toLocaleString() : '0');

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

  const fetchEstimations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/project-estimation/all');
      if (!res.ok) throw new Error('Failed to fetch estimations');
      const data = await res.json();
      setEstimations(data);
    } catch (err) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

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
      await fetchEstimations();
    } catch (err) {
      setCreateError(err.message || 'Unknown error');
    } finally {
      setCreating(false);
    }
  };

  const itemsPerPage = 10;

  useEffect(() => {
    fetchEstimations();
  }, [fetchEstimations]);

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
    <div className="p-0 m-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-[#F7EED3] flex items-center justify-center text-[#AAB396] mr-3">
            <CheckCircle size={20} />
          </div>
          <h2 className="text-xl font-semibold text-[#674636]">Estimations History</h2>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search approved estimations..."
            className="pl-3 pr-10 py-2 border border-[#AAB396] rounded-md text-sm text-[#674636] focus:outline-none focus:ring-2 focus:ring-[#674636] focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Filter size={16} className="text-[#AAB396]" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#FFF8E8] shadow-sm rounded-md border border-[#AAB396] flex flex-col">
        {loading ? (
          <div className="p-6 text-center text-[#674636]">Loading...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-600">{error}</div>
        ) : (
          <>
            <div className="overflow-x-auto flex-grow">
              <table className="min-w-full w-full divide-y divide-[#AAB396] border-collapse">
                <thead className="bg-[#F7EED3]">
                  <tr>
                    {/*
                      Replace header columns
                      - Expanded to include all key estimation fields
                      - Sorting and formatting applied
                    */}
                    { [
                      { label: 'Project ID', field: 'projectId' },
                      { label: 'Version', field: 'version' },
                      { label: 'Status', field: 'status' },
                      { label: 'Labor', field: 'laborCost' },
                      { label: 'Material', field: 'materialCost' },
                      { label: 'Service', field: 'serviceCost' },
                      { label: 'Contingency', field: 'contingencyCost' },
                      { label: 'Total', field: 'total' },
                      { label: 'Created', field: 'createdAt' },
                      { label: 'Updated', field: 'updatedAt' }
                    ].map(col => (
                      <th
                        key={col.field}
                        onClick={() => handleSort(col.field)}
                        className="px-3 py-2 text-left text-xs font-medium text-[#674636] uppercase tracking-wider cursor-pointer whitespace-nowrap"
                      >
                        <div className="flex items-center">
                          {col.label}
                          <ArrowUpDown size={12} className="ml-1" />
                        </div>
                      </th>
                    )) }
                    <th className="px-3 py-2 text-right text-xs font-medium text-[#674636] uppercase whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[#FFF8E8] divide-y divide-[#AAB396]">
                  {paginatedEstimations.map(item => (
                    <tr key={item._id || item.id} className="hover:bg-[#F7EED3]">
                      <td className="px-3 py-2 text-xs font-mono text-[#674636]">{item.projectId}</td>
                      <td className="px-3 py-2 text-xs text-[#674636]">v{item.version}</td>
                      <td className="px-3 py-2 text-xs">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          item.status === 'Approved' ? 'bg-green-100 text-green-800' :
                          item.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>{item.status}</span>
                      </td>
                      <td className="px-3 py-2 text-xs text-[#674636]">{fmt(item.laborCost)}</td>
                      <td className="px-3 py-2 text-xs text-[#674636]">{fmt(item.materialCost)}</td>
                      <td className="px-3 py-2 text-xs text-[#674636]">{fmt(item.serviceCost)}</td>
                      <td className="px-3 py-2 text-xs text-[#674636]">{fmt(item.contingencyCost)}</td>
                      <td className="px-3 py-2 text-xs font-semibold text-[#674636]">{fmt(item.total)}</td>
                      <td className="px-3 py-2 text-xs text-[#674636]">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}</td>
                      <td className="px-3 py-2 text-xs text-[#674636]">{item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : ''}</td>
                      <td className="px-3 py-2 text-right text-xs space-x-1">
                        <button
                          onClick={() => { setSelectedEstimation(item); setShowDetailsModal(true); }}
                          className="text-[#674636] hover:text-[#FFF8E8] bg-[#AAB396] hover:bg-[#674636] px-2 py-1 rounded-md"
                        >View</button>
                        <button
                          onClick={() => { setSelectedEstimation(item); setShowEstimateToEstimate(true); }}
                          className="text-[#674636] hover:text-[#FFF8E8] bg-[#F7EED3] hover:bg-[#AAB396] px-2 py-1 rounded-md"
                        >Generate</button>
                      </td>
                    </tr>
                  ))}
                  {paginatedEstimations.length === 0 && (
                    <tr>
                      <td colSpan={12} className="px-4 py-2 text-center text-[#674636] text-sm">
                        No estimations found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredEstimations.length > 0 && (
              <div className="px-4 py-2 flex items-center justify-between border-t border-[#AAB396] bg-[#F7EED3]">
                <div className="text-sm text-[#674636]">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                  {Math.min(currentPage * itemsPerPage, filteredEstimations.length)} of {filteredEstimations.length} entries
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-md ${
                      currentPage === 1 ? 'text-[#AAB396] cursor-not-allowed' : 'text-[#674636] hover:bg-[#FFF8E8]'
                    }`}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-md ${
                        currentPage === page ? 'bg-[#674636] text-[#FFF8E8]' : 'text-[#674636] hover:bg-[#FFF8E8]'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-md ${
                      currentPage === totalPages ? 'text-[#AAB396] cursor-not-allowed' : 'text-[#674636] hover:bg-[#FFF8E8]'
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

        {/* Modals */}
        {showDetailsModal && selectedEstimation && (
          <ViewInspectionEstimationModal estimation={selectedEstimation} onClose={() => setShowDetailsModal(false)} />
        )}
        {showEstimateToEstimate && selectedEstimation && (
          <EstimateToEstimateModal
            estimation={selectedEstimation}
            onClose={() => setShowEstimateToEstimate(false)}
            onCreate={handleCreateEstimate}
          />
        )}
      {createError && <div className="text-center text-red-600 mt-2">{createError}</div>}
    </div>
  );
};
