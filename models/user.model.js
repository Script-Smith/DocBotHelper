const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const recruiterModel = mongoose.Schema(
  {
    role: {
      type: String,
      default: "recruiter",
    },
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
    contact: {
      type: String,
      required: [true, "Can not left Contact Empty !!"],
    },
    city: {
      type: String,
      required: [true, "City name is Required"],
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

recruiterModel.pre("save", function () {
  if (!this.isModified("password")) {
    return;
  }

  let salt = bcrypt.genSaltSync(10);
  this.password = bcrypt.hashSync(this.password, salt);
});

recruiterModel.methods.comparePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

recruiterModel.methods.getWebToken = function () {
  return jwt.sign(
    {
      id: this._id,
    },
    process.env.JWT_SECRATE,
    {
      expiresIn: process.env.JWT_EX_TIME,
    }
  );
};

module.exports = mongoose.model("recruiterModel", recruiterModel);
