import express from 'express';
import {
    createLease,
    getAllLeases,
    getSingleLeaseById,
    getLeaseByUserId,
    updateLeaseById,
    deleteLeaseById
} from '../controllers/leaseControllers.js';

const router = express.Router();

router.post('/create-lease', createLease);
router.get('/', getAllLeases);
router.get('/:id', getSingleLeaseById);
router.get('/user/:user_id', getLeaseByUserId);
router.patch('/:id', updateLeaseById);
router.delete('/:id', deleteLeaseById);

export default router;
