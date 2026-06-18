/* Gráficos SVG leves — sem dependências externas. */

const W = 560;
const H = 220;
const PAD = { t: 16, r: 16, b: 26, l: 48 };

const niceMax = (v) => {
  const pow = Math.pow(10, Math.floor(Math.log10(v)));
  return Math.ceil(v / pow) * pow;
};

const abbr = (v) => {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${Math.round(v / 1000)}k`;
  return `${v}`;
};

/* ---- Área multi-série ---- */
export function AreaChart({ data, series }) {
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const max = niceMax(Math.max(...data.flatMap((d) => series.map((s) => d[s.key])))) || 1;
  const x = (i) => PAD.l + (i / (data.length - 1)) * innerW;
  const y = (v) => PAD.t + innerH - (v / max) * innerH;

  const grid = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="adm-chart">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet">
        <defs>
          {series.map((s) => (
            <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" style={{ stopColor: s.color }} stopOpacity="0.35" />
              <stop offset="1" style={{ stopColor: s.color }} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>
        {grid.map((g, i) => {
          const gy = PAD.t + innerH - g * innerH;
          return (
            <g key={i}>
              <line x1={PAD.l} y1={gy} x2={W - PAD.r} y2={gy} style={{ stroke: 'var(--border)' }} strokeWidth="1" />
              <text x={PAD.l - 8} y={gy + 4} textAnchor="end" fontSize="10" style={{ fill: 'var(--text-dim)' }}>
                {abbr(Math.round(g * max))}
              </text>
            </g>
          );
        })}
        {series.map((s) => {
          const line = data.map((d, i) => `${x(i)},${y(d[s.key])}`).join(' ');
          const area = `${PAD.l},${PAD.t + innerH} ${line} ${x(data.length - 1)},${PAD.t + innerH}`;
          return (
            <g key={s.key}>
              <polygon points={area} fill={`url(#grad-${s.key})`} />
              <polyline points={line} fill="none" style={{ stroke: s.color }} strokeWidth="2.4" strokeLinejoin="round" />
            </g>
          );
        })}
      </svg>
      <div className="adm-legend">
        {series.map((s) => (
          <span className="adm-legend-item" key={s.key}>
            <span className="adm-legend-dot" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---- Barras agrupadas (receita x despesa) ---- */
export function BarChart({ data }) {
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const max = niceMax(Math.max(...data.flatMap((d) => [d.revenue, d.expenses]))) || 1;
  const groupW = innerW / data.length;
  const barW = Math.min(18, groupW / 3.2);
  const y = (v) => PAD.t + innerH - (v / max) * innerH;

  return (
    <div className="adm-chart">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet">
        {[0, 0.25, 0.5, 0.75, 1].map((g, i) => {
          const gy = PAD.t + innerH - g * innerH;
          return (
            <g key={i}>
              <line x1={PAD.l} y1={gy} x2={W - PAD.r} y2={gy} style={{ stroke: 'var(--border)' }} strokeWidth="1" />
              <text x={PAD.l - 8} y={gy + 4} textAnchor="end" fontSize="10" style={{ fill: 'var(--text-dim)' }}>{abbr(Math.round(g * max))}</text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const cx = PAD.l + groupW * i + groupW / 2;
          return (
            <g key={d.month}>
              <rect x={cx - barW - 2} y={y(d.revenue)} width={barW} height={PAD.t + innerH - y(d.revenue)} rx="3" style={{ fill: 'var(--green-500)' }} />
              <rect x={cx + 2} y={y(d.expenses)} width={barW} height={PAD.t + innerH - y(d.expenses)} rx="3" style={{ fill: 'var(--red-500)' }} opacity="0.85" />
              <text x={cx} y={H - 8} textAnchor="middle" fontSize="10" style={{ fill: 'var(--text-muted)' }}>{d.month}</text>
            </g>
          );
        })}
      </svg>
      <div className="adm-legend">
        <span className="adm-legend-item"><span className="adm-legend-dot" style={{ background: 'var(--green-500)' }} />Receita</span>
        <span className="adm-legend-item"><span className="adm-legend-dot" style={{ background: 'var(--red-500)' }} />Despesas</span>
      </div>
    </div>
  );
}

/* ---- Donut ---- */
export function Donut({ data, size = 180 }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = size / 2 - 14;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="adm-donut-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill="none" style={{ stroke: 'var(--border-soft)' }} strokeWidth="16" />
        {data.map((d) => {
          const len = (d.value / total) * circ;
          const seg = (
            <circle
              key={d.name}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              style={{ stroke: d.color }}
              strokeWidth="16"
              strokeDasharray={`${len} ${circ - len}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${cx} ${cy})`}
              strokeLinecap="butt"
            />
          );
          offset += len;
          return seg;
        })}
        <text x={cx} y={cy - 2} textAnchor="middle" fontSize="13" style={{ fill: 'var(--text-muted)' }}>Métodos</text>
        <text x={cx} y={cy + 16} textAnchor="middle" fontSize="15" fontWeight="700" style={{ fill: 'var(--text-strong)' }}>{data.length}</text>
      </svg>
      <div className="adm-donut-legend">
        {data.map((d) => (
          <div className="adm-legend-item" key={d.name}>
            <span className="adm-legend-dot" style={{ background: d.color }} />
            {d.name} <strong style={{ color: 'var(--text-strong)', marginLeft: 4 }}>{d.value}%</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
