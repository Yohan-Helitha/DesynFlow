import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads', 'inspection_payments');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Set storage engine for inspection payment receipt uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/inspection_payments/'); // Folder where inspection payment receipts will be saved
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'inspection-receipt-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter (accept documents and images)
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || 
                    file.mimetype === 'application/pdf' ||
                    file.mimetype === 'application/msword' ||
                    file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only images (JPEG, JPG, PNG, GIF, WEBP), PDFs, and DOC files are allowed for payment receipts'));
    }
};

// Initialize upload with 10MB limit for inspection payment receipts
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter
});

export default upload;