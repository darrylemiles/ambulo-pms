import express from "express";
import {
  createProperty,
  getProperties,
  getSinglePropertyById,
  editPropertyById,
  deletePropertyById,
} from "../controllers/propertiesControllers.js";
import createUploadMiddleware from "../middlewares/multer/uploadMiddleware.js";

const router = express.Router();



router.post("/create-property", createUploadMiddleware({
  fields: [
    { name: 'display_image', maxCount: 1 },
  ],
  fieldFolders: {
    display_image: 'property_images',
  },
}), createProperty);
router.get("/", getProperties);
router.get("/:property_id", getSinglePropertyById);
router.patch("/:property_id", createUploadMiddleware({
  fields: [
    { name: 'display_image', maxCount: 1 },
    { name: 'showcase_images', maxCount: 10 },
  ],
  fieldFolders: {
    display_image: 'property_images',
    showcase_images: 'property_images',
  },
}), editPropertyById);
router.delete("/:property_id", deletePropertyById);

export default router;