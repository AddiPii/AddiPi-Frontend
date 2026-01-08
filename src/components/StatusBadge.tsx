interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getColor = () => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'printing': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLabel = () => {
    const labels: Record<string, string> = {
      completed: 'Ukończone',
      failed: 'Nieudane',
      printing: 'Drukuje',
      pending: 'Oczekujące',
      scheduled: 'Zaplanowane',
      cancelled: 'Anulowane',
    };
    return labels[status] || status;
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getColor()}`}>
      {getLabel()}
    </span>
  );
}
