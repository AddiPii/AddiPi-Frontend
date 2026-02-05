interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStyle = () => {
    switch (status) {
      case 'completed': return 'bg-primary/10 text-primary border-primary/20';
      case 'failed': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'printing': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'scheduled': return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
      case 'cancelled': return 'bg-muted text-muted-foreground border-border';
      default: return 'bg-muted text-muted-foreground border-border';
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
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStyle()}`}>
      {getLabel()}
    </span>
  );
}
