import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Project from '../model/project.model.js';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Allowed extensions and mime types
const ALLOWED_EXT = ['.glb', '.gltf'];

export const upload3DModel = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    if (!req.file) return res.status(400).json({ message: 'File is required' });

    const { designAccessRestriction } = req.body;
    if (typeof designAccessRestriction === 'undefined') return res.status(400).json({ message: 'designAccessRestriction is required' });

    const ext = path.extname(req.file.originalname).toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) {
      // remove uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Only .glb and .gltf files are allowed' });
    }

    // Move/rename file to a safer name
    const newName = `${uuidv4()}${ext}`;
    const destDir = path.join(process.cwd(), 'uploads', '3dmodels', projectId);
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    const destPath = path.join(destDir, newName);
    fs.renameSync(req.file.path, destPath);

    // Construct public URL path
    const publicPath = `/uploads/3dmodels/${projectId}/${newName}`;

    // Update project model
    const project = await Project.findById(projectId);
    if (!project) {
      // cleanup
      fs.unlinkSync(destPath);
      return res.status(404).json({ message: 'Project not found' });
    }

    project.finalDesign3DUrl = publicPath;
    project.designAccessRestriction = designAccessRestriction === 'true' || designAccessRestriction === true;
    await project.save();

    return res.json({ success: true, fileUrl: publicPath, designAccessRestriction: project.designAccessRestriction });
  } catch (err) {
    console.error('upload3DModel error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const delete3DModel = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (!project.finalDesign3DUrl) return res.status(400).json({ message: 'No 3D model to delete' });

    const filePath = path.join(process.cwd(), project.finalDesign3DUrl.replace(/\//g, path.sep));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    project.finalDesign3DUrl = undefined;
    project.designAccessRestriction = false;
    await project.save();

    return res.json({ success: true });
  } catch (err) {
    console.error('delete3DModel error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
