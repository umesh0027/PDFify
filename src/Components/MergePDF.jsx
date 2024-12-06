


import React, { useState } from 'react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';
import Navbar from './Navbar';

// const BASE_URL = process.env.REACT_APP_BASE_URL;
const MergePDF = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mergedPdfUrl, setMergedPdfUrl] = useState(null);

  // Handling files dropped or selected
  const handleDrop = (acceptedFiles) => {
    setFiles(acceptedFiles);
  };

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (files.length < 2) {
  //     alert('Please select at least two PDF files to merge.');
  //     return;
  //   }

  //   const formData = new FormData();
  //   Array.from(files).forEach((file) => {
  //     formData.append('pdfs', file); // Append the selected files to the form data
  //   });

  //   setLoading(true);
  //   setError(null);

  //   const loadingToast = toast.loading("Merging PDFs... Please wait...", { id: "loading" });

  //   try {
  //     const response = await axios.post('http://localhost:5000/api/pdf/merge', formData, {
  //       headers: { 'Content-Type': 'multipart/form-data' },
  //     });

  //     if (response.data.pdfUrl) {
  //       setMergedPdfUrl(response.data.pdfUrl);
  //       toast.success("PDF merged successfully!");
  //     } else {
  //       throw new Error('No URL returned from server.');
  //     }
  //   } catch (err) {
  //     console.error('Error during merge:', err.message || err);
  //     setError(err.response?.data?.error || 'An error occurred while merging PDFs.');
  //     toast.error("Failed to merge PDF. Please try again.");
  //   } finally {
  //     setLoading(false);
  //     toast.dismiss(loadingToast);
  //   }
  // };

  // Dropzone configuration
  

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Check if at least two files are selected
    if (files.length < 2) {
      toast.error('Please select at least two PDF files to merge.');
      return;
    }
  
    // Validate files on the client-side
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB per file
    const isValid = Array.from(files).every((file) => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File "${file.name}" exceeds the 10 MB limit.`);
        return false;
      }
      if (file.type !== 'application/pdf') {
        toast.error(`File "${file.name}" is not a valid PDF.`);
        return false;
      }
      return true;
    });
  
    if (!isValid) return;
  
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('pdfs', file); // Append files to form data
    });
  
    setLoading(true);
    setError(null);
  
    const loadingToast = toast.loading("Merging PDFs... Please wait...", { id: "loading" });
  
    try {
      const response = await axios.post('https://pdfify-udm9.onrender.com/api/pdf/merge', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
  
      if (response.data.pdfUrl) {
        setMergedPdfUrl(response.data.pdfUrl);
        toast.success("PDF merged successfully!");
      } else {
        throw new Error('No URL returned from server.');
      }
    } catch (err) {
      console.error('Error during merge:', err.response?.data?.error || err.message || err);
      setError(err.response?.data?.error || 'An error occurred while merging PDFs.');
      toast.error("Failed to merge PDF. Please try again.");
    } finally {
      setLoading(false);
      toast.dismiss(loadingToast);
    }
  };
  
  
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: handleDrop,
    accept: '.pdf', // Only accept PDF files
    multiple: true, // Allow multiple files
  });

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center bg-blue-250 p-4 flex-col">
        {/* Background Heading */}
        <h1 className='text-3xl lg:text-5xl font-extrabold text-richblack-600 text-center px-4 lg:my-8 mt-6'>
          Merge PDF Files
        </h1>
        <h2 className="text-xl lg:text-2xl font-extrabold text-pure-greys-400 font-extrabold text-center px-4 py-10">
          "Easily Combine Multiple PDFs into One"
        </h2>

        {/* Form Container */}
        <div className="relative w-full max-w-lg p-6 bg-white shadow-lg rounded-lg z-10">
          <h2 className="text-2xl font-semibold text-center text-pure-greys-700 mb-6">Merge PDF Files</h2>
          <p className='text-[9px] text-center font-semibold'>Maximum files to merge: 10 PDFs.</p>
          <p className='text-[9px] text-center font-semibold'>Maximum size of all file: 10 MB.</p>
          <form onSubmit={handleSubmit} className="space-y-6">
         
         
            {/* Drag-and-drop area */}
            <div
              {...getRootProps()}
              className="w-3/4 h-20 flex justify-center items-center bg-pink-150 border-gray-300 rounded-xl cursor-pointer mx-auto"
            >
              <input {...getInputProps()} />
              <p className="text-center text-white font-bold">Drag & Drop PDF Files Here or Click to Select</p>
              
            </div>

           

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              disabled={loading} // Disable button while loading
            >
              {loading ? 'Merging PDFs...' : 'Merge PDFs'}
            </button>
          </form>

          {/* Loading Indicator */}
          {loading && (
            <div className="mt-4 text-center">
              <p className="text-blue-600">Processing...</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 text-center text-pink-150">
              <p>{error}</p>
            </div>
          )}

          {/* Merged PDF Link */}
          {mergedPdfUrl && (
            <div className="mt-6 text-center">
              <p>
                PDF merged successfully! Download it{' '}
                <a href={mergedPdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  here
                </a>.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MergePDF;

