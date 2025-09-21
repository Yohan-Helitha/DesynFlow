import React, { useState } from 'react'
import {
  ShoppingCart,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Check,
  X,
} from 'lucide-react'
import { ViewPurchaseOrderModal } from './ViewPurchaseOrderModal'

// Mock data for pending purchase orders
const pendingPurchaseOrders = [
  {
    id: 'PO-001',
    projectId: 'PRJ-001',
    projectName: 'Commercial Building Renovation',
    requestedBy: 'John Smith',
    requestedDate: '2023-06-15',
    vendor: 'ABC Supplies Inc.',
    totalAmount: 2500,
    deliveryDate: '2023-06-25',
    status: 'Pending Approval',
    priority: 'High',
    items: [
      { id: 1, name: 'Premium Paint', quantity: 10, unitPrice: 50, total: 500 },
      { id: 2, name: 'Construction Materials', quantity: 5, unitPrice: 200, total: 1000 },
      { id: 3, name: 'Tools', quantity: 2, unitPrice: 500, total: 1000 },
    ],
  },
  {
    id: 'PO-002',
    projectId: 'PRJ-002',
    projectName: 'Residential Kitchen Remodeling',
    requestedBy: 'Sarah Johnson',
    requestedDate: '2023-06-16',
    vendor: 'XYZ Home Supplies',
    totalAmount: 3800,
    deliveryDate: '2023-06-28',
    status: 'Pending Approval',
    priority: 'Medium',
    items: [
      { id: 1, name: 'Kitchen Cabinets', quantity: 5, unitPrice: 400, total: 2000 },
      { id: 2, name: 'Countertop Material', quantity: 3, unitPrice: 500, total: 1500 },
      { id: 3, name: 'Fixtures', quantity: 6, unitPrice: 50, total: 300 },
    ],
  },
  {
    id: 'PO-003',
    projectId: 'PRJ-003',
    projectName: 'Office Space Renovation',
    requestedBy: 'Michael Brown',
    requestedDate: '2023-06-18',
    vendor: 'Office Supplies Co.',
    totalAmount: 5200,
    deliveryDate: '2023-06-30',
    status: 'Pending Approval',
    priority: 'Low',
    items: [
      { id: 1, name: 'Office Partitions', quantity: 8, unitPrice: 300, total: 2400 },
      { id: 2, name: 'Lighting Fixtures', quantity: 20, unitPrice: 80, total: 1600 },
      { id: 3, name: 'Electrical Supplies', quantity: 1, unitPrice: 1200, total: 1200 },
    ],
  },
]

export const PendingPurchaseOrders = () => {
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedPO, setSelectedPO] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState('requestedDate')
  const [sortDirection, setSortDirection] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)

  const handleView = (po) => {
    setSelectedPO(po)
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

  // Filter and sort purchase orders
  const filteredPOs = pendingPurchaseOrders
    .filter(
      (po) =>
        po.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        po.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        po.vendor.toLowerCase().includes(searchTerm.toLowerCase()),
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
  const itemsPerPage = 3
  const totalPages = Math.ceil(filteredPOs.length / itemsPerPage)
  const paginatedPOs = filteredPOs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 mr-3">
            <ShoppingCart size={20} />
          </div>
          <h2 className="text-xl font-semibold">Pending Purchase Orders</h2>
        </div>
        <div className="flex space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search purchase orders..."
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

      {/* Pending Purchase Orders Table */}
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
                    PO Number
                    <ArrowUpDown size={14} className="ml-1" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('projectName')}
                >
                  <div className="flex items-center">
                    Project
                    <ArrowUpDown size={14} className="ml-1" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('vendor')}
                >
                  <div className="flex items-center">
                    Vendor
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
                  onClick={() => handleSort('requestedDate')}
                >
                  <div className="flex items-center">
                    Requested Date
                    <ArrowUpDown size={14} className="ml-1" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('deliveryDate')}
                >
                  <div className="flex items-center">
                    Delivery Date
                    <ArrowUpDown size={14} className="ml-1" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('priority')}
                >
                  <div className="flex items-center">
                    Priority
                    <ArrowUpDown size={14} className="ml-1" />
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedPOs.map((po) => (
                <tr key={po.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {po.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {po.projectName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {po.vendor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${po.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {po.requestedDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {po.deliveryDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        po.priority === 'High'
                          ? 'bg-red-100 text-red-800'
                          : po.priority === 'Medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {po.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleView(po)}
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
              {paginatedPOs.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    No purchase orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredPOs.length > 0 && (
          <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredPOs.length)} of{' '}
              {filteredPOs.length} entries
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
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
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

      {/* View Purchase Order Modal */}
      {showViewModal && (
        <ViewPurchaseOrderModal
          purchaseOrder={selectedPO}
          onClose={() => setShowViewModal(false)}
        />
      )}
    </div>
  )
}
