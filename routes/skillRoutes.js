import express from "express";
import {
  createSkills,
  deleteSkills,
  getSkills,
  updateSkills,
} from "../controllers/skillController.js";
const router = express.Router();
router
  .route("/skills")
  .get(getSkills)
  .post(createSkills)
  .patch(updateSkills)
  .delete(deleteSkills);
export default router;
