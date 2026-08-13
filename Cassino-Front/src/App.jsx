import { Routes, Route } from 'react-router-dom';
import SiteApp from './site/SiteApp';
import AdminApp from './admin/AdminApp';
import { AuthProvider } from './auth/AuthContext';
import VerifyEmail from './pages/auth/VerifyEmail';
import ResetPassword from './pages/auth/ResetPassword';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/admin/*" element={<AdminApp />} />
        {/* Destinos dos links de e-mail (verificação/redefinição) — ver
            AppServiceProvider::configureNotificationUrls no backend. */}
        <Route path="/verificar-email" element={<VerifyEmail />} />
        <Route path="/redefinir-senha" element={<ResetPassword />} />
        <Route path="/*" element={<SiteApp />} />
      </Routes>
    </AuthProvider>
  );
}
