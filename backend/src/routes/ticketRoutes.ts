import { Router } from 'express';
import {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket
} from '../controllers/ticketController';

const router = Router();

router.post('/', createTicket);
router.get('/', getTickets);
router.get('/:id', getTicketById);
router.put('/:id', updateTicket);

export default router;
