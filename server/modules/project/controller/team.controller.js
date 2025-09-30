
import {
  getTeamsService,
  getAvailableUsersService,
  createTeamService,
  checkTeamAssignmentService,
  deleteTeamService,
  assignTeamLeaderService,
  updateTeamMemberRoleService,
  updateTeamMemberAvailabilityService
} from '../service/team.service.js';

// View all teams and their members
export const getTeams = async (req, res) => {
  try {
    const teams = await getTeamsService();
    
    // Check if each team is assigned to a project
    const teamsWithStatus = await Promise.all(
      teams.map(async (team) => {
        const isAssigned = await checkTeamAssignmentService(team._id);
        const teamObj = team.toJSON ? team.toJSON() : team;
        return {
          ...teamObj,
          isAssignedToProject: isAssigned
        };
      })
    );
    
    res.json(teamsWithStatus);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teams', error: error.message });
  }
};

// View all teams with populated user data
export const getTeamsPopulated = async (req, res) => {
  try {
    const teams = await getTeamsService(true); // Pass true for populated data
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teams with user data', error: error.message });
  }
};

// Get available users (not assigned to any active team)
export const getAvailableUsers = async (req, res) => {
  try {
    const users = await getAvailableUsersService();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching available users', error: error.message });
  }
};

// Create new team
export const createTeam = async (req, res) => {
  try {
    const { teamName, memberIds, leaderId } = req.body;

    if (!teamName || !memberIds || !leaderId || memberIds.length !== 5) {
      return res.status(400).json({ 
        message: 'Team name, exactly 5 member IDs, and leader ID are required' 
      });
    }

    const newTeam = await createTeamService(teamName, memberIds, leaderId);
    res.status(201).json(newTeam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete team
export const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;
    
    await deleteTeamService(id);
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    if (error.message.includes('Cannot delete team')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error deleting team', error: error.message });
  }
};

// Assign or reassign team leader
export const assignTeamLeader = async (req, res) => {

  try {
    const {id} = req.params;
    const {leaderId} = req.body;

    const updatedTeam = await assignTeamLeaderService(id, leaderId);

    if (!updatedTeam) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.json(updatedTeam);
  } catch (error) {

    res.status(500).json({ message: 'Error assigning team leader', error: error.message });

  }

};

// Manage team roles and responsibilities
export const updateTeamMemberRole = async (req, res) => {

  try {
    const {id, memberId} = req.params; // team id, member id
    const {role} = req.body;

    const team = await updateTeamMemberRoleService(id, memberId, role);
    if (!team) {
      return res.status(404).json({ message: 'Team or member not found' });
    }

    res.json(team);

  } catch (error) {

    res.status(500).json({ message: 'Error updating member role', error: error.message });
    
  }
};

// Monitor team availability and workload
export const updateTeamMemberAvailability = async (req, res) => {
  try {
    const { id, memberId } = req.params; // team id, member id
    const { availability, workload } = req.body;
    const team = await updateTeamMemberAvailabilityService(id, memberId, availability, workload);
    if (!team) {
      return res.status(404).json({ message: 'Team or member not found' });
    }
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: 'Error updating member availability/workload', error: error.message });
  }
};
