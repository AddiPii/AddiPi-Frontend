import { useEffect, useState } from 'react';
import { Square, Play, RefreshCw, Clock, TrendingUp, AlertCircle, CheckCircle, XCircle, Camera, Eye } from 'lucide-react';
import { api } from '../services/api';
import { useStore } from '../store/useStore';
import type { Job } from '../types';
import toast from 'react-hot-toast';
import { formatDateTimeSafe, formatDuration } from '../utils/formatters';

interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
}

export default function PrintControlPage() {
  const { user, currentJob, fetchCurrentJob } = useStore();
  const [displayJob, setDisplayJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Check if current user can control this job
  const canControlJob = (job: Job | null): boolean => {
    if (!job || !user) return false;
    return user.role === 'admin' || job.userId === user.id;
  };

  // All authenticated users can view job progress
  const canViewJob = (): boolean => {
    return !!user;
  };

  useEffect(() => {
    loadJobData();

    const interval = setInterval(() => {
      loadJobData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadJobData = async () => {
    try {
      await fetchCurrentJob();
      
      // If there's a current job printing, show it
      if (currentJob && currentJob.status === 'printing') {
        setDisplayJob(currentJob);
      } else {
        // Otherwise, fetch the most recent job
        const { data } = await api.getUserJobs({ limit: 1, sort: '-createdAt' });
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
    if (!window.confirm('Czy na pewno chcesz zatrzymać ten druk?')) return;

    setActionLoading(true);
    try {
      await api.cancelJob(jobId);
      toast.success('Druk został zatrzymany');
      loadJobData();
    } catch (error) {
      const err = error as ApiError;
      toast.error(err.response?.data?.error || 'Nie udało się zatrzymać druku');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRetryJob = async (jobId: string) => {
    setActionLoading(true);
    try {
      await api.retryJob(jobId);
      toast.success('Druk został wznowiony i dodany do kolejki');
      loadJobData();
    } catch (error) {
      const err = error as ApiError;
      toast.error(err.response?.data?.error || 'Nie udało się wznowić druku');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'printing': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="text-green-600" size={32} />;
      case 'failed': return <XCircle className="text-red-600" size={32} />;
      case 'printing': return <TrendingUp className="text-blue-600" size={32} />;
      case 'pending': return <Clock className="text-yellow-600" size={32} />;
      case 'scheduled': return <Clock className="text-purple-600" size={32} />;
      case 'cancelled': return <AlertCircle className="text-gray-600" size={32} />;
      default: return <AlertCircle className="text-gray-600" size={32} />;
    }
  };

  const statusLabels: Record<string, string> = {
    completed: 'Ukończone',
    failed: 'Nieudane',
    printing: 'Drukuje',
    pending: 'Oczekujące',
    scheduled: 'Zaplanowane',
    cancelled: 'Anulowane'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Ładowanie danych...</p>
        </div>
      </div>
    );
  }

  if (!displayJob) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Kontrola druku</h1>
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <AlertCircle className="mx-auto text-gray-400 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Brak aktywnych zadań druku</h2>
          <p className="text-gray-600 mb-6">
            Obecnie nie ma żadnych zadań do monitorowania. Prześlij plik G-code, aby rozpocząć druk.
          </p>
          <a
            href="/upload"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Prześlij plik
          </a>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kontrola druku</h1>
          <p className="text-gray-600 mt-1">
            {isCurrentlyPrinting ? 'Monitorowanie aktywnego druku' : 'Ostatnie zadanie druku'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center px-4 py-2 bg-blue-50 rounded-lg">
            <Eye size={18} className="text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-800">Tryb obserwacji</span>
          </div>
          {hasControlAccess && (
            <div className="flex items-center px-4 py-2 bg-green-50 rounded-lg">
              <CheckCircle size={18} className="text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-800">
                {user?.role === 'admin' ? 'Admin' : 'Kontrola'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Owner/User Info */}
      {!isOwnJob && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="text-yellow-600 mr-3 mt-0.5 flex-shrink-0" size={20} />
          <div>
            <p className="text-sm font-medium text-yellow-800">
              To zadanie należy do użytkownika: <span className="font-bold">{displayJob.userEmail}</span>
            </p>
            {user?.role === 'admin' ? (
              <p className="text-xs text-yellow-700 mt-1">
                Jako administrator masz pełny dostęp do kontroli tego druku.
              </p>
            ) : (
              <p className="text-xs text-yellow-700 mt-1">
                Możesz monitorować postęp, ale nie możesz kontrolować druku innego użytkownika.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Job Info - Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Card */}
          <div className={`bg-gradient-to-br ${
            isCurrentlyPrinting 
              ? 'from-blue-500 to-blue-700' 
              : displayJob.status === 'completed'
              ? 'from-green-500 to-green-700'
              : displayJob.status === 'failed'
              ? 'from-red-500 to-red-700'
              : 'from-gray-500 to-gray-700'
          } rounded-xl shadow-lg p-6 text-white`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  {getStatusIcon(displayJob.status)}
                  <div>
                    <h2 className="text-2xl font-bold">{displayJob.originalFileName}</h2>
                    <p className="text-sm opacity-90 mt-1">{displayJob.userEmail}</p>
                  </div>
                </div>
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(displayJob.status)}`}>
                  {statusLabels[displayJob.status] || displayJob.status}
                </span>
              </div>
            </div>

            {/* Progress Section */}
            {isCurrentlyPrinting && displayJob.progress !== undefined && (
              <div className="space-y-4 mt-6">
                <div className="flex items-center justify-between text-xl">
                  <span className="font-medium">Postęp drukowania</span>
                  <span className="font-bold">{displayJob.progress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-white bg-opacity-30 rounded-full h-6">
                  <div
                    className="bg-white h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-3"
                    style={{ width: `${displayJob.progress}%` }}
                  >
                    <span className="text-blue-600 font-bold text-sm">
                      {displayJob.progress > 10 ? `${displayJob.progress.toFixed(0)}%` : ''}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Time Information */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              {displayJob.printTime && (
                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <p className="text-sm opacity-90 mb-1">Całkowity czas</p>
                  <p className="text-2xl font-bold">{formatDuration(displayJob.printTime)}</p>
                </div>
              )}
              {displayJob.printTimeLeft && isCurrentlyPrinting && (
                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <p className="text-sm opacity-90 mb-1">Pozostało</p>
                  <p className="text-2xl font-bold">{formatDuration(displayJob.printTimeLeft)}</p>
                </div>
              )}
            </div>

            {/* Error Message */}
            {displayJob.failureReason && (
              <div className="bg-white bg-opacity-20 rounded-lg p-4 mt-4">
                <p className="text-sm font-medium mb-1">Powód błędu:</p>
                <p className="text-sm">{displayJob.failureReason}</p>
              </div>
            )}
          </div>

          {/* Camera Section - Placeholder for future implementation */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <Camera className="mr-2 text-blue-600" size={24} />
                Podgląd z kamery
              </h3>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                Wkrótce
              </span>
            </div>
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Camera className="mx-auto text-gray-400 mb-3" size={48} />
                <p className="text-gray-600 font-medium">Kamera nie jest jeszcze dostępna</p>
                <p className="text-sm text-gray-500 mt-1">
                  Ta funkcja będzie dostępna w przyszłych aktualizacjach
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Controls & Details */}
        <div className="space-y-6">
          {/* Control Panel */}
          {canViewJob() && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Panel kontroli</h3>
              
              {hasControlAccess ? (
                <div className="space-y-3">
                  {canCancel && (
                    <button
                      onClick={() => handleCancelJob(displayJob.id)}
                      disabled={actionLoading}
                      className="w-full bg-red-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center"
                    >
                      <Square size={20} className="mr-2" />
                      {displayJob.status === 'printing' ? 'Zatrzymaj druk' : 'Anuluj zadanie'}
                    </button>
                  )}
                  {canRetry && (
                    <button
                      onClick={() => handleRetryJob(displayJob.id)}
                      disabled={actionLoading}
                      className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center"
                    >
                      <Play size={20} className="mr-2" />
                      Wznów druk
                    </button>
                  )}
                  {!canCancel && !canRetry && (
                    <div className="text-center py-4 text-gray-500">
                      <CheckCircle className="mx-auto mb-2" size={32} />
                      <p className="text-sm">Brak dostępnych akcji</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <Eye className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className="text-sm text-gray-600 font-medium">Tryb tylko do odczytu</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Możesz monitorować postęp, ale nie kontrolować tego druku
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Job Details */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Szczegóły zadania</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">ID zadania</p>
                <p className="font-mono text-xs text-gray-900 break-all">{displayJob.id}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">ID pliku</p>
                <p className="font-mono text-xs text-gray-900 break-all">{displayJob.fileId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Użytkownik</p>
                <p className="text-sm text-gray-900">{displayJob.userEmail}</p>
              </div>
              {displayJob.createdAt && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Utworzono</p>
                  <p className="text-sm text-gray-900">{formatDateTimeSafe(displayJob.createdAt)}</p>
                </div>
              )}
              {displayJob.scheduledAt && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Zaplanowano na</p>
                  <p className="text-sm text-gray-900">{formatDateTimeSafe(displayJob.scheduledAt)}</p>
                </div>
              )}
              {displayJob.startedAt && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Rozpoczęto</p>
                  <p className="text-sm text-gray-900">{formatDateTimeSafe(displayJob.startedAt)}</p>
                </div>
              )}
              {displayJob.completedAt && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Ukończono</p>
                  <p className="text-sm text-gray-900">{formatDateTimeSafe(displayJob.completedAt)}</p>
                </div>
              )}
              {displayJob.deviceId && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">ID urządzenia</p>
                  <p className="font-mono text-xs text-gray-900">{displayJob.deviceId}</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-blue-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 mb-3 text-sm">Szybkie akcje</h4>
            <div className="space-y-2">
              <a
                href="/dashboard"
                className="block text-center px-4 py-2 bg-white text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
              >
                Zobacz wszystkie druki
              </a>
              <a
                href="/upload"
                className="block text-center px-4 py-2 bg-white text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
              >
                Prześlij nowy plik
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
