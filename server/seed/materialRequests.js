import mongoose from "mongoose";
import dotenv from "dotenv";
import MaterialRequest from "../modules/project/model/material.model.js";
import User from "../modules/auth/model/user.model.js";
import Project from "../modules/project/model/project.model.js";

dotenv.config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/desynflow";
    await mongoose.connect(mongoURI);
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
};

const seedMaterialRequests = async () => {
  try {
    // Clear existing material requests
    await MaterialRequest.deleteMany({});
    console.log("🗑️ Cleared existing material requests");

    // Fetch sample users and projects
    const teamMembers = await User.find({ role: "team member" });
    const teamLeader = await User.findOne({ role: "team leader" });
    const projects = await Project.find({});

    if (!projects.length || !teamLeader || !teamMembers.length) {
      console.log("❌ Required users or projects not found for seeding");
      return;
    }

    const sampleRequests = [];

    projects.forEach((project, index) => {
      sampleRequests.push(
        {
          projectId: project._id,
          projectName: project.projectName,
          createdBy: teamLeader._id,
          createdByName: teamLeader.username,
          items: [
            { itemName: "Premium Paint (White)", qty: 20 },
            { itemName: "Paint Brushes Set", qty: 5 },
            { itemName: "Masking Tape", qty: 10 }
          ],
          neededBy: new Date(project.startDate.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days after project start
          status: "Pending",
        },
        {
          projectId: project._id,
          projectName: project.projectName,
          createdBy: teamMembers[index % teamMembers.length]._id,
          createdByName: teamMembers[index % teamMembers.length].username,
          items: [
            { itemName: "Hardwood Flooring", qty: 300 },
            { itemName: "Ceramic Tiles", qty: 150 },
            { itemName: "Adhesive", qty: 20 }
          ],
          neededBy: new Date(project.startDate.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days after project start
          status: "Approved",
        },
        {
          projectId: project._id,
          projectName: project.projectName,
          createdBy: teamMembers[(index + 1) % teamMembers.length]._id,
          createdByName: teamMembers[(index + 1) % teamMembers.length].username,
          items: [
            { itemName: "LED Light Fixtures", qty: 30 },
            { itemName: "Electrical Wire", qty: 120 },
            { itemName: "Switch Plates", qty: 15 }
          ],
          neededBy: new Date(project.startDate.getTime() + 21 * 24 * 60 * 60 * 1000), // 21 days after project start
          status: "PartiallyApproved",
        }
      );
    });

    const createdRequests = await MaterialRequest.insertMany(sampleRequests);
    console.log(`✅ Created ${createdRequests.length} material requests`);

  } catch (err) {
    console.error("❌ Error seeding material requests:", err);
  } finally {
    await mongoose.connection.close();
    console.log("🔒 Database connection closed");
  }
};

const runSeed = async () => {
  await connectDB();
  await seedMaterialRequests();
};

if (import.meta.url === `file://${process.argv[1]}`) {
  runSeed();
}

export default runSeed;
