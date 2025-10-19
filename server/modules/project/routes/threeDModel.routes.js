import express from 'express';
import multer from 'multer';
import path from 'path';
import { upload3DModel, delete3DModel } from '../controller/threeDModel.controller.js';
import { authMiddleware } from '../../auth/middleware/authMiddleware.js';
import roleMiddleware from '../../auth/middleware/roleMiddleware.js';

const router = express.Router();

// Ensure temp upload folder exists
import fs from 'fs';
const tempDir = 'uploads/temp';
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Configure multer temporary storage; controller will move/rename file
const tempStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});

const upload = multer({ storage: tempStorage, limits: { fileSize: 200 * 1024 * 1024 } }); // 200MB

// Team leader only for add/delete
// Mounted at /api/project -> routes should be relative to that base
router.post('/:projectId/3dmodel', authMiddleware, roleMiddleware(['team leader']), upload.single('file'), upload3DModel);
router.delete('/:projectId/3dmodel', authMiddleware, roleMiddleware(['team leader']), delete3DModel);

export default router;
