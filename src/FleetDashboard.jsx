import { useState, useMemo, useEffect, useCallback } from "react";
import './App.css';
import FueraDeServicio from './FueraDeServicio.jsx';
import { supabase } from './supabaseClient.js';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
}

const CHECK_ITEMS = [
  "Extintor/Patente/Asiento", "Cinturón de seguridad", "Espejos laterales/retrovisor",
  "Bocina/Alarma retroceso", "Luces/Guiñes/Balizas", "Garrafa GLP",
  "Frenos servicio/mano", "Batería/Fluidos", "Encendido", "Torre elevación",
  "Pérdidas agua/aceite", "Líquido de frenos", "Neumáticos/Ruedas", "Junta válvula carga",
];

const STATUS_CONFIG = {
  ok:             { label: "OK",             color: "#16a34a", bg: "#052e16", icon: "●" },
  warning:        { label: "Service <24h",   color: "#eab308", bg: "#422006", icon: "▲" },
  no_ok:          { label: "No OK",          color: "#ef4444", bg: "#450a0a", icon: "■" },
  fuera_servicio: { label: "Fuera Servicio", color: "#6b7280", bg: "#1f2937", icon: "✕" },
};

const DAYS = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];

const DAY_INDEX = {
  LUNES: 0, MARTES: 1, MIERCOLES: 2, MIÉRCOLES: 2,
  JUEVES: 3, VIERNES: 4, SABADO: 5, SÁBADO: 5, DOMINGO: 6,
};

const CHECK_FIELD_MAP = [
  { field: "extintor",       obs: "obs_extintor",      label: "Extintor/Patente/Asiento" },
  { field: "cinturon",       obs: "obs_cinturon",      label: "Cinturón de seguridad" },
  { field: "espejos",        obs: "obs_espejos",       label: "Espejos laterales/retrovisor" },
  { field: "bocina",         obs: "obs_bocina",        label: "Bocina/Alarma retroceso" },
  { field: "luces",          obs: "obs_luces",         label: "Luces/Guiñes/Balizas" },
  { field: "glp",            obs: "obs_glp",           label: "Garrafa GLP" },
  { field: "frenos",         obs: "obs_frenos",        label: "Frenos servicio/mano" },
  { field: "bateria",        obs: "obs_bateria",       label: "Batería/Fluidos" },
  { field: "encendido",      obs: "obs_encendido",     label: "Encendido" },
  { field: "torre",          obs: "obs_torre",         label: "Torre elevación" },
  { field: "fluidos",        obs: "obs_fluidos",       label: "Pérdidas agua/aceite" },
  { field: "liquido_frenos", obs: "obs_liq_frenos",    label: "Líquido de frenos" },
  { field: "neumaticos",     obs: "obs_neumaticos",    label: "Neumáticos/Ruedas" },
  { field: "junta_valvula",  obs: "obs_junta_valvula", label: "Junta válvula carga" },
];

// ── Construye mapa nombreEquipo → id_corto desde tabla flota ──
function buildEquipoMap(flotaData) {
  const map = {};
  if (!flotaData?.length) return map;
  flotaData.forEach((row) => {
    if (row.equipo && row.id_corto) {
      // Guardar con clave normalizada Y clave original para máximo match
      const normalized = row.equipo.trim().toUpperCase()
        .replace(/N[°º]/g, "N°").replace(/\s+/g, " ");
      map[normalized] = row.id_corto;
      map[row.equipo.trim().toUpperCase()] = row.id_corto;
    }
  });
  return map;
}

// ── Checks → registros NO OK para el heatmap ──────────────────
function transformChecksToNoOk(checksData, equipoMap) {
  const records = [];
  if (!checksData?.length) return records;
  checksData.forEach((check) => {
    const rawKey = (check.equipo || "").trim().toUpperCase();
    const normKey = rawKey.replace(/N[°º]/g, "N°").replace(/\s+/g, " ");
    const equipId = equipoMap[normKey] || equipoMap[rawKey];
    if (!equipId) return;
    CHECK_FIELD_MAP.forEach(({ field, obs, label }) => {
      if ((check[field] || "").toUpperCase().trim() === "NO OK") {
        records.push({
          equipmentId: equipId,
          date: check.fecha,
          item: label,
          turno: check.turno || "—",
          operario: check.operario || "—",
          descripcion: check[obs] || "Sin descripción",
        });
      }
    });
  });
  return records;
}

// ── services_template → eventos calendario (con excepciones) ──
function transformServicesTemplate(servicesData, equipoMap, weekOffset = 0, excepciones = []) {
  const events = [];
  if (!servicesData?.length) return events;
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7) + weekOffset * 7);
  monday.setHours(0, 0, 0, 0);

  // Mapa excepciones: "EQUIPONOMBRE|fecha" → excepcion
  // Normalizar fecha y nombre de equipo para evitar mismatch de caracteres unicode
  const normalizeEquipo = (s) => (s || "").trim().toUpperCase()
    .replace(/N[°º]/g, "N°")   // normalizar Nº y N° al mismo símbolo
    .replace(/\s+/g, " ");     // colapsar espacios múltiples

  const excMap = {};
  excepciones.forEach((exc) => {
    const fechaNorm = (exc.fecha || "").toString().slice(0, 10);
    const key = `${normalizeEquipo(exc.equipo)}|${fechaNorm}`;
    excMap[key] = exc;
  });

  servicesData.forEach((svc) => {
    const dayOffset = DAY_INDEX[svc.dia?.toUpperCase().trim()];
    if (dayOffset === undefined) return;
    const equipId = equipoMap[(svc.equipo || "").trim().toUpperCase()];
    if (!equipId) return;
    const date = new Date(monday);
    date.setDate(monday.getDate() + dayOffset);
    const dateStr = date.toISOString().split("T")[0];

    const excKey = `${normalizeEquipo(svc.equipo)}|${dateStr}`;
    const exc = excMap[excKey];

    if (exc) {
      if (!exc.inicio) return; // cancelado
      events.push({
        equipmentId: equipId,
        equipmentName: svc.equipo,
        sector: "—",
        datetime: `${dateStr}T${exc.inicio}`,
        type: "excepcion",
        motivo: exc.motivo || null,
      });
      return;
    }

    events.push({
      equipmentId: equipId,
      equipmentName: svc.equipo,
      sector: "—",
      datetime: `${dateStr}T${svc.inicio || "08:00:00"}`,
      type: "semanal",
    });
  });
  return events;
}

// ── fuera_de_servicio → formato interno ───────────────────────
function transformFds(fdsData) {
  if (!fdsData?.length) return [];
  return fdsData.map((r) => ({
    id: r.id,
    equipmentId: r.equipment_id,
    equipmentName: r.equipment_name,
    sector: r.sector,
    type: r.type,
    startDate: r.start_date,
    reason: r.reason,
    resolved: r.resolved ?? false,
    resolvedDate: r.resolved_date,
  }));
}

