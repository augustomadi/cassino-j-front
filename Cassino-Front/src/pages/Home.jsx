import { useEffect, useState } from 'react';
import './Home.css';
import cashbackImg from '../assets/promo-cashback.png';
import appImg from '../assets/promo-app.png';
import WinnersTicker from '../components/ui/WinnersTicker';
import TopWinners from '../components/ui/TopWinners';
import BannerCarousel from '../components/ui/BannerCarousel';
import GameSection from '../components/ui/GameSection';
import * as gamesApi from '../api/games';
import { gameCategories } from '../data/mockData';
import { iconByName, IconCards, IconStar } from '../components/icons/Icons';

const sidePromos = [
  { id: 'app', image: appImg, alt: 'Baixe nosso APP' },
  { id: 'cb', image: cashbackImg, alt: 'Até 25% de cashback' },
];

export default function Home({ onPlay, onOpenAllGames }) {
  const [sections, setSections] = useState({});

  useEffect(() => {
    gameCategories.forEach(({ id }) => {
      gamesApi
        .getGames({ category: id, perPage: 12 })
        .then((res) => setSections((prev) => ({ ...prev, [id]: res.data })))
        .catch(() => setSections((prev) => ({ ...prev, [id]: [] })));
    });
  }, []);

  return (
    <div className="home">
      <WinnersTicker />

      <section className="home-top">
        <div className="home-top-main">
          <div className="home-section-label">
            <IconStar size={16} /> Top Ganhos da Semana
          </div>
          <TopWinners onPlay={onPlay} />
        </div>
      </section>

      <section className="home-hero">
        <BannerCarousel />
        <div className="home-side-promos">
          {sidePromos.map((p) => (
            <div className={`side-promo ${p.image ? 'side-promo-image' : ''}`} key={p.id}>
              {p.image ? (
                <img className="side-promo-img" src={p.image} alt={p.alt} />
              ) : (
                <>
                  <div className="side-promo-text">
                    <span>{p.title}</span>
                    <strong>{p.sub}</strong>
                    <button className="btn btn-gold side-promo-cta">{p.cta}</button>
                  </div>
                  <span className="side-promo-emoji">{p.emoji}</span>
                </>
              )}
            </div>
          ))}
        </div>
      </section>

      {gameCategories.map(({ id, label, icon }) => {
        const games = sections[id];
        if (!games || games.length === 0) return null;
        return <GameSection key={id} title={label} icon={iconByName[icon]} games={games} onPlay={onPlay} />;
      })}

      <section className="all-games-cta">
        <div className="all-games-cta-inner">
          <div>
            <span className="section-icon">
              <IconCards size={20} />
            </span>
            <div>
              <strong>Todos os Jogos</strong>
              <p>Explore o catálogo completo, com busca por nome.</p>
            </div>
          </div>
          <button type="button" className="btn btn-gold" onClick={onOpenAllGames}>
            Ver todos
          </button>
        </div>
      </section>

      <footer className="home-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <strong>CASSINO</strong>
            <p>A diversão mais emocionante do Brasil, com pagamentos rápidos via PIX.</p>
          </div>
          <span className="reg-badge">
            <span className="reg-dot" /> Plataforma Regulamentada
          </span>
        </div>
        <p className="footer-legal">
          Jogue com responsabilidade. Proibido para menores de 18 anos.
          Os jogos podem causar dependência. © {new Date().getFullYear()} Cassino.
        </p>
      </footer>
    </div>
  );
}
