// ─── APP 
// Solo importa, ensambla y gestiona el estado global de sesión y navegación.
// La lógica de datos está en /back-end, los componentes en /front-end.

import { useState, useEffect } from "react";

// Estilos
import IonicStyles from "./front-end/styles/IonicStyles";

// Componentes compartidos
import { StatusBar, BottomNav, Toast } from "./front-end/components/SharedComponents";

// Pantallas
import LoginScreen   from "./front-end/screens/LoginScreen";
import Panel         from "./front-end/screens/Panel";
import Fermentacion  from "./front-end/screens/Fermentacion";
import Secado        from "./front-end/screens/Secado";
import Inventario    from "./front-end/screens/Inventario";
import Registro      from "./front-end/screens/Registro";
import Parcelas      from "./front-end/screens/Parcelas";
import Trazabilidad  from "./front-end/screens/Trazabilidad";

// Backend
import { getSession, onSessionChange, registerDeepLinkListener } from "./back-end/auth";
import { getOrCreateProfile, getLots } from "./back-end/lots";

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = cargando
  const [profile, setProfile] = useState(null);
  const [lots,    setLots]    = useState([]);
  const [page,    setPage]    = useState("panel");
  const [toast,   setToast]   = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  // Marcar body como nativo para CSS full-screen
  useEffect(() => {
    const isNative = !!(window.Capacitor?.isNativePlatform?.());
    if (isNative) {
      document.body.classList.add("is-native");
      let meta = document.querySelector('meta[name="viewport"]');
      if (!meta) { meta = document.createElement("meta"); meta.name = "viewport"; document.head.appendChild(meta); }
      meta.content = "width=device-width, initial-scale=1.0, viewport-fit=cover";
    }
    return () => document.body.classList.remove("is-native");
  }, []);

  // Sesión inicial + listeners de auth
  useEffect(() => {
    getSession().then(({ data: { session } }) => setSession(session));
    const unsubAuth    = onSessionChange(setSession);
    const unsubDeepLink = registerDeepLinkListener(setSession);
    return () => { unsubAuth(); unsubDeepLink(); };
  }, []);

  // Cargar perfil y lotes cuando hay sesión
  useEffect(() => {
    if (!session) { setProfile(null); setLots([]); return; }
    const { id, user_metadata } = session.user;
    getOrCreateProfile(id, user_metadata).then(setProfile);
    getLots(id).then(setLots);
  }, [session]);

  const navigate   = (p) => setPage(p);
  const goBack     = () => setPage("panel");
  const activeLot  = lots.find((l) => l.status === "fermentacion") || lots[0];
  const isNative   = !!(window.Capacitor?.isNativePlatform?.());

  // Carta pública: no necesita login
  if (window.location.search.includes("key=")) return <Trazabilidad />;

  // Cargando sesión
  if (session === undefined) {
    return (
      <>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <IonicStyles />
        <div className="app-shell">
          <div className="loading-screen">
            <div className="login-logo">🍫</div>
            <div className="spinner" />
            <span style={{ color: "var(--muted)", fontSize: 14 }}>Iniciando...</span>
          </div>
        </div>
      </>
    );
  }

  // Login
  if (!session) {
    return (
      <>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <IonicStyles />
        <div className="app-shell">
          {!isNative && <StatusBar />}
          <LoginScreen />
        </div>
      </>
    );
  }

  // App principal
  const pages = {
    panel:        <Panel        navigate={navigate} profile={profile} lots={lots} />,
    fermentacion: <Fermentacion goBack={goBack} activeLot={activeLot} showToast={showToast} />,
    secado:       <Secado       goBack={goBack} activeLot={activeLot} showToast={showToast} />,
    inventario:   <Inventario   goBack={goBack} activeLot={activeLot} profile={profile} showToast={showToast} />,
    parcelas:     <Parcelas     userId={session.user.id} showToast={showToast} />,
    registro:     <Registro     goBack={goBack} navigate={navigate} userId={session.user.id} showToast={showToast} onLotCreated={(newLot) => setLots((prev) => [newLot, ...prev])} />,
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      <IonicStyles />
      <div className="app-shell">
        {!isNative && <StatusBar />}
        {pages[page]}
        <BottomNav active={page} onChange={navigate} />
        <Toast message={toast} />
      </div>
    </>
  );
}
