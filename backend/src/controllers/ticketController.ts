import { Request, Response } from 'express';
import prisma from '../prisma';

// 1. Create Ticket
export const createTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customer_name, customer_email, subject, description, priority } = req.body;
    
    // Create with a placeholder ticketId first to get the autoincremented ID
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

    // Update with the formatted sequential ID (e.g., TKT-001)
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

// 2. List All Tickets (with search & filter)
export const getTickets = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, search } = req.query;
    const whereClause: any = {};
    
    if (status) {
      whereClause.status = status as string;
    }

    if (search) {
      const searchStr = search as string;
      whereClause.OR = [
        { ticketId: { contains: searchStr, mode: 'insensitive' } },
        { customerName: { contains: searchStr, mode: 'insensitive' } },
        { customerEmail: { contains: searchStr, mode: 'insensitive' } },
        { subject: { contains: searchStr, mode: 'insensitive' } },
        { description: { contains: searchStr, mode: 'insensitive' } }
      ];
    }

    const tickets = await prisma.ticket.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      select: {
        ticketId: true,
        customerName: true,
        subject: true,
        status: true,
        priority: true,
        createdAt: true
      }
    });

    // Map to spec format
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

// 3. View Ticket Details
export const getTicketById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const ticket = await prisma.ticket.findUnique({
      where: { ticketId: id },
      include: { notes: { orderBy: { createdAt: 'asc' } } }
    });

    if (!ticket) {
      res.status(404).json({ error: 'Ticket not found' });
      return;
    }
    
    // Format response to match spec
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
    console.error('Error fetching ticket details:', error);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
};

// 4. Update Ticket (Status, Priority, add Note)
export const updateTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, priority, notes } = req.body;

    const ticket = await prisma.ticket.findUnique({ where: { ticketId: id } });
    if (!ticket) {
      res.status(404).json({ error: 'Ticket not found' });
      return;
    }

    const updated = await prisma.ticket.update({
      where: { ticketId: id },
      data: {
        ...(status && { status }),
        ...(priority && { priority }),
        ...(notes && {
          notes: {
            create: { text: notes }
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
