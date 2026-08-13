import { useEffect, useRef, useState } from 'react';
import './BannerCarousel.css';
import { banners } from '../../data/mockData';

export default function BannerCarousel({ category } = {}) {
  const [idx, setIdx] = useState(0);
  const touchStartX = useRef(null);

  // Sem `category` (Home), mostra tudo. Numa página de categoria, mostra os
  // banners genéricos (`categories: []`) + os marcados pra essa categoria.
  const items = category
    ? banners.filter((b) => b.categories.length === 0 || b.categories.includes(category))
    : banners;

  useEffect(() => {
    setIdx(0);
  }, [category]);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % items.length), 5000);
    return () => clearInterval(t);
  }, [items.length]);

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 48) {
      setIdx((i) => delta > 0
        ? (i + 1) % items.length
        : (i - 1 + items.length) % items.length
      );
    }
    touchStartX.current = null;
  };

  return (
    <div className="banner-wrap">
      <div className="banner-viewport" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="banner-track" style={{ transform: `translateX(-${idx * 100}%)` }}>
          {items.map((b) => (
            <div
              className={`banner-slide${b.image ? ' banner-slide--image' : ''}`}
              key={b.id}
              style={b.image ? undefined : { background: b.grad }}
            >
              {b.image ? (
                <img className="banner-img" src={b.image} alt={b.highlight} />
              ) : (
                <>
                  <div className="banner-content">
                    <span className="banner-title">{b.title}</span>
                    <strong className="banner-highlight">{b.highlight}</strong>
                    <p className="banner-sub">{b.sub}</p>
                    <button className="btn btn-gold banner-cta">{b.cta}</button>
                  </div>
                  <span className="banner-emoji">{b.emoji}</span>
                  <span className="banner-glow" />
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="banner-dots">
        {items.map((_, i) => (
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
