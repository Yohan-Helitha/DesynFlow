import Attendance from '../model/attendance.model.js';

export const getAttendanceForTeam = async (teamId, start, end) => {
  const query = { teamId };
  if (start && end) query.date = { $gte: new Date(start), $lte: new Date(end) };
  return Attendance.find(query);
};

export const upsertAttendance = async ({ userId, teamId, date, status, checkIn, checkOut, reason, notes }) => {
  return Attendance.findOneAndUpdate(
    { userId, teamId, date },
    { status, checkIn, checkOut, reason, notes },
    { upsert: true, new: true }
  );
};

export const deleteAttendance = async (id) => {
  return Attendance.findByIdAndDelete(id);
};

export default {
  getAttendanceForTeam,
  upsertAttendance,
  deleteAttendance
};
