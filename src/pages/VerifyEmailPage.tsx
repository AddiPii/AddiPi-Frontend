import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { api } from '../services/api';

export default function VerifyEmailPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage(t('verify.errorNoToken'));
        return;
      }

      try {
        await api.verifyEmail(token);
        setStatus('success');
        setMessage(t('verify.success'));
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error: any) {
        setStatus('error');
        setMessage(error.response?.data?.error || t('verify.error'));
      }
    };

    verifyEmail();
  }, [searchParams, navigate, t]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-card rounded-xl border border-border p-8 text-center space-y-6">
          {status === 'loading' && (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full">
                <Loader className="text-primary animate-spin" size={32} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  {t('verify.verifying')}
                </h1>
                <p className="text-muted-foreground">{t('verify.pleaseWait')}</p>
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full border border-primary/20">
                <CheckCircle className="text-primary" size={32} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  {t('verify.successTitle')}
                </h1>
                <p className="text-muted-foreground mb-2">{message}</p>
                <p className="text-sm text-muted-foreground">{t('verify.redirecting')}</p>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-destructive/10 rounded-full border border-destructive/20">
                <XCircle className="text-destructive" size={32} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  {t('verify.errorTitle')}
                </h1>
                <p className="text-muted-foreground mb-4">{message}</p>
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  {t('verify.goToLogin')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
