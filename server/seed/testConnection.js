import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongoURI = process.env.MONGO_URI;

console.log('Trying to connect to:', mongoURI ? 'URI loaded' : 'NO URI');

mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log('Connected successfully!');
    return mongoose.disconnect();
  })
  .then(() => {
    console.log('Disconnected');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });

setTimeout(() => {
  console.log('Timeout!');
  process.exit(1);
}, 10000);