// ── flota → formato interno ────────────────────────────────────
function transformFlota(flotaData) {
  if (!flotaData?.length) return [];
  return flotaData
    .filter((row) => row.activo !== false)
    .map((row) => ({
      id: row.id_corto,
      name: row.equipo,
      type: row.tipo,
      sector: "—",
      horómetro: row.horometro || null,
      status: "ok",
      nextService: null,
    }));
}

// ── Status derivado desde datos en vivo ───────────────────────
function deriveStatus(equipId, activeFdsIds, noOkRecords, serviceEvents) {
  if (activeFdsIds.has(equipId)) return "fuera_servicio";
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 3600000);
  if (serviceEvents.some((ev) =>
    ev.equipmentId === equipId &&
    new Date(ev.datetime) >= now &&
    new Date(ev.datetime) <= in24h
  )) return "warning";
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  if (noOkRecords.some((r) =>
    r.equipmentId === equipId && new Date(r.date) >= threeDaysAgo
  )) return "no_ok";
  return "ok";
}

// ── Mock data (fallback) ──────────────────────────────────────
const FLOTA_MOCK = [
  { id: "AE-25",  name: "AE N° 25 TCM",   type: "AE GLP",     sector: "—", horómetro: 12450 },
  { id: "AE-34",  name: "AE N° 34 CAT",   type: "AE GLP",     sector: "—", horómetro: 8920  },
  { id: "AE-36",  name: "AE N°36 CAT",    type: "AE GLP",     sector: "—", horómetro: 6200  },
  { id: "CONT-1", name: "CONTAINERA",      type: "CONTAINERA", sector: "—", horómetro: 3200  },
  { id: "CAM-A",  name: "CAMIÓN AZUL",     type: "CAMIÓN",     sector: "—", horómetro: 52100 },
];

const FDS_MOCK = [
  { id: 1, equipmentId: "AE-25", equipmentName: "AE N° 25 TCM", sector: "—", type: "AE GLP", startDate: "2026-03-25", reason: "Demo — pérdida de aceite", resolved: false, resolvedDate: null },
];

