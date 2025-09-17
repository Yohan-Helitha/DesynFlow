// addInspection.js
import mongoose from 'mongoose';
import InspectionRequest from './modules/finance/model/inspection_request.js';
import InspectionEstimate from './modules/finance/model/inspection_estimation.js';

// Replace with your MongoDB URI
const MONGO_URI = 'mongodb+srv://admin:cSVUhwvrkyoPdGOr@cluster0.fdaxphm.mongodb.net/';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Create an inspection request
    const request = new InspectionRequest({
      inspectionRequestId: new mongoose.Types.ObjectId(),
      clientId: new mongoose.Types.ObjectId(),
      clientName: 'Alice Johnson',
      email: 'alice@example.com',
      phone: '9876543210',
      siteLocation: '456 Example St',
      propertyType: 'House',
      floors: [],
      status: 'Pending'
    });

    const savedRequest = await request.save();
    console.log('Saved InspectionRequest:', savedRequest);

    // Create an inspection estimate linked to the request
    const estimate = new InspectionEstimate({
      inspectionRequestId: savedRequest.inspectionRequestId,
      distanceKm: 15,
      estimatedCost: 1200,
      createdBy: new mongoose.Types.ObjectId()
    });

    const savedEstimate = await estimate.save();
    console.log('Saved InspectionEstimate:', savedEstimate);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (err) {
    console.error('Error seeding data:', err);
  }
}

seed();
