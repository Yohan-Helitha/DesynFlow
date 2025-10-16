import {
  uploadPersonalFileService,
  getPersonalFilesService,
  getPersonalFoldersService,
  createPersonalFolderService,
  deletePersonalFileService,
  downloadPersonalFileService,
  updatePersonalFileService,
  searchPersonalFilesService
} from '../service/personalfile.service.js';
import fs from 'fs';

// Upload personal file
export const uploadPersonalFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileData = {
      uploadedBy: req.body.uploadedBy,
      folderId: req.body.folderId || null,
      tags: req.body.tags ? req.body.tags.split(',') : [],
      description: req.body.description || '',
      relatedProjectId: req.body.relatedProjectId || null,
      relatedTaskId: req.body.relatedTaskId || null
    };

    const uploadedFile = await uploadPersonalFileService(fileData, req.file);
    res.status(201).json(uploadedFile);
  } catch (error) {
    console.error('Error uploading personal file:', error);
    res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
};

// Get personal files for user
export const getPersonalFiles = async (req, res) => {
  try {
    const { userId } = req.params;
    const { folderId } = req.query;

    const files = await getPersonalFilesService(userId, folderId);
    res.json(files);
  } catch (error) {
    console.error('Error fetching personal files:', error);
    res.status(500).json({ message: 'Error fetching files', error: error.message });
  }
};

// Get personal folders for user
export const getPersonalFolders = async (req, res) => {
  try {
    const { userId } = req.params;
    const folders = await getPersonalFoldersService(userId);
    res.json(folders);
  } catch (error) {
    console.error('Error fetching personal folders:', error);
    res.status(500).json({ message: 'Error fetching folders', error: error.message });
  }
};

// Create personal folder
export const createPersonalFolder = async (req, res) => {
  try {
    const { name, description, createdBy, relatedProjectId, parentFolder, color } = req.body;

    if (!name || !createdBy) {
      return res.status(400).json({ message: 'Name and creator are required' });
    }

    const folderData = {
      name,
      description: description || '',
      createdBy,
      relatedProjectId: relatedProjectId || null,
      parentFolder: parentFolder || null,
      color: color || '#8B4513'
    };

    const folder = await createPersonalFolderService(folderData);
    res.status(201).json(folder);
  } catch (error) {
    console.error('Error creating personal folder:', error);
    res.status(500).json({ message: 'Error creating folder', error: error.message });
  }
};

// Delete personal file
export const deletePersonalFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const result = await deletePersonalFileService(fileId, userId);
    
    if (!result.success) {
      return res.status(404).json({ message: result.message });
    }

    res.json({ message: result.message });
  } catch (error) {
    console.error('Error deleting personal file:', error);
    res.status(500).json({ message: 'Error deleting file', error: error.message });
  }
};

// Download personal file
export const downloadPersonalFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const result = await downloadPersonalFileService(fileId, userId);
    
    if (!result.success) {
      return res.status(404).json({ message: result.message });
    }

    const file = result.file;
    
    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Length', file.fileSize);

    // Stream the file
    const fileStream = fs.createReadStream(result.filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading personal file:', error);
    res.status(500).json({ message: 'Error downloading file', error: error.message });
  }
};

// Update personal file metadata
export const updatePersonalFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { userId, ...updateData } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const result = await updatePersonalFileService(fileId, userId, updateData);
    
    if (!result.success) {
      return res.status(404).json({ message: result.message });
    }

    res.json(result.file);
  } catch (error) {
    console.error('Error updating personal file:', error);
    res.status(500).json({ message: 'Error updating file', error: error.message });
  }
};

// Search personal files
export const searchPersonalFiles = async (req, res) => {
  try {
    const { userId } = req.params;
    const { search, mimeType, folderId, projectId } = req.query;

    const filters = {};
    if (mimeType) filters.mimeType = mimeType;
    if (folderId) filters.folderId = folderId;
    if (projectId) filters.projectId = projectId;

    const files = await searchPersonalFilesService(userId, search, filters);
    res.json(files);
  } catch (error) {
    console.error('Error searching personal files:', error);
    res.status(500).json({ message: 'Error searching files', error: error.message });
  }
};