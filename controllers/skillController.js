import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import Skills from "../models/skillModel.js";

export const getSkills = catchAsyncError(async (req, res, next) => {
  const skills = await Skills.find();
  res.status(200).json({
    success: true,
    message: "Successfully retrieved skills",
    skills,
  });
});
export const updateSkills = catchAsyncError(async (req, res, next) => {
  const { skills, skill_name, proficiency } = req.body;
  const data = await Skills.findOne({ skills });
  if (!data)
    return res.status(404).json({ success: false, message: "Skill not found" });

  const option = data.options.find((opt) => opt.skill_name === skill_name);
  if (option) {
    option.proficiency = proficiency;
  } else {
    data.options.push({ skill_name, proficiency });
  }

  await data.save();
  res
    .status(200)
    .json({ success: true, message: "Skill updated successfully" });
});

export const deleteSkills = catchAsyncError(async (req, res, next) => {
  const { skills, skill_name } = req.body;
  const data = await Skills.findOne({ skills });
  if (!data)
    return res.status(404).json({ success: false, message: "Skill not found" });

  if (skill_name) {
    data.options = data.options.filter((opt) => opt.skill_name !== skill_name);
    if (data.options.length === 0) {
      await Skills.deleteOne({ _id: data._id });
    } else {
      await data.save();
    }
  } else {
    await Skills.deleteOne({ skills });
  }

  res
    .status(200)
    .json({ success: true, message: "Skill deleted successfully" });
});

export const createSkills = catchAsyncError(async (req, res, next) => {
  const { skills, skill_name, proficiency } = req.body;
  console.log(skills, skill_name, proficiency);
  let data = await Skills.findOne({ skills });
  console.log("datadaas", data)
  if (!data) {
    console.log('data')
    data = await Skills.create({
      skills,
      options: [{ skill_name, proficiency }],
    });
  } else {
    console.log("undata")
    data.options.push({ skill_name, proficiency });
    await data.save({ new: true });
  }
  res.status(200).json({
    success: true,
    message: "Skill added successfully",
  });
});
