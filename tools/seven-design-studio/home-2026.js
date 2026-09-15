(() => {
  'use strict';

  const VERSION = '2026.09-home-v1';
  const STYLE_MARKER = '--seven-home-v2';

  const icon = (path, extra = '') => `<svg viewBox="0 0 24 24" aria-hidden="true" ${extra}><path d="${path}"/></svg>`;

  const icons = {
    plus: icon('M12 5v14M5 12h14'),
    mic: icon('M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Zm-6 9a6 6 0 0 0 12 0M12 18v3M9 21h6'),
    arrow: icon('M12 19V5m0 0-5 5m5-5 5 5'),
    search: icon('M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm5 12 4 4'),
    code: icon('m8 9-4 3 4 3m8-6 4 3-4 3m-3-8-2 10'),
    spark: icon('M12 3l1.25 4.75L18 9l-4.75 1.25L12 15l-1.25-4.75L6 9l4.75-1.25L12 3Zm6 11 .65 2.35L21 17l-2.35.65L18 20l-.65-2.35L15 17l2.35-.65L18 14Z'),
    world: icon('M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 0c2.2 2.45 3.25 5.45 3.15 9-.1 3.55-1.15 6.55-3.15 9m0-18C9.8 5.45 8.75 8.45 8.85 12c.1 3.55 1.15 6.55 3.15 9M3.5 9h17M3.5 15h17'),
    home: icon('m4 11 8-7 8 7v9h-6v-6h-4v6H4v-9Z'),
    spaces: icon('M4 5h6v6H4V5Zm10 0h6v6h-6V5ZM4 15h6v4H4v-4Zm10 0h6v4h-6v-4Z'),
    library: icon('M5 4h4v16H5V4Zm6 2h4v14h-4V6Zm6-2h2v16h-2V4Z'),
    user: icon('M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0'),
    chevron: icon('m9 6 6 6-6 6'),
    folder: icon('M3 7h7l2 2h9v10H3V7Z'),
    research: icon('M5 5h14v11H5V5Zm4 14h6M12 16v3'),
    pulse: icon('M3 12h4l2-5 4 10 2-5h6')
  };

  const HOME = `
<main class="seven-screen seven-home-v2" data-seven-screen="home" data-seven-home-version="${VERSION}">
  <div class="home-ambient" aria-hidden="true"><span></span><span></span></div>

  <header class="home-topbar">
    <button class="home-identity" aria-label="Seven">
      <span class="home-mark"><i>7</i><b></b></span>
      <span class="home-brand-copy"><strong>SEVEN</strong><small><span class="home-live-dot"></span>Ready</small></span>
    </button>
    <button class="home-avatar" aria-label="Profile"><span>DT</span></button>
  </header>

  <section class="home-hero" aria-labelledby="homeQuestion">
    <p class="home-kicker">YOUR INTELLIGENCE SPACE</p>
    <h1 id="homeQuestion">What do you want<br><em>to make happen?</em></h1>
    <p class="home-subcopy">Ask naturally. Seven chooses the right path, tools and depth.</p>
  </section>

  <section class="home-composer seven-state-accent" data-seven-state="idle" data-seven-component="composer">
    <textarea aria-label="Message Seven" placeholder="Ask, create, research, build…"></textarea>
    <div class="home-composer-foot">
      <div class="home-composer-left">
        <button class="home-round-btn" aria-label="Add files or tools">${icons.plus}</button>
        <button class="home-mode-pill" aria-label="Compute mode"><span class="mode-gem"></span>Auto<small>⌄</small></button>
      </div>
      <div class="home-composer-right">
        <button class="home-round-btn home-voice" aria-label="Voice">${icons.mic}</button>
        <button class="home-send" aria-label="Send">${icons.arrow}</button>
      </div>
    </div>
  </section>

  <section class="home-modes" aria-label="Quick modes">
    <button class="home-mode-card"><span class="mode-icon research">${icons.search}</span><span><strong>Research</strong><small>Find & verify</small></span></button>
    <button class="home-mode-card"><span class="mode-icon code">${icons.code}</span><span><strong>Code</strong><small>Build & fix</small></span></button>
    <button class="home-mode-card"><span class="mode-icon create">${icons.spark}</span><span><strong>Create</strong><small>Make anything</small></span></button>
    <button class="home-mode-card"><span class="mode-icon world">${icons.world}</span><span><strong>World</strong><small>Enter a world</small></span></button>
  </section>

  <section class="home-active" aria-label="Active task">
    <div class="home-section-head"><span>In progress</span><button>View all</button></div>
    <article class="home-task-card" data-seven-state="researching">
      <div class="home-task-orbit" aria-hidden="true"><i></i><b></b></div>
      <div class="home-task-copy">
        <div class="home-task-title"><strong>Exploring modern AI interfaces</strong><span>Live</span></div>
        <p>Comparing interaction patterns and visual systems</p>
        <div class="home-task-meta"><span class="state-node"></span><b>Researching</b><span>6 sources</span><span>2m</span></div>
      </div>
      <button class="home-chevron" aria-label="Open task">${icons.chevron}</button>
    </article>
  </section>

  <section class="home-continue" aria-label="Continue">
    <div class="home-section-head"><span>Continue</span><button>History</button></div>
    <div class="home-continue-track">
      <article class="continue-card continue-project">
        <div class="continue-top"><span class="continue-icon">${icons.folder}</span><span>Project</span></div>
        <strong>Seven AI</strong>
        <p>Home design system</p>
        <div class="continue-bottom"><span>12 min ago</span><button aria-label="Open Seven AI">${icons.chevron}</button></div>
      </article>
      <article class="continue-card continue-research">
        <div class="continue-top"><span class="continue-icon">${icons.research}</span><span>Research</span></div>
        <strong>Model frontier</strong>
        <p>Latest free model candidates</p>
        <div class="continue-bottom"><span>Yesterday</span><button aria-label="Open research">${icons.chevron}</button></div>
      </article>
    </div>
  </section>

  <section class="home-for-you" aria-label="For you">
    <div class="home-section-head"><span>For you</span></div>
    <article class="home-suggestion">
      <span class="suggestion-glyph">${icons.pulse}</span>
      <div><strong>Keep building Seven Home</strong><p>Continue where the design session left off.</p></div>
      <button aria-label="Continue suggestion">${icons.arrow}</button>
    </article>
  </section>

  <nav class="home-bottom-nav" aria-label="Primary navigation">
    <button class="active"><span>${icons.home}</span><small>Home</small></button>
    <button><span>${icons.spaces}</span><small>Spaces</small></button>
    <button class="home-orb" aria-label="New task"><span class="orb-core">7</span><i></i></button>
    <button><span>${icons.library}</span><small>Library</small></button>
    <button><span>${icons.user}</span><small>You</small></button>
  </nav>
</main>`;

  const CSS = `
:root{--seven-home-v2:1}
.seven-home-v2{--home-bg:#08101f;--home-surface:#101a2d;--home-surface-hi:#14213a;--home-text:#f7f9fe;--home-muted:#8798b4;--home-line:rgba(166,187,219,.14);--home-blue:#4d72ff;--home-cyan:#35d0df;--home-violet:#8b67f1;position:relative;isolation:isolate;min-height:100vh;padding:18px 16px 112px;background:linear-gradient(180deg,#091223 0%,#08101f 46%,#070d19 100%);color:var(--home-text);overflow:hidden;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
.seven-home-v2 *{box-sizing:border-box}.seven-home-v2 button,.seven-home-v2 textarea{font:inherit}.seven-home-v2 button{color:inherit}.seven-home-v2 svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.home-ambient{position:absolute;inset:0;pointer-events:none;z-index:-1;overflow:hidden}.home-ambient span:first-child{position:absolute;width:310px;height:310px;border-radius:50%;right:-180px;top:-145px;background:radial-gradient(circle,rgba(70,111,255,.23),rgba(123,88,238,.08) 48%,transparent 70%);filter:blur(2px)}.home-ambient span:last-child{position:absolute;width:220px;height:220px;border-radius:50%;left:-170px;top:350px;background:radial-gradient(circle,rgba(53,208,223,.09),transparent 68%)}
.home-topbar{display:flex;align-items:center;justify-content:space-between;min-height:48px;margin-bottom:46px}.home-identity{display:flex;align-items:center;gap:10px;border:0;background:transparent;padding:2px}.home-mark{position:relative;width:36px;height:36px;border-radius:12px 12px 12px 6px;display:grid;place-items:center;background:linear-gradient(145deg,rgba(53,208,223,.18),rgba(77,114,255,.14) 48%,rgba(139,103,241,.18));border:1px solid rgba(128,165,255,.22);box-shadow:inset 0 1px 0 rgba(255,255,255,.07)}.home-mark i{font-style:normal;font-size:20px;font-weight:900;line-height:1;background:linear-gradient(135deg,#56e0e9 5%,#6c91ff 48%,#a879ff 95%);-webkit-background-clip:text;background-clip:text;color:transparent;transform:translateY(-1px)}.home-mark b{position:absolute;width:9px;height:2px;border-radius:4px;right:-4px;bottom:7px;background:#5f7cff;box-shadow:0 0 12px rgba(95,124,255,.75)}
.home-brand-copy{display:flex;flex-direction:column;align-items:flex-start;gap:1px}.home-brand-copy strong{font-size:12px;line-height:1.1;letter-spacing:.17em;font-weight:760}.home-brand-copy small{display:flex;align-items:center;gap:5px;font-size:10px;color:var(--home-muted)}.home-live-dot{width:5px;height:5px;border-radius:50%;background:#45d5b1;box-shadow:0 0 8px rgba(69,213,177,.48)}
.home-avatar{width:40px;height:40px;border-radius:14px;border:1px solid var(--home-line);background:linear-gradient(145deg,#17243a,#0d1729);padding:0;display:grid;place-items:center;box-shadow:inset 0 1px 0 rgba(255,255,255,.05)}.home-avatar span{font-size:10px;font-weight:750;letter-spacing:.04em;color:#cbd6e8}
.home-hero{margin-bottom:20px}.home-kicker{margin:0 0 9px;font-size:9px;font-weight:760;letter-spacing:.19em;color:#6f83a2}.home-hero h1{margin:0;font-size:32px;line-height:1.04;letter-spacing:-.047em;font-weight:690;max-width:330px}.home-hero h1 em{font-style:normal;font-weight:720;background:linear-gradient(100deg,#f8fbff 8%,#9fc0ff 48%,#bea7ff 92%);-webkit-background-clip:text;background-clip:text;color:transparent}.home-subcopy{margin:12px 0 0;max-width:325px;font-size:12px;line-height:1.55;color:#8192ad}
.home-composer{position:relative;padding:15px 14px 12px;border-radius:24px 24px 24px 12px;border:1px solid rgba(148,174,216,.18);background:linear-gradient(160deg,rgba(20,33,56,.94),rgba(12,22,39,.96));box-shadow:0 18px 58px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.055);overflow:hidden}.home-composer:before{content:"";position:absolute;left:0;top:0;width:42%;height:1px;background:linear-gradient(90deg,var(--home-cyan),var(--home-blue),transparent);opacity:.75}.home-composer:focus-within{border-color:rgba(91,126,255,.5);box-shadow:0 0 0 3px rgba(77,114,255,.1),0 22px 65px rgba(0,0,0,.3)}.home-composer textarea{display:block;width:100%;min-height:90px;max-height:190px;resize:vertical;border:0;outline:0;background:transparent;color:var(--home-text);font-size:16px;line-height:1.5;padding:2px 2px 12px}.home-composer textarea::placeholder{color:#71829f}.home-composer-foot,.home-composer-left,.home-composer-right{display:flex;align-items:center}.home-composer-foot{justify-content:space-between;gap:10px}.home-composer-left,.home-composer-right{gap:8px}.home-round-btn{width:38px;height:38px;border-radius:13px;border:1px solid var(--home-line);background:#111c30;display:grid;place-items:center;padding:0;color:#b4c0d3}.home-mode-pill{height:38px;padding:0 11px;border-radius:13px;border:1px solid var(--home-line);background:#111c30;display:flex;align-items:center;gap:7px;font-size:12px;font-weight:620;color:#d3dbea}.home-mode-pill small{font-size:10px;color:#70829e;margin-left:1px}.mode-gem{width:7px;height:7px;border-radius:3px 3px 3px 1px;transform:rotate(45deg);background:linear-gradient(135deg,#42d5df,#657cff 55%,#9f72f4)}.home-voice{background:transparent;border-color:transparent}.home-send{width:40px;height:40px;border:0;border-radius:14px 14px 14px 7px;display:grid;place-items:center;padding:0;background:linear-gradient(145deg,#4e83ff,#6e64f3 58%,#9a65e7);color:#fff;box-shadow:0 7px 22px rgba(71,96,238,.28)}.home-send svg{width:18px;height:18px;stroke-width:2}
.home-modes{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:12px}.home-mode-card{min-height:58px;padding:8px 10px;border-radius:16px;border:1px solid rgba(148,174,216,.12);background:rgba(15,25,43,.72);display:flex;align-items:center;gap:9px;text-align:left}.mode-icon{flex:0 0 34px;width:34px;height:34px;border-radius:11px;display:grid;place-items:center;background:#121f35;border:1px solid rgba(255,255,255,.04)}.mode-icon svg{width:16px;height:16px}.mode-icon.research{color:#54d5e0}.mode-icon.code{color:#5ab9ff}.mode-icon.create{color:#b188ff}.mode-icon.world{color:#8b82ff}.home-mode-card>span:last-child{min-width:0;display:flex;flex-direction:column;gap:2px}.home-mode-card strong{font-size:11px;font-weight:670}.home-mode-card small{font-size:9px;color:#71839f}
.home-active,.home-continue,.home-for-you{margin-top:27px}.home-section-head{display:flex;align-items:center;justify-content:space-between;margin:0 2px 10px}.home-section-head>span{font-size:11px;font-weight:720;letter-spacing:.025em;color:#cfd8e8}.home-section-head button{border:0;background:transparent;padding:4px;font-size:10px;color:#7385a2}.home-task-card{position:relative;min-height:84px;padding:13px 40px 13px 13px;border-radius:20px 20px 20px 9px;border:1px solid rgba(39,194,220,.15);background:linear-gradient(150deg,rgba(13,33,50,.92),rgba(13,24,42,.92));display:flex;align-items:center;gap:12px;overflow:hidden}.home-task-card:after{content:"";position:absolute;left:0;top:13px;bottom:13px;width:2px;border-radius:3px;background:linear-gradient(#36d2df,#4f78ff);box-shadow:0 0 12px rgba(52,207,222,.35)}.home-task-orbit{position:relative;flex:0 0 42px;width:42px;height:42px;border:1px solid rgba(75,211,224,.2);border-radius:50%;display:grid;place-items:center}.home-task-orbit i{width:22px;height:22px;border-radius:8px 8px 8px 3px;background:linear-gradient(145deg,rgba(53,208,223,.2),rgba(77,114,255,.28));border:1px solid rgba(101,144,255,.34)}.home-task-orbit b{position:absolute;top:-2px;left:18px;width:7px;height:7px;border-radius:50%;background:#43cfdf;box-shadow:0 0 11px rgba(67,207,223,.6)}.home-task-copy{min-width:0;flex:1}.home-task-title{display:flex;align-items:center;gap:7px}.home-task-title strong{font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.home-task-title span{font-size:8px;padding:2px 6px;border-radius:999px;background:rgba(53,208,223,.09);color:#66dce7;border:1px solid rgba(53,208,223,.12)}.home-task-copy p{margin:4px 0 7px;font-size:9px;color:#7486a1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.home-task-meta{display:flex;align-items:center;gap:7px;font-size:8px;color:#6d7f9b}.home-task-meta .state-node{width:6px;height:6px}.home-task-meta b{font-weight:620;color:#95a8c5}.home-chevron{position:absolute;right:10px;top:50%;transform:translateY(-50%);width:30px;height:30px;border:0;background:transparent;color:#7285a3;padding:5px}.home-chevron svg{width:15px}
.home-continue-track{display:grid;grid-template-columns:1fr 1fr;gap:10px}.continue-card{position:relative;min-height:126px;padding:13px;border-radius:19px 19px 19px 9px;border:1px solid var(--home-line);background:linear-gradient(155deg,#101c30,#0c1728);overflow:hidden}.continue-card:before{content:"";position:absolute;right:-24px;top:-24px;width:75px;height:75px;border-radius:50%;background:radial-gradient(circle,rgba(79,113,255,.13),transparent 70%)}.continue-research:before{background:radial-gradient(circle,rgba(53,208,223,.11),transparent 70%)}.continue-top,.continue-bottom{display:flex;align-items:center}.continue-top{gap:6px;margin-bottom:14px;color:#788aa5}.continue-top>span:last-child{font-size:8px;text-transform:uppercase;letter-spacing:.1em;font-weight:700}.continue-icon{width:25px;height:25px;border-radius:8px;background:rgba(79,113,255,.09);display:grid;place-items:center;color:#7b9bff}.continue-research .continue-icon{background:rgba(53,208,223,.08);color:#63d8e2}.continue-icon svg{width:13px;height:13px}.continue-card>strong{display:block;font-size:12px;margin-bottom:4px}.continue-card>p{margin:0;font-size:9px;line-height:1.4;color:#71839d;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.continue-bottom{justify-content:space-between;margin-top:15px;color:#64758f}.continue-bottom>span{font-size:8px}.continue-bottom button{width:27px;height:27px;border:1px solid var(--home-line);border-radius:9px;background:#111d31;display:grid;place-items:center;padding:0;color:#8091aa}.continue-bottom svg{width:12px;height:12px}
.home-suggestion{position:relative;display:grid;grid-template-columns:38px 1fr 36px;align-items:center;gap:10px;padding:12px;border-radius:18px;border:1px solid var(--home-line);background:rgba(14,24,41,.78)}.suggestion-glyph{width:38px;height:38px;border-radius:13px;display:grid;place-items:center;background:linear-gradient(145deg,rgba(80,108,255,.12),rgba(144,91,233,.12));color:#9baaff}.suggestion-glyph svg{width:17px}.home-suggestion strong{display:block;font-size:10px}.home-suggestion p{margin:3px 0 0;font-size:9px;line-height:1.4;color:#71839d}.home-suggestion button{width:34px;height:34px;border-radius:11px;border:0;background:#121e32;display:grid;place-items:center;padding:0;color:#8ea0ba}.home-suggestion button svg{width:14px}
.home-bottom-nav{position:fixed;left:50%;bottom:max(11px,env(safe-area-inset-bottom));transform:translateX(-50%);width:min(calc(100% - 22px),371px);height:68px;padding:6px 8px;display:grid;grid-template-columns:1fr 1fr 66px 1fr 1fr;align-items:center;border:1px solid rgba(158,179,214,.14);border-radius:24px;background:rgba(10,18,32,.94);box-shadow:0 18px 48px rgba(0,0,0,.38),inset 0 1px 0 rgba(255,255,255,.04);backdrop-filter:blur(14px);z-index:20}.home-bottom-nav>button:not(.home-orb){height:52px;border:0;background:transparent;border-radius:15px;color:#60728e;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:0}.home-bottom-nav>button span{height:21px;display:grid;place-items:center}.home-bottom-nav>button svg{width:17px;height:17px}.home-bottom-nav small{font-size:8px;font-weight:610}.home-bottom-nav>button.active{color:#dce6f6}.home-bottom-nav>button.active span{color:#7f9cff}.home-orb{position:relative;width:56px;height:56px;justify-self:center;border:0;border-radius:19px 19px 19px 9px;padding:0;background:linear-gradient(145deg,#31cbd9 0%,#5578ff 48%,#9366e9 100%);box-shadow:0 8px 26px rgba(70,95,233,.34),inset 0 1px 0 rgba(255,255,255,.28);display:grid;place-items:center}.orb-core{font-size:19px;font-weight:900;color:#fff}.home-orb i{position:absolute;width:64px;height:64px;border-radius:22px;border:1px solid rgba(91,132,255,.14)}
body.seven-day .seven-home-v2{--home-bg:#f5f7fb;--home-surface:#fff;--home-surface-hi:#f0f3f9;--home-text:#10182a;--home-muted:#6d7a90;--home-line:rgba(55,78,116,.13);background:linear-gradient(180deg,#f7f9fd 0%,#f3f6fb 60%,#eef2f8 100%);color:var(--home-text)}body.seven-day .home-ambient span:first-child{background:radial-gradient(circle,rgba(79,113,255,.12),rgba(141,103,239,.04) 48%,transparent 70%)}body.seven-day .home-avatar,body.seven-day .home-round-btn,body.seven-day .home-mode-pill{background:#fff}body.seven-day .home-composer{background:linear-gradient(160deg,#fff,#f7f9fd);border-color:rgba(61,91,143,.14);box-shadow:0 18px 48px rgba(36,59,98,.09),inset 0 1px 0 #fff}body.seven-day .home-mode-card{background:rgba(255,255,255,.82)}body.seven-day .mode-icon{background:#f1f4f9}body.seven-day .home-task-card{background:linear-gradient(150deg,#fbfdff,#f4f8fc)}body.seven-day .continue-card{background:linear-gradient(155deg,#fff,#f5f8fc)}body.seven-day .home-suggestion{background:rgba(255,255,255,.82)}body.seven-day .continue-bottom button,body.seven-day .home-suggestion button{background:#f4f6fa}body.seven-day .home-bottom-nav{background:rgba(255,255,255,.95);box-shadow:0 16px 42px rgba(34,55,92,.15),inset 0 1px 0 #fff}body.seven-day .home-brand-copy strong,body.seven-day .home-hero h1{color:#10182a}body.seven-day .home-hero h1 em{background:linear-gradient(100deg,#10182a 8%,#4567be 52%,#7256c5 94%);-webkit-background-clip:text;background-clip:text;color:transparent}
body.seven-rtl .home-brand-copy{align-items:flex-end}body.seven-rtl .home-mode-card{text-align:right}body.seven-rtl .home-task-card{padding:13px 13px 13px 40px}body.seven-rtl .home-task-card:after{left:auto;right:0}body.seven-rtl .home-chevron{right:auto;left:10px;transform:translateY(-50%) scaleX(-1)}body.seven-rtl .continue-bottom button svg{transform:scaleX(-1)}
body.seven-large .home-hero h1{font-size:36px}body.seven-large .home-subcopy{font-size:14px}body.seven-large .home-mode-card{min-height:66px}body.seven-large .home-mode-card strong{font-size:13px}body.seven-large .home-mode-card small{font-size:10px}
body.seven-lite .home-ambient{display:none}body.seven-lite .home-bottom-nav{backdrop-filter:none;background:#0a1220}body.seven-day.seven-lite .home-bottom-nav{background:#fff}body.seven-lite .home-mark b,body.seven-lite .home-live-dot{box-shadow:none}
@media(max-width:340px){.seven-home-v2{padding-left:12px;padding-right:12px}.home-topbar{margin-bottom:37px}.home-hero h1{font-size:28px}.home-subcopy{font-size:11px}.home-composer{padding:13px 12px 10px;border-radius:21px 21px 21px 10px}.home-composer textarea{min-height:78px}.home-modes{gap:7px}.home-mode-card{padding:7px 8px}.mode-icon{flex-basis:31px;width:31px;height:31px}.home-continue-track{gap:8px}.continue-card{padding:11px}.home-bottom-nav{width:calc(100% - 14px);grid-template-columns:1fr 1fr 60px 1fr 1fr}.home-orb{width:52px;height:52px}}
@media(prefers-reduced-motion:reduce){.seven-home-v2 *{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
`;

  function install(editor) {
    if (!editor || editor.__sevenHome2026Installed) return;
    editor.__sevenHome2026Installed = true;

    const cssNow = typeof editor.getCss === 'function' ? editor.getCss() : '';
    if (!String(cssNow).includes(STYLE_MARKER)) editor.addStyle(CSS);

    let busy = false;
    const upgrade = () => {
      if (busy) return;
      let home;
      try {
        home = editor.getWrapper().find('[data-seven-screen="home"]')[0];
      } catch (_) {
        return;
      }
      if (!home) return;
      const attrs = home.getAttributes ? home.getAttributes() : {};
      if (attrs && attrs['data-seven-home-version'] === VERSION) return;
      busy = true;
      try {
        editor.setComponents(HOME);
        if (typeof editor.store === 'function') editor.store();
        window.dispatchEvent(new CustomEvent('seven-home-2026-installed', { detail: { version: VERSION } }));
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
