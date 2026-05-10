// ─── FERMENTACIÓN ──────────────────────────────────────────────────────────────
// Protocolo: NTC-1251 · UNAD Colombia · Daimob IoT
//   6 días · 5 volteos (H48,H72,H96,H120,H144) · Temp peligro >55°C

import { useState, useEffect, useCallback, useRef } from "react";
import { Icon } from "../components/SharedComponents";
import PhotoGallery from "../components/PhotoGallery";
import {
  getFermentationDay,
  getFermentationSummary,
  registerTurn,
  saveTemperature,
} from "../../back-end/fermentation";

// ── Constantes técnicas ───────────────────────────────────────────────────────
const TOTAL_DAYS = 6;
const TEMP_OPT_LOW = 45;
const TEMP_OPT_HIGH = 50;
const TEMP_DANGER = 55;   // >55°C quema el grano (NTC-1251)
const TEMP_GAUGE_MIN = 20;
const TEMP_GAUGE_MAX = 65;  // Ajustado para mostrar zona de peligro
const ARC_LEN = 251.2;

// ── Lógica de volteos ─────────────────────────────────────────────────────────
// Día 1: fase anaerobia (0–48h) → sin volteo
// Días 2–6: 1 volteo c/u en horas 48, 72, 96, 120, 144
const canVolteoOnDay = (day) => day >= 2 && day <= TOTAL_DAYS;
const scheduledHour = (day) => day * 24; // D2=48h, D3=72h ... D6=144h

