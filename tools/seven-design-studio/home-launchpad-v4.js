(() => {
  'use strict';

  const VERSION = '2026.09-launchpad-v4';
  const STYLE_MARKER = '--seven-home-launchpad-v4';

  const svg = body => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${body}</svg>`;
  const path = d => `<path d="${d}"/>`;
  const ICON = {
    bell: svg(path('M18 8a6 6 0 0 0-12 0c0 6-2.5 7-2.5 9h17c0-2-2.5-3-2.5-9M10 21h4')),
    plus: svg(path('M12 5v14M5 12h14')),
    chevron: svg(path('m9 6 6 6-6 6')),
    down: svg(path('m7 9 5 5 5-5')),
    mic: svg(path('M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Zm-6 9a6 6 0 0 0 12 0M12 18v3M9 21h6')),
    send: svg(path('M5 12h13m-5-5 5 5-5 5')),
    research: svg('<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4M8.5 11h5M11 8.5v5"/>'),
    code: svg(path('m8 8-4 4 4 4m8-8 4 4-4 4m-3-11-2 14')),
    create: svg('<path d="M4 16.5 15.8 4.7l3.5 3.5L7.5 20H4v-3.5Z"/><path d="m13.8 6.7 3.5 3.5M4 20h5"/>'),
    world: svg('<circle cx="12" cy="12" r="8"/><path d="M4.7 9h14.6M4.7 15h14.6M12 4c2 2.4 3 5.1 3 8s-1 5.6-3 8M12 4c-2 2.4-3 5.1-3 8s1 5.6 3 8"/>'),
    context: svg(path('M5 6h14v12H5V6Zm3 3h8M8 12h5M8 15h7')),
    spark: svg(path('m12 3 1.2 4.8L18 9l-4.8 1.2L12 15l-1.2-4.8L6 9l4.8-1.2L12 3Zm6 12 .6 2.4L21 18l-2.4.6L18 21l-.6-2.4L15 18l2.4-.6L18 15Z')),
    home: svg(path('m4 11 8-7 8 7v9h-6v-6h-4v6H4v-9Z')),
    spaces: svg('<rect x="4" y="5" width="10" height="10" rx="2"/><path d="M8 19h10a2 2 0 0 0 2-2V9"/>'),
    library: svg(path('M5 4h4v16H5V4Zm6 2h4v14h-4V6Zm6-2h2v16h-2V4Z')),
    user: svg(path('M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM5 21a7 7 0 0 1 14 0')),
    clock: svg('<circle cx="12" cy="12" r="8"/><path d="M12 8v4.5l3 1.8"/>'),
    activity: svg(path('M4 13h3l2-5 4 10 2-5h5'))
  };

  const LOGO = `<svg class="v4-seven-mark" viewBox="0 0 96 72" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="v4SevenGradient" x1="8" y1="8" x2="88" y2="66" gradientUnits="userSpaceOnUse">
        <stop stop-color="#35E7E9"/><stop offset=".42" stop-color="#2B8CFF"/><stop offset=".72" stop-color="#5260FF"/><stop offset="1" stop-color="#9466F2"/>
      </linearGradient>
      <linearGradient id="v4SevenHighlight" x1="13" y1="8" x2="62" y2="24" gradientUnits="userSpaceOnUse">
        <stop stop-color="#fff" stop-opacity=".42"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <path fill="url(#v4SevenGradient)" d="M11 8.5C29 2.5 61 1.5 80 5.2c7.8 1.5 10.1 7.2 5.4 13.4L48 66.1c-3.1 4-8.1 4.7-12.1 1.8-4.2-3.1-4.5-7.4-1.3-11.6l31-38C51.5 19.7 34 23 21.4 28.1c-8.6 3.5-16.1.8-17.6-6C2.5 15.8 5.6 10.3 11 8.5Z"/>
    <path fill="url(#v4SevenHighlight)" d="M14 10c15.5-4.5 42.3-5.6 60.3-2.5-15.6 1.1-36.9 4.7-52.2 10.7C14.8 21.1 9.7 18.1 14 10Z"/>
  </svg>`;

  const HOME = `
<main class="seven-screen seven-home-v4" data-seven-screen="home" data-seven-home-version="${VERSION}" data-seven-capability-routes="chat search research coding create world spaces context memory files vision voice tools models compute verification permissions recovery evolution settings">
  <div class="v4-ambient" aria-hidden="true"><i></i><b></b></div>

  <header class="v4-header">
    <button class="v4-brand" aria-label="Seven home" data-seven-action="toast">
      <span class="v4-brand-mark">${LOGO}</span>
      <span class="v4-wordmark">SEVEN</span>
    </button>
    <div class="v4-header-actions">
      <button class="v4-icon-button" aria-label="Activity" data-seven-action="toast">${ICON.activity}</button>
      <button class="v4-avatar" aria-label="Profile and settings" data-seven-action="toast"><span></span></button>
    </div>
  </header>

  <section class="v4-intro" aria-labelledby="v4Title">
    <div>
      <p class="v4-kicker">READY</p>
      <h1 id="v4Title">What do you want to do?</h1>
      <p>Start with the goal. Seven can choose the rest.</p>
    </div>
    <button class="v4-ready" data-seven-action="toast" aria-label="Seven status: ready"><i></i><span>Ready</span></button>
  </section>

  <section class="v4-composer" data-seven-component="composer" data-seven-state="idle" aria-label="Universal Composer">
    <div class="v4-composer-top">
      <button class="v4-mode" data-seven-action="toast" aria-label="Execution mode Auto"><span>${ICON.spark}</span><strong>Auto</strong>${ICON.down}</button>
      <button class="v4-context" data-seven-action="toast" aria-label="Choose context">${ICON.context}<span>Context</span></button>
    </div>
    <textarea aria-label="Ask Seven" placeholder="Ask Seven anything…"></textarea>
    <div class="v4-composer-footer">
      <button class="v4-add" aria-label="Add files, images, camera or tools" data-seven-action="toast">${ICON.plus}</button>
      <span class="v4-input-hint">Files · Images · Tools</span>
      <span class="v4-composer-spacer"></span>
      <button class="v4-voice" aria-label="Voice" data-seven-action="toast">${ICON.mic}</button>
      <button class="v4-send" aria-label="Send" data-seven-action="toast">${ICON.send}</button>
    </div>
  </section>

  <section class="v4-shortcut-section" aria-labelledby="v4ShortcutsTitle">
    <div class="v4-section-heading">
      <h2 id="v4ShortcutsTitle">Start faster</h2>
      <button class="v4-all" data-seven-action="open-command">All capabilities</button>
    </div>
    <div class="v4-shortcuts">
      <button class="v4-shortcut research" data-seven-action="next-screen"><span>${ICON.research}</span><strong>Research</strong></button>
      <button class="v4-shortcut code" data-seven-action="next-screen"><span>${ICON.code}</span><strong>Code</strong></button>
      <button class="v4-shortcut create" data-seven-action="next-screen"><span>${ICON.create}</span><strong>Create</strong></button>
      <button class="v4-shortcut world" data-seven-action="next-screen"><span>${ICON.world}</span><strong>World</strong></button>
    </div>
  </section>

  <section class="v4-now" aria-labelledby="v4NowTitle">
    <div class="v4-section-heading">
      <h2 id="v4NowTitle">Now</h2>
      <button data-seven-action="toast">See all</button>
    </div>
    <div class="v4-now-surface">
      <button class="v4-active-row" data-seven-state="researching" data-seven-action="next-screen">
        <span class="v4-state-orb" aria-hidden="true"><i></i><b></b></span>
        <span class="v4-row-copy"><strong>Exploring modern AI interfaces</strong><small>Researching · 14 sources</small></span>
        <span class="v4-live"><i></i>Live</span>
        <span class="v4-arrow" data-directional="true">${ICON.chevron}</span>
      </button>
      <div class="v4-divider" aria-hidden="true"></div>
      <button class="v4-resume-row" data-seven-action="next-screen">
        <span class="v4-resume-icon">${ICON.clock}</span>
        <span class="v4-row-copy"><strong>Continue Seven AI</strong><small>Home visual polish · 12 min ago</small></span>
        <span class="v4-arrow" data-directional="true">${ICON.chevron}</span>
      </button>
    </div>
  </section>

  <nav class="v4-bottom-nav" aria-label="Primary navigation">
    <button class="active" data-seven-action="toast"><span>${ICON.home}</span><small>Home</small></button>
    <button data-seven-action="toast"><span>${ICON.spaces}</span><small>Spaces</small></button>
    <button class="v4-orb-button" aria-label="New task or command" data-seven-action="open-command"><span class="v4-orb-core">${LOGO}</span></button>
    <button data-seven-action="toast"><span>${ICON.library}</span><small>Library</small></button>
    <button data-seven-action="toast"><span>${ICON.user}</span><small>You</small></button>
  </nav>
</main>`;

  const CSS = `
:root{--seven-home-launchpad-v4:1}
.seven-home-v4{--v4-bg:#07101f;--v4-surface:#0d1930;--v4-surface2:#101f39;--v4-text:#f4f7fc;--v4-muted:#9aaac3;--v4-muted2:#7487a7;--v4-line:rgba(133,159,204,.20);--v4-line-strong:rgba(86,142,245,.42);--v4-blue:#4086ff;--v4-cyan:#35dce2;--v4-violet:#8669ef;position:relative;isolation:isolate;min-height:100vh;padding:16px 16px 112px;background:linear-gradient(180deg,#09172d 0%,#07101f 44%,#060d1a 100%);color:var(--v4-text);overflow-x:hidden;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;-webkit-font-smoothing:antialiased}
.seven-home-v4 *{box-sizing:border-box}.seven-home-v4 button,.seven-home-v4 textarea{font:inherit}.seven-home-v4 button{color:inherit;-webkit-tap-highlight-color:transparent}.seven-home-v4 svg:not(.v4-seven-mark){width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.v4-seven-mark{display:block;width:100%;height:100%;overflow:visible}
.seven-home-v4 button:focus-visible,.seven-home-v4 textarea:focus-visible{outline:2px solid #49dbe3;outline-offset:2px}
.v4-ambient{position:absolute;inset:0;z-index:-1;overflow:hidden;pointer-events:none}.v4-ambient i{position:absolute;width:320px;height:260px;right:-190px;top:-120px;border-radius:50%;background:radial-gradient(circle,rgba(55,117,255,.20),rgba(75,73,214,.05) 52%,transparent 72%)}.v4-ambient b{position:absolute;width:260px;height:220px;left:-205px;top:390px;border-radius:50%;background:radial-gradient(circle,rgba(48,211,218,.07),transparent 72%)}
.v4-header{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:48px;margin-bottom:28px}.v4-brand{min-height:48px;display:flex;align-items:center;gap:10px;padding:0;border:0;background:transparent}.v4-brand-mark{width:43px;height:34px;display:grid;place-items:center}.v4-wordmark{font-size:15px;font-weight:800;letter-spacing:.27em}.v4-header-actions{display:flex;align-items:center;gap:4px}.v4-icon-button,.v4-avatar{width:48px;height:48px;border-radius:16px;display:grid;place-items:center;padding:0}.v4-icon-button{border:1px solid transparent;background:transparent;color:#d7e1f1}.v4-avatar{border:1px solid rgba(112,150,210,.24);background:linear-gradient(145deg,#18365e,#182646);box-shadow:inset 0 1px 0 rgba(255,255,255,.05)}.v4-avatar span{width:16px;height:16px;border-radius:50%;background:radial-gradient(circle at 34% 30%,#f8ffff 0 9%,#79e2e9 19%,#4f83ff 54%,#8e69ee 100%);box-shadow:0 0 13px rgba(73,127,255,.42)}
.v4-intro{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:end;gap:12px;margin-bottom:16px}.v4-kicker{margin:0 0 7px;font-size:11px;line-height:1;font-weight:760;letter-spacing:.16em;color:#7590bb}.v4-intro h1{margin:0;font-size:29px;line-height:1.08;letter-spacing:-.035em;font-weight:720}.v4-intro p:not(.v4-kicker){margin:8px 0 0;font-size:14px;line-height:1.4;color:var(--v4-muted)}.v4-ready{height:48px;min-width:78px;padding:0 12px;border-radius:16px;border:1px solid var(--v4-line);background:rgba(13,29,53,.78);display:flex;align-items:center;justify-content:center;gap:7px;font-size:12px;color:#c8d4e6}.v4-ready>i{width:8px;height:8px;border-radius:50%;background:#21cda7;box-shadow:0 0 10px rgba(33,205,167,.42)}
.v4-composer{position:relative;border-radius:24px;border:1px solid rgba(75,139,247,.55);background:linear-gradient(160deg,rgba(15,34,63,.98),rgba(9,23,44,.99));box-shadow:0 18px 42px rgba(0,0,0,.28),0 0 28px rgba(49,105,255,.10),inset 0 1px 0 rgba(255,255,255,.045);padding:12px;overflow:hidden}.v4-composer:before{content:"";position:absolute;inset:-1px;border-radius:inherit;padding:1px;background:linear-gradient(120deg,rgba(53,220,226,.72),rgba(64,134,255,.34) 47%,rgba(134,105,239,.66));-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;opacity:.82}.v4-composer-top{display:flex;align-items:center;gap:8px;position:relative;z-index:1}.v4-mode,.v4-context{height:48px;border-radius:15px;border:1px solid rgba(128,155,201,.18);background:rgba(18,38,69,.78);display:flex;align-items:center;gap:7px;padding:0 12px;color:#cbd6e7;font-size:12px}.v4-mode strong{font-size:12px}.v4-mode>span{color:#8eaaff;display:grid}.v4-mode>svg:last-child{width:14px!important;height:14px!important;color:#7286a7}.v4-context{margin-inline-start:auto}.v4-context svg{color:#7acdd6}
.v4-composer textarea{display:block;width:100%;min-height:90px;max-height:220px;resize:vertical;border:0;outline:0;background:transparent;color:var(--v4-text);font-size:16px;line-height:1.5;padding:15px 4px 12px}.v4-composer textarea::placeholder{color:#8294b1}.v4-composer-footer{display:flex;align-items:center;gap:8px}.v4-add,.v4-voice,.v4-send{width:48px;height:48px;flex:0 0 48px;display:grid;place-items:center;padding:0}.v4-add{border-radius:15px;border:1px solid rgba(127,153,198,.2);background:rgba(18,38,69,.8);color:#c9d5e7}.v4-input-hint{font-size:11px;color:#7185a5;white-space:nowrap}.v4-composer-spacer{flex:1}.v4-voice{border:0;border-radius:15px;background:transparent;color:#9eb0c9}.v4-send{border-radius:16px;border:1px solid rgba(104,167,255,.42);background:linear-gradient(145deg,#2ebdcf,#3e75ff 60%,#735de7);box-shadow:0 8px 20px rgba(47,100,234,.24);color:#fff}.v4-send svg{width:20px!important;height:20px!important}
.v4-shortcut-section,.v4-now{margin-top:24px}.v4-section-heading{min-height:48px;display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px}.v4-section-heading h2{margin:0;font-size:15px;font-weight:700;letter-spacing:-.01em}.v4-section-heading>button{min-height:48px;border:0;background:transparent;padding:0 4px;font-size:12px;color:#8196b6}.v4-shortcuts{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.v4-shortcut{min-width:0;height:64px;border-radius:18px;border:1px solid var(--v4-line);background:rgba(13,27,51,.88);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;padding:6px 4px;color:#d9e2f0}.v4-shortcut>span{display:grid;place-items:center;color:var(--slot,#75a5ff)}.v4-shortcut strong{font-size:11px;font-weight:650}.v4-shortcut.research{--slot:#49d7df}.v4-shortcut.code{--slot:#6ba6ff}.v4-shortcut.create{--slot:#a486f5}.v4-shortcut.world{--slot:#7f7cff}.v4-shortcut:active{transform:translateY(1px)}
.v4-now-surface{border-radius:20px;border:1px solid var(--v4-line);background:rgba(12,26,49,.88);overflow:hidden;box-shadow:inset 0 1px 0 rgba(255,255,255,.025)}.v4-active-row,.v4-resume-row{width:100%;min-height:76px;border:0;background:transparent;padding:12px;display:flex;align-items:center;gap:11px;text-align:start}.v4-state-orb{position:relative;width:42px;height:42px;flex:0 0 42px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 36% 30%,rgba(72,230,233,.28),rgba(48,105,255,.18) 45%,rgba(12,28,55,.94) 72%);border:1px solid rgba(55,204,220,.28)}.v4-state-orb:after{content:"";width:10px;height:10px;border-radius:50%;background:#44d8df;box-shadow:0 0 12px rgba(68,216,223,.55)}.v4-state-orb i,.v4-state-orb b{position:absolute;inset:5px;border-radius:50%;border:1px solid rgba(80,163,255,.24)}.v4-state-orb b{inset:9px;border-color:rgba(137,104,239,.18)}.v4-resume-icon{width:42px;height:42px;flex:0 0 42px;border-radius:14px;display:grid;place-items:center;background:rgba(58,101,184,.11);border:1px solid rgba(104,143,205,.15);color:#819ccc}.v4-row-copy{min-width:0;display:flex;flex-direction:column;gap:4px;flex:1}.v4-row-copy strong{font-size:13px;font-weight:660;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.v4-row-copy small{font-size:11px;color:#8093b0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.v4-live{height:28px;padding:0 8px;border-radius:999px;background:rgba(33,205,167,.08);border:1px solid rgba(33,205,167,.14);display:flex;align-items:center;gap:5px;font-size:11px;color:#70d9be}.v4-live i{width:6px;height:6px;border-radius:50%;background:#21cda7}.v4-arrow{width:24px;display:grid;place-items:center;color:#6f85a8}.v4-arrow svg{width:16px!important;height:16px!important}.v4-divider{height:1px;margin-inline:65px 12px;background:rgba(132,156,198,.12)}
.v4-bottom-nav{position:fixed;z-index:5;left:12px;right:12px;bottom:calc(8px + env(safe-area-inset-bottom));height:72px;padding:6px;border-radius:24px;border:1px solid rgba(111,139,190,.24);background:rgba(7,18,35,.94);box-shadow:0 18px 42px rgba(0,0,0,.42),inset 0 1px 0 rgba(255,255,255,.04);display:grid;grid-template-columns:1fr 1fr 64px 1fr 1fr;align-items:center;backdrop-filter:blur(16px)}.v4-bottom-nav>button{min-width:0;height:56px;border:0;background:transparent;border-radius:17px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:0;color:#788ba8}.v4-bottom-nav>button>span:not(.v4-orb-core){display:grid;place-items:center}.v4-bottom-nav small{font-size:11px}.v4-bottom-nav>button.active{color:#e7eef8}.v4-bottom-nav>button.active svg{color:#62a7ff}.v4-orb-button{position:relative!important;width:58px!important;height:58px!important;justify-self:center!important;border-radius:50%!important;background:linear-gradient(145deg,#20bdcf,#357dff 55%,#7b61ec)!important;box-shadow:0 8px 24px rgba(46,101,232,.34),0 0 0 5px rgba(24,50,91,.72)!important;overflow:hidden}.v4-orb-core{width:39px;height:30px;display:grid;place-items:center;filter:brightness(1.18) saturate(1.08)}
body.seven-day .seven-home-v4{--v4-bg:#f4f6fb;--v4-surface:#fff;--v4-surface2:#f7f9fc;--v4-text:#0a1427;--v4-muted:#61708a;--v4-muted2:#748198;--v4-line:rgba(42,65,103,.14);background:linear-gradient(180deg,#f7f9fd 0%,#f2f5fa 100%);color:var(--v4-text)}
body.seven-day .v4-ambient i{background:radial-gradient(circle,rgba(75,134,255,.12),transparent 72%)}body.seven-day .v4-ambient b{background:radial-gradient(circle,rgba(54,206,216,.06),transparent 72%)}body.seven-day .v4-icon-button{color:#38506f}body.seven-day .v4-avatar{background:linear-gradient(145deg,#eef3fb,#e6ecf7);border-color:rgba(54,83,126,.16)}body.seven-day .v4-intro p:not(.v4-kicker){color:#61708a}body.seven-day .v4-ready{background:rgba(255,255,255,.82);color:#445671;border-color:rgba(51,80,123,.14)}body.seven-day .v4-composer{background:linear-gradient(160deg,#fff,#f8faff);box-shadow:0 16px 38px rgba(35,61,105,.10),0 0 22px rgba(63,122,240,.05);border-color:rgba(63,126,237,.42)}body.seven-day .v4-mode,body.seven-day .v4-context,body.seven-day .v4-add{background:#f1f5fb;border-color:rgba(52,81,125,.13);color:#344a69}body.seven-day .v4-composer textarea{color:#0a1427}body.seven-day .v4-composer textarea::placeholder{color:#7b899d}body.seven-day .v4-input-hint{color:#718096}body.seven-day .v4-voice{color:#66758c}body.seven-day .v4-shortcut,body.seven-day .v4-now-surface{background:rgba(255,255,255,.91);border-color:rgba(45,71,111,.13);box-shadow:0 8px 22px rgba(48,70,106,.05)}body.seven-day .v4-shortcut{color:#21344f}body.seven-day .v4-row-copy small{color:#6b7a90}body.seven-day .v4-resume-icon{background:#f2f6fb;border-color:rgba(47,74,116,.10)}body.seven-day .v4-bottom-nav{background:rgba(255,255,255,.95);border-color:rgba(46,71,109,.14);box-shadow:0 14px 34px rgba(34,53,84,.14)}body.seven-day .v4-bottom-nav>button{color:#718096}body.seven-day .v4-bottom-nav>button.active{color:#162943}body.seven-day .v4-orb-button{box-shadow:0 8px 22px rgba(48,101,226,.28),0 0 0 5px rgba(232,238,249,.95)!important}
body[dir="rtl"] .seven-home-v4,body.seven-rtl .seven-home-v4{text-align:right}body[dir="rtl"] .v4-arrow,body.seven-rtl .v4-arrow{transform:scaleX(-1)}body[dir="rtl"] .v4-active-row,body[dir="rtl"] .v4-resume-row,body.seven-rtl .v4-active-row,body.seven-rtl .v4-resume-row{text-align:right}
body.seven-lite .v4-ambient,body[data-seven-performance="lite"] .v4-ambient{display:none}body.seven-lite .v4-composer,body[data-seven-performance="lite"] .v4-composer{box-shadow:inset 0 1px 0 rgba(255,255,255,.04)}body.seven-lite .v4-bottom-nav,body[data-seven-performance="lite"] .v4-bottom-nav{backdrop-filter:none}
@media(max-width:345px){.seven-home-v4{padding-inline:12px}.v4-intro{grid-template-columns:1fr}.v4-ready{justify-self:start}.v4-intro h1{font-size:27px}.v4-context span{display:none}.v4-context{width:48px;padding:0;justify-content:center}.v4-input-hint{display:none}.v4-shortcuts{gap:6px}.v4-shortcut{height:62px;border-radius:16px}.v4-bottom-nav{left:8px;right:8px}.v4-bottom-nav small{font-size:11px}.v4-wordmark{letter-spacing:.22em}.v4-live{display:none}}
@media(min-width:430px){.seven-home-v4{padding-inline:20px}.v4-intro h1{font-size:31px}.v4-composer{padding:14px}.v4-shortcut{height:68px}}
@media(prefers-reduced-motion:reduce){.seven-home-v4 *{scroll-behavior:auto!important;animation:none!important;transition:none!important}.v4-shortcut:active{transform:none}.v4-state-orb{box-shadow:none}}
`;

  function install(editor) {
    if (!editor || editor.__sevenHomeLaunchpadV4Installed) return;
    editor.__sevenHomeLaunchpadV4Installed = true;

    const ensureCss = () => {
      try {
        const cssNow = typeof editor.getCss === 'function' ? editor.getCss() : '';
        if (!String(cssNow).includes(STYLE_MARKER)) editor.addStyle(CSS);
      } catch (_) {}
    };

    let busy = false;
    const upgrade = () => {
      if (busy) return;
      ensureCss();
      let home;
      try { home = editor.getWrapper().find('[data-seven-screen="home"]')[0]; } catch (_) { return; }
      if (!home) return;
      const attrs = home.getAttributes ? home.getAttributes() : {};
      if (attrs && attrs['data-seven-home-version'] === VERSION) return;
      busy = true;
      try {
        editor.setComponents(HOME);
        ensureCss();
        window.dispatchEvent(new CustomEvent('seven-home-launchpad-v4-installed', { detail: { version: VERSION } }));
      } finally {
        setTimeout(() => { busy = false; }, 100);
      }
    };

    const queue = () => setTimeout(upgrade, 0);
    ensureCss();
    upgrade();
    for (const name of ['load','project:load','storage:end:load','update']) editor.on(name, queue);
    setTimeout(upgrade, 120);
    setTimeout(upgrade, 450);
    setTimeout(upgrade, 1000);
  }

  if (window.__sevenDesignEditor) install(window.__sevenDesignEditor);
  window.addEventListener('seven-design-editor-ready', event => install(event.detail?.editor || window.__sevenDesignEditor), { once: true });
})();
