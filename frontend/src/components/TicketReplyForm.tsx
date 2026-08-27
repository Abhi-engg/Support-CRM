import { Loader2, Check } from 'lucide-react';

interface Props {
  newNote: string;
  setNewNote: (val: string) => void;
  updatingStatus: string;
  setUpdatingStatus: (val: string) => void;
  isSubmitting: boolean;
  hasChanges: boolean;
  showSuccess: boolean;
  handleSave: () => void;
}

export default function TicketReplyForm({
  newNote,
  setNewNote,
  updatingStatus,
  setUpdatingStatus,
  isSubmitting,
  hasChanges,
  showSuccess,
  handleSave
}: Props) {
  return (
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
  );
}