const getScheduledVolteoAt = (fermentStartISO, day) => {
  if (!fermentStartISO || !canVolteoOnDay(day)) return null;
  const start = new Date(fermentStartISO);
  return new Date(start.getTime() + scheduledHour(day) * 3_600_000);
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const getTempStatus = (val) => {
  if (val === null)
    return { color: "var(--muted)", icon: "touch_app", label: "Toca para registrar" };
  if (val > TEMP_DANGER)
    return { color: "#dc2626", icon: "local_fire_department", label: `¡Peligro! Quema el grano (>${TEMP_DANGER}°C)` };
  if (val >= TEMP_OPT_LOW && val <= TEMP_OPT_HIGH)
    return { color: "var(--success)", icon: "check_circle", label: `Rango óptimo (${TEMP_OPT_LOW}–${TEMP_OPT_HIGH}°C)` };
  if (val > TEMP_OPT_HIGH)
    return { color: "#f59e0b", icon: "warning", label: "Alta — considera voltear" };
  return { color: "#f59e0b", icon: "arrow_downward", label: "Baja para fermentación" };
};

const validateTemp = (raw) => {
  if (!raw?.trim()) return "Ingresa la temperatura";
  const n = parseFloat(raw);
  if (isNaN(n)) return "Valor no válido";
  if (n < TEMP_GAUGE_MIN || n > TEMP_GAUGE_MAX)
    return `Rango válido: ${TEMP_GAUGE_MIN}–${TEMP_GAUGE_MAX}°C`;
  return "";
};

const formatCountdown = (target) => {
  const diff = target - Date.now();
  if (diff <= 0) {
    const h = Math.round(Math.abs(diff) / 3_600_000);
    return { overdue: true, text: `Retrasado ${h}h` };
  }
  const h = Math.floor(diff / 3_600_000);
  const m = Math.round((diff % 3_600_000) / 60_000);
  return { overdue: false, text: h > 0 ? `en ${h}h ${m}m` : `en ${m}m` };
};

// ─────────────────────────────────────────────────────────────────────────────
const Fermentacion = ({ goBack, activeLot, showToast }) => {
  const [selectedDay, setSelectedDay] = useState(1);
  const [dayLog, setDayLog] = useState(null);
  const [summary, setSummary] = useState([]);
  const [loadingDay, setLoadingDay] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showTempModal, setShowTempModal] = useState(false);
  const [tempInput, setTempInput] = useState("");
  const [tempError, setTempError] = useState("");
  const [savingTemp, setSavingTemp] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const canAccessDay = (day) => {
    if (day === 1) return true;
    return summary.some((s) => s.day_number === day - 1);
  };

  const isCurrentDaySaved =
    dayLog?.temperature_c !== null || (dayLog?.turns_count || 0) > 0;

  const savedTimer = useRef(null);
  const markSaved = () => {
    if (savedTimer.current) clearTimeout(savedTimer.current);
    setSaved(true);
    savedTimer.current = setTimeout(() => setSaved(false), 2000);
  };
  useEffect(() => () => clearTimeout(savedTimer.current), []);

  // Inicio de fermentación: usar timestamp exacto o caer back a harvest_date
  const fermentStart = activeLot?.fermentation_start_at || activeLot?.harvest_date;

  // ── Turn status helper for history ──
  const getTurnStatus = (turns, day) => {
    if (!canVolteoOnDay(day)) return "Anaerobia";
    return turns >= 1 ? "Completado ✓" : "Pendiente";
  };

  // ── Carga datos ────────────────────────────────────────────────────────────
  const loadDayLog = useCallback(async (day) => {
    if (!activeLot) return;
    setLoadingDay(true);
    setDayLog(null);
    setDayLog(await getFermentationDay(activeLot.id, day));
    setLoadingDay(false);
  }, [activeLot]);

  const loadSummary = useCallback(async () => {
    if (!activeLot) return;
    setSummary(await getFermentationSummary(activeLot.id));
  }, [activeLot]);

  useEffect(() => { loadDayLog(selectedDay); }, [selectedDay, loadDayLog]);
  
  useEffect(() => { loadSummary(); }, [loadSummary]);

  useEffect(() => {
    if (!summary.length) {
      setSelectedDay(1);
      return;
    }

    const latestRegisteredDay = Math.max(
      ...summary.map((d) => d.day_number)
    );

    const nextDay = Math.min(
      latestRegisteredDay + 1,
      TOTAL_DAYS
    );

    setSelectedDay(nextDay);
  }, [summary]);


  const latestRegisteredDay =
    summary.length > 0
      ? Math.max(...summary.map((d) => d.day_number))
      : 0;

  const currentAvailableDay = Math.min(
    latestRegisteredDay + 1,
    TOTAL_DAYS
  );

  const goNextDay = () => {
    if (selectedDay < TOTAL_DAYS) {
      setSelectedDay(selectedDay + 1);
    }
  };

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleRegisterTurn = async () => {
    if (!activeLot) return;
    if (!canVolteoOnDay(selectedDay)) {
      showToast("Día 1: fase anaerobia — sin volteo");
      return;
    }
    if ((dayLog?.turns_count || 0) >= 1) {
      showToast("Volteo del día ya registrado");
      return;
    }
    setSaving(true);
    const { data, error } = await registerTurn(activeLot.id, selectedDay, dayLog);
    setSaving(false);
    if (error) { showToast("Error al registrar volteo"); return; }
    setDayLog(data);
    loadSummary();
    markSaved();
    showToast(`✓ Volteo ${selectedDay - 1}/5 registrado`);
    goNextDay();
  };

  const openTempModal = async () => {
    const fresh = await getFermentationDay(activeLot.id, selectedDay);

    setDayLog(fresh);

    if (fresh?.temperature_c !== null && fresh?.temperature_c !== undefined) {
      showToast("La temperatura de este día ya fue registrada");
      return;
    }

    setTempInput("");
    setTempError("");
    setShowTempModal(true);
  };

  const closeTempModal = () => { setShowTempModal(false); setTempError(""); };

  const handleSaveTemp = async () => {
    const fresh = await getFermentationDay(activeLot.id, selectedDay);

    setDayLog(fresh);

    if (fresh?.temperature_c !== null && fresh?.temperature_c !== undefined) {
      showToast("La temperatura ya fue registrada");
      return;
    }

    const err = validateTemp(tempInput);

    if (err) {
      setTempError(err);
      return;
    }

    const val = parseFloat(tempInput);

    setSavingTemp(true);

    const { data, error } = await saveTemperature(
      activeLot.id,
      selectedDay,
      val
    );

    setSavingTemp(false);

    if (error) {
      showToast("Error al guardar temperatura");
      return;
    }

    setDayLog(data);
    loadSummary();
    markSaved();
    showToast("✓ Temperatura registrada");
    goNextDay();
    closeTempModal();

    if (val > TEMP_DANGER) {
      setTimeout(() => {
        showToast(
          `⚠ Temperatura crítica (${val}°C) — Voltear de inmediato`
        );
      }, 400);
    }
  };

  // ── Derived state ─────────────────────────────────────────────────────────
  const tempVal = dayLog?.temperature_c ?? null;
  const turns = dayLog?.turns_count || 0;
  const lastTurn = dayLog?.last_turn_at
    ? new Date(dayLog.last_turn_at).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })
    : null;

  const progressPct = ((selectedDay - 1) / (TOTAL_DAYS - 1)) * 100;
  const pct = tempVal !== null
    ? Math.min(Math.max((tempVal - TEMP_GAUGE_MIN) / (TEMP_GAUGE_MAX - TEMP_GAUGE_MIN), 0), 1)
    : 0;
  const filledLen = pct * ARC_LEN;
  const needleAngle = -90 + pct * 180;
  const tStatus = getTempStatus(tempVal);
  const hasTemp = tempVal !== null;

  // Volteo del día seleccionado
  const scheduledAt = getScheduledVolteoAt(fermentStart, selectedDay);
  const countdown = scheduledAt ? formatCountdown(scheduledAt) : null;
  const volteoTaken = turns >= 1;

  // Progreso general: volteos completados de los 5 posibles
  const totalVolteos = summary.filter(d => d.turns_count >= 1 && canVolteoOnDay(d.day_number)).length;
  const fermentPct = Math.round((totalVolteos / 5) * 100);

  // Punto peligro en el gauge (55°C)
  const dangerPct = (TEMP_DANGER - TEMP_GAUGE_MIN) / (TEMP_GAUGE_MAX - TEMP_GAUGE_MIN);
  const dangerAngle = (-90 + dangerPct * 180) * (Math.PI / 180);
  const dangerX = 90 + 80 * Math.cos(dangerAngle);
  const dangerY = 90 + 80 * Math.sin(dangerAngle);

  // ── Empty state ────────────────────────────────────────────────────────────
  if (!activeLot) {
    return (
      <div className="page-enter" style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
        <div className="page-header px">
          <button className="header-icon-btn" onClick={goBack}><Icon name="arrow_back_ios" /></button>
          <div style={{ textAlign: "center" }}><div className="page-title">Fermentación</div></div>
          <div style={{ width: 42 }} />
        </div>
        <div className="page-scroll px" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="empty-state" style={{ marginTop: 40 }}>
            <div className="empty-state-icon">⚗️</div>
            <div className="empty-state-text">No hay lote activo.<br />Registra una cosecha primero.</div>
          </div>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>

      {/* Header */}
      <div className="page-header px" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button className="header-icon-btn" onClick={goBack}><Icon name="arrow_back_ios" /></button>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div className="page-title">Fermentación</div>
          <div className="lot-label">Lote #{activeLot.lot_code}</div>
        </div>
        <button
          className="header-icon-btn"
          onClick={() => setShowHistory(true)}
          title="Historial completo"
        >
          <Icon name="schedule" style={{ fontSize: 20 }} />
        </button>
        <div className={`save-indicator${saved ? " visible" : ""}`} style={{ marginLeft: "auto" }}>
          <Icon name="cloud_done" style={{ fontSize: 14 }} /> Guardado
        </div>
      </div>

      <div className="page-scroll px">

        {/* ── Progreso general ── */}
        <div style={{
          background: "var(--primary-light)",
          border: "1.5px solid rgba(196,106,16,0.18)",
          borderRadius: "var(--radius)",
          padding: "14px 16px",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, marginBottom: 7 }}>
              <span style={{ color: "var(--primary)" }}>Volteos completados</span>
              <span style={{ color: "var(--primary)" }}>{totalVolteos} de 5</span>
            </div>
            <div style={{ height: 6, background: "rgba(196,106,16,0.15)", borderRadius: 999, overflow: "hidden" }}>
              <div style={{
                width: `${fermentPct}%`, height: "100%",
                background: totalVolteos === 5 ? "var(--success)" : "var(--primary)",
                borderRadius: 999,
                transition: "width 0.5s ease",
              }} />
            </div>
            <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 5, fontWeight: 600 }}>
              {fermentStart
                ? `Inicio: ${new Date(fermentStart).toLocaleString("es-CO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}`
                : "Sin fecha de inicio registrada"}
            </div>
          </div>
          <div style={{ textAlign: "center", flexShrink: 0 }}>
            <div style={{
              fontFamily: "var(--font-display)", fontSize: 24,
              fontWeight: 800, color: totalVolteos === 5 ? "var(--success)" : "var(--primary)",
              lineHeight: 1,
            }}>{fermentPct}%</div>
            <div style={{ fontSize: 9, color: "var(--muted)", fontWeight: 700, marginTop: 2, letterSpacing: "0.08em" }}>
              PROCESO
            </div>
          </div>

          {/* Button to open history modal */}
        </div>
      </div>

      {/* ── Timeline ── */}
      <div className="mb-6">

        {/* ── Timeline ── */}
        <div className="mb-6">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Seguimiento diario</div>
            <div style={{ background: "var(--primary-light)", color: "var(--primary)", padding: "4px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
              Día {selectedDay} · H{scheduledHour(selectedDay)}
            </div>
          </div>
          <div className="timeline-wrap">
            <div className="timeline-track" />
            <div className="timeline-progress" style={{ width: `${progressPct}%` }} />
            {Array.from({ length: TOTAL_DAYS }, (_, i) => {
              const d = i + 1;
              const log = summary.find(s => s.day_number === d);
              const hasTurn = log?.turns_count >= 1 && canVolteoOnDay(d);
              const current = d === selectedDay;
              return (
                <div className="day-node" key={d} onClick={() => {
                  if (d !== currentAvailableDay) {
                    showToast(
                      "Los días anteriores solo se consultan desde historial"
                    );
                    return;
                  }

                  setSelectedDay(d);
                }}>
                  <div
                    className={`day-circle${d < selectedDay ? " done" : ""}${current ? " current" : ""}`}
                    style={hasTurn && !current ? { background: "var(--success)", color: "white" } : {}}
                  >
                    {hasTurn && !current
                      ? <Icon name="check" style={{ fontSize: 14, color: "white" }} />
                      : d}
                  </div>
                  <div className={`day-label${current ? " current-label" : ""}`}>
                    {current ? "Hoy" : `D${d}`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Tarjeta de volteo programado ── */}
        {canVolteoOnDay(selectedDay) ? (
          <div style={{
            background: volteoTaken ? "var(--success-bg)" : countdown?.overdue ? "#fef2f2" : "white",
            border: `1.5px solid ${volteoTaken ? "rgba(21,128,61,0.25)" : countdown?.overdue ? "rgba(220,38,38,0.3)" : "var(--border)"}`,
            borderRadius: "var(--radius)",
            padding: "14px 16px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14, flexShrink: 0,
              background: volteoTaken ? "var(--success)" : countdown?.overdue ? "#dc2626" : "var(--primary)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 4px 12px ${volteoTaken ? "rgba(21,128,61,0.28)" : countdown?.overdue ? "rgba(220,38,38,0.28)" : "var(--primary-glow)"}`,
            }}>
              <Icon
                name={volteoTaken ? "check_circle" : countdown?.overdue ? "warning" : "schedule"}
                style={{ color: "white", fontSize: 20 }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 13 }}>
                Volteo #{selectedDay - 1} — Hora {scheduledHour(selectedDay)}h
              </div>
              {volteoTaken ? (
                <div style={{ fontSize: 11, color: "var(--success)", fontWeight: 600, marginTop: 2 }}>
                  Realizado a las {lastTurn || "—"}
                </div>
              ) : scheduledAt ? (
                <div style={{ fontSize: 11, fontWeight: 600, marginTop: 2, color: countdown?.overdue ? "#dc2626" : "var(--muted)" }}>
                  {countdown?.overdue
                    ? `⚠ ${countdown.text} — ¡Voltear ahora!`
                    : `Programado ${countdown?.text}`}
                </div>
              ) : (
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Pendiente</div>
              )}
            </div>
            {/* Hora programada */}
            {scheduledAt && !volteoTaken && (
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>
                  {new Date(scheduledAt).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
                </div>
                <div style={{ fontSize: 9, color: "var(--muted-2)", fontWeight: 600 }}>
                  {new Date(scheduledAt).toLocaleDateString("es-CO", { day: "numeric", month: "short" })}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Día 1: no hay volteo */
          <div style={{
            background: "#f8f7f6", border: "1.5px solid var(--border)",
            borderRadius: "var(--radius)", padding: "14px 16px",
            marginBottom: 20, display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14, background: "var(--bg-2)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Icon name="hourglass_empty" style={{ color: "var(--muted)", fontSize: 20 }} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 13 }}>Día 1 — Fase anaerobia (0–48h)</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                Las levaduras procesan los azúcares. No se realizan volteos.
              </div>
            </div>
          </div>
        )}

        {/* ── Gauge temperatura ── */}
        <div
          className="gauge-card mb-6"
          onClick={openTempModal}
          style={{ cursor: "pointer" }}
        >
          <div className="gauge-label">Temperatura del grano</div>
          <div className="gauge-svg-wrap">
            <svg viewBox="0 0 180 90" width="180" height="90">
              {/* Track */}
              <path
                d="M 10 90 A 80 80 0 0 1 170 90"
                fill="none" stroke="#ede9e4" strokeWidth="14" strokeLinecap="round"
              />
              {/* Relleno de temperatura */}
              {hasTemp && (
                <path
                  d="M 10 90 A 80 80 0 0 1 170 90"
                  fill="none" stroke={tStatus.color} strokeWidth="14" strokeLinecap="round"
                  strokeDasharray={`${filledLen} ${ARC_LEN}`} strokeDashoffset="0"
                />
              )}
              {/* Marcador zona peligro 55°C */}
              <circle cx={dangerX} cy={dangerY} r="5" fill="#dc2626" opacity="0.75" />
              {/* Aguja: apunta a la izquierda (mínimo) cuando no hay dato */}
              <line
                x1="90" y1="90" x2="90" y2="18"
                stroke={hasTemp ? "#1a1208" : "#c4bdb5"}
                strokeWidth="3" strokeLinecap="round"
                transform={`rotate(${hasTemp ? needleAngle : -90}, 90, 90)`}
                style={{ transition: "transform 0.4s cubic-bezier(0.4,0,0.2,1)" }}
              />
              <circle cx="90" cy="90" r="7" fill={hasTemp ? "#1a1208" : "#c4bdb5"} />
            </svg>
          </div>

          {/* Leyenda de zonas */}
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 4 }}>
            {[
              { color: "#f59e0b", label: "<45°C" },
              { color: "var(--success)", label: "45–50°C" },
              { color: "#dc2626", label: ">55°C ⚠" },
            ].map(z => (
              <div key={z.label} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, fontWeight: 700, color: "var(--muted)" }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: z.color }} />
                {z.label}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 8, textAlign: "center" }}>
            <span className="temp-value" style={{ color: hasTemp ? tStatus.color : "var(--muted)" }}>
              {hasTemp ? tempVal : "—"}
            </span>
            <span className="temp-unit"> °C</span>
          </div>
          <div className="temp-ok" style={{ color: tStatus.color }}>
            <Icon name={tStatus.icon} style={{ fontSize: 14 }} /> {tStatus.label}
          </div>

          {/* Banner de peligro */}
          {hasTemp && tempVal > TEMP_DANGER && (
            <div style={{
              marginTop: 10,
              background: "#fef2f2",
              border: "1.5px solid rgba(220,38,38,0.35)",
              borderRadius: "var(--radius-xs)",
              padding: "10px 14px",
              fontSize: 12, fontWeight: 700, color: "#dc2626",
              display: "flex", alignItems: "center", gap: 8, justifyContent: "center",
            }}>
              <Icon name="local_fire_department" style={{ fontSize: 16 }} />
              Temperatura crítica — Realizar volteo de inmediato
            </div>
          )}
        </div>

        {/* ── Imagen referencia ── */}
        <div className="img-card mb-6">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCC3aFH3Mny7AQrDQuFegufnP_QFrNJUrNEDDGQT4gHem6kbXgbEoUUGoH7yr9l7_teR70632xMyzGv7e94I5rSjNy9ACKzpxsBpKxumY6J4_zeTZu4PMBk3mIb35B7-05SolOg1wbu3wZ6p9Q7kqeBNBrWEj2YSVyWIoh-w-DdQcBm12y3ceSdx12uEDShN4VWqbUKiDxuqXFx33wqQPtSi0ft83TCQLcXPyb6ddbaueott5SQEmum3qZo8hK-xTzTGzjHRpsPD_UK"
            alt="Cacao fermentando"
          />
          <div className="img-overlay">
            <span>Inspección visual: buen desarrollo del color en granos</span>
          </div>
        </div>

        {/* ── Acción: registrar volteo ── */}
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Acción del día</div>
        <div className="space-y">
          <div className="action-card">
            <div
              className="action-icon"
              style={{ background: canVolteoOnDay(selectedDay) ? "var(--primary)" : "var(--bg-2)" }}
            >
              <Icon
                name={canVolteoOnDay(selectedDay) ? "refresh" : "hourglass_empty"}
                style={{ color: canVolteoOnDay(selectedDay) ? "white" : "var(--muted)" }}
              />
            </div>
            <div className="action-info">
              <div className="action-name">
                {canVolteoOnDay(selectedDay)
                  ? `Volteo #${selectedDay - 1} de 5`
                  : "Fase anaerobia"}
              </div>
              <div className="action-sub">
                {loadingDay ? "Cargando..." :
                  !canVolteoOnDay(selectedDay) ? "Sin volteo el primer día (0–48h)" :
                    volteoTaken ? `Realizado a las ${lastTurn}` :
                      countdown?.overdue ? `⚠ ${countdown.text} — ¡Voltear ahora!` :
                        countdown ? `Programado ${countdown.text}` :
                          "Pendiente de registrar"}
              </div>
            </div>
            <button
              className="action-btn"
              onClick={handleRegisterTurn}
              disabled={!canVolteoOnDay(selectedDay) || volteoTaken || saving || loadingDay}
              style={{ opacity: (!canVolteoOnDay(selectedDay) || volteoTaken) ? 0.5 : 1 }}
            >
              {saving ? "..." :
                !canVolteoOnDay(selectedDay) ? "N/A" :
                  volteoTaken ? "Hecho ✓" :
                    "Voltear"}
            </button>
          </div>
        </div>

        {/* ── Galería de fotos ── */}
        <div style={{ marginTop: 8 }}>
          <PhotoGallery
            lotId={activeLot.id}
            etapa="fermentacion"
            day={selectedDay}
            editable={selectedDay === currentAvailableDay}
            showToast={showToast}
          />
        </div>
        <div style={{ height: 20 }} />
      </div>

      {/* ── Modal historial de fermentación ── */}
      {showHistory && (
        <div
          className="modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedDay(currentAvailableDay);
              setShowHistory(false);
            }
          }}
        >
          <div className="modal-sheet" style={{ maxHeight: "80vh", overflowY: "auto" }}>
            <div className="modal-handle" />
            <div className="modal-title">Historial de Fermentación</div>
            {summary.length === 0 ? (
              <div style={{ padding: 20, textAlign: "center", color: "var(--muted)" }}>
                No hay registros aún
              </div>
            ) : (
              <div className="space-y" style={{ paddingBottom: 20 }}>
                {summary.map((log) => {
                  const tempStatus =
                    log.temperature_c != null
                      ? getTempStatus(log.temperature_c)
                      : null;

                  const turnText = getTurnStatus(
                    log.turns_count || 0,
                    log.day_number
                  );

                  return (
                    <div
                      key={log.day_number}
                      className="info-card"
                      style={{
                        marginBottom: 8,
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        setSelectedDay(log.day_number);
                        setShowHistory(false);
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div style={{ fontWeight: 700, fontSize: 14 }}>
                          Día {log.day_number}
                        </div>

                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color:
                              log.temperature_c != null
                                ? tempStatus.color
                                : "var(--muted)",
                          }}
                        >
                          {log.temperature_c != null
                            ? `${log.temperature_c}°C`
                            : "—"}
                        </div>
                      </div>

                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--muted)",
                          marginTop: 6,
                        }}
                      >
                        {tempStatus ? (
                          <>
                            <Icon
                              name={tempStatus.icon}
                              style={{
                                fontSize: 13,
                                color: tempStatus.color,
                              }}
                            />{" "}
                            {tempStatus.label}
                          </>
                        ) : (
                          <>
                            <Icon
                              name="schedule"
                              style={{ fontSize: 13 }}
                            />{" "}
                            Sin temperatura registrada
                          </>
                        )}

                        <span style={{ marginLeft: 12 }}>•</span>

                        <span style={{ marginLeft: 4 }}>
                          <Icon
                            name={
                              turnText.includes("✓")
                                ? "refresh"
                                : "schedule"
                            }
                            style={{ fontSize: 13 }}
                          />{" "}
                          {turnText}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <button
              className="secondary-btn"
              onClick={() => {
                setSelectedDay(currentAvailableDay);
                setShowHistory(false);
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* ── Modal temperatura ── */}
      {showTempModal && (
        <div
          className="modal-backdrop"
          onClick={(e) => { if (e.target === e.currentTarget) closeTempModal(); }}
        >
          <div className="modal-sheet">
            <div className="modal-handle" />
            <div className="modal-title">Temperatura — Día {selectedDay}</div>
            <div className="space-y mb-6">
              <div>
                <div className="field-label">Temperatura del grano (°C)</div>
                <div className="field-wrap">
                  <input
                    className="field-input"
                    type="number" step="0.1"
                    min={TEMP_GAUGE_MIN} max={TEMP_GAUGE_MAX}
                    placeholder="Ej: 48.5"
                    value={tempInput}
                    onChange={(e) => { setTempInput(e.target.value); if (tempError) setTempError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveTemp()}
                    autoFocus
                    style={tempError ? { borderColor: "var(--danger)", background: "#fef2f2" } : {}}
                  />
                  <Icon name="thermostat" className="field-icon" />
                </div>

                {tempError ? (
                  <div style={{ marginTop: 6, fontSize: 12, color: "var(--danger)", fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                    <Icon name="error_outline" style={{ fontSize: 14 }} /> {tempError}
                  </div>
                ) : (
                  <div style={{ marginTop: 8, fontSize: 12, color: "var(--muted)" }}>
                    Óptimo: {TEMP_OPT_LOW}–{TEMP_OPT_HIGH}°C · Peligro: &gt;{TEMP_DANGER}°C
                  </div>
                )}

                {/* Preview en tiempo real */}
                {tempInput && !isNaN(parseFloat(tempInput)) && (() => {
                  const v = parseFloat(tempInput);
                  if (v < TEMP_GAUGE_MIN || v > TEMP_GAUGE_MAX) return null;
                  const s = getTempStatus(v);
                  return (
                    <div style={{
                      marginTop: 8, padding: "10px 14px",
                      background: v > TEMP_DANGER ? "#fef2f2" : v >= TEMP_OPT_LOW && v <= TEMP_OPT_HIGH ? "var(--success-bg)" : "#fffbeb",
                      border: `1.5px solid ${s.color}44`,
                      borderRadius: "var(--radius-xs)",
                      fontSize: 12, fontWeight: 700, color: s.color,
                      display: "flex", alignItems: "center", gap: 8,
                    }}>
                      <Icon name={s.icon} style={{ fontSize: 16 }} /> {s.label}
                    </div>
                  );
                })()}
              </div>
            </div>

            <button
              className="primary-btn"
              onClick={handleSaveTemp}
              disabled={savingTemp || !tempInput.trim()}
            >
              {savingTemp ? "Guardando..." : "Guardar temperatura"}
              <Icon name="check" style={{ fontSize: 16 }} />
            </button>
            <button className="secondary-btn" style={{ marginTop: 10 }} onClick={closeTempModal}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fermentacion;
