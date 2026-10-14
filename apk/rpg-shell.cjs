'use strict';
// RPG owns a newly authored document shell. Never ship the legacy Seven AI UI.
const RPG_SHELL=`
<!-- SEVEN_RPG_NATIVE_SHELL_V1 -->
<div id="seven-app" class="rpg-application">
  <header class="rpg-header" role="banner">
    <div class="rpg-identity"><span class="rpg-crest" aria-hidden="true">✦</span><img class="app-icon" src="./brand/seven-night-black.svg" alt="Seven RPG"><div><strong>SEVEN RPG</strong><small>THE STORY IS YOURS</small></div></div>
    <span id="roomTitle" class="rpg-chapter-title" aria-live="polite">New adventure</span>
    <div class="rpg-header-actions">
      <button type="button" class="rpg-header-button" id="rpg-library-toggle" aria-expanded="false" aria-controls="sidebar" title="Adventures / العوالم">☰ <span>Worlds</span></button>
      <button type="button" class="rpg-header-button" id="rpg-settings-toggle" onclick="openSettings()" title="AI model / النموذج">⚙ <span>AI</span></button>
    </div>
  </header>
  <div id="sidebarBackdrop" class="rpg-library-backdrop" hidden></div>
  <aside id="sidebar" class="rpg-library" aria-label="Saved RPG adventures" hidden>
    <div class="rpg-library-head"><div><small>YOUR CHRONICLES</small><h2>Adventures · العوالم</h2></div><button id="rpg-library-close" type="button" aria-label="Close adventures">✕</button></div>
    <button id="rpg-new-adventure" class="rpg-new-adventure" type="button">✦ New adventure · مغامرة جديدة</button>
    <div class="rpg-library-tools">
      <label for="rpg-library-search">Find a world · ابحث عن عالم</label>
      <input id="rpg-library-search" type="search" autocomplete="off" enterkeyhint="search" placeholder="Search adventures…" aria-label="Search saved RPG adventures">
      <p id="rpg-library-count" role="status" aria-live="polite">Your saved stories</p>
    </div>
    <div id="roomList" class="rpg-room-list" aria-label="Saved RPG sessions"></div>
    <p id="rpg-library-empty" class="rpg-library-empty" role="status" hidden>No adventures yet.</p>
  </aside>
  <main class="main rpg-main" id="seven-rpg-main">
    <div class="rpg-scene-heading"><span class="rpg-scene-glyph" aria-hidden="true">✧</span><span>YOUR WORLD · عالمك</span><span class="rpg-scene-rule" aria-hidden="true"></span><span class="rpg-scene-safety">You control your character</span></div>
    <div id="chat" class="rpg-transcript" role="log" aria-label="RPG story and dialogue" aria-live="polite" aria-relevant="additions"></div>
    <section class="seven-workspace-root rpg-engine-host" hidden aria-label="RPG state engine"></section>
    <div class="input-area rpg-input-area">
      <div class="composer rpg-composer">
        <label for="userInput" class="rpg-composer-label">YOUR NEXT ACTION <span>دورك الآن</span></label>
        <textarea id="userInput" rows="2" dir="auto" placeholder="What do you say or do? · ماذا تفعل؟" aria-label="Your RPG action"></textarea>
        <div class="composer-row">
          <div class="composer-tools"><span class="rpg-player-agency">✦ Your actions are never written by the narrator.</span></div>
          <div class="composer-send">
            <button type="button" class="stop" id="stopBtn" onclick="stopGeneration()" aria-label="Stop narration">■</button>
            <button type="button" class="send" id="sendBtn" onclick="sendMessage()" aria-label="Send RPG action"><span aria-hidden="true">➤</span></button>
          </div>
        </div>
      </div>
    </div>
  </main>
</div>
<div class="modal rpg-settings" id="settingsModal" role="dialog" aria-modal="true" aria-labelledby="rpg-settings-title" onclick="if(event.target === this) closeSettings();">
  <div class="modal-content rpg-settings-panel">
    <div class="rpg-settings-heading"><div><small>STORY ENGINE</small><h2 id="rpg-settings-title">RPG AI · إعدادات الذكاء</h2></div><button type="button" class="rpg-settings-close" onclick="closeSettings()" aria-label="Close settings">✕</button></div>
    <div class="settings-core rpg-settings-fields">
      <p class="rpg-settings-intro">A narrator needs a working free provider. Anonymous providers may reach their daily quota; connect your own provider key to continue reliably.</p>
      <nav class="rpg-settings-tabs" aria-label="AI settings sections">
        <button type="button" class="rpg-settings-tab" id="rpg-tab-narrator" aria-controls="rpg-narrator-panel" aria-selected="true">✦ Narrator · الراوي</button>
        <button type="button" class="rpg-settings-tab" id="rpg-tab-connections" aria-controls="rpg-connections-panel" aria-selected="false">◈ Connect · الاتصال</button>
      </nav>
      <section id="rpg-narrator-panel" class="rpg-settings-section" aria-label="Narrator and model selection">
      <label for="routingModeSelect">Model routing · توجيه النموذج</label>
      <select id="routingModeSelect" onchange="onRoutingModeChange()"><option value="auto">Automatic free route</option><option value="manual">Choose a model</option></select>
      <p class="rpg-settings-hint rpg-mode-help" id="rpg-mode-help">Automatic selects a free route for the story.</p>
      <div class="rpg-model-tools">
        <label class="rpg-filter-field" for="rpg-model-search"><span>Find a model · بحث</span><input id="rpg-model-search" type="search" placeholder="Search name or provider…" autocomplete="off" aria-label="Search AI narrators"></label>
        <label class="rpg-filter-field" for="rpg-provider-filter"><span>Provider · المزوّد</span><select id="rpg-provider-filter" aria-label="Filter narrator models by provider"><option value="all">All providers</option></select></label>
      </div>
      <label for="modelSelect">Narrator model · نموذج الراوي</label>
      <select id="modelSelect" onchange="onModelChange()"></select>
      <div class="rpg-model-toolbar"><span id="rpg-model-count" aria-live="polite">Loading models…</span><button type="button" id="rpg-refresh-models">⟳ Refresh models</button></div>
      <p id="rpg-model-empty" class="rpg-model-empty" role="status" hidden>No matching narrator models. Clear the search or change provider.</p>
      <p id="rpg-model-refresh-state" class="rpg-settings-hint" role="status" aria-live="polite">Listed routes can fail at runtime. Refresh to update availability.</p>
      <div class="route-status-card" id="routeStatusCard" data-state="ready" role="status" aria-live="polite"><div class="rpg-route-row"><span>Connection</span><span id="routeStateBadge">Ready</span></div><div id="freeModelStatus">Finding available models…</div></div>
      <details class="rpg-story-tuning"><summary>Story tuning · إعدادات السرد <span>Creativity, reasoning, context</span></summary><div class="rpg-tuning-fields">
      <label for="temperatureRange">Creativity · الإبداع</label>
      <div class="rpg-range"><input type="range" id="temperatureRange" min="0" max="2" step="0.1" value="1" oninput="document.getElementById('tempValue').textContent=this.value"><output id="tempValue">1</output></div>
      <label for="reasoningEffort">Reasoning effort · مستوى التفكير</label>
      <select id="reasoningEffort"></select><p id="reasoningEffortNote" class="rpg-settings-hint"></p>
      <label id="maxTokensLabel" for="maxTokens">Max tokens</label><input type="number" id="maxTokens" value="65536" min="100" max="65536"><p id="maxTokensNote" class="rpg-settings-hint"></p>
      <label class="rpg-checkbox-row"><input type="checkbox" id="freeFallbackToggle"> Free-only fallback</label>
      </div></details>
      </section>
      <section id="rpg-connections-panel" class="rpg-settings-section" aria-label="Private provider connections" hidden>
        <div class="rpg-provider-intro">
          <strong>Connect a reliable narrator · ربط نموذج الراوي</strong>
          <p>GitHub Actions secrets test the models in CI but are deliberately <em>not</em> embedded in your APK. Add a provider's personal API key here to use it inside Seven RPG.</p>
          <p class="rpg-provider-security">On Android the key is encrypted by Android Keystore. It will not appear in conversation exports, logs or GitHub.</p>
        </div>
        <label for="rpg-key-provider">Provider · المزوّد</label>
        <select id="rpg-key-provider"><option value="groq">Groq (GPT-OSS)</option><option value="openrouter">OpenRouter</option><option value="nvidia">NVIDIA NIM</option><option value="mistral">Mistral</option><option value="gemini">Google Gemini</option></select>
        <label for="rpg-key-input">API key · مفتاح الاتصال</label>
        <div class="rpg-private-key-row"><input id="rpg-key-input" type="password" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Paste your provider key" aria-label="Private API key"><button id="rpg-key-toggle" type="button" aria-label="Show or hide key">◉</button></div>
        <div class="rpg-provider-actions"><button id="rpg-key-save" class="rpg-primary" type="button">Save on device</button><button id="rpg-key-remove" type="button">Remove</button></div>
        <p id="rpg-provider-key-status" role="status" aria-live="polite">Checking Android secure storage…</p>
        <div class="rpg-provider-note">No key? Try Automatic mode, but anonymous services can rate-limit without warning. A key does not guarantee an unlimited free quota.</div>
      </section>
    </div>
    <div class="rpg-settings-footer"><button type="button" onclick="closeSettings()">Cancel</button><button type="button" class="rpg-primary" onclick="saveSettings()">Save settings · حفظ</button></div>
  </div>
</div>
<!-- Legacy runtime contracts, not screens: required by shared LLM/room logic. -->
<div id="rpg-compat-runtime" hidden aria-hidden="true">
  <button id="deepThinkToggle" type="button"></button>
  <button id="searchToggle" type="button"></button>
  <button id="researchToggle" type="button"></button>
  <input type="file" id="fileInput" accept=".txt,.pdf" multiple onchange="handleKnowledgeFiles()">
  <div id="knowledgeStatus"></div><div id="knowledgeFileList"></div>
  <textarea id="pinnedNotes"></textarea><div id="searchGatewayStatus"></div>
</div>
`;

