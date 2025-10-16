import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongoURI = process.env.MONGO_URI;
console.log('🔗 Testing connection to Atlas...');
console.log('📍 URI:', mongoURI);

async function testAtlasConnection() {
    try {
        console.log('⏳ Connecting to MongoDB Atlas...');
        await mongoose.connect(mongoURI);
        console.log('✅ Successfully connected to MongoDB Atlas!');
        
        // Test basic operations
        const db = mongoose.connection.db;
        console.log('📊 Database name:', db.databaseName);
        
        // List collections
        const collections = await db.listCollections().toArray();
        console.log(`📁 Found ${collections.length} collections`);
        collections.forEach(col => console.log(`  - ${col.name}`));
        
        await mongoose.disconnect();
        console.log('🔚 Connection test completed successfully');
        
    } catch (error) {
        console.error('❌ Atlas connection failed:');
        console.error('📝 Error message:', error.message);
        console.error('🏷️  Error code:', error.code);
        console.error('🔍 Error type:', error.constructor.name);
        
        if (error.code === 8000) {
            console.log('\n💡 Error code 8000 means authentication failed.');
            console.log('🔧 This usually means:');
            console.log('   1. Database user doesn\'t exist in Atlas');
            console.log('   2. Password is incorrect');
            console.log('   3. User permissions are insufficient');
            console.log('\n🚀 To fix this:');
            console.log('   1. Go to MongoDB Atlas → Database Access');
            console.log('   2. Create/verify user "admin" with password "pRDApEiGzVY5tnRr"');
            console.log('   3. Ensure user has "Atlas admin" privileges');
        }
        
        process.exit(1);
    }
}

testAtlasConnection();