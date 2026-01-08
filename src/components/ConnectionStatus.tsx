import { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

export function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOffline, setShowOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOffline(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showOffline) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`flex items-center px-4 py-3 rounded-lg shadow-lg ${
        isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {isOnline ? (
          <>
            <Wifi size={20} className="mr-2" />
            <span className="font-medium">Połączenie przywrócone</span>
          </>
        ) : (
          <>
            <WifiOff size={20} className="mr-2" />
            <span className="font-medium">Brak połączenia z internetem</span>
          </>
        )}
      </div>
    </div>
  );
}
