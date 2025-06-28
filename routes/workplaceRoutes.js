import express from "express";
import {
  createWorkplace,
  deleteWorkplace,
  getWorkplaces,
  updateWorkplace,
  deleteWorkplaceImage,
} from "../controllers/workplaceController.js";
import { isAuthenticated } from "../middlewares/authorize.js";
import { singleUpload, multipleUpload } from "../middlewares/multer.js";

const router = express.Router();

// For single file (logo) upload
router
  .route("/workplaces")
  .get(getWorkplaces)
  .post(isAuthenticated, singleUpload, createWorkplace);

// For single file (logo) update
router
  .route("/workplaces/:id")
  .patch(isAuthenticated, singleUpload, updateWorkplace)
  .delete(isAuthenticated, deleteWorkplace);

// For multiple images upload
router
  .route("/workplaces/with-images")
  .post(isAuthenticated, multipleUpload, createWorkplace);

// For multiple images update
router
  .route("/workplaces/:id/with-images")
  .patch(isAuthenticated, multipleUpload, updateWorkplace);

// For deleting a specific image
router
  .route("/workplaces/:id/images/:imageId")
  .delete(isAuthenticated, deleteWorkplaceImage);

export default router;
