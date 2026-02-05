import { useEffect, useState } from 'react';
import { Square, RefreshCw, Calendar, FileText, Eye, ChevronDown, Layers } from 'lucide-react';
import { api } from '../services/api';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import type { Job, UserStats } from '../types';
import toast from 'react-hot-toast';
import { formatDateSafe, formatDateTimeSafe } from '../utils/formatters';

interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
}

export default function DashboardPage() {
  const { user, currentJob, fetchCurrentJob } = useStore();
  const navigate = useNavigate();
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const loadMyJobs = async () => {
    try {
      const params = selectedStatus !== 'all' ? { status: selectedStatus, limit: 50 } : { limit: 50 };
      const { data } = await api.getUserJobs(params);
      setMyJobs(data.jobs);
    } catch (error) {
      console.error('Failed to load jobs:', error);
      setMyJobs([]);
    }
  };

  const loadStats = async () => {
    try {
      const { data } = await api.getUserStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
      setStats(null);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.allSettled([
          loadMyJobs(),
          loadStats(),
          fetchCurrentJob()
        ]);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadData();

    const interval = setInterval(() => {
      loadData();
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedStatus]);

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Ładowanie danych...</p>
        </div>
      </div>
    );
  }

  const handleCancelJob = async (jobId: string) => {
    if (!window.confirm('Czy na pewno chcesz anulować ten druk?')) return;

    setLoading(true);
    try {
      await api.cancelJob(jobId);
      toast.success('Druk został anulowany');
      loadMyJobs();
      fetchCurrentJob();
    } catch (error) {
      const err = error as ApiError;
      toast.error(err.response?.data?.error || 'Nie udało się anulować druku');
    } finally {
      setLoading(false);
    }
  };

  const handleRetryJob = async (jobId: string) => {
    setLoading(true);
    try {
      await api.retryJob(jobId);
      toast.success('Druk został ponownie dodany do kolejki');
      loadMyJobs();
    } catch (error) {
      const err = error as ApiError;
      toast.error(err.response?.data?.error || 'Nie udało się ponowić druku');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
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

  const statusLabels: Record<string, string> = {
    all: 'Wszystkie',
    pending: 'Oczekujące',
    scheduled: 'Zaplanowane',
    printing: 'Drukuje',
    completed: 'Ukończone',
    failed: 'Nieudane',
    cancelled: 'Anulowane'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mój Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Witaj, <span className="text-foreground font-medium">{user?.firstName}</span>!
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard label="Wszystkie" value={stats.total} color="muted" />
          <StatCard label="Oczekujące" value={stats.pending} color="yellow" />
          <StatCard label="Zaplanowane" value={stats.scheduled} color="violet" />
          <StatCard label="Ukończone" value={stats.completed} color="primary" />
          <StatCard label="Nieudane" value={stats.failed} color="destructive" />
        </div>
      )}

      {/* Current Job */}
      {currentJob && currentJob.userId === user?.id && (
        <div className="relative overflow-hidden bg-card rounded-xl border border-border p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-lg border border-primary/20">
                  <Layers className="text-primary" size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Aktualny druk</h2>
                  <p className="text-sm text-muted-foreground">{currentJob.originalFileName}</p>
                </div>
              </div>
              <span className="text-3xl font-bold text-primary tabular-nums">
                {currentJob.progress?.toFixed(1)}%
              </span>
            </div>
            
            <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full transition-all duration-500"
                style={{ width: `${currentJob.progress || 0}%` }}
              />
            </div>
            
            {currentJob.printTimeLeft && (
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Czas drukowania: {Math.round((currentJob.printTime || 0) / 60)} min</span>
                <span>Pozostało: {Math.round(currentJob.printTimeLeft / 60)} min</span>
              </div>
            )}
            
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => handleCancelJob(currentJob.id)}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg font-medium hover:bg-destructive/20 disabled:opacity-50 transition-colors"
              >
                <Square size={18} />
                Zatrzymaj druk
              </button>
              <button
                onClick={() => navigate(`/print`)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary text-foreground border border-border rounded-lg font-medium hover:bg-secondary/80 transition-colors"
              >
                <Eye size={18} />
                Kontrola druku
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Jobs List */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Moje druki</h2>
            <p className="text-sm text-muted-foreground">Historia wszystkich zadań</p>
          </div>
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="appearance-none px-4 py-2 pr-10 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors cursor-pointer"
            >
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        <div className="divide-y divide-border">
          {myJobs.length > 0 ? (
            myJobs.map((job) => (
              <div key={job.id} className="px-6 py-4 hover:bg-secondary/30 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div className="p-2 bg-secondary rounded-lg">
                      <FileText className="text-muted-foreground" size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-medium text-foreground truncate">{job.originalFileName}</h3>
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyle(job.status)}`}>
                          {statusLabels[job.status] || job.status}
                        </span>
                      </div>

                      <div className="text-sm text-muted-foreground space-y-1">
                        {job.scheduledAt && (
                          <div className="flex items-center gap-2">
                            <Calendar size={14} />
                            <span>Zaplanowano: {formatDateTimeSafe(job.scheduledAt)}</span>
                          </div>
                        )}
                        {job.createdAt && (
                          <p>Utworzono: {formatDateSafe(job.createdAt)}</p>
                        )}
                        {job.progress !== undefined && job.status === 'printing' && (
                          <div className="mt-2 w-full max-w-xs">
                            <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500/80 to-blue-500 rounded-full transition-all"
                                style={{ width: `${job.progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                        {job.failureReason && (
                          <p className="text-destructive mt-1">Błąd: {job.failureReason}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    {job.status === 'printing' && (
                      <button
                        onClick={() => navigate(`/print`)}
                        className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="Kontrola druku"
                      >
                        <Eye size={18} />
                      </button>
                    )}
                    {(job.status === 'failed' || job.status === 'cancelled') && (
                      <button
                        onClick={() => handleRetryJob(job.id)}
                        disabled={loading}
                        className="p-2 text-primary hover:bg-primary/10 rounded-lg disabled:opacity-50 transition-colors"
                        title="Ponów"
                      >
                        <RefreshCw size={18} />
                      </button>
                    )}
                    {['scheduled', 'pending', 'printing'].includes(job.status) && user?.role === 'admin' && (
                      <button
                        onClick={() => handleCancelJob(job.id)}
                        disabled={loading}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg disabled:opacity-50 transition-colors"
                        title="Anuluj"
                      >
                        <Square size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-16 text-center">
              <div className="p-4 bg-secondary/50 rounded-full w-fit mx-auto mb-4">
                <FileText className="text-muted-foreground" size={32} />
              </div>
              <p className="text-muted-foreground">Brak druków do wyświetlenia</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  color: 'primary' | 'yellow' | 'violet' | 'destructive' | 'muted';
}

function StatCard({ label, value, color }: StatCardProps) {
  const colorStyles = {
    primary: 'text-primary',
    yellow: 'text-yellow-400',
    violet: 'text-violet-400',
    destructive: 'text-destructive',
    muted: 'text-foreground',
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold mt-1 tabular-nums ${colorStyles[color]}`}>{value}</p>
    </div>
  );
}
