import { useState } from "react";
import { supabase } from "./supabaseClient.js";

export default function RecepcionModal({ equipo, fecha, onClose, onSuccess }) {
  const [operario, setOperario] = useState("");
  const [resultado, setResultado] = useState(null);
  const [observacion, setObservacion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!operario.trim()) { setError("Ingresá tu nombre."); return; }
    if (!resultado) { setError("Seleccioná el resultado."); return; }
    if (resultado === "NO CONFORME" && !observacion.trim()) { setError("Describí qué no está OK."); return; }
    setLoading(true); setError("");
    try {
      const { error: sbError } = await supabase.from("recepciones").insert([{
        fecha: fecha || new Date().toLocaleDateString("en-CA"),
        equipo: equipo.equipmentName || equipo.equipmentId,
        operario: operario.trim().toUpperCase(), resultado,
        observacion: observacion.trim() || null,
      }]);
      if (sbError) throw new Error(sbError.message);
      setDone(true);
      setTimeout(() => { onSuccess?.(); onClose(); }, 2000);
    } catch (err) { setError("Error al guardar. Intentá de nuevo."); console.error(err);
    } finally { setLoading(false); }
  };

  return (
    <>
      <div onClick={onClose} className="animate-fade-in"
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1100, backdropFilter: "blur(4px)" }} />
      <div className="animate-slide-up" style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "var(--bg-surface)", borderRadius: "16px 16px 0 0",
        border: "1px solid var(--border)", zIndex: 1101,
        maxHeight: "90vh", display: "flex", flexDirection: "column",
        fontFamily: "var(--font-ui)", boxShadow: "var(--shadow-lg)",
      }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: "var(--border-hover)", margin: "12px auto 0", flexShrink: 0 }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "16px 20px 12px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>Recepción post-service</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--accent)", marginTop: 4, fontWeight: 600 }}>
              {equipo.equipmentName || equipo.equipmentId}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 2 }}>{fecha}</div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "var(--text-tertiary)", fontSize: 20, cursor: "pointer", padding: "4px 8px" }}>✕</button>
        </div>

        <div style={{ overflowY: "auto", padding: "20px", flex: 1 }}>
          {done ? (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <div style={{ marginBottom: 12 }}>
                {resultado === "CONFORME"
                  ? <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--ok)" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                  : <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--warn)" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                }
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: resultado === "CONFORME" ? "var(--ok)" : "var(--warn)" }}>
                Registrado como {resultado}
              </div>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 20 }}>
                <label style={lbl}>Nombre del operario que retira</label>
                <input style={inp} placeholder="Tu nombre completo" value={operario} onChange={(e) => setOperario(e.target.value)} />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={lbl}>Estado del equipo al retirar</label>
                <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                  <button onClick={() => { setResultado("CONFORME"); setObservacion(""); setError(""); }}
                    style={{ flex: 1, padding: "16px 12px", borderRadius: "var(--radius-md)", border: "2px solid",
                      borderColor: resultado === "CONFORME" ? "var(--ok)" : "var(--border)",
                      background: resultado === "CONFORME" ? "var(--ok-bg)" : "var(--bg-surface-2)",
                      color: resultado === "CONFORME" ? "var(--ok)" : "var(--text-tertiary)",
                      fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 150ms",
                    }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 6, verticalAlign: "middle" }}><path d="M20 6L9 17l-5-5"/></svg>
                    Conforme
                  </button>
                  <button onClick={() => { setResultado("NO CONFORME"); setError(""); }}
                    style={{ flex: 1, padding: "16px 12px", borderRadius: "var(--radius-md)", border: "2px solid",
                      borderColor: resultado === "NO CONFORME" ? "var(--danger)" : "var(--border)",
                      background: resultado === "NO CONFORME" ? "var(--danger-bg)" : "var(--bg-surface-2)",
                      color: resultado === "NO CONFORME" ? "var(--danger)" : "var(--text-tertiary)",
                      fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 150ms",
                    }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 6, verticalAlign: "middle" }}><path d="M18 6L6 18M6 6l12 12"/></svg>
                    No conforme
                  </button>
                </div>
              </div>

              {resultado === "NO CONFORME" && (
                <div style={{ marginBottom: 20 }}>
                  <label style={lbl}>¿Qué no está OK? <span style={{ color: "var(--danger)" }}>*</span></label>
                  <textarea style={{ ...inp, minHeight: 80, resize: "vertical" }}
                    placeholder="Describí el problema encontrado..."
                    value={observacion} onChange={(e) => setObservacion(e.target.value)} />
                </div>
              )}

              {error && (
                <div style={{ color: "var(--danger)", fontSize: 12, marginBottom: 16, padding: "8px 12px", background: "var(--danger-bg)", borderRadius: "var(--radius-sm)", border: "1px solid var(--danger-border)" }}>{error}</div>
              )}

              <button onClick={handleSubmit} disabled={loading} style={{
                width: "100%", padding: "14px", fontSize: 14, fontWeight: 700,
                background: loading ? "var(--bg-surface-2)" : resultado === "NO CONFORME" ? "var(--danger-bg)" : "var(--ok-bg)",
                color: loading ? "var(--text-muted)" : resultado === "NO CONFORME" ? "var(--danger)" : "var(--ok)",
                border: `1px solid ${loading ? "var(--border)" : resultado === "NO CONFORME" ? "var(--danger-border)" : "var(--ok-border)"}`,
                borderRadius: "var(--radius-md)", cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "var(--font-ui)", transition: "all 150ms",
              }}>
                {loading ? "Guardando..." : "Confirmar recepción"}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

const lbl = { fontSize: 11, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600, display: "block", marginBottom: 6, fontFamily: "var(--font-ui)" };
const inp = { padding: "10px 12px", fontSize: 13, background: "var(--bg-surface-2)", color: "var(--text-primary)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-ui)", width: "100%", boxSizing: "border-box", transition: "border-color 150ms" };
