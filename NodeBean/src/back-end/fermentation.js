// ─── FERMENTACIÓN ──────────────────────────────────────────────────────────────
// Logs diarios del proceso de fermentación del cacao.

import { supabase } from "./supabaseClient";

/** Carga el log de un día específico */
export const getFermentationDay = async (lotId, dayNumber) => {
  const { data } = await supabase
    .from("fermentation_logs")
    .select("*")
    .eq("lot_id", lotId)
    .eq("day_number", dayNumber)
    .maybeSingle();
  return data;
};

/** Registra un giro (volteo) en el día indicado */
export const registerTurn = async (lotId, dayNumber, currentLog) => {
  const newTurns = (currentLog?.turns_count || 0) + 1;
  const { data, error } = await supabase
    .from("fermentation_logs")
    .upsert({
      lot_id: lotId,
      day_number: dayNumber,
      turns_count: newTurns,
      last_turn_at: new Date().toISOString(),
      temperature_c: currentLog?.temperature_c || null,
    }, { onConflict: "lot_id,day_number" })
    .select()
    .single();
  if (error) console.error("registerTurn:", error);
  return { data, error };
};

export const saveTemperature = async (lotId, day, temperature_c) => {
  const existing = await getFermentationDay(lotId, day);
  const { data, error } = await supabase
    .from("fermentation_logs")
    .upsert({
      lot_id: lotId,
      day_number: day,
      temperature_c,
      turns_count: existing?.turns_count || 0,
      last_turn_at: existing?.last_turn_at || null,
    }, { onConflict: "lot_id,day_number" })
    .select()
    .single();
  if (error) console.error("saveTemperature:", error);
  return { data, error };
};