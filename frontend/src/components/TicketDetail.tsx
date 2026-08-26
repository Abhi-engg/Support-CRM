import { useState, useEffect } from 'react';
import { Clock, CornerDownRight, User, Mail, ChevronLeft, RefreshCw } from 'lucide-react';
import type { Ticket } from '../types/index';
import { getPriorityColor, getStatusColor } from '../utils/helpers';

interface Props {
  ticket: Ticket;
  onUpdate: (id: string, updates: any) => Promise<void>;
  onBack: () => void;
}

export default function TicketDetail({ ticket, onUpdate, onBack }: Props) {
  const [newNote, setNewNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState<string>(ticket.status);

  useEffect(() => {
    setUpdatingStatus(ticket.status);
    setNewNote('');
  }, [ticket.ticket_id]);

  const handleSave = async () => {
    await onUpdate(ticket.ticket_id, { 
      status: updatingStatus, 
      notes: newNote ? newNote : undefined 
    });
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
          <span className="text-sm font-semibold text-zinc-500">{ticket.ticket_id}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getPriorityColor(ticket.priority)}`}>
            {ticket.priority} PRIORITY
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getStatusColor(ticket.status)}`}>
            STATUS: {ticket.status}
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
        
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-200 before:to-transparent">
          {ticket.notes?.length === 0 ? (
            <div className="text-center p-6 bg-zinc-50 rounded-xl border border-dashed border-zinc-200 text-zinc-500 text-sm">
              No activity recorded yet.
            </div>
          ) : (
            ticket.notes?.map(note => {
              const match = note.text.match(/^Status updated from ([A-Z_]+) to ([A-Z_]+)(?:\.\n\nNote: ([\s\S]*))?$/);
              const isSystem = !!match;
              const newStatus = match ? match[2] : null;
              const userNote = match ? match[3] : null;
              
              const displayContent = isSystem ? (userNote ? userNote : `Changed status to ${newStatus}`) : note.text;

              return (
                <div key={note.id} className="relative flex items-start md:items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-zinc-100 text-zinc-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10 mt-1 md:mt-0">
                    <CornerDownRight size={14} />
                  </div>
                  <div className="w-[calc(100%-3.5rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-zinc-200 shadow-sm ml-4 md:ml-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-900 text-sm">Update</span>
                        {isSystem && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border bg-zinc-50 text-zinc-500 border-zinc-200 uppercase">
                            → {newStatus}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-zinc-400">{new Date(note.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-zinc-600 text-sm whitespace-pre-wrap">{displayContent}</p>
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
          <textarea 
            rows={3} 
            placeholder="Type an internal note or update..."
            value={newNote}
            onChange={e => setNewNote(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all resize-none mb-4"
          ></textarea>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 bg-zinc-50 px-3 py-2 sm:py-1.5 rounded-lg border border-zinc-200">
              <span className="text-xs font-semibold text-zinc-500 shrink-0">Status:</span>
              <select 
                value={updatingStatus}
                onChange={e => setUpdatingStatus(e.target.value)}
                className="bg-transparent text-sm font-medium text-zinc-900 focus:outline-none cursor-pointer w-full"
              >
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
            
            <button 
              onClick={handleSave}
              className="bg-zinc-900 text-white px-5 py-2.5 sm:py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-all shadow-sm active:scale-95"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
