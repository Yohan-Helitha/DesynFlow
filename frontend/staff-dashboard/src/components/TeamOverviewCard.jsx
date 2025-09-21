import React from 'react';

export default function TeamOverviewCard({ team, tasks, attendance }) {
  if (!team) return null;

  const attendanceCount = attendance ? attendance.length : 0;
  const tasksCount = tasks ? tasks.length : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-xl font-semibold text-brown-primary mb-4">Team Overview</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Team Info */}
        <div>
          <h4 className="text-lg font-medium text-brown-secondary mb-2">Team Information</h4>
          <p className="text-gray-600 mb-1">
            <span className="font-medium">Name:</span> {team.teamName}
          </p>
          <p className="text-gray-600 mb-1">
            <span className="font-medium">Members:</span> {team.members ? team.members.length : 0}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Status:</span> 
            <span className={`ml-2 px-2 py-1 text-xs rounded ${team.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {team.active ? 'Active' : 'Inactive'}
            </span>
          </p>
        </div>

        {/* Team Members */}
        <div>
          <h4 className="text-lg font-medium text-brown-secondary mb-2">Team Members</h4>
          <ul className="space-y-1">
            {team.members && team.members.map((member, index) => (
              <li key={index} className="text-gray-600 text-sm">
                <span className="font-medium">{member.role}</span>
                <span className="ml-2 text-xs text-gray-500">
                  ({member.availability} - {member.workload}% load)
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Stats */}
        <div>
          <h4 className="text-lg font-medium text-brown-secondary mb-2">Quick Stats</h4>
          <div className="space-y-2">
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-blue-800 font-semibold text-sm">Active Tasks</p>
              <p className="text-blue-600 text-lg font-bold">{tasksCount}</p>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <p className="text-green-800 font-semibold text-sm">Attendance Records</p>
              <p className="text-green-600 text-lg font-bold">{attendanceCount}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}