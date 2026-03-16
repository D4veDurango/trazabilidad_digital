// ─── PARCELAS ──────────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { Icon } from "../components/SharedComponents";
import { getParcelas, createParcela, deleteParcela } from "../../back-end/parcelas";

const Parcelas = ({ userId, showToast }) => {
  const [parcelas,   setParcelas]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showModal,  setShowModal]  = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [nombre,     setNombre]     = useState("");
  const [hectareas,  setHectareas]  = useState(1);
  const [arboles,    setArboles]    = useState(100);

  const cargar = async () => {
    setLoading(true);
    setParcelas(await getParcelas(userId));
    setLoading(false);
  };
  useEffect(() => { cargar(); }, [userId]);
  const reset = () => { setNombre(""); setHectareas(1); setArboles(100); };

  const handleGuardar = async () => {
    if (!nombre.trim()) return;
    setSaving(true);
    const { data, error } = await createParcela(userId, { nombre, hectareas, num_arboles: arboles });
    setSaving(false);
    if (!error) { setParcelas((p) => [data, ...p]); showToast("✓ Parcela registrada"); setShowModal(false); reset(); }
    else showToast("Error al guardar");
  };

  const handleEliminar = async (id) => {
    await deleteParcela(id);
    setParcelas((p) => p.filter((x) => x.id !== id));
    showToast("Parcela eliminada");
  };

  const sliderHaPct = (((hectareas - 0.5) / 49.5) * 100).toFixed(1);
  const sliderArPct = (((arboles - 10) / 1990) * 100).toFixed(1);
  const totalHa     = parcelas.reduce((s, p) => s + (p.hectareas || 0), 0);
  const totalAr     = parcelas.reduce((s, p) => s + (p.num_arboles || 0), 0);

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      <div className="screen-header px">
        <div className="screen-header-info">
          <div className="page-title">Mis Parcelas</div>
          <div className="page-subtitle">Terrenos de tu finca</div>
        </div>
        <button className="primary-btn" style={{ width: "auto", padding: "10px 16px", fontSize: 13, borderRadius: 12 }} onClick={() => setShowModal(true)}>
          <Icon name="add" /> Nueva
        </button>
      </div>

      <div className="page-scroll px">
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", paddingTop: 60 }}><div className="spinner" /></div>
        ) : parcelas.length === 0 ? (
          <div className="empty-state" style={{ marginTop: 32 }}>
            <div className="empty-state-icon">🌿</div>
            <div className="empty-state-text">Aún no tienes parcelas.<br />Agrega los terrenos de tu finca.</div>
          </div>
        ) : (
          <>
            <div className="space-y" style={{ paddingTop: 4 }}>
              {parcelas.map((p) => (
                <div key={p.id} className="parcel-card">
                  <div className="parcel-icon">🌿</div>
                  <div className="parcel-info">
                    <div className="parcel-name">{p.nombre}</div>
                    <div className="parcel-chips">
                      <span className="parcel-chip primary"><Icon name="straighten" style={{ fontSize: 11 }} /> {p.hectareas} ha</span>
                      <span className="parcel-chip">🌱 {p.num_arboles?.toLocaleString("es-CO")} árboles</span>
                    </div>
                  </div>
                  <button className="parcel-delete-btn" onClick={() => handleEliminar(p.id)}>
                    <Icon name="delete_outline" style={{ fontSize: 18 }} />
                  </button>
                </div>
              ))}
            </div>
            <div className="parcelas-summary">
              <div><div className="summary-val">{parcelas.length}</div><div className="summary-lbl">Parcelas</div></div>
              <div><div className="summary-val">{totalHa.toFixed(1)}</div><div className="summary-lbl">Hectáreas</div></div>
              <div><div className="summary-val">{totalAr >= 1000 ? (totalAr / 1000).toFixed(1) + "k" : totalAr}</div><div className="summary-lbl">Árboles</div></div>
            </div>
          </>
        )}
        <div style={{ height: 20 }} />
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) { setShowModal(false); reset(); } }}>
          <div className="modal-sheet">
            <div className="modal-handle" />
            <div className="modal-title">Nueva Parcela</div>
            <div className="space-y mb-6">
              <div>
                <div className="field-label">Nombre o código</div>
                <div className="field-wrap">
                  <input className="field-input" placeholder='Ej: "Lote 1", "La Cañada"' value={nombre} onChange={(e) => setNombre(e.target.value)} autoFocus />
                  <Icon name="terrain" className="field-icon" />
                </div>
              </div>
              <div>
                <div className="field-label">Tamaño</div>
                <div className="size-display">{Number(hectareas).toFixed(1)}</div>
                <div className="size-unit">hectáreas</div>
                <input type="range" min="0.5" max="50" step="0.5" value={hectareas} onChange={(e) => setHectareas(e.target.value)} className="size-slider" style={{ "--pct": `${sliderHaPct}%` }} />
                <div className="size-row"><span>0.5 ha</span><span>50 ha</span></div>
              </div>
              <div>
                <div className="field-label">Número de árboles de cacao</div>
                <div className="size-display">{Number(arboles).toLocaleString("es-CO")}</div>
                <div className="size-unit">árboles · densidad ~{hectareas > 0 ? Math.round(arboles / hectareas) : 0} por ha</div>
                <input type="range" min="10" max="2000" step="10" value={arboles} onChange={(e) => setArboles(e.target.value)} className="size-slider" style={{ "--pct": `${sliderArPct}%` }} />
                <div className="size-row"><span>10</span><span>2,000</span></div>
              </div>
            </div>
            <button className="primary-btn" onClick={handleGuardar} disabled={saving || !nombre.trim()}>
              {saving ? "Guardando..." : "Registrar Parcela"} <Icon name="check" style={{ fontSize: 16 }} />
            </button>
            <button className="secondary-btn" style={{ marginTop: 10 }} onClick={() => { setShowModal(false); reset(); }}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Parcelas;
