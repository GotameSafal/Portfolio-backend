import express from "express";
import {
  createproject,
  deleteproject,
  getproject,
  updateproject,
} from "../controllers/projectController.js";
import { singleUpload } from "../middlewares/multer.js";

const router = express.Router();
router
  .route("/projects")
  .get(getproject)
  .post(singleUpload, createproject);
router.route("/projects/:id").delete(deleteproject).put(updateproject);

export default router;
