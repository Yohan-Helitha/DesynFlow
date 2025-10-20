import Project from '../model/project.model.js';
import Team from '../model/team.model.js';
import User from '../../auth/model/user.model.js';

export const createProject = async (req, res) => {
    
    // Enhanced project creation with validation
    try {
        console.log('Create project request body:', req.body);

        // Simple project creation with inspection report
        const { projectName, clientId, assignedTeamId, startDate, dueDate, inspectionReportPath } = req.body;

        // Basic validation (assignedTeamId is optional)
        if (!projectName || !clientId || !startDate || !dueDate) {
            return res.status(400).json({ error: 'Project name, client, start date, and due date are required' });
        }

        // Look up client by email if clientId is an email
        let actualClientId = clientId;
        if (typeof clientId === 'string' && clientId.includes('@')) {
            const client = await User.findOne({ email: clientId, role: 'client' });
            if (!client) {
                return res.status(400).json({ error: 'Client not found with the provided email' });
            }
            actualClientId = client._id;
        }

        // Team assignment and status logic
        let status = 'On Hold';
        if (assignedTeamId) {
            const team = await Team.findById(assignedTeamId);
            if (!team || !team.active) {
                return res.status(400).json({ error: 'Selected team is not available' });
            }
            status = 'Active'; // Set to Active only if team is assigned and available
        }

        // Create project data
        const projectData = {
            projectName,
            clientId: actualClientId,
            status,
            startDate: new Date(startDate),
            dueDate: new Date(dueDate),
            timeline: [
                { name: 'Start', date: new Date(startDate), description: 'Project start date' },
                { name: 'Due', date: new Date(dueDate), description: 'Project due date' }
            ]
        };

        // Only add assignedTeamId if a team is actually assigned
        if (assignedTeamId) {
            projectData.assignedTeamId = assignedTeamId;
        }


        // Add inspection report if provided
        if (req.body.inspectionReportPath && req.body.inspectionReportOriginalName) {
            projectData.attachments = [{
                filename: req.body.inspectionReportPath.split('/').pop(), // Extract filename from path
                originalName: req.body.inspectionReportOriginalName,
                path: req.body.inspectionReportPath,
                uploadDate: new Date()
            }];
        } else if (inspectionReportPath) {
            // Fallback for simple path storage
            projectData.attachments = [inspectionReportPath];
        }

        const newProject = new Project(projectData);

        await newProject.save();
        res.status(201).json(newProject);
    } catch (error) {
        console.error('Project creation error:', error);
        res.status(500).json({ message: 'Error creating project', error: error.message });
    }

};

export const getProjects = async (req, res) => {

    try{

        const projects = await Project.find().populate('assignedTeamId milestones clientId');
        res.json(projects);

    }catch(error){

        res.status(500).json({ message: 'Error getting all projects', error: error.message });

    }

};

export const getProjectById = async (req, res) => {

    try{

        const{ id } = req.params;
        let project = await Project.findById(id).populate('assignedTeamId milestones clientId');
        if(!project){
            return res.status(404).json({ message: 'Project not found' });
        }

        // If project has an assigned team, populate the team members with user details
        if (project.assignedTeamId && project.assignedTeamId.members) {
            const User = (await import('../../auth/model/user.model.js')).default;
            
            console.log('Original team members:', project.assignedTeamId.members);
            
            const populatedMembers = await Promise.all(
                project.assignedTeamId.members.map(async (member) => {
                    console.log('Processing member:', member);
                    console.log('Member userId:', member.userId);
                    const user = await User.findById(member.userId, 'username email role');
                    console.log('Found user:', user);
                    return {
                        userId: user,
                        role: member.role,
                        availability: member.availability,
                        workload: member.workload
                    };
                })
            );

            console.log('Populated members:', populatedMembers);

            // Create a new team object with populated members
            const teamData = project.assignedTeamId.toJSON();
            teamData.members = populatedMembers;
            
            // Update the project data
            const projectData = project.toJSON();
            projectData.assignedTeamId = teamData;
            
            return res.json(projectData);
        }

        res.json(project);

    }catch(error){

        res.status(500).json({ message: 'Error getting project by ID', error: error.message });

    }

};

export const updateProject = async (req, res) => {

    try{

        const{ id } = req.params;
        const updateData = req.body;

        // Look up client by email if clientId is an email
        if (updateData.clientId && typeof updateData.clientId === 'string' && updateData.clientId.includes('@')) {
            const client = await User.findOne({ email: updateData.clientId, role: 'client' });
            if (!client) {
                return res.status(400).json({ error: 'Client not found with the provided email' });
            }
            updateData.clientId = client._id;
        }

        if(updateData.assignedTeamId && updateData.assignedTeamId.trim() !== ''){
            updateData.status = 'Active'; //if team assigned, set status to Active
        }else{
            updateData.status = 'On Hold'; //if no team assigned, set status to On Hold
            updateData.assignedTeamId = null; // Explicitly remove team assignment
        }

        // Handle attachment updates if provided
        if (req.body.inspectionReportPath && req.body.inspectionReportOriginalName) {
            const newAttachment = {
                filename: req.body.inspectionReportPath.split('/').pop(),
                originalName: req.body.inspectionReportOriginalName,
                path: req.body.inspectionReportPath,
                uploadDate: new Date()
            };
            
            // Get existing project to preserve existing attachments
            const existingProject = await Project.findById(id);
            if (existingProject) {
                updateData.attachments = existingProject.attachments || [];
                updateData.attachments.push(newAttachment);
            } else {
                updateData.attachments = [newAttachment];
            }
        }

        const updatedProject = await Project.findByIdAndUpdate(id, updateData, { new: true });
        if( !updatedProject ){
            return res.status(404).json({ message: 'Project not found' });
        }
        res.json(updatedProject);

    }catch(error){

        res.status(500).json({ message: 'Error updating project', error: error.message });

    }

};

export const deleteProject = async (req, res) => {

    try {
        
        const { id } = req.params;
        const deleteProject = await Project.findByIdAndDelete(id);
        
        if (!deleteProject) {
            return res.status(404).json({ message: 'Project not found' });
        }
        
        res.json({ message: 'Project deleted successfully' });


    } catch (error) {
        
        res.status(500).json({ message: 'Error deleting project', error: error.message });
    }


};
