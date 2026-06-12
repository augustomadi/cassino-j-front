import { useState, useMemo } from 'react';
import AdminLayout from '../components/AdminLayout';
import StatCard from '../components/StatCard';
import { users as seed, fmtBRL, fmtNum } from '../data/adminMock';
import { IcUsers, IcWallet, IcFinance, IcX } from '../components/AdminIcons';

const statusTone = { ativo: 'green', inativo: 'gray', bloqueado: 'red' };
const kycTone = { verificado: 'green', pendente: 'gold', recusado: 'red' };

export default function Users() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('todos');
  const [sort, setSort] = useState('houseProfit');
  const [selected, setSelected] = useState(null);

  const totals = useMemo(() => ({
    count: seed.length,
    deposited: seed.reduce((s, u) => s + u.deposited, 0),
    withdrawn: seed.reduce((s, u) => s + u.withdrawn, 0),
    profit: seed.reduce((s, u) => s + u.houseProfit, 0),
  }), []);

  const rows = useMemo(() => {
    let r = seed.filter(
      (u) =>
        (status === 'todos' || u.status === status) &&
        (u.name.toLowerCase().includes(query.toLowerCase()) ||
          u.email.toLowerCase().includes(query.toLowerCase()) ||
          u.id.includes(query))
    );
    r = [...r].sort((a, b) => b[sort] - a[sort]);
    return r;
  }, [query, status, sort]);

  return (
    <AdminLayout title="Usuários" subtitle={`${fmtNum(seed.length)} usuários cadastrados`}>
      <div className="adm-grid adm-kpis">
        <StatCard label="Total de Usuários" value={fmtNum(totals.count)} icon={IcUsers} tone="purple" />
        <StatCard label="Total Depositado" value={fmtBRL(totals.deposited)} icon={IcWallet} tone="green" />
        <StatCard label="Total Sacado" value={fmtBRL(totals.withdrawn)} icon={IcWallet} tone="gold" />
        <StatCard label="Lucro da Casa" value={fmtBRL(totals.profit)} icon={IcFinance} tone="blue" hint="resultado líquido" />
      </div>

      <div style={{ marginTop: 20 }}>
        <div className="adm-toolbar">
          <div className="adm-input">
            <input placeholder="Buscar por nome, e-mail ou ID..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <select className="adm-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="todos">Todos os status</option>
            <option value="ativo">Ativos</option>
            <option value="inativo">Inativos</option>
            <option value="bloqueado">Bloqueados</option>
          </select>
          <select className="adm-select" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="houseProfit">Ordenar: Lucro da casa</option>
            <option value="deposited">Ordenar: Depositado</option>
            <option value="withdrawn">Ordenar: Sacado</option>
            <option value="wagered">Ordenar: Apostado</option>
            <option value="balance">Ordenar: Saldo</option>
          </select>
        </div>

        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Saldo</th>
                <th>Depositado</th>
                <th>Sacado</th>
                <th>Apostado</th>
                <th>Saques</th>
                <th>Lucro da casa</th>
                <th>KYC</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id} onClick={() => setSelected(u)} style={{ cursor: 'pointer' }}>
                  <td>
                    <span className="t-name">
                      <span className="adm-mini-avatar">{u.name.charAt(0)}</span>
                      <span>
                        {u.name} {u.vip && <span className="badge gold" style={{ marginLeft: 4 }}>VIP</span>}
                        <span className="t-sub" style={{ display: 'block' }}>{u.email}</span>
                      </span>
                    </span>
                  </td>
                  <td className="num">{fmtBRL(u.balance)}</td>
                  <td className="num">{fmtBRL(u.deposited)}</td>
                  <td className="num">{fmtBRL(u.withdrawn)}</td>
                  <td className="num">{fmtBRL(u.wagered)}</td>
                  <td className="num">{u.withdrawalsCount}</td>
                  <td className={`num ${u.houseProfit >= 0 ? 'pos' : 'neg'}`}>{fmtBRL(u.houseProfit)}</td>
                  <td><span className={`badge ${kycTone[u.kyc]}`}>{u.kyc}</span></td>
                  <td><span className={`badge ${statusTone[u.status]}`}>{u.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && <UserDrawer user={selected} onClose={() => setSelected(null)} />}
    </AdminLayout>
  );
}

function UserDrawer({ user, onClose }) {
  return (
    <>
      <div className="adm-drawer-overlay" onClick={onClose} />
      <aside className="adm-drawer">
        <div className="adm-drawer-head">
          <div className="t-name">
            <span className="adm-mini-avatar" style={{ width: 44, height: 44, fontSize: '1rem' }}>{user.name.charAt(0)}</span>
            <div>
              <strong style={{ fontSize: '1.05rem' }}>{user.name}</strong>
              <span className="t-sub" style={{ display: 'block' }}>{user.email}</span>
            </div>
          </div>
          <button className="adm-icon-action" onClick={onClose}><IcX size={16} /></button>
        </div>
        <div className="adm-drawer-body">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className={`badge ${statusTone[user.status]}`}>{user.status}</span>
            <span className={`badge ${kycTone[user.kyc]}`}>KYC: {user.kyc}</span>
            {user.vip && <span className="badge gold">VIP</span>}
            <span className="badge gray">ID {user.id}</span>
          </div>

          <div className="adm-kv">
            <div className="adm-kv-item"><small>Saldo atual</small><strong>{fmtBRL(user.balance)}</strong></div>
            <div className="adm-kv-item"><small>Lucro da casa</small><strong className={user.houseProfit >= 0 ? 'pos' : 'neg'}>{fmtBRL(user.houseProfit)}</strong></div>
            <div className="adm-kv-item"><small>Total depositado</small><strong>{fmtBRL(user.deposited)}</strong></div>
            <div className="adm-kv-item"><small>Total sacado</small><strong>{fmtBRL(user.withdrawn)}</strong></div>
            <div className="adm-kv-item"><small>Total apostado</small><strong>{fmtBRL(user.wagered)}</strong></div>
            <div className="adm-kv-item"><small>Nº de saques</small><strong>{user.withdrawalsCount}</strong></div>
            <div className="adm-kv-item"><small>Afiliado de origem</small><strong style={{ fontSize: '0.88rem' }}>{user.affiliate}</strong></div>
            <div className="adm-kv-item"><small>Último acesso</small><strong style={{ fontSize: '0.82rem' }}>{user.lastLogin}</strong></div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button className="adm-btn adm-btn-gold" style={{ flex: 1 }}>Ajustar saldo</button>
            <button className="adm-btn adm-btn-danger" style={{ flex: 1 }}>
              {user.status === 'bloqueado' ? 'Desbloquear' : 'Bloquear'}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
