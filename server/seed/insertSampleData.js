import mongoose from 'mongoose';
import Project from '../modules/project/model/project.model.js';
import Task from '../modules/project/model/task.model.js';
import Team from '../modules/project/model/team.model.js';
import Milestone from '../modules/project/model/milestone.model.js';
import MaterialRequest from '../modules/project/model/material.model.js';
import Meeting from '../modules/project/model/meeting.model.js';
import Attendance from '../modules/project/model/attendance.model.js';
import Report from '../modules/project/model/report.model.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/desynflow';

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      Project.deleteMany({}),
      Task.deleteMany({}),
      Team.deleteMany({}),
      Milestone.deleteMany({}),
      Meeting.deleteMany({}),
      Attendance.deleteMany({}),
      MaterialRequest.deleteMany({}),
      Report.deleteMany({})
    ]);
    console.log('🧹 Cleared existing data');

    // Create 5 sample teams
    const teams = [
      {
        teamId: new mongoose.Types.ObjectId(),
        teamName: 'Interior Design Team',
        leaderId: new mongoose.Types.ObjectId(),
        members: [
          { userId: new mongoose.Types.ObjectId(), role: 'Senior Interior Designer', availability: 'Available', workload: 85 },
          { userId: new mongoose.Types.ObjectId(), role: '3D Visualization Specialist', availability: 'Available', workload: 70 }
        ],
        active: true
      },
      {
        teamId: new mongoose.Types.ObjectId(),
        teamName: 'Project Management Team',
        leaderId: new mongoose.Types.ObjectId(),
        members: [
          { userId: new mongoose.Types.ObjectId(), role: 'Project Manager', availability: 'Available', workload: 90 },
          { userId: new mongoose.Types.ObjectId(), role: 'Site Coordinator', availability: 'Available', workload: 60 }
        ],
        active: true
      },
      {
        teamId: new mongoose.Types.ObjectId(),
        teamName: 'Lighting Design Team',
        leaderId: new mongoose.Types.ObjectId(),
        members: [
          { userId: new mongoose.Types.ObjectId(), role: 'Lighting Specialist', availability: 'Available', workload: 80 },
          { userId: new mongoose.Types.ObjectId(), role: 'Electrician', availability: 'Available', workload: 65 }
        ],
        active: true
      },
      {
        teamId: new mongoose.Types.ObjectId(),
        teamName: 'Furniture Procurement Team',
        leaderId: new mongoose.Types.ObjectId(),
        members: [
          { userId: new mongoose.Types.ObjectId(), role: 'Procurement Manager', availability: 'Available', workload: 75 },
          { userId: new mongoose.Types.ObjectId(), role: 'Logistics Coordinator', availability: 'Available', workload: 60 }
        ],
        active: true
      },
      {
        teamId: new mongoose.Types.ObjectId(),
        teamName: 'Site Inspection Team',
        leaderId: new mongoose.Types.ObjectId(),
        members: [
          { userId: new mongoose.Types.ObjectId(), role: 'Inspector', availability: 'Available', workload: 80 },
          { userId: new mongoose.Types.ObjectId(), role: 'Safety Officer', availability: 'Available', workload: 70 }
        ],
        active: true
      }
    ];
    const savedTeams = await Team.insertMany(teams);
    console.log('✅ Created 5 sample teams');

    // Create 5 sample projects
    const projects = [
      {
        projectName: 'Modern Living Room Renovation',
        clientId: new mongoose.Types.ObjectId(),
        inspectionId: new mongoose.Types.ObjectId(),
        assignedTeamId: savedTeams[0]._id,
        status: 'Active',
        progress: 35,
        timeline: [
          { name: 'Initial Consultation', date: new Date('2025-08-15'), description: 'Met with client to discuss vision and requirements' },
          { name: 'Space Measurement', date: new Date('2025-08-20'), description: 'Completed detailed measurements of living space' }
        ]
      },
      {
        projectName: 'Office Space Complete Makeover',
        clientId: new mongoose.Types.ObjectId(),
        inspectionId: new mongoose.Types.ObjectId(),
        assignedTeamId: savedTeams[0]._id,
        status: 'In Progress',
        progress: 70,
        timeline: [
          { name: 'Concept Development', date: new Date('2025-07-10'), description: 'Developed initial design concepts and mood boards' },
          { name: 'Material Selection', date: new Date('2025-07-25'), description: 'Selected furniture, fixtures, and finishes' }
        ]
      },
      {
        projectName: 'Luxury Bedroom Suite Design',
        clientId: new mongoose.Types.ObjectId(),
        inspectionId: new mongoose.Types.ObjectId(),
        assignedTeamId: savedTeams[1]._id,
        status: 'On Hold',
        progress: 15,
        timeline: [
          { name: 'Client Brief', date: new Date('2025-08-25'), description: 'Initial client meeting and requirements gathering' }
        ]
      },
      {
        projectName: 'Lighting Upgrade Project',
        clientId: new mongoose.Types.ObjectId(),
        inspectionId: new mongoose.Types.ObjectId(),
        assignedTeamId: savedTeams[2]._id,
        status: 'Active',
        progress: 50,
        timeline: [
          { name: 'Lighting Assessment', date: new Date('2025-09-01'), description: 'Assessed lighting needs for the site' },
          { name: 'Fixture Selection', date: new Date('2025-09-05'), description: 'Selected new lighting fixtures' }
        ]
      },
      {
        projectName: 'Furniture Procurement Drive',
        clientId: new mongoose.Types.ObjectId(),
        inspectionId: new mongoose.Types.ObjectId(),
        assignedTeamId: savedTeams[3]._id,
        status: 'Completed',
        progress: 100,
        timeline: [
          { name: 'Vendor Selection', date: new Date('2025-08-10'), description: 'Selected vendors for furniture' },
          { name: 'Delivery & Setup', date: new Date('2025-08-20'), description: 'Delivered and set up furniture' }
        ]
      }
    ];
    const savedProjects = await Project.insertMany(projects);
    console.log('✅ Created 5 sample projects');

    // Create 5 sample milestones
    const milestones = [
      { projectId: savedProjects[0]._id, name: 'Design Concept Approval', description: 'Client approval of initial design concepts and color schemes', dueDate: new Date('2025-09-15'), completed: true, completedAt: new Date('2025-09-12') },
      { projectId: savedProjects[0]._id, name: 'Material Procurement', description: 'Order all furniture, fixtures, and decorative elements', dueDate: new Date('2025-09-30'), completed: false },
      { projectId: savedProjects[1]._id, name: 'Space Planning', description: 'Finalize office layout and workflow optimization', dueDate: new Date('2025-09-20'), completed: true, completedAt: new Date('2025-09-18') },
      { projectId: savedProjects[2]._id, name: 'Client Brief Complete', description: 'Client brief and requirements gathering complete', dueDate: new Date('2025-09-01'), completed: true, completedAt: new Date('2025-09-01') },
      { projectId: savedProjects[3]._id, name: 'Lighting Installation', description: 'Installed new lighting fixtures', dueDate: new Date('2025-09-10'), completed: false }
    ];
    const savedMilestones = await Milestone.insertMany(milestones);
    console.log('✅ Created 5 sample milestones');

    // Create 5 sample tasks
    const tasks = [
      { projectId: savedProjects[0]._id, name: 'Space Assessment & Measurements', description: 'Detailed measurement and assessment of living room space', status: 'Done', weight: 2, progressPercentage: 100 },
      { projectId: savedProjects[0]._id, name: 'Color Scheme Development', description: 'Create color palette and mood board for modern aesthetic', status: 'Done', weight: 3, progressPercentage: 100 },
      { projectId: savedProjects[1]._id, name: 'Workspace Flow Analysis', description: 'Analyze current workflow and optimize space utilization', status: 'Done', weight: 4, progressPercentage: 100 },
      { projectId: savedProjects[2]._id, name: 'Luxury Material Research', description: 'Research high-end materials and finishes for bedroom', status: 'Pending', weight: 3, progressPercentage: 0 },
      { projectId: savedProjects[3]._id, name: 'Lighting Design', description: 'Design ambient and task lighting solutions', status: 'Pending', weight: 3, progressPercentage: 0 }
    ];
    const savedTasks = await Task.insertMany(tasks);
    console.log('✅ Created 5 sample tasks');



    // Create 5 sample meetings
    const meetings = [
      { projectId: savedProjects[0]._id, meetingType: 'Design Presentation', withClientId: new mongoose.Types.ObjectId(), scheduledDate: new Date('2025-09-10T14:00:00Z'), duration: 90, agenda: 'Present 3D renderings and finalize design direction for living room', status: 'Completed', notes: 'Client loved the modern minimalist approach. Approved color scheme and furniture selections.' },
      { projectId: savedProjects[0]._id, meetingType: 'Material Review', withClientId: new mongoose.Types.ObjectId(), scheduledDate: new Date('2025-09-25T10:00:00Z'), duration: 60, agenda: 'Review fabric samples and finalize material selections', status: 'Scheduled' },
      { projectId: savedProjects[1]._id, meetingType: 'Progress Review', withClientId: new mongoose.Types.ObjectId(), scheduledDate: new Date('2025-09-15T16:00:00Z'), duration: 45, agenda: 'Review office renovation progress and address any concerns', status: 'Completed', notes: 'Installation is on schedule. Client requested minor adjustments to lighting placement.' },
      { projectId: savedProjects[2]._id, meetingType: 'Initial Consultation', withClientId: new mongoose.Types.ObjectId(), scheduledDate: new Date('2025-09-05T13:00:00Z'), duration: 60, agenda: 'Discuss luxury bedroom vision and budget parameters', status: 'Completed', notes: 'Client wants opulent design with gold accents. Budget set at $50,000.' },
      { projectId: savedProjects[3]._id, meetingType: 'Lighting Review', withClientId: new mongoose.Types.ObjectId(), scheduledDate: new Date('2025-09-12T11:00:00Z'), duration: 60, agenda: 'Review lighting installation progress', status: 'Scheduled' }
    ];
    const savedMeetings = await Meeting.insertMany(meetings);
    console.log('✅ Created 5 sample meetings');

    console.log('\n🎉 Interior Design Sample Data Insertion Completed!');
    console.log('\n📊 Database Summary:');
    console.log(`   Teams: 2 (Interior Design & Project Management)`);
    console.log(`   Projects: 3 (Living Room, Office, Bedroom)`);
    console.log(`   Milestones: 5 (Design phases and deliverables)`);
    
    // Create 5 sample attendance records
    const attendanceRecords = [
      { teamId: savedTeams[0]._id, userId: savedTeams[0].members[0].userId, date: new Date('2023-11-06'), status: 'present', checkIn: new Date('2023-11-06T09:00:00Z'), checkOut: new Date('2023-11-06T17:00:00Z'), reason: 'Training' },
      { teamId: savedTeams[0]._id, userId: savedTeams[0].members[1].userId, date: new Date('2023-11-06'), status: 'present', checkIn: new Date('2023-11-06T09:15:00Z'), checkOut: new Date('2023-11-06T17:30:00Z') },
      { teamId: savedTeams[1]._id, userId: savedTeams[1].members[0].userId, date: new Date('2023-11-06'), status: 'off-duty', reason: 'Medical' },
      { teamId: savedTeams[2]._id, userId: savedTeams[2].members[0].userId, date: new Date('2023-11-07'), status: 'present', checkIn: new Date('2023-11-07T09:00:00Z'), checkOut: new Date('2023-11-07T17:00:00Z') },
      { teamId: savedTeams[3]._id, userId: savedTeams[3].members[0].userId, date: new Date('2023-11-08'), status: 'present', checkIn: new Date('2023-11-08T09:00:00Z'), checkOut: new Date('2023-11-08T17:00:00Z') }
    ];
    const savedAttendance = await Attendance.insertMany(attendanceRecords);
    console.log(`✅ Created ${savedAttendance.length} sample attendance records`);

    // Create 5 sample material requests
    const materialRequests = [
      { projectId: savedProjects[0]._id, requestedBy: savedTeams[0].leaderId, items: [{ materialId: new mongoose.Types.ObjectId(), qty: 50, neededBy: new Date('2023-12-01') }], status: 'Pending' },
      { projectId: savedProjects[1]._id, requestedBy: savedTeams[1].leaderId, items: [{ materialId: new mongoose.Types.ObjectId(), qty: 25, neededBy: new Date('2023-11-20') }], status: 'Approved' },
      { projectId: savedProjects[2]._id, requestedBy: savedTeams[2].leaderId, items: [{ materialId: new mongoose.Types.ObjectId(), qty: 10, neededBy: new Date('2023-11-25') }], status: 'Pending' },
      { projectId: savedProjects[3]._id, requestedBy: savedTeams[3].leaderId, items: [{ materialId: new mongoose.Types.ObjectId(), qty: 5, neededBy: new Date('2023-12-05') }], status: 'Approved' },
      { projectId: savedProjects[4]._id, requestedBy: savedTeams[4].leaderId, items: [{ materialId: new mongoose.Types.ObjectId(), qty: 15, neededBy: new Date('2023-12-10') }], status: 'Pending' }
    ];
    const savedMaterialRequests = await MaterialRequest.insertMany(materialRequests);
    console.log(`✅ Created ${savedMaterialRequests.length} sample material requests`);

    // Create 5 sample reports
    const reports = [
      { projectId: savedProjects[0]._id, submittedBy: savedTeams[0].leaderId, reportType: 'Weekly Progress Report', dateRange: { start: new Date('2023-11-01'), end: new Date('2023-11-07') }, summary: 'Design phase completed, moving to planning stage', includeProgress: true, includeIssues: false, includeResourceUsage: true, status: 'completed' },
      { projectId: savedProjects[1]._id, submittedBy: savedTeams[1].leaderId, reportType: 'Project Status Report', dateRange: { start: new Date('2023-10-15'), end: new Date('2023-10-30') }, summary: 'Foundation work on schedule, electrical planning in progress', includeProgress: true, includeIssues: true, status: 'draft' },
      { projectId: savedProjects[2]._id, submittedBy: savedTeams[2].leaderId, reportType: 'Inspection Report', dateRange: { start: new Date('2023-09-01'), end: new Date('2023-09-07') }, summary: 'Inspection completed, minor issues found', includeProgress: false, includeIssues: true, status: 'completed' },
      { projectId: savedProjects[3]._id, submittedBy: savedTeams[3].leaderId, reportType: 'Lighting Progress Report', dateRange: { start: new Date('2023-09-10'), end: new Date('2023-09-17') }, summary: 'Lighting installation in progress', includeProgress: true, includeIssues: false, status: 'draft' },
      { projectId: savedProjects[4]._id, submittedBy: savedTeams[4].leaderId, reportType: 'Furniture Procurement Report', dateRange: { start: new Date('2023-08-10'), end: new Date('2023-08-20') }, summary: 'Furniture delivered and set up', includeProgress: true, includeIssues: false, status: 'completed' }
    ];
    const savedReports = await Report.insertMany(reports);
    console.log(`✅ Created ${savedReports.length} sample reports`);

    console.log(`   Tasks: 8 (Interior design specific tasks)`);
    console.log(`   Material Requests: 5 (Furniture, lighting, fixtures)`);
    console.log(`   Meetings: 5 (Client consultations and reviews)`);
    console.log(`   Attendance: ${savedAttendance.length} (Team member attendance)`);
    console.log(`   Resource Requests: ${savedMaterialRequests.length} (Material requests)`);
    console.log(`   Reports: ${savedReports.length} (Progress reports)`);
    console.log('\n🎨 Frontend ready for interior design project management!');
    console.log('\n💡 Sample data includes:');
    console.log('   • Realistic interior design projects');
    console.log('   • Design-specific tasks and milestones');
    console.log('   • Furniture and material procurement');
    console.log('   • Client meeting schedules');
    console.log('   • Team roles (Designers, Project Managers)');
    console.log('   • Progress tracking and status updates');
    console.log('   • Team Leader features (attendance, resources, reports)');

  } catch (error) {
    console.error('❌ Error inserting sample data:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

seedDatabase();
