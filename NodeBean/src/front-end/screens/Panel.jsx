// ─── PANEL (INICIO) ────────────────────────────────────────────────────────────
import { supabase } from "../../back-end/supabaseClient";
import { Icon } from "../components/SharedComponents";

const Panel = ({ navigate, profile, lots }) => {
  const activeLot = lots.find((l) => l.status === "fermentacion") || lots[0];
  const stages = [
    { id: "registro",     icon: "🌾", name: "Cosecha",        status: "Registrar"     },
    { id: "registro",     icon: "📦", name: "Desgrane",       status: "Pendiente"     },
    { id: "fermentacion", icon: "⚗️", name: "Fermentación",   status: "EN PROGRESO", active: true },
    { id: "panel",        icon: "☀️", name: "Secado",         status: "Próxima etapa" },
    { id: "inventario",   icon: "🏭", name: "Almacenamiento", status: "Embolsado"     },
  ];

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
            <div className="active-lot-card" onClick={() => navigate("fermentacion")}>
              <div className="ring-progress">
                <svg viewBox="0 0 52 52" width="52" height="52">
                  <circle cx="26" cy="26" r="22" fill="none" stroke="#ede9e4" strokeWidth="5" />
                  <circle cx="26" cy="26" r="22" fill="none" stroke="var(--primary)" strokeWidth="5"
                    strokeDasharray={`${2 * Math.PI * 22 * 0.65} ${2 * Math.PI * 22}`} strokeLinecap="round" />
                </svg>
                <div className="ring-text">65%</div>
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
              <div key={i} className={`stage-card${s.active ? " active-stage" : ""}`} onClick={() => navigate(s.id)}>
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
