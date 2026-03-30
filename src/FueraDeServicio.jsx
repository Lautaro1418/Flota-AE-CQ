import { useState } from "react";

const STATUS_CONFIG = {
  ok: { label: "OK", color: "#16a34a", bg: "#052e16" },
  warning: { label: "Service <24h", color: "#eab308", bg: "#422006" },
  no_ok: { label: "No OK", color: "#ef4444", bg: "#450a0a" },
  fuera_servicio: { label: "Fuera Servicio", color: "#6b7280", bg: "#1f2937" },
};

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
    if (!form.reason.trim()) {
      setFormError("Ingresá el motivo del fuera de servicio.");
      return;
    }
    const eq = equipment.find((e) => e.id === form.equipmentId);
    onAdd({
      equipmentId: form.equipmentId,
      equipmentName: eq?.name || form.equipmentId,
      sector: eq?.sector || "—",
      type: eq?.type || "—",
      startDate: form.startDate,
      reason: form.reason.trim(),
    });
    setForm({ equipmentId: equipment[0]?.id || "", startDate: new Date().toISOString().split("T")[0], reason: "" });
    setFormError("");
  };

  const daysSince = (dateStr) => {
    const diff = new Date() - new Date(dateStr);
    return Math.floor(diff / 86400000);
  };

  return (
    <div>
      {/* ─── Summary ─── */}
      <div style={s.summaryRow}>
        <div style={{ ...s.summaryCard, borderColor: "#ef4444", background: "#450a0a" }}>
          <span style={{ fontSize: 26, fontWeight: 800, color: "#ef4444" }}>{active.length}</span>
          <span style={s.summaryLabel}>Equipos activos fuera de servicio</span>
        </div>
        <div style={{ ...s.summaryCard, borderColor: "#16a34a", background: "#052e16" }}>
          <span style={{ fontSize: 26, fontWeight: 800, color: "#16a34a" }}>{resolved.length}</span>
          <span style={s.summaryLabel}>Dados de alta históricamente</span>
        </div>
        <div style={{ ...s.summaryCard, borderColor: "#374151", background: "#111827" }}>
          <span style={{ fontSize: 26, fontWeight: 800, color: "#d1d5db" }}>
            {active.length > 0 ? Math.round(active.reduce((acc, r) => acc + daysSince(r.startDate), 0) / active.length) : 0}d
          </span>
          <span style={s.summaryLabel}>Días promedio fuera (activos)</span>
        </div>
      </div>

      {/* ─── Form ─── */}
      <div style={s.formPanel}>
        <h3 style={s.panelTitle}>⊘ Registrar Equipo Fuera de Servicio</h3>
        <div style={s.formGrid} className="fds-form-grid">
          <div style={s.formGroup}>
            <label style={s.label}>Equipo</label>
            <select
              style={s.select}
              value={form.equipmentId}
              onChange={(e) => setForm((f) => ({ ...f, equipmentId: e.target.value }))}
            >
              {equipment.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.id} — {eq.name}
                </option>
              ))}
            </select>
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>Fecha de inicio</label>
            <input
              type="date"
              style={s.input}
              value={form.startDate}
              onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
            />
          </div>
        </div>
        <div style={s.formGroup}>
          <label style={s.label}>Motivo / Descripción de la falla</label>
          <textarea
            style={{ ...s.input, resize: "vertical", minHeight: 72 }}
            placeholder="Ej: Pérdida de aceite hidráulico en cilindro de elevación. Enviado a taller Nro. 3."
            value={form.reason}
            onChange={(e) => { setForm((f) => ({ ...f, reason: e.target.value })); setFormError(""); }}
          />
          {formError && <span style={s.errorMsg}>{formError}</span>}
        </div>
        <button style={s.btnPrimary} onClick={handleAdd}>
          ⊘ Registrar Fuera de Servicio
        </button>
      </div>

      {/* ─── Active FdS table ─── */}
      <div style={s.section}>
        <h3 style={s.sectionTitle}>
          Equipos actualmente fuera de servicio
          <span style={s.countBadge}>{active.length}</span>
        </h3>

        {active.length === 0 ? (
          <div style={s.emptyState}>
            <span style={{ fontSize: 28 }}>✓</span>
            <p>Toda la flota operativa — ningún equipo fuera de servicio.</p>
          </div>
        ) : (
          <div style={s.tableWrap} className="fleet-table-container">
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Equipo</th>
                  <th style={{ ...s.th }} className="fds-table-col-type">Tipo</th>
                  <th style={s.th} className="fds-table-col-sector">Sector</th>
                  <th style={s.th}>Desde</th>
                  <th style={s.th}>Días</th>
                  <th style={s.th}>Motivo</th>
                  <th style={{ ...s.th, color: "#16a34a" }}>Alta</th>
                </tr>
              </thead>
              <tbody>
                {active.map((r) => {
                  const days = daysSince(r.startDate);
                  return (
                    <tr key={r.id} style={s.tr}>
                      <td style={{ ...s.td, fontWeight: 700 }}>
                        <div style={{ color: "#f3f4f6" }}>{r.equipmentId}</div>
                        <div style={{ fontSize: 11, color: "#9ca3af" }}>{r.equipmentName}</div>
                      </td>
                      <td style={s.td} className="fds-table-col-type">
                        <span style={s.typeBadge}>{r.type}</span>
                      </td>
                      <td style={s.td} className="fds-table-col-sector">{r.sector}</td>
                      <td style={{ ...s.td, color: "#9ca3af", whiteSpace: "nowrap" }}>
                        {new Date(r.startDate).toLocaleDateString("es-AR", { day: "2-digit", month: "short" })}
                      </td>
                      <td style={s.td}>
                        <span
                          style={{
                            ...s.daysBadge,
                            color: days > 7 ? "#ef4444" : days > 3 ? "#eab308" : "#9ca3af",
                            background: days > 7 ? "#450a0a" : days > 3 ? "#422006" : "#1f2937",
                          }}
                        >
                          {days}d
                        </span>
                      </td>
                      <td style={{ ...s.td, fontSize: 12, color: "#d1d5db", maxWidth: 220 }}>{r.reason}</td>
                      <td style={s.td}>
                        <button style={s.btnResolve} onClick={() => onResolve(r.id)}>
                          ✓ Dar de alta
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── History ─── */}
      <div style={s.section}>
        <button
          style={s.historyToggle}
          onClick={() => setShowHistory((v) => !v)}
        >
          {showHistory ? "▼" : "▶"} Historial de altas ({resolved.length})
        </button>

        {showHistory && resolved.length > 0 && (
          <div style={{ ...s.tableWrap, marginTop: 12 }} className="fleet-table-container">
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Equipo</th>
                  <th style={s.th}>Ingresó</th>
                  <th style={s.th}>Alta</th>
                  <th style={s.th}>Días fuera</th>
                  <th style={s.th}>Motivo</th>
                </tr>
              </thead>
              <tbody>
                {resolved.map((r) => {
                  const totalDays = r.resolvedDate
                    ? Math.round((new Date(r.resolvedDate) - new Date(r.startDate)) / 86400000)
                    : "—";
                  return (
                    <tr key={r.id} style={{ ...s.tr, opacity: 0.7 }}>
                      <td style={{ ...s.td, fontWeight: 600 }}>
                        <div style={{ color: "#f3f4f6" }}>{r.equipmentId}</div>
                        <div style={{ fontSize: 11, color: "#6b7280" }}>{r.equipmentName}</div>
                      </td>
                      <td style={{ ...s.td, color: "#9ca3af" }}>
                        {new Date(r.startDate).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "2-digit" })}
                      </td>
                      <td style={{ ...s.td, color: "#16a34a" }}>
                        {r.resolvedDate
                          ? new Date(r.resolvedDate).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "2-digit" })
                          : "—"}
                      </td>
                      <td style={{ ...s.td, color: "#9ca3af" }}>{totalDays}d</td>
                      <td style={{ ...s.td, fontSize: 12, color: "#6b7280", maxWidth: 200 }}>{r.reason}</td>
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

// ─── Styles ──────────────────────────────────────────────────
const s = {
  summaryRow: {
    display: "flex",
    gap: 12,
    marginBottom: 20,
    flexWrap: "wrap",
  },
  summaryCard: {
    flex: "1 1 160px",
    minWidth: 140,
    padding: "14px 18px",
    borderRadius: 10,
    border: "1px solid",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  summaryLabel: {
    fontSize: 11,
    color: "#9ca3af",
    lineHeight: 1.3,
  },
  formPanel: {
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: 10,
    padding: "18px 20px",
    marginBottom: 24,
  },
  panelTitle: {
    margin: "0 0 16px",
    fontSize: 14,
    fontWeight: 700,
    color: "#e5e7eb",
    letterSpacing: 0.5,
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
    marginBottom: 14,
  },
  formGroup: { display: "flex", flexDirection: "column", gap: 5 },
  label: {
    fontSize: 10,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: 700,
    fontFamily: "inherit",
  },
  select: {
    padding: "8px 12px",
    fontSize: 12,
    background: "#1f2937",
    color: "#e5e7eb",
    border: "1px solid #374151",
    borderRadius: 6,
    fontFamily: "inherit",
    width: "100%",
  },
  input: {
    padding: "8px 12px",
    fontSize: 12,
    background: "#1f2937",
    color: "#e5e7eb",
    border: "1px solid #374151",
    borderRadius: 6,
    fontFamily: "inherit",
    width: "100%",
  },
  errorMsg: {
    fontSize: 11,
    color: "#fca5a5",
    marginTop: 2,
  },
  btnPrimary: {
    marginTop: 4,
    padding: "9px 20px",
    fontSize: 12,
    fontWeight: 700,
    background: "#422006",
    color: "#fbbf24",
    border: "1px solid #92400e",
    borderRadius: 6,
    cursor: "pointer",
    fontFamily: "inherit",
    letterSpacing: 0.5,
  },
  section: { marginBottom: 24 },
  sectionTitle: {
    margin: "0 0 12px",
    fontSize: 13,
    fontWeight: 700,
    color: "#d1d5db",
    textTransform: "uppercase",
    letterSpacing: 1,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  countBadge: {
    fontSize: 11,
    color: "#9ca3af",
    background: "#1f2937",
    padding: "2px 8px",
    borderRadius: 4,
    fontWeight: 600,
  },
  emptyState: {
    padding: "32px",
    textAlign: "center",
    color: "#16a34a",
    background: "#052e16",
    borderRadius: 10,
    border: "1px solid #166534",
    fontSize: 14,
  },
  tableWrap: {
    borderRadius: 10,
    border: "1px solid #1f2937",
    overflow: "hidden",
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 12 },
  th: {
    padding: "9px 12px",
    textAlign: "left",
    background: "#111827",
    color: "#9ca3af",
    fontWeight: 700,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
    borderBottom: "1px solid #1f2937",
    whiteSpace: "nowrap",
    fontFamily: "inherit",
  },
  tr: { borderBottom: "1px solid #1f293766" },
  td: { padding: "10px 12px", verticalAlign: "middle", fontFamily: "inherit" },
  typeBadge: {
    padding: "2px 7px",
    borderRadius: 4,
    fontSize: 10,
    background: "#1e293b",
    color: "#94a3b8",
    border: "1px solid #334155",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  daysBadge: {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 800,
    border: "1px solid transparent",
  },
  btnResolve: {
    padding: "5px 12px",
    fontSize: 11,
    fontWeight: 700,
    background: "#052e16",
    color: "#4ade80",
    border: "1px solid #166534",
    borderRadius: 6,
    cursor: "pointer",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
  },
  historyToggle: {
    background: "transparent",
    border: "1px solid #1f2937",
    color: "#6b7280",
    padding: "8px 14px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 12,
    fontFamily: "inherit",
    fontWeight: 600,
  },
};
