import './WinnersTicker.css';
import { tickerWins, fmtBRL } from '../../data/mockData';
import { IconTrophy } from '../icons/Icons';

export default function WinnersTicker() {
  const items = [...tickerWins, ...tickerWins];
  return (
    <div className="ticker">
      <div className="ticker-label">
        <IconTrophy size={18} />
        <span>TOP GANHOS</span>
      </div>
      <div className="ticker-mask">
        <div className="ticker-track">
          {items.map((w, i) => (
            <div className="ticker-item" key={i}>
              <span className="ticker-emoji">🏆</span>
              <span className="ticker-info">
                <b>{w.user}</b>
                <small>{w.game}</small>
              </span>
              <span className="money">{fmtBRL(w.amount)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
