import express from "express";
import { protect } from "../middlewares/authMiddleware.js";

import {
    createPayment,
    getAllPayments,
    getPaymentById,
    updatePaymentById,
    deletePaymentById,
    searchPayments,
} from "../controllers/paymentsControllers.js";

import createUploadMiddleware from "../middlewares/multer/uploadMiddleware.js";

const router = express.Router();

router.post(
    "/create-payment",
    protect,
    createUploadMiddleware({
        fields: [{ name: "proofs", maxCount: 5 }],
        fieldFolders: { proofs: "payment_proofs" },
    }),
    createPayment
);
router.get("/", getAllPayments);
router.get("/:id", getPaymentById);
router.get("/search/by-charge", protect, searchPayments);
router.patch(
    "/:id",
    protect,
    createUploadMiddleware({
        fields: [{ name: "proofs", maxCount: 5 }],
        fieldFolders: { proofs: "payment_proofs" },
    }),
    updatePaymentById
);
router.delete("/:id", protect, deletePaymentById);

export default router;
