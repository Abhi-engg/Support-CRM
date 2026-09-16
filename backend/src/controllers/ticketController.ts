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
    const email = req.query.email as string | undefined;
    const auth = (req as any).auth || {};
    const tickets = await ticketService.getTickets(auth.orgId, auth.userId, status, search, email);
    
    res.json(tickets.map(t => ({
      ticket_id: t.ticketId,
      customer_name: t.customerName,
      customer_email: t.customerEmail,
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
    
    // Fetch previous state to detect status change
    const previousTicket = await ticketService.getTicketById(req.params.id as string, auth.orgId, auth.userId);
    
    const updated = await ticketService.updateTicket(req.params.id as string, validData, auth.orgId, auth.userId);
    
    if (validData.status === 'CLOSED' && previousTicket.status !== 'CLOSED') {
      console.log(`[CSAT Automation] Sending 1-to-5 star CSAT survey email to customer for ticket ${updated.ticketId}`);
    }

    res.json({ success: true, updated_at: updated.updatedAt });
  } catch (error) {
    next(error);
  }
};

import { generateDraftResponse, summarizeTicketThread, summarizeTicketThreadStream } from '../services/ai.service';

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
    
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    const stream = await summarizeTicketThreadStream(ticket.description, notesText);
    for await (const chunk of stream) {
      if (chunk.text) {
        res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
      }
    }
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error("Streaming error:", error);
    res.write(`data: ${JSON.stringify({ error: 'Failed to generate summary' })}\n\n`);
    res.end();
  }
};

export const handleEmailWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { from, subject, text } = req.body;
    if (!from || !text) {
      res.status(400).json({ error: 'Missing required email fields' });
      return;
    }
    
    let email = from;
    let name = from.split('@')[0];
    
    // Extract actual email if formatted like "Name <email@example.com>"
    const emailMatch = from.match(/<([^>]+)>/);
    if (emailMatch) {
      email = emailMatch[1].trim();
      name = from.replace(/<[^>]+>/, '').trim();
    }
    if (!name) name = email.split('@')[0];
    
    const ticketData = {
      customer_name: name,
      customer_email: email,
      subject: subject || 'No Subject',
      description: text,
      priority: 'MEDIUM'
    };
    
    const ticket = await ticketService.createTicket(ticketData);
    
    // Auto triage for the webhook ticket
    autoTriageTicket(ticket.ticketId, ticketData.description, false).catch(err => {
      console.error("Background triage error:", err);
    });

    res.status(200).json({ success: true, ticket_id: ticket.ticketId });
  } catch (error) {
    next(error);
  }
};

