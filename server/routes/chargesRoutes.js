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

router.post('/create-charge', createCharge);
router.get('/', getAllCharges);
router.get('/:id', getChargeById);
router.get('/users/:user_id', getChargeByUserId);
router.get('/leases/:lease_id', getChargeByLeaseId);
router.patch('/:id', updateChargeById);
router.delete('/:id', deleteChargeById);

export default router;

