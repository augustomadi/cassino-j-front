import './GameCard.css';
import { IconFire } from '../icons/Icons';

export default function GameCard({ game, onPlay }) {
  // Nomes vindos do catálogo do provedor às vezes trazem espaço/quebra de
  // linha sobrando (ex: "\r\nMoney Pot DELUXE") — apara na exibição.
  const name = game.name?.trim();

  return (
    <article className="game-card" onClick={() => onPlay?.(game)}>
      <div className="game-thumb">
        {game.banner_url ? (
          <img className="game-img" src={game.banner_url} alt={name} loading="lazy" />
        ) : (
          <span className="game-emoji">🎰</span>
        )}

        {game.is_featured && (
          <div className="game-badges">
            <span className="chip chip-hot">
              <IconFire size={13} /> HOT
            </span>
          </div>
        )}

        <div className="game-overlay">
          <button type="button" className="btn btn-gold game-play">JOGAR</button>
        </div>
      </div>

      <div className="game-meta">
        <h4 className="game-name">{name}</h4>
        <span className="game-provider">{game.providerName || game.provider_code}</span>
      </div>
    </article>
  );
}
