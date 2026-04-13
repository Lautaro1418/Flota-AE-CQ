import { useState } from "react";

const TALLY_URL = "https://tally.so/r/2EvQvA";

export default function LandingPage({ onEnterDashboard, onEnterForms, onEnterAdmin }) {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [pressedCard, setPressedCard] = useState(null);

  const cards = [
    {
      key: "dashboard",
      title: "Tablero de Control",
      desc: "Status de equipos, calendario de services y registros NO OK",
      color: "var(--accent)",
      colorDim: "var(--accent-dim)",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1.5"/>
          <rect x="14" y="3" width="7" height="7" rx="1.5"/>
          <rect x="3" y="14" width="7" height="7" rx="1.5"/>
          <rect x="14" y="14" width="7" height="7" rx="1.5"/>
        </svg>
      ),
      onClick: onEnterDashboard,
    },
    {
      key: "forms",
      title: "Formularios",
      desc: "Check diario de máquina — completá antes de operar",
      color: "var(--info)",
      colorDim: "var(--info-bg)",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 12h6M9 8h6M9 16h4"/>
          <rect x="4" y="2" width="16" height="20" rx="2"/>
        </svg>
      ),
      onClick: onEnterForms,
    },
    {
      key: "admin",
      title: "Administración",
      desc: "Gestión de flota, personal y calendario de services",
      color: "var(--purple)",
      colorDim: "var(--purple-bg)",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      ),
      onClick: onEnterAdmin,
    },
  ];

  return (
    <div style={s.root}>
      <div style={s.grid} />
      <div style={s.glow} />

      <header style={s.header}>
        <div style={s.logoWrap}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div>
          <div style={s.headerTitle}>Flota CQ</div>
          <div style={s.headerSub}>Sistema de Gestión de Flota — Logística</div>
        </div>
      </header>

      <main style={s.main}>
        <div style={s.intro}>
          <div style={s.introLabel}>Panel de acceso</div>
          <h1 style={s.introTitle}>¿Qué querés hacer?</h1>
        </div>

        <div style={s.cards}>
          {cards.map((card) => {
            const isHovered = hoveredCard === card.key;
            const isPressed = pressedCard === card.key;
            return (
              <button
                key={card.key}
                style={{
                  ...s.card,
                  borderColor: isHovered ? card.color : "var(--border)",
                  background: isHovered ? "var(--bg-elevated)" : "var(--bg-surface)",
                  transform: isPressed ? "scale(0.97)" : isHovered ? "translateY(-2px)" : "none",
                  boxShadow: isHovered ? "var(--shadow-md)" : "none",
                }}
                onMouseEnter={() => setHoveredCard(card.key)}
                onMouseLeave={() => { setHoveredCard(null); setPressedCard(null); }}
                onMouseDown={() => setPressedCard(card.key)}
                onMouseUp={() => setPressedCard(null)}
                onTouchStart={() => { setHoveredCard(card.key); setPressedCard(card.key); }}
                onTouchEnd={() => { setHoveredCard(null); setPressedCard(null); }}
                onClick={card.onClick}
              >
                <div style={{
                  ...s.cardIcon,
                  background: isHovered ? card.colorDim : "var(--bg-surface-2)",
                  color: card.color,
                }}>
                  {card.icon}
                </div>
                <div style={s.cardContent}>
                  <div style={{ ...s.cardTitle, color: card.color }}>{card.title}</div>
                  <div style={s.cardDesc}>{card.desc}</div>
                </div>
                <div style={{
                  ...s.cardArrow,
                  color: card.color,
                  opacity: isHovered ? 1 : 0.25,
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              </button>
            );
          })}
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
    fontFamily: "var(--font-ui)",
    background: "var(--bg-base)",
    color: "var(--text-primary)",
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
      linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
    `,
    backgroundSize: "48px 48px",
    pointerEvents: "none",
  },
  glow: {
    position: "absolute",
    top: "-30%",
    left: "50%",
    transform: "translateX(-50%)",
    width: "600px",
    height: "400px",
    background: "radial-gradient(ellipse, rgba(212,162,62,0.06) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "20px 32px",
    borderBottom: "1px solid var(--border)",
    background: "linear-gradient(180deg, var(--bg-surface) 0%, transparent 100%)",
    position: "relative",
    zIndex: 1,
  },
  logoWrap: {
    width: 48, height: 48,
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "var(--bg-surface-2)", borderRadius: "var(--radius-md)",
    border: "1px solid var(--accent-dim)", flexShrink: 0,
  },
  headerTitle: {
    fontSize: 17, fontWeight: 700, letterSpacing: 0.5, color: "var(--accent)",
  },
  headerSub: {
    fontSize: 12, color: "var(--text-secondary)", marginTop: 2,
  },
  main: {
    flex: 1, display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    padding: "48px 24px", position: "relative", zIndex: 1,
  },
  intro: { textAlign: "center", marginBottom: 48 },
  introLabel: {
    fontSize: 12, letterSpacing: 3, color: "var(--text-tertiary)",
    textTransform: "uppercase", marginBottom: 12, fontWeight: 500,
  },
  introTitle: {
    margin: 0, fontSize: 32, fontWeight: 800, color: "var(--text-primary)",
    letterSpacing: -0.5,
  },
  cards: {
    display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center",
    width: "100%", maxWidth: 900,
  },
  card: {
    flex: "1 1 260px", maxWidth: 300,
    display: "flex", alignItems: "center", gap: 16,
    padding: "22px 20px",
    background: "var(--bg-surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 200ms ease",
    fontFamily: "var(--font-ui)",
    WebkitTapHighlightColor: "transparent",
  },
  cardIcon: {
    width: 56, height: 56,
    display: "flex", alignItems: "center", justifyContent: "center",
    borderRadius: "var(--radius-md)", flexShrink: 0,
    transition: "background 200ms ease",
  },
  cardContent: { flex: 1 },
  cardTitle: {
    fontSize: 15, fontWeight: 700, letterSpacing: 0.3, marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5,
  },
  cardArrow: {
    flexShrink: 0, transition: "opacity 200ms ease",
  },
  footer: {
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: 8, padding: "16px", fontSize: 11, color: "var(--text-muted)",
    letterSpacing: 1, position: "relative", zIndex: 1,
    fontFamily: "var(--font-ui)",
  },
  footerDot: { width: 6, height: 6, borderRadius: "50%", background: "var(--ok)" },
};
