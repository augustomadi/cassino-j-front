import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import * as adminAffiliatesApi from '../../api/adminAffiliates';
import { ApiError } from '../../api/http';
import { fmtCents } from '../../utils/money';
import { referralLink } from '../../utils/apiRoot';
import {
  IcAffiliates, IcPlus, IcEdit, IcCopy, IcCheck, IcUsers, IcX,
} from '../components/AdminIcons';

const emptyForm = { name: '', email: '', commissionPct: 20 };
const currentPeriod = () => new Date().toISOString().slice(0, 7);

export default function Affiliates() {
  const [rows, setRows] = useState([]);
  const [pageInfo, setPageInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(null);

  const [newModal, setNewModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  const [selectedId, setSelectedId] = useState(null);

  const load = (page = 1) => {
    setLoading(true);
    adminAffiliatesApi
      .listAffiliates({ page })
      .then((res) => {
        setRows(res.data);
        setPageInfo({ current_page: res.current_page, last_page: res.last_page, total: res.total });
        setError(null);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Não foi possível carregar os afiliados.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(1), []);

  const copy = (text, id) => {
    navigator.clipboard?.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  const openNew = () => {
    setForm(emptyForm);
    setFormError(null);
    setNewModal(true);
  };

  const submitNew = async () => {
    setSaving(true);
    setFormError(null);
    try {
      await adminAffiliatesApi.createAffiliate({
        name: form.name,
        email: form.email,
        commissionRateBp: Math.round(Number(form.commissionPct) * 100),
      });
      setNewModal(false);
      load(1);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Não foi possível criar o afiliado.');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (a) => {
    try {
      await adminAffiliatesApi.updateAffiliate(a.id, { status: a.status === 'active' ? 'paused' : 'active' });
      load(pageInfo?.current_page || 1);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `Não foi possível alterar o status de ${a.name}.`);
    }
  };

  const totalReferrals = rows.reduce((s, a) => s + (a.referrals_count || 0), 0);
  const totalCommission = rows.reduce((s, a) => s + (a.current_period_commission_cents || 0), 0);

  return (
    <AdminLayout
      title="Afiliados"
      subtitle="Gerencie parceiros, links de indicação e comissões"
      actions={<button className="adm-btn adm-btn-gold" onClick={openNew}><IcPlus size={16} /> Novo afiliado</button>}
    >
      <div className="adm-grid adm-kpis">
        <StatCard label="Total de Afiliados" value={pageInfo?.total ?? '—'} icon={IcAffiliates} tone="purple" />
        <StatCard label="Cadastros via Afiliados (página)" value={totalReferrals} icon={IcUsers} tone="blue" />
        <StatCard label="Comissão do Mês (página)" value={fmtCents(totalCommission)} icon={IcAffiliates} tone="gold" hint="soma dos afiliados listados aqui" />
      </div>

      {error && <p style={{ color: 'var(--red-text)', margin: '16px 0' }}>{error}</p>}

      <div style={{ marginTop: 20 }}>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Afiliado</th>
                <th>Link de indicação</th>
                <th>Comissão</th>
                <th>Cliques</th>
                <th>Cadastros</th>
                <th>Comissão do mês</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {!loading && rows.length === 0 && (
                <tr><td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-dim)', padding: 28 }}>Nenhum afiliado cadastrado.</td></tr>
              )}
              {rows.map((a) => {
                const link = referralLink(a.code);
                return (
                  <tr key={a.id}>
                    <td onClick={() => setSelectedId(a.id)} style={{ cursor: 'pointer' }}>
                      <span className="t-name">
                        <span className="adm-mini-avatar">{a.name.charAt(0)}</span>
                        <span>
                          {a.name}
                          <span className="t-sub" style={{ display: 'block' }}>@{a.code}</span>
                        </span>
                      </span>
                    </td>
                    <td>
                      <span className="adm-copylink">
                        <code>{link}</code>
                        <button className="adm-icon-action" onClick={() => copy(link, a.id)} aria-label="Copiar link">
                          {copied === a.id ? <IcCheck size={14} /> : <IcCopy size={14} />}
                        </button>
                      </span>
                    </td>
                    <td className="num"><strong style={{ color: 'var(--gold-400)' }}>{(a.commission_rate_bp / 100).toFixed(2)}%</strong></td>
                    <td className="num">{a.clicks_count}</td>
                    <td className="num">{a.referrals_count}</td>
                    <td className="num">{a.current_period_commission_cents != null ? fmtCents(a.current_period_commission_cents) : '—'}</td>
                    <td>
                      <button className={`badge ${a.status === 'active' ? 'green' : 'gray'}`} onClick={() => toggleStatus(a)} style={{ cursor: 'pointer' }}>
                        {a.status === 'active' ? 'ativo' : 'pausado'}
                      </button>
                    </td>
                    <td>
                      <button className="adm-icon-action" onClick={() => setSelectedId(a.id)} aria-label="Gerenciar">
                        <IcEdit size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {pageInfo && pageInfo.last_page > 1 && (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 14 }}>
            <button
              className="adm-btn adm-btn-ghost adm-btn-sm"
              disabled={pageInfo.current_page <= 1}
              onClick={() => load(pageInfo.current_page - 1)}
            >
              Anterior
            </button>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem', alignSelf: 'center' }}>
              {pageInfo.current_page} / {pageInfo.last_page}
            </span>
            <button
              className="adm-btn adm-btn-ghost adm-btn-sm"
              disabled={pageInfo.current_page >= pageInfo.last_page}
              onClick={() => load(pageInfo.current_page + 1)}
            >
              Próxima
            </button>
          </div>
        )}
      </div>

      {newModal && (
        <Modal
          title="Novo Afiliado"
          onClose={() => setNewModal(false)}
          footer={
            <>
              <button className="adm-btn adm-btn-ghost" onClick={() => setNewModal(false)}>Cancelar</button>
              <button className="adm-btn adm-btn-gold" onClick={submitNew} disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </>
          }
        >
          {formError && <p style={{ color: 'var(--red-text)', marginBottom: 12 }}>{formError}</p>}
          <div className="adm-field">
            <label>Nome do afiliado</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex.: Canal do Tigre" />
          </div>
          <div className="adm-field">
            <label>E-mail (opcional)</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="adm-field">
            <label>Comissão (% sobre a perda dos indicados): <strong style={{ color: 'var(--gold-400)' }}>{form.commissionPct}%</strong></label>
            <input
              type="range"
              min="1"
              max="60"
              step="0.5"
              value={form.commissionPct}
              onChange={(e) => setForm({ ...form, commissionPct: e.target.value })}
            />
          </div>
        </Modal>
      )}

      {selectedId && (
        <AffiliateDrawer affiliateId={selectedId} onClose={() => setSelectedId(null)} onChanged={() => load(pageInfo?.current_page || 1)} />
      )}
    </AdminLayout>
  );
}

function AffiliateDrawer({ affiliateId, onClose, onChanged }) {
  const [tab, setTab] = useState('overview');
  const [affiliate, setAffiliate] = useState(null);
  const [error, setError] = useState(null);

  const loadAffiliate = () => {
    adminAffiliatesApi
      .getAffiliate(affiliateId)
      .then((res) => setAffiliate(res.data))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Não foi possível carregar o afiliado.'));
  };

  useEffect(loadAffiliate, [affiliateId]);

  return (
    <>
      <div className="adm-drawer-overlay" onClick={onClose} />
      <aside className="adm-drawer">
        <div className="adm-drawer-head">
          {affiliate && (
            <div className="t-name">
              <span className="adm-mini-avatar" style={{ width: 44, height: 44, fontSize: '1rem' }}>{affiliate.name.charAt(0)}</span>
              <div>
                <strong style={{ fontSize: '1.05rem' }}>{affiliate.name}</strong>
                <span className="t-sub" style={{ display: 'block' }}>@{affiliate.code}</span>
              </div>
            </div>
          )}
          <button className="adm-icon-action" onClick={onClose}><IcX size={16} /></button>
        </div>
        <div className="adm-drawer-body">
          {error && <p style={{ color: 'var(--red-text)' }}>{error}</p>}
          {!affiliate && !error && <p style={{ color: 'var(--text-dim)' }}>Carregando...</p>}

          {affiliate && (
            <>
              <div className="security-tabs" style={{ marginBottom: 16 }}>
                <button className={tab === 'overview' ? 'is-active' : ''} onClick={() => setTab('overview')}>Visão geral</button>
                <button className={tab === 'referrals' ? 'is-active' : ''} onClick={() => setTab('referrals')}>Indicados</button>
                <button className={tab === 'statements' ? 'is-active' : ''} onClick={() => setTab('statements')}>Fechamentos</button>
                <button className={tab === 'payouts' ? 'is-active' : ''} onClick={() => setTab('payouts')}>Pagamentos</button>
              </div>

              {tab === 'overview' && (
                <OverviewPanel
                  affiliate={affiliate}
                  onSaved={(updated) => {
                    setAffiliate((prev) => ({ ...prev, ...updated }));
                    onChanged();
                  }}
                />
              )}
              {tab === 'referrals' && <ReferralsPanel affiliateId={affiliateId} />}
              {tab === 'statements' && <StatementsPanel affiliateId={affiliateId} />}
              {tab === 'payouts' && <PayoutsPanel affiliateId={affiliateId} />}
            </>
          )}
        </div>
      </aside>
    </>
  );
}

function OverviewPanel({ affiliate, onSaved }) {
  const [name, setName] = useState(affiliate.name);
  const [email, setEmail] = useState(affiliate.email || '');
  const [commissionPct, setCommissionPct] = useState(affiliate.commission_rate_bp / 100);
  const [status, setStatus] = useState(affiliate.status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  const link = referralLink(affiliate.code);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await adminAffiliatesApi.updateAffiliate(affiliate.id, {
        name,
        email: email || null,
        commission_rate_bp: Math.round(Number(commissionPct) * 100),
        status,
      });
      onSaved(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {error && <p style={{ color: 'var(--red-text)' }}>{error}</p>}
      {saved && <p style={{ color: 'var(--green-400)' }}>Salvo.</p>}

      <div className="adm-kv">
        <div className="adm-kv-item"><small>Link de indicação</small><strong style={{ fontSize: '0.78rem', wordBreak: 'break-all' }}>{link}</strong></div>
        <div className="adm-kv-item"><small>Cliques</small><strong>{affiliate.clicks_count}</strong></div>
        <div className="adm-kv-item"><small>Cadastros</small><strong>{affiliate.referrals_count}</strong></div>
        <div className="adm-kv-item"><small>Criado em</small><strong style={{ fontSize: '0.82rem' }}>{affiliate.created_at ? new Date(affiliate.created_at).toLocaleDateString('pt-BR') : '—'}</strong></div>
      </div>

      <div className="adm-field">
        <label>Nome</label>
        <input required value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="adm-field">
        <label>E-mail</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="adm-field">
        <label>Comissão (%)</label>
        <input type="number" min="0.01" max="100" step="0.01" required value={commissionPct} onChange={(e) => setCommissionPct(e.target.value)} />
        <small style={{ color: 'var(--text-dim)' }}>Mudança de percentual não afeta períodos já fechados.</small>
      </div>
      <div className="adm-field">
        <label>Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="active">Ativo</option>
          <option value="paused">Pausado</option>
        </select>
      </div>
      <button className="adm-btn adm-btn-gold" type="submit" disabled={saving}>
        {saving ? 'Salvando...' : 'Salvar alterações'}
      </button>
    </form>
  );
}

function ReferralsPanel({ affiliateId }) {
  const [players, setPlayers] = useState(null);
  const [pageInfo, setPageInfo] = useState(null);
  const [error, setError] = useState(null);

  const load = (page = 1) => {
    adminAffiliatesApi
      .getAffiliateReferrals(affiliateId, { page })
      .then((res) => {
        if (page === 1) setPlayers(res.data);
        else setPlayers((prev) => [...(prev || []), ...res.data]);
        setPageInfo({ current_page: res.current_page, last_page: res.last_page });
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Não foi possível carregar os indicados.'));
  };

  useEffect(() => load(1), [affiliateId]);

  if (error) return <p style={{ color: 'var(--red-text)' }}>{error}</p>;
  if (players === null) return <p style={{ color: 'var(--text-dim)' }}>Carregando...</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {players.length === 0 && <p style={{ color: 'var(--text-dim)' }}>Nenhum jogador indicado ainda.</p>}
      {players.map((p) => (
        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '8px 0', borderBottom: '1px solid var(--border-soft)' }}>
          <span>
            {p.name}
            <span className="t-sub" style={{ display: 'block', fontSize: '0.74rem' }}>
              {p.registered_at ? new Date(p.registered_at).toLocaleDateString('pt-BR') : ''} · <span className={`badge ${p.status === 'active' ? 'green' : 'red'}`}>{p.status}</span>
            </span>
          </span>
          <strong>{fmtCents(p.balance_cents)}</strong>
        </div>
      ))}
      {pageInfo && pageInfo.current_page < pageInfo.last_page && (
        <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => load(pageInfo.current_page + 1)}>
          Carregar mais
        </button>
      )}
    </div>
  );
}

const statementStatusTone = { open: 'gold', closed: 'blue', paid: 'green' };
const statementStatusLabel = { open: 'aberto', closed: 'fechado', paid: 'pago' };

function StatementsPanel({ affiliateId }) {
  const [period, setPeriod] = useState(currentPeriod());
  const [statement, setStatement] = useState(null);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [note, setNote] = useState('');
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [showPayConfirm, setShowPayConfirm] = useState(false);

  const loadHistory = () => {
    adminAffiliatesApi
      .getAffiliateStatements(affiliateId)
      .then((res) => setHistory(res.data))
      .catch(() => setHistory([]));
  };

  useEffect(loadHistory, [affiliateId]);

  const consult = (p = period) => {
    setLoading(true);
    setError(null);
    adminAffiliatesApi
      .getAffiliateStatement(affiliateId, p)
      .then((res) => {
        setStatement(res.data);
        setPeriod(p);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Não foi possível apurar esse período.'))
      .finally(() => setLoading(false));
  };

  const close = async () => {
    setActionLoading(true);
    setError(null);
    try {
      const res = await adminAffiliatesApi.closeAffiliateStatement(affiliateId, period);
      setStatement(res.data);
      setShowCloseConfirm(false);
      loadHistory();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível fechar o período.');
      setShowCloseConfirm(false);
    } finally {
      setActionLoading(false);
    }
  };

  const pay = async () => {
    setActionLoading(true);
    setError(null);
    try {
      const res = await adminAffiliatesApi.payAffiliateStatement(affiliateId, period, note);
      setStatement(res.data);
      setNote('');
      setShowPayConfirm(false);
      loadHistory();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível registrar o pagamento.');
      setShowPayConfirm(false);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          className="thm-color-hex"
          style={{ flex: 1 }}
          placeholder="YYYY-MM"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        />
        <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => consult()} disabled={loading}>
          {loading ? 'Apurando...' : 'Consultar'}
        </button>
      </div>

      {error && <p style={{ color: 'var(--red-text)' }}>{error}</p>}

      {statement && (
        <div className="adm-kv">
          <div className="adm-kv-item"><small>Status</small><strong><span className={`badge ${statementStatusTone[statement.status]}`}>{statementStatusLabel[statement.status]}</span></strong></div>
          <div className="adm-kv-item"><small>Base (perda apurada)</small><strong>{fmtCents(statement.basis_amount_cents)}</strong></div>
          <div className="adm-kv-item"><small>Comissão bruta</small><strong>{fmtCents(statement.gross_commission_cents)}</strong></div>
          <div className="adm-kv-item"><small>Carry-over anterior</small><strong>{fmtCents(statement.carry_over_in_cents)}</strong></div>
          <div className="adm-kv-item"><small>Carry-over p/ próximo mês</small><strong>{fmtCents(statement.carry_over_out_cents)}</strong></div>
          <div className="adm-kv-item"><small>Comissão líquida</small><strong style={{ color: 'var(--gold-400)' }}>{fmtCents(statement.net_commission_cents)}</strong></div>
          {statement.status === 'paid' && (
            <div className="adm-kv-item"><small>Pago em</small><strong>{statement.paid_at ? new Date(statement.paid_at).toLocaleString('pt-BR') : '—'}</strong></div>
          )}
        </div>
      )}

      {statement?.status === 'open' && (
        <button className="adm-btn adm-btn-danger" onClick={() => setShowCloseConfirm(true)} disabled={actionLoading}>
          Fechar período (irreversível)
        </button>
      )}

      {statement?.status === 'closed' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="adm-field">
            <label>Observação do pagamento (opcional)</label>
            <input value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <button className="adm-btn adm-btn-gold" onClick={() => setShowPayConfirm(true)} disabled={actionLoading || statement.net_commission_cents <= 0}>
            Registrar pagamento
          </button>
          {statement.net_commission_cents <= 0 && <small style={{ color: 'var(--text-dim)' }}>Sem comissão a pagar neste período.</small>}
        </div>
      )}

      {showCloseConfirm && (
        <ConfirmModal
          title="Fechar período"
          message={`Fechar o período ${period}? A comissão líquida (${statement ? fmtCents(statement.net_commission_cents) : '—'}) fica travada para pagamento e não pode ser reaberta.`}
          confirmLabel="Fechar período"
          tone="danger"
          loading={actionLoading}
          onConfirm={close}
          onCancel={() => setShowCloseConfirm(false)}
        />
      )}

      {showPayConfirm && (
        <ConfirmModal
          title="Registrar pagamento"
          message={`Confirma o pagamento de ${statement ? fmtCents(statement.net_commission_cents) : '—'} referente a ${period}?`}
          confirmLabel="Registrar pagamento"
          tone="gold"
          loading={actionLoading}
          onConfirm={pay}
          onCancel={() => setShowPayConfirm(false)}
        />
      )}

      <div className="adm-card-head" style={{ marginTop: 6 }}><h3>Histórico</h3></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {history === null && <p style={{ color: 'var(--text-dim)' }}>Carregando...</p>}
        {history?.length === 0 && <p style={{ color: 'var(--text-dim)' }}>Nenhum fechamento ainda.</p>}
        {history?.map((s) => (
          <button
            key={s.period}
            onClick={() => consult(s.period)}
            style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '8px 0', borderBottom: '1px solid var(--border-soft)', textAlign: 'left' }}
          >
            <span>{s.period} <span className={`badge ${statementStatusTone[s.status]}`}>{statementStatusLabel[s.status]}</span></span>
            <strong>{fmtCents(s.net_commission_cents)}</strong>
          </button>
        ))}
      </div>
    </div>
  );
}

function PayoutsPanel({ affiliateId }) {
  const [payouts, setPayouts] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminAffiliatesApi
      .getAffiliatePayouts(affiliateId)
      .then((res) => setPayouts(res.data))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Não foi possível carregar os pagamentos.'));
  }, [affiliateId]);

  if (error) return <p style={{ color: 'var(--red-text)' }}>{error}</p>;
  if (payouts === null) return <p style={{ color: 'var(--text-dim)' }}>Carregando...</p>;
  if (payouts.length === 0) return <p style={{ color: 'var(--text-dim)' }}>Nenhum pagamento registrado ainda.</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {payouts.map((p) => (
        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '8px 0', borderBottom: '1px solid var(--border-soft)' }}>
          <span>
            {p.paid_at ? new Date(p.paid_at).toLocaleString('pt-BR') : '—'}
            {p.note && <span className="t-sub" style={{ display: 'block', fontSize: '0.74rem' }}>{p.note}</span>}
          </span>
          <strong style={{ color: 'var(--green-400)' }}>{fmtCents(p.amount_cents)}</strong>
        </div>
      ))}
    </div>
  );
}
