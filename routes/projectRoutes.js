import express from "express";
import {
  webDetails,
  createProject,
  deleteProject,
  createDetails,
  createContacts,
  deleteContacts,
  updateSkills,
} from "../controllers/projectController.js";
import multipleUpload from "../middlewares/multer.js";
const router = express.Router();
router.route("/details").get(webDetails).post(multipleUpload, createDetails);
router.route("/project").post(multipleUpload, createProject);
router.route("/project/:id").delete(deleteProject);
router.route("/contacts").post(multipleUpload, createContacts);
router.route("/contacts/:id").delete(deleteContacts);
router.route("/skills").put(updateSkills);

export default router;
