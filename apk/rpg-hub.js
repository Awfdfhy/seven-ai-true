/* Seven RPG exclusive workspace host. There is no Chat/Coding/Research UI. */
(function (root) {
  'use strict';
  if (!root || !root.document) return;
  var doc=root.document;
  var deps=[
    ['SevenRpgState','rpg-state.js'],
    ['SevenRpgSession','rpg-session.js'],
    ['SevenRpgLiveIntegration','rpg-live-integration.js'],
    ['SevenRpgContext','rpg-context.js'],
    ['SevenCanon','canon-simulator.js'],
    ['SevenWorld','world-runtime.js']
  ];
  var inflight={};
  var state={active:'rpg',ready:false,openEpoch:0};
  function load(key,asset) {
    if(root[key]) return Promise.resolve(root[key]);
    if(inflight[key])return inflight[key];
    inflight[key]=new Promise(function(resolve,reject){
      var s=doc.createElement('script');
      s.id='seven-rpg-kernel-'+key.toLowerCase();
      s.src='./workspaces/'+asset;
      s.onload=function(){root[key]?resolve(root[key]):reject(Error('RPG kernel did not register: '+key))};
      s.onerror=function(){reject(Error('RPG kernel failed to load: '+asset))};
      doc.head.appendChild(s);
    }).finally(function(){delete inflight[key]});
    return inflight[key];
  }
  function host(){
    var el=doc.querySelector('.rpg-engine-host');
    if(el)return el;
    var main=doc.querySelector('.rpg-main');
    if(!main)throw Error('RPG main stage not found');
    el=doc.createElement('section');
    el.className='rpg-engine-host seven-workspace-root';
    el.hidden=true;
    main.appendChild(el);
    return el;
  }
  var mounting=null;
  function open(kind) {
    // Never expose a fallback path to a legacy Seven AI surface.
    if(kind && kind!=='rpg' && kind!=='chat')return Promise.reject(Error('Only RPG is available in this app'));
    if(state.ready && root.SevenRpgWorkspace)return Promise.resolve(root.SevenRpgWorkspace);
    if(mounting)return mounting;
    mounting=Promise.all(deps.map(function(p){return load(p[0],p[1])}))
      .then(function(){return load('SevenRpgWorkspace','rpg.js')})
      .then(function(api){
        doc.documentElement.dataset.sevenWorkspace='rpg';
        api.mount(host());
        state.ready=true;
        state.active='rpg';
        doc.dispatchEvent(new CustomEvent('seven:workspacechange',{detail:{workspace:'rpg'}}));
        return api;
      }).finally(function(){mounting=null});
    return mounting;
  }
  function close(){return open('rpg')}
  function openLauncher(){
    var button=doc.getElementById('rpg-library-toggle');
    if(button)button.click();
    return doc.getElementById('sidebar');
  }
  root.SevenWorkspaces={
    state:state, version:'rpg-only-1.0',
    open:open, close:close,
    openLauncher:openLauncher,
    active:function(){return state.active},
    available:function(){return ['rpg']},
    loadGeneratedUi:function(){return Promise.reject(Error('Generated Seven AI UI is not shipped in Seven RPG'))},
    renderGeneratedUi:function(){return Promise.reject(Error('Generated Seven AI UI is not shipped in Seven RPG'))}
  };
})(typeof globalThis!=='undefined'?globalThis:this);
