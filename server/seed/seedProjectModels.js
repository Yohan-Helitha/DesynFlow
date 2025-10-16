import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Import models
import User from '../modules/auth/model/user.model.js';
import Project from '../modules/project/model/project.model.js';
import Team from '../modules/project/model/team.model.js';
import Milestone from '../modules/project/model/milestone.model.js';
import Task from '../modules/project/model/task.model.js';
import ProgressUpdate from '../modules/project/model/progressupdate.model.js';

const mongoURI = process.env.MONGO_URI;

async function seedProjectModels() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Get existing data for relationships
    console.log('📊 Fetching existing data for relationships...');
    const users = await User.find({});
    const projects = await Project.find({});
    const teams = await Team.find({});
    
    const teamMembers = users.filter(u => u.role === 'team member');
    const teamLeaders = users.filter(u => u.role === 'team leader');
    const projectManagers = users.filter(u => u.role === 'project manager');

    if (projects.length === 0 || users.length === 0) {
      console.log('❌ No existing users or projects found. Please run seedComprehensiveData.js first');
      process.exit(1);
    }

    console.log(`Found ${users.length} users, ${projects.length} projects, ${teams.length} teams`);

    // Clear existing project data
    console.log('🗑️ Clearing existing project data...');
    await Promise.all([
      Milestone.deleteMany({}),
      Task.deleteMany({}),
      ProgressUpdate.deleteMany({})
    ]);
    console.log('✅ Cleared existing project data');

    // 1. Create Milestones
    console.log('\\n🎯 Creating project milestones...');
    const milestoneData = [];
    
    projects.forEach((project, index) => {
      const projectMilestones = [
        {
          name: 'Project Initiation',
          description: 'Project kick-off meeting and initial planning completed',
          dueDate: new Date(project.startDate?.getTime() + 7 * 24 * 60 * 60 * 1000),
          completed: true,
          completedAt: new Date(project.startDate?.getTime() + 5 * 24 * 60 * 60 * 1000)
        },
        {
          name: 'Foundation Complete',
          description: 'Foundation work and structural base completed',
          dueDate: new Date(project.startDate?.getTime() + 30 * 24 * 60 * 60 * 1000),
          completed: project.progress > 25,
          completedAt: project.progress > 25 ? new Date(project.startDate?.getTime() + 28 * 24 * 60 * 60 * 1000) : null
        },
        {
          name: 'Structure Framework',
          description: 'Main structural framework and walls completed',
          dueDate: new Date(project.startDate?.getTime() + 60 * 24 * 60 * 60 * 1000),
          completed: project.progress > 50,
          completedAt: project.progress > 50 ? new Date(project.startDate?.getTime() + 58 * 24 * 60 * 60 * 1000) : null
        },
        {
          name: 'Interior Work',
          description: 'Interior work including plumbing, electrical, and finishing',
          dueDate: new Date(project.startDate?.getTime() + 90 * 24 * 60 * 60 * 1000),
          completed: project.progress > 75,
          completedAt: project.progress > 75 ? new Date(project.startDate?.getTime() + 88 * 24 * 60 * 60 * 1000) : null
        },
        {
          name: 'Final Inspection',
          description: 'Final quality inspection and project handover',
          dueDate: project.dueDate,
          completed: project.status === 'Completed',
          completedAt: project.status === 'Completed' ? new Date(project.dueDate?.getTime() - 2 * 24 * 60 * 60 * 1000) : null
        }
      ];

      projectMilestones.forEach(milestone => {
        milestoneData.push({
          projectId: project._id,
          ...milestone
        });
      });
    });

    const milestones = await Milestone.insertMany(milestoneData);
    console.log(`✅ Created ${milestones.length} project milestones`);

    // 2. Create Tasks
    console.log('\\n📋 Creating project tasks...');
    const taskData = [];
    
    projects.forEach((project, index) => {
      const projectTasks = [
        {
          name: 'Site Survey and Measurement',
          description: 'Conduct detailed site survey and take accurate measurements',
          priority: 'high',
          weight: 10,
          status: 'Done',
          progressPercentage: 100,
          dueDate: new Date(project.startDate?.getTime() + 3 * 24 * 60 * 60 * 1000),
          completedAt: new Date(project.startDate?.getTime() + 2 * 24 * 60 * 60 * 1000)
        },
        {
          name: 'Material Procurement Planning',
          description: 'Plan and organize material procurement schedule',
          priority: 'high',
          weight: 15,
          status: project.progress > 20 ? 'Done' : 'In Progress',
          progressPercentage: project.progress > 20 ? 100 : 80,
          dueDate: new Date(project.startDate?.getTime() + 10 * 24 * 60 * 60 * 1000),
          completedAt: project.progress > 20 ? new Date(project.startDate?.getTime() + 8 * 24 * 60 * 60 * 1000) : null
        },
        {
          name: 'Foundation Excavation',
          description: 'Excavate foundation according to architectural plans',
          priority: 'high',
          weight: 20,
          status: project.progress > 25 ? 'Done' : project.progress > 10 ? 'In Progress' : 'Pending',
          progressPercentage: project.progress > 25 ? 100 : project.progress > 10 ? 60 : 0,
          dueDate: new Date(project.startDate?.getTime() + 20 * 24 * 60 * 60 * 1000),
          completedAt: project.progress > 25 ? new Date(project.startDate?.getTime() + 18 * 24 * 60 * 60 * 1000) : null
        },
        {
          name: 'Concrete Foundation Pouring',
          description: 'Pour concrete foundation and allow proper curing',
          priority: 'high',
          weight: 25,
          status: project.progress > 35 ? 'Done' : project.progress > 25 ? 'In Progress' : 'Pending',
          progressPercentage: project.progress > 35 ? 100 : project.progress > 25 ? 40 : 0,
          dueDate: new Date(project.startDate?.getTime() + 35 * 24 * 60 * 60 * 1000),
          completedAt: project.progress > 35 ? new Date(project.startDate?.getTime() + 33 * 24 * 60 * 60 * 1000) : null
        },
        {
          name: 'Wall Construction',
          description: 'Build walls according to architectural specifications',
          priority: 'medium',
          weight: 30,
          status: project.progress > 55 ? 'Done' : project.progress > 35 ? 'In Progress' : 'Pending',
          progressPercentage: project.progress > 55 ? 100 : project.progress > 35 ? Math.floor((project.progress - 35) * 2) : 0,
          dueDate: new Date(project.startDate?.getTime() + 55 * 24 * 60 * 60 * 1000),
          completedAt: project.progress > 55 ? new Date(project.startDate?.getTime() + 52 * 24 * 60 * 60 * 1000) : null
        },
        {
          name: 'Roofing Installation',
          description: 'Install roofing structure and waterproofing',
          priority: 'medium',
          weight: 20,
          status: project.progress > 70 ? 'Done' : project.progress > 55 ? 'In Progress' : 'Pending',
          progressPercentage: project.progress > 70 ? 100 : project.progress > 55 ? Math.floor((project.progress - 55) * 3) : 0,
          dueDate: new Date(project.startDate?.getTime() + 70 * 24 * 60 * 60 * 1000),
          completedAt: project.progress > 70 ? new Date(project.startDate?.getTime() + 68 * 24 * 60 * 60 * 1000) : null
        },
        {
          name: 'Electrical Installation',
          description: 'Install electrical wiring and fixtures',
          priority: 'medium',
          weight: 15,
          status: project.progress > 80 ? 'Done' : project.progress > 60 ? 'In Progress' : 'Pending',
          progressPercentage: project.progress > 80 ? 100 : project.progress > 60 ? Math.floor((project.progress - 60) * 2.5) : 0,
          dueDate: new Date(project.startDate?.getTime() + 75 * 24 * 60 * 60 * 1000),
          completedAt: project.progress > 80 ? new Date(project.startDate?.getTime() + 73 * 24 * 60 * 60 * 1000) : null
        },
        {
          name: 'Plumbing Installation',
          description: 'Install plumbing system and fixtures',
          priority: 'medium',
          weight: 15,
          status: project.progress > 85 ? 'Done' : project.progress > 65 ? 'In Progress' : 'Pending',
          progressPercentage: project.progress > 85 ? 100 : project.progress > 65 ? Math.floor((project.progress - 65) * 2.5) : 0,
          dueDate: new Date(project.startDate?.getTime() + 78 * 24 * 60 * 60 * 1000),
          completedAt: project.progress > 85 ? new Date(project.startDate?.getTime() + 76 * 24 * 60 * 60 * 1000) : null
        },
        {
          name: 'Interior Finishing',
          description: 'Complete interior painting, tiling, and finishing work',
          priority: 'low',
          weight: 25,
          status: project.progress > 95 ? 'Done' : project.progress > 75 ? 'In Progress' : 'Pending',
          progressPercentage: project.progress > 95 ? 100 : project.progress > 75 ? Math.floor((project.progress - 75) * 2) : 0,
          dueDate: new Date(project.startDate?.getTime() + 85 * 24 * 60 * 60 * 1000),
          completedAt: project.progress > 95 ? new Date(project.startDate?.getTime() + 83 * 24 * 60 * 60 * 1000) : null
        },
        {
          name: 'Final Cleanup and Handover',
          description: 'Final cleanup and project handover to client',
          priority: 'low',
          weight: 10,
          status: project.status === 'Completed' ? 'Done' : project.progress > 90 ? 'In Progress' : 'Pending',
          progressPercentage: project.status === 'Completed' ? 100 : project.progress > 90 ? 50 : 0,
          dueDate: project.dueDate,
          completedAt: project.status === 'Completed' ? new Date(project.dueDate?.getTime() - 1 * 24 * 60 * 60 * 1000) : null
        }
      ];

      projectTasks.forEach((task, taskIndex) => {
        // Assign tasks to team members
        const assignedMember = teamMembers[taskIndex % teamMembers.length] || teamLeaders[0];
        
        taskData.push({
          projectId: project._id,
          assignedTo: assignedMember._id,
          ...task
        });
      });
    });

    const tasks = await Task.insertMany(taskData);
    console.log(`✅ Created ${tasks.length} project tasks`);

    // 3. Create Progress Updates
    console.log('\\n📈 Creating progress updates...');
    const progressUpdateData = [];
    
    projects.forEach((project, index) => {
      // Create 3-5 progress updates per project
      const numUpdates = Math.floor(Math.random() * 3) + 3;
      
      for (let i = 0; i < numUpdates; i++) {
        const updateDate = new Date(project.startDate?.getTime() + (i + 1) * 15 * 24 * 60 * 60 * 1000);
        const progressPercentage = Math.min(95, (i + 1) * 20 + Math.floor(Math.random() * 10));
        
        const updates = [
          'Foundation work completed successfully. Ready to start structural work.',
          'Structural framework is on schedule. Weather conditions have been favorable.',
          'Roofing installation completed. Starting interior electrical work next week.',
          'Plumbing rough-in completed. Interior finishing work has begun.',
          'Project nearing completion. Final quality checks are being conducted.',
          'Minor delays due to material delivery. Adjusting timeline accordingly.',
          'Quality inspection passed. Client is satisfied with current progress.',
          'Electrical and plumbing installations are complete and tested.',
          'Interior painting and finishing work is proceeding as planned.',
          'Final cleanup phase initiated. Preparing for project handover.'
        ];

        progressUpdateData.push({
          projectId: project._id,
          submittedBy: projectManagers[index % projectManagers.length]._id,
          summary: updates[i % updates.length],
          createdAt: updateDate
        });
      }
    });

    const progressUpdates = await ProgressUpdate.insertMany(progressUpdateData);
    console.log(`✅ Created ${progressUpdates.length} progress updates`);

    // Summary
    console.log('\\n📊 PROJECT MODELS SEEDING SUMMARY');
    console.log('=' + '='.repeat(45));
    console.log(`🎯 Project Milestones: ${milestones.length}`);
    console.log(`📋 Project Tasks: ${tasks.length}`);
    console.log(`📈 Progress Updates: ${progressUpdates.length}`);
    
    console.log('\\n📋 Tasks by Status:');
    const tasksByStatus = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(tasksByStatus).forEach(([status, count]) => {
      console.log(`   • ${status}: ${count} tasks`);
    });

    console.log('\\n📋 Tasks by Priority:');
    const tasksByPriority = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(tasksByPriority).forEach(([priority, count]) => {
      console.log(`   • ${priority}: ${count} tasks`);
    });

    console.log('\\n🎯 Milestone Completion Rate:');
    const completedMilestones = milestones.filter(m => m.completed).length;
    console.log(`   • Completed: ${completedMilestones}/${milestones.length} (${Math.round(completedMilestones/milestones.length*100)}%)`);

    console.log('=' + '='.repeat(45));

    await mongoose.disconnect();
    console.log('🔚 Database connection closed');
    console.log('✅ Project models seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding project models:', error);
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedProjectModels();
}

export default seedProjectModels;