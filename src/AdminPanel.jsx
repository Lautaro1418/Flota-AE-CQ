import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabaseClient.js";

const SECTORS = [
  "ALMACEN", "EXPEDICION", "FRACCIONADO", "VERTICALIZADA", "ESTIBAS",
  "ETIQUETAS", "VARIETAL NORTE", "VARIETAL SUR", "TRAPICHE", "MANTENIMIENTO",
  "BODEGUITA", "INTENDENCIA",
];

const DIAS = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"];

// ═══════════════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════════════
function AdminLogin({ onLogin }) {
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const correct = import.meta.env.VITE_ADMIN_PASSWORD;
    if (pwd === correct) {
      onLogin();
    } else {
      setError("Contraseña incorrecta.");
      setPwd("");
    }
  };

  return (
    <div style={s.loginWrap}>
      <div style={s.loginBox}>
        <div style={s.loginIcon}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <h2 style={s.loginTitle}>Panel de Administración</h2>
        <p style={s.loginSub}>Ingresá la contraseña para continuar</p>
        <input
          type="password"
          placeholder="Contraseña"
          value={pwd}
          onChange={(e) => { setPwd(e.target.value); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          style={s.loginInput}
          autoFocus
        />
        {error && <div style={s.loginError}>{error}</div>}
        <button onClick={handleSubmit} style={s.loginBtn}>Ingresar</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PANEL PRINCIPAL
// ═══════════════════════════════════════════════════════════════
export default function AdminPanel({ onBack }) {
  const [authed, setAuthed] = useState(false);
  const [activeTab, setActiveTab] = useState("flota");

  if (!authed) return <AdminLogin onLogin={() => setAuthed(true)} />;

  const TABS = [
    { key: "flota",    label: "Flota",      icon: "◉" },
    { key: "personal", label: "Personal",   icon: "◈" },
    { key: "calendar", label: "Calendario", icon: "◫" },
  ];

  return (
    <div style={s.root}>
      {/* Header */}
      <header style={s.header}>
        <div style={s.headerLeft}>
          <div style={s.logo}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div>
            <div style={s.headerTitle}>PANEL DE ADMINISTRACIÓN</div>
            <div style={s.headerSub}>Gestión de datos — Flota CQ</div>
          </div>
        </div>
        <button onClick={onBack} style={s.backBtn}>← Inicio</button>
      </header>

      {/* Tabs */}
      <nav style={s.tabs}>
        {TABS.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            style={{ ...s.tab, ...(activeTab === tab.key ? s.tabActive : {}) }}>
            <span style={{ marginRight: 6 }}>{tab.icon}</span>{tab.label}
          </button>
        ))}
      </nav>

      {/* Contenido */}
      <main style={s.content}>
        {activeTab === "flota"    && <FlotaTab />}
        {activeTab === "personal" && <PersonalTab />}
        {activeTab === "calendar" && <CalendarTab />}
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB: FLOTA
// ═══════════════════════════════════════════════════════════════
function FlotaTab() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newRow, setNewRow] = useState({ equipo: "", tipo: "", id_corto: "", horometro: "", activo: true });
  const [msg, setMsg] = useState("");

  const TIPOS = ["AE GLP", "AE ELÉCTRICO", "APILADORA", "CAMIÓN", "CONTAINERA"];

  useEffect(() => {
    supabase.from("flota").select("*").order("id_corto")
      .then(({ data }) => { setRows(data || []); setLoading(false); });
  }, []);

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(""), 3000); };

  const updateField = async (id, field, value) => {
    setSaving(id);
    const { error } = await supabase.from("flota").update({ [field]: value }).eq("id", id);
    if (!error) {
      setRows((prev) => prev.map((r) => r.id === id ? { ...r, [field]: value } : r));
      flash("Guardado ✓");
    }
    setSaving(null);
  };

  const addRow = async () => {
    if (!newRow.equipo || !newRow.id_corto || !newRow.tipo) return;
    const { data, error } = await supabase.from("flota").insert([{
      equipo: newRow.equipo.trim().toUpperCase(),
      tipo: newRow.tipo,
      id_corto: newRow.id_corto.trim().toUpperCase(),
      horometro: newRow.horometro ? parseInt(newRow.horometro) : null,
      activo: true,
    }]).select();
    if (!error && data) {
      setRows((prev) => [...prev, data[0]]);
      setNewRow({ equipo: "", tipo: "", id_corto: "", horometro: "", activo: true });
      setShowAdd(false);
      flash("Equipo agregado ✓");
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <SectionHeader title="Flota" count={rows.filter(r => r.activo).length} total={rows.length}
        action={<button onClick={() => setShowAdd(!showAdd)} style={s.addBtn}>+ Agregar equipo</button>} />
      {msg && <Toast msg={msg} />}

      {showAdd && (
        <div style={s.addForm}>
          <h4 style={s.addTitle}>Nuevo equipo</h4>
          <div style={s.formGrid}>
            <Field label="ID Corto" placeholder="AE-XX">
              <input style={s.input} value={newRow.id_corto} onChange={(e) => setNewRow(p => ({ ...p, id_corto: e.target.value }))} />
            </Field>
            <Field label="Nombre completo" placeholder="AE N°XX CAT">
              <input style={s.input} value={newRow.equipo} onChange={(e) => setNewRow(p => ({ ...p, equipo: e.target.value }))} />
            </Field>
            <Field label="Tipo">
              <select style={s.select} value={newRow.tipo} onChange={(e) => setNewRow(p => ({ ...p, tipo: e.target.value }))}>
                <option value="">Seleccioná...</option>
                {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Horómetro inicial">
              <input style={s.input} type="number" value={newRow.horometro} onChange={(e) => setNewRow(p => ({ ...p, horometro: e.target.value }))} />
            </Field>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button onClick={addRow} style={s.saveBtn}>Guardar</button>
            <button onClick={() => setShowAdd(false)} style={s.cancelBtn}>Cancelar</button>
          </div>
        </div>
      )}

      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead><tr>
            <th style={s.th}>ID Corto</th>
            <th style={s.th}>Nombre</th>
            <th style={s.th}>Tipo</th>
            <th style={s.th}>Horómetro</th>
            <th style={s.th}>Activo</th>
          </tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} style={{ ...s.tr, opacity: row.activo ? 1 : 0.45 }}>
                <td style={{ ...s.td, ...s.mono, color: "#f59e0b" }}>{row.id_corto}</td>
                <td style={s.td}>{row.equipo}</td>
                <td style={s.td}><span style={s.badge}>{row.tipo}</span></td>
                <td style={s.td}>
                  <InlineEdit
                    value={row.horometro || ""}
                    onSave={(v) => updateField(row.id, "horometro", v ? parseInt(v) : null)}
                    saving={saving === row.id}
                    type="number"
                  />
                </td>
                <td style={s.td}>
                  <Toggle value={row.activo} onChange={(v) => updateField(row.id, "activo", v)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB: PERSONAL
// ═══════════════════════════════════════════════════════════════
function PersonalTab() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newRow, setNewRow] = useState({ nombre: "", sector: "" });
  const [msg, setMsg] = useState("");
  const [filter, setFilter] = useState("");

  useEffect(() => {
    supabase.from("personal").select("*").order("nombre")
      .then(({ data }) => { setRows(data || []); setLoading(false); });
  }, []);

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(""), 3000); };

  const updateField = async (id, field, value) => {
    setSaving(id);
    const { error } = await supabase.from("personal").update({ [field]: value }).eq("id", id);
    if (!error) {
      setRows((prev) => prev.map((r) => r.id === id ? { ...r, [field]: value } : r));
      flash("Guardado ✓");
    }
    setSaving(null);
  };

  const addRow = async () => {
    if (!newRow.nombre || !newRow.sector) return;
    const { data, error } = await supabase.from("personal").insert([{
      nombre: newRow.nombre.trim().toUpperCase(),
      sector: newRow.sector,
      activo: true,
    }]).select();
    if (!error && data) {
      setRows((prev) => [...prev, data[0]].sort((a, b) => a.nombre.localeCompare(b.nombre)));
      setNewRow({ nombre: "", sector: "" });
      setShowAdd(false);
      flash("Operario agregado ✓");
    }
  };

  const filtered = rows.filter((r) =>
    !filter || r.nombre.toLowerCase().includes(filter.toLowerCase()) || r.sector?.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) return <Loader />;

  return (
    <div>
      <SectionHeader title="Personal" count={rows.filter(r => r.activo).length} total={rows.length}
        action={<button onClick={() => setShowAdd(!showAdd)} style={s.addBtn}>+ Agregar operario</button>} />
      {msg && <Toast msg={msg} />}

      <input style={{ ...s.input, marginBottom: 16, maxWidth: 300 }}
        placeholder="Buscar por nombre o sector..."
        value={filter} onChange={(e) => setFilter(e.target.value)} />

      {showAdd && (
        <div style={s.addForm}>
          <h4 style={s.addTitle}>Nuevo operario</h4>
          <div style={s.formGrid}>
            <Field label="Nombre completo (APELLIDO NOMBRE)">
              <input style={s.input} placeholder="GARCIA JUAN PABLO" value={newRow.nombre}
                onChange={(e) => setNewRow(p => ({ ...p, nombre: e.target.value }))} />
            </Field>
            <Field label="Sector">
              <select style={s.select} value={newRow.sector}
                onChange={(e) => setNewRow(p => ({ ...p, sector: e.target.value }))}>
                <option value="">Seleccioná...</option>
                {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button onClick={addRow} style={s.saveBtn}>Guardar</button>
            <button onClick={() => setShowAdd(false)} style={s.cancelBtn}>Cancelar</button>
          </div>
        </div>
      )}

      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead><tr>
            <th style={s.th}>Nombre</th>
            <th style={s.th}>Sector</th>
            <th style={s.th}>Activo</th>
          </tr></thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id} style={{ ...s.tr, opacity: row.activo ? 1 : 0.45 }}>
                <td style={{ ...s.td, fontWeight: 600 }}>{row.nombre}</td>
                <td style={s.td}>
                  <select style={{ ...s.select, padding: "4px 8px", fontSize: 12 }}
                    value={row.sector || ""}
                    onChange={(e) => updateField(row.id, "sector", e.target.value)}>
                    {SECTORS.map(sec => <option key={sec} value={sec}>{sec}</option>)}
                  </select>
                </td>
                <td style={s.td}>
                  <Toggle value={row.activo} onChange={(v) => updateField(row.id, "activo", v)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB: CALENDARIO
// ═══════════════════════════════════════════════════════════════
function CalendarTab() {
  const [template, setTemplate] = useState([]);
  const [excepciones, setExcepciones] = useState([]);
  const [flota, setFlota] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [msg, setMsg] = useState("");
  const [showAddExc, setShowAddExc] = useState(false);
  const [newExc, setNewExc] = useState({ fecha: "", equipo: "", inicio: "", fin: "", motivo: "" });
  const [filterDia, setFilterDia] = useState("TODOS");

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(""), 3000); };

  useEffect(() => {
    Promise.all([
      supabase.from("services_template").select("*").order("dia").order("inicio"),
      supabase.from("services_excepciones").select("*").order("fecha", { ascending: false }),
      supabase.from("flota").select("id_corto, equipo").eq("activo", true).order("id_corto"),
    ]).then(([t, e, f]) => {
      setTemplate(t.data || []);
      setExcepciones(e.data || []);
      setFlota(f.data || []);
      setLoading(false);
    });
  }, []);

  const updateTemplate = async (id, field, value) => {
    setSaving(id);
    const { error } = await supabase.from("services_template").update({ [field]: value }).eq("id", id);
    if (!error) {
      setTemplate((prev) => prev.map((r) => r.id === id ? { ...r, [field]: value } : r));
      flash("Guardado ✓");
    }
    setSaving(null);
  };

  const addExcepcion = async () => {
    if (!newExc.fecha || !newExc.equipo) return;
    const { data, error } = await supabase.from("services_excepciones").insert([{
      fecha: newExc.fecha,
      equipo: newExc.equipo,
      inicio: newExc.inicio || null,
      fin: newExc.fin || null,
      motivo: newExc.motivo || null,
    }]).select();
    if (!error && data) {
      setExcepciones((prev) => [data[0], ...prev]);
      setNewExc({ fecha: "", equipo: "", inicio: "", fin: "", motivo: "" });
      setShowAddExc(false);
      flash("Excepción agregada ✓");
    }
  };

  const deleteExcepcion = async (id) => {
    const { error } = await supabase.from("services_excepciones").delete().eq("id", id);
    if (!error) setExcepciones((prev) => prev.filter((r) => r.id !== id));
  };

  const filteredTemplate = filterDia === "TODOS" ? template : template.filter((r) => r.dia === filterDia);

  if (loading) return <Loader />;

  return (
    <div>
      <SectionHeader title="Calendario" count={template.length} total={template.length} label="turnos template" />
      {msg && <Toast msg={msg} />}

      {/* ─── Template ─── */}
      <div style={s.subSection}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
          <h3 style={s.subTitle}>Template semanal</h3>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <label style={s.label}>Filtrar día</label>
            <select style={{ ...s.select, minWidth: 130 }} value={filterDia} onChange={(e) => setFilterDia(e.target.value)}>
              <option value="TODOS">Todos</option>
              {DIAS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead><tr>
              <th style={s.th}>Día</th>
              <th style={s.th}>Equipo</th>
              <th style={s.th}>Inicio</th>
              <th style={s.th}>Fin</th>
            </tr></thead>
            <tbody>
              {filteredTemplate.map((row) => (
                <tr key={row.id} style={s.tr}>
                  <td style={{ ...s.td, color: "#f59e0b", fontWeight: 700 }}>{row.dia}</td>
                  <td style={{ ...s.td, ...s.mono }}>{row.equipo}</td>
                  <td style={s.td}>
                    <InlineEdit value={row.inicio || ""} type="time"
                      onSave={(v) => updateTemplate(row.id, "inicio", v)}
                      saving={saving === row.id} />
                  </td>
                  <td style={s.td}>
                    <InlineEdit value={row.fin || ""} type="time"
                      onSave={(v) => updateTemplate(row.id, "fin", v)}
                      saving={saving === row.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Excepciones ─── */}
      <div style={s.subSection}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <h3 style={s.subTitle}>Excepciones puntuales <span style={s.subCount}>{excepciones.length}</span></h3>
          <button onClick={() => setShowAddExc(!showAddExc)} style={s.addBtn}>+ Agregar excepción</button>
        </div>

        {showAddExc && (
          <div style={s.addForm}>
            <h4 style={s.addTitle}>Nueva excepción</h4>
            <div style={s.formGrid}>
              <Field label="Fecha">
                <input style={s.input} type="date" value={newExc.fecha}
                  onChange={(e) => setNewExc(p => ({ ...p, fecha: e.target.value }))} />
              </Field>
              <Field label="Equipo">
                <select style={s.select} value={newExc.equipo}
                  onChange={(e) => setNewExc(p => ({ ...p, equipo: e.target.value }))}>
                  <option value="">Seleccioná...</option>
                  {flota.map(f => <option key={f.id_corto} value={f.equipo}>{f.id_corto} — {f.equipo}</option>)}
                </select>
              </Field>
              <Field label="Hora inicio (vacío = cancelado)">
                <input style={s.input} type="time" value={newExc.inicio}
                  onChange={(e) => setNewExc(p => ({ ...p, inicio: e.target.value }))} />
              </Field>
              <Field label="Hora fin">
                <input style={s.input} type="time" value={newExc.fin}
                  onChange={(e) => setNewExc(p => ({ ...p, fin: e.target.value }))} />
              </Field>
              <Field label="Motivo" style={{ gridColumn: "1 / -1" }}>
                <input style={s.input} placeholder="Ej: Cambio por feriado" value={newExc.motivo}
                  onChange={(e) => setNewExc(p => ({ ...p, motivo: e.target.value }))} />
              </Field>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <button onClick={addExcepcion} style={s.saveBtn}>Guardar</button>
              <button onClick={() => setShowAddExc(false)} style={s.cancelBtn}>Cancelar</button>
            </div>
          </div>
        )}

        {excepciones.length === 0 ? (
          <div style={s.empty}>Sin excepciones registradas</div>
        ) : (
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead><tr>
                <th style={s.th}>Fecha</th>
                <th style={s.th}>Equipo</th>
                <th style={s.th}>Horario</th>
                <th style={s.th}>Motivo</th>
                <th style={s.th}>Eliminar</th>
              </tr></thead>
              <tbody>
                {excepciones.map((row) => (
                  <tr key={row.id} style={s.tr}>
                    <td style={{ ...s.td, color: "#f59e0b" }}>
                      {new Date(row.fecha).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "2-digit" })}
                    </td>
                    <td style={{ ...s.td, ...s.mono }}>{row.equipo}</td>
                    <td style={s.td}>
                      {row.inicio && row.fin
                        ? `${row.inicio.slice(0,5)} → ${row.fin.slice(0,5)}`
                        : <span style={{ color: "#ef4444" }}>Cancelado</span>}
                    </td>
                    <td style={{ ...s.td, color: "#9ca3af", fontSize: 12 }}>{row.motivo || "—"}</td>
                    <td style={s.td}>
                      <button onClick={() => deleteExcepcion(row.id)} style={s.deleteBtn}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTES AUXILIARES
// ═══════════════════════════════════════════════════════════════

function InlineEdit({ value, onSave, saving, type = "text" }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);

  useEffect(() => setVal(value), [value]);

  if (!editing) {
    return (
      <span onClick={() => setEditing(true)}
        style={{ cursor: "pointer", borderBottom: "1px dashed #374151", padding: "2px 4px", color: "#d1d5db", fontSize: 12 }}>
        {val || <span style={{ color: "#4b5563" }}>—</span>}
        {saving && <span style={{ color: "#6b7280", marginLeft: 6, fontSize: 10 }}>guardando...</span>}
      </span>
    );
  }

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <input type={type} value={val} autoFocus
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") { onSave(val); setEditing(false); }
          if (e.key === "Escape") { setVal(value); setEditing(false); }
        }}
        style={{ ...s.input, padding: "3px 6px", width: type === "number" ? 90 : 110, fontSize: 12 }} />
      <button onClick={() => { onSave(val); setEditing(false); }} style={s.miniSaveBtn}>✓</button>
      <button onClick={() => { setVal(value); setEditing(false); }} style={s.miniCancelBtn}>✕</button>
    </span>
  );
}

function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)}
      style={{
        width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
        background: value ? "#16a34a" : "#374151", position: "relative", transition: "background 0.2s",
      }}>
      <span style={{
        position: "absolute", top: 3, left: value ? 23 : 3,
        width: 18, height: 18, borderRadius: "50%", background: "white",
        transition: "left 0.2s",
      }} />
    </button>
  );
}

function SectionHeader({ title, count, total, label = "activos", action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
      <div>
        <h2 style={s.sectionTitle}>{title}</h2>
        <span style={s.sectionCount}>{count} {label} / {total} total</span>
      </div>
      {action}
    </div>
  );
}

function Field({ label, children, style }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5, ...style }}>
      <label style={s.label}>{label}</label>
      {children}
    </div>
  );
}

