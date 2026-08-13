import { Link, useLocation } from 'react-router-dom';
import './BottomNav.css';
import { IconMenu, IconCards, IconCoin, IconGift, IconTrophy } from '../icons/Icons';

// `promocoes`/`recompensas` ainda não têm página própria — ficam visíveis,
// sem navegação, até essas telas existirem.
const items = [
  { id: 'menu', label: 'Menu', Icon: IconMenu },
  { id: 'cassino', label: 'Cassino', Icon: IconCards, path: '/' },
  { id: 'depositar', label: 'Depositar', Icon: IconCoin, center: true },
  { id: 'promocoes', label: 'Promoções', Icon: IconGift },
  { id: 'recompensas', label: 'Recompensas', Icon: IconTrophy },
];

export default function BottomNav({ onMenu, onDeposit }) {
  const { pathname } = useLocation();

  return (
    <nav className="bottom-nav">
      {items.map(({ id, label, Icon, center, path }) => {
        if (id === 'menu') {
          return (
            <button key={id} className="bn-item" onClick={onMenu}>
              <Icon size={22} />
              <span>{label}</span>
            </button>
          );
        }
        if (center) {
          return (
            <button key={id} className="bn-center" onClick={onDeposit}>
              <span className="bn-center-coin">
                <Icon size={26} />
              </span>
              <span className="bn-center-label">{label}</span>
            </button>
          );
        }
        if (path) {
          return (
            <Link key={id} to={path} className={`bn-item ${pathname === path ? 'is-active' : ''}`}>
              <Icon size={22} />
              <span>{label}</span>
            </Link>
          );
        }
        return (
          <button key={id} className="bn-item" disabled>
            <Icon size={22} />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
