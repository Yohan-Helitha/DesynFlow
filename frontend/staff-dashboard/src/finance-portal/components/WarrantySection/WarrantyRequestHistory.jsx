import React, { useEffect, useState } from 'react';
import { Filter, ArrowUpDown, ChevronLeft, ChevronRight, Eye, Clock } from 'lucide-react';
import { ViewWarrantyClaimModal } from './ViewWarrantyClaimModal';

// Table displaying resolved warranty claims (Approved, Rejected, Replaced statuses)
export const WarrantyRequestHistory = () => {
	const [claims, setClaims] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [search, setSearch] = useState('');
	const [sortField, setSortField] = useState('updatedAt');
	const [sortDirection, setSortDirection] = useState('desc');
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 5;
	const [showViewModal, setShowViewModal] = useState(false);
	const [selectedClaim, setSelectedClaim] = useState(null);

	useEffect(() => {
		fetchResolvedClaims();
	}, []);

	const fetchResolvedClaims = async () => {
		setLoading(true);
		setError('');
		try {
			const resp = await fetch('/api/claims/resolved');
			if (!resp.ok) throw new Error('Failed to load resolved warranty claims');
			const data = await resp.json();
			setClaims(Array.isArray(data) ? data : []);
		} catch (e) {
			setError(e.message);
		} finally {
			setLoading(false);
		}
	};

	const handleSort = (field) => {
		if (sortField === field) {
			setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
		} else {
			setSortField(field);
			setSortDirection('asc');
		}
	};

	const handleView = (claim) => {
		setSelectedClaim(claim);
		setShowViewModal(true);
	};

	const filtered = claims
		.filter(c => {
			const q = search.toLowerCase();
			return (
				(c._id && c._id.toLowerCase().includes(q)) ||
				(c.issueDescription && c.issueDescription.toLowerCase().includes(q)) ||
				(c.status && c.status.toLowerCase().includes(q))
			);
		})
		.sort((a, b) => {
			const av = a[sortField];
			const bv = b[sortField];
			if (av == null && bv != null) return 1;
			if (av != null && bv == null) return -1;
			if (av < bv) return sortDirection === 'asc' ? -1 : 1;
			if (av > bv) return sortDirection === 'asc' ? 1 : -1;
			return 0;
		});

	const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
	const pageSlice = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

	const columns = [
		{ key: 'clientName', label: 'Client name', render: r => (typeof r.clientId === 'object' ? (r.clientId?.username || r.clientId?.email || '') : (r.clientName || '')) },
		{ key: 'issueDescription', label: 'Issue' },
		{ key: 'proofUrl', label: 'Proof', render: r => r.proofUrl ? (
			<a href={r.proofUrl} target="_blank" rel="noopener noreferrer" className="text-[#674636] hover:text-[#AAB396] underline">
				View
			</a>
		) : <span className="text-[#AAB396]">No proof</span> },
		{ key: 'status', label: 'Status', render: r => statusBadge(r.status) },
		{ key: 'warehouseAction', label: 'Shipped', render: r => r.warehouseAction?.shippedReplacement ? 'Yes' : 'No' },
		{ key: 'warehouseActionDate', label: 'Shipped At', render: r => r.warehouseAction?.shippedAt ? new Date(r.warehouseAction.shippedAt).toLocaleDateString() : '' },
		{ key: 'updatedAt', label: 'Resolved', render: r => r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : '' },
	];

	function statusBadge(status) {
		const map = {
			Submitted: 'bg-[#F7EED3] text-[#674636] border border-[#AAB396]',
			UnderReview: 'bg-[#FFF8E8] text-[#AAB396] border border-[#AAB396]',
			Approved: 'bg-[#AAB396] text-[#FFF8E8] border border-[#674636]',
			Rejected: 'bg-[#674636] text-[#FFF8E8] border border-[#674636]',
			Replaced: 'bg-[#F7EED3] text-[#AAB396] border border-[#674636]'
		};
		const cls = map[status] || 'bg-[#F7EED3] text-[#674636] border border-[#AAB396]';
		return (
			<span className={`px-2 py-0.5 inline-flex text-xs font-medium rounded-full ${cls}`}>{status}</span>
		);
	}

		return (
		<div className="bg-[#F7EED3] p-4 rounded-md shadow-sm">
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center">
					<div className="w-10 h-10 rounded-full bg-[#F7EED3] flex items-center justify-center text-[#674636] mr-3">
						<Clock size={20} />
					</div>
					<h2 className="text-xl font-semibold text-[#674636]">Warranty Requests History</h2>
				</div>
				<div className="flex space-x-2">
					<div className="relative">
			            <input
							type="text"
							placeholder="Search resolved claims..."
										className="pl-3 pr-10 py-2 border border-[#AAB396] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#674636] focus:border-transparent bg-[#F7EED3] placeholder-[#AAB396] text-[#674636]"
							value={search}
							onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
						/>
						<button className="absolute right-3 top-1/2 -translate-y-1/2">
							<Filter size={16} className="text-[#AAB396]" />
						</button>
					</div>
				</div>
			</div>

			<div className="bg-[#FFF8E8] shadow-sm rounded-md overflow-hidden border border-[#AAB396]">
				{error && <div className="p-4 text-sm text-[#674636] bg-[#F7EED3] border border-[#AAB396] rounded-md">{error}</div>}
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-[#AAB396]">
						<thead className="bg-[#F7EED3]">
							<tr>
								{columns.map(col => (
									<th
										key={col.key}
										className="px-6 py-3 text-left text-xs font-medium text-[#674636] uppercase tracking-wider cursor-pointer"
										onClick={() => handleSort(col.key === 'warehouseActionDate' ? 'warehouseAction.shippedAt' : col.key)}
									>
										<div className="flex items-center">
											{col.label}
											<ArrowUpDown size={14} className="ml-1" />
										</div>
									</th>
								))}
								<th className="px-6 py-3 text-right text-xs font-medium text-[#674636] uppercase tracking-wider">Actions</th>
							</tr>
						</thead>
						<tbody className="bg-[#FFF8E8] divide-y divide-[#AAB396]">
							{loading && (
								<tr><td colSpan={columns.length + 1} className="px-6 py-4 text-center text-[#674636]">Loading resolved claims...</td></tr>
							)}
							{!loading && pageSlice.length === 0 && (
								<tr><td colSpan={columns.length + 1} className="px-6 py-4 text-center text-[#AAB396]">No resolved claims found</td></tr>
							)}
							{!loading && pageSlice.map(row => (
								<tr key={row._id} className="hover:bg-[#F7EED3]">
									{columns.map(col => (
										<td key={col.key} className="px-6 py-4 text-xs font-mono text-[#674636] whitespace-pre-line break-words max-w-xs">
											{col.render ? col.render(row) : (row[col.key] ?? '')}
										</td>
									))}
									<td className="px-6 py-4 text-xs font-mono text-right text-[#674636] whitespace-pre-line break-words max-w-xs font-medium">
										<button 
											onClick={() => handleView(row)}
											className="text-[#674636] hover:text-[#AAB396] bg-[#FFF8E8] px-3 py-1 rounded-md border border-[#AAB396] hover:border-[#674636] transition-colors text-xs font-mono"
										>
											<Eye size={16} className="inline mr-1" /> View
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{/* Pagination */}
				{!loading && filtered.length > 0 && (
					<div className="px-6 py-3 flex items-center justify-between border-t border-[#AAB396] bg-[#FFF8E8]">
						<div className="text-sm text-[#674636]">
							Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} entries
						</div>
						<div className="flex space-x-2">
							<button
								onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
								disabled={currentPage === 1}
								className={`p-2 rounded-md ${currentPage === 1 ? 'text-[#AAB396] cursor-not-allowed' : 'text-[#674636] hover:bg-[#F7EED3]'}`}
							>
								<ChevronLeft size={16} />
							</button>
							{Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
								<button
									key={page}
									onClick={() => setCurrentPage(page)}
									className={`w-8 h-8 rounded-md ${currentPage === page ? 'bg-[#674636] text-[#FFF8E8]' : 'text-[#674636] hover:bg-[#F7EED3]'}`}
								>
									{page}
								</button>
							))}
							<button
								onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
								disabled={currentPage === totalPages}
								className={`p-2 rounded-md ${currentPage === totalPages ? 'text-[#AAB396] cursor-not-allowed' : 'text-[#674636] hover:bg-[#F7EED3]'}`}
							>
								<ChevronRight size={16} />
							</button>
						</div>
					</div>
				)}
			</div>

			{/* View Warranty Claim Modal */}
			{showViewModal && (
				<ViewWarrantyClaimModal 
					claim={selectedClaim} 
					onClose={() => setShowViewModal(false)} 
				/>
			)}
		</div>
	);
};

export default WarrantyRequestHistory;