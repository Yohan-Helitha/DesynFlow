import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { setupTestDB, teardownTestDB } from './testHelpers.js';
import {
  createProject,
  getProjectsService,
  getProjectByIdService,
  updateProjectService,
  deleteProjectService
} from '../modules/project/service/project.service.js';
import {
  createTaskService,
  getTasksByProjectService,
  updateTaskStatusService
} from '../modules/project/service/task.service.js';
import {
  getTeamsService,
  assignTeamLeaderService,
  updateTeamMemberRoleService,
  updateTeamMemberAvailabilityService
} from '../modules/project/service/team.service.js';
import Team from '../modules/project/model/team.model.js';
import Project from '../modules/project/model/project.model.js';
import Task from '../modules/project/model/task.model.js';
import mongoose from 'mongoose';

describe('Service Layer Tests', () => {
  
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  describe('Project Service', () => {
    let testTeam;

    beforeEach(async () => {
      await mongoose.connection.db.dropDatabase();
      
      testTeam = new Team({
        teamId: new mongoose.Types.ObjectId(),
        teamName: 'Service Test Team',
        active: true,
        members: []
      });
      await testTeam.save();
    });

    test('should create project with available team', async () => {
      const clientId = new mongoose.Types.ObjectId();
      const inspectionId = new mongoose.Types.ObjectId();
      
      const project = await createProject('Service Test Project', clientId, inspectionId);
      
      expect(project.projectName).toBe('Service Test Project');
      expect(project.status).toBe('Active');
      expect(project.assignedTeamId.toString()).toBe(testTeam._id.toString());
    });

    test('should create project on hold when no team available', async () => {
      // Make team inactive
      await Team.findByIdAndUpdate(testTeam._id, { active: false });
      
      const clientId = new mongoose.Types.ObjectId();
      const inspectionId = new mongoose.Types.ObjectId();
      
      const project = await createProject('No Team Project', clientId, inspectionId);
      
      expect(project.status).toBe('On Hold');
      expect(project.assignedTeamId).toBeNull();
    });

    test('should get all projects', async () => {
      const project1 = new Project({
        projectId: new mongoose.Types.ObjectId(),
        projectName: 'Project 1',
        clientId: new mongoose.Types.ObjectId()
      });
      const project2 = new Project({
        projectId: new mongoose.Types.ObjectId(),
        projectName: 'Project 2',
        clientId: new mongoose.Types.ObjectId()
      });
      
      await project1.save();
      await project2.save();
      
      const projects = await getProjectsService();
      expect(projects.length).toBe(2);
    });

    test('should get project by ID', async () => {
      const project = new Project({
        projectId: new mongoose.Types.ObjectId(),
        projectName: 'Single Project',
        clientId: new mongoose.Types.ObjectId()
      });
      await project.save();
      
      const foundProject = await getProjectByIdService(project._id);
      expect(foundProject._id.toString()).toBe(project._id.toString());
    });

    test('should update project and set status based on team assignment', async () => {
      const project = new Project({
        projectId: new mongoose.Types.ObjectId(),
        projectName: 'Update Test',
        clientId: new mongoose.Types.ObjectId(),
        status: 'On Hold'
      });
      await project.save();
      
      const updateData = { assignedTeamId: testTeam._id };
      const updatedProject = await updateProjectService(project._id, updateData);
      
      expect(updatedProject.status).toBe('Active');
      expect(updatedProject.assignedTeamId.toString()).toBe(testTeam._id.toString());
    });

    test('should delete project', async () => {
      const project = new Project({
        projectId: new mongoose.Types.ObjectId(),
        projectName: 'Delete Test',
        clientId: new mongoose.Types.ObjectId()
      });
      await project.save();
      
      const deletedProject = await deleteProjectService(project._id);
      expect(deletedProject._id.toString()).toBe(project._id.toString());
      
      const checkDeleted = await Project.findById(project._id);
      expect(checkDeleted).toBeNull();
    });
  });

  describe('Task Service', () => {
    let testProject;

    beforeEach(async () => {
      testProject = new Project({
        projectId: new mongoose.Types.ObjectId(),
        projectName: 'Task Service Test',
        clientId: new mongoose.Types.ObjectId()
      });
      await testProject.save();
    });

    test('should create task', async () => {
      const taskData = {
        projectId: testProject._id,
        name: 'Service Task Test',
        assignedTo: new mongoose.Types.ObjectId(),
        weight: 3
      };

      const task = await createTaskService(taskData);
      expect(task.name).toBe('Service Task Test');
      expect(task.weight).toBe(3);
    });

    test('should get tasks by project', async () => {
      const task1 = new Task({
        projectId: testProject._id,
        name: 'Task 1'
      });
      const task2 = new Task({
        projectId: testProject._id,
        name: 'Task 2'
      });
      
      await task1.save();
      await task2.save();
      
      const tasks = await getTasksByProjectService(testProject._id);
      expect(tasks.length).toBe(2);
    });

    test('should update task status with completion date', async () => {
      const task = new Task({
        projectId: testProject._id,
        name: 'Status Update Task',
        status: 'Pending'
      });
      await task.save();
      
      const updatedTask = await updateTaskStatusService(task._id, 'Done', 100);
      expect(updatedTask.status).toBe('Done');
      expect(updatedTask.progressPercentage).toBe(100);
      expect(updatedTask.completedAt).toBeDefined();
    });
  });

  describe('Team Service', () => {
    let testTeam;
    let testUser1;
    let testUser2;

    beforeEach(async () => {
      testUser1 = new mongoose.Types.ObjectId();
      testUser2 = new mongoose.Types.ObjectId();

      testTeam = new Team({
        teamId: new mongoose.Types.ObjectId(),
        teamName: 'Service Test Team',
        leaderId: testUser1,
        members: [
          {
            userId: testUser1,
            role: 'Leader',
            availability: 'Available',
            workload: 50
          },
          {
            userId: testUser2,
            role: 'Member',
            availability: 'Available',
            workload: 30
          }
        ]
      });
      await testTeam.save();
    });

    test('should get all teams', async () => {
      const teams = await getTeamsService();
      expect(teams.length).toBeGreaterThan(0);
      expect(teams[0].teamName).toBe('Service Test Team');
    });

    test('should assign team leader', async () => {
      const newLeader = new mongoose.Types.ObjectId();
      const updatedTeam = await assignTeamLeaderService(testTeam._id, newLeader);
      
      expect(updatedTeam.leaderId.toString()).toBe(newLeader.toString());
    });

    test('should update member role', async () => {
      const updatedTeam = await updateTeamMemberRoleService(testTeam._id, testUser2.toString(), 'Senior Designer');
      
      const member = updatedTeam.members.find(m => m.userId.toString() === testUser2.toString());
      expect(member.role).toBe('Senior Designer');
    });

    test('should update member availability and workload', async () => {
      const updatedTeam = await updateTeamMemberAvailabilityService(
        testTeam._id, 
        testUser1.toString(), 
        'Busy', 
        90
      );
      
      const member = updatedTeam.members.find(m => m.userId.toString() === testUser1.toString());
      expect(member.availability).toBe('Busy');
      expect(member.workload).toBe(90);
    });

    test('should return null for non-existent team', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const result = await assignTeamLeaderService(fakeId, new mongoose.Types.ObjectId());
      expect(result).toBeNull();
    });
  });
});
