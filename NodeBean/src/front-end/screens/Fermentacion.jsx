// ─── FERMENTACIÓN ──────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback } from "react";
import { Icon } from "../components/SharedComponents";
import PhotoGallery from "../components/PhotoGallery";
import { getFermentationDay, registerTurn, saveTemperature } from "../../back-end/fermentation";

const Fermentacion = ({ goBack, activeLot, showToast }) => {
  const total    = 7;
  const maxTurns = 6;
  const [selectedDay,   setSelectedDay]   = useState(1);
  const [dayLog,        setDayLog]        = useState(null);
  const [saving,        setSaving]        = useState(false);
  const [saved,         setSaved]         = useState(false);
  const [showTempModal, setShowTempModal] = useState(false);
  const [tempInput,     setTempInput]     = useState("");
  const [savingTemp,    setSavingTemp]    = useState(false);
  const progressPct = ((selectedDay - 1) / (total - 1)) * 100;

  const loadDayLog = useCallback(async (day) => {
    if (!activeLot) return;
    setDayLog(await getFermentationDay(activeLot.id, day));
  }, [activeLot]);

  useEffect(() => { loadDayLog(selectedDay); }, [selectedDay, loadDayLog]);

  const handleRegisterTurn = async () => {
    if (!activeLot) { showToast("Sin lote activo"); return; }
    setSaving(true);
    const { data, error } = await registerTurn(activeLot.id, selectedDay, dayLog);
    setSaving(false);
    if (error) { console.error("registerTurn error:", error); showToast("Error al registrar giro"); return; }
    setDayLog(data);
    setSaved(true);
    showToast("Giro registrado");
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveTemp = async () => {
    if (!activeLot) { showToast("Sin lote activo"); return; }
    const val = parseFloat(tempInput);
    if (!tempInput || isNaN(val) || val < 0 || val > 100) { showToast("Temperatura invalida"); return; }
    setSavingTemp(true);
    const { data, error } = await saveTemperature(activeLot.id, selectedDay, val);
    setSavingTemp(false);
    if (error) { console.error("saveTemperature error:", error); showToast("Error al guardar"); return; }
    setDayLog(data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    showToast("Temperatura registrada");
    setShowTempModal(false);
    setTempInput("");
  };

  const turns    = dayLog?.turns_count || 0;
  const lastTurn = dayLog?.last_turn_at
    ? new Date(dayLog.last_turn_at).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })
    : null;

  const tempVal   = dayLog?.temperature_c || null;
  const minT = 20, maxT = 80;
  const pct       = tempVal ? Math.min(Math.max((tempVal - minT) / (maxT - minT), 0), 1) : 0.47;
  const needleAngle = -90 + pct * 180;
  const arcLen    = 251.2;
  const filledLen = pct * arcLen;
  const inRange   = tempVal && tempVal >= 45 && tempVal <= 50;
  const tempColor = tempVal ? (inRange ? "var(--success)" : tempVal > 50 ? "#dc2626" : "#f59e0b") : "var(--primary)";

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      <div className="page-header px">
        <button className="header-icon-btn" onClick={goBack}><Icon name="arrow_back_ios" /></button>
        <div style={{ textAlign: "center" }}>
          <div className="page-title">Fermentación</div>
          <div className="lot-label">Lote #{activeLot?.lot_code || "—"}</div>
        </div>
        <div className={`save-indicator${saved ? " visible" : ""}`}>
          <Icon name="cloud_done" style={{ fontSize: 14 }} /> Guardado
        </div>
      </div>

      <div className="page-scroll px">
        {/* Timeline */}
        <div className="mb-6">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Proceso</div>
            <div style={{ background: "var(--primary-light)", color: "var(--primary)", padding: "4px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
              Día {selectedDay} de {total}
            </div>
          </div>
          <div className="timeline-wrap">
            <div className="timeline-track" />
            <div className="timeline-progress" style={{ width: `${progressPct}%` }} />
            {Array.from({ length: total }, (_, i) => {
              const d       = i + 1;
              const done    = d < selectedDay;
              const current = d === selectedDay;
              return (
                <div className="day-node" key={d} onClick={() => setSelectedDay(d)}>
                  <div className={`day-circle${done ? " done" : ""}${current ? " current" : ""}`}>
                    {done ? <Icon name="check" style={{ fontSize: 14, color: "white" }} /> : d}
                  </div>
                  <div className={`day-label${current ? " current-label" : ""}`}>{current ? "Hoy" : `D${d}`}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gauge temperatura — clickeable para registrar */}
        <div className="gauge-card mb-6"
          onClick={() => { if (!activeLot) return; setTempInput(tempVal ? String(tempVal) : ""); setShowTempModal(true); }}
          style={{ cursor: activeLot ? "pointer" : "default" }}>
          <div className="gauge-label">Temperatura</div>
          <div className="gauge-svg-wrap">
            <svg viewBox="0 0 180 90" width="180" height="90">
              <path d="M 10 90 A 80 80 0 0 1 170 90" fill="none" stroke="#ede9e4" strokeWidth="14" strokeLinecap="round" />
              <path d="M 10 90 A 80 80 0 0 1 170 90" fill="none" stroke={tempColor} strokeWidth="14" strokeLinecap="round"
                strokeDasharray={`${filledLen} ${arcLen}`} strokeDashoffset="0" />
              <line x1="90" y1="90" x2="90" y2="18" stroke="#1a1208" strokeWidth="3" strokeLinecap="round"
                transform={`rotate(${needleAngle}, 90, 90)`} />
              <circle cx="90" cy="90" r="7" fill="#1a1208" />
            </svg>
          </div>
          <div style={{ marginTop: 8, textAlign: "center" }}>
            <span className="temp-value" style={{ color: tempColor }}>{tempVal ?? "—"}</span>
            <span className="temp-unit"> °C</span>
          </div>
          {tempVal ? (
            <div className="temp-ok" style={{ color: tempColor }}>
              <Icon name={inRange ? "check_circle" : "warning"} style={{ fontSize: 14 }} />
              {inRange ? " Rango óptimo (45–50°C)" : tempVal > 50 ? " Temperatura alta" : " Temperatura baja"}
            </div>
          ) : (
            <div className="temp-ok" style={{ color: "var(--muted)" }}>
              <Icon name="touch_app" style={{ fontSize: 14 }} /> Toca para registrar temperatura
            </div>
          )}
        </div>

        {/* Info cards */}
        <div className="info-grid mb-6">
          <div className="info-card">
            <div className="info-card-label"><Icon name="calendar_today" style={{ fontSize: 14 }} /> Fecha inicio</div>
            <div className="info-card-value">
              {activeLot ? new Date(activeLot.harvest_date).toLocaleDateString("es-CO", { day: "numeric", month: "short" }) : "—"}
            </div>
          </div>
          <div className="info-card">
            <div className="info-card-label"><Icon name="cached" style={{ fontSize: 14 }} /> Vueltas realizadas</div>
            <div className="info-card-value">{turns} <span className="info-card-sub">de {maxTurns}</span></div>
          </div>
        </div>

        {/* Imagen */}
        <div className="img-card mb-6">
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCC3aFH3Mny7AQrDQuFegufnP_QFrNJUrNEDDGQT4gHem6kbXgbEoUUGoH7yr9l7_teR70632xMyzGv7e94I5rSjNy9ACKzpxsBpKxumY6J4_zeTZu4PMBk3mIb35B7-05SolOg1wbu3wZ6p9Q7kqeBNBrWEj2YSVyWIoh-w-DdQcBm12y3ceSdx12uEDShN4VWqbUKiDxuqXFx33wqQPtSi0ft83TCQLcXPyb6ddbaueott5SQEmum3qZo8hK-xTzTGzjHRpsPD_UK" alt="Cacao fermentando" />
          <div className="img-overlay"><span>Inspección de calidad visual: Buen desarrollo del color</span></div>
        </div>

        {/* Acciones */}
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Acciones diarias</div>
        <div className="space-y">
          <div className="action-card">
            <div className="action-icon"><Icon name="refresh" /></div>
            <div className="action-info">
              <div className="action-name">Volteo (giro)</div>
              <div className="action-sub">{lastTurn ? `Último giro a las ${lastTurn}` : "Sin giros registrados"}</div>
            </div>
            <button className="action-btn" onClick={handleRegisterTurn}
              disabled={turns >= maxTurns || saving || !activeLot}
              style={{ opacity: (turns >= maxTurns || !activeLot) ? 0.5 : 1 }}>
              {saving ? "..." : turns >= maxTurns ? "Completado" : "Registrar giro"}
            </button>
          </div>
        </div>

        <div style={{ marginTop: 8 }}>
          <PhotoGallery lotId={activeLot?.id} etapa="fermentacion" showToast={showToast} />
        </div>
        <div style={{ height: 20 }} />
      </div>

      {showTempModal && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setShowTempModal(false); }}>
          <div className="modal-sheet">
            <div className="modal-handle" />
            <div className="modal-title">Temperatura — Día {selectedDay}</div>
            <div className="space-y mb-6">
              <div>
                <div className="field-label">Temperatura del grano (°C)</div>
                <div className="field-wrap">
                  <input
                    className="field-input"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    placeholder="Ej: 48.5"
                    value={tempInput}
                    onChange={(e) => setTempInput(e.target.value)}
                    autoFocus
                  />
                  <Icon name="thermostat" className="field-icon" />
                </div>
                <div style={{ marginTop: 8, fontSize: 12, color: "var(--muted)" }}>
                  Rango óptimo de fermentación: 45–50°C
                </div>
              </div>
            </div>
            <button className="primary-btn" onClick={handleSaveTemp} disabled={savingTemp || !tempInput}>
              {savingTemp ? "Guardando..." : "Guardar temperatura"} <Icon name="check" style={{ fontSize: 16 }} />
            </button>
            <button className="secondary-btn" style={{ marginTop: 10 }} onClick={() => setShowTempModal(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fermentacion;