import React, { useEffect, useState } from 'react'
import { ShoppingCart, Filter, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { ViewPurchaseOrderModal } from './ViewPurchaseOrderModal'

export const ApprovedPurchaseOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedPO, setSelectedPO] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState('updatedAt')
  const [sortDirection, setSortDirection] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)

  const fetchOrders = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/purchase-orders')
      if (!res.ok) throw new Error('Failed to fetch purchase orders')
      const data = await res.json()
      const filtered = (Array.isArray(data) ? data : []).filter(
        (po) => po.status !== 'Draft' && po.status !== 'PendingFinanceApproval'
      )
      setOrders(filtered)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrders() }, [])

  const mapToViewModel = (po) => {
    return {
      id: po._id,
      projectId: po.projectId?._id || po.projectId || '-',
      projectName: po.projectId?.projectName || '-',
      requestedBy: po.requestedBy?.name || po.requestedBy?.email || '-',
      requestedDate: po.createdAt ? new Date(po.createdAt).toLocaleDateString() : '-',
      approvedBy: '-', 
      approvedDate: po.financeApproval?.approvedAt ? new Date(po.financeApproval.approvedAt).toLocaleDateString() : '-',
      vendor: po.supplierId?.name || '-',
      totalAmount: Number(po.totalAmount) || 0,
      deliveryDate: '-', 
      deliveryStatus: '-', 
      status: po.status,
      priority: '-',
      items: (po.items || []).map((it, idx) => ({
        id: it._id || idx + 1,
        name: (it.materialId && typeof it.materialId === 'object' ? it.materialId.materialName : (it.materialName || String(it.materialId || ''))) || '-',
        quantity: it.qty,
        unitPrice: Number(it.unitPrice) || 0,
        total: (Number(it.qty) || 0) * (Number(it.unitPrice) || 0),
      })),
    }
  }

  const openView = async (id) => {
    try {
      const res = await fetch(`/api/purchase-orders/${id}`)
      if (!res.ok) throw new Error('Failed to fetch purchase order details')
      const data = await res.json()
      setSelectedPO(mapToViewModel(data))
      setShowViewModal(true)
    } catch (e) {
      setError(e.message)
    }
  }

  const handleSort = (field) => {
    if (sortField === field) setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDirection('asc') }
  }

  const filtered = orders
    .filter((po) => {
      const q = searchTerm.toLowerCase()
      return (
        (po._id && String(po._id).toLowerCase().includes(q)) ||
        (po.status && String(po.status).toLowerCase().includes(q))
      )
    })
    .sort((a, b) => {
      const av = a[sortField]
      const bv = b[sortField]
      if (av === bv) return 0
      if (av == null) return 1
      if (bv == null) return -1
      return av < bv ? (sortDirection === 'asc' ? -1 : 1) : (sortDirection === 'asc' ? 1 : -1)
    })

  const itemsPerPage = 10
  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  if (loading) return <div className="p-8 text-center text-[#AAB396]">Loading approved purchase orders…</div>
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>

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

      <div className="bg-[#FFF8E8] shadow-sm rounded-md overflow-hidden border border-[#AAB396]">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#AAB396]">
            <thead className="bg-[#F7EED3]">
              <tr>
                {[{ key: '_id', label: 'PO ID' }, { key: 'status', label: 'Status' }, { key: 'totalAmount', label: 'Total Amount' }, { key: 'updatedAt', label: 'Updated At' }].map(({ key, label }) => (
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
                <th className="px-6 py-3 text-right text-xs font-medium text-[#674636] uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-[#FFF8E8] divide-y divide-[#AAB396]">
              {paginated.map((po) => (
                <tr key={po._id} className="hover:bg-[#F7EED3]">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#674636]">{po._id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#674636]">{po.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#674636]">${(Number(po.totalAmount)||0).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#674636]">{po.updatedAt ? new Date(po.updatedAt).toLocaleString() : '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => openView(po._id)} className="px-4 py-2 bg-[#F7EED3] border border-[#AAB396] rounded-md text-sm font-medium text-[#674636] hover:bg-[#AAB396] hover:text-white">Open</button>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-[#AAB396]">No purchase orders found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="px-6 py-3 flex items-center justify-between border-t border-[#AAB396] bg-[#F7EED3]">
            <div className="text-sm text-[#674636]">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} entries
            </div>
            <div className="flex space-x-2">
              <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className={`p-2 rounded-md ${currentPage === 1 ? 'text-[#AAB396] cursor-not-allowed' : 'text-[#674636] hover:bg-[#FFF8E8]'}`}>
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button key={page} onClick={() => setCurrentPage(page)} className={`w-8 h-8 rounded-md ${currentPage === page ? 'bg-[#674636] text-[#FFF8E8]' : 'text-[#674636] hover:bg-[#FFF8E8]'}`}>
                  {page}
                </button>
              ))}
              <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className={`p-2 rounded-md ${currentPage === totalPages ? 'text-[#AAB396] cursor-not-allowed' : 'text-[#674636] hover:bg-[#FFF8E8]'}`}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {showViewModal && selectedPO && (
        <ViewPurchaseOrderModal
          purchaseOrder={selectedPO}
          onClose={() => setShowViewModal(false)}
        />
      )}
    </div>
  )
}
