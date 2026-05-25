import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../modules/auth/model/user.model.js';

dotenv.config();

const requiredEnv = (name) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
};

const optionalEnv = (name) => {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : undefined;
};

const parseBooleanEnv = (name) => {
  const value = optionalEnv(name);
  if (value === undefined) return undefined;
  if (/^(true|1|yes)$/i.test(value)) return true;
  if (/^(false|0|no)$/i.test(value)) return false;
  throw new Error(`Invalid boolean for ${name}: ${value} (use true/false)`);
};

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/desynflow';
  await mongoose.connect(mongoURI);
  return mongoURI;
};

const main = async () => {
  const targetEmail = optionalEnv('TARGET_EMAIL');
  const targetUsername = optionalEnv('TARGET_USERNAME');
  const newPassword = requiredEnv('NEW_PASSWORD');

  if (!targetEmail && !targetUsername) {
    throw new Error('Provide TARGET_EMAIL and/or TARGET_USERNAME');
  }

  const role = optionalEnv('ROLE');
  const phone = optionalEnv('PHONE');
  const isVerified = parseBooleanEnv('IS_VERIFIED');
  const isActive = parseBooleanEnv('IS_ACTIVE');

  const mongoURI = await connectDB();
  console.log(`✅ Connected to MongoDB (${mongoose.connection.name})`);
  console.log(`🔗 Using MONGO_URI: ${mongoURI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);

  const query = [];
  if (targetEmail) query.push({ email: targetEmail });
  if (targetUsername) query.push({ username: targetUsername });

  const user = await User.findOne(query.length === 1 ? query[0] : { $or: query });

  if (user) {
    if (targetEmail && user.email !== targetEmail) {
      console.warn(`ℹ️  Found user by username, email differs: ${user.email}`);
    }

    user.password = newPassword;
    if (role) user.role = role;
    if (phone) user.phone = phone;
    if (isVerified !== undefined) user.isVerified = isVerified;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();
    console.log(`✅ Updated password for: ${user.username} (${user.email})`);
    console.log(`   role=${user.role}, verified=${user.isVerified}, active=${user.isActive}`);
  } else {
    const email = targetEmail;
    if (!email) {
      throw new Error('User not found. To create a new user you must provide TARGET_EMAIL.');
    }

    const username = targetUsername || email.split('@')[0];

    const created = await User.create({
      username,
      email,
      password: newPassword,
      phone,
      role: role || 'client',
      isVerified: isVerified ?? false,
      isActive: isActive ?? true,
    });

    console.log(`✅ Created user: ${created.username} (${created.email})`);
    console.log(`   role=${created.role}, verified=${created.isVerified}, active=${created.isActive}`);
  }

  await mongoose.connection.close();
  console.log('🔒 MongoDB connection closed');
};

main().catch(async (err) => {
  console.error(`❌ ${err?.message || err}`);
  try {
    await mongoose.connection.close();
  } catch {
    // ignore
  }
  process.exit(1);
});
