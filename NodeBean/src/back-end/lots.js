// ─── LOTES Y PERFIL ────────────────────────────────────────────────────────────
// CRUD de lotes de cacao y perfil del agricultor.

import { supabase } from "./supabaseClient";

/** Carga o crea el perfil del usuario */
export const getOrCreateProfile = async (userId, userMeta) => {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (data) return data;

  const { data: newProfile } = await supabase
    .from("profiles")
    .insert({
      id: userId,
      full_name: userMeta?.full_name || "Agricultor",
      avatar_url: userMeta?.avatar_url || null,
      producer_id: "URB-" + Math.floor(Math.random() * 9999 + 1).toString().padStart(4, "0"),
    })
    .select()
    .single();

  return newProfile;
};

/** Carga los lotes del agricultor ordenados por fecha */
export const getLots = async (farmerId) => {
  const { data } = await supabase
    .from("lots")
    .select("*")
    .eq("farmer_id", farmerId)
    .order("created_at", { ascending: false });
  return data || [];
};

/** Crea un nuevo lote */
export const createLot = async (lotData) => {
  const lotCode = `${new Date().getFullYear()}-${Math.floor(Math.random() * 900 + 100)}`;
  const { data, error } = await supabase
    .from("lots")
    .insert({ ...lotData, lot_code: lotCode, status: "fermentacion" })
    .select()
    .single();
  return { data, error };
};

/** Actualiza el estado de un lote */
export const updateLotStatus = async (lotId, status) => {
  await supabase.from("lots").update({ status }).eq("id", lotId);
};
