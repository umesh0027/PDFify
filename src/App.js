// frontend/src/App.js
import React, { useState } from "react";
import axios from "axios";
import './index.css';
import { Route, Routes, useNavigate,useLocation } from "react-router-dom"
// import "./styles/App.css";
import UploadImages from "./Components/ImageUploads";
import MergePDF from "./Components/MergePDF";
function App() {
  const [pdfUrl, setPdfUrl] = useState("");

  const handlePdfDownload = (pdfPath) => {
    setPdfUrl(pdfPath);
  };

  return (
    <div className="App">
      <Routes>

      <Route path="/" element={<UploadImages onPdfDownload={handlePdfDownload} />}/>
      <Route path="/merge" element={<MergePDF/> }/>
      </Routes>
          
      {/* <UploadImages onPdfDownload={handlePdfDownload} /> */}
      
     
    </div>
  );
}

export default App;
