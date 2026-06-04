import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Job, PrinterStatus, Metrics } from '../types';
import { api, configureAuthHandlers } from '../services/api';
import { toast } from 'react-hot-toast';

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  
  // Printer
  printerStatus: PrinterStatus | null;
  metrics: Metrics | null;
  currentJob: Job | null;
  
  // Theme & Language
  theme: 'light' | 'dark';
  language: 'pl' | 'en';
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  restoreSession: () => Promise<boolean>;
  fetchCurrentUser: () => Promise<void>;
  fetchPrinterStatus: () => Promise<void>;
  fetchMetrics: () => Promise<void>;
  fetchCurrentJob: () => Promise<void>;
  setUser: (user: User | null) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  setLanguage: (language: 'pl' | 'en') => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => {
      configureAuthHandlers({
        getAccessToken: () => get().accessToken,
        setAccessToken: (accessToken) => set({ accessToken }),
        clearAuth: () => {
          set({ user: null, accessToken: null, isAuthenticated: false });
          try {
            toast.error('Sesja wygasła — zaloguj się ponownie');
          } catch (e) {
            // ignore if toast cannot be shown
          }
          // redirect to login page
          try {
            window.location.href = '/login';
          } catch (e) {
            // ignore
          }
        },
      });

      return {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      accessToken: null,
      printerStatus: null,
      metrics: null,
      currentJob: null,
      theme: 'dark',
      language: 'pl',

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const data = await api.login({ email, password });
          set({ user: data.user, accessToken: data.accessToken, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await api.logout();
        } finally {
          set({ user: null, accessToken: null, isAuthenticated: false });
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          await api.register(data);
          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      restoreSession: async () => {
        try {
          const { data } = await api.refreshSession();
          set({ accessToken: data.accessToken, isAuthenticated: true });
          await get().fetchCurrentUser();
          return true;
        } catch (error) {
          set({ user: null, accessToken: null, isAuthenticated: false });
          return false;
        }
      },

      fetchCurrentUser: async () => {
        if (!get().accessToken) return;
        try {
          const { data } = await api.getCurrentUser();
          set({ user: data });
        } catch (error) {
          console.error('Failed to fetch user:', error);
          set({ user: null, accessToken: null, isAuthenticated: false });
        }
      },

      fetchPrinterStatus: async () => {
        try {
          const { data } = await api.getPrinterStatus();
          set({ printerStatus: data });
        } catch (error) {
          console.error('Failed to fetch printer status:', error);
        }
      },

      fetchMetrics: async () => {
        try {
          const { data } = await api.getMetrics();
          set({ metrics: data });
        } catch (error) {
          console.error('Failed to fetch metrics:', error);
        }
      },

      fetchCurrentJob: async () => {
        try {
          const prioritizedStatuses = ['printing', 'waiting_for_print', 'waiting_for_printer_ready'];

          for (const status of prioritizedStatuses) {
            try {
              const { data: jobsData } = await api.getAllJobs({ status, limit: 1 });
              if (jobsData.jobs.length > 0) {
                set({ currentJob: jobsData.jobs[0] });
                return;
              }
            } catch (jobError) {
              console.error(`Failed to fetch job with status ${status}:`, jobError);
            }
          }

          set({ currentJob: null });
        } catch (error) {
          console.error('Failed to fetch current job:', error);
          set({ currentJob: null });
        }
      },

      setUser: (user) => set({ user }),
      
      setTheme: (theme) => {
        set({ theme });
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
      
      toggleTheme: () => {
        const newTheme = get().theme === 'dark' ? 'light' : 'dark';
        get().setTheme(newTheme);
      },
      
      setLanguage: (language) => {
        set({ language });
        localStorage.setItem('language', language);
      },
      };
    },
    {
      name: 'addipi-settings',
      partialize: (state) => ({ 
        theme: state.theme,
        language: state.language 
      }),
    }
  )
);
