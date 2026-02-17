import { create } from 'zustand';
import { authService } from '../services/api';
import type { User, LoginPayload, RegisterPayload } from '../types';

export type ErrorType = 'error' | 'warning' | 'rate-limit';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  errorType: ErrorType;

  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  clearError: () => void;
}

const LOCK_PATTERN = /conta bloqueada/i;

type ApiError = { response?: { status?: number; data?: { error?: string; errors?: { msg: string }[] } } };

function classifyError(err: unknown): { message: string; errorType: ErrorType } {
  const apiErr = err as ApiError;
  const status = apiErr?.response?.status;

  if (status === 429) {
    return {
      message: 'Muitas tentativas. Aguarde 15 minutos antes de tentar novamente.',
      errorType: 'rate-limit',
    };
  }

  const message =
    apiErr?.response?.data?.errors?.[0]?.msg ??
    apiErr?.response?.data?.error ??
    'Ocorreu um erro inesperado';

  if (LOCK_PATTERN.test(message)) {
    return { message, errorType: 'warning' };
  }

  return { message, errorType: 'error' };
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,
  error: null,
  errorType: 'error',

  login: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await authService.login(payload);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (err: unknown) {
      const { message, errorType } = classifyError(err);
      set({ error: message, errorType, isLoading: false });
      throw err;
    }
  },

  register: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      await authService.register(payload);
      set({ isLoading: false });
    } catch (err: unknown) {
      const { message, errorType } = classifyError(err);
      set({ error: message, errorType, isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
    } finally {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  loadUser: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      set({ isAuthenticated: false });
      return;
    }
    set({ isLoading: true });
    try {
      const { user } = await authService.getMe();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem('accessToken');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));