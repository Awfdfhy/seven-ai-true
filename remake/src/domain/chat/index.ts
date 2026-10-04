import { SevenError } from "../../core/errors";

export type ChatRole = "user" | "assistant";
export type ChatMode = "quick" | "balanced" | "deep";

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
  mode?: ChatMode;
  messages: readonly ChatMessage[];
  createdAt: number;
  updatedAt: number;
}>;

export type CreateRoomOptions = Readonly<{
  id?: string;
  title?: string;
  modelId?: string | null;
  mode?: ChatMode;
  now?: number;
}>;

export type CommitMessageOptions = Readonly<{
  id?: string;
  role: ChatRole;
  content: string;
  now?: number;
}>;

function requireNonBlank(
  value: string,
  field: string,
  normalize: boolean,
): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new SevenError({
      code: "VALIDATION",
      message: `${field} must not be empty.`,
    });
  }
  return normalize ? value.trim() : value;
}

function requireFiniteTime(value: number, field: string): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new SevenError({
      code: "VALIDATION",
      message: `${field} must be a non-negative finite timestamp.`,
    });
  }
  return value;
}

function freezeMessageSnapshot(message: ChatMessage): ChatMessage {
  return Object.isFrozen(message)
    ? message
    : Object.freeze({ ...message });
}

function freezeMessagesSnapshot(
  messages: readonly ChatMessage[],
): readonly ChatMessage[] {
  return Object.freeze(messages.map(freezeMessageSnapshot));
}

export function cloneRoom(room: Room): Room {
  if (!isRoom(room)) {
    throw new SevenError({
      code: "VALIDATION",
      message: "Room failed schema validation.",
    });
  }
  return Object.freeze({
    ...room,
    messages:
      Object.isFrozen(room.messages) &&
      room.messages.every((message) => Object.isFrozen(message))
        ? room.messages
        : freezeMessagesSnapshot(room.messages),
  });
}

export function createRoom(options: CreateRoomOptions = {}): Room {
  if (!options || typeof options !== "object" || Array.isArray(options)) {
    throw new SevenError({
      code: "VALIDATION",
      message: "Create-room options must be an object.",
    });
  }
  const now = requireFiniteTime(options.now ?? Date.now(), "room timestamp");
  const title =
    options.title === undefined
      ? "New chat"
      : requireNonBlank(options.title, "room title", true);
  const id =
    options.id === undefined
      ? crypto.randomUUID()
      : requireNonBlank(options.id, "room id", true);
  const modelId =
    options.modelId === undefined || options.modelId === null
      ? null
      : requireNonBlank(options.modelId, "model id", true);
  const mode = options.mode ?? "balanced";
  if (mode !== "quick" && mode !== "balanced" && mode !== "deep") {
    throw new SevenError({
      code: "VALIDATION",
      message: "Chat mode must be quick, balanced, or deep.",
    });
  }

  return Object.freeze({
    schemaVersion: 1 as const,
    id,
    title,
    modelId,
    mode,
    messages: Object.freeze([]),
    createdAt: now,
    updatedAt: now,
  });
}

export function commitMessage(
  room: Room,
  options: CommitMessageOptions,
): Room {
  if (!isRoom(room)) {
    throw new SevenError({
      code: "VALIDATION",
      message: "Room failed schema validation before message commit.",
    });
  }
  if (!options || typeof options !== "object" || Array.isArray(options)) {
    throw new SevenError({
      code: "VALIDATION",
      message: "Message options must be an object.",
    });
  }
  const content = requireNonBlank(options.content, "message content", false);
  const requestedTime = requireFiniteTime(
    options.now ?? Date.now(),
    "message timestamp",
  );
  if (requestedTime < room.createdAt) {
    throw new SevenError({
      code: "VALIDATION",
      message: "Message timestamp cannot precede room creation.",
    });
  }
  if (options.role !== "user" && options.role !== "assistant") {
    throw new SevenError({
      code: "VALIDATION",
      message: "Message role must be user or assistant.",
    });
  }

  const now = Math.max(room.updatedAt, requestedTime);

  const id =
    options.id === undefined
      ? crypto.randomUUID()
      : requireNonBlank(options.id, "message id", true);

  if (room.messages.some((message) => message.id === id)) {
    throw new SevenError({
      code: "VALIDATION",
      message: `message id ${id} already exists in room ${room.id}.`,
    });
  }

  const message: ChatMessage = Object.freeze({
    id,
    role: options.role,
    content,
    createdAt: now,
  });

  const existingMessages =
    Object.isFrozen(room.messages) &&
    room.messages.every((existing) => Object.isFrozen(existing))
      ? room.messages
      : freezeMessagesSnapshot(room.messages);

  return Object.freeze({
    ...room,
    messages: Object.freeze([...existingMessages, message]),
    updatedAt: Math.max(room.updatedAt, now),
  });
}

export function withRoomMode(
  room: Room,
  mode: ChatMode,
  now = Date.now(),
): Room {
  if (!isRoom(room)) {
    throw new SevenError({
      code: "VALIDATION",
      message: "Room failed schema validation before mode update.",
    });
  }
  if (mode !== "quick" && mode !== "balanced" && mode !== "deep") {
    throw new SevenError({
      code: "VALIDATION",
      message: "Chat mode must be quick, balanced, or deep.",
    });
  }
  const timestamp = requireFiniteTime(now, "room timestamp");
  return Object.freeze({
    ...cloneRoom(room),
    mode,
    updatedAt: Math.max(room.updatedAt, timestamp),
  });
}

export function withRoomModel(
  room: Room,
  modelId: string | null,
  now = Date.now(),
): Room {
  if (!isRoom(room)) {
    throw new SevenError({
      code: "VALIDATION",
      message: "Room failed schema validation before model update.",
    });
  }
  const normalizedModelId =
    modelId === null ? null : requireNonBlank(modelId, "model id", true);
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
    candidate.id !== candidate.id.trim() ||
    typeof candidate.title !== "string" ||
    candidate.title.trim().length === 0 ||
    candidate.title !== candidate.title.trim() ||
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
        candidate.modelId.trim().length > 0 &&
        candidate.modelId === candidate.modelId.trim())
    )
  ) {
    return false;
  }
  if (
    candidate.mode !== undefined &&
    candidate.mode !== "quick" &&
    candidate.mode !== "balanced" &&
    candidate.mode !== "deep"
  ) {
    return false;
  }

  const ids = new Set<string>();
  let previousTime = candidate.createdAt;
  return candidate.messages.every((message) => {
    if (!message || typeof message !== "object") return false;
    const item = message as Partial<ChatMessage>;
    if (
      typeof item.id !== "string" ||
      item.id.trim().length === 0 ||
      item.id !== item.id.trim() ||
      ids.has(item.id) ||
      (item.role !== "user" && item.role !== "assistant") ||
      typeof item.content !== "string" ||
      item.content.trim().length === 0 ||
      typeof item.createdAt !== "number" ||
      !Number.isFinite(item.createdAt) ||
      item.createdAt < candidate.createdAt! ||
      item.createdAt > candidate.updatedAt! ||
      item.createdAt < previousTime
    ) {
      return false;
    }
    ids.add(item.id);
    previousTime = item.createdAt;
    return true;
  });
}
