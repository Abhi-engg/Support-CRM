export const getStatusColor = (status: string) => {
  switch(status) {
    case 'OPEN': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'CLOSED': return 'bg-zinc-100 text-zinc-700 border-zinc-300';
    default: return 'bg-zinc-100 text-zinc-700 border-zinc-300';
  }
};

export const getPriorityColor = (priority: string) => {
  switch(priority) {
    case 'URGENT': return 'bg-red-100 text-red-800 border-red-300';
    case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'MEDIUM': return 'bg-amber-100 text-amber-800 border-amber-300';
    case 'LOW': return 'bg-zinc-100 text-zinc-700 border-zinc-300';
    default: return 'bg-zinc-100 text-zinc-700 border-zinc-300';
  }
};
