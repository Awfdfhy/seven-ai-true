(() => {
  'use strict';

  const VERSION = '2026.09-synthesis-v3';
  const STYLE_MARKER = '--seven-home-synthesis-v3';

  const svg = body => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${body}</svg>`;
  const p = d => `<path d="${d}"/>`;
  const ICON = {
    bell: svg(p('M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4')),
    plus: svg(p('M12 5v14M5 12h14')),
    search: svg(p('M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm5 12 4 4')),
    spark: svg(p('m12 3 1.25 4.75L18 9l-4.75 1.25L12 15l-1.25-4.75L6 9l4.75-1.25L12 3Zm6 12 .65 2.35L21 18l-2.35.65L18 21l-.65-2.35L15 18l2.35-.65L18 15Z')),
    mic: svg(p('M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Zm-6 9a6 6 0 0 0 12 0M12 18v3M9 21h6')),
    arrowUp: svg(p('M12 19V5m0 0-5 5m5-5 5 5')),
    chevron: svg(p('m9 6 6 6-6 6')),
    chat: svg(p('M5 5h14v11H9l-4 4V5Z')),
    code: svg(p('m8 8-4 4 4 4m8-8 4 4-4 4m-3-11-2 14')),
    research: svg(p('M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm5 12 4 4')),
    game: svg(p('M7 9h10a4 4 0 0 1 3.7 5.5l-1.3 3.2a2 2 0 0 1-3.2.7L14 16h-4l-2.2 2.4a2 2 0 0 1-3.2-.7l-1.3-3.2A4 4 0 0 1 7 9Zm1 3v3m-1.5-1.5h3M16.5 13h.01M18 15h.01')),
    folder: svg(p('M3 6h7l2 2h9v11H3V6Z')),
    memory: svg('<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/>'),
    tools: svg(p('M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z')),
    image: svg('<rect x="4" y="5" width="16" height="14" rx="2"/><path d="m7 16 3-3 2.5 2.5L15 13l2 3M15.5 9h.01"/>'),
    doc: svg(p('M6 3h8l4 4v14H6V3Zm8 0v5h5M9 12h6M9 16h6')),
    globe: svg('<circle cx="12" cy="12" r="9"/><path d="M3.5 9h17M3.5 15h17M12 3c2.2 2.6 3.3 5.6 3.2 9-.1 3.4-1.2 6.4-3.2 9M12 3C9.8 5.6 8.7 8.6 8.8 12c.1 3.4 1.2 6.4 3.2 9"/>'),
    bolt: svg(p('m13 2-7 11h5l-1 9 8-12h-5l0-8Z')),
    home: svg(p('m4 11 8-7 8 7v9h-6v-6h-4v6H4v-9Z')),
    compass: svg('<circle cx="12" cy="12" r="8"/><path d="m15 9-2 4-4 2 2-4 4-2Z"/>'),
    library: svg(p('M5 4h4v16H5V4Zm6 2h4v14h-4V6Zm6-2h2v16h-2V4Z')),
    user: svg(p('M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM5 21a7 7 0 0 1 14 0')),
    clock: svg('<circle cx="12" cy="12" r="8"/><path d="M12 8v5l3 2"/>'),
    layers: svg(p('m12 3 8 4-8 4-8-4 8-4Zm8 9-8 4-8-4m16 5-8 4-8-4'))
  };

  const LOGO = `<svg class="v3-ribbon" viewBox="0 0 92 72" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="v3Ribbon" x1="6" y1="6" x2="84" y2="67" gradientUnits="userSpaceOnUse"><stop stop-color="#25e5ea"/><stop offset=".34" stop-color="#1a9cff"/><stop offset=".69" stop-color="#355cff"/><stop offset="1" stop-color="#a151ff"/></linearGradient>
      <linearGradient id="v3Sheen" x1="10" y1="8" x2="68" y2="26" gradientUnits="userSpaceOnUse"><stop stop-color="#fff" stop-opacity=".46"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    </defs>
    <path fill="url(#v3Ribbon)" d="M10 9C26 2.5 59 1.2 79 5.5c7.4 1.6 9.7 6.9 5.5 13.1L47.6 66.2c-3 3.9-7.9 4.6-11.9 1.8-4.4-3-4.7-7.3-1.5-11.5L65.5 18.2c-14.2 1.2-31.7 4.5-44 9.8C13 31.7 5.4 29 3.9 22.1 2.5 16 5 11.1 10 9Z"/>
    <path fill="url(#v3Sheen)" d="M14.4 10.4c16-4.6 43.4-5.7 61-2.3-15 1.2-37.4 5-53.3 11.5-7.6 3.1-12.6.4-7.7-9.2Z"/>
  </svg>`;

  const HOME = `
<main class="seven-screen seven-home-synthesis" data-seven-screen="home" data-seven-home-version="${VERSION}">
  <div class="v3-ambient" aria-hidden="true"><i></i><b></b><em></em></div>

  <header class="v3-header">
    <button class="v3-brand" aria-label="Seven home" data-seven-action="toast">
      <span class="v3-logo">${LOGO}</span><span class="v3-wordmark">SEVEN</span>
    </button>
    <div class="v3-header-actions">
      <button class="v3-icon-btn" aria-label="Notifications" data-seven-action="toast">${ICON.bell}</button>
      <button class="v3-avatar" aria-label="Profile" data-seven-action="toast"><span></span></button>
    </div>
  </header>

  <section class="v3-welcome" aria-labelledby="v3Greeting">
    <div class="v3-welcome-copy">
      <p class="v3-kicker">YOUR SPACE</p>
      <h1 id="v3Greeting">Good evening</h1>
      <p class="v3-subtitle">What shall we explore today?</p>
    </div>
    <button class="v3-status" data-seven-action="toast"><i></i><span>Seven Online</span>${ICON.chevron}</button>
  </section>

  <div class="v3-suggestions" aria-label="Quick ideas">
    <button data-seven-action="toast"><span>${ICON.spark}</span>Make something</button>
    <button data-seven-action="toast"><span>${ICON.bolt}</span>Get it done</button>
    <button data-seven-action="toast"><span>${ICON.globe}</span>Learn anything</button>
  </div>

  <section class="v3-composer" data-seven-component="composer" data-seven-state="idle">
    <div class="v3-composer-glow" aria-hidden="true"></div>
    <textarea aria-label="Ask Seven" placeholder="Ask Seven anything…"></textarea>
    <div class="v3-composer-footer">
      <div class="v3-composer-tools">
        <button class="v3-circle" aria-label="Add files or tools" data-seven-action="toast">${ICON.plus}</button>
        <button class="v3-pill" data-seven-action="toast">${ICON.search}<span>Search</span></button>
        <button class="v3-pill deep" data-seven-action="toast">${ICON.spark}<span>Deep Think</span></button>
      </div>
      <div class="v3-composer-send">
        <button class="v3-voice" aria-label="Voice" data-seven-action="toast">${ICON.mic}</button>
        <button class="v3-send" aria-label="Send" data-seven-action="toast"><span>${LOGO}</span></button>
      </div>
    </div>
  </section>

  <section class="v3-jump" aria-label="Jump in">
    <div class="v3-section-head"><div><span class="v3-eyebrow">JUMP IN</span><h2>Choose a lane</h2></div><button data-seven-action="toast">Customize</button></div>
    <div class="v3-feature-grid">
      <button class="v3-feature chat" data-seven-action="next-screen"><span class="v3-feature-icon">${ICON.chat}</span><strong>Chat</strong><small>Ask anything</small><i></i></button>
      <button class="v3-feature code" data-seven-action="next-screen"><span class="v3-feature-icon">${ICON.code}</span><strong>Coding</strong><small>Build & fix</small><i></i></button>
      <button class="v3-feature research" data-seven-action="next-screen"><span class="v3-feature-icon">${ICON.research}</span><strong>Research</strong><small>Find & verify</small><i></i></button>
      <button class="v3-feature world" data-seven-action="next-screen"><span class="v3-feature-icon">${ICON.game}</span><strong>World</strong><small>Live stories</small><i></i></button>
      <button class="v3-feature projects" data-seven-action="next-screen"><span class="v3-feature-icon">${ICON.folder}</span><strong>Projects</strong><small>Keep context</small><i></i></button>
      <button class="v3-feature memory" data-seven-action="next-screen"><span class="v3-feature-icon">${ICON.memory}</span><strong>Memory</strong><small>What matters</small><i></i></button>
    </div>
  </section>

  <button class="v3-tools" data-seven-action="next-screen">
    <span class="v3-tools-icon">${ICON.tools}</span>
    <span class="v3-tools-copy"><strong>Tools & Create</strong><small>Images, files, camera, actions and more</small></span>
    <span class="v3-tools-preview"><i>${ICON.image}</i><i>${ICON.doc}</i><i>${ICON.layers}</i></span>
    <span class="v3-tools-arrow" data-directional="true">${ICON.chevron}</span>
  </button>

  <section class="v3-active" aria-label="Active work">
    <div class="v3-section-head"><div><span class="v3-eyebrow">ACTIVE NOW</span><h2>Still working</h2></div><button data-seven-action="toast">See all</button></div>
    <button class="v3-active-card" data-seven-state="researching" data-seven-action="next-screen">
      <span class="v3-orbit" aria-hidden="true"><i></i><b></b></span>
      <span class="v3-active-copy"><span><strong>Exploring modern AI interfaces</strong><em>Live</em></span><small>Comparing patterns across apps and screens</small><span class="v3-active-meta"><i></i>Researching · 14 sources · 2m</span></span>
      <span class="v3-active-arrow" data-directional="true">${ICON.chevron}</span>
    </button>
  </section>

  <section class="v3-continue" aria-label="Continue">
    <div class="v3-section-head"><div><span class="v3-eyebrow">CONTINUE</span><h2>Pick up where you left off</h2></div><button data-seven-action="toast">History</button></div>
    <div class="v3-recents">
      <button class="v3-recent project" data-seven-action="next-screen">
        <span class="v3-recent-top"><i>${ICON.folder}</i><em>PROJECT</em></span><strong>Seven AI</strong><small>Home visual system</small><span class="v3-recent-foot"><em>12 min ago</em><i>${ICON.chevron}</i></span>
      </button>
      <button class="v3-recent research" data-seven-action="next-screen">
        <span class="v3-recent-top"><i>${ICON.search}</i><em>RESEARCH</em></span><strong>Model frontier</strong><small>Free model candidates</small><span class="v3-recent-foot"><em>Yesterday</em><i>${ICON.chevron}</i></span>
      </button>
    </div>
  </section>

  <section class="v3-for-you" aria-label="For you">
    <div class="v3-section-head"><div><span class="v3-eyebrow">FOR YOU</span><h2>One useful next step</h2></div></div>
    <button class="v3-personal-card" data-seven-action="next-screen">
      <span class="v3-personal-glyph">${ICON.spark}</span>
      <span><strong>Finish Seven Home polish</strong><small>Continue from this visual pass and tune the details on-device.</small></span>
      <span class="v3-personal-arrow">${ICON.arrowUp}</span>
    </button>
  </section>

  <section class="v3-compute" aria-label="Compute">
    <button class="v3-compute-card" data-seven-action="toast">
      <span class="v3-model-orb"><i></i><b></b></span>
      <span class="v3-compute-copy"><span><strong>Auto</strong><em>Recommended</em></span><small>Seven chooses the right depth for the task</small></span>
      <span class="v3-compute-side"><small>Balanced</small>${ICON.chevron}</span>
    </button>
  </section>

  <nav class="v3-bottom-nav" aria-label="Primary navigation">
    <button class="active" data-seven-action="toast"><span>${ICON.home}</span><small>Home</small></button>
    <button data-seven-action="toast"><span>${ICON.compass}</span><small>Explore</small></button>
    <button class="v3-orb-button" aria-label="New task" data-seven-action="open-command"><span class="v3-orb-core">${LOGO}</span></button>
    <button data-seven-action="toast"><span>${ICON.library}</span><small>Library</small></button>
    <button data-seven-action="toast"><span>${ICON.user}</span><small>You</small></button>
  </nav>
</main>`;

  const CSS = `
:root{--seven-home-synthesis-v3:1}
.seven-home-synthesis{--v3-bg:#020a18;--v3-bg2:#051329;--v3-panel:#08182f;--v3-panel2:#0b1d38;--v3-panel3:#0d213e;--v3-text:#f8faff;--v3-muted:#91a5c7;--v3-muted2:#6d83aa;--v3-line:rgba(117,151,210,.23);--v3-line-hi:rgba(92,143,255,.42);--v3-blue:#2c83ff;--v3-cyan:#2cdee7;--v3-violet:#8058ff;position:relative;isolation:isolate;min-height:100vh;padding:17px 15px 110px;background:linear-gradient(180deg,#041229 0%,#020a18 54%,#020714 100%);color:var(--v3-text);overflow-x:hidden;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;-webkit-font-smoothing:antialiased}
.seven-home-synthesis *{box-sizing:border-box}.seven-home-synthesis button,.seven-home-synthesis textarea{font:inherit}.seven-home-synthesis button{color:inherit}.seven-home-synthesis svg:not(.v3-ribbon){width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.v3-ribbon{display:block;width:100%;height:100%;overflow:visible}
.v3-ambient{position:absolute;inset:0;z-index:-1;overflow:hidden;pointer-events:none}.v3-ambient i{position:absolute;width:360px;height:290px;right:-210px;top:-130px;border-radius:50%;background:radial-gradient(circle,rgba(34,108,255,.26),rgba(86,54,214,.08) 48%,transparent 71%)}.v3-ambient b{position:absolute;width:300px;height:250px;left:-235px;top:420px;border-radius:50%;background:radial-gradient(circle,rgba(34,211,225,.1),transparent 70%)}.v3-ambient em{position:absolute;width:250px;height:160px;right:-180px;top:680px;border-radius:50%;background:radial-gradient(circle,rgba(128,88,255,.09),transparent 70%)}
.v3-header{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:48px;margin-bottom:27px}.v3-brand{display:flex;align-items:center;gap:10px;border:0;background:transparent;padding:0}.v3-logo{display:grid;place-items:center;width:45px;height:34px}.v3-wordmark{font-size:15px;font-weight:820;letter-spacing:.29em}.v3-header-actions{display:flex;align-items:center;gap:7px}.v3-icon-btn,.v3-avatar{width:42px;height:42px;border-radius:15px;display:grid;place-items:center;padding:0}.v3-icon-btn{border:1px solid transparent;background:transparent;color:#dce6f7}.v3-avatar{border:1px solid rgba(109,151,222,.3);background:radial-gradient(circle at 34% 25%,#64e8f3 0 5%,#3a7dff 23%,#5c43c9 50%,#111f3b 76%);box-shadow:0 0 22px rgba(56,94,255,.17),inset 0 0 0 2px rgba(255,255,255,.04)}.v3-avatar span{width:14px;height:14px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff 0 8%,#9af1ff 19%,#7d72ff 55%,#c467ff);box-shadow:0 0 13px rgba(96,133,255,.75)}
.v3-welcome{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:end;gap:10px;margin-bottom:13px}.v3-kicker{margin:0 0 5px;color:#6b82aa;font-size:8px;font-weight:780;letter-spacing:.22em}.v3-welcome h1{margin:0;font-size:29px;line-height:1.02;letter-spacing:-.045em;font-weight:720}.v3-subtitle{margin:6px 0 0;font-size:13px;color:#91a4c4}.v3-status{height:38px;padding:0 11px;border-radius:14px;border:1px solid rgba(93,140,213,.26);background:rgba(7,21,43,.78);display:flex;align-items:center;gap:7px;font-size:9px;color:#c3d0e7}.v3-status>i{width:7px;height:7px;border-radius:50%;background:#23ddb0;box-shadow:0 0 10px rgba(35,221,176,.5)}.v3-status svg{width:12px!important;height:12px!important;color:#6f89af}
.v3-suggestions{display:flex;gap:7px;overflow-x:auto;padding:1px 1px 2px;margin-bottom:15px;scrollbar-width:none}.v3-suggestions::-webkit-scrollbar{display:none}.v3-suggestions button{flex:0 0 auto;height:36px;padding:0 11px;border-radius:999px;border:1px solid rgba(118,151,206,.18);background:rgba(8,23,45,.68);display:flex;align-items:center;gap:6px;color:#9db0cf;font-size:9px;white-space:nowrap}.v3-suggestions button span{color:#8ca7ff;display:grid;place-items:center}.v3-suggestions svg{width:13px!important;height:13px!important}
.v3-composer{position:relative;border-radius:22px;border:1px solid rgba(62,145,255,.72);background:linear-gradient(165deg,rgba(11,30,58,.98),rgba(4,16,35,.98));box-shadow:0 0 0 1px rgba(54,201,255,.08),0 0 26px rgba(28,100,255,.18),0 18px 48px rgba(0,0,0,.35),inset 0 1px 0 rgba(255,255,255,.055);padding:15px 13px 12px;overflow:hidden}.v3-composer:before{content:"";position:absolute;inset:-1px;border-radius:inherit;padding:1px;background:linear-gradient(120deg,rgba(45,225,233,.92),rgba(38,133,255,.38) 42%,rgba(123,75,255,.75) 100%);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;opacity:.72}.v3-composer-glow{position:absolute;left:7%;right:7%;bottom:-28px;height:48px;border-radius:50%;background:radial-gradient(ellipse,rgba(51,96,255,.34),transparent 70%);filter:blur(8px);pointer-events:none}.v3-composer textarea{display:block;width:100%;min-height:102px;max-height:210px;resize:vertical;border:0;outline:0;background:transparent;color:var(--v3-text);font-size:16px;line-height:1.5;padding:1px 2px 13px}.v3-composer textarea::placeholder{color:#8094b7}.v3-composer-footer,.v3-composer-tools,.v3-composer-send{display:flex;align-items:center}.v3-composer-footer{justify-content:space-between;gap:8px}.v3-composer-tools{gap:6px;min-width:0}.v3-composer-send{gap:5px}.v3-circle,.v3-voice{width:38px;height:38px;border-radius:13px;display:grid;place-items:center;padding:0}.v3-circle{border:1px solid rgba(120,150,200,.22);background:rgba(14,31,57,.88);color:#b7c4d8}.v3-voice{border:0;background:transparent;color:#9aacc8}.v3-pill{height:38px;padding:0 9px;border-radius:13px;border:1px solid rgba(118,149,201,.19);background:rgba(12,29,53,.82);display:flex;align-items:center;gap:5px;font-size:9px;color:#c5d0e1;white-space:nowrap}.v3-pill svg{width:14px!important;height:14px!important;color:#73c8ff}.v3-pill.deep svg{color:#b28cff}.v3-send{width:43px;height:43px;border:1px solid rgba(108,167,255,.75);border-radius:50%;padding:0;display:grid;place-items:center;background:radial-gradient(circle at 35% 28%,#5ef0f0 0 6%,#208fff 34%,#454dff 61%,#9b50ff 100%);box-shadow:0 0 20px rgba(41,125,255,.48),0 0 36px rgba(110,71,255,.2);overflow:hidden}.v3-send>span{width:30px;height:24px;display:grid;place-items:center;filter:brightness(1.23) saturate(1.15)}
.v3-section-head{display:flex;align-items:flex-end;justify-content:space-between;gap:8px;margin:0 1px 10px}.v3-section-head h2{margin:2px 0 0;font-size:14px;line-height:1.2;font-weight:690;letter-spacing:-.016em}.v3-eyebrow{display:block;font-size:7px;font-weight:790;letter-spacing:.22em;color:#6780a9}.v3-section-head>button{border:0;background:transparent;padding:8px 2px;font-size:9px;color:#7890b5}
.v3-jump{margin-top:24px}.v3-feature-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.v3-feature{position:relative;min-width:0;min-height:105px;padding:11px 9px;border-radius:17px;border:1px solid rgba(104,140,199,.26);background:linear-gradient(155deg,rgba(8,27,55,.92),rgba(5,17,38,.92));display:flex;flex-direction:column;align-items:flex-start;text-align:left;overflow:hidden}.v3-feature:after{content:"";position:absolute;inset:auto -22px -28px auto;width:70px;height:70px;border-radius:50%;background:radial-gradient(circle,var(--tile-glow,rgba(49,110,255,.16)),transparent 70%)}.v3-feature>i{position:absolute;left:0;right:0;bottom:0;height:1px;background:linear-gradient(90deg,transparent,var(--tile-line,#397dff),transparent);opacity:.45}.v3-feature-icon{width:34px;height:34px;border-radius:11px;display:grid;place-items:center;margin-bottom:10px;background:rgba(36,108,255,.09);color:var(--tile-icon,#56a6ff);border:1px solid color-mix(in srgb,var(--tile-icon,#56a6ff) 20%,transparent)}.v3-feature-icon svg{width:17px!important;height:17px!important}.v3-feature strong{font-size:11px;font-weight:690;margin-bottom:3px}.v3-feature small{font-size:8px;color:#7186a9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}.v3-feature.chat{--tile-icon:#36c9ff;--tile-line:#2e93ff;--tile-glow:rgba(44,149,255,.16)}.v3-feature.code{--tile-icon:#41baff;--tile-line:#2b74ff;--tile-glow:rgba(55,105,255,.16)}.v3-feature.research{--tile-icon:#4fe4e5;--tile-line:#2bc8dc;--tile-glow:rgba(39,202,218,.14)}.v3-feature.world{--tile-icon:#9a6bff;--tile-line:#6a54ff;--tile-glow:rgba(122,78,255,.18)}.v3-feature.projects{--tile-icon:#4f99ff;--tile-line:#3c6eff;--tile-glow:rgba(62,99,255,.15)}.v3-feature.memory{--tile-icon:#43d4df;--tile-line:#375eff;--tile-glow:rgba(62,198,222,.13)}
.v3-tools{width:100%;min-height:64px;margin-top:9px;padding:9px 10px;border-radius:17px;border:1px solid rgba(107,143,204,.27);background:linear-gradient(150deg,rgba(8,28,55,.94),rgba(5,18,39,.94));display:grid;grid-template-columns:36px minmax(0,1fr) auto 28px;align-items:center;gap:8px;text-align:left}.v3-tools-icon{width:36px;height:36px;border-radius:11px;display:grid;place-items:center;background:rgba(61,100,255,.1);color:#62a1ff;border:1px solid rgba(80,125,255,.18)}.v3-tools-copy{min-width:0;display:flex;flex-direction:column;gap:2px}.v3-tools-copy strong{font-size:10px}.v3-tools-copy small{font-size:8px;color:#7186a9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.v3-tools-preview{display:flex;align-items:center}.v3-tools-preview>i{width:25px;height:25px;border-radius:8px;display:grid;place-items:center;background:#0c203e;border:1px solid rgba(107,144,206,.2);margin-left:-5px;color:#7997c2}.v3-tools-preview>i:first-child{margin-left:0}.v3-tools-preview svg{width:11px!important;height:11px!important}.v3-tools-arrow{display:grid;place-items:center;color:#6e85aa}.v3-tools-arrow svg{width:14px!important;height:14px!important}
.v3-active,.v3-continue,.v3-for-you,.v3-compute{margin-top:25px}.v3-active-card{width:100%;min-height:84px;border-radius:19px;border:1px solid rgba(55,190,225,.24);background:linear-gradient(148deg,rgba(5,36,59,.93),rgba(5,19,40,.93));padding:12px 36px 12px 12px;display:flex;align-items:center;gap:11px;text-align:left;position:relative;overflow:hidden}.v3-active-card:before{content:"";position:absolute;left:0;top:13px;bottom:13px;width:2px;border-radius:4px;background:linear-gradient(#30dce6,#3f74ff);box-shadow:0 0 11px rgba(48,220,230,.46)}.v3-orbit{position:relative;flex:0 0 42px;width:42px;height:42px;border-radius:50%;border:1px solid rgba(65,207,225,.22);display:grid;place-items:center}.v3-orbit>i{width:20px;height:20px;border-radius:8px;background:linear-gradient(140deg,rgba(50,222,230,.3),rgba(62,100,255,.36));border:1px solid rgba(104,156,255,.38)}.v3-orbit>b{position:absolute;top:-2px;left:18px;width:7px;height:7px;border-radius:50%;background:#3ce0df;box-shadow:0 0 11px rgba(60,224,223,.75)}.v3-active-copy{min-width:0;flex:1;display:flex;flex-direction:column}.v3-active-copy>span:first-child{display:flex;align-items:center;gap:6px;min-width:0}.v3-active-copy strong{font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.v3-active-copy em{font-style:normal;font-size:7px;padding:2px 6px;border-radius:999px;color:#61e0e3;background:rgba(45,214,225,.08);border:1px solid rgba(45,214,225,.14)}.v3-active-copy>small{font-size:8px;color:#7187a8;margin:4px 0 7px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.v3-active-meta{display:flex;align-items:center;gap:5px;font-size:7px;color:#738aab}.v3-active-meta>i{width:5px;height:5px;border-radius:50%;background:#39d9df;box-shadow:0 0 8px rgba(57,217,223,.55)}.v3-active-arrow{position:absolute;right:8px;top:50%;transform:translateY(-50%);display:grid;place-items:center;color:#6e85aa}.v3-active-arrow svg{width:14px!important;height:14px!important}
.v3-recents{display:grid;grid-template-columns:1fr 1fr;gap:9px}.v3-recent{position:relative;min-height:126px;padding:12px;border-radius:18px;border:1px solid rgba(106,142,202,.24);background:linear-gradient(150deg,rgba(8,27,53,.94),rgba(5,18,38,.94));display:flex;flex-direction:column;align-items:flex-start;text-align:left;overflow:hidden}.v3-recent:after{content:"";position:absolute;width:82px;height:82px;right:-30px;top:-33px;border-radius:50%;background:radial-gradient(circle,rgba(61,106,255,.18),transparent 70%)}.v3-recent.research:after{background:radial-gradient(circle,rgba(39,207,222,.14),transparent 70%)}.v3-recent-top,.v3-recent-foot{width:100%;display:flex;align-items:center}.v3-recent-top{gap:6px;margin-bottom:15px}.v3-recent-top>i{width:28px;height:28px;border-radius:9px;display:grid;place-items:center;background:rgba(61,105,255,.1);color:#7299ff}.v3-recent.research .v3-recent-top>i{color:#5ed7df;background:rgba(47,199,216,.09)}.v3-recent-top svg{width:13px!important;height:13px!important}.v3-recent-top>em{font-style:normal;font-size:7px;font-weight:760;letter-spacing:.1em;color:#7185a7}.v3-recent>strong{font-size:11px;margin-bottom:4px}.v3-recent>small{font-size:8px;color:#7084a4;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}.v3-recent-foot{justify-content:space-between;margin-top:auto;padding-top:15px}.v3-recent-foot>em{font-style:normal;font-size:7px;color:#63789a}.v3-recent-foot>i{width:25px;height:25px;border-radius:8px;display:grid;place-items:center;background:#0a1d39;border:1px solid rgba(105,143,204,.2);color:#7890b4}.v3-recent-foot svg{width:11px!important;height:11px!important}
.v3-personal-card{width:100%;min-height:66px;padding:10px;border-radius:18px;border:1px solid rgba(117,147,204,.21);background:linear-gradient(150deg,rgba(11,27,51,.92),rgba(8,18,37,.92));display:grid;grid-template-columns:40px minmax(0,1fr) 36px;align-items:center;gap:10px;text-align:left}.v3-personal-glyph{width:40px;height:40px;border-radius:13px;display:grid;place-items:center;color:#a692ff;background:linear-gradient(145deg,rgba(55,106,255,.13),rgba(126,73,255,.13));border:1px solid rgba(114,113,255,.14)}.v3-personal-glyph svg{width:17px!important;height:17px!important}.v3-personal-card>span:nth-child(2){min-width:0;display:flex;flex-direction:column;gap:3px}.v3-personal-card strong{font-size:10px}.v3-personal-card small{font-size:8px;line-height:1.4;color:#7185a7}.v3-personal-arrow{width:34px;height:34px;border-radius:11px;display:grid;place-items:center;background:linear-gradient(145deg,#245dff,#6c4ff1);color:white;box-shadow:0 6px 18px rgba(52,77,232,.25)}.v3-personal-arrow svg{width:14px!important;height:14px!important}
.v3-compute{margin-top:14px}.v3-compute-card{width:100%;min-height:66px;padding:9px 10px;border-radius:18px;border:1px solid rgba(106,142,202,.21);background:rgba(6,20,41,.78);display:grid;grid-template-columns:42px minmax(0,1fr) auto;align-items:center;gap:9px;text-align:left}.v3-model-orb{position:relative;width:42px;height:42px;border-radius:14px;background:radial-gradient(circle at 34% 25%,#58e7f2 0 5%,#277eff 27%,#623fe4 55%,#132342 78%);border:1px solid rgba(99,144,231,.26);overflow:hidden}.v3-model-orb i{position:absolute;width:16px;height:16px;left:13px;top:11px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff 0 7%,#8defff 18%,#7f73ff 57%,#c36aff);box-shadow:0 0 12px rgba(87,127,255,.7)}.v3-model-orb b{position:absolute;left:11px;right:11px;bottom:7px;height:7px;border-radius:50% 50% 34% 34%;background:rgba(117,129,255,.6);filter:blur(.3px)}.v3-compute-copy{min-width:0;display:flex;flex-direction:column;gap:3px}.v3-compute-copy>span{display:flex;align-items:center;gap:6px}.v3-compute-copy strong{font-size:10px}.v3-compute-copy em{font-style:normal;font-size:7px;color:#9bb7ff;border:1px solid rgba(99,130,255,.22);padding:2px 5px;border-radius:999px;background:rgba(55,85,220,.08)}.v3-compute-copy small{font-size:8px;color:#7185a7;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.v3-compute-side{display:flex;align-items:center;gap:4px;color:#6d83a7}.v3-compute-side small{font-size:7px}.v3-compute-side svg{width:11px!important;height:11px!important}
.v3-bottom-nav{position:fixed;left:50%;bottom:max(9px,env(safe-area-inset-bottom));transform:translateX(-50%);width:min(calc(100% - 22px),371px);height:70px;padding:5px 7px;display:grid;grid-template-columns:1fr 1fr 66px 1fr 1fr;align-items:center;border-radius:23px;border:1px solid rgba(113,148,207,.22);background:rgba(3,13,29,.9);box-shadow:0 18px 50px rgba(0,0,0,.44),inset 0 1px 0 rgba(255,255,255,.045);backdrop-filter:blur(16px);z-index:25}.v3-bottom-nav>button:not(.v3-orb-button){height:54px;border:0;border-radius:15px;background:transparent;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:0;color:#697f9f}.v3-bottom-nav>button:not(.v3-orb-button)>span{height:21px;display:grid;place-items:center}.v3-bottom-nav small{font-size:8px;font-weight:640}.v3-bottom-nav>button.active{color:#e2e9f7}.v3-bottom-nav>button.active>span{color:#62a1ff;text-shadow:0 0 14px rgba(53,123,255,.4)}.v3-bottom-nav svg:not(.v3-ribbon){width:17px!important;height:17px!important}.v3-orb-button{position:relative;width:58px;height:58px;justify-self:center;border-radius:50%;border:1px solid rgba(90,150,255,.45);background:radial-gradient(circle,#122c5d 0 38%,#08162f 70%);display:grid;place-items:center;padding:0;box-shadow:0 0 0 5px rgba(32,72,150,.12),0 0 23px rgba(40,109,255,.4),0 0 38px rgba(102,70,255,.18)}.v3-orb-core{width:45px;height:37px;display:grid;place-items:center;filter:brightness(1.2) saturate(1.16)}
body.seven-day .seven-home-synthesis{--v3-bg:#f4f7fc;--v3-bg2:#edf2fa;--v3-panel:#fff;--v3-panel2:#f7f9fd;--v3-panel3:#eef3fa;--v3-text:#091429;--v3-muted:#617493;--v3-muted2:#71829c;--v3-line:rgba(58,88,135,.16);background:linear-gradient(180deg,#f6f9fe,#eef3fa 55%,#f5f7fb);color:var(--v3-text)}body.seven-day .v3-ambient i{background:radial-gradient(circle,rgba(55,113,255,.13),transparent 70%)}body.seven-day .v3-ambient b{background:radial-gradient(circle,rgba(28,197,216,.08),transparent 70%)}body.seven-day .v3-icon-btn{color:#22324d}body.seven-day .v3-status,body.seven-day .v3-suggestions button,body.seven-day .v3-feature,body.seven-day .v3-tools,body.seven-day .v3-active-card,body.seven-day .v3-recent,body.seven-day .v3-personal-card,body.seven-day .v3-compute-card{background:rgba(255,255,255,.9);border-color:rgba(69,96,139,.15)}body.seven-day .v3-composer{background:#fff;border-color:rgba(63,126,255,.55);box-shadow:0 10px 34px rgba(40,71,124,.11),0 0 18px rgba(45,123,255,.08)}body.seven-day .v3-composer textarea{color:#0b1730}body.seven-day .v3-circle,body.seven-day .v3-pill{background:#f3f6fb}body.seven-day .v3-bottom-nav{background:rgba(255,255,255,.94);box-shadow:0 14px 38px rgba(38,61,103,.14)}body.seven-day .v3-bottom-nav>button:not(.v3-orb-button){color:#70809a}body.seven-day .v3-bottom-nav>button.active{color:#12213a}
body.seven-rtl .seven-home-synthesis{direction:rtl}body.seven-rtl .v3-wordmark{letter-spacing:.2em}body.seven-rtl .v3-feature,body.seven-rtl .v3-tools,body.seven-rtl .v3-active-card,body.seven-rtl .v3-recent,body.seven-rtl .v3-personal-card,body.seven-rtl .v3-compute-card{text-align:right}body.seven-rtl .v3-active-card:before{left:auto;right:0}body.seven-rtl .v3-active-card{padding:12px 12px 12px 36px}body.seven-rtl .v3-active-arrow{right:auto;left:8px}body.seven-rtl [data-directional="true"]{transform:scaleX(-1)}
body.seven-lite .seven-home-synthesis *,body.seven-lite .seven-home-synthesis *:before,body.seven-lite .seven-home-synthesis *:after{box-shadow:none!important;backdrop-filter:none!important;filter:none!important}body.seven-lite .v3-ambient{display:none}body.seven-reduced .seven-home-synthesis *{animation:none!important;transition:none!important;scroll-behavior:auto!important}
body.seven-large .v3-welcome h1{font-size:34px}body.seven-large .v3-subtitle{font-size:15px}body.seven-large .v3-feature strong{font-size:12px}body.seven-large .v3-feature small,body.seven-large .v3-tools-copy small,body.seven-large .v3-active-copy>small,body.seven-large .v3-recent>small{font-size:9px}
@media(max-width:340px){.seven-home-synthesis{padding-left:12px;padding-right:12px}.v3-header{margin-bottom:23px}.v3-welcome{grid-template-columns:1fr}.v3-status{justify-self:start;height:36px}.v3-welcome h1{font-size:26px}.v3-subtitle{font-size:12px}.v3-composer{padding-left:11px;padding-right:11px}.v3-composer textarea{min-height:88px}.v3-pill{padding:0 7px;font-size:8px}.v3-pill.deep span{display:none}.v3-feature-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.v3-feature{min-height:96px}.v3-tools{grid-template-columns:34px minmax(0,1fr) 26px}.v3-tools-preview{display:none}.v3-recents{grid-template-columns:1fr 1fr}.v3-bottom-nav{width:calc(100% - 14px);grid-template-columns:1fr 1fr 62px 1fr 1fr}.v3-bottom-nav small{font-size:7px}.v3-orb-button{width:54px;height:54px}}
`;

  function install(editor) {
    if (!editor || editor.__sevenHomeSynthesisV3Installed) return;
    editor.__sevenHomeSynthesisV3Installed = true;

    const cssNow = typeof editor.getCss === 'function' ? editor.getCss() : '';
    if (!String(cssNow).includes(STYLE_MARKER)) editor.addStyle(CSS);

    let busy = false;
    const upgrade = () => {
      if (busy) return;
      let home;
      try { home = editor.getWrapper().find('[data-seven-screen="home"]')[0]; } catch (_) { return; }
      if (!home) return;
      const attrs = home.getAttributes ? home.getAttributes() : {};
      if (attrs && attrs['data-seven-home-version'] === VERSION) return;
      busy = true;
      try {
        editor.setComponents(HOME);
        window.dispatchEvent(new CustomEvent('seven-home-synthesis-v3-installed', { detail: { version: VERSION } }));
      } finally {
        setTimeout(() => { busy = false; }, 120);
      }
    };

    upgrade();
    editor.on('update', () => setTimeout(upgrade, 0));
  }

  if (window.__sevenDesignEditor) install(window.__sevenDesignEditor);
  window.addEventListener('seven-design-editor-ready', event => install(event.detail?.editor || window.__sevenDesignEditor), { once: true });
})();