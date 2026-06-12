import AdminLayout from '../components/AdminLayout';
import StatCard from '../components/StatCard';
import { gamePerformance, fmtBRL, fmtNum } from '../data/adminMock';
import { IcGames, IcFinance, IcUsers } from '../components/AdminIcons';

export default function Games() {
  const totalBets = gamePerformance.reduce((s, g) => s + g.bets, 0);
  const totalGgr = gamePerformance.reduce((s, g) => s + g.ggr, 0);
  const totalPlayers = gamePerformance.reduce((s, g) => s + g.players, 0);

  return (
    <AdminLayout title="Jogos" subtitle="Desempenho e rentabilidade por jogo">
      <div className="adm-grid adm-cols-3">
        <StatCard label="Total Apostado" value={fmtBRL(totalBets)} icon={IcGames} tone="blue" />
        <StatCard label="GGR Total" value={fmtBRL(totalGgr)} icon={IcFinance} tone="green" hint={`margem ${((totalGgr / totalBets) * 100).toFixed(1)}%`} />
        <StatCard label="Jogadores Únicos" value={fmtNum(totalPlayers)} icon={IcUsers} tone="purple" />
      </div>

      <div className="adm-card" style={{ marginTop: 16 }}>
        <div className="adm-card-head"><h3>Ranking de Jogos</h3></div>
        <div className="adm-table-wrap" style={{ border: 'none' }}>
          <table className="adm-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Jogo</th>
                <th>Provedor</th>
                <th>Total Apostado</th>
                <th>GGR Gerado</th>
                <th>Jogadores</th>
                <th>Margem (House Edge)</th>
              </tr>
            </thead>
            <tbody>
              {gamePerformance.map((g, i) => (
                <tr key={g.game}>
                  <td><strong style={{ color: 'var(--gold-400)' }}>{i + 1}</strong></td>
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
