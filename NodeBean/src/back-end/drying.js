// ─── SECADO ────────────────────────────────────────────────────────────────────
// Logs diarios del proceso de secado del cacao.

import { supabase } from "./supabaseClient";

/** Carga el log de un día específico de secado */
export const getDryingDay = async (lotId, dayNumber) => {
  const { data } = await supabase
    .from("drying_logs")
    .select("*")
    .eq("lot_id", lotId)
    .eq("day_number", dayNumber)
    .maybeSingle();
  return data;
};

/** Carga todos los logs de secado de un lote */
export const getDryingSummary = async (lotId) => {
  const { data } = await supabase
    .from("drying_logs")
    .select("*")
    .eq("lot_id", lotId)
    .order("day_number");
  return data || [];
};

/** Guarda o actualiza el log del día de secado */
export const saveDryingDay = async (lotId, dayNumber, { temperature_c, humidity_pct, method }) => {
  const { data, error } = await supabase
    .from("drying_logs")
    .upsert({
      lot_id: lotId,
      day_number: dayNumber,
      temperature_c: parseFloat(temperature_c) || null,
      humidity_pct: parseFloat(humidity_pct),
      method,
      recorded_at: new Date().toISOString(),
    }, { onConflict: "lot_id,day_number" })
    .select()
    .single();
  return { data, error };
};
