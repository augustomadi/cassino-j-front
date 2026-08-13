import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';
import { menuItems } from '../../data/mockData';
import { iconByName, IconClose, IconLogo } from '../icons/Icons';

export default function Sidebar({ open, onClose }) {
  const { pathname } = useLocation();

  return (
    <>
      <div
        className={`sidebar-overlay ${open ? 'is-open' : ''}`}
        onClick={onClose}
      />
      <aside className={`sidebar ${open ? 'is-open' : ''}`}>
        <div className="sidebar-mobile-head">
          <span className="sidebar-logo">
            <IconLogo size={28} />
            <strong>CASSINO</strong>
          </span>
          <button className="sidebar-close" onClick={onClose} aria-label="Fechar menu">
            <IconClose />
          </button>
        </div>

        <div className="sidebar-scroll no-scrollbar">
          {/* Menu de navegação */}
          <nav className="side-nav">
            {menuItems.map((m) => {
              const Icon = iconByName[m.icon];
              return (
                <Link
                  key={m.id}
                  to={m.path}
                  className={`side-nav-item ${pathname === m.path ? 'is-active' : ''}`}
                  onClick={onClose}
                >
                  <span className="side-nav-icon">{Icon && <Icon size={20} />}</span>
                  <span>{m.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="side-footer">
            <span className="reg-badge">
              <span className="reg-dot" /> Plataforma Regulamentada
            </span>
            <p>Jogue com responsabilidade. +18</p>
          </div>
        </div>
      </aside>
    </>
  );
}
