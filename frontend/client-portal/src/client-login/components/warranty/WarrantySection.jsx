import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const StatusPill = ({ status }) => {
  const s = String(status || '').toLowerCase();
  const cls = s.includes('active')
    ? 'bg-green-100 text-green-800'
    : s.includes('expired')
    ? 'bg-gray-200 text-gray-700'
    : s.includes('submitted') || s.includes('under')
    ? 'bg-yellow-100 text-yellow-800'
    : s.includes('approved')
    ? 'bg-green-100 text-green-800'
    : s.includes('rejected')
    ? 'bg-red-100 text-red-800'
    : s.includes('replaced')
    ? 'bg-blue-100 text-blue-800'
    : 'bg-gray-100 text-gray-700';
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{status || 'Unknown'}</span>;
};

export const SubmitWarrantyClaimModal = ({ open, onClose, warranty, onSubmitted }) => {
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      setDescription('');
      setFile(null);
      setError('');
    }
  }, [open]);

  if (!open || !warranty) return null;

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError('');
      const token = localStorage.getItem('authToken');
      const form = new FormData();
      form.append('warrantyId', warranty._id);
      form.append('clientId', warranty.clientId);
      form.append('description', description);
      if (file) form.append('proofFile', file);

      const res = await axios.post('http://localhost:3000/api/claims', form, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      onSubmitted?.(res.data);
      onClose?.();
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'Failed to submit claim');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded shadow-lg">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">Submit Warranty Claim</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div className="p-4 space-y-4">
          <div className="bg-gray-50 p-3 rounded border">
            <div className="text-sm text-gray-700">Material</div>
            <div className="font-medium">{warranty.materialName} ({warranty.materialCategory})</div>
            <div className="text-sm text-gray-500">Warranty: {warranty.startDate} → {warranty.endDate}</div>
            <div className="text-sm mt-1">Status: <StatusPill status={warranty.status} /></div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Issue Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full border rounded p-2"
              placeholder="Describe the issue"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Proof (image/pdf)</label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
        </div>
        <div className="p-4 border-t flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 rounded border">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !description}
            className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Claim'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const ViewClaimModal = ({ open, onClose, claim }) => {
  if (!open || !claim) return null;
  const created = claim.createdAt ? new Date(claim.createdAt).toLocaleString() : '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded shadow-lg">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">Claim Details</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 text-sm text-left">
          <div className="grid grid-cols-3 gap-3 items-center">
            <span className="text-gray-500 col-span-1">Status:</span>
            <div className="col-span-2"><StatusPill status={claim.status} /></div>
          </div>

          <div className="grid grid-cols-3 gap-3 items-start">
            <span className="text-gray-500 col-span-1">Description:</span>
            <span className="col-span-2 break-words">{claim.issueDescription || '-'}</span>
          </div>

          <div className="grid grid-cols-3 gap-3 items-center">
            <span className="text-gray-500 col-span-1">Submitted:</span>
            <span className="col-span-2">{created}</span>
          </div>

          {claim.proofUrl && (
            <div className="grid grid-cols-3 gap-3 items-center mt-2">
              <span className="text-gray-500 col-span-1">Proof:</span>
              <a
                className="col-span-2 text-blue-600 underline"
                href={`http://localhost:3000${claim.proofUrl}`}
                target="_blank"
                rel="noreferrer"
              >
                View Proof
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded border">Close</button>
        </div>
      </div>
    </div>
  );
};


