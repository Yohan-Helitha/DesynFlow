import React, { useState, useEffect } from "react";

const API_BASE_URL = "http://localhost:4000/api"; // Adjust this to match your backend URL

export default function TeamManagement() {
  const [teams, setTeams] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form state for creating new team
  const [teamName, setTeamName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([null, null, null, null, null]);
  const [teamLeader, setTeamLeader] = useState("");
  const [creatingTeam, setCreatingTeam] = useState(false);

  // Fetch teams and available users on component mount
  useEffect(() => {
    fetchTeams();
    fetchAvailableUsers();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/teams`);
      if (!response.ok) throw new Error('Failed to fetch teams');
      const data = await response.json();
      setTeams(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/available`);
      if (!response.ok) throw new Error('Failed to fetch available users');
      const data = await response.json();
      setAvailableUsers(data);
    } catch (err) {
      console.error('Error fetching available users:', err);
    }
  };

  const handleMemberSelection = (memberIndex, userId) => {
    const newSelectedMembers = [...selectedMembers];
    newSelectedMembers[memberIndex] = userId;
    setSelectedMembers(newSelectedMembers);
    
    // Reset team leader if the selected leader is no longer in the team
    if (teamLeader && !newSelectedMembers.includes(teamLeader)) {
      setTeamLeader("");
    }
  };

  const getSelectedMembersForLeader = () => {
    return selectedMembers.filter(id => id !== null).map(id => {
      const user = availableUsers.find(u => u._id === id);
      return user ? { _id: user._id, username: user.username, role: user.role } : null;
    }).filter(Boolean);
  };

  const isCreateButtonEnabled = () => {
    return teamName.trim() !== "" && 
           selectedMembers.every(id => id !== null) && 
           teamLeader !== "";
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setCreatingTeam(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamName,
          memberIds: selectedMembers,
          leaderId: teamLeader
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create team');
      }

      // Reset form
      setTeamName("");
      setSelectedMembers([null, null, null, null, null]);
      setTeamLeader("");
      
      // Refresh data
      await fetchTeams();
      await fetchAvailableUsers();
      
      alert('Team created successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setCreatingTeam(false);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm('Are you sure you want to delete this team?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/teams/${teamId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete team');
      }

      await fetchTeams();
      await fetchAvailableUsers();
      alert('Team deleted successfully!');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const getAvailableUsersForMember = (memberIndex) => {
    // Get users that are not selected in other positions
    const otherSelectedIds = selectedMembers.filter((id, index) => index !== memberIndex && id !== null);
    return availableUsers.filter(user => !otherSelectedIds.includes(user._id));
  };

  if (loading) {
    return (
      <div className="bg-cream-primary min-h-screen p-8 flex items-center justify-center">
        <div className="text-brown-primary">Loading teams...</div>
      </div>
    );
  }

  return (
    <div className="bg-cream-primary min-h-screen p-8">
      <h2 className="text-2xl font-bold text-brown-primary mb-6">
        Team Management
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Current Teams */}
      <div className="space-y-6 mb-8">
        {teams.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
            No teams found. Create your first team below.
          </div>
        ) : (
          teams.map((team) => (
            <div key={team._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-brown-primary">
                  {team.teamName}
                </h3>
                <div className="flex gap-2">
                  {team.isAssignedToProject ? (
                    <span className="px-3 py-1 bg-gray-400 text-white rounded text-sm">
                      Assigned to Project
                    </span>
                  ) : (
                    <>
                      <button 
                        className="px-3 py-1 bg-brown-primary text-white rounded hover:bg-brown-primary-300 text-sm"
                        onClick={() => {/* TODO: Implement edit */}}
                      >
                        Edit
                      </button>
                      <button 
                        className="px-3 py-1 bg-red-brown text-white rounded hover:bg-dark-brown text-sm"
                        onClick={() => handleDeleteTeam(team._id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              <div className="mb-3">
                <span className="text-sm font-semibold text-brown-primary">Team Leader: </span>
                <span className="text-green-600 font-medium">
                  {team.leaderId?.username || 'Not assigned'} ({team.leaderId?.role || 'N/A'})
                </span>
              </div>

              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {team.members?.map((member, j) => (
                  <li key={j} className="bg-cream-light p-3 rounded">
                    <span className="font-semibold text-brown-primary">
                      {member.userId?.username || 'Unknown User'}
                    </span>{" "}
                    <span className="text-gray-600 text-sm">
                      ({member.userId?.role || member.role || 'No Role'})
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      Status: {member.availability || 'Available'} | Workload: {member.workload || 0}%
                    </div>
                  </li>
                )) || <li className="text-gray-500">No members found</li>}
              </ul>
            </div>
          ))
        )}
      </div>

      {/* Create New Team */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-brown-primary mb-4">
          Create a New Team
        </h3>
        <form onSubmit={handleCreateTeam} className="space-y-4">
          {/* Team Name */}
          <div>
            <label className="block text-sm font-semibold text-brown-primary mb-1">
              Team Name
            </label>
            <input
              type="text"
              placeholder="Enter team name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full border border-gray-300 rounded p-2"
              required
            />
          </div>

          {/* Member Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5].map((memberNum, index) => (
              <div key={memberNum}>
                <label className="block text-sm font-semibold text-brown-primary mb-1">
                  Member {memberNum}
                </label>
                <select
                  value={selectedMembers[index] || ""}
                  onChange={(e) => handleMemberSelection(index, e.target.value || null)}
                  className="w-full border border-gray-300 rounded p-2"
                  required
                >
                  <option value="">Select Member {memberNum}</option>
                  {getAvailableUsersForMember(index).map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.username} ({user.role})
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* Team Leader Selection */}
          <div>
            <label className="block text-sm font-semibold text-brown-primary mb-1">
              Team Leader
            </label>
            <select
              value={teamLeader}
              onChange={(e) => setTeamLeader(e.target.value)}
              className="w-full border border-gray-300 rounded p-2"
              disabled={selectedMembers.every(id => id === null)}
              required
            >
              <option value="">Select Team Leader</option>
              {getSelectedMembersForLeader().map((member) => (
                <option key={member._id} value={member._id}>
                  {member.username} ({member.role})
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={!isCreateButtonEnabled() || creatingTeam}
            className={`mt-4 px-4 py-2 rounded ${
              isCreateButtonEnabled() && !creatingTeam
                ? 'bg-brown-primary text-white hover:bg-opacity-90'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {creatingTeam ? 'Creating...' : '+ Create Team'}
          </button>
        </form>

        {/* Available Users Info */}
        <div className="mt-6 p-4 bg-gray-50 rounded">
          <h4 className="font-semibold text-brown-primary mb-2">
            Available Users ({availableUsers.length})
          </h4>
          <div className="text-sm text-gray-600 max-h-32 overflow-y-auto">
            {availableUsers.length === 0 ? (
              <p>No users available for team assignment.</p>
            ) : (
              availableUsers.map((user) => (
                <div key={user._id} className="mb-1">
                  {user.username} - {user.role}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
