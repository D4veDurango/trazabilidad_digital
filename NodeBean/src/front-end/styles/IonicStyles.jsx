// ─── ESTILOS GLOBALES MEJORADOS ────────────────────────────────────────────────
// Responsive, floating nav, micro-animations, profesional

const IonicStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500&display=swap');

    :root {
      --primary: #c46a10;
      --primary-2: #e07e20;
      --primary-light: rgba(196,106,16,0.10);
      --primary-glow: rgba(196,106,16,0.22);
      --bg: #f5f2ee;
      --bg-2: #ede9e3;
      --card: #ffffff;
      --border: rgba(0,0,0,0.07);
      --border-2: rgba(0,0,0,0.12);
      --text: #1c140a;
      --muted: #7a6f5f;
      --muted-2: #a89880;
      --success: #15803d;
      --success-bg: #f0fdf4;
      --danger: #dc2626;
      --warning: #d97706;
      --radius: 18px;
      --radius-sm: 11px;
      --radius-xs: 7px;
      --shadow: 0 4px 24px rgba(0,0,0,0.07);
      --shadow-md: 0 8px 32px rgba(0,0,0,0.10);
      --shadow-primary: 0 8px 32px rgba(196,106,16,0.22);
      --nav-h: 72px;
      --font-display: 'Lora', Georgia, serif;
      --font-body: 'Sora', system-ui, sans-serif;
      --font-mono: 'JetBrains Mono', 'Courier New', monospace;
      --transition: 0.22s cubic-bezier(0.4,0,0.2,1);
      --transition-spring: 0.38s cubic-bezier(0.34,1.56,0.64,1);
    }

    /* ─── RESET & BASE ──────────────────────────────────────────────── */
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-tap-highlight-color: transparent;
    }

    html { scroll-behavior: smooth; }

    body {
      font-family: var(--font-body);
      background: var(--bg);
      color: var(--text);
      min-height: 100dvh;
      display: flex;
      align-items: center;
      justify-content: center;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    /* Forzar fuente en TODOS los elementos interactivos */
    input, select, textarea, button {
      font-family: var(--font-body);
    }

    /* ─── APP SHELL ─────────────────────────────────────────────────── */
    .app-shell {
      width: 100%;
      max-width: 480px;
      min-height: 100dvh;
      background: var(--card);
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
      box-shadow: 0 0 100px rgba(0,0,0,0.15);
      /* Safe area arriba (notch/isla dinámica) */
      padding-top: env(safe-area-inset-top, 0px);
      /* Espacio para el nav flotante abajo */
      padding-bottom: calc(var(--nav-h) + env(safe-area-inset-bottom, 12px) + 8px);
    }

    /* En nativo y mobile puro */
    body.is-native { background: var(--card); align-items: flex-start; }
    body.is-native .app-shell { max-width: 100%; width: 100vw; box-shadow: none; }

    @media (max-width: 520px) {
      html, body { align-items: flex-start; background: var(--card); }
      .app-shell { max-width: 100%; box-shadow: none; }
    }

    /* ─── STATUS BAR ─────────────────────────────────────────────────── */
    .status-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 22px 8px;
      font-size: 11px;
      font-weight: 700;
      color: var(--muted);
      flex-shrink: 0;
      letter-spacing: 0.02em;
    }
    .status-icons {
      display: flex;
      gap: 5px;
      align-items: center;
      font-size: 14px;
    }

    /* ─── FLOATING BOTTOM NAV ────────────────────────────────────────── */
    .bottom-nav {
      position: fixed;
      bottom: calc(env(safe-area-inset-bottom, 0px) + 14px);
      left: 50%;
      transform: translateX(-50%);
      width: min(calc(100% - 32px), 448px);
      background: rgba(28,20,10,0.92);
      backdrop-filter: blur(24px) saturate(1.8);
      -webkit-backdrop-filter: blur(24px) saturate(1.8);
      border: 1px solid rgba(255,255,255,0.09);
      border-radius: 999px;
      display: flex;
      justify-content: space-around;
      align-items: center;
      padding: 8px 6px;
      z-index: 200;
      box-shadow:
        0 8px 40px rgba(0,0,0,0.32),
        0 2px 8px rgba(0,0,0,0.18),
        inset 0 1px 0 rgba(255,255,255,0.07);
      animation: navSlideUp 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
    }

    @keyframes navSlideUp {
      from { transform: translateX(-50%) translateY(100px); opacity: 0; }
      to   { transform: translateX(-50%) translateY(0);    opacity: 1; }
    }

    .nav-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      background: none;
      border: none;
      cursor: pointer;
      color: rgba(255,255,255,0.38);
      font-family: var(--font-body);
      font-size: 8.5px;
      font-weight: 600;
      letter-spacing: 0.03em;
      padding: 7px 10px;
      border-radius: 999px;
      transition: color var(--transition), background var(--transition), transform var(--transition-spring);
      flex: 1;
      min-width: 0;
      position: relative;
    }
    .nav-btn .icon { font-size: 20px; transition: transform var(--transition-spring); }
    .nav-btn:hover { color: rgba(255,255,255,0.7); }
    .nav-btn:active { transform: scale(0.92); }

    .nav-btn.active {
      color: var(--text);
      background: var(--card);
      box-shadow: 0 2px 12px rgba(0,0,0,0.18);
    }
    .nav-btn.active .icon {
      color: var(--primary);
      transform: translateY(-2px) scale(1.08);
    }
    .nav-btn.active {
      animation: navBtnPop var(--transition-spring) both;
    }
    @keyframes navBtnPop {
      from { transform: scale(0.92); }
      to   { transform: scale(1); }
    }

    /* ─── HEADERS ────────────────────────────────────────────────────── */
    .page-header, .screen-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px 18px;
      border-bottom: 1px solid var(--border);
      flex-shrink: 0;
      min-height: 68px;
      animation: headerFade 0.3s ease both;
    }
    @keyframes headerFade {
      from { opacity: 0; transform: translateY(-6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .screen-header-info { display: flex; flex-direction: column; gap: 2px; }
    .page-title {
      font-family: var(--font-display);
      font-size: 18px;
      font-weight: 800;
      letter-spacing: -0.02em;
    }
    .page-subtitle { font-size: 11px; color: var(--muted); font-weight: 500; }
    .header-icon-btn {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: var(--bg);
      border: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 18px;
      color: var(--muted);
      transition: all var(--transition);
      flex-shrink: 0;
    }
    .header-icon-btn:hover {
      background: var(--primary-light);
      color: var(--primary);
      border-color: rgba(196,106,16,0.25);
      transform: scale(1.06);
    }
    .header-icon-btn:active { transform: scale(0.95); }

    /* ─── SCROLLABLE CONTENT ─────────────────────────────────────────── */
    .page-scroll {
      flex: 1;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      padding-bottom: 16px;
      padding-top: 16px;
      scroll-behavior: smooth;
    }
    .page-scroll::-webkit-scrollbar { display: none; }

    /* ─── PAGE TRANSITIONS ───────────────────────────────────────────── */
    .page-enter {
      animation: pageEnter 0.32s cubic-bezier(0.4,0,0.2,1) both;
    }
    @keyframes pageEnter {
      from { opacity: 0; transform: translateX(16px); }
      to   { opacity: 1; transform: translateX(0); }
    }

    /* ─── LOADING / SPINNER ──────────────────────────────────────────── */
    .loading-screen {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 18px;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--primary-light);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.75s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ─── LOGIN ──────────────────────────────────────────────────────── */
    .login-screen {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      padding: 0 clamp(20px,5vw,36px) clamp(28px,6vw,44px);
      gap: 0;
      position: relative;
      overflow: hidden;
      background: linear-gradient(180deg,
        #0e0a05 0%,
        #1a1008 35%,
        #221508 60%,
        #f5f2ee 60%,
        #f5f2ee 100%
      );
    }

    /* ── Círculos decorativos de fondo ── */
    .login-bg-deco { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
    .login-deco-circle {
      position: absolute;
      border-radius: 50%;
      opacity: 0.18;
    }
    .login-deco-1 {
      width: 320px; height: 320px;
      background: radial-gradient(circle, #c46a10, transparent 70%);
      top: -60px; left: -80px;
      animation: deco1float 8s ease-in-out infinite;
    }
    .login-deco-2 {
      width: 200px; height: 200px;
      background: radial-gradient(circle, #e07e20, transparent 70%);
      top: 80px; right: -40px;
      animation: deco1float 11s ease-in-out infinite reverse;
    }
    .login-deco-3 {
      width: 140px; height: 140px;
      background: radial-gradient(circle, #c46a10, transparent 70%);
      top: 200px; left: 20px;
      animation: deco1float 7s ease-in-out 2s infinite;
    }
    @keyframes deco1float {
      0%,100% { transform: translateY(0) scale(1); }
      50%      { transform: translateY(-18px) scale(1.06); }
    }

    /* ── Mascota ── */
    .login-mascot-wrap {
      position: relative;
      z-index: 2;
      margin-bottom: -8px;
      animation: mascotEntrance 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.1s both;
    }
    @keyframes mascotEntrance {
      from { transform: translateY(60px) scale(0.8); opacity: 0; }
      to   { transform: translateY(0) scale(1); opacity: 1; }
    }
    .login-mascot {
      width: clamp(180px, 48vw, 240px);
      height: auto;
      display: block;
      filter: drop-shadow(0 24px 48px rgba(196,106,16,0.45));
      /* Leve flotación continua */
      animation:
        mascotEntrance 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.1s both,
        mascotFloat 4s ease-in-out 1s infinite;
    }
    @keyframes mascotFloat {
      0%,100% { transform: translateY(0); }
      50%      { transform: translateY(-10px); }
    }
    .login-mascot-shadow {
      width: clamp(100px, 28vw, 140px);
      height: 18px;
      background: rgba(0,0,0,0.25);
      border-radius: 50%;
      margin: 0 auto;
      filter: blur(8px);
      animation: shadowPulse 4s ease-in-out 1s infinite;
    }
    @keyframes shadowPulse {
      0%,100% { transform: scaleX(1);    opacity: 0.25; }
      50%      { transform: scaleX(0.82); opacity: 0.14; }
    }

    /* ── Card blanca inferior ── */
    .login-brand {
      position: relative;
      z-index: 2;
      text-align: center;
      margin-top: 20px;
      animation: fadeUp 0.5s ease 0.5s both;
    }
    .login-brand-name {
      font-family: var(--font-display);
      font-size: clamp(28px, 7vw, 36px);
      font-weight: 700;
      color: var(--text);
      letter-spacing: -0.03em;
      line-height: 1;
    }
    .login-brand-tagline {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--primary);
      margin-top: 6px;
    }

    .login-sub {
      position: relative;
      z-index: 2;
      font-size: 13.5px;
      font-weight: 400;
      color: var(--muted);
      text-align: center;
      margin-top: 10px;
      margin-bottom: 28px;
      line-height: 1.7;
      animation: fadeUp 0.5s ease 0.6s both;
    }

    .google-btn {
      position: relative;
      z-index: 2;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      background: var(--text);
      border: none;
      border-radius: var(--radius);
      padding: 17px 20px;
      font-family: var(--font-body);
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      color: white;
      animation: fadeUp 0.5s ease 0.7s both;
      transition: all var(--transition);
      letter-spacing: 0.01em;
      box-shadow: 0 8px 32px rgba(0,0,0,0.22);
      overflow: hidden;
    }
    .google-btn::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(196,106,16,0.15) 0%, transparent 60%);
      opacity: 0;
      transition: opacity var(--transition);
    }
    .google-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 40px rgba(0,0,0,0.28);
    }
    .google-btn:hover::before { opacity: 1; }
    .google-btn:active { transform: scale(0.98) translateY(0); }
    .google-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    .google-btn-icon {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
      background: white;
      border-radius: 4px;
      padding: 2px;
    }

    .login-region-badge {
      position: relative;
      z-index: 2;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-top: 16px;
      background: rgba(196,106,16,0.1);
      border: 1px solid rgba(196,106,16,0.2);
      border-radius: 999px;
      padding: 6px 14px;
      font-size: 11px;
      font-weight: 600;
      color: var(--primary);
      letter-spacing: 0.02em;
      animation: fadeUp 0.5s ease 0.8s both;
    }

    .login-footer {
      position: relative;
      z-index: 2;
      margin-top: 18px;
      font-size: 10.5px;
      color: var(--muted-2);
      text-align: center;
      line-height: 1.7;
      animation: fadeUp 0.5s ease 0.9s both;
    }
    .login-error {
      position: relative;
      z-index: 2;
      background: #fef2f2;
      border: 1.5px solid rgba(220,38,38,0.2);
      border-radius: var(--radius-sm);
      padding: 12px 16px;
      font-size: 13px;
      color: var(--danger);
      text-align: center;
      margin-bottom: 16px;
      width: 100%;
      animation: shake 0.4s ease;
    }
    @keyframes shake {
      0%,100% { transform: translateX(0); }
      25%      { transform: translateX(-6px); }
      75%      { transform: translateX(6px); }
    }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ─── PANEL ──────────────────────────────────────────────────────── */
    .farmer-info { display: flex; align-items: center; gap: 14px; }
    .avatar {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      overflow: hidden;
      border: 2.5px solid var(--primary);
      flex-shrink: 0;
      transition: transform var(--transition-spring);
    }
    .avatar:hover { transform: scale(1.06); }
    .avatar img { width: 100%; height: 100%; object-fit: cover; }
    .avatar-placeholder {
      width: 100%;
      height: 100%;
      background: var(--primary-light);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-display);
      font-size: 22px;
      font-weight: 800;
      color: var(--primary);
    }
    .farmer-name {
      font-family: var(--font-display);
      font-size: 17px;
      font-weight: 700;
      line-height: 1;
    }
    .farmer-loc {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 10px;
      font-weight: 600;
      color: var(--muted);
      letter-spacing: 0.06em;
      text-transform: uppercase;
      margin-top: 5px;
    }

    /* ─── BOTONES ────────────────────────────────────────────────────── */
    .primary-btn {
      width: 100%;
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-2) 100%);
      color: white;
      border: none;
      border-radius: var(--radius);
      padding: 16px 20px;
      font-family: var(--font-body);
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: var(--shadow-primary);
      transition: all var(--transition);
      letter-spacing: 0.01em;
      position: relative;
      overflow: hidden;
    }
    .primary-btn::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
      opacity: 0;
      transition: opacity var(--transition);
    }
    .primary-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(196,106,16,0.32); }
    .primary-btn:hover::after { opacity: 1; }
    .primary-btn:active { transform: scale(0.98) translateY(0); }
    .primary-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; box-shadow: none; }

    .secondary-btn {
      width: 100%;
      background: white;
      color: var(--text);
      border: 1.5px solid var(--border-2);
      border-radius: var(--radius);
      padding: 14px 20px;
      font-family: var(--font-body);
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all var(--transition);
    }
    .secondary-btn:hover { border-color: var(--primary); color: var(--primary); transform: translateY(-1px); box-shadow: 0 4px 16px rgba(0,0,0,0.07); }
    .secondary-btn:active { transform: scale(0.98); }

    /* ─── SECTION TITLE ──────────────────────────────────────────────── */
    .section-title {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--muted);
      margin-bottom: 14px;
    }

    /* ─── ACTIVE LOT CARD ────────────────────────────────────────────── */
    .active-lot-card {
      background: linear-gradient(135deg, #fdf0e0 0%, #fff8f0 100%);
      border: 1.5px solid rgba(196,106,16,0.18);
      border-radius: var(--radius);
      padding: 20px;
      position: relative;
      overflow: hidden;
      cursor: pointer;
      transition: all var(--transition);
    }
    .active-lot-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0;
      width: 4px; height: 100%;
      background: linear-gradient(180deg, var(--primary), var(--primary-2));
      border-radius: 2px 0 0 2px;
    }
    .active-lot-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 40px rgba(196,106,16,0.18);
      border-color: rgba(196,106,16,0.32);
    }
    .active-lot-card:active { transform: scale(0.99); }

    .lot-badge {
      display: inline-block;
      background: var(--primary);
      color: white;
      font-size: 10px;
      font-weight: 800;
      padding: 4px 12px;
      border-radius: 999px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .lot-title {
      font-family: var(--font-display);
      font-size: 20px;
      font-weight: 800;
      margin: 8px 0 6px;
      letter-spacing: -0.02em;
    }
    .ring-progress { position: absolute; top: 16px; right: 16px; width: 54px; height: 54px; }
    .ring-progress svg { transform: rotate(-90deg); }
    .ring-text {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: 800;
      color: var(--primary);
    }
    .lot-desc { font-size: 13px; color: var(--muted); margin-bottom: 14px; line-height: 1.55; }
    .lot-chips { display: flex; gap: 8px; flex-wrap: wrap; }
    .chip {
      display: flex;
      align-items: center;
      gap: 5px;
      background: rgba(21,128,61,0.08);
      color: var(--success);
      border: 1px solid rgba(21,128,61,0.15);
      border-radius: 9px;
      padding: 6px 11px;
      font-size: 11px;
      font-weight: 700;
    }

    /* ─── EMPTY STATE ────────────────────────────────────────────────── */
    .empty-state {
      text-align: center;
      padding: 36px 20px;
      background: var(--bg);
      border-radius: var(--radius);
      border: 1.5px dashed var(--border-2);
    }
    .empty-state-icon { font-size: 48px; margin-bottom: 12px; }
    .empty-state-text { font-size: 14px; font-weight: 500; color: var(--muted); line-height: 1.6; }

    /* ─── GRID / STAGE CARDS ─────────────────────────────────────────── */
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .stage-card {
      background: var(--bg);
      border: 1.5px solid var(--border);
      border-radius: var(--radius);
      padding: clamp(14px,3vw,18px) 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 8px;
      cursor: pointer;
      transition: all var(--transition);
    }
    .stage-card:hover {
      border-color: rgba(196,106,16,0.3);
      transform: translateY(-3px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.07);
    }
    .stage-card:active { transform: scale(0.97); }
    .stage-card.active-stage {
      background: var(--primary-light);
      border-color: rgba(196,106,16,0.3);
    }
    .stage-icon {
      width: 50px;
      height: 50px;
      border-radius: 16px;
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.07);
      transition: transform var(--transition-spring);
    }
    .stage-card:hover .stage-icon { transform: scale(1.12) rotate(-4deg); }
    .stage-card.active-stage .stage-icon {
      background: var(--primary);
      color: white;
      box-shadow: 0 4px 16px var(--primary-glow);
    }
    .stage-name { font-size: 13px; font-weight: 700; }
    .stage-status { font-size: 10px; font-weight: 700; color: var(--muted); letter-spacing: 0.04em; }
    .stage-card.active-stage .stage-status { color: var(--primary); }

    /* ─── FERMENTACIÓN ───────────────────────────────────────────────── */
    .lot-label {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--primary);
    }
    .timeline-wrap {
      position: relative;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .timeline-track {
      position: absolute;
      top: 16px; left: 0; right: 0;
      height: 2px;
      background: var(--bg-2);
      border-radius: 999px;
    }
    .timeline-progress {
      position: absolute;
      top: 16px; left: 0;
      height: 2px;
      background: linear-gradient(90deg, var(--primary), var(--primary-2));
      border-radius: 999px;
      transition: width 0.5s cubic-bezier(0.4,0,0.2,1);
    }
    .day-node {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      position: relative;
      z-index: 1;
    }
    .day-circle {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 800;
      background: var(--bg-2);
      color: var(--muted);
      transition: all var(--transition-spring);
      cursor: pointer;
    }
    .day-circle:hover { transform: scale(1.12); }
    .day-circle.done { background: var(--primary); color: white; }
    .day-circle.current {
      width: 40px;
      height: 40px;
      background: var(--primary);
      color: white;
      box-shadow: 0 0 0 6px rgba(196,106,16,0.15);
      animation: pulseRing 2s ease infinite;
    }
    @keyframes pulseRing {
      0%,100% { box-shadow: 0 0 0 6px rgba(196,106,16,0.15); }
      50%      { box-shadow: 0 0 0 10px rgba(196,106,16,0.07); }
    }
    .day-label { font-size: 10px; font-weight: 700; color: var(--muted); }
    .day-label.current-label { color: var(--primary); font-weight: 800; }

    .gauge-card {
      background: var(--bg);
      border: 1.5px solid var(--border);
      border-radius: var(--radius);
      padding: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .gauge-label {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--muted);
      margin-bottom: 16px;
    }
    .gauge-svg-wrap { position: relative; width: 180px; height: 90px; overflow: hidden; }
    .temp-value { font-family: var(--font-display); font-size: 44px; font-weight: 800; line-height: 1; }
    .temp-unit { font-size: 20px; font-weight: 400; color: var(--muted); }
    .temp-ok {
      font-size: 11px;
      font-weight: 700;
      color: var(--success);
      margin-top: 8px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .info-card {
      background: white;
      border: 1.5px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 14px;
      transition: all var(--transition);
    }
    .info-card:hover { border-color: rgba(196,106,16,0.2); box-shadow: 0 4px 16px rgba(0,0,0,0.05); }
    .info-card-label {
      font-size: 10px;
      font-weight: 700;
      color: var(--muted);
      letter-spacing: 0.06em;
      text-transform: uppercase;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .info-card-value { font-family: var(--font-display); font-size: 15px; font-weight: 700; }
    .info-card-sub { font-size: 10px; color: var(--muted); }

    .img-card {
      border-radius: var(--radius);
      overflow: hidden;
      height: 130px;
      position: relative;
      transition: transform var(--transition);
    }
    .img-card:hover { transform: scale(1.01); }
    .img-card img { width: 100%; height: 100%; object-fit: cover; }
    .img-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.68), transparent 60%);
      display: flex;
      align-items: flex-end;
      padding: 14px;
    }
    .img-overlay span { color: white; font-size: 11px; font-weight: 600; line-height: 1.4; }

    .action-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      background: var(--primary-light);
      border: 1.5px solid rgba(196,106,16,0.18);
      border-radius: var(--radius);
      transition: all var(--transition);
    }
    .action-card:hover { transform: translateX(3px); border-color: rgba(196,106,16,0.35); }
    .action-card.muted { background: white; border-color: var(--border); opacity: 0.6; }
    .action-card.muted:hover { transform: none; }
    .action-icon {
      width: 44px;
      height: 44px;
      border-radius: 14px;
      background: var(--primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      flex-shrink: 0;
      box-shadow: 0 4px 16px var(--primary-glow);
    }
    .action-card.muted .action-icon { background: var(--bg); color: var(--muted); box-shadow: none; }
    .action-info { flex: 1; margin: 0 12px; }
    .action-name { font-size: 14px; font-weight: 700; }
    .action-sub { font-size: 11px; color: var(--muted); margin-top: 2px; }
    .action-btn {
      background: var(--primary);
      color: white;
      border: none;
      border-radius: var(--radius-sm);
      padding: 9px 16px;
      font-family: var(--font-body);
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 12px var(--primary-glow);
      white-space: nowrap;
      transition: all var(--transition);
    }
    .action-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px var(--primary-glow); }
    .action-btn:active { transform: scale(0.96); }
    .action-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    .action-btn-text {
      background: none;
      border: none;
      color: var(--primary);
      font-family: var(--font-body);
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      cursor: pointer;
      transition: opacity var(--transition);
    }
    .action-btn-text:hover { opacity: 0.7; }

    /* ─── INVENTARIO ─────────────────────────────────────────────────── */
    .status-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--success);
      animation: blink 2s ease infinite;
    }
    @keyframes blink {
      0%,100% { opacity: 1; }
      50%      { opacity: 0.4; }
    }
    .footer-actions {
      padding: 16px 20px 12px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      border-top: 1px solid var(--border);
      flex-shrink: 0;
      background: rgba(255,255,255,0.95);
      backdrop-filter: blur(16px);
    }
    .inv-field-row {
      display: flex;
      align-items: center;
      gap: 12px;
      background: var(--bg);
      border: 1.5px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 14px 16px;
      transition: border-color var(--transition);
    }
    .inv-field-row:focus-within {
      border-color: var(--primary);
      background: white;
    }
    .inv-field-icon { color: var(--primary); flex-shrink: 0; }
    .inv-field-info { flex: 1; min-width: 0; }
    .inv-field-label {
      font-size: 10px;
      font-weight: 700;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.07em;
    }
    .inv-input {
      background: none;
      border: none;
      outline: none;
      font-family: var(--font-body);
      font-size: 15px;
      font-weight: 700;
      color: var(--text);
      width: 100%;
    }
    .cond-check {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 13px 16px;
      background: white;
      border: 1.5px solid var(--border);
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all var(--transition);
    }
    .cond-check:hover { border-color: rgba(196,106,16,0.3); }
    .cond-check.checked {
      border-color: var(--success);
      background: var(--success-bg);
    }
    .cond-box {
      width: 22px;
      height: 22px;
      border-radius: 7px;
      border: 2px solid var(--border-2);
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all var(--transition-spring);
      font-size: 13px;
    }
    .cond-check.checked .cond-box {
      background: var(--success);
      border-color: var(--success);
      color: white;
      transform: scale(1.05);
    }
    .cond-text { font-size: 13px; font-weight: 500; }

    /* ─── FOTOS ──────────────────────────────────────────────────────── */
    .photos-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
    .photo-thumb {
      aspect-ratio: 1;
      border-radius: var(--radius-sm);
      overflow: hidden;
      position: relative;
      background: var(--bg-2);
      cursor: pointer;
      transition: transform var(--transition);
    }
    .photo-thumb:hover { transform: scale(1.04); }
    .photo-thumb img { width: 100%; height: 100%; object-fit: cover; }
    .photo-thumb .photo-delete {
      position: absolute;
      top: 4px; right: 4px;
      width: 22px; height: 22px;
      background: rgba(0,0,0,0.65);
      border-radius: 50%;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: white;
      font-size: 12px;
      opacity: 0;
      transition: opacity var(--transition);
    }
    .photo-thumb:hover .photo-delete { opacity: 1; }
    .photo-add-btn {
      aspect-ratio: 1;
      border-radius: var(--radius-sm);
      border: 2px dashed var(--border-2);
      background: var(--bg);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 5px;
      cursor: pointer;
      transition: all var(--transition);
    }
    .photo-add-btn:hover {
      border-color: var(--primary);
      background: var(--primary-light);
      transform: scale(1.04);
    }
    .photo-add-btn span { font-size: 10px; font-weight: 700; color: var(--muted); }
    .photo-lightbox {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.94);
      z-index: 300;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      animation: fadeIn 0.2s ease both;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .photo-lightbox img {
      max-width: 100%;
      max-height: 85dvh;
      border-radius: 14px;
      object-fit: contain;
      animation: zoomIn 0.25s cubic-bezier(0.4,0,0.2,1) both;
    }
    @keyframes zoomIn {
      from { transform: scale(0.9); }
      to   { transform: scale(1); }
    }
    .photo-lightbox-close {
      position: absolute;
      top: 16px; right: 16px;
      width: 42px; height: 42px;
      background: rgba(255,255,255,0.14);
      border: none;
      border-radius: 50%;
      color: white;
      font-size: 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background var(--transition);
    }
    .photo-lightbox-close:hover { background: rgba(255,255,255,0.24); }

    /* ─── SECADO ─────────────────────────────────────────────────────── */
    .humidity-ring { position: relative; display: flex; align-items: center; justify-content: center; }
    .humidity-label-center {
      position: absolute;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .metodo-btn {
      flex: 1;
      padding: 12px 8px;
      border-radius: var(--radius-sm);
      border: 1.5px solid var(--border);
      background: white;
      font-family: var(--font-body);
      cursor: pointer;
      text-align: center;
      transition: all var(--transition);
    }
    .metodo-btn:hover { border-color: rgba(196,106,16,0.3); transform: translateY(-2px); }
    .metodo-btn.selected {
      border-color: var(--primary);
      background: var(--primary-light);
      transform: translateY(-2px);
      box-shadow: 0 4px 16px var(--primary-glow);
    }
    .metodo-icon { font-size: 22px; display: block; margin-bottom: 4px; }
    .metodo-name { font-size: 12px; font-weight: 800; color: var(--text); }
    .metodo-btn.selected .metodo-name { color: var(--primary); }
    .day-stat-card {
      background: white;
      border: 1.5px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 14px;
      transition: border-color var(--transition);
    }
    .day-stat-card:focus-within { border-color: var(--primary); }
    .day-stat-label {
      font-size: 10px;
      font-weight: 700;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.07em;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .day-stat-input {
      background: none;
      border: none;
      outline: none;
      font-family: var(--font-display);
      font-size: 24px;
      font-weight: 800;
      color: var(--text);
      width: 100%;
    }
    .day-stat-unit { font-size: 13px; color: var(--muted); font-weight: 500; }
    .completed-banner {
      background: linear-gradient(135deg, #f0fdf4, #dcfce7);
      border: 1.5px solid rgba(22,163,74,0.22);
      border-radius: var(--radius);
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 14px;
      animation: slideIn 0.4s var(--transition-spring) both;
    }
    @keyframes slideIn {
      from { transform: translateX(-16px); opacity: 0; }
      to   { transform: translateX(0); opacity: 1; }
    }
    .completed-icon {
      width: 50px;
      height: 50px;
      border-radius: 16px;
      background: var(--success);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 16px rgba(21,128,61,0.3);
    }

    /* ─── REGISTRO ───────────────────────────────────────────────────── */
    .stepper { display: flex; gap: 6px; }
    .step-bar {
      height: 5px;
      flex: 1;
      border-radius: 999px;
      background: var(--bg-2);
      transition: background 0.4s ease;
    }
    .step-bar.done { background: var(--primary); }
    .step-label {
      font-size: 10px;
      font-weight: 800;
      color: var(--primary);
      letter-spacing: 0.1em;
      text-transform: uppercase;
      margin-top: 8px;
    }
    .field-label {
      font-size: 10px;
      font-weight: 700;
      color: var(--muted);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 7px;
      margin-left: 2px;
    }
    .field-wrap { position: relative; }
    .field-input, .field-select {
      width: 100%;
      background: var(--bg);
      border: 1.5px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 14px 16px;
      font-family: var(--font-body);
      font-size: 14px;
      color: var(--text);
      outline: none;
      transition: all var(--transition);
      appearance: none;
    }
    .field-input:focus, .field-select:focus {
      border-color: var(--primary);
      background: white;
      box-shadow: 0 0 0 3px rgba(196,106,16,0.1);
    }
    .field-icon {
      position: absolute;
      right: 14px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 18px;
      color: var(--muted);
      pointer-events: none;
    }
    .variety-btn {
      flex: 1;
      padding: 12px 8px;
      border-radius: var(--radius-sm);
      border: 1.5px solid var(--border);
      background: white;
      font-family: var(--font-body);
      cursor: pointer;
      text-align: center;
      transition: all var(--transition);
    }
    .variety-btn:hover { border-color: rgba(196,106,16,0.3); transform: translateY(-2px); }
    .variety-btn.selected {
      border-color: var(--primary);
      background: var(--primary-light);
      box-shadow: 0 4px 16px var(--primary-glow);
    }
    .variety-type {
      font-size: 9px;
      font-weight: 700;
      color: var(--muted);
      letter-spacing: 0.06em;
      text-transform: uppercase;
      display: block;
      margin-bottom: 4px;
    }
    .variety-name { font-size: 13px; font-weight: 800; color: var(--text); }
    .variety-btn.selected .variety-name { color: var(--primary); }
    .check-label {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      background: var(--bg);
      border: 1.5px solid var(--border);
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all var(--transition);
    }
    .check-label:hover { border-color: rgba(196,106,16,0.3); background: var(--primary-light); }
    .check-label input[type="checkbox"] {
      width: 20px;
      height: 20px;
      border-radius: 6px;
      accent-color: var(--primary);
      cursor: pointer;
      flex-shrink: 0;
    }
    .check-text { font-size: 13px; font-weight: 500; }

    /* ─── PARCELAS ───────────────────────────────────────────────────── */
    .parcel-card {
      background: white;
      border: 1.5px solid var(--border);
      border-radius: var(--radius);
      padding: 16px 18px;
      display: flex;
      align-items: center;
      gap: 14px;
      transition: all var(--transition);
    }
    .parcel-card:hover {
      border-color: rgba(196,106,16,0.2);
      transform: translateX(4px);
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
    }
    .parcel-icon {
      width: 48px;
      height: 48px;
      border-radius: 16px;
      background: var(--primary-light);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      flex-shrink: 0;
      transition: transform var(--transition-spring);
    }
    .parcel-card:hover .parcel-icon { transform: scale(1.1) rotate(-4deg); }
    .parcel-info { flex: 1; min-width: 0; }
    .parcel-name { font-size: 15px; font-weight: 800; }
    .parcel-chips { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px; }
    .parcel-chip {
      background: var(--bg-2);
      border-radius: 8px;
      padding: 3px 10px;
      font-size: 11px;
      font-weight: 700;
      color: var(--muted);
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .parcel-chip.primary { background: var(--primary-light); color: var(--primary); }
    .parcel-delete-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #fef2f2;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--danger);
      flex-shrink: 0;
      transition: all var(--transition);
    }
    .parcel-delete-btn:hover { background: #fee2e2; transform: scale(1.1); }

    .size-display {
      text-align: center;
      font-family: var(--font-display);
      font-size: 40px;
      font-weight: 800;
      color: var(--primary);
      line-height: 1;
    }
    .size-unit { font-size: 13px; color: var(--muted); text-align: center; margin: 4px 0 14px; }
    .size-slider {
      width: 100%;
      -webkit-appearance: none;
      appearance: none;
      height: 6px;
      border-radius: 999px;
      outline: none;
      cursor: pointer;
      background: linear-gradient(to right, var(--primary) 0%, var(--primary) var(--pct,0%), var(--bg-2) var(--pct,0%), var(--bg-2) 100%);
      transition: background var(--transition);
    }
    .size-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: var(--primary);
      box-shadow: 0 2px 10px var(--primary-glow);
      cursor: pointer;
      transition: transform var(--transition-spring);
    }
    .size-slider::-webkit-slider-thumb:hover { transform: scale(1.15); }
    .size-row {
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: var(--muted-2);
      font-weight: 600;
      margin-top: 6px;
    }
    .parcelas-summary {
      background: var(--primary-light);
      border: 1.5px solid rgba(196,106,16,0.18);
      border-radius: var(--radius);
      padding: 16px 20px;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 8px;
      text-align: center;
      margin-top: 20px;
    }
    .summary-val {
      font-family: var(--font-display);
      font-size: 24px;
      font-weight: 800;
      color: var(--primary);
    }
    .summary-lbl {
      font-size: 9px;
      font-weight: 700;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-top: 2px;
    }

    /* ─── MODAL ──────────────────────────────────────────────────────── */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.48);
      z-index: 200;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      animation: backdropFade 0.2s ease both;
    }
    @keyframes backdropFade {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    .modal-sheet {
      background: white;
      border-radius: 26px 26px 0 0;
      padding: 0 20px 40px;
      width: 100%;
      max-width: 480px;
      animation: sheetSlide 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
      max-height: 92dvh;
      overflow-y: auto;
    }
    .modal-sheet::-webkit-scrollbar { display: none; }
    @keyframes sheetSlide {
      from { transform: translateY(100%); }
      to   { transform: translateY(0); }
    }
    .modal-handle {
      width: 40px;
      height: 4px;
      background: var(--bg-2);
      border-radius: 999px;
      margin: 14px auto 18px;
    }
    .modal-title {
      font-family: var(--font-display);
      font-size: 20px;
      font-weight: 800;
      margin-bottom: 22px;
      text-align: center;
      letter-spacing: -0.02em;
    }

    /* ─── SAVE INDICATOR ─────────────────────────────────────────────── */
    .save-indicator {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      color: var(--success);
      font-weight: 700;
      opacity: 0;
      transform: translateY(4px);
      transition: all 0.3s ease;
    }
    .save-indicator.visible {
      opacity: 1;
      transform: translateY(0);
    }

    /* ─── TOAST ──────────────────────────────────────────────────────── */
    .toast {
      position: fixed;
      bottom: calc(var(--nav-h) + env(safe-area-inset-bottom, 0px) + 22px);
      left: 50%;
      transform: translateX(-50%) translateY(8px);
      background: rgba(28,20,10,0.95);
      color: white;
      border-radius: 999px;
      padding: 11px 22px;
      font-size: 13px;
      font-weight: 600;
      box-shadow: 0 8px 32px rgba(0,0,0,0.25);
      z-index: 190;
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
      white-space: nowrap;
      pointer-events: none;
      border: 1px solid rgba(255,255,255,0.08);
    }
    .toast.show {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }

    /* ─── UTILITIES ──────────────────────────────────────────────────── */
    .px { padding-left: clamp(16px,4vw,24px); padding-right: clamp(16px,4vw,24px); }
    .py { padding-top: 12px; padding-bottom: 12px; }
    .space-y > * + *   { margin-top: 12px; }
    .space-y-sm > * + * { margin-top: 8px; }
    .mb-6 { margin-bottom: 22px; }
    .mb-4 { margin-bottom: 14px; }
    .mb-2 { margin-bottom: 8px; }
    .mt-4 { margin-top: 14px; }

    /* ─── STAGGER ANIMATIONS para listas ─────────────────────────────── */
    .space-y > *:nth-child(1) { animation: fadeUp 0.35s ease 0.05s both; }
    .space-y > *:nth-child(2) { animation: fadeUp 0.35s ease 0.10s both; }
    .space-y > *:nth-child(3) { animation: fadeUp 0.35s ease 0.15s both; }
    .space-y > *:nth-child(4) { animation: fadeUp 0.35s ease 0.20s both; }
    .space-y > *:nth-child(5) { animation: fadeUp 0.35s ease 0.25s both; }
    .space-y > *:nth-child(6) { animation: fadeUp 0.35s ease 0.30s both; }

    .grid-2 > *:nth-child(1) { animation: fadeUp 0.35s ease 0.08s both; }
    .grid-2 > *:nth-child(2) { animation: fadeUp 0.35s ease 0.14s both; }
    .grid-2 > *:nth-child(3) { animation: fadeUp 0.35s ease 0.20s both; }
    .grid-2 > *:nth-child(4) { animation: fadeUp 0.35s ease 0.26s both; }
    .grid-2 > *:nth-child(5) { animation: fadeUp 0.35s ease 0.32s both; }
    .grid-2 > *:nth-child(6) { animation: fadeUp 0.35s ease 0.38s both; }

    /* ─── MATERIAL ICONS ─────────────────────────────────────────────── */
    .material-icons {
      font-family: 'Material Icons';
      font-style: normal;
      font-size: 20px;
      display: inline-block;
      vertical-align: middle;
      line-height: 1;
      transition: transform var(--transition);
    }

    /* ─── RESPONSIVE EXTRAS ──────────────────────────────────────────── */
    @media (max-width: 380px) {
      .bottom-nav { padding: 6px 2px; }
      .nav-btn { padding: 6px 6px; font-size: 7.5px; }
      .nav-btn .icon { font-size: 18px; }
      .grid-2 { grid-template-columns: 1fr 1fr; gap: 9px; }
      .stage-icon { width: 42px; height: 42px; font-size: 18px; }
      .timeline-wrap { gap: 0; }
      .day-circle { width: 28px; height: 28px; font-size: 11px; }
      .day-circle.current { width: 34px; height: 34px; }
    }

    @media (min-width: 520px) {
      .app-shell { border-radius: 24px; margin: 16px; min-height: calc(100dvh - 32px); }
      .bottom-nav { bottom: calc(env(safe-area-inset-bottom, 0px) + 28px); }
    }

    /* Reducir movimiento para accesibilidad */
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
      }
    }
  `}</style>
);

export default IonicStyles;