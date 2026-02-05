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
      <div className={`flex items-center gap-2 px-4 py-3 rounded-lg border shadow-lg backdrop-blur-sm ${
        isOnline 
          ? 'bg-primary/10 text-primary border-primary/20' 
          : 'bg-destructive/10 text-destructive border-destructive/20'
      }`}>
        {isOnline ? (
          <>
            <Wifi size={18} />
            <span className="font-medium text-sm">Połączenie przywrócone</span>
          </>
        ) : (
          <>
            <WifiOff size={18} />
            <span className="font-medium text-sm">Brak połączenia z internetem</span>
          </>
        )}
      </div>
    </div>
  );
}
