import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Printer } from 'lucide-react';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const { register, isLoading } = useStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Hasła nie są identyczne');
      return;
    }

    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
      toast.success('Konto utworzone! Sprawdź swoją skrzynkę email.');
      navigate('/verify-email-info', { state: { email: formData.email } });
    } catch (error) {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || 'Nie udało się utworzyć konta');
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="bg-card rounded-2xl border border-border p-8 shadow-xl shadow-black/5">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl border border-primary/20 mb-4">
              <UserPlus className="text-primary" size={28} />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Zarejestruj się</h2>
            <p className="text-muted-foreground mt-2">Stwórz swoje konto AddiPi</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor='firstName' className="block text-sm font-medium text-foreground">Imię</label>
                <input
                  id='firstName'
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                  placeholder='Jan'
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor='lastName' className="block text-sm font-medium text-foreground">Nazwisko</label>
                <input
                  id='lastName'
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                  placeholder='Kowalski'
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor='email' className="block text-sm font-medium text-foreground">Email UWr</label>
              <input
                id='email'
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="twoj@email.uwr.edu.pl"
                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor='password' className="block text-sm font-medium text-foreground">Hasło</label>
              <input
                id='password'
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                placeholder='*******'
                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor='conPassword' className="block text-sm font-medium text-foreground">Potwierdź hasło</label>
              <input
                id='conPassword'
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                placeholder='*******'
                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Rejestracja...
                </>
              ) : (
                'Zarejestruj się'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-center text-sm text-muted-foreground">
              Masz już konto?{' '}
              <Link to="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
                Zaloguj się
              </Link>
            </p>
          </div>
        </div>

        {/* Branding */}
        <div className="flex items-center justify-center gap-2 mt-6 text-muted-foreground">
          <Printer size={16} />
          <span className="text-sm">AddiPi 3D Printer System</span>
        </div>
      </div>
    </div>
  );
}
