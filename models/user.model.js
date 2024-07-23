import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const { compareSync, genSaltSync, hashSync } = bcrypt;
const { sign } = jwt;

const userModel = Schema(
  {
    firstname: {
      type: String,
      trim: true,
      required: [true, "Can not left Firstname Empty !!"],
      minLength: [3, "Firstname should have at least 3 characters !"],
    },
    lastname: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      lowercase: true,
      required: [true, "Email can not be Empty !!"],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Invalid email address",
      ],
    },
    password: {
      type: String,
      select: false,
      maxLength: [15, "Password should not exeed more than 15 Charcters !!"],
      minLength: [6, "Password should atlest 6 Charcters !!"],
      required: [true, "Can not left password Empty !!"],
      // match : [,"Password should contain 1 Special Character !!"],
    },
    passwordResetFlag: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userModel.pre("save", function () {
  if (!this.isModified("password")) {
    return;
  }

  let salt = genSaltSync(10);
  this.password = hashSync(this.password, salt);
});

userModel.methods.comparePassword = function (password) {
  return compareSync(password, this.password);
};

userModel.methods.getWebToken = function () {
  return sign(
    {
      id: this._id,
    },
    process.env.JWT_SECRATE,
    {
      expiresIn: process.env.JWT_EX_TIME,
    }
  );
};

export default model("userModel", userModel);
