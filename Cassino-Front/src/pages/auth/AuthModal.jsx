import { useState } from 'react';
import './AuthModal.css';
import { useAuth } from '../../auth/AuthContext';
import { getReferralCode } from '../../api/referral';
import { ApiError } from '../../api/http';
import { IconClose } from '../../components/icons/Icons';

const maskCpf = (value) =>
  value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');

const emptyRegisterForm = {
  name: '',
  email: '',
  cpf: '',
  phone: '',
  birth_date: '',
  password: '',
  password_confirmation: '',
};

export default function AuthModal({ initialView = 'login', onClose }) {
  const { login, register, completeTwoFactorChallenge, forgotPassword } = useAuth();

  const [view, setView] = useState(initialView);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState(emptyRegisterForm);
  const [forgotEmail, setForgotEmail] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [challengeToken, setChallengeToken] = useState(null);

  const switchView = (next) => {
    setFormError(null);
    setFieldErrors({});
    setView(next);
  };

  const handleApiError = (err) => {
    if (err instanceof ApiError) {
      setFormError(err.message);
      setFieldErrors(err.errors || {});
    } else {
      setFormError('Algo deu errado. Tente novamente.');
    }
  };

  const fieldError = (name) => fieldErrors[name]?.[0];

  const submitLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);
    setFieldErrors({});
    try {
      const result = await login(loginForm);
      if (result.twoFactorRequired) {
        setChallengeToken(result.challengeToken);
        switchView('twoFactor');
      } else {
        onClose();
      }
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const submitTwoFactor = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);
    try {
      await completeTwoFactorChallenge({ challengeToken, code: twoFactorCode });
      onClose();
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const submitRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);
    setFieldErrors({});
    try {
      const ref = getReferralCode();
      await register({ ...registerForm, ref: ref || undefined });
      switchView('registered');
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const submitForgot = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);
    try {
      await forgotPassword(forgotEmail);
      switchView('forgotSent');
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose} aria-label="Fechar">
          <IconClose size={18} />
        </button>

        {view === 'login' && (
          <form className="auth-form" onSubmit={submitLogin}>
            <h2>Entrar</h2>
            {formError && <p className="auth-error">{formError}</p>}
            <label className="auth-field">
              <span>E-mail</span>
              <input
                type="email"
                required
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              />
              {fieldError('email') && <small>{fieldError('email')}</small>}
            </label>
            <label className="auth-field">
              <span>Senha</span>
              <input
                type="password"
                required
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              />
              {fieldError('password') && <small>{fieldError('password')}</small>}
            </label>
            <button className="btn btn-gold auth-submit" type="submit" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
            <button type="button" className="auth-link" onClick={() => switchView('forgot')}>
              Esqueci minha senha
            </button>
            <p className="auth-switch">
              Não tem conta?{' '}
              <button type="button" className="auth-link" onClick={() => switchView('register')}>
                Cadastre-se
              </button>
            </p>
          </form>
        )}

        {view === 'twoFactor' && (
          <form className="auth-form" onSubmit={submitTwoFactor}>
            <h2>Verificação em duas etapas</h2>
            <p className="auth-hint">Informe o código do seu aplicativo autenticador (ou um código de recuperação).</p>
            {formError && <p className="auth-error">{formError}</p>}
            <label className="auth-field">
              <span>Código</span>
              <input
                type="text"
                required
                autoFocus
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
              />
              {fieldError('code') && <small>{fieldError('code')}</small>}
            </label>
            <button className="btn btn-gold auth-submit" type="submit" disabled={loading}>
              {loading ? 'Verificando...' : 'Confirmar'}
            </button>
            <button type="button" className="auth-link" onClick={() => switchView('login')}>
              Voltar
            </button>
          </form>
        )}

        {view === 'register' && (
          <form className="auth-form" onSubmit={submitRegister}>
            <h2>Criar conta</h2>
            {formError && <p className="auth-error">{formError}</p>}
            <label className="auth-field">
              <span>Nome completo</span>
              <input
                type="text"
                required
                value={registerForm.name}
                onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
              />
              {fieldError('name') && <small>{fieldError('name')}</small>}
            </label>
            <label className="auth-field">
              <span>E-mail</span>
              <input
                type="email"
                required
                value={registerForm.email}
                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
              />
              {fieldError('email') && <small>{fieldError('email')}</small>}
            </label>
            <label className="auth-field">
              <span>CPF</span>
              <input
                type="text"
                required
                inputMode="numeric"
                placeholder="000.000.000-00"
                value={registerForm.cpf}
                onChange={(e) => setRegisterForm({ ...registerForm, cpf: maskCpf(e.target.value) })}
              />
              {fieldError('cpf') && <small>{fieldError('cpf')}</small>}
            </label>
            <label className="auth-field">
              <span>Telefone (opcional)</span>
              <input
                type="tel"
                value={registerForm.phone}
                onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
              />
              {fieldError('phone') && <small>{fieldError('phone')}</small>}
            </label>
            <label className="auth-field">
              <span>Data de nascimento</span>
              <input
                type="date"
                required
                value={registerForm.birth_date}
                onChange={(e) => setRegisterForm({ ...registerForm, birth_date: e.target.value })}
              />
              {fieldError('birth_date') && <small>{fieldError('birth_date')}</small>}
            </label>
            <label className="auth-field">
              <span>Senha</span>
              <input
                type="password"
                required
                value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
              />
              {fieldError('password') && <small>{fieldError('password')}</small>}
            </label>
            <label className="auth-field">
              <span>Confirmar senha</span>
              <input
                type="password"
                required
                value={registerForm.password_confirmation}
                onChange={(e) => setRegisterForm({ ...registerForm, password_confirmation: e.target.value })}
              />
            </label>
            <button className="btn btn-gold auth-submit" type="submit" disabled={loading}>
              {loading ? 'Criando conta...' : 'Criar conta'}
            </button>
            <p className="auth-switch">
              Já tem conta?{' '}
              <button type="button" className="auth-link" onClick={() => switchView('login')}>
                Entrar
              </button>
            </p>
          </form>
        )}

        {view === 'registered' && (
          <div className="auth-form auth-confirmation">
            <h2>Quase lá!</h2>
            <p>Cadastro realizado. Enviamos um link de verificação para o seu e-mail — confirme para ativar a conta.</p>
            <button className="btn btn-gold auth-submit" onClick={() => switchView('login')}>
              Ir para o login
            </button>
          </div>
        )}

        {view === 'forgot' && (
          <form className="auth-form" onSubmit={submitForgot}>
            <h2>Recuperar senha</h2>
            <p className="auth-hint">Informe seu e-mail. Se houver uma conta cadastrada, enviaremos um link de redefinição.</p>
            {formError && <p className="auth-error">{formError}</p>}
            <label className="auth-field">
              <span>E-mail</span>
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
              />
              {fieldError('email') && <small>{fieldError('email')}</small>}
            </label>
            <button className="btn btn-gold auth-submit" type="submit" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar link'}
            </button>
            <button type="button" className="auth-link" onClick={() => switchView('login')}>
              Voltar
            </button>
          </form>
        )}

        {view === 'forgotSent' && (
          <div className="auth-form auth-confirmation">
            <h2>Verifique seu e-mail</h2>
            <p>Se houver uma conta com esse e-mail, o link de redefinição foi enviado.</p>
            <button className="btn btn-gold auth-submit" onClick={() => switchView('login')}>
              Ir para o login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
