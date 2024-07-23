import express from "express";
import {
  userSignIn,
  userSignOut,
  userSignup,
} from "../controllers/user.controlers.js";

const userRouter = express.Router();

// Post candidate Signup //
userRouter.post("/signup",userSignup);

// Post candidate Signin //
userRouter.post("/signin", userSignIn);

// Get candidate SignOut //
userRouter.get("/signout", userSignOut);


export default userRouter;