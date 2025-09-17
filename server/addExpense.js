import mongoose from "mongoose";
import Expense from "./modules/finance/model/expenses.js";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";


async function run() {
  try {
    // Connect to DB
    await connectDB();

    // Create new expense
    const expense = await Expense.create({
  projectId: "64f4a2b5a1c2b3d4e5f6a7b8",   // valid hex
  category: "Labor",
  amount: 250,
  description: "Sample labor expense",
  createdBy: "64f4a2b5a1c2b3d4e5f6a7b9", // valid hex
  proof: null
});

    console.log("Expense inserted:", expense);

    process.exit(0);
  } catch (err) {
    console.error("Error inserting expense:", err);
    process.exit(1);
  }
}

run();
