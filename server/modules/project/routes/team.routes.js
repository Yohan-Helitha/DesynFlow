import express from 'express';
import {
  getTeams,
  getAvailableUsers,
  createTeam,
  deleteTeam,
  assignTeamLeader,
  updateTeamMemberRole,
  updateTeamMemberAvailability
} from '../controller/team.controller.js';

const router = express.Router();

// View all teams and their members
router.get('/teams', getTeams);

// Get available users for team creation
router.get('/users/available', getAvailableUsers);

// Create new team
router.post('/teams', createTeam);

// Delete team
router.delete('/teams/:id', deleteTeam);

// Assign or reassign team leader
router.put('/teams/:id/leader', assignTeamLeader);

// Manage team roles and responsibilities
router.put('/teams/:id/members/:memberId/role', updateTeamMemberRole);

// Monitor team availability and workload
router.put('/teams/:id/members/:memberId/availability', updateTeamMemberAvailability);

export default router;
