import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
    createFaq,
    getAllFaqs,
    getSingleFaqById,
    updateFaqById,
    deleteFaqById
} from '../controllers/faqsControllers.js';

const router = express.Router();

router.post('/create-faq', protect, createFaq);
router.get('/', getAllFaqs);
router.get('/:id', getSingleFaqById);
router.patch('/:id', protect, updateFaqById);
router.delete('/:id', protect, deleteFaqById);

export default router;
