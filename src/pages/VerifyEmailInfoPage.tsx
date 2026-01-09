import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Mail, CheckCircle, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

export default function VerifyEmailInfoPage() {
  const location = useLocation();
  const email = location.state?.email || '';
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleResendEmail = async () => {
    if (!email) {
      toast.error('Brak adresu email');
      return;
    }

    setResending(true);
    try {
      await api.resendVerification(email);
      setResent(true);
      toast.success('Email weryfikacyjny został wysłany ponownie!');
    } catch (error) {
      toast.error('Nie udało się wysłać emaila');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Mail className="text-blue-600" size={32} />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Sprawdź swoją skrzynkę email
          </h2>
          
          <p className="text-gray-600 mb-6">
            Wysłaliśmy link weryfikacyjny na adres:
          </p>
          
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-blue-800 font-medium">{email}</p>
          </div>

          <div className="space-y-4 text-left bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <CheckCircle className="text-green-600 mr-3 mt-0.5 flex-shrink-0" size={20} />
              <p className="text-sm text-gray-700">
                Kliknij link w emailu, aby zweryfikować swoje konto
              </p>
            </div>
            <div className="flex items-start">
              <CheckCircle className="text-green-600 mr-3 mt-0.5 flex-shrink-0" size={20} />
              <p className="text-sm text-gray-700">
                Po weryfikacji możesz się zalogować
              </p>
            </div>
            <div className="flex items-start">
              <CheckCircle className="text-green-600 mr-3 mt-0.5 flex-shrink-0" size={20} />
              <p className="text-sm text-gray-700">
                Link jest ważny przez 24 godziny
              </p>
            </div>
          </div>

          <div className="text-sm text-gray-600 mb-6">
            Nie otrzymałeś emaila? Sprawdź folder SPAM lub kliknij poniżej.
          </div>

          {!resent ? (
            <button
              onClick={handleResendEmail}
              disabled={resending}
              className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-4"
            >
              {resending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Wysyłanie...
                </>
              ) : (
                <>
                  <RefreshCw size={20} className="mr-2" />
                  Wyślij ponownie
                </>
              )}
            </button>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-green-800 text-sm font-medium">
                ✓ Email został wysłany ponownie!
              </p>
            </div>
          )}

          <Link
            to="/login"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Powrót do logowania
          </Link>
        </div>
      </div>
    </div>
  );
}
