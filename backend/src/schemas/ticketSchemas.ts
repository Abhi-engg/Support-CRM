import { z } from 'zod';

export const createTicketSchema = z.object({
  customer_name: z.string().min(1, 'Name is required'),
  customer_email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  description: z.string().min(1, 'Description is required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional()
});

export const updateTicketSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'CLOSED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  notes: z.string().optional()
});
