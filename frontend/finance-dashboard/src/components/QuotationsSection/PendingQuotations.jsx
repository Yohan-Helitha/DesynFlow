import React, { useState } from 'react'
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
import { ViewQuotationModal } from './ViewQuotationModal'

// Mock data for pending quotations
const pendingQuotations = [
  {
    id: 'QT-001',
    estimationId: 'EST-007',
    clientName: 'Robert Anderson',
    clientEmail: 'robert@example.com',
    clientPhone: '555-456-7890',
    projectType: 'Commercial Renovation',
    totalAmount: 4200,
    validUntil: '2023-07-14',
    status: 'Pending',
    createdDate: '2023-06-14',
    createdBy: 'Ali Raza',
  },
  {
    id: 'QT-002',
    estimationId: 'EST-006',
    clientName: 'Jessica Taylor',
    clientEmail: 'jessica@example.com',
    clientPhone: '555-345-6789',
    projectType: 'Residential Renovation',
    totalAmount: 1800,
    validUntil: '2023-07-17',
    status: 'Pending',
    createdDate: '2023-06-17',
    createdBy: 'Ali Raza',
  },
  {
    id: 'QT-003',
    estimationId: 'EST-010',
    clientName: 'William Johnson',
    clientEmail: 'william@example.com',
    clientPhone: '555-234-5678',
    projectType: 'Commercial Installation',
    totalAmount: 3500,
    validUntil: '2023-07-20',
    status: 'Pending',
    createdDate: '2023-06-20',
    createdBy: 'Ali Raza',
  },
  {
    id: 'QT-004',
    estimationId: 'EST-011',
    clientName: 'Elizabeth Brown',
    clientEmail: 'elizabeth@example.com',
    clientPhone: '555-876-5432',
    projectType: 'Residential Installation',
    totalAmount: 2200,
    validUntil: '2023-07-22',
    status: 'Pending',
    createdDate: '2023-06-22',
    createdBy: 'Ali Raza',
  },
]

export const PendingQuotations = () => {
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedQuotation, setSelectedQuotation] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState('createdDate')
  const [sortDirection, setSortDirection] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)

  const handleView = (quotation) => {
    setSelectedQuotation(quotation)
    setShowViewModal(true)
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
  const filteredQuotations = pendingQuotations
    .filter(
      (quotation) =>
        quotation.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quotation.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quotation.projectType.toLowerCase().includes(searchTerm.toLowerCase())
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
    currentPage * itemsPerPage
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 mr-3">
            <FileText size={20} />
          </div>
          <h2 className="text-xl font-semibold">Pending Quotations</h2>
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

      {/* Pending Quotations Table */}
      <div className="bg-white shadow-sm rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  { key: 'id', label: 'Quotation ID' },
                  { key: 'estimationId', label: 'Estimation ID' },
                  { key: 'clientName', label: 'Client Name' },
                  { key: 'projectType', label: 'Project Type', sortable: false },
                  { key: 'totalAmount', label: 'Total Amount' },
                  { key: 'validUntil', label: 'Valid Until' },
                ].map((col) => (
                  <th
                    key={col.key}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => col.sortable !== false && handleSort(col.key)}
                  >
                    <div className="flex items-center">
                      {col.label}
                      {col.sortable !== false && (
                        <ArrowUpDown size={14} className="ml-1" />
                      )}
                    </div>
                  </th>
                ))}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
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
                    {quotation.estimationId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {quotation.clientName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {quotation.projectType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${quotation.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {quotation.validUntil}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      {quotation.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleView(quotation)}
                      className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded-md mr-2"
                    >
                      <Eye size={16} className="inline mr-1" />
                      View
                    </button>
                    <button className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded-md mr-2">
                      <Check size={16} className="inline mr-1" />
                      Approve
                    </button>
                    <button className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded-md">
                      <X size={16} className="inline mr-1" />
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
              {paginatedQuotations.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No quotations found
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
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
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
                )
              )}
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
