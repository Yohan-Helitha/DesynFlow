import AttendanceService from '../service/attendance.service.js';

// Get attendance for a team (weekly/monthly)
export const getAttendanceForTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { start, end } = req.query;
    const attendance = await AttendanceService.getAttendanceForTeam(teamId, start, end);
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create or update attendance for a member
export const upsertAttendance = async (req, res) => {
  try {
    const { userId, teamId, date, status, checkIn, checkOut, reason, notes } = req.body;
    const result = await AttendanceService.upsertAttendance({ userId, teamId, date, status, checkIn, checkOut, reason, notes });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete attendance record
export const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    await AttendanceService.deleteAttendance(id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
