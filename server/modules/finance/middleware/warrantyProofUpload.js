import multer from 'multer';
import path from 'path';

// Set storage engine for warranty proof uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/warranty-proofs/'); // Folder where warranty proof files will be saved
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'warranty-proof-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter (accept only images and PDFs)
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only images (JPEG, JPG, PNG) and PDFs are allowed for warranty proof'));
    }
};

// Initialize upload with 10MB limit for warranty proofs
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter
});

export default upload;
