import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, FileText, Trash2, RefreshCw, Shield, UserX, Square, ChevronDown } from 'lucide-react';
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
  const { t } = useTranslation();
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
    } catch {
      toast.error(t('admin.errorLoadUsers'));
    }
  };

  const loadJobs = async () => {
    try {
      const params = jobStatus !== 'all' ? { status: jobStatus, limit: 100 } : { limit: 100 };
      const { data } = await api.getAllJobs(params);
      setJobs(data.jobs);
    } catch {
      toast.error(t('admin.errorLoadJobs'));
    }
  };

  const handleToggleRole = async (userId: string, currentRole: 'admin' | 'user') => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    setLoading(true);
    try {
      await api.updateUserRole(userId, newRole);
      toast.success(t('admin.roleChanged', { role: newRole }));
      loadUsers();
    } catch (error) {
      const err = error as ApiError;
      toast.error(err.response?.data?.error || t('admin.errorChangeRole'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!window.confirm(t('admin.confirmDeleteUser', { email }))) return;

    setLoading(true);
    try {
      await api.deleteUser(userId);
      toast.success(t('admin.userDeleted'));
      loadUsers();
    } catch (error) {
      const err = error as ApiError;
      toast.error(err.response?.data?.error || t('admin.errorDeleteUser'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelJob = async (jobId: string) => {
    if (!window.confirm(t('admin.confirmCancelJob'))) return;

    setLoading(true);
    try {
      await api.cancelJob(jobId);
      toast.success(t('admin.jobCancelled'));
      loadJobs();
    } catch (error) {
      const err = error as ApiError;
      toast.error(err.response?.data?.error || t('admin.errorCancelJob'));
    } finally {
      setLoading(false);
    }
  };

  const handleRetryJob = async (jobId: string) => {
    setLoading(true);
    try {
      await api.retryJob(jobId);
      toast.success(t('admin.jobRetried'));
      loadJobs();
    } catch (error) {
      const err = error as ApiError;
      toast.error(err.response?.data?.error || t('admin.errorRetryJob'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm(t('admin.confirmDeleteJob'))) return;

    setLoading(true);
    try {
      await api.deleteJob(jobId);
      toast.success(t('admin.jobDeleted'));
      loadJobs();
    } catch (error) {
      const err = error as ApiError;
      toast.error(err.response?.data?.error || t('admin.errorDeleteJob'));
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
    all: t('dashboard.status.all'),
    pending: t('dashboard.status.pending'),
    scheduled: t('dashboard.status.scheduled'),
    printing: t('dashboard.status.printing'),
    completed: t('dashboard.status.completed'),
    failed: t('dashboard.status.failed'),
    cancelled: t('dashboard.status.cancelled')
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('admin.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('admin.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg">
          <Shield className="text-primary" size={18} />
          <span className="text-sm font-medium text-primary">{t('admin.administrator')}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
              activeTab === 'users'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            <Users size={18} />
            {t('admin.users')} ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
              activeTab === 'jobs'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            <FileText size={18} />
            {t('admin.jobs')} ({jobs.length})
          </button>
        </nav>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t('admin.user')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t('profile.email')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t('profile.role')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t('profile.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t('admin.dateCreated')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t('admin.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-foreground">
                        {user.firstName} {user.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        user.role === 'admin' 
                          ? 'bg-primary/10 text-primary border-primary/20' 
                          : 'bg-secondary text-foreground border-border'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        user.isVerified 
                          ? 'bg-primary/10 text-primary border-primary/20' 
                          : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                      }`}>
                        {user.isVerified ? t('profile.verified') : t('profile.notVerified')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {formatDateTimeSafe(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggleRole(user.id, user.role)}
                          disabled={loading}
                          className="p-2 text-primary hover:bg-primary/10 rounded-lg disabled:opacity-50 transition-colors"
                          title={user.role === 'admin' ? t('admin.revokeAdmin') : t('admin.grantAdmin')}
                        >
                          <Shield size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.email)}
                          disabled={loading}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-lg disabled:opacity-50 transition-colors"
                          title={t('admin.deleteUser')}
                        >
                          <UserX size={18} />
                        </button>
                      </div>
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
            <div className="relative">
              <select
                value={jobStatus}
                onChange={(e) => setJobStatus(e.target.value)}
                className="appearance-none px-4 py-2 pr-10 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors cursor-pointer"
              >
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('admin.fileName')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('admin.user')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('profile.status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('admin.progress')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('admin.dateCreated')}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('admin.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-foreground">{job.originalFileName}</div>
                        <div className="text-xs text-muted-foreground font-mono">ID: {job.id.slice(0, 8)}...</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {job.userEmail}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyle(job.status)}`}>
                          {statusLabels[job.status] || job.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {job.progress !== undefined ? (
                          <div className="w-24">
                            <div className="text-xs text-muted-foreground mb-1 tabular-nums">{job.progress.toFixed(1)}%</div>
                            <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full transition-all"
                                style={{ width: `${job.progress}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {formatDateTimeSafe(job.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-1">
                          {(job.status === 'failed' || job.status === 'cancelled') && (
                            <button
                              onClick={() => handleRetryJob(job.id)}
                              disabled={loading}
                              className="p-2 text-primary hover:bg-primary/10 rounded-lg disabled:opacity-50 transition-colors"
                              title={t('dashboard.retry')}
                            >
                              <RefreshCw size={18} />
                            </button>
                          )}
                          {['scheduled', 'pending', 'printing'].includes(job.status) && (
                            <button
                              onClick={() => handleCancelJob(job.id)}
                              disabled={loading}
                              className="p-2 text-yellow-400 hover:bg-yellow-500/10 rounded-lg disabled:opacity-50 transition-colors"
                              title={t('common.cancel')}
                            >
                              <Square size={18} />
                            </button>
                          )}
                          {['completed', 'failed', 'cancelled'].includes(job.status) && (
                            <button
                              onClick={() => handleDeleteJob(job.id)}
                              disabled={loading}
                              className="p-2 text-destructive hover:bg-destructive/10 rounded-lg disabled:opacity-50 transition-colors"
                              title={t('common.delete')}
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
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
