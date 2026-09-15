import { Router } from 'express';
import { protectRoute } from '../middlewares/authMiddleware';
import {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket
} from '../controllers/ticketController';

const router = Router();

router.use(protectRoute);

router.post('/', createTicket);
router.get('/', getTickets);
router.get('/:id', getTicketById);
router.put('/:id', updateTicket);

export default router;
