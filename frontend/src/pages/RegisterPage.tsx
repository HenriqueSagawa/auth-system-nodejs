import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Toast } from '../components/ui/Toast';
import { useAuthStore } from '../store/authStore';
import type { RegisterPayload } from '../types';

interface RegisterForm extends RegisterPayload {
  confirmPassword: string;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser, isLoading, error, clearError, isAuthenticated } = useAuthStore();
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>();

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      setToastMsg(error);
      clearError();
    }
  }, [error, clearError]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onSubmit = async ({ confirmPassword: _, ...data }: RegisterForm) => {
    try {
      await registerUser(data);
      setSuccessMsg('Conta criada com sucesso! Faça login para continuar.');
      setTimeout(() => navigate('/login'), 2000);
    } catch {
      // handled by store
    }
  };

  const password = watch('password');

  const passwordRequirements = [
    { label: 'Mínimo 8 caracteres', valid: (password?.length ?? 0) >= 8 },
    { label: 'Letra maiúscula', valid: /[A-Z]/.test(password ?? '') },
    { label: 'Letra minúscula', valid: /[a-z]/.test(password ?? '') },
    { label: 'Número', valid: /\d/.test(password ?? '') },
    { label: 'Caractere especial (@$!%*?&)', valid: /[@$!%*?&]/.test(password ?? '') },
  ];

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

      <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <h1 className="auth-title">Criar conta</h1>
          <p className="auth-subtitle">Preencha os campos abaixo para se cadastrar</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
          <Input
            label="Nome completo"
            type="text"
            placeholder="João Silva"
            error={errors.name?.message}
            icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            }
            {...register('name', {
              required: 'Nome é obrigatório',
              minLength: { value: 2, message: 'Nome muito curto' },
            })}
          />

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
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                message: 'Senha não atende aos requisitos',
              },
            })}
          />

          {password && (
            <div className="password-requirements">
              {passwordRequirements.map((req) => (
                <div key={req.label} className={`req-item ${req.valid ? 'req-valid' : 'req-invalid'}`}>
                  <span className="req-dot" />
                  <span>{req.label}</span>
                </div>
              ))}
            </div>
          )}

          <Input
            label="Confirmar senha"
            type="password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            }
            {...register('confirmPassword', {
              required: 'Confirme sua senha',
              validate: (v) => v === watch('password') || 'As senhas não coincidem',
            })}
          />

          <Button type="submit" fullWidth isLoading={isLoading}>
            Criar conta
          </Button>
        </form>

        <div className="auth-divider">
          <span>ou</span>
        </div>

        <p className="auth-switch">
          Já tem uma conta?{' '}
          <Link to="/login" className="auth-link">
            Entrar
          </Link>
        </p>
      </div>

      <p className="auth-footer">
        Protegido com JWT + Refresh Token
      </p>

      {toastMsg && (
        <Toast message={toastMsg} type="error" onClose={() => setToastMsg(null)} />
      )}
      {successMsg && (
        <Toast message={successMsg} type="success" onClose={() => setSuccessMsg(null)} duration={2500} />
      )}
    </div>
  );
}