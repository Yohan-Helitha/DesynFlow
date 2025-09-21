import React from 'react';
import { ClipboardCheck } from 'lucide-react';

export const ViewHistoryModal = ({ historyData }) => {
  return (
    <div className="bg-white shadow-sm rounded-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <span className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-500 mr-3">
          <ClipboardCheck size={20} />
        </span>
        Inspection Estimation History
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inspection Request ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Site Location</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Distance (km)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estimated Cost</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {historyData.map((item, index) => {
              const req = item.inspectionRequest || {};
              return (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm text-gray-500">{item.inspectionRequestId || '-'}</td>
                  <td className="px-4 py-4 text-sm text-gray-500">{req.clientId || '-'}</td>
                  <td className="px-4 py-4 text-sm text-gray-500">{req.clientName || '-'}</td>
                  <td className="px-4 py-4 text-sm text-gray-500">{req.email || '-'}</td>
                  <td className="px-4 py-4 text-sm text-gray-500">{req.phone || '-'}</td>
                  <td className="px-4 py-4 text-sm text-gray-500">{req.siteLocation || '-'}</td>
                  <td className="px-4 py-4 text-sm text-gray-500">{req.propertyType || '-'}</td>
                  <td className="px-4 py-4 text-sm text-gray-500">{item.distanceKm || item.distance || '-'}</td>
                  <td className="px-4 py-4 text-sm text-gray-500">{item.estimatedCost ? `$${item.estimatedCost}` : '-'}</td>
                  <td className="px-4 py-4 text-sm text-gray-500">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : (item.createdDate || item.date || '-')}</td>
                  <td className="px-4 py-4 text-sm">
                    <button className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700">View</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
