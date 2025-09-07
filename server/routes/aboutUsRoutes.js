import express from "express";
import createUploadMiddleware from "../middlewares/multer/uploadMiddleware.js";
import {
    createAboutUs,
    getAboutUs,
    updateAboutUs
} from "../controllers/aboutUsControllers.js";

const router = express.Router();

router.post(
    "/create-about-us",
    createUploadMiddleware({
        fields: [
            { name: 'about_img1', maxCount: 1 },
            { name: 'about_img2', maxCount: 1 },
            { name: 'about_img3', maxCount: 1 },
            { name: 'about_img4', maxCount: 1 }
        ],
        fieldFolders: {
            about_img1: 'about_images',
            about_img2: 'about_images',
            about_img3: 'about_images',
            about_img4: 'about_images'
        }
    }),
    createAboutUs
);

router.get("/", getAboutUs);

router.patch(
    "/",
    createUploadMiddleware({
        fields: [
            { name: 'about_img1', maxCount: 1 },
            { name: 'about_img2', maxCount: 1 },
            { name: 'about_img3', maxCount: 1 },
            { name: 'about_img4', maxCount: 1 }
        ],
        fieldFolders: {
            about_img1: 'about_images',
            about_img2: 'about_images',
            about_img3: 'about_images',
            about_img4: 'about_images'
        }
    }),
    updateAboutUs
);

export default router;