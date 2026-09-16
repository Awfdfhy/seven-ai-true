const CACHE='seven-design-studio-v21';
const LOCAL=['./','./index.html','./studio.css','./studio-preview-polish.css','./studio-bridge.js','./studio.js','./studio-page-state-sync.js','./studio-preview-behavior.js','./home-launchpad-v4.js','./seven-mark-polish.js','./home-synthesis-kick.js','./home-completion-v5.js','./home-capability-catalog-v1.js','./home-visual-polish-v1.js','./home-visual-polish-v2.js','./home-visual-polish-v3.js','./home-visual-polish-v4.js','./home-visual-polish-a11y-v1.js','./chat-ui-v1.js','./seven-product-screens-v1.js','./mobile-polish.css','./mobile-polish.js','./manifest.webmanifest','./seven-design-icon.svg'];
const REMOTE=[
  'https://unpkg.com/grapesjs@0.23.6/dist/css/grapes.min.css',
  'https://unpkg.com/grapesjs@0.23.6/dist/grapes.min.js'
];

self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(CACHE)
      .then(async cache=>{
        await cache.addAll(LOCAL);
        await Promise.all(REMOTE.map(async url=>{
          try{
            const response=await fetch(url,{mode:'cors',cache:'reload'});
            if(response&&response.ok)await cache.put(url,response.clone());
          }catch(_){/* Remote pre-cache is best-effort; local shell still installs. */}
        }));
      })
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);

  if(url.origin===self.location.origin){
    event.respondWith(
      caches.match(event.request).then(hit=>hit||fetch(event.request).then(response=>{
        const copy=response.clone();
        caches.open(CACHE).then(cache=>cache.put(event.request,copy));
        return response;
      }))
    );
    return;
  }

  if(url.hostname==='unpkg.com'&&url.pathname.includes('/grapesjs@0.23.6/')){
    event.respondWith(
      caches.match(event.request).then(hit=>hit||fetch(event.request).then(response=>{
        const copy=response.clone();
        caches.open(CACHE).then(cache=>cache.put(event.request,copy));
        return response;
      }))
    );
  }
});
