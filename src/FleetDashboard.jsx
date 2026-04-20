import { useState, useMemo, useEffect, useCallback } from "react";
import './App.css';
import FueraDeServicio from './FueraDeServicio.jsx';
import RecepcionModal from './RecepcionModal.jsx';
import CheckStatsTab from './CheckStatsTab.jsx';
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

function toLocalDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const CHECK_ITEMS = [
  "Extintor/Patente/Asiento", "Cinturón de seguridad", "Espejos laterales/retrovisor",
  "Bocina/Alarma retroceso", "Luces/Guiñes/Balizas", "Garrafa GLP",
  "Frenos servicio/mano", "Batería/Fluidos", "Encendido", "Torre elevación",
  "Pérdidas agua/aceite", "Líquido de frenos", "Neumáticos/Ruedas", "Junta válvula carga",
];

const STATUS_CONFIG = {
  ok:             { label: "Operativo",      color: "var(--ok)",     bg: "var(--ok-bg)",     border: "var(--ok-border)",     icon: "check" },
  warning:        { label: "Service <24h",   color: "var(--warn)",   bg: "var(--warn-bg)",   border: "var(--warn-border)",   icon: "clock" },
  no_ok:          { label: "Con fallas",     color: "var(--danger)", bg: "var(--danger-bg)", border: "var(--danger-border)", icon: "alert" },
  fuera_servicio: { label: "Fuera servicio", color: "var(--text-secondary)", bg: "var(--bg-surface-2)", border: "var(--border)", icon: "x" },
};

const STATUS_ICONS = {
  check: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>,
  clock: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  alert: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>,
  x: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>,
};

const CARD_ICONS = {
  check: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>,
  clock: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  alert: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>,
  x: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>,
};

const DAYS = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];
const DAY_INDEX = { LUNES:0, MARTES:1, MIERCOLES:2, MIÉRCOLES:2, JUEVES:3, VIERNES:4, SABADO:5, SÁBADO:5, DOMINGO:6 };

const CHECK_FIELD_MAP = [
  { field:"extintor",       obs:"obs_extintor",      label:"Extintor/Patente/Asiento" },
  { field:"cinturon",       obs:"obs_cinturon",      label:"Cinturón de seguridad" },
  { field:"espejos",        obs:"obs_espejos",       label:"Espejos laterales/retrovisor" },
  { field:"bocina",         obs:"obs_bocina",        label:"Bocina/Alarma retroceso" },
  { field:"luces",          obs:"obs_luces",         label:"Luces/Guiñes/Balizas" },
  { field:"glp",            obs:"obs_glp",           label:"Garrafa GLP" },
  { field:"frenos",         obs:"obs_frenos",        label:"Frenos servicio/mano" },
  { field:"bateria",        obs:"obs_bateria",       label:"Batería/Fluidos" },
  { field:"encendido",      obs:"obs_encendido",     label:"Encendido" },
  { field:"torre",          obs:"obs_torre",         label:"Torre elevación" },
  { field:"fluidos",        obs:"obs_fluidos",       label:"Pérdidas agua/aceite" },
  { field:"liquido_frenos", obs:"obs_liq_frenos",    label:"Líquido de frenos" },
  { field:"neumaticos",     obs:"obs_neumaticos",    label:"Neumáticos/Ruedas" },
  { field:"junta_valvula",  obs:"obs_junta_valvula", label:"Junta válvula carga" },
];

function buildEquipoMap(flotaData) {
  const map = {};
  if (!flotaData?.length) return map;
  flotaData.forEach((row) => {
    if (row.equipo && row.id_corto) {
      const normalized = row.equipo.trim().toUpperCase().replace(/N[°º]/g,"N°").replace(/\s+/g," ");
      map[normalized] = row.id_corto;
      map[row.equipo.trim().toUpperCase()] = row.id_corto;
    }
  });
  return map;
}

function transformChecksToNoOk(checksData, equipoMap) {
  const records = [];
  if (!checksData?.length) return records;
  checksData.forEach((check) => {
    const rawKey = (check.equipo || "").trim().toUpperCase();
    const normKey = rawKey.replace(/N[°º]/g,"N°").replace(/\s+/g," ");
    const equipId = equipoMap[normKey] || equipoMap[rawKey];
    if (!equipId) return;
    CHECK_FIELD_MAP.forEach(({ field, obs, label }) => {
      if ((check[field] || "").toUpperCase().trim() === "NO OK") {
        records.push({ equipmentId:equipId, date:(check.fecha||"").toString().slice(0,10), item:label,
          turno:check.turno||"—", operario:check.operario||"—", descripcion:check[obs]||"Sin descripción" });
      }
    });
  });
  return records;
}

function transformServicesTemplate(servicesData, equipoMap, weekOffset=0, excepciones=[]) {
  const events = [];
  if (!servicesData?.length) return events;
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay()+6)%7) + weekOffset*7);
  monday.setHours(0,0,0,0);
  const weekEndDate = new Date(monday); weekEndDate.setDate(monday.getDate()+6);
  // ── Usar toLocalDate() para evitar el bug de UTC-3 que corre el día un día atrás
  const weekStart = toLocalDate(monday);
  const weekEnd = toLocalDate(weekEndDate);
  const reemplazados = new Set();
  excepciones.forEach((exc) => {
    const fechaExc = (exc.fecha||"").toString().slice(0,10);
    const equipKey = (exc.equipo||"").trim().toUpperCase();
    const equipId = equipoMap[equipKey];
    if (!equipId) return;
    if (fechaExc>=weekStart && fechaExc<=weekEnd && exc.inicio) {
      events.push({ equipmentId:equipId, equipmentName:exc.equipo, sector:"—",
        datetime:`${fechaExc}T${exc.inicio}`, type:"excepcion", motivo:exc.motivo||null });
    }
    if (fechaExc>=weekStart && fechaExc<=weekEnd) {
      servicesData.forEach((svc) => {
        if ((svc.equipo||"").trim().toUpperCase()!==equipKey) return;
        const dayOffset = DAY_INDEX[svc.dia?.toUpperCase().trim()];
        if (dayOffset===undefined) return;
        const dateOrig = new Date(monday); dateOrig.setDate(monday.getDate()+dayOffset);
        reemplazados.add(`${equipKey}|${toLocalDate(dateOrig)}`);
      });
    }
  });
  servicesData.forEach((svc) => {
    const dayOffset = DAY_INDEX[svc.dia?.toUpperCase().trim()];
    if (dayOffset===undefined) return;
    const equipId = equipoMap[(svc.equipo||"").trim().toUpperCase()];
    if (!equipId) return;
    const date = new Date(monday); date.setDate(monday.getDate()+dayOffset);
    // ── toLocalDate() en lugar de .toISOString().split("T")[0]
    const dateStr = toLocalDate(date);
    const equipKey = (svc.equipo||"").trim().toUpperCase();
    if (reemplazados.has(`${equipKey}|${dateStr}`)) return;
    events.push({ equipmentId:equipId, equipmentName:svc.equipo, sector:"—",
      datetime:`${dateStr}T${svc.inicio||"08:00:00"}`, type:"semanal" });
  });
  return events;
}

function transformFds(fdsData) {
  if (!fdsData?.length) return [];
  return fdsData.map((r) => ({ id:r.id, equipmentId:r.equipment_id, equipmentName:r.equipment_name,
    sector:r.sector, type:r.type, startDate:r.start_date, reason:r.reason,
    resolved:r.resolved??false, resolvedDate:r.resolved_date }));
}

function transformFlota(flotaData) {
  if (!flotaData?.length) return [];
  return flotaData.filter((row)=>row.activo!==false).map((row) => ({
    id:row.id_corto, name:row.equipo, type:row.tipo,
    // ▼ NUEVO: sector propio del equipo (columna nueva en flota)
    sector: row.sector || "—",
    horómetro:row.horometro||null, status:"ok", nextService:null }));
}

function deriveStatus(equipId, activeFdsIds, noOkRecords, serviceEvents) {
  if (activeFdsIds.has(equipId)) return "fuera_servicio";
  // Warning: service dentro de las próximas 24h
  // Usamos toLocalDate para evitar problemas de timezone con strings sin zona horaria
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 3600000);
  const hasUpcoming = serviceEvents.some((ev) => {
    if (ev.equipmentId !== equipId) return false;
    // Parsear el datetime como hora local (agregar el offset de Argentina si hace falta)
    const evDate = new Date(ev.datetime.includes("T") ? ev.datetime : ev.datetime + "T00:00:00");
    return evDate >= now && evDate <= in24h;
  });
  if (hasUpcoming) return "warning";
  const fourteenDaysAgo = new Date(); fourteenDaysAgo.setDate(fourteenDaysAgo.getDate()-14);
  if (noOkRecords.some((r)=>r.equipmentId===equipId && new Date(r.date+"T12:00:00")>=fourteenDaysAgo)) return "no_ok";
  return "ok";
}

const FLOTA_MOCK = [
  { id:"AE-25",  name:"AE N° 25 TCM",   type:"AE GLP",     sector:"ALMACEN",    horómetro:12450 },
  { id:"AE-34",  name:"AE N° 34 CAT",   type:"AE GLP",     sector:"ALMACEN",    horómetro:8920  },
  { id:"AE-36",  name:"AE N°36 CAT",    type:"AE GLP",     sector:"EXPEDICION", horómetro:6200  },
  { id:"CONT-1", name:"CONTAINERA",      type:"CONTAINERA", sector:"TRAPICHE",   horómetro:3200  },
  { id:"CAM-A",  name:"CAMIÓN AZUL",     type:"CAMIÓN",     sector:"—",          horómetro:52100 },
];
const FDS_MOCK = [
  { id:1, equipmentId:"AE-25", equipmentName:"AE N° 25 TCM", sector:"ALMACEN", type:"AE GLP", startDate:"2026-03-25", reason:"Demo — pérdida de aceite", resolved:false, resolvedDate:null },
];

