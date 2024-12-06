

// const { PDFDocument } = require('pdf-lib');
// const cloudinary = require('cloudinary').v2;
// const dotenv = require("dotenv");

// dotenv.config();
// // Cloudinary configuration
// cloudinary.config({
//     // cloud_name: 'dvguluors',
//     // api_key: '559828423444266',
//     // api_secret: '_LeaAVgAPrWJIqWEXsEqUmvCoUg',

//     cloud_name: process.env.CLOUD_NAME,
//     api_key: process.env.API_KEY,
//     api_secret: process.env.API_SECRET,
// });

// // Controller to merge PDFs, upload to Cloudinary, and delete after some time
// exports.mergePDFs = async (req, res) => {
//   try {
//     // Check if at least two files are uploaded
//     if (!req.files || req.files.length < 2) {
//       return res.status(400).json({ error: 'Please upload at least two PDF files to merge.' });
//     }

//     const mergedPdf = await PDFDocument.create();

//     // Iterate over uploaded PDF files (stored in memory)
//     for (const file of req.files) {
//       const pdfBuffer = file.buffer; // Read PDF buffer from memory
//       const pdf = await PDFDocument.load(pdfBuffer); // Load PDF using pdf-lib
//       const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
//       copiedPages.forEach((page) => mergedPdf.addPage(page));
//     }

//     // Save merged PDF in memory
//     const mergedPdfBytes = await mergedPdf.save();

//     // Generate a unique public_id for the merged PDF
//     const publicId = `merged_${Date.now()}`;

//     // Upload merged PDF to Cloudinary
//     cloudinary.uploader
//       .upload_stream(
//         {
//           resource_type: 'auto', // Auto-detect file type
//           folder: 'merged_pdfs', // Folder name in Cloudinary
//           format: 'pdf', // Specify PDF format
//           public_id: publicId, // Unique identifier for the file
//           tags: ['temporary'], // Add a tag to identify the file for deletion
//         },
//         async (error, result) => {
//           if (error) {
//             console.error('Cloudinary upload error:', error);
//             return res.status(500).json({ error: 'Failed to upload merged PDF due to large size please try again up to 10 MB.' });
//           }

//           // Respond with the Cloudinary URL
//           res.status(200).json({
//             message: 'PDFs merged and uploaded successfully.',
//             pdfUrl: result.secure_url,
//             format: result.format, // Include file format in the response
//           });

//           // Schedule deletion of the uploaded file after 5 minutes
//           setTimeout(async () => {
//             try {
//               await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
//               console.log(`File ${publicId} deleted from Cloudinary.`);
//             } catch (deleteError) {
//               console.error('Error deleting file from Cloudinary:', deleteError);
//             }
//           }, 5 * 60 * 1000); // 5 minutes in milliseconds
//         }
//       )
//       .end(mergedPdfBytes); // Write merged PDF bytes to the upload stream
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'An error occurred while merging PDFs.' });
//   }
// };


const { PDFDocument } = require('pdf-lib');
const formidable = require('formidable');
const cloudinary = require('cloudinary').v2;
const dotenv = require("dotenv");

dotenv.config();

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Merge PDFs and upload directly to Cloudinary
exports.mergePDFs = async (req, res) => {
  const form = new formidable.IncomingForm();

  try {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing the form:', err);
        return res.status(400).json({ error: 'Error parsing the form data.' });
      }

      if (!files.pdfs || (Array.isArray(files.pdfs) && files.pdfs.length < 2)) {
        return res.status(400).json({ error: 'Please upload at least two PDF files.' });
      }

      const mergedPdf = await PDFDocument.create();

      // Merge PDF files
      for (const file of Array.isArray(files.pdfs) ? files.pdfs : [files.pdfs]) {
        const pdfBuffer = require('fs').readFileSync(file.filepath); // Read file directly from the filepath
        const pdf = await PDFDocument.load(pdfBuffer); // Load the PDF file into pdf-lib
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      // Save the merged PDF
      const mergedPdfBytes = await mergedPdf.save();

      // Upload the merged PDF to Cloudinary
      const uploadResponse = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { resource_type: 'raw', folder: 'merged_pdfs', format: 'pdf' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        ).end(mergedPdfBytes);
      });

      const publicId = uploadResponse.public_id;

      // Schedule deletion of the merged PDF after 5 minutes
      setTimeout(async () => {
        try {
          await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
          console.log(`Merged PDF with public ID "${publicId}" deleted from Cloudinary.`);
        } catch (deleteError) {
          console.error(`Error deleting merged PDF with public ID "${publicId}":`, deleteError);
        }
      }, 5 * 60 * 1000); // 5 minutes in milliseconds

      // Respond with the Cloudinary URL
      res.status(200).json({
        message: 'PDFs merged and uploaded successfully. The file will be deleted in 5 minutes.',
        pdfUrl: uploadResponse.secure_url,
      });
    });
  } catch (error) {
    console.error('Error merging PDFs:', error);
    res.status(500).json({ error: 'An error occurred while merging PDFs.' });
  }
};
