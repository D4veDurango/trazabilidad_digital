// ─── COMPONENTES COMPARTIDOS ───────────────────────────────────────────────────

// Ícono de Material Icons
export const Icon = ({ name, style, className }) => (
  <span className={`material-icons${className ? " " + className : ""}`} style={style}>
    {name}
  </span>
);

// Toast de notificación temporal
export const Toast = ({ message }) => (
  <div className={`toast${message ? " show" : ""}`}>{message}</div>
);

// StatusBar — ya no se usa directamente, queda aquí por compatibilidad
// pero App.jsx la renderiza solo en desktop
export const StatusBar = () => {
  const time = new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
  return (
    <div className="status-bar">
      <span>{time}</span>
      <div className="status-icons">
        <Icon name="signal_cellular_alt" style={{ fontSize: 14 }} />
        <Icon name="wifi" style={{ fontSize: 14 }} />
        <Icon name="battery_full" style={{ fontSize: 14 }} />
      </div>
    </div>
  );
};

// Barra de navegación flotante inferior
export const BottomNav = ({ active, onChange }) => {
  const tabs = [
    { id: "panel",        icon: "dashboard",   label: "Inicio"   },
    { id: "fermentacion", icon: "inventory_2", label: "Proceso"  },
    { id: "secado",       icon: "wb_sunny",    label: "Secado"   },
    { id: "inventario",   icon: "analytics",   label: "Almacén"  },
    { id: "registro",     icon: "agriculture", label: "Registro" },
    { id: "parcelas",     icon: "grid_view",   label: "Parcelas" },
  ];
  return (
    <nav className="bottom-nav">
      {tabs.map((t) => (
        <button
          key={t.id}
          className={`nav-btn${active === t.id ? " active" : ""}`}
          onClick={() => onChange(t.id)}
        >
          <Icon name={t.icon} className="icon" />
          {t.label}
        </button>
      ))}
    </nav>
  );
};