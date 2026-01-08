export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: string;
  fileId: string;
  originalFileName: string;
  userId: string;
  userEmail: string;
  status: 'scheduled' | 'pending' | 'printing' | 'completed' | 'failed' | 'cancelled';
  scheduledAt?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  failedAt?: string;
  cancelledAt?: string;
  progress?: number;
  printTime?: number;
  printTimeLeft?: number;
  failureReason?: string;
  deviceId?: string;
  lastUpdatedAt?: string;
}

export interface PrinterStatus {
  deviceId: string;
  state: 'idle' | 'printing' | 'offline';
  progress?: number;
  currentJob?: string;
  temperature?: {
    nozzle: number;
    bed: number;
  };
}

export interface Metrics {
  metrics: {
    queued: number;
    printing: number;
    completed: number;
    failed: number;
    cancelled: number;
    failed24h: number;
    total: number;
  };
  timestamp: string;
}

export interface UserStats {
  total: number;
  pending: number;
  scheduled: number;
  completed: number;
  failed: number;
}

export interface FileUploadResponse {
  status: string;
  fileId: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}