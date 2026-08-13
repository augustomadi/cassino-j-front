import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import StatCard from '../components/StatCard';
import ConfirmModal from '../components/ConfirmModal';
import * as adminWithdrawalsApi from '../../api/adminWithdrawals';
import { ApiError } from '../../api/http';
import { fmtCents } from '../../utils/money';
import { IcWallet, IcTransactions, IcAlert } from '../components/AdminIcons';

const STATUS_LABEL = {
  awaiting_approval: 'Aguardando aprovação',
  paid: 'Pago',
  rejected: 'Recusado',
  cancelled: 'Cancelado',
};
const STATUS_TONE = {
  awaiting_approval: 'gold',
  paid: 'green',
  rejected: 'red',
  cancelled: 'gray',
};

const KYC_LABEL = {
  approved: 'KYC aprovado',
  pending: 'KYC em análise',
  rejected: 'KYC recusado',
  not_submitted: 'KYC não enviado',
};
const KYC_TONE = {
  approved: 'green',
  pending: 'gold',
  rejected: 'red',
  not_submitted: 'red',
};

export default function Withdrawals() {
  const [tab, setTab] = useState('queue');

  return (
    <AdminLayout title="Saques" subtitle="Fila de aprovação e limite automático">
      <div className="adm-tabs" style={{ marginBottom: 16 }}>
        <button className={`adm-tab ${tab === 'queue' ? 'is-active' : ''}`} onClick={() => setTab('queue')}>Fila de Saques</button>
        <button className={`adm-tab ${tab === 'limit' ? 'is-active' : ''}`} onClick={() => setTab('limit')}>Limite Automático</button>
      </div>

      {tab === 'queue' && <QueueTab />}
      {tab === 'limit' && <AutoLimitTab />}
    </AdminLayout>
  );
}

