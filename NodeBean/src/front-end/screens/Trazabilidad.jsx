// ─── CARTA PÚBLICA DE TRAZABILIDAD ─────────────────────────────────────────────
// Página pública accesible via QR. No requiere login.
// Se activa cuando la URL contiene ?key=...

import { useState, useEffect } from "react";
import { supabase } from "../../back-end/supabaseClient";
//import { descargar } from "C:\Users\User\Desktop\Trabajo_Grado\NodeBean\supabase\functions\lote\index.ts";

const Trazabilidad = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const key = new URLSearchParams(window.location.search).get("key");

  useEffect(() => {
    if (!key) { setError("Falta la clave."); setLoading(false); return; }
    supabase.from("inventory")
      .select("*, lots(*, profiles(*), parcelas(*))")
      .eq("traceability_key", key)
      .maybeSingle()
      .then(async ({ data: inv, error: err }) => {
        if (err || !inv) { setError("No se encontró información para esta clave."); setLoading(false); return; }
        const { data: drying } = await supabase.from("drying_logs").select("day_number,humidity_pct,temperature_c,method").eq("lot_id", inv.lots?.id).order("day_number");
        const { data: photos } = await supabase.from("lot_photos").select("id,url,stage").eq("lot_id", inv.lots?.id).order("created_at");
        setData({ ...inv, drying_logs: drying || [], photos: photos || [] });
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh", flexDirection: "column", gap: 16, background: "#f0ede8" }}>
      <div style={{ width: 44, height: 44, border: "3px solid rgba(212,115,17,.15)", borderTopColor: "#d47311", borderRadius: "50%", animation: "spin .8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
     <span style={{ color: "#7a6f63", fontSize: 14, fontWeight: 600, fontFamily: "var(--font-body)" }}>Cargando carta...</span>
    </div>
  );

  if (error) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh", flexDirection: "column", gap: 12, background: "#f8f7f6", textAlign: "center", padding: 32, fontFamily: "system-ui" }}>
      <div style={{ fontSize: 56 }}>🔍</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: "#1a1208" }}>Lote no encontrado</div>
      <div style={{ fontSize: 14, color: "#7a6f63", maxWidth: 300, lineHeight: 1.6 }}>{error}</div>
    </div>
  );

  const lot = data.lots || {};
  const profile = lot.profiles || {};
  const parcela = lot.parcelas || {};
  const fmt = (d) => d ? new Date(d).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" }) : "---";
  const chk = (v) => v ? "✓ Verificado" : "✗ No verificado";
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(key)}&color=1a1208&bgcolor=ffffff&margin=10`;

  const descargar = () => {
    window.print();
  };

  const S = {
    wrap: { maxWidth: 460, margin: "0 auto", padding: "20px 20px 40px", fontFamily: "var(--font-body)" },
    header: { background: "linear-gradient(135deg,#1a1208,#2c1c09)", borderRadius: 20, padding: "28px 24px 22px", marginBottom: 16, color: "white", position: "relative", overflow: "hidden" },
    eye: { fontSize: 10, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(212,115,17,.8)", marginBottom: 6 },
    lotnum: { fontSize: 28, fontWeight: 800, marginBottom: 6 },
    badge: { display: "inline-flex", alignItems: "center", gap: 5, background: "#16a34a", color: "white", borderRadius: 999, padding: "4px 12px", fontSize: 11, fontWeight: 700, marginBottom: 10 },
    regd: { fontSize: 11, color: "rgba(255,255,255,.4)" },
    btn: { width: "100%", background: "#d47311", color: "white", border: "none", borderRadius: 14, padding: 15, fontSize: 15, fontWeight: 800, cursor: "pointer", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 6px 20px rgba(212,115,17,.35)", fontFamily: "inherit" },
    qrCard: { background: "white", borderRadius: 16, padding: 20, textAlign: "center", marginBottom: 16, border: "1px solid #ede9e4" },
    qrLbl: { fontSize: 10, fontWeight: 700, color: "#7a6f63", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 12 },
    keyCode: { fontFamily: "monospace", fontSize: 11, background: "#f8f7f6", borderRadius: 8, padding: "8px 12px", color: "#1a1208", wordBreak: "break-all", marginTop: 10, border: "1px solid #ede9e4" },
    secTitle: { fontSize: 10, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: "#d47311", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 },
    table: { width: "100%", borderCollapse: "collapse", background: "white", borderRadius: 12, overflow: "hidden", border: "1px solid #ede9e4", marginBottom: 16 },
    tdL: { color: "#7a6f63", padding: "10px 14px", fontSize: 13, borderBottom: "1px solid #f0ede8" },
    tdR: { fontWeight: 700, padding: "10px 14px", fontSize: 13, borderBottom: "1px solid #f0ede8", textAlign: "right" },
    footer: { textAlign: "center", fontSize: 11, color: "#7a6f63", padding: "20px 0 4px", lineHeight: 1.7 },
  };

  const Sec = ({ title, rows }) => (
    <div style={{ marginBottom: 16 }}>
      <div style={S.secTitle}>
        <div style={{ height: 1, width: 14, background: "#d47311" }} />{title}
        <div style={{ flex: 1, height: 1, background: "#ede9e4" }} />
      </div>
      <table style={S.table}><tbody>
        {rows.map(([lbl, val, ok], i) => (
          <tr key={lbl} style={i % 2 === 0 ? { background: "#faf9f7" } : {}}>
            <td style={S.tdL}>{lbl}</td>
            <td style={{ ...S.tdR, color: ok === true ? "#16a34a" : ok === false ? "#dc2626" : "#1a1208" }}>{val}</td>
          </tr>
        ))}
      </tbody></table>
    </div>
  );

  return (
    <div style={{ background: "#f0ede8", minHeight: "100dvh" }}>
      <style>{`@media print{.no-print{display:none!important}body{background:white}}`}</style>
      <div style={S.wrap}>
        <div style={S.header}>
          <div style={{ position: "absolute", top: 0, left: 0, width: 5, height: "100%", background: "linear-gradient(180deg,#d47311,#f59e0b)" }} />
          <div style={{ paddingLeft: 14 }}>
            <div style={S.eye}>🍫 NodeBean · Urabá, Colombia</div>
            <div style={S.lotnum}>Lote #{lot.lot_code || "---"}</div>
            <div style={S.badge}>✓ Verificado y Registrado</div>
            <div style={S.regd}>Registrado: {data.registered_at ? new Date(data.registered_at).toLocaleString("es-CO") : "---"}</div>
          </div>
        </div>

        <button
          className="no-print"
          style={S.btn}
          onClick={descargar}
        >
          Descargar carta PDF
        </button>

        <div style={S.qrCard}>
          <div style={S.qrLbl}>Código QR de trazabilidad</div>
          <img src={qrUrl} width={160} height={160} alt="QR" style={{ borderRadius: 10, border: "1px solid #f0ede8" }} />
          <div style={S.keyCode}>{key}</div>
        </div>

        <Sec title="Productor" rows={[
          ["Nombre completo", profile.full_name || "---"],
          ["ID Productor", profile.producer_id || "---"],
          ["Región", "Urabá, Antioquia — Colombia"],
        ]} />
        <Sec title="Parcela de origen" rows={[
          ["Nombre / Código", parcela.nombre || lot.parcel_name || "---"],
          ["Superficie", parcela.hectareas ? parcela.hectareas + " ha" : "---"],
          ["Árboles de cacao", parcela.num_arboles ? String(parcela.num_arboles) : "---"],
          ["Variedad", lot.variety || "---"],
        ]} />
        <Sec title="Proceso cronológico" rows={[
          ["Cosecha", fmt(lot.harvest_date)],
          ["Fermentación", "6 días desde la cosecha"],
          ["Entrada al almacén", fmt(data.entry_date || data.registered_at)],
        ]} />

        {data.drying_logs?.length > 0 && (() => {
          const logs = data.drying_logs;
          const humedadFinal = logs[logs.length - 1]?.humidity_pct;
          const metodos = [...new Set(logs.map((l) => l.method))].join(", ");
          const hColor = humedadFinal <= 7 ? "#16a34a" : humedadFinal <= 10 ? "#d97706" : "#dc2626";
          return (
            <div style={{ marginBottom: 16 }}>
              <div style={S.secTitle}><div style={{ height: 1, width: 14, background: "#d47311" }} />Secado<div style={{ flex: 1, height: 1, background: "#ede9e4" }} /></div>
              <table style={S.table}><tbody>
                <tr><td style={S.tdL}>Días de secado</td><td style={{ ...S.tdR, color: "#1a1208" }}>{logs.length} días</td></tr>
                <tr style={{ background: "#faf9f7" }}><td style={S.tdL}>Humedad inicial</td><td style={{ ...S.tdR, color: "#1a1208" }}>{logs[0]?.humidity_pct}%</td></tr>
                <tr><td style={S.tdL}>Humedad final</td><td style={{ ...S.tdR, color: hColor, fontWeight: 800 }}>{humedadFinal}% {humedadFinal <= 7 ? "✓" : ""}</td></tr>
                <tr style={{ background: "#faf9f7" }}><td style={S.tdL}>Método</td><td style={{ ...S.tdR, color: "#1a1208", textTransform: "capitalize" }}>{metodos}</td></tr>
              </tbody></table>
              <div style={{ background: "white", borderRadius: 12, border: "1px solid #ede9e4", padding: "14px 16px", marginTop: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#7a6f63", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 12 }}>Evolución de humedad</div>
                {logs.map((d, i) => {
                  const h = d.humidity_pct;
                  const barPct = Math.min((h / 20) * 100, 100);
                  const barColor = h <= 7 ? "#16a34a" : h <= 10 ? "#f59e0b" : "#dc2626";
                  return (
                    <div key={d.day_number} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: i < logs.length - 1 ? 8 : 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#7a6f63", width: 28, flexShrink: 0 }}>D{d.day_number}</div>
                      <div style={{ flex: 1, height: 7, background: "#f0ede8", borderRadius: 999, overflow: "hidden" }}>
                        <div style={{ width: `${barPct}%`, height: "100%", background: barColor, borderRadius: 999 }} />
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: barColor, width: 38, textAlign: "right", flexShrink: 0 }}>{h}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        <Sec title="Inventario final" rows={[
          ["Peso neto cacao seco", data.net_weight_kg ? data.net_weight_kg + " kg" : "---"],
          ["Sacos de fique", data.bag_count ? data.bag_count + " costales" : "---"],
        ]} />
        <Sec title="Condiciones de almacenamiento" rows={[
          ["Almacenado sobre pallets", chk(data.storage_on_pallets), data.storage_on_pallets],
          ["Alejado de paredes (mín. 50 cm)", chk(data.away_from_walls), data.away_from_walls],
          ["Sin presencia de olores fuertes", chk(data.no_strong_odors), data.no_strong_odors],
        ]} />

        {data.photos?.length > 0 && [...new Set(data.photos.map((p) => p.stage))].map((etapa) => (
          <div key={etapa} style={{ marginBottom: 16 }}>
            <div style={S.secTitle}><div style={{ height: 1, width: 14, background: "#d47311" }} />Fotos — {etapa.charAt(0).toUpperCase() + etapa.slice(1)}<div style={{ flex: 1, height: 1, background: "#ede9e4" }} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
              {data.photos.filter((p) => p.stage === etapa).map((p) => (
                <div key={p.id} style={{ aspectRatio: 1, borderRadius: 10, overflow: "hidden", border: "1px solid #ede9e4" }}>
                  <img src={p.url} alt="proceso" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ))}
            </div>
          </div>
        ))}

        <div style={S.footer}>
          Documento generado por NodeBean · Sistema de Trazabilidad Digital<br />
          {new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })}
        </div>
      </div>
    </div>
  );
};

export default Trazabilidad;
