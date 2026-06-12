import { useState, useMemo } from 'react';
import AdminLayout from '../components/AdminLayout';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';
import { affiliates as seed, fmtBRL, fmtNum } from '../data/adminMock';
import {
  IcAffiliates, IcPlus, IcEdit, IcCopy, IcCheck, IcWallet, IcUsers,
} from '../components/AdminIcons';

const emptyForm = { name: '', code: '', commissionPct: 25, model: 'RevShare' };

export default function Affiliates() {
  const [list, setList] = useState(seed);
  const [modal, setModal] = useState(null); // 'new' | affiliate object
  const [form, setForm] = useState(emptyForm);
  const [copied, setCopied] = useState(null);
  const [query, setQuery] = useState('');

  const totals = useMemo(() => ({
    count: list.length,
    active: list.filter((a) => a.status === 'ativo').length,
    deposited: list.reduce((s, a) => s + a.deposited, 0),
    due: list.reduce((s, a) => s + (a.commissionDue - a.commissionPaid), 0),
  }), [list]);

  const filtered = list.filter(
    (a) => a.name.toLowerCase().includes(query.toLowerCase()) || a.code.includes(query.toLowerCase())
  );

  const openNew = () => { setForm(emptyForm); setModal('new'); };
  const openEdit = (a) => { setForm({ ...a }); setModal(a); };

  const copy = (text, id) => {
    navigator.clipboard?.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  const save = () => {
    if (modal === 'new') {
      const code = form.code || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '');
      setList((l) => [
        {
          id: `aff${Date.now()}`,
          name: form.name || 'Novo Afiliado',
          code,
          link: `https://cassino-j.com/r/${code}`,
          commissionPct: Number(form.commissionPct),
          model: form.model,
          clicks: 0, signups: 0, ftd: 0, deposited: 0,
          commissionDue: 0, commissionPaid: 0,
          status: 'ativo', createdAt: new Date().toISOString().slice(0, 10),
        },
        ...l,
      ]);
    } else {
      setList((l) =>
        l.map((a) =>
          a.id === modal.id
            ? { ...a, name: form.name, commissionPct: Number(form.commissionPct), model: form.model }
            : a
        )
      );
    }
    setModal(null);
  };

  const toggleStatus = (id) =>
    setList((l) => l.map((a) => (a.id === id ? { ...a, status: a.status === 'ativo' ? 'pausado' : 'ativo' } : a)));

  return (
    <AdminLayout
      title="Afiliados"
      subtitle="Gerencie parceiros, links de indicação e comissões"
      actions={<button className="adm-btn adm-btn-gold" onClick={openNew}><IcPlus size={16} /> Novo afiliado</button>}
    >
      <div className="adm-grid adm-kpis">
        <StatCard label="Total de Afiliados" value={fmtNum(totals.count)} icon={IcAffiliates} tone="purple" hint={`${totals.active} ativos`} />
        <StatCard label="Depósitos Gerados" value={fmtBRL(totals.deposited)} icon={IcWallet} tone="green" />
        <StatCard label="Comissão a Pagar" value={fmtBRL(totals.due)} icon={IcWallet} tone="gold" />
        <StatCard label="Cadastros via Afiliados" value={fmtNum(list.reduce((s, a) => s + a.signups, 0))} icon={IcUsers} tone="blue" />
      </div>

      <div style={{ marginTop: 20 }}>
        <div className="adm-toolbar">
          <div className="adm-input">
            <input placeholder="Buscar por nome ou código..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>

        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Afiliado</th>
                <th>Link de indicação</th>
                <th>Modelo</th>
                <th>Comissão</th>
                <th>Cliques</th>
                <th>Cadastros</th>
                <th>Depósitos</th>
                <th>A pagar</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td>
                    <span className="t-name">
                      <span className="adm-mini-avatar">{a.name.charAt(0)}</span>
                      <span>
                        {a.name}
                        <span className="t-sub" style={{ display: 'block' }}>@{a.code}</span>
                      </span>
                    </span>
                  </td>
                  <td>
                    <span className="adm-copylink">
                      <code>{a.link}</code>
                      <button className="adm-icon-action" onClick={() => copy(a.link, a.id)} aria-label="Copiar link">
                        {copied === a.id ? <IcCheck size={14} /> : <IcCopy size={14} />}
                      </button>
                    </span>
                  </td>
                  <td><span className="badge blue">{a.model}</span></td>
                  <td className="num"><strong style={{ color: 'var(--gold-400)' }}>{a.commissionPct}%</strong></td>
                  <td className="num">{fmtNum(a.clicks)}</td>
                  <td className="num">{fmtNum(a.signups)}</td>
                  <td className="num">{fmtBRL(a.deposited)}</td>
                  <td className="num gold" style={{ color: 'var(--gold-400)', fontWeight: 700 }}>{fmtBRL(a.commissionDue - a.commissionPaid)}</td>
                  <td>
                    <button className={`badge ${a.status === 'ativo' ? 'green' : 'gray'}`} onClick={() => toggleStatus(a.id)} style={{ cursor: 'pointer' }}>
                      {a.status}
                    </button>
                  </td>
                  <td>
                    <button className="adm-icon-action" onClick={() => openEdit(a)} aria-label="Editar">
                      <IcEdit size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <Modal
          title={modal === 'new' ? 'Novo Afiliado' : `Editar — ${modal.name}`}
          onClose={() => setModal(null)}
          footer={
            <>
              <button className="adm-btn adm-btn-ghost" onClick={() => setModal(null)}>Cancelar</button>
              <button className="adm-btn adm-btn-gold" onClick={save}>Salvar</button>
            </>
          }
        >
          <div className="adm-field">
            <label>Nome do afiliado</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex.: Canal do Tigre" />
          </div>
          {modal === 'new' && (
            <div className="adm-field">
              <label>Código do link (slug)</label>
              <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="canaldotigre" />
            </div>
          )}
          <div className="adm-field">
            <label>Modelo de comissão</label>
            <select value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })}>
              <option>RevShare</option>
              <option>CPA</option>
              <option>Híbrido</option>
            </select>
          </div>
          <div className="adm-field">
            <label>Porcentagem de comissão: <strong style={{ color: 'var(--gold-400)' }}>{form.commissionPct}%</strong></label>
            <input type="range" min="0" max="60" value={form.commissionPct} onChange={(e) => setForm({ ...form, commissionPct: e.target.value })} />
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}
