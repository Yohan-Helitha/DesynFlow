import multer from 'multer';
import path from 'path';

// Set up storage for inspection report PDFs
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join('uploads/inspection_reports'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

const upload = multer({ storage, fileFilter });

export default upload;