// ═════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═════════════════════════════════════════════════════════════
export default function FleetDashboard({ onBack }) {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("status");
  const [typeFilter, setTypeFilter] = useState("TODOS");
  const [equipFilter, setEquipFilter] = useState("");
  const [statusDetailModal, setStatusDetailModal] = useState(null);
  const [calendarWeekOffset, setCalendarWeekOffset] = useState(0);

  const [flota, setFlota] = useState([]);
  const [equipoMap, setEquipoMap] = useState({});
  const [noOkRecords, setNoOkRecords] = useState([]);
  const [servicesRaw, setServicesRaw] = useState([]);
  const [excepcionesRaw, setExcepcionesRaw] = useState([]);
  const [fdsRecords, setFdsRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dataSource, setDataSource] = useState("loading");
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const isConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (!isConfigured) {
        setFlota(FLOTA_MOCK); setNoOkRecords([]); setServicesRaw([]); setExcepcionesRaw([]);
        setFdsRecords(FDS_MOCK); setDataSource("mock"); setLoading(false);
        return;
      }
      try {
        const since = new Date();
        since.setDate(since.getDate() - 14);
        const sinceStr = since.toISOString().split("T")[0];

        const [
          { data: flotaData,  error: e1 },
          { data: checksData, error: e2 },
          { data: svcData,    error: e3 },
          { data: fdsData,    error: e4 },
          { data: excData,    error: e5 },
        ] = await Promise.all([
          supabase.from("flota").select("*").eq("activo", true),
          supabase.from("checks").select("*").gte("fecha", sinceStr),
          supabase.from("services_template").select("*"),
          supabase.from("fuera_de_servicio").select("*"),
          supabase.from("services_excepciones").select("*"),
        ]);

        [e1,e2,e3,e4,e5].forEach((e,i) => e && console.error(["flota","checks","services_template","fds","excepciones"][i], e.message));

        const eqMap = buildEquipoMap(flotaData);
        const flotaT = transformFlota(flotaData);
        const noOk = transformChecksToNoOk(checksData, eqMap);
        const fds = transformFds(fdsData);

        setEquipoMap(eqMap);
        setFlota(flotaT.length ? flotaT : FLOTA_MOCK);
        setNoOkRecords(noOk);
        setServicesRaw(svcData || []);
        setExcepcionesRaw(excData || []);
        setFdsRecords(fds.length ? fds : FDS_MOCK);
        setDataSource(flotaT.length ? "supabase" : "mock");
        console.log(`📊 flota:${flotaT.length} checks:${noOk.length} svc:${svcData?.length} fds:${fds.length}`);
      } catch (err) {
        console.error("Error:", err.message);
        setFlota(FLOTA_MOCK); setNoOkRecords([]); setServicesRaw([]); setExcepcionesRaw([]);
        setFdsRecords(FDS_MOCK); setDataSource("mock");
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLastUpdated(new Date());
      }
    }
    fetchData();
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    // Re-ejecutar el fetch completo
    const since = new Date();
    since.setDate(since.getDate() - 14);
    const sinceStr = since.toISOString().split("T")[0];
    Promise.all([
      supabase.from("flota").select("*").eq("activo", true),
      supabase.from("checks").select("*").gte("fecha", sinceStr),
      supabase.from("services_template").select("*"),
      supabase.from("fuera_de_servicio").select("*"),
      supabase.from("services_excepciones").select("*"),
    ]).then(([{ data: flotaData }, { data: checksData }, { data: svcData }, { data: fdsData }, { data: excData }]) => {
      const eqMap = buildEquipoMap(flotaData);
      const flotaT = transformFlota(flotaData);
      const noOk = transformChecksToNoOk(checksData, eqMap);
      const fds = transformFds(fdsData);
      setEquipoMap(eqMap);
      setFlota(flotaT.length ? flotaT : FLOTA_MOCK);
      setNoOkRecords(noOk);
      setServicesRaw(svcData || []);
      setExcepcionesRaw(excData || []);
      setFdsRecords(fds.length ? fds : FDS_MOCK);
      setLastUpdated(new Date());
    }).finally(() => setRefreshing(false));
  }, []);

  const serviceEvents = useMemo(
    () => transformServicesTemplate(servicesRaw, equipoMap, calendarWeekOffset, excepcionesRaw),
    [servicesRaw, equipoMap, calendarWeekOffset, excepcionesRaw]
  );

  const activeFdsIds = useMemo(
    () => new Set(fdsRecords.filter((r) => !r.resolved).map((r) => r.equipmentId)),
    [fdsRecords]
  );

  const effectiveEquipment = useMemo(() => {
    const nextSvcMap = {};
    const now = new Date();
    // Para nextService usamos siempre la semana actual (offset 0)
    const thisWeekEvents = transformServicesTemplate(servicesRaw, equipoMap, 0, excepcionesRaw);
    thisWeekEvents.forEach((ev) => {
      const d = new Date(ev.datetime);
      if (d >= now && (!nextSvcMap[ev.equipmentId] || d < new Date(nextSvcMap[ev.equipmentId])))
        nextSvcMap[ev.equipmentId] = ev.datetime;
    });
    return flota.map((eq) => ({
      ...eq,
      status: deriveStatus(eq.id, activeFdsIds, noOkRecords, thisWeekEvents),
      nextService: nextSvcMap[eq.id] || null,
    }));
  }, [flota, activeFdsIds, noOkRecords, servicesRaw, equipoMap, excepcionesRaw]);

  const types = useMemo(() => [...new Set(flota.map((e) => e.type))], [flota]);

  const filteredEquipment = useMemo(() => effectiveEquipment.filter((e) => {
    if (typeFilter !== "TODOS" && e.type !== typeFilter) return false;
    if (equipFilter && !e.id.toLowerCase().includes(equipFilter.toLowerCase()) && !e.name.toLowerCase().includes(equipFilter.toLowerCase())) return false;
    return true;
  }), [effectiveEquipment, typeFilter, equipFilter]);

  const statusCounts = useMemo(() => {
    const c = { ok: 0, warning: 0, no_ok: 0, fuera_servicio: 0 };
    filteredEquipment.forEach((e) => c[e.status]++);
    c.total = filteredEquipment.length;
    return c;
  }, [filteredEquipment]);

  const addFds = useCallback(async (entry) => {
    if (!import.meta.env.VITE_SUPABASE_URL) {
      setFdsRecords((p) => [...p, { id: Date.now(), ...entry, resolved: false, resolvedDate: null }]);
      return;
    }
    const { data, error } = await supabase.from("fuera_de_servicio").insert([{
      equipment_id: entry.equipmentId, equipment_name: entry.equipmentName,
      sector: entry.sector, type: entry.type, start_date: entry.startDate,
      reason: entry.reason, resolved: false, resolved_date: null,
    }]).select();
    if (!error && data) setFdsRecords((p) => [...p, transformFds(data)[0]]);
  }, []);

  const resolveFds = useCallback(async (id) => {
    const today = new Date().toISOString().split("T")[0];
    if (!import.meta.env.VITE_SUPABASE_URL) {
      setFdsRecords((p) => p.map((r) => r.id === id ? { ...r, resolved: true, resolvedDate: today } : r));
      return;
    }
    const { error } = await supabase.from("fuera_de_servicio")
      .update({ resolved: true, resolved_date: today }).eq("id", id);
    if (!error) setFdsRecords((p) => p.map((r) => r.id === id ? { ...r, resolved: true, resolvedDate: today } : r));
  }, []);

  if (loading) {
    return (
      <div style={{ ...styles.root, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ color: "#f59e0b", fontSize: 14, letterSpacing: 2 }}>CARGANDO FLOTA...</div>
      </div>
    );
  }

  const TABS = [
    { key: "status",   label: isMobile ? "Flota"      : "Status Flota",         icon: "◉" },
    { key: "calendar", label: isMobile ? "Calendario" : "Calendario Semanal",   icon: "◫" },
    { key: "records",  label: isMobile ? "Registro"   : "Registro NO OK (14d)", icon: "◨" },
    { key: "fds",      label: isMobile ? "Fuera Serv.": "Fuera de Servicio",    icon: "⊘" },
  ];

  return (
    <div style={styles.root}>
      <header style={styles.header} className="fleet-header">
        <div style={styles.headerLeft}>
          <div style={styles.logo}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div>
            <h1 style={styles.title} className="fleet-title">TABLERO DE CONTROL — Flota CQ</h1>
            <span style={styles.subtitle} className="fleet-subtitle">Panel de Gestión de Flota — Logística</span>
          </div>
        </div>
        <div style={styles.headerRight} className="fleet-header-right">
          {onBack && (
            <button onClick={onBack} style={{ background: "transparent", border: "1px solid #1f2937", color: "#6b7280", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontFamily: "inherit", fontSize: 11, fontWeight: 600 }}>
              ← Inicio
            </button>
          )}
          <span style={styles.dateLabel}>
            {new Date().toLocaleDateString("es-AR", { weekday: isMobile ? "short" : "long", year: "numeric", month: "long", day: "numeric" })}
          </span>
          <div style={styles.liveIndicator}><span style={styles.liveDot} />ACTIVO</div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            title={lastUpdated ? `Actualizado: ${lastUpdated.toLocaleTimeString("es-AR")}` : "Actualizar datos"}
            style={{
              background: "transparent",
              border: "1px solid #1f2937",
              color: refreshing ? "#374151" : "#6b7280",
              padding: "6px 10px",
              borderRadius: 6,
              cursor: refreshing ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              fontSize: 14,
              lineHeight: 1,
              transition: "all 0.2s",
              transform: refreshing ? "rotate(180deg)" : "rotate(0deg)",
            }}>
            ↻
          </button>
        </div>
      </header>

      {dataSource === "mock" && (
        <div style={{ padding: "8px 24px", background: "#422006", borderBottom: "1px solid #92400e", fontSize: 12, color: "#fbbf24", display: "flex", alignItems: "center", gap: 8 }}>
          <span>▲</span><span>Modo demostración — Supabase no conectado o tablas vacías.</span>
        </div>
      )}

      <nav style={styles.tabs} className="fleet-tabs">
        {TABS.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} className="fleet-tab-btn"
            style={{ ...styles.tab, ...(activeTab === tab.key ? styles.tabActive : {}) }}>
            <span style={{ marginRight: 6, fontSize: 14 }}>{tab.icon}</span>{tab.label}
          </button>
        ))}
      </nav>

      <div style={styles.filtersBar} className="fleet-filters-bar">
        <div style={styles.filterGroup} className="fleet-filter-group">
          <label style={styles.filterLabel}>Tipo Equipo</label>
          <select style={styles.select} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="TODOS">Todos los tipos</option>
            {types.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div style={styles.filterGroup} className="fleet-filter-group">
          <label style={styles.filterLabel}>N° Equipo</label>
          <input style={styles.input} placeholder="Buscar equipo..." value={equipFilter}
            onChange={(e) => setEquipFilter(e.target.value)} />
        </div>
        {(typeFilter !== "TODOS" || equipFilter) && (
          <button className="fleet-clear-btn" style={styles.clearBtn}
            onClick={() => { setTypeFilter("TODOS"); setEquipFilter(""); }}>✕ Limpiar</button>
        )}
      </div>

      <main style={styles.content} className="fleet-content">
        {activeTab === "status" && (
          <StatusFlota equipment={filteredEquipment} counts={statusCounts}
            onDetail={setStatusDetailModal} isMobile={isMobile} />
        )}
        {activeTab === "calendar" && (
          <CalendarView equipment={filteredEquipment} events={serviceEvents}
            weekOffset={calendarWeekOffset} setWeekOffset={setCalendarWeekOffset} isMobile={isMobile} />
        )}
        {activeTab === "records" && (
          <RecordView equipment={filteredEquipment} records={noOkRecords} isMobile={isMobile} />
        )}
        {activeTab === "fds" && (
          <FueraDeServicio records={fdsRecords} equipment={flota}
            onAdd={addFds} onResolve={resolveFds} isMobile={isMobile} />
        )}
      </main>

      {statusDetailModal && (
        <DetailModal equipment={statusDetailModal}
          records={noOkRecords.filter((r) => r.equipmentId === statusDetailModal.id)}
          onClose={() => setStatusDetailModal(null)} />
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// SUB-COMPONENTES
// ═════════════════════════════════════════════════════════════

function StatusFlota({ equipment, counts, onDetail, isMobile }) {
  return (
    <div>
      <div style={styles.statusCards} className="fleet-status-cards">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <div key={key} style={{ ...styles.statusCard, borderColor: cfg.color, background: cfg.bg }}>
            <div style={{ ...styles.statusIcon, color: cfg.color }}>{cfg.icon}</div>
            <div style={styles.statusCount}>
              <span style={{ ...styles.statusNumber, color: cfg.color }}>{counts[key]}</span>
              <span style={styles.statusLabel}>{cfg.label}</span>
            </div>
          </div>
        ))}
        <div style={{ ...styles.statusCard, borderColor: "#8b5cf6", background: "#1e1b4b" }}>
          <div style={{ ...styles.statusIcon, color: "#8b5cf6" }}>Σ</div>
          <div style={styles.statusCount}>
            <span style={{ ...styles.statusNumber, color: "#8b5cf6" }}>{counts.total}</span>
            <span style={styles.statusLabel}>Total Flota</span>
          </div>
        </div>
      </div>
      <div style={styles.tableContainer} className="fleet-table-container">
        <table style={styles.table}>
          <thead><tr>
            <th style={styles.th}>Estado</th>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>Nombre</th>
            <th style={styles.th} className="fleet-col-type">Tipo</th>
            <th style={styles.th} className="fleet-col-horometro">Horómetro</th>
            <th style={styles.th}>Próx. Service</th>
            <th style={styles.th}>Detalle</th>
          </tr></thead>
          <tbody>
            {equipment.map((eq) => {
              const cfg = STATUS_CONFIG[eq.status];
              const nextSvc = eq.nextService ? new Date(eq.nextService) : null;
              const hoursUntil = nextSvc ? Math.round((nextSvc - new Date()) / 3600000) : null;
              return (
                <tr key={eq.id} style={styles.tr}>
                  <td style={styles.td}>
                    <span style={{ ...styles.statusBadge, background: cfg.bg, color: cfg.color, borderColor: cfg.color }}>
                      {cfg.icon} {cfg.label}
                    </span>
                  </td>
                  <td style={{ ...styles.td, ...styles.tdMono }}>{eq.id}</td>
                  <td style={styles.td}>{eq.name}</td>
                  <td style={styles.td} className="fleet-col-type"><span style={styles.typeBadge}>{eq.type}</span></td>
                  <td style={{ ...styles.td, ...styles.tdMono }} className="fleet-col-horometro">
                    {eq.horómetro ? eq.horómetro.toLocaleString() : "N/A"}
                  </td>
                  <td style={styles.td}>
                    {nextSvc ? (
                      <div>
                        <div style={styles.dateText}>
                          {nextSvc.toLocaleDateString("es-AR", { day: "2-digit", month: "short" })} — {nextSvc.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                        {hoursUntil !== null && hoursUntil <= 24 && hoursUntil > 0 && (
                          <span style={styles.urgentBadge}>⏱ En {hoursUntil}h</span>
                        )}
                      </div>
                    ) : <span style={{ color: "#6b7280" }}>—</span>}
                  </td>
                  <td style={styles.td}>
                    <button style={styles.detailBtn} className="fleet-action-btn" onClick={() => onDetail(eq)}>
                      Ver detalle
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CalendarView({ equipment, events, weekOffset, setWeekOffset, isMobile }) {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7) + weekOffset * 7);
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday); d.setDate(monday.getDate() + i); return d;
  });
  const todayStr = now.toISOString().split("T")[0];
  const eqIds = new Set(equipment.map((e) => e.id));
  const filteredEvents = events.filter((ev) => eqIds.has(ev.equipmentId));
  const hours = Array.from({ length: 13 }, (_, i) => i + 7);
  const weekTitle = `Semana del ${monday.toLocaleDateString("es-AR", { day: "2-digit", month: "long" })} al ${weekDates[6].toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })}`;

  const eventsByDay = useMemo(() => {
    const g = {};
    weekDates.forEach((d) => {
      const ds = d.toISOString().split("T")[0];
      g[ds] = filteredEvents.filter((ev) => ev.datetime.startsWith(ds)).sort((a, b) => a.datetime.localeCompare(b.datetime));
    });
    return g;
  }, [filteredEvents, weekOffset]);

  return (
    <div>
      <div style={styles.calendarHeader} className="fleet-cal-header">
        <button style={styles.weekBtn} onClick={() => setWeekOffset(weekOffset - 1)}>← Anterior</button>
        <h3 style={styles.weekTitle}>{weekTitle}</h3>
        <button style={styles.weekBtn} onClick={() => setWeekOffset(weekOffset + 1)}>Siguiente →</button>
      </div>

      <div className="fleet-cal-grid-container">
        <div style={styles.calendarGrid}>
          <div style={styles.calTimeHeader}></div>
          {weekDates.map((d, i) => {
            const isToday = d.toISOString().split("T")[0] === todayStr;
            return (
              <div key={i} style={{ ...styles.calDayHeader, ...(isToday ? styles.calDayToday : {}) }}>
                <span style={styles.calDayName}>{DAYS[i]}</span>
                <span style={styles.calDayNum}>{d.getDate()}</span>
              </div>
            );
          })}
          {hours.map((hour) => (
            <>
              <div key={`t-${hour}`} style={styles.calTimeCell}>{`${hour}:00`}</div>
              {weekDates.map((d, di) => {
                const ds = d.toISOString().split("T")[0];
                const de = filteredEvents.filter((ev) => {
                  const eh = parseInt(ev.datetime.split("T")[1]?.split(":")[0]);
                  return ev.datetime.startsWith(ds) && eh === hour;
                });
                return (
                  <div key={`${hour}-${di}`} style={styles.calCell}>
                    {de.map((ev, ei) => (
                      <div key={ei} style={{ ...styles.calEvent, borderLeftColor: ev.type === "excepcion" ? "#8b5cf6" : "#f59e0b", background: ev.type === "excepcion" ? "#2e1065" : "#422006" }}>
                        <span style={styles.calEventTime}>{ev.datetime.split("T")[1]?.slice(0, 5)}</span>
                        <span style={styles.calEventName}>{ev.equipmentId}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>

      <div className="fleet-cal-list">
        {weekDates.map((d) => {
          const ds = d.toISOString().split("T")[0];
          const de = eventsByDay[ds] || [];
          const isToday = ds === todayStr;
          return (
            <div key={ds} style={{ marginBottom: 12 }}>
              <div style={{ padding: "8px 12px", background: isToday ? "#1e293b" : "#111827", borderRadius: 6, borderLeft: isToday ? "3px solid #f59e0b" : "3px solid #1f2937", marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: isToday ? "#f59e0b" : "#d1d5db" }}>
                  {DAYS[weekDates.indexOf(d)]} {d.getDate()}
                </span>
                {de.length > 0 && <span style={{ fontSize: 10, color: "#9ca3af", background: "#1f2937", padding: "2px 6px", borderRadius: 3 }}>{de.length} servicios</span>}
              </div>
              {de.length === 0
                ? <div style={{ fontSize: 11, color: "#374151", padding: "4px 12px" }}>Sin servicios programados</div>
                : de.map((ev, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: ev.type === "excepcion" ? "#2e1065" : "#422006", borderRadius: 6, borderLeft: `3px solid ${ev.type === "excepcion" ? "#8b5cf6" : "#f59e0b"}`, marginBottom: 4, fontSize: 12 }}>
                    <span style={{ color: "#9ca3af", minWidth: 40 }}>{ev.datetime.split("T")[1]?.slice(0, 5)}</span>
                    <span style={{ fontWeight: 700, color: "#f3f4f6" }}>{ev.equipmentId}</span>
                    <span style={{ color: "#9ca3af" }}>{ev.equipmentName}</span>
                  </div>
                ))
              }
            </div>
          );
        })}
      </div>

      <div style={styles.calLegend}>
        <div style={styles.legendItem}><span style={{ ...styles.legendDot, background: "#f59e0b" }} />Service semanal programado</div>
        <div style={styles.legendItem}><span style={{ ...styles.legendDot, background: "#8b5cf6" }} />Excepción (horario modificado)</div>
      </div>
    </div>
  );
}

function RecordView({ equipment, records, isMobile }) {
  const [selectedEquip, setSelectedEquip] = useState(null);   // click fila → resumen equipo
  const [selectedItem, setSelectedItem] = useState(null);     // click header → resumen ítem
  const [selectedCell, setSelectedCell] = useState(null);     // click celda → equipo+ítem
  const [tooltip, setTooltip] = useState(null);               // hover desktop

  // Drawer mobile — unifica los tres modos
  const [drawer, setDrawer] = useState(null); // { type: "equip"|"item"|"cell", ... }

  const closeAll = () => {
    setSelectedEquip(null);
    setSelectedItem(null);
    setSelectedCell(null);
    setDrawer(null);
  };

  const eqIds = new Set(equipment.map((e) => e.id));
  const relevantRecords = records.filter((r) => eqIds.has(r.equipmentId));

  const aggregated = useMemo(() => {
    const m = {};
    relevantRecords.forEach((r) => {
      if (!m[r.equipmentId]) m[r.equipmentId] = {};
      if (!m[r.equipmentId][r.item]) m[r.equipmentId][r.item] = 0;
      m[r.equipmentId][r.item]++;
    });
    return m;
  }, [relevantRecords]);

  // En mobile mostramos SOLO columnas que tienen al menos 1 falla
  const displayItems = useMemo(() => {
    if (!isMobile) return CHECK_ITEMS;
    return CHECK_ITEMS.filter((item) =>
      equipment.some((eq) => (aggregated[eq.id]?.[item] || 0) > 0)
    );
  }, [isMobile, aggregated, equipment]);

  // Registros filtrados para el panel activo
  const panelRecords = useMemo(() => {
    if (selectedEquip)
      return relevantRecords.filter((r) => r.equipmentId === selectedEquip).sort((a, b) => b.date.localeCompare(a.date));
    if (selectedItem)
      return relevantRecords.filter((r) => r.item === selectedItem).sort((a, b) => b.date.localeCompare(a.date));
    if (selectedCell)
      return relevantRecords.filter((r) => r.equipmentId === selectedCell.equipId && r.item === selectedCell.item).sort((a, b) => b.date.localeCompare(a.date));
    return [];
  }, [selectedEquip, selectedItem, selectedCell, relevantRecords]);

  const panelTitle = selectedEquip
    ? `Equipo — ${selectedEquip}`
    : selectedItem
    ? `Ítem — ${selectedItem}`
    : selectedCell
    ? `${selectedCell.equipId} × ${selectedCell.item}`
    : "";

  // Handlers
  const handleEquipClick = (equipId) => {
    if (isMobile) {
      setDrawer({ type: "equip", id: equipId });
    } else {
      setSelectedItem(null); setSelectedCell(null);
      setSelectedEquip(selectedEquip === equipId ? null : equipId);
    }
  };

  const handleItemClick = (item) => {
    const hasRecords = relevantRecords.some((r) => r.item === item);
    if (!hasRecords) return;
    if (isMobile) {
      setDrawer({ type: "item", item });
    } else {
      setSelectedEquip(null); setSelectedCell(null);
      setSelectedItem(selectedItem === item ? null : item);
    }
  };

  const handleCellClick = (equipId, item, count) => {
    if (count === 0) return;
    if (isMobile) {
      setDrawer({ type: "cell", equipId, item });
    } else {
      setSelectedEquip(null); setSelectedItem(null);
      setSelectedCell(
        selectedCell?.equipId === equipId && selectedCell?.item === item ? null : { equipId, item }
      );
    }
  };

  // Tooltip desktop (hover)
  const handleCellHover = (e, equipId, item, count) => {
    if (isMobile || count === 0) return;
    const cr = relevantRecords
      .filter((r) => r.equipmentId === equipId && r.item === item)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5);
    setTooltip({ x: e.clientX, y: e.clientY, equipId, item, count, records: cr });
  };

  // Registros del drawer mobile
  const drawerRecords = useMemo(() => {
    if (!drawer) return [];
    if (drawer.type === "equip")
      return relevantRecords.filter((r) => r.equipmentId === drawer.id).sort((a, b) => b.date.localeCompare(a.date));
    if (drawer.type === "item")
      return relevantRecords.filter((r) => r.item === drawer.item).sort((a, b) => b.date.localeCompare(a.date));
    if (drawer.type === "cell")
      return relevantRecords.filter((r) => r.equipmentId === drawer.equipId && r.item === drawer.item).sort((a, b) => b.date.localeCompare(a.date));
    return [];
  }, [drawer, relevantRecords]);

  const drawerTitle =
    drawer?.type === "equip" ? `Equipo — ${drawer.id}` :
    drawer?.type === "item"  ? `Ítem — ${drawer.item}` :
    drawer?.type === "cell"  ? `${drawer.equipId} × ${drawer.item}` : "";

  return (
    <div>
      <p style={rs.sectionDesc}>
        Ítems reportados como <span style={{ color: "#ef4444", fontWeight: 700 }}>NO OK</span> en los últimos 14 días.
        {isMobile
          ? <span style={{ color: "#6b7280" }}> Tocá una celda, equipo o ítem para ver el detalle.</span>
          : <span style={{ color: "#6b7280" }}> Hover para vista rápida. Clic en celda, equipo o ítem para panel completo.</span>
        }
      </p>

      {/* ─── Tabla heatmap ─── */}
      <div style={rs.tableWrap} className="fleet-table-container fleet-heatmap-container">
        <table style={rs.table}>
          <thead>
            <tr>
              {/* Header esquina */}
              <th style={{ ...rs.th, position: "sticky", left: 0, background: "#111827", zIndex: 3, minWidth: 70 }}>
                EQUIPO
              </th>
              {/* Headers de ítems — clickeables */}
              {displayItems.map((item, i) => {
                const totalItem = relevantRecords.filter((r) => r.item === item).length;
                const isSelected = selectedItem === item;
                return (
                  <th key={i}
                    onClick={() => handleItemClick(item)}
                    style={{
                      ...rs.th,
                      fontSize: 10,
                      writingMode: "vertical-rl",
                      textAlign: "left",
                      padding: "8px 4px",
                      maxWidth: 32,
                      cursor: totalItem > 0 ? "pointer" : "default",
                      color: isSelected ? "#f59e0b" : totalItem > 0 ? "#d1d5db" : "#4b5563",
                      background: isSelected ? "#1c1400" : "#111827",
                      transition: "all 0.15s",
                    }}>
                    {item}
                  </th>
                );
              })}
              <th style={{ ...rs.th, background: "#1e1b4b", minWidth: 56 }}>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {equipment.map((eq) => {
              const eqData = aggregated[eq.id] || {};
              const total = Object.values(eqData).reduce((s, v) => s + v, 0);
              if (total === 0) return null;
              const isEquipSelected = selectedEquip === eq.id;
              return (
                <tr key={eq.id} style={{ ...rs.tr, background: isEquipSelected ? "#1e293b" : undefined }}>
                  {/* Nombre equipo — clickeable */}
                  <td
                    onClick={() => handleEquipClick(eq.id)}
                    style={{
                      ...rs.td,
                      position: "sticky", left: 0, zIndex: 1,
                      background: isEquipSelected ? "#1e293b" : "#111827",
                      fontWeight: 700, whiteSpace: "nowrap",
                      cursor: "pointer",
                      color: isEquipSelected ? "#f59e0b" : "#e5e7eb",
                      borderRight: "1px solid #1f2937",
                      transition: "all 0.15s",
                    }}>
                    {eq.id}
                  </td>
                  {/* Celdas — clickeables */}
                  {displayItems.map((item, i) => {
                    const c = eqData[item] || 0;
                    const intensity = c === 0 ? 0 : Math.min(c / 4, 1);
                    const isCellSelected = selectedCell?.equipId === eq.id && selectedCell?.item === item;
                    return (
                      <td key={i}
                        onClick={() => handleCellClick(eq.id, item, c)}
                        onMouseMove={(e) => handleCellHover(e, eq.id, item, c)}
                        onMouseLeave={() => setTooltip(null)}
                        style={{
                          ...rs.td,
                          textAlign: "center",
                          background: isCellSelected
                            ? "#f59e0b33"
                            : c > 0
                            ? `rgba(239,68,68,${0.15 + intensity * 0.55})`
                            : "transparent",
                          color: c > 0 ? "#fca5a5" : "#374151",
                          fontWeight: c > 0 ? 700 : 400,
                          fontSize: 13,
                          cursor: c > 0 ? "pointer" : "default",
                          outline: isCellSelected ? "2px solid #f59e0b" : "none",
                          transition: "all 0.1s",
                        }}>
                        {c || "·"}
                      </td>
                    );
                  })}
                  {/* Total */}
                  <td style={{
                    ...rs.td, textAlign: "center", fontWeight: 800,
                    color: total > 5 ? "#ef4444" : total > 2 ? "#eab308" : "#9ca3af",
                    background: "#1e1b4b", fontSize: 15,
                  }}>
                    {total}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ─── Tooltip hover (solo desktop) ─── */}
      {tooltip && !isMobile && (
        <div style={{
          position: "fixed",
          left: Math.min(tooltip.x + 16, window.innerWidth - 310),
          top: Math.max(tooltip.y - 20, 10),
          width: 290,
          background: "#1e293b", border: "1px solid #475569",
          borderRadius: 10, padding: "12px 14px",
          zIndex: 9999, boxShadow: "0 12px 40px rgba(0,0,0,0.7)",
          pointerEvents: "none", fontSize: 12, fontFamily: "inherit",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, paddingBottom: 8, borderBottom: "1px solid #334155" }}>
            <span style={{ fontWeight: 800, color: "#f59e0b", fontSize: 13 }}>{tooltip.equipId}</span>
            <span style={{ background: "#450a0a", color: "#fca5a5", padding: "2px 8px", borderRadius: 4, fontWeight: 700, fontSize: 11 }}>{tooltip.count}× NO OK</span>
          </div>
          <div style={{ color: "#94a3b8", fontSize: 11, marginBottom: 8, fontWeight: 600 }}>{tooltip.item}</div>
          {tooltip.records.map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderTop: i > 0 ? "1px solid #1f293766" : "none", fontSize: 11 }}>
              <span style={{ color: "#9ca3af", minWidth: 42, fontWeight: 600 }}>
                {r.date ? new Date(r.date).toLocaleDateString("es-AR", { day: "2-digit", month: "short" }) : "—"}
              </span>
              <span style={{ color: "#6b7280", background: "#0f172a", padding: "1px 5px", borderRadius: 3, fontSize: 10, fontWeight: 600 }}>{r.turno || "—"}</span>
              <span style={{ color: "#e2e8f0", flex: 1 }}>{r.descripcion || "Sin descripción"}</span>
            </div>
          ))}
          <div style={{ color: "#64748b", fontSize: 10, marginTop: 6, textAlign: "center" }}>Clic para ver todos los registros</div>
        </div>
      )}

      {/* ─── Panel detalle (desktop) ─── */}
      {(selectedEquip || selectedItem || selectedCell) && panelRecords.length > 0 && !isMobile && (
        <div style={rs.panel}>
          <div style={rs.panelHeader}>
            <h4 style={rs.panelTitle}>{panelTitle} <span style={rs.panelCount}>{panelRecords.length} registros</span></h4>
            <button onClick={closeAll} style={rs.closeBtn}>✕</button>
          </div>
          <RecordList records={panelRecords} />
        </div>
      )}

      {/* ─── Drawer mobile ─── */}
      {isMobile && drawer && (
        <>
          {/* Overlay */}
          <div
            onClick={() => setDrawer(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 998 }}
          />
          {/* Drawer */}
          <div style={rs.drawer}>
            <div style={rs.drawerHandle} />
            <div style={rs.drawerHeader}>
              <div>
                <div style={rs.drawerTitle}>{drawerTitle}</div>
                <div style={rs.drawerCount}>{drawerRecords.length} registros NO OK</div>
              </div>
              <button onClick={() => setDrawer(null)} style={rs.closeBtn}>✕</button>
            </div>
            <div style={rs.drawerBody}>
              {drawerRecords.length === 0
                ? <div style={{ color: "#6b7280", textAlign: "center", padding: 24, fontSize: 13 }}>Sin registros</div>
                : <RecordList records={drawerRecords} isMobile />
              }
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Lista de registros reutilizable ─────────────────────────
function RecordList({ records, isMobile }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {records.map((r, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "flex-start", gap: 10,
          padding: "10px 12px", background: "#0d1117",
          borderRadius: 6, border: "1px solid #1f2937", fontSize: 12,
          flexWrap: "wrap",
        }}>
          <div style={{ color: "#9ca3af", minWidth: 50, fontWeight: 600, flexShrink: 0 }}>
            {r.date ? new Date(r.date).toLocaleDateString("es-AR", { day: "2-digit", month: "short" }) : "—"}
          </div>
          <span style={{ color: "#6b7280", fontSize: 10, background: "#1f2937", padding: "2px 6px", borderRadius: 3, fontWeight: 600, flexShrink: 0 }}>
            {r.turno || "—"}
          </span>
          {!isMobile && (
            <span style={{ color: "#f59e0b", fontWeight: 700, minWidth: 60, flexShrink: 0 }}>
              {r.equipmentId}
            </span>
          )}
          <span style={{ color: "#fca5a5", fontWeight: 600, flex: 1, minWidth: 100 }}>
            {r.item}
          </span>
          <span style={{ color: "#d1d5db", flex: 2, minWidth: 120 }}>
            {r.descripcion || "Sin descripción"}
          </span>
          {isMobile && (
            <span style={{ color: "#6b7280", fontSize: 10, width: "100%", marginTop: 2 }}>
              {r.equipmentId} — {r.operario || ""}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Estilos del RecordView ───────────────────────────────────
const rs = {
  sectionDesc: { fontSize: 13, color: "#9ca3af", marginBottom: 16, lineHeight: 1.5 },
  tableWrap: { overflowX: "auto", borderRadius: 10, border: "1px solid #1f2937" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 12 },
  th: {
    padding: "10px 12px", textAlign: "left", background: "#111827",
    color: "#9ca3af", fontWeight: 700, fontSize: 10, textTransform: "uppercase",
    letterSpacing: 1, borderBottom: "1px solid #1f2937", whiteSpace: "nowrap",
  },
  tr: { borderBottom: "1px solid #1f293766" },
  td: { padding: "10px 12px", verticalAlign: "middle" },
  panel: {
    marginTop: 20, padding: 16, background: "#111827",
    borderRadius: 10, border: "1px solid #1f2937",
  },
  panelHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    marginBottom: 14,
  },
  panelTitle: {
    margin: 0, fontSize: 14, color: "#e5e7eb",
    display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
  },
  panelCount: {
    fontSize: 11, color: "#6b7280", background: "#1f2937",
    padding: "2px 8px", borderRadius: 4, fontWeight: 400,
  },
  closeBtn: {
    background: "transparent", border: "1px solid #374151",
    color: "#6b7280", padding: "4px 10px", borderRadius: 6,
    cursor: "pointer", fontFamily: "inherit", fontSize: 13, flexShrink: 0,
  },
  // ── Drawer mobile ──
  drawer: {
    position: "fixed", bottom: 0, left: 0, right: 0,
    background: "#111827", borderRadius: "16px 16px 0 0",
    border: "1px solid #1f2937", borderBottom: "none",
    zIndex: 999, maxHeight: "80vh",
    display: "flex", flexDirection: "column",
    boxShadow: "0 -20px 60px rgba(0,0,0,0.6)",
  },
  drawerHandle: {
    width: 40, height: 4, borderRadius: 2, background: "#374151",
    margin: "12px auto 0", flexShrink: 0,
  },
  drawerHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    padding: "16px 20px 12px", borderBottom: "1px solid #1f2937", flexShrink: 0,
  },
  drawerTitle: { fontSize: 14, fontWeight: 700, color: "#f3f4f6", marginBottom: 3 },
  drawerCount: { fontSize: 11, color: "#6b7280" },
  drawerBody: { overflowY: "auto", padding: "14px 16px 24px", flex: 1 },
};


function DetailModal({ equipment, records, onClose }) {
  const cfg = STATUS_CONFIG[equipment.status];
  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} className="fleet-modal" onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <div>
            <h3 style={styles.modalTitle}>{equipment.name}</h3>
            <span style={{ ...styles.statusBadge, background: cfg.bg, color: cfg.color, borderColor: cfg.color, fontSize: 13 }}>
              {cfg.icon} {cfg.label}
            </span>
          </div>
          <button style={styles.modalClose} onClick={onClose}>✕</button>
        </div>
        <div style={styles.modalBody}>
          <div style={styles.modalGrid} className="fleet-modal-grid">
            <div style={styles.modalField}><span style={styles.modalFieldLabel}>ID</span><span>{equipment.id}</span></div>
            <div style={styles.modalField}><span style={styles.modalFieldLabel}>Tipo</span><span>{equipment.type}</span></div>
            <div style={styles.modalField}><span style={styles.modalFieldLabel}>Horómetro</span><span>{equipment.horómetro?.toLocaleString() || "N/A"}</span></div>
            <div style={styles.modalField}>
              <span style={styles.modalFieldLabel}>Próx. Service</span>
              <span>{equipment.nextService ? new Date(equipment.nextService).toLocaleString("es-AR") : "Sin programar"}</span>
            </div>
            <div style={styles.modalField}>
              <span style={styles.modalFieldLabel}>Reportes NO OK (14d)</span>
              <span style={{ color: records.length > 0 ? "#ef4444" : "#16a34a", fontWeight: 700 }}>{records.length}</span>
            </div>
          </div>
          {records.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <h4 style={{ color: "#d1d5db", marginBottom: 8, fontSize: 13, textTransform: "uppercase", letterSpacing: 1 }}>Últimos reportes NO OK</h4>
              {records.slice(0, 6).map((r, i) => (
                <div key={i} style={styles.modalRecord}>
                  <span style={{ color: "#9ca3af", minWidth: 55 }}>{new Date(r.date).toLocaleDateString("es-AR", { day: "2-digit", month: "short" })}</span>
                  <span style={{ color: "#fca5a5", fontWeight: 600, flex: 1 }}>{r.item}</span>
                  <span style={{ color: "#6b7280", fontSize: 12 }}>{r.operario}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  root: { fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace", background: "#0a0f1a", color: "#e5e7eb", minHeight: "100vh" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", background: "linear-gradient(180deg, #111827 0%, #0a0f1a 100%)", borderBottom: "1px solid #1f2937" },
  headerLeft: { display: "flex", alignItems: "center", gap: 14 },
  logo: { width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", background: "#1c1917", borderRadius: 8, border: "1px solid #f59e0b33", flexShrink: 0 },
  title: { margin: 0, fontSize: 18, fontWeight: 800, letterSpacing: 3, color: "#f59e0b", textTransform: "uppercase" },
  subtitle: { fontSize: 11, color: "#6b7280", letterSpacing: 1 },
  headerRight: { display: "flex", alignItems: "center", gap: 16, flexShrink: 0 },
  dateLabel: { fontSize: 12, color: "#9ca3af", textTransform: "capitalize" },
  liveIndicator: { display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#16a34a", fontWeight: 700, letterSpacing: 1 },
  liveDot: { width: 8, height: 8, borderRadius: "50%", background: "#16a34a", flexShrink: 0 },
  tabs: { display: "flex", gap: 2, padding: "0 24px", background: "#111827", borderBottom: "1px solid #1f2937" },
  tab: { padding: "12px 20px", fontSize: 13, fontWeight: 600, letterSpacing: 0.5, background: "transparent", color: "#6b7280", border: "none", borderBottom: "2px solid transparent", cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" },
  tabActive: { color: "#f59e0b", borderBottomColor: "#f59e0b", background: "#f59e0b0a" },
  filtersBar: { display: "flex", gap: 16, padding: "12px 24px", background: "#0d1117", borderBottom: "1px solid #1f2937", alignItems: "flex-end", flexWrap: "wrap" },
  filterGroup: { display: "flex", flexDirection: "column", gap: 4 },
  filterLabel: { fontSize: 10, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 },
  select: { padding: "7px 12px", fontSize: 12, background: "#1f2937", color: "#e5e7eb", border: "1px solid #374151", borderRadius: 6, fontFamily: "inherit", minWidth: 170, cursor: "pointer" },
  input: { padding: "7px 12px", fontSize: 12, background: "#1f2937", color: "#e5e7eb", border: "1px solid #374151", borderRadius: 6, fontFamily: "inherit", minWidth: 160 },
  clearBtn: { padding: "7px 14px", fontSize: 11, background: "#7f1d1d", color: "#fca5a5", border: "1px solid #991b1b", borderRadius: 6, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 },
  content: { padding: "20px 24px" },
  statusCards: { display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" },
  statusCard: { display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderRadius: 10, border: "1px solid", flex: "1 1 150px", minWidth: 130 },
  statusIcon: { fontSize: 22, fontWeight: 800 },
  statusCount: { display: "flex", flexDirection: "column" },
  statusNumber: { fontSize: 26, fontWeight: 800, lineHeight: 1 },
  statusLabel: { fontSize: 11, color: "#9ca3af", letterSpacing: 0.5, marginTop: 2 },
  tableContainer: { overflowX: "auto", borderRadius: 10, border: "1px solid #1f2937" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 12 },
  th: { padding: "10px 12px", textAlign: "left", background: "#111827", color: "#9ca3af", fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: 1, borderBottom: "1px solid #1f2937", whiteSpace: "nowrap" },
  tr: { borderBottom: "1px solid #1f293766" },
  td: { padding: "10px 12px", verticalAlign: "middle" },
  tdMono: { fontWeight: 600, letterSpacing: 0.5 },
  statusBadge: { display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, border: "1px solid", whiteSpace: "nowrap" },
  typeBadge: { padding: "2px 8px", borderRadius: 4, fontSize: 10, background: "#1e293b", color: "#94a3b8", border: "1px solid #334155", fontWeight: 600 },
  dateText: { fontSize: 12, color: "#d1d5db" },
  urgentBadge: { display: "inline-block", marginTop: 3, padding: "2px 8px", borderRadius: 4, fontSize: 10, background: "#422006", color: "#fbbf24", fontWeight: 700, border: "1px solid #92400e" },
  detailBtn: { padding: "5px 12px", fontSize: 11, background: "#1e293b", color: "#93c5fd", border: "1px solid #1e40af", borderRadius: 6, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 },
  calendarHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 },
  weekBtn: { padding: "8px 16px", fontSize: 12, background: "#1f2937", color: "#d1d5db", border: "1px solid #374151", borderRadius: 6, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 },
  weekTitle: { margin: 0, fontSize: 15, color: "#f3f4f6", fontWeight: 700 },
  calendarGrid: { display: "grid", gridTemplateColumns: "60px repeat(7, 1fr)", border: "1px solid #1f2937", borderRadius: 10, overflow: "hidden" },
  calTimeHeader: { background: "#111827", padding: 8 },
  calDayHeader: { background: "#111827", padding: "10px 8px", textAlign: "center", borderLeft: "1px solid #1f2937", borderBottom: "1px solid #1f2937" },
  calDayToday: { background: "#1e293b", borderBottom: "2px solid #f59e0b" },
  calDayName: { display: "block", fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: 1 },
  calDayNum: { display: "block", fontSize: 18, fontWeight: 800, color: "#f3f4f6", marginTop: 2 },
  calTimeCell: { padding: "8px", fontSize: 11, color: "#6b7280", fontWeight: 600, borderTop: "1px solid #1f2937", background: "#0d1117", textAlign: "right" },
  calCell: { padding: 4, borderTop: "1px solid #1f293755", borderLeft: "1px solid #1f293755", minHeight: 44, background: "#0a0f1a" },
  calEvent: { padding: "4px 6px", borderRadius: 4, borderLeft: "3px solid", marginBottom: 3, fontSize: 10, lineHeight: 1.3 },
  calEventTime: { display: "block", color: "#9ca3af", fontWeight: 600 },
  calEventName: { display: "block", color: "#f3f4f6", fontWeight: 700, fontSize: 11 },
  calLegend: { display: "flex", gap: 24, marginTop: 16, padding: "12px 16px", background: "#111827", borderRadius: 8, flexWrap: "wrap" },
  legendItem: { display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#9ca3af" },
  legendDot: { width: 10, height: 10, borderRadius: "50%", flexShrink: 0 },
  sectionDesc: { fontSize: 13, color: "#9ca3af", marginBottom: 16, lineHeight: 1.5 },
  recordDetail: { marginTop: 20, padding: 16, background: "#111827", borderRadius: 10, border: "1px solid #1f2937" },
  recordDetailTitle: { margin: 0, fontSize: 14, color: "#e5e7eb", marginBottom: 12, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" },
  recordCount: { fontSize: 11, color: "#6b7280", background: "#1f2937", padding: "2px 8px", borderRadius: 4 },
  recordList: { display: "flex", flexDirection: "column", gap: 6 },
  recordItem: { display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", background: "#0d1117", borderRadius: 6, border: "1px solid #1f2937", fontSize: 12, flexWrap: "wrap" },
  recordDate: { color: "#9ca3af", minWidth: 50, fontWeight: 600 },
  recordTurno: { color: "#6b7280", fontSize: 10, background: "#1f2937", padding: "2px 6px", borderRadius: 3, fontWeight: 600 },
  recordItemName: { color: "#fca5a5", fontWeight: 700, flex: 1, minWidth: 120 },
  recordDesc: { color: "#6b7280", fontSize: 11, flex: 1 },
  recordOp: { color: "#6b7280", fontSize: 11, minWidth: 90 },
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal: { background: "#111827", borderRadius: 12, border: "1px solid #374151", width: "90%", maxWidth: 560, maxHeight: "80vh", overflow: "auto" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "20px 24px 12px", borderBottom: "1px solid #1f2937" },
  modalTitle: { margin: "0 0 8px", fontSize: 18, fontWeight: 800, color: "#f3f4f6" },
  modalClose: { background: "transparent", border: "none", color: "#6b7280", fontSize: 18, cursor: "pointer", padding: "4px 8px" },
  modalBody: { padding: "16px 24px 24px" },
  modalGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  modalField: { display: "flex", flexDirection: "column", gap: 2 },
  modalFieldLabel: { fontSize: 10, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 },
  modalRecord: { display: "flex", alignItems: "center", gap: 10, padding: "6px 10px", background: "#0d1117", borderRadius: 4, marginBottom: 4, fontSize: 12 },
};
