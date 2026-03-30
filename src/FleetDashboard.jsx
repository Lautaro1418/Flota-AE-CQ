import { useState, useMemo, useEffect } from "react";

// ─── Responsive Hook ─────────────────────────────────────────
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 768 : false
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return isMobile;
}

// ─── Mock Data ───────────────────────────────────────────────
const SECTORS = [
  "ALMACEN",
  "EXPEDICIÓN",
  "FRACCIONADO",
  "VERTICALIZADA",
  "ESTIBAS",
  "ETIQUETAS",
  "VARIETAL NORTE",
  "VARIETAL SUR",
  "TRAPICHE",
  "MANTENIMIENTO",
];

const EQUIPMENT = [
  { id: "AE-25", name: "AE N°25 TCM FG25T3", type: "AE GLP", sector: "ALMACEN", status: "ok", nextService: "2026-03-31T08:00", horómetro: 12450 },
  { id: "AE-34", name: "AE CAT N°34", type: "AE GLP", sector: "EXPEDICIÓN", status: "ok", nextService: "2026-03-31T10:00", horómetro: 8920 },
  { id: "AE-27", name: "AE N°27 TCM FG25T3", type: "AE GLP", sector: "ALMACEN", status: "warning", nextService: "2026-03-30T14:00", horómetro: 15230 },
  { id: "AE-02", name: "AE N°2 MITSUBISHI", type: "AE GLP", sector: "FRACCIONADO", status: "no_ok", nextService: "2026-04-01T09:00", horómetro: 18750 },
  { id: "AE-05", name: "AE N°5 TCM FG25T3", type: "AE GLP", sector: "VERTICALIZADA", status: "ok", nextService: "2026-04-02T08:00", horómetro: 11200 },
  { id: "AE-22", name: "AE N°22 MITSUBISHI", type: "AE GLP", sector: "ESTIBAS", status: "fuera_servicio", nextService: null, horómetro: 22100 },
  { id: "AE-16", name: "AE N°16 TCM ELECTR.", type: "AE ELÉCTRICO", sector: "ETIQUETAS", status: "ok", nextService: "2026-04-01T11:00", horómetro: 9800 },
  { id: "AE-21", name: "AE N°21 SANTA ANA", type: "AE GLP", sector: "VARIETAL NORTE", status: "ok", nextService: "2026-04-03T08:00", horómetro: 14300 },
  { id: "AE-38", name: "AE N°38 CAT", type: "AE GLP", sector: "VARIETAL SUR", status: "warning", nextService: "2026-03-30T16:00", horómetro: 7650 },
  { id: "AE-31", name: "AE N°31 TOYOTA", type: "AE GLP", sector: "TRAPICHE", status: "ok", nextService: "2026-04-02T10:00", horómetro: 5400 },
  { id: "AE-20", name: "AE N°20 TCM ELECTR.", type: "AE ELÉCTRICO", sector: "ALMACEN", status: "no_ok", nextService: "2026-03-31T14:00", horómetro: 16800 },
  { id: "AE-36", name: "AE N°36 CAT", type: "AE GLP", sector: "EXPEDICIÓN", status: "ok", nextService: "2026-04-01T08:00", horómetro: 6200 },
  { id: "AP-07", name: "APILADORA N°7", type: "APILADORA", sector: "FRACCIONADO", status: "ok", nextService: "2026-04-03T10:00", horómetro: null },
  { id: "AE-28", name: "AE N°28 TCM FG25T3", type: "AE GLP", sector: "ALMACEN", status: "ok", nextService: "2026-04-02T14:00", horómetro: 13100 },
  { id: "AE-37", name: "AE N°37 CAT", type: "AE GLP", sector: "VERTICALIZADA", status: "ok", nextService: "2026-04-01T16:00", horómetro: 7100 },
  { id: "AE-07", name: "AE N°7 TCM COMB.", type: "AE GLP", sector: "ESTIBAS", status: "fuera_servicio", nextService: null, horómetro: 24500 },
  { id: "AE-35", name: "AE N°35 CAT", type: "AE GLP", sector: "EXPEDICIÓN", status: "ok", nextService: "2026-03-31T16:00", horómetro: 6900 },
  { id: "AE-15", name: "AE N°15 TCM COMB.", type: "AE GLP", sector: "ETIQUETAS", status: "warning", nextService: "2026-03-30T18:00", horómetro: 19200 },
  { id: "AE-32", name: "AE N°32 TOYOTA", type: "AE GLP", sector: "VARIETAL NORTE", status: "ok", nextService: "2026-04-03T14:00", horómetro: 4800 },
  { id: "AE-33", name: "AE N°33 TOYOTA", type: "AE GLP", sector: "VARIETAL SUR", status: "ok", nextService: "2026-04-02T16:00", horómetro: 5100 },
  { id: "AE-30", name: "AE N°30 TOYOTA", type: "AE GLP", sector: "TRAPICHE", status: "no_ok", nextService: "2026-03-31T09:00", horómetro: 5900 },
  { id: "AE-29", name: "AE N°29 TOYOTA", type: "AE GLP", sector: "ALMACEN", status: "ok", nextService: "2026-04-01T14:00", horómetro: 5600 },
  { id: "AE-06", name: "AE N°6 TCM NUEVO", type: "AE GLP", sector: "FRACCIONADO", status: "ok", nextService: "2026-04-03T08:00", horómetro: 2100 },
  { id: "AP-06", name: "APILADORA N°6 TCM", type: "APILADORA", sector: "VERTICALIZADA", status: "ok", nextService: "2026-04-02T11:00", horómetro: null },
  { id: "AE-26", name: "AE N°26 TCM SS27C", type: "AE GLP", sector: "ESTIBAS", status: "ok", nextService: "2026-04-01T10:00", horómetro: 17400 },
  { id: "AP-04", name: "APILADORA N°4 TCM", type: "APILADORA", sector: "ETIQUETAS", status: "ok", nextService: "2026-04-03T16:00", horómetro: null },
  { id: "AE-12K", name: "AE N°12 KOMATSU", type: "AE GLP", sector: "TRAPICHE", status: "ok", nextService: "2026-04-02T08:00", horómetro: 20100 },
  { id: "CONT-1", name: "CONTAINERA KONECRANES", type: "CONTAINERA", sector: "EXPEDICIÓN", status: "ok", nextService: "2026-04-01T07:00", horómetro: 3200 },
  { id: "CAM-R", name: "CAMIÓN 1114 ROJO", type: "CAMIÓN", sector: "EXPEDICIÓN", status: "ok", nextService: "2026-04-02T07:00", horómetro: 45200 },
  { id: "CAM-A", name: "CAMIÓN 1114 AZUL", type: "CAMIÓN", sector: "EXPEDICIÓN", status: "warning", nextService: "2026-03-30T15:00", horómetro: 52100 },
];

