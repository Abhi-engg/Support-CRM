import { Loader2, MessageSquare, RefreshCcw, Clock } from 'lucide-react';
import type { Note } from '../types/index';
import { formatEnum, getStatusColor } from '../utils/helpers';

interface Props {
  notes?: Note[];
  isLoadingNotes: boolean;
}

export default function TicketTimeline({ notes, isLoadingNotes }: Props) {
  return (
    <div className="mb-10 md:mb-12">
      <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-6 flex items-center gap-2">
        <Clock size={14} /> Activity Timeline
      </h3>
      
      <div className="space-y-6">
        {isLoadingNotes ? (
          <div className="flex justify-center items-center py-8 text-zinc-400 relative z-10">
            <Loader2 className="animate-spin" size={24} />
          </div>
        ) : !notes || notes.length === 0 ? (
          <div className="text-center p-6 bg-zinc-50 rounded-xl border border-dashed border-zinc-200 text-zinc-500 text-sm ml-12">
            No activity recorded yet.
          </div>
        ) : (
          notes.map(note => {
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
  );
}
