import Team from '../model/team.model.js';
import User from '../../auth/model/user.model.js';
import Project from '../model/project.model.js';
import mongoose from 'mongoose';

export const getTeamsService = async (populateMembers = false) => {
  const teams = await Team.find().populate('leaderId', 'username email role');
  
  if (!populateMembers) {
    return teams;
  }
  
  // Manually populate each member's userId
  const teamsWithPopulatedMembers = await Promise.all(
    teams.map(async (team) => {
      const populatedMembers = await Promise.all(
        team.members.map(async (member) => {
          const user = await User.findById(member.userId, 'username email role');
          return {
            userId: user,
            role: member.role,
            availability: member.availability,
            workload: member.workload
          };
        })
      );
      
      return {
        ...team.toJSON(),
        members: populatedMembers
      };
    })
  );
  
  return teamsWithPopulatedMembers;
};

export const getAvailableUsersService = async () => {
  // Get all users who are staff (not clients) and not already assigned to active teams
  const assignedUserIds = await Team.aggregate([
    { $match: { active: true } },
    { $unwind: '$members' },
    { $group: { _id: null, userIds: { $addToSet: '$members.userId' } } },
    { $project: { _id: 0, userIds: 1 } }
  ]);
  
  const assignedIds = assignedUserIds.length > 0 ? assignedUserIds[0].userIds : [];
  
  return await User.find({
    role: { $in: ['team member', 'team leader', 'project manager', 'inspector', 'procurement officer'] },
    isActive: true,
    _id: { $nin: assignedIds }
  }).select('username email role');
};

export const createTeamService = async (teamName, memberIds, leaderId) => {
  // Validate that leaderId is in memberIds
  if (!memberIds.includes(leaderId)) {
    throw new Error('Team leader must be one of the selected members');
  }

  // Check if any members are already assigned to active teams
  const existingAssignments = await Team.find({
    active: true,
    'members.userId': { $in: memberIds }
  });

  if (existingAssignments.length > 0) {
    throw new Error('One or more selected members are already assigned to active teams');
  }

  // Update the leader's role in User model to 'team leader'
  await User.findByIdAndUpdate(leaderId, { role: 'team leader' });

  const members = memberIds.map(userId => ({
    userId: new mongoose.Types.ObjectId(userId),
    role: userId === leaderId ? 'Team Leader' : 'Team Member',
    availability: 'Available',
    workload: 0
  }));

  const newTeam = new Team({
    teamId: new mongoose.Types.ObjectId(),
    teamName,
    leaderId: new mongoose.Types.ObjectId(leaderId),
    members,
    active: true
  });

  return await newTeam.save();
};

export const checkTeamAssignmentService = async (teamId) => {
  const project = await Project.findOne({ 
    assignedTeamId: teamId,
    status: { $in: ['Active', 'In Progress', 'On Hold'] }
  });
  return project !== null;
};

export const deleteTeamService = async (teamId) => {
  // Check if team is assigned to any active project
  const isAssigned = await checkTeamAssignmentService(teamId);
  if (isAssigned) {
    throw new Error('Cannot delete team that is assigned to an active project');
  }
  
  // Get the team to find the current leader
  const team = await Team.findById(teamId);
  if (team && team.leaderId) {
    // Revert the leader's role back to 'team member' when team is deleted
    await User.findByIdAndUpdate(team.leaderId, { role: 'team member' });
  }
  
  return await Team.findByIdAndDelete(teamId);
};

export const assignTeamLeaderService = async (id, leaderId) => {
  // Get the current team to find the old leader
  const currentTeam = await Team.findById(id);
  
  // If there was a previous leader, revert their role back to 'team member'
  if (currentTeam && currentTeam.leaderId) {
    await User.findByIdAndUpdate(currentTeam.leaderId, { role: 'team member' });
  }
  
  // Update the new leader's role to 'team leader'
  await User.findByIdAndUpdate(leaderId, { role: 'team leader' });
  
  // Update the team with the new leader
  return await Team.findByIdAndUpdate(id, { leaderId }, { new: true });
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
