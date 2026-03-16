// ─── ESTILOS GLOBALES ──────────────────────────────────────────────────────────
// Todo el CSS de la app en un solo componente inyectado en el <head>.

const IonicStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');

    :root {
      --primary: #d47311;
      --primary-light: rgba(212,115,17,0.12);
      --primary-glow: rgba(212,115,17,0.25);
      --bg: #f8f7f6;
      --card: #ffffff;
      --border: rgba(0,0,0,0.07);
      --text: #1a1208;
      --muted: #7a6f63;
      --success: #16a34a;
      --success-bg: #f0fdf4;
      --radius: 16px;
      --radius-sm: 10px;
      --shadow: 0 4px 24px rgba(0,0,0,0.08);
      --shadow-primary: 0 8px 32px rgba(212,115,17,0.22);
    }

    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }

    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100dvh;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .app-shell {
      width: 100%;
      max-width: 430px;
      min-height: 100dvh;
      min-height: -webkit-fill-available;
      background: var(--card);
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
      box-shadow: 0 0 80px rgba(0,0,0,0.18);
      padding-top: env(safe-area-inset-top, 0px);
    }

    /* En app nativa Capacitor: pantalla completa siempre */
    body.is-native { background: var(--card); align-items: flex-start; height: 100%; }
    body.is-native .app-shell { max-width: 100%; width: 100vw; box-shadow: none; }

    /* Fallback media query para WebViews que no disparan Capacitor */
    @media (max-width: 500px) {
      html, body { height: 100%; align-items: flex-start; background: var(--card); }
      .app-shell { max-width: 100%; box-shadow: none; }
    }

    /* Status bar */
    .status-bar { display: flex; justify-content: space-between; align-items: center; padding: 12px 24px 8px; font-size: 12px; font-weight: 700; color: var(--text); flex-shrink: 0; }
    .status-icons { display: flex; gap: 6px; align-items: center; font-size: 14px; }

    /* Navigation */
    .bottom-nav {
      position: sticky; bottom: 0;
      background: rgba(255,255,255,0.97);
      backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
      border-top: 1px solid var(--border);
      display: flex; justify-content: space-around; align-items: flex-start;
      padding: 8px 4px;
      padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px));
      flex-shrink: 0; z-index: 100;
    }
    .nav-btn { display: flex; flex-direction: column; align-items: center; gap: 3px; background: none; border: none; cursor: pointer; color: var(--muted); font-family: inherit; font-size: 9px; font-weight: 600; letter-spacing: 0.02em; padding: 4px 6px; border-radius: var(--radius-sm); transition: all 0.2s; flex: 1; min-width: 0; }
    .nav-btn.active { color: var(--primary); }
    .nav-btn .icon { font-size: 20px; }

    /* ── Headers unificados ──
       .page-header  → pantallas con botón "atrás" (Proceso, Secado, Registro, Almacén)
       .screen-header → pantallas raíz sin atrás (Inicio, Parcelas) */
    .page-header, .screen-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px 14px; border-bottom: 1px solid var(--border); flex-shrink: 0; min-height: 60px; }
    .screen-header-info { display: flex; flex-direction: column; gap: 2px; }
    .page-title { font-size: 17px; font-weight: 800; }
    .page-subtitle { font-size: 11px; color: var(--muted); font-weight: 600; }
    .header-icon-btn { width: 40px; height: 40px; border-radius: 50%; background: #f3f0ed; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 18px; color: var(--muted); transition: background 0.2s; }
    .header-icon-btn:hover { background: var(--primary-light); color: var(--primary); }

    /* Scrollable main */
    .page-scroll { flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch; padding-bottom: 12px; padding-top: 16px; }
    .page-scroll::-webkit-scrollbar { display: none; }

    /* ─── LOGIN ─── */
    .login-screen { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 32px; gap: 0; }
    .login-logo { width: 80px; height: 80px; background: var(--primary); border-radius: 24px; display: flex; align-items: center; justify-content: center; font-size: 40px; margin-bottom: 28px; box-shadow: var(--shadow-primary); }
    .login-title { font-size: 26px; font-weight: 800; text-align: center; margin-bottom: 8px; }
    .login-sub { font-size: 14px; color: var(--muted); text-align: center; margin-bottom: 48px; line-height: 1.6; }
    .google-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 12px; background: white; border: 1.5px solid var(--border); border-radius: var(--radius); padding: 16px; font-family: inherit; font-size: 15px; font-weight: 700; cursor: pointer; box-shadow: var(--shadow); transition: all 0.2s; color: var(--text); }
    .google-btn:hover { border-color: var(--primary); box-shadow: var(--shadow-primary); }
    .google-btn:active { transform: scale(0.98); }
    .google-btn-icon { width: 22px; height: 22px; }
    .login-footer { margin-top: 32px; font-size: 11px; color: var(--muted); text-align: center; line-height: 1.6; }
    .login-error { background: #fef2f2; border: 1.5px solid rgba(220,38,38,0.2); border-radius: var(--radius-sm); padding: 12px 16px; font-size: 13px; color: #dc2626; text-align: center; margin-bottom: 16px; width: 100%; }

    /* Loading */
    .loading-screen { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; }
    .spinner { width: 40px; height: 40px; border: 3px solid var(--primary-light); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ─── PANEL ─── */
    .panel-header { padding: 12px 0 14px; }
    .farmer-info { display: flex; align-items: center; gap: 14px; }
    .avatar { width: 52px; height: 52px; border-radius: 50%; overflow: hidden; border: 2.5px solid var(--primary); flex-shrink: 0; }
    .avatar img { width: 100%; height: 100%; object-fit: cover; }
    .avatar-placeholder { width: 100%; height: 100%; background: var(--primary-light); display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 800; color: var(--primary); }
    .farmer-name { font-size: 17px; font-weight: 800; line-height: 1; }
    .farmer-loc { display: flex; align-items: center; gap: 4px; font-size: 10px; font-weight: 700; color: var(--muted); letter-spacing: 0.08em; text-transform: uppercase; margin-top: 4px; }
    .primary-btn { width: 100%; background: var(--primary); color: white; border: none; border-radius: var(--radius); padding: 16px; font-family: inherit; font-size: 15px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: var(--shadow-primary); transition: all 0.2s; letter-spacing: 0.01em; }
    .primary-btn:active { transform: scale(0.98); opacity: 0.9; }
    .primary-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    .section-title { font-size: 10px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); margin-bottom: 14px; }
    .active-lot-card { background: linear-gradient(135deg, #fef3e8 0%, #fff8f0 100%); border: 1.5px solid rgba(212,115,17,0.2); border-radius: var(--radius); padding: 20px; position: relative; overflow: hidden; cursor: pointer; }
    .lot-badge { display: inline-block; background: var(--primary); color: white; font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 999px; letter-spacing: 0.06em; text-transform: uppercase; }
    .lot-title { font-size: 20px; font-weight: 800; margin: 8px 0 6px; }
    .ring-progress { position: absolute; top: 16px; right: 16px; width: 52px; height: 52px; }
    .ring-progress svg { transform: rotate(-90deg); }
    .ring-text { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800; color: var(--primary); }
    .lot-desc { font-size: 13px; color: var(--muted); margin-bottom: 14px; line-height: 1.5; }
    .lot-chips { display: flex; gap: 8px; flex-wrap: wrap; }
    .chip { display: flex; align-items: center; gap: 5px; background: var(--success-bg); color: var(--success); border: 1px solid rgba(22,163,74,0.15); border-radius: 8px; padding: 6px 10px; font-size: 11px; font-weight: 700; }
    .empty-state { text-align: center; padding: 32px 20px; background: #f8f7f6; border-radius: var(--radius); border: 1.5px dashed var(--border); }
    .empty-state-icon { font-size: 48px; margin-bottom: 12px; }
    .empty-state-text { font-size: 14px; font-weight: 600; color: var(--muted); }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .stage-card { background: #f8f7f6; border: 1.5px solid var(--border); border-radius: var(--radius); padding: 16px 12px; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 8px; cursor: pointer; transition: all 0.2s; }
    .stage-card:hover { border-color: rgba(212,115,17,0.4); }
    .stage-card.active-stage { background: var(--primary-light); border-color: rgba(212,115,17,0.35); }
    .stage-icon { width: 48px; height: 48px; border-radius: 50%; background: white; display: flex; align-items: center; justify-content: center; font-size: 22px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); }
    .stage-card.active-stage .stage-icon { background: var(--primary); color: white; }
    .stage-name { font-size: 13px; font-weight: 700; }
    .stage-status { font-size: 10px; font-weight: 700; color: var(--muted); letter-spacing: 0.04em; }
    .stage-card.active-stage .stage-status { color: var(--primary); }

    /* ─── FERMENTACION ─── */
    .lot-label { font-size: 10px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: var(--primary); }
    .timeline-wrap { position: relative; display: flex; justify-content: space-between; align-items: flex-start; }
    .timeline-track { position: absolute; top: 16px; left: 0; right: 0; height: 2px; background: #ede9e4; }
    .timeline-progress { position: absolute; top: 16px; left: 0; height: 2px; background: var(--primary); transition: width 0.5s; }
    .day-node { display: flex; flex-direction: column; align-items: center; gap: 6px; position: relative; z-index: 1; }
    .day-circle { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; background: #ede9e4; color: var(--muted); transition: all 0.3s; cursor: pointer; }
    .day-circle.done { background: var(--primary); color: white; }
    .day-circle.current { width: 40px; height: 40px; background: var(--primary); color: white; box-shadow: 0 0 0 6px var(--primary-light); }
    .day-label { font-size: 10px; font-weight: 700; color: var(--muted); }
    .day-label.current-label { color: var(--primary); font-weight: 800; }
    .gauge-card { background: #f8f7f6; border: 1.5px solid var(--border); border-radius: var(--radius); padding: 24px; display: flex; flex-direction: column; align-items: center; }
    .gauge-label { font-size: 10px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); margin-bottom: 16px; }
    .gauge-svg-wrap { position: relative; width: 180px; height: 90px; overflow: hidden; }
    .temp-value { font-size: 42px; font-weight: 800; line-height: 1; }
    .temp-unit { font-size: 20px; font-weight: 500; color: var(--muted); }
    .temp-ok { font-size: 11px; font-weight: 700; color: var(--success); margin-top: 8px; display: flex; align-items: center; gap: 4px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .info-card { background: white; border: 1.5px solid var(--border); border-radius: var(--radius-sm); padding: 14px; }
    .info-card-label { font-size: 10px; font-weight: 700; color: var(--muted); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 6px; display: flex; align-items: center; gap: 5px; }
    .info-card-value { font-size: 14px; font-weight: 700; }
    .info-card-sub { font-size: 10px; color: var(--muted); }
    .img-card { border-radius: var(--radius); overflow: hidden; height: 120px; position: relative; }
    .img-card img { width: 100%; height: 100%; object-fit: cover; }
    .img-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.65), transparent); display: flex; align-items: flex-end; padding: 12px; }
    .img-overlay span { color: white; font-size: 11px; font-weight: 600; }
    .action-card { display: flex; align-items: center; justify-content: space-between; padding: 16px; background: var(--primary-light); border: 1.5px solid rgba(212,115,17,0.2); border-radius: var(--radius); }
    .action-card.muted { background: white; border-color: var(--border); opacity: 0.6; }
    .action-icon { width: 42px; height: 42px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
    .action-card.muted .action-icon { background: #f3f0ed; color: var(--muted); }
    .action-info { flex: 1; margin: 0 12px; }
    .action-name { font-size: 14px; font-weight: 700; }
    .action-sub { font-size: 11px; color: var(--muted); margin-top: 2px; }
    .action-btn { background: var(--primary); color: white; border: none; border-radius: var(--radius-sm); padding: 9px 16px; font-family: inherit; font-size: 13px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px var(--primary-glow); white-space: nowrap; transition: all 0.2s; }
    .action-btn:active { transform: scale(0.97); }
    .action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .action-btn-text { background: none; border: none; color: var(--primary); font-family: inherit; font-size: 11px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer; }

    /* ─── INVENTARIO ─── */
    .status-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--success); animation: pulse 2s infinite; }
    @keyframes pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.2); } }
    .region-tag { background: var(--primary-light); color: var(--primary); border: 1px solid rgba(212,115,17,0.2); border-radius: 999px; font-size: 10px; font-weight: 800; padding: 5px 12px; letter-spacing: 0.06em; }
    .footer-actions { padding: 16px 20px 8px; display: flex; flex-direction: column; gap: 10px; border-top: 1px solid var(--border); flex-shrink: 0; }
    .secondary-btn { width: 100%; background: white; color: var(--text); border: 1.5px solid var(--border); border-radius: var(--radius); padding: 13px; font-family: inherit; font-size: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; }
    .secondary-btn:hover { border-color: var(--primary); color: var(--primary); }
    .inv-field-row { display: flex; align-items: center; gap: 12px; background: #f8f7f6; border: 1.5px solid var(--border); border-radius: var(--radius-sm); padding: 14px 16px; }
    .inv-field-icon { color: var(--primary); flex-shrink: 0; }
    .inv-field-info { flex: 1; }
    .inv-field-label { font-size: 10px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.07em; }
    .inv-input { background: none; border: none; outline: none; font-family: inherit; font-size: 15px; font-weight: 800; color: var(--text); width: 100%; }
    .cond-check { display: flex; align-items: center; gap: 12px; padding: 13px 16px; background: white; border: 1.5px solid var(--border); border-radius: var(--radius-sm); cursor: pointer; transition: border-color 0.2s; }
    .cond-check.checked { border-color: var(--success); background: var(--success-bg); }
    .cond-box { width: 22px; height: 22px; border-radius: 6px; border: 2px solid var(--border); background: white; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.2s; font-size: 13px; }
    .cond-check.checked .cond-box { background: var(--success); border-color: var(--success); color: white; }
    .cond-text { font-size: 13px; font-weight: 600; }
    .qr-generated { background: white; border: 1.5px solid var(--border); border-radius: var(--radius); padding: 24px 20px; display: flex; flex-direction: column; align-items: center; gap: 12px; }

    /* ─── FOTOS ─── */
    .photos-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
    .photo-thumb { aspect-ratio: 1; border-radius: 10px; overflow: hidden; position: relative; background: #f3f0ed; cursor: pointer; }
    .photo-thumb img { width: 100%; height: 100%; object-fit: cover; }
    .photo-thumb .photo-delete { position: absolute; top: 4px; right: 4px; width: 22px; height: 22px; background: rgba(0,0,0,0.6); border-radius: 50%; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; color: white; font-size: 12px; }
    .photo-add-btn { aspect-ratio: 1; border-radius: 10px; border: 2px dashed var(--border); background: #f8f7f6; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; cursor: pointer; transition: all 0.2s; }
    .photo-add-btn:hover { border-color: var(--primary); background: var(--primary-light); }
    .photo-add-btn span { font-size: 10px; font-weight: 700; color: var(--muted); }
    .photo-lightbox { position: fixed; inset: 0; background: rgba(0,0,0,0.92); z-index: 300; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .photo-lightbox img { max-width: 100%; max-height: 85dvh; border-radius: 12px; object-fit: contain; }
    .photo-lightbox-close { position: absolute; top: 16px; right: 16px; width: 40px; height: 40px; background: rgba(255,255,255,0.15); border: none; border-radius: 50%; color: white; font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; }

    /* ─── SECADO ─── */
    .humidity-ring { position: relative; display: flex; align-items: center; justify-content: center; }
    .humidity-label-center { position: absolute; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .metodo-btn { flex: 1; padding: 12px 8px; border-radius: var(--radius-sm); border: 1.5px solid var(--border); background: white; font-family: inherit; cursor: pointer; text-align: center; transition: all 0.2s; }
    .metodo-btn.selected { border-color: var(--primary); background: var(--primary-light); }
    .metodo-icon { font-size: 22px; display: block; margin-bottom: 4px; }
    .metodo-name { font-size: 12px; font-weight: 800; color: var(--text); }
    .metodo-btn.selected .metodo-name { color: var(--primary); }
    .day-stat-card { background: white; border: 1.5px solid var(--border); border-radius: var(--radius-sm); padding: 12px 14px; }
    .day-stat-label { font-size: 10px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 6px; display: flex; align-items: center; gap: 5px; }
    .day-stat-input { background: none; border: none; outline: none; font-family: inherit; font-size: 22px; font-weight: 800; color: var(--text); width: 100%; }
    .day-stat-unit { font-size: 13px; color: var(--muted); font-weight: 600; }
    .humidity-ok { color: var(--success); }
    .humidity-warn { color: #f59e0b; }
    .humidity-high { color: #dc2626; }
    .completed-banner { background: linear-gradient(135deg, #f0fdf4, #dcfce7); border: 1.5px solid rgba(22,163,74,0.25); border-radius: var(--radius); padding: 20px; display: flex; align-items: center; gap: 14px; }
    .completed-icon { width: 48px; height: 48px; border-radius: 50%; background: var(--success); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

    /* ─── REGISTRO ─── */
    .stepper { display: flex; gap: 6px; }
    .step-bar { height: 5px; flex: 1; border-radius: 999px; background: var(--primary-light); }
    .step-bar.done { background: var(--primary); }
    .step-label { font-size: 10px; font-weight: 800; color: var(--primary); letter-spacing: 0.1em; text-transform: uppercase; margin-top: 8px; }
    .field-label { font-size: 10px; font-weight: 700; color: var(--muted); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 6px; margin-left: 2px; }
    .field-wrap { position: relative; }
    .field-input, .field-select { width: 100%; background: #f8f7f6; border: 1.5px solid var(--border); border-radius: var(--radius-sm); padding: 14px 16px; font-family: inherit; font-size: 14px; color: var(--text); outline: none; transition: border-color 0.2s; appearance: none; }
    .field-input:focus, .field-select:focus { border-color: var(--primary); background: white; }
    .field-icon { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); font-size: 18px; color: var(--muted); pointer-events: none; }
    .variety-btn { flex: 1; padding: 12px 8px; border-radius: var(--radius-sm); border: 1.5px solid var(--border); background: white; font-family: inherit; cursor: pointer; text-align: center; transition: all 0.2s; }
    .variety-btn.selected { border-color: var(--primary); background: var(--primary-light); }
    .variety-type { font-size: 9px; font-weight: 700; color: var(--muted); letter-spacing: 0.06em; text-transform: uppercase; display: block; margin-bottom: 4px; }
    .variety-name { font-size: 13px; font-weight: 800; color: var(--text); }
    .variety-btn.selected .variety-name { color: var(--primary); }
    .check-label { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: #f8f7f6; border: 1.5px solid var(--border); border-radius: var(--radius-sm); cursor: pointer; }
    .check-label input[type="checkbox"] { width: 20px; height: 20px; border-radius: 6px; accent-color: var(--primary); cursor: pointer; flex-shrink: 0; }
    .check-text { font-size: 13px; font-weight: 500; }

    /* ─── PARCELAS ─── */
    .parcel-card { background: white; border: 1.5px solid var(--border); border-radius: var(--radius); padding: 16px 18px; display: flex; align-items: center; gap: 14px; }
    .parcel-icon { width: 46px; height: 46px; border-radius: 14px; background: var(--primary-light); display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }
    .parcel-info { flex: 1; min-width: 0; }
    .parcel-name { font-size: 15px; font-weight: 800; }
    .parcel-chips { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px; }
    .parcel-chip { background: #f3f0ed; border-radius: 8px; padding: 3px 10px; font-size: 11px; font-weight: 700; color: var(--muted); display: flex; align-items: center; gap: 4px; }
    .parcel-chip.primary { background: var(--primary-light); color: var(--primary); }
    .parcel-delete-btn { width: 34px; height: 34px; border-radius: 50%; background: #fef2f2; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #dc2626; flex-shrink: 0; }
    .size-display { text-align: center; font-size: 38px; font-weight: 800; color: var(--primary); line-height: 1; }
    .size-unit { font-size: 13px; color: var(--muted); text-align: center; margin: 4px 0 14px; }
    .size-slider { width: 100%; -webkit-appearance: none; appearance: none; height: 6px; border-radius: 999px; outline: none; cursor: pointer; background: linear-gradient(to right, var(--primary) 0%, var(--primary) var(--pct,0%), #ede9e4 var(--pct,0%), #ede9e4 100%); }
    .size-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 26px; height: 26px; border-radius: 50%; background: var(--primary); box-shadow: 0 2px 8px var(--primary-glow); cursor: pointer; }
    .size-row { display: flex; justify-content: space-between; font-size: 10px; color: var(--muted); font-weight: 600; margin-top: 6px; }
    .parcelas-summary { background: var(--primary-light); border: 1.5px solid rgba(212,115,17,0.2); border-radius: var(--radius); padding: 16px 20px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; text-align: center; margin-top: 20px; }
    .summary-val { font-size: 22px; font-weight: 800; color: var(--primary); }
    .summary-lbl { font-size: 9px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; margin-top: 2px; }

    /* ─── MODAL ─── */
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 200; display: flex; align-items: flex-end; justify-content: center; }
    .modal-sheet { background: white; border-radius: 24px 24px 0 0; padding: 0 20px 40px; width: 100%; max-width: 430px; animation: slideUp 0.28s ease; max-height: 92dvh; overflow-y: auto; }
    .modal-sheet::-webkit-scrollbar { display: none; }
    @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
    .modal-handle { width: 40px; height: 4px; background: #e5e5e5; border-radius: 999px; margin: 14px auto 18px; }
    .modal-title { font-size: 18px; font-weight: 800; margin-bottom: 22px; text-align: center; }

    /* ─── UTILS ─── */
    .save-indicator { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--success); font-weight: 700; opacity: 0; transition: opacity 0.3s; }
    .save-indicator.visible { opacity: 1; }
    .toast { position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%); background: #1a1208; color: white; border-radius: var(--radius-sm); padding: 10px 20px; font-size: 13px; font-weight: 600; box-shadow: 0 8px 24px rgba(0,0,0,0.2); z-index: 999; opacity: 0; transition: opacity 0.3s, bottom 0.3s; white-space: nowrap; }
    .toast.show { opacity: 1; bottom: 110px; }
    .px { padding-left: 20px; padding-right: 20px; }
    .py { padding-top: 12px; padding-bottom: 12px; }
    .space-y > * + * { margin-top: 12px; }
    .space-y-sm > * + * { margin-top: 8px; }
    .mb-6 { margin-bottom: 20px; }
    .mb-4 { margin-bottom: 14px; }
    .mb-2 { margin-bottom: 8px; }
    .mt-4 { margin-top: 14px; }
    .page-enter { animation: fadeSlideIn 0.3s ease both; }
    @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .material-icons { font-family: 'Material Icons'; font-style: normal; font-size: 20px; display: inline-block; vertical-align: middle; line-height: 1; }
  `}</style>
);

export default IonicStyles;
