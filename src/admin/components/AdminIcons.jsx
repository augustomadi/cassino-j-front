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

export const IcDashboard = ({ size = 20 }) => (
  <svg {...base(size)}>
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </svg>
);

export const IcAffiliates = ({ size = 20 }) => (
  <svg {...base(size)}>
    <circle cx="6" cy="7" r="2.5" />
    <circle cx="18" cy="6" r="2.5" />
    <circle cx="17" cy="18" r="2.5" />
    <path d="M8.2 8.2 15.5 6.6M8 8.8l7.5 7.6" />
  </svg>
);

export const IcUsers = ({ size = 20 }) => (
  <svg {...base(size)}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3 20c0-3.3 2.7-5 6-5s6 1.7 6 5" />
    <path d="M16 4.5a3 3 0 0 1 0 6M17 15c2.5.4 4 2 4 5" />
  </svg>
);

export const IcFinance = ({ size = 20 }) => (
  <svg {...base(size)}>
    <rect x="2.5" y="6" width="19" height="13" rx="2.5" />
    <path d="M2.5 10h19M6 15h3" />
    <circle cx="17.5" cy="15" r="1.3" fill="currentColor" stroke="none" />
  </svg>
);

export const IcTransactions = ({ size = 20 }) => (
  <svg {...base(size)}>
    <path d="M4 7h12l-3-3M20 17H8l3 3" />
  </svg>
);

export const IcGames = ({ size = 20 }) => (
  <svg {...base(size)}>
    <rect x="2" y="6" width="20" height="12" rx="4" />
    <path d="M7 12h3M8.5 10.5v3M15 11h.01M18 13h.01" />
  </svg>
);

export const IcSettings = ({ size = 20 }) => (
  <svg {...base(size)}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
  </svg>
);

export const IcBell = ({ size = 20 }) => (
  <svg {...base(size)}>
    <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M10.5 21a2 2 0 0 0 3 0" />
  </svg>
);

export const IcSearch = ({ size = 18 }) => (
  <svg {...base(size)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

export const IcPlus = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IcEdit = ({ size = 16 }) => (
  <svg {...base(size)}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
  </svg>
);

export const IcCopy = ({ size = 16 }) => (
  <svg {...base(size)}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15V5a2 2 0 0 1 2-2h10" />
  </svg>
);

export const IcCheck = ({ size = 16 }) => (
  <svg {...base(size)}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export const IcX = ({ size = 16 }) => (
  <svg {...base(size)}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export const IcUp = ({ size = 14 }) => (
  <svg {...base(size)}>
    <path d="M12 19V5M5 12l7-7 7 7" />
  </svg>
);

export const IcDown = ({ size = 14 }) => (
  <svg {...base(size)}>
    <path d="M12 5v14M19 12l-7 7-7-7" />
  </svg>
);

export const IcExternal = ({ size = 16 }) => (
  <svg {...base(size)}>
    <path d="M15 3h6v6M10 14 21 3M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
  </svg>
);

export const IcLogout = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  </svg>
);

export const IcWallet = ({ size = 20 }) => (
  <svg {...base(size)}>
    <path d="M3 7a2 2 0 0 1 2-2h12v4" />
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <circle cx="16.5" cy="13.5" r="1.4" fill="currentColor" stroke="none" />
  </svg>
);

export const IcAlert = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path d="M12 3 2 20h20L12 3z" />
    <path d="M12 10v4M12 17h.01" />
  </svg>
);

export const IcMenu = ({ size = 22 }) => (
  <svg {...base(size)}>
    <path d="M3 6h18M3 12h18M3 18h18" />
  </svg>
);
