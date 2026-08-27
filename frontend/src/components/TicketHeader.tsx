import { Clock, User, Mail, ChevronLeft, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import type { Ticket } from '../types/index';
import { formatEnum, getStatusColor, getPriorityDotColor } from '../utils/helpers';

interface Props {
  ticket: Ticket;
  onBack: () => void;
}

export default function TicketHeader({ ticket, onBack }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(ticket.ticket_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button 
        onClick={onBack} 
        className="md:hidden flex items-center gap-1 text-sm text-zinc-500 mb-6 hover:text-zinc-900 transition-colors"
      >
        <ChevronLeft size={18} /> Back to Queue
      </button>

      <div className="mb-8 md:mb-10">
        <div className="flex items-center gap-3 mb-4">
          <button 
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs font-mono bg-zinc-100 text-zinc-600 px-2.5 py-1 rounded-md border border-zinc-200 hover:bg-zinc-200 transition-colors"
          >
            {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
            {ticket.ticket_id}
          </button>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-50 border border-zinc-200" title="Priority">
            <div className={`w-2 h-2 rounded-full ${getPriorityDotColor(ticket.priority)}`}></div>
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">{formatEnum(ticket.priority)}</span>
          </div>
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border tracking-wider ${getStatusColor(ticket.status)}`}>
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
    </>
  );
}
