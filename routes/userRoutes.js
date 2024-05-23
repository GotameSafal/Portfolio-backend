import express from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  sendMail,
} from "../controllers/userController.js";
const router = express.Router();
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logoutUser);
router.route("/sendmail").post(sendMail);
export default router;
