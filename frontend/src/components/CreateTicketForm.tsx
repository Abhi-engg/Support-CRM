import { useState } from 'react';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { getPriorityDotColor, formatEnum } from '../utils/helpers';

interface Props {
  isSubmitting: boolean;
  onSubmit: (data: any) => Promise<void>;
  onBack: () => void;
}

export default function CreateTicketForm({ isSubmitting, onSubmit, onBack }: Props) {
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

  const isValid = 
    createData.customer_name.trim().length > 0 && 
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createData.customer_email) && 
    createData.subject.trim().length > 0 && 
    createData.description.trim().length > 0;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, nextFieldId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      document.getElementById(nextFieldId)?.focus();
    }
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
            <label className="text-sm font-medium text-zinc-700">Customer Name <span className="text-red-500">*</span></label>
            <input id="nameInput" required disabled={isSubmitting} type="text" placeholder="Jane Doe" value={createData.customer_name} onChange={e => setCreateData({...createData, customer_name: e.target.value})} onKeyDown={e => handleKeyDown(e, 'emailInput')} className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all shadow-sm disabled:opacity-50" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">Email Address <span className="text-red-500">*</span></label>
            <input id="emailInput" required disabled={isSubmitting} type="email" placeholder="jane@example.com" value={createData.customer_email} onChange={e => setCreateData({...createData, customer_email: e.target.value})} onKeyDown={e => handleKeyDown(e, 'subjectInput')} className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all shadow-sm disabled:opacity-50" />
          </div>
        </div>
        <div className="space-y-3">
          <label className="text-sm font-medium text-zinc-700">Priority Level</label>
          <div className="flex flex-wrap gap-3">
            {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map(p => (
              <label 
                key={p} 
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all active:scale-95
                  ${createData.priority === p 
                    ? 'border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900 text-zinc-900 shadow-sm' 
                    : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50'}
                  ${isSubmitting ? 'opacity-50 pointer-events-none' : ''}
                `}
              >
                <div className={`w-2 h-2 rounded-full ${getPriorityDotColor(p)}`}></div>
                <span className="text-xs font-bold uppercase tracking-wider">{formatEnum(p)}</span>
                <input 
                  type="radio" 
                  name="priority"
                  className="hidden" 
                  checked={createData.priority === p} 
                  onChange={() => setCreateData({...createData, priority: p})} 
                  disabled={isSubmitting}
                />
              </label>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700">Subject <span className="text-red-500">*</span></label>
          <input id="subjectInput" required disabled={isSubmitting} type="text" placeholder="Brief summary of the issue" value={createData.subject} onChange={e => setCreateData({...createData, subject: e.target.value})} onKeyDown={e => handleKeyDown(e, 'descriptionInput')} className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all shadow-sm disabled:opacity-50" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700">Description <span className="text-red-500">*</span></label>
          <textarea id="descriptionInput" required disabled={isSubmitting} rows={5} placeholder="Provide as much detail as possible..." value={createData.description} onChange={e => setCreateData({...createData, description: e.target.value})} onKeyDown={e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); if (isValid && !isSubmitting) handleSubmit(e as any); } }} className="w-full bg-white border border-zinc-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all shadow-sm resize-none disabled:opacity-50"></textarea>
          <div className="flex justify-end mt-1">
             <kbd className="hidden sm:flex items-center gap-0.5 text-[10px] font-semibold text-zinc-400 bg-white border border-zinc-200 px-1.5 py-0.5 rounded shadow-sm select-none pointer-events-none">
                <span className="text-xs">⌘</span> ↵ to submit
             </kbd>
          </div>
        </div>
        
        <div className="pt-4 flex flex-col gap-3">
          <button type="submit" disabled={isSubmitting || !isValid} className="flex justify-center items-center gap-2 w-full bg-zinc-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:pointer-events-none">
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
            {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
          </button>
          <button type="button" onClick={onBack} disabled={isSubmitting} className="w-full text-center text-sm text-zinc-500 hover:text-zinc-900 transition-colors font-medium py-2">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
