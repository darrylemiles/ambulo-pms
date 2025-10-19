import {
  createMessage,
  getMessagesByQuery,
  getMessageById,
  updateMessageById,
  deleteMessageById,
  getConversations,
  uploadAttachments
} from '../controllers/messagesControllers.js';
import { protect } from '../middlewares/authMiddleware.js';
import createUploadMiddleware from '../middlewares/multer/uploadMiddleware.js';

import express from "express";

const router = express.Router();

router.post('/', protect, createMessage);
router.post(
  '/upload-attachments',
  protect,
  createUploadMiddleware({
    fields: [ { name: 'attachments', maxCount: 10 } ],
    fieldFolders: { attachments: 'message_attachments' },
  }),
  uploadAttachments
);

router.get('/', getMessagesByQuery);
router.get('/conversations/:user_id', getConversations);
router.get('/:message_id', getMessageById);
router.patch('/:message_id', protect, updateMessageById);
router.delete('/:message_id', protect, deleteMessageById);

export default router;