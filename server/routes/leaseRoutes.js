import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
    createLease,
    getAllLeases,
    getSingleLeaseById,
    getLeaseByUserId,
    updateLeaseById,
    deleteLeaseById
} from '../controllers/leaseControllers.js';

const router = express.Router();

router.post('/create-lease', protect, createLease);
router.get('/', getAllLeases);
router.get('/:id', getSingleLeaseById);
router.get('/user/:user_id', getLeaseByUserId);
router.patch('/:id', protect, updateLeaseById);
router.delete('/:id', protect, deleteLeaseById);

export default router;
