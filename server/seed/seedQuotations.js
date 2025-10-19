import mongoose from 'mongoose';
import Quotation from '../modules/finance/model/quotation_estimation.js';
import Project from '../modules/project/model/project.model.js';
import User from '../modules/auth/model/user.model.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/desynflow');
    console.log('MongoDB connected for seeding');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Sample quotation data with 'Sent' status
const sampleQuotations = [
  {
    estimateVersion: 1,
    version: 1,
    status: 'Sent',
    locked: false,
    remarks: 'Initial quotation for project approval',
    laborItems: [
      {
        task: 'Site Preparation',
        hours: 40,
        rate: 50,
        total: 2000
      },
      {
        task: 'Construction Work',
        hours: 120,
        rate: 75,
        total: 9000
      }
    ],
    materialItems: [],
    serviceItems: [
      {
        service: 'Equipment Rental',
        cost: 3000
      }
    ],
    contingencyItems: [
      {
        description: 'Miscellaneous Costs',
        amount: 1500
      }
    ],
    taxes: [
      {
        description: 'VAT 15%',
        percentage: 15,
        amount: 2400
      }
    ],
    subtotal: 14500,
    totalContingency: 1500,
    totalTax: 2400,
    grandTotal: 18400,
    sentAt: new Date(),
    fileUrl: '/reports/quotation_sample_1.pdf'
  },
  {
    estimateVersion: 2,
    version: 1,
    status: 'Sent',
    locked: false,
    remarks: 'Revised quotation with updated materials',
    laborItems: [
      {
        task: 'Foundation Work',
        hours: 80,
        rate: 60,
        total: 4800
      }
    ],
    materialItems: [],
    serviceItems: [
      {
        service: 'Inspection Services',
        cost: 2500
      }
    ],
    contingencyItems: [
      {
        description: 'Weather Delays',
        amount: 2000
      }
    ],
    taxes: [
      {
        description: 'VAT 15%',
        percentage: 15,
        amount: 1395
      }
    ],
    subtotal: 7300,
    totalContingency: 2000,
    totalTax: 1395,
    grandTotal: 10695,
    sentAt: new Date(),
    fileUrl: '/reports/quotation_sample_2.pdf'
  }
];

// Seed function
const seedQuotations = async () => {
  try {
    console.log('Starting quotation seeding...');

    // Get some existing projects and users
    const projects = await Project.find().limit(5);
    const users = await User.find({ role: { $in: ['finance manager', 'project manager'] } }).limit(3);

    if (projects.length === 0) {
      console.log('No projects found. Creating sample projects first...');
      
      // Create sample projects if none exist
      const sampleProjects = await Project.insertMany([
        {
          projectName: 'Office Building Construction',
          status: 'active',
          progress: 45,
          description: 'Modern office building with 10 floors'
        },
        {
          projectName: 'Residential Complex',
          status: 'active', 
          progress: 30,
          description: 'Luxury residential complex with 50 units'
        },
        {
          projectName: 'Shopping Mall',
          status: 'active',
          progress: 60,
          description: 'Large shopping mall with multiple stores'
        }
      ]);
      
      projects.push(...sampleProjects);
      console.log(`Created ${sampleProjects.length} sample projects`);
    }

    // Clear existing quotations with 'Sent' status to avoid conflicts
    await Quotation.deleteMany({ status: 'Sent' });
    console.log('Cleared existing quotations with Sent status');

    // Create quotations for different projects
    const quotationsToInsert = [];
    
    for (let i = 0; i < Math.min(5, projects.length); i++) {
      const project = projects[i];
      const user = users[i % users.length]; // Rotate through available users
      
      // Create 1-2 quotations per project
      for (let j = 0; j < (i < 2 ? 2 : 1); j++) {
        const baseQuotation = sampleQuotations[j % sampleQuotations.length];
        
        quotationsToInsert.push({
          ...baseQuotation,
          projectId: project._id,
          estimateVersion: j + 1,
          version: 1,
          createdBy: user?._id,
          updatedBy: user?._id,
          sentTo: user?._id,
          // Vary the amounts slightly
          grandTotal: baseQuotation.grandTotal + (i * 1000) + (j * 500),
          subtotal: baseQuotation.subtotal + (i * 800) + (j * 400),
          sentAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)), // Vary sent dates
        });
      }
    }

    // Insert the quotations
    const insertedQuotations = await Quotation.insertMany(quotationsToInsert);
    
    console.log(`✅ Successfully seeded ${insertedQuotations.length} quotations with 'Sent' status`);
    console.log('Sample quotations:');
    
    insertedQuotations.forEach((q, index) => {
      console.log(`${index + 1}. ID: ${q._id}, Project: ${q.projectId}, Status: ${q.status}, Locked: ${q.locked}, Amount: $${q.grandTotal}`);
    });

    return insertedQuotations;
    
  } catch (error) {
    console.error('Error seeding quotations:', error);
    throw error;
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await seedQuotations();
  
  console.log('\n🎉 Quotation seeding completed successfully!');
  console.log('You can now test the PM quotation workflow in the frontend.');
  
  mongoose.disconnect();
  process.exit(0);
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
}

export { seedQuotations };