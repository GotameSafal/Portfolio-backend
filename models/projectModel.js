import mongoose from "mongoose";
const schema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please enter project title"],
  },
  imgUrl: {
    url: {
      type: String,
      required: true,
    },
    public_id: {
      type: String,
      required: true,
    },
  },
  description: {
    type: String,
    required: [true, "Please enter project description"],
  },
  detailedDescription: {
    type: String,
    required: [true, "Please enter project detailed description"],
  },
  liveLink: {
    type: String,
    required: [true, "Please enter live project URL"],
  },
  githubLink: {
    type: String,
    required: false, // Changed from required to optional
  },
  technologies: [{ type: String, required: true }],
});
const Project = new mongoose.model("project", schema);
export default Project;
