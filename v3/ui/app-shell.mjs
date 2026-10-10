const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));

const TEXT={
  en:{chats:"Chats",newChat:"New chat",message:"Message Seven",chooseModel:"Choose model",workspace:"Workspace",emptyTitle:"What can Seven do for you?",emptyBody:"Start a conversation, continue a project, or open a workspace.",copy:"Copy",menu:"Menu",recent:"Recent",spaces:"Workspaces",search:"Search chats",thinking:"Reasoning",intro:"Your ideas, one conversation away.",tip1:"Explore an idea",tip2:"Write & refine",tip3:"Build with code",inputNote:"Seven can make mistakes. Check important information.",online:"Ready",attach:"Add files",send:"Send message"},
  ar:{chats:"المحادثات",newChat:"محادثة جديدة",message:"اكتب إلى Seven",chooseModel:"اختيار النموذج",workspace:"مساحة العمل",emptyTitle:"كيف يمكن لـ Seven مساعدتك؟",emptyBody:"ابدأ محادثة، أكمل مشروعًا، أو افتح مساحة عمل.",copy:"نسخ",menu:"القائمة",recent:"الأخيرة",spaces:"مساحات العمل",search:"البحث في المحادثات",thinking:"التفكير",intro:"كل فكرة تبدأ بمحادثة.",tip1:"استكشف فكرة",tip2:"اكتب وحسّن",tip3:"برمج مع Seven",inputNote:"قد يخطئ Seven؛ تحقّق من المعلومات المهمة.",online:"جاهز",attach:"إضافة ملفات",send:"إرسال رسالة"}
};


