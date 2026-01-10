import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Play, Pause, Square, RefreshCw, Camera, 
  Clock, FileText, User, AlertCircle, Activity,
  Thermometer, Layers, Timer, TrendingUp
} from 'lucide-react';
import { api } from '../services/api';
import { useStore } from '../store/useStore';
import type { Job } from '../types';
import toast from 'react-hot-toast';
import { formatDateSafe, formatDuration } from '../utils/formatters';

interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
}

export default function PrintControlPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user } = useStore();
  
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);

  // Check if user can control this print
  const canControl = user?.role === 'admin' || (job && job.userId === user?.id);
  const canView = !!user; // All logged users can view

  useEffect(() => {
    if (!jobId) {
      navigate('/');
      return;
    }

    loadJobDetails();
    const interval = setInterval(loadJobDetails, 3000); // Refresh every 3 seconds

    return () => clearInterval(interval);
  }, [jobId]);

  const loadJobDetails = async () => {
    try {
      const { data } = await api.getJobProgress(jobId!);
      setJob(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load job:', error);
      setLoading(false);
      toast.error('Nie można załadować informacji o druku');
    }
  };

  const handlePauseResume = async () => {
    if (!canControl) {
      toast.error('Nie masz uprawnień do kontroli tego druku');
      return;
    }

    setActionLoading(true);
    try {
      // TODO: Implement pause/resume endpoint
      //toast.info('Funkcja wstrzymania/wznowienia będzie dostępna wkrótce');
      // await api.pauseJob(jobId!);
      // await loadJobDetails();
    } catch (error) {
      toast.error('Nie udało się wykonać akcji');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStop = async () => {
    if (!canControl) {
      toast.error('Nie masz uprawnień do kontroli tego druku');
      return;
    }

    if (!window.confirm('Czy na pewno chcesz zatrzymać druk? Tej akcji nie można cofnąć.')) {
      return;
    }

    setActionLoading(true);
    try {
      await api.cancelJob(jobId!);
      toast.success('Druk został zatrzymany');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error) {
      const err = error as ApiError;
      toast.error(err.response?.data?.error || 'Nie udało się zatrzymać druku');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Ładowanie danych druku...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto text-red-600 mb-4" size={64} />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Nie znaleziono druku</h2>
        <p className="text-gray-600 mb-4">Druk o podanym ID nie istnieje</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Powrót do dashboardu
        </button>
      </div>
    );
  }

  const isPrinting = job.status === 'printing';
  const progress = job.progress || 0;
  const printTime = job.printTime || 0;
  const printTimeLeft = job.printTimeLeft || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kontrola Druku</h1>
          <p className="text-gray-600 mt-1">
            Real-time monitoring i kontrola
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Activity className="text-green-600 animate-pulse" size={20} />
          <span className="text-sm text-gray-600">Live</span>
        </div>
      </div>

      {/* Job Info Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <FileText className="mr-2" size={24} />
              <h2 className="text-2xl font-bold">{job.originalFileName}</h2>
            </div>
            <div className="flex items-center text-blue-100">
              <User size={16} className="mr-2" />
              <span className="text-sm">{job.userEmail}</span>
            </div>
          </div>
          <div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
              isPrinting ? 'bg-green-500 text-white' : 'bg-white text-blue-600'
            }`}>
              {isPrinting ? 'Drukuje' : job.status}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Postęp druku</span>
            <span className="font-bold">{progress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-blue-800 bg-opacity-50 rounded-full h-4">
            <div
              className="bg-white h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
              style={{ width: `${Math.min(progress, 100)}%` }}
            >
              {progress > 10 && (
                <span className="text-xs text-blue-600 font-bold">
                  {progress.toFixed(0)}%
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Camera Feed */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center">
                <Camera className="text-gray-600 mr-2" size={20} />
                <h3 className="text-lg font-semibold text-gray-900">Podgląd Kamery</h3>
              </div>
              <button
                onClick={() => setCameraEnabled(!cameraEnabled)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  cameraEnabled
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cameraEnabled ? 'Włączona' : 'Wyłączona'}
              </button>
            </div>
            
            <div className="aspect-video bg-gray-900 relative">
              {cameraEnabled ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* TODO: Implement camera stream */}
                  <div className="text-center">
                    <Camera className="mx-auto text-gray-600 mb-4" size={64} />
                    <p className="text-gray-400">Stream kamery będzie tutaj</p>
                    <p className="text-gray-500 text-sm mt-2">
                      Endpoint: /api/camera/stream
                    </p>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="mx-auto text-gray-600 mb-4" size={64} />
                    <p className="text-gray-400">Kamera wyłączona</p>
                    <button
                      onClick={() => setCameraEnabled(true)}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Włącz kamerę
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats & Controls */}
        <div className="space-y-6">
          {/* Time Stats */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="mr-2" size={20} />
              Statystyki Czasu
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Czas drukowania</span>
                <span className="font-semibold text-gray-900">
                  {formatDuration(printTime)}
                </span>
              </div>
              
              {isPrinting && printTimeLeft > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pozostało</span>
                  <span className="font-semibold text-blue-600">
                    {formatDuration(printTimeLeft)}
                  </span>
                </div>
              )}
              
              {job.startedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Rozpoczęto</span>
                  <span className="text-sm text-gray-900">
                    {formatDateSafe(job.startedAt)}
                  </span>
                </div>
              )}

              {isPrinting && printTimeLeft > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Est. zakończenie</span>
                    <span className="text-sm font-semibold text-green-600">
                      {new Date(Date.now() + printTimeLeft * 1000).toLocaleTimeString('pl-PL')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Control Buttons */}
          {canControl && isPrinting && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Kontrola Druku
              </h3>
              
              <div className="space-y-3">
                <button
                  onClick={handlePauseResume}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors"
                >
                  <Pause size={20} className="mr-2" />
                  Wstrzymaj druk
                </button>

                <button
                  onClick={handleStop}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  <Square size={20} className="mr-2" />
                  Zatrzymaj druk
                </button>
              </div>

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                  ⚠️ Zatrzymanie druku jest nieodwracalne. Druk będzie musiał zostać rozpoczęty od nowa.
                </p>
              </div>
            </div>
          )}

          {/* Access Info */}
          {!canControl && canView && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start">
                <AlertCircle className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" size={20} />
                <div>
                  <p className="text-sm font-medium text-blue-900">Tryb tylko do odczytu</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Możesz obserwować postęp, ale nie kontrolować druku.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Printer Stats (Placeholder for future temp sensors etc.) */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Thermometer className="mr-2" size={20} />
              Parametry Drukarki
            </h3>
            
            <div className="space-y-3 text-sm text-gray-500">
              <div className="flex items-center justify-between">
                <span>Temperatura dyszy</span>
                <span className="text-gray-400">N/A</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Temperatura stołu</span>
                <span className="text-gray-400">N/A</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Warstwa</span>
                <span className="text-gray-400">N/A</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">
                💡 Szczegółowe dane telemetryczne będą dostępne wkrótce
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Job Details */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Szczegóły Zadania
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">ID Zadania</p>
            <p className="font-mono text-sm text-gray-900">{job.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Plik</p>
            <p className="text-sm text-gray-900">{job.fileId}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <p className="text-sm text-gray-900 capitalize">{job.status}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Urządzenie</p>
            <p className="text-sm text-gray-900">{job.deviceId || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}