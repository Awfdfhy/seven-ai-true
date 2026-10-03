export type ChatRole = "user" | "assistant";

export type ChatMessage = Readonly<{
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
}>;

export type Room = Readonly<{
  schemaVersion: 1;
  id: string;
  title: string;
  modelId: string | null;
  messages: readonly ChatMessage[];
  createdAt: number;
  updatedAt: number;
}>;

export type CreateRoomOptions = Readonly<{
  id?: string;
  title?: string;
  modelId?: string | null;
  now?: number;
}>;

export type CommitMessageOptions = Readonly<{
  id?: string;
  role: ChatRole;
  content: string;
  now?: number;
}>;

function requireText(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) throw new Error(`${field} must not be empty.`);
  return normalized;
}

function cloneMessage(message: ChatMessage): ChatMessage {
  return Object.freeze({ ...message });
}

export function cloneRoom(room: Room): Room {
  return Object.freeze({
    ...room,
    messages: Object.freeze(room.messages.map(cloneMessage)),
  });
}

export function createRoom(options: CreateRoomOptions = {}): Room {
  const now = options.now ?? Date.now();
  const title = options.title?.trim() || "New chat";
  return Object.freeze({
    schemaVersion: 1 as const,
    id: options.id ?? crypto.randomUUID(),
    title,
    modelId: options.modelId ?? null,
    messages: Object.freeze([]),
    createdAt: now,
    updatedAt: now,
  });
}

export function commitMessage(
  room: Room,
  options: CommitMessageOptions,
): Room {
  const content = requireText(options.content, "message content");
  const now = options.now ?? Date.now();
  const message: ChatMessage = Object.freeze({
    id: options.id ?? crypto.randomUUID(),
    role: options.role,
    content,
    createdAt: now,
  });

  return Object.freeze({
    ...room,
    messages: Object.freeze([...room.messages.map(cloneMessage), message]),
    updatedAt: Math.max(room.updatedAt, now),
  });
}

export function withRoomModel(room: Room, modelId: string | null): Room {
  return Object.freeze({
    ...cloneRoom(room),
    modelId,
    updatedAt: Date.now(),
  });
}

export function isRoom(value: unknown): value is Room {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<Room>;
  if (
    candidate.schemaVersion !== 1 ||
    typeof candidate.id !== "string" ||
    typeof candidate.title !== "string" ||
    typeof candidate.createdAt !== "number" ||
    typeof candidate.updatedAt !== "number" ||
    !Array.isArray(candidate.messages)
  ) {
    return false;
  }

  if (!(candidate.modelId === null || typeof candidate.modelId === "string")) {
    return false;
  }

  return candidate.messages.every((message) => {
    if (!message || typeof message !== "object") return false;
    const item = message as Partial<ChatMessage>;
    return (
      typeof item.id === "string" &&
      (item.role === "user" || item.role === "assistant") &&
      typeof item.content === "string" &&
      item.content.trim().length > 0 &&
      typeof item.createdAt === "number"
    );
  });
}
