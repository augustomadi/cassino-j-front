import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  IcDashboard, IcAffiliates, IcUsers, IcFinance, IcTransactions,
  IcGames, IcSettings, IcPalette, IcAudit, IcStaff, IcKyc, IcWallet, IcBell, IcSearch, IcExternal, IcLogout, IcMenu, IcX,
} from './AdminIcons';
import { IconLogo } from '../../components/icons/Icons';
import { useAdminAuth } from '../AdminAuthContext';
import { ROLE_LABELS } from '../../utils/roleLabels';

const nav = [
  { to: '/admin', end: true, label: 'Dashboard', Icon: IcDashboard },
  { to: '/admin/afiliados', label: 'Afiliados', Icon: IcAffiliates },
  { to: '/admin/usuarios', label: 'Usuários', Icon: IcUsers },
  { to: '/admin/verificacao', label: 'Verificação (KYC)', Icon: IcKyc },
  { to: '/admin/saques', label: 'Saques', Icon: IcWallet },
  { to: '/admin/financeiro', label: 'Financeiro', Icon: IcFinance },
  { to: '/admin/transacoes', label: 'Transações', Icon: IcTransactions },
  { to: '/admin/jogos', label: 'Carteira de Jogos', Icon: IcGames },
  { to: '/admin/aparencia', label: 'Aparência', Icon: IcPalette },
  { to: '/admin/staff', label: 'Staff', Icon: IcStaff },
  { to: '/admin/configuracoes', label: 'Configurações', Icon: IcSettings },
  { to: '/admin/auditoria', label: 'Auditoria', Icon: IcAudit },
];

export default function AdminLayout({ title, subtitle, actions, children }) {
  const [open, setOpen] = useState(false);
  const { admin, logout } = useAdminAuth();

  return (
    <div className="adm">
      <div
        className={`adm-overlay ${open ? 'is-open' : ''}`}
        onClick={() => setOpen(false)}
      />
      <aside className={`adm-side ${open ? 'is-open' : ''}`}>
        <div className="adm-brand">
          <IconLogo size={30} />
          <div>
            <strong>CASSINO</strong>
            <span>Admin Panel</span>
          </div>
          <button className="adm-side-close" onClick={() => setOpen(false)} aria-label="Fechar">
            <IcX size={18} />
          </button>
        </div>

        <nav className="adm-nav">
          {nav.map(({ to, end, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `adm-nav-item ${isActive ? 'is-active' : ''}`}
              onClick={() => setOpen(false)}
            >
              <Icon />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="adm-side-foot">
          <Link to="/" className="adm-nav-item">
            <IcExternal />
            <span>Ver site</span>
          </Link>
          <button className="adm-nav-item" onClick={logout}>
            <IcLogout />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      <div className="adm-main">
        <header className="adm-top">
          <button className="adm-burger" onClick={() => setOpen(true)} aria-label="Menu">
            <IcMenu />
          </button>
          <div className="adm-search">
            <IcSearch />
            <input placeholder="Buscar usuário, transação, afiliado..." />
          </div>
          <div className="adm-top-right">
            <button className="adm-icon-btn" aria-label="Notificações">
              <IcBell />
              <span className="adm-badge-dot" />
            </button>
            <div className="adm-profile">
              <span className="adm-avatar">{admin?.name ? admin.name.charAt(0).toUpperCase() : 'A'}</span>
              <div className="adm-profile-info">
                <strong>{admin?.name || 'Admin'}</strong>
                <span>{ROLE_LABELS[admin?.role] || admin?.role || '—'}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="adm-page">
          <div className="adm-page-head">
            <div>
              <h1>{title}</h1>
              {subtitle && <p>{subtitle}</p>}
            </div>
            {actions && <div className="adm-page-actions">{actions}</div>}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
