import { supabase } from "./supabaseClient";

const TOTAL_DAYS = 15;
const TARGET_HUMIDITY = 7;

export const getDryingDay = async (lotId, dayNumber) => {
  const { data } = await supabase
    .from("drying_logs")
    .select("*")
    .eq("lot_id", lotId)
    .eq("day_number", dayNumber)
    .maybeSingle();

  return data;
};

export const getDryingSummary = async (lotId) => {
  const { data } = await supabase
    .from("drying_logs")
    .select("*")
    .eq("lot_id", lotId)
    .order("day_number");

  return data || [];
};

export const saveDryingLog = async (
  lotId,
  dayNumber,
  humidity_pct,
  temperature_c,
  method = "solar"
) => {
  const { data, error } = await supabase
    .from("drying_logs")
    .upsert(
      {
        lot_id: lotId,
        day_number: dayNumber,
        humidity_pct,
        temperature_c,
        method,
      },
      {
        onConflict: "lot_id,day_number",
      }
    )
    .select()
    .single();

  return { data, error };
};

export const isDryingComplete = (summary) => {
  if (!summary?.length) return false;

  const last = summary[summary.length - 1];

  return last?.humidity_pct <= TARGET_HUMIDITY;
};

export const getDryingProgress = (summary) => {
  if (!summary?.length) return 0;

  const last = summary[summary.length - 1];
  const current = Number(last?.humidity_pct || 0);

  const pct = Math.round(((16 - current) / (16 - TARGET_HUMIDITY)) * 100);

  return Math.max(0, Math.min(100, pct));
};