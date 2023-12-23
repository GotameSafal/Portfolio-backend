import multer from "multer";
const storage = multer.memoryStorage();
const multipleUpload = multer({ storage }).fields([
  { name: "banner", maxCount: 1 },
  { name: "project", maxCount: 1 },
  { name: "contact", maxCount: 1 },
]);
export default multipleUpload;