function Loader() {
  return <div style={{ color: "#6b7280", padding: 32, textAlign: "center", fontSize: 13 }}>Cargando...</div>;
}

function Toast({ msg }) {
  return (
    <div style={{ padding: "8px 16px", background: "#052e16", border: "1px solid #166534", borderRadius: 6, color: "#4ade80", fontSize: 12, marginBottom: 16, display: "inline-block" }}>
      {msg}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ESTILOS
// ═══════════════════════════════════════════════════════════════
const s = {
  root: { fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace", background: "#0a0f1a", color: "#e5e7eb", minHeight: "100vh" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", background: "linear-gradient(180deg, #111827 0%, #0a0f1a 100%)", borderBottom: "1px solid #1f2937" },
  headerLeft: { display: "flex", alignItems: "center", gap: 14 },
  logo: { width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", background: "#1c1917", borderRadius: 8, border: "1px solid #f59e0b33" },
  headerTitle: { fontSize: 14, fontWeight: 800, letterSpacing: 3, color: "#f59e0b", textTransform: "uppercase" },
  headerSub: { fontSize: 11, color: "#6b7280", letterSpacing: 1, marginTop: 2 },
  backBtn: { background: "transparent", border: "1px solid #1f2937", color: "#6b7280", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 600 },
  tabs: { display: "flex", gap: 2, padding: "0 24px", background: "#111827", borderBottom: "1px solid #1f2937" },
  tab: { padding: "12px 20px", fontSize: 13, fontWeight: 600, background: "transparent", color: "#6b7280", border: "none", borderBottom: "2px solid transparent", cursor: "pointer", fontFamily: "inherit" },
  tabActive: { color: "#f59e0b", borderBottomColor: "#f59e0b", background: "#f59e0b0a" },
  content: { padding: "24px" },
  sectionTitle: { margin: 0, fontSize: 18, fontWeight: 800, color: "#f3f4f6" },
  sectionCount: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  subSection: { marginBottom: 32 },
  subTitle: { margin: 0, fontSize: 14, fontWeight: 700, color: "#d1d5db", textTransform: "uppercase", letterSpacing: 1 },
  subCount: { fontSize: 11, color: "#6b7280", background: "#1f2937", padding: "2px 8px", borderRadius: 4, marginLeft: 8, fontWeight: 400 },
  tableWrap: { borderRadius: 10, border: "1px solid #1f2937", overflow: "hidden", overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 12 },
  th: { padding: "10px 14px", textAlign: "left", background: "#111827", color: "#9ca3af", fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: 1, borderBottom: "1px solid #1f2937", whiteSpace: "nowrap" },
  tr: { borderBottom: "1px solid #1f293766" },
  td: { padding: "10px 14px", verticalAlign: "middle" },
  mono: { fontWeight: 600, letterSpacing: 0.5 },
  badge: { padding: "2px 8px", borderRadius: 4, fontSize: 10, background: "#1e293b", color: "#94a3b8", border: "1px solid #334155", fontWeight: 600 },
  label: { fontSize: 10, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 },
  input: { padding: "8px 12px", fontSize: 12, background: "#1f2937", color: "#e5e7eb", border: "1px solid #374151", borderRadius: 6, fontFamily: "inherit", width: "100%" },
  select: { padding: "8px 12px", fontSize: 12, background: "#1f2937", color: "#e5e7eb", border: "1px solid #374151", borderRadius: 6, fontFamily: "inherit", width: "100%" },
  addBtn: { padding: "8px 16px", fontSize: 12, fontWeight: 700, background: "#1e293b", color: "#93c5fd", border: "1px solid #1e40af", borderRadius: 6, cursor: "pointer", fontFamily: "inherit" },
  addForm: { background: "#111827", border: "1px solid #1f2937", borderRadius: 10, padding: "18px 20px", marginBottom: 20 },
  addTitle: { margin: "0 0 14px", fontSize: 13, fontWeight: 700, color: "#d1d5db" },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 },
  saveBtn: { padding: "8px 20px", fontSize: 12, fontWeight: 700, background: "#14532d", color: "#4ade80", border: "1px solid #166534", borderRadius: 6, cursor: "pointer", fontFamily: "inherit" },
  cancelBtn: { padding: "8px 16px", fontSize: 12, background: "transparent", color: "#6b7280", border: "1px solid #374151", borderRadius: 6, cursor: "pointer", fontFamily: "inherit" },
  deleteBtn: { padding: "4px 10px", fontSize: 11, background: "#450a0a", color: "#fca5a5", border: "1px solid #7f1d1d", borderRadius: 4, cursor: "pointer", fontFamily: "inherit" },
  miniSaveBtn: { padding: "3px 8px", fontSize: 11, background: "#14532d", color: "#4ade80", border: "none", borderRadius: 4, cursor: "pointer", fontFamily: "inherit" },
  miniCancelBtn: { padding: "3px 8px", fontSize: 11, background: "#374151", color: "#9ca3af", border: "none", borderRadius: 4, cursor: "pointer", fontFamily: "inherit" },
  empty: { padding: "24px", textAlign: "center", color: "#374151", background: "#111827", borderRadius: 10, border: "1px solid #1f2937", fontSize: 13 },
  loginWrap: { fontFamily: "'JetBrains Mono', 'SF Mono', monospace", background: "#0a0f1a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" },
  loginBox: { background: "#111827", border: "1px solid #1f2937", borderRadius: 16, padding: "40px 36px", width: "100%", maxWidth: 380, textAlign: "center" },
  loginIcon: { width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center", background: "#1c1917", borderRadius: 12, border: "1px solid #f59e0b33", margin: "0 auto 20px" },
  loginTitle: { margin: "0 0 8px", fontSize: 18, fontWeight: 800, color: "#f3f4f6" },
  loginSub: { margin: "0 0 24px", fontSize: 12, color: "#6b7280" },
  loginInput: { padding: "10px 14px", fontSize: 13, background: "#1f2937", color: "#e5e7eb", border: "1px solid #374151", borderRadius: 8, fontFamily: "inherit", width: "100%", marginBottom: 8, textAlign: "center", letterSpacing: 4 },
  loginError: { fontSize: 12, color: "#fca5a5", marginBottom: 12 },
  loginBtn: { width: "100%", padding: "11px", fontSize: 13, fontWeight: 700, background: "#f59e0b", color: "#0a0f1a", border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", letterSpacing: 1 },
};
