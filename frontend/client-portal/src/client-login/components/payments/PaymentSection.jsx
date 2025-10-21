import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ClipboardIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M9 2h6a2 2 0 0 1 2 2v1h-10V4a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 7h10v13a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CheckIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Pill = ({ color = 'gray', children }) => {
  const colors = {
    gray: 'bg-gray-100 text-gray-700',
    yellow: 'bg-yellow-100 text-yellow-800',
    green: 'bg-green-100 text-green-800',
    blue: 'bg-blue-100 text-blue-800',
    red: 'bg-red-100 text-red-800'
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[color]}`}>{children}</span>;
};

const UploadReceiptModal = ({ open, onClose, onUploaded }) => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ];
  const maxSizeBytes = 10 * 1024 * 1024; // 10MB

  const onFileChange = (f) => {
    setError('');
    setPreviewUrl('');
    if (!f) { setFile(null); return; }

    if (!allowedTypes.includes(f.type)) {
      setError('Unsupported file type. Allowed: PDF, DOC, DOCX, JPG, PNG, GIF, WEBP');
      setFile(null);
      return;
    }
    if (f.size > maxSizeBytes) {
      setError('File is too large. Maximum allowed size is 10MB.');
      setFile(null);
      return;
    }

    setFile(f);
    if (f.type.startsWith('image/')) {
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
    }
  };

  const clearSelection = () => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
  };

  const handleUpload = async () => {
    if (!file) return setError('Please select a file first');
    try {
      setSubmitting(true);
      setError('');
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post('http://localhost:3000/api/upload', formData);
      if (res.data?.path) {
        onUploaded(res.data.path);
        onClose();
        clearSelection();
      } else setError('Invalid response from server');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
        <div className="p-5 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold text-brown-primary">Upload Payment Proof</h3>
          <button onClick={() => { clearSelection(); onClose(); }} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div className="p-6 space-y-3">
          <input
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
            onChange={(e) => onFileChange(e.target.files?.[0])}
            className="w-full text-sm"
          />
          {file && (
            <div className="flex items-center justify-between bg-gray-50 border rounded p-2">
              <div className="min-w-0 mr-3">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size/1024).toFixed(1)} KB</p>
              </div>
              <button onClick={clearSelection} className="text-xs text-red-600 hover:underline">Remove</button>
            </div>
          )}
          {previewUrl && (
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-1">Preview</p>
              <img src={previewUrl} alt="Receipt preview" className="max-h-40 rounded border" />
            </div>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <p className="text-xs text-gray-500">Supported files: PDF, DOC, DOCX, JPG, JPEG, PNG, GIF, WEBP (max 10MB)</p>
        </div>
        <div className="p-4 border-t flex justify-end space-x-2">
          <button onClick={() => { clearSelection(); onClose(); }} className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-100">Cancel</button>
          <button
            onClick={handleUpload}
            disabled={submitting || !file}
            className="px-4 py-2 text-sm rounded-lg bg-brown-primary text-white hover:bg-brown-primary-700 disabled:opacity-50"
          >
            {submitting ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
};

const BankDetails = ({ refId }) => {
  const [copied, setCopied] = useState(null);
  const handleCopy = async (val, key) => {
    try {
      await navigator.clipboard.writeText(val);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {}
  };

  return (
    <div className="border-t pt-4 mt-4 text-sm text-gray-700">
      <p className="font-medium mb-2">Bank Payment Details</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="border rounded-lg bg-gray-50 p-3">
          <p className="text-xs text-gray-500">Bank</p>
          <p className="font-medium">ABC Bank PLC</p>
          <p className="text-xs text-gray-500 mt-1">Account Number</p>
          <div className="flex items-center justify-between">
            <span className="font-mono">123-456-789</span>
            <button
              onClick={() => handleCopy('123-456-789', 'acc')}
              className="text-xs flex items-center text-brown-primary hover:underline"
            >
              <ClipboardIcon className="w-4 h-4 mr-1" />
              {copied === 'acc' ? <CheckIcon className="w-4 h-4 text-green-600" /> : 'Copy'}
            </button>
          </div>
        </div>
        <div className="border rounded-lg bg-gray-50 p-3">
          <p className="text-xs text-gray-500">Account Name</p>
          <p className="font-medium">DesynFlow (Pvt) Ltd</p>
          <p className="text-xs text-gray-500 mt-1">Reference</p>
          <div className="flex items-center justify-between">
            <span className="font-mono">INV-{refId}</span>
            <button
              onClick={() => handleCopy(`INV-${refId}`, 'ref')}
              className="text-xs flex items-center text-brown-primary hover:underline"
            >
              <ClipboardIcon className="w-4 h-4 mr-1" />
              {copied === 'ref' ? <CheckIcon className="w-4 h-4 text-green-600" /> : 'Copy'}
            </button>
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-3">After payment, upload the receipt to verify your payment.</p>
    </div>
  );
};

const useAuthToken = () => (typeof window !== 'undefined' ? localStorage.getItem('authToken') : null);

export default function PaymentSection() {
  const [me, setMe] = useState(null);
  const [inspectionPayments, setInspectionPayments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [quotations, setQuotations] = useState([]); // fetched quotations
  const [myPayments, setMyPayments] = useState([]); // fetched payment records
  const [selectedFileUrl, setSelectedFileUrl] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState('');
  const [tab, setTab] = useState('inspection'); // 'inspection' | 'project'
  const token = useAuthToken();

  // Helpers
  const getId = (v) => {
    if (!v) return v;
    if (typeof v === 'object') return v._id || v.id || String(v);
    return v;
  };
  const normStatus = (s) => String(s || '').toLowerCase();
  const isApproved = (s) => {
    const v = normStatus(s);
    return v === 'verified' || v === 'approved';
  };
  const getProjectPayments = (projectId) => {
    const pid = String(getId(projectId));
    return myPayments.filter(p => String(getId(p.projectId)) === pid);
  };
  const getProjectPayment = (projectId, type) => getProjectPayments(projectId).find(p => String(p.type).toLowerCase() === String(type).toLowerCase());
  const getLatestPendingPayment = (projectId, type) => {
    const list = getProjectPayments(projectId).filter(p => String(p.type).toLowerCase() === String(type).toLowerCase() && !isApproved(p.status));
    return list.length ? list[list.length - 1] : null;
  };
  const sumApprovedForProject = (projectId) => {
    const list = getProjectPayments(projectId).filter(p => isApproved(p.status));
    const sum = list.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    return sum;
  };
  const getProjectQuotation = (projectId) => {
    const pid = String(getId(projectId));
    // Find the latest 'Sent' or 'Confirmed' quotation for this project
    const projectQuotations = quotations
      .filter(q => String(getId(q.projectId)) === pid)
      .filter(q => q.status === 'Sent' || q.status === 'Confirmed' || q.status === 'Locked')
      .sort((a, b) => (b.version || 0) - (a.version || 0)); // Latest version first
    return projectQuotations.length > 0 ? projectQuotations[0] : null;
  };

  // Persist selected tab in localStorage
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('client_payments_tab') : null;
    if (saved === 'inspection' || saved === 'project') setTab(saved);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('client_payments_tab', tab);
  }, [tab]);

  const fmtLKR = (n) => `LKR ${Number(n || 0).toLocaleString('en-LK')}`;

  useEffect(() => {
    (async () => {
      await fetchMe();
    })();
    fetchProjects();
    fetchQuotations();
    fetchMyPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch projects filtered by user when me is available
  useEffect(() => {
    if (me) fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me]);

  useEffect(() => {
    if (me) fetchInspectionPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me]);

  const fetchMe = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/user/me', { headers: { Authorization: `Bearer ${token}` } });
      setMe(res.data);
    } catch (err) {
      console.error('Failed to fetch user profile', err?.response?.status, err?.message);
    }
  };

  const fetchMyPayments = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/payments/my', { headers: { Authorization: `Bearer ${token}` } });
      setMyPayments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      if (err?.response?.status === 404) {
        // Endpoint might not exist yet; proceed without blocking UI
        setMyPayments([]);
      } else {
        console.error('Failed to fetch my payments', err?.response?.status, err?.message);
      }
    }
  };

  const fetchInspectionPayments = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/inspection-estimation/all-estimation-details', { headers: { Authorization: `Bearer ${token}` } });
      const all = (res.data || []).map(it => ({
        ...it,
        _id: it._id || it.inspectionRequestId,
        inspectionRequestId: it.inspectionRequestId, // Keep the original inspectionRequestId
        propertyLocation: it.inspectionRequest?.propertyLocation_address || it.propertyLocation || '',
        estimatedCost: it.estimatedCost || it.estimate || 0,
        paymentReceiptUrl: it.paymentReceiptUrl || it.paymentReceipt || null,
        status: it.paymentStatus || it.status || 'pending',
        clientIdOnRecord: it.inspectionRequest?.client_ID || it.inspectionRequest?.clientId || it.clientId || it.clientId
      }));

      const filtered = me && me._id ? all.filter(it => String(it.clientIdOnRecord) === String(me._id || me.id)) : all.filter(Boolean);
      setInspectionPayments(filtered);
    } catch (err) {
      if (err?.response?.status === 404) {
        console.warn('Inspection estimation endpoint not found (404) - make sure backend is running and /api/inspection-estimation is mounted');
        setInspectionPayments([]);
        return;
      }
      console.error('Failed to fetch inspection payments', err?.response?.status, err?.message);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/projects', { headers: { Authorization: `Bearer ${token}` } });
      // Filter projects belonging to client if backend supports clientId on project
      const list = (res.data || []).filter(p => {
        if (!me) return true; // first run before me is loaded; we'll refetch later
        const meId = String(getId(me?._id || me?.id));
        const client = getId(p.clientId);
        const owner = getId(p.ownerId);
        if (client) return String(client) === meId;
        if (owner) return String(owner) === meId;
        return false; // hide unrelated projects
      });
      setProjects(list);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchQuotations = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/quotations', { headers: { Authorization: `Bearer ${token}` } });
      setQuotations(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      if (err?.response?.status === 404) {
        console.warn('Quotations endpoint not found (404)');
        setQuotations([]);
        return;
      }
      console.error('Failed to fetch quotations', err?.response?.status, err?.message);
    }
  };

  const handleUploadProof = (paymentId) => {
    // Guard: if this is a project payment and it's already approved, block upload
    if (String(paymentId).includes('-')) {
      const [pid, ptype] = String(paymentId).split('-');
      const existing = getProjectPayment(pid, ptype);
      if (existing && isApproved(existing.status)) return;
    }
    setSelectedPaymentId(paymentId);
    setShowModal(true);
  };

  const handleUploaded = async (url) => {
    setSelectedFileUrl(url);
    try {
      if (String(selectedPaymentId).includes('-')) {
        // Project payments
        const [pid, ptype] = String(selectedPaymentId).split('-');
        const proj = projects.find(p => String(p._id) === String(pid));
        const quotation = getProjectQuotation(pid);
        const quoteTotal = quotation?.grandTotal || 0;
        const advanceRate = typeof proj?.advanceRate === 'number' ? proj.advanceRate : 0.3;
        const advanceAmt = Math.round((proj?.advanceAmount ?? (quoteTotal * advanceRate)));
        const approvedSum = (() => {
          const sum = sumApprovedForProject(pid);
          if (sum > 0) return sum;
          // fallback to server aggregate if available
          return Number(proj?.paid || 0);
        })();
        const finalDue = Math.max(quoteTotal - approvedSum, 0);
        const amount = ptype === 'advance' ? advanceAmt : finalDue;

        const existingPending = getLatestPendingPayment(pid, ptype);
        if (existingPending) {
          await axios.put(
            `http://localhost:3000/api/payments/${existingPending._id}`,
            { receiptUrl: url, amount },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } else {
          // Capitalize the type for backend validation (Advance or Final)
          const typeCapitalized = ptype.charAt(0).toUpperCase() + ptype.slice(1);
          console.log('Creating new payment:', { projectId: pid, type: typeCapitalized, amount, receiptUrl: url });
          await axios.post(
            'http://localhost:3000/api/payments',
            { projectId: pid, type: typeCapitalized, amount, receiptUrl: url },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      } else {
        // Inspection payments - find the inspection request ID
        const inspectionPayment = inspectionPayments.find(item => String(item._id) === String(selectedPaymentId));
        if (inspectionPayment) {
          // Use the inspectionRequestId from the inspection payment data
          const inspectionRequestId = inspectionPayment.inspectionRequestId || inspectionPayment._id;
          console.log('Uploading receipt for inspection request:', inspectionRequestId);
          await axios.post(
            `http://localhost:3000/api/inspection-estimation/${inspectionRequestId}/upload-receipt`,
            { paymentReceiptUrl: url },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } else {
          console.error('Inspection payment not found for ID:', selectedPaymentId);
        }
      }
      fetchInspectionPayments();
      fetchProjects();
      fetchQuotations();
      fetchMyPayments();
    } catch (err) {
      console.error('Payment upload error:', err?.response?.data || err.message);
      alert(`Payment upload failed: ${err?.response?.data?.error || err?.response?.data?.message || err.message}`);
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      <div className="mb-2">
        <h2 className="text-2xl font-bold text-brown-primary">Payments</h2>
      </div>

      {/* Tab bar */}
      <div className="border-b mb-4">
        <nav className="flex gap-6" role="tablist" aria-label="Payments tabs">
          <button
            role="tab"
            aria-selected={tab === 'inspection'}
            onClick={() => setTab('inspection')}
            className={`-mb-px px-1 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === 'inspection'
                ? 'border-brown-primary text-brown-primary'
                : 'border-transparent text-gray-500 hover:text-brown-primary hover:border-brown-primary/50'
            }`}
          >
            Inspection Payments
          </button>
          <button
            role="tab"
            aria-selected={tab === 'project'}
            onClick={() => setTab('project')}
            className={`-mb-px px-1 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === 'project'
                ? 'border-brown-primary text-brown-primary'
                : 'border-transparent text-gray-500 hover:text-brown-primary hover:border-brown-primary/50'
            }`}
          >
            Project Payments
          </button>
        </nav>
      </div>

      {tab === 'inspection' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-brown-primary">Inspection Payments</h3>
          {inspectionPayments.length === 0 ? (
            <p className="text-gray-500 text-center p-6">No inspection payments found.</p>
          ) : (
            inspectionPayments.map((item) => {
              const status = String(item.status || '').toLowerCase();
              const isVerified = status === 'verified' || status === 'approved';
              const amount = item.estimatedCost || 0;
              return (
                <div key={item._id} className="border rounded-lg bg-gray-50 p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-lg">Inspection for {item.propertyLocation || 'property'}</p>
                      <p className="text-xs text-gray-500">Estimate: LKR {Number(amount).toLocaleString('en-LK')}</p>
                      <div className="mt-1">
                        <Pill color={isVerified ? 'green' : status === 'rejected' ? 'red' : status === 'uploaded' ? 'yellow' : 'gray'}>
                          {status ? status.toUpperCase() : 'PENDING'}
                        </Pill>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 text-right">
                      Inspection ID: <span className="font-mono">{String(item._id).slice(-6)}</span>
                    </div>
                  </div>

                  <div className="border rounded-lg bg-white shadow p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">Inspection Payment</p>
                      <p className="text-sm text-gray-600 mt-1">Amount: LKR {Number(amount).toLocaleString('en-LK')}</p>
                    </div>
                    <div>
                      <button
                        onClick={() => !isVerified && handleUploadProof(item._id)}
                        disabled={amount <= 0 || isVerified}
                        className={`px-3 py-1.5 rounded text-sm ${
                          isVerified
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : amount > 0
                            ? 'bg-brown-primary text-white hover:bg-brown-primary-700'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {isVerified ? 'Verified' : 'Upload Proof'}
                      </button>
                    </div>
                  </div>

                  <div className="mt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="border rounded-lg bg-gray-50 p-3">
                        <p className="text-xs text-gray-500">Bank</p>
                        <p className="font-medium">ABC Bank PLC</p>
                        <p className="text-xs text-gray-500 mt-1">Account Number</p>
                        <div className="flex items-center justify-between">
                          <span className="font-mono">123-456-789</span>
                          <button onClick={() => navigator.clipboard?.writeText('123-456-789')}
                            className="text-xs flex items-center text-brown-primary hover:underline">
                            <ClipboardIcon className="w-4 h-4 mr-1" />Copy
                          </button>
                        </div>
                      </div>
                      <div className="border rounded-lg bg-gray-50 p-3">
                        <p className="text-xs text-gray-500">Account Name</p>
                        <p className="font-medium">DesynFlow (Pvt) Ltd</p>
                        <p className="text-xs text-gray-500 mt-1">Reference</p>
                        <div className="flex items-center justify-between">
                          <span className="font-mono">INV-{item.propertyLocation?.slice(0,6).toUpperCase() || String(item._id).slice(-6)}</span>
                          <button onClick={() => navigator.clipboard?.writeText(`INV-${item.propertyLocation?.slice(0,6).toUpperCase() || String(item._id).slice(-6)}`)}
                            className="text-xs flex items-center text-brown-primary hover:underline">
                            <ClipboardIcon className="w-4 h-4 mr-1" />Copy
                          </button>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">After payment, upload the receipt to verify your payment.</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {tab === 'project' && (
        <div className="space-y-4 mt-10">
          <h3 className="text-lg font-semibold text-brown-primary">Project Payments</h3>
          {projects.length === 0 ? (
            <p className="text-gray-500 text-center p-6">No projects found.</p>
          ) : (
            projects.map((project) => {
              const pid = project._id;
              const quotation = getProjectQuotation(pid);
              const quoteTotal = quotation?.grandTotal || 0;
              const advanceRate = typeof project.advanceRate === 'number' ? project.advanceRate : 0.3;
              const advanceAmt = Math.round((project.advanceAmount ?? (quoteTotal * advanceRate)));
              const approvedSum = (() => {
                const sum = sumApprovedForProject(pid);
                if (sum > 0) return sum;
                return Number(project.paid || 0);
              })();
              const finalDue = Math.max(quoteTotal - approvedSum, 0);

              const advPayment = getProjectPayment(pid, 'advance');
              const advStatus = normStatus(advPayment?.status);
              const advVerified = isApproved(advStatus);
              const finalPayment = getProjectPayment(pid, 'final');
              const finalStatus = normStatus(finalPayment?.status);
              const finalVerified = isApproved(finalStatus);

              // Only allow final after a valid quotation exists and advance is verified or covered
              const eligibleForFinal = quoteTotal > 0 && (advVerified || approvedSum >= advanceAmt);

              return (
                <div key={pid} className="border rounded-lg bg-gray-50 p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-lg">{project.projectName || project.name || 'Project'}</p>
                      <p className="text-xs text-gray-500">Quotation Total: LKR {Number(quoteTotal).toLocaleString('en-LK')}</p>
                      <p className="text-xs text-gray-500">Approved Paid: LKR {Number(approvedSum).toLocaleString('en-LK')}</p>
                      {quoteTotal <= 0 && (
                        <p className="text-xs text-amber-700 mt-1">Quotation not available yet. Payments will be enabled once the quotation is issued.</p>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 text-right">
                      Project ID: <span className="font-mono">{String(pid).slice(-6)}</span>
                    </div>
                  </div>

                  {/* Advance Payment Card */}
                  <div className="border rounded-lg bg-white shadow p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium">Advance Payment</p>
                      <p className="text-sm text-gray-600 mt-1">Amount: LKR {Number(advanceAmt).toLocaleString('en-LK')}</p>
                      {advPayment && (
                        <div className="mt-1">
                          <Pill color={advVerified ? 'green' : advStatus === 'rejected' ? 'red' : advStatus === 'uploaded' || advStatus === 'pending' ? 'yellow' : 'gray'}>
                            {(advPayment.status || 'PENDING').toString().toUpperCase()
                            }
                          </Pill>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => !advVerified && advanceAmt > 0 && handleUploadProof(`${pid}-advance`)}
                      disabled={advanceAmt <= 0 || advVerified}
                      className={`px-3 py-1.5 rounded text-sm ${
                        advVerified || advanceAmt <= 0
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-brown-primary text-white hover:bg-brown-primary-700'
                      }`}
                    >
                      {advVerified ? 'Verified' : advanceAmt <= 0 ? 'Awaiting Quotation' : (advPayment ? 'Re-upload' : 'Upload Proof')}
                    </button>
                  </div>

                  {/* Final Payment Card */}
                  {eligibleForFinal && (
                    <div className="border rounded-lg bg-white shadow p-4 flex justify-between items-center">
                      <div>
                        <p className="font-medium">Final Payment</p>
                        <p className="text-sm text-gray-600 mt-1">Due: LKR {Number(finalDue).toLocaleString('en-LK')}</p>
                        {finalPayment && (
                          <div className="mt-1">
                            <Pill color={finalVerified ? 'green' : finalStatus === 'rejected' ? 'red' : finalStatus === 'uploaded' || finalStatus === 'pending' ? 'yellow' : 'gray'}>
                              {(finalPayment.status || 'PENDING').toString().toUpperCase()
                              }
                            </Pill>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => !finalVerified && finalDue > 0 && handleUploadProof(`${pid}-final`)}
                        disabled={finalVerified || finalDue <= 0 || quoteTotal <= 0}
                        className={`px-3 py-1.5 rounded text-sm ${
                          finalVerified || finalDue <= 0 || quoteTotal <= 0
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-brown-primary text-white hover:bg-brown-primary-700'
                        }`}
                      >
                        {finalVerified
                          ? 'Verified'
                          : quoteTotal <= 0
                          ? 'Awaiting Quotation'
                          : (finalPayment ? 'Re-upload' : 'Upload Proof')}
                      </button>
                    </div>
                  )}

                  <div className="sticky top-24 mt-4">
                    <BankDetails refId={`${(project.projectName || project.name || 'PRJ').slice(0,6).toUpperCase()}-${String(pid).slice(-4)}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      <UploadReceiptModal open={showModal} onClose={() => setShowModal(false)} onUploaded={handleUploaded} />
    </div>
  );
};
