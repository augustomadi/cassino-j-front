import { useEffect, useState } from 'react';
import './GamePlayer.css';
import { useAuth } from '../../auth/AuthContext';
import * as gamesApi from '../../api/games';
import { ApiError } from '../../api/http';
import { IconClose } from '../../components/icons/Icons';

export default function GamePlayer({ gameId, onClose }) {
  const { refreshBalance } = useAuth();
  const [launchUrl, setLaunchUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    gamesApi
      .launchGame(gameId)
      .then((res) => {
        if (!cancelled) setLaunchUrl(res.data.launch_url);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Não foi possível abrir o jogo.');
      });

    return () => {
      cancelled = true;
    };
  }, [gameId]);

  // Não existe evento confiável de "saiu do jogo" (ADR 0008) — o botão "Sair"
  // é o caminho garantido. pagehide é só um fallback best-effort para quando
  // o jogador fecha a aba direto: keepalive mantém a requisição viva mesmo
  // com a página sumindo, e a falha é engolida — o saldo continua visível
  // no provedor e o próximo saque recolhe ele de qualquer forma.
  useEffect(() => {
    const handlePageHide = () => {
      gamesApi.returnGameBalance({ keepalive: true }).catch(() => {});
    };
    window.addEventListener('pagehide', handlePageHide);
    return () => window.removeEventListener('pagehide', handlePageHide);
  }, []);

  const handleExit = async () => {
    try {
      await gamesApi.returnGameBalance();
    } catch {
      // saldo pode ser conferido depois; não bloqueia a saída do jogador
    } finally {
      refreshBalance();
      onClose();
    }
  };

  return (
    <section className="game-session">
      <div className="game-session-bar">
        <span className="game-session-title">Jogando</span>
        <button type="button" className="game-session-exit" onClick={handleExit}>
          <IconClose size={16} /> Sair
        </button>
      </div>

      <div className="game-session-frame">
        {error && (
          <div className="game-session-message">
            <p className="auth-error">{error}</p>
            <button type="button" className="btn btn-gold" onClick={handleExit}>
              Fechar
            </button>
          </div>
        )}

        {!error && !launchUrl && (
          <div className="game-session-message">
            <p className="auth-hint">Carregando jogo...</p>
          </div>
        )}

        {launchUrl && (
          <iframe
            className="game-session-iframe"
            src={launchUrl}
            allow="fullscreen"
            scrolling="no"
            title="Jogo"
          />
        )}
      </div>
    </section>
  );
}
