import express from 'express';
import {
  getTeams,
  assignTeamLeader,
  updateTeamMemberRole,
  updateTeamMemberAvailability
} from '../controller/team.controller.js';

const router = express.Router();

// View all teams and their members
router.get('/teams', getTeams);

// Assign or reassign team leader
router.put('/teams/:id/leader', assignTeamLeader);

// Manage team roles and responsibilities
router.put('/teams/:id/members/:memberId/role', updateTeamMemberRole);

// Monitor team availability and workload
router.put('/teams/:id/members/:memberId/availability', updateTeamMemberAvailability);

export default router;
