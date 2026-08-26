import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

interface Props {
  onSubmit: (data: any) => Promise<void>;
  onBack: () => void;
}

export default function CreateTicketForm({ onSubmit, onBack }: Props) {
  const [createData, setCreateData] = useState({
    customer_name: '',
    customer_email: '',
    subject: '',
    description: '',
    priority: 'MEDIUM'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(createData);
    setCreateData({ customer_name: '', customer_email: '', subject: '', description: '', priority: 'MEDIUM' });
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-8 md:p-12 lg:p-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Mobile Back Button */}
      <button 
        onClick={onBack} 
        className="md:hidden flex items-center gap-1 text-sm text-zinc-500 mb-6 hover:text-zinc-900 transition-colors"
      >
        <ChevronLeft size={18} /> Back to Queue
      </button>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-zinc-900">Create New Ticket</h2>
        <p className="text-zinc-500 text-sm mt-1">Fill out the details below to open a new support request.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
          <button type="submit" className="w-full sm:w-auto bg-zinc-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-all shadow-sm active:scale-95">
            Submit Ticket
          </button>
        </div>
      </form>
    </div>
  );
}
