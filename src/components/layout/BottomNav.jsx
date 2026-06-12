import './BottomNav.css';
import { IconMenu, IconCards, IconCoin, IconGift, IconTrophy } from '../icons/Icons';

const items = [
  { id: 'menu', label: 'Menu', Icon: IconMenu },
  { id: 'cassino', label: 'Cassino', Icon: IconCards },
  { id: 'depositar', label: 'Depositar', Icon: IconCoin, center: true },
  { id: 'promocoes', label: 'Promoções', Icon: IconGift },
  { id: 'recompensas', label: 'Recompensas', Icon: IconTrophy },
];

export default function BottomNav({ onMenu, active = 'cassino', onSelect }) {
  return (
    <nav className="bottom-nav">
      {items.map(({ id, label, Icon, center }) => {
        const handle = id === 'menu' ? onMenu : () => onSelect?.(id);
        if (center) {
          return (
            <button key={id} className="bn-center" onClick={handle}>
              <span className="bn-center-coin">
                <Icon size={26} />
              </span>
              <span className="bn-center-label">{label}</span>
            </button>
          );
        }
        return (
          <button
            key={id}
            className={`bn-item ${active === id ? 'is-active' : ''}`}
            onClick={handle}
          >
            <Icon size={22} />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
