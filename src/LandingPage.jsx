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
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
      title: "Formulario de Check",
      desc: "Check diario de máquina — completá antes de operar",
      color: "var(--info)",
      colorDim: "var(--info-bg)",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      ),
      onClick: onEnterAdmin,
    },
  ];

  return (
    <div style={s.root}>
      {/* Fondo sutil */}
      <div style={s.grid} />
      <div style={s.glow} />

      {/* Header */}
      <header style={s.header}>
        <div style={s.logoWrap}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div>
          <div style={s.headerTitle}>Flota CQ</div>
          <div style={s.headerSub}>Gestión de Flota · Logística</div>
        </div>
      </header>

      {/* Main */}
      <main style={s.main}>
        <div style={s.intro}>
          <div style={s.introEyebrow}>Sistema de control</div>
          <h1 style={s.introTitle}>Panel de acceso</h1>
          <p style={s.introDesc}>Seleccioná una sección para continuar</p>
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
                  transform: isPressed ? "scale(0.97)" : isHovered ? "translateY(-3px)" : "none",
                  boxShadow: isHovered
                    ? `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${card.color}22`
                    : "none",
                }}
                onMouseEnter={() => setHoveredCard(card.key)}
                onMouseLeave={() => { setHoveredCard(null); setPressedCard(null); }}
                onMouseDown={() => setPressedCard(card.key)}
                onMouseUp={() => setPressedCard(null)}
                onTouchStart={() => { setHoveredCard(card.key); setPressedCard(card.key); }}
                onTouchEnd={() => { setHoveredCard(null); setPressedCard(null); card.onClick(); }}
                onClick={card.onClick}
              >
                <div style={{
                  ...s.cardIcon,
                  background: isHovered ? card.colorDim : "var(--bg-surface-2)",
                  color: card.color,
                  border: `1px solid ${isHovered ? card.color + "33" : "var(--border)"}`,
                }}>
                  {card.icon}
                </div>
                <div style={s.cardContent}>
                  <div style={{ ...s.cardTitle, color: isHovered ? card.color : "var(--text-primary)" }}>
                    {card.title}
                  </div>
                  <div style={s.cardDesc}>{card.desc}</div>
                </div>
                <div style={{ ...s.cardArrow, color: card.color, opacity: isHovered ? 1 : 0.2, transform: isHovered ? "translateX(2px)" : "none", transition: "all 200ms" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              </button>
            );
          })}
        </div>
      </main>

      <footer style={s.footer}>
        <span style={s.footerDot} className="live-dot" />
        <span style={{ fontFamily: "var(--font-mono)", letterSpacing: 1 }}>Sistema activo</span>
      </footer>
    </div>
  );
}

const s = {
  root: {
    fontFamily: "var(--font-ui)",
    background: "var(--bg-base)",
    color: "var(--text-primary)",
    minHeight: "100dvh",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    overflow: "hidden",
  },
  grid: {
    position: "absolute", inset: 0,
    backgroundImage: `linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)`,
    backgroundSize: "52px 52px",
    pointerEvents: "none",
  },
  glow: {
    position: "absolute", top: "-20%", left: "50%",
    transform: "translateX(-50%)",
    width: "700px", height: "350px",
    background: "radial-gradient(ellipse, rgba(232,200,122,0.05) 0%, transparent 65%)",
    pointerEvents: "none",
  },
  header: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "18px 28px",
    borderBottom: "1px solid var(--border)",
    background: "var(--bg-surface)",
    position: "relative", zIndex: 1,
  },
  logoWrap: {
    width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center",
    background: "var(--bg-surface-2)", borderRadius: "var(--radius-sm)",
    border: "1px solid var(--accent-dim)", flexShrink: 0,
  },
  headerTitle: { fontSize: 15, fontWeight: 700, color: "var(--accent)", letterSpacing: 0.3 },
  headerSub:   { fontSize: 11, color: "var(--text-tertiary)", marginTop: 2 },
  main: {
    flex: 1, display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    padding: "48px 20px 32px",
    position: "relative", zIndex: 1,
  },
  intro: { textAlign: "center", marginBottom: 40 },
  introEyebrow: {
    display: "inline-block",
    fontSize: 10, fontWeight: 600, letterSpacing: 2.5,
    color: "var(--accent)", textTransform: "uppercase",
    background: "var(--accent-dim)", border: "1px solid rgba(232,200,122,0.2)",
    padding: "4px 12px", borderRadius: "var(--radius-pill)",
    marginBottom: 16, fontFamily: "var(--font-mono)",
  },
  introTitle: {
    fontSize: "clamp(26px, 5vw, 36px)", fontWeight: 800,
    color: "var(--text-primary)", letterSpacing: -0.8, margin: "0 0 12px",
  },
  introDesc: { fontSize: 13, color: "var(--text-tertiary)", margin: 0 },
  cards: {
    display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center",
    width: "100%", maxWidth: 860,
  },
  card: {
    flex: "1 1 240px", maxWidth: 280,
    display: "flex", alignItems: "center", gap: 14,
    padding: "18px 16px",
    background: "var(--bg-surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    cursor: "pointer", textAlign: "left",
    transition: "all 200ms ease",
    fontFamily: "var(--font-ui)",
    WebkitTapHighlightColor: "transparent",
    minHeight: "var(--tap-target)",
  },
  cardIcon: {
    width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center",
    borderRadius: "var(--radius-sm)", flexShrink: 0,
    transition: "all 200ms ease",
  },
  cardContent: { flex: 1, minWidth: 0 },
  cardTitle: {
    fontSize: 14, fontWeight: 700, letterSpacing: 0.2, marginBottom: 3,
    transition: "color 200ms",
  },
  cardDesc: { fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.5 },
  cardArrow: { flexShrink: 0 },
  footer: {
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: 8, padding: "20px", fontSize: 11, color: "var(--text-muted)",
    position: "relative", zIndex: 1,
  },
  footerDot: {
    width: 6, height: 6, borderRadius: "50%", background: "var(--ok)", display: "inline-block",
  },
};
