import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import * as adminStaffApi from '../../api/adminStaff';
import { useAdminAuth } from '../AdminAuthContext';
import { ApiError } from '../../api/http';
import { ROLE_LABELS } from '../../utils/roleLabels';
import { IcPlus, IcEdit, IcStaff } from '../components/AdminIcons';
import StatCard from '../components/StatCard';

const emptyForm = { name: '', email: '', password: '', role: 'support' };

export default function Staff() {
  const { admin: me } = useAdminAuth();
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [roles, setRoles] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newModal, setNewModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  const [editStaff, setEditStaff] = useState(null); // staff sendo editado

  const load = () => {
    setLoading(true);
    adminStaffApi
      .listStaff({})
      .then((res) => {
        setRows(res.data);
        setMeta(res.meta);
        setError(null);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Não foi possível carregar o staff.'))
      .finally(() => setLoading(false));
  };

  const loadRoles = () => {
    adminStaffApi
      .listRoles()
      .then((res) => setRoles(res.data))
      .catch(() => setRoles([]));
  };

  useEffect(() => {
    load();
    loadRoles();
  }, []);

  const openNew = () => {
    setForm(emptyForm);
    setFormError(null);
    setNewModal(true);
  };

  const submitNew = async () => {
    setSaving(true);
    setFormError(null);
    try {
      await adminStaffApi.createStaff(form);
      setNewModal(false);
      load();
      loadRoles();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Não foi possível criar o membro.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title="Staff"
      subtitle={meta ? `${meta.total} membros de staff` : 'Carregando...'}
      actions={<button className="adm-btn adm-btn-gold" onClick={openNew}><IcPlus size={16} /> Novo membro</button>}
    >
      <div className="adm-grid adm-kpis">
        {(roles || []).map((r) => (
          <StatCard
            key={r.role}
            label={ROLE_LABELS[r.role] || r.role}
            value={r.members_count}
            icon={IcStaff}
            tone={r.is_super_admin ? 'gold' : 'purple'}
            hint={r.is_super_admin ? 'acesso total' : `${r.permissions.length} permissões`}
          />
        ))}
      </div>

      {error && <p style={{ color: 'var(--red-text)', margin: '16px 0' }}>{error}</p>}

      <div className="adm-table-wrap" style={{ marginTop: 20 }}>
        <table className="adm-table">
          <thead>
            <tr>
              <th>Membro</th>
              <th>Papel</th>
              <th>2FA</th>
              <th>Status</th>
              <th>Último login</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {!loading && rows.length === 0 && (
              <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-dim)', padding: 28 }}>Nenhum membro de staff.</td></tr>
            )}
            {rows.map((s) => (
              <tr key={s.id} onClick={() => setEditStaff(s)} style={{ cursor: 'pointer' }}>
                <td>
                  <span className="t-name">
                    <span className="adm-mini-avatar">{s.name.charAt(0)}</span>
                    <span>
                      {s.name} {s.id === me?.id && <span className="badge blue" style={{ marginLeft: 4 }}>você</span>}
                      <span className="t-sub" style={{ display: 'block' }}>{s.email}</span>
                    </span>
                  </span>
                </td>
                <td><span className="badge purple">{ROLE_LABELS[s.role] || s.role}</span></td>
                <td><span className={`badge ${s.two_factor_enabled ? 'green' : 'gray'}`}>{s.two_factor_enabled ? 'ativo' : 'inativo'}</span></td>
                <td><span className={`badge ${s.status === 'active' ? 'green' : 'red'}`}>{s.status === 'active' ? 'ativo' : 'desativado'}</span></td>
                <td className="t-sub">{s.last_login_at ? new Date(s.last_login_at).toLocaleString('pt-BR') : 'nunca'}</td>
                <td>
                  <button className="adm-icon-action" onClick={(e) => { e.stopPropagation(); setEditStaff(s); }} aria-label="Editar">
                    <IcEdit size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {newModal && (
        <Modal
          title="Novo Membro de Staff"
          onClose={() => setNewModal(false)}
          footer={
            <>
              <button className="adm-btn adm-btn-ghost" onClick={() => setNewModal(false)}>Cancelar</button>
              <button className="adm-btn adm-btn-gold" onClick={submitNew} disabled={saving}>
                {saving ? 'Salvando...' : 'Criar'}
              </button>
            </>
          }
        >
          {formError && <p style={{ color: 'var(--red-text)', marginBottom: 12 }}>{formError}</p>}
          <div className="adm-field">
            <label>Nome</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="adm-field">
            <label>E-mail</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="adm-field">
            <label>Senha (mín. 12 caracteres)</label>
            <input type="password" minLength={12} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div className="adm-field">
            <label>Papel</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {Object.entries(ROLE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <small style={{ color: 'var(--text-dim)' }}>2FA será obrigatório no primeiro acesso deste membro.</small>
        </Modal>
      )}

      {editStaff && (
        <EditStaffModal
          staff={editStaff}
          isSelf={editStaff.id === me?.id}
          onClose={() => setEditStaff(null)}
          onSaved={() => { setEditStaff(null); load(); loadRoles(); }}
        />
      )}
    </AdminLayout>
  );
}

function EditStaffModal({ staff, isSelf, onClose, onSaved }) {
  const [name, setName] = useState(staff.name);
  const [email, setEmail] = useState(staff.email);
  const [role, setRole] = useState(staff.role);
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      const data = { name, email, role };
      if (password) data.password = password;
      await adminStaffApi.updateStaff(staff.id, data);
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  };

  const disable = async () => {
    setSaving(true);
    setError(null);
    try {
      await adminStaffApi.disableStaff(staff.id);
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível desativar.');
      setShowDisableConfirm(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={`Editar — ${staff.name}`}
      onClose={onClose}
      footer={
        <>
          {staff.status === 'active' && !isSelf && (
            <button className="adm-btn adm-btn-danger" onClick={() => setShowDisableConfirm(true)} disabled={saving} style={{ marginRight: 'auto' }}>
              Desativar acesso
            </button>
          )}
          <button className="adm-btn adm-btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="adm-btn adm-btn-gold" onClick={submit} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </>
      }
    >
      {error && <p style={{ color: 'var(--red-text)', marginBottom: 12 }}>{error}</p>}
      <div className="adm-field">
        <label>Nome</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="adm-field">
        <label>E-mail</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="adm-field">
        <label>Papel {isSelf && <small style={{ color: 'var(--text-dim)' }}>(não editável — é você)</small>}</label>
        <select value={role} onChange={(e) => setRole(e.target.value)} disabled={isSelf}>
          {Object.entries(ROLE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>
      <div className="adm-field">
        <label>Nova senha (opcional)</label>
        <input type="password" minLength={12} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Deixe em branco para não alterar" />
      </div>

      {showDisableConfirm && (
        <ConfirmModal
          title="Desativar acesso"
          message={`Confirma desativar o acesso de ${staff.name}? A conta deixa de conseguir logar no painel até ser reativada.`}
          confirmLabel="Desativar acesso"
          tone="danger"
          loading={saving}
          onConfirm={disable}
          onCancel={() => setShowDisableConfirm(false)}
        />
      )}
    </Modal>
  );
}
