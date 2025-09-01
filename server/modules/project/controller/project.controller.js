import Project from '../model/project.model.js';
import Team from '../model/team.model.js';

export const createProject = async (req, res) => {
    
    //creating new project
    try {
        console.log('Create project request body:', req.body);

        const { projectName, clientId, inspectionId } = req.body;

        //find available team
        const availableTeam = await Team.findOne({ active: true });
        let status = "On Hold";
        let assignedTeamId = null;

        if(availableTeam) {
            status = 'Active';
            assignedTeamId = availableTeam._id;
        }

        const newProject = new Project({

            projectName,
            clientId,
            inspectionId,
            assignedTeamId,
            status

        });

        await newProject.save();
        res.status(201).json(newProject); //201 is standard HTTP status code for "Created"; for adding new resource successfully.  

    }catch(error){
        console.error('Project creation error:', error);
        res.status(500).json({ message: 'Error creating project', error: error.message }); //standard HTTP status code for Internal error
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
