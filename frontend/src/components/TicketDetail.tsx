import { useState, useEffect } from 'react';
import type { Ticket } from '../types/index';
import TicketHeader from './TicketHeader';
import TicketTimeline from './TicketTimeline';
import TicketReplyForm from './TicketReplyForm';
import { generateSmartReply, summarizeTicket } from '../api';
import { Sparkles, Loader2 } from 'lucide-react';

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
  
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  // Sync state if ticket changes (e.g., selecting a new ticket from sidebar)
  useEffect(() => {
    setUpdatingStatus(ticket.status);
    setNewNote('');
    setSummary(null);
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

  const handleGenerateReply = async () => {
    setIsGeneratingReply(true);
    try {
      const { draft } = await generateSmartReply(ticket.ticket_id);
      setNewNote((prev) => prev ? `${prev}\n\n${draft}` : draft);
    } catch (error) {
      console.error('Failed to generate smart reply', error);
      alert('Failed to generate smart reply.');
    } finally {
      setIsGeneratingReply(false);
    }
  };

  const handleSummarize = async () => {
    setIsSummarizing(true);
    try {
      const { summary: s } = await summarizeTicket(ticket.ticket_id);
      setSummary(s);
    } catch (error) {
      console.error('Failed to summarize thread', error);
      alert('Failed to summarize thread.');
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 lg:p-12 max-w-4xl mx-auto animate-in fade-in duration-300">
      <TicketHeader ticket={ticket} onBack={onBack} />
      
      <div className="flex justify-between items-center mb-4 mt-8 border-t pt-8">
        <h3 className="text-xl font-semibold text-zinc-900">Activity Timeline</h3>
        <button 
          onClick={handleSummarize}
          disabled={isSummarizing}
          className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md transition-colors"
        >
          {isSummarizing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          Summarize Thread
        </button>
      </div>

      {summary && (
        <div className="mb-6 p-4 bg-indigo-50/50 border border-indigo-100 rounded-lg">
          <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Sparkles size={12} /> AI Summary
          </h4>
          <p className="text-sm text-indigo-900 whitespace-pre-wrap">{summary}</p>
        </div>
      )}

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
        handleGenerateReply={handleGenerateReply}
        isGeneratingReply={isGeneratingReply}
      />
    </div>
  );
}
