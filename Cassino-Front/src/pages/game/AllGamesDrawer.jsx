import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import './AllGamesDrawer.css';
import GameCard from '../../components/ui/GameCard';
import * as gamesApi from '../../api/games';
import { ApiError } from '../../api/http';
import { IconClose, IconSearch } from '../../components/icons/Icons';

const PER_PAGE = 30;

export default function AllGamesDrawer({ onClose, onPlay }) {
  const [searchParams] = useSearchParams();
  // Seeds a partir da rota (busca da navbar manda `q`, "Provedores" manda
  // `provider`) — só na abertura do drawer, não fica ressincronizando.
  const [search, setSearch] = useState(() => searchParams.get('q') || '');
  const providerCode = searchParams.get('provider') || undefined;
  const [games, setGames] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const timeout = setTimeout(() => {
      gamesApi
        .getGames({ search: search || undefined, providerCode, page: 1, perPage: PER_PAGE })
        .then((res) => {
          setGames(res.data);
          setMeta(res.meta);
        })
        .catch((err) => {
          setGames([]);
          setMeta(null);
          setError(err instanceof ApiError ? err.message : 'Não foi possível carregar os jogos.');
        })
        .finally(() => setLoading(false));
    }, 300); // debounce da busca

    return () => clearTimeout(timeout);
  }, [search, providerCode]);

  const loadMore = () => {
    if (!meta) return;
    setLoading(true);

    gamesApi
      .getGames({ search: search || undefined, providerCode, page: meta.current_page + 1, perPage: PER_PAGE })
      .then((res) => {
        setGames((list) => [...list, ...res.data]);
        setMeta(res.meta);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const hasMore = meta && meta.current_page < meta.last_page;

  return (
    <>
      <div className="games-drawer-overlay" onClick={onClose} />
      <aside className="games-drawer">
        <div className="games-drawer-head">
          <strong>Todos os Jogos</strong>
          <button type="button" className="games-drawer-close" onClick={onClose} aria-label="Fechar">
            <IconClose size={18} />
          </button>
        </div>

        <div className="games-drawer-search">
          <IconSearch size={16} />
          <input
            type="text"
            placeholder="Buscar jogo..."
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="games-drawer-body">
          {error && <p className="auth-error">{error}</p>}
          {!error && games.length === 0 && !loading && <p className="auth-hint">Nenhum jogo encontrado.</p>}

          <div className="games-drawer-grid">
            {games.map((g) => (
              <GameCard key={g.id} game={g} onPlay={onPlay} />
            ))}
          </div>

          {hasMore && (
            <button className="btn btn-ghost games-drawer-more" onClick={loadMore} disabled={loading}>
              {loading ? 'Carregando...' : 'Carregar mais'}
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
