import React, { useEffect, useState } from 'react';
import { Filter, ArrowUpDown, ChevronLeft, ChevronRight, Wrench, RefreshCw } from 'lucide-react';
import WarrantyClaimActionModal from './WarrantyClaimActionModal';

// Table displaying warranty claims (warrenty_claim model)
export const WarrantyRequest = () => {
	const [claims, setClaims] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [search, setSearch] = useState('');
	const [sortField, setSortField] = useState('createdAt');
	const [sortDirection, setSortDirection] = useState('desc');
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 5;
	const [refreshKey, setRefreshKey] = useState(0);
	const [showViewModal, setShowViewModal] = useState(false);
	const [selectedClaim, setSelectedClaim] = useState(null);

	useEffect(() => {
		async function fetchClaims() {
			setLoading(true);
			setError('');
			try {
				const resp = await fetch('/api/claims/pending');
				if (!resp.ok) throw new Error('Failed to load pending warranty claims');
				const data = await resp.json();
				setClaims(Array.isArray(data) ? data : []);
			} catch (e) {
				setError(e.message);
			} finally {
				setLoading(false);
			}
		}
		fetchClaims();
	}, [refreshKey]);

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
		{ key: '_id', label: 'Claim ID' },
		{ key: 'warrantyId', label: 'Warranty ID', render: r => (typeof r.warrantyId === 'object' ? r.warrantyId?._id || '' : r.warrantyId || '') },
		{ key: 'clientId', label: 'Client ID', render: r => (typeof r.clientId === 'object' ? r.clientId?._id || '' : r.clientId || '') },
		{ key: 'issueDescription', label: 'Issue' },
		{ key: 'status', label: 'Status', render: r => statusBadge(r.status) },
		{ key: 'createdAt', label: 'Created', render: r => r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '' },
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
		<div>
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center">
					<h2 className="text-xl font-semibold text-[#674636]">Warranty Requests</h2>
				</div>
				<div className="flex space-x-2">
					<div className="relative">
						<input
							type="text"
							placeholder="Search pending claims..."
							className="pl-3 pr-10 py-2 border border-[#AAB396] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#674636] focus:border-transparent bg-[#F7EED3] placeholder-[#AAB396]"
							value={search}
							onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
						/>
						<button className="absolute right-3 top-1/2 -translate-y-1/2">
							<Filter size={16} className="text-[#AAB396]" />
						</button>
					</div>
					<button
						onClick={() => setRefreshKey(k => k + 1)}
						className="bg-[#674636] text-[#FFF8E8] px-3 py-2 rounded-md text-sm font-medium hover:bg-[#AAB396] flex items-center"
						title="Refresh"
					>
						<RefreshCw size={16} className="mr-1" /> Refresh
					</button>
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
										className="px-4 py-3 text-left text-xs font-medium text-[#674636] uppercase tracking-wider cursor-pointer"
										onClick={() => handleSort(col.key === 'warehouseActionDate' ? 'warehouseAction.shippedAt' : col.key)}
									>
										<div className="flex items-center">
											{col.label}
											<ArrowUpDown size={14} className="ml-1" />
										</div>
									</th>
								))}
								<th className="px-4 py-3 text-right text-xs font-medium text-[#674636] uppercase tracking-wider">Actions</th>
							</tr>
						</thead>
						<tbody className="bg-[#FFF8E8] divide-y divide-[#AAB396]">
							{loading && (
								<tr><td colSpan={columns.length + 1} className="p-6 text-center text-[#674636]">Loading pending claims...</td></tr>
							)}
							{!loading && pageSlice.length === 0 && (
								<tr><td colSpan={columns.length + 1} className="p-6 text-center text-[#AAB396]">No pending claims found</td></tr>
							)}
							{!loading && pageSlice.map(row => (
								<tr key={row._id} className="hover:bg-[#F7EED3]">
									{columns.map(col => (
										<td key={col.key} className="px-4 py-3 text-xs font-mono text-[#674636] whitespace-pre-line break-words max-w-xs">
											{col.render ? col.render(row) : (row[col.key] ?? '')}
										</td>
									))}
									<td className="px-4 py-3 text-xs font-mono text-right text-[#674636] whitespace-pre-line break-words max-w-xs font-medium">
										<button 
											onClick={() => handleView(row)}
											className="text-[#674636] hover:text-[#AAB396] bg-[#FFF8E8] px-3 py-1 rounded-md border border-[#AAB396] hover:border-[#674636] transition-colors text-xs font-mono"
										>
											<Wrench size={16} className="inline mr-1" /> Action
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{/* Pagination */}
				{!loading && filtered.length > 0 && (
					<div className="px-4 py-3 flex items-center justify-between border-t border-[#AAB396] bg-[#FFF8E8]">
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

			{/* Warranty Claim Action Modal */}
			{showViewModal && (
				<WarrantyClaimActionModal
					claim={selectedClaim}
					onClose={() => setShowViewModal(false)}
					onAction={() => {
						setShowViewModal(false);
						setRefreshKey(k => k + 1);
					}}
				/>
			)}
		</div>
	);
};

export default WarrantyRequest;
