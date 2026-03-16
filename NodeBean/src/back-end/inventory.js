// ─── INVENTARIO ────────────────────────────────────────────────────────────────
// CRUD de inventario final y generación de clave de trazabilidad / QR.

import { supabase } from "./supabaseClient";

// ⚠️ CAMBIA ESTA URL por donde está desplegada tu app (Vercel, Netlify, etc.)
// En Capacitor, window.location.origin devuelve "capacitor://localhost" (no sirve).
const APP_PUBLIC_URL = (() => {
  const origin = window.location.origin;
  if (origin.startsWith("capacitor://") || origin === "http://localhost") {
    return "https://TU-APP.vercel.app"; // ← CAMBIA ESTO
  }
  return origin;
})();

/** Carga el inventario de un lote */
export const getInventory = async (lotId) => {
  const { data } = await supabase
    .from("inventory")
    .select("*")
    .eq("lot_id", lotId)
    .maybeSingle();
  return data;
};

/** Guarda o actualiza el inventario y genera la clave de trazabilidad */
export const saveInventory = async (lotId, payload, lotInfo) => {
  const key = `${new Date().getFullYear()}-${lotInfo.variety}-${lotInfo.producerId}-${lotInfo.lotCode}`;
  const { data, error } = await supabase
    .from("inventory")
    .upsert({ lot_id: lotId, ...payload, traceability_key: key, ready_to_sell: true, registered_at: new Date().toISOString() }, { onConflict: "lot_id" })
    .select()
    .single();
  return { data, error, key };
};

/** Genera la URL pública y la URL del QR a partir de la clave */
export const buildQrData = (key) => {
  const pageUrl = `${APP_PUBLIC_URL}?key=${encodeURIComponent(key)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pageUrl)}&color=1a1208&bgcolor=ffffff&margin=12`;
  return { pageUrl, qrUrl };
};
