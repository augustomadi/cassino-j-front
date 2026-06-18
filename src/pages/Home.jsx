import './Home.css';
import cashbackImg from '../assets/promo-cashback.png';
import appImg from '../assets/promo-app.png';
import WinnersTicker from '../components/ui/WinnersTicker';
import TopWinners from '../components/ui/TopWinners';
import BannerCarousel from '../components/ui/BannerCarousel';
import GameSection from '../components/ui/GameSection';
import {
  popularGames,
  liveGames,
  crashGames,
  slotsGames,
  providers,
} from '../data/mockData';
import {
  IconFire,
  IconLive,
  IconPlane,
  IconSlots,
  IconGift,
  IconStar,
} from '../components/icons/Icons';

const sidePromos = [
  { id: 'app', image: appImg, alt: 'Baixe nosso APP' },
  { id: 'cb', image: cashbackImg, alt: 'Até 25% de cashback' },
];

export default function Home() {
  return (
    <div className="home">
      <WinnersTicker />

      <section className="home-top">
        <div className="home-top-main">
          <div className="home-section-label">
            <IconStar size={16} /> Top Ganhos da Semana
          </div>
          <TopWinners />
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

      <GameSection title="Populares" icon={IconFire} games={popularGames} />
      <GameSection title="Cassino ao Vivo" icon={IconLive} games={liveGames} />
      <GameSection title="Jogos Crash" icon={IconPlane} games={crashGames} />
      <GameSection title="Slots" icon={IconSlots} games={slotsGames} />

      <section className="providers">
        <h3 className="section-title providers-title">
          <span className="section-icon"><IconGift size={20} /></span>
          Nossos Provedores
        </h3>
        <div className="providers-grid">
          {providers.map((p) => (
            <div className="provider-chip" key={p}>{p}</div>
          ))}
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
