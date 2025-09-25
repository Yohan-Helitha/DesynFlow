import mongoose from 'mongoose';
import ProjectEstimation from './modules/finance/model/project_estimation.js';

const estimations = [
  {
    projectId: new mongoose.Types.ObjectId(), // Replace with actual project IDs if available
    version: 1,
    laborCost: 1200,
    materialCost: 800,
    serviceCost: 400,
    contingencyCost: 100,
    createdBy: new mongoose.Types.ObjectId(), // Replace with actual user IDs if available
    status: 'Approved'
  },
  {
    projectId: new mongoose.Types.ObjectId(),
    version: 1,
    laborCost: 1500,
    materialCost: 900,
    serviceCost: 500,
    contingencyCost: 150,
    createdBy: new mongoose.Types.ObjectId(),
    status: 'Pending'
  },
  {
    projectId: new mongoose.Types.ObjectId(),
    version: 1,
    laborCost: 1000,
    materialCost: 700,
    serviceCost: 300,
    contingencyCost: 80,
    createdBy: new mongoose.Types.ObjectId(),
    status: 'Rejected'
  },
  {
    projectId: new mongoose.Types.ObjectId(),
    version: 1,
    laborCost: 2000,
    materialCost: 1200,
    serviceCost: 600,
    contingencyCost: 200,
    createdBy: new mongoose.Types.ObjectId(),
    status: 'Approved'
  },
  {
    projectId: new mongoose.Types.ObjectId(),
    version: 1,
    laborCost: 1800,
    materialCost: 1100,
    serviceCost: 550,
    contingencyCost: 170,
    createdBy: new mongoose.Types.ObjectId(),
    status: 'Pending'
  }
];

async function seed() {
  await mongoose.connect('mongodb+srv://admin:cSVUhwvrkyoPdGOr@cluster0.fdaxphm.mongodb.net/test'); // Use 'test' database
  await ProjectEstimation.insertMany(estimations);
  console.log('Seeded 5 project estimations');
  await mongoose.disconnect();
}

seed();
