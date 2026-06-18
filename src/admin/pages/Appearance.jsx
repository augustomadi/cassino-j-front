import { useState, useEffect, useRef } from 'react';
import AdminLayout from '../components/AdminLayout';
import { useTheme, applyTheme } from '../../theme/ThemeProvider';
import { DEFAULT_THEME } from '../../theme/presets';
import { IcCheck } from '../components/AdminIcons';

export default function Appearance() {
  const { theme, setTheme, presets, reset } = useTheme();

  // Rascunho local: edições aplicam só como PREVIEW até "Salvar".
  const [draft, setDraft] = useState(theme);
  const [saved, setSaved] = useState(false);

  // ref pro tema persistido (usado pra restaurar o preview ao sair sem salvar)
  const persistedRef = useRef(theme);
  useEffect(() => { persistedRef.current = theme; }, [theme]);

  // Preview ao vivo: aplica o rascunho no documento a cada mudança.
  useEffect(() => { applyTheme(draft); }, [draft]);

  // Ao sair da página sem salvar, volta ao tema persistido.
  useEffect(() => () => applyTheme(persistedRef.current), []);

  const dirty =
    draft.primary !== theme.primary || draft.secondary !== theme.secondary;

  const pickPreset = (p) =>
    setDraft({ primary: p.primary, secondary: p.secondary, presetId: p.id });

  const setColor = (key, value) =>
    setDraft((d) => ({ ...d, [key]: value, presetId: 'custom' }));

  const handleSave = () => {
    setTheme(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    reset();
    setDraft(DEFAULT_THEME);
  };

  return (
    <AdminLayout
      title="Aparência"
      subtitle="Personalize as cores da plataforma. Os tons claros/escuros são gerados automaticamente."
      actions={
        <>
          <button className="adm-btn adm-btn-ghost" onClick={handleReset}>
            Restaurar padrão
          </button>
          <button className="adm-btn adm-btn-gold" onClick={handleSave} disabled={!dirty && !saved}>
            {saved ? '✓ Salvo' : 'Salvar tema'}
          </button>
        </>
      }
    >
      {/* ---- Perfis pré-definidos ---- */}
      <div className="adm-card">
        <div className="adm-card-head">
          <h3>Perfis de cores</h3>
          {draft.presetId === 'custom' && <span className="adm-link">Personalizado ativo</span>}
        </div>
        <div className="thm-presets">
          {presets.map((p) => {
            const active = draft.presetId === p.id;
            return (
              <button
                key={p.id}
                className={`thm-preset ${active ? 'is-active' : ''}`}
                onClick={() => pickPreset(p)}
              >
                <span className="thm-preset-swatches">
                  <span style={{ background: p.primary }} />
                  <span style={{ background: p.secondary }} />
                </span>
                <span className="thm-preset-info">
                  <strong>{p.name}</strong>
                  <small>{p.description}</small>
                </span>
                {active && <span className="thm-preset-check"><IcCheck size={16} /></span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="adm-grid adm-cols-2" style={{ marginTop: 16 }}>
        {/* ---- Cores personalizadas ---- */}
        <div className="adm-card">
          <div className="adm-card-head"><h3>Cores personalizadas</h3></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <ColorField
              label="Cor primária (base / fundo)"
              hint="Define fundos e superfícies. Clara = tema claro; escura = tema escuro."
              value={draft.primary}
              onChange={(v) => setColor('primary', v)}
            />
            <ColorField
              label="Cor secundária (acento / ação)"
              hint="Botões, destaques, prêmios. Os tons do acento são derivados dela."
              value={draft.secondary}
              onChange={(v) => setColor('secondary', v)}
            />
          </div>
        </div>

        {/* ---- Pré-visualização ---- */}
        <div className="adm-card">
          <div className="adm-card-head"><h3>Pré-visualização</h3></div>
          <ThemePreview />
        </div>
      </div>
    </AdminLayout>
  );
}

/* Campo de cor: color picker + hex editável (sincronizados) */
function ColorField({ label, hint, value, onChange }) {
  const valid = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);
  return (
    <div className="adm-field">
      <label>{label}</label>
      <div className="thm-color-row">
        <input
          type="color"
          className="thm-color-swatch"
          value={valid ? value : '#000000'}
          onChange={(e) => onChange(e.target.value)}
        />
        <input
          type="text"
          className="thm-color-hex"
          value={value}
          spellCheck={false}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      <small style={{ color: 'var(--text-dim)', fontSize: '0.76rem' }}>{hint}</small>
    </div>
  );
}

/* Amostra de componentes reagindo ao tema em tempo real */
function ThemePreview() {
  return (
    <div className="thm-preview">
      <div className="thm-preview-bar">
        <span className="thm-preview-logo">CASSINO</span>
        <button className="btn btn-gold">Depositar</button>
      </div>
      <div className="thm-preview-card">
        <strong>Fortune Tiger</strong>
        <span className="chip chip-hot">HOT</span>
        <p className="money">R$ 12.500,00</p>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <span className="badge gold">Dourado</span>
        <span className="badge green">Ganho</span>
        <span className="badge red">Perda</span>
        <span className="badge purple">VIP</span>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="adm-btn adm-btn-gold">Ação</button>
        <button className="adm-btn adm-btn-ghost">Secundário</button>
      </div>
    </div>
  );
}
