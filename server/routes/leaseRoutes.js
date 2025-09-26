import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  createLease,
  getAllLeases,
  getSingleLeaseById,
  getLeaseByUserId,
  updateLeaseById,
  deleteLeaseById,
} from "../controllers/leaseControllers.js";
import createUploadMiddleware from "../middlewares/multer/uploadMiddleware.js";

const router = express.Router();

router.post(
  "/create-lease",
  createUploadMiddleware({
    fields: [{ name: "contract", maxCount: 1 }],
    fieldFolders: {
      contract: "lease_contracts",
    },
  }),
  createLease
);

router.get("/", getAllLeases);
router.get("/:id", getSingleLeaseById);
router.get("/users/:userId", getLeaseByUserId);

router.patch(
  "/:id",
  createUploadMiddleware({
    fields: [{ name: "contract", maxCount: 1 }],
    fieldFolders: {
      contract: "lease_contracts",
    },
  }),
  updateLeaseById
);

router.delete("/:id", deleteLeaseById);

export default router;
