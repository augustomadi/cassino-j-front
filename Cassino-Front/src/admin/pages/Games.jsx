import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import StatCard from '../components/StatCard';
import * as adminGamesApi from '../../api/adminGames';
import * as adminUsersApi from '../../api/adminUsers';
import { ApiError } from '../../api/http';
import { fmtCents } from '../../utils/money';
import { IcGames, IcWallet, IcUsers, IcX } from '../components/AdminIcons';

export default function Games() {
  const [agentBalance, setAgentBalance] = useState(null);
  const [agentBalanceError, setAgentBalanceError] = useState(null);

  const [providers, setProviders] = useState([]);
  const [providersError, setProvidersError] = useState(null);

  const [providerCode, setProviderCode] = useState('');
  const [catalog, setCatalog] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState(null);

  const [userQuery, setUserQuery] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    adminGamesApi
      .getAgentBalance()
      .then((res) => setAgentBalance(res.data))
      .catch((err) => setAgentBalanceError(err instanceof ApiError ? err.message : 'Não foi possível consultar o saldo do agente.'));

    adminGamesApi
      .getProviders()
      .then((res) => setProviders(res.data))
      .catch((err) => setProvidersError(err instanceof ApiError ? err.message : 'Não foi possível listar os provedores.'));
  }, []);

  useEffect(() => {
    if (!providerCode) {
      setCatalog([]);
      setCatalogError(null);
      return;
    }

    setCatalogLoading(true);
    setCatalogError(null);
    adminGamesApi
      .getGames(providerCode)
      .then((res) => setCatalog(res.data))
      .catch((err) => {
        setCatalog([]);
        setCatalogError(err instanceof ApiError ? err.message : 'Não foi possível listar os jogos do provedor.');
      })
      .finally(() => setCatalogLoading(false));
  }, [providerCode]);

  useEffect(() => {
    if (!userQuery.trim()) {
      setUserResults([]);
      return;
    }

    const timeout = setTimeout(() => {
      adminUsersApi
        .listUsers({ search: userQuery })
        .then((res) => setUserResults(res.data))
        .catch(() => setUserResults([]));
    }, 300);

    return () => clearTimeout(timeout);
  }, [userQuery]);

  return (
    <AdminLayout title="Carteira de Jogos" subtitle="Console de integração com o provedor (modelo Transfer, ADR 0008)">
      {agentBalanceError ? (
        <div className="adm-card">
          <p style={{ color: 'var(--red-text)', margin: 0 }}>
            Saldo do agente indisponível: {agentBalanceError}
          </p>
        </div>
      ) : (
        <div className="adm-grid adm-kpis">
          <StatCard
            label="Saldo Total do Agente"
            value={agentBalance ? fmtCents(agentBalance.total_cents) : '—'}
            icon={IcWallet}
            tone="gold"
            hint="inclui o que está nas carteiras dos jogadores"
          />
          <StatCard
            label="Retido com Jogadores"
            value={agentBalance ? fmtCents(agentBalance.held_by_players_cents) : '—'}
            icon={IcUsers}
            tone="blue"
          />
          <StatCard
            label="Disponível para Transferir"
            value={agentBalance ? fmtCents(agentBalance.available_cents) : '—'}
            icon={IcGames}
            tone="green"
          />
        </div>
      )}

      <div className="adm-card" style={{ marginTop: 16 }}>
        <div className="adm-card-head">
          <h3>Catálogo do Provedor</h3>
        </div>

        {providersError && <p style={{ color: 'var(--red-text)' }}>{providersError}</p>}

        {!providersError && (
          <div className="adm-toolbar">
            <select className="adm-select" value={providerCode} onChange={(e) => setProviderCode(e.target.value)}>
              <option value="">Selecione um provedor...</option>
              {providers.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name} {p.available ? '' : '(indisponível)'}
                </option>
              ))}
            </select>
          </div>
        )}

        {catalogError && <p style={{ color: 'var(--red-text)' }}>{catalogError}</p>}
        {catalogLoading && <p style={{ color: 'var(--text-dim)' }}>Carregando catálogo...</p>}

        {providerCode && !catalogLoading && !catalogError && (
          <div className="adm-table-wrap" style={{ border: 'none' }}>
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Jogo</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {catalog.length === 0 && (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-dim)', padding: 28 }}>
                      Nenhum jogo retornado pelo provedor.
                    </td>
                  </tr>
                )}
                {catalog.map((g) => (
                  <tr key={g.game_code}>
                    <td className="t-sub">{g.game_code}</td>
                    <td>{g.game_name}</td>
                    <td>
                      <span className={`badge ${g.available ? 'green' : 'gray'}`}>
                        {g.available ? 'disponível' : 'indisponível'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="adm-card" style={{ marginTop: 16 }}>
        <div className="adm-card-head">
          <h3>Console por Jogador</h3>
        </div>
        <div className="adm-toolbar">
          <div className="adm-input">
            <input
              placeholder="Buscar jogador por nome, e-mail ou CPF..."
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
            />
          </div>
        </div>

        {userResults.length > 0 && (
          <div className="adm-table-wrap" style={{ border: 'none' }}>
            <table className="adm-table">
              <tbody>
                {userResults.map((u) => (
                  <tr key={u.id} onClick={() => setSelectedUserId(u.id)} style={{ cursor: 'pointer' }}>
                    <td>
                      <span className="t-name">
                        <span className="adm-mini-avatar">{u.name.charAt(0)}</span>
                        <span>
                          {u.name}
                          <span className="t-sub" style={{ display: 'block' }}>{u.email}</span>
                        </span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedUserId && (
        <PlayerGameConsole userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
      )}
    </AdminLayout>
  );
}

function PlayerGameConsole({ userId, onClose }) {
  const [account, setAccount] = useState(null);
  const [accountError, setAccountError] = useState(null);

  const [transferForm, setTransferForm] = useState(false);
  const [transferDirection, setTransferDirection] = useState('to_provider');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);

  const [drainConfirm, setDrainConfirm] = useState(false);
  const [drainLoading, setDrainLoading] = useState(false);

  const [launchForm, setLaunchForm] = useState(false);
  const [launchProviderCode, setLaunchProviderCode] = useState('');
  const [launchGameCode, setLaunchGameCode] = useState('');
  const [launchLoading, setLaunchLoading] = useState(false);
  const [launchUrl, setLaunchUrl] = useState(null);

  const [actionError, setActionError] = useState(null);

  const loadAccount = () => {
    adminGamesApi
      .getUserAccount(userId)
      .then((res) => {
        setAccount(res.data);
        setAccountError(null);
      })
      .catch((err) => setAccountError(err instanceof ApiError ? err.message : 'Não foi possível consultar a conta no provedor.'));
  };

  useEffect(loadAccount, [userId]);

  // Toda ação de dinheiro aqui é irreversível pelo front: nunca dispara
  // sozinha de novo em caso de erro, e a mensagem do backend já vem pronta
  // pra dizer se pode tentar de novo ou não (ADR 0008 — ProviderOutcomeUnknown).
  const submitTransfer = async (e) => {
    e.preventDefault();
    setTransferLoading(true);
    setActionError(null);
    const cents = Math.round(parseFloat(transferAmount.replace(',', '.')) * 100 || 0);
    try {
      await adminGamesApi.transferBalance(userId, { amountCents: cents, direction: transferDirection });
      setTransferForm(false);
      setTransferAmount('');
      loadAccount();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Não foi possível transferir o saldo.');
    } finally {
      setTransferLoading(false);
    }
  };

  const submitDrain = async () => {
    setDrainLoading(true);
    setActionError(null);
    try {
      await adminGamesApi.drainUser(userId);
      setDrainConfirm(false);
      loadAccount();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Não foi possível drenar a carteira.');
    } finally {
      setDrainLoading(false);
    }
  };

  const submitLaunch = async (e) => {
    e.preventDefault();
    setLaunchLoading(true);
    setActionError(null);
    setLaunchUrl(null);
    try {
      const res = await adminGamesApi.launchForUser(userId, {
        providerCode: launchProviderCode,
        gameCode: launchGameCode || undefined,
      });
      setLaunchUrl(res.data.launch_url);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Não foi possível abrir o jogo para o jogador.');
    } finally {
      setLaunchLoading(false);
    }
  };

  return (
    <>
      <div className="adm-drawer-overlay" onClick={onClose} />
      <aside className="adm-drawer">
        <div className="adm-drawer-head">
          <strong style={{ fontSize: '1.05rem' }}>Conta no provedor — jogador #{userId}</strong>
          <button className="adm-icon-action" onClick={onClose}><IcX size={16} /></button>
        </div>
        <div className="adm-drawer-body">
          {accountError && <p style={{ color: 'var(--red-text)' }}>{accountError}</p>}
          {!account && !accountError && <p style={{ color: 'var(--text-dim)' }}>Carregando...</p>}

          {account && (
            <>
              <div className="adm-kv">
                <div className="adm-kv-item"><small>Código no provedor</small><strong style={{ fontSize: '0.88rem' }}>{account.user_code}</strong></div>
                <div className="adm-kv-item"><small>Existe no provedor</small><strong>{account.exists_at_provider ? 'sim' : 'não'}</strong></div>
                <div className="adm-kv-item"><small>Saldo na carteira do site</small><strong>{fmtCents(account.wallet_balance_cents)}</strong></div>
                <div className="adm-kv-item"><small>Saldo no provedor</small><strong>{fmtCents(account.provider_balance_cents)}</strong></div>
                <div className="adm-kv-item"><small>Transferido (nosso registro)</small><strong>{fmtCents(account.transferred_cents)}</strong></div>
              </div>

              {actionError && <p style={{ color: 'var(--red-text)', fontSize: '0.85rem' }}>{actionError}</p>}

              {!transferForm && !drainConfirm && !launchForm && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
                  <button className="adm-btn adm-btn-gold" onClick={() => setTransferForm(true)}>
                    Transferir saldo
                  </button>
                  <button className="adm-btn adm-btn-ghost" onClick={() => setLaunchForm(true)}>
                    Abrir jogo por este jogador
                  </button>
                  <button className="adm-btn adm-btn-danger" onClick={() => setDrainConfirm(true)}>
                    Drenar carteira de jogo
                  </button>
                </div>
              )}

              {transferForm && (
                <form onSubmit={submitTransfer} style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div className="adm-field">
                    <label>Direção</label>
                    <select value={transferDirection} onChange={(e) => setTransferDirection(e.target.value)}>
                      <option value="to_provider">Site → Provedor</option>
                      <option value="from_provider">Provedor → Site</option>
                    </select>
                  </div>
                  <div className="adm-field">
                    <label>Valor (R$)</label>
                    <input required inputMode="decimal" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} />
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="adm-btn adm-btn-ghost" type="button" style={{ flex: 1 }} onClick={() => setTransferForm(false)} disabled={transferLoading}>
                      Cancelar
                    </button>
                    <button className="adm-btn adm-btn-gold" type="submit" style={{ flex: 1 }} disabled={transferLoading}>
                      {transferLoading ? 'Enviando...' : 'Confirmar transferência'}
                    </button>
                  </div>
                </form>
              )}

              {drainConfirm && (
                <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Isso zera a carteira do jogador no provedor e devolve o saldo pro site. Confirma?
                  </p>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="adm-btn adm-btn-ghost" type="button" style={{ flex: 1 }} onClick={() => setDrainConfirm(false)} disabled={drainLoading}>
                      Cancelar
                    </button>
                    <button className="adm-btn adm-btn-danger" type="button" style={{ flex: 1 }} onClick={submitDrain} disabled={drainLoading}>
                      {drainLoading ? 'Drenando...' : 'Confirmar drenagem'}
                    </button>
                  </div>
                </div>
              )}

              {launchForm && (
                <form onSubmit={submitLaunch} style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div className="adm-field">
                    <label>Código do provedor</label>
                    <input required value={launchProviderCode} onChange={(e) => setLaunchProviderCode(e.target.value)} />
                  </div>
                  <div className="adm-field">
                    <label>Código do jogo (opcional — em branco abre o lobby)</label>
                    <input value={launchGameCode} onChange={(e) => setLaunchGameCode(e.target.value)} />
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="adm-btn adm-btn-ghost" type="button" style={{ flex: 1 }} onClick={() => { setLaunchForm(false); setLaunchUrl(null); }} disabled={launchLoading}>
                      Cancelar
                    </button>
                    <button className="adm-btn adm-btn-gold" type="submit" style={{ flex: 1 }} disabled={launchLoading}>
                      {launchLoading ? 'Abrindo...' : 'Abrir jogo'}
                    </button>
                  </div>
                  {launchUrl && (
                    <div className="adm-field">
                      <label>URL da sessão</label>
                      <input readOnly value={launchUrl} onFocus={(e) => e.target.select()} />
                    </div>
                  )}
                </form>
              )}
            </>
          )}
        </div>
      </aside>
    </>
  );
}
