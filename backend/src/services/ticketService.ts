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
      organizationId: data.organizationId || null,
      userId: data.userId || null,
    }
  });

  const finalTicketId = `TKT-${ticket.id.toString().padStart(3, '0')}`;
  return await prisma.ticket.update({
    where: { id: ticket.id },
    data: { ticketId: finalTicketId }
  });
};

export const getTickets = async (orgId?: string, userId?: string, status?: string, search?: string, email?: string) => {
  const authOrConditions = [];
  if (orgId) authOrConditions.push({ organizationId: orgId });
  if (userId) authOrConditions.push({ userId: userId });
  authOrConditions.push({ userId: null, organizationId: null });

  const whereClause: any = {
    AND: [
      { OR: authOrConditions }
    ]
  };

  if (status) {
    whereClause.AND.push({ status: status });
  }

  if (email) {
    whereClause.AND.push({ customerEmail: email });
  }

  if (search) {
    const searchLower = search.toLowerCase();
    whereClause.AND.push({
      OR: [
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
      ]
    });
  }

  return await prisma.ticket.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' }
  });
};

export const getTicketById = async (id: string, orgId?: string, userId?: string) => {
  const authOrConditions = [];
  if (orgId) authOrConditions.push({ organizationId: orgId });
  if (userId) authOrConditions.push({ userId: userId });
  authOrConditions.push({ userId: null, organizationId: null });

  const ticket = await prisma.ticket.findFirst({
    where: {
      ticketId: id,
      OR: authOrConditions
    },
    include: { notes: true }
  });
  if (!ticket) throw new Error('Ticket not found');
  return ticket;
};

export const updateTicket = async (id: string, data: any, orgId?: string, userId?: string) => {
  const authOrConditions = [];
  if (orgId) authOrConditions.push({ organizationId: orgId });
  if (userId) authOrConditions.push({ userId: userId });
  authOrConditions.push({ userId: null, organizationId: null });

  const ticket = await prisma.ticket.findFirst({
    where: {
      ticketId: id,
      OR: authOrConditions
    }
  });
  if (!ticket) throw new Error('Ticket not found');

  let finalNoteText = data.notes;
  if (data.status && data.status !== ticket.status) {
    const statusMsg = `Status updated from ${ticket.status} to ${data.status}`;
    finalNoteText = data.notes ? `${statusMsg}.\n\nNote: ${data.notes}` : statusMsg;
  }

  return await prisma.ticket.update({
    where: { id: ticket.id },
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
