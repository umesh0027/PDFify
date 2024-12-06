

// const fs = require('fs');
// const path = require('path');
// const PDFDocument = require('pdfkit');
// const cloudinary = require('cloudinary').v2;
// const dotenv = require("dotenv");

// dotenv.config();
// // Cloudinary configuration
// cloudinary.config({


//   cloud_name: process.env.CLOUD_NAME,
//   api_key: process.env.API_KEY,
//   api_secret: process.env.API_SECRET,
// });

// // Generate PDF and upload to Cloudinary
// const generatePDF = async (req, res) => {
//   try {
//     // Validate file upload
//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({ error: 'No files uploaded.' });
//     }

//     // Create a new PDF document
//     const pdfPath = path.join(__dirname, '../uploads/output.pdf');
//     const doc = new PDFDocument();
//     const writeStream = fs.createWriteStream(pdfPath);
//     doc.pipe(writeStream);

//     // Add images to the PDF
//     req.files.forEach((file, index) => {
//       doc.image(file.path, { fit: [500, 700], align: 'center', valign: 'center' });

//       // Only add a new page if it's not the last image
//       if (index < req.files.length - 1) {
//         doc.addPage();
//       }

//       // Delete the image file after adding to the PDF
//       fs.unlinkSync(file.path);
//     });

//     doc.end();

//     writeStream.on('finish', async () => {
//       try {
//         // Upload the generated PDF to Cloudinary
//         const uploadResponse = await cloudinary.uploader.upload(pdfPath, {
//           resource_type: 'raw', // Process as a file
//           folder: 'generated_pdfs', // Save to 'generated_pdfs' folder
//           use_filename: true,
//           unique_filename: false,
//         });

//         console.log('PDF uploaded to Cloudinary:', uploadResponse);

//         // Delete the local PDF file after upload
//         fs.unlinkSync(pdfPath);

//         // Respond with the Cloudinary URL
//         res.status(200).json({
//           message: 'PDF generated and uploaded successfully.',
//           pdfUrl: uploadResponse.secure_url,
//         });
//       } catch (err) {
//         console.error('Error uploading to Cloudinary:', err);
//         res.status(500).json({ error: 'Failed to upload PDF to Cloudinary.' });
//       }
//     });

//     writeStream.on('error', (err) => {
//       console.error(err);
//       res.status(500).json({ error: 'Error writing the PDF file.' });
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'An error occurred while generating the PDF.' });
//   }
// };

// module.exports = generatePDF;



const cloudinary = require('cloudinary').v2;
const formidable = require('formidable'); // Handles form-data parsing
const PDFDocument = require('pdfkit');
const dotenv = require("dotenv");

dotenv.config();

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Generate a PDF directly from images and upload to Cloudinary
const generatePDF = async (req, res) => {
  const form = new formidable.IncomingForm(); // Create a new form instance

  try {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing the form:', err);
        return res.status(400).json({ error: 'Error parsing the form data.' });
      }

      if (!files.images || files.images.length === 0) {
        return res.status(400).json({ error: 'No images uploaded.' });
      }

      // Create a new PDF document
      const doc = new PDFDocument();
      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk)); // Collect PDF data chunks
      doc.on('end', async () => {
        // Convert the PDF into a buffer
        const pdfBuffer = Buffer.concat(chunks);

        // Upload PDF buffer directly to Cloudinary
        const uploadResponse = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { resource_type: 'raw', folder: 'generated_pdfs', format: 'pdf' },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          ).end(pdfBuffer);
        });

        const publicId = uploadResponse.public_id;

        // Schedule deletion of the PDF from Cloudinary after 5 minutes
        setTimeout(async () => {
          try {
            await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
            console.log(`PDF with public ID "${publicId}" deleted from Cloudinary.`);
          } catch (deleteError) {
            console.error(`Error deleting PDF with public ID "${publicId}":`, deleteError);
          }
        }, 5 * 60 * 1000); // 5 minutes in milliseconds

        // Respond with the Cloudinary URL
        res.status(200).json({
          message: 'PDF generated and uploaded successfully. The file will be deleted in 5 minutes.',
          pdfUrl: uploadResponse.secure_url,
        });
      });

      // Add images to the PDF
      const imageFiles = Array.isArray(files.images) ? files.images : [files.images];

      imageFiles.forEach((file, index) => {
        doc.image(file.filepath, { fit: [500, 700], align: 'center', valign: 'center' });
        if (index < imageFiles.length - 1) {
          doc.addPage(); // Only add a new page if it is not the last image
        }
      });

      doc.end(); // Finalize the PDF
    });
  } catch (error) {
    console.error('Error generating the PDF:', error);
    res.status(500).json({ error: 'An error occurred while generating the PDF.' });
  }
};

module.exports = generatePDF;

