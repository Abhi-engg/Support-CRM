import { useState, useEffect } from 'react';
import type { Ticket } from '../types/index';
import TicketHeader from './TicketHeader';
import TicketTimeline from './TicketTimeline';
import TicketReplyForm from './TicketReplyForm';

interface Props {
  ticket: Ticket;
  isSubmitting: boolean;
  isLoadingNotes: boolean;
  onUpdate: (id: string, updates: any) => Promise<void>;
  onBack: () => void;
}

export default function TicketDetail({ ticket, isSubmitting, isLoadingNotes, onUpdate, onBack }: Props) {
  const [newNote, setNewNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState<string>(ticket.status);
  const [showSuccess, setShowSuccess] = useState(false);

  // Sync state if ticket changes (e.g., selecting a new ticket from sidebar)
  useEffect(() => {
    setUpdatingStatus(ticket.status);
    setNewNote('');
  }, [ticket.ticket_id, ticket.status]);

  const hasChanges = newNote.trim().length > 0 || updatingStatus !== ticket.status;

  const handleSave = async () => {
    if (!hasChanges) return;
    await onUpdate(ticket.ticket_id, {
      status: updatingStatus !== ticket.status ? updatingStatus : undefined,
      notes: newNote.trim() || undefined
    });
    setNewNote('');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 lg:p-12 max-w-4xl mx-auto animate-in fade-in duration-300">
      <TicketHeader ticket={ticket} onBack={onBack} />
      <TicketTimeline notes={ticket.notes} isLoadingNotes={isLoadingNotes} />
      <TicketReplyForm 
        newNote={newNote}
        setNewNote={setNewNote}
        updatingStatus={updatingStatus}
        setUpdatingStatus={setUpdatingStatus}
        isSubmitting={isSubmitting}
        hasChanges={hasChanges}
        showSuccess={showSuccess}
        handleSave={handleSave}
      />
    </div>
  );
}
