import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Square, Play, Clock, TrendingUp, AlertCircle, CheckCircle, XCircle, Camera, Eye, Thermometer, Upload } from 'lucide-react';
import { api } from '../services/api';
import { useStore } from '../store/useStore';
import type { Job } from '../types';
import toast from 'react-hot-toast';
import { formatDateTimeSafe, formatDuration } from '../utils/formatters';
import { Link } from 'react-router-dom';

interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
}

export default function PrintControlPage() {
  const { t } = useTranslation();
  const [cameraUrl, setCameraUrl] = useState<string | null>(null)
  const [cameraError, setCameraError] = useState(false);
  const { printerStatus, user, currentJob, fetchCurrentJob } = useStore();
  const [displayJob, setDisplayJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const canControlJob = (job: Job | null): boolean => {
    if (!job || !user) return false;
    return user.role === 'admin' || job.userId === user.id;
  };

  const canViewJob = (): boolean => {
    return !!user;
  };

  useEffect(() => {
    loadJobData();
    try{
      fetch('https://addipi-video-service.vercel.app/camera-url')
        .then(res => res.json())
        .then(data => setCameraUrl(`${data.url}/webcam/?action=stream`))
    }
    catch{
      setCameraUrl('')
    }
    
    const interval = setInterval(() => {
      loadJobData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadJobData = async () => {
    try {
      await fetchCurrentJob();
      
      if (currentJob && currentJob.status === 'printing') {
        setDisplayJob(currentJob);
      } else {
        const { data } = await api.getUserJobs({ limit: 1, sort: '-scheduledAt' });
        if (data.jobs.length > 0) {
          setDisplayJob(data.jobs[0]);
        } else {
          setDisplayJob(null);
        }
      }
    } catch (error) {
      console.error('Failed to load job data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelJob = async (jobId: string) => {
    if (!window.confirm(t('printControl.confirmStop'))) return;

    setActionLoading(true);
    try {
      await api.cancelJob(jobId);
      toast.success(t('printControl.stopSuccess'));
      loadJobData();
    } catch (error) {
      const err = error as ApiError;
      toast.error(err.response?.data?.error || t('printControl.stopError'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleRetryJob = async (jobId: string) => {
    setActionLoading(true);
    try {
      await api.retryJob(jobId);
      toast.success(t('printControl.resumeSuccess'));
      loadJobData();
    } catch (error) {
      const err = error as ApiError;
      toast.error(err.response?.data?.error || t('printControl.resumeError'));
    } finally {
      setActionLoading(false);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="text-primary" size={28} />;
      case 'failed': return <XCircle className="text-destructive" size={28} />;
      case 'printing': return <TrendingUp className="text-blue-400" size={28} />;
      case 'pending': return <Clock className="text-yellow-400" size={28} />;
      case 'scheduled': return <Clock className="text-violet-400" size={28} />;
      case 'cancelled': return <AlertCircle className="text-muted-foreground" size={28} />;
      default: return <AlertCircle className="text-muted-foreground" size={28} />;
    }
  };

  const statusLabels: Record<string, string> = {
    completed: t('dashboard.status.completed'),
    failed: t('dashboard.status.failed'),
    printing: t('dashboard.status.printing'),
    pending: t('dashboard.status.pending'),
    scheduled: t('dashboard.status.scheduled'),
    cancelled: t('dashboard.status.cancelled')
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">{t('dashboard.loading')}</p>
        </div>
      </div>
    );
  }

  // No active job state
  if (!displayJob) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('printControl.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('printControl.monitoring')}</p>
        </div>

        {/* Empty State */}
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-secondary rounded-2xl border border-border mb-6">
            <AlertCircle className="text-muted-foreground" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">{t('printControl.noActiveTasks')}</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {t('printControl.noTasksDescription')}
          </p>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <Upload size={18} />
            {t('printControl.uploadFile')}
          </Link>
        </div>

        {/* Camera Section */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary rounded-lg border border-border">
                <Camera className="text-muted-foreground" size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{t('printControl.cameraPreview')}</h3>
                <p className="text-sm text-muted-foreground">{t('printControl.realTimeImage')}</p>
              </div>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
              cameraUrl ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted text-muted-foreground border-border'
            }`}>
              {cameraUrl ? t('printControl.online') : t('printControl.offline')}
            </span>
          </div>
          
          <div className="p-6">
            {/* Temperature Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-secondary/50 rounded-lg border border-border p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Thermometer size={14} />
                  {t('printControl.bedTemp')}
                </div>
                <p className="text-xl font-bold text-foreground tabular-nums">
                  {printerStatus?.temperature?.bed != null ? `${printerStatus.temperature.bed} °C` : "---"}
                </p>
              </div>
              <div className="bg-secondary/50 rounded-lg border border-border p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Thermometer size={14} />
                  {t('printControl.nozzleTemp')}
                </div>
                <p className="text-xl font-bold text-foreground tabular-nums">
                  {printerStatus?.temperature?.nozzle != null ? `${printerStatus.temperature.nozzle} °C` : "---"}
                </p>
              </div>
            </div>

            {/* Camera Feed */}
            <div className="aspect-video bg-secondary rounded-lg flex items-center justify-center overflow-hidden">
              {cameraUrl && !cameraError ? (
                <img
                  src={`${cameraUrl}/?action=stream`}
                  alt="Camera feed"
                  className="w-full h-full object-cover"
                  onError={() => setCameraError(true)}
                />
              ) : (
                <div className="text-center py-8">
                  <Camera className="mx-auto text-muted-foreground mb-3" size={48} />
                  <p className="text-foreground font-medium">{t('printControl.cameraOffline')}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('printControl.cameraOfflineDescription')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isCurrentlyPrinting = displayJob.status === 'printing';
  const hasControlAccess = canControlJob(displayJob);
  const canCancel = ['scheduled', 'pending', 'printing'].includes(displayJob.status) && hasControlAccess;
  const canRetry = ['failed', 'cancelled'].includes(displayJob.status) && hasControlAccess;
  const isOwnJob = displayJob.userId === user?.id;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('printControl.title')}</h1>
          <p className="text-muted-foreground mt-1">
            {isCurrentlyPrinting ? t('printControl.monitoringActive') : t('printControl.lastTask')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary border border-border rounded-lg">
            <Eye size={16} className="text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">{t('printControl.watchMode')}</span>
          </div>
          {hasControlAccess && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg">
              <CheckCircle size={16} className="text-primary" />
              <span className="text-sm font-medium text-primary">
                {user?.role === 'admin' ? t('common.admin') : t('printControl.control')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Owner/User Info */}
      {!isOwnJob && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-yellow-400 mt-0.5 flex-shrink-0" size={20} />
          <div>
            <p className="text-sm font-medium text-foreground">
              {t('printControl.taskBelongsTo')} <span className="text-yellow-400">{displayJob.userEmail}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {user?.role === 'admin' 
                ? t('printControl.adminAccess')
                : t('printControl.monitorOnly')}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Job Info - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Card */}
          <div className="relative overflow-hidden bg-card rounded-xl border border-border p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
            
            <div className="relative space-y-6">
              {/* Job Header */}
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl border ${getStatusStyle(displayJob.status)}`}>
                  {getStatusIcon(displayJob.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-foreground truncate">{displayJob.originalFileName}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{displayJob.userEmail}</p>
                  <span className={`inline-flex mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyle(displayJob.status)}`}>
                    {statusLabels[displayJob.status] || displayJob.status}
                  </span>
                </div>
              </div>

              {/* Progress Section */}
              {isCurrentlyPrinting && displayJob.progress !== undefined && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t('printControl.printProgress')}</span>
                    <span className="text-2xl font-bold text-primary tabular-nums">{displayJob.progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-4 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full transition-all duration-500"
                      style={{ width: `${displayJob.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Time Information */}
              <div className="grid grid-cols-2 gap-4">
                {displayJob.printTime && (
                  <div className="bg-secondary/50 rounded-lg border border-border p-4">
                    <p className="text-sm text-muted-foreground mb-1">{t('printControl.totalTime')}</p>
                    <p className="text-xl font-bold text-foreground">{formatDuration(displayJob.printTime)}</p>
                  </div>
                )}
                {displayJob.printTimeLeft && isCurrentlyPrinting && (
                  <div className="bg-secondary/50 rounded-lg border border-border p-4">
                    <p className="text-sm text-muted-foreground mb-1">{t('printControl.remaining')}</p>
                    <p className="text-xl font-bold text-foreground">{formatDuration(displayJob.printTimeLeft)}</p>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {displayJob.failureReason && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="text-sm font-medium text-destructive mb-1">{t('printControl.errorReason')}</p>
                  <p className="text-sm text-muted-foreground">{displayJob.failureReason}</p>
                </div>
              )}
            </div>
          </div>

          {/* Camera Section */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary rounded-lg border border-border">
                  <Camera className="text-muted-foreground" size={18} />
                </div>
                <h3 className="font-semibold text-foreground">{t('printControl.cameraPreview')}</h3>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                cameraUrl ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted text-muted-foreground border-border'
              }`}>
                {cameraUrl ? t('printControl.online') : t('printControl.offline')}
              </span>
            </div>
            <div className="aspect-video bg-secondary flex items-center justify-center">
              {cameraUrl && !cameraError ? (
                <img
                  src={`${cameraUrl}/?action=stream`}
                  alt="Camera feed"
                  className="w-full h-full object-cover"
                  onError={() => setCameraError(true)}
                />
              ) : (
                <div className="text-center py-8">
                  <Camera className="mx-auto text-muted-foreground mb-3" size={48} />
                  <p className="text-foreground font-medium">{t('printControl.cameraOffline')}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('printControl.cameraOfflineDescription')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Controls & Details */}
        <div className="space-y-6">
          {/* Control Panel */}
          {canViewJob() && (
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <h3 className="text-lg font-semibold text-foreground">{t('printControl.controlPanel')}</h3>
              
              {/* Temperature Info */}
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Thermometer size={14} />
                    {t('printControl.bed')}
                  </span>
                  <span className="font-medium text-foreground tabular-nums">
                    {printerStatus?.temperature?.bed != null ? `${printerStatus.temperature.bed} °C` : "---"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Thermometer size={14} />
                    {t('printControl.nozzle')}
                  </span>
                  <span className="font-medium text-foreground tabular-nums">
                    {printerStatus?.temperature?.nozzle != null ? `${printerStatus.temperature.nozzle} °C` : "---"}
                  </span>
                </div>
              </div>

              {hasControlAccess ? (
                <div className="space-y-3 pt-2">
                  {canCancel && (
                    <button
                      onClick={() => handleCancelJob(displayJob.id)}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg font-medium hover:bg-destructive/20 disabled:opacity-50 transition-colors"
                    >
                      <Square size={18} />
                      {displayJob.status === 'printing' ? t('printControl.stopPrint') : t('printControl.cancelTask')}
                    </button>
                  )}
                  {canRetry && (
                    <button
                      onClick={() => handleRetryJob(displayJob.id)}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                      <Play size={18} />
                      {t('printControl.resumePrint')}
                    </button>
                  )}
                  {!canCancel && !canRetry && (
                    <div className="text-center py-4">
                      <CheckCircle className="mx-auto text-muted-foreground mb-2" size={24} />
                      <p className="text-sm text-muted-foreground">{t('printControl.noActions')}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-secondary/50 rounded-lg border border-border p-4 text-center">
                  <Eye className="mx-auto text-muted-foreground mb-2" size={24} />
                  <p className="text-sm text-foreground font-medium">{t('printControl.readOnlyMode')}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('printControl.readOnlyDescription')}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Job Details */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">{t('printControl.taskDetails')}</h3>
            <div className="space-y-3">
              <DetailRow label={t('printControl.taskId')} value={displayJob.id} mono />
              <DetailRow label={t('printControl.fileId')} value={displayJob.fileId} mono />
              <DetailRow label={t('printControl.user')} value={displayJob.userEmail} />
              {displayJob.createdAt && <DetailRow label={t('dashboard.created')} value={formatDateTimeSafe(displayJob.createdAt)} />}
              {displayJob.scheduledAt && <DetailRow label={t('printControl.scheduledFor')} value={formatDateTimeSafe(displayJob.scheduledAt)} />}
              {displayJob.startedAt && <DetailRow label={t('printControl.started')} value={formatDateTimeSafe(displayJob.startedAt)} />}
              {displayJob.completedAt && <DetailRow label={t('printControl.completed')} value={formatDateTimeSafe(displayJob.completedAt)} />}
              {displayJob.deviceId && <DetailRow label={t('printControl.deviceId')} value={displayJob.deviceId} mono />}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-secondary/50 rounded-xl border border-border p-4 space-y-2">
            <h4 className="font-semibold text-foreground text-sm mb-3">{t('printControl.quickActions')}</h4>
            <Link
              to="/dashboard"
              className="block text-center px-4 py-2 bg-card text-foreground rounded-lg text-sm font-medium hover:bg-secondary border border-border transition-colors"
            >
              {t('printControl.backToDashboard')}
            </Link>
            <Link
              to="/upload"
              className="block text-center px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              {t('printControl.newPrint')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`text-sm text-foreground break-all ${mono ? 'font-mono text-xs' : ''}`}>{value}</p>
    </div>
  );
}