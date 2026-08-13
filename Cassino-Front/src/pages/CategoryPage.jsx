import { useEffect, useState } from 'react';
import './Home.css';
import './CategoryPage.css';
import BannerCarousel from '../components/ui/BannerCarousel';
import GameCard from '../components/ui/GameCard';
import * as gamesApi from '../api/games';
import { ApiError } from '../api/http';
import { gameCategories } from '../data/mockData';
import { iconByName } from '../components/icons/Icons';

const PER_PAGE = 30;

export default function CategoryPage({ category, onPlay }) {
  const meta = gameCategories.find((c) => c.id === category);
  const Icon = meta ? iconByName[meta.icon] : null;

  const [games, setGames] = useState([]);
  const [pageMeta, setPageMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Troca rápida de categoria (usuário clicando pelas abas) não pode deixar
    // a resposta de uma categoria antiga sobrescrever a da atual — sem isso,
    // a resposta que chegar por último "vence", categoria certa ou não.
    let cancelled = false;

    setGames([]);
    setPageMeta(null);
    setLoading(true);
    setError(null);

    gamesApi
      .getGames({ category, page: 1, perPage: PER_PAGE })
      .then((res) => {
        if (cancelled) return;
        setGames(res.data);
        setPageMeta(res.meta);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : 'Não foi possível carregar os jogos.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [category]);

  const loadMore = () => {
    if (!pageMeta) return;
    setLoading(true);

    gamesApi
      .getGames({ category, page: pageMeta.current_page + 1, perPage: PER_PAGE })
      .then((res) => {
        setGames((list) => [...list, ...res.data]);
        setPageMeta(res.meta);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const hasMore = pageMeta && pageMeta.current_page < pageMeta.last_page;

  return (
    <div className="category-page">
      <BannerCarousel category={category} />

      <div className="home-section-label category-page-label">
        {Icon && <Icon size={16} />} {meta?.label ?? 'Jogos'}
      </div>

      {error && <p className="auth-error">{error}</p>}
      {!error && !loading && games.length === 0 && (
        <p className="auth-hint">Nenhum jogo nessa categoria ainda.</p>
      )}

      <div className="category-grid">
        {games.map((g) => (
          <GameCard key={g.id} game={g} onPlay={onPlay} />
        ))}
      </div>

      {hasMore && (
        <button className="btn btn-ghost category-more" onClick={loadMore} disabled={loading}>
          {loading ? 'Carregando...' : 'Carregar mais'}
        </button>
      )}
    </div>
  );
}
