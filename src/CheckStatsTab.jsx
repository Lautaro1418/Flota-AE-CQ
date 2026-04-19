import { useState, useMemo } from "react";

// ═══════════════════════════════════════════════════════════════
// CHECK STATS TAB — Completitud de formulario
// Cruza: checks (sector_operario, operario, equipo) × flota (sector_equipo)
// ═══════════════════════════════════════════════════════════════
export default function CheckStatsTab({ checksData, flota, isMobile }) {
  const [view, setView] = useState("equipo"); // "equipo" | "operario" | "sector_operario" | "sector_equipo"
  const [periodo, setPeriodo] = useState(30); // días

  // ── Filtrar por período ──────────────────────────────────────
  const cutoff = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - periodo);
    return d.toISOString().split("T")[0];
  }, [periodo]);

  const filtered = useMemo(
    () => checksData.filter((c) => (c.fecha || "") >= cutoff),
    [checksData, cutoff]
  );

  // ── Mapa equipo id_corto → sector_equipo ────────────────────
  const sectorEquipoMap = useMemo(() => {
    const m = {};
    flota.forEach((eq) => { if (eq.sector) m[eq.id] = eq.sector; });
    return m;
  }, [flota]);

  // ── Agrupaciones ────────────────────────────────────────────
  const byEquipo = useMemo(() => {
    const m = {};
    filtered.forEach((c) => {
      const key = c.equipo || "Sin equipo";
      m[key] = (m[key] || 0) + 1;
    });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [filtered]);

  const byOperario = useMemo(() => {
    const m = {};
    filtered.forEach((c) => {
      const key = c.operario || "Sin operario";
      m[key] = (m[key] || 0) + 1;
    });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [filtered]);

  const bySectorOperario = useMemo(() => {
    const m = {};
    filtered.forEach((c) => {
      // La columna en la tabla checks se llama "area" (sector del operario)
      const key = c.area || "Sin sector";
      m[key] = (m[key] || 0) + 1;
    });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [filtered]);

  const bySectorEquipo = useMemo(() => {
    // Usa equipoMap para cruzar el equipo del check con el sector de la flota
    const m = {};
    filtered.forEach((c) => {
      const equipoNorm = (c.equipo || "").trim().toUpperCase().replace(/N[°º]/g, "N°").replace(/\s+/g, " ");
      // Buscar id_corto en flota por nombre
      const flotaMatch = flota.find(
        (eq) => eq.name?.trim().toUpperCase().replace(/N[°º]/g, "N°").replace(/\s+/g, " ") === equipoNorm
          || eq.name?.trim().toUpperCase() === (c.equipo || "").trim().toUpperCase()
      );
      const sector = flotaMatch?.sector || "Sin asignar";
      m[sector] = (m[sector] || 0) + 1;
    });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [filtered, flota]);

  // ── KPIs ────────────────────────────────────────────────────
  const totalChecks = filtered.length;
  const equiposUnicos = new Set(filtered.map((c) => c.equipo)).size;
  const operariosUnicos = new Set(filtered.map((c) => c.operario)).size;
  const promPorDia = periodo > 0 ? (totalChecks / periodo).toFixed(1) : 0;

  // ── Datos activos según vista ────────────────────────────────
  const activeData = {
    equipo: byEquipo,
    operario: byOperario,
    sector_operario: bySectorOperario,
    sector_equipo: bySectorEquipo,
  }[view];

  const maxVal = activeData.length > 0 ? activeData[0][1] : 1;

  const VIEWS = [
    { key: "equipo",          label: "Por equipo" },
    { key: "operario",        label: "Por operario" },
    { key: "sector_operario", label: "Sector operario" },
    { key: "sector_equipo",   label: "Sector equipo" },
  ];

  const PERIODOS = [
    { val: 7,   label: "7 días" },
    { val: 14,  label: "14 días" },
    { val: 30,  label: "30 días" },
    { val: 90,  label: "90 días" },
  ];

  // ── Color barra según ranking ────────────────────────────────
  const barColor = (ratio) => {
    if (ratio >= 0.8) return "var(--ok)";
    if (ratio >= 0.4) return "var(--accent)";
    return "var(--text-secondary)";
  };

  return (
    <div>
      {/* ── KPIs ── */}
      <div style={s.kpiRow}>
        <KpiCard label="Checks en período" value={totalChecks} color="var(--accent)" />
        <KpiCard label="Equipos distintos" value={equiposUnicos} color="var(--info)" />
        <KpiCard label="Operarios distintos" value={operariosUnicos} color="var(--purple)" />
        <KpiCard label="Promedio / día" value={promPorDia} color="var(--ok)" />
      </div>

      {/* ── Controles ── */}
      <div style={s.controls}>
        <div style={s.controlGroup}>
          <label style={s.ctrlLabel}>Período</label>
          <div style={s.pillGroup}>
            {PERIODOS.map((p) => (
              <button key={p.val} onClick={() => setPeriodo(p.val)}
                style={{ ...s.pill, ...(periodo === p.val ? s.pillActive : {}) }}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div style={s.controlGroup}>
          <label style={s.ctrlLabel}>Agrupar por</label>
          <div style={s.pillGroup}>
            {VIEWS.map((v) => (
              <button key={v.key} onClick={() => setView(v.key)}
                style={{ ...s.pill, ...(view === v.key ? s.pillActive : {}) }}>
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Ayuda contextual ── */}
      {(view === "sector_operario" || view === "sector_equipo") && (
        <div style={s.infoBanner}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
          </svg>
          {view === "sector_operario"
            ? "Sector del operario que completó el formulario (campo 'Área operativa' del check)."
            : "Sector al que pertenece el equipo según la tabla de Flota. Equipos sin sector asignado aparecen como 'Sin asignar'."}
        </div>
      )}

      {/* ── Gráfico de barras horizontal ── */}
      {activeData.length === 0 ? (
        <div style={s.empty}>Sin datos para el período seleccionado.</div>
      ) : (
        <div style={s.chartWrap}>
          <div style={s.chartTitle}>
            {VIEWS.find(v => v.key === view)?.label} — últimos {periodo} días
            <span style={s.chartCount}>{totalChecks} checks · {activeData.length} grupos</span>
          </div>
          <div style={s.bars}>
            {activeData.map(([label, count], i) => {
              const ratio = count / maxVal;
              return (
                <div key={label} style={s.barRow}>
                  <div style={s.barLabel} title={label}>{label}</div>
                  <div style={s.barTrack}>
                    <div style={{
                      ...s.barFill,
                      width: `${ratio * 100}%`,
                      background: barColor(ratio),
                      opacity: 0.85 + ratio * 0.15,
                    }}/>
                  </div>
                  <div style={{ ...s.barCount, color: barColor(ratio) }}>{count}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Tabla detalle ── */}
      {activeData.length > 0 && (
        <div style={s.tableSection}>
          <div style={s.tableTitle}>Detalle completo</div>
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>#</th>
                  <th style={s.th}>{VIEWS.find(v => v.key === view)?.label.replace("Por ", "").replace("Sector ", "")}</th>
                  <th style={s.th}>Checks</th>
                  <th style={s.th}>% del total</th>
                </tr>
              </thead>
              <tbody>
                {activeData.map(([label, count], i) => (
                  <tr key={label} style={s.tr}>
                    <td style={{ ...s.td, color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 11, width: 32 }}>{i + 1}</td>
                    <td style={{ ...s.td, fontWeight: 600, color: "var(--text-primary)" }}>{label}</td>
                    <td style={{ ...s.td, fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--accent)", fontSize: 13 }}>{count}</td>
                    <td style={s.td}>
                      <span style={{
                        ...s.pctBadge,
                        color: barColor(count / maxVal),
                        background: count / maxVal >= 0.8 ? "var(--ok-bg)" : count / maxVal >= 0.4 ? "var(--accent-dim)" : "var(--bg-surface-2)",
                        border: `1px solid ${count / maxVal >= 0.8 ? "var(--ok-border)" : count / maxVal >= 0.4 ? "rgba(232,200,122,0.2)" : "var(--border)"}`,
                      }}>
                        {((count / totalChecks) * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── KPI Card ────────────────────────────────────────────────────
function KpiCard({ label, value, color }) {
  return (
    <div style={{ ...s.kpiCard, borderColor: `${color}22` }}>
      <div style={{ ...s.kpiValue, color }}>{value}</div>
      <div style={s.kpiLabel}>{label}</div>
    </div>
  );
}

// ── Estilos ─────────────────────────────────────────────────────
const s = {
  kpiRow: { display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" },
  kpiCard: { flex: "1 1 130px", minWidth: 120, padding: "14px 16px", background: "var(--bg-surface)", border: "1px solid", borderRadius: "var(--radius-md)", display: "flex", flexDirection: "column", gap: 5 },
  kpiValue: { fontSize: 26, fontWeight: 800, fontFamily: "var(--font-mono)", lineHeight: 1 },
  kpiLabel: { fontSize: 10, color: "var(--text-secondary)", fontWeight: 500, lineHeight: 1.3 },

  controls: { display: "flex", gap: 20, marginBottom: 16, flexWrap: "wrap", alignItems: "flex-start" },
  controlGroup: { display: "flex", flexDirection: "column", gap: 6 },
  ctrlLabel: { fontSize: 10, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600 },
  pillGroup: { display: "flex", gap: 6, flexWrap: "wrap" },
  pill: { padding: "5px 12px", fontSize: 11, fontWeight: 600, background: "var(--bg-surface-2)", color: "var(--text-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-pill)", cursor: "pointer", fontFamily: "var(--font-ui)", transition: "all 150ms" },
  pillActive: { background: "var(--accent-dim)", color: "var(--accent)", borderColor: "rgba(232,200,122,0.3)" },

  infoBanner: { display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "var(--info-bg)", border: "1px solid var(--info-border)", borderRadius: "var(--radius-sm)", color: "var(--info)", fontSize: 11, marginBottom: 14 },

  empty: { padding: "40px", textAlign: "center", color: "var(--text-muted)", background: "var(--bg-surface)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", fontSize: 13 },

  chartWrap: { background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "16px 18px", marginBottom: 20 },
  chartTitle: { fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6 },
  chartCount: { fontSize: 11, color: "var(--text-secondary)", background: "var(--bg-surface-2)", padding: "2px 8px", borderRadius: "var(--radius-pill)", fontWeight: 400 },
  bars: { display: "flex", flexDirection: "column", gap: 8 },
  barRow: { display: "flex", alignItems: "center", gap: 10, minHeight: 28 },
  barLabel: { fontSize: 11, color: "var(--text-secondary)", minWidth: 120, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flexShrink: 0, fontFamily: "var(--font-mono)", fontWeight: 500 },
  barTrack: { flex: 1, height: 20, background: "var(--bg-surface-2)", borderRadius: "var(--radius-xs)", overflow: "hidden", position: "relative" },
  barFill: { height: "100%", borderRadius: "var(--radius-xs)", transition: "width 400ms ease" },
  barCount: { fontSize: 12, fontWeight: 700, fontFamily: "var(--font-mono)", minWidth: 30, textAlign: "right", flexShrink: 0 },

  tableSection: { marginTop: 8 },
  tableTitle: { fontSize: 12, color: "var(--text-secondary)", fontWeight: 600, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.8 },
  tableWrap: { borderRadius: "var(--radius-md)", border: "1px solid var(--border)", overflow: "hidden", overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: { padding: "9px 12px", textAlign: "left", background: "var(--bg-surface)", color: "var(--text-secondary)", fontWeight: 600, fontSize: 10, letterSpacing: 0.5, borderBottom: "1px solid var(--border)", whiteSpace: "nowrap", textTransform: "uppercase" },
  tr: { borderBottom: "1px solid var(--border-subtle)" },
  td: { padding: "10px 12px", verticalAlign: "middle" },
  pctBadge: { padding: "3px 8px", borderRadius: "var(--radius-pill)", fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono)" },
};
