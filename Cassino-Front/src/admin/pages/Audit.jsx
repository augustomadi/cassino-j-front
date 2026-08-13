import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import Modal from '../components/Modal';
import * as adminAuditApi from '../../api/adminAudit';
import { ApiError } from '../../api/http';
import { IcX } from '../components/AdminIcons';

const actorTone = { admin: 'gold', user: 'blue', system: 'gray' };

export default function Audit() {
  const [actorType, setActorType] = useState('todos');
  const [action, setAction] = useState('');
  const [rows, setRows] = useState([]);
  const [pageInfo, setPageInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const load = (page = 1) => {
    setLoading(true);
    adminAuditApi
      .listAuditLogs({
        actor_type: actorType === 'todos' ? undefined : actorType,
        action: action || undefined,
        page,
      })
      .then((res) => {
        setRows(res.data);
        setPageInfo({ current_page: res.current_page, last_page: res.last_page, total: res.total });
        setError(null);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Não foi possível carregar a auditoria.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timeout = setTimeout(() => load(1), 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actorType, action]);

  return (
    <AdminLayout title="Auditoria" subtitle={pageInfo ? `${pageInfo.total} eventos registrados` : 'Carregando...'}>
      <div className="adm-toolbar">
        <div className="adm-input">
          <input placeholder="Filtrar por ação (ex: user.blocked)..." value={action} onChange={(e) => setAction(e.target.value)} />
        </div>
        <select className="adm-select" value={actorType} onChange={(e) => setActorType(e.target.value)}>
          <option value="todos">Todos os atores</option>
          <option value="admin">Staff</option>
          <option value="user">Jogador</option>
          <option value="system">Sistema</option>
        </select>
      </div>

      {error && <p style={{ color: 'var(--red-text)', margin: '12px 0' }}>{error}</p>}

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Ator</th>
              <th>Ação</th>
              <th>Entidade</th>
              <th>IP</th>
            </tr>
          </thead>
          <tbody>
            {!loading && rows.length === 0 && (
              <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-dim)', padding: 28 }}>Nenhum evento encontrado.</td></tr>
            )}
            {rows.map((log) => (
              <tr key={log.id} onClick={() => setSelectedId(log.id)} style={{ cursor: 'pointer' }}>
                <td className="t-sub">{log.created_at ? new Date(log.created_at).toLocaleString('pt-BR') : '—'}</td>
                <td>
                  <span className={`badge ${actorTone[log.actor_type] || 'gray'}`}>{log.actor_type}</span>
                  {log.actor_id && <span className="t-sub" style={{ marginLeft: 6 }}>#{log.actor_id}</span>}
                </td>
                <td><code style={{ fontSize: '0.82rem' }}>{log.action}</code></td>
                <td className="t-sub">{log.entity_type ? `${log.entity_type}${log.entity_id ? ` #${log.entity_id}` : ''}` : '—'}</td>
                <td className="t-sub">{log.ip_address || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pageInfo && pageInfo.last_page > 1 && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 14 }}>
          <button className="adm-btn adm-btn-ghost adm-btn-sm" disabled={pageInfo.current_page <= 1} onClick={() => load(pageInfo.current_page - 1)}>
            Anterior
          </button>
          <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem', alignSelf: 'center' }}>
            {pageInfo.current_page} / {pageInfo.last_page}
          </span>
          <button className="adm-btn adm-btn-ghost adm-btn-sm" disabled={pageInfo.current_page >= pageInfo.last_page} onClick={() => load(pageInfo.current_page + 1)}>
            Próxima
          </button>
        </div>
      )}

      {selectedId && <AuditDetailModal logId={selectedId} onClose={() => setSelectedId(null)} />}
    </AdminLayout>
  );
}

function AuditDetailModal({ logId, onClose }) {
  const [log, setLog] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminAuditApi
      .getAuditLog(logId)
      .then((res) => setLog(res.data))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Não foi possível carregar o evento.'));
  }, [logId]);

  return (
    <Modal title={`Evento #${logId}`} onClose={onClose} footer={<button className="adm-btn adm-btn-ghost" onClick={onClose}><IcX size={14} /> Fechar</button>}>
      {error && <p style={{ color: 'var(--red-text)' }}>{error}</p>}
      {!log && !error && <p style={{ color: 'var(--text-dim)' }}>Carregando...</p>}
      {log && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="adm-kv">
            <div className="adm-kv-item"><small>Ação</small><strong>{log.action}</strong></div>
            <div className="adm-kv-item"><small>Ator</small><strong>{log.actor_type}{log.actor_id ? ` #${log.actor_id}` : ''}</strong></div>
            <div className="adm-kv-item"><small>Entidade</small><strong>{log.entity_type ? `${log.entity_type} #${log.entity_id}` : '—'}</strong></div>
            <div className="adm-kv-item"><small>IP</small><strong>{log.ip_address || '—'}</strong></div>
            <div className="adm-kv-item"><small>Data</small><strong style={{ fontSize: '0.82rem' }}>{log.created_at ? new Date(log.created_at).toLocaleString('pt-BR') : '—'}</strong></div>
          </div>
          {log.user_agent && (
            <div>
              <small style={{ color: 'var(--text-dim)' }}>User agent</small>
              <p style={{ fontSize: '0.78rem', wordBreak: 'break-all' }}>{log.user_agent}</p>
            </div>
          )}
          {log.changes && (
            <div>
              <small style={{ color: 'var(--text-dim)' }}>Alterações</small>
              <pre style={{ fontSize: '0.78rem', background: 'var(--bg-900)', border: '1px solid var(--border)', borderRadius: 8, padding: 10, overflowX: 'auto' }}>
                {JSON.stringify(log.changes, null, 2)}
              </pre>
            </div>
          )}
          {log.context && (
            <div>
              <small style={{ color: 'var(--text-dim)' }}>Contexto</small>
              <pre style={{ fontSize: '0.78rem', background: 'var(--bg-900)', border: '1px solid var(--border)', borderRadius: 8, padding: 10, overflowX: 'auto' }}>
                {JSON.stringify(log.context, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
