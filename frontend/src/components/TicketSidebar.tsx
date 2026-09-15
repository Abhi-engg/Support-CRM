import { Search, Plus, Ticket as TicketIcon, User, Loader2 } from 'lucide-react';
import { formatDistanceToNow, differenceInHours } from 'date-fns';
import type { Ticket } from '../types/index';
import { getStatusColor, getPriorityDotColor, formatEnum } from '../utils/helpers';

interface Props {
  tickets: Ticket[];
  search: string;
  setSearch: (s: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  activeTicketId: string | null;
  isCreating: boolean;
  isLoading: boolean;
  onSelectTicket: (id: string) => void;
  onCreateNew: () => void;
  hiddenOnMobile: boolean;
}

import { UserButton } from '@clerk/clerk-react';

export default function TicketSidebar({ tickets, search, setSearch, statusFilter, setStatusFilter, activeTicketId, isCreating, isLoading, onSelectTicket, onCreateNew, hiddenOnMobile }: Props) {
  return (
    <div className={`w-full md:w-[420px] flex-col border-r border-zinc-200 bg-zinc-50/80 backdrop-blur-xl shrink-0 z-10 shadow-[1px_0_10px_rgba(0,0,0,0.02)] ${hiddenOnMobile ? 'hidden md:flex' : 'flex'}`}>
      <div className="p-4 md:p-6 pb-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <UserButton />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
                <TicketIcon size={16} className="text-white" />
              </div>
              <h1 className="font-semibold text-lg tracking-tight text-zinc-900">Support-CRM</h1>
            </div>
          </div>
          <button 
            onClick={onCreateNew}
            className="flex items-center gap-1.5 bg-zinc-900 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-zinc-800 transition-all shadow-sm active:scale-95"
          >
            <Plus size={16} /> <span className="hidden sm:inline">New Ticket</span><span className="sm:hidden">New</span>
          </button>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
            <input 
              type="text" 
              placeholder="Search tickets..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 shadow-sm placeholder:text-zinc-400 transition-all"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-white border border-zinc-200 rounded-lg text-sm px-2 md:px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-900 shadow-sm transition-all"
          >
            <option value="">All Status</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6 pt-2">
        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1 mb-3">
          Queue ({tickets.length})
        </div>
        
        {isLoading && tickets.length === 0 ? (
          <div className="flex justify-center items-center h-32 text-zinc-400">
            <Loader2 className="animate-spin" size={24} />
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center mt-12 text-zinc-400 text-sm flex flex-col items-center gap-2">
            <Search size={24} className="opacity-20" />
            <p>No tickets found in this view.</p>
          </div>
        ) : (
          <div className={`space-y-3 transition-opacity duration-200 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
            {tickets.map(ticket => {
            const isOverdue = ticket.status === 'OPEN' && differenceInHours(new Date(), new Date(ticket.created_at)) > 24;
            const isActive = activeTicketId === ticket.ticket_id && !isCreating;

            return (
              <div 
                key={ticket.ticket_id}
                onClick={() => onSelectTicket(ticket.ticket_id)}
                className={`
                  group p-4 rounded-xl border cursor-pointer transition-all relative overflow-hidden
                  ${isActive ? 'ring-2 ring-zinc-900 border-transparent shadow-md bg-zinc-50' : 'border-zinc-200 hover:border-zinc-300 hover:shadow-md bg-white'}
                `}
              >
                {isOverdue && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                )}
                
                <div className="flex justify-between items-start mb-2 pl-1">
                  <span className="text-xs font-semibold text-zinc-500">{ticket.ticket_id}</span>
                  <span className="text-xs text-zinc-400">{formatDistanceToNow(new Date(ticket.created_at))} ago</span>
                </div>
                
                <h3 className="font-medium text-sm text-zinc-900 mb-3 pl-1 leading-snug line-clamp-2">{ticket.subject}</h3>
                
                <div className="flex justify-between items-center pl-1">
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <div className="w-5 h-5 rounded-full bg-zinc-200/50 flex items-center justify-center shrink-0">
                      <User size={10} className="text-zinc-500" />
                    </div>
                    <span className="text-xs text-zinc-600 truncate max-w-[100px]">{ticket.customer_name}</span>
                  </div>
                  
                  <div className="flex gap-2 items-center shrink-0">
                    <div className="flex items-center justify-center pr-1" title={`${formatEnum(ticket.priority)} Priority`}>
                      <div className={`w-2 h-2 rounded-full ${getPriorityDotColor(ticket.priority)}`}></div>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${getStatusColor(ticket.status)}`}>
                      {formatEnum(ticket.status)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </div>
    </div>
  );
}
