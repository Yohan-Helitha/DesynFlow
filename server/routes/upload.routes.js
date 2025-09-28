import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Simple file upload endpoint
router.post('/upload', express.raw({ type: 'multipart/form-data', limit: '10mb' }), (req, res) => {
  try {
    console.log('Upload request received');
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Body length:', req.body ? req.body.length : 'No body');
    
    const boundary = req.headers['content-type'].split('boundary=')[1];
    if (!boundary) {
      console.log('No boundary found');
      return res.status(400).json({ error: 'No boundary found in multipart data' });
    }
    
    console.log('Boundary found:', boundary);

    const body = req.body.toString('binary');
    const parts = body.split('--' + boundary);
    
    for (const part of parts) {
      if (part.includes('filename=')) {
        // Extract filename
        const filenameMatch = part.match(/filename="([^"]+)"/);
        if (!filenameMatch) continue;
        
        const originalName = filenameMatch[1];
        const ext = path.extname(originalName).toLowerCase();
        
        // Validate file type
        if (!['.pdf', '.doc', '.docx'].includes(ext)) {
          return res.status(400).json({ error: 'Only PDF and DOC files are allowed' });
        }
        
        // Generate unique filename
        const timestamp = Date.now();
        const filename = `${timestamp}-${originalName}`;
        
        // Extract file data
        const startMarker = '\r\n\r\n';
        const endMarker = '\r\n--';
        const startIndex = part.indexOf(startMarker);
        const endIndex = part.lastIndexOf(endMarker);
        
        if (startIndex === -1 || endIndex === -1) continue;
        
        const fileData = part.substring(startIndex + startMarker.length, endIndex);
        const buffer = Buffer.from(fileData, 'binary');
        
        // Save file
        const filepath = path.join(uploadsDir, filename);
        fs.writeFileSync(filepath, buffer);
        
        return res.json({
          success: true,
          message: 'File uploaded successfully',
          filename: filename,
          originalName: originalName,
          path: `/api/uploads/${filename}`,
          size: buffer.length
        });
      }
    }
    
    return res.status(400).json({ error: 'No file found in request' });
    
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Upload failed: ' + error.message });
  }
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

export default router;