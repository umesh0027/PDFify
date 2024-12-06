

import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { toast,Toaster } from 'react-hot-toast';
import Navbar from './Navbar';



const ImageUpload = () => {
  const [images, setImages] = useState([]);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  // const BASE_URL = process.env.REACT_APP_BASE_URL;
  // Handle drop event
  const onDrop = (acceptedFiles) => {
    setImages(acceptedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    images.forEach((image) => {
      formData.append('images', image);
    });

    setIsLoading(true); // Set loading to true when submission starts
   const loadingToast = toast.loading("Generating PDF... Please wait...", { id: "loading" }); // Toast message with loading state

    try {
      const response = await axios.post('https://pdfify-udm9.onrender.com/api/pdf/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        
      });

      console.log('PDF created successfully:', response.data);
      setPdfUrl(response.data.pdfUrl);
      toast.success("PDF created successfully!");
    } catch (error) {
      console.error('Failed to create PDF:', error);
      toast.error("Failed to create PDF. Please try again.");
    } finally {
      setIsLoading(false); // Set loading to false when done
      toast.dismiss(loadingToast);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: 'image/*', // Only accept image files
    multiple: true, // Allow multiple files
  });

  return (
    <>
    <Navbar/>
    <div className="min-h-screen flex items-center bg-blue-250 p-4 flex-col">
      {/* Background Heading */}
      <h1 className='text-3xl lg:text-5xl font-extrabold text-richblack-600 font-extrabold text-center px-4 lg:my-8 mt-6'>JPG to PDF</h1>
      <h1 className="text-xl lg:text-2xl font-extrabold text-pure-greys-400 font-extrabold text-center px-4 py-10">
        "Easily Convert Multiple Images into a Single PDF"
      </h1>

      {/* Form Container */}
      <div className="relative w-full max-w-lg p-6 bg-white shadow-lg rounded-lg z-10">
        <h2 className="text-2xl font-semibold text-center text-pure-greys-700 mb-6">Image to PDF Converter</h2>
        <p className='text-[9px] text-center font-semibold'>Maximum files to merge: 30 pages .</p>
        <p className='text-[9px] text-center font-semibold'>Maximum size of all file: 10 MB.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Drag-and-drop container */}
          <div
            {...getRootProps()}
            className="w-3/4 h-20 flex justify-center items-center bg-pink-150 border-gray-300 rounded-xl cursor-pointer mx-auto"
          >
            <input {...getInputProps()} />
            <p className="text-center text-white font-bold">Drag & Drop Images Here or Click to Select</p>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            disabled={isLoading} // Disable button while loading
          >
            {isLoading ? 'Generating PDF...' : 'Generate PDF'}
          </button>
        </form>

        {isLoading && (
          <div className="mt-4 text-center">
          
            <p className="text-blue-600 ">Processing...</p>
          </div>
        )}

        {pdfUrl && (
          <div className="mt-6 text-center">
            <a
              href={pdfUrl}
              download="generated.pdf"
              className="text-blue-600 hover:underline"
            >
              Download PDF
            </a>
          </div>
        )}
      </div>
    </div>
    
    </>
  );
};

export default ImageUpload;
