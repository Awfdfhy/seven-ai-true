(() => {
  'use strict';

  const VERSION='2026.09-capability-catalog-v1';
  const HOME='2026.09-home-v5';
  const EXTRA_ROUTES='schema mcp fetch browser-actions sql data-analysis visualization math geospatial weather documents docx spreadsheets media-transform generative-media provenance archive api webhooks auth mail calendar cloud-files code-hosting ocr speech local-inference device notifications share utilities structured-data scientific-compute productivity-connectors';

  const GROUPS=[
    ['Data & knowledge',['SQL & local data','Data analysis','Charts & tables','Math & science','Maps & weather','Structured data']],
    ['Documents & media',['PDF tools','DOCX & reports','Spreadsheets','Image generation','Image editing','Media transform','Archives']],
    ['Automation & connections',['APIs','Webhooks','Connected accounts','Mail','Calendar','Cloud files','Code hosting']],
    ['Device & local',['OCR & scanner','Speech','Local intelligence','Device actions','Notifications','Share']],
    ['Tool fabric',['SchemaGuard','MCP tools','Fetch & extract','Browser actions']],
    ['Trust & provenance',['Artifact provenance','Content integrity','Import / export','Diagnostics']]
  ];

  const slug=s=>String(s).toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

  function augment(doc){
    const root=doc?.querySelector(`[data-seven-home-completion="${HOME}"]`);
    if(!root)return;
    const routes=new Set(String(root.getAttribute('data-seven-capability-routes')||'').split(/\s+/).filter(Boolean));
    EXTRA_ROUTES.split(/\s+/).forEach(x=>routes.add(x));
    root.setAttribute('data-seven-capability-routes',Array.from(routes).join(' '));
    root.setAttribute('data-seven-capability-catalog',VERSION);

    const body=root.querySelector('.v5-sheet-body');
    const title=root.querySelector('#v5SheetTitle');
    if(!body||!title||title.textContent.trim()!=='All capabilities'||body.querySelector('[data-seven-catalog-extra]'))return;

    const wrap=doc.createElement('div');
    wrap.setAttribute('data-seven-catalog-extra',VERSION);
    wrap.innerHTML=GROUPS.map(([group,items])=>`<section class="v5-command-group"><h3>${group}</h3><div class="v5-command-items">${items.map(item=>`<button class="v5-command" data-v5-command="${slug(item)}" data-seven-capability-item>${item}</button>`).join('')}</div></section>`).join('');
    body.appendChild(wrap);
  }

  function bindDoc(doc){
    if(!doc||doc.__sevenCapabilityCatalogBound)return;
    doc.__sevenCapabilityCatalogBound=true;
    augment(doc);
    doc.addEventListener('click',e=>{
      const opener=e.target.closest('[data-v5-sheet="command"]');
      if(opener)setTimeout(()=>augment(doc),0);
    });
    const observer=new MutationObserver(()=>augment(doc));
    observer.observe(doc.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden']});
  }

  function install(editor){
    if(!editor||editor.__sevenCapabilityCatalogInstalled)return;
    editor.__sevenCapabilityCatalogInstalled=true;
    const bindCanvas=()=>{try{const frame=editor.Canvas?.getFrameEl?.();if(frame?.contentDocument)bindDoc(frame.contentDocument);}catch(_){}};
    for(const name of ['load','project:load','update'])editor.on(name,()=>setTimeout(bindCanvas,30));
    setTimeout(bindCanvas,180);setTimeout(bindCanvas,700);setTimeout(bindCanvas,1400);
    const preview=document.getElementById('previewFrame');
    preview?.addEventListener('load',()=>setTimeout(()=>bindDoc(preview.contentDocument),40));
    document.getElementById('previewBtn')?.addEventListener('click',()=>setTimeout(()=>bindDoc(preview?.contentDocument),200));
  }

  if(window.__sevenDesignEditor)install(window.__sevenDesignEditor);
  window.addEventListener('seven-design-editor-ready',e=>install(e.detail?.editor||window.__sevenDesignEditor),{once:true});
})();
