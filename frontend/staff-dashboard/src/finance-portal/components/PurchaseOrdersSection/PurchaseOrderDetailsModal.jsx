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

  const canApprove = () => Boolean(po?._id) && Number(po?.totalAmount) >+ 0 && !acting;

  const approve = async () => {
    if (!canApprove()) return;

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

  // Helper functions for safe data extraction
  const getSupplierName = () => {
    if (po?.supplierId && typeof po.supplierId === 'object') {
      return po.supplierId.companyName || po.supplierId.contactName || po.supplierId.name || po.supplierId.email || 'Unknown Supplier';
    }
    return 'Unknown Supplier';
  };

  const getSupplierEmail = () => {
    if (po?.supplierId && typeof po.supplierId === 'object') {
      return po.supplierId.email || 'No email provided';
    }
    return 'No email provided';
  };

  const getSupplierPhone = () => {
    if (po?.supplierId && typeof po.supplierId === 'object') {
      return po.supplierId.phone || po.supplierId.phoneNumber || 'Not provided';
    }
    return 'Not provided';
  };

  const getSupplierAddress = () => {
    if (po?.supplierId && typeof po.supplierId === 'object') {
      return po.supplierId.address || 'Not provided';
    }
    return 'Not provided';
  };

  const getProjectName = () => {
    if (po?.projectId && typeof po.projectId === 'object') {
      return po.projectId.projectName || po.projectId.name || 'Unknown Project';
    }
    return po?.projectName || 'No Project';
  };

  const getProjectLocation = () => {
    if (po?.projectId && typeof po.projectId === 'object') {
      return po.projectId.location || 'Not specified';
    }
    return 'Not specified';
  };

  const getRequestedByName = () => {
    if (po?.requestedBy && typeof po.requestedBy === 'object') {
      return po.requestedBy.username || po.requestedBy.name || po.requestedBy.email || 'Unknown User';
    }
    return 'Unknown User';
  };

  const getRequestedByEmail = () => {
    if (po?.requestedBy && typeof po.requestedBy === 'object') {
      return po.requestedBy.email || 'No email provided';
    }
    return 'No email provided';
  };

  const getApproverName = () => {
    if (po?.financeApproval?.approverId && typeof po.financeApproval.approverId === 'object') {
      return po.financeApproval.approverId.username || po.financeApproval.approverId.name || po.financeApproval.approverId.email || 'Unknown Approver';
    }
    return 'Not yet approved';
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return 'Not specified';
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getMaterialName = (item) => {
    if (item.materialId && typeof item.materialId === 'object') {
      return item.materialId.materialName || item.materialId.name || 'Unknown Material';
    }
    return item.materialName || String(item.materialId || 'Unknown Material');
  };

  const getMaterialUnit = (item) => {
    if (item.materialId && typeof item.materialId === 'object') {
      return item.materialId.unit || 'pcs';
    }
    return 'pcs';
  };

  const getMaterialCategory = (item) => {
    if (item.materialId && typeof item.materialId === 'object') {
      return item.materialId.category || item.materialId.type || 'General';
    }
    return 'General';
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
              {/* Order Information */}
              <div className="bg-[#F7EED3] p-4 rounded-md border border-[#AAB396]">
                <h4 className="text-sm font-semibold text-[#674636] mb-2">Order Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-sm text-[#674636] space-y-1">
                    <p><span className="font-medium">PO ID:</span> <span className="font-mono text-xs">{po._id}</span></p>
                    <p><span className="font-medium">PO Name:</span> {po.name || 'Not specified'}</p>
                    <p><span className="font-medium">Status:</span> <span className="px-2 py-0.5 rounded-full text-xs bg-[#AAB396] text-[#FFF8E8]">{po.status}</span></p>
                  </div>
                  <div className="text-sm text-[#674636] space-y-1">
                    {po.requestOrigin && (
                      <p><span className="font-medium">Request Origin:</span> {po.requestOrigin}</p>
                    )}
                    <p><span className="font-medium">Created At:</span> {formatDate(po.createdAt)}</p>
                    <p><span className="font-medium">Last Updated:</span> {formatDate(po.updatedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Project Information */}
              {po.projectId && (
                <div className="bg-[#F7EED3] p-4 rounded-md border border-[#AAB396]">
                  <h4 className="text-sm font-semibold text-[#674636] mb-2">Project Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-sm text-[#674636] space-y-1">
                      <p><span className="font-medium">Project Name:</span> {getProjectName()}</p>
                      <p><span className="font-medium">Project ID:</span> <span className="font-mono text-xs">{typeof po.projectId === 'object' ? po.projectId._id : po.projectId}</span></p>
                    </div>
                  </div>
                </div>
              )}

              {/* Supplier Information */}
              <div className="bg-[#F7EED3] p-4 rounded-md border border-[#AAB396]">
                <h4 className="text-sm font-semibold text-[#674636] mb-2">Supplier Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-sm text-[#674636] space-y-1">
                    <p><span className="font-medium">Name:</span> {getSupplierName()}</p>
                    <p><span className="font-medium">Email:</span> {getSupplierEmail()}</p>
                  </div>
                  <div className="text-sm text-[#674636] space-y-1">
                    <p><span className="font-medium">Phone:</span> {getSupplierPhone()}</p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="text-sm font-semibold text-[#674636] mb-2">Order Items</h4>
                <div className="bg-[#F7EED3] p-4 rounded-md border border-[#AAB396]">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[#AAB396]">
                      <thead className="bg-[#AAB396]">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-[#FFF8E8] uppercase tracking-wider">Material</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-[#FFF8E8] uppercase tracking-wider">Category</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-[#FFF8E8] uppercase tracking-wider">Unit</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-[#FFF8E8] uppercase tracking-wider">Qty</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-[#FFF8E8] uppercase tracking-wider">Unit Price</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-[#FFF8E8] uppercase tracking-wider">Line Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-[#FFF8E8] divide-y divide-[#AAB396]">
                        {(po.items || []).map((it, idx) => {
                          return (
                            <tr key={idx}>
                              <td className="px-4 py-2 text-sm text-[#674636]">{getMaterialName(it)}</td>
                              <td className="px-4 py-2 text-sm text-[#674636]">{getMaterialCategory(it)}</td>
                              <td className="px-4 py-2 text-sm text-[#674636]">{getMaterialUnit(it)}</td>
                              <td className="px-4 py-2 text-sm text-[#674636] text-right">{it.qty}</td>
                              <td className="px-4 py-2 text-sm text-[#674636] text-right">LKR {(Number(it.unitPrice)||0).toLocaleString()}</td>
                              <td className="px-4 py-2 text-sm text-[#674636] text-right">LKR {lineTotal(it.qty, it.unitPrice).toLocaleString()}</td>
                            </tr>
                          );
                        })}
                        {(po.items || []).length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-4 py-2 text-sm text-center text-[#AAB396]">No items in this order</td>
                          </tr>
                        )}
                        {(po.items || []).length > 0 && (
                          <tr className="bg-[#F7EED3]">
                            <td colSpan={5} className="px-4 py-2 text-sm font-medium text-right text-[#674636]">Total Amount:</td>
                            <td className="px-4 py-2 text-sm font-medium text-right text-[#674636]">LKR {(Number(po.totalAmount)||0).toLocaleString()}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>



              {/* Actions */}
              <div className="flex justify-end gap-2">
                <button onClick={onClose} className="px-4 py-2 bg-[#F7EED3] border border-[#AAB396] rounded-md text-sm font-medium text-[#674636] hover:bg-[#FFF8E8]">Close</button>
                <button onClick={reject} disabled={acting} className={`px-4 py-2 rounded-md text-sm font-medium text-white ${acting ? 'bg-red-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}>Reject</button>
                <button
                  onClick={approve}
                  disabled={!canApprove()}
                  className={`px-4 py-2 rounded-md text-sm font-medium text-white ${!canApprove() ? 'bg-green-300' : 'bg-green-600 hover:bg-green-700'}`}
                >
                  Approve
                </button>
              </div>3
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderDetailsModal;
