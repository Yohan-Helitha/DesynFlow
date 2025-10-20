// Script to list all suppliers in the database
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';

// Import the User model (assuming suppliers are stored as users)
const User = (await import('../modules/auth/model/user.model.js')).default;

async function listSuppliers() {
    try {
        // Connect to database
        await connectDB();
        console.log('✅ Connected to MongoDB');

        // Find all users first to see what roles exist
        const allUsers = await User.find({}).select('email name companyName phone status role createdAt');
        
        console.log('\n📋 All users in database:');
        console.log('=========================');
        
        if (allUsers.length === 0) {
            console.log('❌ No users found');
        } else {
            allUsers.forEach((user, index) => {
                console.log(`\n${index + 1}. User Details:`);
                console.log(`   📧 Email: ${user.email}`);
                console.log(`   👤 Name: ${user.name || 'Not set'}`);
                console.log(`   🏢 Company: ${user.companyName || 'Not set'}`);
                console.log(`   📱 Phone: ${user.phone || 'Not set'}`);
                console.log(`   🔄 Status: ${user.status || 'active'}`);
                console.log(`   👨‍💼 Role: ${user.role || 'Not set'}`);
                console.log(`   📅 Created: ${user.createdAt}`);
                console.log('   -------------------------');
            });

            console.log(`\n✅ Total users found: ${allUsers.length}`);
            
            // Now find specific suppliers
            const suppliers = allUsers.filter(user => user.role === 'supplier');
            console.log(`🏢 Suppliers found: ${suppliers.length}`);
        }

        // Also check for different role variations
        const supplierVariations = await User.find({
            $or: [
                { role: 'supplier' },
                { role: 'Supplier' },
                { role: 'SUPPLIER' },
                { userType: 'supplier' },
                { type: 'supplier' }
            ]
        }).select('email name role userType type');
        
        if (supplierVariations.length > 0) {
            console.log('\n🔍 Found supplier variations:');
            supplierVariations.forEach((supplier, index) => {
                console.log(`\n${index + 1}. Supplier Details:`);
                console.log(`   📧 Email: ${supplier.email}`);
                console.log(`   👤 Name: ${supplier.name || 'Not set'}`);
                console.log(`   👨‍💼 Role: ${supplier.role || 'Not set'}`);
                console.log(`   🏷️ UserType: ${supplier.userType || 'Not set'}`);
                console.log(`   � Type: ${supplier.type || 'Not set'}`);
                console.log('   -------------------------');
            });

            console.log(`\n✅ Total supplier variations found: ${supplierVariations.length}`);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        // Close connection
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
        process.exit(0);
    }
}

// Run the script
listSuppliers();