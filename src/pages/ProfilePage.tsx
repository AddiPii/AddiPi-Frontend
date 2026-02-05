import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Mail, Shield, CheckCircle, XCircle, Calendar, Edit2, Save, X as XIcon } from 'lucide-react';
import { useStore } from '../store/useStore';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { formatDateSafe } from '../utils/formatters';

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, setUser } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  const handleEdit = () => {
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });
    setIsEditing(false);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data } = await api.updateProfile(formData);
      setUser(data);
      toast.success(t('profile.updateSuccess'));
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || t('profile.updateError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('profile.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('profile.subtitle')}</p>
        </div>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Edit2 size={18} />
            {t('common.edit')}
          </button>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {/* Avatar Section */}
        <div className="relative p-6 bg-gradient-to-br from-primary/10 via-transparent to-transparent border-b border-border">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <User className="text-primary" size={36} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                {user.role === 'admin' && (
                  <span className="px-2.5 py-0.5 text-xs bg-primary/10 text-primary rounded-full font-medium border border-primary/20 flex items-center gap-1">
                    <Shield size={12} />
                    {t('common.admin')}
                  </span>
                )}
                {user.isVerified ? (
                  <span className="px-2.5 py-0.5 text-xs bg-primary/10 text-primary rounded-full font-medium border border-primary/20 flex items-center gap-1">
                    <CheckCircle size={12} />
                    {t('profile.verified')}
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 text-xs bg-yellow-500/10 text-yellow-400 rounded-full font-medium border border-yellow-500/20 flex items-center gap-1">
                    <XCircle size={12} />
                    {t('profile.notVerified')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="p-6 space-y-6">
          <h3 className="text-lg font-semibold text-foreground">{t('profile.accountInfo')}</h3>
          
          {isEditing ? (
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('profile.firstName')}
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                  placeholder={t('profile.firstName')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('profile.lastName')}
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                  placeholder={t('profile.lastName')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('profile.email')}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-muted-foreground"
                  placeholder={t('profile.email')}
                  disabled
                />
                <p className="text-xs text-muted-foreground mt-2 ml-2">{t('profile.emailInfo')}</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  <Save size={18} />
                  {loading ? t('profile.saving') : t('common.save')}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary text-foreground border border-border rounded-lg font-medium hover:bg-secondary/80 disabled:opacity-50 transition-colors"
                >
                  <XIcon size={18} />
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-secondary rounded-lg">
                  <Mail className="text-muted-foreground" size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">{t('profile.email')}</p>
                  <p className="text-base text-foreground mt-1">{user.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-secondary rounded-lg">
                  <User className="text-muted-foreground" size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">{t('profile.firstName')}</p>
                  <p className="text-base text-foreground mt-1">{user.firstName}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-secondary rounded-lg">
                  <User className="text-muted-foreground" size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">{t('profile.lastName')}</p>
                  <p className="text-base text-foreground mt-1">{user.lastName}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-secondary rounded-lg">
                  <Shield className="text-muted-foreground" size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">{t('profile.role')}</p>
                  <p className="text-base text-foreground mt-1 capitalize">{user.role}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-secondary rounded-lg">
                  {user.isVerified ? (
                    <CheckCircle className="text-muted-foreground" size={20} />
                  ) : (
                    <XCircle className="text-muted-foreground" size={20} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">{t('profile.status')}</p>
                  <p className="text-base text-foreground mt-1">
                    {user.isVerified ? t('profile.verified') : t('profile.notVerified')}
                  </p>
                </div>
              </div>

              {user.createdAt && (
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-secondary rounded-lg">
                    <Calendar className="text-muted-foreground" size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">{t('profile.memberSince')}</p>
                    <p className="text-base text-foreground mt-1">{formatDateSafe(user.createdAt)}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
