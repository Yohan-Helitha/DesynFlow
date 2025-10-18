import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../modules/auth/model/user.model.js';

// Load env
dotenv.config();

const clients = [
  {
    username: 'Ali Raza',
    email: 'ali.raza@example.com',
    password: 'Password123!',
    phone: '+94 71 123 4567',
    role: 'client',
    isVerified: true,
  },
  {
    username: 'Sithum Perera',
    email: 'sithum.perera@example.com',
    password: 'Password123!',
    phone: '+94 77 555 6677',
    role: 'client',
    isVerified: true,
  },
  {
    username: 'Malsha Fernando',
    email: 'malsha.fernando@example.com',
    password: 'Password123!',
    phone: '+94 76 222 3344',
    role: 'client',
    isVerified: true,
  },
];

async function run() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('Missing MONGO_URI in environment. Aborting.');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    for (const c of clients) {
      const exists = await User.findOne({ email: c.email });
      if (exists) {
        console.log(`✔ Client already exists: ${c.email}`);
        continue;
      }
      const created = new User(c);
      await created.save();
      console.log(`➕ Created client: ${c.email}`);
    }

    const count = await User.countDocuments({ role: 'client' });
    console.log(`Total clients in DB: ${count}`);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
}

run();
