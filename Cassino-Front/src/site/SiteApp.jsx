import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import '../App.css';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import BottomNav from '../components/layout/BottomNav';
import Home from '../pages/Home';
import CategoryPage from '../pages/CategoryPage';
import Providers from '../pages/Providers';
import AuthModal from '../pages/auth/AuthModal';
import AccountModal from '../pages/account/AccountModal';
import DepositModal from '../pages/account/DepositModal';
import WithdrawalModal from '../pages/account/WithdrawalModal';
import GamePlayer from '../pages/game/GamePlayer';
import AllGamesDrawer from '../pages/game/AllGamesDrawer';
import { useAuth } from '../auth/AuthContext';

export default function SiteApp() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [authView, setAuthView] = useState(null); // null | 'login' | 'register'
  const [accountOpen, setAccountOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawalOpen, setWithdrawalOpen] = useState(false);
  const [playingGameId, setPlayingGameId] = useState(null);
  const { isAuthenticated, user, balanceCents, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const openDeposit = () => {
    if (!isAuthenticated) {
      setAuthView('login');
      return;
    }
    setDepositOpen(true);
  };

  const openWithdrawal = () => {
    if (!isAuthenticated) {
      setAuthView('login');
      return;
    }
    setWithdrawalOpen(true);
  };

  const playGame = (game) => {
    if (!isAuthenticated) {
      setAuthView('login');
      return;
    }
    setPlayingGameId(game.id);
  };

  const openAllGames = () => navigate('/todos-os-jogos');
  const search = (term) => navigate(`/todos-os-jogos?q=${encodeURIComponent(term)}`);

  // "Todos os Jogos" continua sendo um drawer sobre a tela de trás — só que
  // agora é a rota que decide se ele está aberto, em vez de um useState solto,
  // pra dar pra linkar direto (sidebar, busca da navbar, provedores).
  const allGamesOpen = location.pathname === '/todos-os-jogos';

  return (
    <div className="app">
      <Header
        onMenu={() => setMenuOpen(true)}
        loggedIn={isAuthenticated}
        userName={user?.name}
        balanceCents={balanceCents}
        inGame={!!playingGameId}
        onLogin={() => setAuthView('login')}
        onRegister={() => setAuthView('register')}
        onLogout={logout}
        onOpenAccount={() => setAccountOpen(true)}
        onDeposit={openDeposit}
        onWithdraw={openWithdrawal}
        onSearch={search}
      />
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="app-main">
        <div className="app-content">
          {playingGameId ? (
            <GamePlayer gameId={playingGameId} onClose={() => setPlayingGameId(null)} />
          ) : (
            <Routes>
              <Route path="/" element={<Home onPlay={playGame} onOpenAllGames={openAllGames} />} />
              <Route path="/cassino-ao-vivo" element={<CategoryPage category="cassino_ao_vivo" onPlay={playGame} />} />
              <Route path="/crash" element={<CategoryPage category="crash" onPlay={playGame} />} />
              <Route path="/roleta" element={<CategoryPage category="roleta" onPlay={playGame} />} />
              <Route path="/slots" element={<CategoryPage category="slots" onPlay={playGame} />} />
              <Route path="/provedores" element={<Providers />} />
              {/* Backdrop do drawer "Todos os Jogos" — a página de trás é a Home */}
              <Route path="/todos-os-jogos" element={<Home onPlay={playGame} onOpenAllGames={openAllGames} />} />
            </Routes>
          )}
        </div>
      </main>
      <BottomNav onMenu={() => setMenuOpen(true)} onDeposit={openDeposit} />
      {authView && <AuthModal initialView={authView} onClose={() => setAuthView(null)} />}
      {accountOpen && <AccountModal onClose={() => setAccountOpen(false)} />}
      {depositOpen && <DepositModal onClose={() => setDepositOpen(false)} />}
      {withdrawalOpen && <WithdrawalModal onClose={() => setWithdrawalOpen(false)} />}
      {allGamesOpen && <AllGamesDrawer onClose={() => navigate('/')} onPlay={playGame} />}
    </div>
  );
}
