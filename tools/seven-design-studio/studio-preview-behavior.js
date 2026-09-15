(() => {
  'use strict';

  const frame=document.getElementById('previewFrame');
  const stage=document.querySelector('.preview-stage');
  const previewBtn=document.getElementById('previewBtn');
  if(!frame)return;

  function resetPreviewPosition(){
    try{
      const win=frame.contentWindow;
      const doc=frame.contentDocument;
      if(win?.history && 'scrollRestoration' in win.history)win.history.scrollRestoration='manual';
      win?.scrollTo?.({top:0,left:0,behavior:'auto'});
      if(doc?.documentElement){doc.documentElement.scrollTop=0;doc.documentElement.scrollLeft=0;}
      if(doc?.body){doc.body.scrollTop=0;doc.body.scrollLeft=0;}
      doc?.querySelectorAll?.('.v5-shortcuts').forEach(rail=>{
        const rtl=(doc.documentElement?.dir||doc.body?.dir)==='rtl';
        rail.scrollTo?.({left:rtl?rail.scrollWidth:0,top:0,behavior:'auto'});
        rail.scrollLeft=rtl?rail.scrollWidth:0;
      });
    }catch(_){}
    try{if(stage){stage.scrollTop=0;stage.scrollLeft=0;}}catch(_){}
  }

  function scheduleReset(){
    [0,40,140,360,800].forEach(ms=>setTimeout(resetPreviewPosition,ms));
  }

  frame.addEventListener('load',scheduleReset);
  previewBtn?.addEventListener('click',scheduleReset);
  window.addEventListener('resize',()=>setTimeout(resetPreviewPosition,50));
})();
