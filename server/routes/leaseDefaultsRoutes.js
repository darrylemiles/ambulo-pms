import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  getLeaseDefaults,
  updateLeaseDefaults,
} from "../controllers/leaseDefaultsControllers.js";

const router = express.Router();

router.get("/", getLeaseDefaults);
router.patch("/update-lease-defaults", protect, updateLeaseDefaults);

export default router;
