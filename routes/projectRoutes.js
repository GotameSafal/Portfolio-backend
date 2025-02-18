import express from "express";
import {
  createproject,
  deleteproject,
  getproject,
  updateProject,
} from "../controllers/projectController.js";
import { singleUpload } from "../middlewares/multer.js";
import { isAuthenticated } from "../middlewares/authorize.js";

const router = express.Router();
router
  .route("/projects")
  .get(getproject)
  .post(isAuthenticated, singleUpload, createproject);
router
  .route("/projects/:id")
  .delete(isAuthenticated, deleteproject)
  .patch(isAuthenticated, singleUpload, updateProject);

export default router;
