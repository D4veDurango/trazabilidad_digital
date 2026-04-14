// ─── APP 
import { useState, useEffect } from "react";

import IonicStyles from "./front-end/styles/IonicStyles";
import { BottomNav, Toast } from "./front-end/components/SharedComponents";

import LoginScreen   from "./front-end/screens/LoginScreen";
import Panel         from "./front-end/screens/Panel";
import Fermentacion  from "./front-end/screens/Fermentacion";
import Secado        from "./front-end/screens/Secado";
import Inventario    from "./front-end/screens/Inventario";
import Registro      from "./front-end/screens/Registro";
import Parcelas      from "./front-end/screens/Parcelas";
import Trazabilidad  from "./front-end/screens/Trazabilidad";

import { getSession, onSessionChange, registerDeepLinkListener } from "./back-end/auth";
import { getOrCreateProfile, getLots } from "./back-end/lots";

export default function App() {
  const [session, setSession] = useState(undefined);
  const [profile, setProfile] = useState(null);
  const [lots,    setLots]    = useState([]);
  const [page,    setPage]    = useState("panel");
  const [toast,   setToast]   = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  // Detectar si es nativo
  const isNative = !!(window.Capacitor?.isNativePlatform?.());

  // Marcar body como nativo para CSS full-screen
  useEffect(() => {
    if (isNative) {
      document.body.classList.add("is-native");
      let meta = document.querySelector('meta[name="viewport"]');
      if (!meta) {
        meta = document.createElement("meta");
        meta.name = "viewport";
        document.head.appendChild(meta);
      }
      meta.content = "width=device-width, initial-scale=1.0, viewport-fit=cover";
    }
    return () => document.body.classList.remove("is-native");
  }, []);

  // Sesión inicial + listeners de auth
  useEffect(() => {
    getSession().then(({ data: { session } }) => setSession(session));
    const unsubAuth     = onSessionChange(setSession);
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

  const navigate  = (p) => setPage(p);
  const goBack    = () => setPage("panel");
  const activeLot = lots.find((l) => l.status === "fermentacion") || lots[0];

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
            <span style={{ color: "var(--muted)", fontSize: 14, fontFamily: "var(--font-body)" }}>
              Iniciando...
            </span>
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
        {/* Sin StatusBar en login — el safe-area del app-shell ya da el espacio */}
        <div className="app-shell">
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
        {/* StatusBar simulada SOLO en desktop/web, nunca en móvil ni nativo */}
        {!isNative && window.innerWidth > 520 && (
          <div className="status-bar">
            <span>{new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}</span>
            <div className="status-icons">
              <span className="material-icons" style={{ fontSize: 14 }}>signal_cellular_alt</span>
              <span className="material-icons" style={{ fontSize: 14 }}>wifi</span>
              <span className="material-icons" style={{ fontSize: 14 }}>battery_full</span>
            </div>
          </div>
        )}
        {pages[page]}
        <BottomNav active={page} onChange={navigate} />
        <Toast message={toast} />
      </div>
    </>
  );
}