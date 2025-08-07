import express from 'express';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware.js';
import {
  createTicket,
  updateTicketStatuses,
  getTickets,
  getSingleTicketById,
  getTicketsByUserId,
  updateTicketById,
  deleteTicket,
} from "../controllers/ticketsControllers.js";

import createUploadMiddleware from '../middlewares/multer/uploadMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.post(
    '/create-ticket',
    createUploadMiddleware({
    fields: [
      { name: 'attachments', maxCount: 5 },
    ],
    fieldFolders: {
      attachments: 'ticket_attachments',
    },
  }),
    createTicket
);

router.post('/update-ticket-statuses', updateTicketStatuses);

router.get('/', getTickets);
router.get('/:ticket_id', getSingleTicketById);
router.get('/user/:user_id', getTicketsByUserId);

router.patch('/:ticket_id', createUploadMiddleware({
    fields: [
      { name: 'attachments', maxCount: 5 },
    ],
    fieldFolders: {
      attachments: 'ticket_attachments',
    },
  }),
    updateTicketById);

router.delete('/:ticket_id', deleteTicket);

export default router;