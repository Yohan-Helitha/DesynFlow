import ReportService from '../service/report.service.js';

// Create or update a report
export const upsertReport = async (req, res) => {
  try {
    const report = await ReportService.upsertReport(req.body);
    res.status(201).json(report);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all reports for a project
export const getReportsByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const reports = await ReportService.getReportsByProject(projectId);
    res.json(reports);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a report
export const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    await ReportService.deleteReport(id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
