import type { Ticket } from '../types/index';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

let getClerkToken: (() => Promise<string | null>) | null = null;
export const setClerkTokenGetter = (getter: () => Promise<string | null>) => {
  getClerkToken = getter;
};

const getHeaders = async () => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (getClerkToken) {
    const token = await getClerkToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const fetchTickets = async (search?: string, status?: string, email?: string): Promise<Ticket[]> => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (status) params.append('status', status);
  if (email) params.append('email', email);
  
  const res = await fetch(`${API_BASE_URL}/tickets?${params.toString()}`, {
    headers: await getHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch tickets');
  return res.json();
};

export const fetchTicket = async (id: string): Promise<Ticket> => {
  const res = await fetch(`${API_BASE_URL}/tickets/${id}`, {
    headers: await getHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch ticket');
  return res.json();
};

export const createTicket = async (data: Partial<Ticket>): Promise<Ticket> => {
  const res = await fetch(`${API_BASE_URL}/tickets`, {
    method: 'POST',
    headers: await getHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create ticket');
  return res.json();
};

export const updateTicket = async (id: string, updates: { status?: string, priority?: string, notes?: string }) => {
  const res = await fetch(`${API_BASE_URL}/tickets/${id}`, {
    method: 'PUT',
    headers: await getHeaders(),
    body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error('Failed to update ticket');
  return res.json();
};

export const generateSmartReply = async (id: string): Promise<{ draft: string }> => {
  const res = await fetch(`${API_BASE_URL}/tickets/${id}/smart-reply`, {
    method: 'POST',
    headers: await getHeaders()
  });
  if (!res.ok) throw new Error('Failed to generate smart reply');
  return res.json();
};

export const summarizeTicketStream = async (id: string, onChunk: (text: string) => void): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/tickets/${id}/summarize`, {
    method: 'POST',
    headers: await getHeaders()
  });
  if (!res.ok) throw new Error('Failed to start stream');
  const reader = res.body?.getReader();
  if (!reader) return;
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop() || '';
    for (const part of parts) {
      if (part.startsWith('data: ')) {
        const dataStr = part.slice(6);
        if (dataStr === '[DONE]') return;
        try {
          const data = JSON.parse(dataStr);
          if (data.text) onChunk(data.text);
        } catch(e) {}
      }
    }
  }
};
