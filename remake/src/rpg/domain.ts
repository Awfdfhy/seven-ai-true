import { SevenError } from "../core/errors";

export type TitleNamespace =
  | "episode"
  | "chapter"
  | "arc"
  | "side-story"
  | "special"
  | "what-if"
  | "filler"
  | "game"
  | "future";

export type RpgBranch = Readonly<{
  id: string;
  parentBranchId: string | null;
  label: string;
  createdAt: number;
}>;

export type RpgTitle = Readonly<{
  id: string;
  namespace: TitleNamespace;
  value: string;
}>;

export type RpgRelationship = Readonly<{
  fromId: string;
  toId: string;
  label: string;
  value: string;
}>;

export type RpgCanonSnapshot = Readonly<{
  schemaVersion: 1;
  id: string;
  packId: string;
  packVersion: string;
  worldSessionId: string;
  canonSessionId: string;
  activeBranchId: string;
  branches: readonly RpgBranch[];
  titles: readonly RpgTitle[];
  relationships: readonly RpgRelationship[];
  state: Readonly<Record<string, string>>;
  revision: number;
  checksum: string;
  updatedAt: number;
}>;

export type RpgChangeSet = Readonly<{
  expectedRevision: number;
  state?: Readonly<Record<string, string | null>>;
  upsertRelationships?: readonly RpgRelationship[];
  addTitles?: readonly RpgTitle[];
  createBranch?: Readonly<{
    id: string;
    label: string;
    activate: boolean;
  }>;
}>;

const MAX_STATE_ENTRIES = 512;
const MAX_RELATIONSHIPS = 1024;
const MAX_TITLES = 512;
const MAX_BRANCHES = 128;

function canonical(value: unknown, field: string, max = 512): string {
  if (
    typeof value !== "string" ||
    !value.trim() ||
    value !== value.trim() ||
    value.length > max
  ) {
    throw new SevenError({ code: "VALIDATION", message: `${field} must be canonical.` });
  }
  return value;
}

function timestamp(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new SevenError({ code: "VALIDATION", message: `${field} is invalid.` });
  }
  return value;
}

function revision(value: unknown, field: string): number {
  if (!Number.isSafeInteger(value) || (value as number) < 0) {
    throw new SevenError({ code: "VALIDATION", message: `${field} must be a non-negative safe integer.` });
  }
  return value as number;
}

function cloneBranch(branch: RpgBranch): RpgBranch {
  return Object.freeze({
    id: canonical(branch.id, "Branch id"),
    parentBranchId: branch.parentBranchId === null ? null : canonical(branch.parentBranchId, "Parent branch id"),
    label: canonical(branch.label, "Branch label"),
    createdAt: timestamp(branch.createdAt, "Branch createdAt"),
  });
}

function cloneTitle(title: RpgTitle): RpgTitle {
  const namespaces: readonly TitleNamespace[] = [
    "episode","chapter","arc","side-story","special","what-if","filler","game","future",
  ];
  if (!namespaces.includes(title.namespace)) {
    throw new SevenError({ code: "VALIDATION", message: "RPG title namespace is invalid." });
  }
  return Object.freeze({
    id: canonical(title.id, "Title id"),
    namespace: title.namespace,
    value: canonical(title.value, "Title value", 1024),
  });
}

function cloneRelationship(value: RpgRelationship): RpgRelationship {
  return Object.freeze({
    fromId: canonical(value.fromId, "Relationship fromId"),
    toId: canonical(value.toId, "Relationship toId"),
    label: canonical(value.label, "Relationship label"),
    value: canonical(value.value, "Relationship value", 2048),
  });
}

function cloneState(state: Readonly<Record<string, string>>): Readonly<Record<string, string>> {
  if (!state || typeof state !== "object" || Array.isArray(state)) {
    throw new SevenError({ code: "VALIDATION", message: "RPG state must be an object." });
  }
  const entries = Object.entries(state);
  if (entries.length > MAX_STATE_ENTRIES) {
    throw new SevenError({ code: "VALIDATION", message: "RPG state exceeds the safe entry limit." });
  }
  const output: Record<string, string> = {};
  for (const [key, value] of entries) {
    const normalizedKey = canonical(key, "RPG state key", 256);
    output[normalizedKey] = canonical(value, "RPG state value", 8192);
  }
  return Object.freeze(output);
}

