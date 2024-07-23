import express from "express";
import multer from "multer";
import fs from "fs/promises";
import path from "path";
import pdf from "pdf-parse";
import { saveDataToJson } from "../lib/dataHandler.js";

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.pdf');
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed!'), false);
    }
    cb(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB limit
  }
}).single('file');  // Use 'file' as the field name

const PDFrouter = express.Router();

PDFrouter.post("/getData", (req, res) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ msg: "File size exceeds the 10MB limit." });
      }
      return res.status(400).json({ msg: "Error uploading file", error: err.message });
    } else if (err) {
      // An unknown error occurred when uploading.
      return res.status(500).json({ msg: "Unknown error occurred", error: err.message });
    }
    
    // Everything went fine with multer and the upload
    try {
      if (!req.file) {
        return res.status(400).json({ msg: "No file uploaded" });
      }

      const pdfFilePath = path.resolve(req.file.path);

      // Read the uploaded PDF file
      const data = await fs.readFile(pdfFilePath);

      // Parse PDF content
      const parsedData = await pdf(data);

      // Extract relevant information
      const extractedJsonData = {
        text: parsedData.text,
        numpages: parsedData.numpages,
        info: parsedData.info,
        metadata: parsedData.metadata,
        version: parsedData.version
      };

      // Save the extracted data to the JSON file
      await saveDataToJson(extractedJsonData);

      // Remove the uploaded file
      await fs.unlink(pdfFilePath);

      return res.json({
        msg: "Data extracted and saved in data.json!",
        pages: extractedJsonData.numpages,
        title: extractedJsonData.info.Title || 'Untitled'
      });

    } catch (error) {
      console.error('Error processing PDF:', error);
      return res.status(500).json({ msg: "Error processing PDF file", error: error.message });
    }
  });
});

// Add a route to handle errors
PDFrouter.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ msg: "Something went wrong!", error: err.message });
});

export default PDFrouter;