import React, { useState, useEffect } from 'react'
import {
  FileText,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Send,
  Download,
} from 'lucide-react'
import { ViewQuotationModal } from './ViewQuotationModal'
import UpdateQuotationModal from './UpdateQuotationModal'
import { safeFetchJson } from '../../utils/safeFetch'


export const ApprovedQuotations = () => {
  const [quotations, setQuotations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedQuotation, setSelectedQuotation] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState('createdAt')
  const [sortDirection, setSortDirection] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)

  const reload = async () => {
    setLoading(true)
    try {
      const data = await safeFetchJson('/api/quotations')
      console.log('[QuotationsHistory] Loaded quotations:', data?.length || 0, 'items');
      console.log('[QuotationsHistory] Sample quotation:', data?.[0]);
      setQuotations(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('[QuotationsHistory] Error loading quotations:', err);
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    reload()
  }, [])

  // Add interval to auto-refresh quotations list
  useEffect(() => {
    const interval = setInterval(() => {
      reload()
    }, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const openModalWith = async (quotation, enableEdit) => {
    try {
      const full = await safeFetchJson(`/api/quotations/${quotation._id}`)
      setSelectedQuotation(full || quotation)
    } catch (_) {
      setSelectedQuotation(quotation)
    }
    setEditMode(!!enableEdit)
    setShowViewModal(true)
  }

  const handleView = (quotation) => openModalWith(quotation, false)
  const handleGenerate = (quotation) => {
    const blocked = ['Confirmed', 'Locked'].includes(quotation?.status)
    if (blocked) return
    return openModalWith(quotation, true)
  }

  const handleDownload = async (quotation) => {
    try {
      let url = quotation?.fileUrl
      if (!url && quotation?._id) {
        const full = await safeFetchJson(`/api/quotations/${quotation._id}`)
        url = full?.fileUrl
      }
      if (!url) {
        alert('No PDF available for this quotation yet.')
        return
      }
      const isAbsolute = /^https?:\/\//i.test(url)
      if (!isAbsolute && !url.startsWith('/')) url = '/' + url
      window.open(url, '_blank', 'noopener')
    } catch (err) {
      alert('Failed to open quotation PDF.')
    }
  }

  const handleUpdate = async (updated) => {
    try {
      const payload = {
        laborItems: updated.laborItems || [],
        materialItems: updated.materialItems || [],
        serviceItems: updated.serviceItems || [],
        contingencyItems: updated.contingencyItems || [],
        taxes: updated.taxes || [],
        remarks: updated.remarks || ''
      }
      await safeFetchJson(`/api/quotations/${updated._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      setShowViewModal(false)
      setSelectedQuotation(null)
      await reload()
    } catch (err) {
      alert(err.message || 'Failed to update quotation')
    }
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Helpers to safely derive display strings
  const getProjectDisplay = (q) => {
    const p = q.projectId;
    if (!p) return '';
    if (typeof p === 'string') return p;
    if (p.projectName) return p.projectName;
    if (p._id) return String(p._id);
    return '';
  };
  const getUserDisplay = (u) => {
    if (!u) return '';
    if (typeof u === 'string') return u;
    if (u.name) return u.name;
    if (u.email) return u.email;
    if (u._id) return String(u._id);
    return '';
  };
  const getSortValue = (q, field) => {
    switch (field) {
      case 'projectId':
        return getProjectDisplay(q).toLowerCase();
      case 'createdBy':
        return getUserDisplay(q.createdBy).toLowerCase();
      case 'createdAt':
      case 'updatedAt':
        return q[field] ? new Date(q[field]).getTime() : 0;
      case '_id':
        return String(q._id);
      default:
        return q[field] ?? '';
    }
  };

  // Filter and sort quotations
  const search = searchTerm.toLowerCase();
  const filteredQuotations = quotations
    .filter((q) => {
      const proj = getProjectDisplay(q).toLowerCase();
      const user = getUserDisplay(q.createdBy).toLowerCase();
      const id = q._id ? String(q._id).toLowerCase() : '';
      const status = q.status ? q.status.toLowerCase() : '';
      return (
        id.includes(search) ||
        proj.includes(search) ||
        user.includes(search) ||
        status.includes(search)
      );
    })
    .sort((a, b) => {
      const av = getSortValue(a, sortField);
      const bv = getSortValue(b, sortField);
      if (av < bv) return sortDirection === 'asc' ? -1 : 1;
      if (av > bv) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  // Pagination
  const itemsPerPage = 10
  const totalPages = Math.ceil(filteredQuotations.length / itemsPerPage)
  const paginatedQuotations = filteredQuotations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-[#F7EED3] flex items-center justify-center text-[#674636] mr-3">
            <FileText size={20} />
          </div>
          <h2 className="text-xl font-semibold text-[#674636]">Quotations History</h2>
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

      {/* Approved Quotations Table */}
      <div className="bg-[#F7EED3] shadow-sm rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#AAB396]">
            <thead className="bg-[#FFF8E8]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase tracking-wider cursor-pointer" onClick={() => handleSort('_id')}>
                  <div className="flex items-center">Quotation ID<ArrowUpDown size={14} className="ml-1" /></div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase tracking-wider cursor-pointer" onClick={() => handleSort('projectId')}>
                  <div className="flex items-center">Project Name<ArrowUpDown size={14} className="ml-1" /></div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase tracking-wider cursor-pointer" onClick={() => handleSort('grandTotal')}>
                  <div className="flex items-center">Grand Total<ArrowUpDown size={14} className="ml-1" /></div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase tracking-wider cursor-pointer" onClick={() => handleSort('status')}>
                  <div className="flex items-center">Status<ArrowUpDown size={14} className="ml-1" /></div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase tracking-wider cursor-pointer" onClick={() => handleSort('createdAt')}>
                  <div className="flex items-center">Created Date<ArrowUpDown size={14} className="ml-1" /></div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[#674636] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-[#F7EED3] divide-y divide-[#AAB396]">
              {paginatedQuotations.map((quotation) => {
                const projDisp = getProjectDisplay(quotation);
                
                return (
                  <tr key={quotation._id} className="hover:bg-[#FFF8E8]">
                    <td className="px-6 py-4 text-xs font-mono text-[#674636] whitespace-pre-line break-words max-w-xs">{quotation._id}</td>
                    <td className="px-6 py-4 text-xs font-mono text-[#674636] whitespace-pre-line break-words max-w-xs">{projDisp}</td>
                    <td className="px-6 py-4 text-xs font-mono text-[#674636] whitespace-pre-line break-words max-w-xs">${quotation.grandTotal?.toLocaleString()}</td>
                    <td className="px-6 py-4 text-xs font-mono text-[#674636] whitespace-pre-line break-words max-w-xs">{quotation.status}</td>
                    <td className="px-6 py-4 text-xs font-mono text-[#674636] whitespace-pre-line break-words max-w-xs">{quotation.createdAt ? new Date(quotation.createdAt).toLocaleDateString() : ''}</td>
                    <td className="px-6 py-4 text-xs font-mono text-right text-[#674636] whitespace-pre-line break-words max-w-xs font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button onClick={() => handleView(quotation)} className="text-[#674636] hover:text-[#FFF8E8] bg-[#F7EED3] hover:bg-[#674636] px-3 py-1 rounded-md flex items-center transition-colors">
                          <Eye size={16} className="inline mr-1" />View
                        </button>
                        {(() => {
                          const isLocked = ['Confirmed', 'Locked'].includes(quotation.status)
                          return (
                            <button
                              disabled={isLocked}
                              title={isLocked ? 'Quotation is locked' : 'Open editable view'}
                              onClick={() => { if (isLocked) return; handleGenerate(quotation) }}
                              className={`px-3 py-1 rounded-md flex items-center transition-colors ${
                                isLocked
                                  ? 'opacity-50 cursor-not-allowed bg-[#F7EED3] text-[#AAB396]'
                                  : 'text-[#674636] bg-[#F7EED3] hover:bg-[#AAB396] hover:text-[#FFF8E8]'
                              }`}
                            >
                              Generate
                            </button>
                          )
                        })()}
                        <button
                          onClick={() => handleDownload(quotation)}
                          className="bg-[#674636] text-[#FFF8E8] hover:bg-[#AAB396] hover:text-[#674636] px-3 py-1 rounded-md flex items-center transition-colors"
                        >
                          <Download size={16} className="inline mr-1" />
                          Download
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginatedQuotations.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-[#AAB396]"
                  >
                    No approved quotations found
                  </td>
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
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
              ))}
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

      {/* View Quotation Modal */}
      {showViewModal && (
        editMode ? (
          <UpdateQuotationModal
            quotation={selectedQuotation}
            onClose={() => setShowViewModal(false)}
            onSave={handleUpdate}
          />
        ) : (
          <ViewQuotationModal
            quotation={selectedQuotation}
            onClose={() => setShowViewModal(false)}
          />
        )
      )}
    </div>
  )
}
