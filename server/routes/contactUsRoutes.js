import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { 
  createContactUsEntry,
    getAllContactUsEntries,
    getContactUsEntryById,
    editContactUsEntry,
    deleteContactUsEntry
 } from '../controllers/contactUsControllers.js';

const router = express.Router();

router.post('/create-contact', createContactUsEntry);
router.get('/', getAllContactUsEntries);
router.get('/:entry_id', getContactUsEntryById);
router.patch('/:entry_id', editContactUsEntry);
router.delete('/:entry_id', deleteContactUsEntry);

export default router;