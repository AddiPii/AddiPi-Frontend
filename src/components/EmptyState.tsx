import { FileText, AlertCircle, Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: 'file' | 'alert' | 'inbox';
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon = 'inbox', title, description, action }: EmptyStateProps) {
  const icons = {
    file: FileText,
    alert: AlertCircle,
    inbox: Inbox,
  };
  
  const Icon = icons[icon];

  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary rounded-2xl border border-border mb-4">
        <Icon className="text-muted-foreground" size={32} />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      {description && <p className="text-muted-foreground mb-6 max-w-sm mx-auto">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
