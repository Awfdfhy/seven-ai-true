const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));

const TEXT={
  en:{chats:"Chats",newChat:"New chat",message:"Message Seven",chooseModel:"Choose model",workspace:"Workspace",emptyTitle:"What can Seven do for you?",emptyBody:"Start a conversation, continue a project, or open a workspace.",copy:"Copy",menu:"Menu"},
  ar:{chats:"المحادثات",newChat:"محادثة جديدة",message:"اكتب إلى Seven",chooseModel:"اختيار النموذج",workspace:"مساحة العمل",emptyTitle:"كيف يمكن لـ Seven مساعدتك؟",emptyBody:"ابدأ محادثة، أكمل مشروعًا، أو افتح مساحة عمل.",copy:"نسخ",menu:"القائمة"}
};

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
  return `<button class="s7-room" type="button" data-room-id="${esc(room.id)}" data-active="${room.id===active}"><span>◌</span><span>${esc(room.title||"Untitled")}</span></button>`;
}

function messageMarkup(message,t){
  const role=message.role==="user"?"user":"assistant";
  return `<article class="s7-message" data-role="${role}"><div class="s7-message-bubble" dir="auto">${esc(message.content)}</div><div class="s7-message-actions"><button class="s7-message-action" type="button" data-copy-message>${esc(t.copy)}</button></div></article>`;
}

export function renderShell(root,state){
  if(!root)throw new TypeError("root is required");
  const t=TEXT[state.lang]||TEXT.en;
  root.dir=state.lang==="ar"?"rtl":"ltr";
  root.lang=state.lang;
  root.innerHTML=`
  <div class="s7-app" data-nav-open="false">
    <aside class="s7-sidebar" aria-label="${esc(t.chats)}">
      <div class="s7-sidebar-head"><div class="s7-brand"><span class="s7-brand-mark">7</span><span>Seven</span></div></div>
      <button class="s7-new-chat" type="button" data-new-chat><span>＋</span><span>${esc(t.newChat)}</span></button>
      <div class="s7-section-label">${esc(t.chats)}</div>
      <div class="s7-room-list">${state.rooms.map(r=>roomMarkup(r,state.activeRoomId)).join("")}</div>
    </aside>

    <main class="s7-main">
      <header class="s7-topbar">
        <button class="s7-icon-btn s7-menu-toggle" type="button" data-nav-toggle aria-label="${esc(t.menu)}">☰</button>
        <div class="s7-title">${esc(state.title)}</div>
        <button class="s7-workspace-trigger" type="button" data-workspace-trigger aria-haspopup="menu"><span>⌘</span><span data-label>${esc(t.workspace)}</span></button>
        <button class="s7-model-trigger" type="button" data-model-trigger aria-haspopup="listbox" aria-expanded="false"><span class="s7-model-dot"></span><span data-label>${esc(state.activeModel||t.chooseModel)}</span><span>⌄</span></button>
      </header>

      <section class="s7-chat" data-chat>
        <div class="s7-chat-inner">
          ${state.messages.length?state.messages.map(m=>messageMarkup(m,t)).join(""):`<section class="s7-empty"><div><h1>${esc(t.emptyTitle)}</h1><p>${esc(t.emptyBody)}</p></div></section>`}
        </div>
      </section>

      <footer class="s7-composer-wrap">
        <form class="s7-composer" data-composer>
          <button class="s7-icon-btn" type="button" data-attach aria-label="Attach">＋</button>
          <textarea rows="1" data-input dir="auto" placeholder="${esc(t.message)}"></textarea>
          <button class="s7-send" type="submit" data-send aria-label="Send">↑</button>
        </form>
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

  root.addEventListener("click",async event=>{
    const target=event.target.closest?.("button,[data-room-id]");
    if(!target)return;
    if(target.matches("[data-nav-toggle]")){setNav(!state.navOpen);return}
    if(target.matches("[data-backdrop]")){setNav(false);return}
    if(target.matches("[data-model-trigger]")){modelMenu.hidden?openModels(target):closeMenus();return}
    if(target.matches("[data-workspace-trigger]")){workspaceMenu.hidden?openWorkspaces(target):closeMenus();return}
    if(target.dataset.modelId){state.activeModel=target.dataset.modelId;root.dispatchEvent(new CustomEvent("seven:modelchange",{detail:{model:state.activeModel}}));renderShell(root,state);return}
    if(target.dataset.workspaceId){state.activeWorkspace=target.dataset.workspaceId;root.dispatchEvent(new CustomEvent("seven:workspacechange",{detail:{workspace:state.activeWorkspace}}));closeMenus();return}
    if(target.dataset.roomId){state.activeRoomId=target.dataset.roomId;setNav(false);root.dispatchEvent(new CustomEvent("seven:roomchange",{detail:{roomId:state.activeRoomId}}));return}
    if(target.matches("[data-new-chat]")){root.dispatchEvent(new CustomEvent("seven:newchat"));setNav(false);return}
    if(target.matches("[data-copy-message]")){const text=target.closest(".s7-message")?.querySelector(".s7-message-bubble")?.textContent||"";try{await navigator.clipboard.writeText(text)}catch{}return}
  });

  root.querySelector("[data-composer]")?.addEventListener("submit",event=>{
    event.preventDefault();
    const text=input.value.trim();
    if(!text)return;
    root.dispatchEvent(new CustomEvent("seven:send",{detail:{text}}));
    input.value="";
    resizeInput();
  });

  input?.addEventListener("input",resizeInput,{passive:true});
  root.addEventListener("keydown",event=>{if(event.key==="Escape"){closeMenus();setNav(false)}});

  resizeInput();
  return {state,setNav,closeMenus,destroy(){root.innerHTML=""}};
}

export function mountSevenShell(root,input={}){
  return renderShell(root,createShellState(input));
}
