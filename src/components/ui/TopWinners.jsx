import './TopWinners.css';
import { topWinners, fmtBRL } from '../../data/mockData';

const isVideo = (url) => /\.(mp4|webm|mov)(\?|$)/i.test(url);

export default function TopWinners() {
  return (
    <div className="topwin no-scrollbar">
      {topWinners.map((g) => (
        <div className="topwin-card" key={g.id}>
          <span className="topwin-rank">{g.rank}</span>
          <span className="topwin-thumb" style={g.media ? { background: g.grad } : undefined}>
            {g.media ? (
              isVideo(g.media) ? (
                <video src={g.media} autoPlay loop muted playsInline preload="metadata" />
              ) : (
                <img src={g.media} alt={g.name} loading="lazy" />
              )
            ) : (
              <span className="topwin-emoji">{g.emoji}</span>
            )}
          </span>
          <div className="topwin-info">
            <strong>{g.name}</strong>
            <span className="money">{fmtBRL(g.amount)}</span>
            <button className="btn btn-outline-gold topwin-play">JOGAR</button>
          </div>
        </div>
      ))}
    </div>
  );
}
