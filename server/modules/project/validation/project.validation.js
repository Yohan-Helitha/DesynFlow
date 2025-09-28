import Team from '../model/team.model.js';

export async function validateProjectCreation({ projectName, clientId, assignedTeamId, startDate, dueDate, inspectionReportPath }) {
  const errors = [];

  // Required fields
  if (!projectName || typeof projectName !== 'string' || projectName.trim().length < 3) {
    errors.push('Project name is required and must be at least 3 characters.');
  }
  if (!clientId) {
    errors.push('Client is required.');
  }
  if (!assignedTeamId) {
    errors.push('Assigned team is required.');
  }
  if (!startDate) {
    errors.push('Start date is required.');
  }
  if (!dueDate) {
    errors.push('Due date is required.');
  }
  if (!inspectionReportPath) {
    errors.push('Inspection report is required.');
  }

  // Date logic
  const today = new Date();
  const start = new Date(startDate);
  const due = new Date(dueDate);
  if (isNaN(start.getTime()) || start < today) {
    errors.push('Start date must be today or later.');
  }
  if (isNaN(due.getTime()) || due <= start) {
    errors.push('Due date must be after start date.');
  }

  // Team availability
  if (assignedTeamId) {
    const team = await Team.findById(assignedTeamId);
    if (!team || !team.active) {
      errors.push('Assigned team is not available.');
    }
  }

  return errors;
}
