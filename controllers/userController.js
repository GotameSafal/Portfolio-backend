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
  res.status(200).json({
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

  if (!fullname || !email || !phone || !message) {
    return next(new ErrorHandler("All fields are required", 400));
  }

  // Create email transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS,
    },
  });

  // HTML email template
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 5px;
        }
        .header {
          background-color: #f5f5f5;
          padding: 10px 20px;
          border-radius: 5px 5px 0 0;
          margin-bottom: 20px;
        }
        .content {
          padding: 0 20px;
        }
        .footer {
          margin-top: 30px;
          padding-top: 10px;
          border-top: 1px solid #ddd;
          font-size: 12px;
          color: #777;
        }
        h2 {
          color: #0066cc;
        }
        .info-item {
          margin-bottom: 10px;
        }
        .label {
          font-weight: bold;
          display: inline-block;
          width: 100px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>New Contact Form Submission</h2>
        </div>
        <div class="content">
          <div class="info-item">
            <span class="label">Name:</span> ${fullname}
          </div>
          <div class="info-item">
            <span class="label">Email:</span> ${email}
          </div>
          <div class="info-item">
            <span class="label">Phone:</span> ${phone}
          </div>
          <div class="info-item">
            <span class="label">Message:</span>
          </div>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 10px;">
            ${message.replace(/\n/g, "<br>")}
          </div>
        </div>
        <div class="footer">
          This email was sent from your portfolio website contact form.
        </div>
      </div>
    </body>
    </html>
  `;

  // Email options
  const mailOptions = {
    from: process.env.EMAIL,
    to: "lamichhanem36@gmail.com", // Your email address
    subject: `Portfolio Contact: ${fullname}`,
    html: htmlContent,
    replyTo: email, // Set reply-to as the sender's email
  };

  try {
    // Send the email
    await transporter.sendMail(mailOptions);

    // Send confirmation email to the sender
    const confirmationMailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Thank you for contacting me",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              border: 1px solid #ddd;
              border-radius: 5px;
            }
            .header {
              background-color: #f5f5f5;
              padding: 10px 20px;
              border-radius: 5px 5px 0 0;
              margin-bottom: 20px;
            }
            .content {
              padding: 0 20px;
            }
            .footer {
              margin-top: 30px;
              padding-top: 10px;
              border-top: 1px solid #ddd;
              font-size: 12px;
              color: #777;
            }
            h2 {
              color: #0066cc;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Thank You for Contacting Me</h2>
            </div>
            <div class="content">
              <p>Hello ${fullname},</p>
              <p>Thank you for reaching out to me through my portfolio website. I have received your message and will get back to you as soon as possible.</p>
              <p>Here's a summary of the information you provided:</p>
              <ul>
                <li><strong>Name:</strong> ${fullname}</li>
                <li><strong>Email:</strong> ${email}</li>
                <li><strong>Phone:</strong> ${phone}</li>
              </ul>
              <p>Best regards,</p>
              <p>Safal Gotame</p>
            </div>
            <div class="footer">
              This is an automated response. Please do not reply to this email.
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(confirmationMailOptions);

    res.status(201).json({
      success: true,
      message: "Message sent successfully! I'll get back to you soon.",
    });
  } catch (error) {
    console.error("Email sending error:", error);
    return next(
      new ErrorHandler("Failed to send email. Please try again later.", 500)
    );
  }
});

export const getMyDetails = catchAsyncError(async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: "successfully retrieved user",
    user: req.user,
  });
});
