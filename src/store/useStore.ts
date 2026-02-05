import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Job, PrinterStatus, Metrics } from '../types';
import { api } from '../services/api';

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
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
    (set, get) => ({
      user: null,
      isAuthenticated: !!localStorage.getItem('accessToken'),
      isLoading: false,
      printerStatus: null,
      metrics: null,
      currentJob: null,
      theme: 'dark',
      language: 'pl',

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const data = await api.login({ email, password });
          set({ user: data.user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        await api.logout();
        set({ user: null, isAuthenticated: false });
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

      fetchCurrentUser: async () => {
        if (!get().isAuthenticated) return;
        try {
          const { data } = await api.getCurrentUser();
          set({ user: data });
        } catch (error) {
          console.error('Failed to fetch user:', error);
          set({ user: null, isAuthenticated: false });
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
          const { data: metricsData } = await api.getMetrics();
          if (metricsData.metrics.printing > 0) {
            try {
              const { data: jobsData } = await api.getAllJobs({ status: 'printing', limit: 1 });
              if (jobsData.jobs.length > 0) {
                set({ currentJob: jobsData.jobs[0] });
                return;
              }
            } catch (jobError) {
              console.error('Failed to fetch current job:', jobError);
            }
          }
          set({ currentJob: null });
        } catch (error) {
          console.error('Failed to fetch metrics:', error);
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
    }),
    {
      name: 'addipi-settings',
      partialize: (state) => ({ 
        theme: state.theme,
        language: state.language 
      }),
    }
  )
);
