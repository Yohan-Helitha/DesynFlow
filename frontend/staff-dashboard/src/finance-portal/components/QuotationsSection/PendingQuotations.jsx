import React, { useState, useEffect } from 'react'
import {
  FileText,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Check,
  X,
} from 'lucide-react'
import { QuotationFormModal as CreateQuotationModal } from './CreateQuotationModal'
import { fetchMaterials } from '../../utils/fetchMaterials';
import { safeFetchJson } from '../../utils/safeFetch';

// Fetch approved estimations from backend
const API_URL = '/api/project-estimation/approved';

export const PendingQuotations = () => {
  const [materials, setMaterials] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch materials for modal dropdown
  useEffect(() => {
    async function getMaterials() {
      try {
        const data = await fetchMaterials();
        setMaterials(data);
      } catch (err) {
        // Optionally handle error
        console.error('Failed to load materials', err);
      }
    }
    getMaterials();
  }, []);

  useEffect(() => {
    async function fetchQuotations() {
      setLoading(true);
      try {
        // Pull approved estimations
        const data = await safeFetchJson(API_URL);
        const list = Array.isArray(data) ? data : [];
        // Filter: show only estimations with no quotation yet
        const pendingOnly = list.filter(e => !e.quotationCreated && !e.lastQuotationId);
        setQuotations(pendingOnly);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchQuotations();
  }, []);

  const handleView = (estimation) => {
    // Ensure we pass the correct project ID to the modal
    const processedEstimation = {
      ...estimation,
      projectId: getProjectId(estimation)
    };
    setSelectedQuotation(processedEstimation);
    setShowCreateModal(true);
  };

  const handleCreated = async (createdQuotation) => {
    console.log('[PendingQuotations] Quotation created, refreshing list...', createdQuotation);
    
    // Remove the estimation from the pending list immediately for better UX
    setQuotations(prev => prev.filter(q => q._id !== (selectedQuotation?._id)));
    setShowCreateModal(false);
    setSelectedQuotation(null);
    
    // Optionally refresh the entire list to ensure consistency
    try {
      const data = await safeFetchJson(API_URL);
      const list = Array.isArray(data) ? data : [];
      const pendingOnly = list.filter(e => !e.quotationCreated && !e.lastQuotationId);
      setQuotations(pendingOnly);
      console.log('[PendingQuotations] List refreshed, pending count:', pendingOnly.length);
    } catch (err) {
      console.error('[PendingQuotations] Error refreshing after creation:', err);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
	};

  // Helper function to get project display name
  const getProjectDisplay = (quotation) => {
    if (quotation.projectId && typeof quotation.projectId === 'object') {
      return quotation.projectId.projectName || quotation.projectId._id;
    }
    return quotation.projectId || '';
  };

  // Helper function to get project ID for sorting/filtering
  const getProjectId = (quotation) => {
    if (quotation.projectId && typeof quotation.projectId === 'object') {
      return quotation.projectId._id;
    }
    return quotation.projectId || '';
  };

  // Filter and sort quotations
  const filteredQuotations = quotations
    .filter((quotation) => {
      const searchLower = searchTerm.toLowerCase();
      const projectDisplay = getProjectDisplay(quotation).toLowerCase();
      const projectId = getProjectId(quotation).toLowerCase();
      const estimationId = quotation._id ? quotation._id.toLowerCase() : '';
      
      return (
        estimationId.includes(searchLower) ||
        projectDisplay.includes(searchLower) ||
        projectId.includes(searchLower)
      );
    })
    .sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      // Handle project sorting specially
      if (sortField === 'projectId') {
        aVal = getProjectDisplay(a).toLowerCase();
        bVal = getProjectDisplay(b).toLowerCase();
      }
      
      if (aVal < bVal) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aVal > bVal) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredQuotations.length / itemsPerPage);
  const paginatedQuotations = filteredQuotations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-[#F7EED3] flex items-center justify-center text-[#674636] mr-3">
            <FileText size={20} />
          </div>
          <h2 className="text-xl font-semibold text-[#674636]">Pending Quotations</h2>
        </div>
        <div className="flex space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search quotations..."
              className="pl-3 pr-10 py-2 border border-[#AAB396] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#674636] focus:border-transparent bg-[#F7EED3] placeholder-[#AAB396] text-[#674636]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Filter size={16} className="text-[#AAB396]" />
            </button>
          </div>
        </div>
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div className="text-center py-8 text-[#AAB396]">
          Loading approved estimations...
        </div>
      )}

      {error && (
        <div className="text-center py-8 text-red-600 bg-red-50 rounded-md border border-red-200">
          Error loading estimations: {error}
        </div>
      )}

      {/* Pending Quotations Table */}
      {!loading && !error && (
        <div className="bg-[#FFF8E8] shadow-sm rounded-md overflow-hidden border border-[#AAB396]">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#AAB396]">
            <thead className="bg-[#F7EED3]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase tracking-wider cursor-pointer" onClick={() => handleSort('_id')}>
                  <div className="flex items-center">Estimation ID<ArrowUpDown size={14} className="ml-1" /></div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase tracking-wider cursor-pointer" onClick={() => handleSort('projectId')}>
                  <div className="flex items-center">Project Name<ArrowUpDown size={14} className="ml-1" /></div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase tracking-wider cursor-pointer" onClick={() => handleSort('version')}>
                  <div className="flex items-center">Estimate Version<ArrowUpDown size={14} className="ml-1" /></div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase tracking-wider cursor-pointer" onClick={() => handleSort('laborCost')}>
                  <div className="flex items-center">Labor Cost<ArrowUpDown size={14} className="ml-1" /></div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase tracking-wider cursor-pointer" onClick={() => handleSort('materialCost')}>
                  <div className="flex items-center">Material Cost<ArrowUpDown size={14} className="ml-1" /></div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase tracking-wider cursor-pointer" onClick={() => handleSort('serviceCost')}>
                  <div className="flex items-center">Service Cost<ArrowUpDown size={14} className="ml-1" /></div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase tracking-wider cursor-pointer" onClick={() => handleSort('contingencyCost')}>
                  <div className="flex items-center">Contingency Cost<ArrowUpDown size={14} className="ml-1" /></div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase tracking-wider cursor-pointer" onClick={() => handleSort('total')}>
                  <div className="flex items-center">Total<ArrowUpDown size={14} className="ml-1" /></div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[#674636] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-[#FFF8E8] divide-y divide-[#AAB396]">
              {paginatedQuotations.map((quotation) => (
                <tr key={quotation._id} className="hover:bg-[#F7EED3]">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#674636]">
                    {quotation._id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#674636]">
                    {getProjectDisplay(quotation)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#674636]">
                    {quotation.version}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#674636]">
                    ${quotation.laborCost?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#674636]">
                    ${quotation.materialCost?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#674636]">
                    ${quotation.serviceCost?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#674636]">
                    ${quotation.contingencyCost?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#674636]">
                    ${quotation.total ? quotation.total.toLocaleString() : '0'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleView(quotation)}
                      className="px-4 py-2 bg-[#F7EED3] border border-[#AAB396] rounded-md text-sm font-medium text-[#674636] hover:bg-[#AAB396] hover:text-white"
                    >
                      Generate
                    </button>
                  </td>
                </tr>
              ))}
              {paginatedQuotations.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center text-[#AAB396]">No quotations found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredQuotations.length > 0 && (
          <div className="px-6 py-3 flex items-center justify-between border-t border-[#AAB396] bg-[#F7EED3]">
            <div className="text-sm text-[#674636]">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredQuotations.length)}{' '}
              of {filteredQuotations.length} entries
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-md ${
                  currentPage === 1
                    ? 'text-[#AAB396] cursor-not-allowed'
                    : 'text-[#674636] hover:bg-[#FFF8E8]'
                }`}
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-md ${
                      currentPage === page
                        ? 'bg-[#674636] text-[#FFF8E8]'
                        : 'text-[#674636] hover:bg-[#FFF8E8]'
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className={`p-2 rounded-md ${
                  currentPage === totalPages
                    ? 'text-[#AAB396] cursor-not-allowed'
                    : 'text-[#674636] hover:bg-[#FFF8E8]'
                }`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
      )}

      {/* Create Quotation Modal */}
      {showCreateModal && selectedQuotation && (
        <CreateQuotationModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreated}
          projectId={selectedQuotation.projectId}
          estimateVersion={selectedQuotation.version}
          materials={materials}
        />
      )}
    </div>
  );
};
