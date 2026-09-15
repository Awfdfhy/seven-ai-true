(() => {
  'use strict';

  const VERSION = '2026.09-home-v5';
  const BASE_VERSION = '2026.09-launchpad-v4';
  const MARK_VERSION = '2026.09-mark-v2';
  const STYLE_MARKER = '--seven-home-completion-v5';

  const svg = body => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${body}</svg>`;
  const path = d => `<path d="${d}"/>`;
  const ICON = {
    activity: svg(path('M4 13h3l2-5 4 10 2-5h5')),
    plus: svg(path('M12 5v14M5 12h14')),
    mic: svg(path('M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Zm-6 9a6 6 0 0 0 12 0M12 18v3M9 21h6')),
    send: svg(path('M5 12h13m-5-5 5 5-5 5')),
    down: svg(path('m7 9 5 5 5-5')),
    context: svg(path('M5 6h14v12H5V6Zm3 3h8M8 12h5M8 15h7')),
    spark: svg(path('m12 3 1.2 4.8L18 9l-4.8 1.2L12 15l-1.2-4.8L6 9l4.8-1.2L12 3Z')),
    research: svg('<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4M8.5 11h5M11 8.5v5"/>'),
    code: svg(path('m8 8-4 4 4 4m8-8 4 4-4 4m-3-11-2 14')),
    create: svg('<path d="M4 16.5 15.8 4.7l3.5 3.5L7.5 20H4v-3.5Z"/><path d="m13.8 6.7 3.5 3.5"/>'),
    world: svg('<circle cx="12" cy="12" r="8"/><path d="M4.7 9h14.6M4.7 15h14.6M12 4c2 2.4 3 5.1 3 8s-1 5.6-3 8M12 4c-2 2.4-3 5.1-3 8s1 5.6 3 8"/>'),
    home: svg(path('m4 11 8-7 8 7v9h-6v-6h-4v6H4v-9Z')),
    spaces: svg('<rect x="4" y="5" width="10" height="10" rx="2"/><path d="M8 19h10a2 2 0 0 0 2-2V9"/>'),
    library: svg(path('M5 4h4v16H5V4Zm6 2h4v14h-4V6Zm6-2h2v16h-2V4Z')),
    user: svg(path('M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM5 21a7 7 0 0 1 14 0')),
    clock: svg('<circle cx="12" cy="12" r="8"/><path d="M12 8v4.5l3 1.8"/>'),
    chevron: svg(path('m9 6 6 6-6 6')),
    file: svg(path('M7 3h7l4 4v14H7V3Zm7 0v5h5')),
    image: svg('<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="m5 18 5-5 3.2 3.2 2.2-2.2L20 18"/>'),
    camera: svg('<path d="M4 8h3l1.5-2h7L17 8h3v11H4V8Z"/><circle cx="12" cy="13.5" r="3.2"/>'),
    scan: svg(path('M8 4H5a1 1 0 0 0-1 1v3m12-4h3a1 1 0 0 1 1 1v3M8 20H5a1 1 0 0 1-1-1v-3m12 4h3a1 1 0 0 0 1-1v-3M7 12h10')),
    globe: svg('<circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c2.2 2.3 3.2 5 3.2 8s-1 5.7-3.2 8M12 4C9.8 6.3 8.8 9 8.8 12s1 5.7 3.2 8"/>'),
    tool: svg(path('m14.5 6.5 3-3a5 5 0 0 1-6.3 6.3L5.5 15.5a2.1 2.1 0 1 0 3 3l5.7-5.7a5 5 0 0 1 6.3-6.3l-3 3')),
    link: svg(path('M9.5 14.5 14.5 9m-8.7 7.2-1.3 1.3a3.5 3.5 0 0 0 5 5l3-3a3.5 3.5 0 0 0 0-5m5.7-6.7 1.3-1.3a3.5 3.5 0 0 0-5-5l-3 3a3.5 3.5 0 0 0 0 5')),
    search: svg('<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 4.5 4.5"/>'),
    pause: svg('<path d="M8 6v12M16 6v12"/>'),
    stop: svg('<rect x="6" y="6" width="12" height="12" rx="2"/>'),
    retry: svg(path('M20 7v5h-5M4 17v-5h5M6.1 8.2a7 7 0 0 1 11.7-1.7L20 9M4 15l2.2 2.5a7 7 0 0 0 11.7-1.7')),
    close: svg(path('M6 6l12 12M18 6 6 18')),
    check: svg(path('m5 12 4 4L19 6')),
    shield: svg(path('M12 3 5 6v5c0 5 3 8.2 7 10 4-1.8 7-5 7-10V6l-7-3Zm-3 9 2 2 4-5')),
    bolt: svg(path('m13 2-8 12h6l-1 8 9-13h-6V2Z')),
    memory: svg('<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/>')
  };

  function logo(id) {
    return `<svg class="v4-seven-mark seven-mark-polished" data-seven-mark-version="${MARK_VERSION}" viewBox="0 0 100 78" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="v5Loop${id}" x1="8" y1="13" x2="88" y2="19" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#32BECF"/><stop offset=".25" stop-color="#22D3EE"/><stop offset=".56" stop-color="#4166F5"/><stop offset="1" stop-color="#8265DC"/></linearGradient>
        <linearGradient id="v5Tail${id}" x1="78" y1="13" x2="39" y2="70" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#8265DC"/><stop offset=".5" stop-color="#4166F5"/><stop offset="1" stop-color="#32BECF"/></linearGradient>
        <linearGradient id="v5Sheen${id}" x1="13" y1="9" x2="71" y2="26" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity=".46"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
      </defs>
      <path class="seven-mark-loop" fill="url(#v5Loop${id})" fill-rule="evenodd" d="M10.8 11.8C29.4 3.7 61.2 1.8 81.6 5.6c7.8 1.5 10.7 6.8 6.7 12.8-5.1 7.6-20.7 13-41.9 16.3-19.5 3-35.8 1.7-41-6.2-3.7-5.7-.9-12.2 5.4-16.7Zm12.4 8.5c-5.2 2.2-7.2 4.3-5.8 6.4 2.1 3.2 12.5 3.7 25.9 1.6 12.8-2 22.8-5.1 28.1-9.1-14.7-.9-33.5.8-48.2 1.1Z"/>
      <path class="seven-mark-tail" fill="url(#v5Tail${id})" d="M68.2 15.5c4.3-2.7 10-2.4 14 .6 4.1 3.1 4.8 8 1.5 12.3L50 69.1c-3.5 4.3-9.6 5-13.8 1.7-4.2-3.2-4.5-7.8-1.2-12.1l33.2-43.2Z"/>
      <path class="seven-mark-fold" fill="#071B68" fill-opacity=".25" d="M67.2 16.3c5.4-3.3 11.5-2.8 15.2.2-3.6 5.7-9.3 10.7-16.8 14.9l-7.7-5.5 9.3-9.6Z"/>
      <path class="seven-mark-highlight" fill="url(#v5Sheen${id})" d="M13.5 12.4C29.6 6.6 57.7 4.7 77.4 7.9c-17.4.6-39.6 3.6-55.8 9.5-6 2.2-10.5 1.2-8.1-5Z"/>
      <path class="seven-mark-tail-highlight" fill="#fff" fill-opacity=".10" d="M72.2 19.2 42 59.8c-2.4 3.3-2.5 6.4-.6 9 2.6-.3 4.9-1.7 6.7-4L79 27.6c2.5-3.2 2.4-6.4.4-8.7-2.2-1.5-4.8-1.4-7.2.3Z"/>
    </svg>`;
  }

  const ROUTES = 'chat search research coding create world rpg canon real-works spaces projects context memory files pdf vision image camera scan voice tools connectors web models providers compute adaptive-compute verification evidence permissions side-effects recovery integrity evolution repair evals diagnostics settings accessibility rtl performance export import';

  const HOME = `
<main class="seven-screen seven-home-v4 seven-home-v5" data-seven-screen="home" data-seven-home-version="${BASE_VERSION}" data-seven-home-completion="${VERSION}" data-seven-mark-polish="${MARK_VERSION}" data-seven-capability-routes="${ROUTES}">
  <div class="v5-ambient" aria-hidden="true"><i></i><b></b></div>
  <header class="v4-header v5-header">
    <button class="v4-brand v5-brand" aria-label="Seven home" data-v5-toast="Seven is ready">
      <span class="v4-brand-mark">${logo('Header')}</span><span class="v5-wordmark">SEVEN</span>
    </button>
    <div class="v5-header-actions">
      <button class="v4-icon-button v5-icon-button" aria-label="Activity center" data-v5-sheet="activity">${ICON.activity}<span class="v5-notice-dot"></span></button>
      <button class="v4-avatar v5-avatar" aria-label="Profile and settings" data-v5-sheet="profile"><span></span></button>
    </div>
  </header>

  <section class="v4-intro v5-intro" aria-labelledby="v5Title">
    <div><p class="v5-eyebrow">SEVEN · READY</p><h1 id="v5Title">What do you want to do?</h1><p>Start with the goal. Seven can route the models, tools and context.</p></div>
    <button class="v4-ready v5-ready" data-v5-sheet="states" aria-label="Seven status: Ready"><i></i><span>Ready</span></button>
  </section>

  <section class="v4-composer v5-composer" data-seven-component="composer" data-seven-state="idle" aria-label="Universal Composer">
    <div class="v5-focus-halo" aria-hidden="true"></div>
    <div class="v5-composer-top">
      <button class="v4-mode v5-mode" data-v5-sheet="mode" aria-label="Execution mode Auto"><span>${ICON.spark}</span><strong data-v5-mode-label>Auto</strong>${ICON.down}</button>
      <button class="v4-context v5-context" data-v5-sheet="context" aria-label="Choose context">${ICON.context}<span>Context</span><b data-v5-context-count>3</b></button>
    </div>
    <div class="v5-active-chips" aria-live="polite"></div>
    <textarea aria-label="Ask Seven" rows="3" placeholder="Ask Seven anything…"></textarea>
    <div class="v5-composer-footer">
      <button class="v4-add v5-round" aria-label="Add files, images, camera or tools" data-v5-sheet="add">${ICON.plus}</button>
      <span class="v5-input-hint">Files · Images · Tools</span><span class="v5-spacer"></span>
      <button class="v4-voice v5-round" aria-label="Voice" data-v5-sheet="voice">${ICON.mic}</button>
      <button class="v4-send v5-send" aria-label="Send" data-v5-send>${ICON.send}</button>
    </div>
  </section>

  <section class="v4-shortcut-section v5-shortcut-section" aria-labelledby="v5ShortcutsTitle">
    <div class="v4-section-heading v5-section-heading"><h2 id="v5ShortcutsTitle">Start faster</h2><button class="v4-all" data-v5-sheet="command">All capabilities</button></div>
    <div class="v4-shortcuts v5-shortcuts">
      <button class="v4-shortcut research" data-v5-mode="Research"><span>${ICON.research}</span><strong>Research</strong></button>
      <button class="v4-shortcut code" data-v5-mode="Code"><span>${ICON.code}</span><strong>Code</strong></button>
      <button class="v4-shortcut create" data-v5-mode="Create"><span>${ICON.create}</span><strong>Create</strong></button>
      <button class="v4-shortcut world" data-v5-mode="World"><span>${ICON.world}</span><strong>World</strong></button>
    </div>
  </section>

  <section class="v4-now v5-now" aria-labelledby="v5NowTitle">
    <div class="v4-section-heading v5-section-heading"><h2 id="v5NowTitle">Now</h2><button data-v5-sheet="activity">See all</button></div>
    <div class="v4-now-surface v5-now-surface">
      <button class="v4-active-row v5-active-row" data-seven-state="researching" data-v5-sheet="task">
        <span class="v5-state-orb" aria-hidden="true"><i></i><b></b></span>
        <span class="v4-row-copy v5-row-copy"><strong>Exploring modern AI interfaces</strong><small data-v5-task-meta>Researching · 14 sources</small></span>
        <span class="v5-live"><i></i><span data-v5-live-label>Live</span></span><span class="v5-chevron">${ICON.chevron}</span>
      </button>
      <div class="v5-divider" aria-hidden="true"></div>
      <button class="v4-resume-row v5-resume-row" data-v5-toast="Opening Seven AI project">
        <span class="v5-resume-icon">${ICON.clock}</span><span class="v4-row-copy v5-row-copy"><strong>Continue Seven AI</strong><small>Home visual polish · 12 min ago</small></span><span class="v5-chevron">${ICON.chevron}</span>
      </button>
    </div>
  </section>

  <nav class="v4-bottom-nav v5-bottom-nav" aria-label="Primary navigation">
    <button class="active" data-v5-toast="Home"><span>${ICON.home}</span><small>Home</small></button>
    <button data-v5-toast="Spaces"><span>${ICON.spaces}</span><small>Spaces</small></button>
    <button class="v4-orb-button v5-orb-button" aria-label="New task or command" data-v5-sheet="command"><span class="v4-orb-core">${logo('Orb')}</span></button>
    <button data-v5-toast="Library"><span>${ICON.library}</span><small>Library</small></button>
    <button data-v5-sheet="profile"><span>${ICON.user}</span><small>You</small></button>
  </nav>

  <div class="v5-layer" hidden aria-hidden="true">
    <button class="v5-backdrop" aria-label="Close" data-v5-close></button>
    <section class="v5-sheet" role="dialog" aria-modal="true" aria-labelledby="v5SheetTitle"><div class="v5-handle" aria-hidden="true"></div><header><div><p class="v5-sheet-kicker">SEVEN</p><h2 id="v5SheetTitle">Panel</h2></div><button class="v5-sheet-close" aria-label="Close" data-v5-close>${ICON.close}</button></header><div class="v5-sheet-body"></div></section>
  </div>
  <div class="v5-toast" role="status" aria-live="polite"></div>
</main>`;

  const CSS = `
:root{--seven-home-completion-v5:1}
.seven-home-v5{--v5-bg:#070f1e;--v5-bg2:#09172c;--v5-surface:#0d1930;--v5-surface2:#11213d;--v5-surface3:#142745;--v5-text:#f6f8fc;--v5-muted:#9aabc4;--v5-muted2:#7489aa;--v5-line:rgba(128,154,197,.19);--v5-line2:rgba(87,143,241,.39);--v5-blue:#4166f5;--v5-cyan:#32becf;--v5-violet:#8265dc;position:relative;isolation:isolate;min-height:100vh;padding:16px 16px 118px;background:linear-gradient(180deg,#09182f 0%,#081222 45%,#060c18 100%);color:var(--v5-text);overflow-x:hidden;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;-webkit-font-smoothing:antialiased}
.seven-home-v5 *{box-sizing:border-box}.seven-home-v5 button,.seven-home-v5 textarea,.seven-home-v5 input{font:inherit}.seven-home-v5 button{color:inherit;-webkit-tap-highlight-color:transparent;touch-action:manipulation}.seven-home-v5 svg:not(.v4-seven-mark){width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.seven-home-v5 button:focus-visible,.seven-home-v5 textarea:focus-visible,.seven-home-v5 input:focus-visible{outline:2px solid #54dfe8;outline-offset:2px}.seven-home-v5 [hidden]{display:none!important}
.v5-ambient{position:absolute;inset:0;z-index:-1;overflow:hidden;pointer-events:none}.v5-ambient i{position:absolute;width:330px;height:270px;right:-185px;top:-130px;border-radius:50%;background:radial-gradient(circle,rgba(68,107,255,.19),rgba(72,75,205,.05) 50%,transparent 73%)}.v5-ambient b{position:absolute;width:260px;height:230px;left:-205px;top:405px;border-radius:50%;background:radial-gradient(circle,rgba(50,190,207,.065),transparent 72%)}
.v5-header{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:48px;margin-bottom:27px}.v5-brand{display:flex;align-items:center;gap:10px;min-height:48px;padding:0;border:0;background:none}.v4-brand-mark{width:47px;height:37px;display:grid;place-items:center}.v5-wordmark{font-size:15px;font-weight:820;letter-spacing:.255em}.v5-header-actions{display:flex;gap:4px}.v5-icon-button,.v5-avatar{position:relative;width:48px;height:48px;display:grid;place-items:center;padding:0;border-radius:16px}.v5-icon-button{border:1px solid transparent;background:transparent;color:#d7e1ef}.v5-notice-dot{position:absolute;right:9px;top:9px;width:7px;height:7px;border:2px solid #09172c;border-radius:50%;background:#45d8e1}.v5-avatar{border:1px solid rgba(119,155,215,.24);background:linear-gradient(145deg,#17355e,#172644);box-shadow:inset 0 1px 0 rgba(255,255,255,.05)}.v5-avatar>span{width:17px;height:17px;border-radius:50%;background:radial-gradient(circle at 34% 28%,#fff 0 8%,#73dfe8 19%,#4b7eff 54%,#8b6ce7 100%);box-shadow:0 0 14px rgba(72,122,255,.35)}
.v5-intro{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:end;gap:12px;margin-bottom:16px}.v5-eyebrow{margin:0 0 7px;font-size:11px!important;line-height:1;font-weight:790;letter-spacing:.14em;color:#7d95bd}.v5-intro h1{margin:0;font-size:29px;line-height:1.08;letter-spacing:-.036em;font-weight:730}.v5-intro>div>p:last-child{margin:8px 0 0;font-size:14px;line-height:1.43;color:var(--v5-muted)}.v5-ready{min-width:80px;height:48px;display:flex;align-items:center;justify-content:center;gap:8px;padding:0 13px;border:1px solid rgba(84,144,222,.24);border-radius:16px;background:rgba(16,32,59,.68);color:#bed0e7;font-size:12px;font-weight:700}.v5-ready i{width:8px;height:8px;border-radius:50%;background:#34d4b1;box-shadow:0 0 12px rgba(52,212,177,.42)}
.v5-composer{position:relative;min-height:200px;margin-bottom:20px;padding:14px;border:1px solid rgba(87,143,241,.34);border-radius:25px 25px 25px 13px;background:linear-gradient(152deg,rgba(18,34,63,.98),rgba(11,24,46,.99) 55%,rgba(12,26,50,.97));box-shadow:0 18px 44px rgba(0,0,0,.18),inset 0 1px 0 rgba(255,255,255,.04);overflow:hidden}.v5-composer:before{content:"";position:absolute;inset:0;border-radius:inherit;padding:1px;background:linear-gradient(120deg,rgba(50,190,207,.33),transparent 32%,transparent 66%,rgba(130,101,220,.22));-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;pointer-events:none}.v5-focus-halo{position:absolute;width:170px;height:120px;right:-70px;bottom:-68px;border-radius:50%;background:radial-gradient(circle,rgba(65,102,245,.20),transparent 69%);pointer-events:none}.v5-composer-top{display:flex;align-items:center;gap:8px;position:relative;z-index:1}.v5-mode,.v5-context{height:48px;display:flex;align-items:center;justify-content:center;gap:7px;border:1px solid var(--v5-line);border-radius:15px;background:rgba(12,27,51,.72);color:#c7d4e7}.v5-mode{padding:0 11px}.v5-mode>span{display:grid;color:#73d8e3}.v5-mode strong{font-size:12px}.v5-mode>svg{width:15px!important;height:15px!important;color:#7d91af}.v5-context{margin-inline-start:auto;padding:0 10px}.v5-context span{font-size:12px;font-weight:680}.v5-context b{min-width:20px;height:20px;display:grid;place-items:center;padding:0 5px;border-radius:10px;background:rgba(65,102,245,.20);color:#bcd0ff;font-size:10px}.v5-active-chips{min-height:0;display:flex;flex-wrap:wrap;gap:6px;margin-top:0}.v5-active-chips:not(:empty){margin-top:10px}.v5-active-chip{height:30px;display:flex;align-items:center;gap:6px;padding:0 9px;border:1px solid rgba(88,144,239,.27);border-radius:999px;background:rgba(56,89,154,.13);color:#cfe1f7;font-size:11px;font-weight:680}.v5-composer textarea{display:block;width:100%;min-height:70px;resize:none;margin:13px 0 5px;padding:3px 2px;border:0;outline:0;background:transparent!important;color:var(--v5-text);font-size:16px;line-height:1.52}.v5-composer textarea::placeholder{color:#7185a5;opacity:1}.v5-composer-footer{display:flex;align-items:center;gap:7px;position:relative;z-index:1}.v5-round,.v5-send{width:48px;height:48px;min-width:48px;display:grid;place-items:center;padding:0;border-radius:16px}.v5-round{border:1px solid var(--v5-line);background:rgba(12,27,51,.70);color:#c3d1e5}.v5-input-hint{font-size:11px;color:#7084a3;white-space:nowrap}.v5-spacer{flex:1}.v5-send{border:0;background:linear-gradient(145deg,#45d3df,#3b79fb 55%,#765fe4);color:#fff;box-shadow:0 8px 22px rgba(57,106,243,.28)}.v5-send[disabled]{filter:saturate(.5);opacity:.55}.v5-composer[data-seven-state="thinking"] .v5-send{animation:v5Pulse 1.4s ease-in-out infinite}.v5-composer[data-seven-state="thinking"] .v5-focus-halo{background:radial-gradient(circle,rgba(130,101,220,.28),transparent 69%)}
.v5-section-heading{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:48px}.v5-section-heading h2{margin:0;font-size:15px;letter-spacing:-.01em}.v5-section-heading>button{min-width:48px;min-height:48px;padding:0 2px;border:0;background:none;color:#8194b1;font-size:12px}.v5-shortcut-section{margin-bottom:18px}.v5-shortcuts{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.v4-shortcut{height:68px;min-width:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:0 4px;border:1px solid var(--v5-line);border-radius:18px;background:linear-gradient(180deg,rgba(16,31,57,.86),rgba(10,23,44,.82));color:#b9c9df;transition:transform .16s ease,border-color .16s ease,background .16s ease}.v4-shortcut>span{display:grid}.v4-shortcut strong{font-size:11.5px;font-weight:690}.v4-shortcut.research>span{color:#43d5df}.v4-shortcut.code>span{color:#4aa1ff}.v4-shortcut.create>span{color:#a17cff}.v4-shortcut.world>span{color:#8378f4}.v4-shortcut:active{transform:scale(.97)}.v4-shortcut.selected{border-color:rgba(86,145,247,.50);background:linear-gradient(180deg,rgba(25,48,85,.94),rgba(13,28,53,.88))}
.v5-now{margin-bottom:18px}.v5-now-surface{border:1px solid var(--v5-line);border-radius:21px 21px 21px 12px;background:linear-gradient(155deg,rgba(16,31,57,.94),rgba(10,22,42,.95));overflow:hidden;box-shadow:inset 0 1px 0 rgba(255,255,255,.025)}.v5-active-row,.v5-resume-row{width:100%;min-height:76px;display:grid;align-items:center;gap:10px;padding:12px;border:0;background:none;text-align:start}.v5-active-row{grid-template-columns:38px minmax(0,1fr) auto 24px}.v5-resume-row{grid-template-columns:38px minmax(0,1fr) 24px}.v5-divider{height:1px;margin-inline:60px 12px;background:rgba(125,151,194,.13)}.v5-state-orb,.v5-resume-icon{width:38px;height:38px;display:grid;place-items:center;border-radius:13px}.v5-state-orb{position:relative;background:radial-gradient(circle at 36% 30%,#78eff2,#3a92ff 50%,#715be1 100%);box-shadow:0 0 18px rgba(54,139,241,.20)}.v5-state-orb i{width:12px;height:12px;border:2px solid rgba(255,255,255,.93);border-right-color:transparent;border-radius:50%;animation:v5Orbit 1.3s linear infinite}.v5-state-orb b{position:absolute;right:2px;bottom:2px;width:9px;height:9px;border:2px solid #101c32;border-radius:50%;background:#2bd1a4}.v5-resume-icon{border:1px solid rgba(120,149,197,.19);background:rgba(35,55,87,.34);color:#8fa6c8}.v5-row-copy{min-width:0;display:flex;flex-direction:column;gap:4px}.v5-row-copy strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;font-weight:680}.v5-row-copy small{font-size:11px;color:#7f93b1}.v5-live{height:28px;display:flex;align-items:center;gap:5px;padding:0 8px;border-radius:999px;background:rgba(42,188,162,.09);color:#78d7c6;font-size:10px;font-weight:720}.v5-live i{width:6px;height:6px;border-radius:50%;background:#34d3aa}.v5-chevron{display:grid;color:#667b9c}.v5-chevron svg{width:17px!important;height:17px!important}
.v5-bottom-nav{position:fixed;z-index:25;left:max(10px,env(safe-area-inset-left));right:max(10px,env(safe-area-inset-right));bottom:max(10px,env(safe-area-inset-bottom));height:76px;display:grid;grid-template-columns:1fr 1fr 72px 1fr 1fr;align-items:center;padding:6px;border:1px solid rgba(116,145,195,.20);border-radius:24px;background:rgba(8,18,35,.94);box-shadow:0 18px 42px rgba(0,0,0,.34),inset 0 1px 0 rgba(255,255,255,.04)}.v5-bottom-nav>button{min-width:48px;min-height:60px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:0;border:0;background:none;color:#7085a7}.v5-bottom-nav>button.active{color:#d7e7fb}.v5-bottom-nav small{font-size:11px}.v5-orb-button{align-self:center!important;justify-self:center!important;width:64px!important;height:64px!important;min-width:64px!important;min-height:64px!important;border:1px solid rgba(82,143,247,.35)!important;border-radius:21px!important;background:linear-gradient(145deg,rgba(20,42,75,.98),rgba(11,25,49,.98))!important;box-shadow:0 0 0 5px rgba(65,102,245,.06),0 10px 28px rgba(33,80,178,.25)!important}.v4-orb-core{width:41px;height:32px;display:grid;place-items:center}
.v5-layer{position:fixed;z-index:60;inset:0;display:grid;align-items:end}.v5-backdrop{position:absolute;inset:0;width:100%;height:100%;min-width:0!important;min-height:0!important;padding:0;border:0;border-radius:0;background:rgba(2,7,16,.66)}.v5-sheet{position:relative;z-index:1;width:100%;max-height:min(78vh,690px);display:flex;flex-direction:column;border:1px solid rgba(118,150,204,.20);border-bottom:0;border-radius:28px 28px 0 0;background:linear-gradient(180deg,#101e36,#0a1629);box-shadow:0 -20px 60px rgba(0,0,0,.42);overflow:hidden;animation:v5SheetIn .22s cubic-bezier(.2,.8,.2,1)}.v5-handle{width:38px;height:4px;margin:8px auto 2px;border-radius:4px;background:#354a68}.v5-sheet>header{min-height:64px;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 16px 8px}.v5-sheet-kicker{margin:0 0 4px;color:#7189ad;font-size:10px;font-weight:780;letter-spacing:.14em}.v5-sheet h2{margin:0;font-size:19px;letter-spacing:-.02em}.v5-sheet-close{width:48px;height:48px;display:grid;place-items:center;padding:0;border:1px solid rgba(125,153,197,.16);border-radius:16px;background:#12213b;color:#aebfd6}.v5-sheet-body{overflow:auto;padding:4px 16px max(20px,env(safe-area-inset-bottom));overscroll-behavior:contain}.v5-sheet-section{margin:10px 0 18px}.v5-sheet-section>p{margin:0 0 8px;color:#7589a8;font-size:11px;font-weight:740;text-transform:uppercase;letter-spacing:.09em}.v5-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.v5-action-tile{min-height:76px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;padding:8px 4px;border:1px solid rgba(120,148,194,.16);border-radius:18px;background:#101e35;color:#bdd0e7}.v5-action-tile span{display:grid;color:#78aef6}.v5-action-tile small{font-size:10.5px}.v5-list{display:flex;flex-direction:column;gap:7px}.v5-list-row{width:100%;min-height:58px;display:grid;grid-template-columns:38px minmax(0,1fr) auto;align-items:center;gap:10px;padding:8px 10px;border:1px solid rgba(121,150,198,.15);border-radius:17px;background:#101e35;text-align:start}.v5-list-icon{width:38px;height:38px;display:grid;place-items:center;border-radius:13px;background:#152a49;color:#84b5fb}.v5-list-copy{min-width:0}.v5-list-copy strong{display:block;font-size:13px}.v5-list-copy small{display:block;margin-top:3px;color:#7e91ae;font-size:11px;line-height:1.3}.v5-list-end{color:#7e92b0;font-size:11px}.v5-list-row.selected{border-color:rgba(72,137,246,.42);background:#142846}.v5-list-row.selected .v5-list-end{color:#74d7de}.v5-toggle{width:28px;height:18px;border-radius:10px;background:#293b58;position:relative}.v5-toggle:after{content:"";position:absolute;width:12px;height:12px;left:3px;top:3px;border-radius:50%;background:#8da1bf;transition:transform .16s ease}.v5-list-row.selected .v5-toggle{background:#315fc7}.v5-list-row.selected .v5-toggle:after{transform:translateX(10px);background:white}.v5-segment{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:5px;border:1px solid rgba(119,149,197,.15);border-radius:17px;background:#0c192e}.v5-segment button{min-height:48px;padding:0 8px;border:0;border-radius:13px;background:transparent;color:#8194b2;font-size:11px}.v5-segment button.active{background:#172b4a;color:#edf4ff;box-shadow:inset 0 0 0 1px rgba(92,147,240,.22)}.v5-search{width:100%;height:50px;padding:0 14px 0 42px;border:1px solid rgba(121,151,200,.18);border-radius:16px;background:#0d1a30;color:#eef4fd;outline:0}.v5-search-wrap{position:relative}.v5-search-wrap>svg{position:absolute;left:14px;top:15px;color:#7489aa}.v5-command-group{margin:14px 0 18px}.v5-command-group>h3{margin:0 0 8px;color:#8698b4;font-size:11px;text-transform:uppercase;letter-spacing:.08em}.v5-command-items{display:flex;flex-wrap:wrap;gap:7px}.v5-command{min-height:44px;padding:0 12px;border:1px solid rgba(121,151,198,.16);border-radius:14px;background:#101f37;color:#bccce1;font-size:11.5px}.v5-task-hero{display:grid;grid-template-columns:46px 1fr;gap:12px;align-items:center;padding:12px;border:1px solid rgba(84,141,237,.22);border-radius:19px;background:linear-gradient(145deg,rgba(24,47,82,.92),rgba(14,30,55,.94))}.v5-task-hero .v5-state-orb{width:46px;height:46px}.v5-task-hero h3{margin:0;font-size:14px}.v5-task-hero p{margin:4px 0 0;color:#8498b6;font-size:11px}.v5-rail{position:relative;margin:14px 3px 4px;padding-left:24px}.v5-rail:before{content:"";position:absolute;left:7px;top:8px;bottom:8px;width:1px;background:#2a405f}.v5-rail-row{position:relative;min-height:42px;padding:5px 0}.v5-rail-row:before{content:"";position:absolute;left:-22px;top:11px;width:9px;height:9px;border-radius:50%;background:#365174;border:3px solid #101e36}.v5-rail-row.done:before{background:#37c8ad}.v5-rail-row.active:before{background:#4d8fff;box-shadow:0 0 10px rgba(77,143,255,.5)}.v5-rail-row strong{display:block;font-size:12px}.v5-rail-row small{display:block;margin-top:3px;color:#788dac;font-size:10.5px}.v5-task-controls{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px}.v5-task-controls button{min-height:50px;display:flex;align-items:center;justify-content:center;gap:7px;border:1px solid rgba(121,151,197,.17);border-radius:16px;background:#112039;color:#b8c9df;font-size:11.5px}.v5-task-controls button.danger{color:#ff91a5}.v5-voice-panel{text-align:center;padding:10px 6px 20px}.v5-voice-orb{width:92px;height:92px;margin:8px auto 16px;display:grid;place-items:center;border-radius:31px;background:radial-gradient(circle at 35% 28%,#67e5ea,#397ef7 52%,#735cdf 100%);box-shadow:0 0 0 10px rgba(65,102,245,.06),0 0 42px rgba(64,112,241,.24)}.v5-voice-orb svg{width:34px!important;height:34px!important;color:white}.v5-wave{height:42px;display:flex;align-items:center;justify-content:center;gap:4px}.v5-wave i{width:3px;border-radius:4px;background:#63dce5;animation:v5Wave 1s ease-in-out infinite}.v5-wave i:nth-child(1){height:10px}.v5-wave i:nth-child(2){height:24px;animation-delay:.1s}.v5-wave i:nth-child(3){height:36px;animation-delay:.2s}.v5-wave i:nth-child(4){height:20px;animation-delay:.3s}.v5-wave i:nth-child(5){height:12px;animation-delay:.4s}.v5-voice-panel h3{margin:8px 0 5px;font-size:16px}.v5-voice-panel p{margin:0;color:#8295b2;font-size:12px}.v5-state-card{display:grid;grid-template-columns:10px minmax(0,1fr);gap:10px;padding:11px 12px;border:1px solid rgba(121,151,198,.15);border-radius:15px;background:#101f37}.v5-state-card+.v5-state-card{margin-top:7px}.v5-state-card>i{width:9px;height:9px;margin-top:5px;border-radius:50%;background:#6f86a9}.v5-state-card.success>i{background:#31cfa5}.v5-state-card.warning>i{background:#ffb84d}.v5-state-card.error>i{background:#ff5576}.v5-state-card.uncertain>i{background:#a875ef}.v5-state-card strong{display:block;font-size:12px}.v5-state-card small{display:block;margin-top:3px;color:#8093af;font-size:10.5px;line-height:1.35}.v5-toast{position:fixed;z-index:90;left:50%;bottom:102px;max-width:calc(100% - 32px);transform:translate(-50%,14px);padding:10px 13px;border:1px solid rgba(126,157,205,.20);border-radius:14px;background:#13233e;color:#dbe7f7;font-size:11px;opacity:0;pointer-events:none;transition:opacity .16s ease,transform .16s ease}.v5-toast.show{opacity:1;transform:translate(-50%,0)}
body.seven-day .seven-home-v5{--v5-bg:#f4f7fb;--v5-surface:#fff;--v5-surface2:#f5f8fc;--v5-text:#101a2b;--v5-muted:#65758d;--v5-muted2:#7c899d;--v5-line:rgba(67,87,120,.14);background:linear-gradient(180deg,#f9fbfe 0%,#f3f6fb 48%,#edf2f8 100%);color:var(--v5-text)}body.seven-day .v5-ambient i{background:radial-gradient(circle,rgba(65,102,245,.08),transparent 70%)}body.seven-day .v5-composer{background:linear-gradient(155deg,#fff,#f7faff);border-color:rgba(65,102,245,.22);box-shadow:0 16px 38px rgba(36,62,100,.08),inset 0 1px 0 white}body.seven-day .v5-mode,body.seven-day .v5-context,body.seven-day .v5-round{background:#f6f9fd;color:#40516b;border-color:rgba(74,96,131,.14)}body.seven-day .v5-composer textarea{color:#132038!important}body.seven-day .v5-composer textarea::placeholder{color:#8997ab}body.seven-day .v4-shortcut,body.seven-day .v5-now-surface{background:linear-gradient(180deg,#fff,#f7f9fc);border-color:rgba(73,94,127,.13)}body.seven-day .v5-bottom-nav{background:rgba(255,255,255,.96);border-color:rgba(64,83,116,.14);box-shadow:0 14px 40px rgba(42,62,90,.12)}body.seven-day .v5-bottom-nav>button{color:#708099}body.seven-day .v5-bottom-nav>button.active{color:#243958}body.seven-day .v5-orb-button{background:linear-gradient(145deg,#fdfefe,#eef4ff)!important;border-color:rgba(65,102,245,.19)!important}body.seven-day .v5-sheet{background:linear-gradient(180deg,#fff,#f2f6fb);color:#152238}body.seven-day .v5-sheet-close,body.seven-day .v5-action-tile,body.seven-day .v5-list-row,body.seven-day .v5-command,body.seven-day .v5-state-card,body.seven-day .v5-task-controls button{background:#f7f9fc;color:#334661;border-color:rgba(64,85,118,.13)}body.seven-day .v5-search{background:#f7f9fc;color:#1a2940;border-color:rgba(64,85,118,.14)}body.seven-day .v5-list-icon{background:#edf3fc}body.seven-day .v5-task-hero{background:linear-gradient(145deg,#f7faff,#eef4fc)}body.seven-day .v5-toast{background:#fff;color:#21334e;box-shadow:0 8px 30px rgba(43,63,92,.12)}
body.seven-rtl .seven-home-v5{direction:rtl}.seven-rtl .v5-chevron{transform:scaleX(-1)}.seven-rtl .v5-search{padding:0 42px 0 14px}.seven-rtl .v5-search-wrap>svg{left:auto;right:14px}.seven-rtl .v5-rail{padding-left:0;padding-right:24px}.seven-rtl .v5-rail:before{left:auto;right:7px}.seven-rtl .v5-rail-row:before{left:auto;right:-22px}.seven-rtl .v5-toggle:after{left:auto;right:3px}.seven-rtl .v5-list-row.selected .v5-toggle:after{transform:translateX(-10px)}
body.seven-lite .seven-home-v5 .v5-ambient,body.seven-lite .seven-home-v5 .v5-focus-halo{display:none}body.seven-lite .seven-home-v5 .v5-composer,body.seven-lite .seven-home-v5 .v5-bottom-nav,body.seven-lite .seven-home-v5 .v5-orb-button{box-shadow:none!important}body.seven-large .seven-home-v5{font-size:108%}body.seven-large .v5-intro h1{font-size:31px}body.seven-reduced .seven-home-v5 *,body.seven-lite .seven-home-v5 *{animation:none!important;transition-duration:0s!important}
@media(max-width:345px){.seven-home-v5{padding-inline:12px}.v5-intro{grid-template-columns:1fr}.v5-ready{justify-self:start}.v5-intro h1{font-size:27px}.v5-context span{display:none}.v5-context{width:48px;padding:0}.v5-input-hint{display:none}.v5-shortcuts{gap:6px}.v4-shortcut{height:66px}.v5-bottom-nav{left:8px;right:8px}.v5-wordmark{letter-spacing:.22em}.v5-live{display:none}.v5-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.v5-sheet-body{padding-inline:12px}.v5-command{padding-inline:10px}}
@media(min-width:430px){.seven-home-v5{padding-inline:20px}.v5-intro h1{font-size:31px}.v5-composer{padding:15px}.v5-sheet{max-width:480px;justify-self:center;border-radius:28px 28px 0 0}}
@media(prefers-reduced-motion:reduce){.seven-home-v5 *{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
@keyframes v5Orbit{to{transform:rotate(360deg)}}@keyframes v5Pulse{0%,100%{box-shadow:0 8px 22px rgba(57,106,243,.22)}50%{box-shadow:0 8px 30px rgba(91,84,235,.40)}}@keyframes v5SheetIn{from{transform:translateY(26px);opacity:.4}to{transform:none;opacity:1}}@keyframes v5Wave{0%,100%{transform:scaleY(.55);opacity:.65}50%{transform:scaleY(1);opacity:1}}
`;

  const SHEETS = {
    add: () => ({title:'Add to Seven', body:`<div class="v5-sheet-section"><p>Inputs</p><div class="v5-grid"><button class="v5-action-tile" data-v5-pick="Files"><span>${ICON.file}</span><small>Files</small></button><button class="v5-action-tile" data-v5-pick="Photos"><span>${ICON.image}</span><small>Photos</small></button><button class="v5-action-tile" data-v5-pick="Camera"><span>${ICON.camera}</span><small>Camera</small></button><button class="v5-action-tile" data-v5-pick="Scan"><span>${ICON.scan}</span><small>Scan</small></button></div></div><div class="v5-sheet-section"><p>Actions</p><div class="v5-grid"><button class="v5-action-tile" data-v5-pick="Web"><span>${ICON.globe}</span><small>Web</small></button><button class="v5-action-tile" data-v5-pick="Tools"><span>${ICON.tool}</span><small>Tools</small></button><button class="v5-action-tile" data-v5-pick="Connect"><span>${ICON.link}</span><small>Connect</small></button><button class="v5-action-tile" data-v5-pick="Context"><span>${ICON.context}</span><small>Context</small></button></div></div>`}),
    mode: () => ({title:'How Seven should work', body:`<div class="v5-list">${[['Auto','Choose automatically','Recommended'],['Fast','Light route for simple tasks',''],['Balanced','More depth without going heavy',''],['Deep','Maximum reasoning and verification',''],['Custom','Choose models, tools and depth','Expert']].map(([a,b,c])=>`<button class="v5-list-row${a==='Auto'?' selected':''}" data-v5-select-mode="${a}"><span class="v5-list-icon">${a==='Deep'?ICON.bolt:ICON.spark}</span><span class="v5-list-copy"><strong>${a}</strong><small>${b}</small></span><span class="v5-list-end">${c}</span></button>`).join('')}</div>`}),
    context: () => ({title:'Context', body:`<div class="v5-sheet-section"><p>Use for this task</p><div class="v5-list">${[['Conversation','Relevant messages only',1],['Memories','Long-term knowledge',1],['Current Space','Goals, files and project memory',1],['Files','Attached or selected documents',0],['Pinned','Facts and notes you pinned',0],['Sources','Research and evidence packs',0]].map(([a,b,on])=>`<button class="v5-list-row${on?' selected':''}" data-v5-context-toggle aria-pressed="${on?'true':'false'}"><span class="v5-list-icon">${a==='Memories'?ICON.memory:ICON.context}</span><span class="v5-list-copy"><strong>${a}</strong><small>${b}</small></span><span class="v5-toggle" aria-hidden="true"></span></button>`).join('')}</div></div><div class="v5-state-card"><i></i><div><strong>Context Compiler</strong><small>Seven selects only relevant material. Summaries remain derived and never gain extra authority.</small></div></div>`}),
    voice: () => ({title:'Voice', body:`<div class="v5-voice-panel"><div class="v5-voice-orb">${ICON.mic}</div><div class="v5-wave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div><h3>Listening</h3><p>Speak naturally. Tap the orb again to finish.</p><div class="v5-task-controls"><button data-v5-close>Cancel</button><button data-v5-pick="Camera">${ICON.camera} Camera</button><button data-v5-close>${ICON.send} Use</button></div></div>`}),
    activity: () => ({title:'Activity', body:`<div class="v5-list"><button class="v5-list-row selected" data-v5-sheet="task"><span class="v5-list-icon">${ICON.research}</span><span class="v5-list-copy"><strong>AI interface research</strong><small>Researching · 14 sources</small></span><span class="v5-list-end">Live</span></button><button class="v5-list-row"><span class="v5-list-icon">${ICON.code}</span><span class="v5-list-copy"><strong>Seven Home polish</strong><small>Completed · 12 min ago</small></span><span class="v5-list-end">${ICON.check}</span></button><button class="v5-list-row"><span class="v5-list-icon">${ICON.world}</span><span class="v5-list-copy"><strong>World continuity check</strong><small>Paused · yesterday</small></span><span class="v5-list-end">Paused</span></button></div>`}),
    profile: () => ({title:'You', body:`<div class="v5-sheet-section"><p>Experience</p><div class="v5-list"><button class="v5-list-row"><span class="v5-list-icon">${ICON.bolt}</span><span class="v5-list-copy"><strong>Performance</strong><small>Balanced · automatic resource governor</small></span><span class="v5-list-end">Balanced</span></button><button class="v5-list-row"><span class="v5-list-icon">${ICON.globe}</span><span class="v5-list-copy"><strong>Language & direction</strong><small>English · LTR</small></span><span class="v5-list-end">›</span></button><button class="v5-list-row" data-v5-command="permissions"><span class="v5-list-icon">${ICON.shield}</span><span class="v5-list-copy"><strong>Privacy & permissions</strong><small>Scoped grants and connected actions</small></span><span class="v5-list-end">›</span></button></div></div><div class="v5-sheet-section"><p>Expert</p><div class="v5-list"><button class="v5-list-row"><span class="v5-list-icon">${ICON.spark}</span><span class="v5-list-copy"><strong>Models & providers</strong><small>Auto routing by default</small></span><span class="v5-list-end">Auto</span></button><button class="v5-list-row" data-v5-sheet="states"><span class="v5-list-icon">${ICON.activity}</span><span class="v5-list-copy"><strong>System health</strong><small>Recovery, integrity and runtime states</small></span><span class="v5-list-end">Ready</span></button></div></div>`}),
    task: () => ({title:'Active task', body:`<div class="v5-task-hero"><span class="v5-state-orb"><i></i><b></b></span><div><h3>Exploring modern AI interfaces</h3><p data-v5-task-sheet-state>Researching · evidence gathering</p></div></div><div class="v5-rail"><div class="v5-rail-row done"><strong>Understand request</strong><small>Task contract prepared</small></div><div class="v5-rail-row done"><strong>Plan sources</strong><small>Queries and source mix selected</small></div><div class="v5-rail-row active"><strong>Research</strong><small>14 sources collected · cross-checking</small></div><div class="v5-rail-row"><strong>Verify</strong><small>Waiting</small></div></div><div class="v5-task-controls"><button data-v5-task-control="pause">${ICON.pause} Pause</button><button class="danger" data-v5-task-control="stop">${ICON.stop} Stop</button><button data-v5-task-control="retry">${ICON.retry} Retry</button></div>`}),
    permissions: () => ({title:'Permission', body:`<div class="v5-state-card warning"><i></i><div><strong>Seven wants to perform an external action</strong><small>Permissions are scoped to this requested action. Tool or model output cannot grant itself more authority.</small></div></div><div class="v5-sheet-section"><p>Requested scope</p><div class="v5-list"><div class="v5-list-row"><span class="v5-list-icon">${ICON.link}</span><span class="v5-list-copy"><strong>Connect to a remote service</strong><small>Read selected data for this task only</small></span><span class="v5-list-end">READ_REMOTE</span></div></div></div><div class="v5-task-controls"><button data-v5-close>Not now</button><button data-v5-close>Once</button><button data-v5-close>Allow task</button></div>`}),
    states: () => ({title:'System states', body:`<div class="v5-state-card success"><i></i><div><strong>Ready</strong><small>Normal operation. Aurora indicates activity only, never proof or authority.</small></div></div><div class="v5-state-card warning"><i></i><div><strong>Waiting for permission</strong><small>Seven pauses before a protected side effect.</small></div></div><div class="v5-state-card error"><i></i><div><strong>Offline / provider unavailable</strong><small>Local and recoverable paths stay available where supported.</small></div></div><div class="v5-state-card uncertain"><i></i><div><strong>Cancelled · completion uncertain</strong><small>A remote action may have been dispatched. Verify the real state before retrying.</small></div></div><div class="v5-state-card"><i></i><div><strong>Recovery available</strong><small>Restore from the latest verified checkpoint or local recovery snapshot.</small></div></div>`}),
    command: () => ({title:'All capabilities', body:`<div class="v5-search-wrap">${ICON.search}<input class="v5-search" type="search" aria-label="Search capabilities" placeholder="Search anything Seven can do…" data-v5-command-search></div>${[['Ask',['Chat','Search','Research','Files','Vision','Voice']],['Make',['Image','Document','Presentation','App / Site','Structured output']],['Build',['Code','Project action','Tools','Automation','Data']],['World',['RPG','Real Works','Canon','What-if','Titles']],['Use context',['Spaces','Memory','Files','Pinned','Sources']],['System',['Models','Compute','Permissions','Verification','Recovery','Evolution','System states']]].map(([g,items])=>`<section class="v5-command-group"><h3>${g}</h3><div class="v5-command-items">${items.map(x=>`<button class="v5-command" data-v5-command="${x.toLowerCase().replace(/[^a-z]+/g,'-')}">${x}</button>`).join('')}</div></section>`).join('')}`})
  };

  function bindDoc(doc) {
    if (!doc || doc.__sevenHomeV5Bound) return;
    doc.__sevenHomeV5Bound = true;

    const root = () => doc.querySelector(`[data-seven-home-completion="${VERSION}"]`);
    const layer = () => root()?.querySelector('.v5-layer');
    const body = () => root()?.querySelector('.v5-sheet-body');
    const title = () => root()?.querySelector('#v5SheetTitle');

    const toast = message => {
      const node = root()?.querySelector('.v5-toast');
      if (!node) return;
      node.textContent = message;
      node.classList.add('show');
      clearTimeout(node.__timer);
      node.__timer = setTimeout(() => node.classList.remove('show'), 1500);
    };

    const closeSheet = () => {
      const l = layer();
      if (!l) return;
      l.hidden = true;
      l.setAttribute('aria-hidden','true');
    };

    const openSheet = kind => {
      const data = SHEETS[kind]?.();
      const l = layer();
      if (!data || !l || !body() || !title()) return;
      title().textContent = data.title;
      body().innerHTML = data.body;
      l.hidden = false;
      l.setAttribute('aria-hidden','false');
      requestAnimationFrame(() => l.querySelector('button,input')?.focus({preventScroll:true}));
    };

    const setMode = mode => {
      const r = root(); if (!r) return;
      r.querySelectorAll('.v4-shortcut').forEach(x => x.classList.toggle('selected', x.getAttribute('data-v5-mode') === mode));
      const chips = r.querySelector('.v5-active-chips');
      if (chips) chips.innerHTML = `<button class="v5-active-chip" data-v5-clear-mode aria-label="Remove ${mode} mode">${mode} ×</button>`;
      const ta = r.querySelector('textarea');
      if (ta) ta.placeholder = mode === 'Research' ? 'What should Seven investigate?' : mode === 'Code' ? 'What should Seven build or fix?' : mode === 'Create' ? 'What should Seven create?' : mode === 'World' ? 'Which world should Seven open?' : 'Ask Seven anything…';
      toast(`${mode} mode ready`);
    };

    doc.addEventListener('click', event => {
      const r = root(); if (!r || !r.contains(event.target)) return;
      const target = event.target.closest('button,[data-v5-send]');
      if (!target) return;

      if (target.hasAttribute('data-v5-close')) { closeSheet(); return; }
      if (target.dataset.v5Sheet) { openSheet(target.dataset.v5Sheet); return; }
      if (target.dataset.v5Mode) { setMode(target.dataset.v5Mode); return; }
      if (target.hasAttribute('data-v5-clear-mode')) {
        r.querySelector('.v5-active-chips').innerHTML='';
        r.querySelectorAll('.v4-shortcut').forEach(x=>x.classList.remove('selected'));
        const ta=r.querySelector('textarea'); if(ta)ta.placeholder='Ask Seven anything…';
        return;
      }
      if (target.dataset.v5Toast) { toast(target.dataset.v5Toast); return; }
      if (target.hasAttribute('data-v5-context-toggle')) {
        const on = target.getAttribute('aria-pressed') === 'true';
        target.setAttribute('aria-pressed', String(!on)); target.classList.toggle('selected', !on);
        const count = body()?.querySelectorAll('[data-v5-context-toggle].selected').length || 0;
        const counter = r.querySelector('[data-v5-context-count]'); if(counter)counter.textContent=String(count);
        return;
      }
      if (target.dataset.v5SelectMode) {
        const mode = target.dataset.v5SelectMode;
        const label = r.querySelector('[data-v5-mode-label]'); if(label) label.textContent=mode;
        closeSheet(); toast(`${mode} execution selected`); return;
      }
      if (target.dataset.v5Pick) { closeSheet(); toast(`${target.dataset.v5Pick} selected`); return; }
      if (target.dataset.v5TaskControl) {
        const kind=target.dataset.v5TaskControl; const meta=r.querySelector('[data-v5-task-meta]'); const live=r.querySelector('[data-v5-live-label]');
        if(kind==='pause'){if(meta)meta.textContent='Paused · tap to continue';if(live)live.textContent='Paused';toast('Task paused');}
        if(kind==='stop'){if(meta)meta.textContent='Cancelled · no new work running';if(live)live.textContent='Stopped';toast('Cancellation requested');}
        if(kind==='retry'){if(meta)meta.textContent='Researching · retrying safely';if(live)live.textContent='Live';toast('Safe retry started');}
        closeSheet(); return;
      }
      if (target.dataset.v5Command) {
        const c=target.dataset.v5Command;
        if(c==='permissions'){openSheet('permissions');return;}
        if(c==='system-states'){openSheet('states');return;}
        if(c==='research'){closeSheet();setMode('Research');return;}
        if(c==='code'){closeSheet();setMode('Code');return;}
        if(c==='rpg'||c==='real-works'||c==='canon'||c==='what-if'){closeSheet();setMode('World');return;}
        closeSheet(); toast(`${target.textContent.trim()} ready`); return;
      }
      if (target.hasAttribute('data-v5-send')) {
        const composer=r.querySelector('.v5-composer'); const ta=r.querySelector('textarea'); const meta=r.querySelector('[data-v5-task-meta]'); const live=r.querySelector('[data-v5-live-label]');
        if(composer)composer.setAttribute('data-seven-state','thinking'); if(meta)meta.textContent='Thinking · planning route'; if(live)live.textContent='Working';
        target.disabled=true; toast(ta?.value.trim() ? 'Task started' : 'Seven is ready for a request');
        setTimeout(()=>{target.disabled=false;if(composer)composer.setAttribute('data-seven-state','idle');},900); return;
      }
    });

    doc.addEventListener('input', event => {
      if (!event.target.matches('[data-v5-command-search]')) return;
      const q=event.target.value.trim().toLowerCase();
      body()?.querySelectorAll('.v5-command').forEach(btn=>{btn.hidden=!!q&&!btn.textContent.toLowerCase().includes(q);});
      body()?.querySelectorAll('.v5-command-group').forEach(group=>{group.hidden=!group.querySelector('.v5-command:not([hidden])');});
    });

    doc.addEventListener('keydown', event => { if(event.key==='Escape') closeSheet(); });
  }

  function install(editor) {
    if (!editor || editor.__sevenHomeCompletionV5Installed) return;
    editor.__sevenHomeCompletionV5Installed = true;
    let busy = false;

    const ensureCss = () => {
      try { const css=String(editor.getCss?.()||''); if(!css.includes(STYLE_MARKER)) editor.addStyle(CSS); } catch(_) {}
    };

    const bindCanvas = () => {
      try { const frame=editor.Canvas?.getFrameEl?.(); if(frame?.contentDocument) bindDoc(frame.contentDocument); } catch(_) {}
    };

    const apply = () => {
      if (busy) return;
      ensureCss();
      let html=''; try { html=String(editor.getHtml?.()||''); } catch(_) { return; }
      if (!html.includes(`data-seven-home-version="${BASE_VERSION}"`)) return;
      if (html.includes(`data-seven-home-completion="${VERSION}"`)) { bindCanvas(); return; }
      busy=true;
      try {
        editor.setComponents(HOME);
        ensureCss();
        setTimeout(bindCanvas,60);
        window.dispatchEvent(new CustomEvent('seven-home-completion-v5-installed',{detail:{version:VERSION}}));
      } finally { setTimeout(()=>{busy=false;},140); }
    };

    for (const name of ['load','project:load','storage:end:load','update']) editor.on(name,()=>setTimeout(apply,0));
    window.addEventListener('seven-home-launchpad-v4-installed',()=>setTimeout(apply,10));
    window.addEventListener('seven-mark-polish-installed',()=>setTimeout(apply,10));
    setTimeout(apply,100); setTimeout(apply,420); setTimeout(apply,950);

    const preview=document.getElementById('previewFrame');
    preview?.addEventListener('load',()=>setTimeout(()=>bindDoc(preview.contentDocument),20));
    document.getElementById('previewBtn')?.addEventListener('click',()=>setTimeout(()=>bindDoc(preview?.contentDocument),160));
  }

  if (window.__sevenDesignEditor) install(window.__sevenDesignEditor);
  window.addEventListener('seven-design-editor-ready',event=>install(event.detail?.editor||window.__sevenDesignEditor),{once:true});
})();
