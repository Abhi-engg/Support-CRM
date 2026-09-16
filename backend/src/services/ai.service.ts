import { GoogleGenAI } from '@google/genai';
import { Priority, Sentiment, Category } from '@prisma/client';
import prisma from '../prisma';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const autoTriageTicket = async (ticketId: string, description: string, skipPriority: boolean = false) => {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("No GEMINI_API_KEY provided. Skipping AI Auto-Triage.");
    return;
  }

  try {
    const truncatedDescription = description.substring(0, 10000);
    const prompt = `
Analyze the following support ticket description and determine the best Priority (LOW, MEDIUM, HIGH, URGENT), Sentiment (POSITIVE, NEUTRAL, NEGATIVE), and Category (BUG, FEATURE_REQUEST, BILLING, GENERAL).
Return ONLY a valid JSON object with the keys "priority", "sentiment", and "category". Do not return markdown, just the JSON.
Description: "${truncatedDescription}"
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });
    
    const text = response.text || "{}";
    let parsed: any;
    try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const cleanedText = jsonMatch ? jsonMatch[0] : text;
        parsed = JSON.parse(cleanedText);
    } catch (e) {
        console.error("Failed to parse Gemini response", e);
        return;
    }

    const rawPriority = typeof parsed.priority === 'string' ? parsed.priority.trim().toUpperCase() : '';
    const rawSentiment = typeof parsed.sentiment === 'string' ? parsed.sentiment.trim().toUpperCase() : '';
    const rawCategory = typeof parsed.category === 'string' ? parsed.category.trim().toUpperCase() : '';

    const validPriority = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(rawPriority) ? rawPriority as Priority : undefined;
    const validSentiment = ['POSITIVE', 'NEUTRAL', 'NEGATIVE'].includes(rawSentiment) ? rawSentiment as Sentiment : undefined;
    const validCategory = ['BUG', 'FEATURE_REQUEST', 'BILLING', 'GENERAL'].includes(rawCategory) ? rawCategory as Category : undefined;

    const currentTicket = await prisma.ticket.findUnique({ where: { ticketId } });
    if (!currentTicket) return;

    if (currentTicket.status === 'CLOSED') return; 

    const isConcurrentUpdate = currentTicket.updatedAt.getTime() > currentTicket.createdAt.getTime();
    const shouldUpdatePriority = !skipPriority && !isConcurrentUpdate && validPriority;

    await prisma.ticket.update({
      where: { ticketId: ticketId },
      data: {
        ...(shouldUpdatePriority && { priority: validPriority }),
        ...(!isConcurrentUpdate && validSentiment && { sentiment: validSentiment }),
        ...(!isConcurrentUpdate && validCategory && { category: validCategory }),
        notes: {
            create: { text: `System: Ticket was auto-triaged by AI. Priority: ${validPriority}, Sentiment: ${validSentiment}, Category: ${validCategory}` }
        }
      }
    });

  } catch (error) {
    console.error("AI Auto-Triage failed:", error);
  }
};

export const generateDraftResponse = async (description: string, notes: string[]): Promise<string> => {
  if (!process.env.GEMINI_API_KEY) {
    return 'AI services are not configured.';
  }
  
  try {
    const thread = `Description:\n${description}\n\nNotes:\n${notes.join('\n')}`.substring(0, 30000);
    const prompt = `
You are a professional and empathetic customer support agent. 
Based on the following ticket description and internal notes thread, draft a response to the customer.
The response should be helpful, clear, and professional.
Do not include internal system notes or developer jargon unless necessary for the customer.

Ticket Thread:
${thread}

Draft Response:
`;
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });
    return response.text || 'Failed to generate response.';
  } catch (error) {
    console.error('AI Draft Response failed:', error);
    throw new Error('Failed to generate draft response.');
  }
};

export const summarizeTicketThread = async (description: string, notes: string[]): Promise<string> => {
  if (!process.env.GEMINI_API_KEY) {
    return 'AI services are not configured.';
  }

  try {
    const thread = `Description:\n${description}\n\nNotes:\n${notes.join('\n')}`.substring(0, 30000);
    const prompt = `
Provide a concise TL;DR summary of the following support ticket thread. 
Focus on the main issue, the troubleshooting steps taken, and the current status or next steps.

Ticket Thread:
${thread}

TL;DR Summary:
`;
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });
    return response.text || 'Failed to summarize thread.';
  } catch (error) {
    console.error('AI Summarization failed:', error);
    throw new Error('Failed to summarize ticket thread.');
  }
};

export const summarizeTicketThreadStream = async (description: string, notes: string[]) => {
  if (!process.env.GEMINI_API_KEY) throw new Error('AI services are not configured.');
  const thread = `Description:\n${description}\n\nNotes:\n${notes.join('\n')}`.substring(0, 30000);
  const prompt = `Provide a concise TL;DR summary of the following support ticket thread. 
Focus on the main issue, the troubleshooting steps taken, and the current status or next steps.

Ticket Thread:
${thread}

TL;DR Summary:`;
  return await ai.models.generateContentStream({
    model: 'gemini-3.6-flash',
    contents: prompt,
  });
};
