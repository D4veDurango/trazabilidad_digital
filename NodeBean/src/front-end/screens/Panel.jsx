// ─── PANEL (INICIO) ────────────────────────────────────────────────────────────
import { supabase } from "../../back-end/supabaseClient";
import { Icon } from "../components/SharedComponents";

// Calcula el progreso del lote según su status
const calculateProgress = (lot) => {
  if (!lot) return 0;
  switch (lot.status) {
    case "cosecha": return 15;
    case "fermentacion": return 35;
    case "secado": return 65;
    case "limpieza": return 80;
    case "almacenamiento": return 95;
    case "vendido": return 100;
    default: return 10;
  }
};

// Obtiene la etapa legible del status
const getStageStatus = (status) => {
  switch (status) {
    case "cosecha": return "Registrar";
    case "fermentacion": return "Proceso";
    case "secado": return "Humedad y temp";
    case "limpieza": return "Clasificación";
    case "almacenamiento": return "Embolsado";
    case "vendido": return "Vendido";
    default: return "Pendiente";
  }
};

// Mapeo de días de fermentación por variedad (estándar Urabá)
// CCN51, ICS39, TSH565 = 6 días | ICS95 = 5 días
const FERMENTATION_DAYS = {
  'CCN51': 6,
  'ICS95': 5,
  'ICS39': 6,
  'TSH565': 6,
  'default': 6
};

const Panel = ({ navigate, profile, lots }) => {
  const activeLot = lots.find((l) => l.status !== "vendido") || lots[0];
  const progressPct = calculateProgress(activeLot);
  const stages = [
    { id: "registro", icon: "🌾", name: "Cosecha", status: "Registrar" },
    { id: "fermentacion", icon: "⚗️", name: "Fermentación", status: "Proceso" },
    { id: "secado", icon: "☀️", name: "Secado", status: "Humedad y temp" },
    { id: "inventario", icon: "🏭", name: "Almacenamiento", status: "Embolsado" },
  ];

// Determina la etapa activa según el status del lote actual
  // IMPORTANTE: el ID debe coincidir con las claves en App.jsx pages object
  const activeStageKey = activeLot
    ? activeLot.status === "cosecha" ? "registro"
      : activeLot.status === "fermentacion" ? "fermentacion"
        : activeLot.status === "secado" ? "secado"
          : activeLot.status === "limpieza" || activeLot.status === "almacenamiento" ? "inventario"
            : activeLot.status === "vendido" ? "inventario"
              : "fermentacion"
    : "registro";

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      {/* Header */}
      <div className="screen-header px">
        <div className="farmer-info">
          <div className="avatar">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name}
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
              />
            ) : null}
            <div className="avatar-placeholder" style={{ display: profile?.avatar_url ? "none" : "flex" }}>
              {(profile?.full_name || "?")[0].toUpperCase()}
            </div>
          </div>
          <div>
            <div className="farmer-name">{profile?.full_name || "Agricultor"}</div>
            <div className="farmer-loc">
              <Icon name="location_on" style={{ fontSize: 12 }} />
              {profile?.region || "Urabá, Antioquia"}
            </div>
          </div>
        </div>
        <button className="header-icon-btn" onClick={() => supabase.auth.signOut()}>
          <Icon name="logout" />
        </button>
      </div>

      {/* Contenido */}
      <div className="page-scroll px">
        <div className="mb-6">
          <button className="primary-btn" onClick={() => navigate("registro")}>
            <Icon name="add_circle_outline" /> Registrar nuevo lote
          </button>
        </div>

        <div className="mb-6">
          <div className="section-title">Actividad reciente</div>
          {activeLot ? (
            <div className="active-lot-card" onClick={() => navigate(activeStageKey)}>
              <div className="ring-progress">
                <svg viewBox="0 0 52 52" width="52" height="52">
                  <circle cx="26" cy="26" r="22" fill="none" stroke="#ede9e4" strokeWidth="5" />
                  <circle cx="26" cy="26" r="22" fill="none" stroke="var(--primary)" strokeWidth="5"
                    strokeDasharray={`${2 * Math.PI * 22 * (progressPct / 100)} ${2 * Math.PI * 22}`} strokeLinecap="round" />
                </svg>
                <div className="ring-text">{progressPct}%</div>
              </div>
              <div className="lot-badge">Lote #{activeLot.lot_code}</div>
              <div className="lot-title">
                Etapa de {activeLot.status.charAt(0).toUpperCase() + activeLot.status.slice(1)}
              </div>
              <div className="lot-desc">Variedad: {activeLot.variety} · {activeLot.parcel_name}</div>
              <div className="lot-chips">
                <div className="chip"><Icon name="scale" style={{ fontSize: 14 }} /> {activeLot.weight_kg} kg</div>
                <div className="chip"><Icon name="calendar_today" style={{ fontSize: 14 }} /> {new Date(activeLot.harvest_date).toLocaleDateString("es-CO")}</div>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🌱</div>
              <div className="empty-state-text">No hay lotes activos aún.<br />¡Registra tu primera cosecha!</div>
            </div>
          )}
        </div>

        <div className="mb-4">
          <div className="section-title">Etapas de trazabilidad</div>
          <div className="grid-2">
            {stages.map((s, i) => (
              <div key={i} className={`stage-card${s.id === activeStageKey ? " active-stage" : ""}`} onClick={() => navigate(s.id)}>
                <div className="stage-icon">{s.icon}</div>
                <div className="stage-name">{s.name}</div>
                <div className="stage-status">{s.status}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Panel;
