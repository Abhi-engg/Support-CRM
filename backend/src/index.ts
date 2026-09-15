import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { clerkMiddleware } from '@clerk/express';
import ticketRoutes from './routes/ticketRoutes';
import { errorHandler } from './middlewares/errorHandler';

dotenv.config();

const app = express();
app.use(clerkMiddleware());
const PORT = process.env.PORT || 3000;

// 1. Security Headers (Helmet)
app.use(helmet());

// 2. DDoS Protection (Rate Limiting)
// Limits each IP to 100 requests per 15 minutes.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' },
  standardHeaders: true, 
  legacyHeaders: false, 
});
app.use('/api/', apiLimiter);

app.use(cors());
app.use(express.json());

// Mount the ticket routes under /api/tickets
app.use('/api/tickets', ticketRoutes);

// Simple healthcheck endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Centralized error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
