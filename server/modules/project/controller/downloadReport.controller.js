import InspectionReport from '../../user/model/report.model.js';
import path from 'path';
import fs from 'fs';

// Download inspection report PDF by inspectionRequestId
export const downloadInspectionReport = async (req, res) => {

  try {

    const { inspectionRequestId } = req.params;
    const report = await InspectionReport.findOne({ inspectionRequestId });

    if (!report || !report.attachments || report.attachments.length === 0) {
      return res.status(404).json({ message: 'Report or attachment not found' });
    }

    // For simplicity, download the first attachment
    const filePath = report.attachments[0];

    // If stored as URL, redirect; if stored as local path, send file
    if (filePath.startsWith('http')) {

      return res.redirect(filePath);

    } else {

      const absolutePath = path.resolve(filePath);

      if (!fs.existsSync(absolutePath)) {

        return res.status(404).json({ message: 'File not found on server' });

      }

      res.download(absolutePath);
    }
  } catch (error) {

    res.status(500).json({ message: 'Error downloading report', error: error.message });
    
  }

};