function icon(name,size=18){
  const p={
    edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    history:'<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/><path d="M12 7v5l3 2"/>',
    grid:'<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>',
    chevron:'<path d="m8 10 4 4 4-4"/>',
    menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    send:'<path d="m5 12 14-7-4 14-3-6-7-1Z"/><path d="m12 13 7-8"/>',
    copy:'<rect x="8" y="8" width="11" height="11" rx="2"/><path d="M5 16H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    more:'<circle cx="5" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.2" fill="currentColor" stroke="none"/>',
    spark:'<path d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5Z"/><path d="m18 15 .8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8Z"/>',
    arrow:'<path d="M5 12h14M14 7l5 5-5 5"/>',
    paperclip:'<path d="m21.4 11.6-8.9 8.9a6 6 0 0 1-8.5-8.5l9.6-9.6a4 4 0 0 1 5.7 5.7l-9.7 9.7a2 2 0 1 1-2.8-2.8l8.9-8.9"/>',
    refresh:'<path d="M20 6v5h-5"/><path d="M4 18v-5h5"/><path d="M6.1 8a7 7 0 0 1 11.5-2L20 8M4 16l2.4 2A7 7 0 0 0 18 16"/>',
    branch:'<path d="M6 3v12"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="6" r="3"/><path d="M9 18h2a7 7 0 0 0 7-7V9"/>',
  }[name]||'';
  return `<svg class="s7-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
}

function locale(lang){
  return String(lang||"").toLowerCase().startsWith("ar")?"ar":"en";
}

export function createShellState(input={}){
  return {
    lang:locale(input.lang),
    navOpen:false,
    title:String(input.title||"New chat"),
    activeRoomId:input.activeRoomId??null,
    activeModel:String(input.activeModel||""),
    activeWorkspace:String(input.activeWorkspace||"chat"),
    rooms:Array.isArray(input.rooms)?input.rooms.slice():[],
    models:Array.isArray(input.models)?input.models.slice():[],
    messages:Array.isArray(input.messages)?input.messages.slice():[]
  };
}

function roomMarkup(room,active){
  return `<button class="s7-room" type="button" data-room-id="${esc(room.id)}" data-active="${room.id===active}"><span class="s7-room-glyph" aria-hidden="true">${icon("history",15)}</span><span class="s7-room-name">${esc(room.title||"Untitled")}</span></button>`;
}

function messageMarkup(message,t){
  const role=message.role==="user"?"user":"assistant";
  const assistant=role==="assistant";
  const content=esc(message.content).replace(/\\n/g,"<br>");
  return `<article class="s7-message" data-role="${role}">
    ${assistant?'<div class="s7-assistant-identity"><span class="s7-avatar">7</span><strong>Seven</strong><span class="s7-status-indicator"></span></div>':""}
    <div class="s7-message-bubble" dir="auto">${content}</div>
    <div class="s7-message-actions">
      <button class="s7-message-action" type="button" data-copy-message aria-label="${esc(t.copy)}" title="${esc(t.copy)}">${icon("copy",14)}<span class="s7-action-label">${esc(t.copy)}</span></button>
      ${assistant?'<button class="s7-message-action" type="button" data-regenerate aria-label="Regenerate" title="Regenerate">'+icon("refresh",14)+'</button>':""}
    </div>
  </article>`;
}

export function renderShell(root,state){
  if(!root)throw new TypeError("root is required");
  const t=TEXT[state.lang]||TEXT.en;
  root.__sevenShellController?.abort();
  root.dir=state.lang==="ar"?"rtl":"ltr";
  root.lang=state.lang;
  root.innerHTML=`
  <div class="s7-app" data-nav-open="false">
    <aside class="s7-sidebar" aria-label="${esc(t.chats)}">
      <div class="s7-sidebar-head"><div class="s7-brand"><span class="s7-brand-mark">7</span><span>Seven<span class="s7-brand-period">.</span></span></div><span class="s7-sidebar-meta">v3</span></div>
      <button class="s7-new-chat" type="button" data-new-chat>${icon("edit",17)}<span>${esc(t.newChat)}</span><span class="s7-new-shortcut">${icon("plus",14)}</span></button><div class="s7-sidebar-search">${icon("search",16)}<span>${esc(t.search)}</span><kbd>⌘K</kbd></div><div class="s7-sidebar-divider"></div>
      <div class="s7-section-label">${esc(t.recent)}</div>
      <div class="s7-room-list">${state.rooms.map(r=>roomMarkup(r,state.activeRoomId)).join("")}</div><div class="s7-sidebar-bottom"><span class="s7-user-avatar">S</span><span>Seven workspace<small>Personal</small></span>${icon("more",18)}</div>
    </aside>

    <main class="s7-main">
      <header class="s7-topbar">
        <button class="s7-icon-btn s7-menu-toggle" type="button" data-nav-toggle aria-label="${esc(t.menu)}">${icon("menu",18)}</button>
        <div class="s7-title-group"><div class="s7-title">${esc(state.title)}</div><span class="s7-chat-context">${esc(t.online)} <span aria-hidden="true">·</span> Chat</span></div>
        <button class="s7-workspace-trigger" type="button" data-workspace-trigger aria-haspopup="menu">${icon("grid",16)}<span data-label>${esc(t.workspace)}</span><span class="s7-topbar-label">${esc(state.activeWorkspace==="chat"?"Chat":state.activeWorkspace)}</span></button>
        <button class="s7-model-trigger" type="button" data-model-trigger aria-haspopup="listbox" aria-expanded="false"><span class="s7-model-dot"></span><span data-label>${esc(state.activeModel||t.chooseModel)}</span>${icon("chevron",15)}</button>
      </header>

      <section class="s7-chat" data-chat>
        <div class="s7-chat-inner">
          ${state.messages.length?state.messages.map(m=>messageMarkup(m,t)).join(""):`<section class="s7-empty"><div><div class="s7-empty-mark">7</div><div class="s7-eyebrow">SEVEN AI</div><h1>${esc(t.emptyTitle)}</h1><p>${esc(t.intro)}</p><div class="s7-starters"><button type="button" data-starter="${esc(t.tip1)}">${esc(t.tip1)} <span>${icon("arrow",14)}</span></button><button type="button" data-starter="${esc(t.tip2)}">${esc(t.tip2)} <span>${icon("arrow",14)}</span></button><button type="button" data-starter="${esc(t.tip3)}">${esc(t.tip3)} <span>${icon("arrow",14)}</span></button></div></div></section>`}
        </div>
      </section>

      <footer class="s7-composer-wrap">
        <form class="s7-composer" data-composer>
          <button class="s7-icon-btn s7-attach" type="button" data-attach aria-label="${esc(t.attach)}" title="${esc(t.attach)}">${icon("paperclip",18)}</button>
          <textarea rows="1" data-input dir="auto" placeholder="${esc(t.message)}"></textarea>
          <div class="s7-composer-actions"><span class="s7-mode-chip">${icon("spark",13)} <span>${esc(t.thinking)}</span></span><button class="s7-send" type="submit" data-send aria-label="${esc(t.send)}" title="${esc(t.send)}">${icon("send",18)}</button></div>
        </form><div class="s7-composer-meta"><span><i class="s7-ready-dot"></i> Seven <span class="s7-composer-meta-sub">${esc(t.online)}</span></span><span>${esc(t.inputNote)}</span></div>
      </footer>
    </main>

    <button class="s7-backdrop" type="button" data-backdrop hidden aria-label="Close"></button>
    <div class="s7-overlay" aria-live="polite">
      <div class="s7-menu" data-model-menu role="listbox" hidden></div>
      <div class="s7-menu" data-workspace-menu role="menu" hidden></div>
    </div>
  </div>`;

  const app=root.querySelector(".s7-app");
  const backdrop=root.querySelector("[data-backdrop]");
  const modelMenu=root.querySelector("[data-model-menu]");
  const workspaceMenu=root.querySelector("[data-workspace-menu]");
  const input=root.querySelector("[data-input]");

  function setNav(open){
    state.navOpen=!!open;
    app.dataset.navOpen=state.navOpen?"true":"false";
    backdrop.hidden=!state.navOpen;
  }

  function closeMenus(){
    modelMenu.hidden=true;
    workspaceMenu.hidden=true;
    root.querySelector("[data-model-trigger]")?.setAttribute("aria-expanded","false");
  }

  function placeMenu(menu,trigger){
    const r=trigger.getBoundingClientRect();
    const mobile=globalThis.matchMedia?.("(max-width:620px)")?.matches;
    if(mobile){
      menu.style.removeProperty("top");
      menu.style.removeProperty("left");
      menu.style.removeProperty("right");
      return;
    }
    const top=Math.min(globalThis.innerHeight-80,Math.round(r.bottom+8));
    const left=Math.max(12,Math.min(Math.round(r.left),globalThis.innerWidth-372));
    menu.style.top=top+"px";
    menu.style.left=left+"px";
    menu.style.right="auto";
  }

  function openModels(trigger){
    modelMenu.innerHTML=state.models.map(model=>`<button class="s7-menu-item" type="button" role="option" data-model-id="${esc(model.id)}" aria-selected="${model.id===state.activeModel}">${esc(model.label||model.id)}</button>`).join("");
    workspaceMenu.hidden=true;
    modelMenu.hidden=false;
    trigger.setAttribute("aria-expanded","true");
    placeMenu(modelMenu,trigger);
  }

  function openWorkspaces(trigger){
    const items=[
      ["chat","Chat"],["coding","Coding"],["research","Research"],["rpg","RPG"],["selfdev","Self-Development"]
    ];
    workspaceMenu.innerHTML=items.map(([id,label])=>`<button class="s7-menu-item" type="button" role="menuitem" data-workspace-id="${id}" aria-selected="${id===state.activeWorkspace}">${label}</button>`).join("");
    modelMenu.hidden=true;
    workspaceMenu.hidden=false;
    placeMenu(workspaceMenu,trigger);
  }

  function resizeInput(){
    input.style.height="auto";
    input.style.height=Math.min(Math.max(44,input.scrollHeight),Math.min(globalThis.innerHeight*.32,260))+"px";
  }

  const controller=new AbortController();
  root.__sevenShellController=controller;
  const signal=controller.signal;
  root.addEventListener("click",async event=>{
    const target=event.target.closest?.("button,[data-room-id]");
    if(!target)return;
    if(target.matches("[data-starter]")){input.value=target.dataset.starter;input.focus();resizeInput();return}
    if(target.matches("[data-attach]")){root.dispatchEvent(new CustomEvent("seven:attach"));return}
    if(target.matches("[data-nav-toggle]")){setNav(!state.navOpen);return}
    if(target.matches("[data-backdrop]")){setNav(false);return}
    if(target.matches("[data-model-trigger]")){modelMenu.hidden?openModels(target):closeMenus();return}
    if(target.matches("[data-workspace-trigger]")){workspaceMenu.hidden?openWorkspaces(target):closeMenus();return}
    if(target.dataset.modelId){state.activeModel=target.dataset.modelId;root.dispatchEvent(new CustomEvent("seven:modelchange",{detail:{model:state.activeModel}}));renderShell(root,state);return}
    if(target.dataset.workspaceId){state.activeWorkspace=target.dataset.workspaceId;root.dispatchEvent(new CustomEvent("seven:workspacechange",{detail:{workspace:state.activeWorkspace}}));closeMenus();return}
    if(target.dataset.roomId){state.activeRoomId=target.dataset.roomId;setNav(false);root.dispatchEvent(new CustomEvent("seven:roomchange",{detail:{roomId:state.activeRoomId}}));return}
    if(target.matches("[data-new-chat]")){root.dispatchEvent(new CustomEvent("seven:newchat"));setNav(false);return}
    if(target.matches("[data-copy-message]")){const text=target.closest(".s7-message")?.querySelector(".s7-message-bubble")?.textContent||"";try{await navigator.clipboard.writeText(text)}catch{}return}
    if(target.matches("[data-regenerate]")){root.dispatchEvent(new CustomEvent("seven:regenerate"));return}
  },{signal});

  root.querySelector("[data-composer]")?.addEventListener("submit",event=>{
    event.preventDefault();
    const text=input.value.trim();
    if(!text)return;
    root.dispatchEvent(new CustomEvent("seven:send",{detail:{text}}));
    input.value="";
    resizeInput();
  },{signal});

  input?.addEventListener("input",resizeInput,{passive:true,signal});
  root.addEventListener("keydown",event=>{if(event.key==="Escape"){closeMenus();setNav(false)} if(event.key==="Enter"&&!event.shiftKey&&event.target===input){event.preventDefault();root.querySelector("[data-composer]")?.requestSubmit()}},{signal});

  resizeInput();
  return {state,setNav,closeMenus,destroy(){controller.abort();root.innerHTML=""}};
}

export function mountSevenShell(root,input={}){
  return renderShell(root,createShellState(input));
}
