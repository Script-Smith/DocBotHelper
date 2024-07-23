import { verify } from "jsonwebtoken";
import { asyncHandler } from "./errorHandler.js";
import errorHandler from "./errorHandler.js";

const isAuthenticated = asyncHandler(async (req, res, next) => {

  const token = req.cookies.token;

  if (!token) {
    return next(new errorHandler("Signin Required. Please Signin !", 401));
  }

  try {
    const { id } = verify(token, process.env.JWT_SECRATE);
    req.id = id;
    next();
  } catch (error) {
    // Pass the error to the next middleware for centralized error handling
    next(new errorHandler("Invalid token", 401));
  }
});

export default {
  isAuthenticated,
};
