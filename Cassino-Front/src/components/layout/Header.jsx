import { useState } from 'react';
import './Header.css';
import { IconMenu, IconSearch, IconLogo, IconCoin } from '../icons/Icons';
import { fmtCents } from '../../utils/money';

export default function Header({
  onMenu,
  loggedIn,
  userName,
  balanceCents,
  inGame,
  onLogin,
  onRegister,
  onLogout,
  onOpenAccount,
  onDeposit,
  onWithdraw,
  onSearch,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');

  const closeMenu = () => setMenuOpen(false);

  const submitSearch = (e) => {
    e.preventDefault();
    const term = query.trim();
    if (term) onSearch?.(term);
  };

  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-left">
          <button className="icon-btn header-menu" onClick={onMenu} aria-label="Abrir menu">
            <IconMenu />
          </button>
          <a className="brand" href="#">
            <IconLogo size={30} />
            <span className="brand-name">CASSINO</span>
          </a>
        </div>

        <form className="header-search" onSubmit={submitSearch}>
          <IconSearch size={18} />
          <input
            type="text"
            placeholder="Buscar jogos, provedores, tags..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>

        <div className="header-right">
          {loggedIn ? (
            <>
              <div className="balance">
                <span className="balance-label">Saldo</span>
                <span className={`money balance-value${inGame ? ' balance-value-ingame' : ''}`}>
                  {inGame
                    ? 'Em jogo'
                    : balanceCents === null || balanceCents === undefined
                      ? '—'
                      : fmtCents(balanceCents)}
                </span>
              </div>
              <button className="btn btn-gold header-deposit" onClick={onDeposit}>
                <IconCoin size={18} />
                <span className="header-deposit-label">Depositar</span>
              </button>
              <div className="account-menu">
                <button
                  className="avatar"
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-label="Conta"
                  title={userName}
                >
                  <span>{userName ? userName.charAt(0).toUpperCase() : 'A'}</span>
                </button>
                {menuOpen && (
                  <>
                    <button className="account-menu-backdrop" onClick={closeMenu} aria-label="Fechar menu" />
                    <div className="account-menu-panel">
                      {userName && <span className="account-menu-name">{userName}</span>}
                      <button
                        className="account-menu-item"
                        onClick={() => {
                          closeMenu();
                          onOpenAccount();
                        }}
                      >
                        Minha conta
                      </button>
                      <button
                        className="account-menu-item"
                        onClick={() => {
                          closeMenu();
                          onWithdraw();
                        }}
                      >
                        Sacar
                      </button>
                      <button
                        className="account-menu-item account-menu-item-danger"
                        onClick={() => {
                          closeMenu();
                          onLogout();
                        }}
                      >
                        Sair
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <button className="btn btn-ghost" onClick={onLogin}>
                Entrar
              </button>
              <button className="btn btn-gold" onClick={onRegister}>
                Cadastrar
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
