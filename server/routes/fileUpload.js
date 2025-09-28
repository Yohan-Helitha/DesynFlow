import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp_originalname
    const uniqueName = `${Date.now()}_${file.originalname}`;
    cb(null, uniqueName);
  }
});

// File filter to accept only certain file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|jpg|jpeg|png|zip|rar/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, DOCX, JPG, PNG, ZIP, RAR files are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter
});

// Upload single file
router.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileInfo = {
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: `/uploads/${req.file.filename}`,
      size: req.file.size,
      uploadDate: new Date()
    };

    res.status(200).json({
      message: 'File uploaded successfully',
      file: fileInfo
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload multiple files
router.post('/upload-multiple', upload.array('files', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const filesInfo = req.files.map(file => ({
      originalName: file.originalname,
      filename: file.filename,
      path: `/uploads/${file.filename}`,
      size: file.size,
      uploadDate: new Date()
    }));

    res.status(200).json({
      message: 'Files uploaded successfully',
      files: filesInfo
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Download/serve files
router.get('/uploads/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filepath = path.join(uploadsDir, filename);

    // Check if file exists
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Set appropriate headers
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Send file
    res.sendFile(filepath);
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
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime
    };

    res.json(fileInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List all uploaded files
router.get('/files', (req, res) => {
  try {
    const files = fs.readdirSync(uploadsDir);
    const filesInfo = files.map(filename => {
      const filepath = path.join(uploadsDir, filename);
      const stats = fs.statSync(filepath);
      return {
        filename: filename,
        path: `/uploads/${filename}`,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime
      };
    });

    res.json(filesInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;