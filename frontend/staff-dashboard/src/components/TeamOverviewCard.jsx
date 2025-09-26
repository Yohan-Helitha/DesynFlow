import React from 'react';
import { FaUserTie, FaTasks, FaUserCheck } from 'react-icons/fa';
import { MdGroups } from 'react-icons/md';

export default function TeamOverviewCard({ team, tasks, attendance }) {
  if (!team) return null;

  const attendanceCount = attendance ? attendance.length : 0;
  const tasksCount = tasks ? tasks.length : 0;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-brown-primary">Team Overview</h3>
        <span
          className={`px-3 py-1 text-xs rounded-full font-semibold ${
            team.active
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {team.active ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Team Info */}
        <div>
          <h4 className="text-lg font-medium text-brown-secondary mb-3 flex items-center gap-2">
            <MdGroups className="text-brown-primary" /> Team Info
          </h4>
          <p className="text-gray-700 mb-2">
            <span className="font-semibold">Name:</span> {team.teamName}
          </p>
          <p className="text-gray-700">
            <span className="font-semibold">Members:</span>{' '}
            {team.members ? team.members.length : 0}
          </p>
        </div>

        {/* Team Members */}
        <div>
          <h4 className="text-lg font-medium text-brown-secondary mb-3 flex items-center gap-2">
            <FaUserTie className="text-brown-primary" /> Members
          </h4>
          <ul className="space-y-2">
            {team.members &&
              team.members.map((member, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between text-sm text-gray-700 bg-gray-50 p-2 rounded-md"
                >
                  <span className="font-medium">{member.role}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {member.availability}
                    </span>
                    {/* Workload bar */}
                    <div className="w-16 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-brown-primary h-2"
                        style={{ width: `${member.workload}%` }}
                      ></div>
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        </div>

        {/* Quick Stats */}
        <div>
          <h4 className="text-lg font-medium text-brown-secondary mb-3">
            Quick Stats
          </h4>
          <div className="space-y-3">
            <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaTasks className="text-blue-600" />
                <span className="text-sm text-blue-800 font-medium">
                  Active Tasks
                </span>
              </div>
              <span className="text-blue-700 text-lg font-bold">
                {tasksCount}
              </span>
            </div>

            <div className="bg-green-50 p-4 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaUserCheck className="text-green-600" />
                <span className="text-sm text-green-800 font-medium">
                  Attendance
                </span>
              </div>
              <span className="text-green-700 text-lg font-bold">
                {attendanceCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
