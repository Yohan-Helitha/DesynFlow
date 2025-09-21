import React, { useState } from 'react';
import { Clock, Filter, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { ViewEstimationModal } from './ViewEstimationModal';

// Mock data
const pendingEstimations = [
  { id: 'EST-002', clientName: 'Sarah Johnson', project: 'Office Expansion', amount: 3200, date: '2023-06-18' },
  { id: 'EST-005', clientName: 'David Wilson', project: 'Shopping Mall Maintenance', amount: 8000, date: '2023-06-25' },
  { id: 'EST-006', clientName: 'Lucas Adams', project: 'Factory Roof Repair', amount: 1500, date: '2023-06-26' },
  { id: 'EST-007', clientName: 'Emma Thompson', project: 'School Renovation', amount: 9000, date: '2023-06-27' },
];

export const PendingEstimation = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEstimation, setSelectedEstimation] = useState(null);

  const itemsPerPage = 3;

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredEstimations = pendingEstimations
    .filter(
      (est) =>
        est.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        est.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        est.project.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const totalPages = Math.ceil(filteredEstimations.length / itemsPerPage);
  const paginatedEstimations = filteredEstimations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      {/* Header with Search */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-500 mr-3">
            <Clock size={20} />
          </div>
          <h2 className="text-xl font-semibold">Pending Estimations</h2>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search estimations..."
            className="pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Filter size={16} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['id', 'clientName', 'project', 'amount', 'date'].map((field, i) => (
                  <th
                    key={i}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort(field)}
                  >
                    <div className="flex items-center capitalize">
                      {field}
                      <ArrowUpDown size={14} className="ml-1" />
                    </div>
                  </th>
                ))}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedEstimations.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.clientName}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.project}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">${item.amount}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.date}</td>
                  <td className="px-6 py-4 text-right text-sm">
                    <button
                      onClick={() => setSelectedEstimation(item)}
                      className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded-md"
                    >
                      Generate
                    </button>
                  </td>
                </tr>
              ))}
              {paginatedEstimations.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No pending estimations found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredEstimations.length > 0 && (
          <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredEstimations.length)} of {filteredEstimations.length} entries
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-md ${
                  currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-md ${
                    currentPage === page ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-md ${
                  currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedEstimation && (
        <ViewEstimationModal estimation={selectedEstimation} onClose={() => setSelectedEstimation(null)} />
      )}
    </div>
  );
};
