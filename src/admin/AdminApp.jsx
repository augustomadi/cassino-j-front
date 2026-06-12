import { Routes, Route } from 'react-router-dom';
import './admin.css';
import Dashboard from './pages/Dashboard';
import Affiliates from './pages/Affiliates';
import Users from './pages/Users';
import Finance from './pages/Finance';
import Transactions from './pages/Transactions';
import Games from './pages/Games';
import Settings from './pages/Settings';

export default function AdminApp() {
  return (
    <Routes>
      <Route index element={<Dashboard />} />
      <Route path="afiliados" element={<Affiliates />} />
      <Route path="usuarios" element={<Users />} />
      <Route path="financeiro" element={<Finance />} />
      <Route path="transacoes" element={<Transactions />} />
      <Route path="jogos" element={<Games />} />
      <Route path="configuracoes" element={<Settings />} />
    </Routes>
  );
}
