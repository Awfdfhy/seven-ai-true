import { useEffect, useState, useSyncExternalStore } from "react";
import type { SevenRuntime } from "../kernel/seven-runtime";
import { createRoom, type Room } from "../domain/chat";
import type { ChatRun } from "../application/chat/chat-service";
import { type ThemePreference } from "./shell/shell-store";
import type { MemoryFact } from "../domain/memory/fabric";

const THEMES: readonly ThemePreference[] = ["auto", "light", "dark"];

function shortTitle(room: Room): string {
  if (room.title !== "New chat") return room.title;
  const first = room.messages.find((message) => message.role === "user")?.content.trim();
  return first ? first.slice(0, 42) : room.title;
}

export function App({ runtime }: Readonly<{ runtime: SevenRuntime }>) {
  const { shell, theme, kernel, rooms, chat, chatTransport, memory } = runtime;
  const snapshot = useSyncExternalStore(shell.subscribe, shell.getSnapshot, shell.getSnapshot);
  const [roomList, setRoomList] = useState<readonly Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [input, setInput] = useState("");
  const [pendingUser, setPendingUser] = useState<string | null>(null);
  const [assistantDraft, setAssistantDraft] = useState("");
  const [activeRun, setActiveRun] = useState<ChatRun | null>(null);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [booting, setBooting] = useState(true);
  const [showMemory, setShowMemory] = useState(false);
  const [memoryFacts, setMemoryFacts] = useState<readonly MemoryFact[]>([]);
  const [memoryBusy, setMemoryBusy] = useState(false);
  const isAr = snapshot.locale === "ar";
  const t = (en: string, ar: string) => isAr ? ar : en;

  useEffect(() => {
    const onResize = () => {
      const viewport = window.visualViewport;
      const width = viewport?.width ?? window.innerWidth;
      const height = viewport?.height ?? window.innerHeight;
      shell.setViewport(width, height, window.innerHeight - height > 120);
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") theme.onVisibilityResume();
    };
    onResize();
    window.addEventListener("resize", onResize);
    window.visualViewport?.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("resize", onResize);
      window.visualViewport?.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [shell, theme]);

  const refreshRooms = async (preferredId?: string) => {
    let list = await rooms.list();
    if (list.length === 0) {
      const initial = createRoom({ modelId: "kilo-auto/free" });
      await rooms.put(initial);
      list = [initial];
    }
    setRoomList(list);
    const preferred = preferredId ? list.find((room) => room.id === preferredId) : null;
    const selected = preferred ?? list.find((room) => room.id === currentRoom?.id) ?? list[0] ?? null;
    setCurrentRoom(selected);
    setBooting(false);
  };

  useEffect(() => {
    let alive = true;
    void rooms.list().then(async (list) => {
      if (!alive) return;
      if (list.length === 0) {
        const initial = createRoom({ modelId: "kilo-auto/free" });
        await rooms.put(initial);
        if (!alive) return;
        list = [initial];
      }
      setRoomList(list);
      setCurrentRoom(list[0] ?? null);
      setBooting(false);
    }).catch((reason: unknown) => {
      if (!alive) return;
      setError(reason instanceof Error ? reason.message : String(reason));
      setBooting(false);
    });
    return () => { alive = false; };
  }, [rooms]);

  const refreshMemory = async () => {
    if (!currentRoom) return;
    setMemoryBusy(true);
    try {
      setMemoryFacts(await memory.listActive(currentRoom.id));
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setMemoryBusy(false);
    }
  };

  const forgetMemory = async (memoryId: string) => {
    if (!currentRoom || memoryBusy) return;
    setMemoryBusy(true);
    try {
      await memory.forget(memoryId, currentRoom.id);
      setMemoryFacts(await memory.listActive(currentRoom.id));
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setMemoryBusy(false);
    }
  };

  const cycleTheme = () => {
    const index = THEMES.indexOf(snapshot.themePreference);
    theme.setPreference(THEMES[(index + 1) % THEMES.length] ?? "auto");
  };

  const newChat = async () => {
    const room = createRoom({ modelId: "kilo-auto/free" });
    await rooms.put(room);
    setCurrentRoom(room);
    setRoomList((existing) => [room, ...existing]);
    setInput("");
    setError(null);
    shell.setSidebarOpen(false);
  };

  const submit = async () => {
    const content = input.trim();
    if (!currentRoom || !content || activeRun) return;
    setError(null);
    setInput("");
    setPendingUser(content);
    setAssistantDraft("");
    setActiveRoomId(currentRoom.id);
    try {
      const run = await chat.send(currentRoom.id, content, chatTransport, {
        onDraft(draft) {
          if (draft.roomId === currentRoom.id) setAssistantDraft(draft.content);
        },
      });
      setActiveRun(run);
      const completed = await run.result;
      setCurrentRoom((selected) => selected?.id === completed.id ? completed : selected);
      setPendingUser(null);
      setAssistantDraft("");
      await refreshRooms(completed.id);
    } catch (reason: unknown) {
      setError(
        reason instanceof Error
          ? reason.message
          : t("Seven could not complete this message.", "تعذر على Seven إكمال هذه الرسالة."),
      );
    } finally {
      setPendingUser(null);
      setAssistantDraft("");
      setActiveRun(null);
      setActiveRoomId(null);
    }
  };

  const messages = currentRoom?.messages ?? [];
  const showPending = currentRoom && activeRoomId === currentRoom.id && pendingUser;
  const showDraft = currentRoom && activeRoomId === currentRoom.id && assistantDraft;

  return (
    <main
      className="seven-app"
      dir={snapshot.direction}
      lang={snapshot.locale}
      data-theme={snapshot.effectiveTheme}
      data-reduced-motion={snapshot.reducedMotion ? "true" : "false"}
      data-keyboard={snapshot.keyboardVisible ? "visible" : "hidden"}
      data-kernel={kernel.snapshot().status}
    >
      <header className="seven-topbar">
        <button
          className="seven-icon-button"
          type="button"
          aria-label={t("Open chats", "فتح المحادثات")}
          onClick={() => shell.setSidebarOpen(!snapshot.sidebarOpen)}
        >☰</button>
        <div className="seven-brand">
          <strong>Seven</strong>
          <span>{t("Auto · Kilo Free", "تلقائي · Kilo مجاني")}</span>
        </div>
        <div className="seven-top-actions">
          <button className="seven-icon-button" type="button" onClick={cycleTheme} aria-label={t("Change theme", "تغيير المظهر")}>◐</button>
          <button className="seven-language" type="button" onClick={() => shell.setLocale(isAr ? "en" : "ar")}>{isAr ? "EN" : "ع"}</button>
        </div>
      </header>

      {snapshot.sidebarOpen && (
        <div className="seven-sidebar-layer">
          <button className="seven-sidebar-backdrop" aria-label={t("Close chats", "إغلاق المحادثات")} onClick={() => shell.setSidebarOpen(false)} />
          <aside className="seven-sidebar">
            <div className="seven-sidebar-head">
              <strong>{showMemory ? t("Memory", "الذاكرة") : t("Chats", "المحادثات")}</strong>
              <div className="seven-sidebar-actions">
                <button type="button" onClick={() => {
                  const next = !showMemory;
                  setShowMemory(next);
                  if (next) void refreshMemory();
                }}>{showMemory ? t("Chats", "المحادثات") : t("Memory", "الذاكرة")}</button>
                {!showMemory && <button type="button" onClick={() => void newChat()}>＋ {t("New", "جديدة")}</button>}
              </div>
            </div>
            {showMemory ? (
              <div className="seven-memory-list">
                <p className="seven-memory-note">{t(
                  "Seven stores only selected durable facts locally. Core items stay available; recall items are retrieved only when relevant.",
                  "يحفظ Seven حقائق دائمة مختارة محليًا فقط. تبقى عناصر Core متاحة، بينما تُسترجع عناصر Recall عند الحاجة."
                )}</p>
                {memoryBusy && memoryFacts.length === 0 ? (
                  <p className="seven-memory-empty">{t("Loading memory…", "جارٍ تحميل الذاكرة…")}</p>
                ) : memoryFacts.length === 0 ? (
                  <p className="seven-memory-empty">{t("No saved memory yet.", "لا توجد ذاكرة محفوظة بعد.")}</p>
                ) : memoryFacts.map((fact) => (
                  <article className="seven-memory-item" key={fact.id}>
                    <div className="seven-memory-meta">
                      <span>{fact.kind}</span>
                      <span>{fact.tier}</span>
                      <span>{fact.scope}</span>
                    </div>
                    <p>{fact.content}</p>
                    <button
                      type="button"
                      disabled={memoryBusy}
                      onClick={() => void forgetMemory(fact.id)}
                      aria-label={t("Forget this memory", "حذف هذه الذاكرة")}
                    >{t("Forget", "حذف")}</button>
                  </article>
                ))}
              </div>
            ) : (
              <div className="seven-room-list">
                {roomList.map((room) => (
                  <button
                    type="button"
                    key={room.id}
                    aria-current={currentRoom?.id === room.id ? "page" : undefined}
                    onClick={() => {
                      setCurrentRoom(room);
                      shell.setSidebarOpen(false);
                    }}
                  >
                    <span>{shortTitle(room)}</span>
                    <small>{room.messages.length} {t("messages", "رسالة")}</small>
                  </button>
                ))}
              </div>
            )}
          </aside>
        </div>
      )}

      <section className="seven-chat-shell">
        <div className="seven-mode-row" aria-label={t("Seven modes", "أوضاع Seven")}>
          <button type="button" aria-pressed={snapshot.activeWorkspace === "core"} onClick={() => shell.setWorkspace("core")}>{t("Chat", "دردشة")}</button>
          <button type="button" aria-pressed={snapshot.activeWorkspace === "research"} onClick={() => shell.setWorkspace("research")}>{t("Research", "بحث")}</button>
          <button type="button" aria-pressed={snapshot.activeWorkspace === "build"} onClick={() => shell.setWorkspace("build")}>{t("Build", "برمجة")}</button>
          <button type="button" aria-pressed={snapshot.activeWorkspace === "world"} onClick={() => shell.setWorkspace("world")}>{t("RPG", "RPG")}</button>
        </div>

        <div className="seven-thread" aria-live="polite">
          {booting ? (
            <div className="seven-empty"><h1>Seven</h1><p>{t("Restoring your chats…", "جارٍ استعادة محادثاتك…")}</p></div>
          ) : messages.length === 0 && !showPending ? (
            <div className="seven-empty">
              <div className="seven-orb">7</div>
              <h1>{t("What can I help with?", "كيف يمكنني مساعدتك؟")}</h1>
              <p>{t("Chat is now the center of Seven. Your rooms are stored locally on this device.", "أصبحت الدردشة الآن مركز Seven. تُحفظ محادثاتك محليًا على هذا الجهاز.")}</p>
              <div className="seven-suggestions">
                {[t("Explain a difficult topic simply", "اشرح موضوعًا صعبًا ببساطة"), t("Help me study today", "ساعدني في دراسة اليوم"), t("Plan a coding project", "خطط لمشروع برمجي")].map((suggestion) => (
                  <button key={suggestion} type="button" onClick={() => setInput(suggestion)}>{suggestion}</button>
                ))}
              </div>
            </div>
          ) : (
            <div className="seven-messages">
              {messages.map((message) => (
                <article key={message.id} className={`seven-message seven-message-${message.role}`}>
                  <span className="seven-message-label">{message.role === "user" ? t("You", "أنت") : "Seven"}</span>
                  <div>{message.content}</div>
                </article>
              ))}
              {showPending && (
                <article className="seven-message seven-message-user seven-pending">
                  <span className="seven-message-label">{t("You", "أنت")}</span>
                  <div>{pendingUser}</div>
                </article>
              )}
              {showDraft && (
                <article className="seven-message seven-message-assistant seven-streaming">
                  <span className="seven-message-label">Seven</span>
                  <div>{assistantDraft}<span className="seven-caret">▍</span></div>
                </article>
              )}
            </div>
          )}
        </div>

        {error && <div className="seven-error" role="alert">{error}</div>}

        <div className="seven-composer-wrap">
          <div className="seven-composer">
            <button className="seven-attach" type="button" aria-label={t("Attachments coming next", "المرفقات في الخطوة التالية")} title={t("Attachments coming next", "المرفقات في الخطوة التالية")}>＋</button>
            <textarea
              value={input}
              rows={1}
              maxLength={32_000}
              placeholder={t("Message Seven", "اكتب إلى Seven")}
              aria-label={t("Message Seven", "اكتب إلى Seven")}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void submit();
                }
              }}
            />
            {activeRun ? (
              <button className="seven-send seven-stop" type="button" onClick={() => activeRun.cancel("user-stop")} aria-label={t("Stop", "إيقاف")}>■</button>
            ) : (
              <button className="seven-send" type="button" disabled={!input.trim() || !currentRoom} onClick={() => void submit()} aria-label={t("Send", "إرسال")}>↑</button>
            )}
          </div>
          <div className="seven-composer-meta">
            <span>{t("Zero-key route · messages may be processed by the selected model provider.", "مسار بدون مفتاح · قد تتم معالجة الرسائل لدى مزود النموذج المحدد.")}</span>
          </div>
        </div>
      </section>
    </main>
  );
}
