


// const express = require('express');
// const multer = require('multer');
// const generatePDF = require('../Controllers/PdfControllers'); // Import the generatePDF function correctly

// const router = express.Router();

// // Multer configuration for file upload
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/');
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   },
// });

// const upload = multer({
//   storage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5 MB
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
//     if (allowedTypes.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(new Error('Only JPEG, PNG, and JPG files are allowed.'));
//     }
//   },
// });

// // Route to handle PDF generation and upload
// router.post('/create', upload.array('images', 30), generatePDF);  // Ensure generatePDF is passed as a function


// module.exports = router;




const express = require('express');
const generatePDF = require('../Controllers/PdfControllers');

const router = express.Router();

// Route for creating a PDF from images
router.post('/create', generatePDF);

module.exports = router;