function removeLegacyUi(html) {
  if(typeof html!=='string'||!html.includes('SEVEN_FINAL_RELEASE_LAYER_V1'))throw Error('Refusing unverified RPG HTML');
  if(html.includes('SEVEN_RPG_NATIVE_SHELL_V1'))throw Error('RPG shell already installed');
  const body=html.indexOf('<body>');
  const start=html.indexOf('<!-- Sidebar -->',body);
  const end=html.indexOf('<script>',start);
  if(body<0||start<body||end<0)throw Error('Seven AI shell anchors missing');
  const original=html.slice(start,end);
  for(const marker of ['id="sidebar"','id="roomList"','id="chat"','id="settingsModal"','id="modelSelect"'])
    if(!original.includes(marker))throw Error('Unexpected Seven AI UI layout: '+marker);
  html=html.slice(0,start)+RPG_SHELL+'\n'+html.slice(end);
  const headEnd=html.indexOf('</head>');
  if(headEnd<0)throw Error('RPG HTML head not found');
  // Delete every legacy UI stylesheet from the generated package.
  let head=html.slice(0,headEnd);
  head=head.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'');
  head=head.replace(/<link\b[^>]*href=["'][^"']*(?:remake|seven-shell|generated-ui)\.css[^"']*["'][^>]*>/gi,'');
  html=head+html.slice(headEnd);
  // Disable unused Seven AI visual bootstraps. Keep shared provider and storage.
  for(const id of ['seven-ui-runtime','seven-beta-ui-runtime','seven-ui-polish-loader','seven-brand-runtime','seven-remake-runtime','seven-motion-runtime']){
    const open='<script id="'+id+'"';
    const first=html.indexOf(open);
    if(first<0)continue;
    const close=html.indexOf('</script>',first);
    if(close<0)throw Error('Malformed legacy UI bootstrap '+id);
    html=html.slice(0,first)+html.slice(close+9);
  }
  return html;
}
module.exports={removeLegacyUi,RPG_SHELL};