const WarrantyRow = ({ w, onSubmitClaim }) => {
  const claimable = useMemo(() => {
    const now = new Date();
    const end = new Date(w.warrantyEnd || w.endDate);
    const start = new Date(w.warrantyStart || w.startDate);
    const withinWindow = (now - end) <= 90 * 24 * 3600 * 1000;
    return w.status === 'Active' || (w.status === 'Expired' && withinWindow);
  }, [w]);

  return (
    <tr className="border-b">
      <td className="px-4 py-2 text-sm">{w.projectName || '-'}</td>
      <td className="px-4 py-2 text-sm">{w.materialName || '-'}</td>
      <td className="px-4 py-2 text-sm">{w.startDate} → {w.endDate}</td>
      <td className="px-4 py-2 text-sm"><StatusPill status={w.status} /></td>
      <td className="px-4 py-2 text-right">
        <button
          onClick={() => onSubmitClaim(w)}
          disabled={!claimable}
          className={`px-3 py-1 rounded text-sm ${claimable ? 'bg-yellow-600 text-white hover:bg-yellow-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
        >
          Submit Claim
        </button>
      </td>
    </tr>
  );
};

function ViewClaimButton({ claim }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="px-3 py-1 rounded text-sm bg-gray-100 hover:bg-gray-200">View</button>
      <ViewClaimModal open={open} onClose={() => setOpen(false)} claim={claim} />
    </>
  );
}

export default function WarrantySection() {
  const [tab, setTab] = useState('items');
  const [warranties, setWarranties] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSubmit, setShowSubmit] = useState(false);
  const [activeWarranty, setActiveWarranty] = useState(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  const fetchWarranties = async () => {
    setLoading(true); setError('');
    try {
      const me = await axios.get('http://localhost:3000/api/user/me', { headers: { Authorization: `Bearer ${token}` } });
      const meId = me.data?._id || me.data?.id;
      const res = await axios.get('http://localhost:3000/api/warranties', { params: { clientId: meId }, headers: { Authorization: `Bearer ${token}` } });
      setWarranties(res.data || []);
    } catch (e) { setError(e?.response?.data?.error || e?.message || 'Failed to load warranties'); }
    finally { setLoading(false); }
  };

  const fetchClaims = async () => {
    setLoading(true); setError('');
    try {
      const me = await axios.get('http://localhost:3000/api/user/me', { headers: { Authorization: `Bearer ${token}` } });
      const meId = me.data?._id || me.data?.id;
      const res = await axios.get('http://localhost:3000/api/claims', { params: { clientId: meId }, headers: { Authorization: `Bearer ${token}` } });
      setClaims(res.data || []);
    } catch (e) { setError(e?.response?.data?.error || e?.message || 'Failed to load claims'); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (tab === 'items') fetchWarranties(); else fetchClaims(); }, [tab]);

  const onSubmitted = () => { setShowSubmit(false); setActiveWarranty(null); setTab('claims'); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Warranty</h2>
        <div className="flex space-x-2">
          <button onClick={() => setTab('items')} className={`px-3 py-2 rounded ${tab === 'items' ? 'bg-yellow-200' : 'hover:bg-gray-200'}`}>Your Items</button>
          <button onClick={() => setTab('claims')} className={`px-3 py-2 rounded ${tab === 'claims' ? 'bg-yellow-200' : 'hover:bg-gray-200'}`}>Your Claims</button>
        </div>
      </div>

      {error && <div className="p-3 bg-red-50 text-red-700 rounded">{error}</div>}

      {tab === 'items' && (
        <div className="bg-white shadow-md rounded overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2">Project</th>
                <th className="px-4 py-2">Item</th>
                <th className="px-4 py-2">Warranty Period</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {warranties.map(w => (
                <WarrantyRow key={w._id} w={w} onSubmitClaim={(wr) => { setActiveWarranty(wr); setShowSubmit(true); }} />
              ))}
              {!loading && warranties.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">No warranty items found</td></tr>
              )}
            </tbody>
          </table>
          {loading && <div className="p-4 text-center text-gray-500">Loading...</div>}
        </div>
      )}

      {tab === 'claims' && (
        <div className="bg-white shadow-md rounded overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2">Claim</th>
                <th className="px-4 py-2">Item</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Submitted</th>
                <th className="px-4 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {claims.map(c => (
                <tr key={c._id} className="border-b">
                  <td className="px-4 py-2 text-sm">{c.issueDescription || '-'}</td>
                  <td className="px-4 py-2 text-sm">{c?.warrantyId?.itemId?.materialName || '-'}</td>
                  <td className="px-4 py-2 text-sm"><StatusPill status={c.status} /></td>
                  <td className="px-4 py-2 text-sm">{c.createdAt ? new Date(c.createdAt).toLocaleString() : '-'}</td>
                  <td className="px-4 py-2 text-right"><ViewClaimButton claim={c} /></td>
                </tr>
              ))}
              {!loading && claims.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">No claims submitted yet</td></tr>
              )}
            </tbody>
          </table>
          {loading && <div className="p-4 text-center text-gray-500">Loading...</div>}
        </div>
      )}

      <SubmitWarrantyClaimModal
        open={showSubmit}
        onClose={() => { setShowSubmit(false); setActiveWarranty(null); }}
        warranty={activeWarranty}
        onSubmitted={onSubmitted}
      />
    </div>
  );
}
