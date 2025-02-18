import mongoose from "mongoose";
const schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter project name"],
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
  projecturl: {
    type: String,
    required: [true, "Please enter preject url"],
  },
  gitsource: {
    type: String,
    required: [true, "Please enter github project url"],
  },
  technologies: [{ type: String, required: true }],
});
const Project = new mongoose.model("project", schema);
export default Project;
