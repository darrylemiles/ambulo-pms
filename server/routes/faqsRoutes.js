import express from 'express';
import {
    createFaq,
    getAllFaqs,
    getSingleFaqById,
    updateFaqById,
    deleteFaqById
} from '../controllers/faqsControllers.js';

const router = express.Router();

router.post('/create-faq', createFaq);
router.get('/', getAllFaqs);
router.get('/:id', getSingleFaqById);
router.patch('/:id', updateFaqById);
router.delete('/:id', deleteFaqById);

export default router;
