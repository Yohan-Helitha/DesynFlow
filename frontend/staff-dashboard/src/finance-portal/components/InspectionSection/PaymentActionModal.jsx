
import React, { useState } from 'react';
import { buildUploadsUrl } from '../../utils/fileUrls';
import { User, Mail, Phone, MapPin, Building } from 'lucide-react';


export const PaymentActionModal = ({ payment, onClose }) => {
  const [enteredValue, setEnteredValue] = useState('');
  const estimatedCost = payment.estimation && payment.estimation.estimatedCost;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Client details helpers (match ViewInspectionPaymentModal)
  const get = (...fields) => {
    for (const f of fields) {
      if (f === undefined) continue;
      if (typeof f === 'function') {
        try { const v = f(); if (v !== undefined && v !== null) return v; } catch { continue; }
      } else if (f !== null) {
        return f;
      }
    }
    return undefined;
  };
  const clientName = get(payment.clientName, payment.client_name, payment.client && payment.client.name);
  const email = get(payment.email, payment.client && payment.client.email);
  const phone = get(payment.phone, payment.phone_number, payment.client && payment.client.phone_number);
  const siteLocation = get(
    payment.propertyLocation_address && payment.propertyLocation_city ? `${payment.propertyLocation_address}, ${payment.propertyLocation_city}` : undefined,
    payment.siteLocation,
    payment.propertyLocation_address,
    payment.propertyLocation_city
  );
  const propertyType = get(payment.propertyType, payment.property_type);

  const handleVerify = async (actionStatus) => {
    setLoading(true);
    setError(null);
    try {
      const id = payment._id || payment.inspectionRequestId || payment.id;
      const res = await fetch(
        `/api/inspection-estimation/${id}/verify-payment`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentAmount: Number(enteredValue),
            status: actionStatus,
          }),
        }
      );
      if (!res.ok) throw new Error('Failed to update payment status');
      onClose(true);
    } catch (err) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const isApproveEnabled =
    enteredValue !== '' &&
    !isNaN(Number(enteredValue)) &&
    estimatedCost !== undefined &&
    Number(enteredValue) >= Number(estimatedCost);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#FFF8E8] p-6 rounded-lg shadow-lg w-full max-w-md border border-[#AAB396]">
        <h2 className="text-xl font-bold mb-4 text-[#674636]">Payment Action</h2>

        {/* Client Details Section */}
        <div className="mb-4 p-3 rounded bg-[#F7EED3] border border-[#AAB396]">
          <div className="text-sm font-semibold text-[#674636] mb-2 flex items-center">
            <User size={16} className="mr-2 text-[#AAB396]" /> Client Details
          </div>
          <div className="text-xs text-[#674636] space-y-1">
            <div className="flex items-center"><User size={14} className="mr-1 text-[#AAB396]" />{clientName || 'N/A'}</div>
            <div className="flex items-center"><Mail size={14} className="mr-1 text-[#AAB396]" />{email || 'N/A'}</div>
            <div className="flex items-center"><Phone size={14} className="mr-1 text-[#AAB396]" />{phone || 'N/A'}</div>
            <div className="flex items-center"><MapPin size={14} className="mr-1 text-[#AAB396]" />{siteLocation || 'N/A'}</div>
            <div className="flex items-center"><Building size={14} className="mr-1 text-[#AAB396]" />{propertyType || 'N/A'}</div>
          </div>
        </div>

        <p className="text-sm text-[#674636] mb-4">
          Do you want to approve or reject the payment for{' '}
          <span className="font-semibold">{clientName || payment.clientName || 'N/A'}</span>?
        </p>
        {payment?.paymentReceiptUrl && (
          <div className="mb-4">
            <div className="text-sm text-[#674636] mb-2">Receipt Preview</div>
            {(() => {
              const url = buildUploadsUrl(payment.paymentReceiptUrl, 'inspection_payments');
              const isPdf = /\.pdf($|\?)/i.test(url);
              if (isPdf) {
                return (
                  <iframe
                    src={url}
                    title="Receipt Preview"
                    className="w-full h-48 border border-[#AAB396] rounded"
                  />
                );
              }
              return (
                <img
                  src={url}
                  alt="Receipt Preview"
                  className="w-full h-48 object-contain border border-[#AAB396] rounded bg-white"
                />
              );
            })()}
          </div>
        )}
        <div className="mb-4">
          <label className="block text-sm font-medium text-[#674636] mb-1">
            Enter Payment Amount
          </label>
          <input
            type="number"
            className="w-full border border-[#AAB396] rounded-md px-3 py-2 bg-[#F7EED3] focus:outline-none focus:ring-2 focus:ring-[#674636]"
            value={enteredValue}
            onChange={(e) => setEnteredValue(e.target.value)}
            placeholder="Enter payment amount"
          />
        </div>
        <div className="mb-4 text-sm text-[#674636]">
          Estimated Cost:{' '}
          <span className="font-semibold">
            {estimatedCost !== undefined ? estimatedCost : '-'}
          </span>
        </div>
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#F7EED3] text-[#674636] border border-[#AAB396] rounded-md hover:bg-[#AAB396] hover:text-white"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={() => handleVerify('RejectedApproved')}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-400"
            disabled={loading}
          >
            Reject
          </button>
          <button
            onClick={() => handleVerify('Rejected')}
            className={`px-4 py-2 bg-[#674636] text-white rounded-md hover:bg-[#AAB396] focus:ring-2 focus:ring-[#674636] ${
              !isApproveEnabled || loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={!isApproveEnabled || loading}
          >
            {loading ? 'Processing...' : 'Approve'}
          </button>
        </div>
      </div>
    </div>
  );
};
