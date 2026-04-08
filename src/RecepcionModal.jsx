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
    if (resultado === "NO CONFORME" && !observacion.trim()) {
      setError("Describí qué no está OK."); return;
    }
    setLoading(true); setError("");
    try {
      const { error: sbError } = await supabase.from("recepciones").insert([{
        fecha: fecha || new Date().toLocaleDateString("en-CA"),
        equipo: equipo.equipmentName || equipo.equipmentId,
        operario: operario.trim().toUpperCase(),
        resultado,
        observacion: observacion.trim() || null,
      }]);
      if (sbError) throw new Error(sbError.message);
      setDone(true);
      setTimeout(() => { onSuccess?.(); onClose(); }, 2000);
    } catch (err) {
      setError("Error al guardar. Intentá de nuevo.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1100 }} />
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "#111827", borderRadius: "16px 16px 0 0",
        border: "1px solid #1f2937", zIndex: 1101,
        maxHeight: "90vh", display: "flex", flexDirection: "column",
        fontFamily: "'JetBrains Mono', monospace",
        boxShadow: "0 -20px 60px rgba(0,0,0,0.6)",
      }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: "#374151", margin: "12px auto 0", flexShrink: 0 }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "16px 20px 12px", borderBottom: "1px solid #1f2937", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#f3f4f6" }}>Recepción Post-Service</div>
            <div style={{ fontSize: 12, color: "#f59e0b", marginTop: 3, fontWeight: 600 }}>
              {equipo.equipmentName || equipo.equipmentId}
            </div>
            <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{fecha}</div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#6b7280", fontSize: 20, cursor: "pointer", padding: "4px 8px" }}>✕</button>
        </div>

        <div style={{ overflowY: "auto", padding: "20px", flex: 1 }}>
          {done ? (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>{resultado === "CONFORME" ? "✓" : "⚠"}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: resultado === "CONFORME" ? "#4ade80" : "#fbbf24" }}>
                Registrado como {resultado}
              </div>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 20 }}>
                <label style={lbl}>Nombre del operario que retira</label>
                <input style={inp} placeholder="Tu nombre completo"
                  value={operario} onChange={(e) => setOperario(e.target.value)} />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={lbl}>Estado del equipo al retirar</label>
                <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                  <button
                    onClick={() => { setResultado("CONFORME"); setObservacion(""); setError(""); }}
                    style={{
                      flex: 1, padding: "16px 12px", borderRadius: 10, border: "2px solid",
                      borderColor: resultado === "CONFORME" ? "#16a34a" : "#1f2937",
                      background: resultado === "CONFORME" ? "#052e16" : "#1f2937",
                      color: resultado === "CONFORME" ? "#4ade80" : "#6b7280",
                      fontFamily: "inherit", fontSize: 13, fontWeight: 800, cursor: "pointer",
                    }}>✓ CONFORME</button>
                  <button
                    onClick={() => { setResultado("NO CONFORME"); setError(""); }}
                    style={{
                      flex: 1, padding: "16px 12px", borderRadius: 10, border: "2px solid",
                      borderColor: resultado === "NO CONFORME" ? "#ef4444" : "#1f2937",
                      background: resultado === "NO CONFORME" ? "#450a0a" : "#1f2937",
                      color: resultado === "NO CONFORME" ? "#fca5a5" : "#6b7280",
                      fontFamily: "inherit", fontSize: 13, fontWeight: 800, cursor: "pointer",
                    }}>✕ NO CONFORME</button>
                </div>
              </div>

              {resultado === "NO CONFORME" && (
                <div style={{ marginBottom: 20 }}>
                  <label style={lbl}>¿Qué no está OK? <span style={{ color: "#ef4444" }}>*</span></label>
                  <textarea style={{ ...inp, minHeight: 80, resize: "vertical" }}
                    placeholder="Describí el problema encontrado..."
                    value={observacion} onChange={(e) => setObservacion(e.target.value)} />
                </div>
              )}

              {error && (
                <div style={{ color: "#fca5a5", fontSize: 12, marginBottom: 16, padding: "8px 12px", background: "#450a0a", borderRadius: 6 }}>
                  {error}
                </div>
              )}

              <button onClick={handleSubmit} disabled={loading} style={{
                width: "100%", padding: "14px", fontSize: 14, fontWeight: 700,
                background: loading ? "#374151" : resultado === "NO CONFORME" ? "#7f1d1d" : "#14532d",
                color: loading ? "#6b7280" : resultado === "NO CONFORME" ? "#fca5a5" : "#4ade80",
                border: "none", borderRadius: 10, cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "inherit", letterSpacing: 0.5,
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

const lbl = { fontSize: 10, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1, fontWeight: 700, display: "block", marginBottom: 6 };
const inp = { padding: "10px 12px", fontSize: 13, background: "#1f2937", color: "#e5e7eb", border: "1px solid #374151", borderRadius: 8, fontFamily: "inherit", width: "100%", boxSizing: "border-box" };
