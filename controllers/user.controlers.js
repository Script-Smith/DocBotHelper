import { getToken } from "../lib/token.js";
import asyncHandler from "../middlewares/errorHandler.js";
import ErrorHandler from "../middlewares/errorLoger.js";
import errorHandler from "../middlewares/errorMiddleware.js";
import userModel from "../models/user.model.js";

export const userSignup = asyncHandler(async (req, res) => {
  const user = await new userModel(req.body).save();
  getToken(user, 201, res);
});

export const userSignIn = asyncHandler(async (req, res, next) => {
  let user = await userModel
    .findOne({ email: req.body.email }, { email: 1 })
    .select("+password")
    .exec();
  if (!user) {
    return next(
      new ErrorHandler("user with this email addres not found...", 404)
    );
  }

  const isAuthorized = user.comparePassword(req.body.password);

  if (!isAuthorized) {
    return next(new errorHandler("Invalid password...", 401));
  }

  getToken(user, 200, res);
});

export const userSignOut = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  res.json({
    message: "Successfully signout !!",
  });
});
