import React, { useState } from 'react'
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

// Mock data for approved quotations
const approvedQuotations = [
  {
    id: 'QT-005',
    estimationId: 'EST-012',
    clientName: 'Michael Davis',
    clientEmail: 'michael@example.com',
    clientPhone: '555-123-4567',
    projectType: 'Commercial Installation',
    totalAmount: 5600,
    validUntil: '2023-07-10',
    status: 'Approved',
    createdDate: '2023-06-10',
    approvedDate: '2023-06-11',
    createdBy: 'Ali Raza',
    approvedBy: 'Manager',
    sentToClient: true,
    clientViewed: true,
    clientResponse: 'Accepted',
  },
  {
    id: 'QT-006',
    estimationId: 'EST-013',
    clientName: 'Sarah Wilson',
    clientEmail: 'sarah@example.com',
    clientPhone: '555-987-6543',
    projectType: 'Residential Renovation',
    totalAmount: 2800,
    validUntil: '2023-07-12',
    status: 'Approved',
    createdDate: '2023-06-12',
    approvedDate: '2023-06-13',
    createdBy: 'Ali Raza',
    approvedBy: 'Manager',
    sentToClient: true,
    clientViewed: false,
    clientResponse: 'Pending',
  },
  {
    id: 'QT-007',
    estimationId: 'EST-014',
    clientName: 'James Thompson',
    clientEmail: 'james@example.com',
    clientPhone: '555-456-7890',
    projectType: 'Industrial Installation',
    totalAmount: 7200,
    validUntil: '2023-07-15',
    status: 'Approved',
    createdDate: '2023-06-15',
    approvedDate: '2023-06-16',
    createdBy: 'Ali Raza',
    approvedBy: 'Manager',
    sentToClient: false,
    clientViewed: false,
    clientResponse: 'Pending',
  },
]

export const ApprovedQuotations = () => {
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedQuotation, setSelectedQuotation] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState('approvedDate')
  const [sortDirection, setSortDirection] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)

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

  // Filter and sort quotations
  const filteredQuotations = approvedQuotations
    .filter(
      (quotation) =>
        quotation.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quotation.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quotation.projectType.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      if (a[sortField] < b[sortField]) {
        return sortDirection === 'asc' ? -1 : 1
      }
      if (a[sortField] > b[sortField]) {
        return sortDirection === 'asc' ? 1 : -1
      }
      return 0
    })

  // Pagination
  const itemsPerPage = 4
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
          <h2 className="text-xl font-semibold">Approved Quotations</h2>
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
      <div className="bg-white shadow-sm rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('id')}
                >
                  <div className="flex items-center">
                    Quotation ID
                    <ArrowUpDown size={14} className="ml-1" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('clientName')}
                >
                  <div className="flex items-center">
                    Client Name
                    <ArrowUpDown size={14} className="ml-1" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('totalAmount')}
                >
                  <div className="flex items-center">
                    Total Amount
                    <ArrowUpDown size={14} className="ml-1" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('approvedDate')}
                >
                  <div className="flex items-center">
                    Approved Date
                    <ArrowUpDown size={14} className="ml-1" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedQuotations.map((quotation) => (
                <tr key={quotation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {quotation.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {quotation.clientName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${quotation.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {quotation.approvedDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {!quotation.sentToClient ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        Not Sent
                      </span>
                    ) : !quotation.clientViewed ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        Sent, Not Viewed
                      </span>
                    ) : quotation.clientResponse === 'Accepted' ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Accepted
                      </span>
                    ) : quotation.clientResponse === 'Rejected' ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Rejected
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Viewed, Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleView(quotation)}
                      className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded-md mr-2"
                    >
                      <Eye size={16} className="inline mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => handleDownload(quotation.id)}
                      className="text-purple-600 hover:text-purple-900 bg-purple-50 px-3 py-1 rounded-md mr-2"
                    >
                      <Download size={16} className="inline mr-1" />
                      Download
                    </button>
                    {!quotation.sentToClient && (
                      <button
                        onClick={() => handleSendToClient(quotation.id)}
                        className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded-md"
                      >
                        <Send size={16} className="inline mr-1" />
                        Send
                      </button>
                    )}
                  </td>
                </tr>
              ))}
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
