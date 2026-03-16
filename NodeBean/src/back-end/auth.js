// ─── AUTENTICACIÓN ─────────────────────────────────────────────────────────────
// Maneja login con Google OAuth, deep links de Capacitor y sesión de Supabase.

import { supabase } from "./supabaseClient";
import { Browser } from "@capacitor/browser";
import { App as CapApp } from "@capacitor/app";

const isNative = !!(window.Capacitor?.isNativePlatform?.());

/** Inicia sesión con Google según plataforma (web o nativa) */
export const loginWithGoogle = async () => {
  if (isNative) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "com.trazabilidad.app://login-callback",
        skipBrowserRedirect: true,
      },
    });
    if (error) throw error;
    if (data?.url) await Browser.open({ url: data.url });
  } else {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
  }
};

/** Cierra sesión */
export const logout = () => supabase.auth.signOut();

/** Obtiene la sesión actual */
export const getSession = () => supabase.auth.getSession();

/** Escucha cambios de sesión. Retorna la función para desuscribirse. */
export const onSessionChange = (callback) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION") return;
    callback(session);
  });
  return () => subscription.unsubscribe();
};

/** Registra listener de deep links para OAuth en Android/iOS */
export const registerDeepLinkListener = (onSession) => {
  const listenerPromise = CapApp.addListener("appUrlOpen", async ({ url }) => {
    if (!url.startsWith("com.trazabilidad.app://")) return;
    try {
      await Browser.close();
      const urlObj = new URL(url.replace("com.trazabilidad.app://", "https://x.com/"));
      const code = urlObj.searchParams.get("code");
      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error && data?.session) onSession(data.session);
      } else {
        const { data } = await supabase.auth.getSession();
        if (data?.session) onSession(data.session);
      }
    } catch (e) {
      console.error("Error en deep link:", e);
    }
  });
  return () => listenerPromise.then((l) => l.remove()).catch(() => {});
};
