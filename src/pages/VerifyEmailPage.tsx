import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import { api } from '../services/api.js';

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const navigate = useNavigate();

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
      await api.verifyEmail(token);
      setStatus('success');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">Weryfikacja...</h2>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle className="mx-auto text-green-600 mb-4" size={64} />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Email zweryfikowany!</h2>
            <p className="text-gray-600">Przekierowywanie do logowania...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="mx-auto text-red-600 mb-4" size={64} />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Błąd weryfikacji</h2>
            <p className="text-gray-600 mb-4">Link jest nieprawidłowy lub wygasł</p>
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Przejdź do logowania
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
