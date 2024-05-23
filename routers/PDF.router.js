import express from 'express'
import pdfParser from 'pdf-parser'
import pdf from "./models"
const PDFrouter = express.Router();

const PDF_PATH = "";

PDFrouter.get("/get-pdf-data", (req, res, next) => {
    return pdfParser.pdf2json(PDF_PATH, function (error, pdf) {
        if(error != null){
            console.log(error);
        }else{
            console.log(JSON.stringify(pdf));
        }
    });
})