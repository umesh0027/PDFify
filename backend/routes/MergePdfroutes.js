



// const express = require('express');
// const multer = require('multer');
// const { mergePDFs } = require('../Controllers/MergePdfControllers'); // Controller for merging PDFs

// const router = express.Router();

// // Multer configuration for in-memory storage
// const storage = multer.memoryStorage(); // Store files in memory as buffers

// const upload = multer({
//   storage,
//   limits: { 
//     fileSize: 10 * 1024 * 1024, // Limit file size to 10 MB
//   },
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = ['application/pdf'];
//     if (allowedTypes.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(new Error('Only PDF files are allowed.'));
//     }
//   },
// });

// // Route for merging PDFs
// router.post('/merge', upload.array('pdfs', 10), async (req, res, next) => {
//   try {
//     // Check if files were uploaded
//     if (!req.files || req.files.length < 2) {
//       return res.status(400).json({ error: 'Please upload at least two PDF files.' });
//     }

//     // Proceed with PDF merging
//     await mergePDFs(req, res);
//   } catch (err) {
//     if (err instanceof multer.MulterError) {
//       // Specific Multer error (e.g., file too large)
//       return res.status(400).json({ error: `File upload error: ${err.message}` });
//     } else {
//       // General errors (e.g., invalid file format)
//       return res.status(400).json({ error: `Error: ${err.message}` });
//     }
//   }
// });

// module.exports = router;


const express = require('express');
const { mergePDFs } = require('../Controllers/MergePdfControllers');

const router = express.Router();

// Route for merging PDFs
router.post('/merge', mergePDFs);

module.exports = router;
