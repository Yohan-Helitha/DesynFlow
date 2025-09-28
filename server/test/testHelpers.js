import mongoose from 'mongoose';
import { connectDB, disconnectedDB } from '../config/db.js';

export const setupTestDB = async () => {
  // Override MONGO_URI for testing
  process.env.MONGO_URI = 'mongodb://mongo:27017/desynflow_test';
  
  try {
    await connectDB();
    console.log('Test database connected');
  } catch (error) {
    console.error('Test database connection failed:', error);
    throw error;
  }
};

export const teardownTestDB = async () => {
  try {
    // Clear all collections
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.deleteMany({});
    }
    
    // Disconnect
    await disconnectedDB();
    console.log('Test database disconnected');
  } catch (error) {
    console.error('Test database teardown failed:', error);
    throw error;
  }
};

export const clearTestDB = async () => {
  try {
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.deleteMany({});
    }
  } catch (error) {
    console.error('Failed to clear test database:', error);
    throw error;
  }
};
