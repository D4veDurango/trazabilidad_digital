import { useState, useEffect, useCallback } from "react";
import { Icon } from "../components/SharedComponents";
import PhotoGallery from "../components/PhotoGallery";
import {
  getDryingDay,
  getDryingSummary,
  saveDryingLog,
  getDryingProgress,
  isDryingComplete,
} from "../../back-end/drying";

const TOTAL_DAYS = 15;
const TARGET_HUMIDITY = 7;
const MAX_HUMIDITY = 16;

const getHumidityStatus = (val) => {
  if (val === null) {
    return {
      color: "var(--muted)",
      icon: "touch_app",
      label: "Registrar humedad",
    };
  }

  if (val <= TARGET_HUMIDITY) {
    return {
      color: "var(--success)",
      icon: "check_circle",
      label: "Secado completo",
    };
  }

  if (val <= 8.5) {
    return {
      color: "#f59e0b",
      icon: "warning",
      label: "Cerca del objetivo",
    };
  }

  return {
    color: "#2563eb",
    icon: "water_drop",
    label: "Secado en progreso",
  };
};

const getDryingStatus = (humidity) => {
  const hStatus = getHumidityStatus(humidity);

  return humidity !== null
    ? hStatus
    : {
      color: "var(--muted)",
      icon: "schedule",
      label: "Sin datos",
    };
};

const normalizeMethod = (method) => {
  if (!method) return "Solar";

  const m = String(method).toLowerCase();

  if (m === "solar") return "Solar";
  if (m === "marquesina") return "Marquesina";
  if (m === "mecánico" || m === "mecanico") return "Mecánico";

  return "Solar";
};

