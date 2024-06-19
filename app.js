import express from "express";
import errorHandler from "./middlewares/errorMiddleware.js";
import PDFrouter from "./routers/PDF.router.js";
import queryRouter from "./routers/query.router.js";

const app = express();

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routers
app.use(PDFrouter);
app.use(queryRouter);

// Error Handler
app.use(errorHandler);

export default app;
