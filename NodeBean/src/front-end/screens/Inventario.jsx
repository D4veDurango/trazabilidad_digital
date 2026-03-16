// ─── INVENTARIO / ALMACENAMIENTO ───────────────────────────────────────────────
import { useState, useEffect } from "react";
import { Browser } from "@capacitor/browser";
import { Icon } from "../components/SharedComponents";
import { getInventory, saveInventory, buildQrData } from "../../back-end/inventory";
import { updateLotStatus } from "../../back-end/lots";

const Inventario = ({ goBack, activeLot, profile, showToast }) => {
  const [inventory,    setInventory]    = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [pesoNeto,     setPesoNeto]     = useState("");
  const [sacos,        setSacos]        = useState("");
  const [fechaEntrada, setFechaEntrada] = useState(new Date().toISOString().split("T")[0]);
  const [condPallets,  setCondPallets]  = useState(false);
  const [condParedes,  setCondParedes]  = useState(false);
  const [condOlores,   setCondOlores]   = useState(false);
  const [traceKey,     setTraceKey]     = useState("");
  const [pageUrl,      setPageUrl]      = useState("");
  const [qrUrl,        setQrUrl]        = useState("");

  const actualizarQR = (key) => {
    const { pageUrl: pu, qrUrl: qu } = buildQrData(key);
    setPageUrl(pu); setQrUrl(qu); setTraceKey(key);
  };

  useEffect(() => {
    const load = async () => {
      if (!activeLot) { setLoading(false); return; }
      const data = await getInventory(activeLot.id);
      if (data) {
        setInventory(data);
        setPesoNeto(data.net_weight_kg || "");
        setSacos(data.bag_count || "");
        setFechaEntrada(data.entry_date || new Date().toISOString().split("T")[0]);
        setCondPallets(data.storage_on_pallets || false);
        setCondParedes(data.away_from_walls || false);
        setCondOlores(data.no_strong_odors || false);
        if (data.traceability_key) actualizarQR(data.traceability_key);
      } else {
        setPesoNeto(activeLot.weight_kg || "");
        setSacos(Math.ceil((activeLot.weight_kg || 0) / 50) || "");
      }
      setLoading(false);
    };
    load();
  }, [activeLot]);

  useEffect(() => {
    if (pesoNeto && !inventory) setSacos(Math.ceil(parseFloat(pesoNeto) / 50) || "");
  }, [pesoNeto]);

  const handleFinalizar = async () => {
    if (!activeLot || !pesoNeto) { showToast("Ingresa el peso neto"); return; }
    setSaving(true);
    const { data, error, key } = await saveInventory(
      activeLot.id,
      { net_weight_kg: parseFloat(pesoNeto), bag_count: parseInt(sacos) || Math.ceil(parseFloat(pesoNeto) / 50), entry_date: fechaEntrada, storage_on_pallets: condPallets, away_from_walls: condParedes, no_strong_odors: condOlores },
      { variety: activeLot.variety, producerId: profile?.producer_id || "URB", lotCode: activeLot.lot_code }
    );
    setSaving(false);
    if (!error) {
      setInventory(data);
      actualizarQR(key);
      await updateLotStatus(activeLot.id, "almacenamiento");
      showToast("✓ QR de trazabilidad generado");
    } else showToast("Error al guardar");
  };

  const abrirPagina = () => { if (pageUrl) Browser.open({ url: pageUrl }); };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  const yaRegistrado = inventory?.ready_to_sell;

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      <div className="page-header px">
        <button className="header-icon-btn" onClick={goBack}><Icon name="arrow_back_ios_new" /></button>
        <div style={{ textAlign: "center" }}>
          <div className="page-title">Almacenamiento</div>
          <div className="page-subtitle">Lote #{activeLot?.lot_code || "—"}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div className="status-dot" style={{ background: yaRegistrado ? "var(--success)" : "#f59e0b" }} />
          <span style={{ color: yaRegistrado ? "var(--success)" : "#d97706", fontWeight: 800, fontSize: 10, letterSpacing: "0.06em" }}>
            {yaRegistrado ? "LISTO" : "PEND."}
          </span>
        </div>
      </div>

      <div className="page-scroll px py">
        {!activeLot ? (
          <div className="empty-state" style={{ marginTop: 40 }}>
            <div className="empty-state-icon">📦</div>
            <div className="empty-state-text">No hay lotes activos.</div>
          </div>
        ) : (
          <>
            <div style={{ background: "var(--primary-light)", border: "1.5px solid rgba(212,115,17,0.2)", borderRadius: "var(--radius)", padding: "12px 16px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Lote en proceso</div>
                <div style={{ fontWeight: 800, fontSize: 16, marginTop: 2 }}>#{activeLot.lot_code}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>{activeLot.variety}</div>
                <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>{activeLot.parcel_name}</div>
              </div>
            </div>

            <div style={{ fontSize: 10, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Datos de entrada</div>
            <div className="space-y-sm mb-6">
              {[
                { icon: "scale",          label: "Peso neto cacao seco (kg)", value: pesoNeto, set: setPesoNeto, type: "number", placeholder: "Ej: 420.5" },
                { icon: "inventory_2",    label: "Número de sacos / costales", value: sacos,    set: setSacos,    type: "number", placeholder: "Auto"      },
                { icon: "calendar_today", label: "Fecha de entrada al almacén", value: fechaEntrada, set: setFechaEntrada, type: "date", placeholder: ""  },
              ].map(({ icon, label, value, set, type, placeholder }) => (
                <div key={label} className="inv-field-row">
                  <Icon name={icon} className="inv-field-icon" />
                  <div className="inv-field-info">
                    <div className="inv-field-label">{label}</div>
                    <input className="inv-input" type={type} placeholder={placeholder} value={value} onChange={(e) => set(e.target.value)} disabled={yaRegistrado} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 10, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Condiciones de almacenamiento</div>
            <div className="space-y-sm mb-6">
              {[
                { label: "Almacenado sobre pallets",            val: condPallets, set: setCondPallets },
                { label: "Alejado de las paredes (mín. 50 cm)", val: condParedes, set: setCondParedes },
                { label: "Sin presencia de olores fuertes",     val: condOlores,  set: setCondOlores  },
              ].map(({ label, val, set }) => (
                <div key={label} className={`cond-check${val ? " checked" : ""}`} onClick={() => !yaRegistrado && set(!val)}>
                  <div className="cond-box">{val ? "✓" : ""}</div>
                  <div className="cond-text">{label}</div>
                </div>
              ))}
            </div>

            {traceKey ? (
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                  <Icon name="qr_code_2" style={{ color: "var(--primary)", fontSize: 18 }} />
                  <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)" }}>Carta de trazabilidad</span>
                </div>
                <div style={{ background: "linear-gradient(160deg, #1a1208 0%, #2c1c09 100%)", borderRadius: 20, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
                  <div style={{ height: 4, background: "linear-gradient(90deg, #d47311, #f59e0b)" }} />
                  <div style={{ padding: "22px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                    <div style={{ fontSize: 9, fontWeight: 800, color: "rgba(212,115,17,0.8)", textTransform: "uppercase", letterSpacing: "0.16em" }}>🍫 NodeBean · Urabá, Colombia</div>
                    <div style={{ background: "white", borderRadius: 16, padding: 10, boxShadow: "0 4px 24px rgba(0,0,0,0.5)", border: "3px solid rgba(212,115,17,0.3)" }}>
                      {qrUrl && <img src={qrUrl} alt="QR trazabilidad" style={{ width: 168, height: 168, display: "block", borderRadius: 8 }} />}
                    </div>
                    <div style={{ textAlign: "center", lineHeight: 1.6 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "white" }}>Escanea para descargar la carta</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>El PDF se descarga automáticamente</div>
                    </div>
                    <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.08)" }} />
                    <div style={{ width: "100%" }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6, textAlign: "center" }}>Código de lote</div>
                      <div onClick={() => { navigator.clipboard?.writeText(traceKey); showToast("✓ Código copiado"); }}
                        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", fontFamily: "'Space Mono', monospace", fontSize: 12, color: "rgba(255,255,255,0.85)", textAlign: "center", letterSpacing: "0.04em", wordBreak: "break-all", cursor: "pointer", userSelect: "all", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                        {traceKey}
                        <Icon name="content_copy" style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", flexShrink: 0 }} />
                      </div>
                    </div>
                    <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.08)" }} />
                    <div style={{ width: "100%" }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6, textAlign: "center" }}>Link de descarga</div>
                      <div onClick={() => { navigator.clipboard?.writeText(pageUrl); showToast("✓ Link copiado"); }}
                        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", fontFamily: "'Space Mono', monospace", fontSize: 10, color: "rgba(212,115,17,0.75)", textAlign: "center", letterSpacing: "0.02em", wordBreak: "break-all", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                        <Icon name="link" style={{ fontSize: 13, flexShrink: 0 }} />
                        {pageUrl.replace("https://", "").slice(0, 52)}{pageUrl.length > 52 ? "…" : ""}
                        <Icon name="content_copy" style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", flexShrink: 0 }} />
                      </div>
                    </div>
                    <button onClick={abrirPagina} style={{ width: "100%", background: "var(--primary)", color: "white", border: "none", borderRadius: 13, padding: "14px 16px", fontFamily: "inherit", fontSize: 14, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 20px rgba(212,115,17,0.45)", marginTop: 2 }}>
                      <Icon name="download" style={{ fontSize: 19 }} /> Descargar carta PDF
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ background: "#f8f7f6", border: "1.5px dashed rgba(0,0,0,0.1)", borderRadius: "var(--radius)", padding: "24px 20px", textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>Aún no hay carta generada</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>El QR y el link de descarga aparecen<br />después de finalizar el registro.</div>
              </div>
            )}
          </>
        )}
        <div style={{ height: 10 }} />
      </div>

      {activeLot && (
        <div className="footer-actions">
          <button className="primary-btn" onClick={handleFinalizar} disabled={saving || yaRegistrado}>
            <Icon name={yaRegistrado ? "check_circle" : "qr_code_2"} />
            {saving ? "Generando..." : yaRegistrado ? "Carta generada ✓" : "Finalizar & Generar QR"}
          </button>
          {yaRegistrado && (
            <button className="secondary-btn" onClick={() => { if (pageUrl) { try { navigator.share({ title: `Lote ${activeLot.lot_code}`, text: "Carta de trazabilidad de cacao · Urabá", url: pageUrl }); } catch { abrirPagina(); } } }}>
              <Icon name="share" /> Compartir link de descarga
            </button>
          )}
          <div style={{ height: 4 }} />
        </div>
      )}
    </div>
  );
};

export default Inventario;
