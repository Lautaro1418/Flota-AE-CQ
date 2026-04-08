const TALLY_URL = "https://tally.so/r/2EvQvA";

export default function FormsPage({ onBack }) {
  return (
    <div style={s.root}>
      <div style={s.grid} />

      {/* Header */}
      <header style={s.header}>
        <div style={s.logoWrap}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={s.headerTitle}>FLOTA CQ</div>
          <div style={s.headerSub}>Formularios</div>
        </div>
        <button onClick={onBack} style={s.backBtn}>← Inicio</button>
      </header>

      {/* Contenido */}
      <main style={s.main}>
        <div style={s.intro}>
          <div style={s.introLabel}>CHECK DIARIO DE MÁQUINA</div>
          <h1 style={s.introTitle}>Completá el formulario</h1>
          <p style={s.introDesc}>
            Antes de usar cualquier equipo, completá el checklist de seguridad y mecánico.
            Es obligatorio una vez por turno.
          </p>
        </div>

        <button
          style={s.mainBtn}
          onClick={() => window.open(TALLY_URL, "_blank")}
          onMouseEnter={(e) => e.currentTarget.style.background = "#1d4ed8"}
          onMouseLeave={(e) => e.currentTarget.style.background = "#2563eb"}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M9 12h6M9 8h6M9 16h4"/>
            <path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/>
          </svg>
          Abrir formulario de check
        </button>

        <div style={s.note}>
          Se abre en una nueva pestaña del navegador
        </div>
      </main>

      <footer style={s.footer}>
        <span style={s.footerDot} />
        Sistema activo
      </footer>
    </div>
  );
}

const s = {
  root: {
    fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
    background: "#0a0f1a",
    color: "#e5e7eb",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    overflow: "hidden",
  },
  grid: {
    position: "absolute",
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
    `,
    backgroundSize: "40px 40px",
    pointerEvents: "none",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "20px 32px",
    borderBottom: "1px solid #1f2937",
    background: "linear-gradient(180deg, #111827 0%, transparent 100%)",
    position: "relative",
    zIndex: 1,
  },
  logoWrap: {
    width: 48, height: 48,
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "#1c1917", borderRadius: 10, border: "1px solid #f59e0b44", flexShrink: 0,
  },
  headerTitle: {
    fontSize: 16, fontWeight: 800, letterSpacing: 4, color: "#f59e0b", textTransform: "uppercase",
  },
  headerSub: { fontSize: 11, color: "#6b7280", letterSpacing: 1, marginTop: 2 },
  backBtn: {
    background: "transparent", border: "1px solid #1f2937", color: "#6b7280",
    padding: "8px 16px", borderRadius: 8, cursor: "pointer",
    fontFamily: "inherit", fontSize: 12, fontWeight: 600, flexShrink: 0,
  },
  main: {
    flex: 1, display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    padding: "48px 24px", position: "relative", zIndex: 1, textAlign: "center",
  },
  intro: { marginBottom: 40, maxWidth: 480 },
  introLabel: {
    fontSize: 11, letterSpacing: 4, color: "#6b7280",
    textTransform: "uppercase", marginBottom: 12,
  },
  introTitle: {
    margin: "0 0 16px", fontSize: 32, fontWeight: 800, color: "#f3f4f6", letterSpacing: 1,
  },
  introDesc: {
    margin: 0, fontSize: 13, color: "#6b7280", lineHeight: 1.7,
  },
  mainBtn: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "18px 36px", fontSize: 14, fontWeight: 700,
    background: "#2563eb", color: "white",
    border: "none", borderRadius: 12, cursor: "pointer",
    fontFamily: "inherit", letterSpacing: 0.5,
    transition: "background 0.15s",
    boxShadow: "0 8px 24px rgba(37,99,235,0.35)",
  },
  note: {
    marginTop: 16, fontSize: 11, color: "#374151", letterSpacing: 1,
  },
  footer: {
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: 8, padding: "16px", fontSize: 11, color: "#374151",
    letterSpacing: 2, position: "relative", zIndex: 1,
  },
  footerDot: { width: 6, height: 6, borderRadius: "50%", background: "#16a34a" },
};
