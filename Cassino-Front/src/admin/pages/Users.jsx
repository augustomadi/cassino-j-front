import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import StatCard from '../components/StatCard';
import * as adminUsersApi from '../../api/adminUsers';
import { ApiError } from '../../api/http';
import { fmtCents } from '../../utils/money';
import { TRANSACTION_TYPE_LABELS } from '../../utils/transactionLabels';
import { IcUsers, IcX } from '../components/AdminIcons';

const statusTone = { active: 'green', blocked: 'red' };
const statusLabel = { active: 'ativo', blocked: 'bloqueado' };

const KYC_LABEL = {
  approved: 'aprovado',
  pending: 'em análise',
  rejected: 'recusado',
  not_submitted: 'não enviado',
};
const KYC_TONE = {
  approved: 'green',
  pending: 'gold',
  rejected: 'red',
  not_submitted: 'gray',
};

export default function Users() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('todos');
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const load = (page = 1) => {
    setLoading(true);
    adminUsersApi
      .listUsers({ search: query || undefined, status: status === 'todos' ? undefined : status, page })
      .then((res) => {
        setRows(res.data);
        setMeta(res.meta);
        setError(null);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Não foi possível carregar os usuários.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timeout = setTimeout(() => load(1), 300); // debounce da busca
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, status]);

  return (
    <AdminLayout title="Usuários" subtitle={meta ? `${meta.total} usuários cadastrados` : 'Carregando...'}>
      <div className="adm-grid adm-kpis">
        <StatCard label="Total de Usuários" value={meta ? meta.total : '—'} icon={IcUsers} tone="purple" />
      </div>

      <div style={{ marginTop: 20 }}>
        <div className="adm-toolbar">
          <div className="adm-input">
            <input placeholder="Buscar por nome, e-mail ou CPF..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <select className="adm-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="todos">Todos os status</option>
            <option value="active">Ativos</option>
            <option value="blocked">Bloqueados</option>
          </select>
        </div>

        {error && <p style={{ color: 'var(--red-text)', marginBottom: 12 }}>{error}</p>}

        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Usuário</th>
                <th>CPF</th>
                <th>E-mail verificado</th>
                <th>2FA</th>
                <th>KYC</th>
                <th>Status</th>
                <th>Cadastro</th>
              </tr>
            </thead>
            <tbody>
              {!loading && rows.length === 0 && (
                <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-dim)', padding: 28 }}>Nenhum usuário encontrado.</td></tr>
              )}
              {rows.map((u) => (
                <tr key={u.id} onClick={() => setSelectedId(u.id)} style={{ cursor: 'pointer' }}>
                  <td>
                    <span className="t-name">
                      <span className="adm-mini-avatar">{u.name.charAt(0)}</span>
                      <span>
                        {u.name}
                        <span className="t-sub" style={{ display: 'block' }}>{u.email}</span>
                      </span>
                    </span>
                  </td>
                  <td className="t-sub">{u.cpf_masked}</td>
                  <td><span className={`badge ${u.email_verified ? 'green' : 'gray'}`}>{u.email_verified ? 'verificado' : 'pendente'}</span></td>
                  <td><span className={`badge ${u.two_factor_enabled ? 'green' : 'gray'}`}>{u.two_factor_enabled ? 'ativo' : 'inativo'}</span></td>
                  <td><span className={`badge ${KYC_TONE[u.kyc_status] || 'gray'}`}>{KYC_LABEL[u.kyc_status] || u.kyc_status}</span></td>
                  <td><span className={`badge ${statusTone[u.status]}`}>{statusLabel[u.status] || u.status}</span></td>
                  <td className="t-sub">{u.created_at ? new Date(u.created_at).toLocaleDateString('pt-BR') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {meta && meta.last_page > 1 && (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 14 }}>
            <button className="adm-btn adm-btn-ghost adm-btn-sm" disabled={meta.current_page <= 1} onClick={() => load(meta.current_page - 1)}>Anterior</button>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem', alignSelf: 'center' }}>{meta.current_page} / {meta.last_page}</span>
            <button className="adm-btn adm-btn-ghost adm-btn-sm" disabled={meta.current_page >= meta.last_page} onClick={() => load(meta.current_page + 1)}>Próxima</button>
          </div>
        )}
      </div>

      {selectedId && (
        <UserDrawer
          userId={selectedId}
          onClose={() => setSelectedId(null)}
          onChanged={load}
        />
      )}
    </AdminLayout>
  );
}

function UserDrawer({ userId, onClose, onChanged }) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [txMeta, setTxMeta] = useState(null);

  const [statusForm, setStatusForm] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);

  const [adjustForm, setAdjustForm] = useState(false);
  const [adjustSign, setAdjustSign] = useState('credit'); // credit | debit
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustLoading, setAdjustLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  const loadUser = () => {
    adminUsersApi
      .getUser(userId)
      .then((res) => setUser(res.data))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Não foi possível carregar o usuário.'));
  };

  const loadTx = (page = 1) => {
    adminUsersApi
      .getUserTransactions(userId, { page })
      .then((res) => {
        setTransactions((list) => (page === 1 ? res.data : [...list, ...res.data]));
        setTxMeta(res.meta);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadUser();
    loadTx(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const submitStatus = async (e) => {
    e.preventDefault();
    setStatusLoading(true);
    setActionError(null);
    const nextStatus = user.status === 'blocked' ? 'active' : 'blocked';
    try {
      await adminUsersApi.setUserStatus(userId, {
        status: nextStatus,
        reason: nextStatus === 'blocked' ? blockReason : undefined,
      });
      setStatusForm(false);
      setBlockReason('');
      loadUser();
      onChanged();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Não foi possível alterar o status.');
    } finally {
      setStatusLoading(false);
    }
  };

  const submitAdjust = async (e) => {
    e.preventDefault();
    setAdjustLoading(true);
    setActionError(null);
    const cents = Math.round(parseFloat(adjustAmount.replace(',', '.')) * 100 || 0);
    const signedCents = adjustSign === 'debit' ? -Math.abs(cents) : Math.abs(cents);
    try {
      await adminUsersApi.adjustUserBalance(userId, {
        amountCents: signedCents,
        reason: adjustReason,
        idempotencyKey: crypto.randomUUID(),
      });
      setAdjustForm(false);
      setAdjustAmount('');
      setAdjustReason('');
      loadUser();
      loadTx(1);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Não foi possível ajustar o saldo.');
    } finally {
      setAdjustLoading(false);
    }
  };

  const hasMoreTx = txMeta && txMeta.current_page < txMeta.last_page;

  return (
    <>
      <div className="adm-drawer-overlay" onClick={onClose} />
      <aside className="adm-drawer">
        <div className="adm-drawer-head">
          {user && (
            <div className="t-name">
              <span className="adm-mini-avatar" style={{ width: 44, height: 44, fontSize: '1rem' }}>{user.name.charAt(0)}</span>
              <div>
                <strong style={{ fontSize: '1.05rem' }}>{user.name}</strong>
                <span className="t-sub" style={{ display: 'block' }}>{user.email}</span>
              </div>
            </div>
          )}
          <button className="adm-icon-action" onClick={onClose}><IcX size={16} /></button>
        </div>
        <div className="adm-drawer-body">
          {error && <p style={{ color: 'var(--red-text)' }}>{error}</p>}
          {!user && !error && <p style={{ color: 'var(--text-dim)' }}>Carregando...</p>}

          {user && (
            <>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span className={`badge ${statusTone[user.status]}`}>{statusLabel[user.status] || user.status}</span>
                <span className={`badge ${user.email_verified ? 'green' : 'gray'}`}>e-mail {user.email_verified ? 'verificado' : 'pendente'}</span>
                <span className={`badge ${user.two_factor_enabled ? 'green' : 'gray'}`}>2FA {user.two_factor_enabled ? 'ativo' : 'inativo'}</span>
                <span className={`badge ${KYC_TONE[user.kyc_status] || 'gray'}`}>KYC {KYC_LABEL[user.kyc_status] || user.kyc_status}</span>
                <span className="badge gray">ID {user.id}</span>
              </div>

              {user.blocked_reason && (
                <p style={{ color: 'var(--red-text)', fontSize: '0.85rem', marginTop: 10 }}>
                  Motivo do bloqueio: {user.blocked_reason}
                </p>
              )}

              <div className="adm-kv">
                <div className="adm-kv-item"><small>Saldo atual</small><strong>{fmtCents(user.balance_cents)}</strong></div>
                <div className="adm-kv-item"><small>CPF</small><strong>{user.cpf_masked}</strong></div>
                <div className="adm-kv-item"><small>Telefone</small><strong>{user.phone || '—'}</strong></div>
                <div className="adm-kv-item"><small>Afiliado de origem</small><strong style={{ fontSize: '0.88rem' }}>{user.affiliate?.name || '—'}</strong></div>
                <div className="adm-kv-item"><small>Código de indicação</small><strong style={{ fontSize: '0.88rem' }}>{user.referral_code || '—'}</strong></div>
                <div className="adm-kv-item"><small>Último acesso</small><strong style={{ fontSize: '0.82rem' }}>{user.last_login_at ? new Date(user.last_login_at).toLocaleString('pt-BR') : '—'}</strong></div>
              </div>

              {actionError && <p style={{ color: 'var(--red-text)', fontSize: '0.85rem' }}>{actionError}</p>}

              {!statusForm && !adjustForm && (
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button className="adm-btn adm-btn-gold" style={{ flex: 1 }} onClick={() => setAdjustForm(true)}>
                    Ajustar saldo
                  </button>
                  <button className="adm-btn adm-btn-danger" style={{ flex: 1 }} onClick={() => setStatusForm(true)}>
                    {user.status === 'blocked' ? 'Desbloquear' : 'Bloquear'}
                  </button>
                </div>
              )}

              {statusForm && (
                <form onSubmit={submitStatus} style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {user.status !== 'blocked' && (
                    <div className="adm-field">
                      <label>Motivo do bloqueio</label>
                      <input required value={blockReason} onChange={(e) => setBlockReason(e.target.value)} />
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="adm-btn adm-btn-ghost" type="button" style={{ flex: 1 }} onClick={() => setStatusForm(false)}>
                      Cancelar
                    </button>
                    <button className="adm-btn adm-btn-danger" type="submit" style={{ flex: 1 }} disabled={statusLoading}>
                      {statusLoading ? 'Enviando...' : user.status === 'blocked' ? 'Confirmar desbloqueio' : 'Confirmar bloqueio'}
                    </button>
                  </div>
                </form>
              )}

              {adjustForm && (
                <form onSubmit={submitAdjust} style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div className="adm-field">
                    <label>Tipo</label>
                    <select value={adjustSign} onChange={(e) => setAdjustSign(e.target.value)}>
                      <option value="credit">Creditar</option>
                      <option value="debit">Debitar</option>
                    </select>
                  </div>
                  <div className="adm-field">
                    <label>Valor (R$) — máx. {fmtCents(500000)} por operação</label>
                    <input required inputMode="decimal" value={adjustAmount} onChange={(e) => setAdjustAmount(e.target.value)} />
                  </div>
                  <div className="adm-field">
                    <label>Justificativa</label>
                    <input required minLength={5} value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)} />
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="adm-btn adm-btn-ghost" type="button" style={{ flex: 1 }} onClick={() => setAdjustForm(false)}>
                      Cancelar
                    </button>
                    <button className="adm-btn adm-btn-gold" type="submit" style={{ flex: 1 }} disabled={adjustLoading}>
                      {adjustLoading ? 'Enviando...' : 'Confirmar ajuste'}
                    </button>
                  </div>
                </form>
              )}

              <div className="adm-card-head" style={{ marginTop: 18 }}>
                <h3>Extrato</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {transactions.length === 0 && <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Nenhuma movimentação.</p>}
                {transactions.map((t) => (
                  <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: '0.85rem' }}>
                    <span>
                      {TRANSACTION_TYPE_LABELS[t.type] || t.type}
                      <span className="t-sub" style={{ display: 'block', fontSize: '0.74rem' }}>
                        {t.created_at ? new Date(t.created_at).toLocaleString('pt-BR') : ''}
                      </span>
                    </span>
                    <strong className={t.amount_cents >= 0 ? 'pos' : 'neg'}>
                      {t.amount_cents >= 0 ? '+' : ''}
                      {fmtCents(t.amount_cents)}
                    </strong>
                  </div>
                ))}
                {hasMoreTx && (
                  <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => loadTx(txMeta.current_page + 1)}>
                    Carregar mais
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
