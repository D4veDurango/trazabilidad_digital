// ─── FOTOS ─────────────────────────────────────────────────────────────────────
// Subida, eliminación y consulta de fotos del proceso en Supabase Storage.

import { supabase } from "./supabaseClient";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";

const isNative = !!(window.Capacitor?.isNativePlatform?.());

/** Obtiene las fotos de un lote en una etapa específica */
export const getPhotos = async (lotId, stage) => {
  const { data } = await supabase
    .from("lot_photos")
    .select("*")
    .eq("lot_id", lotId)
    .eq("stage", stage)
    .order("created_at");
  return data || [];
};

/** Abre cámara/galería y retorna { base64, mimeType } o null si el usuario cancela */
export const pickImage = async () => {
  if (isNative) {
    const image = await Camera.getPhoto({
      quality: 75,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Prompt,
    });
    return { base64: image.base64String, mimeType: "image/" + (image.format || "jpeg") };
  }

  // Web: input file anclado al DOM (necesario en móviles)
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0;width:1px;height:1px;";
    document.body.appendChild(input);

    const cleanup = () => { try { document.body.removeChild(input); } catch (_) {} };

    input.onchange = (e) => {
      const file = e.target.files?.[0];
      cleanup();
      if (!file) { resolve(null); return; }
      const reader = new FileReader();
      reader.onload = () => resolve({ base64: reader.result.split(",")[1], mimeType: file.type });
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    };

    input.addEventListener("cancel", () => { cleanup(); resolve(null); });

    const onFocus = () => {
      window.removeEventListener("focus", onFocus);
      setTimeout(() => { if (!input.files?.length) { cleanup(); resolve(null); } }, 400);
    };
    window.addEventListener("focus", onFocus);
    input.click();
  });
};

/** Sube una foto a Storage e inserta el registro en la BD */
export const uploadPhoto = async (lotId, stage, base64, mimeType) => {
  const fileName = `${lotId}/${stage}/${Date.now()}.jpg`;
  const byteArray = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

  const { error: upError } = await supabase.storage
    .from("lot-photos")
    .upload(fileName, byteArray, { contentType: mimeType, upsert: false });

  if (upError) throw new Error("Error al subir foto");

  const { data: { publicUrl } } = supabase.storage.from("lot-photos").getPublicUrl(fileName);

  await supabase.from("lot_photos").insert({
    lot_id: lotId, stage, url: publicUrl, file_path: fileName,
  });

  return publicUrl;
};

/** Elimina una foto de Storage y de la BD */
export const deletePhoto = async (photo) => {
  await supabase.storage.from("lot-photos").remove([photo.file_path]);
  await supabase.from("lot_photos").delete().eq("id", photo.id);
};
