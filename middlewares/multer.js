import multer from "multer";

const storage = multer.memoryStorage();

// Single file upload middleware
export const singleUpload = multer({ storage }).single("file");

// Multiple files upload middleware (max 5 files)
export const multipleUpload = multer({
  storage,
  limits: { files: 5 },
}).array("files", 5);
