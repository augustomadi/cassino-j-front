import AdminLayout from '../components/AdminLayout';

export default function Settings() {
  return (
    <AdminLayout title="Configurações" subtitle="Parâmetros gerais da plataforma">
      <div className="adm-grid adm-cols-2">
        <div className="adm-card">
          <div className="adm-card-head"><h3>Geral</h3></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="adm-field">
              <label>Nome da plataforma</label>
              <input defaultValue="Cassino" />
            </div>
            <div className="adm-field">
              <label>Depósito mínimo (R$)</label>
              <input type="number" defaultValue={10} />
            </div>
            <div className="adm-field">
              <label>Saque mínimo (R$)</label>
              <input type="number" defaultValue={50} />
            </div>
          </div>
        </div>

        <div className="adm-card">
          <div className="adm-card-head"><h3>Pagamentos & Limites</h3></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="adm-field">
              <label>Rollover de bônus (x)</label>
              <input type="number" defaultValue={20} />
            </div>
            <div className="adm-field">
              <label>Limite de saque diário (R$)</label>
              <input type="number" defaultValue={20000} />
            </div>
            <div className="adm-field">
              <label>Aprovação automática de saque até (R$)</label>
              <input type="number" defaultValue={500} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <button className="adm-btn adm-btn-gold">Salvar configurações</button>
      </div>
    </AdminLayout>
  );
}
