interface ProgressBarProps {
  progress: number;
  height?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'purple';
  showLabel?: boolean;
}

export function ProgressBar({ 
  progress, 
  height = 'md', 
  color = 'blue',
  showLabel = false 
}: ProgressBarProps) {
  const heightClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    purple: 'bg-purple-600',
  };

  return (
    <div>
      {showLabel && (
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Postęp</span>
          <span>{progress.toFixed(1)}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${heightClasses[height]}`}>
        <div
          className={`${colorClasses[color]} ${heightClasses[height]} rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
}
