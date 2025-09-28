import React from 'react';
import ProjectManagerDashboard from './project/ProjectManagerDashboard.jsx';
import TeamLeaderMainDashboard from './project/TeamLeaderMainDashboard.jsx';

function App() {
  // TODO: Replace with actual authentication system
  // This will be integrated with your authentication context/state
  const userRole = 'project manager'; // This should come from authentication context
  
  return (
    <div>
      {/* Render appropriate dashboard based on authenticated user role */}
      {userRole === 'project manager' ? (
        <ProjectManagerDashboard />
      ) : userRole === 'team leader' ? (
        <TeamLeaderMainDashboard />
      ) : (
        <div className="flex items-center justify-center min-h-screen bg-cream-primary">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-brown-primary mb-4">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to access this dashboard.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
