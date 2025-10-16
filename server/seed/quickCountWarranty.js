import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    
    const counts = await Promise.all([
      mongoose.connection.db.collection('projects').countDocuments(),
      mongoose.connection.db.collection('users').countDocuments({ role: 'client' }),
      mongoose.connection.db.collection('materials').countDocuments(),
      mongoose.connection.db.collection('warranties').countDocuments(),
      mongoose.connection.db.collection('warrantyclaims').countDocuments()
    ]);
    
    console.log('\n📊 Current Database Status:');
    console.log(`   Projects: ${counts[0]}`);
    console.log(`   Clients: ${counts[1]}`);
    console.log(`   Materials: ${counts[2]}`);
    console.log(`   Warranties: ${counts[3]}`);
    console.log(`   Warranty Claims: ${counts[4]}\n`);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
