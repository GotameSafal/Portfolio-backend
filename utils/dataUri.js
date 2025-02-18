import path from "path";
import DataParser from "datauri/parser.js";
export const getDataUri = (file) => {
  const parser = new DataParser();
  const extName = path.extname(file.originalname).toString();
  return parser.format(extName, file.buffer);
};
