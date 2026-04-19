const TALLY_URL = "https://tally.so/r/2EvQvA";

export default function FormsPage({ onBack }) {
  return (
    <div style={s.root}>
      <div style={s.grid}/>
      <div style={s.glow}/>
      <header style={s.header}>
        <div style={s.logoWrap}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div style={{flex:1}}>
          <div style={s.headerTitle}>Flota CQ</div>
          <div style={s.headerSub}>Formularios</div>
        </div>
        <button onClick={onBack} style={s.backBtn}>← Inicio</button>
      </header>
      <main style={s.main}>
        <div style={s.card}>
          <div style={s.cardIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--info)" strokeWidth="1.8">
              <path d="M9 12h6M9 8h6M9 16h4"/><rect x="4" y="2" width="16" height="20" rx="2"/>
            </svg>
          </div>
          <div style={s.introEyebrow}>Obligatorio · Una vez por turno</div>
          <h1 style={s.introTitle}>Check diario de máquina</h1>
          <p style={s.introDesc}>
            Antes de operar cualquier equipo, completá el checklist de seguridad y mecánico.
          </p>
          <button style={s.mainBtn}
            onClick={()=>window.open(TALLY_URL,"_blank")}
            onMouseEnter={(e)=>e.currentTarget.style.background="rgba(91,156,246,0.18)"}
            onMouseLeave={(e)=>e.currentTarget.style.background="var(--info-bg)"}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M9 12h6M9 8h6M9 16h4"/><rect x="4" y="2" width="16" height="20" rx="2"/>
            </svg>
            Abrir formulario de check
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{marginLeft:4}}><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </button>
          <div style={s.note}>Se abre en una nueva pestaña</div>
        </div>
      </main>
      <footer style={s.footer}>
        <span style={s.footerDot} className="live-dot"/>
        <span style={{fontFamily:"var(--font-mono)",letterSpacing:1}}>Sistema activo</span>
      </footer>
    </div>
  );
}

const s = {
  root: {fontFamily:"var(--font-ui)",background:"var(--bg-base)",color:"var(--text-primary)",minHeight:"100dvh",display:"flex",flexDirection:"column",position:"relative",overflow:"hidden"},
  grid: {position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",backgroundSize:"52px 52px",pointerEvents:"none"},
  glow: {position:"absolute",top:"-15%",left:"50%",transform:"translateX(-50%)",width:"600px",height:"350px",background:"radial-gradient(ellipse, rgba(91,156,246,0.06) 0%, transparent 65%)",pointerEvents:"none"},
  header: {display:"flex",alignItems:"center",gap:12,padding:"14px 20px",borderBottom:"1px solid var(--border)",background:"var(--bg-surface)",position:"relative",zIndex:1},
  logoWrap: {width:40,height:40,display:"flex",alignItems:"center",justifyContent:"center",background:"var(--bg-surface-2)",borderRadius:"var(--radius-sm)",border:"1px solid var(--accent-dim)",flexShrink:0},
  headerTitle: {fontSize:14,fontWeight:700,color:"var(--accent)"},
  headerSub: {fontSize:11,color:"var(--text-tertiary)",marginTop:2},
  backBtn: {background:"transparent",border:"1px solid var(--border)",color:"var(--text-secondary)",padding:"7px 14px",borderRadius:"var(--radius-sm)",cursor:"pointer",fontFamily:"var(--font-ui)",fontSize:12,fontWeight:500,flexShrink:0,minHeight:36},
  main: {flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 20px",position:"relative",zIndex:1},
  card: {background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:"var(--radius-xl)",padding:"36px 32px",width:"100%",maxWidth:440,textAlign:"center",boxShadow:"var(--shadow-lg)"},
  cardIcon: {width:64,height:64,display:"flex",alignItems:"center",justifyContent:"center",background:"var(--info-bg)",borderRadius:"var(--radius-md)",border:"1px solid var(--info-border)",margin:"0 auto 20px"},
  introEyebrow: {fontSize:10,fontWeight:600,letterSpacing:2,color:"var(--info)",textTransform:"uppercase",marginBottom:12,fontFamily:"var(--font-mono)"},
  introTitle: {fontSize:"clamp(22px, 5vw, 28px)",fontWeight:800,color:"var(--text-primary)",letterSpacing:-0.5,margin:"0 0 14px"},
  introDesc: {fontSize:13,color:"var(--text-secondary)",lineHeight:1.7,margin:"0 0 28px"},
  mainBtn: {display:"inline-flex",alignItems:"center",gap:10,padding:"13px 24px",fontSize:13,fontWeight:700,background:"var(--info-bg)",color:"var(--info)",border:"1px solid var(--info-border)",borderRadius:"var(--radius-md)",cursor:"pointer",fontFamily:"var(--font-ui)",transition:"background 150ms",width:"100%",justifyContent:"center",minHeight:48},
  note: {marginTop:12,fontSize:11,color:"var(--text-muted)"},
  footer: {display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"20px",fontSize:11,color:"var(--text-muted)",position:"relative",zIndex:1},
  footerDot: {width:6,height:6,borderRadius:"50%",background:"var(--ok)",display:"inline-block"},
};
