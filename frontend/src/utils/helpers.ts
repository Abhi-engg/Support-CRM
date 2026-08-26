export const getStatusColor = (status: string) => {
  switch(status) {
    case 'OPEN': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'IN_PROGRESS': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'CLOSED': return 'bg-zinc-100 text-zinc-600 border-zinc-200';
    default: return 'bg-zinc-100 text-zinc-600 border-zinc-200';
  }
};

export const getPriorityColor = (priority: string) => {
  switch(priority) {
    case 'URGENT': return 'bg-red-50 text-red-700 border-red-200';
    case 'HIGH': return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'MEDIUM': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'LOW': return 'bg-zinc-50 text-zinc-600 border-zinc-200';
    default: return 'bg-zinc-50 text-zinc-600 border-zinc-200';
  }
};
