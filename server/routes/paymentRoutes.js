import express from "express";
import { protect } from "../middlewares/authMiddleware.js";

import {
    //createPayment,
    getAllPayments,
    getPaymentById,
    updatePayment
} from "../controllers/paymentControllers.js";
const router = express.Router();

//router.post('/', createPayment);
router.get('/', getAllPayments);
router.get('/:id', getPaymentById);
router.put('/:id', updatePayment);
export default router;

