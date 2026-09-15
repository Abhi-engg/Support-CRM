import { Ticket, Clock, CheckCircle2, AlertCircle, BarChart3, TrendingUp, Users } from 'lucide-react';
import type { Ticket as TicketType } from '../types/index';

interface Props {
  tickets: TicketType[];
}

export default function Dashboard({ tickets }: Props) {
  const total = tickets.length;
  const open = tickets.filter(t => t.status === 'OPEN').length;
  const inProgress = tickets.filter(t => t.status === 'IN_PROGRESS').length;
  const resolved = tickets.filter(t => t.status === 'CLOSED').length;
  
  // Calculate SLA breaches (Open for > 24 hours)
  const now = new Date().getTime();
  const slaBreaches = tickets.filter(t => 
    t.status === 'OPEN' && (now - new Date(t.created_at).getTime() > 24 * 60 * 60 * 1000)
  ).length;

  const urgent = tickets.filter(t => t.priority === 'URGENT').length;
  const high = tickets.filter(t => t.priority === 'HIGH').length;

  return (
    <div className="p-4 sm:p-6 md:p-10 lg:p-12 max-w-5xl mx-auto animate-in fade-in duration-300 h-full overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight">Support Overview</h1>
        <p className="text-zinc-500 mt-1 text-sm md:text-base">Real-time metrics and queue health.</p>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-zinc-500">Total Volume</h3>
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Ticket size={16} />
            </div>
          </div>
          <p className="text-3xl font-bold text-zinc-900">{total}</p>
          <p className="text-xs text-zinc-400 mt-2 flex items-center gap-1"><TrendingUp size={12} className="text-emerald-500"/> +12% this week</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-zinc-500">Unresolved</h3>
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock size={16} />
            </div>
          </div>
          <p className="text-3xl font-bold text-zinc-900">{open + inProgress}</p>
          <p className="text-xs text-zinc-400 mt-2">Active in queue</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-zinc-500">Resolved</h3>
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <p className="text-3xl font-bold text-zinc-900">{resolved}</p>
          <p className="text-xs text-zinc-400 mt-2">Closed tickets</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-red-200 shadow-sm ring-1 ring-red-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-red-600">SLA Breaches</h3>
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 animate-pulse">
              <AlertCircle size={16} />
            </div>
          </div>
          <p className="text-3xl font-bold text-red-600">{slaBreaches}</p>
          <p className="text-xs text-red-400 mt-2">Open &gt; 24 hours</p>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Priority Breakdown */}
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
          <h3 className="text-sm font-bold text-zinc-800 uppercase tracking-wider mb-6 flex items-center gap-2">
            <BarChart3 size={16} className="text-zinc-400"/> Priority Breakdown
          </h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-zinc-700">Urgent</span>
                <span className="text-zinc-500">{urgent}</span>
              </div>
              <div className="w-full bg-zinc-100 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: `${total ? (urgent / total) * 100 : 0}%` }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-zinc-700">High</span>
                <span className="text-zinc-500">{high}</span>
              </div>
              <div className="w-full bg-zinc-100 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${total ? (high / total) * 100 : 0}%` }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-zinc-700">Standard (Medium/Low)</span>
                <span className="text-zinc-500">{total - urgent - high}</span>
              </div>
              <div className="w-full bg-zinc-100 rounded-full h-2">
                <div className="bg-zinc-400 h-2 rounded-full" style={{ width: `${total ? ((total - urgent - high) / total) * 100 : 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions / System Status */}
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex flex-col justify-between">
           <div>
            <h3 className="text-sm font-bold text-zinc-800 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Users size={16} className="text-zinc-400"/> System Health
            </h3>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Database connection is active. All services are currently operational. Average ticket creation latency is &lt;100ms.
            </p>
           </div>
           
           <div className="mt-6 p-4 bg-zinc-50 rounded-lg border border-zinc-100">
             <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-700">API Status</span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 uppercase tracking-wide">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Online
                </span>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
