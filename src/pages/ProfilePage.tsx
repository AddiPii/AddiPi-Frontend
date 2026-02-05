import { useState } from 'react';
import { User, Mail, Shield, Edit3, Save, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { api } from '../services/api.js';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, setUser } = useStore();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
  });

  const handleEdit = () => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
      });
      setEditing(true);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData({ 
      firstName: '', 
      lastName: '' 
    });
  };

  const handleSubmit = async () => {
    try {
      const { data } = await api.updateProfile(formData);
      setUser(data);
      setEditing(false);
      setFormData({ firstName: '', lastName: '' });
      toast.success('Profil zaktualizowany');
    } catch {
      toast.error('Nie udało się zaktualizować profilu');
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Mój Profil</h1>
        <p className="text-muted-foreground mt-1">Zarządzaj swoimi danymi konta</p>
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
              <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                <Mail size={14} />
                {user.email}
              </div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">Imię</label>
              <input
                type="text"
                value={editing ? formData.firstName : (user?.firstName || '')}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                disabled={!editing}
                className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">Nazwisko</label>
              <input
                type="text"
                value={editing ? formData.lastName : (user?.lastName || '')}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                disabled={!editing}
                className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Email</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground">Email nie może być zmieniony</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Rola</label>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border ${
                user.role === 'admin' 
                  ? 'bg-primary/10 text-primary border-primary/20' 
                  : 'bg-secondary text-foreground border-border'
              }`}>
                <Shield size={14} />
                {user.role === 'admin' ? 'Administrator' : 'Użytkownik'}
              </span>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            {editing ? (
              <>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  <Save size={18} />
                  Zapisz zmiany
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-5 py-2.5 bg-secondary text-foreground border border-border rounded-lg font-medium hover:bg-secondary/80 transition-colors"
                >
                  <X size={18} />
                  Anuluj
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleEdit}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                <Edit3 size={18} />
                Edytuj profil
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
