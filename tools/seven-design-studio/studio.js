(() => {
  'use strict';

  const STORAGE_KEY = 'seven-design-studio-project-v1';
  const SETTINGS_KEY = 'seven-design-studio-settings-v1';
  const LIBRARY_KEY = 'seven-design-studio-library-v1';

  const TOKENS = {
    navy: '#0A1022', off: '#F4F6FB', blue: '#4166F5', cyan: '#32BECF', violet: '#8265DC',
    surface: '#111B2F', surface2: '#16233A', text: '#F4F6FB', muted: '#93A4BF',
    green: '#19CFA1', amber: '#FFB84D', red: '#FF5576', pink: '#EC5BC8'
  };

  const AURORA = {
    idle: ['#3B82F6','#7C5CFC','Ready / calm presence'],
    listening: ['#18C7E8','#3B82F6','Receiving / attention'],
    thinking: ['#665CFF','#A855F7','Internal reasoning'],
    researching: ['#00B8D9','#5067FF','Evidence acquisition'],
    coding: ['#00D6C9','#258BFF','Technical construction'],
    world: ['#6D5CFF','#35D5E8','World / RPG activity'],
    generating: ['#8B5CF6','#EC5BC8','Creation / synthesis'],
    success: ['#19CFA1','#20BFE7','Completed successfully'],
    warning: ['#FFB84D','#EF7C62','Attention required'],
    error: ['#FF5576','#D94A8C','Failure / error']
  };

  const canvasCSS = `
:root{--s-bg:#0A1022;--s-surface:#111B2F;--s-surface2:#16233A;--s-text:#F4F6FB;--s-muted:#93A4BF;--s-line:#263653;--s-blue:#4166F5;--s-cyan:#32BECF;--s-violet:#8265DC;--s-radius:18px;--s-space:16px}
*{box-sizing:border-box}html,body{margin:0;min-height:100%;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:var(--s-bg);color:var(--s-text)}body{min-height:100vh;overflow-x:hidden}button,input,textarea,select{font:inherit}button{color:inherit}.seven-screen{min-height:100vh;padding:18px 16px 88px;background:radial-gradient(circle at 78% -8%,rgba(65,102,245,.16),transparent 30%),var(--s-bg);color:var(--s-text)}.seven-header{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:34px}.seven-brand{display:flex;align-items:center;gap:9px;font-size:13px;font-weight:800;letter-spacing:.08em}.seven-mark{width:34px;height:34px;display:grid;place-items:center;border-radius:11px;background:linear-gradient(135deg,var(--s-cyan),var(--s-blue) 52%,var(--s-violet));color:#fff;font-weight:900;box-shadow:0 0 24px rgba(65,102,245,.25)}.seven-icon-btn{min-width:44px;height:44px;border:1px solid var(--s-line);border-radius:13px;background:var(--s-surface);display:grid;place-items:center}.seven-intent{font-size:24px;line-height:1.18;font-weight:750;letter-spacing:-.025em;margin:0 0 16px}.seven-composer{padding:13px;border:1px solid #2c3d5d;border-radius:22px;background:rgba(17,27,47,.96);box-shadow:0 18px 50px rgba(0,0,0,.22)}.seven-composer:focus-within{border-color:var(--s-blue);box-shadow:0 0 0 3px rgba(65,102,245,.12),0 18px 50px rgba(0,0,0,.22)}.seven-composer textarea{display:block;width:100%;min-height:98px;border:0;outline:0;resize:vertical;background:transparent;color:var(--s-text);font-size:16px;line-height:1.5}.seven-composer textarea::placeholder{color:#8293af}.seven-actions{display:flex;align-items:center;gap:8px}.seven-grow{flex:1}.seven-send{width:44px;height:44px;border:0;border-radius:14px;background:linear-gradient(135deg,var(--s-blue),var(--s-violet));color:#fff;font-weight:800}.seven-section{margin-top:28px}.seven-eyebrow{font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:var(--s-muted);margin-bottom:9px}.seven-card{padding:15px;border:1px solid var(--s-line);border-radius:17px;background:var(--s-surface);color:var(--s-text)}.seven-row{display:flex;align-items:center;gap:10px}.seven-between{justify-content:space-between}.seven-stack{display:flex;flex-direction:column;gap:12px}.seven-chip{display:inline-flex;align-items:center;min-height:36px;padding:0 11px;border:1px solid var(--s-line);border-radius:999px;background:var(--s-surface);color:var(--s-text);font-size:12px}.seven-muted{color:var(--s-muted);font-size:12px}.seven-title{font-size:18px;line-height:1.25;font-weight:750}.seven-body{font-size:14px;line-height:1.55}.seven-divider{height:1px;background:var(--s-line);margin:12px 0}.seven-nav{position:relative;display:grid;grid-template-columns:repeat(5,1fr);gap:5px;padding:8px;border:1px solid var(--s-line);border-radius:20px;background:var(--s-surface)}.seven-nav button{min-height:48px;border:0;border-radius:13px;background:transparent;color:var(--s-muted)}.seven-nav button.active{background:rgba(65,102,245,.13);color:var(--s-text)}.seven-orb{background:linear-gradient(135deg,var(--s-cyan),var(--s-blue),var(--s-violet))!important;color:#fff!important;font-weight:900}.seven-sheet{padding:18px;border:1px solid var(--s-line);border-radius:24px 24px 0 0;background:var(--s-surface);min-height:220px}.seven-task{position:relative;overflow:hidden}.seven-task:before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:linear-gradient(var(--aurora-a,#3B82F6),var(--aurora-b,#7C5CFC))}.state-node{width:9px;height:9px;border-radius:50%;background:var(--aurora-a,#3B82F6);box-shadow:0 0 14px var(--aurora-a,#3B82F6)}
[data-seven-state="idle"]{--aurora-a:#3B82F6;--aurora-b:#7C5CFC}[data-seven-state="listening"]{--aurora-a:#18C7E8;--aurora-b:#3B82F6}[data-seven-state="thinking"]{--aurora-a:#665CFF;--aurora-b:#A855F7}[data-seven-state="researching"]{--aurora-a:#00B8D9;--aurora-b:#5067FF}[data-seven-state="coding"]{--aurora-a:#00D6C9;--aurora-b:#258BFF}[data-seven-state="world"]{--aurora-a:#6D5CFF;--aurora-b:#35D5E8}[data-seven-state="generating"]{--aurora-a:#8B5CF6;--aurora-b:#EC5BC8}[data-seven-state="success"]{--aurora-a:#19CFA1;--aurora-b:#20BFE7}[data-seven-state="warning"]{--aurora-a:#FFB84D;--aurora-b:#EF7C62}[data-seven-state="error"]{--aurora-a:#FF5576;--aurora-b:#D94A8C}
[data-seven-state] .seven-state-accent{border-color:color-mix(in srgb,var(--aurora-a) 45%,var(--s-line));box-shadow:0 0 0 1px color-mix(in srgb,var(--aurora-a) 15%,transparent)}
body.seven-day{--s-bg:#F4F6FB;--s-surface:#FFFFFF;--s-surface2:#EBF0F7;--s-text:#0A1022;--s-muted:#61708A;--s-line:#DCE3EE}.seven-day .seven-screen{background:radial-gradient(circle at 78% -8%,rgba(65,102,245,.08),transparent 30%),var(--s-bg)}.seven-day .seven-composer{background:#fff;box-shadow:0 14px 42px rgba(26,47,83,.08)}
body.seven-rtl{direction:rtl}.seven-rtl .seven-brand{letter-spacing:0}.seven-rtl .seven-task:before{left:auto;right:0}.seven-rtl [data-directional="true"]{transform:scaleX(-1)}
body.seven-large{font-size:125%}.seven-large .seven-intent{font-size:28px}.seven-large .seven-muted{font-size:14px}.seven-large .seven-body{font-size:16px}
body.seven-lite *{box-shadow:none!important;backdrop-filter:none!important}.seven-lite .seven-screen{background:var(--s-bg)}
body.seven-reduced *{animation:none!important;transition:none!important;scroll-behavior:auto!important}
@media(max-width:340px){.seven-screen{padding-left:12px;padding-right:12px}.seven-intent{font-size:21px}.seven-header{margin-bottom:28px}.seven-composer textarea{min-height:84px}}
`;

  const templates = {
    home: `<main class="seven-screen" data-seven-screen="home"><header class="seven-header"><div class="seven-brand"><span class="seven-mark">7</span><span>SEVEN</span></div><button class="seven-icon-btn" aria-label="Profile">●</button></header><h1 class="seven-intent">What do you want to do?</h1><section class="seven-composer seven-state-accent" data-seven-state="idle" data-seven-component="composer"><textarea aria-label="Prompt" placeholder="Ask, build, research, imagine..."></textarea><div class="seven-actions"><button class="seven-icon-btn" aria-label="Add">＋</button><span class="seven-grow"></span><button class="seven-icon-btn" aria-label="Voice">◉</button><button class="seven-send" aria-label="Send">↑</button></div></section><section class="seven-section"><div class="seven-eyebrow">Continue</div><article class="seven-card seven-row seven-between"><div><strong>Seven Home</strong><div class="seven-muted">Design workspace</div></div><span data-directional="true">›</span></article></section></main>`,
    chat: `<main class="seven-screen" data-seven-screen="chat"><header class="seven-header"><div class="seven-brand"><span class="seven-mark">7</span><span>CHAT</span></div><button class="seven-icon-btn">•••</button></header><section class="seven-stack"><article class="seven-card seven-body">A clean conversation surface belongs here.</article><article class="seven-card seven-body" style="margin-left:28px;background:linear-gradient(135deg,rgba(65,102,245,.16),rgba(130,101,220,.12))">Design the conversation around clarity, context and actions.</article></section><section class="seven-composer" style="margin-top:24px"><textarea placeholder="Message Seven..."></textarea><div class="seven-actions"><button class="seven-icon-btn">＋</button><span class="seven-grow"></span><button class="seven-icon-btn">◉</button><button class="seven-send">↑</button></div></section></main>`,
    research: `<main class="seven-screen" data-seven-screen="research"><header class="seven-header"><div class="seven-brand"><span class="seven-mark">7</span><span>RESEARCH</span></div><span class="seven-chip">Evidence</span></header><h1 class="seven-title">Research workspace</h1><p class="seven-muted">Sources, evidence and synthesis remain explicit.</p><section class="seven-card seven-task seven-state-accent" data-seven-state="researching"><div class="seven-row"><span class="state-node"></span><div><strong>Searching sources</strong><div class="seven-muted">Researching</div></div></div></section><section class="seven-section seven-stack"><article class="seven-card"><strong>Evidence rail</strong><p class="seven-body seven-muted">Source cards and citations can be composed here.</p></article><article class="seven-card"><strong>Synthesis</strong><p class="seven-body seven-muted">Keep claims separate from evidence quality.</p></article></section></main>`,
    coding: `<main class="seven-screen" data-seven-screen="coding"><header class="seven-header"><div class="seven-brand"><span class="seven-mark">7</span><span>CODE</span></div><span class="seven-chip">Project</span></header><section class="seven-card seven-task seven-state-accent" data-seven-state="coding"><div class="seven-row"><span class="state-node"></span><div><strong>Working tree</strong><div class="seven-muted">Coding</div></div></div></section><section class="seven-section seven-card"><div class="seven-eyebrow">Editor</div><pre style="overflow:auto;margin:0;color:#a9d4ff;font-size:12px">function seven() {\n  return 'build';\n}</pre></section><section class="seven-section seven-card"><div class="seven-eyebrow">Terminal</div><div class="seven-body">$ tests ready</div></section></main>`,
    world: `<main class="seven-screen" data-seven-screen="world"><header class="seven-header"><div class="seven-brand"><span class="seven-mark">7</span><span>WORLD</span></div><span class="seven-chip">Canon</span></header><section class="seven-card seven-task seven-state-accent" data-seven-state="world"><div class="seven-row"><span class="state-node"></span><div><strong>Living world</strong><div class="seven-muted">World state active</div></div></div></section><section class="seven-section"><h1 class="seven-title">Scene title</h1><p class="seven-body">A scene surface can inherit world state without turning every element into decoration.</p></section><section class="seven-stack"><article class="seven-card">Character state</article><article class="seven-card">Timeline / consequences</article></section></main>`,
    blank: `<main class="seven-screen" data-seven-screen="blank"><div class="seven-muted">Blank Seven screen</div></main>`
  };

  const blockGroups = [
    ['Layout', [
      ['Frame','Container / screen section','▣',`<section class="seven-card" style="min-height:120px"><div class="seven-muted">Frame</div></section>`],
      ['Stack','Vertical auto layout','↕',`<div class="seven-stack"><div class="seven-card">Item A</div><div class="seven-card">Item B</div></div>`],
      ['Row','Horizontal layout','↔',`<div class="seven-row"><span class="seven-chip">One</span><span class="seven-chip">Two</span></div>`],
      ['Divider','Semantic divider','—',`<div class="seven-divider"></div>`]
    ]],
    ['Basics', [
      ['Text','Editable text','T',`<p class="seven-body">Text</p>`],
      ['Title','Heading','H',`<h2 class="seven-title">Title</h2>`],
      ['Button','Touch target','◫',`<button class="seven-icon-btn" style="width:auto;padding:0 14px">Button</button>`],
      ['Chip','Compact state/control','●',`<span class="seven-chip">Chip</span>`]
    ]],
    ['Seven', [
      ['Composer','Universal Composer','⌁',templates.home.match(/<section class="seven-composer[\s\S]*?<\/section>/)?.[0] || `<section class="seven-composer"><textarea placeholder="Ask Seven..."></textarea></section>`],
      ['Task','Active task surface','◉',`<article class="seven-card seven-task seven-state-accent" data-seven-state="thinking"><div class="seven-row"><span class="state-node"></span><div><strong>Task</strong><div class="seven-muted">Thinking</div></div></div></article>`],
      ['Continue','Resume card','›',`<article class="seven-card seven-row seven-between"><div><strong>Continue</strong><div class="seven-muted">Resume work</div></div><span data-directional="true">›</span></article>`],
      ['Navigation','Bottom navigation','⌂',`<nav class="seven-nav"><button class="active">Home</button><button>Spaces</button><button class="seven-orb">7</button><button>Library</button><button>You</button></nav>`],
      ['Sheet','Bottom sheet surface','⌑',`<section class="seven-sheet"><div class="seven-eyebrow">Sheet</div><h2 class="seven-title">Panel</h2></section>`],
      ['Evidence','Evidence rail card','≋',`<article class="seven-card" style="border-left:3px solid #32BECF"><div class="seven-eyebrow">Evidence</div><strong>Source</strong><p class="seven-muted">Provenance / source detail</p></article>`]
    ]]
  ];

  const settings = Object.assign({theme:'night',dir:'ltr',density:'balanced',largeText:false,reduced:false,device:'393',docName:'Untitled'}, safeJSON(localStorage.getItem(SETTINGS_KEY), {}));
  let currentPanel = 'add';
  let saveTimer = null;
  let booted = false;

  const editor = grapesjs.init({
    container: '#gjs', height: '100%', width: 'auto', fromElement: false,
    panels: { defaults: [] }, storageManager: false,
    selectorManager: { componentFirst: true },
    deviceManager: { devices: [320,360,393,412,480].map(w => ({id:`p${w}`,name:`${w}`,width:`${w}px`})) }
  });

  editor.on('load', () => {
    const saved = safeJSON(localStorage.getItem(STORAGE_KEY), null);
    if (saved) {
      try { editor.loadProjectData(saved); } catch (_) { loadTemplate('home', false); }
    } else {
      loadTemplate('home', false);
    }
    ensureCanvasCSS();
    applySettings();
    booted = true;
    setSaveState('Saved');
  });

  editor.on('update', () => { if (booted) scheduleSave(); });
  editor.on('component:selected component:add component:remove component:update', () => {
    if (isSheetOpen() && ['layers','design','states'].includes(currentPanel)) renderPanel(currentPanel);
  });

  editor.on('undo redo', () => setSaveState('Unsaved'));

  bindShell();

  function safeJSON(value, fallback) { try { return value ? JSON.parse(value) : fallback; } catch (_) { return fallback; } }
  function esc(value='') { return String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
  function ensureCanvasCSS() { if (!editor.getCss().includes('--s-bg')) editor.setStyle(canvasCSS); }
  function selected() { return editor.getSelected(); }
  function isSheetOpen() { return document.getElementById('sheet').classList.contains('open'); }
  function setSaveState(text) { document.getElementById('saveState').textContent = text; }
  function scheduleSave() { setSaveState('Unsaved'); clearTimeout(saveTimer); saveTimer = setTimeout(saveProject, 550); }
  function saveProject(show=false) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(editor.getProjectData()));
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      setSaveState('Saved');
      if (show) toast('Project saved on this device');
    } catch (_) { setSaveState('Save failed'); toast('Could not save locally'); }
  }
  function toast(message) {
    const el = document.getElementById('toast'); el.textContent = message; el.classList.add('show');
    clearTimeout(el._timer); el._timer = setTimeout(() => el.classList.remove('show'), 1700);
  }

  function bindShell() {
    document.querySelectorAll('[data-panel]').forEach(btn => btn.addEventListener('click', () => openPanel(btn.dataset.panel)));
    document.getElementById('closeSheet').addEventListener('click', closeSheet);
    document.getElementById('backdrop').addEventListener('click', closeSheet);
    document.getElementById('undoBtn').addEventListener('click', () => editor.UndoManager.undo());
    document.getElementById('redoBtn').addEventListener('click', () => editor.UndoManager.redo());
    document.getElementById('previewBtn').addEventListener('click', openPreview);
    document.getElementById('exitPreview').addEventListener('click', closePreview);
    document.getElementById('deviceSelect').addEventListener('change', e => { settings.device=e.target.value; applySettings(); saveProject(); });
    document.getElementById('themeBtn').addEventListener('click', () => { settings.theme = settings.theme === 'night' ? 'day' : 'night'; applySettings(); saveProject(); });
    document.getElementById('dirBtn').addEventListener('click', () => { settings.dir = settings.dir === 'ltr' ? 'rtl' : 'ltr'; applySettings(); saveProject(); });
    document.getElementById('densityBtn').addEventListener('click', cycleDensity);
    document.getElementById('brandBtn').addEventListener('click', () => openPanel('more'));
  }

  function cycleDensity() {
    const order=['full','balanced','lite']; const i=order.indexOf(settings.density); settings.density=order[(i+1)%order.length]; applySettings(); saveProject();
  }

  function applySettings() {
    document.getElementById('deviceSelect').value = settings.device;
    document.getElementById('phoneStage').dataset.width = settings.device;
    document.getElementById('themeBtn').textContent = settings.theme === 'day' ? 'Day' : 'Night';
    document.getElementById('themeBtn').classList.toggle('active', settings.theme === 'day');
    document.getElementById('dirBtn').textContent = settings.dir.toUpperCase();
    document.getElementById('dirBtn').classList.toggle('active', settings.dir === 'rtl');
    document.getElementById('densityBtn').textContent = cap(settings.density);
    document.getElementById('densityBtn').classList.toggle('active', settings.density === 'lite');
    document.getElementById('docName').textContent = settings.docName || 'Untitled';
    const body = editor.Canvas.getBody();
    if (body) {
      body.classList.toggle('seven-day', settings.theme === 'day');
      body.classList.toggle('seven-rtl', settings.dir === 'rtl');
      body.classList.toggle('seven-large', !!settings.largeText);
      body.classList.toggle('seven-lite', settings.density === 'lite');
      body.classList.toggle('seven-reduced', !!settings.reduced);
      body.setAttribute('dir', settings.dir);
    }
  }

  function openPanel(name) {
    currentPanel = name;
    document.querySelectorAll('.dock-button').forEach(b => b.classList.toggle('active', b.dataset.panel === name));
    renderPanel(name);
    const sheet=document.getElementById('sheet'), backdrop=document.getElementById('backdrop');
    sheet.classList.add('open'); sheet.setAttribute('aria-hidden','false'); backdrop.hidden=false;
    setTimeout(() => document.getElementById('closeSheet').focus(), 20);
  }
  function closeSheet() {
    const sheet=document.getElementById('sheet'); sheet.classList.remove('open'); sheet.setAttribute('aria-hidden','true'); document.getElementById('backdrop').hidden=true;
    const trigger=document.querySelector(`.dock-button[data-panel="${currentPanel}"]`); if(trigger) trigger.focus();
  }
  function renderPanel(name) {
    const titles={add:['Add','Components and reusable building blocks'],layers:['Layers','Structure of the current screen'],design:['Design','Properties of the selected element'],states:['States','Variants, Aurora and prototype behavior'],more:['Studio','Project, screens, judge and export']};
    document.getElementById('sheetTitle').textContent=titles[name][0]; document.getElementById('sheetSubtitle').textContent=titles[name][1];
    ({add:renderAdd,layers:renderLayers,design:renderDesign,states:renderStates,more:renderMore}[name] || renderAdd)();
  }

  function renderAdd() {
    const lib=safeJSON(localStorage.getItem(LIBRARY_KEY), []);
    let html=blockGroups.map(([group,blocks])=>`<section class="section"><div class="section-title"><h3>${group}</h3></div><div class="block-grid">${blocks.map((b,i)=>`<button class="block" data-add-group="${esc(group)}" data-add-index="${i}"><span class="mini-icon">${b[2]}</span><strong>${b[0]}</strong><small>${b[1]}</small></button>`).join('')}</div></section>`).join('');
    html += `<section class="section"><div class="section-title"><h3>My components</h3><span>${lib.length}</span></div>${lib.length?`<div class="block-grid">${lib.map((b,i)=>`<button class="block" data-library-index="${i}"><span class="mini-icon">◇</span><strong>${esc(b.name)}</strong><small>Reusable local component</small></button>`).join('')}</div>`:`<div class="hint">Select an element, then use Design → Save as component to build your own reusable Seven library.</div>`}</section>`;
    body(html);
    document.querySelectorAll('[data-add-group]').forEach(btn=>btn.onclick=()=>{
      const group=blockGroups.find(g=>g[0]===btn.dataset.addGroup); const block=group?.[1]?.[Number(btn.dataset.addIndex)]; if(block) addComponent(block[3]);
    });
    document.querySelectorAll('[data-library-index]').forEach(btn=>btn.onclick=()=>{const item=lib[Number(btn.dataset.libraryIndex)]; if(item) addComponent(item.html);});
  }

  function addComponent(html) {
    const parent=selected(); let added;
    try {
      if(parent && parent.get('type')!=='text' && parent.components) added=parent.append(html);
      else added=editor.addComponents(html);
      const target=Array.isArray(added)?added[added.length-1]:added; if(target) editor.select(target);
      toast('Component added'); closeSheet();
    } catch (_) { toast('Could not add here'); }
  }

  function renderLayers() {
    const root=editor.getWrapper(); const selectedId=selected()?.cid; let rows='';
    const walk=(collection,depth=0)=>collection.forEach(c=>{const label=(c.getAttributes()?.['data-seven-component'] || c.get('tagName') || c.get('type') || 'component');rows+=`<button class="layer ${c.cid===selectedId?'sel':''}" data-cid="${c.cid}"><span class="layer-depth" style="--d:${depth}"></span><span class="layer-type">${depth?'└':'▣'}</span><span class="layer-name">${esc(label)}</span><span class="layer-badge">${c.components().length||''}</span></button>`;if(c.components().length)walk(c.components(),depth+1)});
    walk(root.components());
    body(`<section class="section"><div class="action-row"><button class="action" id="selectParent">Parent</button><button class="action" id="duplicateSelected">Duplicate</button><button class="action danger" id="deleteSelected">Delete</button></div></section><div class="layer-tree">${rows||'<div class="empty">No layers</div>'}</div>`);
    document.querySelectorAll('[data-cid]').forEach(btn=>btn.onclick=()=>{const found=findByCid(root,btn.dataset.cid);if(found){editor.select(found);renderLayers();}});
    document.getElementById('selectParent').onclick=()=>{const p=selected()?.parent();if(p&&p!==root){editor.select(p);renderLayers();}};
    document.getElementById('deleteSelected').onclick=()=>{const s=selected();if(s&&s!==root){s.remove();toast('Deleted');renderLayers();}};
    document.getElementById('duplicateSelected').onclick=()=>duplicateSelected();
  }

  function findByCid(component,cid){if(component.cid===cid)return component;for(const child of component.components().models){const f=findByCid(child,cid);if(f)return f;}return null;}
  function duplicateSelected(){const s=selected();if(!s)return;try{const clone=s.clone();s.parent().append(clone);editor.select(clone);toast('Duplicated');}catch(_){toast('Duplicate unavailable for this element');}}

  function renderDesign() {
    const s=selected(); if(!s){body('<div class="empty">Select an element on the canvas to edit its design.</div>');return;}
    const st=s.getStyle()||{}, attrs=s.getAttributes()||{};
    body(`
      <section class="section"><div class="section-title"><h3>Selected</h3><span>${esc(s.get('tagName')||s.get('type')||'component')}</span></div><div class="rows">
        ${textField('Name','designName',attrs['data-seven-name']||attrs['data-seven-component']||'')}
        ${selectField('Display','designDisplay',['block','flex','grid','inline-flex','none'],st.display||'')}
        ${selectField('Direction','designDirection',['row','column','row-reverse','column-reverse'],st['flex-direction']||'')}
        ${numberField('Gap','designGap',pxNum(st.gap),0,80)}
        ${numberField('Padding','designPadding',pxNum(st.padding),0,120)}
        ${numberField('Radius','designRadius',pxNum(st['border-radius']),0,80)}
        ${numberField('Font size','designFont',pxNum(st['font-size']),8,72)}
        ${colorField('Background','designBg',colorOr(st.background||st['background-color'],'#111B2F'))}
        ${colorField('Text','designColor',colorOr(st.color,'#F4F6FB'))}
      </div></section>
      <section class="section"><div class="section-title"><h3>Seven tokens</h3></div><div class="token-grid">${Object.entries(TOKENS).slice(0,8).map(([k,v])=>`<button class="token" data-token="${v}"><span class="token-swatch" style="background:${v}"></span><small>${k}</small></button>`).join('')}</div><div class="hint" style="margin-top:9px">Tap a token to apply it as the selected element background. Tokens remain centralized as the design language evolves.</div></section>
      <section class="section"><div class="action-row"><button class="action" id="saveComponent">Save as component</button><button class="action" id="duplicateDesign">Duplicate</button><button class="action danger" id="deleteDesign">Delete</button></div></section>
    `);
    bindStyle('designDisplay','display');bindStyle('designDirection','flex-direction');bindPx('designGap','gap');bindPx('designPadding','padding');bindPx('designRadius','border-radius');bindPx('designFont','font-size');bindStyle('designBg','background-color');bindStyle('designColor','color');
    document.getElementById('designName').onchange=e=>{s.addAttributes({'data-seven-name':e.target.value});};
    document.querySelectorAll('[data-token]').forEach(b=>b.onclick=()=>{s.addStyle({'background-color':b.dataset.token});renderDesign();});
    document.getElementById('duplicateDesign').onclick=duplicateSelected;
    document.getElementById('deleteDesign').onclick=()=>{s.remove();renderDesign();};
    document.getElementById('saveComponent').onclick=()=>saveAsLibraryComponent(s);
  }

  function renderStates() {
    const s=selected(); if(!s){body('<div class="empty">Select a component to assign variants, Aurora state or prototype behavior.</div>');return;}
    const attrs=s.getAttributes()||{}; const state=attrs['data-seven-state']||'idle'; const variant=attrs['data-seven-variant']||'default'; const action=attrs['data-seven-action']||'none';
    body(`
      <section class="section"><div class="section-title"><h3>Variant</h3></div><div class="preset-row">${['default','compact','expanded','active','disabled','error'].map(v=>`<button class="preset ${variant===v?'active':''}" data-variant="${v}">${cap(v)}</button>`).join('')}</div></section>
      <section class="section"><div class="section-title"><h3>Aurora state</h3><span>semantic presentation</span></div><div class="state-list">${Object.entries(AURORA).map(([k,v])=>`<div class="state-card"><span class="state-dot" style="color:${v[0]};background:${v[0]}"></span><div><strong>${cap(k)}</strong><small>${v[2]}</small></div><button data-state="${k}">${state===k?'Applied':'Apply'}</button></div>`).join('')}</div><div class="hint" style="margin-top:9px">Aurora never represents truth, confidence, permission or verification. It only communicates activity/state.</div></section>
      <section class="section"><div class="section-title"><h3>Prototype action</h3></div><div class="rows">${selectField('On tap','prototypeAction',['none','toast','next-screen','open-command','toggle-state'],action)}</div><div class="hint" style="margin-top:9px">Prototype actions work only in Preview and are kept separate from real Seven runtime behavior.</div></section>
      <section class="section"><div class="action-row"><button class="action" id="clearState">Clear state</button></div></section>
    `);
    document.querySelectorAll('[data-variant]').forEach(b=>b.onclick=()=>{s.addAttributes({'data-seven-variant':b.dataset.variant});renderStates();});
    document.querySelectorAll('[data-state]').forEach(b=>b.onclick=()=>{s.addAttributes({'data-seven-state':b.dataset.state});renderStates();});
    document.getElementById('prototypeAction').onchange=e=>s.addAttributes({'data-seven-action':e.target.value});
    document.getElementById('clearState').onclick=()=>{s.removeAttributes('data-seven-state');s.removeAttributes('data-seven-variant');s.removeAttributes('data-seven-action');renderStates();};
  }

  function renderMore() {
    body(`
      <section class="section"><div class="section-title"><h3>Project</h3></div><div class="rows">
        ${textField('Document name','projectName',settings.docName)}
        ${toggleField('Large text','largeText',settings.largeText,'Stress-test readable scale')}
        ${toggleField('Reduced motion','reducedMotion',settings.reduced,'Authoritative accessibility mode')}
      </div><div class="action-row" style="margin-top:10px"><button class="action primary" id="saveNow">Save now</button><button class="action" id="newScreen">New screen</button></div></section>
      <section class="section"><div class="section-title"><h3>Screen templates</h3></div><div class="block-grid">${Object.keys(templates).map(k=>`<button class="block" data-template="${k}"><span class="mini-icon">${templateIcon(k)}</span><strong>${cap(k)}</strong><small>Replace current screen</small></button>`).join('')}</div></section>
      <section class="section"><div class="section-title"><h3>Quality</h3></div><div class="action-row"><button class="action" id="runJudge">Run Design Judge</button><button class="action" id="openScreens">Screens</button></div><div id="judgeOutput"></div></section>
      <section class="section"><div class="section-title"><h3>Import / Export</h3></div><div class="action-row"><button class="action" id="exportHtml">Standalone HTML</button><button class="action" id="exportJson">Project JSON</button><button class="action" id="importJson">Import JSON</button></div><input id="importFile" type="file" accept="application/json,.json" hidden></section>
      <section class="section"><div class="section-title"><h3>Safety boundary</h3></div><div class="hint">This studio edits visual design. Preview actions are prototypes, not real tool/model/permission/verification claims. Production integration must bind to authoritative Seven runtime state.</div></section>
    `);
    document.getElementById('projectName').onchange=e=>{settings.docName=e.target.value.trim()||'Untitled';applySettings();saveProject();};
    document.getElementById('largeText').onchange=e=>{settings.largeText=e.target.checked;applySettings();saveProject();};
    document.getElementById('reducedMotion').onchange=e=>{settings.reduced=e.target.checked;applySettings();saveProject();};
    document.getElementById('saveNow').onclick=()=>saveProject(true);
    document.querySelectorAll('[data-template]').forEach(b=>b.onclick=()=>{if(confirm('Replace the current screen with this template?')){loadTemplate(b.dataset.template,true);closeSheet();}});
    document.getElementById('runJudge').onclick=runJudge;
    document.getElementById('openScreens').onclick=renderScreens;
    document.getElementById('newScreen').onclick=createScreen;
    document.getElementById('exportHtml').onclick=exportStandalone;
    document.getElementById('exportJson').onclick=exportJSON;
    document.getElementById('importJson').onclick=()=>document.getElementById('importFile').click();
    document.getElementById('importFile').onchange=importJSON;
  }

  function loadTemplate(name, shouldSave=true) {
    editor.setComponents(templates[name] || templates.blank); editor.setStyle(canvasCSS); applySettings(); if(shouldSave)saveProject();
  }

  function createScreen() {
    const name=prompt('Screen name','New Screen'); if(!name)return;
    try{const page=editor.Pages.add({name,component:templates.blank});editor.Pages.select(page);ensureCanvasCSS();applySettings();saveProject(true);renderMore();}catch(_){toast('Could not create screen');}
  }

  function renderScreens() {
    const pages=editor.Pages.getAll(); const active=editor.Pages.getSelected();
    body(`<section class="section"><div class="section-title"><h3>Screens</h3><span>${pages.length}</span></div><div class="state-list">${pages.map(p=>`<div class="state-card"><span class="state-dot" style="color:#4166F5;background:#4166F5"></span><div><strong>${esc(p.get('name')||p.id)}</strong><small>${p===active?'Current screen':'Screen'}</small></div><button data-page="${p.id}">${p===active?'Open':'Select'}</button></div>`).join('')}</div></section><div class="action-row"><button class="action primary" id="addScreenHere">New screen</button><button class="action" id="backStudio">Back</button></div>`);
    document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>{const p=editor.Pages.get(b.dataset.page);if(p){editor.Pages.select(p);applySettings();renderScreens();}});
    document.getElementById('addScreenHere').onclick=createScreen; document.getElementById('backStudio').onclick=renderMore;
  }

  function saveAsLibraryComponent(s) {
    const name=prompt('Component name',s.getAttributes()?.['data-seven-name']||'Seven Component');if(!name)return;
    const lib=safeJSON(localStorage.getItem(LIBRARY_KEY),[]);lib.push({name,html:s.toHTML()});localStorage.setItem(LIBRARY_KEY,JSON.stringify(lib));toast('Saved to My components');
  }

  function runJudge() {
    const out=document.getElementById('judgeOutput'); if(!out)return;
    const doc=editor.Canvas.getDocument(), win=editor.Canvas.getWindow(); if(!doc||!win){out.innerHTML='<div class="empty">Canvas unavailable.</div>';return;}
    const issues=[]; let score=100;
    const interactive=[...doc.querySelectorAll('button,a,input,textarea,select,[role="button"]')];
    let small=0; interactive.forEach(el=>{const r=el.getBoundingClientRect();if(r.width&&r.height&&(r.width<40||r.height<40))small++;});
    if(small){issues.push(['error','Touch targets',`${small} interactive control(s) are smaller than ~40px in at least one dimension. Aim near 44–48px for important touch controls.`]);score-=Math.min(20,small*4);} else issues.push(['ok','Touch targets','No obvious undersized interactive controls detected.']);
    const imgs=[...doc.querySelectorAll('img')]; const noAlt=imgs.filter(i=>!i.hasAttribute('alt')).length;
    if(noAlt){issues.push(['error','Image accessibility',`${noAlt} image(s) have no alt attribute.`]);score-=Math.min(12,noAlt*4);} else issues.push(['ok','Image accessibility','No missing alt attributes detected.']);
    const bodyEl=doc.body; const overflow=bodyEl.scrollWidth>doc.documentElement.clientWidth+2;
    if(overflow){issues.push(['error','Horizontal overflow','Canvas content is wider than the preview viewport.']);score-=16;} else issues.push(['ok','Responsive width','No horizontal page overflow detected at this viewport.']);
    const tiny=[...doc.querySelectorAll('p,span,small,label,button')].filter(el=>{const px=parseFloat(win.getComputedStyle(el).fontSize);return px&&px<10;}).length;
    if(tiny){issues.push(['warn','Tiny text',`${tiny} text element(s) render below 10px.`]);score-=Math.min(10,tiny*2);} else issues.push(['ok','Text floor','No text below 10px detected.']);
    const cards=doc.querySelectorAll('.seven-card').length;
    if(cards>10){issues.push(['warn','Card density',`${cards} cards detected. Review whether Home is becoming a dashboard/card farm.`]);score-=6;}
    const states=[...doc.querySelectorAll('[data-seven-state]')];
    if(states.some(el=>!el.textContent.trim())){issues.push(['warn','State semantics','At least one Aurora-state element has no text. Ensure color is never the only carrier of meaning.']);score-=6;}
    if(settings.dir==='rtl') issues.push(['ok','RTL review mode','Judge is running in RTL preview. Visually verify mixed bidi content too.']);
    if(settings.largeText) issues.push(['ok','Large-text review mode','Large-text stress mode is active.']);
    score=Math.max(0,Math.min(100,score));
    out.innerHTML=`<div style="margin:14px 0 10px" class="score">${score}<small>/100 local heuristic</small></div><div class="issue-list">${issues.map(i=>`<div class="issue ${i[0]==='warn'?'':i[0]}"><strong>${i[1]}</strong><p>${i[2]}</p></div>`).join('')}</div><div class="hint" style="margin-top:9px">The Design Judge is deterministic and unlimited. It detects mechanical risks, not artistic truth. Human visual review remains required.</div>`;
  }

  function openPreview() {
    closeSheet(); const shell=document.getElementById('previewShell'), frame=document.getElementById('previewFrame');
    const html=standaloneHTML(true); frame.style.width=`min(100%, ${settings.device}px)`; document.getElementById('previewDeviceLabel').textContent=`${settings.device}px · ${settings.theme} · ${settings.dir}`;
    frame.srcdoc=html; shell.hidden=false;
  }
  function closePreview(){document.getElementById('previewShell').hidden=true;document.getElementById('previewFrame').srcdoc='';}

  function standaloneHTML(withPrototype=false) {
    const classes=[settings.theme==='day'?'seven-day':'',settings.dir==='rtl'?'seven-rtl':'',settings.largeText?'seven-large':'',settings.density==='lite'?'seven-lite':'',settings.reduced?'seven-reduced':''].filter(Boolean).join(' ');
    const proto=withPrototype?`<script>(function(){document.addEventListener('click',function(e){var t=e.target.closest('[data-seven-action]');if(!t)return;var a=t.getAttribute('data-seven-action');if(a==='toast')notify('Prototype action');if(a==='open-command')notify('Command surface');if(a==='next-screen')notify('Navigate to linked screen');if(a==='toggle-state'){t.setAttribute('data-seven-state',t.getAttribute('data-seven-state')==='success'?'thinking':'success');}});function notify(m){var n=document.createElement('div');n.textContent=m;n.style='position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:#122039;color:white;padding:10px 14px;border-radius:12px;font:12px system-ui;z-index:9999';document.body.appendChild(n);setTimeout(function(){n.remove()},1300)}})();<\/script>`:'';
    return `<!doctype html><html lang="${settings.dir==='rtl'?'ar':'en'}" dir="${settings.dir}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(settings.docName)}</title><style>${editor.getCss()}</style></head><body class="${classes}">${editor.getHtml()}${proto}</body></html>`;
  }

  function exportStandalone(){download(`${slug(settings.docName)}.html`,standaloneHTML(true),'text/html');toast('HTML exported');}
  function exportJSON(){download(`${slug(settings.docName)}.seven-design.json`,JSON.stringify({format:'seven-design-studio-v1',settings,project:editor.getProjectData()},null,2),'application/json');toast('Project JSON exported');}
  async function importJSON(e){const file=e.target.files?.[0];if(!file)return;try{const data=JSON.parse(await file.text());const project=data.project||data;editor.loadProjectData(project);if(data.settings)Object.assign(settings,data.settings);ensureCanvasCSS();applySettings();saveProject(true);renderMore();}catch(_){toast('Invalid project JSON');}e.target.value='';}
  function download(name,content,type){const blob=new Blob([content],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);}

  function bindStyle(id,prop){const el=document.getElementById(id);if(el)el.onchange=e=>{const s=selected();if(s)s.addStyle({[prop]:e.target.value});};}
  function bindPx(id,prop){const el=document.getElementById(id);if(el)el.onchange=e=>{const s=selected();if(s)s.addStyle({[prop]:`${Math.max(0,Number(e.target.value)||0)}px`});};}
  function textField(label,id,value){return `<div class="row"><label for="${id}">${label}</label><input id="${id}" type="text" value="${esc(value)}"></div>`;}
  function numberField(label,id,value,min,max){return `<div class="row"><label for="${id}">${label}</label><input id="${id}" type="number" min="${min}" max="${max}" value="${value}"></div>`;}
  function colorField(label,id,value){return `<div class="row"><label for="${id}">${label}</label><input id="${id}" type="color" value="${value}"></div>`;}
  function selectField(label,id,options,value){return `<div class="row"><label for="${id}">${label}</label><select id="${id}">${options.map(o=>`<option value="${o}" ${o===value?'selected':''}>${cap(o)}</option>`).join('')}</select></div>`;}
  function toggleField(label,id,checked,help=''){return `<div class="row"><label for="${id}">${label}${help?`<small>${help}</small>`:''}</label><input class="switch" id="${id}" type="checkbox" ${checked?'checked':''}></div>`;}
  function body(html){document.getElementById('sheetBody').innerHTML=html;}
  function pxNum(v){const n=parseFloat(v);return Number.isFinite(n)?n:0;}
  function colorOr(v,fallback){return /^#[0-9a-f]{6}$/i.test(v||'')?v:fallback;}
  function cap(v=''){return v.charAt(0).toUpperCase()+v.slice(1).replace(/-/g,' ');}
  function slug(v='design'){return v.toLowerCase().replace(/[^a-z0-9\u0600-\u06ff]+/gi,'-').replace(/^-|-$/g,'')||'seven-design';}
  function templateIcon(k){return ({home:'⌂',chat:'◌',research:'⌕',coding:'⌘',world:'◇',blank:'□'})[k]||'□';}
})();
