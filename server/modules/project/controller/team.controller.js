
import {
  getTeamsService,
  assignTeamLeaderService,
  updateTeamMemberRoleService,
  updateTeamMemberAvailabilityService
} from '../service/team.service.js';

// View all teams and their members
export const getTeams = async (req, res) => {

  try {

    const teams = await getTeamsService();
    res.json(teams);

  } catch (error) {

    res.status(500).json({ message: 'Error fetching teams', error: error.message });

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
