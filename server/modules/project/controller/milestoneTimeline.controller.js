import Project from '../model/project.model.js';

// Add or update milestones for a project
export const updateProjectMilestones = async (req, res) => {
  try {
    const { id } = req.params;
    const { milestones } = req.body; // Array of milestone ObjectIds
    const updatedProject = await Project.findByIdAndUpdate(
      id,
      { milestones },
      { new: true }
    ).populate('milestones');
    if (!updatedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: 'Error updating milestones', error: error.message });
  }
};

// Add or update timeline for a project
export const updateProjectTimeline = async (req, res) => {
  try {
    const { id } = req.params;
    const { timeline } = req.body; // Array of timeline objects
    const updatedProject = await Project.findByIdAndUpdate(
      id,
      { timeline },
      { new: true }
    );
    if (!updatedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: 'Error updating timeline', error: error.message });
  }
};
