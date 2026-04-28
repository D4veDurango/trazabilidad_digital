import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SB_URL") || Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SB_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const key = url.searchParams.get("key");

  if (!key) return html(errorPage("Falta la clave de trazabilidad."), 400);

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    const { data: inv, error } = await supabase
      .from("inventory")
      .select("*, lots(*, profiles(*), parcelas(*))")
      .eq("traceability_key", key)
      .maybeSingle();

    if (error) {
      console.error("Supabase error:", error);
      return html(errorPage("Error de base de datos: " + error.message), 500);
    }

    if (!inv) return html(errorPage("No se encontró información para esta clave."), 404);

    const lot     = inv.lots     ?? {};
    const profile = lot.profiles ?? {};
    const parcela = lot.parcelas ?? {};

    return html(buildPage({ inv, lot, profile, parcela, key }), 200);
  } catch (err) {
    console.error("Edge function error:", err);
    return html(errorPage("Error interno del servidor."), 500);
  }
});

function html(body: string, status: number) {
  return new Response(body, { status, headers: { "Content-Type": "text/html; charset=utf-8" } });
}

function fmt(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" });
}

function chk(v: boolean) { return v ? "✓ Verificado" : "✗ No verificado"; }

function buildPage({ inv, lot, profile, parcela, key }: any): string {
  const D = {
    lotCode:    lot?.lot_code    ?? "—",
    nombre:     profile?.full_name ?? "—",
    producerId: profile?.producer_id ?? "—",
    pNombre:    parcela?.nombre ?? lot?.parcel_name ?? "—",
    pHa:        parcela?.hectareas ? `${parcela.hectareas} ha` : "—",
    pArboles:   parcela?.num_arboles?.toLocaleString("es-CO") ?? "—",
    variedad:   lot?.variety    ?? "—",
    fechaCos:   fmt(lot?.harvest_date),
    fechaAlm:   fmt(inv?.entry_date ?? inv?.registered_at),
    pesoNeto:   inv?.net_weight_kg ? `${inv.net_weight_kg} kg` : "—",
    sacos:      inv?.bag_count ? `${inv.bag_count} costales` : "—",
    pallets:    chk(inv?.storage_on_pallets ?? false),
    paredes:    chk(inv?.away_from_walls ?? false),
    olores:     chk(inv?.no_strong_odors ?? false),
    key,
    regDate:    inv?.registered_at ? new Date(inv.registered_at).toLocaleString("es-CO") : "—",
    qrUrl:      `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(key)}&color=1a1208&bgcolor=ffffff&margin=6`,
  };

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Carta de Trazabilidad · Lote ${D.lotCode}</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:system-ui,sans-serif;background:#f0ede8;min-height:100dvh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;gap:0}
    .card{background:white;border-radius:24px;padding:36px 28px;max-width:400px;width:100%;text-align:center;box-shadow:0 12px 48px rgba(0,0,0,0.13)}
    .logo{width:64px;height:64px;background:#d47311;border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:30px;margin:0 auto 18px;box-shadow:0 6px 20px rgba(212,115,17,0.35)}
    h1{font-size:22px;font-weight:800;color:#1a1208;margin-bottom:6px}
    .sub{font-size:13px;color:#7a6f63;margin-bottom:28px;line-height:1.5}
    .spinner{width:48px;height:48px;border:4px solid rgba(212,115,17,0.15);border-top-color:#d47311;border-radius:50%;animation:spin 0.75s linear infinite;margin:0 auto 14px}
    @keyframes spin{to{transform:rotate(360deg)}}
    .status{font-size:14px;font-weight:700;color:#d47311;min-height:22px}
    .done-icon{display:none;font-size:44px;margin-bottom:10px}
    .done .spinner{display:none}
    .done .done-icon{display:block}
    .done .status{color:#16a34a}
    button{margin-top:18px;background:#d47311;color:white;border:none;border-radius:14px;padding:15px 24px;font-size:15px;font-weight:800;cursor:pointer;width:100%;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:8px;transition:background 0.2s}
    button:hover{background:#b8620e}
    button svg{flex-shrink:0}
    .err-text{color:#dc2626;font-weight:700}
    .lote-badge{display:inline-block;background:rgba(212,115,17,0.1);color:#d47311;border:1px solid rgba(212,115,17,0.25);border-radius:999px;padding:4px 14px;font-size:12px;font-weight:800;margin-bottom:20px}
  </style>
</head>
<body>
<div class="card" id="card">
  <div class="logo">🍫</div>
  <h1>Carta de Trazabilidad</h1>
  <div class="lote-badge">Lote #${D.lotCode}</div>
  <p class="sub">Cacao fino de origen certificado<br/>Región de Urabá, Antioquia · Colombia</p>

  <div class="done-icon">✅</div>
  <div class="spinner" id="spinner"></div>
  <div class="status" id="status">Generando PDF…</div>

  <button id="btn" style="display:none" onclick="descargar()">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
    Volver a descargar PDF
  </button>
</div>

<script>
const D = ${JSON.stringify(D)};

function setStatus(msg, done) {
  document.getElementById('status').textContent = msg;
  if (done) {
    document.getElementById('card').classList.add('done');
    document.getElementById('btn').style.display = 'flex';
  }
}
function setError(msg) {
  document.getElementById('spinner').style.display = 'none';
  document.getElementById('status').className = 'status err-text';
  document.getElementById('status').textContent = '⚠ ' + msg;
}

async function loadImgBase64(url) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise(r => {
      const fr = new FileReader();
      fr.onload = () => r(fr.result);
      fr.readAsDataURL(blob);
    });
  } catch { return null; }
}

async function descargar() {
  try {
    document.getElementById('status').textContent = 'Generando PDF…';
    document.getElementById('card').classList.remove('done');
    document.getElementById('btn').style.display = 'none';
    document.getElementById('spinner').style.display = 'block';

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const W = 210, mg = 18, col = W - mg * 2;
    let y = 0;

    // ── CABECERA ──────────────────────────────────────────────────────────
    doc.setFillColor(26, 18, 8);
    doc.rect(0, 0, W, 55, 'F');

    // Franja naranja izquierda
    doc.setFillColor(212, 115, 17);
    doc.rect(0, 0, 6, 55, 'F');

    // Logo
    doc.setFillColor(212, 115, 17);
    doc.roundedRect(mg, 10, 22, 22, 4, 4, 'F');
    doc.setFontSize(15);
    doc.setTextColor(255,255,255);
    doc.text('🍫', mg + 4, 24);

    // Título
    doc.setFontSize(17);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('CARTA DE TRAZABILIDAD', mg + 28, 20);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(180, 140, 80);
    doc.text('Sistema NodeBean · Cacao fino de origen · Urabá, Antioquia', mg + 28, 27);

    // Badge verificado
    doc.setFillColor(22, 163, 74);
    doc.roundedRect(mg + 28, 31, 58, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('✓  VERIFICADO Y REGISTRADO', mg + 30, 36.5);

    // Lote info derecha
    doc.setTextColor(212, 115, 17);
    doc.setFontSize(13);
    doc.text('Lote #' + D.lotCode, W - mg, 20, { align: 'right' });
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 120, 70);
    doc.text('Registrado: ' + D.regDate, W - mg, 27, { align: 'right' });

    y = 65;

    // ── HELPER SECCIÓN ────────────────────────────────────────────────────
    function seccion(emoji, titulo, filas) {
      if (y > 250) { doc.addPage(); y = 20; }

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 85, 70);
      doc.text((emoji + '  ' + titulo).toUpperCase(), mg, y);

      doc.setDrawColor(212, 115, 17);
      doc.setLineWidth(0.5);
      const tw = doc.getTextWidth((emoji + '  ' + titulo).toUpperCase());
      doc.line(mg + tw + 4, y - 1, W - mg, y - 1);
      y += 5;

      filas.forEach(([k, v], i) => {
        if (y > 270) { doc.addPage(); y = 20; }
        if (i % 2 === 0) {
          doc.setFillColor(250, 248, 245);
          doc.rect(mg, y - 4.5, col, 9, 'F');
        }
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(110, 95, 80);
        doc.text(k, mg + 3, y + 1);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(26, 18, 8);

        // Condiciones: colorear ✓ verde / ✗ rojo
        if (String(v).startsWith('✓')) {
          doc.setTextColor(22, 163, 74);
        } else if (String(v).startsWith('✗')) {
          doc.setTextColor(220, 38, 38);
        }
        doc.text(String(v), W - mg - 3, y + 1, { align: 'right' });
        doc.setTextColor(26, 18, 8);
        y += 9;
      });
      y += 8;
    }

    seccion('👤', 'Productor', [
      ['Nombre completo',   D.nombre],
      ['ID Productor',      D.producerId],
      ['Región',            'Urabá, Antioquia · Colombia'],
    ]);
    seccion('🌿', 'Parcela de origen', [
      ['Nombre / Código',   D.pNombre],
      ['Superficie',        D.pHa],
      ['Árboles de cacao',  D.pArboles],
      ['Variedad',          D.variedad],
    ]);
    seccion('📅', 'Proceso cronológico', [
      ['Cosecha',           D.fechaCos],
      ['Fermentación',      '6 días · a partir de la cosecha'],
      ['Entrada al almacén',D.fechaAlm],
    ]);
    seccion('⚖️', 'Inventario final', [
      ['Peso neto cacao seco', D.pesoNeto],
      ['Sacos de fique',       D.sacos],
    ]);
    seccion('🏭', 'Condiciones de almacenamiento', [
      ['Almacenado sobre pallets',        D.pallets],
      ['Alejado de paredes (mín. 50 cm)', D.paredes],
      ['Sin presencia de olores fuertes', D.olores],
    ]);

    // ── BLOQUE QR ─────────────────────────────────────────────────────────
    if (y > 240) { doc.addPage(); y = 20; }

    const qrB64 = await loadImgBase64(D.qrUrl);

    doc.setFillColor(26, 18, 8);
    doc.roundedRect(mg, y, col, 44, 5, 5, 'F');

    doc.setFillColor(212, 115, 17);
    doc.roundedRect(mg, y, 6, 44, 5, 5, 'F');
    doc.rect(mg + 3, y, 3, 44, 'F');

    doc.setTextColor(212, 115, 17);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text('CLAVE DE TRAZABILIDAD', mg + 12, y + 9);

    if (qrB64) {
      doc.addImage(qrB64, 'PNG', mg + 12, y + 13, 28, 28);
    }

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    // Dividir la clave si es larga
    const keyParts = D.key.match(/.{1,30}/g) || [D.key];
    keyParts.forEach((part, i) => {
      doc.text(part, mg + 46, y + 19 + i * 7);
    });

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 120, 70);
    doc.text('Escanea el QR para verificar en línea', mg + 46, y + 19 + keyParts.length * 7 + 4);

    y += 52;

    // ── PIE DE PÁGINA ─────────────────────────────────────────────────────
    const pageH = 297;
    doc.setDrawColor(212, 115, 17);
    doc.setLineWidth(0.3);
    doc.line(mg, pageH - 14, W - mg, pageH - 14);
    doc.setFontSize(7);
    doc.setTextColor(180, 160, 140);
    doc.setFont('helvetica', 'normal');
    doc.text(
      'Documento generado por NodeBean · Sistema de Trazabilidad Digital · ' +
      new Date().toLocaleDateString('es-CO'),
      W / 2, pageH - 9, { align: 'center' }
    );

    // ── GUARDAR ───────────────────────────────────────────────────────────
    doc.save('trazabilidad-' + D.lotCode + '.pdf');
    setStatus('PDF descargado exitosamente', true);

  } catch(e) {
    console.error(e);
    setError('Error al generar el PDF. Intenta de nuevo.');
  }
}

window.addEventListener('load', () => setTimeout(descargar, 700));
</script>
</body>
</html>`;
}

function errorPage(msg: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Error · Trazabilidad</title>
  <style>body{font-family:system-ui,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100dvh;background:#f8f7f6;color:#1a1208;gap:12px;padding:32px;text-align:center}.icon{font-size:56px}h2{font-size:20px;font-weight:800}p{color:#7a6f63;font-size:14px;max-width:300px}</style>
</head>
<body>
  <div class="icon">🔍</div>
  <h2>Lote no encontrado</h2>
  <p>${msg}</p>
</body>
</html>`;
}
