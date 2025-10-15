import ProgressUpdate from '../model/progressupdate.model.js';
import Task from '../model/task.model.js';

// Get flagged issues for reports
export const getFlaggedIssuesService = async (projectId, resolved = null, teamId = null) => {
  try {
    const query = {};
    
    if (projectId) {
      query.projectId = projectId;
    }
    
    // If teamId is provided, only get issues from that team's members
    if (teamId) {
      // First get the team to find team members
      const Team = (await import('../model/team.model.js')).default;
      const team = await Team.findById(teamId);
      
      if (team && team.members && team.members.length > 0) {
        const memberIds = team.members.map(member => member.userId);
        query.submittedBy = { $in: memberIds };
      }
    }
    
    let progressUpdates = await ProgressUpdate.find(query)
      .populate('submittedBy', 'username')
      .populate('projectId', 'projectName')
      .sort({ createdAt: -1 });
    
    // Filter and flatten flagged issues
    const flaggedIssues = [];
    
    progressUpdates.forEach(update => {
      update.flaggedIssues.forEach(issue => {
        if (resolved === null || issue.resolved === (resolved === 'true')) {
          flaggedIssues.push({
            _id: issue._id,
            description: issue.description,
            flaggedAt: issue.flaggedAt,
            resolved: issue.resolved,
            resolvedAt: issue.resolvedAt,
            progressUpdateId: update._id,
            projectId: update.projectId,
            projectName: update.projectId?.projectName,
            submittedBy: update.submittedBy,
            summary: update.summary
          });
        }
      });
    });
    
    return flaggedIssues.sort((a, b) => new Date(b.flaggedAt) - new Date(a.flaggedAt));
  } catch (error) {
    console.error('Error in getFlaggedIssuesService:', error);
    throw error;
  }
};

// Get progress updates by project
export const getProgressUpdatesByProjectService = async (projectId) => {
  try {
    return await ProgressUpdate.find({ projectId })
      .populate('submittedBy', 'username')
      .sort({ createdAt: -1 });
  } catch (error) {
    console.error('Error in getProgressUpdatesByProjectService:', error);
    throw error;
  }
};

// Resolve a flagged issue
export const resolveIssueService = async (progressUpdateId, issueId, resolvedBy) => {
  try {
    const progressUpdate = await ProgressUpdate.findById(progressUpdateId);
    
    if (!progressUpdate) {
      return { success: false, message: 'Progress update not found' };
    }
    
    const issue = progressUpdate.flaggedIssues.id(issueId);
    
    if (!issue) {
      return { success: false, message: 'Issue not found' };
    }
    
    // Mark issue as resolved
    issue.resolved = true;
    issue.resolvedAt = new Date();
    
    // Also update any related blocked task
    const blockedTask = await Task.findOne({
      'blockDetails.progressUpdateId': progressUpdateId,
      'blockDetails.isBlocked': true
    });
    
    if (blockedTask) {
      blockedTask.blockDetails.resolvedAt = new Date();
      blockedTask.blockDetails.resolvedBy = resolvedBy;
      // Optionally change status back to In Progress
      blockedTask.status = 'In Progress';
      await blockedTask.save();
    }
    
    await progressUpdate.save();
    
    return {
      success: true,
      progressUpdate: progressUpdate,
      task: blockedTask
    };
  } catch (error) {
    console.error('Error in resolveIssueService:', error);
    return { success: false, message: 'Error resolving issue', error: error.message };
  }
};