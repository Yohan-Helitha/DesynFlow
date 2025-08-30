import Team from '../model/team.model.js';
import User from '../../user/model/user.model.js';

export const getTeamsService = async () => {
  return await Team.find().populate('leaderId members.userId');
};

export const assignTeamLeaderService = async (id, leaderId) => {
  return await Team.findByIdAndUpdate(id, { leaderId }, { new: true }).populate('leaderId');
};

export const updateTeamMemberRoleService = async (id, memberId, role) => {
  const team = await Team.findById(id);
  if (!team) return null;
  const member = team.members.find(m => m.userId.toString() === memberId);
  if (!member) return null;
  member.role = role;
  await team.save();
  return team;
};

export const updateTeamMemberAvailabilityService = async (id, memberId, availability, workload) => {
  const team = await Team.findById(id);
  if (!team) return null;
  const member = team.members.find(m => m.userId.toString() === memberId);
  if (!member) return null;
  if (availability) member.availability = availability;
  if (workload !== undefined) member.workload = workload;
  await team.save();
  return team;
};
