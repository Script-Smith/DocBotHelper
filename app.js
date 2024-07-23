import express from "express";
import errorHandler from "./middlewares/errorMiddleware.js";
import PDFrouter from "./routers/PDF.router.js";
import queryRouter from "./routers/query.router.js";
import logger from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import userRouter from "./routers/user.router.js";
import { connectDatabase } from "./models/dataBase.js";

const app = express();

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//CORS
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, Content-Type, Accept, Authorization"
  );
  next();
});

// Auth Configration
app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.EXPRESS_SECRATE,
  })
);

// Logger
app.use(logger("tiny"));

// Routers
app.use(PDFrouter);
app.use(queryRouter);
app.use(userRouter);

// Error Handler
app.use(errorHandler);

// Database connection 
connectDatabase();

export default app;