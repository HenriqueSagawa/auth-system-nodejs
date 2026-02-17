import axios, { type AxiosError } from 'axios';
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  RefreshResponse,
  User,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — auto-refresh on 401/403
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };

    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const { data } = await axios.post<RefreshResponse>(
          '/api/auth/refresh',
          {},
          { withCredentials: true }
        );
        localStorage.setItem('accessToken', data.accessToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        }
        return api(originalRequest);
      } catch {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  register: async (payload: RegisterPayload): Promise<{ message: string; user: User }> => {
    const { data } = await api.post('/auth/register', payload);
    return data;
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', payload);
    localStorage.setItem('accessToken', data.accessToken);
    return data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    localStorage.removeItem('accessToken');
  },

  getMe: async (): Promise<{ user: User }> => {
    const { data } = await api.get('/auth/me');
    return data;
  },

  refresh: async (): Promise<RefreshResponse> => {
    const { data } = await api.post<RefreshResponse>('/auth/refresh');
    localStorage.setItem('accessToken', data.accessToken);
    return data;
  },
};

export default api;