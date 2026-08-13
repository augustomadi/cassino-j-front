import { useEffect, useState } from 'react';
import './TopWinners.css';
import { topWinners, fmtBRL } from '../../data/mockData';
import * as gamesApi from '../../api/games';

export default function TopWinners({ onPlay }) {
  // O ganho é mock (sem fonte de dado real ainda — ADR 0003), mas o jogo por
  // trás de cada card precisa existir de verdade pro JOGAR abrir alguma
  // coisa. Resolve o nome pro jogo real do catálogo (id + banner) uma vez,
  // ao montar.
  const [resolved, setResolved] = useState({});

  useEffect(() => {
    topWinners.forEach((w) => {
      gamesApi
        .getGames({ search: w.name, perPage: 1 })
        .then((res) => {
          if (res.data[0]) {
            setResolved((prev) => ({ ...prev, [w.id]: res.data[0] }));
          }
        })
        .catch(() => {});
    });
  }, []);

  return (
    <div className="topwin no-scrollbar">
      {topWinners.map((w) => {
        const game = resolved[w.id];
        return (
          <div className="topwin-card" key={w.id}>
            <span className="topwin-rank">{w.rank}</span>
            <span className="topwin-thumb">
              {game?.banner_url ? (
                <img src={game.banner_url} alt={w.name} loading="lazy" />
              ) : (
                <span className="topwin-emoji">🎰</span>
              )}
            </span>
            <div className="topwin-info">
              <strong>{w.name}</strong>
              <span className="money">{fmtBRL(w.amount)}</span>
              <button
                type="button"
                className="btn btn-outline-gold topwin-play"
                disabled={!game}
                onClick={() => game && onPlay?.(game)}
              >
                JOGAR
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
