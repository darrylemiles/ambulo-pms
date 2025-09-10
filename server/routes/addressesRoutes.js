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

router.post("/create-address", createAddress);
router.get("/", getAllAddresses);
router.get("/:id", getSingleAddressById);
router.patch("/:id", updateAddressById);
router.delete("/:id", deleteAddressById);

export default router;