const CHECK_ITEMS = [
  "Extintor/Patente/Asiento",
  "Cinturón de seguridad",
  "Espejos laterales/retrovisor",
  "Bocina/Alarma retroceso",
  "Luces/Guiñes/Balizas",
  "Garrafa GLP",
  "Frenos servicio/mano",
  "Batería/Fluidos",
  "Encendido",
  "Torre elevación",
  "Pérdidas agua/aceite",
  "Líquido de frenos",
  "Neumáticos/Ruedas",
  "Junta válvula carga",
];

function generateNoOkRecords() {
  const records = [];
  const now = new Date("2026-03-30");

  EQUIPMENT.forEach((eq) => {
    const numRecords = Math.floor(Math.random() * 8);

    for (let i = 0; i < numRecords; i++) {
      const daysAgo = Math.floor(Math.random() * 14);
      const date = new Date(now);
      date.setDate(date.getDate() - daysAgo);
      const item = CHECK_ITEMS[Math.floor(Math.random() * CHECK_ITEMS.length)];

      records.push({
        equipmentId: eq.id,
        date: date.toISOString().split("T")[0],
        item,
        turno: ["MAÑANA", "TARDE", "NOCHE"][Math.floor(Math.random() * 3)],
        operario: ["AGÜERO N.", "ALVAREZ C.", "BUSTOS D.", "CONTRERAS G.", "FERNANDEZ C.", "GOMEZ W.", "LUCERO M.", "MEDINA P.", "ORTIZ M.", "SOSA C."][Math.floor(Math.random() * 10)],
        descripcion: ["Desgaste visible", "No funciona correctamente", "Requiere reemplazo", "Fuga detectada", "Ajuste necesario", "Pieza rota"][Math.floor(Math.random() * 6)],
      });
    }
  });

  return records;
}

const NO_OK_RECORDS = generateNoOkRecords();

function generateWeekEvents() {
  return EQUIPMENT.filter((e) => e.nextService).map((e) => ({
    equipmentId: e.id,
    equipmentName: e.name,
    sector: e.sector,
    datetime: e.nextService,
    type: e.status === "no_ok" ? "extra" : "semanal",
  }));
}

const WEEK_EVENTS = generateWeekEvents();

// ─── Status helpers ──────────────────────────────────────────
const STATUS_CONFIG = {
  ok: { label: "OK", color: "#16a34a", bg: "#052e16", icon: "●" },
  warning: { label: "Service <24h", color: "#eab308", bg: "#422006", icon: "▲" },
  no_ok: { label: "No OK", color: "#ef4444", bg: "#450a0a", icon: "■" },
  fuera_servicio: { label: "Fuera Servicio", color: "#6b7280", bg: "#1f2937", icon: "✕" },
};

const DAYS = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];

