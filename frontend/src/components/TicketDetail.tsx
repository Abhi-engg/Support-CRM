import { useState, useEffect } from 'react';
import type { Ticket } from '../types/index';
import TicketHeader from './TicketHeader';
import TicketTimeline from './TicketTimeline';
import TicketReplyForm from './TicketReplyForm';
import { generateSmartReply, summarizeTicketStream, fetchTickets } from '../api';
import ReactMarkdown from 'react-markdown';
import { Sparkles, Loader2, User, Star, Receipt } from 'lucide-react';

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

  const [pastTickets, setPastTickets] = useState<Ticket[]>([]);
  const [isLoadingPast, setIsLoadingPast] = useState(false);

  // Sync state if ticket changes (e.g., selecting a new ticket from sidebar)
  useEffect(() => {
    setUpdatingStatus(ticket.status);
    setNewNote('');
    setSummary(null);
    
    // Fetch past tickets
    if (ticket.customer_email) {
      setIsLoadingPast(true);
      fetchTickets(undefined, undefined, ticket.customer_email)
        .then(tickets => {
          // Exclude current ticket
          setPastTickets(tickets.filter(t => t.ticket_id !== ticket.ticket_id).slice(0, 5));
        })
        .catch(err => console.error("Failed to fetch past tickets", err))
        .finally(() => setIsLoadingPast(false));
    }
  }, [ticket.ticket_id, ticket.status, ticket.customer_email]);

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
    setSummary('');
    try {
      await summarizeTicketStream(ticket.ticket_id, (chunk) => {
        setSummary((prev) => (prev || '') + chunk);
      });
    } catch (error) {
      console.error('Failed to summarize thread', error);
      alert('Failed to summarize thread.');
    } finally {
      setIsSummarizing(false);
    }
  };

  // Mock LTV and Tier based on email length just for stability
  const mockTier = (ticket.customer_email || '').length % 2 === 0 ? 'Pro' : 'Free';
  const mockLTV = ((ticket.customer_email || '').length * 150) + 120;

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10 max-w-7xl mx-auto animate-in fade-in duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
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

          {summary !== null && (
            <div className="mb-6 p-4 bg-indigo-50/50 border border-indigo-100 rounded-lg">
              <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Sparkles size={12} /> AI Summary
              </h4>
              <div className="text-sm text-indigo-950">
                <ReactMarkdown
                  components={{
                    ul: ({node, ...props}) => <ul className="list-disc pl-5 my-2" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal pl-5 my-2" {...props} />,
                    li: ({node, ...props}) => <li className="mb-1 leading-relaxed" {...props} />,
                    p: ({node, ...props}) => <p className="my-2 first:mt-0 last:mb-0" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-semibold text-indigo-900" {...props} />,
                  }}
                >
                  {summary || 'Generating summary...'}
                </ReactMarkdown>
              </div>
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

        {/* Customer 360 Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
              <User size={18} className="text-zinc-500" />
              Customer 360
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Customer</p>
                <p className="text-sm font-medium text-zinc-900 mt-1">{ticket.customer_name || 'Unknown'}</p>
                <p className="text-sm text-zinc-600">{ticket.customer_email || 'No email'}</p>
              </div>
              
              <div className="flex items-center gap-4 pt-3 border-t border-zinc-100">
                <div className="flex-1">
                  <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider flex items-center gap-1">
                    <Star size={12} className="text-amber-500" /> Tier
                  </p>
                  <p className="text-sm font-semibold text-zinc-900 mt-1">
                    {mockTier} {mockTier === 'Pro' && <span className="text-amber-500 text-xs">★</span>}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider flex items-center gap-1">
                    <Receipt size={12} className="text-emerald-500" /> LTV
                  </p>
                  <p className="text-sm font-semibold text-emerald-600 mt-1">${mockLTV.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-zinc-900 mb-3 uppercase tracking-wider">Past Tickets</h3>
            
            {isLoadingPast ? (
              <div className="flex items-center justify-center py-6 text-zinc-400">
                <Loader2 size={20} className="animate-spin" />
              </div>
            ) : pastTickets.length > 0 ? (
              <div className="space-y-3">
                {pastTickets.map(pt => (
                  <div key={pt.ticket_id} className="text-sm p-3 border border-zinc-100 rounded bg-zinc-50/50 hover:bg-zinc-50 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-zinc-900 truncate pr-2">{pt.subject || 'No Subject'}</span>
                      <span className="text-xs text-zinc-500 whitespace-nowrap">{pt.ticket_id}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        pt.status === 'CLOSED' ? 'bg-zinc-100 text-zinc-600' :
                        pt.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {pt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-500 py-4 text-center">No past tickets found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
