(() => {
  'use strict';

  const VERSION = '2026.09-reference-v2';
  const STYLE_MARKER = '--seven-home-reference-v2';

  const svg = (body, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${body}</svg>`;
  const path = d => `<path d="${d}"/>`;
  const ICON = {
    bell: svg(path('M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4')),
    plus: svg(path('M12 5v14M5 12h14')),
    globe: svg(path('M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 0c2.1 2.5 3.1 5.5 3 9-.1 3.5-1.1 6.5-3 9m0-18c-2.1 2.5-3.1 5.5-3 9 .1 3.5 1.1 6.5 3 9M3.6 9h16.8M3.6 15h16.8')),
    spark: svg(path('m12 3 1.25 4.75L18 9l-4.75 1.25L12 15l-1.25-4.75L6 9l4.75-1.25L12 3Zm6 12 .65 2.35L21 18l-2.35.65L18 21l-.65-2.35L15 18l2.35-.65L18 15Z')),
    chat: svg(path('M5 5h14v11H9l-4 4V5Z')),
    code: svg(path('m8 8-4 4 4 4m8-8 4 4-4 4m-3-11-2 14')),
    search: svg(path('M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm5 12 4 4')),
    game: svg(path('M7 9h10a4 4 0 0 1 3.7 5.5l-1.3 3.2a2 2 0 0 1-3.2.7L14 16h-4l-2.2 2.4a2 2 0 0 1-3.2-.7l-1.3-3.2A4 4 0 0 1 7 9Zm1 3v3m-1.5-1.5h3M16.5 13h.01M18 15h.01')),
    folder: svg(path('M3 6h7l2 2h9v11H3V6Z')),
    memory: svg('<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/>'),
    tools: svg(path('M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z')),
    doc: svg(path('M6 3h8l4 4v14H6V3Zm8 0v5h5M9 12h6M9 16h6')),
    arrow: svg(path('m9 6 6 6-6 6')),
    home: svg(path('m4 11 8-7 8 7v9h-6v-6h-4v6H4v-9Z')),
    explore: svg('<circle cx="12" cy="12" r="8"/><path d="m15 9-2 4-4 2 2-4 4-2Z"/>'),
    library: svg(path('M5 4h4v16H5V4Zm6 2h4v14h-4V6Zm6-2h2v16h-2V4Z')),
    user: svg(path('M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM5 21a7 7 0 0 1 14 0'))
  };

  const LOGO = `<svg class="seven-ribbon" viewBox="0 0 84 64" aria-hidden="true" focusable="false">
    <defs><linearGradient id="sevenRibbonGradient" x1="4" y1="6" x2="76" y2="58" gradientUnits="userSpaceOnUse"><stop stop-color="#30e5e9"/><stop offset=".42" stop-color="#1597ff"/><stop offset=".72" stop-color="#315cff"/><stop offset="1" stop-color="#a456ff"/></linearGradient></defs>
    <path fill="url(#sevenRibbonGradient)" d="M9 7.8C21.6 2.7 52.4 1.5 70.3 4.9c7 1.3 9.2 5.8 5.7 11.5L43.2 59c-2.7 3.5-6.8 4.1-10.4 1.8-4.1-2.6-4.3-6.4-1.5-10.1L59 17.2c-12.3 1.1-27.8 3.8-38.6 8.4C12.7 28.9 6 26.4 4.5 20.4 3.1 15 4.7 9.6 9 7.8Z"/>
    <path fill="rgba(255,255,255,.18)" d="M14 9.3c14.5-4.1 39.3-5.1 55.4-2.1-13.3 1-34.2 4.4-48.8 10.4-6.7 2.7-11.1.3-6.6-8.3Z"/>
  </svg>`;

  const HOME = `
<main class="seven-screen seven-home-reference" data-seven-screen="home" data-seven-home-version="${VERSION}">
  <div class="ref-ambient" aria-hidden="true"><i></i><b></b></div>

  <header class="ref-header">
    <button class="ref-brand" aria-label="Seven home" data-seven-action="toast">
      <span class="ref-logo">${LOGO}</span>
      <span class="ref-wordmark">SEVEN</span>
    </button>
    <div class="ref-header-actions">
      <button class="ref-icon-button" aria-label="Notifications" data-seven-action="toast">${ICON.bell}</button>
      <button class="ref-avatar" aria-label="Profile" data-seven-action="toast"><span class="avatar-core"></span></button>
    </div>
  </header>

  <section class="ref-hero" aria-labelledby="refGreeting">
    <div>
      <h1 id="refGreeting">Good evening</h1>
      <p>What shall we explore today?</p>
    </div>
    <button class="ref-status" aria-label="Seven status" data-seven-action="toast"><span></span>Seven Online ${ICON.arrow}</button>
  </section>

  <section class="ref-composer" data-seven-component="composer" data-seven-state="idle">
    <textarea aria-label="Ask Seven" placeholder="Ask Seven anything…"></textarea>
    <div class="ref-composer-actions">
      <button class="ref-mini-button ref-add" aria-label="Add files or tools" data-seven-action="toast">${ICON.plus}</button>
      <button class="ref-action-pill" data-seven-action="toast">${ICON.globe}<span>Search</span></button>
      <button class="ref-action-pill" data-seven-action="toast">${ICON.spark}<span>Deep Think</span></button>
      <span class="ref-action-spacer"></span>
      <button class="ref-seven-send" aria-label="Send to Seven" data-seven-action="toast"><span>7</span></button>
    </div>
  </section>

  <section class="ref-features" aria-label="Seven capabilities">
    <button class="ref-feature" data-seven-action="next-screen"><span class="feature-icon chat">${ICON.chat}</span><strong>Chat</strong><small>Your AI assistant</small></button>
    <button class="ref-feature" data-seven-action="next-screen"><span class="feature-icon code">${ICON.code}</span><strong>Coding</strong><small>Build anything</small></button>
    <button class="ref-feature" data-seven-action="next-screen"><span class="feature-icon research">${ICON.search}</span><strong>Research</strong><small>Go deeper</small></button>
    <button class="ref-feature" data-seven-action="next-screen"><span class="feature-icon rpg">${ICON.game}</span><strong>RPG</strong><small>Infinite worlds</small></button>
    <button class="ref-feature" data-seven-action="next-screen"><span class="feature-icon projects">${ICON.folder}</span><strong>Projects</strong><small>Ideas to reality</small></button>
    <button class="ref-feature" data-seven-action="next-screen"><span class="feature-icon memory">${ICON.memory}</span><strong>Memory</strong><small>Remembers you</small></button>
  </section>

  <button class="ref-tools-row" data-seven-action="next-screen">
    <span class="feature-icon tools">${ICON.tools}</span>
    <span><strong>Tools</strong><small>Images, files, and more</small></span>
    <span class="ref-row-arrow" data-directional="true">${ICON.arrow}</span>
  </button>

  <section class="ref-section" aria-label="Continue">
    <div class="ref-section-title"><h2>Continue</h2><button data-seven-action="toast">See all <span data-directional="true">${ICON.arrow}</span></button></div>
    <div class="ref-list">
      <button class="ref-history-row" data-seven-action="next-screen">
        <span class="history-icon">${ICON.doc}</span>
        <span class="history-copy"><strong>Build a personal website</strong><small>Design, code and deployment plan…</small></span>
        <span class="history-meta">2h ago</span>
        <span class="history-arrow" data-directional="true">${ICON.arrow}</span>
      </button>
      <button class="ref-history-row" data-seven-action="next-screen">
        <span class="history-icon game">${ICON.game}</span>
        <span class="history-copy"><strong>A fantasy RPG adventure</strong><small>Continue your story in Eldoria…</small></span>
        <span class="history-meta">5h ago</span>
        <span class="history-arrow" data-directional="true">${ICON.arrow}</span>
      </button>
    </div>
  </section>

  <section class="ref-section ref-models" aria-label="Models">
    <div class="ref-section-title"><h2>Models</h2><button data-seven-action="toast">See all <span data-directional="true">${ICON.arrow}</span></button></div>
    <button class="ref-model-row" data-seven-action="toast">
      <span class="model-orb"><i></i></span>
      <span class="model-copy"><span><strong>Seven Auto</strong><em>Recommended</em></span><small>Automatically chooses the right intelligence</small></span>
      <span class="model-arrow" data-directional="true">${ICON.arrow}</span>
    </button>
  </section>

  <nav class="ref-bottom-nav" aria-label="Primary navigation">
    <button class="active" data-seven-action="toast"><span>${ICON.home}</span><small>Home</small></button>
    <button data-seven-action="toast"><span>${ICON.explore}</span><small>Explore</small></button>
    <button class="ref-orb-button" aria-label="New task" data-seven-action="open-command"><span class="ref-orb-ring"><i>7</i></span></button>
    <button data-seven-action="toast"><span>${ICON.library}</span><small>Library</small></button>
    <button data-seven-action="toast"><span>${ICON.user}</span><small>Profile</small></button>
  </nav>
</main>`;

  const CSS = `
:root{--seven-home-reference-v2:1}
.seven-home-reference{--rh-bg:#020c1c;--rh-bg2:#06142b;--rh-panel:#07172e;--rh-panel2:#0a1b36;--rh-text:#f7f9ff;--rh-muted:#8fa4c7;--rh-muted2:#6f84a8;--rh-line:rgba(91,132,198,.34);--rh-line-soft:rgba(104,142,199,.20);--rh-blue:#2385ff;--rh-cyan:#24dce6;--rh-violet:#7a50ff;position:relative;isolation:isolate;min-height:100vh;padding:18px 15px 104px;background:linear-gradient(180deg,#031126 0%,#020b1a 52%,#020817 100%);color:var(--rh-text);overflow-x:hidden;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
.seven-home-reference *{box-sizing:border-box}.seven-home-reference button,.seven-home-reference textarea{font:inherit}.seven-home-reference button{color:inherit}.seven-home-reference svg:not(.seven-ribbon){width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.ref-ambient{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:-1}.ref-ambient i{position:absolute;width:330px;height:260px;right:-180px;top:-95px;border-radius:50%;background:radial-gradient(circle,rgba(28,100,255,.24),rgba(75,45,196,.08) 52%,transparent 72%)}.ref-ambient b{position:absolute;width:280px;height:260px;left:-210px;top:280px;border-radius:50%;background:radial-gradient(circle,rgba(16,164,219,.10),transparent 72%)}
.ref-header{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:48px;margin-bottom:30px}.ref-brand{display:flex;align-items:center;gap:10px;padding:0;border:0;background:transparent}.ref-logo{width:46px;height:35px;display:grid;place-items:center}.seven-ribbon{display:block;width:46px;height:35px;overflow:visible}.ref-wordmark{font-size:15px;font-weight:800;letter-spacing:.28em;padding-left:1px}.ref-header-actions{display:flex;align-items:center;gap:8px}.ref-icon-button,.ref-avatar{width:42px;height:42px;border:1px solid transparent;background:transparent;border-radius:14px;display:grid;place-items:center;padding:0}.ref-icon-button{color:#d9e4f6}.ref-avatar{position:relative;border-color:rgba(91,132,198,.28);background:radial-gradient(circle at 35% 25%,#4fd5ff 0 5%,#3568ff 23%,#5736aa 53%,#0c1932 76%);box-shadow:0 0 20px rgba(52,92,255,.18),inset 0 0 0 2px rgba(255,255,255,.04)}.avatar-core{width:15px;height:15px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff 0 7%,#8fe9ff 18%,#796aff 58%,#b96cff);box-shadow:0 0 12px rgba(95,132,255,.72)}
.ref-hero{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:end;margin-bottom:20px}.ref-hero h1{margin:0;font-size:28px;line-height:1.04;letter-spacing:-.035em;font-weight:760}.ref-hero p{margin:7px 0 0;font-size:13px;color:#8fa4c7}.ref-status{min-height:36px;padding:0 10px;border:1px solid rgba(86,126,190,.33);border-radius:999px;background:rgba(4,18,39,.7);display:flex;align-items:center;gap:6px;font-size:10px;color:#d6e2f4;white-space:nowrap}.ref-status>span{width:7px;height:7px;border-radius:50%;background:#18e5bc;box-shadow:0 0 10px rgba(24,229,188,.7)}.ref-status svg{width:11px!important;height:11px!important;color:#7d94b6}
.ref-composer{position:relative;border:1px solid rgba(54,137,255,.88);border-radius:20px;background:linear-gradient(160deg,rgba(8,25,50,.97),rgba(3,14,31,.98));padding:14px 13px 11px;margin-bottom:12px;box-shadow:0 0 0 1px rgba(42,198,255,.12),0 0 18px rgba(28,111,255,.20),0 18px 45px rgba(0,0,0,.32),inset 0 0 34px rgba(16,80,190,.08);overflow:hidden}.ref-composer:before{content:"";position:absolute;left:8%;right:8%;top:-1px;height:1px;background:linear-gradient(90deg,transparent,#4ce6ef,#4e81ff,#8459ff,transparent);box-shadow:0 0 13px rgba(58,132,255,.9)}.ref-composer:focus-within{border-color:#3db5ff;box-shadow:0 0 0 2px rgba(31,153,255,.14),0 0 28px rgba(34,113,255,.30),0 20px 48px rgba(0,0,0,.36)}.ref-composer textarea{display:block;width:100%;min-height:78px;max-height:180px;padding:1px 2px 12px;border:0;outline:0;resize:vertical;background:transparent;color:var(--rh-text);font-size:15px;line-height:1.5}.ref-composer textarea::placeholder{color:#8da1c0}.ref-composer-actions{display:flex;align-items:center;gap:6px;min-width:0}.ref-mini-button{flex:0 0 35px;width:35px;height:35px;border-radius:50%;border:1px solid rgba(106,142,196,.26);background:rgba(7,22,46,.96);display:grid;place-items:center;padding:0;color:#c2d0e4}.ref-action-pill{min-width:0;height:35px;padding:0 9px;border-radius:999px;border:1px solid rgba(96,132,188,.22);background:rgba(7,22,46,.92);display:flex;align-items:center;gap:5px;font-size:10px;color:#d2def0;white-space:nowrap}.ref-action-pill svg{width:13px!important;height:13px!important}.ref-action-pill:nth-of-type(3) svg{color:#a887ff}.ref-action-spacer{flex:1}.ref-seven-send{flex:0 0 44px;width:44px;height:44px;border-radius:50%;border:1px solid rgba(101,190,255,.85);padding:0;display:grid;place-items:center;background:radial-gradient(circle at 30% 25%,#46e1eb 0 7%,#2095ff 28%,#3f5dff 58%,#8e4dff 100%);box-shadow:0 0 20px rgba(42,121,255,.55),inset 0 1px 0 rgba(255,255,255,.4)}.ref-seven-send span{font-size:17px;font-weight:900;color:white;transform:translateY(-1px)}
.ref-features{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:13px}.ref-feature{min-width:0;min-height:106px;padding:12px 10px;border:1px solid rgba(67,114,187,.34);border-radius:17px;background:linear-gradient(155deg,rgba(8,27,54,.94),rgba(4,16,35,.97));display:flex;flex-direction:column;align-items:flex-start;text-align:left;box-shadow:inset 0 1px 0 rgba(255,255,255,.025)}.feature-icon{width:34px;height:34px;border-radius:11px;display:grid;place-items:center;margin-bottom:10px;border:1px solid rgba(65,134,255,.20);background:rgba(10,38,77,.72);color:#289aff;box-shadow:0 0 14px rgba(35,125,255,.08)}.feature-icon svg{width:18px!important;height:18px!important}.feature-icon.code{color:#35b9ff}.feature-icon.research{color:#228cff}.feature-icon.rpg{color:#8868ff}.feature-icon.projects{color:#2c8fff}.feature-icon.memory{color:#20b8e7}.feature-icon.tools{color:#45a4ff;margin:0;flex:0 0 38px;width:38px;height:38px}.ref-feature strong{font-size:11px;line-height:1.25;margin-bottom:4px}.ref-feature small{font-size:8.5px;line-height:1.3;color:#7187aa;text-align:start}.ref-tools-row{width:100%;min-height:58px;margin-top:8px;padding:8px 11px;border:1px solid rgba(67,114,187,.34);border-radius:16px;background:linear-gradient(155deg,rgba(8,27,54,.94),rgba(4,16,35,.97));display:grid;grid-template-columns:38px 1fr 24px;align-items:center;gap:10px;text-align:left}.ref-tools-row>span:nth-child(2){display:flex;flex-direction:column;gap:2px;min-width:0}.ref-tools-row strong{font-size:11px}.ref-tools-row small{font-size:8.5px;color:#7187aa}.ref-row-arrow{display:grid;place-items:center;color:#7b90b0}.ref-row-arrow svg{width:14px!important;height:14px!important}
.ref-section{margin-top:22px}.ref-section-title{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}.ref-section-title h2{margin:0;font-size:13px;letter-spacing:-.01em}.ref-section-title button{min-height:30px;padding:0 2px;border:0;background:transparent;display:flex;align-items:center;gap:3px;font-size:9px;color:#7d91b0}.ref-section-title button svg{width:10px!important;height:10px!important}.ref-list{display:flex;flex-direction:column;gap:7px}.ref-history-row{width:100%;min-height:62px;padding:8px 9px;border:1px solid rgba(65,110,178,.28);border-radius:15px;background:linear-gradient(155deg,rgba(8,26,52,.94),rgba(5,18,38,.98));display:grid;grid-template-columns:38px minmax(0,1fr) auto 18px;align-items:center;gap:8px;text-align:left}.history-icon{width:36px;height:36px;border-radius:11px;display:grid;place-items:center;background:rgba(27,101,255,.10);border:1px solid rgba(42,126,255,.18);color:#278eff}.history-icon.game{color:#8668ff;background:rgba(117,77,255,.09);border-color:rgba(117,77,255,.17)}.history-icon svg{width:17px!important;height:17px!important}.history-copy{min-width:0;display:flex;flex-direction:column;gap:3px}.history-copy strong{font-size:10.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.history-copy small{font-size:8.5px;color:#7186a8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.history-meta{font-size:8px;color:#7184a3;white-space:nowrap}.history-arrow{display:grid;place-items:center;color:#8295b3}.history-arrow svg{width:12px!important;height:12px!important}
.ref-model-row{width:100%;min-height:66px;padding:8px 10px;border:1px solid rgba(65,110,178,.28);border-radius:16px;background:linear-gradient(155deg,rgba(8,26,52,.94),rgba(5,18,38,.98));display:grid;grid-template-columns:42px minmax(0,1fr) 20px;align-items:center;gap:9px;text-align:left}.model-orb{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 32% 28%,#43e2e8 0 6%,#198eff 25%,#405bff 55%,#a34fff 100%);box-shadow:0 0 18px rgba(50,108,255,.38)}.model-orb i{width:17px;height:17px;border-radius:50%;background:radial-gradient(circle at 38% 32%,#fff 0 7%,#a7f3ff 15%,rgba(255,255,255,0) 58%)}.model-copy{min-width:0;display:flex;flex-direction:column;gap:4px}.model-copy>span{display:flex;align-items:center;gap:7px;min-width:0}.model-copy strong{font-size:10.5px}.model-copy em{font-style:normal;font-size:7.5px;padding:3px 6px;border-radius:999px;color:#9db6ff;border:1px solid rgba(75,118,255,.28);background:rgba(55,87,204,.09)}.model-copy small{font-size:8.5px;color:#7186a8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.model-arrow{display:grid;place-items:center;color:#8497b5}.model-arrow svg{width:12px!important;height:12px!important}
.ref-bottom-nav{position:fixed;left:50%;bottom:max(9px,env(safe-area-inset-bottom));transform:translateX(-50%);width:min(calc(100% - 22px),371px);height:72px;padding:7px 7px;display:grid;grid-template-columns:1fr 1fr 64px 1fr 1fr;align-items:center;border:1px solid rgba(71,111,174,.35);border-radius:21px;background:rgba(3,13,29,.94);box-shadow:0 20px 50px rgba(0,0,0,.46),inset 0 1px 0 rgba(255,255,255,.035);backdrop-filter:blur(14px);z-index:25}.ref-bottom-nav>button:not(.ref-orb-button){height:54px;border:0;border-radius:14px;background:transparent;padding:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;color:#6f82a3}.ref-bottom-nav>button:not(.ref-orb-button)>span{height:19px;display:grid;place-items:center}.ref-bottom-nav>button:not(.ref-orb-button) svg{width:18px!important;height:18px!important}.ref-bottom-nav small{font-size:8px}.ref-bottom-nav>button.active{color:#ecf4ff}.ref-bottom-nav>button.active>span{color:#218dff;text-shadow:0 0 12px rgba(33,141,255,.8)}.ref-orb-button{position:relative;width:58px;height:58px;justify-self:center;border:1px solid rgba(103,111,255,.62);border-radius:50%;background:rgba(7,16,36,.98);padding:4px;display:grid;place-items:center;box-shadow:0 0 20px rgba(54,88,255,.28)}.ref-orb-ring{width:48px;height:48px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 30% 24%,#37e0e9 0 6%,#168fff 25%,#355bff 55%,#8f4dff 100%);box-shadow:0 0 18px rgba(52,93,255,.48),inset 0 1px 0 rgba(255,255,255,.35)}.ref-orb-ring i{font-style:normal;font-size:21px;font-weight:900;color:#fff;transform:translateY(-1px)}
.seven-day .seven-home-reference{--rh-text:#091327;--rh-muted:#5f7190;--rh-muted2:#70809a;--rh-line:rgba(57,91,143,.25);--rh-line-soft:rgba(72,103,152,.16);background:linear-gradient(180deg,#f7faff,#eef4fc 52%,#e9f0fa 100%);color:var(--rh-text)}.seven-day .ref-ambient i{background:radial-gradient(circle,rgba(39,115,255,.13),rgba(108,75,220,.04) 52%,transparent 72%)}.seven-day .ref-header .ref-wordmark{color:#0a1830}.seven-day .ref-icon-button{color:#263b5d}.seven-day .ref-avatar{border-color:rgba(62,102,167,.18)}.seven-day .ref-hero p,.seven-day .ref-feature small,.seven-day .ref-tools-row small,.seven-day .history-copy small,.seven-day .history-meta,.seven-day .model-copy small{color:#637796}.seven-day .ref-status{background:rgba(255,255,255,.72);color:#213654}.seven-day .ref-composer{background:linear-gradient(160deg,#ffffff,#f5f9ff);border-color:rgba(36,117,244,.65);box-shadow:0 0 0 1px rgba(56,158,255,.07),0 13px 34px rgba(37,74,128,.12)}.seven-day .ref-composer textarea{color:#0a1830}.seven-day .ref-composer textarea::placeholder{color:#7486a2}.seven-day .ref-mini-button,.seven-day .ref-action-pill{background:#f1f6fd;color:#304969;border-color:rgba(68,99,150,.16)}.seven-day .ref-feature,.seven-day .ref-tools-row,.seven-day .ref-history-row,.seven-day .ref-model-row{background:linear-gradient(155deg,#ffffff,#f4f8fe);border-color:rgba(54,89,143,.19);box-shadow:0 7px 20px rgba(42,72,115,.055)}.seven-day .feature-icon,.seven-day .history-icon{background:#edf5ff}.seven-day .ref-section-title button{color:#617493}.seven-day .ref-bottom-nav{background:rgba(249,252,255,.94);border-color:rgba(69,100,151,.23);box-shadow:0 18px 42px rgba(38,67,108,.15)}.seven-day .ref-bottom-nav>button:not(.ref-orb-button){color:#71819a}.seven-day .ref-bottom-nav>button.active{color:#102443}.seven-day .ref-orb-button{background:#f5f8ff}
.seven-rtl .seven-home-reference{direction:rtl}.seven-rtl .ref-wordmark{letter-spacing:.2em;padding-left:0;padding-right:1px}.seven-rtl .ref-feature,.seven-rtl .ref-tools-row,.seven-rtl .ref-history-row,.seven-rtl .ref-model-row{text-align:right}.seven-rtl [data-directional="true"]{transform:scaleX(-1)}
.seven-large .ref-features{grid-template-columns:1fr 1fr}.seven-large .ref-feature{min-height:116px}.seven-large .ref-hero{grid-template-columns:1fr}.seven-large .ref-status{justify-self:start}.seven-large .ref-action-pill span{display:none}.seven-large .ref-action-pill{width:35px;padding:0;justify-content:center}.seven-large .history-meta{display:none}
.seven-lite .seven-home-reference *{box-shadow:none!important;backdrop-filter:none!important}.seven-lite .ref-ambient{display:none}.seven-lite .ref-bottom-nav{background:#07152a}.seven-day.seven-lite .ref-bottom-nav{background:#f8fbff}
.seven-reduced .seven-home-reference *{animation:none!important;transition:none!important;scroll-behavior:auto!important}
@media(max-width:340px){.seven-home-reference{padding-left:12px;padding-right:12px}.ref-header{margin-bottom:25px}.ref-logo{width:40px}.seven-ribbon{width:40px}.ref-wordmark{font-size:13px;letter-spacing:.23em}.ref-header-actions{gap:3px}.ref-icon-button,.ref-avatar{width:38px;height:38px}.ref-hero{grid-template-columns:1fr;margin-bottom:16px}.ref-hero h1{font-size:25px}.ref-status{justify-self:start;margin-top:2px}.ref-composer{padding-left:11px;padding-right:11px}.ref-action-pill{padding:0 7px}.ref-action-pill span{font-size:9px}.ref-features{gap:6px}.ref-feature{padding:10px 8px;min-height:102px}.ref-feature strong{font-size:10px}.ref-feature small{font-size:8px}.ref-history-row{grid-template-columns:34px minmax(0,1fr) 16px}.history-meta{display:none}.ref-bottom-nav{width:calc(100% - 14px);grid-template-columns:1fr 1fr 58px 1fr 1fr}.ref-bottom-nav small{font-size:7.5px}.ref-orb-button{width:54px;height:54px}.ref-orb-ring{width:44px;height:44px}}
`;

  function install(editor) {
    if (!editor || editor.__sevenHomeReferenceV2Installed) return;
    editor.__sevenHomeReferenceV2Installed = true;
    let busy = false;
    let timer = 0;

    const ensureCSS = () => {
      try {
        const css = String(editor.getCss?.() || '');
        if (!css.includes(STYLE_MARKER)) editor.addStyle(CSS);
      } catch (_) {}
    };

    const apply = () => {
      if (busy) return;
      ensureCSS();
      let home;
      try { home = editor.getWrapper()?.find('[data-seven-screen="home"]')?.[0]; } catch (_) { return; }
      if (!home) return;
      const attrs = home.getAttributes?.() || {};
      if (attrs['data-seven-home-version'] === VERSION) return;
      busy = true;
      try {
        editor.setComponents(HOME);
        ensureCSS();
        window.dispatchEvent(new CustomEvent('seven-home-reference-v2-installed', { detail: { version: VERSION } }));
      } catch (_) {
      } finally {
        setTimeout(() => { busy = false; }, 140);
      }
    };

    const schedule = (delay = 40) => {
      clearTimeout(timer);
      timer = setTimeout(apply, delay);
    };

    editor.on?.('load', () => { schedule(60); setTimeout(apply, 420); setTimeout(apply, 1000); });
    editor.on?.('update', () => schedule(80));
    editor.on?.('page:select', () => schedule(80));
    setTimeout(apply, 120);
    setTimeout(apply, 650);
    setTimeout(apply, 1400);
  }

  if (window.__sevenDesignEditor) install(window.__sevenDesignEditor);
  window.addEventListener('seven-design-editor-ready', event => install(event.detail?.editor || window.__sevenDesignEditor), { once: true });
})();
