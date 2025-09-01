import express from "express";
import {
  createCompanyDetails,
  getCompanyDetails,
  updateCompanyDetails,
} from "../controllers/companyDetailsControllers.js";
import createUploadMiddleware from "../middlewares/multer/uploadMiddleware.js";

const router = express.Router();

router.post(
  "/create",
  createUploadMiddleware({
    fields: [
      { name: "icon_logo_url", maxCount: 1 },
      { name: "alt_logo_url", maxCount: 1 }
    ],
    fieldFolders: {
      icon_logo_url: "company_logos",
      alt_logo_url: "company_logos"
    },
  }),
  createCompanyDetails
);

router.get("/", getCompanyDetails);

router.patch(
  "/:id",
  createUploadMiddleware({
    fields: [
      { name: "icon_logo_url", maxCount: 1 },
      { name: "alt_logo_url", maxCount: 1 }
    ],
    fieldFolders: {
      icon_logo_url: "company_logos",
      alt_logo_url: "company_logos"
    },
  }),
  updateCompanyDetails
);

export default router;