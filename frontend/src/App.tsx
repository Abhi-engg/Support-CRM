import { useState, useEffect } from 'react';
import { SignedIn, SignedOut, SignIn, useAuth } from '@clerk/clerk-react';
import { useTickets } from './hooks/useTickets';
import { createTicket, updateTicket, setClerkTokenGetter } from './api/index';

import TicketSidebar from './components/TicketSidebar';
import TicketDetail from './components/TicketDetail';
import CreateTicketForm from './components/CreateTicketForm';
import Dashboard from './components/Dashboard';

export default function App() {
  const { getToken } = useAuth();
  
  useEffect(() => {
    setClerkTokenGetter(() => getToken());
  }, [getToken]);

  return (
    <>
      <SignedIn>
        <CRMApp />
      </SignedIn>
      <SignedOut>
        <div className="flex h-screen w-screen items-center justify-center bg-zinc-50">
          <SignIn routing="hash" />
        </div>
      </SignedOut>
    </>
  );
}

function CRMApp() {
  const { 
    tickets, search, setSearch, statusFilter, setStatusFilter,
    activeTicketData, setActiveTicketData, isLoading, isLoadingTicket, loadTickets, loadActiveTicket
  } = useTickets();

  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectTicket = (id: string) => {
    setActiveTicketId(id);
    setIsCreating(false);
    
    // Optimistic Cache Lifting: Instantly show the ticket details using the basic info from the list
    const cached = tickets.find(t => t.ticket_id === id);
    if (cached) setActiveTicketData(cached as any);
    
    loadActiveTicket(id);
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setActiveTicketId(null);
  };

  const handleBackToQueue = () => {
    setActiveTicketId(null);
    setIsCreating(false);
  };

  const handleCreateSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const newTicket = await createTicket(data);
      setIsCreating(false);
      handleSelectTicket(newTicket.ticket_id);
      loadTickets();
    } catch (err) {
      console.error('Failed to create ticket', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSubmit = async (id: string, updates: any) => {
    setIsSubmitting(true);
    try {
      await updateTicket(id, updates);
      loadActiveTicket(id);
      loadTickets();
    } catch (err) {
      console.error('Failed to update ticket', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasActiveView = activeTicketId !== null || isCreating;

  return (
    <div className="flex h-screen bg-zinc-50 text-zinc-900 overflow-hidden font-sans selection:bg-zinc-200">
      <TicketSidebar 
        tickets={tickets}
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        activeTicketId={activeTicketId}
        isCreating={isCreating}
        isLoading={isLoading}
        onSelectTicket={handleSelectTicket}
        onCreateNew={handleCreateNew}
        hiddenOnMobile={hasActiveView}
      />

      <div className={`flex-1 bg-white relative z-0 overflow-y-auto ${!hasActiveView ? 'hidden md:block' : 'block'}`}>
        {isCreating ? (
          <CreateTicketForm isSubmitting={isSubmitting} onSubmit={handleCreateSubmit} onBack={handleBackToQueue} />
        ) : activeTicketData && activeTicketId === activeTicketData.ticket_id ? (
          <TicketDetail ticket={activeTicketData} isSubmitting={isSubmitting} isLoadingNotes={isLoadingTicket} onUpdate={handleUpdateSubmit} onBack={handleBackToQueue} />
        ) : (
          <div className="hidden md:block h-full w-full">
            <Dashboard tickets={tickets} />
          </div>
        )}
      </div>
    </div>
  );
}
