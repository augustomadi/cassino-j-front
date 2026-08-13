import { Routes, Route } from 'react-router-dom';
import './admin.css';
import Dashboard from './pages/Dashboard';
import Affiliates from './pages/Affiliates';
import Users from './pages/Users';
import Finance from './pages/Finance';
import Transactions from './pages/Transactions';
import Games from './pages/Games';
import Appearance from './pages/Appearance';
import Settings from './pages/Settings';
import Audit from './pages/Audit';
import Staff from './pages/Staff';
import Kyc from './pages/Kyc';
import Withdrawals from './pages/Withdrawals';
import AdminLogin from './pages/AdminLogin';
import { AdminAuthProvider, useAdminAuth } from './AdminAuthContext';

function AdminGate() {
  const { status } = useAdminAuth();

  if (status === 'loading') {
    return <div className="adm-boot">Carregando...</div>;
  }

  if (status === 'guest') {
    return <AdminLogin />;
  }

  return (
    <Routes>
      <Route index element={<Dashboard />} />
      <Route path="afiliados" element={<Affiliates />} />
      <Route path="usuarios" element={<Users />} />
      <Route path="verificacao" element={<Kyc />} />
      <Route path="saques" element={<Withdrawals />} />
      <Route path="financeiro" element={<Finance />} />
      <Route path="transacoes" element={<Transactions />} />
      <Route path="jogos" element={<Games />} />
      <Route path="aparencia" element={<Appearance />} />
      <Route path="configuracoes" element={<Settings />} />
      <Route path="auditoria" element={<Audit />} />
      <Route path="staff" element={<Staff />} />
    </Routes>
  );
}

export default function AdminApp() {
  return (
    <AdminAuthProvider>
      <AdminGate />
    </AdminAuthProvider>
  );
}
