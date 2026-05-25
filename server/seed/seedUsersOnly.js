import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../modules/auth/model/user.model.js';
import InspectorLocation from '../modules/auth/model/inspectorLocation.model.js';
import { sampleUsers } from './seedUsers.js';

dotenv.config();

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/desynflow';
  await mongoose.connect(mongoURI);
  return mongoURI;
};

const upsertUser = async (seedUser) => {
  const query = [];
  if (seedUser.email) query.push({ email: seedUser.email });
  if (seedUser.username) query.push({ username: seedUser.username });

  const existing = await User.findOne(query.length === 1 ? query[0] : { $or: query });

  if (existing) {
    existing.username = seedUser.username;
    existing.email = seedUser.email;
    existing.phone = seedUser.phone;
    existing.role = seedUser.role;
    existing.isVerified = seedUser.isVerified;
    existing.isActive = seedUser.isActive;

    if (seedUser.password) {
      existing.password = seedUser.password;
    }

    await existing.save();
    return existing;
  }

  const created = new User({
    username: seedUser.username,
    email: seedUser.email,
    password: seedUser.password,
    phone: seedUser.phone,
    role: seedUser.role,
    isVerified: seedUser.isVerified,
    isActive: seedUser.isActive,
  });

  await created.save();
  return created;
};

const seedInspectorLocationsNearColombo = async (usersByUsername) => {
  const colomboInspectorSeeds = [
    {
      username: 'mike_inspector',
      lat: 6.9344,
      lng: 79.8428,
      address: 'Colombo Fort, Colombo',
    },
    {
      username: 'priya_inspector',
      lat: 6.8523,
      lng: 79.8650,
      address: 'Dehiwala-Mount Lavinia, Colombo',
    },
    {
      username: 'rajesh_inspector',
      lat: 6.9090,
      lng: 79.8890,
      address: 'Sri Jayawardenepura Kotte, Colombo',
    },
    {
      username: 'saman_inspector',
      lat: 6.9550,
      lng: 79.9220,
      address: 'Kelaniya, Colombo',
    },
    {
      username: 'nimal_inspector',
      lat: 6.8480,
      lng: 79.9270,
      address: 'Maharagama, Colombo',
    },
  ];

  const results = [];

  for (const seed of colomboInspectorSeeds) {
    const inspectorUser = usersByUsername.get(seed.username);
    if (!inspectorUser) {
      console.warn(`ℹ️  Inspector user not found, skipping location: ${seed.username}`);
      continue;
    }

    const location = await InspectorLocation.findOneAndUpdate(
      { inspector_ID: inspectorUser._id },
      {
        inspector_ID: inspectorUser._id,
        inspector_latitude: seed.lat,
        inspector_longitude: seed.lng,
        current_address: seed.address,
        region: 'Colombo',
        status: 'available',
        updateAt: new Date(),
      },
      { upsert: true, new: true }
    );

    results.push(location);
  }

  return results;
};

const main = async () => {
  const mongoURI = await connectDB();
  console.log(`✅ Connected to MongoDB (${mongoose.connection.name})`);
  console.log(`🔗 Using MONGO_URI: ${mongoURI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);

  const usersByUsername = new Map();
  let upsertedCount = 0;

  for (const seedUser of sampleUsers) {
    const user = await upsertUser(seedUser);
    usersByUsername.set(user.username, user);
    upsertedCount += 1;
  }

  console.log(`✅ Upserted ${upsertedCount} users`);

  const inspectorLocations = await seedInspectorLocationsNearColombo(usersByUsername);
  console.log(`✅ Upserted ${inspectorLocations.length} inspector locations near Colombo`);

  await mongoose.disconnect();
  console.log('🔒 MongoDB connection closed');
};

main().catch(async (err) => {
  console.error(`❌ ${err?.message || err}`);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore
  }
  process.exit(1);
});
