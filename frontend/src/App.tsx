import { useEffect, useState } from 'react';
import { Search, Plus, Ticket as TicketIcon, Clock, CornerDownRight, AlertCircle, User, Mail } from 'lucide-react';
import { fetchTickets, fetchTicket, createTicket, updateTicket } from './api';
import type { Ticket } from './api';
import { formatDistanceToNow, differenceInHours } from 'date-fns';

export default function App() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeTicketData, setActiveTicketData] = useState<Ticket | null>(null);
  
  const [newNote, setNewNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState<string>('');

  const [createData, setCreateData] = useState({
    customer_name: '',
    customer_email: '',
    subject: '',
    description: '',
    priority: 'MEDIUM'
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      loadTickets();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const loadTickets = async () => {
    try {
      const data = await fetchTickets(search, statusFilter);
      setTickets(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTicketId) {
      loadActiveTicket(activeTicketId);
    } else {
      setActiveTicketData(null);
    }
  }, [activeTicketId]);

  const loadActiveTicket = async (id: string) => {
    try {
      const data = await fetchTicket(id);
      setActiveTicketData(data);
      setUpdatingStatus(data.status);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newTicket = await createTicket(createData);
      setIsCreating(false);
      setActiveTicketId(newTicket.ticket_id);
      loadTickets();
      setCreateData({ customer_name: '', customer_email: '', subject: '', description: '', priority: 'MEDIUM' });
    } catch (err) {
      console.error('Failed to create ticket', err);
    }
  };

  const handleUpdate = async () => {
    if (!activeTicketId) return;
    try {
      await updateTicket(activeTicketId, { 
        status: updatingStatus, 
        notes: newNote ? newNote : undefined 
      });
      setNewNote('');
      loadActiveTicket(activeTicketId);
      loadTickets();
    } catch (err) {
      console.error('Failed to update ticket', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'OPEN': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'IN_PROGRESS': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'CLOSED': return 'bg-zinc-100 text-zinc-600 border-zinc-200';
      default: return 'bg-zinc-100 text-zinc-600 border-zinc-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'URGENT': return 'bg-red-50 text-red-700 border-red-200';
      case 'HIGH': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'MEDIUM': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'LOW': return 'bg-zinc-50 text-zinc-600 border-zinc-200';
      default: return 'bg-zinc-50 text-zinc-600 border-zinc-200';
    }
  };

  return (
    <div className="flex h-screen bg-zinc-50 text-zinc-900 overflow-hidden font-sans selection:bg-zinc-200">
      
      {/* LEFT PANE: The Queue */}
      <div className="w-[420px] flex flex-col border-r border-zinc-200 bg-zinc-50/80 backdrop-blur-xl shrink-0 z-10 shadow-[1px_0_10px_rgba(0,0,0,0.02)]">
        
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
                <TicketIcon size={16} className="text-white" />
              </div>
              <h1 className="font-semibold text-lg tracking-tight text-zinc-900">Datastraw</h1>
            </div>
            <button 
              onClick={() => { setIsCreating(true); setActiveTicketId(null); }}
              className="flex items-center gap-1.5 bg-zinc-900 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-zinc-800 transition-all shadow-sm active:scale-95"
            >
              <Plus size={16} /> New Ticket
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
              <input 
                type="text" 
                placeholder="Search tickets..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent shadow-sm placeholder:text-zinc-400 transition-all"
              />
            </div>
            <select 
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-white border border-zinc-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-900 shadow-sm transition-all"
            >
              <option value="">All Status</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-3 pt-2">
          {tickets.length === 0 ? (
            <div className="text-center mt-12 text-zinc-400 text-sm flex flex-col items-center gap-2">
              <Search size={24} className="opacity-20" />
              <p>No tickets found in this view.</p>
            </div>
          ) : (
            tickets.map(ticket => {
              const isOverdue = ticket.status === 'OPEN' && differenceInHours(new Date(), new Date(ticket.created_at)) > 24;
              const isActive = activeTicketId === ticket.ticket_id && !isCreating;

              return (
                <div 
                  key={ticket.ticket_id}
                  onClick={() => { setActiveTicketId(ticket.ticket_id); setIsCreating(false); }}
                  className={`
                    group p-4 rounded-xl border bg-white cursor-pointer transition-all relative overflow-hidden shadow-sm
                    ${isActive ? 'ring-2 ring-zinc-900 border-transparent shadow-md' : 'border-zinc-200 hover:border-zinc-300 hover:shadow-md'}
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
                      <div className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                        <User size={10} className="text-zinc-500" />
                      </div>
                      <span className="text-xs text-zinc-600 truncate max-w-[100px]">{ticket.customer_name}</span>
                    </div>
                    
                    <div className="flex gap-2 items-center shrink-0">
                      {isOverdue && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-md border border-red-100 uppercase">
                          <AlertCircle size={10} /> SLA
                        </span>
                      )}
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT PANE: Details or Form */}
      <div className="flex-1 bg-white relative z-0 overflow-y-auto">
        {isCreating ? (
          <div className="max-w-2xl mx-auto p-12 lg:p-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-zinc-900">Create New Ticket</h2>
              <p className="text-zinc-500 text-sm mt-1">Fill out the details below to open a new support request.</p>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700">Customer Name</label>
                  <input required type="text" placeholder="Jane Doe" value={createData.customer_name} onChange={e => setCreateData({...createData, customer_name: e.target.value})} className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all shadow-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700">Email Address</label>
                  <input required type="email" placeholder="jane@example.com" value={createData.customer_email} onChange={e => setCreateData({...createData, customer_email: e.target.value})} className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all shadow-sm" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Priority Level</label>
                <select value={createData.priority} onChange={e => setCreateData({...createData, priority: e.target.value})} className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all shadow-sm">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Subject</label>
                <input required type="text" placeholder="Brief summary of the issue" value={createData.subject} onChange={e => setCreateData({...createData, subject: e.target.value})} className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all shadow-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Description</label>
                <textarea required rows={5} placeholder="Provide as much detail as possible..." value={createData.description} onChange={e => setCreateData({...createData, description: e.target.value})} className="w-full bg-white border border-zinc-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all shadow-sm resize-none"></textarea>
              </div>
              
              <div className="pt-4 flex justify-end">
                <button type="submit" className="bg-zinc-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-all shadow-sm active:scale-95">
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        ) : activeTicketData ? (
          <div className="max-w-3xl mx-auto p-12 lg:p-16 animate-in fade-in duration-300">
            
            {/* Ticket Header */}
            <div className="mb-10 pb-8 border-b border-zinc-100">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm font-semibold text-zinc-500">{activeTicketData.ticket_id}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getPriorityColor(activeTicketData.priority)}`}>
                  {activeTicketData.priority} PRIORITY
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getStatusColor(activeTicketData.status)}`}>
                  STATUS: {activeTicketData.status}
                </span>
              </div>
              
              <h2 className="text-3xl font-semibold text-zinc-900 mb-6 leading-tight tracking-tight">{activeTicketData.subject}</h2>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-500 bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-zinc-400" />
                  <span className="font-medium text-zinc-700">{activeTicketData.customer_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-zinc-400" />
                  <span>{activeTicketData.customer_email}</span>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <Clock size={16} className="text-zinc-400" />
                  <span>{new Date(activeTicketData.created_at).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-12">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">Original Request</h3>
              <div className="prose prose-zinc max-w-none text-zinc-700 leading-relaxed bg-white text-[15px] whitespace-pre-wrap">
                {activeTicketData.description}
              </div>
            </div>

            {/* Notes Timeline */}
            <div className="mb-12">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                <Clock size={14} /> Activity Timeline
              </h3>
              
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-200 before:to-transparent">
                {activeTicketData.notes?.length === 0 ? (
                  <div className="text-center p-6 bg-zinc-50 rounded-xl border border-dashed border-zinc-200 text-zinc-500 text-sm">
                    No activity recorded yet.
                  </div>
                ) : (
                  activeTicketData.notes?.map(note => (
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

            {/* Update Controls */}
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
                    onClick={handleUpdate}
                    className="bg-zinc-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-all shadow-sm active:scale-95"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-zinc-400">
            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4 border border-zinc-100">
              <TicketIcon size={32} className="text-zinc-300" />
            </div>
            <h2 className="text-lg font-medium text-zinc-600">No ticket selected</h2>
            <p className="text-sm mt-1">Select a ticket from the queue or create a new one.</p>
          </div>
        )}
      </div>
    </div>
  );
}
