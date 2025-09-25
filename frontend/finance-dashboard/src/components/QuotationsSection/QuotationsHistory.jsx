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


export const ApprovedQuotations = () => {
  const [quotations, setQuotations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedQuotation, setSelectedQuotation] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState('updatedAt')
  const [sortDirection, setSortDirection] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)


  useEffect(() => {
    setLoading(true)
    fetch('/api/quotations')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch quotations')
        return res.json()
      })
      .then(data => {
        setQuotations(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const handleView = (quotation) => {
    setSelectedQuotation(quotation)
    setShowViewModal(true)
  }

  const handleSendToClient = (quotationId) => {
    console.log(`Send quotation ${quotationId} to client`)
    // In a real app, you would call an API to send the quotation
  }

  const handleDownload = (quotationId) => {
    console.log(`Download quotation ${quotationId}`)
    // In a real app, you would generate and download a PDF
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
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-500 mr-3">
            <FileText size={20} />
          </div>
          <h2 className="text-xl font-semibold">Quotations History</h2>
        </div>
        <div className="flex space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search quotations..."
              className="pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Filter size={16} className="text-gray-400" />
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('projectId')}>Project Name<ArrowUpDown size={14} className="ml-1" /></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('createdBy')}>Client Name<ArrowUpDown size={14} className="ml-1" /></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('grandTotal')}>Grand Total<ArrowUpDown size={14} className="ml-1" /></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('status')}>Status<ArrowUpDown size={14} className="ml-1" /></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('updatedAt')}>Approved Date<ArrowUpDown size={14} className="ml-1" /></th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-[#F7EED3] divide-y divide-[#AAB396]">
              {paginatedQuotations.map((quotation) => {
                const projDisp = getProjectDisplay(quotation);
                const userDisp = getUserDisplay(quotation.createdBy);
                return (
                  <tr key={quotation._id} className="hover:bg-[#FFF8E8]">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#674636]">{quotation._id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#674636]">{projDisp}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#674636]">{userDisp || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#674636]">${quotation.grandTotal?.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{quotation.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#674636]">{quotation.updatedAt ? new Date(quotation.updatedAt).toLocaleDateString() : ''}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleView(quotation)} className="text-[#674636] hover:text-[#FFF8E8] bg-[#F7EED3] hover:bg-[#674636] px-3 py-1 rounded-md mr-2">
                        <Eye size={16} className="inline mr-1" />View
                      </button>
                      <button onClick={() => handleDownload(quotation._id)} className="text-purple-600 hover:text-purple-900 bg-purple-50 px-3 py-1 rounded-md mr-2">
                        <Download size={16} className="inline mr-1" />Download
                      </button>
                    </td>
                  </tr>
                );
              })}
              {paginatedQuotations.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-gray-500"
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
          <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-500">
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
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-100'
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
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
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
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-100'
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
        <ViewQuotationModal
          quotation={selectedQuotation}
          onClose={() => setShowViewModal(false)}
        />
      )}
    </div>
  )
}
