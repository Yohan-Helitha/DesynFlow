import mongoose from 'mongoose';
import Project from '../modules/project/model/project.model.js';
import Task from '../modules/project/model/task.model.js';
import Team from '../modules/project/model/team.model.js';
import Milestone from '../modules/project/model/milestone.model.js';
import Material from '../modules/project/model/material.model.js';
import Meeting from '../modules/project/model/meeting.model.js';
import Attendance from '../modules/project/model/attendance.model.js';
import MaterialRequest from '../modules/project/model/material.model.js';
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
      Material.deleteMany({}),
      Meeting.deleteMany({}),
      Attendance.deleteMany({}),
      MaterialRequest.deleteMany({}),
      Report.deleteMany({})
    ]);
    console.log('🧹 Cleared existing data');

    // Create sample teams for interior design
    const team1 = new Team({
      teamId: new mongoose.Types.ObjectId(),
      teamName: 'Interior Design Team',
      leaderId: new mongoose.Types.ObjectId(),
      members: [
        {
          userId: new mongoose.Types.ObjectId(),
          role: 'Senior Interior Designer',
          availability: 'Available',
          workload: 85
        },
        {
          userId: new mongoose.Types.ObjectId(),
          role: '3D Visualization Specialist',
          availability: 'Available',
          workload: 70
        }
      ],
      active: true
    });

    const team2 = new Team({
      teamId: new mongoose.Types.ObjectId(),
      teamName: 'Project Management Team',
      leaderId: new mongoose.Types.ObjectId(),
      members: [
        {
          userId: new mongoose.Types.ObjectId(),
          role: 'Project Manager',
          availability: 'Available',
          workload: 90
        },
        {
          userId: new mongoose.Types.ObjectId(),
          role: 'Site Coordinator',
          availability: 'Available',
          workload: 60
        }
      ],
      active: true
    });

    await Promise.all([team1.save(), team2.save()]);
    console.log('✅ Created 2 sample teams');

    await Promise.all([team1.save(), team2.save()]);
    console.log('✅ Created 2 sample teams');

    // Create sample interior design projects
    const project1 = new Project({
      projectName: 'Modern Living Room Renovation',
      clientId: new mongoose.Types.ObjectId(),
      inspectionId: new mongoose.Types.ObjectId(),
      assignedTeamId: team1._id,
      status: 'Active',
      progress: 35,
      timeline: [
        {
          name: 'Initial Consultation',
          date: new Date('2025-08-15'),
          description: 'Met with client to discuss vision and requirements'
        },
        {
          name: 'Space Measurement',
          date: new Date('2025-08-20'),
          description: 'Completed detailed measurements of living space'
        }
      ]
    });

    const project2 = new Project({
      projectName: 'Office Space Complete Makeover',
      clientId: new mongoose.Types.ObjectId(),
      inspectionId: new mongoose.Types.ObjectId(),
      assignedTeamId: team1._id,
      status: 'In Progress',
      progress: 70,
      timeline: [
        {
          name: 'Concept Development',
          date: new Date('2025-07-10'),
          description: 'Developed initial design concepts and mood boards'
        },
        {
          name: 'Material Selection',
          date: new Date('2025-07-25'),
          description: 'Selected furniture, fixtures, and finishes'
        }
      ]
    });

    const project3 = new Project({
      projectName: 'Luxury Bedroom Suite Design',
      clientId: new mongoose.Types.ObjectId(),
      inspectionId: new mongoose.Types.ObjectId(),
      assignedTeamId: team2._id,
      status: 'On Hold',
      progress: 15,
      timeline: [
        {
          name: 'Client Brief',
          date: new Date('2025-08-25'),
          description: 'Initial client meeting and requirements gathering'
        }
      ]
    });

    await Promise.all([project1.save(), project2.save(), project3.save()]);
    console.log('✅ Created 3 sample projects');

    // Create sample milestones for interior design projects
    const milestones = [
      {
        projectId: project1._id,
        name: 'Design Concept Approval',
        description: 'Client approval of initial design concepts and color schemes',
        dueDate: new Date('2025-09-15'),
        completed: true,
        completedAt: new Date('2025-09-12')
      },
      {
        projectId: project1._id,
        name: 'Material Procurement',
        description: 'Order all furniture, fixtures, and decorative elements',
        dueDate: new Date('2025-09-30'),
        completed: false
      },
      {
        projectId: project1._id,
        name: 'Installation Complete',
        description: 'Complete installation and final styling',
        dueDate: new Date('2025-10-15'),
        completed: false
      },
      {
        projectId: project2._id,
        name: 'Space Planning',
        description: 'Finalize office layout and workflow optimization',
        dueDate: new Date('2025-09-20'),
        completed: true,
        completedAt: new Date('2025-09-18')
      },
      {
        projectId: project2._id,
        name: 'Final Walkthrough',
        description: 'Client final inspection and handover',
        dueDate: new Date('2025-10-05'),
        completed: false
      }
    ];

    const savedMilestones = await Promise.all(milestones.map(m => new Milestone(m).save()));
    console.log('✅ Created 5 sample milestones');

    // Create sample interior design tasks
    const tasks = [
      {
        projectId: project1._id,
        name: 'Space Assessment & Measurements',
        description: 'Detailed measurement and assessment of living room space',
        status: 'Done',
        weight: 2,
        progressPercentage: 100
      },
      {
        projectId: project1._id,
        name: 'Color Scheme Development',
        description: 'Create color palette and mood board for modern aesthetic',
        status: 'Done',
        weight: 3,
        progressPercentage: 100
      },
      {
        projectId: project1._id,
        name: 'Furniture Selection',
        description: 'Select and source modern furniture pieces',
        status: 'In Progress',
        weight: 4,
        progressPercentage: 60
      },
      {
        projectId: project1._id,
        name: 'Lighting Design',
        description: 'Design ambient and task lighting solutions',
        status: 'Pending',
        weight: 3,
        progressPercentage: 0
      },
      {
        projectId: project2._id,
        name: 'Workspace Flow Analysis',
        description: 'Analyze current workflow and optimize space utilization',
        status: 'Done',
        weight: 4,
        progressPercentage: 100
      },
      {
        projectId: project2._id,
        name: 'Ergonomic Furniture Setup',
        description: 'Install ergonomic desks and seating solutions',
        status: 'In Progress',
        weight: 5,
        progressPercentage: 80
      },
      {
        projectId: project2._id,
        name: 'Acoustic Treatment',
        description: 'Install sound dampening and acoustic panels',
        status: 'In Progress',
        weight: 3,
        progressPercentage: 40
      },
      {
        projectId: project3._id,
        name: 'Luxury Material Research',
        description: 'Research high-end materials and finishes for bedroom',
        status: 'Pending',
        weight: 3,
        progressPercentage: 0
      }
    ];

    await Promise.all(tasks.map(t => new Task(t).save()));
    console.log('✅ Created 8 sample interior design tasks');

    // Create sample material requests for interior design
    const materials = [
      {
        projectId: project1._id,
        itemName: 'Modern Sectional Sofa',
        quantity: 1,
        unitPrice: 2499.99,
        totalCost: 2499.99,
        supplier: 'West Elm Furniture',
        requestedBy: new mongoose.Types.ObjectId(),
        status: 'Approved',
        urgency: 'High',
        description: 'Gray fabric sectional sofa for living room centerpiece'
      },
      {
        projectId: project1._id,
        itemName: 'LED Track Lighting System',
        quantity: 3,
        unitPrice: 189.99,
        totalCost: 569.97,
        supplier: 'Philips Lighting',
        requestedBy: new mongoose.Types.ObjectId(),
        status: 'Approved',
        urgency: 'Medium',
        description: 'Adjustable LED track lights for ambient lighting'
      },
      {
        projectId: project2._id,
        itemName: 'Ergonomic Office Chairs',
        quantity: 15,
        unitPrice: 899.00,
        totalCost: 13485.00,
        supplier: 'Herman Miller',
        requestedBy: new mongoose.Types.ObjectId(),
        status: 'Pending',
        urgency: 'High',
        description: 'Aeron chairs for employee workstations'
      },
      {
        projectId: project2._id,
        itemName: 'Acoustic Wall Panels',
        quantity: 20,
        unitPrice: 125.50,
        totalCost: 2510.00,
        supplier: 'Primacoustic',
        requestedBy: new mongoose.Types.ObjectId(),
        status: 'Approved',
        urgency: 'Medium',
        description: 'Sound-absorbing panels for open office areas'
      },
      {
        projectId: project3._id,
        itemName: 'Luxury Bed Frame',
        quantity: 1,
        unitPrice: 3500.00,
        totalCost: 3500.00,
        supplier: 'Restoration Hardware',
        requestedBy: new mongoose.Types.ObjectId(),
        status: 'Pending',
        urgency: 'Low',
        description: 'King size upholstered bed frame in velvet'
      }
    ];

    const savedMaterials = await Promise.all(materials.map(m => new Material(m).save()));
    console.log('✅ Created sample materials');

    // Create sample interior design meetings
    const meetings = [
      {
        projectId: project1._id,
        meetingType: 'Design Presentation',
        withClientId: new mongoose.Types.ObjectId(),
        scheduledDate: new Date('2025-09-10T14:00:00Z'),
        duration: 90,
        agenda: 'Present 3D renderings and finalize design direction for living room',
        status: 'Completed',
        notes: 'Client loved the modern minimalist approach. Approved color scheme and furniture selections.'
      },
      {
        projectId: project1._id,
        meetingType: 'Material Review',
        withClientId: new mongoose.Types.ObjectId(),
        scheduledDate: new Date('2025-09-25T10:00:00Z'),
        duration: 60,
        agenda: 'Review fabric samples and finalize material selections',
        status: 'Scheduled'
      },
      {
        projectId: project2._id,
        meetingType: 'Progress Review',
        withClientId: new mongoose.Types.ObjectId(),
        scheduledDate: new Date('2025-09-15T16:00:00Z'),
        duration: 45,
        agenda: 'Review office renovation progress and address any concerns',
        status: 'Completed',
        notes: 'Installation is on schedule. Client requested minor adjustments to lighting placement.'
      },
      {
        projectId: project2._id,
        meetingType: 'Final Walkthrough',
        withClientId: new mongoose.Types.ObjectId(),
        scheduledDate: new Date('2025-10-01T11:00:00Z'),
        duration: 120,
        agenda: 'Final inspection and project handover',
        status: 'Scheduled'
      },
      {
        projectId: project3._id,
        meetingType: 'Initial Consultation',
        withClientId: new mongoose.Types.ObjectId(),
        scheduledDate: new Date('2025-09-05T13:00:00Z'),
        duration: 60,
        agenda: 'Discuss luxury bedroom vision and budget parameters',
        status: 'Completed',
        notes: 'Client wants opulent design with gold accents. Budget set at $50,000.'
      }
    ];

    await Promise.all(meetings.map(m => new Meeting(m).save()));
    console.log('✅ Created 5 sample interior design meetings');

    console.log('\n🎉 Interior Design Sample Data Insertion Completed!');
    console.log('\n📊 Database Summary:');
    console.log(`   Teams: 2 (Interior Design & Project Management)`);
    console.log(`   Projects: 3 (Living Room, Office, Bedroom)`);
    console.log(`   Milestones: 5 (Design phases and deliverables)`);
    
    // Create sample attendance records
    const attendanceRecords = [
      new Attendance({
        teamId: team1._id,
        userId: team1.members[0].userId,
        date: new Date('2023-11-06'),
        status: 'present',
        checkIn: new Date('2023-11-06T09:00:00Z'),
        checkOut: new Date('2023-11-06T17:00:00Z'),
        reason: 'Training'
      }),
      new Attendance({
        teamId: team1._id,
        userId: team1.members[1].userId,
        date: new Date('2023-11-06'),
        status: 'present',
        checkIn: new Date('2023-11-06T09:15:00Z'),
        checkOut: new Date('2023-11-06T17:30:00Z')
      }),
      new Attendance({
        teamId: team2._id,
        userId: team2.members[0].userId,
        date: new Date('2023-11-06'),
        status: 'off-duty',
        reason: 'Medical'
      })
    ];
    
    const savedAttendance = await Attendance.insertMany(attendanceRecords);
    console.log(`✅ Created ${savedAttendance.length} sample attendance records`);

    // Create sample material requests
    const materialRequests = [
      new MaterialRequest({
        projectId: project1._id,
        requestedBy: team1.leaderId,
        items: [{
          materialId: savedMaterials[0]._id,
          qty: 50,
          neededBy: new Date('2023-12-01')
        }],
        status: 'Pending'
      }),
      new MaterialRequest({
        projectId: project2._id,
        requestedBy: team2.leaderId,
        items: [{
          materialId: savedMaterials[1]._id,
          qty: 25,
          neededBy: new Date('2023-11-20')
        }],
        status: 'Approved'
      })
    ];
    
    const savedMaterialRequests = await MaterialRequest.insertMany(materialRequests);
    console.log(`✅ Created ${savedMaterialRequests.length} sample material requests`);

    // Create sample reports
    const reports = [
      new Report({
        projectId: project1._id,
        submittedBy: team1.leaderId,
        reportType: 'Weekly Progress Report',
        dateRange: {
          start: new Date('2023-11-01'),
          end: new Date('2023-11-07')
        },
        summary: 'Design phase completed, moving to planning stage',
        includeProgress: true,
        includeIssues: false,
        includeResourceUsage: true,
        status: 'completed'
      }),
      new Report({
        projectId: project2._id,
        submittedBy: team2.leaderId,
        reportType: 'Project Status Report',
        dateRange: {
          start: new Date('2023-10-15'),
          end: new Date('2023-10-30')
        },
        summary: 'Foundation work on schedule, electrical planning in progress',
        includeProgress: true,
        includeIssues: true,
        status: 'draft'
      })
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
