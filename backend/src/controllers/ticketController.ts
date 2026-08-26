import { Request, Response } from 'express';
import prisma from '../prisma';

export const createTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customer_name, customer_email, subject, description, priority } = req.body;
    
    const tempId = `TEMP-${Date.now()}`;
    const ticket = await prisma.ticket.create({
      data: {
        ticketId: tempId,
        customerName: customer_name,
        customerEmail: customer_email,
        subject,
        description,
        priority: priority || 'MEDIUM',
      }
    });

    const finalTicketId = `TKT-${ticket.id.toString().padStart(3, '0')}`;
    const updated = await prisma.ticket.update({
      where: { id: ticket.id },
      data: { ticketId: finalTicketId }
    });

    res.status(201).json({ ticket_id: updated.ticketId, created_at: updated.createdAt });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
};

export const getTickets = async (req: Request, res: Response): Promise<void> => {
  try {
    const status = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;
    
    const whereClause: any = {};
    if (status) whereClause.status = status;
    if (search) {
      whereClause.OR = [
        { ticketId: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const tickets = await prisma.ticket.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    res.json(tickets.map(t => ({
      ticket_id: t.ticketId,
      customer_name: t.customerName,
      subject: t.subject,
      status: t.status,
      priority: t.priority,
      created_at: t.createdAt
    })));
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
};

export const getTicketById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const ticket = await prisma.ticket.findUnique({
      where: { ticketId: id },
      include: { notes: true }
    });

    if (!ticket) {
      res.status(404).json({ error: 'Ticket not found' });
      return;
    }
    
    res.json({
      ticket_id: ticket.ticketId,
      customer_name: ticket.customerName,
      customer_email: ticket.customerEmail,
      subject: ticket.subject,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      created_at: ticket.createdAt,
      notes: ticket.notes
    });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
};

export const updateTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status, priority, notes } = req.body;

    const ticket = await prisma.ticket.findUnique({ where: { ticketId: id } });
    if (!ticket) {
      res.status(404).json({ error: 'Ticket not found' });
      return;
    }

    let finalNoteText = notes;
    if (status && status !== ticket.status) {
      const statusMsg = `Status updated from ${ticket.status} to ${status}`;
      finalNoteText = notes ? `${statusMsg}.\n\nNote: ${notes}` : statusMsg;
    }

    const updated = await prisma.ticket.update({
      where: { ticketId: id },
      data: {
        ...(status && { status }),
        ...(priority && { priority }),
        ...(finalNoteText && {
          notes: {
            create: { text: finalNoteText }
          }
        })
      }
    });

    res.json({ success: true, updated_at: updated.updatedAt });
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
};
