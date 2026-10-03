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

function requireFiniteTime(value: number, field: string): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${field} must be a non-negative finite timestamp.`);
  }
  return value;
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
  const now = requireFiniteTime(options.now ?? Date.now(), "room timestamp");
  const title = options.title?.trim() || "New chat";
  const id =
    options.id === undefined
      ? crypto.randomUUID()
      : requireText(options.id, "room id");
  const modelId =
    options.modelId === undefined || options.modelId === null
      ? null
      : requireText(options.modelId, "model id");

  return Object.freeze({
    schemaVersion: 1 as const,
    id,
    title,
    modelId,
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
  const now = requireFiniteTime(options.now ?? Date.now(), "message timestamp");
  const id =
    options.id === undefined
      ? crypto.randomUUID()
      : requireText(options.id, "message id");

  if (room.messages.some((message) => message.id === id)) {
    throw new Error(`message id ${id} already exists in room ${room.id}.`);
  }

  const message: ChatMessage = Object.freeze({
    id,
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

export function withRoomModel(
  room: Room,
  modelId: string | null,
  now = Date.now(),
): Room {
  const normalizedModelId =
    modelId === null ? null : requireText(modelId, "model id");
  const timestamp = requireFiniteTime(now, "room timestamp");

  return Object.freeze({
    ...cloneRoom(room),
    modelId: normalizedModelId,
    updatedAt: Math.max(room.updatedAt, timestamp),
  });
}

export function isRoom(value: unknown): value is Room {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<Room>;

  if (
    candidate.schemaVersion !== 1 ||
    typeof candidate.id !== "string" ||
    candidate.id.trim().length === 0 ||
    typeof candidate.title !== "string" ||
    candidate.title.trim().length === 0 ||
    typeof candidate.createdAt !== "number" ||
    !Number.isFinite(candidate.createdAt) ||
    candidate.createdAt < 0 ||
    typeof candidate.updatedAt !== "number" ||
    !Number.isFinite(candidate.updatedAt) ||
    candidate.updatedAt < candidate.createdAt ||
    !Array.isArray(candidate.messages)
  ) {
    return false;
  }

  if (
    !(
      candidate.modelId === null ||
      (typeof candidate.modelId === "string" &&
        candidate.modelId.trim().length > 0)
    )
  ) {
    return false;
  }

  const ids = new Set<string>();
  return candidate.messages.every((message) => {
    if (!message || typeof message !== "object") return false;
    const item = message as Partial<ChatMessage>;
    if (
      typeof item.id !== "string" ||
      item.id.trim().length === 0 ||
      ids.has(item.id) ||
      (item.role !== "user" && item.role !== "assistant") ||
      typeof item.content !== "string" ||
      item.content.trim().length === 0 ||
      typeof item.createdAt !== "number" ||
      !Number.isFinite(item.createdAt) ||
      item.createdAt < candidate.createdAt! ||
      item.createdAt > candidate.updatedAt!
    ) {
      return false;
    }
    ids.add(item.id);
    return true;
  });
}
