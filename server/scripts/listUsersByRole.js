import mongoose from "mongoose";
import User from "../modules/auth/model/user.model.js";

async function main() {
  const [role] = process.argv.slice(2);

  if (!role) {
    console.error("Usage: node scripts/listUsersByRole.js <role>");
    process.exit(1);
  }

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("MONGO_URI is not set in the environment.");
    process.exit(1);
  }

  await mongoose.connect(mongoUri);

  const users = await User.find({ role }).select("username email phone role isActive isVerified").lean();
  console.log(JSON.stringify(users, null, 2));

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore
  }
  process.exit(1);
});
