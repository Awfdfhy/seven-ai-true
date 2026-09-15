(() => {
  'use strict';

  const VERSION='2026.09-chat-v1';
  const PAGE_ID='seven-chat-v1';
  const STYLE_MARKER='--seven-chat-ui-v1';

  const markSvg=`<svg viewBox="0 0 100 78" aria-hidden="true" focusable="false"><defs><linearGradient id="svChatLoop" x1="8" y1="13" x2="88" y2="19" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#32BECF"/><stop offset=".24" stop-color="#22D3EE"/><stop offset=".54" stop-color="#4166F5"/><stop offset=".78" stop-color="#4D58F4"/><stop offset="1" stop-color="#8265DC"/></linearGradient><linearGradient id="svChatTail" x1="78" y1="13" x2="39" y2="70" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#8265DC"/><stop offset=".58" stop-color="#4166F5"/><stop offset="1" stop-color="#32BECF"/></linearGradient></defs><path fill="url(#svChatLoop)" fill-rule="evenodd" clip-rule="evenodd" d="M10.8 11.8C29.4 3.7 61.2 1.8 81.6 5.6c7.8 1.5 10.7 6.8 6.7 12.8-5.1 7.6-20.7 13-41.9 16.3-19.5 3-35.8 1.7-41-6.2-3.7-5.7-.9-12.2 5.4-16.7Zm12.4 8.5c-5.2 2.2-7.2 4.3-5.8 6.4 2.1 3.2 12.5 3.7 25.9 1.6 12.8-2 22.8-5.1 28.1-9.1-14.7-.9-33.5.8-48.2 1.1Z"/><path fill="url(#svChatTail)" d="M68.2 15.5c4.3-2.7 10-2.4 14 .6 4.1 3.1 4.8 8 1.5 12.3L50 69.1c-3.5 4.3-9.6 5-13.8 1.7-4.2-3.2-4.5-7.8-1.2-12.1l33.2-43.2Z"/><path fill="#071B68" fill-opacity=".23" d="M67.2 16.3c5.4-3.3 11.5-2.8 15.2.2-3.6 5.7-9.3 10.7-16.8 14.9l-7.7-5.5 9.3-9.6Z"/></svg>`;

  const icon=(d,cls='')=>`<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${d}"/></svg>`;
  const I={
    back:icon('M14.5 5.5 8 12l6.5 6.5','svchat-directional'),
    more:icon('M6 12h.01M12 12h.01M18 12h.01'),
    plus:icon('M12 5v14M5 12h14'),
    context:icon('M7 8h10M7 12h7M7 16h4M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z'),
    mic:icon('M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Zm-6 9a6 6 0 0 0 12 0M12 18v3M9 21h6'),
    copy:icon('M9 9h10v10H9zM5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1'),
    retry:icon('M20 6v5h-5M4 18v-5h5M18.2 9A7 7 0 0 0 6 7.4L4 11M5.8 15A7 7 0 0 0 18 16.6l2-3.6'),
    speaker:icon('M5 9v6h4l5 4V5L9 9H5Zm12.5.5a4 4 0 0 1 0 5'),
    chevron:icon('m9 7 5 5-5 5','svchat-directional'),
    code:icon('m8 9-3 3 3 3M16 9l3 3-3 3M14 5l-4 14'),
    source:icon('M7 4h10a2 2 0 0 1 2 2v14l-7-3-7 3V6a2 2 0 0 1 2-2Z'),
    stop:icon('M8 8h8v8H8z')
  };

  const CHAT_HTML=`
<main class="seven-chat-v1" data-seven-screen="chat" data-seven-chat-version="${VERSION}" data-seven-chat-state="thinking">
  <header class="svchat-topbar">
    <button class="svchat-icon svchat-back" type="button" aria-label="Back">${I.back}</button>
    <div class="svchat-conversation-meta">
      <div class="svchat-title-line"><span class="svchat-mini-mark">${markSvg}</span><strong>Seven</strong></div>
      <div class="svchat-runtime"><span class="svchat-state-node" aria-hidden="true"></span><span>Thinking</span><span aria-hidden="true">·</span><span>Auto</span></div>
    </div>
    <button class="svchat-icon" type="button" aria-label="Conversation menu">${I.more}</button>
  </header>

  <section class="svchat-thread" aria-label="Conversation">
    <div class="svchat-date">Today</div>

    <article class="svchat-turn svchat-user-turn" aria-label="You">
      <div class="svchat-user-bubble">Make Seven’s chat feel like a premium AI workspace, not a pile of cards.</div>
    </article>

    <article class="svchat-turn svchat-assistant-turn" aria-label="Seven">
      <header class="svchat-response-head"><span class="svchat-response-mark">${markSvg}</span><div><strong>Seven</strong><small><span class="svchat-state-node" aria-hidden="true"></span> Thinking</small></div></header>
      <div class="svchat-tool-trace" role="status"><span class="svchat-trace-line"></span><div><strong>Researching interface patterns</strong><small>6 sources checked · evidence attached</small></div><button class="svchat-ghost-icon" type="button" aria-label="Show research trace">${I.chevron}</button></div>
      <div class="svchat-answer">
        <p>The conversation stays visually quiet. Your message is clearly separated, while Seven’s response reads directly on the canvas instead of living inside another giant bubble.</p>
        <h2>One conversation, many kinds of work</h2>
        <p>Research, code, tools, files and world state appear inline only when they matter. The thread remains the spine of the experience.</p>
        <div class="svchat-code">
          <header><span>${I.code}<b>app.js</b></span><button type="button" aria-label="Copy code">${I.copy}<span>Copy</span></button></header>
          <pre><code><span class="svchat-code-key">const</span> experience = {
  surface: <span class="svchat-code-string">'conversation'</span>,
  context: <span class="svchat-code-string">'visible when useful'</span>,
  chrome: <span class="svchat-code-string">'quiet'</span>
};</code></pre>
        </div>
        <div class="svchat-source-rail" aria-label="Sources">
          <button type="button">${I.source}<span>Material 3</span><b>1</b></button>
          <button type="button">${I.source}<span>Android UX</span><b>2</b></button>
          <button type="button">${I.source}<span>Design system</span><b>3</b></button>
        </div>
      </div>
      <footer class="svchat-response-actions" aria-label="Response actions">
        <button type="button" aria-label="Copy response">${I.copy}</button>
        <button type="button" aria-label="Retry response">${I.retry}</button>
        <button type="button" aria-label="Read aloud">${I.speaker}</button>
        <button type="button" aria-label="More actions">${I.more}</button>
      </footer>
    </article>

    <article class="svchat-turn svchat-user-turn" aria-label="You">
      <div class="svchat-user-bubble">Keep Android, RTL and long coding outputs comfortable too.</div>
    </article>

    <article class="svchat-turn svchat-assistant-turn svchat-streaming" aria-label="Seven is responding">
      <header class="svchat-response-head"><span class="svchat-response-mark">${markSvg}</span><div><strong>Seven</strong><small><span class="svchat-state-node" aria-hidden="true"></span> Generating</small></div></header>
      <div class="svchat-answer"><p>Done. Long outputs get their own readable rhythm, code stays LTR, and the composer remains reachable above the keyboard.</p></div>
      <div class="svchat-cursor" aria-label="Streaming response"><span></span><span></span><span></span></div>
    </article>
  </section>

  <footer class="svchat-composer-zone" data-seven-component="chat-composer">
    <div class="svchat-mode-row" aria-label="Active modes"><button type="button" class="svchat-active-chip"><span>Research</span><b aria-hidden="true">×</b></button><button type="button" class="svchat-mode-chip"><span>Auto</span>${I.chevron}</button></div>
    <div class="svchat-composer">
      <textarea rows="1" aria-label="Message Seven" placeholder="Message Seven..."></textarea>
      <div class="svchat-composer-actions">
        <button class="svchat-icon" type="button" aria-label="Add file or tool">${I.plus}</button>
        <button class="svchat-context" type="button" aria-label="Context">${I.context}<span>Context</span><b>4</b></button>
        <span class="svchat-grow"></span>
        <button class="svchat-icon" type="button" aria-label="Voice">${I.mic}</button>
        <button class="svchat-primary" type="button" aria-label="Stop response">${I.stop}</button>
      </div>
    </div>
    <div class="svchat-safe-note">Seven can make mistakes. Verify important results.</div>
  </footer>
</main>`;

  const CSS=`
:root{--seven-chat-ui-v1:1}
.seven-chat-v1{
  --chat-bg:#07101f;--chat-panel:#0d192b;--chat-panel-2:#11213a;--chat-text:#f2f6fc;--chat-muted:#8ea1bc;--chat-line:rgba(125,153,198,.12);--chat-line-strong:rgba(112,150,213,.22);--chat-blue:#4166f5;--chat-cyan:#32becf;--chat-violet:#8265dc;
  position:relative;min-height:100vh;padding:0 16px calc(184px + env(safe-area-inset-bottom));overflow-x:hidden;color:var(--chat-text);background:radial-gradient(80% 38% at 102% -8%,rgba(65,102,245,.11),transparent 67%),linear-gradient(180deg,#081426 0%,#07101f 52%,#050b16 100%);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
}
.seven-chat-v1 *{box-sizing:border-box}.seven-chat-v1 button,.seven-chat-v1 textarea{font:inherit;color:inherit}.seven-chat-v1 button{cursor:pointer}.seven-chat-v1 svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round;display:block}.seven-chat-v1 .svchat-mini-mark svg,.seven-chat-v1 .svchat-response-mark svg{fill:initial;stroke:none}
.svchat-topbar{position:sticky;top:0;z-index:20;min-height:66px;margin:0 -16px 18px;padding:8px 16px;display:grid;grid-template-columns:48px 1fr 48px;align-items:center;gap:8px;background:linear-gradient(180deg,rgba(7,16,31,.995) 0%,rgba(7,16,31,.94) 72%,rgba(7,16,31,0) 100%)}
.svchat-icon,.svchat-ghost-icon,.svchat-primary,.svchat-context,.svchat-mode-chip,.svchat-active-chip,.svchat-source-rail button,.svchat-response-actions button,.svchat-code header button{border:0;outline:0}.svchat-icon{width:48px;height:48px;border-radius:15px;background:transparent;display:grid;place-items:center;color:#aebed3}.svchat-icon:active,.svchat-response-actions button:active,.svchat-ghost-icon:active{background:rgba(25,44,73,.48)}
.svchat-conversation-meta{min-width:0;text-align:center;display:flex;flex-direction:column;align-items:center;gap:2px}.svchat-title-line{height:27px;display:flex;align-items:center;gap:6px;min-width:0}.svchat-title-line strong{font-size:15px;letter-spacing:-.015em}.svchat-mini-mark{width:28px;height:22px;display:block;flex:0 0 auto}.svchat-runtime{min-height:18px;display:flex;align-items:center;justify-content:center;gap:5px;color:#7f94b2;font-size:11px}.svchat-state-node{width:7px;height:7px;border-radius:99px;background:linear-gradient(135deg,#665cff,#a855f7);box-shadow:0 0 9px rgba(121,91,246,.38);display:inline-block;flex:0 0 auto}.svchat-back .svchat-directional{margin-inline-start:-2px}
.svchat-thread{width:100%;max-width:760px;margin:0 auto}.svchat-date{width:max-content;margin:0 auto 20px;padding:0 9px;color:#6f829e;font-size:10.5px;letter-spacing:.045em;text-transform:uppercase}.svchat-turn{margin-bottom:25px}.svchat-user-turn{display:flex;justify-content:flex-end}.svchat-user-bubble{max-width:82%;padding:12px 14px;border:1px solid rgba(105,143,207,.14);border-radius:19px 19px 7px 19px;background:linear-gradient(145deg,rgba(29,49,82,.94),rgba(18,34,59,.96));color:#edf4fc;font-size:15px;line-height:1.5;box-shadow:0 7px 18px rgba(0,0,0,.08)}
.svchat-assistant-turn{padding-inline:2px}.svchat-response-head{min-height:42px;display:flex;align-items:center;gap:9px;margin-bottom:9px}.svchat-response-mark{width:34px;height:27px;display:block;flex:0 0 auto}.svchat-response-head>div{display:flex;flex-direction:column;gap:1px}.svchat-response-head strong{font-size:13px;font-weight:720}.svchat-response-head small{display:flex;align-items:center;gap:5px;color:#8296b3;font-size:10.8px}.svchat-answer{padding-inline-start:43px;color:#dfe8f5;font-size:15.2px;line-height:1.67}.svchat-answer p{margin:0 0 13px}.svchat-answer h2{margin:19px 0 8px;color:#f3f7fd;font-size:17px;line-height:1.25;letter-spacing:-.018em}.svchat-tool-trace{position:relative;margin:0 0 12px 43px;min-height:58px;padding:8px 48px 8px 13px;border-radius:13px;background:linear-gradient(90deg,rgba(15,31,54,.62),rgba(11,24,43,.15));display:flex;align-items:center;gap:10px}.svchat-trace-line{position:absolute;inset-block:10px;inset-inline-start:0;width:2px;border-radius:2px;background:linear-gradient(180deg,#00b8d9,#5067ff)}.svchat-tool-trace>div{min-width:0;display:flex;flex-direction:column;gap:3px}.svchat-tool-trace strong{font-size:11.5px;font-weight:650;color:#c5d3e5}.svchat-tool-trace small{font-size:10.5px;color:#7e92ad;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.svchat-ghost-icon{position:absolute;inset-inline-end:2px;top:5px;width:48px;height:48px;border-radius:13px;background:transparent;display:grid;place-items:center;color:#7187a5}
.svchat-code{margin:16px 0 15px;border:1px solid rgba(105,143,207,.12);border-radius:16px 16px 16px 6px;overflow:hidden;background:#06101d}.svchat-code header{min-height:44px;padding:0 8px 0 12px;border-bottom:1px solid rgba(105,143,207,.10);display:flex;align-items:center;justify-content:space-between;color:#91a4bf}.svchat-code header>span{display:flex;align-items:center;gap:7px}.svchat-code header b{font-size:11px;font-weight:600}.svchat-code header button{min-width:48px;height:44px;padding:0 9px;border-radius:11px;background:transparent;display:flex;align-items:center;gap:6px;color:#91a4bf}.svchat-code header button span{font-size:10.5px}.svchat-code pre{margin:0;padding:13px 14px 15px;overflow:auto;direction:ltr;text-align:left;font:12.2px/1.6 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:#c8d8ec}.svchat-code-key{color:#8ca5ff}.svchat-code-string{color:#71d5c4}
.svchat-source-rail{display:flex;gap:7px;margin:2px 0 13px;overflow-x:auto;scrollbar-width:none}.svchat-source-rail::-webkit-scrollbar{display:none}.svchat-source-rail button{min-width:max-content;height:42px;padding:0 10px;border-radius:13px;background:rgba(18,35,61,.55);display:flex;align-items:center;gap:7px;color:#9eb1ca}.svchat-source-rail button svg{width:15px;height:15px}.svchat-source-rail button span{font-size:10.8px}.svchat-source-rail button b{width:18px;height:18px;border-radius:99px;display:grid;place-items:center;background:rgba(65,102,245,.13);color:#adbcf6;font-size:9.5px}
.svchat-response-actions{margin-inline-start:43px;display:flex;align-items:center;gap:1px}.svchat-response-actions button{width:48px;height:48px;border-radius:14px;background:transparent;display:grid;place-items:center;color:#758aa8}.svchat-response-actions svg{width:18px;height:18px}.svchat-streaming{margin-bottom:6px}.svchat-cursor{margin:0 0 0 43px;height:20px;display:flex;align-items:center;gap:4px}.svchat-cursor span{width:5px;height:5px;border-radius:50%;background:#768ba9;animation:svchatPulse 1.25s ease-in-out infinite}.svchat-cursor span:nth-child(2){animation-delay:.14s}.svchat-cursor span:nth-child(3){animation-delay:.28s}@keyframes svchatPulse{0%,100%{opacity:.35;transform:translateY(0)}50%{opacity:1;transform:translateY(-2px)}}
.svchat-composer-zone{position:fixed;z-index:30;inset-inline:0;bottom:0;padding:9px 16px calc(8px + env(safe-area-inset-bottom));background:linear-gradient(180deg,rgba(5,11,22,0),rgba(5,11,22,.96) 18%,#050b16 44%)}.svchat-mode-row{max-width:760px;margin:0 auto 7px;display:flex;gap:7px;align-items:center}.svchat-active-chip,.svchat-mode-chip{height:38px;padding:0 10px;border-radius:12px;background:rgba(17,35,60,.94);display:flex;align-items:center;gap:7px;color:#9fb1c8}.svchat-active-chip span,.svchat-mode-chip span{font-size:11px;font-weight:620}.svchat-active-chip b{font-size:14px;font-weight:500;color:#7187a6}.svchat-mode-chip svg{width:14px;height:14px;transform:rotate(90deg)}
.svchat-composer{max-width:760px;margin:0 auto;padding:10px 10px 9px;border:1px solid rgba(92,143,229,.22);border-radius:23px 23px 23px 8px;background:linear-gradient(150deg,rgba(14,29,52,.99),rgba(8,20,38,.995));box-shadow:0 9px 25px rgba(0,0,0,.16),inset 0 1px 0 rgba(255,255,255,.024)}.svchat-composer:focus-within{border-color:rgba(83,151,244,.44);box-shadow:0 11px 28px rgba(0,0,0,.17),0 0 0 3px rgba(65,102,245,.045)}.svchat-composer textarea{display:block;width:100%;min-height:44px;max-height:132px;padding:3px 5px 7px;border:0;outline:0;resize:none;background:transparent;color:#edf4fc;font-size:16px;line-height:1.45}.svchat-composer textarea::placeholder{color:#7588a5}.svchat-composer-actions{display:flex;align-items:center;gap:3px}.svchat-context{height:48px;min-width:48px;padding:0 8px;border-radius:15px;background:transparent;display:flex;align-items:center;gap:6px;color:#9db0c8}.svchat-context svg{width:18px;height:18px}.svchat-context span{font-size:10.8px}.svchat-context b{width:20px;height:20px;border-radius:99px;background:rgba(65,102,245,.13);display:grid;place-items:center;color:#afbef7;font-size:9.5px}.svchat-grow{flex:1}.svchat-primary{width:48px;height:48px;border-radius:16px;background:linear-gradient(142deg,#35c2d1 0%,#4166f5 58%,#775fd7 100%);display:grid;place-items:center;color:white;box-shadow:0 6px 15px rgba(55,99,229,.16)}.svchat-primary svg{width:19px;height:19px}.svchat-safe-note{height:18px;max-width:760px;margin:4px auto 0;display:flex;align-items:center;justify-content:center;color:#536781;font-size:9.8px;text-align:center}

body.seven-day .seven-chat-v1{--chat-text:#172841;--chat-muted:#60738e;--chat-line:rgba(54,77,113,.10);background:radial-gradient(72% 30% at 102% -6%,rgba(65,102,245,.055),transparent 66%),linear-gradient(180deg,#fbfcfe 0%,#f5f8fc 55%,#eef3f8 100%);color:var(--chat-text)}body.seven-day .svchat-topbar{background:linear-gradient(180deg,rgba(251,252,254,.995),rgba(251,252,254,.94) 74%,rgba(251,252,254,0))}body.seven-day .svchat-user-bubble{background:linear-gradient(145deg,#eef3fa,#e9eff8);border-color:rgba(65,102,245,.10);color:#263b58;box-shadow:0 6px 18px rgba(37,58,89,.045)}body.seven-day .svchat-answer{color:#344a67}body.seven-day .svchat-answer h2{color:#182b45}body.seven-day .svchat-tool-trace{background:linear-gradient(90deg,rgba(238,243,250,.92),rgba(247,250,253,.3))}body.seven-day .svchat-tool-trace strong{color:#435873}body.seven-day .svchat-code{background:#0a1422;border-color:rgba(44,74,117,.10)}body.seven-day .svchat-source-rail button{background:rgba(234,240,248,.82);color:#536984}body.seven-day .svchat-composer-zone{background:linear-gradient(180deg,rgba(238,243,248,0),rgba(238,243,248,.96) 18%,#eef3f8 44%)}body.seven-day .svchat-mode-chip,body.seven-day .svchat-active-chip{background:rgba(255,255,255,.93);color:#50657f}body.seven-day .svchat-composer{background:linear-gradient(150deg,#fff,#f9fbfe);border-color:rgba(65,102,245,.14);box-shadow:0 8px 24px rgba(39,61,92,.06),inset 0 1px 0 #fff}body.seven-day .svchat-composer textarea{color:#1a2c46}body.seven-day .svchat-safe-note{color:#7b8da5}
body.seven-rtl .svchat-directional{transform:scaleX(-1)}body.seven-rtl .svchat-user-bubble{border-radius:19px 19px 19px 7px}body.seven-rtl .svchat-answer{padding-inline-start:43px}body.seven-rtl .svchat-code pre{direction:ltr;text-align:left}body.seven-rtl .svchat-cursor{margin-inline-start:43px;margin-inline-end:0}
body.seven-large .svchat-answer,body.seven-large .svchat-user-bubble{font-size:17px}body.seven-large .svchat-answer h2{font-size:19px}body.seven-large .svchat-tool-trace strong,body.seven-large .svchat-response-head strong{font-size:13px}body.seven-large .svchat-composer textarea{font-size:18px}
body.seven-lite .seven-chat-v1 *,body.seven-reduced .seven-chat-v1 *{box-shadow:none!important}body.seven-lite .svchat-cursor span,body.seven-reduced .svchat-cursor span{animation:none!important;opacity:.72}body.seven-lite .svchat-user-bubble,body.seven-lite .svchat-composer{background:var(--chat-panel)!important}
@media(prefers-reduced-motion:reduce){.seven-chat-v1 *{animation:none!important;transition-duration:0s!important;scroll-behavior:auto!important}}
@media(max-width:345px){.seven-chat-v1{padding-inline:12px;padding-bottom:calc(178px + env(safe-area-inset-bottom))}.svchat-topbar{margin-inline:-12px;padding-inline:12px;margin-bottom:13px;grid-template-columns:48px 1fr 48px}.svchat-runtime span:last-child,.svchat-runtime span:nth-last-child(2){display:none}.svchat-thread{max-width:100%}.svchat-user-bubble{max-width:88%;font-size:14.2px}.svchat-answer{padding-inline-start:39px;font-size:14.4px}.svchat-tool-trace{margin-inline-start:39px}.svchat-response-actions,.svchat-cursor{margin-inline-start:39px}.svchat-composer-zone{padding-inline:12px}.svchat-context span{display:none}.svchat-safe-note{font-size:9.2px}.svchat-source-rail{margin-inline-end:-12px;padding-inline-end:12px}}
`;

  function ensureStyle(editor){
    try{const css=String(editor.getCss?.()||'');if(!css.includes(STYLE_MARKER))editor.addStyle(CSS);}catch(_){}
  }

  function findChatPage(editor){
    try{return editor.Pages?.get?.(PAGE_ID)||editor.Pages?.getAll?.().find(p=>String(p.get?.('name')||'').toLowerCase()==='chat'&&String(p.getMainComponent?.()?.toHTML?.()||'').includes(`data-seven-chat-version="${VERSION}"`));}catch(_){return null;}
  }

  function ensurePage(editor){
    if(!editor?.Pages)return null;
    let page=findChatPage(editor);
    if(!page){
      try{page=editor.Pages.add({id:PAGE_ID,name:'Chat',component:CHAT_HTML});}catch(_){return null;}
    }
    ensureStyle(editor);
    return page;
  }

  function pageLabel(page){
    const name=String(page?.get?.('name')||page?.id||'Screen');
    try{
      const html=String(page?.getMainComponent?.()?.toHTML?.()||'');
      if(html.includes('data-seven-home-completion='))return 'Home';
      if(html.includes(`data-seven-chat-version="${VERSION}"`))return 'Chat';
    }catch(_){}
    return name;
  }

  function installSwitcher(editor){
    const subbar=document.querySelector('.subbar');
    const save=document.getElementById('saveState');
    if(!subbar||!save)return;
    let select=document.getElementById('sevenScreenQuick');
    if(!select){
      select=document.createElement('select');select.id='sevenScreenQuick';select.setAttribute('aria-label','Seven screen');select.dataset.sevenScreenSwitcher=VERSION;subbar.insertBefore(select,save);
      select.addEventListener('change',()=>{try{const page=editor.Pages.get(select.value);if(page)editor.Pages.select(page);}catch(_){}});
    }
    const refresh=()=>{
      try{
        const pages=editor.Pages.getAll();const active=editor.Pages.getSelected();
        const value=active?.id||'';
        select.innerHTML=pages.map(p=>`<option value="${String(p.id).replace(/"/g,'&quot;')}">${pageLabel(p)}</option>`).join('');
        if(value)select.value=value;
      }catch(_){}
    };
    refresh();
    for(const ev of ['page:select','page:add','page:remove','project:load','load'])editor.on(ev,()=>setTimeout(refresh,35));
    setTimeout(refresh,250);setTimeout(refresh,900);
  }

  function install(editor){
    if(!editor||editor.__sevenChatUiV1Installed)return;
    editor.__sevenChatUiV1Installed=true;
    const ensure=()=>{ensurePage(editor);installSwitcher(editor);};
    ensure();
    for(const ev of ['load','project:load','storage:end:load'])editor.on(ev,()=>setTimeout(ensure,70));
    setTimeout(ensure,240);setTimeout(ensure,850);setTimeout(ensure,1700);
    window.dispatchEvent(new CustomEvent('seven-chat-ui-v1-installed',{detail:{version:VERSION,pageId:PAGE_ID}}));
  }

  if(window.__sevenDesignEditor)install(window.__sevenDesignEditor);
  window.addEventListener('seven-design-editor-ready',e=>install(e.detail?.editor||window.__sevenDesignEditor));
})();
