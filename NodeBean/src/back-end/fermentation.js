import { supabase } from "./supabaseClient";

const TOTAL_DAYS = 6;
const MAX_TURNS = 1;

const dayAllowsVolteo = (day) => day >= 2 && day <= TOTAL_DAYS;

export const getFermentationDay = async (lotId, dayNumber) => {
  const { data } = await supabase
    .from("fermentation_logs")
    .select("*")
    .eq("lot_id", lotId)
    .eq("day_number", dayNumber)
    .maybeSingle();

  return data;
};

export const getFermentationSummary = async (lotId) => {
  const { data } = await supabase
    .from("fermentation_logs")
    .select("*")
    .eq("lot_id", lotId)
    .order("day_number");

  return data || [];
};

export const registerTurn = async (lotId, dayNumber, currentLog) => {
  if (!dayAllowsVolteo(dayNumber)) {
    return {
      data: null,
      error: { message: "Día 1 es fase anaerobia — sin volteo" },
    };
  }

  if ((currentLog?.turns_count || 0) >= MAX_TURNS) {
    return {
      data: null,
      error: { message: "Volteo del día ya registrado" },
    };
  }

  const { data, error } = await supabase
    .from("fermentation_logs")
    .upsert(
      {
        lot_id: lotId,
        day_number: dayNumber,
        turns_count: 1,
        last_turn_at: new Date().toISOString(),
        temperature_c: currentLog?.temperature_c ?? null,
      },
      {
        onConflict: "lot_id,day_number",
      }
    )
    .select()
    .single();

  return { data, error };
};

export const saveTemperature = async (lotId, dayNumber, temperature_c) => {
  const existing = await getFermentationDay(lotId, dayNumber);

  const { data, error } = await supabase
    .from("fermentation_logs")
    .upsert(
      {
        lot_id: lotId,
        day_number: dayNumber,
        temperature_c,
        turns_count: existing?.turns_count ?? 0,
        last_turn_at: existing?.last_turn_at ?? null,
      },
      {
        onConflict: "lot_id,day_number",
      }
    )
    .select()
    .single();

  return { data, error };
};