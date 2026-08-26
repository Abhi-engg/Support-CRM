import { useState, useEffect } from 'react';
import { Ticket } from '../types';
import { fetchTickets, fetchTicket } from '../api';

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeTicketData, setActiveTicketData] = useState<Ticket | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadTickets();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const loadTickets = async () => {
    try {
      const data = await fetchTickets(search, statusFilter);
      setTickets(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadActiveTicket = async (id: string) => {
    try {
      const data = await fetchTicket(id);
      setActiveTicketData(data);
    } catch (err) {
      console.error(err);
    }
  };

  return {
    tickets, 
    search, 
    setSearch, 
    statusFilter, 
    setStatusFilter,
    activeTicketData, 
    setActiveTicketData,
    loadTickets, 
    loadActiveTicket
  };
}
