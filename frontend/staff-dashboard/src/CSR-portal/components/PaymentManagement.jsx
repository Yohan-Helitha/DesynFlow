import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(null);

  // Fetch payment details from finance manager
  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:4000/api/payment-receipt/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayments(response.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const sendPaymentEmail = async (payment) => {
    setSendingEmail(payment._id);
    try {
      const token = localStorage.getItem('authToken');
      await axios.post(
        `http://localhost:4000/api/payment-receipt/send-email/${payment._id}`,
        {
          clientEmail: payment.clientEmail || payment.client?.email,
          clientName: payment.clientName || payment.client?.name,
          inspectionCost: payment.inspectionCost || payment.calculatedAmount,
          propertyAddress: payment.propertyAddress || payment.inspectionRequest?.propertyAddress
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      alert('✅ Payment details sent to client successfully!');
    } catch (error) {
      console.error('Error sending email:', error);
      alert('❌ Failed to send email. Please try again.');
    } finally {
      setSendingEmail(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Description */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Management</h2>
        <p className="text-gray-600">View inspection costs and payment details from finance manager. Send payment details to clients via email.</p>
      </div>
      
      {/* Payment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {payments.map((payment) => (
          <div 
            key={payment._id} 
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
          >
            {/* Card Header with Cost */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-xs font-medium text-green-600 uppercase tracking-wide">Payment</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  ${payment.inspectionCost || payment.calculatedAmount || 'N/A'}
                </div>
                <div className="text-xs text-gray-500">Inspection Cost</div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="space-y-4 mb-6">
              {/* Client Name */}
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <label className="text-xs font-semibold text-blue-800 uppercase tracking-wide block mb-1">
                  👤 Client Name
                </label>
                <p className="text-gray-900 font-semibold">
                  {payment.clientName || payment.client?.name || 'N/A'}
                </p>
              </div>
              
              {/* Property Address */}
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                <label className="text-xs font-semibold text-purple-800 uppercase tracking-wide block mb-1">
                  📍 Property Address
                </label>
                <p className="text-gray-800 text-sm">
                  {payment.propertyAddress || payment.inspectionRequest?.propertyAddress || 'N/A'}
                </p>
              </div>
              
              {/* Client Email */}
              <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                <label className="text-xs font-semibold text-indigo-800 uppercase tracking-wide block mb-1">
                  📧 Client Email
                </label>
                <p className="text-gray-800 text-sm break-all">
                  {payment.clientEmail || payment.client?.email || 'N/A'}
                </p>
              </div>
              
              {/* Due Date & Status Row */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                  <label className="text-xs font-semibold text-orange-800 uppercase tracking-wide block mb-1">
                    📅 Due Date
                  </label>
                  <p className="text-gray-800 text-xs">
                    {payment.dueDate || payment.paymentDueDate
                      ? new Date(payment.dueDate || payment.paymentDueDate).toLocaleDateString()
                      : 'N/A'
                    }
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <label className="text-xs font-semibold text-gray-800 uppercase tracking-wide block mb-1">
                    📊 Status
                  </label>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold capitalize ${
                    payment.status === 'verified' 
                      ? 'bg-green-200 text-green-800'
                      : payment.status === 'pending' || payment.status === 'awaiting_upload'
                      ? 'bg-yellow-200 text-yellow-800'
                      : 'bg-red-200 text-red-800'
                  }`}>
                    {payment.status || 'Pending'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Send Email Button */}
            <button
              onClick={() => sendPaymentEmail(payment)}
              disabled={sendingEmail === payment._id}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 transform focus:outline-none focus:ring-4 ${
                sendingEmail === payment._id
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 hover:scale-[1.02] focus:ring-green-300'
              }`}
            >
              {sendingEmail === payment._id ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Sending Email...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span>📧</span>
                  <span>Send to Client</span>
                </div>
              )}
            </button>
          </div>
        ))}
      </div>
      
      {/* Empty State */}
      {payments.length === 0 && !loading && (
        <div className="text-center py-16 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border-2 border-dashed border-green-300">
          <div className="text-6xl mb-4">💰</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Payment Details Available</h3>
          <p className="text-gray-500 mb-4">Payment details from finance manager will appear here</p>
          <div className="bg-white rounded-lg p-4 max-w-md mx-auto border border-green-200">
            <p className="text-sm text-green-700">
              <strong>Note:</strong> Finance managers create payment records with inspection costs that appear as cards here.
            </p>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">💡 How Payment Management Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <div className="text-blue-600 font-semibold mb-1">1. Finance Creates</div>
            <div className="text-gray-700">Finance manager creates payment records with inspection costs</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-green-200">
            <div className="text-green-600 font-semibold mb-1">2. CSR Reviews</div>
            <div className="text-gray-700">Payment details appear as cards with client information</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-purple-200">
            <div className="text-purple-600 font-semibold mb-1">3. Email Client</div>
            <div className="text-gray-700">Send payment details to client via email with one click</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentManagement;