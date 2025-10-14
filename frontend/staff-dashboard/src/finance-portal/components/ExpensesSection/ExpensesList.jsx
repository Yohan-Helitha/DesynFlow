import React, { useState, useEffect } from 'react'
import {
  DollarSign,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Plus,
  Download,
} from 'lucide-react'
import { ViewExpenseModal } from './ViewExpenseModal'
import { AddExpenseModal } from './AddExpenseModal'


export const ExpensesList = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchExpenses = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/expenses');
        const data = await res.json();
        setExpenses(data);
      } catch (err) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, []);

  const handleView = (expense) => {
    setSelectedExpense(expense)
    setShowViewModal(true)
  }

  const handleAddExpense = () => setShowAddModal(true)

  const handleCreated = (created) => {
    // Normalize createdAt to Date for sorting
    const normalize = (e) => ({
      ...e,
      createdAt: e.createdAt || new Date().toISOString(),
    })
    setExpenses((prev) => {
      const next = [normalize(created), ...prev]
      return next
    })
    // Ensure newest shows first page
    setCurrentPage(1)
  }

  const handleUpdated = (updated) => {
    setExpenses((prev) => prev.map(e => (e._id === updated._id ? { ...e, ...updated } : e)))
    // Keep modal in sync if it's open on this expense
    setSelectedExpense((cur) => (cur && (cur._id === updated._id) ? { ...cur, ...updated } : cur))
  }

  const handleDownloadReceipt = (receiptUrl) => {
    console.log(`Downloading receipt from ${receiptUrl}`)
    // Implement actual download if needed
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Compute an effective date for sorting
  const getEffectiveDate = (e) => {
    const val = e.createdAt || e.date || e.updatedAt
    return val ? new Date(val).getTime() : 0
  }

  // Filter and sort expenses
  const filteredExpenses = expenses
    .filter(
      (expense) =>
        (statusFilter === 'all' ||
          (statusFilter === 'approved' && expense.status === 'Approved') ||
          (statusFilter === 'pending' && expense.status === 'Pending')) &&
        ((expense.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (expense.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (expense.projectId?.projectName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (expense.submittedBy || '').toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortField === 'date' || sortField === 'createdAt') {
        const ad = getEffectiveDate(a)
        const bd = getEffectiveDate(b)
        return sortDirection === 'asc' ? ad - bd : bd - ad
      }
      if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1
      if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

  // Pagination
  const itemsPerPage = 10
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage)
  const paginatedExpenses = filteredExpenses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div>
      {/* Header and Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-[#F7EED3] flex items-center justify-center text-[#674636] mr-3">
            <DollarSign size={20} />
          </div>
          <h2 className="text-xl font-semibold text-[#674636]">Expenses List</h2>
        </div>
        <div className="flex space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search expenses..."
              className="pl-3 pr-10 py-2 border border-[#AAB396] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#674636] focus:border-transparent bg-[#F7EED3] placeholder-[#AAB396] text-[#674636]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Filter size={16} className="text-[#AAB396]" />
            </button>
          </div>
          <button
            onClick={handleAddExpense}
            className="bg-[#674636] text-[#FFF8E8] px-4 py-2 rounded-md text-sm font-medium hover:bg-[#AAB396] flex items-center"
          >
            <Plus size={16} className="mr-2" /> Add Expense
          </button>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-[#FFF8E8] shadow-sm rounded-md overflow-hidden border border-[#AAB396]">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-center text-[#AAB396]">Loading...</div>
          ) : error ? (
            <div className="p-6 text-center text-red-500">{error}</div>
          ) : (
            <table className="min-w-full divide-y divide-[#AAB396]">
              <thead className="bg-[#F7EED3]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase">Project Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase">Amount ($)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase">Description</th>
                  
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[#674636] uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-[#FFF8E8] divide-y divide-[#AAB396]">
                {paginatedExpenses.map((expense) => (
                  <tr key={expense._id || expense.id} className="hover:bg-[#F7EED3]">
                    <td className="px-6 py-4 text-xs font-mono text-[#674636] whitespace-pre-line break-words max-w-xs">
                      {expense.projectId?.projectName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-[#674636] whitespace-pre-line break-words max-w-xs">{expense.category}</td>
                    <td className="px-6 py-4 text-xs font-mono text-[#674636] whitespace-pre-line break-words max-w-xs">{expense.amount}</td>
                    <td className="px-6 py-4 text-xs font-mono text-[#674636] whitespace-pre-line break-words max-w-xs">{expense.description}</td>
                    
                    <td className="px-6 py-4 text-xs font-mono text-[#674636] whitespace-pre-line break-words max-w-xs">
                      {expense.date
                        ? new Date(expense.date).toLocaleString()
                        : expense.createdAt
                        ? new Date(expense.createdAt).toLocaleString()
                        : '-'}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono whitespace-pre-line break-words max-w-xs text-right font-medium">
                      <button onClick={() => handleView(expense)} className="px-4 py-2 bg-[#F7EED3] border border-[#AAB396] rounded-md text-xs font-mono font-medium text-[#674636] hover:bg-[#AAB396] hover:text-white mr-2">
                        <Eye size={16} className="inline mr-1" /> View
                      </button>
                    </td>
                  </tr>
                ))}
                {paginatedExpenses.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-[#AAB396]">
                      No expenses found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {filteredExpenses.length > 0 && (
          <div className="px-6 py-3 flex items-center justify-between border-t border-[#AAB396] bg-[#F7EED3]">
            <div className="text-sm text-[#674636]">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredExpenses.length)} of {filteredExpenses.length} entries
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

      {/* Modals */}
      {showViewModal && (
        <ViewExpenseModal
          expense={selectedExpense}
          onClose={() => setShowViewModal(false)}
          onUpdated={handleUpdated}
        />
      )}
      {showAddModal && (
        <AddExpenseModal
          onClose={() => setShowAddModal(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  )
}
