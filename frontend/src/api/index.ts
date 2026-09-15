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

export const fetchTickets = async (search?: string, status?: string): Promise<Ticket[]> => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (status) params.append('status', status);
  
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