const Secado = ({ goBack, activeLot, showToast }) => {
  const [selectedDay, setSelectedDay] = useState(1);
  const [dayLog, setDayLog] = useState(null);
  const [summary, setSummary] = useState([]);
  const [humidity, setHumidity] = useState("");
  const [temperature, setTemperature] = useState("");
  const [saving, setSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [dryingMethod, setDryingMethod] = useState("Solar");

  const isCurrentDaySaved = !!dayLog;

  const loadDay = useCallback(async () => {
    if (!activeLot) return;

    const data = await getDryingDay(activeLot.id, selectedDay);

    setDayLog(data);
    setHumidity(data?.humidity_pct != null ? String(data.humidity_pct) : "");
    setTemperature(
      data?.temperature_c != null ? String(data.temperature_c) : ""
    );
    setDryingMethod(normalizeMethod(data?.method));
  }, [activeLot, selectedDay]);

  const loadSummary = useCallback(async () => {
    if (!activeLot) return;
    setSummary(await getDryingSummary(activeLot.id));
  }, [activeLot]);

  useEffect(() => {
    loadDay();
  }, [loadDay]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

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

  const handleSave = async () => {
    if (isCurrentDaySaved) {
      showToast("Ese día ya fue registrado");
      return;
    }

    if (!humidity.trim()) {
      showToast("Ingresa humedad");
      return;
    }

    const h = parseFloat(humidity);
    const t = temperature.trim() ? parseFloat(temperature) : null;

    if (isNaN(h)) {
      showToast("Humedad inválida");
      return;
    }

    setSaving(true);

    const { data, error } = await saveDryingLog(
      activeLot.id,
      selectedDay,
      h,
      t,
      dryingMethod.toLowerCase()
    );

    setSaving(false);

    if (error) {
      showToast("Error al guardar");
      return;
    }

    setDayLog(data);
    loadSummary();
    showToast("✓ Registro guardado");
    goNextDay();
  };

  if (!activeLot) {
    return (
      <div className="page-enter">
        <div className="page-header px">
          <button className="header-icon-btn" onClick={goBack}>
            <Icon name="arrow_back_ios" />
          </button>

          <div className="page-title">Secado</div>
        </div>

        <div className="page-scroll px">No hay lote activo.</div>
      </div>
    );
  }

  const currentHumidity = dayLog?.humidity_pct ?? null;
  const status = getHumidityStatus(currentHumidity);
  const progress = getDryingProgress(summary);
  const completed = isDryingComplete(summary);

  const registeredDays = summary.length;
  const lastHumidity =
    summary.length > 0 ? summary[summary.length - 1]?.humidity_pct : null;

  const methods = ["Solar", "Marquesina", "Mecánico"];

  return (
    <div
      className="page-enter"
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        overflow: "hidden",
      }}
    >
      <div
        className="page-header px"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <button className="header-icon-btn" onClick={goBack}>
          <Icon name="arrow_back_ios" />
        </button>

        <div style={{ flex: 1, textAlign: "center" }}>
          <div className="page-title">Secado</div>
          <div className="lot-label">Lote #{activeLot.lot_code}</div>
        </div>

        <button
          className="header-icon-btn"
          onClick={() => setShowHistory(true)}
        >
          <Icon name="schedule" />
        </button>
      </div>

      <div className="page-scroll px">
        {/* resumen superior */}
        <div
          style={{
            background: "white",
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: 16,
            marginBottom: 18,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 92,
              height: 92,
              borderRadius: "50%",
              border: "6px solid var(--bg-2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 18,
            }}
          >
            {progress}%
          </div>

          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              Rangos
            </div>

            <div style={{ fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: "var(--success)" }}>●</span> Óptimo
              <span style={{ float: "right", color: "var(--success)" }}>
                ≤ 7%
              </span>
            </div>

            <div style={{ fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: "#f59e0b" }}>●</span> Aceptable
              <span style={{ float: "right", color: "#f59e0b" }}>
                7–10%
              </span>
            </div>

            <div style={{ fontSize: 12 }}>
              <span style={{ color: "#ef4444" }}>●</span> Alto
              <span style={{ float: "right", color: "#ef4444" }}>
                &gt; 10%
              </span>
            </div>
          </div>
        </div>

        {/* selector día */}
        <div className="mb-6">
          <div className="field-label">Día de secado</div>

          <div
            style={{
              display: "flex",
              gap: 8,
              overflowX: "auto",
              paddingBottom: 4,
            }}
          >
            {Array.from({ length: TOTAL_DAYS }, (_, i) => {
              const d = i + 1;

              return (
                <button
                  key={d}
                  onClick={() => {
                    if (d !== currentAvailableDay) {
                      showToast(
                        "Los días anteriores solo se consultan desde historial"
                      );
                      return;
                    }

                    setSelectedDay(d);
                  }}
                  style={{
                    minWidth: 42,
                    height: 42,
                    borderRadius: "50%",
                    border: "none",
                    fontWeight: 700,
                    background:
                      selectedDay === d
                        ? "var(--primary)"
                        : "var(--bg-2)",
                    color:
                      selectedDay === d ? "white" : "var(--text)",
                  }}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>

        {/* método */}
        <div style={{ marginBottom: 18 }}>
          <div className="field-label">Método de secado</div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 8,
            }}
          >
            {methods.map((method) => (
              <button
                key={method}
                onClick={() => setDryingMethod(method)}
                style={{
                  background: "white",
                  border:
                    dryingMethod === method
                      ? "1.5px solid var(--primary)"
                      : "1px solid var(--border)",
                  borderRadius: 12,
                  padding: "12px 8px",
                  fontWeight: 700,
                  fontSize: 12,
                  opacity: isCurrentDaySaved ? 0.5 : 1,
                  cursor: isCurrentDaySaved ? "not-allowed" : "pointer",
                }}
              >
                {method}
              </button>
            ))}
          </div>
        </div>

        {/* mediciones */}
        <div style={{ marginBottom: 18 }}>
          <div className="field-label">
            Mediciones del día {selectedDay}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
            }}
          >
            <div
              style={{
                background: "white",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: 12,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                💧 HUMEDAD
              </div>

              <input
                type="number"
                step="0.1"
                min={0}
                max={MAX_HUMIDITY}
                value={humidity}
                disabled={isCurrentDaySaved}
                onChange={(e) => setHumidity(e.target.value)}
                placeholder="Ej: 12.5"
                style={{
                  width: "100%",
                  border: "none",
                  outline: "none",
                  fontSize: 26,
                  fontWeight: 700,
                  background: "transparent",
                }}
              />

              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                %
              </div>
            </div>

            <div
              style={{
                background: "white",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: 12,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                🌡 TEMPERATURA
              </div>

              <input
                type="number"
                step="0.1"
                value={temperature}
                disabled={isCurrentDaySaved}
                onChange={(e) => setTemperature(e.target.value)}
                placeholder="Ej: 35"
                style={{
                  width: "100%",
                  border: "none",
                  outline: "none",
                  fontSize: 26,
                  fontWeight: 700,
                  background: "transparent",
                }}
              />

              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                °C
              </div>
            </div>
          </div>
        </div>

        {/* resumen inferior */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginBottom: 18,
          }}
        >
          <div
            style={{
              background: "white",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: 12,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              DÍAS REGISTRADOS
            </div>

            <div style={{ fontSize: 18, fontWeight: 800 }}>
              {registeredDays}
            </div>

            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              de {TOTAL_DAYS}
            </div>
          </div>

          <div
            style={{
              background: "white",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: 12,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              ÚLTIMA HUMEDAD
            </div>

            <div style={{ fontSize: 18, fontWeight: 800 }}>
              {lastHumidity != null ? `${lastHumidity}%` : "—"}
            </div>

            <div
              style={{
                fontSize: 12,
                color: status.color,
                marginTop: 4,
              }}
            >
              <Icon name={status.icon} style={{ fontSize: 13 }} />{" "}
              {status.label}
            </div>
          </div>
        </div>

        {/* fotos */}
        <PhotoGallery
          lotId={activeLot.id}
          etapa="secado"
          day={selectedDay}
          editable={!summary.some((s) => s.day_number === selectedDay)}
          showToast={showToast}
        />
        <div style={{ height: 100 }} />
      </div>

      {/* botón inferior */}
      <div
        style={{
          position: "sticky",
          bottom: 0,
          background: "var(--bg)",
          padding: 12,
        }}
      >
        <button
          className="primary-btn"
          onClick={handleSave}
          disabled={saving || isCurrentDaySaved}
        >
          {isCurrentDaySaved
            ? `Día ${selectedDay} registrado`
            : saving
              ? "Guardando..."
              : `Guardar dia ${selectedDay}`}
        </button>
      </div>

      {/* historial */}
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
          <div
            className="modal-sheet"
            style={{
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <div className="modal-handle" />
            <div className="modal-title">Historial de Secado</div>

            {summary.length === 0 ? (
              <div
                style={{
                  padding: 20,
                  textAlign: "center",
                  color: "var(--muted)",
                }}
              >
                No hay registros aún
              </div>

            ) : (
              <div style={{ paddingBottom: 20 }}>
                {summary.map((log) => {
                  const s = getDryingStatus(log.humidity_pct);

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
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 14,
                          }}
                        >
                          Día {log.day_number}
                        </div>

                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: s.color,
                          }}
                        >
                          {log.humidity_pct != null
                            ? `${log.humidity_pct}%`
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
                        <Icon
                          name={s.icon}
                          style={{
                            fontSize: 13,
                            color: s.color,
                          }}
                        />{" "}
                        {s.label}

                        {log.method && (
                          <>
                            <span style={{ marginLeft: 8 }}>•</span>
                            <Icon name="grid_view" style={{ fontSize: 13 }} />{" "}
                            {normalizeMethod(log.method)}
                          </>
                        )}

                        {log.temperature_c !== null && (
                          <>
                            <span style={{ marginLeft: 8 }}>•</span>
                            <Icon
                              name="thermostat"
                              style={{ fontSize: 13 }}
                            />{" "}
                            {log.temperature_c}°C
                          </>
                        )}
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
    </div>
  );
};

export default Secado;