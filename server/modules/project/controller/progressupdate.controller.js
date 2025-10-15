import {
  getFlaggedIssuesService,
  getProgressUpdatesByProjectService,
  resolveIssueService
} from '../service/progressupdate.service.js';

// Get all flagged issues for weekly reports
export const getFlaggedIssues = async (req, res) => {
  try {
    const { projectId, resolved, teamId } = req.query;
    
    const issues = await getFlaggedIssuesService(projectId, resolved, teamId);
    res.json(issues);
  } catch (error) {
    console.error('Error fetching flagged issues:', error);
    res.status(500).json({ message: 'Error fetching flagged issues', error: error.message });
  }
};

// Get progress updates by project
export const getProgressUpdatesByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const progressUpdates = await getProgressUpdatesByProjectService(projectId);
    res.json(progressUpdates);
  } catch (error) {
    console.error('Error fetching progress updates:', error);
    res.status(500).json({ message: 'Error fetching progress updates', error: error.message });
  }
};

// Resolve a flagged issue
export const resolveIssue = async (req, res) => {
  try {
    const { progressUpdateId, issueId } = req.params;
    const { resolvedBy } = req.body;
    
    const result = await resolveIssueService(progressUpdateId, issueId, resolvedBy);
    
    if (!result.success) {
      return res.status(404).json({ message: result.message });
    }
    
    res.json({
      message: 'Issue resolved successfully',
      progressUpdate: result.progressUpdate
    });
  } catch (error) {
    console.error('Error resolving issue:', error);
    res.status(500).json({ message: 'Error resolving issue', error: error.message });
  }
};