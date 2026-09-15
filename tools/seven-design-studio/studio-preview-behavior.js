(() => {
  'use strict';
  const frame=document.getElementById('previewFrame');
  if(!frame)return;
  const reset=()=>{
    try{frame.contentWindow?.scrollTo(0,0);}catch(_){}
    try{frame.contentDocument?.documentElement?.scrollTo?.(0,0);}catch(_){}
    try{frame.contentDocument?.body?.scrollTo?.(0,0);}catch(_){}
  };
  frame.addEventListener('load',()=>setTimeout(reset,30));
  document.getElementById('previewBtn')?.addEventListener('click',()=>setTimeout(reset,180));
})();
