import mongoose from "mongoose";
const Scheme = new mongoose.Schema({
  skills: {
    type: String,
    required: true,
    enum: ["Frontend", "Backend", "Devops", "Database"],
    index: true,
  },
  options: [
    {
      skill_name: {
        type: String,
      },
      proficiency: {
        type: Number,
      },
    },
  ],
});

const Skills = new mongoose.model("skills", Scheme);

export default Skills;
