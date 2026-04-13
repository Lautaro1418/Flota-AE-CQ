import { useState } from "react";

export default function FueraDeServicio({ records, equipment, onAdd, onResolve, isMobile }) {
  const [form, setForm] = useState({
    equipmentId: equipment[0]?.id || "",
    startDate: new Date().toISOString().split("T")[0],
    reason: "",
  });
  const [formError, setFormError] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const active = records.filter((r) => !r.resolved);
  const resolved = records.filter((r) => r.resolved).sort((a, b) => b.resolvedDate?.localeCompare(a.resolvedDate));

  const handleAdd = () => {
    if (!form.reason.trim()) { setFormError("Ingresá el motivo del fuera de servicio."); return; }
    const eq = equipment.find((e) => e.id === form.equipmentId);
    onAdd({ equipmentId: form.equipmentId, equipmentName: eq?.name || form.equipmentId,
      sector: eq?.sector || "—", type: eq?.type || "—", startDate: form.startDate, reason: form.reason.trim() });
    setForm({ equipmentId: equipment[0]?.id || "", startDate: new Date().toISOString().split("T")[0], reason: "" });
    setFormError("");
  };

  const daysSince = (dateStr) => Math.floor((new Date() - new Date(dateStr)) / 86400000);

  return (
    <div>
      {/* Summary */}
      <div style={s.summaryRow}>
        <div style={{ ...s.summaryCard, borderColor: "var(--danger-border)", background: "var(--danger-bg)" }}>
          <span style={{ fontSize: 26, fontWeight: 800, color: "var(--danger)" }}>{active.length}</span>
          <span style={s.summaryLabel}>Fuera de servicio activos</span>
        </div>
        <div style={{ ...s.summaryCard, borderColor: "var(--ok-border)", background: "var(--ok-bg)" }}>
          <span style={{ fontSize: 26, fontWeight: 800, color: "var(--ok)" }}>{resolved.length}</span>
          <span style={s.summaryLabel}>Dados de alta históricamente</span>
        </div>
        <div style={{ ...s.summaryCard, borderColor: "var(--border)", background: "var(--bg-surface)" }}>
          <span style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)" }}>
            {active.length > 0 ? Math.round(active.reduce((acc, r) => acc + daysSince(r.startDate), 0) / active.length) : 0}d
          </span>
          <span style={s.summaryLabel}>Días promedio fuera (activos)</span>
        </div>
      </div>

      {/* Form */}
      <div style={s.formPanel}>
        <h3 style={s.panelTitle}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>
          Registrar equipo fuera de servicio
        </h3>
        <div style={s.formGrid} className="fds-form-grid">
          <div style={s.formGroup}>
            <label style={s.label}>Equipo</label>
            <select style={s.select} value={form.equipmentId}
              onChange={(e) => setForm((f) => ({ ...f, equipmentId: e.target.value }))}>
              {equipment.map((eq) => <option key={eq.id} value={eq.id}>{eq.id} — {eq.name}</option>)}
            </select>
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>Fecha de inicio</label>
            <input type="date" style={s.input} value={form.startDate}
              onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
          </div>
        </div>
        <div style={s.formGroup}>
          <label style={s.label}>Motivo / Descripción de la falla</label>
          <textarea style={{ ...s.input, resize: "vertical", minHeight: 72 }}
            placeholder="Ej: Pérdida de aceite hidráulico en cilindro de elevación."
            value={form.reason}
            onChange={(e) => { setForm((f) => ({ ...f, reason: e.target.value })); setFormError(""); }} />
          {formError && <span style={s.errorMsg}>{formError}</span>}
        </div>
        <button style={s.btnPrimary} onClick={handleAdd}>Registrar fuera de servicio</button>
      </div>

      {/* Active */}
      <div style={s.section}>
        <h3 style={s.sectionTitle}>
          Equipos actualmente fuera de servicio
          <span style={s.countBadge}>{active.length}</span>
        </h3>
        {active.length === 0 ? (
          <div style={s.emptyState}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
            <p style={{ margin: "8px 0 0" }}>Toda la flota operativa — ningún equipo fuera de servicio.</p>
          </div>
        ) : (
          <div style={s.tableWrap} className="fleet-table-container">
            <table style={s.table}>
              <thead><tr>
                <th style={s.th}>Equipo</th>
                <th style={s.th} className="fds-table-col-type">Tipo</th>
                <th style={s.th} className="fds-table-col-sector">Sector</th>
                <th style={s.th}>Desde</th>
                <th style={s.th}>Días</th>
                <th style={s.th}>Motivo</th>
                <th style={{ ...s.th, color: "var(--ok)" }}>Alta</th>
              </tr></thead>
              <tbody>
                {active.map((r) => {
                  const days = daysSince(r.startDate);
                  return (
                    <tr key={r.id} style={s.tr}>
                      <td style={{ ...s.td, fontWeight: 600 }}>
                        <div style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)", fontSize: 13 }}>{r.equipmentId}</div>
                        <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{r.equipmentName}</div>
                      </td>
                      <td style={s.td} className="fds-table-col-type"><span style={s.typeBadge}>{r.type}</span></td>
                      <td style={s.td} className="fds-table-col-sector">{r.sector}</td>
                      <td style={{ ...s.td, fontFamily: "var(--font-mono)", color: "var(--text-secondary)", whiteSpace: "nowrap", fontSize: 12 }}>
                        {new Date(r.startDate).toLocaleDateString("es-AR", { day: "2-digit", month: "short" })}
                      </td>
                      <td style={s.td}>
                        <span style={{
                          ...s.daysBadge,
                          color: days > 7 ? "var(--danger)" : days > 3 ? "var(--warn)" : "var(--text-secondary)",
                          background: days > 7 ? "var(--danger-bg)" : days > 3 ? "var(--warn-bg)" : "var(--bg-surface-2)",
                        }}>{days}d</span>
                      </td>
                      <td style={{ ...s.td, fontSize: 12, color: "var(--text-primary)", maxWidth: 220 }}>{r.reason}</td>
                      <td style={s.td}>
                        <button style={s.btnResolve} onClick={() => onResolve(r.id)}>✓ Dar de alta</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* History */}
      <div style={s.section}>
        <button style={s.historyToggle} onClick={() => setShowHistory((v) => !v)}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d={showHistory ? "M6 9l6 6 6-6" : "M9 18l6-6-6-6"} />
          </svg>
          Historial de altas ({resolved.length})
        </button>
        {showHistory && resolved.length > 0 && (
          <div style={{ ...s.tableWrap, marginTop: 12 }} className="fleet-table-container">
            <table style={s.table}>
              <thead><tr>
                <th style={s.th}>Equipo</th><th style={s.th}>Ingresó</th>
                <th style={s.th}>Alta</th><th style={s.th}>Días fuera</th><th style={s.th}>Motivo</th>
              </tr></thead>
              <tbody>
                {resolved.map((r) => {
                  const totalDays = r.resolvedDate ? Math.round((new Date(r.resolvedDate) - new Date(r.startDate)) / 86400000) : "—";
                  return (
                    <tr key={r.id} style={{ ...s.tr, opacity: 0.65 }}>
                      <td style={{ ...s.td, fontWeight: 600 }}>
                        <div style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)", fontSize: 12 }}>{r.equipmentId}</div>
                        <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{r.equipmentName}</div>
                      </td>
                      <td style={{ ...s.td, fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-secondary)" }}>
                        {new Date(r.startDate).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "2-digit" })}
                      </td>
                      <td style={{ ...s.td, fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ok)" }}>
                        {r.resolvedDate ? new Date(r.resolvedDate).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "2-digit" }) : "—"}
                      </td>
                      <td style={{ ...s.td, fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-secondary)" }}>{totalDays}d</td>
                      <td style={{ ...s.td, fontSize: 12, color: "var(--text-tertiary)", maxWidth: 200 }}>{r.reason}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  summaryRow: { display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" },
  summaryCard: { flex: "1 1 160px", minWidth: 140, padding: "14px 16px", borderRadius: "var(--radius-md)", border: "1px solid", display: "flex", flexDirection: "column", gap: 4 },
  summaryLabel: { fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.3 },
  formPanel: { background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "18px 20px", marginBottom: 24 },
  panelTitle: { margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 },
  formGroup: { display: "flex", flexDirection: "column", gap: 5 },
  label: { fontSize: 11, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600, fontFamily: "var(--font-ui)" },
  select: { padding: "8px 12px", fontSize: 12, background: "var(--bg-surface-2)", color: "var(--text-primary)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-ui)", width: "100%" },
  input: { padding: "8px 12px", fontSize: 12, background: "var(--bg-surface-2)", color: "var(--text-primary)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-ui)", width: "100%" },
  errorMsg: { fontSize: 11, color: "var(--danger)", marginTop: 2 },
  btnPrimary: { marginTop: 6, padding: "10px 20px", fontSize: 12, fontWeight: 600, background: "var(--danger-bg)", color: "var(--danger)", border: "1px solid var(--danger-border)", borderRadius: "var(--radius-sm)", cursor: "pointer", fontFamily: "var(--font-ui)", transition: "all 150ms" },
  section: { marginBottom: 24 },
  sectionTitle: { margin: "0 0 12px", fontSize: 13, fontWeight: 600, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 },
  countBadge: { fontSize: 11, color: "var(--text-secondary)", background: "var(--bg-surface-2)", padding: "2px 8px", borderRadius: "var(--radius-pill)", fontWeight: 500 },
  emptyState: { padding: "32px", textAlign: "center", color: "var(--ok)", background: "var(--ok-bg)", borderRadius: "var(--radius-md)", border: "1px solid var(--ok-border)", fontSize: 14 },
  tableWrap: { borderRadius: "var(--radius-md)", border: "1px solid var(--border)", overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: { padding: "10px 14px", textAlign: "left", background: "var(--bg-surface)", color: "var(--text-secondary)", fontWeight: 600, fontSize: 11, letterSpacing: 0.3, borderBottom: "1px solid var(--border)", whiteSpace: "nowrap", fontFamily: "var(--font-ui)" },
  tr: { borderBottom: "1px solid var(--border-subtle)" },
  td: { padding: "10px 14px", verticalAlign: "middle", fontFamily: "var(--font-ui)" },
  typeBadge: { padding: "3px 8px", borderRadius: "var(--radius-sm)", fontSize: 11, background: "var(--bg-surface-2)", color: "var(--text-secondary)", fontWeight: 500, whiteSpace: "nowrap" },
  daysBadge: { display: "inline-block", padding: "3px 10px", borderRadius: "var(--radius-pill)", fontSize: 12, fontWeight: 700, fontFamily: "var(--font-mono)" },
  btnResolve: { padding: "6px 14px", fontSize: 11, fontWeight: 600, background: "var(--ok-bg)", color: "var(--ok)", border: "1px solid var(--ok-border)", borderRadius: "var(--radius-sm)", cursor: "pointer", fontFamily: "var(--font-ui)", whiteSpace: "nowrap", transition: "all 150ms" },
  historyToggle: { display: "flex", alignItems: "center", gap: 8, background: "transparent", border: "1px solid var(--border)", color: "var(--text-secondary)", padding: "8px 14px", borderRadius: "var(--radius-sm)", cursor: "pointer", fontSize: 12, fontFamily: "var(--font-ui)", fontWeight: 500, transition: "all 150ms" },
};
