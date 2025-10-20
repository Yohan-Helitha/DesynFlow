import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import inspectionPaymentUpload from '../modules/finance/middleware/inspectionPaymentUpload.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// File upload endpoint using multer
router.post('/upload', (req, res) => {
  inspectionPaymentUpload.single('file')(req, res, (err) => {
    try {
      console.log('Upload request received');
      
      if (err) {
        console.error('Multer error:', err);
        return res.status(400).json({ error: err.message });
      }
      
      console.log('File:', req.file);
      
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Return the file path for the frontend
      const filePath = `/uploads/inspection_payments/${req.file.filename}`;
      
      return res.json({
        success: true,
        message: 'File uploaded successfully',
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: filePath,
        size: req.file.size
      });
      
    } catch (error) {
      console.error('Upload error:', error);
      return res.status(500).json({ error: 'Upload failed: ' + error.message });
    }
  });
});

// Serve uploaded files
router.get('/uploads/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filepath = path.join(uploadsDir, filename);
    
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.sendFile(filepath);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve inspection payment files specifically
router.get('/uploads/inspection_payments/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filepath = path.join(__dirname, '../../uploads/inspection_payments', filename);
    
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.sendFile(filepath);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;