export function cloneRpgSnapshot(snapshot: RpgCanonSnapshot): RpgCanonSnapshot {
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot) || snapshot.schemaVersion !== 1) {
    throw new SevenError({ code: "VALIDATION", message: "RPG snapshot is malformed." });
  }
  if (!Array.isArray(snapshot.branches) || snapshot.branches.length === 0 || snapshot.branches.length > MAX_BRANCHES) {
    throw new SevenError({ code: "VALIDATION", message: "RPG branches are invalid." });
  }
  if (!Array.isArray(snapshot.titles) || snapshot.titles.length > MAX_TITLES) {
    throw new SevenError({ code: "VALIDATION", message: "RPG titles are invalid." });
  }
  if (!Array.isArray(snapshot.relationships) || snapshot.relationships.length > MAX_RELATIONSHIPS) {
    throw new SevenError({ code: "VALIDATION", message: "RPG relationships are invalid." });
  }
  const branches = Object.freeze(snapshot.branches.map(cloneBranch));
  const branchIds = new Set(branches.map((branch) => branch.id));
  if (branchIds.size !== branches.length || !branchIds.has(snapshot.activeBranchId)) {
    throw new SevenError({ code: "VALIDATION", message: "RPG branch identities are duplicated or active branch is missing." });
  }
  for (const branch of branches) {
    if (branch.parentBranchId !== null && !branchIds.has(branch.parentBranchId)) {
      throw new SevenError({ code: "VALIDATION", message: "RPG branch parent does not exist." });
    }
  }
  const titles = Object.freeze(snapshot.titles.map(cloneTitle));
  if (new Set(titles.map((title) => title.id)).size !== titles.length) {
    throw new SevenError({ code: "VALIDATION", message: "RPG title ids must be unique." });
  }
  const relationships = Object.freeze(snapshot.relationships.map(cloneRelationship));
  const relationshipKeys = relationships.map((item) => `${item.fromId}\u0000${item.toId}\u0000${item.label}`);
  if (new Set(relationshipKeys).size !== relationshipKeys.length) {
    throw new SevenError({ code: "VALIDATION", message: "RPG relationship keys must be unique." });
  }
  const checksum = canonical(snapshot.checksum, "RPG checksum", 128);
  if (!/^[a-f0-9]{64}$/.test(checksum)) {
    throw new SevenError({ code: "VALIDATION", message: "RPG checksum must be SHA-256 hex." });
  }
  return Object.freeze({
    schemaVersion: 1 as const,
    id: canonical(snapshot.id, "RPG snapshot id"),
    packId: canonical(snapshot.packId, "RPG pack id"),
    packVersion: canonical(snapshot.packVersion, "RPG pack version"),
    worldSessionId: canonical(snapshot.worldSessionId, "RPG world session id"),
    canonSessionId: canonical(snapshot.canonSessionId, "RPG canon session id"),
    activeBranchId: canonical(snapshot.activeBranchId, "RPG active branch id"),
    branches,
    titles,
    relationships,
    state: cloneState(snapshot.state),
    revision: revision(snapshot.revision, "RPG revision"),
    checksum,
    updatedAt: timestamp(snapshot.updatedAt, "RPG updatedAt"),
  });
}

export function createInitialRpgSnapshot(input: Readonly<{
  id: string;
  packId: string;
  packVersion: string;
  worldSessionId: string;
  canonSessionId: string;
  rootBranchId: string;
  rootBranchLabel?: string;
  checksum: string;
  now: number;
}>): RpgCanonSnapshot {
  const root = Object.freeze({
    id: canonical(input.rootBranchId, "Root branch id"),
    parentBranchId: null,
    label: canonical(input.rootBranchLabel ?? "main", "Root branch label"),
    createdAt: timestamp(input.now, "RPG createdAt"),
  });
  return cloneRpgSnapshot({
    schemaVersion: 1,
    id: canonical(input.id, "RPG snapshot id"),
    packId: canonical(input.packId, "RPG pack id"),
    packVersion: canonical(input.packVersion, "RPG pack version"),
    worldSessionId: canonical(input.worldSessionId, "RPG world session id"),
    canonSessionId: canonical(input.canonSessionId, "RPG canon session id"),
    activeBranchId: root.id,
    branches: [root],
    titles: [],
    relationships: [],
    state: {},
    revision: 0,
    checksum: input.checksum,
    updatedAt: input.now,
  });
}

