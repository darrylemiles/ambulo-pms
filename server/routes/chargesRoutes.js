import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
    createCharge,
    getAllCharges,
    getChargeById,
    getChargeByUserId,
    getChargeByLeaseId,
    updateChargeById,
    deleteChargeById
} from "../controllers/chargesControllers.js";

const router = express.Router();

router.post('/create-charge', protect, createCharge);
router.get('/', getAllCharges);
router.get('/:id', getChargeById);
router.get('/users/:userId', getChargeByUserId);
router.get('/leases/:leaseId', getChargeByLeaseId);
router.patch('/:id', protect, updateChargeById);
router.delete('/:id', protect, deleteChargeById);

export default router;

