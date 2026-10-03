import { describe, expect, it } from "vitest";
import { GitHubAuthService } from "../src/github/github-auth-service";
import { AndroidPlatformService } from "../src/application/android/android-platform-service";
import { AndroidBridgeClient } from "../src/platform/android/android-bridge";
import { TaskManager } from "../src/core/task-manager";
import { ChatService, type ChatTransport } from "../src/application/chat/chat-service";
import { AttachmentService } from "../src/application/attachments/attachment-service";
import { InMemoryRoomRepository } from "../src/storage/room-repository";
import { InMemoryAttachmentRepository } from "../src/storage/attachment-repository";
import { createRoom, commitMessage } from "../src/domain/chat";
import { canonicalPayloadDescriptor } from "../src/release/release-assurance";
import { canonicalRpgChecksumPayload } from "../src/rpg/domain";

function deferred<T>() {
  let resolve!: (v: T) => void;
  const promise = new Promise<T>((r) => { resolve = r; });
  return { promise, resolve };
}

describe("P1 github disconnect resurrection", () => {
  it("probe", async () => {
    const gate = deferred<{ accessToken: string; expiresAt: number; scopes: string[] }>();
    let calls = 0;
    const auth = new GitHubAuthService({
      refresh: () => { calls += 1; return calls === 1 ? gate.promise : Promise.resolve({ accessToken: "t2", expiresAt: 10_000_000, scopes: ["repo"] }); },
      revoke: async () => {},
    }, () => 0, 0);
    const inflight = auth.withAccessToken(new AbortController().signal, async (t) => t);
    await Promise.resolve(); await Promise.resolve();
    await auth.disconnect();
    gate.resolve({ accessToken: "t1", expiresAt: 9_000_000, scopes: ["repo"] });
    console.log("P1 inflight outcome:", await inflight.then(() => "RESOLVED-WITH-STALE-TOKEN", (e) => "rejected:" + (e as Error).name));
    console.log("P1 snapshot after late refresh:", JSON.stringify(auth.snapshot()));
    const again = await auth.withAccessToken(new AbortController().signal, async (t) => t).catch((e) => "err:" + (e as Error).name);
    console.log("P1 token handed out after disconnect:", again, "refreshCalls:", calls);
    expect(true).toBe(true);
  });
});

describe("P2 SAF release vs in-flight persist", () => {
  it("probe", async () => {
    const tasks = new TaskManager();
    const calls: string[] = [];
    const gate = deferred<void>();
    const transport = {
      invoke(request: { requestId: string; method: string; payload: unknown }) {
        calls.push(request.method);
        if (request.method === "saf.persistGrant") {
          return gate.promise.then(() => ({ requestId: request.requestId, result: { ok: true as const, value: { schemaVersion: 1, uri: (request.payload as any).uri, read: (request.payload as any).read, write: false, persisted: true, issuedAt: 5 } } }));
        }
        return Promise.resolve({ requestId: request.requestId, result: { ok: true as const, value: { released: true } } });
      },
      cancel: () => {},
    };
    const service = new AndroidPlatformService(tasks, new AndroidBridgeClient(transport as any));
    const uri = "content://com.example/docs/1";
    const persist = service.persistSafGrant({ uri, read: true, write: false, persisted: false, issuedAt: 1 });
    await Promise.resolve(); await Promise.resolve();
    const release = service.releaseSafGrant(uri);
    console.log("P2 release result:", await release.result.catch((e) => "err:" + (e as Error).name));
    gate.resolve();
    console.log("P2 persist result:", await persist.result.then((g) => "grant persisted:" + g.persisted, (e) => "err:" + (e as Error).name));
    console.log("P2 call order:", calls.join(","));
    expect(true).toBe(true);
  });
});

describe("P3 chat send blocked by attachment ingest", () => {
  it("probe", async () => {
    const tasks = new TaskManager();
    const room = commitMessage(createRoom({ id: "room-1", now: 0 }), { role: "user", content: "hi", now: 1 });
    const rooms = new InMemoryRoomRepository([room]);
    const chat = new ChatService(tasks, rooms);
    const attachments = new AttachmentService(tasks, new InMemoryAttachmentRepository(), { load: async () => ({ parse: async () => { await new Promise(() => {}); return "x"; } }) } as any);
    const ingest = attachments.ingest({ roomId: "room-1", name: "a.txt", declaredMimeType: "text/plain", bytes: new TextEncoder().encode("hello") });
    await Promise.resolve(); await Promise.resolve();
    const transport: ChatTransport = { async *stream() { yield "answer"; } };
    const outcome = await chat.send("room-1", "second", transport).then((r) => r.result.then(() => "SEND OK", (e) => "send failed:" + (e as Error).name), (e) => "SEND REJECTED: " + (e as any).code + " / " + (e as Error).message);
    console.log("P3 outcome:", outcome);
    console.log("P3 active tasks:", JSON.stringify(tasks.listActive("room-1").map((t) => ({ kind: t.kind, status: t.status }))));
    void ingest;
    expect(true).toBe(true);
  });
});

describe("P4 locale collation determinism", () => {
  it("probe", () => {
    const paths = ["assets/Chunk-aa.js", "assets/app.js", "assets/ångström.js", "assets/zz.js"];
    const a = paths.slice().sort((x, y) => x.localeCompare(y));
    const b = paths.slice().sort((x, y) => (x < y ? -1 : x > y ? 1 : 0));
    console.log("P4 localeCompare:", JSON.stringify(a));
    console.log("P4 codeUnit     :", JSON.stringify(b));
    const hash = canonicalPayloadDescriptor({ artifactId: "seven.remake", version: "3.0.0", files: [
      { path: "assets/Chunk-aa.js", sha256: "a".repeat(64), sizeBytes: 1 },
      { path: "assets/app.js", sha256: "b".repeat(64), sizeBytes: 2 },
      { path: "assets/ångström.js", sha256: "c".repeat(64), sizeBytes: 3 },
    ]});
    console.log("P4 payload descriptor sha source length:", hash.length, hash.slice(0, 80));
    const snap = canonicalRpgChecksumPayload({ schemaVersion: 1, id: "x", packId: "p", packVersion: "1", worldSessionId: "w", canonSessionId: "c", activeBranchId: "b", branches: [], titles: [], relationships: [], state: { zebra: "1", "ängel": "2", apple: "3", "Zebra": "4" }, revision: 1, updatedAt: 0 } as any);
    console.log("P4 rpg checksum:", snap.slice(0, 400));
    expect(true).toBe(true);
  });
});
