import { useTranslation } from 'react-i18next';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation();

  const getStyle = () => {
    switch (status) {
      case 'completed': return 'bg-primary/10 text-primary border-primary/20';
      case 'failed': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'printing': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'waiting_for_printer_ready': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'delayed': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'scheduled': return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
      case 'cancelled': return 'bg-muted text-muted-foreground border-border';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getLabel = () => {
    const labels: Record<string, string> = {
      completed: t('dashboard.status.completed'),
      failed: t('dashboard.status.failed'),
      printing: t('dashboard.status.printing'),
      pending: t('dashboard.status.pending'),
      waiting_for_printer_ready: t('dashboard.status.waiting_for_printer_ready'),
      delayed: t('dashboard.status.delayed'),
      scheduled: t('dashboard.status.scheduled'),
      cancelled: t('dashboard.status.cancelled'),
    };
    return labels[status] || status;
  };

  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStyle()}`}>
      {getLabel()}
    </span>
  );
}
