import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, CheckCircle, RefreshCw, Printer, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

export default function VerifyEmailInfoPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const email = location.state?.email || '';
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleResendEmail = async () => {
    if (!email) {
      toast.error(t('verifyInfo.noEmail'));
      return;
    }

    setResending(true);
    try {
      await api.resendVerification(email);
      setResent(true);
      toast.success(t('verifyInfo.resentSuccess'));
    } catch {
      toast.error(t('verifyInfo.resentError'));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-card rounded-2xl border border-border p-8 shadow-xl shadow-black/5">
          <div className="text-center">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl border border-primary/20 mb-6">
              <Mail className="text-primary" size={28} />
            </div>
            
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {t('verifyInfo.title')}
            </h2>
            
            <p className="text-muted-foreground mb-6">
              {t('verifyInfo.sentTo')}
            </p>
            
            {/* Email Badge */}
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
              <p className="text-primary font-medium">{email}</p>
            </div>

            {/* Steps */}
            <div className="space-y-3 text-left bg-secondary/50 rounded-xl border border-border p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="p-1 bg-primary/10 rounded-full">
                  <CheckCircle className="text-primary" size={16} />
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('verifyInfo.step1')}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1 bg-primary/10 rounded-full">
                  <CheckCircle className="text-primary" size={16} />
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('verifyInfo.step2')}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1 bg-primary/10 rounded-full">
                  <CheckCircle className="text-primary" size={16} />
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('verifyInfo.step3')}
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              {t('verifyInfo.notReceived')}
            </p>

            {/* Resend Button */}
            {!resent ? (
              <button
                onClick={handleResendEmail}
                disabled={resending}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-4"
              >
                {resending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    {t('verifyInfo.sending')}
                  </>
                ) : (
                  <>
                    <RefreshCw size={18} />
                    {t('verifyInfo.resend')}
                  </>
                )}
              </button>
            ) : (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4">
                <p className="text-primary text-sm font-medium flex items-center justify-center gap-2">
                  <CheckCircle size={16} />
                  {t('verifyInfo.emailResent')}
                </p>
              </div>
            )}

            {/* Back Link */}
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={16} />
              {t('verifyInfo.backToLogin')}
            </Link>
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
