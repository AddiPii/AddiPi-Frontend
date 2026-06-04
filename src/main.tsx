import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n/config';
import { useStore } from './store/useStore';

function Root() {
  const restoreSession = useStore(state => state.restoreSession);

  useEffect(() => {
    let mounted = true;

    const tryRestore = async () => {
      try {
        if (!mounted) return;
        await restoreSession();
      } catch (e) {
        // ignore
      }
    };

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        tryRestore();
      }
    };

    window.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', tryRestore);

    // Heartbeat: try to refresh session every 5 minutes
    const interval = setInterval(tryRestore, 5 * 60 * 1000);

    return () => {
      mounted = false;
      window.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', tryRestore);
      clearInterval(interval);
    };
  }, [restoreSession]);

  return <App />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
