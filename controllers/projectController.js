import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import Project from "../models/projectModel.js";
import { getDataUri } from "../utils/dataUri.js";
import { ErrorHandler } from "../utils/errorHandler.js";
import { v2 as cloudinary } from "cloudinary";
export const webDetails = catchAsyncError(async (req, res, next) => {
  try {
    const details = await Project.findOne({});

    if (!details) {
      return res.status(400).json({ message: "No data found" });
    }

    return res.status(200).json({
      success: true,
      message: "Successfully fetched the data",
      details,
    });
  } catch (error) {
    return next(new ErrorHandler(`Internal Server Error`, 500)); // Adjust status code and message accordingly
  }
});

export const createDetails = catchAsyncError(async (req, res, next) => {
  try {
    // Extract data from request
    const files = req.files;
    const { frontend, backend, others } = JSON.parse(req.body.skills);
    const projectList = JSON.parse(req.body.projects);

    // Convert files to Data URIs
    const dataUris = getDataUri(files);

    // Destructure Data URIs
    let { contact, project } = dataUris;

    // Upload files to Cloudinary
    const uploadPromises = [
      cloudinary.uploader.upload(contact.content),
      cloudinary.uploader.upload(project.content),
    ];

    // Wait for all uploads to complete
    const results = await Promise.all(uploadPromises);

    // Destructure Cloudinary results
    const [contactResult, projectResult] = results;

    // Create a new project document
    const output = await Project.create({
      skills: {
        frontend: frontend.split(",").map((item) => item.trim()),
        backend: backend.split(",").map((item) => item.trim()),
        others: others.split(",").map((item) => item.trim()),
      },
      projects: [
        {
          image: {
            url: projectResult.url,
            public_id: projectResult.public_id,
          },
          title: projectList.title,
          subTitle: projectList.subTitle,
          description: projectList.description,
          technologies: projectList.technologies
            .split(",")
            .map((item) => item.trim()),
          goLive: projectList.goLive,
          sourceCode: projectList.sourceCode,
        },
      ],
      contacts: [
        {
          image: {
            public_id: contactResult.public_id,
            url: contactResult.url,
          },
          title: JSON.parse(req.body.contacts).title,
          description: JSON.parse(req.body.contacts).description,
          redirectUrl: JSON.parse(req.body.contacts).redirectUrl,
        },
      ],
    });

    // Check if the document was created successfully
    if (!output) {
      return next(new ErrorHandler("Something went wrong", 400));
    }

    // Send success response
    res.status(200).json({
      success: true,
      message: "Successfully added the complete details",
    });
  } catch (error) {
    // Handle unexpected errors
    next(new ErrorHandler("Internal Server Error", 500));
  }
});

export const createProject = catchAsyncError(async (req, res, next) => {
  const file = req.files;
  const { title, subTitle, description, technologies, goLive, sourceCode } =
    req.body;
  const details = await Project.findOne({});
  const fileUri = getDataUri(file);
  const imageData = await cloudinary.uploader.upload(fileUri.project.content);
  details.projects.push({
    title,
    subTitle,
    description,
    technologies: technologies.split(",").map((item) => item.trim()),
    goLive,
    sourceCode,
    image: {
      url: imageData.url,
      public_id: imageData.public_id,
    },
  });
  await details.save({ new: true });
  res.status(201).json({
    success: true,
    message: "successfully created project",
  });
});

export const deleteProject = catchAsyncError(async (req, res, next) => {
  const details = await Project.findOne({});
  details.projects.map((project) => {
    if (project._id.toString() !== req.params.id.toString()) {
      cloudinary.uploader
        .destroy(project.image.public_id)
        .then((response) => console.log(`image successfully deleted`));
    }
  });
  details.projects = details.projects.filter(
    (project) => project._id.toString() !== req.params.id.toString()
  );
  await details.save({ new: true });
  res.status(200).json({ success: true, message: "project deleted" });
});

export const createContacts = catchAsyncError(async (req, res, next) => {
  const files = req.files;
  const fileUri = getDataUri(files);
  const { title, description, redirectUrl } = req.body;
  const responseData = await cloudinary.uploader.upload(
    fileUri.contact.content
  );
  const details = await Project.findOne({});
  details.contacts.push({
    image: {
      public_id: responseData.public_id,
      url: responseData.url,
    },
    title,
    description,
    redirectUrl,
  });
  await details.save({ new: true });
  res.status(201).json({
    success: true,
    message: "contacts created successfully",
  });
});

export const deleteContacts = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  const details = await Project.findOne({});
  details.contacts.map(async (item) => {
    if (item._id.toString() === id.toString()) {
      await cloudinary.uploader.destroy(item.image.public_id);
    }
  });
  details.contacts = details.contacts.filter(
    (item) => item._id.toString() !== id.toString()
  );

  await details.save({ new: true });
  res.status(200).json({
    success: true,
    message: "successfully deleted the contacts",
  });
});

export const updateSkills = catchAsyncError(async (req, res, next) => {
  const { frontend, backend, others } = req.body;
  const details = await Project.findOne({});
  details.skills = {
    frontend: frontend.split(",").map((item) => item.trim()),
    backend: backend.split(",").map((item) => item.trim()),
    others: others.split(",").map((item) => item.trim()),
  };
  await details.save({ new: true });
  res.status(200).json({
    success: true,
    message: "successfully updated your skills",
  });
});

