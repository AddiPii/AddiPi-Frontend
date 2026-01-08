import { useEffect, useState } from 'react';
import { Users, FileText, Trash2, RefreshCw, Shield, UserX, Square } from 'lucide-react';
import { api } from '../services/api';
import type { User, Job } from '../types';
import toast from 'react-hot-toast';
import { formatDateTimeSafe } from '../utils/formatters';

interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'users' | 'jobs'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [jobStatus, setJobStatus] = useState('all');

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    } else {
      loadJobs();
    }
  }, [activeTab, jobStatus]);

  const loadUsers = async () => {
    try {
      const { data } = await api.getAllUsers({ limit: 100 });
      setUsers(data.users);
    } catch (error) {
      toast.error('Nie udało się załadować użytkowników');
    }
  };

  const loadJobs = async () => {
    try {
      const params = jobStatus !== 'all' ? { status: jobStatus, limit: 100 } : { limit: 100 };
      const { data } = await api.getAllJobs(params);
      setJobs(data.jobs);
    } catch (error) {
      toast.error('Nie udało się załadować zadań');
    }
  };

  const handleToggleRole = async (userId: string, currentRole: 'admin' | 'user') => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    setLoading(true);
    try {
      await api.updateUserRole(userId, newRole);
      toast.success(`Rola zmieniona na ${newRole}`);
      loadUsers();
    } catch (error) {
      const err = error as ApiError;
      toast.error(err.response?.data?.error || 'Nie udało się zmienić roli');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!window.confirm(`Czy na pewno chcesz usunąć użytkownika ${email}?`)) return;

    setLoading(true);
    try {
      await api.deleteUser(userId);
      toast.success('Użytkownik został usunięty');
      loadUsers();
    } catch (error) {
      const err = error as ApiError;
      toast.error(err.response?.data?.error || 'Nie udało się usunąć użytkownika');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelJob = async (jobId: string) => {
    if (!window.confirm('Czy na pewno chcesz anulować ten druk?')) return;

    setLoading(true);
    try {
      await api.cancelJob(jobId);
      toast.success('Druk został anulowany');
      loadJobs();
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
      loadJobs();
    } catch (error) {
      const err = error as ApiError;
      toast.error(err.response?.data?.error || 'Nie udało się ponowić druku');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm('Czy na pewno chcesz usunąć to zadanie?')) return;

    setLoading(true);
    try {
      await api.deleteJob(jobId);
      toast.success('Zadanie zostało usunięte');
      loadJobs();
    } catch (error) {
      const err = error as ApiError;
      toast.error(err.response?.data?.error || 'Nie udało się usunąć zadania');
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Panel Administratora</h1>
        <div className="flex items-center space-x-2 text-sm">
          <Shield className="text-blue-600" size={20} />
          <span className="text-gray-600">Administrator</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users size={20} className="inline mr-2" />
            Użytkownicy ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'jobs'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText size={20} className="inline mr-2" />
            Zadania ({jobs.length})
          </button>
        </nav>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Użytkownik</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rola</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data utworzenia</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Akcje</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.isVerified ? 'Zweryfikowany' : 'Niezweryfikowany'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDateTimeSafe(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleToggleRole(user.id, user.role)}
                        disabled={loading}
                        className="text-blue-600 hover:text-blue-900 mr-4 disabled:opacity-50"
                        title={user.role === 'admin' ? 'Odbierz uprawnienia admina' : 'Nadaj uprawnienia admina'}
                      >
                        <Shield size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id, user.email)}
                        disabled={loading}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        title="Usuń użytkownika"
                      >
                        <UserX size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Jobs Tab */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <select
              value={jobStatus}
              onChange={(e) => setJobStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Wszystkie</option>
              <option value="pending">Oczekujące</option>
              <option value="scheduled">Zaplanowane</option>
              <option value="printing">Drukuje</option>
              <option value="completed">Ukończone</option>
              <option value="failed">Nieudane</option>
              <option value="cancelled">Anulowane</option>
            </select>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nazwa pliku</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Użytkownik</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Postęp</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data utworzenia</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Akcje</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{job.originalFileName}</div>
                        <div className="text-xs text-gray-500">ID: {job.id}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {job.userEmail}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {job.progress !== undefined ? (
                          <div className="w-24">
                            <div className="text-xs text-gray-600 mb-1">{job.progress.toFixed(1)}%</div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${job.progress}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDateTimeSafe(job.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        {(job.status === 'failed' || job.status === 'cancelled') && (
                          <button
                            onClick={() => handleRetryJob(job.id)}
                            disabled={loading}
                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                            title="Ponów"
                          >
                            <RefreshCw size={18} />
                          </button>
                        )}
                        {['scheduled', 'pending', 'printing'].includes(job.status) && (
                          <button
                            onClick={() => handleCancelJob(job.id)}
                            disabled={loading}
                            className="text-yellow-600 hover:text-yellow-900 disabled:opacity-50"
                            title="Anuluj"
                          >
                            <Square size={18} />
                          </button>
                        )}
                        {['completed', 'failed', 'cancelled'].includes(job.status) && (
                          <button
                            onClick={() => handleDeleteJob(job.id)}
                            disabled={loading}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            title="Usuń"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
