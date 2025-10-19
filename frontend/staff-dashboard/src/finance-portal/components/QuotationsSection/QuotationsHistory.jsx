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
  const [showSendConfirm, setShowSendConfirm] = useState(false)
  const [quotationToSend, setQuotationToSend] = useState(null)

  const reload = async () => {
    setLoading(true)
    try {
      // Add cache-busting to ensure we get fresh data from server
      const bustParam = `_=${Date.now()}`;
      const data = await safeFetchJson(`/api/quotations?${bustParam}`)
      console.log('[QuotationsHistory] Loaded quotations:', data?.length || 0, 'items');
      if (data && data.length > 0) {
        console.log('[QuotationsHistory] First quotation fileUrl:', data[0].fileUrl);
        console.log('[QuotationsHistory] First quotation full:', data[0]);
      }
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

  // Auto-refresh removed - users can manually refresh if needed

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
      const normalize = (u) => {
        if (!u) return null;
        const s = String(u).replace(/\\/g, '/');
        if (/^https?:\/\//i.test(s)) return s;
        return s.startsWith('/') ? s : `/${s}`;
      };

      let url = quotation?.fileUrl
      console.log('[QuotationsHistory] Download: Initial fileUrl from row:', url);
      
      if (!url && quotation?._id) {
        console.log('[QuotationsHistory] No fileUrl in row, fetching full quotation...');
        const full = await safeFetchJson(`/api/quotations/${quotation._id}`)
        url = full?.fileUrl
        console.log('[QuotationsHistory] Fetched fileUrl:', url);
      }
      if (!url) {
        alert('No PDF available for this quotation yet.')
        return
      }
      const base = normalize(url);
      const bust = Date.now();
      const withBust = base ? `${base}${base.includes('?') ? '&' : '?'}v=${bust}` : base;
      console.log('[QuotationsHistory] Opening PDF with cache-bust:', withBust);
      if (!withBust) {
        alert('Failed to open quotation PDF.');
        return;
      }
      window.open(withBust, '_blank', 'noopener')
    } catch (err) {
      console.error('[QuotationsHistory] Download error:', err);
      alert('Failed to open quotation PDF.')
    }
  }

  const handleUpdate = async (updated) => {
    try {
      // The modal already saved and returned the updated quotation (with new fileUrl)
      console.log('[QuotationsHistory] Quotation updated:', updated._id, 'new fileUrl:', updated.fileUrl);
      setShowViewModal(false)
      setSelectedQuotation(null)
      await reload()
    } catch (err) {
      alert(err.message || 'Failed to update quotation')
    }
  }

  const handleSendClick = (quotation) => {
    setQuotationToSend(quotation)
    setShowSendConfirm(true)
  }

  const handleSendConfirm = async () => {
    try {
      const response = await safeFetchJson(`/api/quotations/${quotationToSend._id}/send`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sentTo: quotationToSend.clientId || quotationToSend.projectId?.clientId })
      })
      
      if (response) {
        setShowSendConfirm(false)
        setQuotationToSend(null)
        await reload()
        alert('Quotation sent successfully!')
      }
    } catch (err) {
      console.error('[QuotationsHistory] Send error:', err)
      alert(err.message || 'Failed to send quotation')
    }
  }

  const handleSendCancel = () => {
    setShowSendConfirm(false)
    setQuotationToSend(null)
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
            <thead className="bg-[#F7EED3]">
              <tr>
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
                  <div className="flex items-center">Created Date & Time<ArrowUpDown size={14} className="ml-1" /></div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[#674636] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-[#FFF8E8] divide-y divide-[#AAB396]">
              {paginatedQuotations.map((quotation) => {
                const projDisp = getProjectDisplay(quotation);
                
                return (
                  <tr key={quotation._id} className="hover:bg-[#F7EED3]">
                    <td className="px-6 py-4 text-xs font-mono text-[#674636] whitespace-pre-line break-words max-w-xs">{projDisp}</td>
                    <td className="px-6 py-4 text-xs font-mono text-[#674636] whitespace-pre-line break-words max-w-xs">LKR {quotation.grandTotal?.toLocaleString()}</td>
                    <td className="px-6 py-4 text-xs font-mono text-[#674636] whitespace-pre-line break-words max-w-xs">{quotation.status}</td>
                    <td className="px-6 py-4 text-xs font-mono text-[#674636] whitespace-pre-line break-words max-w-xs">{
                      quotation.createdAt
                        ? new Date(quotation.createdAt).toLocaleString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                          })
                        : ''
                    }</td>
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
                          onClick={() => handleSendClick(quotation)}
                          disabled={quotation.status === 'Sent' || quotation.status === 'Confirmed' || quotation.status === 'Locked'}
                          className={`px-3 py-1 rounded-md flex items-center transition-colors ${
                            quotation.status === 'Sent' || quotation.status === 'Confirmed' || quotation.status === 'Locked'
                              ? 'bg-[#AAB396] text-[#FFF8E8] opacity-50 cursor-not-allowed'
                              : 'bg-[#674636] text-[#FFF8E8] hover:bg-[#AAB396] hover:text-[#674636]'
                          }`}
                        >
                          <Send size={16} className="inline mr-1" />
                          Send
                        </button>
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
                    colSpan={5}
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

      {/* Send Confirmation Popup */}
      {showSendConfirm && quotationToSend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-[#FFF8E8] rounded-lg shadow-lg p-6 max-w-md w-full mx-4 border-2 border-[#674636]">
            <div className="flex items-center mb-4">
              <Send size={24} className="text-[#674636] mr-3" />
              <h3 className="text-lg font-semibold text-[#674636]">Send Quotation</h3>
            </div>
            
            <p className="text-[#674636] mb-6">
              Are you sure you want to send this quotation to the client? 
              The status will be changed to <span className="font-semibold">"Sent"</span>.
            </p>

            <div className="bg-[#F7EED3] rounded p-3 mb-6 border border-[#AAB396]">
              <p className="text-sm text-[#674636]">
                <span className="font-medium">Project:</span> {getProjectDisplay(quotationToSend)}
              </p>
              <p className="text-sm text-[#674636] mt-1">
                <span className="font-medium">Grand Total:</span> LKR {quotationToSend.grandTotal?.toLocaleString()}
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleSendCancel}
                className="px-4 py-2 bg-[#F7EED3] border border-[#AAB396] rounded-md text-sm font-medium text-[#674636] hover:bg-[#AAB396] hover:text-[#FFF8E8] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendConfirm}
                className="px-4 py-2 bg-[#674636] border border-transparent rounded-md text-sm font-medium text-[#FFF8E8] hover:bg-[#AAB396] transition-colors"
              >
                Yes, Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
