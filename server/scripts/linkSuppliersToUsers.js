import mongoose from 'mongoose';
import User from '../modules/auth/model/user.model.js';
import Supplier from '../modules/supplier/model/supplier.model.js';
import { config } from 'dotenv';

// Load environment variables
config();

const linkSuppliersToUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/desynflow');
    console.log('Connected to MongoDB');

    // Find all users with role 'supplier'
    const supplierUsers = await User.find({ role: 'supplier' });
    console.log(`Found ${supplierUsers.length} supplier users`);

    // Link each supplier user to their supplier document
    for (const user of supplierUsers) {
      const supplier = await Supplier.findOne({ email: user.email });
      
      if (supplier) {
        // Update supplier with userId
        await Supplier.updateOne(
          { _id: supplier._id },
          { $set: { userId: user._id } }
        );
        console.log(`✅ Linked supplier ${supplier.companyName || supplier.email} to user ${user.email}`);
      } else {
        // Create a new supplier document for this user
        const newSupplier = new Supplier({
          userId: user._id,
          email: user.email,
          contactName: user.username,
          companyName: user.username + ' Company',
          phone: user.phone || '',
          materialTypes: [],
          materials: [],
          deliveryRegions: [],
          rating: 0
        });
        
        await newSupplier.save();
        console.log(`✅ Created new supplier for user ${user.email}`);
      }
    }

    console.log('✅ All suppliers linked to users successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error linking suppliers to users:', error);
    process.exit(1);
  }
};

// Run the script
linkSuppliersToUsers();
