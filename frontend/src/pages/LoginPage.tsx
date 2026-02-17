import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Toast } from '../components/ui/Toast';
import { useAuthStore } from '../store/authStore';
import type { LoginPayload } from '../types';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError, isAuthenticated } = useAuthStore();
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginPayload>();

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setToastMsg(error);
      clearError();
    }
  }, [error, clearError]);

  const onSubmit = async (data: LoginPayload) => {
    try {
      await login(data);
      navigate('/dashboard');
    } catch {
      // error handled by store
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-brand">
        <div className="brand-logo">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="currentColor" />
            <path d="M10 16.5L14.5 21L22 11" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="brand-name">Secure</span>
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Bem-vindo de volta</h1>
          <p className="auth-subtitle">Acesse sua conta para continuar</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
          <Input
            label="E-mail"
            type="email"
            placeholder="voce@exemplo.com"
            error={errors.email?.message}
            icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="2" y="4" width="20" height="16" rx="3" />
                <path d="M2 8l10 7 10-7" />
              </svg>
            }
            {...register('email', {
              required: 'E-mail é obrigatório',
              pattern: { value: /^\S+@\S+\.\S+$/, message: 'E-mail inválido' },
            })}
          />

          <Input
            label="Senha"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            }
            {...register('password', {
              required: 'Senha é obrigatória',
            })}
          />

          <Button type="submit" fullWidth isLoading={isLoading}>
            Entrar
          </Button>
        </form>

        <div className="auth-divider">
          <span>ou</span>
        </div>

        <p className="auth-switch">
          Não tem uma conta?{' '}
          <Link to="/register" className="auth-link">
            Criar conta
          </Link>
        </p>
      </div>

      <p className="auth-footer">
        Protegido com JWT + Refresh Token
      </p>

      {toastMsg && (
        <Toast
          message={toastMsg}
          type="error"
          onClose={() => setToastMsg(null)}
        />
      )}
    </div>
  );
}