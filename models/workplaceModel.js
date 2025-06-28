import mongoose from "mongoose";

const schema = new mongoose.Schema({
  company: {
    type: String,
    required: [true, "Please enter company name"],
  },
  position: {
    type: String,
    required: [true, "Please enter job position"],
  },
  duration: {
    type: String,
    required: [true, "Please enter job duration"],
  },
  description: {
    type: String,
    required: [true, "Please enter job description"],
  },
  responsibilities: [{ type: String, required: true }],
  technologies: [{ type: String }],
  companyLogo: {
    url: String,
    public_id: String,
  },
  images: [
    {
      url: String,
      public_id: String,
    },
  ],
});

const Workplace = new mongoose.model("workplace", schema);
export default Workplace;
