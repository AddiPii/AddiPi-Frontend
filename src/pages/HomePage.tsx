import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Activity, CheckCircle, XCircle, Clock, TrendingUp, Eye, Zap, ArrowRight, Layers } from 'lucide-react';
import { useStore } from '../store/useStore';
import { api } from '../services/api';
import type { Job } from '../types';
import { formatDateSafe, formatDateTimeSafe } from '../utils/formatters';

export default function HomePage() {
  const { t } = useTranslation();
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
  }, [fetchCurrentJob]);

  const getStatusIndicator = (state?: string, isPrinting?: boolean) => {
    if (isPrinting) return { color: 'bg-primary', pulse: true, text: t('home.status.printing') };
    switch (state) {
      case 'Operational': return { color: 'bg-primary', pulse: false, text: t('home.status.ready') };
      case 'Printing': return { color: 'bg-primary', pulse: true, text: t('home.status.printing') };
      case 'Offline': return { color: 'bg-muted-foreground', pulse: false, text: t('home.status.offline') };
      default: return { color: 'bg-muted-foreground', pulse: false, text: t('home.status.offline') };
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
              {t('home.title')}
            </h1>
            
            {/* Mobile */}
            <div className="flex lg:hidden flex-col items-center gap-4 text-center">
              <img src="images/logo.png" alt="AddiPi Logo" className="w-60 mt-2 mb-2 rounded-xl border border-border object-cover" />
              <p className="text-lg text-muted-foreground text-pretty">
                {t('home.subtitle')}
              </p>
            </div>
            
            {/* Desktop */}
            <p className="hidden lg:block text-lg text-muted-foreground max-w-xl text-pretty">
              {t('home.subtitle')}
            </p>
            
            <div className="flex flex-wrap items-center gap-3 pt-2 justify-center lg:justify-start">
              <button
                onClick={() => navigate('/upload')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Zap size={18} />
                {t('home.startPrint')}
              </button>
              <button
                onClick={() => navigate('/print')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-secondary text-foreground font-medium rounded-lg border border-border hover:bg-secondary/80 transition-colors"
              >
                <Eye size={18} />
                {t('home.livePreview')}
              </button>
            </div>
          </div>
          
          {/* Desktop version - large logo */}
          <div className="relative hidden lg:block">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
            <div className="relative p-0.2 bg-secondary/50 rounded-2xl border border-border">
              <img src="images/logo.png" alt="" className='border rounded-2xl w-60'/>
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
                <h3 className="font-semibold text-foreground">{t('home.currentPrint')}</h3>
                <p className="text-sm text-muted-foreground">{t('home.realTimeStatus')}</p>
              </div>
            </div>
            {currentJob && (
              <button
                onClick={() => navigate('/print')}
                className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                {t('home.details')}
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
                  <span>{t('home.timeRemaining')}: {Math.round(currentJob.printTimeLeft / 60)} {t('home.min')}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="p-4 bg-secondary/50 rounded-full mb-4">
                <Layers size={32} className="text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">{t('home.noActivePrint')}</p>
              <button
                onClick={() => navigate('/upload')}
                className="mt-4 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                {t('home.startNewPrint')}
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
              {t('home.stats.completed')}
            </span>
          </div>
          <div className="mt-6">
            <p className="text-4xl font-bold text-foreground tabular-nums">
              {metrics?.metrics.completed || 0}
            </p>
            <p className="text-sm text-muted-foreground mt-1">{t('home.completedSuccess')}</p>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={TrendingUp}
          label={t('home.stats.printing')}
          value={metrics?.metrics.printing || 0}
          color="primary"
        />
        <StatCard
          icon={Clock}
          label={t('home.stats.queued')}
          value={(metrics?.metrics.queued || 0) + (metrics?.metrics.printing || 0)}
          color="yellow"
        />
        <StatCard
          icon={XCircle}
          label={t('home.stats.failed')}
          value={metrics?.metrics.failed || 0}
          color="destructive"
        />
        <StatCard
          icon={Activity}
          label={t('home.stats.all')}
          value={metrics?.metrics.total || 0}
          color="muted"
        />
      </div>

      {/* Jobs Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">{t('home.recentPrints')}</h2>
            <p className="text-sm text-muted-foreground">{t('home.printHistory')}</p>
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
                <p className="text-muted-foreground">{t('home.noPrints')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Jobs */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">{t('home.upcomingPrints')}</h2>
            <p className="text-sm text-muted-foreground">{t('home.scheduledTasks')}</p>
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
                <p className="text-muted-foreground">{t('home.noUpcoming')}</p>
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
