import './GameCard.css';
import { fmtBRL } from '../../data/mockData';
import { IconTrend, IconFire } from '../icons/Icons';

const isVideo = (url) => /\.(mp4|webm|mov)(\?|$)/i.test(url);

export default function GameCard({ game }) {
  return (
    <article className="game-card">
      <div className="game-thumb" style={{ background: game.grad }}>
        {game.media ? (
          isVideo(game.media) ? (
            <video
              className="game-img"
              src={game.media}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
            />
          ) : (
            <img className="game-img" src={game.media} alt={game.name} loading="lazy" />
          )
        ) : (
          <span className="game-emoji">{game.emoji}</span>
        )}

        <div className="game-badges">
          {game.hot && (
            <span className="chip chip-hot">
              <IconFire size={13} /> HOT
            </span>
          )}
          {game.live && <span className="chip chip-live">AO VIVO</span>}
          {game.players && <span className="game-players">{game.players} jogando</span>}
        </div>

        {game.rtp && <span className="game-rtp">RTP {game.rtp}%</span>}

        <div className="game-overlay">
          <button className="btn btn-gold game-play">JOGAR</button>
        </div>
      </div>

      <div className="game-meta">
        <h4 className="game-name">{game.name}</h4>
        <span className="game-provider">{game.provider}</span>
        {game.paid && (
          <span className="game-paid">
            <IconTrend size={13} /> Pagou <b className="money">{fmtBRL(game.paid)}</b>
          </span>
        )}
      </div>
    </article>
  );
}
