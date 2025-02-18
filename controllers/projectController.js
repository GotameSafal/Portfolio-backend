import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import Project from "../models/projectModel.js";
import NodeCache from "node-cache";
import { ErrorHandler } from "../utils/errorHandler.js";
import { getDataUri } from "../utils/dataUri.js";
import { v2 as cloudinary } from "cloudinary";
const nodecache = new NodeCache();
export const getproject = catchAsyncError(async (req, res, next) => {
  let projects;
  if (nodecache.has("projects")) {
    projects = JSON.parse(nodecache.get("projects"));
  } else {
    projects = await Project.find();
    nodecache.set("projects", JSON.stringify(projects));
  }
  res.status(200).json({
    success: true,
    projects,
  });
});

export const deleteproject = catchAsyncError(async (req, res, next) => {
  const project = await Project.findById(req.params.id);
  if (!project)
    return next(
      new ErrorHandler(`Project with id ${req.params.id} not found`, 404)
    );
  await cloudinary.uploader.destroy(project.imgUrl.public_id);
  await Project.findByIdAndDelete(req.params.id);
  nodecache.del("projects");
  res.status(200).json({
    success: true,
    message: "Successfully deleted the project",
  });
});

export const updateProject = catchAsyncError(async (req, res, next) => {
  const { file } = req;

  const { id } = req.params;
  const technologies = JSON.parse(req.body.technologies);
  const project = await Project.findById(id);
  if (!project) {
    return res
      .status(404)
      .json({ success: false, message: "Project not found" });
  }

  let newImageData = null;
  if (file) {
    const fileUri = getDataUri(file);
    const uploadResult = await cloudinary.uploader.upload(fileUri.content);
    if (project.imgUrl?.public_id) {
      await cloudinary.uploader.destroy(project.imgUrl.public_id);
    }

    newImageData = {
      imgUrl: {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
      },
    };
  }

  const updatedProject = await Project.findByIdAndUpdate(
    id,
    {
      ...req.body,
      ...newImageData,
      technologies,
    },
    { new: true }
  );

  nodecache.del("projects");

  res.status(200).json({
    success: true,
    message: "Successfully updated the project",
    project: updatedProject,
  });
});

export const createproject = catchAsyncError(async (req, res, next) => {
  let { technologies } = req.body;
  technologies = JSON.parse(technologies);
  const fileUri = getDataUri(req.file);
  try {
    const result = await cloudinary.uploader.upload(fileUri.content);

    const project = await Project.create({
      ...req.body,
      technologies,
      imgUrl: {
        url: result.url,
        public_id: result.public_id,
      },
    });
    nodecache.del("projects");
    res.status(201).json({
      success: true,
      message: "Successfully created a project",
      project,
    });
  } catch (err) {
    console.log(err);
    return next(new ErrorHandler("Image upload failed", 500));
  }
});


