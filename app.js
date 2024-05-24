import express from "express";
import errorHandler from "./middlewares/errorMiddleware.js";
import PDFrouter from "./routers/PDF.router.js";

const app = express();

// Error Handler //
app.use(errorHandler);

// Rauters //
app.use(PDFrouter);


export default app;