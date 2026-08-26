export const API_BASE_URL = 'http://localhost:3000/api';

export interface Ticket {
  ticket_id: string;
  customer_name: string;
  customer_email?: string;
  subject: string;
  description?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  created_at: string;
  notes?: Note[];
}

export interface Note {
  id: number;
  text: string;
  createdAt: string;
}

export const fetchTickets = async (search?: string, status?: string): Promise<Ticket[]> => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (status) params.append('status', status);
  
  const res = await fetch(`${API_BASE_URL}/tickets?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch tickets');
  return res.json();
};

export const fetchTicket = async (id: string): Promise<Ticket> => {
  const res = await fetch(`${API_BASE_URL}/tickets/${id}`);
  if (!res.ok) throw new Error('Failed to fetch ticket');
  return res.json();
};

export const createTicket = async (data: Partial<Ticket>): Promise<Ticket> => {
  const res = await fetch(`${API_BASE_URL}/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create ticket');
  return res.json();
};

export const updateTicket = async (id: string, updates: { status?: string, priority?: string, notes?: string }) => {
  const res = await fetch(`${API_BASE_URL}/tickets/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error('Failed to update ticket');
  return res.json();
};
