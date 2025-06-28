import express from "express";
import {
  getMyDetails,
  loginUser,
  logoutUser,
  registerUser,
  sendMail,
} from "../controllers/userController.js";
import { isAuthenticated } from "../middlewares/authorize.js";

const router = express.Router();
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logoutUser);
router.route("/sendmail").post(sendMail);
router.route("/me").get(isAuthenticated, getMyDetails);
export default router;
