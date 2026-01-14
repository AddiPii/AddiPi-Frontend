import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, Activity, CheckCircle, XCircle, Clock, TrendingUp, Eye } from 'lucide-react';
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

  const getStatusColor = (state?: string) => {
    switch (state) {
      case 'Operational': return 'bg-green-100 text-green-800';
      case 'Printing': return 'bg-blue-100 text-blue-800';
      case 'Offline': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (state?: string, isPrinting?: boolean) => {
    if (isPrinting) return 'Drukuje';
    switch (state) {
      case 'Operational': return 'Bezczynna';
      case 'Printing': return 'Drukuje';
      case 'Offline': return 'Offline';
      default: return 'Offline';
    }
  };

  const getJobStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'printing': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">AddiPi 3D Printer</h1>
            <p className="text-blue-100 text-lg">System zarządzania drukarką 3D</p>
          </div>
          <Printer size={64} className="opacity-80" />
        </div>
      </div>

      {/* Printer Status */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Status drukarki</h2>
          <span className={`px-4 py-2 rounded-full font-medium ${getStatusColor(printerStatus?.printerState)}`}>
            {getStatusText(printerStatus?.printerState, printerStatus?.isPrinting)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Activity className="text-blue-600 mr-2" size={24} />
              <h3 className="font-semibold text-gray-900">Postęp</h3>
            </div>
            <div className="mt-3">
              {currentJob ? (
                <>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>{currentJob.originalFileName}</span>
                    <span>{currentJob.progress?.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${currentJob.progress || 0}%` }}
                    />
                  </div>
                  {currentJob.printTimeLeft && (
                    <p className="text-sm text-gray-600 mt-2">
                      Pozostało: {Math.round(currentJob.printTimeLeft / 60)} min
                    </p>
                  )}
                  <button
                    onClick={() => navigate(`/print`)}
                    className="mt-3 w-full px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center justify-center"
                  >
                    <Eye size={18} className="mr-2" />
                    Zobacz szczegóły
                  </button>
                </>
              ) : (
                <p className="text-gray-500">Brak aktywnego druku</p>
              )}
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <CheckCircle className="text-green-600 mr-2" size={24} />
              <h3 className="font-semibold text-gray-900">Ukończone</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-3">
              {metrics?.metrics.completed || 0}
            </p>
            <p className="text-sm text-gray-600">Total prints</p>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Clock className="text-yellow-600 mr-2" size={24} />
              <h3 className="font-semibold text-gray-900">W kolejce</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-3">
              {(metrics?.metrics.queued || 0) + (metrics?.metrics.printing || 0)}
            </p>
            <p className="text-sm text-gray-600">Waiting jobs</p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Drukuje</p>
                <p className="text-2xl font-bold text-blue-600">{metrics.metrics.printing}</p>
              </div>
              <TrendingUp className="text-blue-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Zaplanowane</p>
                <p className="text-2xl font-bold text-purple-600">{metrics.metrics.queued}</p>
              </div>
              <Clock className="text-purple-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Niepowodzenia</p>
                <p className="text-2xl font-bold text-red-600">{metrics.metrics.failed}</p>
              </div>
              <XCircle className="text-red-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Wszystkie</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.metrics.total}</p>
              </div>
              <Activity className="text-gray-600" size={32} />
            </div>
          </div>
        </div>
      )}

      {/* Recent Jobs */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Ostatnie druki</h2>
        {recentJobs.length > 0 ? (
          <div className="space-y-3">
            {recentJobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{job.originalFileName}</p>
                  <p className="text-sm text-gray-600">{job.userEmail}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getJobStatusColor(job.status)}`}>
                    {job.status}
                  </span>
                  {job.completedAt && (
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDateSafe(job.completedAt)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">Brak ostatnich druków</p>
        )}
      </div>

      {/* Upcoming Jobs */}
      {upcomingJobs.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Nadchodzące druki</h2>
          <div className="space-y-3">
            {upcomingJobs.slice(0, 5).map((job) => (
              <div key={job.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{job.originalFileName}</p>
                  <p className="text-sm text-gray-600">{job.userEmail}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getJobStatusColor(job.status)}`}>
                    {job.status}
                  </span>
                  {job.scheduledAt && (
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDateTimeSafe(job.scheduledAt)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}