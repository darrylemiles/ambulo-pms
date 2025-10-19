import {
  createMessage,
  getMessagesByQuery,
  getMessageById,
  updateMessageById,
  deleteMessageById,
  getConversations
} from '../controllers/messagesControllers.js';
import { protect } from '../middlewares/authMiddleware.js';

import express from "express";

const router = express.Router();

router.post('/', protect, createMessage);
router.get('/', getMessagesByQuery);
router.get('/conversations/:user_id', getConversations);
router.get('/:message_id', getMessageById);
router.patch('/:message_id', protect, updateMessageById);
router.delete('/:message_id', protect, deleteMessageById);

export default router;