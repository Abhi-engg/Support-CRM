import { useState, useEffect } from 'react';
import { Clock, User, Mail, ChevronLeft, Loader2, Copy, Check, MessageSquare, RefreshCcw } from 'lucide-react';
import type { Ticket } from '../types/index';
import { getPriorityColor, getStatusColor, formatEnum } from '../utils/helpers';

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
  const [copied, setCopied] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setUpdatingStatus(ticket.status);
    setNewNote('');
    setCopied(false);
    setShowSuccess(false);
  }, [ticket.ticket_id]);

  const hasChanges = newNote.trim().length > 0 || updatingStatus !== ticket.status;

  const handleSave = async () => {
    if (!hasChanges) return;
    await onUpdate(ticket.ticket_id, { 
      status: updatingStatus, 
      notes: newNote.trim() ? newNote : undefined 
    });
    setNewNote('');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-8 md:p-12 lg:p-16 animate-in fade-in duration-300">
      
      {/* Mobile Back Button */}
      <button 
        onClick={onBack} 
        className="md:hidden flex items-center gap-1 text-sm text-zinc-500 mb-6 hover:text-zinc-900 transition-colors"
      >
        <ChevronLeft size={18} /> Back to Queue
      </button>

      <div className="mb-8 md:mb-10 pb-6 md:pb-8 border-b border-zinc-100">
        <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-4">
          <button 
            onClick={() => {
              navigator.clipboard.writeText(ticket.ticket_id);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="group flex items-center gap-1.5 text-sm font-semibold text-zinc-500 hover:text-zinc-900 transition-colors px-1.5 py-0.5 -ml-1.5 rounded-md hover:bg-zinc-100 active:scale-95"
            title="Copy Ticket ID"
          >
            {ticket.ticket_id}
            {copied ? (
              <Check size={14} className="text-emerald-500" />
            ) : (
              <Copy size={14} className="text-zinc-300 group-hover:text-zinc-500 transition-colors" />
            )}
          </button>
          
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wide ${getPriorityColor(ticket.priority)}`}>
            {formatEnum(ticket.priority)} PRIORITY
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wide ${getStatusColor(ticket.status)}`}>
            STATUS: {formatEnum(ticket.status)}
          </span>
        </div>
        
        <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900 mb-6 leading-tight tracking-tight">{ticket.subject}</h2>
        
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-4 sm:gap-6 text-sm text-zinc-500 bg-zinc-50 p-4 rounded-xl border border-zinc-100">
          <div className="flex items-center gap-2">
            <User size={16} className="text-zinc-400 shrink-0" />
            <span className="font-medium text-zinc-700 truncate">{ticket.customer_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail size={16} className="text-zinc-400 shrink-0" />
            <span className="truncate">{ticket.customer_email}</span>
          </div>
          <div className="flex items-center gap-2 sm:ml-auto">
            <Clock size={16} className="text-zinc-400 shrink-0" />
            <span>{new Date(ticket.created_at).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="mb-10 md:mb-12">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">Original Request</h3>
        <div className="prose prose-sm md:prose-base prose-zinc max-w-none text-zinc-700 leading-relaxed bg-white whitespace-pre-wrap">
          {ticket.description}
        </div>
      </div>

      <div className="mb-10 md:mb-12">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-6 flex items-center gap-2">
          <Clock size={14} /> Activity Timeline
        </h3>
        
        <div className="space-y-6">
          {isLoadingNotes ? (
            <div className="flex justify-center items-center py-8 text-zinc-400 relative z-10">
              <Loader2 className="animate-spin" size={24} />
            </div>
          ) : ticket.notes?.length === 0 ? (
            <div className="text-center p-6 bg-zinc-50 rounded-xl border border-dashed border-zinc-200 text-zinc-500 text-sm ml-12">
              No activity recorded yet.
            </div>
          ) : (
            ticket.notes?.map(note => {
              const match = note.text.match(/^Status updated from ([A-Z_]+) to ([A-Z_]+)(?:\.\n\nNote: ([\s\S]*))?$/);
              const isSystem = !!match;
              const oldStatus = match ? match[1] : null;
              const newStatus = match ? match[2] : null;
              const userNote = match ? match[3] : null;
              
              const displayContent = isSystem ? userNote : note.text;
              const Icon = isSystem ? RefreshCcw : MessageSquare;
              const titleLabel = isSystem ? 'Status Change' : 'Internal Note';

              return (
                <div key={note.id} className="relative flex items-start group">
                  {/* Timeline connector line that stops at the last node */}
                  <div className="absolute top-10 bottom-[-1.5rem] left-5 w-0.5 bg-zinc-200 -translate-x-px group-last:hidden z-0"></div>
                  
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-zinc-100 text-zinc-500 shrink-0 shadow-sm relative z-10 mt-1">
                    <Icon size={14} />
                  </div>
                  <div className="w-[calc(100%-3.5rem)] bg-white p-4 rounded-xl border border-zinc-200 shadow-sm ml-4 relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-900 text-sm">{titleLabel}</span>
                        {isSystem && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wide ${getStatusColor(newStatus as string)}`}>
                            {formatEnum(oldStatus as string)} → {formatEnum(newStatus as string)}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-zinc-400">{new Date(note.createdAt).toLocaleString()}</span>
                    </div>
                    {displayContent && <p className="text-zinc-600 text-sm whitespace-pre-wrap mt-3">{displayContent}</p>}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="bg-zinc-50 px-4 py-3 border-b border-zinc-200">
          <h3 className="text-xs font-bold text-zinc-600 uppercase tracking-wider">Update Ticket</h3>
        </div>
        <div className="p-4">
          <div className="relative mb-4">
            <textarea 
              rows={3} 
              placeholder="Type an internal note or update..."
              value={newNote}
              onChange={e => setNewNote(e.target.value)}
              onKeyDown={e => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                  e.preventDefault();
                  if (hasChanges && !isSubmitting) handleSave();
                }
              }}
              disabled={isSubmitting}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-3 pb-8 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all resize-none disabled:opacity-50"
            ></textarea>
            
            <div className="absolute bottom-3 right-3 flex items-center gap-2 pointer-events-none select-none">
              {newNote.length > 0 && <span className="text-[10px] font-medium text-zinc-400">{newNote.length} chars</span>}
              <kbd className="hidden sm:flex items-center gap-0.5 text-[10px] font-semibold text-zinc-400 bg-white border border-zinc-200 px-1.5 py-0.5 rounded shadow-sm">
                <span className="text-xs">⌘</span> ↵
              </kbd>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 bg-zinc-50 px-3 py-2 sm:py-1.5 rounded-lg border border-zinc-200">
              <span className="text-xs font-semibold text-zinc-500 shrink-0">Status:</span>
              <select 
                value={updatingStatus}
                onChange={e => setUpdatingStatus(e.target.value)}
                disabled={isSubmitting}
                className="bg-transparent text-sm font-medium text-zinc-900 focus:outline-none cursor-pointer w-full disabled:opacity-50"
              >
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {showSuccess && (
                <span className="text-sm font-medium text-emerald-600 flex items-center gap-1 animate-in fade-in slide-in-from-right-4 duration-300">
                  <Check size={16} /> Saved
                </span>
              )}
              <button 
                onClick={handleSave}
                disabled={isSubmitting || !hasChanges}
                className="flex justify-center items-center gap-2 bg-zinc-900 text-white px-5 py-2.5 sm:py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:pointer-events-none w-full sm:w-auto"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