// ─── App Component ───────────────────────────────────────────
export default function FleetDashboard() {
  const [activeTab, setActiveTab] = useState("status");
  const [sectorFilter, setSectorFilter] = useState("TODOS");
  const [typeFilter, setTypeFilter] = useState("TODOS");
  const [equipFilter, setEquipFilter] = useState("");
  const [statusDetailModal, setStatusDetailModal] = useState(null);
  const [calendarWeekOffset, setCalendarWeekOffset] = useState(0);

  const isMobile = useIsMobile();

  const filteredEquipment = useMemo(() => {
    return EQUIPMENT.filter((e) => {
      if (sectorFilter !== "TODOS" && e.sector !== sectorFilter) return false;
      if (typeFilter !== "TODOS" && e.type !== typeFilter) return false;
      if (
        equipFilter &&
        !e.id.toLowerCase().includes(equipFilter.toLowerCase()) &&
        !e.name.toLowerCase().includes(equipFilter.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [sectorFilter, typeFilter, equipFilter]);

  const statusCounts = useMemo(() => {
    const counts = { ok: 0, warning: 0, no_ok: 0, fuera_servicio: 0 };
    filteredEquipment.forEach((e) => counts[e.status]++);
    counts.total = filteredEquipment.length;
    return counts;
  }, [filteredEquipment]);

  const types = [...new Set(EQUIPMENT.map((e) => e.type))];

  return (
    <div style={styles.root}>
      <header style={{ ...styles.header, ...(isMobile ? styles.headerMobile : {}) }}>
        <div style={styles.headerLeft}>
          <div style={styles.logo}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <h1 style={styles.title}>FLEET CONTROL</h1>
            <span style={styles.subtitle}>Panel de Gestión de Flota — Logística</span>
          </div>
        </div>

        <div style={{ ...styles.headerRight, ...(isMobile ? styles.headerRightMobile : {}) }}>
          <span style={styles.dateLabel}>
            {new Date().toLocaleDateString("es-AR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>

          <div style={styles.liveIndicator}>
            <span style={styles.liveDot} />
            ACTIVO
          </div>
        </div>
      </header>

      <nav style={{ ...styles.tabs, ...(isMobile ? styles.tabsMobile : {}) }}>
        {[
          { key: "status", label: "Status Flota", icon: "◉" },
          { key: "calendar", label: "Calendario Semanal", icon: "◫" },
          { key: "records", label: "Registro por AE (14d)", icon: "◨" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              ...styles.tab,
              ...(isMobile ? styles.tabMobile : {}),
              ...(activeTab === tab.key ? styles.tabActive : {}),
            }}
          >
            <span style={{ marginRight: 6, fontSize: 14 }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      <div style={{ ...styles.filtersBar, ...(isMobile ? styles.filtersBarMobile : {}) }}>
        <div style={{ ...styles.filterGroup, ...(isMobile ? styles.filterGroupMobile : {}) }}>
          <label style={styles.filterLabel}>Sector</label>
          <select
            style={{ ...styles.select, ...(isMobile ? styles.fieldMobile : {}) }}
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
          >
            <option value="TODOS">Todos los sectores</option>
            {SECTORS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div style={{ ...styles.filterGroup, ...(isMobile ? styles.filterGroupMobile : {}) }}>
          <label style={styles.filterLabel}>Tipo Equipo</label>
          <select
            style={{ ...styles.select, ...(isMobile ? styles.fieldMobile : {}) }}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="TODOS">Todos los tipos</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div style={{ ...styles.filterGroup, ...(isMobile ? styles.filterGroupMobile : {}) }}>
          <label style={styles.filterLabel}>N° Equipo</label>
          <input
            style={{ ...styles.input, ...(isMobile ? styles.fieldMobile : {}) }}
            placeholder="Buscar equipo..."
            value={equipFilter}
            onChange={(e) => setEquipFilter(e.target.value)}
          />
        </div>

        {(sectorFilter !== "TODOS" || typeFilter !== "TODOS" || equipFilter) && (
          <button
            style={{ ...styles.clearBtn, ...(isMobile ? styles.clearBtnMobile : {}) }}
            onClick={() => {
              setSectorFilter("TODOS");
              setTypeFilter("TODOS");
              setEquipFilter("");
            }}
          >
            ✕ Limpiar
          </button>
        )}
      </div>

      <main style={styles.content}>
        {activeTab === "status" && (
          <StatusFlota
            equipment={filteredEquipment}
            counts={statusCounts}
            onDetail={setStatusDetailModal}
            isMobile={isMobile}
          />
        )}

        {activeTab === "calendar" && (
          <CalendarView
            equipment={filteredEquipment}
            events={WEEK_EVENTS}
            weekOffset={calendarWeekOffset}
            setWeekOffset={setCalendarWeekOffset}
            isMobile={isMobile}
          />
        )}

        {activeTab === "records" && (
          <RecordView equipment={filteredEquipment} records={NO_OK_RECORDS} isMobile={isMobile} />
        )}
      </main>

      {statusDetailModal && (
        <DetailModal
          equipment={statusDetailModal}
          records={NO_OK_RECORDS.filter((r) => r.equipmentId === statusDetailModal.id)}
          onClose={() => setStatusDetailModal(null)}
          isMobile={isMobile}
        />
      )}
    </div>
  );
}

// ─── Status Flota ────────────────────────────────────────────
function StatusFlota({ equipment, counts, onDetail, isMobile }) {
  return (
    <div>
      <div style={{ ...styles.statusCards, ...(isMobile ? styles.statusCardsMobile : {}) }}>
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

      {isMobile ? (
        <div style={styles.mobileCardList}>
          {equipment.map((eq) => {
            const cfg = STATUS_CONFIG[eq.status];
            const nextSvc = eq.nextService ? new Date(eq.nextService) : null;
            const hoursUntil = nextSvc
              ? Math.round((nextSvc - new Date("2026-03-30T12:00")) / 3600000)
              : null;

            return (
              <div key={eq.id} style={styles.mobileCard}>
                <div style={styles.mobileCardHeader}>
                  <div>
                    <div style={styles.mobileCardId}>{eq.id}</div>
                    <div style={styles.mobileCardName}>{eq.name}</div>
                  </div>

                  <span
                    style={{
                      ...styles.statusBadge,
                      background: cfg.bg,
                      color: cfg.color,
                      borderColor: cfg.color,
                    }}
                  >
                    {cfg.icon} {cfg.label}
                  </span>
                </div>

                <div style={styles.mobileCardBody}>
                  <div><strong>Tipo:</strong> {eq.type}</div>
                  <div><strong>Sector:</strong> {eq.sector}</div>
                  <div><strong>Horómetro:</strong> {eq.horómetro ? eq.horómetro.toLocaleString() : "N/A"}</div>
                  <div>
                    <strong>Próx. Service:</strong>{" "}
                    {nextSvc
                      ? `${nextSvc.toLocaleDateString("es-AR", { day: "2-digit", month: "short" })} ${nextSvc.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}`
                      : "—"}
                  </div>

                  {hoursUntil !== null && hoursUntil <= 24 && hoursUntil > 0 && (
                    <span style={styles.urgentBadge}>⏱ En {hoursUntil}h</span>
                  )}
                </div>

                <button style={styles.detailBtnFull} onClick={() => onDetail(eq)}>
                  Ver detalle
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Estado</th>
                <th style={styles.th}>N° Equipo</th>
                <th style={styles.th}>Nombre</th>
                <th style={styles.th}>Tipo</th>
                <th style={styles.th}>Sector</th>
                <th style={styles.th}>Horómetro</th>
                <th style={styles.th}>Próx. Service</th>
                <th style={styles.th}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {equipment.map((eq) => {
                const cfg = STATUS_CONFIG[eq.status];
                const nextSvc = eq.nextService ? new Date(eq.nextService) : null;
                const hoursUntil = nextSvc
                  ? Math.round((nextSvc - new Date("2026-03-30T12:00")) / 3600000)
                  : null;

                return (
                  <tr key={eq.id} style={styles.tr}>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.statusBadge,
                          background: cfg.bg,
                          color: cfg.color,
                          borderColor: cfg.color,
                        }}
                      >
                        {cfg.icon} {cfg.label}
                      </span>
                    </td>
                    <td style={{ ...styles.td, ...styles.tdMono }}>{eq.id}</td>
                    <td style={styles.td}>{eq.name}</td>
                    <td style={styles.td}>
                      <span style={styles.typeBadge}>{eq.type}</span>
                    </td>
                    <td style={styles.td}>{eq.sector}</td>
                    <td style={{ ...styles.td, ...styles.tdMono }}>
                      {eq.horómetro ? eq.horómetro.toLocaleString() : "N/A"}
                    </td>
                    <td style={styles.td}>
                      {nextSvc ? (
                        <div>
                          <div style={styles.dateText}>
                            {nextSvc.toLocaleDateString("es-AR", { day: "2-digit", month: "short" })} —{" "}
                            {nextSvc.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                          {hoursUntil !== null && hoursUntil <= 24 && hoursUntil > 0 && (
                            <span style={styles.urgentBadge}>⏱ En {hoursUntil}h</span>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: "#6b7280" }}>—</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      <button style={styles.detailBtn} onClick={() => onDetail(eq)}>
                        Ver detalle
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
  );
}

// ─── Calendar View ───────────────────────────────────────────
function CalendarView({ equipment, events, weekOffset, setWeekOffset, isMobile }) {
  const baseDate = new Date("2026-03-30");
  baseDate.setDate(baseDate.getDate() + weekOffset * 7);
  const monday = new Date(baseDate);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d;
  });

  const eqIds = new Set(equipment.map((e) => e.id));
  const filteredEvents = events.filter((ev) => eqIds.has(ev.equipmentId));

  function getEventsForDay(dayDate) {
    const dayStr = dayDate.toISOString().split("T")[0];
    return filteredEvents.filter((ev) => ev.datetime.startsWith(dayStr));
  }

  const hours = Array.from({ length: 12 }, (_, i) => i + 7);

  if (isMobile) {
    return (
      <div>
        <div style={{ ...styles.calendarHeader, ...styles.calendarHeaderMobile }}>
          <button style={styles.weekBtn} onClick={() => setWeekOffset(weekOffset - 1)}>
            ← Anterior
          </button>

          <h3 style={styles.weekTitle}>
            {monday.toLocaleDateString("es-AR", { day: "2-digit", month: "short" })} -{" "}
            {weekDates[6].toLocaleDateString("es-AR", { day: "2-digit", month: "short" })}
          </h3>

          <button style={styles.weekBtn} onClick={() => setWeekOffset(weekOffset + 1)}>
            Siguiente →
          </button>
        </div>

        <div style={styles.mobileCalendarList}>
          {weekDates.map((d, i) => {
            const dayEvents = getEventsForDay(d).sort((a, b) => a.datetime.localeCompare(b.datetime));

            return (
              <div key={i} style={styles.mobileCalendarDay}>
                <div style={styles.mobileCalendarDayHeader}>
                  {DAYS[i]} {d.getDate()}
                </div>

                {dayEvents.length === 0 ? (
                  <div style={styles.mobileCalendarEmpty}>Sin eventos</div>
                ) : (
                  dayEvents.map((ev, ei) => (
                    <div
                      key={ei}
                      style={{
                        ...styles.mobileCalendarEvent,
                        borderLeft: `4px solid ${ev.type === "extra" ? "#ef4444" : "#f59e0b"}`,
                      }}
                    >
                      <div style={styles.mobileCalendarEventTime}>
                        {ev.datetime.split("T")[1].slice(0, 5)}
                      </div>

                      <div style={styles.mobileCalendarEventInfo}>
                        <div style={styles.mobileCalendarEventId}>{ev.equipmentId}</div>
                        <div style={styles.mobileCalendarEventSector}>{ev.sector}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </div>

        <div style={styles.calLegend}>
          <div style={styles.legendItem}>
            <span style={{ ...styles.legendDot, background: "#f59e0b" }} />
            Service semanal programado
          </div>
          <div style={styles.legendItem}>
            <span style={{ ...styles.legendDot, background: "#ef4444" }} />
            Service extra
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={styles.calendarHeader}>
        <button style={styles.weekBtn} onClick={() => setWeekOffset(weekOffset - 1)}>
          ← Semana anterior
        </button>

        <h3 style={styles.weekTitle}>
          Semana del {monday.toLocaleDateString("es-AR", { day: "2-digit", month: "long" })} al{" "}
          {weekDates[6].toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })}
        </h3>

        <button style={styles.weekBtn} onClick={() => setWeekOffset(weekOffset + 1)}>
          Semana siguiente →
        </button>
      </div>

      <div style={styles.calendarGridWrapper}>
        <div style={styles.calendarGrid}>
          <div style={styles.calTimeHeader}></div>

          {weekDates.map((d, i) => {
            const isToday = d.toISOString().split("T")[0] === "2026-03-30";

            return (
              <div key={i} style={{ ...styles.calDayHeader, ...(isToday ? styles.calDayToday : {}) }}>
                <span style={styles.calDayName}>{DAYS[i]}</span>
                <span style={styles.calDayNum}>{d.getDate()}</span>
              </div>
            );
          })}

          {hours.map((hour) => (
            <div key={hour} style={{ display: "contents" }}>
              <div style={styles.calTimeCell}>{`${hour}:00`}</div>

              {weekDates.map((d, di) => {
                const dayEvents = getEventsForDay(d).filter((ev) => {
                  const evHour = parseInt(ev.datetime.split("T")[1].split(":")[0], 10);
                  return evHour === hour;
                });

                return (
                  <div key={`${hour}-${di}`} style={styles.calCell}>
                    {dayEvents.map((ev, ei) => (
                      <div
                        key={ei}
                        style={{
                          ...styles.calEvent,
                          borderLeftColor: ev.type === "extra" ? "#ef4444" : "#f59e0b",
                          background: ev.type === "extra" ? "#450a0a" : "#422006",
                        }}
                      >
                        <span style={styles.calEventTime}>{ev.datetime.split("T")[1].slice(0, 5)}</span>
                        <span style={styles.calEventName}>{ev.equipmentId}</span>
                        <span style={styles.calEventSector}>{ev.sector}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div style={styles.calLegend}>
        <div style={styles.legendItem}>
          <span style={{ ...styles.legendDot, background: "#f59e0b" }} />
          Service semanal programado
        </div>
        <div style={styles.legendItem}>
          <span style={{ ...styles.legendDot, background: "#ef4444" }} />
          Service extra (falla detectada)
        </div>
        <div style={styles.legendItem}>
          <span style={{ ...styles.legendDot, background: "#3b82f6" }} />
          🔔 Notificación automática 2h antes
        </div>
      </div>
    </div>
  );
}

// ─── Record View ─────────────────────────────────────────────
function RecordView({ equipment, records, isMobile }) {
  const [selectedEquip, setSelectedEquip] = useState(null);

  const eqIds = new Set(equipment.map((e) => e.id));
  const relevantRecords = records.filter((r) => eqIds.has(r.equipmentId));

  const aggregated = useMemo(() => {
    const map = {};
    relevantRecords.forEach((r) => {
      if (!map[r.equipmentId]) map[r.equipmentId] = {};
      if (!map[r.equipmentId][r.item]) map[r.equipmentId][r.item] = 0;
      map[r.equipmentId][r.item]++;
    });
    return map;
  }, [relevantRecords]);

  function getTopItems(eqData) {
    return Object.entries(eqData)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([item]) => item);
  }

  const selectedRecords = selectedEquip
    ? relevantRecords
        .filter((r) => r.equipmentId === selectedEquip)
        .sort((a, b) => b.date.localeCompare(a.date))
    : [];

  return (
    <div>
      <p style={styles.sectionDesc}>
        Resumen de ítems reportados como{" "}
        <span style={{ color: "#ef4444", fontWeight: 700 }}>NO OK</span> en los últimos 14 días,
        agrupados por equipo.
      </p>

      {isMobile ? (
        <div style={styles.mobileRecordList}>
          {equipment.map((eq) => {
            const eqData = aggregated[eq.id] || {};
            const total = Object.values(eqData).reduce((s, v) => s + v, 0);
            if (total === 0) return null;

            const topItems = getTopItems(eqData);

            return (
              <div
                key={eq.id}
                style={{
                  ...styles.mobileRecordCard,
                  ...(selectedEquip === eq.id ? styles.mobileRecordCardActive : {}),
                }}
                onClick={() => setSelectedEquip(selectedEquip === eq.id ? null : eq.id)}
              >
                <div style={styles.mobileRecordHeader}>
                  <span style={styles.mobileRecordId}>{eq.id}</span>
                  <span style={styles.mobileRecordTotal}>{total} reportes</span>
                </div>

                <div style={styles.mobileRecordTopItems}>
                  {topItems.map((item, i) => (
                    <span key={i} style={styles.mobileRecordTag}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th
                  style={{
                    ...styles.th,
                    position: "sticky",
                    left: 0,
                    background: "#111827",
                    zIndex: 2,
                  }}
                >
                  Equipo
                </th>

                {CHECK_ITEMS.map((item, i) => (
                  <th
                    key={i}
                    style={{
                      ...styles.th,
                      fontSize: 10,
                      writingMode: "vertical-rl",
                      textAlign: "left",
                      padding: "8px 4px",
                      maxWidth: 32,
                    }}
                  >
                    {item}
                  </th>
                ))}

                <th style={{ ...styles.th, background: "#1e1b4b" }}>TOTAL</th>
              </tr>
            </thead>

            <tbody>
              {equipment.map((eq) => {
                const eqData = aggregated[eq.id] || {};
                const total = Object.values(eqData).reduce((s, v) => s + v, 0);
                if (total === 0) return null;

                return (
                  <tr
                    key={eq.id}
                    style={{
                      ...styles.tr,
                      cursor: "pointer",
                      background: selectedEquip === eq.id ? "#1e293b" : undefined,
                    }}
                    onClick={() => setSelectedEquip(selectedEquip === eq.id ? null : eq.id)}
                  >
                    <td
                      style={{
                        ...styles.td,
                        position: "sticky",
                        left: 0,
                        background: selectedEquip === eq.id ? "#1e293b" : "#111827",
                        zIndex: 1,
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {eq.id}
                    </td>

                    {CHECK_ITEMS.map((item, i) => {
                      const count = eqData[item] || 0;
                      const intensity = count === 0 ? 0 : Math.min(count / 4, 1);

                      return (
                        <td
                          key={i}
                          style={{
                            ...styles.td,
                            textAlign: "center",
                            background:
                              count > 0 ? `rgba(239, 68, 68, ${0.15 + intensity * 0.55})` : "transparent",
                            color: count > 0 ? "#fca5a5" : "#374151",
                            fontWeight: count > 0 ? 700 : 400,
                            fontSize: 13,
                          }}
                        >
                          {count || "·"}
                        </td>
                      );
                    })}

                    <td
                      style={{
                        ...styles.td,
                        textAlign: "center",
                        fontWeight: 800,
                        color: total > 5 ? "#ef4444" : total > 2 ? "#eab308" : "#9ca3af",
                        background: "#1e1b4b",
                        fontSize: 15,
                      }}
                    >
                      {total}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedEquip && selectedRecords.length > 0 && (
        <div style={styles.recordDetail}>
          <h4 style={styles.recordDetailTitle}>
            Detalle de reportes — <span style={{ color: "#f59e0b" }}>{selectedEquip}</span>
            <span style={styles.recordCount}>{selectedRecords.length} reportes</span>
          </h4>

          <div style={styles.recordList}>
            {selectedRecords.map((r, i) => (
              <div key={i} style={styles.recordItem}>
                <div style={styles.recordDate}>
                  {new Date(r.date).toLocaleDateString("es-AR", { day: "2-digit", month: "short" })}
                </div>
                <span style={styles.recordTurno}>{r.turno}</span>
                <span style={styles.recordItemName}>{r.item}</span>
                <span style={styles.recordDesc}>{r.descripcion}</span>
                <span style={styles.recordOp}>{r.operario}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Detail Modal ────────────────────────────────────────────
function DetailModal({ equipment, records, onClose, isMobile }) {
  const cfg = STATUS_CONFIG[equipment.status];

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div
        style={{
          ...styles.modal,
          ...(isMobile ? styles.modalMobile : {}),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.modalHeader}>
          <div>
            <h3 style={styles.modalTitle}>{equipment.name}</h3>
            <span
              style={{
                ...styles.statusBadge,
                background: cfg.bg,
                color: cfg.color,
                borderColor: cfg.color,
                fontSize: 13,
              }}
            >
              {cfg.icon} {cfg.label}
            </span>
          </div>

          <button style={styles.modalClose} onClick={onClose}>
            ✕
          </button>
        </div>

        <div style={styles.modalBody}>
          <div style={{ ...styles.modalGrid, ...(isMobile ? styles.modalGridMobile : {}) }}>
            <div style={styles.modalField}>
              <span style={styles.modalFieldLabel}>ID</span>
              <span>{equipment.id}</span>
            </div>
            <div style={styles.modalField}>
              <span style={styles.modalFieldLabel}>Tipo</span>
              <span>{equipment.type}</span>
            </div>
            <div style={styles.modalField}>
              <span style={styles.modalFieldLabel}>Sector</span>
              <span>{equipment.sector}</span>
            </div>
            <div style={styles.modalField}>
              <span style={styles.modalFieldLabel}>Horómetro</span>
              <span>{equipment.horómetro?.toLocaleString() || "N/A"}</span>
            </div>
            <div style={styles.modalField}>
              <span style={styles.modalFieldLabel}>Próx. Service</span>
              <span>
                {equipment.nextService
                  ? new Date(equipment.nextService).toLocaleString("es-AR")
                  : "Sin programar"}
              </span>
            </div>
            <div style={styles.modalField}>
              <span style={styles.modalFieldLabel}>Reportes NO OK (14d)</span>
              <span style={{ color: records.length > 0 ? "#ef4444" : "#16a34a", fontWeight: 700 }}>
                {records.length}
              </span>
            </div>
          </div>

          {records.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <h4 style={styles.modalSectionTitle}>Últimos reportes NO OK</h4>

              {records.slice(0, 6).map((r, i) => (
                <div key={i} style={styles.modalRecord}>
                  <span style={{ color: "#9ca3af", minWidth: 55 }}>
                    {new Date(r.date).toLocaleDateString("es-AR", { day: "2-digit", month: "short" })}
                  </span>
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

// ─── Styles ──────────────────────────────────────────────────
const styles = {
  root: {
    fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
    background: "#0a0f1a",
    color: "#e5e7eb",
    minHeight: "100vh",
    padding: 0,
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    background: "linear-gradient(180deg, #111827 0%, #0a0f1a 100%)",
    borderBottom: "1px solid #1f2937",
    gap: 16,
  },
  headerMobile: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 12,
    padding: "14px 16px",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  headerRightMobile: {
    width: "100%",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
  },
  logo: {
    width: 40,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: 10,
  },
  title: {
    margin: 0,
    fontSize: 20,
    fontWeight: 800,
    letterSpacing: 1,
    color: "#f9fafb",
  },
  subtitle: {
    color: "#9ca3af",
    fontSize: 12,
  },
  dateLabel: {
    color: "#d1d5db",
    fontSize: 12,
    textTransform: "capitalize",
  },
  liveIndicator: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    borderRadius: 999,
    background: "#111827",
    border: "1px solid #1f2937",
    fontSize: 12,
    fontWeight: 700,
    color: "#d1fae5",
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#22c55e",
    display: "inline-block",
    boxShadow: "0 0 8px #22c55e",
  },

  tabs: {
    display: "flex",
    gap: 10,
    padding: "14px 24px 8px",
    borderBottom: "1px solid #111827",
  },
  tabsMobile: {
    overflowX: "auto",
    padding: "10px 12px",
    gap: 8,
  },
  tab: {
    border: "1px solid #1f2937",
    background: "#111827",
    color: "#d1d5db",
    borderRadius: 10,
    padding: "10px 16px",
    cursor: "pointer",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    transition: "all 0.2s ease",
  },
  tabMobile: {
    minHeight: 44,
    padding: "10px 14px",
    whiteSpace: "nowrap",
    fontSize: 13,
    flex: "0 0 auto",
  },
  tabActive: {
    background: "#1e293b",
    color: "#f9fafb",
    borderColor: "#334155",
  },

  filtersBar: {
    display: "flex",
    gap: 12,
    padding: "12px 24px",
    alignItems: "end",
    flexWrap: "wrap",
  },
  filtersBarMobile: {
    flexDirection: "column",
    alignItems: "stretch",
    padding: "12px 16px",
  },
  filterGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    minWidth: 200,
  },
  filterGroupMobile: {
    width: "100%",
    minWidth: "100%",
  },
  filterLabel: {
    fontSize: 11,
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: 700,
  },
  select: {
    background: "#111827",
    border: "1px solid #374151",
    color: "#f9fafb",
    borderRadius: 10,
    padding: "10px 12px",
    outline: "none",
  },
  input: {
    background: "#111827",
    border: "1px solid #374151",
    color: "#f9fafb",
    borderRadius: 10,
    padding: "10px 12px",
    outline: "none",
  },
  fieldMobile: {
    minHeight: 44,
    fontSize: 16,
    width: "100%",
  },
  clearBtn: {
    minHeight: 42,
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #374151",
    background: "#1f2937",
    color: "#f9fafb",
    cursor: "pointer",
    fontWeight: 700,
  },
  clearBtnMobile: {
    width: "100%",
  },

  content: {
    padding: "12px 16px 24px",
  },

  statusCards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
    marginBottom: 18,
  },
  statusCardsMobile: {
    gridTemplateColumns: "1fr",
  },
  statusCard: {
    border: "1px solid",
    borderRadius: 14,
    padding: 16,
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  statusIcon: {
    fontSize: 22,
    fontWeight: 800,
  },
  statusCount: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  statusNumber: {
    fontSize: 24,
    fontWeight: 800,
    lineHeight: 1,
  },
  statusLabel: {
    fontSize: 12,
    color: "#d1d5db",
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  mobileCardList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  mobileCard: {
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: 12,
    padding: 14,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  mobileCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  mobileCardId: {
    fontWeight: 800,
    fontSize: 15,
    color: "#f9fafb",
  },
  mobileCardName: {
    fontSize: 13,
    color: "#d1d5db",
    marginTop: 4,
  },
  mobileCardBody: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    fontSize: 13,
    color: "#d1d5db",
  },

  tableContainer: {
    width: "100%",
    overflowX: "auto",
    border: "1px solid #1f2937",
    borderRadius: 12,
    background: "#0f172a",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 900,
  },
  th: {
    textAlign: "left",
    padding: "12px 10px",
    fontSize: 12,
    color: "#9ca3af",
    background: "#111827",
    borderBottom: "1px solid #1f2937",
    textTransform: "uppercase",
    letterSpacing: 1,
    whiteSpace: "nowrap",
  },
  tr: {
    borderBottom: "1px solid #111827",
  },
  td: {
    padding: "12px 10px",
    fontSize: 13,
    color: "#e5e7eb",
    verticalAlign: "top",
  },
  tdMono: {
    fontFamily: "'JetBrains Mono', monospace",
    whiteSpace: "nowrap",
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid",
    fontSize: 11,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  typeBadge: {
    display: "inline-block",
    padding: "4px 8px",
    borderRadius: 999,
    background: "#1f2937",
    border: "1px solid #374151",
    fontSize: 11,
    color: "#d1d5db",
    whiteSpace: "nowrap",
  },
  dateText: {
    fontSize: 12,
    color: "#e5e7eb",
  },
  urgentBadge: {
    display: "inline-block",
    marginTop: 4,
    padding: "4px 8px",
    fontSize: 11,
    borderRadius: 999,
    background: "#422006",
    color: "#fde68a",
    border: "1px solid #92400e",
    whiteSpace: "nowrap",
  },
  detailBtn: {
    minHeight: 40,
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #374151",
    background: "#1f2937",
    color: "#f9fafb",
    cursor: "pointer",
  },
  detailBtnFull: {
    width: "100%",
    minHeight: 44,
    borderRadius: 10,
    border: "1px solid #374151",
    background: "#1f2937",
    color: "#f9fafb",
    fontWeight: 700,
    cursor: "pointer",
  },

  calendarHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
  },
  calendarHeaderMobile: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 10,
  },
  weekBtn: {
    minHeight: 44,
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #374151",
    background: "#111827",
    color: "#f9fafb",
    cursor: "pointer",
  },
  weekTitle: {
    margin: 0,
    fontSize: 15,
    textAlign: "center",
    color: "#f3f4f6",
  },
  calendarGridWrapper: {
    overflowX: "auto",
    border: "1px solid #1f2937",
    borderRadius: 12,
  },
  calendarGrid: {
    display: "grid",
    gridTemplateColumns: "70px repeat(7, minmax(120px, 1fr))",
    background: "#0f172a",
    minWidth: 980,
  },
  calTimeHeader: {
    background: "#111827",
    borderBottom: "1px solid #1f2937",
    minHeight: 54,
  },
  calDayHeader: {
    background: "#111827",
    borderBottom: "1px solid #1f2937",
    borderLeft: "1px solid #1f2937",
    minHeight: 54,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 2,
  },
  calDayToday: {
    background: "#172033",
  },
  calDayName: {
    fontSize: 11,
    color: "#9ca3af",
    fontWeight: 700,
  },
  calDayNum: {
    fontSize: 16,
    color: "#f9fafb",
    fontWeight: 800,
  },
  calTimeCell: {
    borderTop: "1px solid #1f2937",
    background: "#111827",
    color: "#9ca3af",
    fontSize: 12,
    padding: "10px 8px",
  },
  calCell: {
    minHeight: 70,
    borderTop: "1px solid #1f2937",
    borderLeft: "1px solid #1f2937",
    padding: 6,
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  calEvent: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    borderLeft: "4px solid",
    borderRadius: 8,
    padding: "6px 8px",
    fontSize: 11,
  },
  calEventTime: {
    color: "#fde68a",
    fontWeight: 800,
  },
  calEventName: {
    color: "#f9fafb",
    fontWeight: 700,
  },
  calEventSector: {
    color: "#d1d5db",
  },
  calLegend: {
    display: "flex",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 14,
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 12,
    color: "#d1d5db",
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    display: "inline-block",
  },

  mobileCalendarList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  mobileCalendarDay: {
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: 12,
    overflow: "hidden",
  },
  mobileCalendarDayHeader: {
    padding: "10px 12px",
    background: "#1f2937",
    fontWeight: 700,
    color: "#f9fafb",
  },
  mobileCalendarEmpty: {
    padding: "12px",
    color: "#6b7280",
    fontSize: 13,
  },
  mobileCalendarEvent: {
    display: "flex",
    gap: 10,
    padding: "10px 12px",
    borderTop: "1px solid #1f2937",
    background: "#0f172a",
  },
  mobileCalendarEventTime: {
    fontWeight: 700,
    color: "#f59e0b",
    minWidth: 46,
  },
  mobileCalendarEventInfo: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  mobileCalendarEventId: {
    fontWeight: 700,
    color: "#f9fafb",
  },
  mobileCalendarEventSector: {
    fontSize: 12,
    color: "#9ca3af",
  },

  sectionDesc: {
    marginTop: 0,
    marginBottom: 14,
    color: "#cbd5e1",
    fontSize: 13,
  },

  mobileRecordList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  mobileRecordCard: {
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: 12,
    padding: 14,
    cursor: "pointer",
  },
  mobileRecordCardActive: {
    borderColor: "#f59e0b",
    background: "#172033",
  },
  mobileRecordHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  mobileRecordId: {
    fontWeight: 800,
    color: "#f9fafb",
  },
  mobileRecordTotal: {
    fontSize: 12,
    color: "#fca5a5",
    fontWeight: 700,
  },
  mobileRecordTopItems: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  mobileRecordTag: {
    fontSize: 12,
    padding: "6px 8px",
    borderRadius: 999,
    background: "#1f2937",
    color: "#d1d5db",
    border: "1px solid #374151",
  },

  recordDetail: {
    marginTop: 18,
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: 12,
    padding: 14,
  },
  recordDetailTitle: {
    margin: "0 0 12px",
    color: "#f9fafb",
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    alignItems: "center",
  },
  recordCount: {
    fontSize: 12,
    color: "#9ca3af",
    fontWeight: 600,
  },
  recordList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  recordItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
    padding: "8px 10px",
    background: "#0d1117",
    borderRadius: 6,
    border: "1px solid #1f2937",
    fontSize: 12,
  },
  recordDate: {
    color: "#9ca3af",
    minWidth: 50,
    fontWeight: 600,
  },
  recordTurno: {
    color: "#6b7280",
    fontSize: 10,
    background: "#1f2937",
    padding: "2px 6px",
    borderRadius: 3,
    fontWeight: 600,
  },
  recordItemName: {
    color: "#fca5a5",
    fontWeight: 700,
    flex: 1,
    minWidth: 150,
  },
  recordDesc: {
    color: "#9ca3af",
    fontSize: 11,
    flex: 1,
    minWidth: 160,
  },
  recordOp: {
    color: "#6b7280",
    fontSize: 11,
    minWidth: 90,
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    backdropFilter: "blur(4px)",
    padding: 12,
  },
  modal: {
    width: "min(720px, 92vw)",
    maxHeight: "85vh",
    overflowY: "auto",
    background: "#0f172a",
    border: "1px solid #1f2937",
    borderRadius: 16,
    boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
  },
  modalMobile: {
    width: "96%",
    maxHeight: "90vh",
    borderRadius: 14,
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "20px 24px 12px",
    borderBottom: "1px solid #1f2937",
    gap: 14,
  },
  modalTitle: {
    margin: "0 0 8px",
    fontSize: 18,
    fontWeight: 800,
    color: "#f3f4f6",
  },
  modalClose: {
    background: "transparent",
    border: "none",
    color: "#6b7280",
    fontSize: 18,
    cursor: "pointer",
    padding: "4px 8px",
  },
  modalBody: {
    padding: "16px 24px 24px",
  },
  modalGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
  modalGridMobile: {
    gridTemplateColumns: "1fr",
  },
  modalField: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  modalFieldLabel: {
    fontSize: 10,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: 600,
  },
  modalSectionTitle: {
    color: "#d1d5db",
    marginBottom: 8,
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  modalRecord: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "6px 10px",
    background: "#0d1117",
    borderRadius: 4,
    marginBottom: 4,
    fontSize: 12,
  },
};
