import './Sidebar.css';
import { menuItems, promoCards } from '../../data/mockData';
import { iconByName, IconClose, IconLogo } from '../icons/Icons';

export default function Sidebar({ open, onClose, active, onSelect }) {
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
          {/* Cards promocionais */}
          <div className="promo-list">
            {promoCards.map((p) => {
              const Icon = iconByName[p.icon];
              return (
                <button key={p.id} className="promo-card" style={{ background: p.grad }}>
                  <span className="promo-text">
                    <small>{p.kicker}</small>
                    <strong>{p.title}</strong>
                  </span>
                  <span className="promo-icon">{Icon && <Icon size={26} />}</span>
                  <span className="promo-shine" />
                </button>
              );
            })}
          </div>

          {/* Menu de navegação */}
          <nav className="side-nav">
            {menuItems.map((m) => {
              const Icon = iconByName[m.icon];
              return (
                <button
                  key={m.id}
                  className={`side-nav-item ${active === m.id ? 'is-active' : ''}`}
                  onClick={() => onSelect?.(m.id)}
                >
                  <span className="side-nav-icon">{Icon && <Icon size={20} />}</span>
                  <span>{m.label}</span>
                </button>
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
