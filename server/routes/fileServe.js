import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get uploads directory path
const uploadsDir = path.join(__dirname, '../uploads');

// Serve uploaded files for download
router.get('/uploads/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filepath = path.join(uploadsDir, filename);

    // Check if file exists
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Set appropriate headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Send file
    res.sendFile(filepath);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List all uploaded files
router.get('/files', (req, res) => {
  try {
    if (!fs.existsSync(uploadsDir)) {
      return res.json([]);
    }

    const files = fs.readdirSync(uploadsDir);
    const filesInfo = files.map(filename => {
      const filepath = path.join(uploadsDir, filename);
      const stats = fs.statSync(filepath);
      return {
        filename: filename,
        displayName: filename.replace(/\.[^/.]+$/, "").replace(/_/g, ' '),
        path: `/api/uploads/${filename}`,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        extension: path.extname(filename).slice(1).toUpperCase()
      };
    });

    res.json(filesInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get file info
router.get('/file-info/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filepath = path.join(uploadsDir, filename);

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const stats = fs.statSync(filepath);
    const fileInfo = {
      filename: filename,
      displayName: filename.replace(/\.[^/.]+$/, "").replace(/_/g, ' '),
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      extension: path.extname(filename).slice(1).toUpperCase()
    };

    res.json(fileInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;