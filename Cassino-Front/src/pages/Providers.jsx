import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import './Providers.css';
import * as gamesApi from '../api/games';
import { ApiError } from '../api/http';
import { IconProvider } from '../components/icons/Icons';

export default function Providers() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    gamesApi
      .getGameProviders()
      .then((res) => setProviders(res.data))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Não foi possível listar os provedores.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="providers-page">
      <div className="home-section-label">
        <IconProvider size={16} /> Provedores
      </div>

      {error && <p className="auth-error">{error}</p>}
      {!error && loading && <p className="auth-hint">Carregando provedores...</p>}

      <div className="providers-grid">
        {providers.map((p) => (
          <Link key={p.code} to={`/todos-os-jogos?provider=${p.code}`} className="provider-card">
            <span className="provider-card-icon">
              <IconProvider size={22} />
            </span>
            <span className="provider-card-name">{p.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
