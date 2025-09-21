import Report from '../model/report.model.js';

export const upsertReport = async (data) => {
  if (data._id) {
    return Report.findByIdAndUpdate(data._id, data, { new: true, upsert: true });
  }
  const report = new Report(data);
  return report.save();
};

export const getReportsByProject = async (projectId) => {
  return Report.find({ projectId });
};

export const deleteReport = async (id) => {
  return Report.findByIdAndDelete(id);
};

export default {
  upsertReport,
  getReportsByProject,
  deleteReport
};
