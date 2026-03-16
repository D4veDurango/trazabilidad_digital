// ─── SECADO ────────────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback } from "react";
import { Icon } from "../components/SharedComponents";
import PhotoGallery from "../components/PhotoGallery";
import { getDryingDay, getDryingSummary, saveDryingDay } from "../../back-end/drying";
import { updateLotStatus } from "../../back-end/lots";

const Secado = ({ goBack, activeLot, showToast }) => {
  const totalDays = 10;
  const [selectedDay,  setSelectedDay]  = useState(1);
  const [dayLog,       setDayLog]       = useState(null);
  const [saving,       setSaving]       = useState(false);
  const [saved,        setSaved]        = useState(false);
  const [tempC,        setTempC]        = useState("");
  const [humedad,      setHumedad]      = useState("");
  const [metodo,       setMetodo]       = useState("solar");
  const [secadoData,   setSecadoData]   = useState([]);
  const progressPct = ((selectedDay - 1) / (totalDays - 1)) * 100;

  const cargarDia = useCallback(async (day) => {
    if (!activeLot) return;
    const data = await getDryingDay(activeLot.id, day);
    setDayLog(data);
    if (data) {
      setTempC(data.temperature_c ? String(data.temperature_c) : "");
      setHumedad(data.humidity_pct ? String(data.humidity_pct) : "");
      setMetodo(data.method || "solar");
    } else { setTempC(""); setHumedad(""); setMetodo("solar"); }
  }, [activeLot]);

  const cargarResumen = useCallback(async () => {
    if (!activeLot) return;
    setSecadoData(await getDryingSummary(activeLot.id));
  }, [activeLot]);

  useEffect(() => { cargarDia(selectedDay); }, [selectedDay, cargarDia]);
  useEffect(() => { cargarResumen(); }, [cargarResumen]);

  const handleGuardar = async () => {
    if (!activeLot) return;
    if (!humedad) { showToast("Ingresa la humedad del grano"); return; }
    setSaving(true);
    const { data, error } = await saveDryingDay(activeLot.id, selectedDay, { temperature_c: tempC, humidity_pct: humedad, method: metodo });
    setSaving(false);
    if (!error) {
      setDayLog(data);
      setSaved(true);
      cargarResumen();
      showToast("✓ Día " + selectedDay + " registrado");
      setTimeout(() => setSaved(false), 2000);
      if (parseFloat(humedad) <= 7) {
        await updateLotStatus(activeLot.id, "secado");
        showToast("🎉 ¡Secado completado! Humedad óptima alcanzada");
      }
    } else showToast("Error al guardar");
  };

  const humedadActual = parseFloat(humedad) || dayLog?.humidity_pct || null;
  const humedadColor  = humedadActual === null ? "var(--muted)" : humedadActual <= 7 ? "var(--success)" : humedadActual <= 10 ? "#f59e0b" : "#dc2626";
  const humedadLabel  = humedadActual === null ? "—" : humedadActual <= 7 ? "Óptima ✓" : humedadActual <= 10 ? "Casi lista" : "Alta";

  const maxHum = 20;
  const humPct = Math.min((humedadActual || 0) / maxHum, 1);
  const r = 54, cx = 64, cy = 64, startAngle = -210, endAngle = 30;
  const totalAngle = endAngle - startAngle;
  const angle  = startAngle + totalAngle * humPct;
  const toRad  = (a) => (a * Math.PI) / 180;
  const arcX   = cx + r * Math.cos(toRad(angle));
  const arcY   = cy + r * Math.sin(toRad(angle));
  const startX = cx + r * Math.cos(toRad(startAngle));
  const startY = cy + r * Math.sin(toRad(startAngle));
  const largeArc = totalAngle * humPct > 180 ? 1 : 0;

  const diasRegistrados = secadoData?.length || 0;
  const ultimaHumedad   = secadoData?.length ? secadoData[secadoData.length - 1]?.humidity_pct : null;
  const secadoCompleto  = ultimaHumedad !== null && ultimaHumedad <= 7;

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      <div className="page-header px">
        <button className="header-icon-btn" onClick={goBack}><Icon name="arrow_back_ios" /></button>
        <div style={{ textAlign: "center" }}>
          <div className="page-title">Secado</div>
          <div className="lot-label">Lote #{activeLot?.lot_code || "—"}</div>
        </div>
        <div className={`save-indicator${saved ? " visible" : ""}`}>
          <Icon name="cloud_done" style={{ fontSize: 14 }} /> Guardado
        </div>
      </div>

      <div className="page-scroll px">
        {secadoCompleto && (
          <div className="completed-banner mb-6">
            <div className="completed-icon"><Icon name="check" style={{ color: "white", fontSize: 24 }} /></div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: "#15803d" }}>¡Secado completado!</div>
              <div style={{ fontSize: 12, color: "#16a34a", marginTop: 3 }}>Humedad final: {ultimaHumedad}% · Listo para almacenamiento</div>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="mb-6">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Seguimiento diario</div>
            <div style={{ background: "var(--primary-light)", color: "var(--primary)", padding: "4px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
              Día {selectedDay} de {totalDays}
            </div>
          </div>
          <div className="timeline-wrap">
            <div className="timeline-track" />
            <div className="timeline-progress" style={{ width: `${progressPct}%` }} />
            {Array.from({ length: totalDays }, (_, i) => {
              const d       = i + 1;
              const logged  = secadoData?.find((l) => l.day_number === d);
              const done    = !!logged && d < selectedDay;
              const current = d === selectedDay;
              return (
                <div className="day-node" key={d} onClick={() => setSelectedDay(d)}>
                  <div className={`day-circle${done ? " done" : ""}${current ? " current" : ""}`}
                    style={logged && !current ? { background: "var(--primary)", color: "white" } : {}}>
                    {done ? <Icon name="check" style={{ fontSize: 14, color: "white" }} /> : d}
                  </div>
                  <div className={`day-label${current ? " current-label" : ""}`}>{current ? "Hoy" : `D${d}`}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gauge humedad */}
        <div className="mb-6" style={{ display: "flex", alignItems: "center", gap: 16, background: "#f8f7f6", border: "1.5px solid var(--border)", borderRadius: "var(--radius)", padding: 16 }}>
          <div className="humidity-ring" style={{ width: 128, height: 128, flexShrink: 0 }}>
            <svg width="128" height="128" viewBox="0 0 128 128">
              <circle cx={cx} cy={cy} r={r} fill="none" stroke="#ede9e4" strokeWidth="10" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * r * (totalAngle / 360)} ${2 * Math.PI * r}`}
                transform={`rotate(${startAngle + 90} ${cx} ${cy})`} />
              {humedadActual !== null && humedadActual > 0 && (
                <path d={`M ${startX} ${startY} A ${r} ${r} 0 ${largeArc} 1 ${arcX} ${arcY}`}
                  fill="none" stroke={humedadColor} strokeWidth="10" strokeLinecap="round" />
              )}
            </svg>
            <div className="humidity-label-center" style={{ top: 20 }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: humedadColor, lineHeight: 1 }}>
                {humedadActual !== null ? humedadActual + "%" : "—"}
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: humedadColor, marginTop: 2 }}>{humedadLabel}</div>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", marginBottom: 10 }}>Rangos</div>
            {[
              { label: "Óptimo",    range: "≤ 7%",   color: "var(--success)" },
              { label: "Aceptable", range: "7–10%",  color: "#f59e0b"        },
              { label: "Alto",      range: "> 10%",  color: "#dc2626"        },
            ].map((rx) => (
              <div key={rx.label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: rx.color, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: "var(--muted)" }}>{rx.label}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: rx.color, marginLeft: "auto" }}>{rx.range}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Método */}
        <div className="mb-6">
          <div className="field-label">Método de secado</div>
          <div style={{ display: "flex", gap: 10 }}>
            {[{ id: "solar", icon: "☀️", name: "Solar" }, { id: "marquesina", icon: "🏗️", name: "Marquesina" }, { id: "mecanico", icon: "⚙️", name: "Mecánico" }].map((m) => (
              <button key={m.id} className={`metodo-btn${metodo === m.id ? " selected" : ""}`} onClick={() => setMetodo(m.id)}>
                <span className="metodo-icon">{m.icon}</span>
                <span className="metodo-name">{m.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mediciones */}
        <div className="mb-6">
          <div className="field-label">Mediciones del día {selectedDay}</div>
          <div className="info-grid">
            <div className="day-stat-card">
              <div className="day-stat-label"><Icon name="water_drop" style={{ fontSize: 14, color: "var(--primary)" }} /> Humedad</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <input className="day-stat-input" type="number" step="0.1" min="0" max="30" placeholder="Ej: 12.5" value={humedad} onChange={(e) => setHumedad(e.target.value)} style={{ color: humedadColor }} />
                <span className="day-stat-unit">%</span>
              </div>
            </div>
            <div className="day-stat-card">
              <div className="day-stat-label"><Icon name="thermostat" style={{ fontSize: 14, color: "var(--primary)" }} /> Temperatura</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <input className="day-stat-input" type="number" step="0.5" min="0" max="60" placeholder="Ej: 35" value={tempC} onChange={(e) => setTempC(e.target.value)} />
                <span className="day-stat-unit">°C</span>
              </div>
            </div>
          </div>
        </div>

        {/* Evolución */}
        {secadoData.length > 0 && (
          <div className="mb-6">
            <div className="field-label">Evolución de humedad</div>
            <div style={{ background: "#f8f7f6", border: "1.5px solid var(--border)", borderRadius: "var(--radius)", padding: "14px 16px" }}>
              {secadoData.map((d, i) => {
                const h = d.humidity_pct;
                const barPct   = Math.min((h / 20) * 100, 100);
                const barColor = h <= 7 ? "var(--success)" : h <= 10 ? "#f59e0b" : "#dc2626";
                return (
                  <div key={d.day_number} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: i < secadoData.length - 1 ? 10 : 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", width: 28, flexShrink: 0 }}>D{d.day_number}</div>
                    <div style={{ flex: 1, height: 8, background: "#ede9e4", borderRadius: 999, overflow: "hidden" }}>
                      <div style={{ width: `${barPct}%`, height: "100%", background: barColor, borderRadius: 999, transition: "width 0.4s" }} />
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: barColor, width: 38, textAlign: "right", flexShrink: 0 }}>{h}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="info-grid mb-6">
          <div className="info-card">
            <div className="info-card-label"><Icon name="today" style={{ fontSize: 14 }} /> Días registrados</div>
            <div className="info-card-value">{diasRegistrados} <span className="info-card-sub">de {totalDays}</span></div>
          </div>
          <div className="info-card">
            <div className="info-card-label"><Icon name="water_drop" style={{ fontSize: 14 }} /> Última humedad</div>
            <div className="info-card-value" style={{ color: ultimaHumedad !== null ? (ultimaHumedad <= 7 ? "var(--success)" : ultimaHumedad <= 10 ? "#f59e0b" : "#dc2626") : "var(--text)" }}>
              {ultimaHumedad !== null ? ultimaHumedad + "%" : "—"}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 8, marginBottom: 8 }}>
          <PhotoGallery lotId={activeLot?.id} etapa="secado" showToast={showToast} />
        </div>
        <div style={{ height: 20 }} />
      </div>

      <div className="footer-actions">
        <button className="primary-btn" onClick={handleGuardar} disabled={saving || !humedad}>
          <Icon name={saving ? "hourglass_empty" : "save"} />
          {saving ? "Guardando..." : `Guardar día ${selectedDay}`}
        </button>
        <div style={{ height: 4 }} />
      </div>
    </div>
  );
};

export default Secado;
