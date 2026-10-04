import { useEffect, useState, useSyncExternalStore } from "react";
import type { SevenRuntime } from "../kernel/seven-runtime";
import { commitMessage, createRoom, withRoomDeepThink, withRoomMode, type ChatMode, type Room } from "../domain/chat";
import type { ChatRun } from "../application/chat/chat-service";
import { type ThemePreference } from "./shell/shell-store";
import type { MemoryFact } from "../domain/memory/fabric";
import type { PendingToolAction } from "../application/tools/approval-coordinator";

const THEMES: readonly ThemePreference[] = ["auto", "light", "dark"];

function shortTitle(room: Room): string {
  if (room.title !== "New chat") return room.title;
  const first = room.messages.find((message) => message.role === "user")?.content.trim();
  return first ? first.slice(0, 42) : room.title;
}

export function App({ runtime }: Readonly<{ runtime: SevenRuntime }>) {
  const { shell, theme, kernel, rooms, chat, chatTransport, memory, attachments, toolApprovalCoordinator } = runtime;
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
  const [memoryNotice, setMemoryNotice] = useState<string | null>(null);
  const [editingMemoryId, setEditingMemoryId] = useState<string | null>(null);
  const [editingMemoryText, setEditingMemoryText] = useState("");
  const [pendingToolAction, setPendingToolAction] = useState<PendingToolAction | null>(null);
  const [pendingToolQuery, setPendingToolQuery] = useState<string | null>(null);
  const [toolActionBusy, setToolActionBusy] = useState(false);
  const [toolActionNotice, setToolActionNotice] = useState<string | null>(null);
  const [attachmentBusy, setAttachmentBusy] = useState(false);
  const [attachmentNotice, setAttachmentNotice] = useState<string | null>(null);
  const isAr = snapshot.locale === "ar";
  const t = (en: string, ar: string) => isAr ? ar : en;
  const workspaceIntegrated = snapshot.activeWorkspace === "core";

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

  const saveMemoryEdit = async (fact: MemoryFact) => {
    if (!currentRoom || memoryBusy) return;
    const next = editingMemoryText.trim();
    if (!next) return;
    setMemoryBusy(true);
    setMemoryNotice(null);
    try {
      await memory.updateMemory(fact.id, currentRoom.id, { content: next });
      setMemoryFacts(await memory.listActive(currentRoom.id));
      setEditingMemoryId(null);
      setEditingMemoryText("");
      setMemoryNotice(t("Memory corrected.", "تم تصحيح الذاكرة."));
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setMemoryBusy(false);
    }
  };

  const toggleMemoryTier = async (fact: MemoryFact) => {
    if (!currentRoom || memoryBusy) return;
    setMemoryBusy(true);
    setMemoryNotice(null);
    try {
      await memory.updateMemory(
        fact.id,
        currentRoom.id,
        { tier: fact.tier === "core" ? "recall" : "core" },
      );
      setMemoryFacts(await memory.listActive(currentRoom.id));
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setMemoryBusy(false);
    }
  };

  const exportMemory = async () => {
    if (memoryBusy) return;
    setMemoryBusy(true);
    setMemoryNotice(null);
    try {
      const archive = await memory.exportArchive();
      const blob = new Blob([JSON.stringify(archive, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `seven-memory-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 0);
      setMemoryNotice(t("Memory backup exported.", "تم تصدير نسخة الذاكرة."));
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setMemoryBusy(false);
    }
  };

  const restoreMemory = async (file: File | null) => {
    if (!file || memoryBusy) return;
    setMemoryBusy(true);
    setMemoryNotice(null);
    try {
      const raw = JSON.parse(await file.text()) as unknown;
      const result = await memory.restoreArchive(raw);
      if (currentRoom) setMemoryFacts(await memory.listActive(currentRoom.id));
      setMemoryNotice(t(
        `Restored ${result.facts} memories.`,
        `تمت استعادة ${result.facts} ذاكرة.`,
      ));
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setMemoryBusy(false);
    }
  };

  const clearAllMemory = async () => {
    if (memoryBusy) return;
    const confirmed = window.confirm(t(
      "Delete all saved Seven memory on this device? This cannot be undone unless you exported a backup.",
      "حذف كل ذاكرة Seven المحفوظة على هذا الجهاز؟ لا يمكن التراجع إلا إذا صدّرت نسخة احتياطية.",
    ));
    if (!confirmed) return;
    setMemoryBusy(true);
    setMemoryNotice(null);
    try {
      await memory.clearAll();
      setMemoryFacts([]);
      setMemoryNotice(t("All saved memory was deleted.", "تم حذف كل الذاكرة المحفوظة."));
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setMemoryBusy(false);
    }
  };

  const ingestTextAttachment = async (file: File | null) => {
    if (!file || !currentRoom || attachmentBusy || !workspaceIntegrated) return;
    setAttachmentBusy(true);
    setAttachmentNotice(null);
    setError(null);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const record = await attachments.ingest({
        roomId: currentRoom.id,
        name: file.name,
        declaredMimeType: "text/plain",
        bytes,
      }).result;
      setAttachmentNotice(t(
        `${record.name} attached to this chat and available as context.`,
        `تم إرفاق ${record.name} بهذه المحادثة وأصبح متاحًا ضمن السياق.`,
      ));
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setAttachmentBusy(false);
    }
  };

  const setDeepThink = async (enabled: boolean) => {
    if (!currentRoom || activeRun) return;
    try {
      const updated = withRoomDeepThink(currentRoom, enabled);
      await rooms.put(updated);
      setCurrentRoom(updated);
      setRoomList((existing) =>
        existing.map((room) => room.id === updated.id ? updated : room),
      );
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : String(reason));
    }
  };

  const setChatMode = async (mode: ChatMode) => {
    if (!currentRoom || activeRun) return;
    try {
      const updated = withRoomMode(currentRoom, mode);
      await rooms.put(updated);
      setCurrentRoom(updated);
      setRoomList((existing) =>
        existing.map((room) => room.id === updated.id ? updated : room),
      );
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : String(reason));
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

  const recordToolActionTurn = async (userText: string, assistantText: string) => {
    if (!currentRoom) return;
    const latest = await rooms.get(currentRoom.id);
    if (!latest) return;
    const withUser = commitMessage(latest, { role: "user", content: userText });
    const completed = commitMessage(withUser, { role: "assistant", content: assistantText });
    await rooms.put(completed);
    setCurrentRoom(completed);
    await refreshRooms(completed.id);
  };

  const approveToolAction = async () => {
    if (!pendingToolAction || toolActionBusy) return;
    const action = pendingToolAction;
    const query = pendingToolQuery ?? action.title;
    setToolActionBusy(true);
    setError(null);
    try {
      const result = await toolApprovalCoordinator.approve(action.actionId);
      if (result.status !== "succeeded") {
        throw new Error(
          result.status === "effect_unknown"
            ? t("The action may have started, but Seven cannot safely confirm its final state.", "قد يكون الإجراء قد بدأ، لكن Seven لا يستطيع تأكيد حالته النهائية بأمان.")
            : t("The approved action could not be completed safely.", "تعذر إكمال الإجراء الموافق عليه بأمان."),
        );
      }
      const message = action.toolId === "memory.forget"
        ? t("The selected memory was forgotten.", "تم حذف الذاكرة المحددة.")
        : ((action.args.tier === "core")
          ? t("The selected memory is now pinned as Core memory.", "تم تثبيت الذاكرة المحددة كذاكرة Core.")
          : t("The selected memory now uses Recall mode.", "أصبحت الذاكرة المحددة في وضع Recall."));
      setPendingToolAction(null);
      setPendingToolQuery(null);
      setToolActionNotice(message);
      await recordToolActionTurn(query, message);
      await refreshMemory();
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setToolActionBusy(false);
    }
  };

  const rejectToolAction = () => {
    if (!pendingToolAction || toolActionBusy) return;
    toolApprovalCoordinator.reject(pendingToolAction.actionId);
    setPendingToolAction(null);
    setPendingToolQuery(null);
    setToolActionNotice(t("Action cancelled.", "تم إلغاء الإجراء."));
  };

  const submit = async () => {
    const content = input.trim();
    if (!currentRoom || !content || activeRun || pendingToolAction) return;
    setError(null);
    if (!workspaceIntegrated) {
      setError(t(
        "This workspace is isolated until its production integration adapter is verified. The request was not sent to normal Chat.",
        "مساحة العمل هذه معزولة حتى يتم التحقق من محول التكامل الإنتاجي الخاص بها. لم يتم إرسال الطلب إلى الدردشة العادية.",
      ));
      return;
    }
    setToolActionNotice(null);

    try {
      const action = await toolApprovalCoordinator.propose({
        roomId: currentRoom.id,
        taskId: `approval:${crypto.randomUUID()}`,
        query: content,
      });
      if (action) {
        setInput("");
        setPendingToolAction(action);
        setPendingToolQuery(content);
        return;
      }
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : String(reason));
      return;
    }

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
                <div className="seven-memory-tools">
                  <button type="button" disabled={memoryBusy} onClick={() => void exportMemory()}>
                    {t("Export", "تصدير")}
                  </button>
                  <label className="seven-memory-import">
                    <span>{t("Restore", "استعادة")}</span>
                    <input
                      type="file"
                      accept="application/json,.json"
                      disabled={memoryBusy}
                      onChange={(event) => {
                        const file = event.currentTarget.files?.[0] ?? null;
                        void restoreMemory(file);
                        event.currentTarget.value = "";
                      }}
                    />
                  </label>
                  <button className="seven-memory-danger" type="button" disabled={memoryBusy} onClick={() => void clearAllMemory()}>
                    {t("Delete all", "حذف الكل")}
                  </button>
                </div>
                {memoryNotice && <p className="seven-memory-notice" role="status">{memoryNotice}</p>}
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
                      <span>{fact.source.origin ?? "chat"}</span>
                    </div>
                    {editingMemoryId === fact.id ? (
                      <div className="seven-memory-editor">
                        <textarea
                          value={editingMemoryText}
                          maxLength={1200}
                          rows={3}
                          disabled={memoryBusy}
                          aria-label={t("Edit memory", "تعديل الذاكرة")}
                          onChange={(event) => setEditingMemoryText(event.target.value)}
                        />
                        <div className="seven-memory-actions">
                          <button type="button" disabled={memoryBusy || !editingMemoryText.trim()} onClick={() => void saveMemoryEdit(fact)}>
                            {t("Save", "حفظ")}
                          </button>
                          <button type="button" disabled={memoryBusy} onClick={() => {
                            setEditingMemoryId(null);
                            setEditingMemoryText("");
                          }}>{t("Cancel", "إلغاء")}</button>
                        </div>
                      </div>
                    ) : (
                      <p>{fact.content}</p>
                    )}
                    <div className="seven-memory-source">
                      {t("Updated", "آخر تحديث")}: {new Date(fact.updatedAt).toLocaleDateString(isAr ? "ar-IQ" : "en-US")}
                    </div>
                    {editingMemoryId !== fact.id && (
                      <div className="seven-memory-actions">
                        <button type="button" disabled={memoryBusy} onClick={() => {
                          setEditingMemoryId(fact.id);
                          setEditingMemoryText(fact.content);
                        }}>{t("Edit", "تعديل")}</button>
                        <button type="button" disabled={memoryBusy} onClick={() => void toggleMemoryTier(fact)}>
                          {fact.tier === "core" ? t("Unpin", "إلغاء التثبيت") : t("Pin", "تثبيت")}
                        </button>
                        <button
                          className="seven-memory-danger"
                          type="button"
                          disabled={memoryBusy}
                          onClick={() => void forgetMemory(fact.id)}
                          aria-label={t("Forget this memory", "حذف هذه الذاكرة")}
                        >{t("Forget", "حذف")}</button>
                      </div>
                    )}
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
        <div className="seven-mode-row" aria-label={t("Seven workspaces", "مساحات Seven")}>
          <button type="button" aria-pressed={snapshot.activeWorkspace === "core"} onClick={() => shell.setWorkspace("core")}>{t("Chat", "دردشة")}</button>
          <button type="button" aria-pressed={snapshot.activeWorkspace === "research"} onClick={() => shell.setWorkspace("research")}>{t("Research", "بحث")}</button>
          <button type="button" aria-pressed={snapshot.activeWorkspace === "build"} onClick={() => shell.setWorkspace("build")}>{t("Build", "برمجة")}</button>
          <button type="button" aria-pressed={snapshot.activeWorkspace === "world"} onClick={() => shell.setWorkspace("world")}>{t("RPG", "RPG")}</button>
        </div>
        {snapshot.activeWorkspace === "core" && currentRoom && (
          <div className="seven-mode-row" aria-label={t("Model routing mode", "وضع توجيه النموذج")}>
            {(["quick", "balanced", "deep"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                disabled={!!activeRun}
                aria-pressed={(currentRoom.mode ?? "balanced") === mode}
                onClick={() => void setChatMode(mode)}
              >
                {mode === "quick"
                  ? t("Quick", "سريع")
                  : mode === "balanced"
                    ? t("Balanced", "متوازن")
                    : t("Deep", "عميق")}
              </button>
            ))}
            <button
              type="button"
              disabled={!!activeRun}
              aria-pressed={currentRoom.deepThink === true}
              onClick={() => void setDeepThink(currentRoom.deepThink !== true)}
            >
              {t("Deep Think", "تفكير عميق")}
            </button>
          </div>
        )}

        {!workspaceIntegrated && (
          <div className="seven-tool-notice" role="status">
            {t(
              "Integration safety gate: this workspace cannot silently fall back to normal Chat.",
              "بوابة أمان التكامل: لا يمكن لمساحة العمل هذه الرجوع بصمت إلى الدردشة العادية.",
            )}
          </div>
        )}

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

        {pendingToolAction && (
          <section className="seven-tool-approval" aria-live="polite" aria-label={t("Tool approval", "موافقة على أداة")}>
            <div className="seven-tool-approval-head">
              <strong>{pendingToolAction.risk === "destructive" ? t("Confirm destructive action", "تأكيد إجراء حذفي") : t("Confirm action", "تأكيد الإجراء")}</strong>
              <span>{pendingToolAction.toolId}</span>
            </div>
            <p className="seven-tool-approval-title">{pendingToolAction.title}</p>
            <div className="seven-tool-preview">
              <small>{t("Exact memory target", "الذاكرة المستهدفة بالضبط")}</small>
              <p>{pendingToolAction.memoryPreview}</p>
            </div>
            <p className="seven-tool-approval-note">{t(
              "Seven will execute only this exact approved action. If the memory changes before execution, the action will be refused.",
              "سينفذ Seven هذا الإجراء الموافق عليه بالضبط فقط. إذا تغيرت الذاكرة قبل التنفيذ فسيتم رفض الإجراء."
            )}</p>
            <div className="seven-tool-approval-actions">
              <button type="button" disabled={toolActionBusy} onClick={() => void approveToolAction()}>
                {toolActionBusy ? t("Working…", "جارٍ التنفيذ…") : t("Approve", "موافقة")}
              </button>
              <button type="button" disabled={toolActionBusy} onClick={rejectToolAction}>
                {t("Cancel", "إلغاء")}
              </button>
            </div>
          </section>
        )}
        {toolActionNotice && !pendingToolAction && (
          <div className="seven-tool-notice" role="status">{toolActionNotice}</div>
        )}
        {attachmentNotice && (
          <div className="seven-tool-notice" role="status">{attachmentNotice}</div>
        )}

        <div className="seven-composer-wrap">
          <div className="seven-composer">
            <label className="seven-attach" aria-label={t("Attach text file", "إرفاق ملف نصي")} title={t("Attach UTF-8 text file", "إرفاق ملف نصي UTF-8")}>
              ＋
              <input
                type="file"
                accept="text/plain,.txt,.md,.csv,.json,.log"
                disabled={attachmentBusy || !currentRoom || !workspaceIntegrated}
                style={{ display: "none" }}
                onChange={(event) => {
                  const file = event.currentTarget.files?.[0] ?? null;
                  void ingestTextAttachment(file);
                  event.currentTarget.value = "";
                }}
              />
            </label>
            <textarea
              value={input}
              rows={1}
              disabled={toolActionBusy || !!pendingToolAction || !workspaceIntegrated}
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
              <button className="seven-send" type="button" disabled={!input.trim() || !currentRoom || toolActionBusy || !!pendingToolAction || !workspaceIntegrated} onClick={() => void submit()} aria-label={t("Send", "إرسال")}>↑</button>
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
