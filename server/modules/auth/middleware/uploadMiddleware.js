
import multer from 'multer';
import path from 'path';

// Configure storage
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'uploads/'); // Make sure this directory exists or handle dynamically
	},
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
		cb(null, uniqueSuffix + path.extname(file.originalname));
	}
});

// File filter for images and pdfs (customize as needed)
const fileFilter = (req, file, cb) => {
	const allowedTypes = /jpeg|jpg|png|pdf/;
	const ext = path.extname(file.originalname).toLowerCase();
	if (allowedTypes.test(ext)) {
		cb(null, true);
	} else {
		cb(new Error('Only images and PDF files are allowed!'), false);
	}
};

const upload = multer({
	storage,
	fileFilter,
	limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

export default upload;
