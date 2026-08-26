import { useState, useEffect } from 'react';
import { Clock, CornerDownRight, User, Mail } from 'lucide-react';
import type { Ticket } from '../types/index';
import { getPriorityColor, getStatusColor } from '../utils/helpers';

interface Props {
  ticket: Ticket;
  onUpdate: (id: string, updates: any) => Promise<void>;
}

export default function TicketDetail({ ticket, onUpdate }: Props) {
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
    <div className="max-w-3xl mx-auto p-12 lg:p-16 animate-in fade-in duration-300">
      <div className="mb-10 pb-8 border-b border-zinc-100">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm font-semibold text-zinc-500">{ticket.ticket_id}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getPriorityColor(ticket.priority)}`}>
            {ticket.priority} PRIORITY
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getStatusColor(ticket.status)}`}>
            STATUS: {ticket.status}
          </span>
        </div>
        
        <h2 className="text-3xl font-semibold text-zinc-900 mb-6 leading-tight tracking-tight">{ticket.subject}</h2>
        
        <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-500 bg-zinc-50 p-4 rounded-xl border border-zinc-100">
          <div className="flex items-center gap-2">
            <User size={16} className="text-zinc-400" />
            <span className="font-medium text-zinc-700">{ticket.customer_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail size={16} className="text-zinc-400" />
            <span>{ticket.customer_email}</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Clock size={16} className="text-zinc-400" />
            <span>{new Date(ticket.created_at).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">Original Request</h3>
        <div className="prose prose-zinc max-w-none text-zinc-700 leading-relaxed bg-white text-[15px] whitespace-pre-wrap">
          {ticket.description}
        </div>
      </div>

      <div className="mb-12">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-6 flex items-center gap-2">
          <Clock size={14} /> Activity Timeline
        </h3>
        
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-200 before:to-transparent">
          {ticket.notes?.length === 0 ? (
            <div className="text-center p-6 bg-zinc-50 rounded-xl border border-dashed border-zinc-200 text-zinc-500 text-sm">
              No activity recorded yet.
            </div>
          ) : (
            ticket.notes?.map(note => (
              <div key={note.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-zinc-100 text-zinc-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10">
                  <CornerDownRight size={14} />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-zinc-900 text-sm">Update</span>
                    <span className="text-xs text-zinc-400">{new Date(note.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-zinc-600 text-sm">{note.text}</p>
                </div>
              </div>
            ))
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
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 bg-zinc-50 px-3 py-1.5 rounded-lg border border-zinc-200">
              <span className="text-xs font-semibold text-zinc-500">Status:</span>
              <select 
                value={updatingStatus}
                onChange={e => setUpdatingStatus(e.target.value)}
                className="bg-transparent text-sm font-medium text-zinc-900 focus:outline-none cursor-pointer"
              >
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
            
            <button 
              onClick={handleSave}
              className="bg-zinc-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-all shadow-sm active:scale-95"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
