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
