import prisma from '../prisma';

export const createTicket = async (data: any) => {
  const tempId = `TEMP-${Date.now()}`;
  const ticket = await prisma.ticket.create({
    data: {
      ticketId: tempId,
      customerName: data.customer_name,
      customerEmail: data.customer_email,
      subject: data.subject,
      description: data.description,
      priority: data.priority || 'MEDIUM',
    }
  });

  const finalTicketId = `TKT-${ticket.id.toString().padStart(3, '0')}`;
  return await prisma.ticket.update({
    where: { id: ticket.id },
    data: { ticketId: finalTicketId }
  });
};

export const getTickets = async (status?: string, search?: string) => {
  const whereClause: any = {};
  if (status) whereClause.status = status;
  if (search) {
    const searchLower = search.toLowerCase();
    whereClause.OR = [
      { ticketId: { contains: search, mode: 'insensitive' } },
      { customerName: { contains: search, mode: 'insensitive' } },
      { customerEmail: { contains: search, mode: 'insensitive' } },
      { subject: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { ticketId: { contains: searchLower } },
      { customerName: { contains: searchLower } },
      { customerEmail: { contains: searchLower } },
      { subject: { contains: searchLower } },
      { description: { contains: searchLower } }
    ];
  }

  return await prisma.ticket.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' }
  });
};

export const getTicketById = async (id: string) => {
  const ticket = await prisma.ticket.findUnique({
    where: { ticketId: id },
    include: { notes: true }
  });
  if (!ticket) throw new Error('Ticket not found');
  return ticket;
};

export const updateTicket = async (id: string, data: any) => {
  const ticket = await prisma.ticket.findUnique({ where: { ticketId: id } });
  if (!ticket) throw new Error('Ticket not found');

  let finalNoteText = data.notes;
  if (data.status && data.status !== ticket.status) {
    const statusMsg = `Status updated from ${ticket.status} to ${data.status}`;
    finalNoteText = data.notes ? `${statusMsg}.\n\nNote: ${data.notes}` : statusMsg;
  }

  return await prisma.ticket.update({
    where: { ticketId: id },
    data: {
      ...(data.status && { status: data.status }),
      ...(data.priority && { priority: data.priority }),
      ...(finalNoteText && {
        notes: {
          create: { text: finalNoteText }
        }
      })
    }
  });
};
