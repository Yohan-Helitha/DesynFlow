import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../modules/auth/model/user.model.js";

async function main() {
  const [email, newPassword] = process.argv.slice(2);

  if (!email || !newPassword) {
    console.error("Usage: node scripts/resetUserPassword.js <email> <newPassword>");
    process.exit(1);
  }

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("MONGO_URI is not set in the environment.");
    process.exit(1);
  }

  await mongoose.connect(mongoUri);

  const user = await User.findOne({ email });
  if (!user) {
    console.error(`User not found: ${email}`);
    await mongoose.disconnect();
    process.exit(2);
  }

  user.password = await bcrypt.hash(newPassword, 8);
  await user.save();

  console.log(`Updated password for ${email}`);
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
