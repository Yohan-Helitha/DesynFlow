import React from 'react';
import { X, Download, RefreshCw, Bell, Shield, User, Calendar, FileText, MapPin } from 'lucide-react';

export const ViewWarrantyModal = ({ warranty, onClose }) => {
  const isActive = warranty.status === 'Active';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#FFF8E8] rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#AAB396]">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-[#F7EED3] flex items-center justify-center text-[#674636] mr-3">
              <Shield size={20} />
            </div>
            <h3 className="text-lg font-semibold text-[#674636]">Warranty Details</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#AAB396] hover:text-[#674636] transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 text-[#674636]">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <Shield size={16} className="mr-2 text-[#AAB396]" />
                <div>
                  <span className="text-sm text-[#AAB396]">Warranty ID</span>
                  <p className="font-medium font-mono text-xs">{warranty._id || warranty.id || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center">
                <FileText size={16} className="mr-2 text-[#AAB396]" />
                <div>
                  <span className="text-sm text-[#AAB396]">Project ID</span>
                  <p className="font-medium font-mono text-xs">{warranty.projectId || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center">
                <MapPin size={16} className="mr-2 text-[#AAB396]" />
                <div>
                  <span className="text-sm text-[#AAB396]">Project Name</span>
                  <p className="font-medium">{warranty.projectName || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <span className="text-sm text-[#AAB396] mr-2">Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  isActive ? 'bg-[#AAB396] text-[#FFF8E8] border border-[#674636]' : 'bg-[#674636] text-[#FFF8E8] border border-[#674636]'
                }`}>
                  {warranty.status || 'Unknown'}
                </span>
              </div>

              <div>
                <span className="text-sm text-[#AAB396]">Warranty Type</span>
                <p className="font-medium">{warranty.type || warranty.materialType || 'N/A'}</p>
              </div>

              <div>
                <span className="text-sm text-[#AAB396]">Coverage</span>
                <p className="font-medium">{warranty.coverage || warranty.materialCategory || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Client Information */}
          <div className="bg-[#F7EED3] p-4 rounded-lg">
            <h4 className="font-semibold text-[#674636] mb-3 flex items-center">
              <User size={18} className="mr-2" />
              Client Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-[#AAB396]">Client Name</span>
                  <p className="font-medium">{warranty.clientName || 'N/A'}</p>
                </div>
                
                <div>
                  <span className="text-sm text-[#AAB396]">Client ID</span>
                  <p className="font-medium font-mono text-xs">{warranty.clientId || 'N/A'}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-sm text-[#AAB396]">Email</span>
                  <p className="font-medium">{warranty.clientEmail || 'N/A'}</p>
                </div>
                
                <div>
                  <span className="text-sm text-[#AAB396]">Phone</span>
                  <p className="font-medium">{warranty.clientPhone || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Item Information */}
          {(warranty.itemId || warranty.materialName) && (
            <div className="bg-[#FFF8E8] border border-[#AAB396] p-4 rounded-lg">
              <h4 className="font-semibold text-[#674636] mb-3">Item Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {warranty.itemId && (
                  <div>
                    <span className="text-sm text-[#AAB396]">Item ID</span>
                    <p className="font-medium font-mono text-xs">{warranty.itemId}</p>
                  </div>
                )}
                {warranty.materialName && (
                  <div>
                    <span className="text-sm text-[#AAB396]">Material Name</span>
                    <p className="font-medium">{warranty.materialName}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Warranty Period */}
          <div className="bg-[#F7EED3] p-4 rounded-lg">
            <h4 className="font-semibold text-[#674636] mb-3 flex items-center">
              <Calendar size={18} className="mr-2" />
              Warranty Period
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-sm text-[#AAB396]">Start Date</span>
                <p className="font-medium">{warranty.startDate || 'N/A'}</p>
              </div>
              
              <div>
                <span className="text-sm text-[#AAB396]">End Date</span>
                <p className="font-medium">{warranty.endDate || 'N/A'}</p>
              </div>
              
              <div>
                <span className="text-sm text-[#AAB396]">
                  {isActive ? 'Days Remaining' : 'Days Expired'}
                </span>
                <div className="mt-1">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    isActive
                      ? (warranty.daysRemaining <= 30
                          ? 'bg-[#674636] text-[#FFF8E8] border border-[#674636]'
                          : warranty.daysRemaining <= 90
                          ? 'bg-[#F7EED3] text-[#AAB396] border border-[#AAB396]'
                          : 'bg-[#AAB396] text-[#FFF8E8] border border-[#674636]')
                      : 'bg-[#674636] text-[#FFF8E8] border border-[#674636]'
                  }`}>
                    {isActive ? (warranty.daysRemaining || 0) : (warranty.daysExpired || 0)} days
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="bg-[#FFF8E8] border border-[#AAB396] p-4 rounded-lg">
            <h4 className="font-semibold text-[#674636] mb-3">Warranty Terms & Conditions</h4>
            <div className="text-sm text-[#674636] space-y-2">
              <p>
                This warranty covers {warranty.coverage?.toLowerCase() || 'materials and workmanship'} for the project "{warranty.projectName || 'N/A'}". 
                The warranty is valid from {warranty.startDate || 'N/A'} to {warranty.endDate || 'N/A'}.
              </p>
              
              <div className="mt-3">
                <span className="font-medium">Coverage Details:</span>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  {warranty.type === 'Basic' && (
                    <>
                      <li>Materials defects for 6 months</li>
                      <li>Workmanship defects for 6 months</li>
                      <li>Excludes damage from improper use</li>
                    </>
                  )}
                  {warranty.type === 'Standard' && (
                    <>
                      <li>Materials defects for 1 year</li>
                      <li>Workmanship defects for 1 year</li>
                      <li>One free inspection during warranty period</li>
                      <li>Excludes damage from improper use</li>
                    </>
                  )}
                  {warranty.type === 'Premium' && (
                    <>
                      <li>Materials defects for 2 years</li>
                      <li>Workmanship defects for 2 years</li>
                      <li>Two free inspections during warranty period</li>
                      <li>Emergency support within 24 hours</li>
                      <li>Limited coverage for accidental damage</li>
                    </>
                  )}
                  {!['Basic', 'Standard', 'Premium'].includes(warranty.type) && (
                    <>
                      <li>Standard materials and workmanship coverage</li>
                      <li>Coverage as per warranty agreement</li>
                      <li>Contact support for specific terms</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-[#AAB396] bg-[#F7EED3]">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#AAB396] text-[#FFF8E8] rounded-md text-sm font-medium hover:bg-[#674636] transition-colors"
          >
            Close
          </button>

          <button className="px-4 py-2 bg-[#674636] text-[#FFF8E8] rounded-md text-sm font-medium hover:bg-[#AAB396] transition-colors flex items-center">
            <Download size={16} className="mr-2" />
            Download Certificate
          </button>

          {isActive && warranty.daysRemaining <= 30 && (
            <button className="px-4 py-2 bg-[#F7EED3] text-[#674636] border border-[#AAB396] rounded-md text-sm font-medium hover:bg-[#AAB396] hover:text-[#FFF8E8] transition-colors flex items-center">
              <Bell size={16} className="mr-2" />
              Send Reminder
            </button>
          )}

          {!isActive && (
            <button className="px-4 py-2 bg-[#AAB396] text-[#FFF8E8] border border-[#674636] rounded-md text-sm font-medium hover:bg-[#674636] transition-colors flex items-center">
              <RefreshCw size={16} className="mr-2" />
              Renew Warranty
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
