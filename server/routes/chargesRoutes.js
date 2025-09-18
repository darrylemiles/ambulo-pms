import express from "express";

import { protect } from "../middlewares/authMiddleware.js";

import {
    createCharge,
    getAllCharges,
    getChargeById,
    getChargeByLeaseId,
    updateChargeById,
    deleteChargeById
} from "../controllers/chargesControllers.js";

const router = express.Router();

router.post('/create-charge', createCharge);
router.get('/', getAllCharges);
router.get('/:id', getChargeById);
router.get('/leases/:leaseId', getChargeByLeaseId);
router.patch('/:id', updateChargeById);
router.delete('/:id', deleteChargeById);

export default router;

