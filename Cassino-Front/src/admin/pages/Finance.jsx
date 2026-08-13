import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import { BarChart, Donut } from '../components/Charts';
import * as adminFinanceApi from '../../api/adminFinance';
import * as adminCashApi from '../../api/adminCashAccount';
import { ApiError } from '../../api/http';
import { fmtCents } from '../../utils/money';
import { IcWallet, IcFinance, IcPlus, IcEdit, IcTransactions } from '../components/AdminIcons';

const DONUT_COLORS = ['var(--green-500)', 'var(--gold-500)', 'var(--purple-500)', 'var(--orange-500)', 'var(--blue-500)'];

const EXPENSE_CATEGORIES = {
  marketing: 'Marketing e aquisição',
  salaries: 'Folha e prestadores',
  infrastructure: 'Infraestrutura e tecnologia',
  licensing: 'Licenças e regulatório',
  payment_fees: 'Taxas de gateway e bancárias',
  other: 'Outras',
};

const emptyExpenseForm = { category: 'other', description: '', amount: '', incurred_on: new Date().toISOString().slice(0, 10) };

export default function Finance() {
  const [tab, setTab] = useState('overview');

  return (
    <AdminLayout title="Financeiro" subtitle="Lucro, despesas, caixa e métodos de pagamento">
      <div className="adm-tabs" style={{ marginBottom: 16 }}>
        <button className={`adm-tab ${tab === 'overview' ? 'is-active' : ''}`} onClick={() => setTab('overview')}>Visão Geral</button>
        <button className={`adm-tab ${tab === 'cash' ? 'is-active' : ''}`} onClick={() => setTab('cash')}>Conta do Cassino</button>
      </div>

      {tab === 'overview' && <OverviewTab />}
      {tab === 'cash' && <CashAccountTab />}
    </AdminLayout>
  );
}

