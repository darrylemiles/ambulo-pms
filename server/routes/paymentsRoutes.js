import express from "express";
import { protect } from "../middlewares/authMiddleware.js";

import {
    createPayment,
    getAllPayments,
    getPaymentById,
    updatePaymentById,
    deletePaymentById,
} from "../controllers/paymentsControllers.js";

import createUploadMiddleware from "../middlewares/multer/uploadMiddleware.js";

const router = express.Router();

router.post(
    "/create-payment",
    createUploadMiddleware({
        fields: [{ name: "proofs", maxCount: 5 }],
        fieldFolders: { proofs: "payment_proofs" },
    }),
    createPayment
);
router.get("/", getAllPayments);
router.get("/:id", getPaymentById);
router.patch(
    "/:id",
    createUploadMiddleware({
        fields: [{ name: "proofs", maxCount: 5 }],
        fieldFolders: { proofs: "payment_proofs" },
    }),
    updatePaymentById
);
router.delete("/:id", deletePaymentById);

export default router;
