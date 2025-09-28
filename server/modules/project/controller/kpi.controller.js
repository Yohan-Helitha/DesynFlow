import Project from '../model/project.model.js';
import Task from '../model/task.model.js';
import Team from '../model/team.model.js';

// KPI: Project Progress Percentage
export const getProjectProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const tasks = await Task.find({ projectId: id });
    if (tasks.length === 0) return res.json({ progress: 0 });
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Done').length;
    const avgProgress = tasks.reduce((sum, t) => sum + (t.progressPercentage || 0), 0) / total;
    res.json({
      totalTasks: total,
      completedTasks: completed,
      completionRate: Math.round((completed / total) * 100),
      avgProgress: Math.round(avgProgress)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error calculating project progress', error: error.message });
  }
};

// KPI: Team Workload
export const getTeamWorkload = async (req, res) => {
  try {
    const { id } = req.params;
    const team = await Team.findById(id);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    const members = team.members.map(m => ({
      userId: m.userId,
      role: m.role,
      availability: m.availability,
      workload: m.workload
    }));
    res.json({ teamId: team._id, teamName: team.teamName, members });
  } catch (error) {
    res.status(500).json({ message: 'Error getting team workload', error: error.message });
  }
};

// KPI: Average Task Completion Time
export const getAvgTaskCompletionTime = async (req, res) => {
  try {
    const { projectId } = req.params;
    const tasks = await Task.find({ projectId, status: 'Done' });
    if (tasks.length === 0) return res.json({ avgCompletionTime: 0 });
    const avgTime = tasks.reduce((sum, t) => {
      if (t.completedAt && t.createdAt) {
        return sum + (t.completedAt - t.createdAt);
      }
      return sum;
    }, 0) / tasks.length;
    // Convert ms to days
    res.json({ avgCompletionTimeDays: Math.round(avgTime / (1000 * 60 * 60 * 24)) });
  } catch (error) {
    res.status(500).json({ message: 'Error calculating average completion time', error: error.message });
  }
};
