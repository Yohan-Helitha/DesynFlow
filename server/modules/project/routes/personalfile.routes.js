import express from 'express';
import multer from 'multer';
import {
  uploadPersonalFile,
  getPersonalFiles,
  getPersonalFolders,
  createPersonalFolder,
  deletePersonalFile,
  downloadPersonalFile,
  updatePersonalFile,
  searchPersonalFiles
} from '../controller/personalfile.controller.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Personal file routes
router.post('/personal-files/upload', upload.single('file'), uploadPersonalFile);
router.get('/personal-files/:userId', getPersonalFiles);
router.delete('/personal-files/:fileId', deletePersonalFile);
router.get('/personal-files/:fileId/download', downloadPersonalFile);
router.put('/personal-files/:fileId', updatePersonalFile);
router.get('/personal-files/:userId/search', searchPersonalFiles);

// Personal folder routes
router.get('/personal-folders/:userId', getPersonalFolders);
router.post('/personal-folders', createPersonalFolder);

export default router;