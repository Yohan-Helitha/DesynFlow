import React, { useState } from 'react'
import { CreditCard, Check, X, Eye } from 'lucide-react'
import { PaymentActionModal } from './PaymentActionModal'
import { ViewHistoryModal } from './ViewHistoryModal'

// Mock data for inspection payments
const inspectionPayments = [
  {
    id: 'INS-001',
    clientName: 'John Smith',
    amountPaid: 1500,
    paymentReceipt: 'https://example.com/receipt/001.pdf',
    status: 'PendingApproval',
    submittedDate: '2023-06-16',
    clientEmail: 'john@example.com',
    clientPhone: '555-123-4567',
  },
  {
    id: 'INS-002',
    clientName: 'Sarah Johnson',
    amountPaid: 1200,
    paymentReceipt: 'https://example.com/receipt/002.pdf',
    status: 'PendingApproval',
    submittedDate: '2023-06-19',
    clientEmail: 'sarah@example.com',
    clientPhone: '555-987-6543',
  },
  {
    id: 'INS-004',
    clientName: 'David Wilson',
    amountPaid: 2000,
    paymentReceipt: 'https://example.com/receipt/004.pdf',
    status: 'Approved',
    submittedDate: '2023-06-15',
    clientEmail: 'david@example.com',
    clientPhone: '555-456-7890',
  },
  {
    id: 'INS-005',
    clientName: 'Emily Davis',
    amountPaid: 1800,
    paymentReceipt: 'https://example.com/receipt/005.pdf',
    status: 'Rejected',
    submittedDate: '2023-06-14',
    clientEmail: 'emily@example.com',
    clientPhone: '555-789-0123',
  },
]

// Mock data for payment history
const paymentHistory = [
  {
    id: 'INS-001',
    history: [
      {
        amount: 1500,
        receiptLink: 'https://example.com/receipt/001.pdf',
        status: 'PendingApproval',
        actionBy: '-',
        date: '2023-06-16',
      },
    ],
  },
  {
    id: 'INS-004',
    history: [
      {
        amount: 2000,
        receiptLink: 'https://example.com/receipt/004.pdf',
        status: 'Approved',
        actionBy: 'Ali Raza',
        date: '2023-06-15',
      },
    ],
  },
  {
    id: 'INS-005',
    history: [
      {
        amount: 1800,
        receiptLink: 'https://example.com/receipt/005.pdf',
        status: 'Rejected',
        actionBy: 'Ali Raza',
        date: '2023-06-14',
        reason: 'Invalid receipt',
      },
    ],
  },
]

export const InspectionPayments = () => {
  const [showActionModal, setShowActionModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [actionType, setActionType] = useState(null)
  const [selectedHistory, setSelectedHistory] = useState([])

  const handleAction = (payment, action) => {
    setSelectedPayment(payment)
    setActionType(action)
    setShowActionModal(true)
  }

  const handleViewHistory = (paymentId) => {
    const history = paymentHistory.find((h) => h.id === paymentId)?.history || []
    setSelectedHistory(history)
    setShowHistoryModal(true)
  }

  const pendingPayments = inspectionPayments.filter((p) => p.status === 'PendingApproval')
  const approvedPayments = inspectionPayments.filter((p) => p.status === 'Approved')
  const rejectedPayments = inspectionPayments.filter((p) => p.status === 'Rejected')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 mr-3">
            <CreditCard size={20} />
          </div>
          <h2 className="text-xl font-semibold">Inspection Payments</h2>
        </div>
      </div>

      {/* Pending Approval Payments */}
      <h3 className="text-lg font-medium mb-4">Pending Approval</h3>
      <div className="bg-white shadow-sm rounded-md overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inspection ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Paid</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Receipt</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.clientName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${payment.amountPaid}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <a href={payment.paymentReceipt} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900">
                      View Receipt
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Pending Approval
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.submittedDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleAction(payment, 'approve')}
                      className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded-md mr-2"
                    >
                      <Check size={16} className="inline mr-1" /> Approve
                    </button>
                    <button
                      onClick={() => handleAction(payment, 'reject')}
                      className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded-md mr-2"
                    >
                      <X size={16} className="inline mr-1" /> Reject
                    </button>
                    <button
                      onClick={() => handleViewHistory(payment.id)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <Eye size={16} className="inline" />
                    </button>
                  </td>
                </tr>
              ))}
              {pendingPayments.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    No pending payments to approve
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approved Payments */}
      <h3 className="text-lg font-medium mb-4">Approved Payments</h3>
      <div className="bg-white shadow-sm rounded-md overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inspection ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Paid</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Receipt</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {approvedPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.clientName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${payment.amountPaid}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <a href={payment.paymentReceipt} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900">
                      View Receipt
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Approved
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.submittedDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleViewHistory(payment.id)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <Eye size={16} className="inline" />
                    </button>
                  </td>
                </tr>
              ))}
              {approvedPayments.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    No approved payments
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rejected Payments */}
      <h3 className="text-lg font-medium mb-4">Rejected Payments</h3>
      <div className="bg-white shadow-sm rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inspection ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Paid</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Receipt</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rejectedPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.clientName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${payment.amountPaid}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <a href={payment.paymentReceipt} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900">
                      View Receipt
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      Rejected
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.submittedDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleViewHistory(payment.id)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <Eye size={16} className="inline" />
                    </button>
                  </td>
                </tr>
              ))}
              {rejectedPayments.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    No rejected payments
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showActionModal && (
        <PaymentActionModal
          payment={selectedPayment}
          actionType={actionType}
          onClose={() => setShowActionModal(false)}
        />
      )}
      {showHistoryModal && (
        <ViewHistoryModal
          historyData={selectedHistory}
          type="payment"
          onClose={() => setShowHistoryModal(false)}
        />
      )}
    </div>
  )
}
