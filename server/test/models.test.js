import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { setupTestDB, teardownTestDB, clearTestDB } from './testHelpers.js';
import Project from '../modules/project/model/project.model.js';
import Task from '../modules/project/model/task.model.js';
import Team from '../modules/project/model/team.model.js';
import Milestone from '../modules/project/model/milestone.model.js';
import ProgressUpdate from '../modules/project/model/progressupdate.model.js';
import InspectionReport from '../modules/user/model/report.model.js';
import mongoose from 'mongoose';

describe('Database Models Validation', () => {
  
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  describe('Project Model', () => {
    test('should create valid project', async () => {
      const projectData = {
        projectId: new mongoose.Types.ObjectId(),
        projectName: 'Test Project Model',
        clientId: new mongoose.Types.ObjectId(),
        status: 'Active',
        progress: 25
      };

      const project = new Project(projectData);
      const savedProject = await project.save();

      expect(savedProject._id).toBeDefined();
      expect(savedProject.projectName).toBe(projectData.projectName);
      expect(savedProject.status).toBe('Active');
      expect(savedProject.archived).toBe(false); // default value
      expect(savedProject.createdAt).toBeDefined();
      expect(savedProject.updatedAt).toBeDefined();
    });

    test('should enforce required fields', async () => {
      const invalidProject = new Project({
        // Missing required projectId and projectName
        clientId: new mongoose.Types.ObjectId()
      });

      await expect(invalidProject.save()).rejects.toThrow();
    });

    test('should validate status enum', async () => {
      const projectWithInvalidStatus = new Project({
        projectId: new mongoose.Types.ObjectId(),
        projectName: 'Invalid Status Project',
        clientId: new mongoose.Types.ObjectId(),
        status: 'InvalidStatus'
      });

      await expect(projectWithInvalidStatus.save()).rejects.toThrow();
    });
  });

  describe('Task Model', () => {
    test('should create valid task', async () => {
      const taskData = {
        projectId: new mongoose.Types.ObjectId(),
        name: 'Test Task',
        description: 'Task description',
        assignedTo: new mongoose.Types.ObjectId(),
        weight: 5,
        status: 'In Progress',
        progressPercentage: 50
      };

      const task = new Task(taskData);
      const savedTask = await task.save();

      expect(savedTask._id).toBeDefined();
      expect(savedTask.name).toBe(taskData.name);
      expect(savedTask.status).toBe('In Progress');
      expect(savedTask.progressPercentage).toBe(50);
      expect(savedTask.createdAt).toBeDefined();
    });

    test('should use default values', async () => {
      const minimalTask = new Task({
        projectId: new mongoose.Types.ObjectId()
      });

      const savedTask = await minimalTask.save();
      expect(savedTask.status).toBe('Pending');
      expect(savedTask.weight).toBe(0);
      expect(savedTask.progressPercentage).toBe(0);
    });

    test('should validate status enum', async () => {
      const taskWithInvalidStatus = new Task({
        projectId: new mongoose.Types.ObjectId(),
        status: 'InvalidStatus'
      });

      await expect(taskWithInvalidStatus.save()).rejects.toThrow();
    });
  });

  describe('Team Model', () => {
    test('should create valid team with members', async () => {
      const teamData = {
        teamId: new mongoose.Types.ObjectId(),
        teamName: 'Test Team Model',
        leaderId: new mongoose.Types.ObjectId(),
        members: [
          {
            userId: new mongoose.Types.ObjectId(),
            role: 'Designer',
            availability: 'Available',
            workload: 60
          },
          {
            userId: new mongoose.Types.ObjectId(),
            role: 'Architect',
            availability: 'Busy',
            workload: 80
          }
        ],
        active: true
      };

      const team = new Team(teamData);
      const savedTeam = await team.save();

      expect(savedTeam._id).toBeDefined();
      expect(savedTeam.teamName).toBe(teamData.teamName);
      expect(savedTeam.members.length).toBe(2);
      expect(savedTeam.members[0].role).toBe('Designer');
      expect(savedTeam.active).toBe(true);
    });

    test('should enforce required fields in team', async () => {
      const invalidTeam = new Team({
        // Missing required teamId
        teamName: 'Invalid Team'
      });

      await expect(invalidTeam.save()).rejects.toThrow();
    });

    test('should validate member availability enum', async () => {
      const teamWithInvalidMember = new Team({
        teamId: new mongoose.Types.ObjectId(),
        teamName: 'Invalid Member Team',
        members: [
          {
            userId: new mongoose.Types.ObjectId(),
            availability: 'InvalidAvailability'
          }
        ]
      });

      await expect(teamWithInvalidMember.save()).rejects.toThrow();
    });
  });

  describe('Milestone Model', () => {
    test('should create valid milestone', async () => {
      const milestoneData = {
        projectId: new mongoose.Types.ObjectId(),
        name: 'Design Phase Complete',
        description: 'All design work completed and approved',
        dueDate: new Date('2025-10-01'),
        completed: false
      };

      const milestone = new Milestone(milestoneData);
      const savedMilestone = await milestone.save();

      expect(savedMilestone._id).toBeDefined();
      expect(savedMilestone.name).toBe(milestoneData.name);
      expect(savedMilestone.completed).toBe(false);
      expect(savedMilestone.dueDate).toEqual(milestoneData.dueDate);
    });

    test('should enforce required fields', async () => {
      const invalidMilestone = new Milestone({
        // Missing required projectId and name
        description: 'Invalid milestone'
      });

      await expect(invalidMilestone.save()).rejects.toThrow();
    });
  });

  describe('ProgressUpdate Model', () => {
    test('should create valid progress update', async () => {
      const progressUpdateData = {
        projectId: new mongoose.Types.ObjectId(),
        teamId: new mongoose.Types.ObjectId(),
        submittedBy: new mongoose.Types.ObjectId(),
        summary: 'Week 1 progress update',
        attachments: ['uploads/progress/week1.jpg'],
        flaggedIssues: [
          {
            description: 'Material delay from supplier',
            flaggedAt: new Date(),
            resolved: false
          }
        ]
      };

      const progressUpdate = new ProgressUpdate(progressUpdateData);
      const savedUpdate = await progressUpdate.save();

      expect(savedUpdate._id).toBeDefined();
      expect(savedUpdate.summary).toBe(progressUpdateData.summary);
      expect(savedUpdate.flaggedIssues.length).toBe(1);
      expect(savedUpdate.flaggedIssues[0].resolved).toBe(false);
    });

    test('should enforce required fields', async () => {
      const invalidUpdate = new ProgressUpdate({
        // Missing required projectId and submittedBy
        summary: 'Invalid update'
      });

      await expect(invalidUpdate.save()).rejects.toThrow();
    });
  });

  describe('InspectionReport Model', () => {
    test('should create valid inspection report', async () => {
      const reportData = {
        inspectionRequestId: new mongoose.Types.ObjectId(),
        inspectorId: new mongoose.Types.ObjectId(),
        summary: 'Inspection completed without issues',
        attachments: ['uploads/reports/inspection.pdf'],
        status: 'Submitted'
      };

      const report = new InspectionReport(reportData);
      const savedReport = await report.save();

      expect(savedReport._id).toBeDefined();
      expect(savedReport.inspectionRequestId).toEqual(reportData.inspectionRequestId);
      expect(savedReport.status).toBe('Submitted');
    });

    test('should enforce unique inspectionRequestId', async () => {
      const reportData = {
        inspectionRequestId: new mongoose.Types.ObjectId(),
        summary: 'First report'
      };

      const report1 = new InspectionReport(reportData);
      await report1.save();

      // Try to create another report with same inspectionRequestId
      const report2 = new InspectionReport(reportData);
      await expect(report2.save()).rejects.toThrow();
    });

    test('should validate status enum', async () => {
      const reportWithInvalidStatus = new InspectionReport({
        inspectionRequestId: new mongoose.Types.ObjectId(),
        status: 'InvalidStatus'
      });

      await expect(reportWithInvalidStatus.save()).rejects.toThrow();
    });
  });
});
