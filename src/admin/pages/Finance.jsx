import { useState, useMemo } from 'react';
import AdminLayout from '../components/AdminLayout';
import StatCard from '../components/StatCard';
import { BarChart, Donut } from '../components/Charts';
import {
  kpis, monthlyPnL, paymentMethods, expenses, pendingWithdrawals, fmtBRL,
} from '../data/adminMock';
import { IcWallet, IcFinance, IcUp, IcDown } from '../components/AdminIcons';

const riskTone = { baixo: 'green', 'médio': 'gold', alto: 'red' };

export default function Finance() {
  const [queue, setQueue] = useState(pendingWithdrawals);

  const totalRevenue = monthlyPnL.reduce((s, m) => s + m.revenue, 0);
  const totalExpenses = monthlyPnL.reduce((s, m) => s + m.expenses, 0);
  const netProfit = totalRevenue - totalExpenses;
  const totalExp = useMemo(() => expenses.reduce((s, e) => s + e.value, 0), []);

  const resolve = (id) => setQueue((q) => q.filter((w) => w.id !== id));

  return (
    <AdminLayout title="Financeiro" subtitle="Caixa, lucros, despesas e aprovação de saques">
      <div className="adm-grid adm-kpis">
        <StatCard label="Saldo em Caixa" value={fmtBRL(kpis.caixa)} icon={IcWallet} tone="blue" hint="disponível para saque" />
        <StatCard label="Receita (ano)" value={fmtBRL(totalRevenue)} icon={IcFinance} tone="green" trend={11.2} />
        <StatCard label="Despesas (ano)" value={fmtBRL(totalExpenses)} icon={IcFinance} tone="gold" trend={6.4} />
        <StatCard label="Lucro Líquido (ano)" value={fmtBRL(netProfit)} icon={IcFinance} tone="purple" hint={`margem ${((netProfit / totalRevenue) * 100).toFixed(1)}%`} />
      </div>

      <div className="adm-grid adm-cols-2" style={{ marginTop: 16 }}>
        <div className="adm-card">
          <div className="adm-card-head"><h3>Receita x Despesas (mensal)</h3></div>
          <BarChart data={monthlyPnL} />
        </div>
        <div className="adm-card">
          <div className="adm-card-head"><h3>Métodos de Pagamento</h3></div>
          <Donut data={paymentMethods} />
        </div>
      </div>

      <div className="adm-grid adm-cols-2" style={{ marginTop: 16 }}>
        <div className="adm-card">
          <div className="adm-card-head">
            <h3>Saques Pendentes</h3>
            <span className="badge red">{queue.length} aguardando</span>
          </div>
          <div className="adm-table-wrap" style={{ border: 'none' }}>
            <table className="adm-table" style={{ minWidth: 480 }}>
              <thead>
                <tr><th>Usuário</th><th>Valor</th><th>Método</th><th>Risco</th><th></th></tr>
              </thead>
              <tbody>
                {queue.length === 0 && (
                  <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-dim)' }}>Nenhum saque pendente 🎉</td></tr>
                )}
                {queue.map((w) => (
                  <tr key={w.id}>
                    <td>
                      {w.user}
                      <span className="t-sub" style={{ display: 'block' }}>{w.pixKey}</span>
                    </td>
                    <td className="num" style={{ fontWeight: 700 }}>{fmtBRL(w.amount)}</td>
                    <td><span className="badge gray">{w.method}</span></td>
                    <td><span className={`badge ${riskTone[w.risk]}`}>{w.risk}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="adm-btn adm-btn-green adm-btn-sm" onClick={() => resolve(w.id)}>Aprovar</button>
                        <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => resolve(w.id)}>Recusar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="adm-card">
          <div className="adm-card-head">
            <h3>Despesas Operacionais</h3>
            <span className="adm-link">{fmtBRL(totalExp)}/mês</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {expenses.map((e) => {
              const pct = (e.value / totalExp) * 100;
              return (
                <div key={e.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.88rem' }}>
                    <span>{e.label} <span className="badge gray" style={{ marginLeft: 4 }}>{e.cat}</span></span>
                    <strong className="num">{fmtBRL(e.value)}</strong>
                  </div>
                  <div className="adm-progress"><span style={{ width: `${pct}%` }} /></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
