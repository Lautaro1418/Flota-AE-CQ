import { useState } from "react";

// URL del formulario de Tally
const TALLY_URL = "https://tally.so/r/2EvQvA";

export default function LandingPage({ onEnterDashboard, onEnterForms, onEnterAdmin }) {
  const [hoveredCard, setHoveredCard] = useState(null);

  return (
    <div style={s.root}>
      {/* Fondo con grid sutil */}
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
        <div>
          <div style={s.headerTitle}>FLOTA CQ</div>
          <div style={s.headerSub}>Sistema de Gestión de Flota — Logística</div>
        </div>
      </header>

      {/* Contenido central */}
      <main style={s.main}>
        <div style={s.intro}>
          <div style={s.introLabel}>PANEL DE ACCESO</div>
          <h1 style={s.introTitle}>¿Qué querés hacer?</h1>
        </div>

        <div style={s.cards}>
          {/* Card: Tablero de Control */}
          <button
            style={{
              ...s.card,
              ...(hoveredCard === "dashboard" ? s.cardHovered : {}),
              borderColor: hoveredCard === "dashboard" ? "#f59e0b" : "#1f2937",
            }}
            onMouseEnter={() => setHoveredCard("dashboard")}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={onEnterDashboard}
          >
            <div style={{ ...s.cardIcon, background: hoveredCard === "dashboard" ? "#f59e0b22" : "#1f2937" }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5">
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
                <rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
            </div>
            <div style={s.cardContent}>
              <div style={s.cardTitle}>Tablero de Control</div>
              <div style={s.cardDesc}>
                Visualizá el estado de toda la flota, servicios programados, registros NO OK y equipos fuera de servicio.
              </div>
            </div>
            <div style={{ ...s.cardArrow, opacity: hoveredCard === "dashboard" ? 1 : 0.3 }}>
              →
            </div>
          </button>

          {/* Card: Formularios */}
          <button
            style={{
              ...s.card,
              ...(hoveredCard === "forms" ? s.cardHovered : {}),
              borderColor: hoveredCard === "forms" ? "#3b82f6" : "#1f2937",
            }}
            onMouseEnter={() => setHoveredCard("forms")}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={onEnterForms}
          >
            <div style={{ ...s.cardIcon, background: hoveredCard === "forms" ? "#3b82f622" : "#1f2937" }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5">
                <path d="M9 12h6M9 8h6M9 16h4"/>
                <path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/>
              </svg>
            </div>
            <div style={s.cardContent}>
              <div style={{ ...s.cardTitle, color: "#93c5fd" }}>Formularios</div>
              <div style={s.cardDesc}>
                Completá el check diario de la máquina. Abre el formulario de Tally directamente desde acá.
              </div>
            </div>
            <div style={{ ...s.cardArrow, color: "#3b82f6", opacity: hoveredCard === "forms" ? 1 : 0.3 }}>
              →
            </div>
          </button>

          {/* Card: Admin */}
          <button
            style={{
              ...s.card,
              ...(hoveredCard === "admin" ? s.cardHovered : {}),
              borderColor: hoveredCard === "admin" ? "#8b5cf6" : "#1f2937",
            }}
            onMouseEnter={() => setHoveredCard("admin")}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={onEnterAdmin}
          >
            <div style={{ ...s.cardIcon, background: hoveredCard === "admin" ? "#8b5cf622" : "#1f2937" }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="1.5">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                <path d="M18 14l2 2 4-4" strokeWidth="2"/>
              </svg>
            </div>
            <div style={s.cardContent}>
              <div style={{ ...s.cardTitle, color: "#c4b5fd" }}>Administración</div>
              <div style={s.cardDesc}>
                Gestioná la flota, el personal y el calendario de servicios. Requiere contraseña.
              </div>
            </div>
            <div style={{ ...s.cardArrow, color: "#8b5cf6", opacity: hoveredCard === "admin" ? 1 : 0.3 }}>
              →
            </div>
          </button>
        </div>
      </main>

      {/* Footer */}
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
    width: 48,
    height: 48,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#1c1917",
    borderRadius: 10,
    border: "1px solid #f59e0b44",
    flexShrink: 0,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 800,
    letterSpacing: 4,
    color: "#f59e0b",
    textTransform: "uppercase",
  },
  headerSub: {
    fontSize: 11,
    color: "#6b7280",
    letterSpacing: 1,
    marginTop: 2,
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 24px",
    position: "relative",
    zIndex: 1,
  },
  intro: {
    textAlign: "center",
    marginBottom: 48,
  },
  introLabel: {
    fontSize: 11,
    letterSpacing: 4,
    color: "#6b7280",
    textTransform: "uppercase",
    marginBottom: 12,
  },
  introTitle: {
    margin: 0,
    fontSize: 32,
    fontWeight: 800,
    color: "#f3f4f6",
    letterSpacing: 1,
  },
  cards: {
    display: "flex",
    gap: 20,
    flexWrap: "wrap",
    justifyContent: "center",
    width: "100%",
    maxWidth: 800,
  },
  card: {
    flex: "1 1 340px",
    maxWidth: 380,
    display: "flex",
    alignItems: "center",
    gap: 20,
    padding: "28px 24px",
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: 16,
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
  },
  cardHovered: {
    background: "#0d1520",
    transform: "translateY(-2px)",
    boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
  },
  cardIcon: {
    width: 68,
    height: 68,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    flexShrink: 0,
    transition: "background 0.2s",
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 800,
    color: "#fbbf24",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 12,
    color: "#6b7280",
    lineHeight: 1.6,
  },
  cardArrow: {
    fontSize: 22,
    color: "#f59e0b",
    fontWeight: 700,
    transition: "opacity 0.2s",
    flexShrink: 0,
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "16px",
    fontSize: 11,
    color: "#374151",
    letterSpacing: 2,
    position: "relative",
    zIndex: 1,
  },
  footerDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#16a34a",
  },
};
