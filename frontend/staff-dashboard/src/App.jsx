import React, { useState } from 'react';
import ProjectManagerDashboard from './project/ProjectManagerDashboard.jsx';
import TeamLeaderMainDashboard from './project/TeamLeaderMainDashboard.jsx';

function App() {
  // For demo purposes, we'll use a state to switch between dashboards
  // In a real app, this would be determined by authentication/user role
  const [userRole, setUserRole] = useState('project-manager'); // 'project-manager' or 'team-leader'

  const toggleRole = () => {
    setUserRole(userRole === 'project-manager' ? 'team-leader' : 'project-manager');
  };

  return (
    <div>
      {/* Demo role switcher - remove in production */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={toggleRole}
          className="bg-brown-primary text-white px-4 py-2 rounded shadow-lg hover:bg-brown-secondary transition-colors"
        >
          Switch to {userRole === 'project-manager' ? 'Team Leader' : 'Project Manager'}
        </button>
      </div>

      {/* Render appropriate dashboard based on user role */}
      {userRole === 'project-manager' ? (
        <ProjectManagerDashboard />
      ) : (
        <TeamLeaderMainDashboard />
      )}
    </div>
  );
}

export default App;
