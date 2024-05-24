import express from 'express'
import fs from "fs"
import PDFParser from "pdf2json";
import asyncHandler from '../middlewares/errorHandler.js';

const pdfParser = new PDFParser();
const PDFrouter = express.Router();
const pdfFilePath = "./models/PDFs/terms.pdf"

pdfParser.on('pdfParser_dataReady', pdfData => {
    console.log(pdfData); // Log the parsed data for debugging purposes
});
pdfParser.on('pdfParser_dataError', errData => {
    console.error(errData.parserError);
});

PDFrouter.get("/", asyncHandler((req, res) => {
    fs.readFile(pdfFilePath, (err, pdfBuffer) => {
        if (!err) {
            pdfParser.parseBuffer(pdfBuffer);
            // Respond with the parsed data once available
            pdfParser.on('pdfParser_dataReady', (pdfData) => {
                res.json(pdfData);
            });
        } else {
            res.status(500).send("Error reading the PDF file.");
        }
    });
}));

export default PDFrouter;