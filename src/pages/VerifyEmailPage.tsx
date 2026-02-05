import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Printer } from 'lucide-react';
import { api } from '../services/api';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const navigate = useNavigate();
  const { setUser } = useStore();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      verifyEmail(token);
    } else {
      setStatus('error');
    }
  }, []);

  const verifyEmail = async (token: string) => {
    try {
      const response = await api.verifyEmail(token);
      
      const data = response.data;
      
      if (data?.accessToken && data?.refreshToken && data?.user) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        setUser(data.user);
        
        setStatus('success');
        toast.success('Email zweryfikowany! Logowanie...');
        
        setTimeout(() => navigate('/dashboard'), 2000);
      } else {
        setStatus('success');
        toast.success('Email zweryfikowany! Możesz się teraz zalogować.');
        setTimeout(() => navigate('/login'), 3000);
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-card rounded-2xl border border-border p-8 text-center shadow-xl shadow-black/5">
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-foreground">Weryfikacja...</h2>
              <p className="text-muted-foreground mt-2">Proszę czekać</p>
            </>
          )}
          {status === 'success' && (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl border border-primary/20 mb-6">
                <CheckCircle className="text-primary" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Email zweryfikowany!</h2>
              <p className="text-muted-foreground">
                {localStorage.getItem('accessToken') 
                  ? 'Logowanie i przekierowywanie do dashboardu...' 
                  : 'Przekierowywanie do logowania...'}
              </p>
            </>
          )}
          {status === 'error' && (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-destructive/10 rounded-2xl border border-destructive/20 mb-6">
                <XCircle className="text-destructive" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Błąd weryfikacji</h2>
              <p className="text-muted-foreground mb-6">Link jest nieprawidłowy lub wygasł</p>
              <Link 
                to="/login" 
                className="inline-flex items-center justify-center px-5 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                Przejdź do logowania
              </Link>
            </>
          )}
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
