import { useState, useEffect } from 'react';
import type { Ticket } from '../types/index';
import { fetchTickets, fetchTicket } from '../api/index';

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeTicketData, setActiveTicketData] = useState<Ticket | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTicket, setIsLoadingTicket] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadTickets();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const loadTickets = async () => {
    setIsLoading(true);
    try {
      const data = await fetchTickets(search, statusFilter);
      setTickets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadActiveTicket = async (id: string) => {
    setIsLoadingTicket(true);
    try {
      const data = await fetchTicket(id);
      setActiveTicketData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingTicket(false);
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
    isLoading,
    isLoadingTicket,
    loadTickets, 
    loadActiveTicket
  };
}
