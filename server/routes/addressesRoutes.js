import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
    createAddress,
    getAllAddresses,
    getSingleAddressById,
    updateAddressById,
    deleteAddressById
} from "../controllers/addressesControllers.js";

const router = express.Router();

router.post("/create-address", protect, createAddress);
router.get("/", getAllAddresses);
router.get("/:id", getSingleAddressById);
router.patch("/:id", protect, updateAddressById);
router.delete("/:id", protect, deleteAddressById);

export default router;