import React, { useState, useEffect } from 'react';
import { Clock, Filter, ArrowUpDown, ChevronLeft, ChevronRight, Eye, Plus, Loader2 } from 'lucide-react';
import { ViewEstimationModal } from './ViewEstimationModal';

export const PendingEstimation = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProject, setSelectedProject] = useState(null);

  const itemsPerPage = 10;

  // Fetch projects with inspection data
  useEffect(() => {
    const fetchProjectsWithInspections = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/project-estimation/projects-with-inspections');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProjects(data);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectsWithInspections();
  }, []);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleViewProject = (project) => {
    setSelectedProject(project);
  };

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  const filteredProjects = projects
    .filter((project) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        project.projectName?.toLowerCase().includes(searchLower) ||
        project.inspectionId?.clientName?.toLowerCase().includes(searchLower) ||
        project.inspectionId?.siteLocation?.toLowerCase().includes(searchLower) ||
        project.status?.toLowerCase().includes(searchLower) ||
        project.inspectionId?.propertyType?.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      let aValue = getNestedValue(a, sortField);
      let bValue = getNestedValue(b, sortField);
      
      // Handle date sorting
      if (sortField === 'createdAt' || sortField === 'inspectionId.createdAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (aValue == null && bValue != null) return 1;
      if (aValue != null && bValue == null) return -1;
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Loading state
  if (loading) {
    return (
      <div className="p-0 m-0">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2 text-[#674636]">
            <Loader2 size={24} className="animate-spin" />
            <span>Loading projects...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-0 m-0">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-[#674636] mb-2">⚠️ Error</div>
            <div className="text-[#674636] mb-4">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#674636] text-[#FFF8E8] px-4 py-2 rounded-md hover:bg-[#AAB396]"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-0 m-0">
      {/* Header with Search */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-[#F7EED3] flex items-center justify-center text-[#674636] mr-3">
            <Clock size={20} />
          </div>
          <h2 className="text-xl font-semibold text-[#674636]">Projects Pending Estimations</h2>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search projects..."
            className="pl-3 pr-10 py-2 border border-[#AAB396] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#674636] focus:border-transparent bg-[#FFF8E8] text-[#674636]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Filter size={16} className="text-[#AAB396]" />
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-[#FFF8E8] shadow-sm rounded-md border border-[#AAB396] flex flex-col">
        <div className="overflow-x-auto flex-grow">
          <table className="min-w-full w-full divide-y divide-[#AAB396] border-collapse">
            <thead className="bg-[#F7EED3]">
              <tr>
                <th
                  className="px-4 py-2 text-left text-xs font-medium text-[#674636] uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('projectName')}
                >
                  <div className="flex items-center">
                    Project Name
                    <ArrowUpDown size={14} className="ml-1" />
                  </div>
                </th>
                <th
                  className="px-4 py-2 text-left text-xs font-medium text-[#674636] uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('inspectionId.clientName')}
                >
                  <div className="flex items-center">
                    Client Name
                    <ArrowUpDown size={14} className="ml-1" />
                  </div>
                </th>
                <th
                  className="px-4 py-2 text-left text-xs font-medium text-[#674636] uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('inspectionId.propertyType')}
                >
                  <div className="flex items-center">
                    Property Type
                    <ArrowUpDown size={14} className="ml-1" />
                  </div>
                </th>
                <th
                  className="px-4 py-2 text-left text-xs font-medium text-[#674636] uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('inspectionId.siteLocation')}
                >
                  <div className="flex items-center">
                    Site Location
                    <ArrowUpDown size={14} className="ml-1" />
                  </div>
                </th>
                {/* Removed Project Status and Inspection Status columns */}
                <th
                  className="px-4 py-2 text-left text-xs font-medium text-[#674636] uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center">
                    Created Date
                    <ArrowUpDown size={14} className="ml-1" />
                  </div>
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-[#674636] uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-[#FFF8E8] divide-y divide-[#AAB396]">
              {paginatedProjects.map((project) => (
                <tr key={project._id} className="hover:bg-[#F7EED3]">
                  <td className="px-4 py-2 text-sm font-medium text-[#674636]">
                    {project.projectName || 'N/A'}
                  </td>
                  <td className="px-4 py-2 text-sm text-[#674636]">
                    {project.inspectionId?.clientName || 'N/A'}
                  </td>
                  <td className="px-4 py-2 text-sm text-[#674636]">
                    {project.inspectionId?.propertyType || 'N/A'}
                  </td>
                  <td className="px-4 py-2 text-sm text-[#674636]">
                    {project.inspectionId?.siteLocation || 'N/A'}
                  </td>
                  {/* Removed Project Status and Inspection Status cells */}
                  <td className="px-4 py-2 text-sm text-[#674636]">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-right text-sm flex space-x-2">
                    <button
                      onClick={() => handleViewProject(project)}
                      className="text-[#FFF8E8] hover:bg-[#AAB396] bg-[#674636] px-3 py-1 rounded-md"
                      title="Generate Estimation"
                    >
                      <Plus size={16} className="inline mr-1" />
                      Generate
                    </button>
                  </td>
                </tr>
              ))}
              {paginatedProjects.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-2 text-center text-[#AAB396]">
                    No projects pending estimations found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredProjects.length > 0 && (
          <div className="px-4 py-2 flex items-center justify-between border-t border-[#AAB396] bg-[#F7EED3]">
            <div className="text-sm text-[#674636]">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredProjects.length)} of {filteredProjects.length} entries
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-md ${
                  currentPage === 1 ? 'text-[#AAB396] cursor-not-allowed' : 'text-[#674636] hover:bg-[#FFF8E8]'
                }`}
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-md ${
                    currentPage === page
                      ? 'bg-[#674636] text-[#FFF8E8]'
                      : 'text-[#674636] hover:bg-[#FFF8E8]'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-md ${
                  currentPage === totalPages
                    ? 'text-[#AAB396] cursor-not-allowed'
                    : 'text-[#674636] hover:bg-[#FFF8E8]'
                }`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedProject && (
        <ViewEstimationModal 
          estimation={selectedProject} 
          onClose={() => setSelectedProject(null)}
          onCreate={async (costs) => {
            const payload = {
              projectId: selectedProject._id, // use real _id
              materialCost: Number(costs.materialCost),
              laborCost: Number(costs.laborCost),
              serviceCost: Number(costs.serviceCost),
              contingencyCost: Number(costs.contingencyCost),
              total: Number(costs.totalCost),
              baseEstimateId: selectedProject._id,
            };
            const res = await fetch('/api/project-estimation/', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
            if (res.ok) {
              // Re-fetch pending projects so UI updates
              try {
                const refreshed = await fetch('/api/project-estimation/projects-with-inspections');
                if (refreshed.ok) {
                  const data = await refreshed.json();
                  setProjects(data);
                }
              } catch(e) { /* swallow */ }
            }
            setSelectedProject(null);
          }}
        />
      )}
    </div>
  );
};
