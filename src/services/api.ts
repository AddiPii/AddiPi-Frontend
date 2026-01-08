import axios, { AxiosError, AxiosInstance } from 'axios';
import type { 
  User, Job, PrinterStatus, Metrics, UserStats, 
  FileUploadResponse, AuthResponse, LoginCredentials, RegisterData 
} from '../types';

const API_BASE = 'http://localhost';

const AUTH_URL = `${API_BASE}:3001`;
const USER_URL = `${API_BASE}:3002`;
const PRINTER_URL = `${API_BASE}:3050`;
const FILES_URL = `${API_BASE}:5000`;

class ApiClient {
  private authClient: AxiosInstance;
  private userClient: AxiosInstance;
  private printerClient: AxiosInstance;
  private filesClient: AxiosInstance;

  constructor() {
    this.authClient = axios.create({ baseURL: AUTH_URL });
    this.userClient = axios.create({ baseURL: USER_URL });
    this.printerClient = axios.create({ baseURL: PRINTER_URL });
    this.filesClient = axios.create({ baseURL: FILES_URL });

    [this.userClient, this.printerClient, this.filesClient].forEach(client => {
      client.interceptors.request.use(config => {
        const token = localStorage.getItem('accessToken');
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
      });

      client.interceptors.response.use(
        response => response,
        async (error: AxiosError) => {
          if (error.response?.status === 401) {
            try {
              const refreshToken = localStorage.getItem('refreshToken');
              if (refreshToken) {
                const { data } = await this.authClient.patch<Omit<AuthResponse, 'user'>>('/auth/refresh', { refreshToken });
                localStorage.setItem('accessToken', data.accessToken);
                localStorage.setItem('refreshToken', data.refreshToken);
                if (error.config) {
                  error.config.headers.Authorization = `Bearer ${data.accessToken}`;
                  return axios.request(error.config);
                }
              }
            } catch {
              this.logout();
            }
          }
          return Promise.reject(error);
        }
      );
    });
  }

  // Auth
  async register(data: RegisterData) {
    return this.authClient.post<{ user: User; message: string }>('/auth/register', data);
  }

  async login(credentials: LoginCredentials) {
    const { data } = await this.authClient.post<AuthResponse>('/auth/login', credentials);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    return data;
  }

  async logout() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await this.authClient.post('/auth/logout', { refreshToken });
      } catch(e) {
        console.log('error: ', e)
      }
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  async verifyEmail(token: string) {
    return this.authClient.get(`/auth/verify-email?token=${token}`);
  }

  async resendVerification(email: string) {
    return this.authClient.post('/auth/resend-verification', { email });
  }

  // User
  async getCurrentUser() {
    return this.userClient.get<User>('/users/me');
  }

  async updateProfile(data: Partial<Pick<User, 'firstName' | 'lastName'>>) {
    return this.userClient.patch<User>('/users/me', data);
  }

  async getUserJobs(params?: { limit?: number; status?: string; sort?: string }) {
    return this.userClient.get<{ jobs: Job[]; count: number }>('/users/me/jobs', { params });
  }

  async getUserStats() {
    return this.userClient.get<UserStats>('/users/me/stats');
  }

  async getAllUsers(params?: { sort?: string; limit?: number }) {
    return this.userClient.get<{ users: User[]; count: number }>('/users', { params });
  }

  async getUserById(userId: string) {
    return this.userClient.get<User>(`/users/${userId}`);
  }

  async updateUserRole(userId: string, role: 'admin' | 'user') {
    return this.userClient.patch<User>(`/users/${userId}/role`, { role });
  }

  async deleteUser(userId: string) {
    return this.userClient.delete(`/users/${userId}`);
  }

  async getUserJobsAdmin(userId: string, params?: { sort?: string; limit?: number }) {
    return this.userClient.get<{ jobs: Job[]; count: number }>(`/users/${userId}/jobs`, { params });
  }

  async getUpcomingJobs() {
    return this.userClient.get<{ jobs: Job[]; count: number }>('/users/jobs/upcomming');
  }

  async getRecentCompletedJobs(limit?: number) {
    return this.userClient.get<{ jobs: Job[]; count: number }>('/users/jobs/recent-completed', {
      params: { limit }
    });
  }

  async deleteJobById(jobId: string) {
    return this.userClient.delete(`/users/jobs/${jobId}`);
  }

  // Printer
  async getAllJobs(params?: { status?: string; limit?: number; offset?: number }) {
    return this.printerClient.get<{ jobs: Job[]; count: number; limit: number; offset: number }>(
      '/printer/jobs',
      { params }
    );
  }

  async getJobById(jobId: string) {
    return this.printerClient.get<{ job: Job }>(`/printer/jobs/${jobId}`);
  }

  async cancelJob(jobId: string) {
    return this.printerClient.post(`/printer/jobs/${jobId}/cancel`);
  }

  async retryJob(jobId: string) {
    return this.printerClient.post(`/printer/jobs/${jobId}/retry`);
  }

  async deleteJob(jobId: string) {
    return this.printerClient.delete(`/printer/jobs/${jobId}`);
  }

  async getPrinterStatus(deviceId?: string) {
    return this.printerClient.get<PrinterStatus>('/printer/status', {
      params: { deviceId }
    });
  }

  async getMetrics() {
    return this.printerClient.get<Metrics>('/printer/metrics');
  }

  async getJobProgress(jobId: string) {
    return this.printerClient.get<Job>(`/printer/jobs/${jobId}/progress`);
  }

  // Files
  async uploadFile(file: File, scheduledAt?: string) {
    const formData = new FormData();
    formData.append('file', file);
    if (scheduledAt) formData.append('scheduledAt', scheduledAt);
    
    return this.filesClient.post<FileUploadResponse>('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  async getRecentFiles() {
    return this.filesClient.get<{ files: Array<{ fileId: string; last_modified: string; size: number }> }>(
      '/files/recent'
    );
  }
}

export const api = new ApiClient();
