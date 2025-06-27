import express from 'express';
import { createTicket, getTickets, getSingleTicketById, getTicketsByUserId, updateTicket, deleteTicket } from '../controllers/ticketsControllers.js';

const router = express.Router();

router.post('/create-ticket', createTicket);
router.get('/', getTickets);
router.get('/:ticket_id', getSingleTicketById);
router.get('/user/:user_id', getTicketsByUserId);
router.patch('/:ticket_id', updateTicket);
router.delete('/:ticket_id', deleteTicket);

export default router;