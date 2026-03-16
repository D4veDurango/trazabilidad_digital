// ─── REGISTRO DE COSECHA ───────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { Icon } from "../components/SharedComponents";
import { createLot } from "../../back-end/lots";
import { getParcelas } from "../../back-end/parcelas";

const Registro = ({ goBack, navigate, userId, showToast, onLotCreated }) => {
  const [variety,        setVariety]        = useState("CCN51");
  const [varieties,      setVarieties]      = useState([
    { key: "CCN51",    type: "HÍBRIDO" },
    { key: "ICS95",    type: "CLON"    },
    { key: "Mezclado", type: "OTRO"    },
  ]);
  const [showAddVariety,  setShowAddVariety]  = useState(false);
  const [newVarietyName,  setNewVarietyName]  = useState("");
  const [newVarietyType,  setNewVarietyType]  = useState("CLON");
  const [check1,          setCheck1]          = useState(true);
  const [check2,          setCheck2]          = useState(false);
  const [harvestDate,     setHarvestDate]     = useState(new Date().toISOString().split("T")[0]);
  const [parcelId,        setParcelId]        = useState("");
  const [weightKg,        setWeightKg]        = useState("");
  const [saving,          setSaving]          = useState(false);
  const [error,           setError]           = useState(null);
  const [parcelas,        setParcelas]        = useState([]);
  const [loadingParcelas, setLoadingParcelas] = useState(true);

  useEffect(() => {
    getParcelas(userId).then((lista) => {
      setParcelas(lista);
      if (lista.length > 0) setParcelId(lista[0].id);
      setLoadingParcelas(false);
    });
  }, [userId]);

  const handleAddVariety = () => {
    const n = newVarietyName.trim().toUpperCase();
    if (!n || varieties.find((v) => v.key === n)) { showToast("Esa variedad ya existe"); return; }
    setVarieties((prev) => [...prev, { key: n, type: newVarietyType }]);
    setVariety(n);
    setNewVarietyName("");
    setShowAddVariety(false);
    showToast(`✓ Variedad "${n}" agregada`);
  };

  const parcelaSeleccionada = parcelas.find((p) => p.id === parcelId);

  const handleSubmit = async () => {
    if (!harvestDate || !weightKg) { setError("Completa la fecha y el peso."); return; }
    if (!parcelId) { setError("Selecciona una parcela."); return; }
    setSaving(true); setError(null);
    const { data, error: dbError } = await createLot({
      farmer_id:    userId,
      variety,
      parcel_name:  parcelaSeleccionada?.nombre || "",
      parcel_id:    parcelId,
      harvest_date: harvestDate,
      weight_kg:    parseFloat(weightKg),
      quality_ripe: check1,
      quality_cut:  check2,
    });
    setSaving(false);
    if (dbError) setError("Error: " + dbError.message);
    else { showToast(`✓ Lote #${data.lot_code} registrado`); onLotCreated(data); goBack(); }
  };

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      <div className="page-header px">
        <button className="header-icon-btn" onClick={goBack}><Icon name="chevron_left" /></button>
        <div style={{ fontWeight: 800, fontSize: 16 }}>Registrar Cosecha</div>
        <div style={{ width: 40 }} />
      </div>

      <div className="px" style={{ marginBottom: 16 }}>
        <div className="stepper">
          <div className="step-bar done" /><div className="step-bar" /><div className="step-bar" /><div className="step-bar" />
        </div>
        <div className="step-label">Paso 1: Recolección de la cosecha</div>
      </div>

      <div className="page-scroll px">
        <div className="img-card mb-6" style={{ height: 120 }}>
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBauwPrRfvqyp-MFsQfoPRhFL7KrlYRavesJJcKPmF1R8m-IQm2sx54TKZyG_Of4HX5aaHmUo5U87eTaz11e6fYlhs-xV3ZZKHcsZA1loxPjoT3cKRrcTNS2VGyUFgF1eh-JdIOEwaOM4-mKv98q3Gk0ApzDmbM1evYuW3jw2xYEfEavkN8to8YHd4xqM1e9t3P0ZPJ2tO5XIXsSpEYo4CWupY9fHev5_cn3mWN5Ek8Ob-VbSzPYCUg8Pisob8TdhWqXyXrX8ID40HJ" alt="Cocoa pod" />
          <div className="img-overlay"><span>Trazabilidad de la Región de Urabá</span></div>
        </div>

        {error && <div className="login-error" style={{ marginBottom: 16 }}>{error}</div>}

        <div className="space-y mb-6">
          <div>
            <div className="field-label">Fecha de cosecha</div>
            <div className="field-wrap">
              <input type="date" value={harvestDate} onChange={(e) => setHarvestDate(e.target.value)} className="field-input" style={{ paddingRight: 44 }} />
              <Icon name="calendar_today" className="field-icon" />
            </div>
          </div>
          <div>
            <div className="field-label">Peso aproximado (kg)</div>
            <div className="field-wrap">
              <input type="number" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} placeholder="Ej: 450.5" className="field-input" />
              <Icon name="scale" className="field-icon" />
            </div>
          </div>
          <div>
            <div className="field-label">Parcela de origen</div>
            {loadingParcelas ? (
              <div style={{ padding: "14px 0" }}><div className="spinner" style={{ width: 24, height: 24, margin: "0 auto" }} /></div>
            ) : parcelas.length === 0 ? (
              <div onClick={() => navigate("parcelas")} style={{ background: "#fef3e8", border: "1.5px dashed rgba(212,115,17,0.4)", borderRadius: "var(--radius-sm)", padding: "16px", fontSize: 13, color: "var(--primary)", fontWeight: 600, display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <Icon name="add_circle_outline" style={{ fontSize: 20 }} />
                <div><div>No tienes parcelas registradas</div><div style={{ fontSize: 11, fontWeight: 500, marginTop: 2 }}>Toca aquí para agregar tus terrenos →</div></div>
              </div>
            ) : (
              <>
                <div className="field-wrap">
                  <select className="field-select" value={parcelId} onChange={(e) => setParcelId(e.target.value)} style={{ paddingRight: 44 }}>
                    {parcelas.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                  <Icon name="expand_more" className="field-icon" />
                </div>
                {parcelaSeleccionada && (
                  <div style={{ marginTop: 8, background: "var(--primary-light)", borderRadius: "var(--radius-sm)", padding: "10px 14px", display: "flex", gap: 16, fontSize: 12 }}>
                    <span style={{ fontWeight: 700, color: "var(--primary)" }}>🌿 {parcelaSeleccionada.hectareas} ha</span>
                    <span style={{ color: "var(--muted)", fontWeight: 600 }}>🌱 {parcelaSeleccionada.num_arboles?.toLocaleString("es-CO")} árboles</span>
                  </div>
                )}
              </>
            )}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div className="field-label" style={{ margin: 0 }}>Variedad de cacao</div>
              <button onClick={() => setShowAddVariety(true)} style={{ background: "var(--primary-light)", border: "none", borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 700, color: "var(--primary)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                <Icon name="add" style={{ fontSize: 14 }} /> Nueva
              </button>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {varieties.map((v) => (
                <button key={v.key} className={`variety-btn${variety === v.key ? " selected" : ""}`} style={{ flex: "1 1 80px", minWidth: 80 }} onClick={() => setVariety(v.key)}>
                  <span className="variety-type">{v.type}</span>
                  <span className="variety-name">{v.key}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <Icon name="verified" style={{ color: "var(--primary)", fontSize: 16 }} />
            <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted)" }}>Control de calidad</span>
          </div>
          <div className="space-y-sm">
            <label className="check-label">
              <input type="checkbox" checked={check1} onChange={(e) => setCheck1(e.target.checked)} />
              <span className="check-text">Solo se seleccionan frutas maduras</span>
            </label>
            <label className="check-label">
              <input type="checkbox" checked={check2} onChange={(e) => setCheck2(e.target.checked)} />
              <span className="check-text">Corte limpio (cojín floral protegido)</span>
            </label>
          </div>
        </div>
        <div style={{ height: 100 }} />
      </div>

      <div className="footer-actions">
        <button className="primary-btn" onClick={handleSubmit} disabled={saving || parcelas.length === 0}>
          {saving ? "Guardando..." : "Registrar & Continuar"} <Icon name="arrow_forward" style={{ fontSize: 16 }} />
        </button>
        <div style={{ height: 4 }} />
      </div>

      {showAddVariety && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setShowAddVariety(false); }}>
          <div className="modal-sheet">
            <div className="modal-handle" />
            <div className="modal-title">Nueva Variedad</div>
            <div className="space-y mb-6">
              <div>
                <div className="field-label">Nombre de la variedad</div>
                <div className="field-wrap">
                  <input className="field-input" placeholder="Ej: TSH565, ICS1, Amelonado..." value={newVarietyName} onChange={(e) => setNewVarietyName(e.target.value.toUpperCase())} autoFocus />
                  <Icon name="eco" className="field-icon" />
                </div>
              </div>
              <div>
                <div className="field-label">Tipo</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {["CLON", "HÍBRIDO", "NATIVO", "OTRO"].map((t) => (
                    <button key={t} onClick={() => setNewVarietyType(t)} style={{ flex: 1, padding: "10px 4px", borderRadius: "var(--radius-sm)", border: `1.5px solid ${newVarietyType === t ? "var(--primary)" : "var(--border)"}`, background: newVarietyType === t ? "var(--primary-light)" : "white", fontFamily: "inherit", fontSize: 11, fontWeight: 700, color: newVarietyType === t ? "var(--primary)" : "var(--muted)", cursor: "pointer" }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button className="primary-btn" onClick={handleAddVariety} disabled={!newVarietyName.trim()}>
              Agregar variedad <Icon name="check" style={{ fontSize: 16 }} />
            </button>
            <button className="secondary-btn" style={{ marginTop: 10 }} onClick={() => setShowAddVariety(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Registro;
