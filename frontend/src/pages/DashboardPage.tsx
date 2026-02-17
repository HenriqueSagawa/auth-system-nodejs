import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Toast } from '../components/ui/Toast';
import { useAuthStore } from '../store/authStore';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout, loadUser, isLoading } = useAuthStore();
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!user) loadUser();
  }, [user, loadUser]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  const copyToken = () => {
    const token = localStorage.getItem('accessToken') ?? '';
    navigator.clipboard.writeText(token).then(() => {
      setToastMsg('Token copiado para área de transferência');
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="currentColor" />
              <path d="M10 16.5L14.5 21L22 11" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="brand-name">Secure</span>
        </div>

        <nav className="sidebar-nav">
          <a href="#" className="nav-item nav-item-active">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            Dashboard
          </a>
          <a href="#" className="nav-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
            Perfil
          </a>
          <a href="#" className="nav-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            Segurança
          </a>
          <a href="#" className="nav-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14" />
            </svg>
            Configurações
          </a>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar-sm">
              {user ? getInitials(user.name) : '??'}
            </div>
            <div className="sidebar-user-info">
              <p className="sidebar-user-name">{user?.name ?? 'Carregando...'}</p>
              <p className="sidebar-user-email">{user?.email ?? ''}</p>
            </div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout} disabled={isLoading}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Dashboard</h1>
            <p className="dashboard-subtitle">Visão geral da sua sessão</p>
          </div>
          <Button variant="outline" onClick={handleLogout} isLoading={isLoading}>
            Sair
          </Button>
        </header>

        <div className="dashboard-grid">
          {/* Welcome card */}
          <div className="card card-welcome">
            <div className="welcome-content">
              <div className="user-avatar">
                {user ? getInitials(user.name) : '??'}
              </div>
              <div>
                <p className="welcome-label">Bem-vindo,</p>
                <h2 className="welcome-name">{user?.name ?? '...'}</h2>
                <p className="welcome-email">{user?.email ?? ''}</p>
              </div>
            </div>
            <div className="status-badge">
              <span className="status-dot" />
              Sessão ativa
            </div>
          </div>

          {/* Stats */}
          <div className="card card-stat">
            <p className="stat-label">ID do Usuário</p>
            <p className="stat-value stat-mono">{user?.id?.slice(0, 8)}…</p>
          </div>

          <div className="card card-stat">
            <p className="stat-label">Autenticação</p>
            <p className="stat-value">JWT + Refresh</p>
          </div>

          {/* Token info */}
          <div className="card card-token">
            <div className="token-header">
              <h3 className="card-title">Access Token</h3>
              <button className="token-copy-btn" onClick={copyToken}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
                Copiar
              </button>
            </div>
            <div className="token-display">
              {(localStorage.getItem('accessToken') ?? '').slice(0, 80)}
              <span className="token-ellipsis">…</span>
            </div>
            <p className="token-note">Expira em 15 minutos · Renovado automaticamente via cookie</p>
          </div>

          {/* Security info */}
          <div className="card card-security">
            <h3 className="card-title">Proteções ativas</h3>
            <ul className="security-list">
              {[
                'Bcrypt hash (12 rounds)',
                'JWT curta duração (15m)',
                'Refresh token HttpOnly Cookie',
                'Rate limiting anti-brute force',
                'Bloqueio após 5 tentativas',
                'Helmet HTTP headers',
              ].map((item) => (
                <li key={item} className="security-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      {toastMsg && (
        <Toast message={toastMsg} type="success" onClose={() => setToastMsg(null)} />
      )}
    </div>
  );
}