/* Ícones SVG inline — sem dependências externas.
   Herdam currentColor; tamanho via prop `size`. */

const base = (size) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
});

export const IconCards = ({ size = 22 }) => (
  <svg {...base(size)}>
    <rect x="3" y="5" width="13" height="15" rx="2" />
    <path d="M8 5V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-1" />
  </svg>
);

export const IconLive = ({ size = 22 }) => (
  <svg {...base(size)}>
    <rect x="2" y="4" width="20" height="14" rx="2" />
    <path d="M8 21h8M12 18v3" />
    <path d="m10 9 4 2.5L10 14V9z" fill="currentColor" stroke="none" />
  </svg>
);

export const IconSlots = ({ size = 22 }) => (
  <svg {...base(size)}>
    <path d="M3 7h18M3 12h18M3 17h18" />
  </svg>
);

export const IconCrown = ({ size = 22 }) => (
  <svg {...base(size)}>
    <path d="M3 8l3.5 3L12 5l5.5 6L21 8l-1.5 11h-15L3 8z" />
  </svg>
);

export const IconProvider = ({ size = 22 }) => (
  <svg {...base(size)}>
    <rect x="2" y="6" width="20" height="12" rx="3" />
    <path d="M7 12h3M8.5 10.5v3M15 11h.01M18 13h.01" />
  </svg>
);

export const IconBomb = ({ size = 22 }) => (
  <svg {...base(size)}>
    <circle cx="11" cy="14" r="6" />
    <path d="M15 9l2-2M17 7l1 1M19 4l1 1M16 5l.5-1.5" />
  </svg>
);

export const IconTiger = ({ size = 22 }) => (
  <svg {...base(size)}>
    <path d="M4 5l3 3M20 5l-3 3" />
    <path d="M5 9c0 5 3 9 7 9s7-4 7-9c0-1.5-1-3-2.5-3S12 8 12 8s-1-2-2.5-2S5 7.5 5 9z" />
    <path d="M9.5 12h.01M14.5 12h.01M11 15h2" />
  </svg>
);

export const IconPlane = ({ size = 22 }) => (
  <svg {...base(size)}>
    <path d="M10.5 13.5 3 11l2-2 6 1 4-5c.8-1 2-1.3 2.6-.7.6.6.3 1.8-.7 2.6l-5 4 1 6-2 2-2.4-7.7z" />
  </svg>
);

export const IconRoulette = ({ size = 22 }) => (
  <svg {...base(size)}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="2.5" />
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
  </svg>
);

export const IconGift = ({ size = 22 }) => (
  <svg {...base(size)}>
    <rect x="3" y="9" width="18" height="12" rx="1.5" />
    <path d="M3 13h18M12 9v12" />
    <path d="M12 9S9.5 4.5 7.5 6.5 12 9 12 9zM12 9s2.5-4.5 4.5-2.5S12 9 12 9z" />
  </svg>
);

export const IconTrophy = ({ size = 22 }) => (
  <svg {...base(size)}>
    <path d="M7 4h10v4a5 5 0 0 1-10 0V4z" />
    <path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M9 21h6M12 13v4" />
  </svg>
);

export const IconTarget = ({ size = 22 }) => (
  <svg {...base(size)}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

export const IconDice = ({ size = 22 }) => (
  <svg {...base(size)}>
    <rect x="3" y="3" width="18" height="18" rx="4" />
    <circle cx="8" cy="8" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="16" cy="8" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="8" cy="16" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="16" cy="16" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);

export const IconSearch = ({ size = 20 }) => (
  <svg {...base(size)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

export const IconMenu = ({ size = 22 }) => (
  <svg {...base(size)}>
    <path d="M3 6h18M3 12h18M3 18h18" />
  </svg>
);

export const IconClose = ({ size = 22 }) => (
  <svg {...base(size)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const IconUser = ({ size = 22 }) => (
  <svg {...base(size)}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.5-6 8-6s8 2 8 6" />
  </svg>
);

export const IconCoin = ({ size = 22 }) => (
  <svg {...base(size)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v10M9.5 9.5c0-1 1-1.5 2.5-1.5s2.5.5 2.5 1.5-1 1.5-2.5 1.5-2.5.5-2.5 1.5 1 1.5 2.5 1.5 2.5-.5 2.5-1.5" />
  </svg>
);

export const IconChevronLeft = ({ size = 20 }) => (
  <svg {...base(size)}>
    <path d="M15 6l-6 6 6 6" />
  </svg>
);

export const IconChevronRight = ({ size = 20 }) => (
  <svg {...base(size)}>
    <path d="M9 6l6 6-6 6" />
  </svg>
);

export const IconFire = ({ size = 20 }) => (
  <svg {...base(size)}>
    <path d="M12 3s5 4 5 9a5 5 0 0 1-10 0c0-2 1-3 1-3s0 2 1.5 2S11 8 12 3z" />
  </svg>
);

export const IconTrend = ({ size = 16 }) => (
  <svg {...base(size)}>
    <path d="M3 17l6-6 4 4 7-7" />
    <path d="M14 8h6v6" />
  </svg>
);

export const IconStar = ({ size = 16 }) => (
  <svg {...base(size)}>
    <path
      d="m12 3 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19l1-5.8L3.5 9.2l5.9-.9L12 3z"
      fill="currentColor"
      stroke="none"
    />
  </svg>
);

export const IconLogo = ({ size = 30 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <defs>
      <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" style={{ stopColor: 'var(--gold-400)' }} />
        <stop offset="1" style={{ stopColor: 'var(--gold-500)' }} />
      </linearGradient>
    </defs>
    <path d="M16 2 28 9v14L16 30 4 23V9L16 2z" fill="url(#lg)" />
    <path d="M16 8 22 11.5v7L16 22l-6-3.5v-7L16 8z" style={{ fill: 'var(--bg-900)' }} />
    <circle cx="16" cy="15" r="2.4" fill="url(#lg)" />
  </svg>
);

/* Mapa nome -> componente (usado por menu/promos a partir do mock) */
export const iconByName = {
  cards: IconCards,
  live: IconLive,
  slots: IconSlots,
  crown: IconCrown,
  provider: IconProvider,
  bomb: IconBomb,
  tiger: IconTiger,
  plane: IconPlane,
  roulette: IconRoulette,
  dice: IconDice,
  gift: IconGift,
  trophy: IconTrophy,
  target: IconTarget,
  fire: IconFire,
  user: IconUser,
  coin: IconCoin,
};
