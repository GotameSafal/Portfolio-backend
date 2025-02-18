import jwt from "jsonwebtoken";
import { ErrorHandler } from "../utils/errorHandler.js";
import User from "../models/usermodel.js";

export const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    
    if (!token) {
      throw new ErrorHandler("Please log in to access this resource", 401);
    }

    const isBearerToken = token.startsWith("Bearer ");
    if (!isBearerToken) {
      throw new ErrorHandler("Invalid token format", 401);
    }

    const jwtPayload = token.split(" ")[1];

    const decryptdata = jwt.verify(jwtPayload, process.env.SECRET_KEY);
    req.user = await User.findById(decryptdata._id).select("email")

    next();
  } catch (error) {
    next(new ErrorHandler("Authentication failed", 401));
  }
};


export const authenticateRole =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new ErrorHandler("You are not authorized to access this resource", 401)
      );
    next();
  };                                                                                                                     