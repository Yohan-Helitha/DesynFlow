import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlay, FaStop, FaClock, FaCalendarAlt, FaFlag } from 'react-icons/fa';

export default function TaskDetailsModal({ task, isOpen, onClose, timeTracking, onToggleTimeTracking }) {
  const [taskData, setTaskData] = useState(task || null);

  useEffect(() => {
    setTaskData(task || null);
  }, [task]);

  if (!isOpen || !taskData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-brown-primary">{taskData.name}</h2>
            <span className="px-2 py-1 rounded text-xs font-medium bg-green-primary text-dark-brown">{taskData.status}</span>
            <span className="px-2 py-1 rounded text-xs font-medium bg-warm-brown text-dark-brown">{taskData.priority} priority</span>
          </div>
          <div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><FaTimes size={20} /></button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Description</h3>
            <p className="text-gray-600">{taskData.description || 'No description provided'}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1"><FaCalendarAlt className="inline mr-1" /> Due Date</h4>
              <p className="text-gray-600">{taskData.dueDate ? new Date(taskData.dueDate).toLocaleDateString() : 'No due date'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1"><FaFlag className="inline mr-1" /> Priority</h4>
              <p className="text-gray-600 capitalize">{taskData.priority}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Weight</h4>
              <p className="text-gray-600">{taskData.weight || 0} points</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Project</h4>
              <p className="text-gray-600">{taskData.projectName || '-'}</p>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Progress</h4>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-200 rounded-full h-3">
                <div className="bg-brown-primary h-3 rounded-full transition-all duration-300" style={{ width: `${taskData.progressPercentage || 0}%` }} />
              </div>
              <span className="text-sm text-gray-600">{taskData.progressPercentage || 0}%</span>
            </div>
          </div>

          {/* Time Tracking - restyled to match app palette */}
          <div className="mb-6 p-4 bg-cream-light border border-cream-primary rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-brown-primary flex items-center gap-2"><FaClock /> Time Tracking</h3>
            </div>
            <div className="flex items-center justify-between">
              <div>
                {timeTracking?.active && timeTracking?.taskId === taskData._id ? (
                  <p className="text-brown-primary">Timer running since {timeTracking.startTime?.toLocaleTimeString()}</p>
                ) : (
                  <p className="text-gray-600">No active timer</p>
                )}
              </div>
              <div>
                <button
                  onClick={() => onToggleTimeTracking(taskData._id)}
                  className={`px-4 py-2 rounded-lg text-white ${timeTracking?.active && timeTracking?.taskId === taskData._id ? 'bg-red-brown hover:bg-red-brown-600' : 'bg-brown-primary hover:bg-brown-secondary'}`}
                >
                  {timeTracking?.active && timeTracking?.taskId === taskData._id ? <><FaStop className="inline mr-2"/> Stop Timer</> : <><FaPlay className="inline mr-2"/> Start Timer</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
