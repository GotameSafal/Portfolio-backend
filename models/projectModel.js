import mongoose from "mongoose";
const schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter project name"],
  },
  imgUrl: {
    type: String,
    required: [true, "Please enter prjects image url"],
  },
  description: {
    type: String,
    required: [true, "Please enter project description"],
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
