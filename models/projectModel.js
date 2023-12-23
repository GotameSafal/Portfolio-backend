import mongoose from "mongoose";
const schema = new mongoose.Schema({

 
  skills: {
    frontend: [{ type: String }],
    backend: [{ type: String }],
    others: [{ type: String }],
  },
  projects: [
    {
      image: {
        url: {
          type: String,
          required: true,
        },
        public_id: {
          type: String,
          required: true,
        },
      },
      title: {
        type: String,
        required: true,
        trim: true,
      },
      subTitle: { type: String, required: true, trim: true },
      description: { type: String, required: true, trime: true },
      technologies: [{ type: String }],
      goLive: { type: String, required: true },
      sourceCode: { type: String, required: true },
    },
  ],
  contacts: [
    {
      image: {
        url: {
          type: String,
          required: true,
        },
        public_id: {
          type: String,
          required: true,
        },
      },
      title: { type: String, required: true, trim: true },
      description: { type: String, required: true, trim: true },
      redirectUrl: String
    },
  ],
});
const Project = new mongoose.model("portfolio", schema);
export default Project;
