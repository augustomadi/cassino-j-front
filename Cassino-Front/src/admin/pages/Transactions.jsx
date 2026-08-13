import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import * as adminTxApi from '../../api/adminTransactions';
import { ApiError } from '../../api/http';
import { fmtCents } from '../../utils/money';
import { TRANSACTION_TYPE_LABELS } from '../../utils/transactionLabels';

const typeTone = {
  deposit: 'green',
  withdrawal: 'gold',
  bet: 'blue',
  win: 'purple',
  game_deposit: 'blue',
  game_withdraw: 'purple',
  bonus: 'gray',
  affiliate_commission: 'purple',
  manual_adjustment: 'blue',
  refund: 'gray',
};

const typeFilters = ['todos', ...Object.keys(TRANSACTION_TYPE_LABELS)];

export default function Transactions() {
  const [type, setType] = useState('todos');
  const [direction, setDirection] = useState('todos');
  const [userId, setUserId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  const currentFilters = () => ({
    type: type === 'todos' ? undefined : type,
    direction: direction === 'todos' ? undefined : direction,
    user_id: userId || undefined,
    from: from || undefined,
    to: to || undefined,
  });

  const load = (page = 1) => {
    setLoading(true);
    adminTxApi
      .listTransactions({ ...currentFilters(), page })
      .then((res) => {
        setRows(res.data);
        setMeta(res.meta);
        setError(null);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Não foi possível carregar as transações.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timeout = setTimeout(() => load(1), 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, direction, userId, from, to]);

  const exportCsv = async () => {
    setExporting(true);
    setError(null);
    try {
      await adminTxApi.downloadTransactionsExport(currentFilters());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível exportar.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <AdminLayout
      title="Transações"
      subtitle={meta ? `${meta.total} movimentações` : 'Histórico completo de movimentações'}
      actions={
        <button className="adm-btn adm-btn-ghost" onClick={exportCsv} disabled={exporting}>
          {exporting ? 'Exportando...' : 'Exportar CSV'}
        </button>
      }
    >
      <div className="adm-toolbar">
        <div className="adm-tabs">
          {typeFilters.map((t) => (
            <button key={t} className={`adm-tab ${type === t ? 'is-active' : ''}`} onClick={() => setType(t)}>
              {t === 'todos' ? 'Todos' : TRANSACTION_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
        <div className="adm-input">
          <input placeholder="ID do usuário..." value={userId} onChange={(e) => setUserId(e.target.value)} style={{ maxWidth: 140 }} />
        </div>
        <select className="adm-select" value={direction} onChange={(e) => setDirection(e.target.value)}>
          <option value="todos">Entrada e saída</option>
          <option value="credit">Só entradas</option>
          <option value="debit">Só saídas</option>
        </select>
        <input type="date" className="adm-select" value={from} onChange={(e) => setFrom(e.target.value)} />
        <input type="date" className="adm-select" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>

      {error && <p style={{ color: 'var(--red-text)', margin: '12px 0' }}>{error}</p>}

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tipo</th>
              <th>Usuário</th>
              <th>Descrição</th>
              <th>Valor</th>
              <th>Saldo após</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            {!loading && rows.length === 0 && (
              <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-dim)', padding: 28 }}>Nenhuma transação encontrada.</td></tr>
            )}
            {rows.map((t) => (
              <tr key={t.id}>
                <td className="t-sub">#{t.id}</td>
                <td><span className={`badge ${typeTone[t.type] || 'gray'}`}>{TRANSACTION_TYPE_LABELS[t.type] || t.type}</span></td>
                <td>
                  {t.user?.name || '—'}
                  {t.user?.email && <span className="t-sub" style={{ display: 'block' }}>{t.user.email}</span>}
                </td>
                <td className="t-sub">{t.description || '—'}</td>
                <td className={`num ${t.amount_cents >= 0 ? 'pos' : 'neg'}`}>{t.amount_cents >= 0 ? '+' : ''}{fmtCents(t.amount_cents)}</td>
                <td className="num">{fmtCents(t.balance_after_cents)}</td>
                <td className="t-sub num">{t.created_at ? new Date(t.created_at).toLocaleString('pt-BR') : '—'}</td>
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
    </AdminLayout>
  );
}
