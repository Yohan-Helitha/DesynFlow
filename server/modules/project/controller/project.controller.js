import Project from '../model/project.model.js';
import Team from '../model/team.model.js';

export const createProject = async (req, res) => {
    
    // Enhanced project creation with validation
    try {
        console.log('Create project request body:', req.body);

        // Simple project creation with inspection report
        const { projectName, clientId, assignedTeamId, startDate, dueDate, inspectionReportPath } = req.body;

        // Basic validation
        if (!projectName || !clientId || !assignedTeamId || !startDate || !dueDate) {
            return res.status(400).json({ error: 'All fields are required' });
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
            clientId,
            assignedTeamId,
            status,
            startDate: new Date(startDate),
            dueDate: new Date(dueDate),
            timeline: [
                { name: 'Start', date: new Date(startDate), description: 'Project start date' },
                { name: 'Due', date: new Date(dueDate), description: 'Project due date' }
            ]
        };


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

        const projects = await Project.find().populate('assignedTeamId milestones');
        res.json(projects);

    }catch(error){

        res.status(500).json({ message: 'Error getting all projects', error: error.message });

    }

};

export const getProjectById = async (req, res) => {

    try{

        const{ id } = req.params;
        const project = await Project.findById(id).populate('assignedTeamId milestones');
        if(!project){
            return res.status(404).json({ message: 'Project not found' });
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

        if(updateData.assignedTeamId){
            updateData.status = 'Active'; //if team assigned, set status to Active
        }else{
            updateData.status = 'On Hold'; //if no team assigned, set status to On Hold
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
