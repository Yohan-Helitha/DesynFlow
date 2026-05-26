import mongoose from "mongoose";
import User from "../modules/auth/model/user.model.js";

async function main() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("MONGO_URI is not set in the environment.");
    process.exit(1);
  }

  await mongoose.connect(mongoUri);

  const roles = await User.distinct("role");
  console.log(JSON.stringify(roles, null, 2));

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
