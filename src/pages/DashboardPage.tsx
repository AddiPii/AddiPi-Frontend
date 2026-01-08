import { useEffect, useState } from 'react';
import { Square, RefreshCw, Calendar, FileText } from 'lucide-react';
import { api } from '../services/api';
import { useStore } from '../store/useStore';
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
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Ładowanie danych...</p>
        </div>
      </div>
    );
  }

  async function loadMyJobs () {
    try {
      const params = selectedStatus !== 'all' ? { status: selectedStatus, limit: 50 } : { limit: 50 };
      const { data } = await api.getUserJobs(params);
      setMyJobs(data.jobs);
    } catch (error) {
      console.error('Failed to load jobs:', error);
      // Don't show toast on every poll failure
      setMyJobs([]);
    }
  };

  async function loadStats() {
    try {
      const { data } = await api.getUserStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
      setStats(null);
    }
  };

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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Mój Dashboard</h1>
        <div className="text-sm text-gray-600">
          Witaj, <span className="font-semibold">{user?.firstName}</span>!
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Wszystkie</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Oczekujące</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Zaplanowane</p>
            <p className="text-2xl font-bold text-purple-600">{stats.scheduled}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Ukończone</p>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Nieudane</p>
            <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
          </div>
        </div>
      )}

      {/* Current Job */}
      {currentJob && currentJob.userId === user?.id && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <h2 className="text-xl font-bold mb-4">Aktualny druk</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">{currentJob.originalFileName}</span>
              <span className="text-2xl font-bold">{currentJob.progress?.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-blue-300 bg-opacity-50 rounded-full h-4">
              <div
                className="bg-white h-4 rounded-full transition-all duration-500"
                style={{ width: `${currentJob.progress || 0}%` }}
              />
            </div>
            {currentJob.printTimeLeft && (
              <div className="flex justify-between text-sm">
                <span>Czas drukowania: {Math.round((currentJob.printTime || 0) / 60)} min</span>
                <span>Pozostało: {Math.round(currentJob.printTimeLeft / 60)} min</span>
              </div>
            )}
            <button
              onClick={() => handleCancelJob(currentJob.id)}
              disabled={loading}
              className="mt-4 w-full bg-white text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-50 disabled:opacity-50"
            >
              <Square size={18} className="inline mr-2" />
              Zatrzymaj druk
            </button>
          </div>
        </div>
      )}

      {/* Jobs List */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Moje druki</h2>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {myJobs.length > 0 ? (
          <div className="space-y-3">
            {myJobs.map((job) => (
              <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <FileText className="text-gray-400" size={20} />
                      <h3 className="font-semibold text-gray-900">{job.originalFileName}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                        {statusLabels[job.status] || job.status}
                      </span>
                    </div>

                    <div className="text-sm text-gray-600 space-y-1">
                      {job.scheduledAt && (
                        <div className="flex items-center">
                          <Calendar size={14} className="mr-2" />
                          <span>Zaplanowano: {formatDateTimeSafe(job.scheduledAt)}</span>
                        </div>
                      )}
                      {job.createdAt && (
                        <p>Utworzono: {formatDateSafe(job.createdAt)}</p>
                      )}
                      {job.progress !== undefined && job.status === 'printing' && (
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${job.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                      {job.failureReason && (
                        <p className="text-red-600 mt-1">Błąd: {job.failureReason}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    {(job.status === 'failed' || job.status === 'cancelled') && (
                      <button
                        onClick={() => handleRetryJob(job.id)}
                        disabled={loading}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50"
                        title="Ponów"
                      >
                        <RefreshCw size={18} />
                      </button>
                    )}
                    {['scheduled', 'pending', 'printing'].includes(job.status) && user?.role === 'admin' && (
                      <button
                        onClick={() => handleCancelJob(job.id)}
                        disabled={loading}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                        title="Anuluj"
                      >
                        <Square size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">Brak druków do wyświetlenia</p>
          </div>
        )}
      </div>
    </div>
  );
}
