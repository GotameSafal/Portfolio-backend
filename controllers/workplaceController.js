import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import Workplace from "../models/workplaceModel.js";
import NodeCache from "node-cache";
import { ErrorHandler } from "../utils/errorHandler.js";
import { getDataUri } from "../utils/dataUri.js";
import { v2 as cloudinary } from "cloudinary";

const nodeCache = new NodeCache();

export const getWorkplaces = catchAsyncError(async (req, res, next) => {
  let workplaces;
  if (nodeCache.has("workplaces")) {
    workplaces = JSON.parse(nodeCache.get("workplaces"));
  } else {
    workplaces = await Workplace.find();
    nodeCache.set("workplaces", JSON.stringify(workplaces));
  }
  res.status(200).json({
    success: true,
    workplaces,
  });
});

export const createWorkplace = catchAsyncError(async (req, res, next) => {
  const { responsibilities, technologies } = req.body;
  const parsedResponsibilities = responsibilities
    ? JSON.parse(responsibilities)
    : [];
  const parsedTechnologies = technologies ? JSON.parse(technologies) : [];

  // Handle logo upload
  let logoData = {};
  if (req.file) {
    const fileUri = getDataUri(req.file);
    const result = await cloudinary.uploader.upload(fileUri.content);
    logoData = {
      companyLogo: {
        url: result.secure_url,
        public_id: result.public_id,
      },
    };
  }

  // Handle multiple images if available
  let imagesData = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const fileUri = getDataUri(file);
      const result = await cloudinary.uploader.upload(fileUri.content);
      imagesData.push({
        url: result.secure_url,
        public_id: result.public_id,
      });
    }
  }

  const workplace = await Workplace.create({
    ...req.body,
    responsibilities: parsedResponsibilities,
    technologies: parsedTechnologies,
    ...logoData,
    images: imagesData,
  });

  nodeCache.del("workplaces");

  res.status(201).json({
    success: true,
    message: "Successfully created workplace entry",
    workplace,
  });
});

export const updateWorkplace = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { responsibilities, technologies } = req.body;

  const workplace = await Workplace.findById(id);
  if (!workplace) {
    return next(new ErrorHandler(`Workplace with id ${id} not found`, 404));
  }

  const parsedResponsibilities = responsibilities
    ? JSON.parse(responsibilities)
    : workplace.responsibilities;
  const parsedTechnologies = technologies
    ? JSON.parse(technologies)
    : workplace.technologies;

  // Handle logo update
  let logoData = {};
  if (req.file) {
    // Delete old logo if exists
    if (workplace.companyLogo && workplace.companyLogo.public_id) {
      await cloudinary.uploader.destroy(workplace.companyLogo.public_id);
    }

    const fileUri = getDataUri(req.file);
    const result = await cloudinary.uploader.upload(fileUri.content);
    logoData = {
      companyLogo: {
        url: result.secure_url,
        public_id: result.public_id,
      },
    };
  }

  // Handle multiple images update if available
  let imagesData = workplace.images || [];
  if (req.files && req.files.length > 0) {
    // Delete old images if replacing
    if (req.body.replaceImages === "true" && imagesData.length > 0) {
      for (const image of imagesData) {
        await cloudinary.uploader.destroy(image.public_id);
      }
      imagesData = [];
    }

    // Upload new images
    for (const file of req.files) {
      const fileUri = getDataUri(file);
      const result = await cloudinary.uploader.upload(fileUri.content);
      imagesData.push({
        url: result.secure_url,
        public_id: result.public_id,
      });
    }
  }

  const updatedWorkplace = await Workplace.findByIdAndUpdate(
    id,
    {
      ...req.body,
      responsibilities: parsedResponsibilities,
      technologies: parsedTechnologies,
      ...logoData,
      images: imagesData,
    },
    { new: true }
  );

  nodeCache.del("workplaces");

  res.status(200).json({
    success: true,
    message: "Successfully updated the workplace",
    workplace: updatedWorkplace,
  });
});

export const deleteWorkplace = catchAsyncError(async (req, res, next) => {
  const workplace = await Workplace.findById(req.params.id);
  if (!workplace) {
    return next(
      new ErrorHandler(`Workplace with id ${req.params.id} not found`, 404)
    );
  }

  // Delete logo from Cloudinary if exists
  if (workplace.companyLogo && workplace.companyLogo.public_id) {
    await cloudinary.uploader.destroy(workplace.companyLogo.public_id);
  }

  // Delete all images from Cloudinary
  if (workplace.images && workplace.images.length > 0) {
    for (const image of workplace.images) {
      await cloudinary.uploader.destroy(image.public_id);
    }
  }

  await Workplace.findByIdAndDelete(req.params.id);
  nodeCache.del("workplaces");

  res.status(200).json({
    success: true,
    message: "Successfully deleted the workplace",
  });
});

// Delete a specific image from a workplace
export const deleteWorkplaceImage = catchAsyncError(async (req, res, next) => {
  const { id, imageId } = req.params;

  const workplace = await Workplace.findById(id);
  if (!workplace) {
    return next(new ErrorHandler(`Workplace with id ${id} not found`, 404));
  }

  // Find the image
  const imageIndex = workplace.images.findIndex(
    (img) => img._id.toString() === imageId
  );
  if (imageIndex === -1) {
    return next(new ErrorHandler(`Image not found`, 404));
  }

  // Delete from Cloudinary
  await cloudinary.uploader.destroy(workplace.images[imageIndex].public_id);

  // Remove from array
  workplace.images.splice(imageIndex, 1);
  await workplace.save();

  nodeCache.del("workplaces");

  res.status(200).json({
    success: true,
    message: "Image deleted successfully",
  });
});
