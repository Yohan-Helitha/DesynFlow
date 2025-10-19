import React, { useState, useEffect } from 'react';

export default function TeamAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAttendance() {
      try {
        // Get first team for demo
        const teamRes = await fetch(`/api/teams`);
        const teams = await teamRes.json();
        const firstTeam = teams[0];
        
        if (firstTeam) {
          const attRes = await fetch(`/api/team/${firstTeam._id}`);
          const attData = await attRes.json();
          setAttendance(attData);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching attendance:', error);
        setLoading(false);
      }
    }
    fetchAttendance();
  }, []);

  if (loading) return <div className="p-8 text-brown-primary">Loading attendance...</div>;

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-brown-primary mb-6">Team Attendance Management</h2>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-brown-secondary mb-4">Recent Attendance Records</h3>
        
        {attendance.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-brown-primary">Date</th>
                  <th className="px-4 py-2 text-left text-brown-primary">Status</th>
                  <th className="px-4 py-2 text-left text-brown-primary">Check In</th>
                  <th className="px-4 py-2 text-left text-brown-primary">Check Out</th>
                  <th className="px-4 py-2 text-left text-brown-primary">Reason</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((record, index) => (
                  <tr key={record._id || index} className="border-b">
                    <td className="px-4 py-2">{new Date(record.date).toLocaleDateString()}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 text-xs rounded ${
                        record.status === 'present' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">{record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : '-'}</td>
                    <td className="px-4 py-2">{record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '-'}</td>
                    <td className="px-4 py-2">{record.reason || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No attendance records found.</p>
        )}
      </div>
    </div>
  );
}
