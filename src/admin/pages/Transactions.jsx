import { useState, useMemo } from 'react';
import AdminLayout from '../components/AdminLayout';
import { transactions as seed, fmtBRL } from '../data/adminMock';

const typeTone = {
  'depósito': 'green',
  saque: 'gold',
  aposta: 'blue',
  ganho: 'purple',
  'bônus': 'gray',
};
const statusTone = { 'concluído': 'green', pendente: 'gold', falhou: 'red' };
const typeFilters = ['todos', 'depósito', 'saque', 'aposta', 'ganho', 'bônus'];

export default function Transactions() {
  const [type, setType] = useState('todos');
  const [status, setStatus] = useState('todos');
  const [query, setQuery] = useState('');

  const rows = useMemo(
    () =>
      seed.filter(
        (t) =>
          (type === 'todos' || t.type === type) &&
          (status === 'todos' || t.status === status) &&
          (t.user.toLowerCase().includes(query.toLowerCase()) || t.id.includes(query))
      ),
    [type, status, query]
  );

  return (
    <AdminLayout title="Transações" subtitle="Histórico completo de movimentações">
      <div className="adm-toolbar">
        <div className="adm-tabs">
          {typeFilters.map((t) => (
            <button key={t} className={`adm-tab ${type === t ? 'is-active' : ''}`} onClick={() => setType(t)}>
              {t === 'todos' ? 'Todos' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <div className="adm-input">
          <input placeholder="Buscar por usuário ou ID..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <select className="adm-select" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="todos">Todos os status</option>
          <option value="concluído">Concluído</option>
          <option value="pendente">Pendente</option>
          <option value="falhou">Falhou</option>
        </select>
      </div>

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tipo</th>
              <th>Usuário</th>
              <th>Jogo</th>
              <th>Método</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.id}>
                <td className="t-sub">#{t.id}</td>
                <td><span className={`badge ${typeTone[t.type]}`}>{t.type}</span></td>
                <td>{t.user}</td>
                <td className="t-sub">{t.game}</td>
                <td className="t-sub">{t.method}</td>
                <td className={`num ${t.amount >= 0 ? 'pos' : 'neg'}`}>{fmtBRL(t.amount)}</td>
                <td><span className={`badge ${statusTone[t.status]}`}>{t.status}</span></td>
                <td className="t-sub num">{t.date}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-dim)', padding: 28 }}>Nenhuma transação encontrada.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
