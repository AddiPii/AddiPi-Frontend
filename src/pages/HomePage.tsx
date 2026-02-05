import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, CheckCircle, XCircle, Clock, TrendingUp, Eye, Zap, ArrowRight, Layers } from 'lucide-react';
import { useStore } from '../store/useStore';
import { api } from '../services/api';
import type { Job } from '../types';
import { formatDateSafe, formatDateTimeSafe } from '../utils/formatters';

export default function HomePage() {
  const navigate = useNavigate();
  const { printerStatus, metrics, currentJob, fetchCurrentJob } = useStore();
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [upcomingJobs, setUpcomingJobs] = useState<Job[]>([]);

  const loadRecentJobs = async () => {
    try {
      const { data } = await api.getRecentCompletedJobs(5);
      setRecentJobs(data.jobs);
    } catch (error) {
      console.error('Failed to load recent jobs:', error);
      setRecentJobs([]);
    }
  };

  const loadUpcomingJobs = async () => {
    try {
      const { data } = await api.getUpcomingJobs();
      setUpcomingJobs(data.jobs);
    } catch (error) {
      console.error('Failed to load upcoming jobs:', error);
      setUpcomingJobs([]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.allSettled([
          fetchCurrentJob(),
          loadRecentJobs(),
          loadUpcomingJobs()
        ]);
      } catch (error) {
        console.error('Error loading home page data:', error);
      }
    };

    loadData();

    const interval = setInterval(() => {
      loadData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIndicator = (state?: string, isPrinting?: boolean) => {
    if (isPrinting) return { color: 'bg-primary', pulse: true, text: 'Drukuje' };
    switch (state) {
      case 'Operational': return { color: 'bg-primary', pulse: false, text: 'Gotowa' };
      case 'Printing': return { color: 'bg-primary', pulse: true, text: 'Drukuje' };
      case 'Offline': return { color: 'bg-muted-foreground', pulse: false, text: 'Offline' };
      default: return { color: 'bg-muted-foreground', pulse: false, text: 'Offline' };
    }
  };

  const getJobStatusStyle = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-primary/10 text-primary border-primary/20';
      case 'failed': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'printing': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'scheduled': return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const statusIndicator = getStatusIndicator(printerStatus?.printerState, printerStatus?.isPrinting);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-card border border-border p-8 lg:p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border">
                <div className={`w-2 h-2 rounded-full ${statusIndicator.color} ${statusIndicator.pulse ? 'animate-pulse' : ''}`} />
                <span className="text-sm font-medium text-foreground">{statusIndicator.text}</span>
              </div>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground tracking-tight text-balance">
              AddiPi 3D Printer
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl text-pretty">
              Zaawansowany system zarządzania drukarką 3D. Monitoruj, kontroluj i optymalizuj swoje druki w czasie rzeczywistym.
            </p>
            
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => navigate('/upload')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Zap size={18} />
                Rozpocznij druk
              </button>
              <button
                onClick={() => navigate('/print')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-secondary text-foreground font-medium rounded-lg border border-border hover:bg-secondary/80 transition-colors"
              >
                <Eye size={18} />
                Podgląd na żywo
              </button>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
            <div className="relative p-0.2 bg-secondary/50 rounded-2xl border border-border">
              {/* <Printer size={80} className="text-primary" /> */}
              <img src="images/logo.png" width={250} alt="" className='border rounded-2xl'/>
            </div>
          </div>
        </div>
      </div>

      {/* Status Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Current Job Card - Spans 2 columns on lg */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-lg border border-primary/20">
                <Activity className="text-primary" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Aktualny druk</h3>
                <p className="text-sm text-muted-foreground">Status w czasie rzeczywistym</p>
              </div>
            </div>
            {currentJob && (
              <button
                onClick={() => navigate('/print')}
                className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Szczegóły
                <ArrowRight size={16} />
              </button>
            )}
          </div>
          
          {currentJob ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-foreground font-medium truncate pr-4">
                  {currentJob.originalFileName}
                </span>
                <span className="text-2xl font-bold text-primary tabular-nums">
                  {currentJob.progress?.toFixed(1)}%
                </span>
              </div>
              
              <div className="relative">
                <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${currentJob.progress || 0}%` }}
                  />
                </div>
              </div>
              
              {currentJob.printTimeLeft && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock size={14} />
                  <span>Pozostało: {Math.round(currentJob.printTimeLeft / 60)} min</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="p-4 bg-secondary/50 rounded-full mb-4">
                <Layers size={32} className="text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">Brak aktywnego druku</p>
              <button
                onClick={() => navigate('/upload')}
                className="mt-4 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Rozpocznij nowy druk
              </button>
            </div>
          )}
        </div>

        {/* Completed Card */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-start justify-between">
            <div className="p-2.5 bg-primary/10 rounded-lg border border-primary/20">
              <CheckCircle className="text-primary" size={20} />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Ukończone
            </span>
          </div>
          <div className="mt-6">
            <p className="text-4xl font-bold text-foreground tabular-nums">
              {metrics?.metrics.completed || 0}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Druki zakończone sukcesem</p>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={TrendingUp}
          label="Drukuje"
          value={metrics?.metrics.printing || 0}
          color="primary"
        />
        <StatCard
          icon={Clock}
          label="W kolejce"
          value={(metrics?.metrics.queued || 0) + (metrics?.metrics.printing || 0)}
          color="yellow"
        />
        <StatCard
          icon={XCircle}
          label="Niepowodzenia"
          value={metrics?.metrics.failed || 0}
          color="destructive"
        />
        <StatCard
          icon={Activity}
          label="Wszystkie"
          value={metrics?.metrics.total || 0}
          color="muted"
        />
      </div>

      {/* Jobs Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Ostatnie druki</h2>
            <p className="text-sm text-muted-foreground">Historia ukończonych zadań</p>
          </div>
          
          <div className="divide-y divide-border">
            {recentJobs.length > 0 ? (
              recentJobs.map((job) => (
                <div key={job.id} className="px-6 py-4 hover:bg-secondary/30 transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground truncate">{job.originalFileName}</p>
                      <p className="text-sm text-muted-foreground truncate">{job.userEmail}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${getJobStatusStyle(job.status)}`}>
                        {job.status}
                      </span>
                      {job.completedAt && (
                        <p className="text-xs text-muted-foreground">
                          {formatDateSafe(job.completedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center">
                <p className="text-muted-foreground">Brak ostatnich druków</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Jobs */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Nadchodzące druki</h2>
            <p className="text-sm text-muted-foreground">Zaplanowane zadania</p>
          </div>
          
          <div className="divide-y divide-border">
            {upcomingJobs.length > 0 ? (
              upcomingJobs.slice(0, 5).map((job) => (
                <div key={job.id} className="px-6 py-4 hover:bg-secondary/30 transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground truncate">{job.originalFileName}</p>
                      <p className="text-sm text-muted-foreground truncate">{job.userEmail}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${getJobStatusStyle(job.status)}`}>
                        {job.status}
                      </span>
                      {job.scheduledAt && (
                        <p className="text-xs text-muted-foreground">
                          {formatDateTimeSafe(job.scheduledAt)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center">
                <p className="text-muted-foreground">Brak zaplanowanych druków</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  color: 'primary' | 'yellow' | 'destructive' | 'muted';
}

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  const colorStyles = {
    primary: 'bg-primary/10 text-primary border-primary/20',
    yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    destructive: 'bg-destructive/10 text-destructive border-destructive/20',
    muted: 'bg-secondary text-muted-foreground border-border',
  };

  const valueColors = {
    primary: 'text-primary',
    yellow: 'text-yellow-400',
    destructive: 'text-destructive',
    muted: 'text-foreground',
  };

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-lg border ${colorStyles[color]}`}>
          <Icon size={18} />
        </div>
      </div>
      <div className="mt-4">
        <p className={`text-3xl font-bold tabular-nums ${valueColors[color]}`}>
          {value}
        </p>
        <p className="text-sm text-muted-foreground mt-1">{label}</p>
      </div>
    </div>
  );
}