// ═════════════════════════════════════════════════════════════
export default function FleetDashboard({ onBack }) {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("status");
  const [typeFilter, setTypeFilter] = useState("TODOS");
  // ▼ NUEVO: filtro por sector del equipo
  const [sectorEquipoFilter, setSectorEquipoFilter] = useState("TODOS");
  const [equipFilter, setEquipFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [statusDetailModal, setStatusDetailModal] = useState(null);
  const [calendarWeekOffset, setCalendarWeekOffset] = useState(0);

  const [flota, setFlota] = useState([]);
  const [equipoMap, setEquipoMap] = useState({});
  const [noOkRecords, setNoOkRecords] = useState([]);       // últimos 14d — para deriveStatus
  const [allNoOkRecords, setAllNoOkRecords] = useState([]); // últimos 90d — para RecordView con filtro
  const [servicesRaw, setServicesRaw] = useState([]);
  const [excepcionesRaw, setExcepcionesRaw] = useState([]);
  const [fdsRecords, setFdsRecords] = useState([]);
  const [allChecksData, setAllChecksData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dataSource, setDataSource] = useState("loading");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [recepcionModal, setRecepcionModal] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const isConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (!isConfigured) {
        setFlota(FLOTA_MOCK); setNoOkRecords([]); setAllNoOkRecords([]); setServicesRaw([]); setExcepcionesRaw([]);
        setFdsRecords(FDS_MOCK); setAllChecksData([]); setDataSource("mock"); setLoading(false); return;
      }
      try {
        const since14 = new Date(); since14.setDate(since14.getDate()-14);
        const sinceStr14 = since14.toISOString().split("T")[0];
        const since90 = new Date(); since90.setDate(since90.getDate()-90);
        const sinceStr90 = since90.toISOString().split("T")[0];

        const [
          { data:flotaData,   error:e1 },
          { data:checksData,  error:e2 },
          { data:svcData,     error:e3 },
          { data:fdsData,     error:e4 },
          { data:excData,     error:e5 },
          { data:checks90,    error:e6 },
        ] = await Promise.all([
          supabase.from("flota").select("*").eq("activo",true),
          supabase.from("checks").select("*").gte("fecha",sinceStr14),
          supabase.from("services_template").select("*"),
          supabase.from("fuera_de_servicio").select("*"),
          supabase.from("services_excepciones").select("*"),
          // Un solo fetch de 90d con select(*) — sirve para heatmap/fallas Y completitud
          // order desc + limit alto para evitar el corte default de 1000 filas de Supabase
          supabase.from("checks").select("*").gte("fecha",sinceStr90).order("fecha",{ascending:false}).limit(5000),
        ]);
        if (e1) console.error("flota",e1.message);
        if (e2) console.error("checks14",e2.message);
        if (e3) console.error("svc",e3.message);
        if (e4) console.error("fds",e4.message);
        if (e5) console.error("exc",e5.message);
        if (e6) console.error("checks90",e6.message);

        const eqMap = buildEquipoMap(flotaData);
        const flotaT = transformFlota(flotaData);
        const noOk14 = transformChecksToNoOk(checksData,eqMap);
        const noOk90 = transformChecksToNoOk(checks90,eqMap);
        const fds = transformFds(fdsData);

        setEquipoMap(eqMap);
        setFlota(flotaT.length?flotaT:FLOTA_MOCK);
        setNoOkRecords(noOk14);
        setAllNoOkRecords(noOk90);
        setServicesRaw(svcData||[]);
        setExcepcionesRaw(excData||[]);
        setFdsRecords(fds.length?fds:FDS_MOCK);
        // checks90 tiene select(*) así que sirve para completitud también
        setAllChecksData(checks90||[]);
        setDataSource(flotaT.length?"supabase":"mock");
      } catch(err) {
        console.error(err.message);
        setFlota(FLOTA_MOCK); setNoOkRecords([]); setAllNoOkRecords([]); setServicesRaw([]);
        setExcepcionesRaw([]); setFdsRecords(FDS_MOCK); setAllChecksData([]); setDataSource("mock");
      } finally { setLoading(false); setRefreshing(false); setLastUpdated(new Date()); }
    }
    fetchData();
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    const since14 = new Date(); since14.setDate(since14.getDate()-14);
    const sinceStr14 = since14.toISOString().split("T")[0];
    const since90 = new Date(); since90.setDate(since90.getDate()-90);
    const sinceStr90 = since90.toISOString().split("T")[0];
    Promise.all([
      supabase.from("flota").select("*").eq("activo",true),
      supabase.from("checks").select("*").gte("fecha",sinceStr14),
      supabase.from("services_template").select("*"),
      supabase.from("fuera_de_servicio").select("*"),
      supabase.from("services_excepciones").select("*"),
      supabase.from("checks").select("*").gte("fecha",sinceStr90).order("fecha",{ascending:false}).limit(5000),
    ]).then(([{data:flotaData},{data:checksData},{data:svcData},{data:fdsData},{data:excData},{data:checks90}])=>{
      const eqMap = buildEquipoMap(flotaData);
      const flotaT = transformFlota(flotaData);
      setEquipoMap(eqMap);
      setFlota(flotaT.length?flotaT:FLOTA_MOCK);
      setNoOkRecords(transformChecksToNoOk(checksData,eqMap));
      setAllNoOkRecords(transformChecksToNoOk(checks90,eqMap));
      setServicesRaw(svcData||[]);
      setExcepcionesRaw(excData||[]);
      setFdsRecords(transformFds(fdsData).length?transformFds(fdsData):FDS_MOCK);
      setAllChecksData(checks90||[]);
      setLastUpdated(new Date());
    }).finally(()=>setRefreshing(false));
  }, []);

  const handleEventClick = useCallback((ev) => {
    setRecepcionModal({ equipo:{equipmentId:ev.equipmentId,equipmentName:ev.equipmentName||ev.equipmentId}, fecha:ev.datetime.split("T")[0] });
  }, []);

  const serviceEvents = useMemo(
    ()=>transformServicesTemplate(servicesRaw,equipoMap,calendarWeekOffset,excepcionesRaw),
    [servicesRaw,equipoMap,calendarWeekOffset,excepcionesRaw]
  );
  const activeFdsIds = useMemo(
    ()=>new Set(fdsRecords.filter((r)=>!r.resolved).map((r)=>r.equipmentId)),
    [fdsRecords]
  );
  const effectiveEquipment = useMemo(()=>{
    const nextSvcMap = {};
    const now = new Date();
    // ── Combinar semana actual + siguiente para capturar services
    //    de lunes cuando es domingo de noche (< 24h de distancia)
    const thisWeekEvents = [
      ...transformServicesTemplate(servicesRaw,equipoMap,0,excepcionesRaw),
      ...transformServicesTemplate(servicesRaw,equipoMap,1,excepcionesRaw),
    ];
    thisWeekEvents.forEach((ev)=>{
      const d = new Date(ev.datetime);
      if (d>=now && (!nextSvcMap[ev.equipmentId]||d<new Date(nextSvcMap[ev.equipmentId])))
        nextSvcMap[ev.equipmentId] = ev.datetime;
    });
    return flota.map((eq)=>({...eq,
      status:deriveStatus(eq.id,activeFdsIds,noOkRecords,thisWeekEvents),
      nextService:nextSvcMap[eq.id]||null }));
  },[flota,activeFdsIds,noOkRecords,servicesRaw,equipoMap,excepcionesRaw]);

  const types = useMemo(()=>[...new Set(flota.map((e)=>e.type))],[flota]);
  // ▼ NUEVO: sectores únicos de la flota para el filtro
  const sectoresEquipo = useMemo(()=>[...new Set(flota.map((e)=>e.sector).filter(s=>s&&s!=="—"))].sort(),[flota]);

  const filteredEquipment = useMemo(()=>effectiveEquipment.filter((e)=>{
    if (statusFilter && e.status!==statusFilter) return false;
    if (typeFilter!=="TODOS" && e.type!==typeFilter) return false;
    // ▼ NUEVO: filtro por sector del equipo
    if (sectorEquipoFilter!=="TODOS" && e.sector!==sectorEquipoFilter) return false;
    if (equipFilter && !e.id.toLowerCase().includes(equipFilter.toLowerCase()) && !e.name.toLowerCase().includes(equipFilter.toLowerCase())) return false;
    return true;
  }),[effectiveEquipment,typeFilter,sectorEquipoFilter,equipFilter,statusFilter]);

  const statusCounts = useMemo(()=>{
    const c = {ok:0,warning:0,no_ok:0,fuera_servicio:0};
    filteredEquipment.forEach((e)=>c[e.status]++);
    c.total = filteredEquipment.length; return c;
  },[filteredEquipment]);

  const addFds = useCallback(async(entry)=>{
    if (!import.meta.env.VITE_SUPABASE_URL) {
      setFdsRecords((p)=>[...p,{id:Date.now(),...entry,resolved:false,resolvedDate:null}]); return;
    }
    const {data,error} = await supabase.from("fuera_de_servicio").insert([{
      equipment_id:entry.equipmentId, equipment_name:entry.equipmentName,
      sector:entry.sector, type:entry.type, start_date:entry.startDate, reason:entry.reason, resolved:false, resolved_date:null }]).select();
    if (!error&&data) setFdsRecords((p)=>[...p,transformFds(data)[0]]);
  },[]);

  const resolveFds = useCallback(async(id)=>{
    const today = new Date().toISOString().split("T")[0];
    if (!import.meta.env.VITE_SUPABASE_URL) {
      setFdsRecords((p)=>p.map((r)=>r.id===id?{...r,resolved:true,resolvedDate:today}:r)); return;
    }
    const {error} = await supabase.from("fuera_de_servicio").update({resolved:true,resolved_date:today}).eq("id",id);
    if (!error) setFdsRecords((p)=>p.map((r)=>r.id===id?{...r,resolved:true,resolvedDate:today}:r));
  },[]);

  if (loading) {
    return (
      <div style={{...ST.root,display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100dvh"}}>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:16}}>
          <div className="animate-pulse" style={{width:44,height:44,borderRadius:"var(--radius-md)",background:"var(--bg-surface-2)"}}/>
          <div style={{color:"var(--accent)",fontSize:12,letterSpacing:2.5,fontFamily:"var(--font-mono)",fontWeight:600,textTransform:"uppercase"}}>Cargando flota...</div>
        </div>
      </div>
    );
  }

  const TABS = [
    { key:"status",   label:isMobile?"Flota"      :"Status Flota",        icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
    { key:"calendar", label:isMobile?"Calendario" :"Calendario Semanal",  icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg> },
    { key:"records",  label:isMobile?"NO OK"      :"Registro NO OK (14d)",icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8M16 17H8"/></svg> },
    { key:"fds",      label:isMobile?"Inactivos"  :"Fuera de Servicio",   icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg> },
    // ▼ NUEVO: pestaña de estadísticas de completitud
    { key:"stats",    label:isMobile?"Estadísticas":"Completitud Checks",  icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg> },
  ];

  // ▼ El filtro de sector equipo no aplica en la pestaña de estadísticas (tiene su propia lógica)
  const hasActiveFilters = typeFilter!=="TODOS" || sectorEquipoFilter!=="TODOS" || equipFilter || statusFilter;

  return (
    <div style={ST.root}>
      {/* ── Header ── */}
      <header style={ST.header} className="fleet-header">
        <div style={ST.headerLeft}>
          <div style={ST.logo}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div>
            <h1 style={ST.title} className="fleet-title">Tablero de Control</h1>
            <span style={ST.subtitle} className="fleet-subtitle">Flota CQ · Logística</span>
          </div>
        </div>
        <div style={ST.headerRight} className="fleet-header-right">
          {onBack && <button onClick={onBack} style={ST.backBtn}>← Inicio</button>}
          {!isMobile && (
            <span style={ST.dateLabel}>
              {new Date().toLocaleDateString("es-AR",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}
            </span>
          )}
          <div style={ST.liveIndicator}>
            <span style={ST.liveDot} className="live-dot"/>
            {!isMobile && "Activo"}
          </div>
          <button onClick={handleRefresh} disabled={refreshing}
            title={lastUpdated?`Actualizado: ${lastUpdated.toLocaleTimeString("es-AR")}`:"Actualizar"}
            style={{...ST.refreshBtn, transform:refreshing?"rotate(180deg)":"none", color:refreshing?"var(--text-muted)":"var(--text-secondary)"}}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0115.8-5.7L21 8M3 22v-6h6"/><path d="M21 12a9 9 0 01-15.8 5.7L3 16"/></svg>
          </button>
        </div>
      </header>

      {dataSource==="mock" && (
        <div style={ST.mockBanner}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          Modo demostración — Supabase no conectado
        </div>
      )}

      {/* ── Tabs desktop ── */}
      <nav style={ST.tabs} className="fleet-tabs">
        {TABS.map((tab)=>(
          <button key={tab.key} onClick={()=>setActiveTab(tab.key)} className="fleet-tab-btn"
            style={{...ST.tab,...(activeTab===tab.key?ST.tabActive:{})}}>
            <span style={{marginRight:7,display:"inline-flex",verticalAlign:"middle"}}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      {/* ── Filtros — solo en tabs que los usan ── */}
      {activeTab !== "stats" && (
        <div style={ST.filtersBar} className="fleet-filters-bar">
          <div style={ST.filterGroup} className="fleet-filter-group">
            <label style={ST.filterLabel}>Tipo</label>
            <select style={ST.select} value={typeFilter} onChange={(e)=>setTypeFilter(e.target.value)}>
              <option value="TODOS">Todos los tipos</option>
              {types.map((t)=><option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          {/* ▼ NUEVO: filtro por sector del equipo */}
          {sectoresEquipo.length > 0 && (
            <div style={ST.filterGroup} className="fleet-filter-group">
              <label style={ST.filterLabel}>Sector equipo</label>
              <select style={ST.select} value={sectorEquipoFilter} onChange={(e)=>setSectorEquipoFilter(e.target.value)}>
                <option value="TODOS">Todos los sectores</option>
                {sectoresEquipo.map((s)=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}
          <div style={ST.filterGroup} className="fleet-filter-group">
            <label style={ST.filterLabel}>Buscar</label>
            <input style={ST.input} placeholder="ID o nombre..." value={equipFilter}
              onChange={(e)=>setEquipFilter(e.target.value)}/>
          </div>
          {hasActiveFilters && (
            <button className="fleet-clear-btn" style={ST.clearBtn}
              onClick={()=>{setTypeFilter("TODOS");setSectorEquipoFilter("TODOS");setEquipFilter("");setStatusFilter(null);}}>
              ✕ Limpiar
            </button>
          )}
        </div>
      )}

      {/* ── Contenido principal ── */}
      <main style={ST.content} className="fleet-content">
        <div key={activeTab} className="fleet-tab-content">
          {activeTab==="status"   && <StatusFlota equipment={filteredEquipment} counts={statusCounts} onDetail={setStatusDetailModal} isMobile={isMobile} statusFilter={statusFilter} onStatusFilter={setStatusFilter}/>}
          {activeTab==="calendar" && <CalendarView equipment={filteredEquipment} events={serviceEvents} weekOffset={calendarWeekOffset} setWeekOffset={setCalendarWeekOffset} isMobile={isMobile} onEventClick={handleEventClick}/>}
          {activeTab==="records"  && <RecordView equipment={filteredEquipment} records={allNoOkRecords} flota={effectiveEquipment} isMobile={isMobile}/>}
          {activeTab==="fds"      && <FueraDeServicio records={fdsRecords} equipment={flota} onAdd={addFds} onResolve={resolveFds} isMobile={isMobile}/>}
          {/* ▼ NUEVO */}
          {activeTab==="stats"    && <CheckStatsTab checksData={allChecksData} flota={effectiveEquipment} isMobile={isMobile}/>}
        </div>
      </main>

      {/* ── Bottom nav mobile ── */}
      <nav className="fleet-bottom-nav">
        {TABS.map((tab)=>(
          <button key={tab.key} onClick={()=>setActiveTab(tab.key)}
            style={{...ST.bottomNavItem, color:activeTab===tab.key?"var(--accent)":"var(--text-tertiary)"}}>
            <span style={{
              display:"flex",alignItems:"center",justifyContent:"center",
              width:40,height:32,borderRadius:"var(--radius-sm)",
              background:activeTab===tab.key?"var(--accent-dim)":"transparent",
              transition:"background 200ms ease",
            }}>{tab.icon}</span>
            <span style={{fontSize:9,fontWeight:activeTab===tab.key?700:400,marginTop:1,letterSpacing:0.3}}>
              {tab.label.split(" ")[0]}
            </span>
          </button>
        ))}
      </nav>

      {/* ── Modales ── */}
      {statusDetailModal && (
        <DetailModal equipment={statusDetailModal}
          records={noOkRecords.filter((r)=>r.equipmentId===statusDetailModal.id)}
          onClose={()=>setStatusDetailModal(null)}/>
      )}
      {recepcionModal && (
        <RecepcionModal equipo={recepcionModal.equipo} fecha={recepcionModal.fecha}
          onClose={()=>setRecepcionModal(null)} onSuccess={()=>setRecepcionModal(null)}/>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// STATUS FLOTA
// ═════════════════════════════════════════════════════════════
function StatusFlota({ equipment, counts, onDetail, isMobile, statusFilter, onStatusFilter }) {
  return (
    <div>
      <div style={ST.statusCards} className="fleet-status-cards">
        {Object.entries(STATUS_CONFIG).map(([key,cfg])=>{
          const isActive = statusFilter===key;
          return (
            <div key={key} onClick={()=>onStatusFilter(isActive?null:key)}
              style={{...ST.statusCard, background:cfg.bg,
                borderColor:isActive?cfg.color:cfg.border,
                cursor:"pointer",
                outline:isActive?`2px solid ${cfg.color}`:"none",
                outlineOffset:2,
                transform:isActive?"scale(1.02)":"none",
                transition:"all 150ms",
              }}>
              <div style={{...ST.statusIconWrap,color:cfg.color}}>{CARD_ICONS[cfg.icon]}</div>
              <div>
                <div style={{...ST.statusNumber,color:cfg.color}}>{counts[key]}</div>
                <div style={ST.statusLabel}>{cfg.label}</div>
              </div>
            </div>
          );
        })}
        <div onClick={()=>onStatusFilter(null)}
          style={{...ST.statusCard,
            background:statusFilter===null?"rgba(158,130,240,0.1)":"var(--purple-bg)",
            borderColor:statusFilter===null?"var(--purple)":"rgba(158,130,240,0.15)",
            cursor:"pointer",
            outline:statusFilter===null?"2px solid var(--purple)":"none",
            outlineOffset:2,
            transform:statusFilter===null?"scale(1.02)":"none",
            transition:"all 150ms",
          }}>
          <div style={{...ST.statusIconWrap,color:"var(--purple)"}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
          </div>
          <div>
            <div style={{...ST.statusNumber,color:"var(--purple)"}}>{counts.total}</div>
            <div style={ST.statusLabel}>Total flota</div>
          </div>
        </div>
      </div>

      <div className="fleet-desktop-table">
        <div style={ST.tableContainer} className="fleet-table-container">
          <table style={ST.table}>
            <thead><tr>
              <th style={ST.th}>Equipo</th>
              <th style={ST.th}>Estado</th>
              <th style={ST.th} className="fleet-col-type">Tipo</th>
              {/* ▼ NUEVO: columna sector equipo en tabla */}
              <th style={ST.th} className="fleet-col-sector">Sector</th>
              <th style={ST.th} className="fleet-col-horometro">Horómetro</th>
              <th style={ST.th}>Próx. Service</th>
              <th style={ST.th}>Detalle</th>
            </tr></thead>
            <tbody>
              {equipment.map((eq,i)=>{
                const cfg = STATUS_CONFIG[eq.status];
                const nextSvc = eq.nextService?new Date(eq.nextService):null;
                const hoursUntil = nextSvc?Math.round((nextSvc-new Date())/3600000):null;
                return (
                  <tr key={eq.id} style={{...ST.tr,background:i%2===0?"transparent":"var(--bg-surface)"}}>
                    <td style={ST.td}>
                      <div style={{fontFamily:"var(--font-mono)",fontWeight:700,fontSize:13,color:"var(--accent)"}}>{eq.id}</div>
                      <div style={{fontSize:11,color:"var(--text-secondary)",marginTop:2}}>{eq.name}</div>
                    </td>
                    <td style={ST.td}>
                      <span style={{...ST.statusPill,background:cfg.bg,color:cfg.color,borderColor:cfg.border}}>
                        {STATUS_ICONS[cfg.icon]} {cfg.label}
                      </span>
                    </td>
                    <td style={ST.td} className="fleet-col-type"><span style={ST.typeBadge}>{eq.type}</span></td>
                    {/* ▼ NUEVO */}
                    <td style={{...ST.td,fontSize:12,color:"var(--text-secondary)"}} className="fleet-col-sector">
                      {eq.sector && eq.sector!=="—"
                        ? <span style={ST.sectorBadge}>{eq.sector}</span>
                        : <span style={{color:"var(--text-muted)"}}>—</span>}
                    </td>
                    <td style={{...ST.td,fontFamily:"var(--font-mono)",fontSize:12,color:"var(--text-secondary)"}} className="fleet-col-horometro">
                      {eq.horómetro?eq.horómetro.toLocaleString():"—"}
                    </td>
                    <td style={ST.td}>
                      {nextSvc?(
                        <div>
                          <span style={{fontFamily:"var(--font-mono)",fontSize:12,color:"var(--text-primary)"}}>
                            {nextSvc.toLocaleDateString("es-AR",{day:"2-digit",month:"short"})} {nextSvc.toLocaleTimeString("es-AR",{hour:"2-digit",minute:"2-digit"})}
                          </span>
                          {hoursUntil!==null&&hoursUntil<=24&&hoursUntil>0&&(
                            <span style={ST.urgentBadge}>En {hoursUntil}h</span>
                          )}
                        </div>
                      ):<span style={{color:"var(--text-muted)"}}>—</span>}
                    </td>
                    <td style={ST.td}>
                      <button style={ST.detailBtn} className="fleet-action-btn" onClick={()=>onDetail(eq)}>Ver detalle</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="fleet-mobile-cards">
        {equipment.map((eq)=>{
          const cfg = STATUS_CONFIG[eq.status];
          const nextSvc = eq.nextService?new Date(eq.nextService):null;
          return (
            <div key={eq.id} onClick={()=>onDetail(eq)}
              style={{
                padding:"14px 16px",
                background:"var(--bg-surface)",
                border:"1px solid var(--border)",
                borderRadius:"var(--radius-md)",
                borderLeft:`3px solid ${cfg.color==="var(--text-secondary)"?"var(--border)":cfg.color}`,
                cursor:"pointer", WebkitTapHighlightColor:"transparent",
                transition:"background var(--t-fast)",
                minHeight:"var(--tap-target)",
              }}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div>
                  <div style={{fontFamily:"var(--font-mono)",fontWeight:700,fontSize:14,color:"var(--accent)"}}>{eq.id}</div>
                  <div style={{fontSize:11,color:"var(--text-secondary)",marginTop:2}}>{eq.name}</div>
                </div>
                <span style={{...ST.statusPill,background:cfg.bg,color:cfg.color,borderColor:cfg.border,fontSize:10,padding:"3px 8px"}}>
                  {STATUS_ICONS[cfg.icon]} {cfg.label}
                </span>
              </div>
              <div style={{display:"flex",gap:12,fontSize:11,color:"var(--text-secondary)",flexWrap:"wrap"}}>
                <span>{eq.type}</span>
                {eq.sector&&eq.sector!=="—"&&<span style={{color:"var(--text-tertiary)"}}>{eq.sector}</span>}
                {eq.horómetro&&<span style={{fontFamily:"var(--font-mono)"}}>{eq.horómetro.toLocaleString()} hrs</span>}
                {nextSvc&&<span>Svc: {nextSvc.toLocaleDateString("es-AR",{day:"2-digit",month:"short"})}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// CALENDAR VIEW — sin cambios
// ═════════════════════════════════════════════════════════════
function CalendarView({ equipment, events, weekOffset, setWeekOffset, isMobile, onEventClick }) {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate()-((now.getDay()+6)%7)+weekOffset*7);
  const weekDates = Array.from({length:7},(_,i)=>{ const d=new Date(monday); d.setDate(monday.getDate()+i); return d; });
  const todayStr = toLocalDate(now);
  const eqIds = new Set(equipment.map((e)=>e.id));
  const filteredEvents = events.filter((ev)=>eqIds.has(ev.equipmentId));
  const hours = Array.from({length:17},(_,i)=>i+7);
  const weekTitle = `${monday.toLocaleDateString("es-AR",{day:"2-digit",month:"long"})} — ${weekDates[6].toLocaleDateString("es-AR",{day:"2-digit",month:"long",year:"numeric"})}`;

  const eventsByDay = useMemo(()=>{
    const g = {};
    weekDates.forEach((d)=>{
      const ds = toLocalDate(d);
      g[ds] = filteredEvents.filter((ev)=>ev.datetime.startsWith(ds)).sort((a,b)=>a.datetime.localeCompare(b.datetime));
    });
    return g;
  },[filteredEvents,weekOffset]);

  return (
    <div>
      <div style={ST.calendarHeader} className="fleet-cal-header">
        <button style={ST.weekBtn} onClick={()=>setWeekOffset(weekOffset-1)}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
          Anterior
        </button>
        <h3 style={ST.weekTitle}>{weekTitle}</h3>
        <button style={ST.weekBtn} onClick={()=>setWeekOffset(weekOffset+1)}>
          Siguiente
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>
      <div className="fleet-cal-grid-container">
        <div style={ST.calendarGrid}>
          <div style={ST.calTimeHeader}/>
          {weekDates.map((d,i)=>{
            const isToday = toLocalDate(d)===todayStr;
            return (
              <div key={i} style={{...ST.calDayHeader,...(isToday?ST.calDayToday:{})}}>
                <span style={ST.calDayName}>{DAYS[i]}</span>
                <span style={{...ST.calDayNum,color:isToday?"var(--accent)":"var(--text-primary)"}}>{d.getDate()}</span>
              </div>
            );
          })}
          {hours.map((hour)=>(
            <>
              <div key={`t-${hour}`} style={ST.calTimeCell}>{`${hour}:00`}</div>
              {weekDates.map((d,di)=>{
                const ds = toLocalDate(d);
                const de = filteredEvents.filter((ev)=>{
                  const eh = parseInt(ev.datetime.split("T")[1]?.split(":")[0]);
                  return ev.datetime.startsWith(ds)&&eh===hour;
                });
                return (
                  <div key={`${hour}-${di}`} style={ST.calCell}>
                    {de.map((ev,ei)=>(
                      <div key={ei} onClick={()=>onEventClick?.(ev)}
                        title="Registrar recepción post-service"
                        style={{...ST.calEvent,
                          borderLeftColor:ev.type==="excepcion"?"var(--purple)":"var(--accent)",
                          background:ev.type==="excepcion"?"var(--purple-bg)":"var(--accent-dim)",
                        }}
                        onMouseEnter={(e)=>{e.currentTarget.style.filter="brightness(1.4)";e.currentTarget.style.transform="scale(1.03)";}}
                        onMouseLeave={(e)=>{e.currentTarget.style.filter="brightness(1)";e.currentTarget.style.transform="scale(1)";}}>
                        <span style={ST.calEventTime}>{ev.datetime.split("T")[1]?.slice(0,5)}</span>
                        <span style={ST.calEventName}>{ev.equipmentId}</span>
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
        {weekDates.map((d)=>{
          const ds = toLocalDate(d);
          const de = eventsByDay[ds]||[];
          const isToday = ds===todayStr;
          return (
            <div key={ds} style={{marginBottom:10}}>
              <div style={{padding:"10px 14px",background:isToday?"var(--bg-elevated)":"var(--bg-surface)",borderRadius:"var(--radius-sm)",borderLeft:`3px solid ${isToday?"var(--accent)":"var(--border)"}`,marginBottom:6,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontWeight:700,fontSize:13,color:isToday?"var(--accent)":"var(--text-primary)"}}>{DAYS[weekDates.indexOf(d)]} {d.getDate()}</span>
                {de.length>0&&<span style={{fontSize:10,color:"var(--text-secondary)",background:"var(--bg-surface-2)",padding:"3px 8px",borderRadius:"var(--radius-pill)"}}>{de.length} services</span>}
              </div>
              {de.length===0
                ?<div style={{fontSize:12,color:"var(--text-muted)",padding:"6px 14px"}}>Sin services programados</div>
                :de.map((ev,i)=>(
                  <div key={i} onClick={()=>onEventClick?.(ev)}
                    style={{display:"flex",alignItems:"center",gap:12,padding:"13px 14px",background:ev.type==="excepcion"?"var(--purple-bg)":"var(--accent-dim)",borderRadius:"var(--radius-sm)",borderLeft:`3px solid ${ev.type==="excepcion"?"var(--purple)":"var(--accent)"}`,marginBottom:4,cursor:"pointer",WebkitTapHighlightColor:"transparent",minHeight:"var(--tap-target)"}}>
                    <span style={{fontFamily:"var(--font-mono)",fontSize:12,color:"var(--text-secondary)",minWidth:44}}>{ev.datetime.split("T")[1]?.slice(0,5)}</span>
                    <span style={{fontFamily:"var(--font-mono)",fontWeight:700,fontSize:13,color:"var(--text-primary)"}}>{ev.equipmentId}</span>
                    <span style={{fontSize:12,color:"var(--text-secondary)",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ev.equipmentName}</span>
                    <span style={{fontSize:10,color:"var(--accent)",background:"var(--accent-dim)",padding:"3px 8px",borderRadius:"var(--radius-pill)",flexShrink:0,border:"1px solid rgba(232,200,122,0.2)"}}>Recepción →</span>
                  </div>
                ))
              }
            </div>
          );
        })}
      </div>
      <div style={ST.calLegend}>
        <div style={ST.legendItem}><span style={{...ST.legendDot,background:"var(--accent)"}}/> Service semanal</div>
        <div style={ST.legendItem}><span style={{...ST.legendDot,background:"var(--purple)"}}/> Excepción</div>
        <div style={ST.legendItem}><span style={{...ST.legendDot,background:"var(--ok)"}}/> Tocá para registrar recepción</div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// RECORD VIEW — Heatmap + Fallas con filtro de fechas
// ═════════════════════════════════════════════════════════════
function RecordView({ equipment, records, flota, isMobile }) {
  // ── Sub-vista: "heatmap" | "fallas" ─────────────────────────
  const [subView, setSubView] = useState("heatmap");

  // ── Filtro de fechas ─────────────────────────────────────────
  // Pensalo como una ventana deslizante sobre el array de registros.
  // El preset "14d" es el default; "custom" habilita los date pickers.
  const [preset, setPreset] = useState("14d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo,   setCustomTo]   = useState("");

  const PRESETS = [
    { key:"7d",  label:"7 días"  },
    { key:"14d", label:"14 días" },
    { key:"30d", label:"30 días" },
    { key:"90d", label:"90 días" },
    { key:"custom", label:"Personalizado" },
  ];

  const dateRange = useMemo(()=>{
    const today = toLocalDate(new Date());
    if (preset==="custom") {
      return { from: customFrom||"2000-01-01", to: customTo||today };
    }
    const days = { "7d":7,"14d":14,"30d":30,"90d":90 }[preset]||14;
    const from = new Date(); from.setDate(from.getDate()-days);
    return { from: toLocalDate(from), to: today };
  },[preset,customFrom,customTo]);

  // ── Filtros adicionales (sector equipo / tipo) ───────────────
  const [filterSector, setFilterSector]  = useState("TODOS");
  const [filterTipo,   setFilterTipo]    = useState("TODOS");

  const sectores = useMemo(()=>[...new Set(flota.map(e=>e.sector).filter(s=>s&&s!=="—"))].sort(),[flota]);
  const tipos    = useMemo(()=>[...new Set(flota.map(e=>e.type))].sort(),[flota]);

  // ── Construir conjunto de equipos válidos según filtros ──────
  const eqIdsBase = useMemo(()=>{
    const base = new Set(equipment.map(e=>e.id));
    const out = new Set();
    flota.forEach(eq=>{
      if (!base.has(eq.id)) return;
      if (filterSector!=="TODOS" && eq.sector!==filterSector) return;
      if (filterTipo!=="TODOS"   && eq.type!==filterTipo)     return;
      out.add(eq.id);
    });
    return out;
  },[equipment,flota,filterSector,filterTipo]);

  // ── Registros filtrados (fecha + equipo) ─────────────────────
  const relevantRecords = useMemo(()=>
    records.filter(r=>
      eqIdsBase.has(r.equipmentId) &&
      r.date >= dateRange.from &&
      r.date <= dateRange.to
    )
  ,[records,eqIdsBase,dateRange]);

  const equipmentFiltered = useMemo(()=>
    equipment.filter(e=>eqIdsBase.has(e.id))
  ,[equipment,eqIdsBase]);

  const totalNoOk = relevantRecords.length;
  const rangeLabel = preset==="custom"
    ? `${dateRange.from} → ${dateRange.to}`
    : PRESETS.find(p=>p.key===preset)?.label;

  return (
    <div>
      {/* ── Barra de controles superior ── */}
      <div style={RV.controlsBar}>
        {/* Sub-vistas */}
        <div style={RV.subViewToggle}>
          <button onClick={()=>setSubView("heatmap")}
            style={{...RV.subBtn,...(subView==="heatmap"?RV.subBtnActive:{})}}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            Heatmap
          </button>
          <button onClick={()=>setSubView("fallas")}
            style={{...RV.subBtn,...(subView==="fallas"?RV.subBtnActive:{})}}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
            Análisis de Fallas
          </button>
        </div>

        {/* Separador */}
        <div style={RV.sep}/>

        {/* Atajos de período */}
        <div style={RV.presetGroup}>
          {PRESETS.map(p=>(
            <button key={p.key} onClick={()=>setPreset(p.key)}
              style={{...RV.presetBtn,...(preset===p.key?RV.presetActive:{})}}>
              {p.label}
            </button>
          ))}
        </div>

        {/* Date pickers custom */}
        {preset==="custom" && (
          <div style={RV.customRange}>
            <input type="date" style={RV.dateInput} value={customFrom}
              onChange={e=>setCustomFrom(e.target.value)}/>
            <span style={{color:"var(--text-muted)",fontSize:11}}>→</span>
            <input type="date" style={RV.dateInput} value={customTo}
              onChange={e=>setCustomTo(e.target.value)}/>
          </div>
        )}

        {/* Filtros sector / tipo */}
        {sectores.length>0 && (
          <select style={RV.filterSelect} value={filterSector} onChange={e=>setFilterSector(e.target.value)}>
            <option value="TODOS">Todos los sectores</option>
            {sectores.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
        )}
        <select style={RV.filterSelect} value={filterTipo} onChange={e=>setFilterTipo(e.target.value)}>
          <option value="TODOS">Todos los tipos</option>
          {tipos.map(t=><option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* ── Badge de resumen del período ── */}
      <div style={RV.rangeBadge}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
        {rangeLabel}
        <span style={RV.rangeSep}>·</span>
        <span style={{color:totalNoOk>0?"var(--danger)":"var(--ok)",fontWeight:700}}>{totalNoOk}</span> registros NO OK
        {(filterSector!=="TODOS"||filterTipo!=="TODOS")&&(
          <button onClick={()=>{setFilterSector("TODOS");setFilterTipo("TODOS");}} style={RV.clearFilters}>✕ limpiar filtros</button>
        )}
      </div>

      {/* ── Sub-vista Heatmap ── */}
      {subView==="heatmap" && (
        <HeatmapView equipment={equipmentFiltered} records={relevantRecords} isMobile={isMobile}/>
      )}

      {/* ── Sub-vista Fallas ── */}
      {subView==="fallas" && (
        <FallasView equipment={equipmentFiltered} records={relevantRecords} flota={flota} isMobile={isMobile}/>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// HEATMAP VIEW (extraído del RecordView original)
// ─────────────────────────────────────────────────────────────
function HeatmapView({ equipment, records, isMobile }) {
  const [selectedEquip, setSelectedEquip] = useState(null);
  const [selectedItem,  setSelectedItem]  = useState(null);
  const [selectedCell,  setSelectedCell]  = useState(null);
  const [tooltip, setTooltip] = useState(null);
  const [drawer,  setDrawer]  = useState(null);

  const closeAll = ()=>{ setSelectedEquip(null); setSelectedItem(null); setSelectedCell(null); setDrawer(null); };

  const aggregated = useMemo(()=>{
    const m = {};
    records.forEach((r)=>{
      if (!m[r.equipmentId]) m[r.equipmentId]={};
      if (!m[r.equipmentId][r.item]) m[r.equipmentId][r.item]=0;
      m[r.equipmentId][r.item]++;
    });
    return m;
  },[records]);

  const displayItems = useMemo(()=>{
    if (!isMobile) return CHECK_ITEMS;
    return CHECK_ITEMS.filter(item=>equipment.some(eq=>(aggregated[eq.id]?.[item]||0)>0));
  },[isMobile,aggregated,equipment]);

  const panelRecords = useMemo(()=>{
    if (selectedEquip) return records.filter(r=>r.equipmentId===selectedEquip).sort((a,b)=>b.date.localeCompare(a.date));
    if (selectedItem)  return records.filter(r=>r.item===selectedItem).sort((a,b)=>b.date.localeCompare(a.date));
    if (selectedCell)  return records.filter(r=>r.equipmentId===selectedCell.equipId&&r.item===selectedCell.item).sort((a,b)=>b.date.localeCompare(a.date));
    return [];
  },[selectedEquip,selectedItem,selectedCell,records]);

  const panelTitle = selectedEquip?`Equipo — ${selectedEquip}`:selectedItem?`Ítem — ${selectedItem}`:selectedCell?`${selectedCell.equipId} × ${selectedCell.item}`:"";

  const handleEquipClick = (id)=>{ if(isMobile){setDrawer({type:"equip",id});}else{setSelectedItem(null);setSelectedCell(null);setSelectedEquip(selectedEquip===id?null:id);}};
  const handleItemClick  = (item)=>{ const has=records.some(r=>r.item===item); if(!has)return; if(isMobile){setDrawer({type:"item",item});}else{setSelectedEquip(null);setSelectedCell(null);setSelectedItem(selectedItem===item?null:item);}};
  const handleCellClick  = (equipId,item,c)=>{ if(c===0)return; if(isMobile){setDrawer({type:"cell",equipId,item});}else{setSelectedEquip(null);setSelectedItem(null);setSelectedCell(selectedCell?.equipId===equipId&&selectedCell?.item===item?null:{equipId,item});}};
  const handleCellHover  = (e,equipId,item,c)=>{ if(isMobile||c===0)return; const cr=records.filter(r=>r.equipmentId===equipId&&r.item===item).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5); setTooltip({x:e.clientX,y:e.clientY,equipId,item,count:c,records:cr});};

  const drawerRecords = useMemo(()=>{
    if (!drawer) return [];
    if (drawer.type==="equip") return records.filter(r=>r.equipmentId===drawer.id).sort((a,b)=>b.date.localeCompare(a.date));
    if (drawer.type==="item")  return records.filter(r=>r.item===drawer.item).sort((a,b)=>b.date.localeCompare(a.date));
    if (drawer.type==="cell")  return records.filter(r=>r.equipmentId===drawer.equipId&&r.item===drawer.item).sort((a,b)=>b.date.localeCompare(a.date));
    return [];
  },[drawer,records]);
  const drawerTitle = drawer?.type==="equip"?`Equipo — ${drawer.id}`:drawer?.type==="item"?`Ítem — ${drawer.item}`:drawer?.type==="cell"?`${drawer.equipId} × ${drawer.item}`:"";

  const heatColor = (c)=>{ if(c===0)return "transparent"; if(c===1)return "rgba(245,200,66,0.18)"; if(c===2)return "rgba(240,140,50,0.28)"; if(c===3)return "rgba(240,100,100,0.32)"; return "rgba(240,100,100,0.52)"; };
  const heatText  = (c)=>{ if(c===0)return "var(--text-muted)"; if(c<=2)return "var(--warn)"; return "var(--danger)"; };

  if (records.length===0) return <div style={RV.empty}>Sin registros NO OK para el período y filtros seleccionados.</div>;

  return (
    <div>
      <div style={{overflowX:"auto",borderRadius:"var(--radius-md)",border:"1px solid var(--border)"}} className="fleet-table-container fleet-heatmap-container">
        <table style={ST.table}>
          <thead><tr>
            <th style={{...ST.th,position:"sticky",left:0,background:"var(--bg-surface)",zIndex:3,minWidth:70}}>Equipo</th>
            {displayItems.map((item,i)=>{
              const totalItem = records.filter(r=>r.item===item).length;
              const isSelected = selectedItem===item;
              return (
                <th key={i} onClick={()=>handleItemClick(item)}
                  style={{...ST.th,writingMode:"vertical-rl",textAlign:"left",padding:"8px 4px",maxWidth:32,
                    cursor:totalItem>0?"pointer":"default",
                    color:isSelected?"var(--accent)":totalItem>0?"var(--text-secondary)":"var(--text-muted)",
                    background:isSelected?"var(--accent-dim)":"var(--bg-surface)",transition:"all 150ms"}}>
                  {item}
                </th>
              );
            })}
            <th style={{...ST.th,background:"var(--purple-bg)",minWidth:56}}>Total</th>
          </tr></thead>
          <tbody>
            {equipment.map((eq)=>{
              const eqData = aggregated[eq.id]||{};
              const total = Object.values(eqData).reduce((s,v)=>s+v,0);
              if (total===0) return null;
              const isSel = selectedEquip===eq.id;
              return (
                <tr key={eq.id} style={{...ST.tr,background:isSel?"var(--bg-elevated)":undefined}}>
                  <td onClick={()=>handleEquipClick(eq.id)}
                    style={{...ST.td,position:"sticky",left:0,zIndex:1,
                      background:isSel?"var(--bg-elevated)":"var(--bg-surface)",
                      fontFamily:"var(--font-mono)",fontWeight:700,whiteSpace:"nowrap",cursor:"pointer",
                      color:"var(--accent)",borderRight:"1px solid var(--border)",
                      transition:"all 150ms",fontSize:12,minHeight:"var(--tap-target)"}}>
                    {eq.id}
                  </td>
                  {displayItems.map((item,i)=>{
                    const c = eqData[item]||0;
                    const isCellSel = selectedCell?.equipId===eq.id&&selectedCell?.item===item;
                    return (
                      <td key={i} onClick={()=>handleCellClick(eq.id,item,c)}
                        onMouseMove={(e)=>handleCellHover(e,eq.id,item,c)}
                        onMouseLeave={()=>setTooltip(null)}
                        style={{...ST.td,textAlign:"center",background:isCellSel?"rgba(232,200,122,0.12)":heatColor(c),
                          color:heatText(c),fontWeight:c>0?700:400,fontSize:13,
                          cursor:c>0?"pointer":"default",
                          outline:isCellSel?"2px solid var(--accent)":"none",outlineOffset:-1,
                          transition:"all 100ms"}}>
                        {c||"·"}
                      </td>
                    );
                  })}
                  <td style={{...ST.td,textAlign:"center",fontWeight:800,
                    color:total>5?"var(--danger)":total>2?"var(--warn)":"var(--text-secondary)",
                    background:"var(--purple-bg)",fontSize:15}}>{total}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Tooltip desktop */}
      {tooltip&&!isMobile&&(
        <div style={{position:"fixed",left:Math.min(tooltip.x+16,window.innerWidth-310),top:Math.max(tooltip.y-20,10),width:290,background:"var(--bg-elevated)",border:"1px solid var(--border-hover)",borderRadius:"var(--radius-md)",padding:"12px 14px",zIndex:9999,boxShadow:"var(--shadow-lg)",pointerEvents:"none",fontSize:12,fontFamily:"var(--font-ui)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,paddingBottom:8,borderBottom:"1px solid var(--border)"}}>
            <span style={{fontFamily:"var(--font-mono)",fontWeight:700,color:"var(--accent)",fontSize:13}}>{tooltip.equipId}</span>
            <span style={{background:"var(--danger-bg)",color:"var(--danger)",padding:"2px 8px",borderRadius:"var(--radius-pill)",fontWeight:600,fontSize:11}}>{tooltip.count}× NO OK</span>
          </div>
          <div style={{color:"var(--text-secondary)",fontSize:11,marginBottom:8,fontWeight:500}}>{tooltip.item}</div>
          {tooltip.records.map((r,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderTop:i>0?"1px solid var(--border-subtle)":"none",fontSize:11}}>
              <span style={{color:"var(--text-secondary)",minWidth:42,fontWeight:600,fontFamily:"var(--font-mono)"}}>
                {r.date?new Date(r.date+"T12:00:00").toLocaleDateString("es-AR",{day:"2-digit",month:"short"}):"—"}
              </span>
              <span style={{color:"var(--text-tertiary)",background:"var(--bg-surface-2)",padding:"1px 5px",borderRadius:3,fontSize:10,fontWeight:500}}>{r.turno||"—"}</span>
              <span style={{color:"var(--text-primary)",flex:1}}>{r.descripcion||"Sin descripción"}</span>
            </div>
          ))}
        </div>
      )}

      {/* Panel detalle desktop */}
      {(selectedEquip||selectedItem||selectedCell)&&panelRecords.length>0&&!isMobile&&(
        <div style={{marginTop:20,padding:16,background:"var(--bg-surface)",borderRadius:"var(--radius-md)",border:"1px solid var(--border)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <h4 style={{margin:0,fontSize:14,color:"var(--text-primary)",display:"flex",alignItems:"center",gap:10}}>
              {panelTitle} <span style={{fontSize:11,color:"var(--text-secondary)",background:"var(--bg-surface-2)",padding:"2px 8px",borderRadius:4,fontWeight:400}}>{panelRecords.length} registros</span>
            </h4>
            <button onClick={closeAll} style={ST.closeBtn}>✕</button>
          </div>
          <RecordList records={panelRecords}/>
        </div>
      )}

      {/* Drawer mobile */}
      {isMobile&&drawer&&(
        <>
          <div onClick={()=>setDrawer(null)} className="animate-fade-in"
            style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:998}}/>
          <div className="animate-slide-up" style={{position:"fixed",bottom:0,left:0,right:0,background:"var(--bg-surface)",borderRadius:"20px 20px 0 0",border:"1px solid var(--border)",borderBottom:"none",zIndex:999,maxHeight:"82vh",display:"flex",flexDirection:"column",boxShadow:"var(--shadow-lg)"}}>
            <div style={{width:36,height:4,borderRadius:2,background:"var(--border-hover)",margin:"12px auto 0",flexShrink:0}}/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"16px 20px 12px",borderBottom:"1px solid var(--border)",flexShrink:0}}>
              <div>
                <div style={{fontSize:14,fontWeight:700,color:"var(--text-primary)",marginBottom:3}}>{drawerTitle}</div>
                <div style={{fontSize:11,color:"var(--text-secondary)"}}>{drawerRecords.length} registros NO OK</div>
              </div>
              <button onClick={()=>setDrawer(null)} style={ST.closeBtn}>✕</button>
            </div>
            <div style={{overflowY:"auto",padding:"14px 16px 32px",flex:1}}>
              {drawerRecords.length===0
                ?<div style={{color:"var(--text-tertiary)",textAlign:"center",padding:24,fontSize:13}}>Sin registros</div>
                :<RecordList records={drawerRecords} isMobile/>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FALLAS VIEW — lista + dos rankings en una sola pantalla
// ─────────────────────────────────────────────────────────────
function FallasView({ equipment, records, flota, isMobile }) {
  const [sortBy,     setSortBy]     = useState("fecha");   // "fecha" | "equipo" | "item"
  const [listLimit,  setListLimit]  = useState(50);
  const [searchText, setSearchText] = useState("");

  // ── Ranking equipos ──────────────────────────────────────────
  const rankingEquipos = useMemo(()=>{
    const m = {};
    records.forEach(r=>{ m[r.equipmentId]=(m[r.equipmentId]||0)+1; });
    return Object.entries(m).sort((a,b)=>b[1]-a[1]);
  },[records]);

  // ── Ranking ítems ────────────────────────────────────────────
  const rankingItems = useMemo(()=>{
    const m = {};
    records.forEach(r=>{ m[r.item]=(m[r.item]||0)+1; });
    return Object.entries(m).sort((a,b)=>b[1]-a[1]);
  },[records]);

  // ── Lista filtrada y ordenada ────────────────────────────────
  const sortedRecords = useMemo(()=>{
    let list = [...records];
    if (searchText) {
      const q = searchText.toLowerCase();
      list = list.filter(r=>
        r.equipmentId.toLowerCase().includes(q) ||
        r.item.toLowerCase().includes(q) ||
        (r.operario||"").toLowerCase().includes(q) ||
        (r.descripcion||"").toLowerCase().includes(q)
      );
    }
    if (sortBy==="fecha")  list.sort((a,b)=>b.date.localeCompare(a.date));
    if (sortBy==="equipo") list.sort((a,b)=>a.equipmentId.localeCompare(b.equipmentId)||b.date.localeCompare(a.date));
    if (sortBy==="item")   list.sort((a,b)=>a.item.localeCompare(b.item)||b.date.localeCompare(a.date));
    return list;
  },[records,sortBy,searchText]);

  const maxEq   = rankingEquipos[0]?.[1] || 1;
  const maxItem = rankingItems[0]?.[1]   || 1;

  const barW = (v,max) => `${Math.max(4,Math.round(v/max*100))}%`;
  const barC = (ratio) => ratio>=0.7?"var(--danger)":ratio>=0.4?"var(--warn)":"var(--accent)";

  if (records.length===0) return <div style={RV.empty}>Sin registros NO OK para el período y filtros seleccionados.</div>;

  return (
    <div>
      {/* ── Rankings lado a lado ── */}
      <div style={RV.rankingsRow}>

        {/* Ranking equipos */}
        <div style={RV.rankCard}>
          <div style={RV.rankTitle}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
            Equipos con más fallas
          </div>
          <div style={RV.rankBars}>
            {rankingEquipos.slice(0,10).map(([id,count],i)=>{
              const ratio = count/maxEq;
              return (
                <div key={id} style={RV.rankRow}>
                  <span style={RV.rankPos}>{i+1}</span>
                  <span style={{...RV.rankLabel,fontFamily:"var(--font-mono)",color:"var(--accent)"}}>{id}</span>
                  <div style={RV.rankTrack}>
                    <div style={{...RV.rankBar,width:barW(count,maxEq),background:barC(ratio)}}/>
                  </div>
                  <span style={{...RV.rankCount,color:barC(ratio)}}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ranking ítems */}
        <div style={RV.rankCard}>
          <div style={RV.rankTitle}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--warn)" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
            Ítems más fallados
          </div>
          <div style={RV.rankBars}>
            {rankingItems.slice(0,10).map(([item,count],i)=>{
              const ratio = count/maxItem;
              return (
                <div key={item} style={RV.rankRow}>
                  <span style={RV.rankPos}>{i+1}</span>
                  <span style={RV.rankLabel} title={item}>{item}</span>
                  <div style={RV.rankTrack}>
                    <div style={{...RV.rankBar,width:barW(count,maxItem),background:barC(ratio)}}/>
                  </div>
                  <span style={{...RV.rankCount,color:barC(ratio)}}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Lista cronológica ── */}
      <div style={RV.listSection}>
        <div style={RV.listHeader}>
          <div style={RV.listTitle}>
            Lista de registros
            <span style={RV.listCount}>{sortedRecords.length}</span>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
            <input style={RV.searchInput} placeholder="Buscar equipo, ítem, operario..."
              value={searchText} onChange={e=>setSearchText(e.target.value)}/>
            <select style={RV.sortSelect} value={sortBy} onChange={e=>setSortBy(e.target.value)}>
              <option value="fecha">Ordenar: Fecha desc</option>
              <option value="equipo">Ordenar: Equipo</option>
              <option value="item">Ordenar: Ítem</option>
            </select>
          </div>
        </div>

        <div style={{overflowX:"auto",borderRadius:"var(--radius-md)",border:"1px solid var(--border)"}}>
          <table style={ST.table}>
            <thead><tr>
              <th style={ST.th}>Fecha</th>
              <th style={ST.th}>Equipo</th>
              <th style={{...ST.th,...(isMobile?{display:"none"}:{})}}>Turno</th>
              <th style={ST.th}>Ítem fallado</th>
              <th style={{...ST.th,...(isMobile?{display:"none"}:{})}}>Operario</th>
              <th style={ST.th}>Descripción</th>
            </tr></thead>
            <tbody>
              {sortedRecords.slice(0,listLimit).map((r,i)=>(
                <tr key={i} style={ST.tr}>
                  <td style={{...ST.td,fontFamily:"var(--font-mono)",fontSize:11,color:"var(--text-secondary)",whiteSpace:"nowrap"}}>
                    {r.date?new Date(r.date+"T12:00:00").toLocaleDateString("es-AR",{day:"2-digit",month:"short",year:"2-digit"}):"—"}
                  </td>
                  <td style={{...ST.td,fontFamily:"var(--font-mono)",fontWeight:700,color:"var(--accent)",fontSize:12}}>{r.equipmentId}</td>
                  <td style={{...ST.td,fontSize:11,color:"var(--text-tertiary)",...(isMobile?{display:"none"}:{})}}>{r.turno||"—"}</td>
                  <td style={{...ST.td,color:"var(--danger)",fontWeight:600,fontSize:12}}>{r.item}</td>
                  <td style={{...ST.td,fontSize:11,color:"var(--text-secondary)",...(isMobile?{display:"none"}:{})}}>{r.operario||"—"}</td>
                  <td style={{...ST.td,fontSize:12,color:"var(--text-primary)",maxWidth:220}}>{r.descripcion||"—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sortedRecords.length>listLimit&&(
          <button onClick={()=>setListLimit(l=>l+50)} style={RV.loadMoreBtn}>
            Mostrar más ({sortedRecords.length-listLimit} restantes)
          </button>
        )}
      </div>
    </div>
  );
}

function RecordList({ records, isMobile }) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:6}}>
      {records.map((r,i)=>(
        <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 12px",background:"var(--bg-base)",borderRadius:"var(--radius-sm)",border:"1px solid var(--border-subtle)",fontSize:12,flexWrap:"wrap"}}>
          <div style={{fontFamily:"var(--font-mono)",color:"var(--text-secondary)",minWidth:50,fontWeight:500,flexShrink:0}}>
            {r.date?new Date(r.date+"T12:00:00").toLocaleDateString("es-AR",{day:"2-digit",month:"short"}):"—"}
          </div>
          <span style={{color:"var(--text-tertiary)",fontSize:10,background:"var(--bg-surface-2)",padding:"2px 6px",borderRadius:3,fontWeight:500,flexShrink:0}}>{r.turno||"—"}</span>
          {!isMobile&&<span style={{fontFamily:"var(--font-mono)",color:"var(--accent)",fontWeight:700,minWidth:60,flexShrink:0}}>{r.equipmentId}</span>}
          <span style={{color:"var(--danger)",fontWeight:700,flex:1,minWidth:100}}>{r.item}</span>
          <span style={{color:"var(--text-primary)",flex:2,minWidth:120}}>{r.descripcion||"Sin descripción"}</span>
          {isMobile&&<span style={{color:"var(--text-tertiary)",fontSize:10,width:"100%",marginTop:2}}>{r.equipmentId} — {r.operario||""}</span>}
        </div>
      ))}
    </div>
  );
}

// Estilos específicos de RecordView
const RV = {
  controlsBar: { display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:"var(--radius-md)",marginBottom:10,flexWrap:"wrap" },
  subViewToggle: { display:"flex",gap:2,background:"var(--bg-surface-2)",padding:3,borderRadius:"var(--radius-sm)",flexShrink:0 },
  subBtn: { display:"flex",alignItems:"center",gap:5,padding:"6px 12px",fontSize:12,fontWeight:600,background:"transparent",color:"var(--text-secondary)",border:"none",borderRadius:"var(--radius-xs)",cursor:"pointer",fontFamily:"var(--font-ui)",transition:"all 150ms",whiteSpace:"nowrap" },
  subBtnActive: { background:"var(--bg-elevated)",color:"var(--accent)",boxShadow:"var(--shadow-sm)" },
  sep: { width:1,height:24,background:"var(--border)",flexShrink:0 },
  presetGroup: { display:"flex",gap:4,flexWrap:"wrap" },
  presetBtn: { padding:"5px 10px",fontSize:11,fontWeight:600,background:"var(--bg-surface-2)",color:"var(--text-secondary)",border:"1px solid var(--border)",borderRadius:"var(--radius-pill)",cursor:"pointer",fontFamily:"var(--font-ui)",transition:"all 120ms",whiteSpace:"nowrap" },
  presetActive: { background:"var(--accent-dim)",color:"var(--accent)",borderColor:"rgba(232,200,122,0.3)" },
  customRange: { display:"flex",alignItems:"center",gap:6 },
  dateInput: { padding:"5px 8px",fontSize:11,background:"var(--bg-surface-2)",color:"var(--text-primary)",border:"1px solid var(--border)",borderRadius:"var(--radius-sm)",fontFamily:"var(--font-ui)",minHeight:32 },
  filterSelect: { padding:"5px 8px",fontSize:11,background:"var(--bg-surface-2)",color:"var(--text-primary)",border:"1px solid var(--border)",borderRadius:"var(--radius-sm)",fontFamily:"var(--font-ui)",cursor:"pointer",minHeight:32 },
  rangeBadge: { display:"flex",alignItems:"center",gap:6,fontSize:11,color:"var(--text-secondary)",padding:"6px 12px",background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:"var(--radius-sm)",marginBottom:14,flexWrap:"wrap" },
  rangeSep: { color:"var(--border-hover)" },
  clearFilters: { marginLeft:4,padding:"2px 8px",fontSize:10,fontWeight:600,background:"var(--danger-bg)",color:"var(--danger)",border:"1px solid var(--danger-border)",borderRadius:"var(--radius-pill)",cursor:"pointer",fontFamily:"var(--font-ui)" },
  empty: { padding:40,textAlign:"center",color:"var(--text-muted)",background:"var(--bg-surface)",borderRadius:"var(--radius-md)",border:"1px solid var(--border)",fontSize:13 },
  // Rankings
  rankingsRow: { display:"flex",gap:14,marginBottom:20,flexWrap:"wrap" },
  rankCard: { flex:"1 1 280px",minWidth:260,background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:"var(--radius-md)",padding:"14px 16px" },
  rankTitle: { display:"flex",alignItems:"center",gap:7,fontSize:12,fontWeight:700,color:"var(--text-primary)",marginBottom:14 },
  rankBars: { display:"flex",flexDirection:"column",gap:7 },
  rankRow: { display:"flex",alignItems:"center",gap:6 },
  rankPos: { fontSize:10,color:"var(--text-muted)",fontFamily:"var(--font-mono)",width:16,textAlign:"right",flexShrink:0 },
  rankLabel: { fontSize:11,color:"var(--text-secondary)",width:"28%",minWidth:60,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flexShrink:0 },
  rankTrack: { flex:1,height:14,background:"var(--bg-surface-2)",borderRadius:3,overflow:"hidden",minWidth:0 },
  rankBar: { height:"100%",borderRadius:3,transition:"width 400ms ease" },
  rankCount: { fontSize:11,fontWeight:700,fontFamily:"var(--font-mono)",width:28,textAlign:"right",flexShrink:0 },
  // Lista
  listSection: { marginTop:4 },
  listHeader: { display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:10 },
  listTitle: { fontSize:13,fontWeight:600,color:"var(--text-primary)",display:"flex",alignItems:"center",gap:8 },
  listCount: { fontSize:11,color:"var(--text-secondary)",background:"var(--bg-surface-2)",padding:"2px 8px",borderRadius:"var(--radius-pill)",fontWeight:400 },
  searchInput: { padding:"6px 10px",fontSize:12,background:"var(--bg-surface-2)",color:"var(--text-primary)",border:"1px solid var(--border)",borderRadius:"var(--radius-sm)",fontFamily:"var(--font-ui)",minWidth:200,minHeight:32 },
  sortSelect: { padding:"6px 8px",fontSize:11,background:"var(--bg-surface-2)",color:"var(--text-primary)",border:"1px solid var(--border)",borderRadius:"var(--radius-sm)",fontFamily:"var(--font-ui)",cursor:"pointer",minHeight:32 },
  loadMoreBtn: { marginTop:12,width:"100%",padding:"10px",fontSize:12,fontWeight:600,background:"var(--bg-surface)",color:"var(--text-secondary)",border:"1px solid var(--border)",borderRadius:"var(--radius-sm)",cursor:"pointer",fontFamily:"var(--font-ui)",transition:"all 150ms" },
};

// ═════════════════════════════════════════════════════════════
// DETAIL MODAL — sin cambios
// ═════════════════════════════════════════════════════════════
function DetailModal({ equipment, records, onClose }) {
  const cfg = STATUS_CONFIG[equipment.status];
  return (
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,backdropFilter:"blur(6px)"}}
      className="animate-fade-in" onClick={onClose}>
      <div style={{background:"var(--bg-surface)",borderRadius:"var(--radius-lg)",border:"1px solid var(--border)",width:"90%",maxWidth:540,maxHeight:"82vh",overflow:"auto",boxShadow:"var(--shadow-lg)"}}
        className="fleet-modal" onClick={(e)=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"20px 24px 14px",borderBottom:"1px solid var(--border)"}}>
          <div>
            <h3 style={{margin:"0 0 8px",fontSize:17,fontWeight:700,color:"var(--text-primary)"}}>{equipment.name}</h3>
            <span style={{...ST.statusPill,background:cfg.bg,color:cfg.color,borderColor:cfg.border,fontSize:12}}>
              {STATUS_ICONS[cfg.icon]} {cfg.label}
            </span>
          </div>
          <button style={ST.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div style={{padding:"16px 24px 28px"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}} className="fleet-modal-grid">
            {[["ID",equipment.id,true],["Tipo",equipment.type,false],
              ["Sector",equipment.sector||"—",false],
              ["Horómetro",equipment.horómetro?.toLocaleString()||"N/A",true],
              ["Próx. Service",equipment.nextService?new Date(equipment.nextService).toLocaleString("es-AR"):"Sin programar",false]
            ].map(([lbl,val,mono])=>(
              <div key={lbl} style={{display:"flex",flexDirection:"column",gap:4}}>
                <span style={{fontSize:10,color:"var(--text-tertiary)",textTransform:"uppercase",letterSpacing:1.2,fontWeight:600}}>{lbl}</span>
                <span style={{fontFamily:mono?"var(--font-mono)":"var(--font-ui)",fontWeight:600,color:"var(--text-primary)"}}>{val}</span>
              </div>
            ))}
            <div style={{display:"flex",flexDirection:"column",gap:4}}>
              <span style={{fontSize:10,color:"var(--text-tertiary)",textTransform:"uppercase",letterSpacing:1.2,fontWeight:600}}>Reportes NO OK (14d)</span>
              <span style={{color:records.length>0?"var(--danger)":"var(--ok)",fontWeight:800,fontSize:18}}>{records.length}</span>
            </div>
          </div>
          {records.length>0&&(
            <div style={{marginTop:20}}>
              <h4 style={{color:"var(--text-secondary)",marginBottom:12,fontSize:11,textTransform:"uppercase",letterSpacing:1.2,fontWeight:600}}>Últimos reportes NO OK</h4>
              {records.slice(0,6).map((r,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",background:"var(--bg-base)",borderRadius:"var(--radius-sm)",marginBottom:4,fontSize:12}}>
                  <span style={{fontFamily:"var(--font-mono)",color:"var(--text-secondary)",minWidth:55}}>{new Date(r.date+"T12:00:00").toLocaleDateString("es-AR",{day:"2-digit",month:"short"})}</span>
                  <span style={{color:"var(--danger)",fontWeight:600,flex:1}}>{r.item}</span>
                  <span style={{color:"var(--text-tertiary)",fontSize:11}}>{r.operario}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// ESTILOS
// ═════════════════════════════════════════════════════════════
const ST = {
  root: { fontFamily:"var(--font-ui)", background:"var(--bg-base)", color:"var(--text-primary)", minHeight:"100dvh" },
  header: { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 20px", background:"var(--bg-surface)", borderBottom:"1px solid var(--border)" },
  headerLeft: { display:"flex", alignItems:"center", gap:12 },
  logo: { width:38, height:38, display:"flex", alignItems:"center", justifyContent:"center", background:"var(--bg-surface-2)", borderRadius:"var(--radius-sm)", border:"1px solid var(--accent-dim)", flexShrink:0 },
  title: { margin:0, fontSize:16, fontWeight:700, color:"var(--text-primary)" },
  subtitle: { fontSize:11, color:"var(--text-tertiary)" },
  headerRight: { display:"flex", alignItems:"center", gap:10, flexShrink:0 },
  dateLabel: { fontSize:11, color:"var(--text-secondary)", textTransform:"capitalize" },
  liveIndicator: { display:"flex", alignItems:"center", gap:5, fontSize:11, color:"var(--ok)", fontWeight:600 },
  liveDot: { width:6, height:6, borderRadius:"50%", background:"var(--ok)", flexShrink:0 },
  backBtn: { background:"transparent", border:"1px solid var(--border)", color:"var(--text-secondary)", padding:"6px 12px", borderRadius:"var(--radius-sm)", cursor:"pointer", fontFamily:"var(--font-ui)", fontSize:12, fontWeight:500, minHeight:"var(--tap-target)", display:"flex", alignItems:"center" },
  refreshBtn: { background:"transparent", border:"1px solid var(--border)", padding:"6px 8px", borderRadius:"var(--radius-sm)", cursor:"pointer", display:"flex", alignItems:"center", transition:"transform 300ms", minHeight:"var(--tap-target)", minWidth:"var(--tap-target)", justifyContent:"center" },
  mockBanner: { padding:"8px 20px", background:"var(--warn-bg)", borderBottom:"1px solid var(--warn-border)", fontSize:12, color:"var(--warn)", display:"flex", alignItems:"center", gap:8 },
  tabs: { display:"flex", gap:0, padding:"0 20px", background:"var(--bg-surface)", borderBottom:"1px solid var(--border)" },
  tab: { padding:"11px 18px", fontSize:12, fontWeight:500, background:"transparent", color:"var(--text-secondary)", border:"none", borderBottom:"2px solid transparent", cursor:"pointer", fontFamily:"var(--font-ui)", transition:"all 200ms", display:"flex", alignItems:"center", gap:0 },
  tabActive: { color:"var(--accent)", borderBottomColor:"var(--accent)", background:"var(--accent-dim)" },
  filtersBar: { display:"flex", gap:14, padding:"10px 20px", background:"var(--bg-surface)", borderBottom:"1px solid var(--border)", alignItems:"flex-end", flexWrap:"wrap" },
  filterGroup: { display:"flex", flexDirection:"column", gap:4 },
  filterLabel: { fontSize:10, color:"var(--text-tertiary)", textTransform:"uppercase", letterSpacing:0.8, fontWeight:600 },
  select: { padding:"8px 10px", fontSize:12, background:"var(--bg-surface-2)", color:"var(--text-primary)", border:"1px solid var(--border)", borderRadius:"var(--radius-sm)", fontFamily:"var(--font-ui)", minWidth:160, cursor:"pointer", minHeight:"var(--tap-target)" },
  input:  { padding:"8px 10px", fontSize:12, background:"var(--bg-surface-2)", color:"var(--text-primary)", border:"1px solid var(--border)", borderRadius:"var(--radius-sm)", fontFamily:"var(--font-ui)", minWidth:150, minHeight:"var(--tap-target)" },
  clearBtn: { padding:"8px 12px", fontSize:11, background:"var(--danger-bg)", color:"var(--danger)", border:"1px solid var(--danger-border)", borderRadius:"var(--radius-sm)", cursor:"pointer", fontFamily:"var(--font-ui)", fontWeight:600, minHeight:"var(--tap-target)" },
  content: { padding:"16px 20px" },
  statusCards: { display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" },
  statusCard: { display:"flex", alignItems:"center", gap:10, padding:"12px 14px", borderRadius:"var(--radius-md)", border:"1px solid", flex:"1 1 130px", minWidth:120 },
  statusIconWrap: { width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:"var(--radius-xs)", background:"rgba(255,255,255,0.05)", flexShrink:0 },
  statusNumber: { fontSize:22, fontWeight:800, lineHeight:1 },
  statusLabel: { fontSize:10, color:"var(--text-secondary)", marginTop:3, fontWeight:500 },
  tableContainer: { overflowX:"auto", borderRadius:"var(--radius-md)", border:"1px solid var(--border)" },
  table: { width:"100%", borderCollapse:"collapse", fontSize:13 },
  th: { padding:"9px 12px", textAlign:"left", background:"var(--bg-surface)", color:"var(--text-secondary)", fontWeight:600, fontSize:10, letterSpacing:0.5, borderBottom:"1px solid var(--border)", whiteSpace:"nowrap", textTransform:"uppercase" },
  tr: { borderBottom:"1px solid var(--border-subtle)", transition:"background var(--t-fast)" },
  td: { padding:"11px 12px", verticalAlign:"middle" },
  statusPill: { display:"inline-flex", alignItems:"center", gap:5, padding:"4px 9px", borderRadius:"var(--radius-pill)", fontSize:11, fontWeight:600, border:"1px solid", whiteSpace:"nowrap" },
  typeBadge: { padding:"3px 8px", borderRadius:"var(--radius-xs)", fontSize:10, background:"var(--bg-surface-2)", color:"var(--text-tertiary)", fontWeight:500, textTransform:"uppercase", letterSpacing:0.3 },
  // ▼ NUEVO
  sectorBadge: { padding:"3px 8px", borderRadius:"var(--radius-xs)", fontSize:10, background:"var(--info-bg)", color:"var(--info)", fontWeight:600, textTransform:"uppercase", letterSpacing:0.3, border:"1px solid var(--info-border)" },
  urgentBadge: { display:"inline-block", marginLeft:8, padding:"2px 7px", borderRadius:"var(--radius-pill)", fontSize:10, background:"var(--warn-bg)", color:"var(--warn)", fontWeight:600, border:"1px solid var(--warn-border)" },
  detailBtn: { padding:"6px 12px", fontSize:11, background:"var(--info-bg)", color:"var(--info)", border:"1px solid var(--info-border)", borderRadius:"var(--radius-sm)", cursor:"pointer", fontFamily:"var(--font-ui)", fontWeight:600 },
  closeBtn: { background:"transparent", border:"1px solid var(--border)", color:"var(--text-secondary)", padding:"6px 10px", borderRadius:"var(--radius-sm)", cursor:"pointer", fontFamily:"var(--font-ui)", fontSize:13, flexShrink:0 },
  calendarHeader: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14, flexWrap:"wrap", gap:8 },
  weekBtn: { display:"flex", alignItems:"center", gap:6, padding:"8px 14px", fontSize:12, background:"var(--bg-surface-2)", color:"var(--text-primary)", border:"1px solid var(--border)", borderRadius:"var(--radius-sm)", cursor:"pointer", fontFamily:"var(--font-ui)", fontWeight:500, minHeight:"var(--tap-target)" },
  weekTitle: { margin:0, fontSize:14, color:"var(--text-primary)", fontWeight:600, textTransform:"capitalize" },
  calendarGrid: { display:"grid", gridTemplateColumns:"56px repeat(7, 1fr)", border:"1px solid var(--border)", borderRadius:"var(--radius-md)", overflow:"hidden" },
  calTimeHeader: { background:"var(--bg-surface)", padding:8 },
  calDayHeader: { background:"var(--bg-surface)", padding:"10px 6px", textAlign:"center", borderLeft:"1px solid var(--border)", borderBottom:"1px solid var(--border)" },
  calDayToday: { background:"var(--bg-elevated)", borderBottom:"2px solid var(--accent)" },
  calDayName: { display:"block", fontSize:10, fontWeight:700, color:"var(--text-secondary)", letterSpacing:1.2, textTransform:"uppercase" },
  calDayNum: { display:"block", fontSize:17, fontWeight:700, marginTop:2 },
  calTimeCell: { padding:"6px 8px", fontSize:10, color:"var(--text-tertiary)", fontWeight:500, fontFamily:"var(--font-mono)", borderTop:"1px solid var(--border-subtle)", background:"var(--bg-base)", textAlign:"right" },
  calCell: { padding:3, borderTop:"1px solid var(--border-subtle)", borderLeft:"1px solid var(--border-subtle)", minHeight:40, background:"var(--bg-base)" },
  calEvent: { padding:"3px 5px", borderRadius:"var(--radius-xs)", borderLeft:"2px solid", marginBottom:2, fontSize:9, lineHeight:1.3, cursor:"pointer", transition:"filter 120ms, transform 100ms" },
  calEventTime: { display:"block", fontFamily:"var(--font-mono)", color:"var(--text-secondary)", fontWeight:500 },
  calEventName: { display:"block", fontFamily:"var(--font-mono)", color:"var(--text-primary)", fontWeight:700, fontSize:10 },
  calLegend: { display:"flex", gap:16, marginTop:14, padding:"10px 14px", background:"var(--bg-surface)", borderRadius:"var(--radius-sm)", flexWrap:"wrap" },
  legendItem: { display:"flex", alignItems:"center", gap:7, fontSize:11, color:"var(--text-secondary)" },
  legendDot: { width:7, height:7, borderRadius:"50%", flexShrink:0 },
  bottomNavItem: { display:"flex", flexDirection:"column", alignItems:"center", gap:2, background:"transparent", border:"none", fontFamily:"var(--font-ui)", cursor:"pointer", padding:"4px 6px", WebkitTapHighlightColor:"transparent", transition:"color 200ms", flex:1, minHeight:"var(--tap-target)", justifyContent:"center" },
};
