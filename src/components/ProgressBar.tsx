interface ProgressBarProps {
  progress: number;
  height?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'green' | 'blue';
  showLabel?: boolean;
}

export function ProgressBar({ 
  progress, 
  height = 'md', 
  color = 'primary',
  showLabel = false 
}: ProgressBarProps) {
  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  };

  const colorClasses = {
    primary: 'from-primary/80 to-primary',
    green: 'from-emerald-500/80 to-emerald-500',
    blue: 'from-blue-500/80 to-blue-500',
  };

  return (
    <div>
      {showLabel && (
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Postęp</span>
          <span className="font-medium text-foreground tabular-nums">{progress.toFixed(1)}%</span>
        </div>
      )}
      <div className={`w-full bg-secondary rounded-full overflow-hidden ${heightClasses[height]}`}>
        <div
          className={`${heightClasses[height]} bg-gradient-to-r ${colorClasses[color]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
}
