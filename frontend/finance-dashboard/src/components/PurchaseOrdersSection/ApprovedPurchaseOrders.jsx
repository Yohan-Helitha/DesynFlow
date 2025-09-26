import React, { useState } from 'react'
import {
  ShoppingCart,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Download,
  Truck,
} from 'lucide-react'
import { ViewPurchaseOrderModal } from './ViewPurchaseOrderModal'

// Mock data for approved purchase orders
const approvedPurchaseOrders = [
  {
    id: 'PO-004',
    projectId: 'PRJ-004',
    projectName: 'Retail Store Renovation',
    requestedBy: 'Emily Davis',
    requestedDate: '2023-06-10',
    approvedBy: 'Ali Raza',
    approvedDate: '2023-06-11',
    vendor: 'Retail Supplies Inc.',
    totalAmount: 4800,
    deliveryDate: '2023-06-20',
    deliveryStatus: 'Delivered',
    status: 'Approved',
    priority: 'High',
    items: [
      { id: 1, name: 'Display Shelves', quantity: 12, unitPrice: 200, total: 2400 },
      { id: 2, name: 'Lighting System', quantity: 1, unitPrice: 1500, total: 1500 },
      { id: 3, name: 'Signage', quantity: 3, unitPrice: 300, total: 900 },
    ],
  },
  {
    id: 'PO-005',
    projectId: 'PRJ-005',
    projectName: 'Hospital Wing Addition',
    requestedBy: 'David Wilson',
    requestedDate: '2023-06-12',
    approvedBy: 'Ali Raza',
    approvedDate: '2023-06-13',
    vendor: 'Medical Construction Supplies',
    totalAmount: 12500,
    deliveryDate: '2023-06-25',
    deliveryStatus: 'In Transit',
    status: 'Approved',
    priority: 'High',
    items: [
      { id: 1, name: 'Medical Grade Flooring', quantity: 500, unitPrice: 15, total: 7500 },
      { id: 2, name: 'Specialized Wall Materials', quantity: 200, unitPrice: 20, total: 4000 },
      { id: 3, name: 'Door Systems', quantity: 5, unitPrice: 200, total: 1000 },
    ],
  },
  {
    id: 'PO-006',
    projectId: 'PRJ-006',
    projectName: 'School Renovation',
    requestedBy: 'Jessica Taylor',
    requestedDate: '2023-06-14',
    approvedBy: 'Ali Raza',
    approvedDate: '2023-06-15',
    vendor: 'Educational Supplies Co.',
    totalAmount: 8200,
    deliveryDate: '2023-06-28',
    deliveryStatus: 'Pending',
    status: 'Approved',
    priority: 'Medium',
    items: [
      { id: 1, name: 'Classroom Furniture', quantity: 30, unitPrice: 150, total: 4500 },
      { id: 2, name: 'Whiteboard Systems', quantity: 10, unitPrice: 200, total: 2000 },
      { id: 3, name: 'Flooring Materials', quantity: 1, unitPrice: 1700, total: 1700 },
    ],
  },
]

export const ApprovedPurchaseOrders = () => {
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedPO, setSelectedPO] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState('approvedDate')
  const [sortDirection, setSortDirection] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)

  const handleView = (po) => {
    setSelectedPO(po)
    setShowViewModal(true)
  }

  const handleDownloadPO = (poId) => {
    console.log(`Downloading purchase order ${poId}`)
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

  // Filter and sort purchase orders
  const filteredPOs = approvedPurchaseOrders
    .filter(
      (po) =>
        po.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        po.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        po.vendor.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1
      if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1
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
          <div className="w-10 h-10 rounded-full bg-[#F7EED3] flex items-center justify-center text-[#674636] mr-3">
            <ShoppingCart size={20} />
          </div>
          <h2 className="text-xl font-semibold text-[#674636]">Approved Purchase Orders</h2>
        </div>
        <div className="flex space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search purchase orders..."
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

      {/* Approved Purchase Orders Table */}
      <div className="bg-[#FFF8E8] shadow-sm rounded-md overflow-hidden border border-[#AAB396]">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#AAB396]">
            <thead className="bg-[#F7EED3]">
              <tr>
                {[
                  { key: 'id', label: 'PO Number' },
                  { key: 'projectName', label: 'Project' },
                  { key: 'vendor', label: 'Vendor' },
                  { key: 'totalAmount', label: 'Total Amount' },
                  { key: 'approvedDate', label: 'Approved Date' },
                ].map(({ key, label }) => (
                  <th
                    key={key}
                    className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort(key)}
                  >
                    <div className="flex items-center">
                      {label}
                      <ArrowUpDown size={14} className="ml-1" />
                    </div>
                  </th>
                ))}
                <th className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase tracking-wider">
                  Delivery Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[#674636] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-[#FFF8E8] divide-y divide-[#AAB396]">
              {paginatedPOs.map((po) => (
                <tr key={po.id} className="hover:bg-[#F7EED3]">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#674636]">
                    {po.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#674636]">
                    {po.projectName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#674636]">
                    {po.vendor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#674636]">
                    ${po.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#674636]">
                    {po.approvedDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#F7EED3] text-[#674636] border border-[#AAB396]">
                      {po.deliveryStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleView(po)}
                      className="px-4 py-2 bg-[#F7EED3] border border-[#AAB396] rounded-md text-sm font-medium text-[#674636] hover:bg-[#AAB396] hover:text-white mr-2"
                    >
                      <Eye size={16} className="inline mr-1" /> View
                    </button>
                    <button
                      onClick={() => handleDownloadPO(po.id)}
                      className="px-4 py-2 bg-[#F7EED3] border border-[#AAB396] rounded-md text-sm font-medium text-[#674636] hover:bg-[#AAB396] hover:text-white mr-2"
                    >
                      <Download size={16} className="inline mr-1" /> Download
                    </button>
                    {po.deliveryStatus === 'Pending' && (
                      <button className="px-4 py-2 bg-[#F7EED3] border border-[#AAB396] rounded-md text-sm font-medium text-[#674636] hover:bg-[#AAB396] hover:text-white">
                        <Truck size={16} className="inline mr-1" /> Track
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {paginatedPOs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-[#AAB396]">
                    No approved purchase orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredPOs.length > 0 && (
          <div className="px-6 py-3 flex items-center justify-between border-t border-[#AAB396] bg-[#F7EED3]">
            <div className="text-sm text-[#674636]">
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
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
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
