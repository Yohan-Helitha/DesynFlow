import * as financeSummaryService from '../service/financeSummaryService.js';

export async function getFinanceSummary(req, res) {
  try {
    const summary = await financeSummaryService.getSummary();
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export default { getFinanceSummary };
