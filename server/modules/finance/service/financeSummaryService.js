import FinanceSummary from '../model/finance_summary.js';

// Ensure there is a single finance summary document; create if missing
export async function ensureSummary() {
  let doc = await FinanceSummary.findOne();
  if (!doc) {
    doc = await FinanceSummary.create({ totalIncome: 0, totalBalance: 0 });
  }
  return doc;
}

// Get the current finance summary (creating it if needed)
export async function getSummary() {
  return ensureSummary();
}

// Atomically adjust totalBalance by delta (can be negative)
export async function adjustBalance(delta) {
  const updated = await FinanceSummary.findOneAndUpdate(
    {},
    { $inc: { totalBalance: delta } },
    { new: true, upsert: true, setDefaultsOnInsert: true, sort: { createdAt: 1 } }
  );
  return updated;
}

// Atomically increase totalIncome by amount
export async function incrementIncome(amount) {
  const inc = Number(amount) || 0;
  if (!inc) return ensureSummary();
  return FinanceSummary.findOneAndUpdate(
    {},
    { $inc: { totalIncome: inc } },
    { new: true, upsert: true, setDefaultsOnInsert: true, sort: { createdAt: 1 } }
  );
}

// Atomically decrease totalIncome by amount (reversal)
export async function decrementIncome(amount) {
  const dec = Number(amount) || 0;
  if (!dec) return ensureSummary();
  return FinanceSummary.findOneAndUpdate(
    {},
    { $inc: { totalIncome: -dec } },
    { new: true, upsert: true, setDefaultsOnInsert: true, sort: { createdAt: 1 } }
  );
}

export default { ensureSummary, getSummary, adjustBalance, incrementIncome, decrementIncome };
