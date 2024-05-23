import express from "express"
import errorHandler from "./middlewares/errorMiddleware";

const app = express();

// Error Handler
app.use(errorHandler);



export default app;