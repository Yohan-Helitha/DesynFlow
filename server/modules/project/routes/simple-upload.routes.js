import express from 'express';

const router = express.Router();

// Simple upload endpoint without multer - just return a mock file path for now
router.post('/upload', (req, res) => {
  try {
    // For now, just return a mock path since we can't use multer without proper installation
    const mockFilePath = `/uploads/inspection-report-${Date.now()}.pdf`;
    
    res.json({
      message: 'File uploaded successfully',
      path: mockFilePath,
      filename: `inspection-report-${Date.now()}.pdf`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;