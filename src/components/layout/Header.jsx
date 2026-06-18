import './Header.css';
import { IconMenu, IconSearch, IconLogo, IconCoin } from '../icons/Icons';
import { fmtBRL } from '../../data/mockData';

export default function Header({ onMenu, loggedIn, balance, onToggleAuth }) {
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

        <div className="header-search">
          <IconSearch size={18} />
          <input type="text" placeholder="Buscar jogos, provedores, tags..." />
        </div>

        <div className="header-right">
          {loggedIn ? (
            <>
              <div className="balance">
                <span className="balance-label">Saldo</span>
                <span className="money balance-value">{fmtBRL(balance)}</span>
              </div>
              <button className="btn btn-gold header-deposit">
                <IconCoin size={18} />
                <span className="header-deposit-label">Depositar</span>
              </button>
              <button className="avatar" onClick={onToggleAuth} aria-label="Conta">
                <span>A</span>
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-ghost" onClick={onToggleAuth}>
                Entrar
              </button>
              <button className="btn btn-gold" onClick={onToggleAuth}>
                Cadastrar
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
