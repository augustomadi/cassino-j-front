import AdminLayout from '../components/AdminLayout';
import StatCard from '../components/StatCard';
import { AreaChart } from '../components/Charts';
import {
  kpis, kpiTrends, revenueSeries, gamePerformance, activityFeed, fmtBRL, fmtNum,
} from '../data/adminMock';
import {
  IcFinance, IcWallet, IcUsers, IcTransactions, IcAlert,
} from '../components/AdminIcons';

export default function Dashboard() {
  return (
    <AdminLayout
      title="Dashboard"
      subtitle="Visão geral do cassino em tempo real"
      actions={
        <select className="adm-select" defaultValue="30">
          <option value="7">Últimos 7 dias</option>
          <option value="30">Últimos 30 dias</option>
          <option value="90">Últimos 90 dias</option>
        </select>
      }
    >
      <div className="adm-grid adm-kpis">
        <StatCard label="GGR (Receita Bruta)" value={fmtBRL(kpis.ggr)} icon={IcFinance} tone="gold" trend={kpiTrends.ggr} hint="vs. período anterior" />
        <StatCard label="NGR (Receita Líquida)" value={fmtBRL(kpis.ngr)} icon={IcFinance} tone="green" trend={kpiTrends.ngr} hint="após bônus e taxas" />
        <StatCard label="Saldo em Caixa" value={fmtBRL(kpis.caixa)} icon={IcWallet} tone="blue" trend={kpiTrends.caixa} hint="disponível" />
        <StatCard label="Usuários Ativos" value={fmtNum(kpis.activeUsers)} icon={IcUsers} tone="purple" trend={kpiTrends.activeUsers} hint={`${kpis.onlineNow} online agora`} />
      </div>

      <div className="adm-grid adm-kpis" style={{ marginTop: 16 }}>
        <StatCard label="Depósitos" value={fmtBRL(kpis.deposits)} icon={IcTransactions} tone="green" trend={kpiTrends.deposits} />
        <StatCard label="Saques" value={fmtBRL(kpis.withdrawals)} icon={IcTransactions} tone="gold" trend={kpiTrends.withdrawals} />
        <StatCard label="Saques Pendentes" value={fmtNum(kpis.pendingWithdrawals)} icon={IcAlert} tone="red" hint={fmtBRL(kpis.pendingWithdrawalsValue)} />
        <StatCard label="Taxa de Conversão" value={`${kpis.conversionRate}%`} icon={IcUsers} tone="blue" trend={kpiTrends.conversionRate} hint="cadastro → depósito" />
      </div>

      <div className="adm-grid adm-cols-2" style={{ marginTop: 16 }}>
        <div className="adm-card">
          <div className="adm-card-head">
            <h3>Depósitos x Saques x GGR</h3>
            <span className="adm-link">Últimos 30 dias</span>
          </div>
          <AreaChart
            data={revenueSeries}
            series={[
              { key: 'deposits', label: 'Depósitos', color: '#22c55e' },
              { key: 'withdrawals', label: 'Saques', color: '#f5a623' },
              { key: 'ggr', label: 'GGR', color: '#7c3aed' },
            ]}
          />
        </div>

        <div className="adm-card">
          <div className="adm-card-head">
            <h3>Atividade Recente</h3>
          </div>
          <div className="adm-feed">
            {activityFeed.map((a) => (
              <div className="adm-feed-item" key={a.id}>
                <span className="adm-feed-ic">{a.icon}</span>
                <div className="adm-feed-txt">
                  <strong>{a.text}</strong>
                  <span>{a.user}</span>
                </div>
                <span className="adm-feed-time">{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="adm-card" style={{ marginTop: 16 }}>
        <div className="adm-card-head">
          <h3>Jogos com Melhor Desempenho</h3>
          <span className="adm-link">Ver todos</span>
        </div>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Jogo</th>
                <th>Provedor</th>
                <th>Total Apostado</th>
                <th>GGR Gerado</th>
                <th>Jogadores</th>
                <th>Margem</th>
              </tr>
            </thead>
            <tbody>
              {gamePerformance.map((g) => (
                <tr key={g.game}>
                  <td>
                    <span className="t-name">
                      <span className="adm-mini-avatar">{g.emoji}</span>
                      {g.game}
                    </span>
                  </td>
                  <td className="t-sub">{g.provider}</td>
                  <td className="num">{fmtBRL(g.bets)}</td>
                  <td className="num pos">{fmtBRL(g.ggr)}</td>
                  <td className="num">{fmtNum(g.players)}</td>
                  <td><span className="badge gold">{((g.ggr / g.bets) * 100).toFixed(1)}%</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
