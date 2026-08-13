import { IcUp, IcDown } from './AdminIcons';

export default function StatCard({ label, value, icon: Icon, tone = 'gold', trend, hint }) {
  return (
    <div className="stat">
      <div className="stat-top">
        <span className="stat-label">{label}</span>
        {Icon && (
          <span className={`stat-icon ${tone}`}>
            <Icon size={20} />
          </span>
        )}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-foot">
        {trend != null && (
          <span className={`stat-trend ${trend >= 0 ? 'up' : 'down'}`}>
            {trend >= 0 ? <IcUp size={12} /> : <IcDown size={12} />}
            {Math.abs(trend).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%
          </span>
        )}
        {hint && <small>{hint}</small>}
      </div>
    </div>
  );
}
