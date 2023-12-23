import path from "path";
import DataParser from "datauri/parser.js";

export const getDataUri = (files) => {
  const parser = new DataParser();
  const {project, contact } = files;
  let dataUris = {}; // Use let instead of const to update the object



  if (project) {
    const extName = path.extname(project[0].originalname).toString(); // Use project[0] to access the first file
    const dataUri = parser.format(extName, project[0].buffer);
    dataUris = { ...dataUris, project: dataUri }; // Assign to project property
  }

  if (contact) {
    const extName = path.extname(contact[0].originalname).toString(); // Use contact[0] to access the first file
    const dataUri = parser.format(extName, contact[0].buffer);
    dataUris = { ...dataUris, contact: dataUri }; // Assign to contact property
  }

  return dataUris;
};
