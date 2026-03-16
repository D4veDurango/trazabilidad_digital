// ─── GALERÍA DE FOTOS ──────────────────────────────────────────────────────────
// Componente reutilizable para subir, ver y eliminar fotos del proceso.

import { useState, useEffect, useCallback } from "react";
import { Icon } from "./SharedComponents";
import { getPhotos, pickImage, uploadPhoto, deletePhoto } from "../../back-end/photos";

const PhotoGallery = ({ lotId, etapa, showToast }) => {
  const [photos, setPhotos]     = useState([]);
  const [uploading, setUploading] = useState(false);
  const [lightbox, setLightbox] = useState(null);

  const cargarFotos = useCallback(async () => {
    if (!lotId) return;
    setPhotos(await getPhotos(lotId, etapa));
  }, [lotId, etapa]);

  useEffect(() => { cargarFotos(); }, [cargarFotos]);

  const tomarFoto = async () => {
    try {
      const result = await pickImage();
      if (!result) return;

      setUploading(true);
      await uploadPhoto(lotId, etapa, result.base64, result.mimeType);
      setUploading(false);
      cargarFotos();
      showToast("✓ Foto guardada");
    } catch (e) {
      console.error(e);
      setUploading(false);
      showToast("Error al subir foto");
    }
  };

  const eliminarFoto = async (photo) => {
    await deletePhoto(photo);
    setPhotos((p) => p.filter((x) => x.id !== photo.id));
    showToast("Foto eliminada");
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div className="field-label" style={{ margin: 0 }}>📸 Fotos del proceso</div>
        <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>
          {photos.length} foto{photos.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="photos-grid">
        {photos.map((p) => (
          <div key={p.id} className="photo-thumb" onClick={() => setLightbox(p.url)}>
            <img src={p.url} alt="proceso" loading="lazy" />
            <button className="photo-delete" onClick={(e) => { e.stopPropagation(); eliminarFoto(p); }}>
              <Icon name="close" style={{ fontSize: 12 }} />
            </button>
          </div>
        ))}
        <button className="photo-add-btn" onClick={tomarFoto} disabled={uploading}>
          {uploading
            ? <div className="spinner" style={{ width: 22, height: 22 }} />
            : <><Icon name="add_a_photo" style={{ fontSize: 22, color: "var(--muted)" }} /><span>Agregar</span></>
          }
        </button>
      </div>

      {lightbox && (
        <div className="photo-lightbox" onClick={() => setLightbox(null)}>
          <button className="photo-lightbox-close" onClick={() => setLightbox(null)}>
            <Icon name="close" />
          </button>
          <img src={lightbox} alt="foto ampliada" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;
