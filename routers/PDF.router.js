import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import pdf from "pdf-parse";
import { saveDataToJson } from "../dataHandler.js"; // Import the save function from dataHandler.js

// Set up multer for file uploads
const upload = multer({ dest: "uploads/" });

const PDFrouter = express.Router();

PDFrouter.post("/getData", upload.single("pdfFile"), (req, res) => {
  
  // Check if a file was uploaded
  if (!req.file) {
    return res.status(400).json({ msg: "No file uploaded" });
  }

  // Read the uploaded PDF file
  const pdfFilePath = path.resolve(req.file.path);
  fs.readFile(pdfFilePath, (err, data) => {
    if (err) {
      return res.status(500).json({ msg: "Error reading PDF file", err });
    }

    // Parse PDF content
    pdf(data)
      .then((parsedData) => {
        const extractedJsonData = {...parsedData};

        saveDataToJson(extractedJsonData); // Save the extracted data to the JSON file
        fs.unlinkSync(pdfFilePath);
        return res.json("Data extracted and saved in data.json!");
      })
      .catch((parseErr) => {
        res.status(500).json({ msg: "Error parsing PDF file", parseErr });
      });
  });
});

export default PDFrouter;
