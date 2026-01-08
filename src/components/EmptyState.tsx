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
      <Icon className="mx-auto text-gray-400 mb-4" size={48} />
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-gray-500 mb-4">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
