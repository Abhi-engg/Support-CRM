import { Router } from 'express';
import { protectRoute } from '../middlewares/authMiddleware';
import {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  smartReply,
  summarizeThread,
  handleEmailWebhook
} from '../controllers/ticketController';

const router = Router();

// Webhook endpoint (unprotected)
router.post('/webhooks/email', handleEmailWebhook);

router.use(protectRoute);

router.post('/', createTicket);
router.get('/', getTickets);
router.get('/:id', getTicketById);
router.put('/:id', updateTicket);
router.post('/:id/smart-reply', smartReply);
router.post('/:id/summarize', summarizeThread);

export default router;
