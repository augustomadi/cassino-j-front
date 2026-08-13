import { useRef } from 'react';
import './GameSection.css';
import GameCard from './GameCard';
import { IconChevronLeft, IconChevronRight } from '../icons/Icons';

export default function GameSection({ title, icon: Icon, games, onPlay }) {
  const trackRef = useRef(null);

  const scroll = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: 'smooth' });
  };

  return (
    <section className="game-section">
      <div className="section-head">
        <h3 className="section-title">
          {Icon && (
            <span className="section-icon">
              <Icon size={20} />
            </span>
          )}
          {title}
        </h3>
        <div className="section-actions">
          <button className="section-arrow" onClick={() => scroll(-1)} aria-label="Anterior">
            <IconChevronLeft />
          </button>
          <button className="section-arrow" onClick={() => scroll(1)} aria-label="Próximo">
            <IconChevronRight />
          </button>
          <button className="section-all">Ver todos</button>
        </div>
      </div>

      <div className="section-track no-scrollbar" ref={trackRef}>
        {games.map((g) => (
          <div className="section-cell" key={g.id}>
            <GameCard game={g} onPlay={onPlay} />
          </div>
        ))}
      </div>
    </section>
  );
}
