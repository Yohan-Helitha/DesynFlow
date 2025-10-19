import PersonalFile from '../model/personalfile.model.js';
import PersonalFolder from '../model/personalfolder.model.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Upload personal file
export const uploadPersonalFileService = async (fileData, file) => {
  try {
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '../../../uploads/personal');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}-${file.originalname}`;
    const filePath = path.join(uploadsDir, uniqueFileName);

    // Save file to disk
    fs.writeFileSync(filePath, file.buffer);

    // Create database record
    const personalFile = new PersonalFile({
      originalName: file.originalname,
      fileName: uniqueFileName,
      filePath: filePath,
      fileSize: file.size,
      mimeType: file.mimetype,
      uploadedBy: fileData.uploadedBy,
      folderId: fileData.folderId || null,
      tags: fileData.tags || [],
      description: fileData.description || '',
      relatedProjectId: fileData.relatedProjectId || null,
      relatedTaskId: fileData.relatedTaskId || null
    });

    await personalFile.save();
    return personalFile;
  } catch (error) {
    console.error('Error in uploadPersonalFileService:', error);
    throw error;
  }
};

// Get personal files for user
export const getPersonalFilesService = async (userId, folderId = null) => {
  try {
    const query = { 
      uploadedBy: userId, 
      isDeleted: false 
    };
    
    if (folderId) {
      query.folderId = folderId;
    } else {
      query.folderId = null; // Only root level files
    }

    const files = await PersonalFile.find(query)
      .populate('folderId', 'name')
      .populate('relatedProjectId', 'projectName')
      .populate('relatedTaskId', 'name')
      .sort({ uploadedAt: -1 });

    return files;
  } catch (error) {
    console.error('Error in getPersonalFilesService:', error);
    throw error;
  }
};

// Get personal folders for user
export const getPersonalFoldersService = async (userId) => {
  try {
    const folders = await PersonalFolder.find({ 
      createdBy: userId, 
      isDeleted: false 
    })
    .populate('relatedProjectId', 'projectName')
    .sort({ createdAt: -1 });

    return folders;
  } catch (error) {
    console.error('Error in getPersonalFoldersService:', error);
    throw error;
  }
};

// Create personal folder
export const createPersonalFolderService = async (folderData) => {
  try {
    const folder = new PersonalFolder(folderData);
    await folder.save();
    return folder;
  } catch (error) {
    console.error('Error in createPersonalFolderService:', error);
    throw error;
  }
};

// Delete personal file
export const deletePersonalFileService = async (fileId, userId) => {
  try {
    const file = await PersonalFile.findOne({ _id: fileId, uploadedBy: userId });
    
    if (!file) {
      return { success: false, message: 'File not found or unauthorized' };
    }

    // Mark as deleted instead of hard delete
    file.isDeleted = true;
    file.deletedAt = new Date();
    await file.save();

    // Optionally delete physical file
    try {
      if (fs.existsSync(file.filePath)) {
        fs.unlinkSync(file.filePath);
      }
    } catch (fsError) {
      console.warn('Could not delete physical file:', fsError);
    }

    return { success: true, message: 'File deleted successfully' };
  } catch (error) {
    console.error('Error in deletePersonalFileService:', error);
    throw error;
  }
};

// Download personal file
export const downloadPersonalFileService = async (fileId, userId) => {
  try {
    const file = await PersonalFile.findOne({ 
      _id: fileId, 
      uploadedBy: userId, 
      isDeleted: false 
    });
    
    if (!file) {
      return { success: false, message: 'File not found or unauthorized' };
    }

    if (!fs.existsSync(file.filePath)) {
      return { success: false, message: 'Physical file not found' };
    }

    return { 
      success: true, 
      file: file,
      filePath: file.filePath 
    };
  } catch (error) {
    console.error('Error in downloadPersonalFileService:', error);
    throw error;
  }
};

// Update file metadata
export const updatePersonalFileService = async (fileId, userId, updateData) => {
  try {
    const file = await PersonalFile.findOneAndUpdate(
      { _id: fileId, uploadedBy: userId, isDeleted: false },
      updateData,
      { new: true }
    );

    if (!file) {
      return { success: false, message: 'File not found or unauthorized' };
    }

    return { success: true, file: file };
  } catch (error) {
    console.error('Error in updatePersonalFileService:', error);
    throw error;
  }
};

// Search personal files
export const searchPersonalFilesService = async (userId, searchTerm, filters = {}) => {
  try {
    let query = { 
      uploadedBy: userId, 
      isDeleted: false 
    };

    // Add search term
    if (searchTerm) {
      query.$or = [
        { originalName: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { tags: { $in: [new RegExp(searchTerm, 'i')] } }
      ];
    }

    // Add filters
    if (filters.mimeType) {
      query.mimeType = { $regex: filters.mimeType, $options: 'i' };
    }
    if (filters.folderId) {
      query.folderId = filters.folderId;
    }
    if (filters.projectId) {
      query.relatedProjectId = filters.projectId;
    }

    const files = await PersonalFile.find(query)
      .populate('folderId', 'name')
      .populate('relatedProjectId', 'projectName')
      .populate('relatedTaskId', 'name')
      .sort({ uploadedAt: -1 });

    return files;
  } catch (error) {
    console.error('Error in searchPersonalFilesService:', error);
    throw error;
  }
};