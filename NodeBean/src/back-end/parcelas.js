// ─── PARCELAS ──────────────────────────────────────────────────────────────────
// CRUD de parcelas / terrenos de la finca.

import { supabase } from "./supabaseClient";

/** Carga todas las parcelas del agricultor */
export const getParcelas = async (farmerId) => {
  const { data } = await supabase
    .from("parcelas")
    .select("*")
    .eq("farmer_id", farmerId)
    .order("created_at", { ascending: false });
  return data || [];
};

/** Crea una nueva parcela */
export const createParcela = async (farmerId, { nombre, hectareas, num_arboles }) => {
  const { data, error } = await supabase
    .from("parcelas")
    .insert({ farmer_id: farmerId, nombre: nombre.trim(), hectareas: parseFloat(hectareas), num_arboles: parseInt(num_arboles) })
    .select()
    .single();
  return { data, error };
};

/** Elimina una parcela por ID */
export const deleteParcela = async (id) => {
  await supabase.from("parcelas").delete().eq("id", id);
};