function QueueTab() {
  const [status, setStatus] = useState('awaiting_approval');
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewing, setReviewing] = useState(null); // saque sendo aprovado/recusado
  const [detailLoading, setDetailLoading] = useState(false);
  const [reason, setReason] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const load = (page = 1) => {
    setLoading(true);
    adminWithdrawalsApi
      .listWithdrawals({ status, page })
      .then((res) => {
        setRows(res.data);
        setMeta(res.meta);
        setError(null);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Não foi possível carregar os saques.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(1), [status]);

  const openReview = (w) => {
    setReviewing(w);
    setShowReject(false);
    setShowApproveConfirm(false);
    setReason('');

    // A linha da fila já tem o essencial (valor, chave); busca o detalhe
    // completo (status de KYC, total depositado) só ao abrir, não pra cada
    // linha da lista.
    setDetailLoading(true);
    adminWithdrawalsApi
      .getWithdrawal(w.id)
      .then((res) => setReviewing((cur) => (cur?.id === w.id ? { ...cur, ...res.data } : cur)))
      .catch(() => {})
      .finally(() => setDetailLoading(false));
  };

  const approve = async () => {
    setActionLoading(true);
    setError(null);
    try {
      await adminWithdrawalsApi.approveWithdrawal(reviewing.id);
      setReviewing(null);
      setShowApproveConfirm(false);
      load(meta?.current_page || 1);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível aprovar.');
      setShowApproveConfirm(false);
    } finally {
      setActionLoading(false);
    }
  };

  const reject = async () => {
    setActionLoading(true);
    setError(null);
    try {
      await adminWithdrawalsApi.rejectWithdrawal(reviewing.id, reason);
      setReviewing(null);
      load(meta?.current_page || 1);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível recusar.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <div className="adm-toolbar">
        <select className="adm-select" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="awaiting_approval">Aguardando aprovação</option>
          <option value="paid">Pagos</option>
          <option value="rejected">Recusados</option>
          <option value="cancelled">Cancelados</option>
        </select>
      </div>

      {error && !reviewing && <p style={{ color: 'var(--red-text)', marginBottom: 12 }}>{error}</p>}

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Jogador</th>
              <th>Valor</th>
              <th>Chave PIX</th>
              <th>Modo</th>
              <th>Status</th>
              <th>Data</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {!loading && rows.length === 0 && (
              <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-dim)', padding: 28 }}>Nada por aqui.</td></tr>
            )}
            {rows.map((w) => (
              <tr key={w.id}>
                <td>
                  <span className="t-name">
                    <span className="adm-mini-avatar">{w.user.name?.charAt(0) || '?'}</span>
                    <span>{w.user.name}<span className="t-sub" style={{ display: 'block' }}>{w.user.email}</span></span>
                  </span>
                </td>
                <td className="num"><strong>{fmtCents(w.amount_cents)}</strong></td>
                <td className="t-sub">{w.destination?.key_type}: {w.destination?.key}</td>
                <td className="t-sub">{w.payment_mode === 'automatic' ? 'automático' : w.payment_mode === 'manual' ? 'manual' : '—'}</td>
                <td><span className={`badge ${STATUS_TONE[w.status]}`}>{STATUS_LABEL[w.status]}</span></td>
                <td className="t-sub">{w.created_at ? new Date(w.created_at).toLocaleString('pt-BR') : '—'}</td>
                <td>
                  {w.status === 'awaiting_approval' && (
                    <button className="adm-btn adm-btn-gold adm-btn-sm" onClick={() => openReview(w)}>Analisar</button>
                  )}
                </td>
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

      {reviewing && (
        <div className="adm-drawer-overlay" onClick={() => setReviewing(null)}>
          <aside className="adm-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="adm-drawer-head">
              <strong>Saque de {reviewing.user.name}</strong>
            </div>
            <div className="adm-drawer-body">
              {error && <p style={{ color: 'var(--red-text)' }}>{error}</p>}
              <div className="adm-kv">
                <div className="adm-kv-item"><small>Valor</small><strong>{fmtCents(reviewing.amount_cents)}</strong></div>
                <div className="adm-kv-item"><small>Chave PIX ({reviewing.destination?.key_type})</small><strong>{reviewing.destination?.key}</strong></div>
                <div className="adm-kv-item"><small>E-mail</small><strong>{reviewing.user.email}</strong></div>
              </div>

              <div className="adm-kv" style={{ marginTop: 10 }}>
                <div className="adm-kv-item">
                  <small>Verificação de identidade</small>
                  {detailLoading && !reviewing.user.kyc_status ? (
                    <strong style={{ color: 'var(--text-dim)' }}>Carregando...</strong>
                  ) : (
                    <span className={`badge ${KYC_TONE[reviewing.user.kyc_status] || 'gray'}`}>
                      {KYC_LABEL[reviewing.user.kyc_status] || 'Desconhecido'}
                    </span>
                  )}
                </div>
                <div className="adm-kv-item">
                  <small>Total depositado</small>
                  <strong>{detailLoading && reviewing.total_deposited_cents == null ? '...' : fmtCents(reviewing.total_deposited_cents ?? 0)}</strong>
                </div>
              </div>

              {!showReject ? (
                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                  <button className="adm-btn adm-btn-danger" style={{ flex: 1 }} onClick={() => setShowReject(true)}>Recusar</button>
                  <button className="adm-btn adm-btn-gold" style={{ flex: 1 }} onClick={() => setShowApproveConfirm(true)} disabled={actionLoading}>
                    Aprovar e pagar
                  </button>
                </div>
              ) : (
                <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div className="adm-field">
                    <label>Motivo da recusa</label>
                    <input value={reason} onChange={(e) => setReason(e.target.value)} />
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="adm-btn adm-btn-ghost" style={{ flex: 1 }} onClick={() => setShowReject(false)}>Voltar</button>
                    <button className="adm-btn adm-btn-danger" style={{ flex: 1 }} onClick={reject} disabled={actionLoading || reason.trim().length < 5}>
                      {actionLoading ? 'Recusando...' : 'Confirmar recusa'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

      {showApproveConfirm && reviewing && (
        <ConfirmModal
          title="Aprovar e pagar saque"
          message={`Confirma o envio de ${fmtCents(reviewing.amount_cents)} para a chave PIX "${reviewing.destination?.key}"? Essa ação debita o caixa e não pode ser desfeita.`}
          confirmLabel="Aprovar e pagar"
          tone="gold"
          loading={actionLoading}
          onConfirm={approve}
          onCancel={() => setShowApproveConfirm(false)}
        />
      )}
    </div>
  );
}

function AutoLimitTab() {
  const [cycle, setCycle] = useState(null);
  const [history, setHistory] = useState(null);
  const [error, setError] = useState(null);
  const [newLimit, setNewLimit] = useState('');
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const load = () => {
    adminWithdrawalsApi.getAutoLimit().then((res) => setCycle(res.data)).catch((err) => setError(err instanceof ApiError ? err.message : 'Erro ao carregar.'));
    adminWithdrawalsApi.getAutoLimitHistory({}).then((res) => setHistory(res.data)).catch(() => setHistory([]));
  };

  useEffect(load, []);

  const askConfirm = (e) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const submit = async () => {
    setSaving(true);
    setError(null);
    const cents = Math.round(parseFloat(newLimit.replace(',', '.')) * 100 || 0);
    try {
      await adminWithdrawalsApi.setAutoLimit(cents);
      setNewLimit('');
      setShowConfirm(false);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível definir o limite.');
      setShowConfirm(false);
    } finally {
      setSaving(false);
    }
  };

  if (!cycle) return <p style={{ color: 'var(--text-dim)' }}>{error || 'Carregando...'}</p>;

  return (
    <div>
      <div className="adm-grid adm-kpis">
        <StatCard label="Limite do ciclo" value={fmtCents(cycle.limit_cents)} icon={IcWallet} tone="purple" />
        <StatCard label="Consumido" value={fmtCents(cycle.consumed_cents)} icon={IcTransactions} tone="gold" />
        <StatCard label="Restante" value={fmtCents(cycle.remaining_cents)} icon={IcTransactions} tone="green" />
        <StatCard label="Status" value={cycle.is_locked ? 'Travado' : 'Liberado'} icon={IcAlert} tone={cycle.is_locked ? 'red' : 'green'} hint={cycle.exhausted_at ? `travou em ${new Date(cycle.exhausted_at).toLocaleString('pt-BR')}` : undefined} />
      </div>

      <div className="adm-grid adm-cols-2" style={{ marginTop: 16 }}>
        <div className="adm-card">
          <div className="adm-card-head"><h3>Definir novo limite</h3></div>
          <form onSubmit={askConfirm} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {error && <p style={{ color: 'var(--red-text)' }}>{error}</p>}
            <div className="adm-field">
              <label>Novo limite (R$) — zera o consumo e inicia um ciclo novo</label>
              <input type="text" inputMode="decimal" required value={newLimit} onChange={(e) => setNewLimit(e.target.value)} />
              <small style={{ color: 'var(--text-dim)' }}>Não pode exceder o saldo em conta do cassino.</small>
            </div>
            <button className="adm-btn adm-btn-gold" type="submit" disabled={saving}>{saving ? 'Definindo...' : 'Definir limite'}</button>
          </form>
        </div>

        <div className="adm-card">
          <div className="adm-card-head"><h3>Histórico de ciclos</h3></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {history === null && <p style={{ color: 'var(--text-dim)' }}>Carregando...</p>}
            {history?.map((c) => (
              <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '8px 0', borderBottom: '1px solid var(--border-soft)' }}>
                <span>
                  {fmtCents(c.limit_cents)} <span className={`badge ${c.status === 'active' ? 'green' : 'gray'}`}>{c.status === 'active' ? 'ativo' : 'substituído'}</span>
                  <span className="t-sub" style={{ display: 'block', fontSize: '0.74rem' }}>
                    {c.created_by?.name || '—'} · {c.created_at ? new Date(c.created_at).toLocaleString('pt-BR') : ''}
                  </span>
                </span>
                <strong>{fmtCents(c.consumed_cents)} usado</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showConfirm && (
        <ConfirmModal
          title="Definir novo limite automático"
          message={`Isso encerra o ciclo atual (consumido: ${fmtCents(cycle.consumed_cents)}) e inicia um novo com limite de ${fmtCents(Math.round(parseFloat(newLimit.replace(',', '.')) * 100 || 0))}. Não pode ser desfeito.`}
          confirmLabel="Definir limite"
          tone="gold"
          loading={saving}
          onConfirm={submit}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}
