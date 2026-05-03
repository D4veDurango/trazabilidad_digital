import { supabase } from "./supabaseClient";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";

const isNative = !!window.Capacitor?.isNativePlatform?.();

const MAX_IMAGE_SIZE_MB = 5;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

export const getPhotos = async (
  lotId,
  stage,
  day
) => {
  const query = supabase
    .from("lot_photos")
    .select("*")
    .eq("lot_id", lotId)
    .eq("stage", stage);

  if (day != null) {
    query.eq("day_number", day);
  }

  const { data } = await query.order("created_at");

  return data || [];
};

export const pickImage = async () => {
  if (isNative) {
    const image = await Camera.getPhoto({
      quality: 75,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Prompt,
    });

    if (!image?.base64String) return null;

    return {
      base64: image.base64String,
      mimeType: `image/${image.format || "jpeg"}`,
    };
  }

  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.style.cssText =
      "position:fixed;top:-9999px;left:-9999px;opacity:0;width:1px;height:1px;";
    document.body.appendChild(input);

    const cleanup = () => {
      try {
        document.body.removeChild(input);
      } catch (_) { }
    };

    input.onchange = (e) => {
      const file = e.target.files?.[0];

      if (!file) {
        cleanup();
        resolve(null);
        return;
      }

      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        cleanup();
        resolve({
          error: `La imagen excede el límite de ${MAX_IMAGE_SIZE_MB}MB`,
        });
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        cleanup();

        resolve({
          base64: reader.result.split(",")[1],
          mimeType: file.type || "image/jpeg",
        });
      };

      reader.onerror = () => {
        cleanup();
        resolve(null);
      };

      reader.readAsDataURL(file);
    };

    input.addEventListener("cancel", () => {
      cleanup();
      resolve(null);
    });

    input.click();
  });
};
export const uploadPhoto = async (
  lotId,
  stage,
  day,
  base64,
  mimeType
) => {
  const fileName = `${lotId}/${stage}/day-${day}/${Date.now()}.jpg`;

  const byteArray = Uint8Array.from(
    atob(base64),
    (c) => c.charCodeAt(0)
  );

  const { error: uploadError } = await supabase.storage
    .from("lot-photos")
    .upload(fileName, byteArray, {
      contentType: mimeType,
      upsert: false,
    });

  if (uploadError) {
    throw new Error("Error al subir foto");
  }

  const {
    data: { publicUrl },
  } = supabase.storage
    .from("lot-photos")
    .getPublicUrl(fileName);

  const { error: insertError } = await supabase
    .from("lot_photos")
    .insert({
      lot_id: lotId,
      stage,
      day_number: day,
      url: publicUrl,
      file_path: fileName,
    });

  if (insertError) {
    throw new Error("Error al registrar foto");
  }

  return publicUrl;
};

export const deletePhoto = async (photo) => {
  await supabase.storage.from("lot-photos").remove([photo.file_path]);

  await supabase.from("lot_photos").delete().eq("id", photo.id);
};