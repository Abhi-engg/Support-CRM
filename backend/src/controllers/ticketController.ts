import { Request, Response, NextFunction } from 'express';
import * as ticketService from '../services/ticketService';
import { createTicketSchema, updateTicketSchema } from '../schemas/ticketSchemas';
import { autoTriageTicket } from '../services/ai.service';

export const createTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validData = createTicketSchema.parse(req.body);
    const auth = (req as any).auth || {};
    const ticket = await ticketService.createTicket({ ...validData, userId: auth.userId, organizationId: auth.orgId });
    res.status(201).json({ ticket_id: ticket.ticketId, created_at: ticket.createdAt });
    
    // Asynchronously call AI triage
    autoTriageTicket(ticket.ticketId, validData.description, !!validData.priority).catch(err => {
      console.error("Background triage error:", err);
    });
  } catch (error) {
    next(error);
  }
};

export const getTickets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const status = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;
    const auth = (req as any).auth || {};
    const tickets = await ticketService.getTickets(auth.orgId, auth.userId, status, search);
    
    res.json(tickets.map(t => ({
      ticket_id: t.ticketId,
      customer_name: t.customerName,
      subject: t.subject,
      status: t.status,
      priority: t.priority,
      created_at: t.createdAt
    })));
  } catch (error) {
    next(error);
  }
};

export const getTicketById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const auth = (req as any).auth || {};
    const ticket = await ticketService.getTicketById(req.params.id as string, auth.orgId, auth.userId);
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
    next(error);
  }
};

export const updateTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validData = updateTicketSchema.parse(req.body);
    const auth = (req as any).auth || {};
    const updated = await ticketService.updateTicket(req.params.id as string, validData, auth.orgId, auth.userId);
    res.json({ success: true, updated_at: updated.updatedAt });
  } catch (error) {
    next(error);
  }
};

import { generateDraftResponse, summarizeTicketThread } from '../services/ai.service';

export const smartReply = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const auth = (req as any).auth || {};
    const ticket = await ticketService.getTicketById(req.params.id as string, auth.orgId, auth.userId);
    const notesText = ticket.notes.map(n => n.text);
    const draft = await generateDraftResponse(ticket.description, notesText);
    res.json({ draft });
  } catch (error) {
    next(error);
  }
};

export const summarizeThread = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const auth = (req as any).auth || {};
    const ticket = await ticketService.getTicketById(req.params.id as string, auth.orgId, auth.userId);
    const notesText = ticket.notes.map(n => n.text);
    const summary = await summarizeTicketThread(ticket.description, notesText);
    res.json({ summary });
  } catch (error) {
    next(error);
  }
};
