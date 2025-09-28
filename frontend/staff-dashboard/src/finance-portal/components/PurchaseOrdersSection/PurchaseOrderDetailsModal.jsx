import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export const PurchaseOrderDetailsModal = ({ purchaseOrderId, onClose, onAction }) => {
  const [po, setPo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [acting, setActing] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function fetchDetails() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/purchase-orders/${purchaseOrderId}`);
        if (!res.ok) throw new Error('Failed to load purchase order');
        const data = await res.json();
        if (!ignore) setPo(data);
      } catch (e) {
        if (!ignore) setError(e.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    if (purchaseOrderId) fetchDetails();
    return () => { ignore = true; };
  }, [purchaseOrderId]);

  const approve = async () => {
    if (!po?._id) return;
    setActing(true);
    try {
      const res = await fetch(`/api/purchase-orders/${po._id}/approve`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) throw new Error('Failed to approve');
      const updated = await res.json();
      setPo(updated);
      onAction && onAction('approved', updated);
    } catch (e) {
      setError(e.message);
    } finally {
      setActing(false);
    }
  };

  const reject = async () => {
    if (!po?._id) return;
    setActing(true);
    try {
      const res = await fetch(`/api/purchase-orders/${po._id}/reject`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) throw new Error('Failed to reject');
      const updated = await res.json();
      setPo(updated);
      onAction && onAction('rejected', updated);
    } catch (e) {
      setError(e.message);
    } finally {
      setActing(false);
    }
  };

  const lineTotal = (qty, price) => {
    const q = Number(qty) || 0; const p = Number(price) || 0; return q * p;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#FFF8E8] rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-[#AAB396]">
        <div className="flex items-center justify-between p-6 border-b border-[#AAB396] bg-[#F7EED3]">
          <h3 className="text-lg font-medium text-[#674636]">Purchase Order Details</h3>
          <button onClick={onClose} className="text-[#AAB396] hover:text-[#674636]"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-6">
          {loading && <div className="text-[#AAB396]">Loading…</div>}
          {error && !loading && <div className="text-red-600">{error}</div>}
          {po && !loading && (
            <>
              {/* Top meta */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#F7EED3] p-4 rounded-md border border-[#AAB396]">
                  <h4 className="text-sm font-semibold text-[#674636] mb-2">Order</h4>
                  <div className="text-sm text-[#674636] space-y-1">
                    <p><span className="font-medium">PO ID:</span> {po._id}</p>
                    <p><span className="font-medium">Status:</span> {po.status}</p>
                    {po.requestOrigin && (
                      <p><span className="font-medium">Request Origin:</span> {po.requestOrigin}</p>
                    )}
                    <p><span className="font-medium">Created At:</span> {po.createdAt ? new Date(po.createdAt).toLocaleString() : '-'}</p>
                  </div>
                </div>
                <div className="bg-[#F7EED3] p-4 rounded-md border border-[#AAB396]">
                  <h4 className="text-sm font-semibold text-[#674636] mb-2">Finance Approval</h4>
                  <div className="text-sm text-[#674636] space-y-1">
                    {po.financeApproval?.status && (
                      <p><span className="font-medium">Status:</span> {po.financeApproval.status}</p>
                    )}
                    {po.financeApproval?.note && (
                      <p><span className="font-medium">Note:</span> {po.financeApproval.note}</p>
                    )}
                    {po.financeApproval?.approvedAt && (
                      <p><span className="font-medium">Approved At:</span> {new Date(po.financeApproval.approvedAt).toLocaleString()}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Relations: Only Supplier */}
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div className="bg-[#F7EED3] p-4 rounded-md border border-[#AAB396]">
                  <h4 className="text-sm font-semibold text-[#674636] mb-2">Supplier</h4>
                  <div className="text-sm text-[#674636] space-y-1">
                    {po.supplierId?.name && (<p><span className="font-medium">Name:</span> {po.supplierId.name}</p>)}
                    {po.supplierId?.email && (<p><span className="font-medium">Email:</span> {po.supplierId.email}</p>)}
                    {po.supplierId?.phone && (<p><span className="font-medium">Phone:</span> {po.supplierId.phone}</p>)}
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="text-sm font-semibold text-[#674636] mb-2">Items</h4>
                <div className="bg-[#F7EED3] p-4 rounded-md border border-[#AAB396]">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[#AAB396]">
                      <thead className="bg-[#AAB396]">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-[#FFF8E8] uppercase tracking-wider">Material</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-[#FFF8E8] uppercase tracking-wider">Unit</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-[#FFF8E8] uppercase tracking-wider">Qty</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-[#FFF8E8] uppercase tracking-wider">Unit Price</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-[#FFF8E8] uppercase tracking-wider">Line Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-[#FFF8E8] divide-y divide-[#AAB396]">
                        {(po.items || []).map((it, idx) => {
                          const mat = it.materialId && typeof it.materialId === 'object' ? it.materialId : null;
                          return (
                            <tr key={idx}>
                              <td className="px-4 py-2 text-sm text-[#674636]">{mat?.materialName || it.materialName || String(it.materialId || '')}</td>
                              <td className="px-4 py-2 text-sm text-[#674636]">{mat?.unit || '-'}</td>
                              <td className="px-4 py-2 text-sm text-[#674636] text-right">{it.qty}</td>
                              <td className="px-4 py-2 text-sm text-[#674636] text-right">${(Number(it.unitPrice)||0).toLocaleString()}</td>
                              <td className="px-4 py-2 text-sm text-[#674636] text-right">${lineTotal(it.qty, it.unitPrice).toLocaleString()}</td>
                            </tr>
                          );
                        })}
                        <tr className="bg-[#F7EED3]">
                          <td colSpan={4} className="px-4 py-2 text-sm font-medium text-right text-[#674636]">Total Amount:</td>
                          <td className="px-4 py-2 text-sm font-medium text-right text-[#674636]">${(Number(po.totalAmount)||0).toLocaleString()}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <button onClick={onClose} className="px-4 py-2 bg-[#F7EED3] border border-[#AAB396] rounded-md text-sm font-medium text-[#674636] hover:bg-[#FFF8E8]">Close</button>
                <button onClick={reject} disabled={acting} className={`px-4 py-2 rounded-md text-sm font-medium text-white ${acting ? 'bg-red-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}>Reject</button>
                <button onClick={approve} disabled={acting} className={`px-4 py-2 rounded-md text-sm font-medium text-white ${acting ? 'bg-green-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}>Approve</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderDetailsModal;
