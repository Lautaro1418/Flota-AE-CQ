const TALLY_URL = "https://tally.so/r/2EvQvA";

export default function FormsPage({ onBack }) {
  return (
    <div style={s.root}>
      <div style={s.grid} />
      <header style={s.header}>
        <div style={s.logoWrap}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={s.headerTitle}>Flota CQ</div>
          <div style={s.headerSub}>Formularios</div>
        </div>
        <button onClick={onBack} style={s.backBtn}>← Inicio</button>
      </header>
      <main style={s.main}>
        <div style={s.intro}>
          <div style={s.introLabel}>Check diario de máquina</div>
          <h1 style={s.introTitle}>Completá el formulario</h1>
          <p style={s.introDesc}>
            Antes de usar cualquier equipo, completá el checklist de seguridad y mecánico.
            Es obligatorio una vez por turno.
          </p>
        </div>
        <button style={s.mainBtn} onClick={() => window.open(TALLY_URL, "_blank")}
          onMouseEnter={(e) => e.currentTarget.style.background = "#1d4ed8"}
          onMouseLeave={(e) => e.currentTarget.style.background = "#2563eb"}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M9 12h6M9 8h6M9 16h4"/>
            <rect x="4" y="2" width="16" height="20" rx="2"/>
          </svg>
          Abrir formulario de check
        </button>
        <div style={s.note}>Se abre en una nueva pestaña del navegador</div>
      </main>
      <footer style={s.footer}><span style={s.footerDot} />Sistema activo</footer>
    </div>
  );
}

const s = {
  root: { fontFamily: "var(--font-ui)", background: "var(--bg-base)", color: "var(--text-primary)", minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" },
  grid: { position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)", backgroundSize: "48px 48px", pointerEvents: "none" },
  header: { display: "flex", alignItems: "center", gap: 14, padding: "20px 32px", borderBottom: "1px solid var(--border)", background: "linear-gradient(180deg, var(--bg-surface) 0%, transparent 100%)", position: "relative", zIndex: 1 },
  logoWrap: { width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-surface-2)", borderRadius: "var(--radius-md)", border: "1px solid var(--accent-dim)", flexShrink: 0 },
  headerTitle: { fontSize: 17, fontWeight: 700, letterSpacing: 0.5, color: "var(--accent)" },
  headerSub: { fontSize: 12, color: "var(--text-secondary)", marginTop: 2 },
  backBtn: { background: "transparent", border: "1px solid var(--border)", color: "var(--text-secondary)", padding: "8px 16px", borderRadius: "var(--radius-sm)", cursor: "pointer", fontFamily: "var(--font-ui)", fontSize: 12, fontWeight: 500, flexShrink: 0 },
  main: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px", position: "relative", zIndex: 1, textAlign: "center" },
  intro: { marginBottom: 40, maxWidth: 480 },
  introLabel: { fontSize: 12, letterSpacing: 3, color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: 12, fontWeight: 500 },
  introTitle: { margin: "0 0 16px", fontSize: 32, fontWeight: 800, color: "var(--text-primary)", letterSpacing: -0.5 },
  introDesc: { margin: 0, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 },
  mainBtn: { display: "flex", alignItems: "center", gap: 12, padding: "16px 32px", fontSize: 14, fontWeight: 600, background: "#2563eb", color: "white", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", fontFamily: "var(--font-ui)", transition: "background 150ms", boxShadow: "0 8px 24px rgba(37,99,235,0.3)" },
  note: { marginTop: 16, fontSize: 11, color: "var(--text-muted)", letterSpacing: 0.5 },
  footer: { display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "16px", fontSize: 11, color: "var(--text-muted)", letterSpacing: 1, position: "relative", zIndex: 1, fontFamily: "var(--font-ui)" },
  footerDot: { width: 6, height: 6, borderRadius: "50%", background: "var(--ok)" },
};
