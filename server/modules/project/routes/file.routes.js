import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsPath = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

// Simple file upload without multer
router.post('/upload', (req, res) => {
  try {
    let body = '';
    let boundary = '';
    let filename = '';
    let fileData = Buffer.alloc(0);
    
    // Get boundary from content-type header
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return res.status(400).json({ error: 'Content-Type must be multipart/form-data' });
    }
    
    boundary = '--' + contentType.split('boundary=')[1];
    
    req.on('data', chunk => {
      body += chunk.toString('binary');
    });
    
    req.on('end', () => {
      try {
        // Parse multipart data
        const parts = body.split(boundary);
        
        for (let part of parts) {
          if (part.includes('filename=')) {
            // Extract filename
            const filenameMatch = part.match(/filename="([^"]+)"/);
            if (filenameMatch) {
              const originalName = filenameMatch[1];
              filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(originalName)}`;
              
              // Check file type
              const ext = path.extname(originalName).toLowerCase();
              const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.doc', '.docx', '.txt'];
              if (!allowedTypes.includes(ext)) {
                return res.status(400).json({ error: 'File type not allowed' });
              }
              
              // Extract file data (after double CRLF)
              const dataStart = part.indexOf('\r\n\r\n') + 4;
              const dataEnd = part.lastIndexOf('\r\n');
              if (dataStart > 3 && dataEnd > dataStart) {
                const binaryData = part.substring(dataStart, dataEnd);
                fileData = Buffer.from(binaryData, 'binary');
                
                // Check file size (10MB limit)
                if (fileData.length > 10 * 1024 * 1024) {
                  return res.status(400).json({ error: 'File too large (max 10MB)' });
                }
                
                // Save file
                const filepath = path.join(uploadsPath, filename);
                fs.writeFileSync(filepath, fileData);
                
                // Return success response
                return res.json({
                  message: 'File uploaded successfully',
                  path: `/api/uploads/${filename}`,
                  filename: filename,
                  originalName: originalName,
                  size: fileData.length
                });
              }
            }
          }
        }
        
        return res.status(400).json({ error: 'No valid file found in request' });
        
      } catch (parseError) {
        console.error('Parse error:', parseError);
        return res.status(500).json({ error: 'Failed to parse upload data' });
      }
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Download/serve file
router.get('/uploads/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../../../uploads', filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Get file stats
    const stats = fs.statSync(filePath);
    
    // Set appropriate headers
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', stats.size);
    
    // Determine content type based on file extension
    const ext = path.extname(filename).toLowerCase();
    const contentTypes = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.txt': 'text/plain'
    };
    
    const contentType = contentTypes[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get file info
router.get('/file-info/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../../../uploads', filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const stats = fs.statSync(filePath);
    const fileInfo = {
      filename: filename,
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      exists: true
    };

    res.json(fileInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List all files in uploads directory
router.get('/files', (req, res) => {
  try {
    const uploadsPath = path.join(__dirname, '../../../uploads');
    
    if (!fs.existsSync(uploadsPath)) {
      return res.json({ files: [] });
    }

    const files = fs.readdirSync(uploadsPath).map(filename => {
      const filePath = path.join(uploadsPath, filename);
      const stats = fs.statSync(filePath);
      
      return {
        filename: filename,
        path: `/uploads/${filename}`,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime
      };
    });

    res.json({ files });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;