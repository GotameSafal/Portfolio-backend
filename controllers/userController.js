import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { ErrorHandler } from "../utils/errorHandler.js";
import nodemailer from "nodemailer";
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
  console.log("eamil");
  const { email, password } = req.body;
  console.log(email, password);
  let user = await User.findOne({ email });

  if (!user) {
    return next(new ErrorHandler("Invalid credentials", 400));
  }

  if (user.isLocked()) {
    const lockTimeRemaining = Math.ceil((user.lockUntil - Date.now()) / 1000);
    return next(
      new ErrorHandler(
        `Account is locked. Try again after ${lockTimeRemaining} seconds.`,
        429
      )
    );
  }
  const comparePassword = await user.comparePassword(password);
  console.log(comparePassword);
  if (!comparePassword) {
    user.loggedInCount += 1;

    if (user.loggedInCount >= 3) {
      const lockDuration = 2 ** (user.loggedInCount - 3) * 60 * 1000; // in milliseconds
      user.lockUntil = new Date(Date.now() + lockDuration);
    }

    await user.save();
    return next(new ErrorHandler("Invalid credentials", 400));
  }

  user.loggedInCount = 0;
  user.lockUntil = null;
  await user.save();

  const token = user.getJwtToken();
  console.log(token);
  res
    .status(200)
    .cookie("portfolio", token, {
      maxAge: 60 * 60 * 1000,
      httpOnly: true,
    })
    .json({
      success: true,
      message: "Logged in successfully",
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
      pass: process.env.PASS,
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

export const getMyDetails = catchAsyncError(async (req, res, next) => {
  res
    .status(200)
    .json({
      success: true,
      message: "successfully retrieved user",
      user: req.user,
    });
});
