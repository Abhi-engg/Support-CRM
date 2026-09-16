import cron from 'node-cron';
import prisma from '../prisma';
import { TicketStatus, Priority } from '@prisma/client';

export const initCronJobs = () => {
  // Run every 10 minutes
  cron.schedule('*/10 * * * *', async () => {
    try {
      console.log('Running SLA breach check cron job...');
      const now = new Date();

      // 1. Tickets open for > 24 hours
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const staleTickets = await prisma.ticket.findMany({
        where: {
          status: { not: TicketStatus.CLOSED },
          createdAt: { lt: twentyFourHoursAgo },
          notes: {
            none: { text: { startsWith: 'System: SLA Breach - Ticket open for > 24 hours' } }
          }
        },
      });

      for (const ticket of staleTickets) {
        const newPriority = ticket.priority === Priority.URGENT ? Priority.URGENT : Priority.HIGH;
        const msg = ticket.priority === Priority.URGENT 
          ? 'System: SLA Breach - Ticket open for > 24 hours. Priority remains URGENT.'
          : 'System: SLA Breach - Ticket open for > 24 hours. Priority escalated to HIGH.';

        await prisma.ticket.update({
          where: { id: ticket.id },
          data: {
            priority: newPriority,
            notes: {
              create: { text: msg }
            }
          }
        });
        console.log(`SLA breach: Ticket ${ticket.ticketId} marked. Priority: ${newPriority}.`);
      }

      // 2. URGENT tickets unassigned/unresolved for > 30 mins
      const thirtyMinsAgo = new Date(now.getTime() - 30 * 60 * 1000);
      const urgentTickets = await prisma.ticket.findMany({
        where: {
          status: { not: TicketStatus.CLOSED },
          priority: Priority.URGENT,
          createdAt: { lt: thirtyMinsAgo },
          notes: {
            none: { text: { startsWith: 'System: CRITICAL SLA Breach' } }
          }
        }
      });

      for (const ticket of urgentTickets) {
        await prisma.ticket.update({
          where: { id: ticket.id },
          data: {
            notes: {
              create: { text: 'System: CRITICAL SLA Breach - URGENT ticket open for > 30 mins. Immediate attention required.' }
            }
          }
        });
        console.log(`SLA breach: Ticket ${ticket.ticketId} marked as CRITICAL.`);
      }
    } catch (err) {
      console.error('Error in SLA cron job:', err);
    }
  });
};
