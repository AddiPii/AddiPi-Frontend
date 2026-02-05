import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Home, Upload, LayoutDashboard, Shield, User, LogOut, Gauge, ChevronRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import { ConnectionStatus } from './ConnectionStatus';
import toast from 'react-hot-toast';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, user, logout } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Wylogowano pomyślnie');
      navigate('/');
    } catch {
      toast.error('Błąd podczas wylogowywania');
    }
  };

  const menuItems = [
    { icon: Home, label: 'Strona główna', path: '/', auth: false },
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', auth: true },
    { icon: Upload, label: 'Upload & Print', path: '/upload', auth: true },
    { icon: User, label: 'Profil', path: '/profile', auth: true },
    { icon: Gauge, label: 'Kontrola Druku', path: '/print', auth: false },
    { icon: Shield, label: 'Panel Admina', path: '/admin', auth: true, admin: true },
  ];

  const visibleMenuItems = menuItems.filter(item => {
    if (item.auth && !isAuthenticated) return false;
    if (item.admin && user?.role !== 'admin') return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="bg-card/80 backdrop-blur-xl border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              {isAuthenticated && (
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="mr-4 p-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                  aria-label="Toggle menu"
                >
                  {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
              )}
              
              <Link to="/" className="flex items-center group ml-[-20px]">
                <div className="relative">
                  <div className="absolute inset-4 bg-primary/10 blur-xl rounded-full group-hover:bg-primary/30 transition-colors" />
                  {/* <Printer className="relative h-8 w-8 text-primary" /> */}
                  <img src="images/logo-transparent.png" className='relative h-20 w-20' alt="" />
                </div>
                <span className="ml-0 text-xl font-semibold text-foreground tracking-tight">
                  AddiPi
                </span>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-sm text-foreground font-medium">
                      {user?.firstName} {user?.lastName}
                    </span>
                    {user?.role === 'admin' && (
                      <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full font-medium border border-primary/20">
                        Admin
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                  >
                    <LogOut size={18} />
                    <span className="hidden sm:inline">Wyloguj</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                  >
                    Zaloguj
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors"
                  >
                    Zarejestruj
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      {isAuthenticated && (
        <div
          className={`fixed inset-y-0 left-0 z-30 w-72 bg-card/95 backdrop-blur-xl border-r border-border transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } mt-16`}
        >
          <div className="p-4">
            <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Nawigacja
            </p>
            <nav className="mt-2 space-y-1">
              {visibleMenuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all group ${
                      isActive 
                        ? 'bg-primary/10 text-primary border border-primary/20' 
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={20} className={isActive ? 'text-primary' : 'group-hover:text-foreground'} />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {isActive && <ChevronRight size={16} className="text-primary" />}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
            <div className="px-4 py-3 rounded-lg bg-secondary/50 border border-border">
              <p className="text-xs text-muted-foreground">Zalogowany jako</p>
              <p className="text-sm font-medium text-foreground truncate">
                {user?.email}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-background/80 backdrop-blur-sm mt-16"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Connection Status Indicator */}
      <ConnectionStatus />
    </div>
  );
}
