import { useEffect, useState } from 'react';
import './BannerCarousel.css';
import { banners } from '../../data/mockData';

export default function BannerCarousel() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="banner-wrap">
      <div className="banner-viewport">
        <div className="banner-track" style={{ transform: `translateX(-${idx * 100}%)` }}>
          {banners.map((b) => (
            <div className="banner-slide" key={b.id} style={{ background: b.grad }}>
              <div className="banner-content">
                <span className="banner-title">{b.title}</span>
                <strong className="banner-highlight">{b.highlight}</strong>
                <p className="banner-sub">{b.sub}</p>
                <button className="btn btn-gold banner-cta">{b.cta}</button>
              </div>
              <span className="banner-emoji">{b.emoji}</span>
              <span className="banner-glow" />
            </div>
          ))}
        </div>
      </div>
      <div className="banner-dots">
        {banners.map((_, i) => (
          <button
            key={i}
            className={`banner-dot ${i === idx ? 'is-active' : ''}`}
            onClick={() => setIdx(i)}
            aria-label={`Banner ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
