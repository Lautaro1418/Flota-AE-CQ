import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabaseClient.js";

const SECTORS = [
  "ALMACEN","EXPEDICION","FRACCIONADO","VERTICALIZADA","ESTIBAS",
  "ETIQUETAS","VARIETAL NORTE","VARIETAL SUR","TRAPICHE","MANTENIMIENTO",
  "BODEGUITA","INTENDENCIA",
];
const DIAS = ["LUNES","MARTES","MIERCOLES","JUEVES","VIERNES","SABADO"];

// ═══════════════════════════════════════════════════════════════
// LOGIN — migrado a Supabase Auth
// ═══════════════════════════════════════════════════════════════
function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: pwd,
    });
    if (authError) {
      setError("Credenciales incorrectas.");
      setPwd("");
    } else {
      onLogin();
    }
    setLoading(false);
  };

  return (
    <div style={s.loginWrap}>
      <div style={s.loginBox}>
        <div style={s.loginIcon}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <h2 style={s.loginTitle}>Administración</h2>
        <p style={s.loginSub}>Ingresá tus credenciales para continuar</p>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          style={{ ...s.loginInput, letterSpacing: "normal", marginBottom: 8 }}
          autoFocus
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={pwd}
          onChange={(e) => { setPwd(e.target.value); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          style={s.loginInput}
        />
        {error && <div style={s.loginError}>{error}</div>}
        <button onClick={handleSubmit} style={s.loginBtn} disabled={loading}>
          {loading ? "Verificando..." : "Ingresar"}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PANEL PRINCIPAL — logout agregado
// ═══════════════════════════════════════════════════════════════
export default function AdminPanel({ onBack }) {
  const [authed, setAuthed] = useState(false);
  const [activeTab, setActiveTab] = useState("flota");

  // Verificar si ya hay sesión activa al montar
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setAuthed(true);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuthed(false);
  };

  if (!authed) return <AdminLogin onLogin={() => setAuthed(true)} />;

  const TABS = [
    { key:"flota",    label:"Flota",       icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
    { key:"personal", label:"Personal",    icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
    { key:"calendar", label:"Calendario",  icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg> },
  ];

  return (
    <div style={s.root}>
      <header style={s.header}>
        <div style={s.headerLeft}>
          <div style={s.logo}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
              <path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z"/><circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
          <div>
            <div style={s.headerTitle}>Administración</div>
            <div style={s.headerSub}>Gestión de datos · Flota CQ</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handleLogout} style={s.logoutBtn}>Cerrar sesión</button>
          <button onClick={onBack} style={s.backBtn}>← Inicio</button>
        </div>
      </header>

      <nav style={s.tabs}>
        {TABS.map((tab)=>(
          <button key={tab.key} onClick={()=>setActiveTab(tab.key)}
            style={{...s.tab,...(activeTab===tab.key?s.tabActive:{})}}>
            <span style={{marginRight:7,display:"inline-flex",verticalAlign:"middle"}}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      <main style={s.content}>
        {activeTab==="flota"    && <FlotaTab/>}
        {activeTab==="personal" && <PersonalTab/>}
        {activeTab==="calendar" && <CalendarTab/>}
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB: FLOTA — sin cambios
// ═══════════════════════════════════════════════════════════════
function FlotaTab() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newRow, setNewRow] = useState({equipo:"",tipo:"",id_corto:"",horometro:"",sector:"",activo:true});
  const [msg, setMsg] = useState("");
  const TIPOS = ["AE GLP","AE ELÉCTRICO","APILADORA","CAMIÓN","CONTAINERA"];

  useEffect(()=>{
    supabase.from("flota").select("*").order("id_corto")
      .then(({data})=>{setRows(data||[]);setLoading(false);});
  },[]);
  const flash = (m)=>{setMsg(m);setTimeout(()=>setMsg(""),3000);};
  const updateField = async(id,field,value)=>{
    setSaving(id);
    const {error} = await supabase.from("flota").update({[field]:value}).eq("id",id);
    if (!error){setRows((prev)=>prev.map((r)=>r.id===id?{...r,[field]:value}:r));flash("Guardado ✓");}
    setSaving(null);
  };
  const addRow = async()=>{
    if (!newRow.equipo||!newRow.id_corto||!newRow.tipo) return;
    const {data,error} = await supabase.from("flota").insert([{
      equipo:newRow.equipo.trim().toUpperCase(), tipo:newRow.tipo,
      id_corto:newRow.id_corto.trim().toUpperCase(),
      horometro:newRow.horometro?parseInt(newRow.horometro):null,
      sector:newRow.sector||null,
      activo:true,
    }]).select();
    if (!error&&data){
      setRows((prev)=>[...prev,data[0]]);
      setNewRow({equipo:"",tipo:"",id_corto:"",horometro:"",sector:"",activo:true});
      setShowAdd(false);flash("Equipo agregado ✓");
    }
  };

  if (loading) return <Loader/>;
  return (
    <div>
      <SectionHeader title="Flota" count={rows.filter(r=>r.activo).length} total={rows.length}
        action={<button onClick={()=>setShowAdd(!showAdd)} style={s.addBtn}>+ Agregar equipo</button>}/>
      {msg&&<Toast msg={msg}/>}
      {showAdd&&(
        <div style={s.addForm}>
          <h4 style={s.addTitle}>Nuevo equipo</h4>
          <div style={s.formGrid}>
            <Field label="ID Corto"><input style={s.input} placeholder="AE-XX" value={newRow.id_corto} onChange={(e)=>setNewRow(p=>({...p,id_corto:e.target.value}))}/></Field>
            <Field label="Nombre completo"><input style={s.input} placeholder="AE N°XX CAT" value={newRow.equipo} onChange={(e)=>setNewRow(p=>({...p,equipo:e.target.value}))}/></Field>
            <Field label="Tipo">
              <select style={s.select} value={newRow.tipo} onChange={(e)=>setNewRow(p=>({...p,tipo:e.target.value}))}>
                <option value="">Seleccioná...</option>
                {TIPOS.map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Sector del equipo">
              <select style={s.select} value={newRow.sector} onChange={(e)=>setNewRow(p=>({...p,sector:e.target.value}))}>
                <option value="">Sin asignar</option>
                {SECTORS.map(sec=><option key={sec} value={sec}>{sec}</option>)}
              </select>
            </Field>
            <Field label="Horómetro inicial"><input style={s.input} type="number" value={newRow.horometro} onChange={(e)=>setNewRow(p=>({...p,horometro:e.target.value}))}/></Field>
          </div>
          <div style={{display:"flex",gap:10,marginTop:14}}>
            <button onClick={addRow} style={s.saveBtn}>Guardar</button>
            <button onClick={()=>setShowAdd(false)} style={s.cancelBtn}>Cancelar</button>
          </div>
        </div>
      )}
      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead><tr>
            <th style={s.th}>ID Corto</th>
            <th style={s.th}>Nombre</th>
            <th style={s.th}>Tipo</th>
            <th style={s.th}>Sector</th>
            <th style={s.th}>Horómetro</th>
            <th style={s.th}>Activo</th>
          </tr></thead>
          <tbody>
            {rows.map((row)=>(
              <tr key={row.id} style={{...s.tr,opacity:row.activo?1:0.35}}>
                <td style={{...s.td,fontFamily:"var(--font-mono)",fontWeight:700,color:"var(--accent)",fontSize:13}}>{row.id_corto}</td>
                <td style={s.td}>{row.equipo}</td>
                <td style={s.td}><span style={s.badge}>{row.tipo}</span></td>
                <td style={s.td}>
                  <select style={{...s.select,padding:"5px 8px",fontSize:12}}
                    value={row.sector||""}
                    onChange={(e)=>updateField(row.id,"sector",e.target.value||null)}>
                    <option value="">Sin asignar</option>
                    {SECTORS.map(sec=><option key={sec} value={sec}>{sec}</option>)}
                  </select>
                </td>
                <td style={s.td}><InlineEdit value={row.horometro||""} onSave={(v)=>updateField(row.id,"horometro",v?parseInt(v):null)} saving={saving===row.id} type="number"/></td>
                <td style={s.td}><Toggle value={row.activo} onChange={(v)=>updateField(row.id,"activo",v)}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB: PERSONAL — sin cambios
// ═══════════════════════════════════════════════════════════════
function PersonalTab() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newRow, setNewRow] = useState({nombre:"",sector:""});
  const [msg, setMsg] = useState("");
  const [filter, setFilter] = useState("");

  useEffect(()=>{
    supabase.from("personal").select("*").order("nombre")
      .then(({data})=>{setRows(data||[]);setLoading(false);});
  },[]);
  const flash = (m)=>{setMsg(m);setTimeout(()=>setMsg(""),3000);};
  const updateField = async(id,field,value)=>{
    setSaving(id);
    const {error} = await supabase.from("personal").update({[field]:value}).eq("id",id);
    if (!error){setRows((prev)=>prev.map((r)=>r.id===id?{...r,[field]:value}:r));flash("Guardado ✓");}
    setSaving(null);
  };
  const addRow = async()=>{
    if (!newRow.nombre||!newRow.sector) return;
    const {data,error} = await supabase.from("personal").insert([{
      nombre:newRow.nombre.trim().toUpperCase(), sector:newRow.sector, activo:true,
    }]).select();
    if (!error&&data){
      setRows((prev)=>[...prev,data[0]].sort((a,b)=>a.nombre.localeCompare(b.nombre)));
      setNewRow({nombre:"",sector:""});setShowAdd(false);flash("Operario agregado ✓");
    }
  };
  const filtered = rows.filter((r)=>!filter||r.nombre.toLowerCase().includes(filter.toLowerCase())||r.sector?.toLowerCase().includes(filter.toLowerCase()));

  if (loading) return <Loader/>;
  return (
    <div>
      <SectionHeader title="Personal" count={rows.filter(r=>r.activo).length} total={rows.length}
        action={<button onClick={()=>setShowAdd(!showAdd)} style={s.addBtn}>+ Agregar operario</button>}/>
      {msg&&<Toast msg={msg}/>}
      <input style={{...s.input,marginBottom:16,maxWidth:300}} placeholder="Buscar por nombre o sector..."
        value={filter} onChange={(e)=>setFilter(e.target.value)}/>
      {showAdd&&(
        <div style={s.addForm}>
          <h4 style={s.addTitle}>Nuevo operario</h4>
          <div style={s.formGrid}>
            <Field label="Nombre completo"><input style={s.input} placeholder="GARCIA JUAN PABLO" value={newRow.nombre} onChange={(e)=>setNewRow(p=>({...p,nombre:e.target.value}))}/></Field>
            <Field label="Sector"><select style={s.select} value={newRow.sector} onChange={(e)=>setNewRow(p=>({...p,sector:e.target.value}))}><option value="">Seleccioná...</option>{SECTORS.map(sec=><option key={sec} value={sec}>{sec}</option>)}</select></Field>
          </div>
          <div style={{display:"flex",gap:10,marginTop:14}}>
            <button onClick={addRow} style={s.saveBtn}>Guardar</button>
            <button onClick={()=>setShowAdd(false)} style={s.cancelBtn}>Cancelar</button>
          </div>
        </div>
      )}
      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead><tr><th style={s.th}>Nombre</th><th style={s.th}>Sector</th><th style={s.th}>Activo</th></tr></thead>
          <tbody>
            {filtered.map((row)=>(
              <tr key={row.id} style={{...s.tr,opacity:row.activo?1:0.35}}>
                <td style={{...s.td,fontWeight:600}}>{row.nombre}</td>
                <td style={s.td}>
                  <select style={{...s.select,padding:"5px 8px",fontSize:12}} value={row.sector||""}
                    onChange={(e)=>updateField(row.id,"sector",e.target.value)}>
                    {SECTORS.map(sec=><option key={sec} value={sec}>{sec}</option>)}
                  </select>
                </td>
                <td style={s.td}><Toggle value={row.activo} onChange={(v)=>updateField(row.id,"activo",v)}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB: CALENDARIO — sin cambios
// ═══════════════════════════════════════════════════════════════
function CalendarTab() {
  const [template, setTemplate] = useState([]);
  const [excepciones, setExcepciones] = useState([]);
  const [flota, setFlota] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [msg, setMsg] = useState("");
  const [showAddExc, setShowAddExc] = useState(false);
  const [newExc, setNewExc] = useState({fecha:"",equipo:"",inicio:"",fin:"",motivo:""});
  const [filterDia, setFilterDia] = useState("TODOS");

  const flash = (m)=>{setMsg(m);setTimeout(()=>setMsg(""),3000);};
  useEffect(()=>{
    Promise.all([
      supabase.from("services_template").select("*").order("dia").order("inicio"),
      supabase.from("services_excepciones").select("*").order("fecha",{ascending:false}),
      supabase.from("flota").select("id_corto, equipo").eq("activo",true).order("id_corto"),
    ]).then(([t,e,f])=>{
      setTemplate(t.data||[]);setExcepciones(e.data||[]);setFlota(f.data||[]);setLoading(false);
    });
  },[]);
  const updateTemplate = async(id,field,value)=>{
    setSaving(id);
    const {error} = await supabase.from("services_template").update({[field]:value}).eq("id",id);
    if (!error){setTemplate((prev)=>prev.map((r)=>r.id===id?{...r,[field]:value}:r));flash("Guardado ✓");}
    setSaving(null);
  };
  const addExcepcion = async()=>{
    if (!newExc.fecha||!newExc.equipo) return;
    const {data,error} = await supabase.from("services_excepciones").insert([{
      fecha:newExc.fecha, equipo:newExc.equipo,
      inicio:newExc.inicio||null, fin:newExc.fin||null, motivo:newExc.motivo||null,
    }]).select();
    if (!error&&data){
      setExcepciones((prev)=>[data[0],...prev]);
      setNewExc({fecha:"",equipo:"",inicio:"",fin:"",motivo:""});
      setShowAddExc(false);flash("Excepción agregada ✓");
    }
  };
  const deleteExcepcion = async(id)=>{
    const {error} = await supabase.from("services_excepciones").delete().eq("id",id);
    if (!error) setExcepciones((prev)=>prev.filter((r)=>r.id!==id));
  };
  const filteredTemplate = filterDia==="TODOS"?template:template.filter((r)=>r.dia===filterDia);

  if (loading) return <Loader/>;
  return (
    <div>
      <SectionHeader title="Calendario" count={template.length} total={template.length} label="turnos template"/>
      {msg&&<Toast msg={msg}/>}

      <div style={s.subSection}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,flexWrap:"wrap",gap:10}}>
          <h3 style={s.subTitle}>Template semanal</h3>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <label style={s.label}>Filtrar</label>
            <select style={{...s.select,minWidth:130}} value={filterDia} onChange={(e)=>setFilterDia(e.target.value)}>
              <option value="TODOS">Todos</option>
              {DIAS.map(d=><option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead><tr><th style={s.th}>Día</th><th style={s.th}>Equipo</th><th style={s.th}>Inicio</th><th style={s.th}>Fin</th></tr></thead>
            <tbody>
              {filteredTemplate.map((row)=>(
                <tr key={row.id} style={s.tr}>
                  <td style={{...s.td,color:"var(--accent)",fontWeight:700,fontSize:12}}>{row.dia}</td>
                  <td style={{...s.td,fontFamily:"var(--font-mono)",fontSize:12,color:"var(--text-secondary)"}}>{row.equipo}</td>
                  <td style={s.td}><InlineEdit value={row.inicio||""} type="time" onSave={(v)=>updateTemplate(row.id,"inicio",v)} saving={saving===row.id}/></td>
                  <td style={s.td}><InlineEdit value={row.fin||""} type="time" onSave={(v)=>updateTemplate(row.id,"fin",v)} saving={saving===row.id}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={s.subSection}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
          <h3 style={s.subTitle}>Excepciones puntuales <span style={s.subCount}>{excepciones.length}</span></h3>
          <button onClick={()=>setShowAddExc(!showAddExc)} style={s.addBtn}>+ Agregar excepción</button>
        </div>
        {showAddExc&&(
          <div style={s.addForm}>
            <h4 style={s.addTitle}>Nueva excepción</h4>
            <div style={s.formGrid}>
              <Field label="Fecha"><input style={s.input} type="date" value={newExc.fecha} onChange={(e)=>setNewExc(p=>({...p,fecha:e.target.value}))}/></Field>
              <Field label="Equipo"><select style={s.select} value={newExc.equipo} onChange={(e)=>setNewExc(p=>({...p,equipo:e.target.value}))}><option value="">Seleccioná...</option>{flota.map(f=><option key={f.id_corto} value={f.equipo}>{f.id_corto} — {f.equipo}</option>)}</select></Field>
              <Field label="Hora inicio (vacío = cancelado)"><input style={s.input} type="time" value={newExc.inicio} onChange={(e)=>setNewExc(p=>({...p,inicio:e.target.value}))}/></Field>
              <Field label="Hora fin"><input style={s.input} type="time" value={newExc.fin} onChange={(e)=>setNewExc(p=>({...p,fin:e.target.value}))}/></Field>
              <Field label="Motivo" style={{gridColumn:"1 / -1"}}><input style={s.input} placeholder="Ej: Cambio por feriado" value={newExc.motivo} onChange={(e)=>setNewExc(p=>({...p,motivo:e.target.value}))}/></Field>
            </div>
            <div style={{display:"flex",gap:10,marginTop:14}}>
              <button onClick={addExcepcion} style={s.saveBtn}>Guardar</button>
              <button onClick={()=>setShowAddExc(false)} style={s.cancelBtn}>Cancelar</button>
            </div>
          </div>
        )}
        {excepciones.length===0
          ?<div style={s.empty}>Sin excepciones registradas</div>
          :(
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead><tr><th style={s.th}>Fecha</th><th style={s.th}>Equipo</th><th style={s.th}>Horario</th><th style={s.th}>Motivo</th><th style={s.th}>Eliminar</th></tr></thead>
                <tbody>
                  {excepciones.map((row)=>(
                    <tr key={row.id} style={s.tr}>
                      <td style={{...s.td,fontFamily:"var(--font-mono)",color:"var(--accent)",fontSize:12}}>
                        {new Date(row.fecha).toLocaleDateString("es-AR",{day:"2-digit",month:"short",year:"2-digit"})}
                      </td>
                      <td style={{...s.td,fontFamily:"var(--font-mono)",fontSize:12,color:"var(--text-secondary)"}}>{row.equipo}</td>
                      <td style={s.td}>
                        {row.inicio&&row.fin
                          ?<span style={{fontFamily:"var(--font-mono)",fontSize:12}}>{row.inicio.slice(0,5)} → {row.fin.slice(0,5)}</span>
                          :<span style={{color:"var(--danger)",fontWeight:600,fontSize:12}}>Cancelado</span>}
                      </td>
                      <td style={{...s.td,color:"var(--text-secondary)",fontSize:12}}>{row.motivo||"—"}</td>
                      <td style={s.td}><button onClick={()=>deleteExcepcion(row.id)} style={s.deleteBtn}>✕</button></td>
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
// COMPONENTES AUXILIARES — sin cambios
// ═══════════════════════════════════════════════════════════════
function InlineEdit({ value, onSave, saving, type="text" }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);
  useEffect(()=>setVal(value),[value]);

  if (!editing) {
    return (
      <span onClick={()=>setEditing(true)}
        style={{cursor:"pointer",borderBottom:"1px dashed var(--border-hover)",padding:"2px 4px",color:"var(--text-primary)",fontSize:12,fontFamily:"var(--font-mono)",display:"inline-flex",alignItems:"center",gap:5,transition:"all 120ms",minHeight:28}}>
        {val||<span style={{color:"var(--text-muted)"}}>—</span>}
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{opacity:0.4}}><path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
        {saving&&<span style={{color:"var(--text-muted)",fontSize:10}}>...</span>}
      </span>
    );
  }
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:5}}>
      <input type={type} value={val} autoFocus onChange={(e)=>setVal(e.target.value)}
        onKeyDown={(e)=>{if(e.key==="Enter"){onSave(val);setEditing(false);}if(e.key==="Escape"){setVal(value);setEditing(false);}}}
        style={{...s.input,padding:"3px 6px",width:type==="number"?88:108,fontSize:12}}/>
      <button onClick={()=>{onSave(val);setEditing(false);}} style={s.miniSaveBtn}>✓</button>
      <button onClick={()=>{setVal(value);setEditing(false);}} style={s.miniCancelBtn}>✕</button>
    </span>
  );
}

function Toggle({ value, onChange }) {
  return (
    <button onClick={()=>onChange(!value)}
      style={{width:48,height:26,borderRadius:13,border:"none",cursor:"pointer",
        background:value?"var(--ok)":"var(--bg-surface-3)",position:"relative",transition:"background 200ms",flexShrink:0}}>
      <span style={{position:"absolute",top:2,left:value?24:2,width:22,height:22,borderRadius:"50%",background:"white",transition:"left 200ms",boxShadow:"0 1px 4px rgba(0,0,0,0.4)"}}/>
    </button>
  );
}

function SectionHeader({ title, count, total, label="activos", action }) {
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:10}}>
      <div>
        <h2 style={s.sectionTitle}>{title}</h2>
        <span style={s.sectionCount}>{count} {label} / {total} total</span>
      </div>
      {action}
    </div>
  );
}

function Field({ label, children, style }) {
  return <div style={{display:"flex",flexDirection:"column",gap:5,...style}}><label style={s.label}>{label}</label>{children}</div>;
}
function Loader() {
  return <div style={{color:"var(--text-secondary)",padding:32,textAlign:"center",fontSize:13,fontFamily:"var(--font-ui)"}}>Cargando...</div>;
}
function Toast({ msg }) {
  return <div style={{padding:"8px 14px",background:"var(--ok-bg)",border:"1px solid var(--ok-border)",borderRadius:"var(--radius-sm)",color:"var(--ok)",fontSize:12,marginBottom:14,display:"inline-block",fontFamily:"var(--font-ui)"}}>{msg}</div>;
}

// ═══════════════════════════════════════════════════════════════
// ESTILOS — logoutBtn agregado
// ═══════════════════════════════════════════════════════════════
const s = {
  root: {fontFamily:"var(--font-ui)",background:"var(--bg-base)",color:"var(--text-primary)",minHeight:"100dvh"},
  header: {display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 20px",background:"var(--bg-surface)",borderBottom:"1px solid var(--border)"},
  headerLeft: {display:"flex",alignItems:"center",gap:12},
  logo: {width:38,height:38,display:"flex",alignItems:"center",justifyContent:"center",background:"var(--bg-surface-2)",borderRadius:"var(--radius-sm)",border:"1px solid var(--accent-dim)"},
  headerTitle: {fontSize:14,fontWeight:700,color:"var(--text-primary)"},
  headerSub: {fontSize:11,color:"var(--text-tertiary)",marginTop:2},
  backBtn: {background:"transparent",border:"1px solid var(--border)",color:"var(--text-secondary)",padding:"6px 14px",borderRadius:"var(--radius-sm)",cursor:"pointer",fontFamily:"var(--font-ui)",fontSize:12,fontWeight:500,minHeight:36},
  logoutBtn: {background:"transparent",border:"1px solid var(--danger-border)",color:"var(--danger)",padding:"6px 14px",borderRadius:"var(--radius-sm)",cursor:"pointer",fontFamily:"var(--font-ui)",fontSize:12,fontWeight:500,minHeight:36},
  tabs: {display:"flex",gap:0,padding:"0 20px",background:"var(--bg-surface)",borderBottom:"1px solid var(--border)",overflowX:"auto"},
  tab: {padding:"11px 18px",fontSize:12,fontWeight:500,background:"transparent",color:"var(--text-secondary)",border:"none",borderBottom:"2px solid transparent",cursor:"pointer",fontFamily:"var(--font-ui)",display:"flex",alignItems:"center",transition:"all 200ms",flexShrink:0,minHeight:40},
  tabActive: {color:"var(--accent)",borderBottomColor:"var(--accent)",background:"var(--accent-dim)"},
  content: {padding:"20px"},
  sectionTitle: {margin:0,fontSize:17,fontWeight:700,color:"var(--text-primary)"},
  sectionCount: {fontSize:11,color:"var(--text-secondary)",marginTop:2},
  subSection: {marginBottom:28},
  subTitle: {margin:0,fontSize:13,fontWeight:600,color:"var(--text-primary)"},
  subCount: {fontSize:11,color:"var(--text-secondary)",background:"var(--bg-surface-2)",padding:"2px 7px",borderRadius:"var(--radius-pill)",marginLeft:7,fontWeight:400},
  tableWrap: {borderRadius:"var(--radius-md)",border:"1px solid var(--border)",overflow:"hidden",overflowX:"auto"},
  table: {width:"100%",borderCollapse:"collapse",fontSize:13},
  th: {padding:"9px 12px",textAlign:"left",background:"var(--bg-surface)",color:"var(--text-secondary)",fontWeight:600,fontSize:10,letterSpacing:0.5,borderBottom:"1px solid var(--border)",whiteSpace:"nowrap",textTransform:"uppercase"},
  tr: {borderBottom:"1px solid var(--border-subtle)"},
  td: {padding:"10px 12px",verticalAlign:"middle"},
  badge: {padding:"3px 8px",borderRadius:"var(--radius-xs)",fontSize:10,background:"var(--bg-surface-2)",color:"var(--text-tertiary)",fontWeight:500,textTransform:"uppercase",letterSpacing:0.3},
  label: {fontSize:10,color:"var(--text-tertiary)",textTransform:"uppercase",letterSpacing:0.8,fontWeight:600},
  input: {padding:"8px 10px",fontSize:12,background:"var(--bg-surface-2)",color:"var(--text-primary)",border:"1px solid var(--border)",borderRadius:"var(--radius-sm)",fontFamily:"var(--font-ui)",width:"100%",transition:"border-color 150ms",minHeight:36},
  select: {padding:"8px 10px",fontSize:12,background:"var(--bg-surface-2)",color:"var(--text-primary)",border:"1px solid var(--border)",borderRadius:"var(--radius-sm)",fontFamily:"var(--font-ui)",width:"100%",minHeight:36},
  addBtn: {padding:"7px 14px",fontSize:12,fontWeight:600,background:"var(--info-bg)",color:"var(--info)",border:"1px solid var(--info-border)",borderRadius:"var(--radius-sm)",cursor:"pointer",fontFamily:"var(--font-ui)",minHeight:36},
  addForm: {background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:"var(--radius-md)",padding:"16px 18px",marginBottom:18},
  addTitle: {margin:"0 0 14px",fontSize:13,fontWeight:600,color:"var(--text-primary)"},
  formGrid: {display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))",gap:12},
  saveBtn: {padding:"8px 18px",fontSize:12,fontWeight:600,background:"var(--ok-bg)",color:"var(--ok)",border:"1px solid var(--ok-border)",borderRadius:"var(--radius-sm)",cursor:"pointer",fontFamily:"var(--font-ui)",minHeight:36},
  cancelBtn: {padding:"8px 14px",fontSize:12,background:"transparent",color:"var(--text-secondary)",border:"1px solid var(--border)",borderRadius:"var(--radius-sm)",cursor:"pointer",fontFamily:"var(--font-ui)",minHeight:36},
  deleteBtn: {padding:"4px 9px",fontSize:11,background:"var(--danger-bg)",color:"var(--danger)",border:"1px solid var(--danger-border)",borderRadius:"var(--radius-sm)",cursor:"pointer",fontFamily:"var(--font-ui)"},
  miniSaveBtn: {padding:"3px 7px",fontSize:11,background:"var(--ok-bg)",color:"var(--ok)",border:"none",borderRadius:"var(--radius-sm)",cursor:"pointer",fontFamily:"var(--font-ui)"},
  miniCancelBtn: {padding:"3px 7px",fontSize:11,background:"var(--bg-surface-3)",color:"var(--text-secondary)",border:"none",borderRadius:"var(--radius-sm)",cursor:"pointer",fontFamily:"var(--font-ui)"},
  empty: {padding:"20px",textAlign:"center",color:"var(--text-muted)",background:"var(--bg-surface)",borderRadius:"var(--radius-md)",border:"1px solid var(--border)",fontSize:13},
  loginWrap: {fontFamily:"var(--font-ui)",background:"var(--bg-base)",minHeight:"100dvh",display:"flex",alignItems:"center",justifyContent:"center"},
  loginBox: {background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:"var(--radius-lg)",padding:"36px 32px",width:"100%",maxWidth:360,textAlign:"center",boxShadow:"var(--shadow-lg)"},
  loginIcon: {width:52,height:52,display:"flex",alignItems:"center",justifyContent:"center",background:"var(--bg-surface-2)",borderRadius:"var(--radius-md)",border:"1px solid var(--accent-dim)",margin:"0 auto 18px"},
  loginTitle: {margin:"0 0 8px",fontSize:19,fontWeight:700,color:"var(--text-primary)"},
  loginSub: {margin:"0 0 22px",fontSize:13,color:"var(--text-secondary)"},
  loginInput: {padding:"11px 14px",fontSize:14,background:"var(--bg-surface-2)",color:"var(--text-primary)",border:"1px solid var(--border)",borderRadius:"var(--radius-sm)",fontFamily:"var(--font-ui)",width:"100%",marginBottom:8,textAlign:"center",letterSpacing:4,transition:"border-color 150ms"},
  loginError: {fontSize:12,color:"var(--danger)",marginBottom:12},
  loginBtn: {width:"100%",padding:"12px",fontSize:13,fontWeight:700,background:"var(--accent)",color:"var(--bg-base)",border:"none",borderRadius:"var(--radius-sm)",cursor:"pointer",fontFamily:"var(--font-ui)",transition:"background 150ms",letterSpacing:0.5},
};
