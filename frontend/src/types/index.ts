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
