import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
    createCharge,
    getAllCharges,
    getChargeById,
    getChargeByUserId,
    getChargeByLeaseId,
    updateChargeById,
    deleteChargeById,
    getRecurringTemplateById,
    updateRecurringTemplateById,
    getChargesStats
} from "../controllers/chargesControllers.js";

const router = express.Router();

router.post('/create-charge', protect, createCharge);
router.get('/', getAllCharges);
router.get('/stats', getChargesStats);
router.get('/users/:userId', getChargeByUserId);
router.get('/leases/:leaseId', getChargeByLeaseId);
router.get('/:id', getChargeById);
router.patch('/:id', protect, updateChargeById);
router.delete('/:id', protect, deleteChargeById);

router.get('/recurring-templates/:templateId', protect, getRecurringTemplateById);
router.patch('/recurring-templates/:templateId', protect, updateRecurringTemplateById);

export default router;

