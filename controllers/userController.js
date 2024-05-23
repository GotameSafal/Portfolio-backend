import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { ErrorHandler } from "../utils/errorHandler.js";
import nodemailer from "nodemailer"
import User from "../models/usermodel.js";
export const registerUser = catchAsyncError(async (req, res, next) => {
  const { email, password, confirmPassword } = req.body;
  if (!email || !password || !confirmPassword)
    return next(new ErrorHandler("please enter in valid field", 400));
  const isuser = await User.findOne({ email });
  if (isuser) return next(new ErrorHandler("user already exists", 400));
  if (password !== confirmPassword)
    return next(
      new ErrorHandler("please enter password and confirm password", 400)
    );
  const user = await User.create({
    email,
    password,
  });

  res.status(201).json({
    success: true,
    message: "user created successfully",
  });
});

export const loginUser = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  const comparePassword = await user.comparePassword(password);
  if (!comparePassword)
    return next(new ErrorHandler("Invalid credentials", 400));
  const token = await user.getjwtToken();

  res
    .status(201)
    .cookie("portfolio", token, {
      maxAge: 60 * 60 * 1000,
    })
    .json({
      success: true,
      message: "logged in successfully",
      token,
    });
});

export const logoutUser = catchAsyncError(async (req, res, next) => {
  res.cookie("portfolio", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "successfully logged out",
  });
});

export const sendMail = catchAsyncError(async (req, res, next) => {
  const { fullname, email, phone, message } = req.body;
  const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 465,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS, //
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: "lamichhanem36@gmail.com",
    subject: `${email}/portfolio/${phone}/${fullname}`,
    text: message,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      res.status(500).send("Error occurred while sending email.");
    } else {
      res.status(201).json({
        success: true,
        message: "Mail send successfully",
      });
    }
  });
});