function OverviewTab() {
  const [kpis, setKpis] = useState(null);
  const [pnl, setPnl] = useState(null);
  const [methods, setMethods] = useState(null);
  const [expenses, setExpenses] = useState(null);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  const [modal, setModal] = useState(null); // 'new' | despesa
  const [form, setForm] = useState(emptyExpenseForm);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(null); // despesa a excluir
  const [deleting, setDeleting] = useState(false);

  const loadExpenses = () => {
    adminFinanceApi
      .getExpenses({})
      .then((res) => {
        setExpenses(res.data);
        setSummary(res.summary);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Erro ao carregar despesas.'));
  };

  useEffect(() => {
    adminFinanceApi.getFinanceKpis().then((res) => setKpis(res.data)).catch((err) => setError(err instanceof ApiError ? err.message : 'Erro ao carregar KPIs.'));
    adminFinanceApi.getFinancePnl(12).then((res) => setPnl(res.data)).catch(() => setPnl([]));
    adminFinanceApi.getFinancePaymentMethods(30).then((res) => setMethods(res.data)).catch(() => setMethods([]));
    loadExpenses();
  }, []);

  const openNew = () => {
    setForm(emptyExpenseForm);
    setFormError(null);
    setModal('new');
  };

  const openEdit = (e) => {
    setForm({
      category: e.category,
      description: e.description,
      amount: (e.amount_cents / 100).toString(),
      incurred_on: e.incurred_on,
    });
    setFormError(null);
    setModal(e);
  };

  const save = async () => {
    setSaving(true);
    setFormError(null);
    const payload = {
      category: form.category,
      description: form.description,
      amountCents: Math.round(parseFloat(form.amount.replace(',', '.')) * 100 || 0),
      incurredOn: form.incurred_on,
    };
    try {
      if (modal === 'new') {
        await adminFinanceApi.createExpense(payload);
      } else {
        await adminFinanceApi.updateExpense(modal.id, {
          category: payload.category,
          description: payload.description,
          amount_cents: payload.amountCents,
          incurred_on: payload.incurredOn,
        });
      }
      setModal(null);
      loadExpenses();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setDeleting(true);
    try {
      await adminFinanceApi.deleteExpense(removing.id);
      setRemoving(null);
      loadExpenses();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível remover.');
      setRemoving(null);
    } finally {
      setDeleting(false);
    }
  };

  const chartData = (pnl || []).map((m) => ({ month: m.month.slice(5), revenue: m.revenue_cents ?? 0, expenses: m.expense_cents }));
  const donutData = (methods || []).map((m, i) => ({ name: m.label, value: Math.round(m.share * 1000) / 10, color: DONUT_COLORS[i % DONUT_COLORS.length] }));
  const totalExpenses = (summary || []).reduce((s, c) => s + c.amount_cents, 0);

  return (
    <>
      {error && <p style={{ color: 'var(--red-text)', marginBottom: 16 }}>{error}</p>}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button className="adm-btn adm-btn-gold" onClick={openNew}><IcPlus size={16} /> Nova despesa</button>
      </div>

      {!kpis ? (
        <p style={{ color: 'var(--text-dim)' }}>Carregando...</p>
      ) : (
        <>
          <div className="adm-grid adm-kpis">
            <StatCard label={`Receita (${kpis.year})`} value={kpis.revenue_cents == null ? '—' : fmtCents(kpis.revenue_cents)} icon={IcFinance} tone="green" hint={kpis.requires_games_module ? 'disponível quando os jogos existirem' : undefined} />
            <StatCard label={`Despesas (${kpis.year})`} value={fmtCents(kpis.expense_cents)} icon={IcFinance} tone="gold" />
            <StatCard label="Lucro Líquido" value={kpis.net_profit_cents == null ? '—' : fmtCents(kpis.net_profit_cents)} icon={IcFinance} tone="purple" hint={kpis.margin == null ? undefined : `margem ${(kpis.margin * 100).toFixed(1)}%`} />
          </div>

          <div className="adm-grid adm-cols-2" style={{ marginTop: 16 }}>
            <div className="adm-card">
              <div className="adm-card-head"><h3>Receita x Despesas (mensal)</h3></div>
              {kpis.requires_games_module && (
                <p style={{ color: 'var(--text-dim)', fontSize: '0.78rem', marginBottom: 8 }}>
                  Receita (verde) ainda não existe — módulo de jogos pendente. Barras mostram R$0, não é receita real.
                </p>
              )}
              {chartData.length > 0 ? <BarChart data={chartData} /> : <p style={{ color: 'var(--text-dim)' }}>Sem dados.</p>}
            </div>
            <div className="adm-card">
              <div className="adm-card-head"><h3>Métodos de Pagamento (30 dias)</h3></div>
              {donutData.length > 0 ? <Donut data={donutData} /> : <p style={{ color: 'var(--text-dim)' }}>Sem depósitos no período.</p>}
            </div>
          </div>

          <div className="adm-grid adm-cols-2" style={{ marginTop: 16 }}>
            <div className="adm-card">
              <div className="adm-card-head">
                <h3>Despesas por Categoria (ano)</h3>
                <span className="adm-link">{fmtCents(totalExpenses)}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {(summary || []).length === 0 && <p style={{ color: 'var(--text-dim)' }}>Nenhuma despesa lançada.</p>}
                {(summary || []).map((c) => {
                  const pct = totalExpenses > 0 ? (c.amount_cents / totalExpenses) * 100 : 0;
                  return (
                    <div key={c.category}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.88rem' }}>
                        <span>{c.label} <span className="badge gray" style={{ marginLeft: 4 }}>{c.count}</span></span>
                        <strong className="num">{fmtCents(c.amount_cents)}</strong>
                      </div>
                      <div className="adm-progress"><span style={{ width: `${pct}%` }} /></div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="adm-card">
              <div className="adm-card-head"><h3>Lançamentos recentes</h3></div>
              <div className="adm-table-wrap" style={{ border: 'none' }}>
                <table className="adm-table">
                  <thead><tr><th>Descrição</th><th>Valor</th><th>Data</th><th></th></tr></thead>
                  <tbody>
                    {expenses === null && <tr><td colSpan="4" style={{ color: 'var(--text-dim)', textAlign: 'center' }}>Carregando...</td></tr>}
                    {expenses?.length === 0 && <tr><td colSpan="4" style={{ color: 'var(--text-dim)', textAlign: 'center' }}>Nenhuma despesa ainda.</td></tr>}
                    {expenses?.map((e) => (
                      <tr key={e.id}>
                        <td>{e.description}<span className="t-sub" style={{ display: 'block' }}>{e.category_label}</span></td>
                        <td className="num">{fmtCents(e.amount_cents)}</td>
                        <td className="t-sub">{e.incurred_on ? new Date(e.incurred_on).toLocaleDateString('pt-BR') : '—'}</td>
                        <td style={{ display: 'flex', gap: 6 }}>
                          <button className="adm-icon-action" onClick={() => openEdit(e)} aria-label="Editar"><IcEdit size={14} /></button>
                          <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => setRemoving(e)}>Remover</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {modal && (
        <Modal
          title={modal === 'new' ? 'Nova Despesa' : 'Editar Despesa'}
          onClose={() => setModal(null)}
          footer={
            <>
              <button className="adm-btn adm-btn-ghost" onClick={() => setModal(null)}>Cancelar</button>
              <button className="adm-btn adm-btn-gold" onClick={save} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
            </>
          }
        >
          {formError && <p style={{ color: 'var(--red-text)', marginBottom: 12 }}>{formError}</p>}
          <div className="adm-field">
            <label>Categoria</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {Object.entries(EXPENSE_CATEGORIES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
          <div className="adm-field">
            <label>Descrição</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="adm-field">
            <label>Valor (R$)</label>
            <input type="text" inputMode="decimal" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          </div>
          <div className="adm-field">
            <label>Data de competência</label>
            <input type="date" max={new Date().toISOString().slice(0, 10)} value={form.incurred_on} onChange={(e) => setForm({ ...form, incurred_on: e.target.value })} />
          </div>
        </Modal>
      )}

      {removing && (
        <ConfirmModal
          title="Remover despesa"
          message={`Remover "${removing.description}" (${fmtCents(removing.amount_cents)}) do relatório? O registro continua no histórico, só sai da lista.`}
          confirmLabel="Remover"
          tone="danger"
          loading={deleting}
          onConfirm={remove}
          onCancel={() => setRemoving(null)}
        />
      )}
    </>
  );
}

function CashAccountTab() {
  const [account, setAccount] = useState(null);
  const [adjustments, setAdjustments] = useState(null);
  const [error, setError] = useState(null);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const load = () => {
    adminCashApi.getCashAccount().then((res) => setAccount(res.data)).catch((err) => setError(err instanceof ApiError ? err.message : 'Erro ao carregar.'));
    adminCashApi.getCashAccountAdjustments({}).then((res) => setAdjustments(res.data)).catch(() => setAdjustments([]));
  };

  useEffect(load, []);

  const askConfirm = (e) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const submit = async () => {
    setSaving(true);
    setError(null);
    const cents = Math.round(parseFloat(amount.replace(',', '.')) * 100 || 0);
    try {
      await adminCashApi.adjustCashAccount({ amountCents: cents, reason });
      setAmount('');
      setReason('');
      setShowConfirm(false);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível ajustar o caixa.');
      setShowConfirm(false);
    } finally {
      setSaving(false);
    }
  };

  if (!account) return <p style={{ color: 'var(--text-dim)' }}>{error || 'Carregando...'}</p>;

  const cents = Math.round(parseFloat(amount.replace(',', '.')) * 100 || 0);

  return (
    <div>
      <div className="adm-grid adm-kpis">
        <StatCard label="Saldo em Caixa" value={fmtCents(account.balance_cents)} icon={IcWallet} tone="blue" />
        <StatCard label="Total Depositado" value={fmtCents(account.total_deposits_cents)} icon={IcTransactions} tone="green" />
        <StatCard label="Total Sacado" value={fmtCents(account.total_withdrawals_cents)} icon={IcTransactions} tone="gold" />
      </div>

      <div className="adm-grid adm-cols-2" style={{ marginTop: 16 }}>
        <div className="adm-card">
          <div className="adm-card-head"><h3>Ajuste manual</h3></div>
          <form onSubmit={askConfirm} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {error && <p style={{ color: 'var(--red-text)' }}>{error}</p>}
            <div className="adm-field">
              <label>Valor (R$) — positivo credita, negativo debita</label>
              <input type="text" inputMode="decimal" required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Ex.: -500 ou 1000" />
            </div>
            <div className="adm-field">
              <label>Motivo</label>
              <input required minLength={5} value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
            <button className="adm-btn adm-btn-gold" type="submit" disabled={saving}>{saving ? 'Enviando...' : 'Registrar ajuste'}</button>
          </form>
        </div>

        <div className="adm-card">
          <div className="adm-card-head"><h3>Histórico de ajustes manuais</h3></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {adjustments === null && <p style={{ color: 'var(--text-dim)' }}>Carregando...</p>}
            {adjustments?.length === 0 && <p style={{ color: 'var(--text-dim)' }}>Nenhum ajuste manual ainda.</p>}
            {adjustments?.map((m) => (
              <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '8px 0', borderBottom: '1px solid var(--border-soft)' }}>
                <span>
                  {m.reason}
                  <span className="t-sub" style={{ display: 'block', fontSize: '0.74rem' }}>
                    {m.performed_by?.name || '—'} · {m.created_at ? new Date(m.created_at).toLocaleString('pt-BR') : ''}
                  </span>
                </span>
                <strong className={m.amount_cents >= 0 ? 'pos' : 'neg'}>{m.amount_cents >= 0 ? '+' : ''}{fmtCents(m.amount_cents)}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showConfirm && (
        <ConfirmModal
          title="Registrar ajuste no caixa"
          message={`Confirma ${cents >= 0 ? 'creditar' : 'debitar'} ${fmtCents(Math.abs(cents))} no caixa? Motivo: "${reason}".`}
          confirmLabel="Registrar ajuste"
          tone="gold"
          loading={saving}
          onConfirm={submit}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}