export function applyRpgChangeSet(
  current: RpgCanonSnapshot,
  changeSet: RpgChangeSet,
  nextChecksum: string,
  now: number,
): RpgCanonSnapshot {
  const snapshot = cloneRpgSnapshot(current);
  if (!changeSet || typeof changeSet !== "object" || Array.isArray(changeSet)) {
    throw new SevenError({ code: "VALIDATION", message: "RPG change set must be an object." });
  }
  if (revision(changeSet.expectedRevision, "RPG expectedRevision") !== snapshot.revision) {
    throw new SevenError({
      code: "STORAGE",
      message: "RPG change set is stale.",
      retryable: true,
      details: { expectedRevision: changeSet.expectedRevision, actualRevision: snapshot.revision },
    });
  }

  const state: Record<string, string> = { ...snapshot.state };
  if (changeSet.state !== undefined) {
    if (!changeSet.state || typeof changeSet.state !== "object" || Array.isArray(changeSet.state)) {
      throw new SevenError({ code: "VALIDATION", message: "RPG state changes must be an object." });
    }
    for (const [key, value] of Object.entries(changeSet.state)) {
      const normalizedKey = canonical(key, "RPG state key", 256);
      if (value === null) delete state[normalizedKey];
      else state[normalizedKey] = canonical(value, "RPG state value", 8192);
    }
  }
  if (Object.keys(state).length > MAX_STATE_ENTRIES) {
    throw new SevenError({ code: "VALIDATION", message: "RPG state change exceeds the safe entry limit." });
  }

  const relationshipMap = new Map(
    snapshot.relationships.map((item) => [`${item.fromId}\u0000${item.toId}\u0000${item.label}`, item]),
  );
  for (const item of changeSet.upsertRelationships ?? []) {
    const normalized = cloneRelationship(item);
    relationshipMap.set(`${normalized.fromId}\u0000${normalized.toId}\u0000${normalized.label}`, normalized);
  }
  if (relationshipMap.size > MAX_RELATIONSHIPS) {
    throw new SevenError({ code: "VALIDATION", message: "RPG relationships exceed the safe limit." });
  }

  const titles = [...snapshot.titles];
  const titleIds = new Set(titles.map((title) => title.id));
  for (const title of changeSet.addTitles ?? []) {
    const normalized = cloneTitle(title);
    if (titleIds.has(normalized.id)) {
      throw new SevenError({ code: "VALIDATION", message: "RPG title id already exists." });
    }
    titleIds.add(normalized.id);
    titles.push(normalized);
  }
  if (titles.length > MAX_TITLES) {
    throw new SevenError({ code: "VALIDATION", message: "RPG titles exceed the safe limit." });
  }

  const branches = [...snapshot.branches];
  let activeBranchId = snapshot.activeBranchId;
  if (changeSet.createBranch !== undefined) {
    const id = canonical(changeSet.createBranch.id, "RPG new branch id");
    if (branches.some((branch) => branch.id === id)) {
      throw new SevenError({ code: "VALIDATION", message: "RPG branch id already exists." });
    }
    if (typeof changeSet.createBranch.activate !== "boolean") {
      throw new SevenError({ code: "VALIDATION", message: "RPG branch activate flag is invalid." });
    }
    branches.push(Object.freeze({
      id,
      parentBranchId: snapshot.activeBranchId,
      label: canonical(changeSet.createBranch.label, "RPG branch label"),
      createdAt: timestamp(now, "RPG branch createdAt"),
    }));
    if (changeSet.createBranch.activate) activeBranchId = id;
  }
  if (branches.length > MAX_BRANCHES) {
    throw new SevenError({ code: "VALIDATION", message: "RPG branches exceed the safe limit." });
  }

  return cloneRpgSnapshot({
    ...snapshot,
    activeBranchId,
    branches,
    titles,
    relationships: [...relationshipMap.values()],
    state,
    revision: snapshot.revision + 1,
    checksum: nextChecksum,
    updatedAt: timestamp(now, "RPG updatedAt"),
  });
}

export function canonicalRpgChecksumPayload(snapshot: Omit<RpgCanonSnapshot, "checksum">): string {
  const stateEntries = Object.entries(snapshot.state).sort(([a], [b]) => a.localeCompare(b));
  return JSON.stringify({
    schemaVersion: snapshot.schemaVersion,
    id: snapshot.id,
    packId: snapshot.packId,
    packVersion: snapshot.packVersion,
    worldSessionId: snapshot.worldSessionId,
    canonSessionId: snapshot.canonSessionId,
    activeBranchId: snapshot.activeBranchId,
    branches: snapshot.branches,
    titles: snapshot.titles,
    relationships: snapshot.relationships,
    state: stateEntries,
    revision: snapshot.revision,
    updatedAt: snapshot.updatedAt,
  });
}
