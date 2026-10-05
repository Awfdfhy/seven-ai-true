import { describe, expect, it } from "vitest";
import { TaskManager } from "../../core/task-manager";
import { ToolExecutor } from "../tools/executor";
import { ToolRegistry } from "../tools/registry";
import type { ToolAuditEvent, ToolAuthoritySource } from "../tools/contracts";
import type {
  CodingRepositoryPort,
  RepositoryCommitChange,
  RepositoryEntry,
} from "./repository-port";
import { registerCodingRepositoryTools } from "./repository-tools";
import { ToolBackedCodingRepositoryPort } from "./tool-backed-repository-port";

class FakeBackend implements CodingRepositoryPort {
  head = "a".repeat(40);
  commitCount = 0;
  files = new Map([["src/a.ts", "export const a=1;\n"]]);

  async getHead(){ return this.head; }
  async listFiles():Promise<readonly RepositoryEntry[]>{
    return [...this.files].map(([path,content])=>({
      path,blobSha:"c".repeat(40),bytes:new TextEncoder().encode(content).byteLength,
    }));
  }
  async readFiles(input:{paths:readonly string[]}){
    return input.paths.map(path=>({path,content:this.files.get(path)!}));
  }
  async commit(input:{baseSha:string;changes:readonly RepositoryCommitChange[]}){
    if(input.baseSha!==this.head) throw new Error("stale");
    this.commitCount+=1;
    for(const change of input.changes){
      if(change.kind==="delete") this.files.delete(change.path);
      else this.files.set(change.path,change.content);
    }
    this.head="b".repeat(40);
    return {commitSha:this.head,changedPaths:input.changes.map(change=>change.path)};
  }
}

describe("coding repository Tool Fabric bridge",()=>{
  it("enforces grants/approval, audits effects, and replays the same commit idempotently",async()=>{
    const backend=new FakeBackend();
    const registry=new ToolRegistry();
    registerCodingRepositoryTools(registry,backend);
    const now=Date.now();
    const authority:ToolAuthoritySource={
      resolve(invocation,fingerprint){
        return {
          grants:[{
            grantId:"coding-grant",
            capabilities:["coding.repo.read","coding.repo.write"],
            toolIds:["coding.repo.head","coding.repo.list","coding.repo.read","coding.repo.commit"],
            scope:{roomId:"room-1",taskId:"task-1"},
            issuedAt:now-1000,expiresAt:now+60_000,source:"user",
          }],
          ...(invocation.toolId==="coding.repo.commit"?{
            approval:{
              approvalId:"approve-commit",
              invocationFingerprint:fingerprint,
              issuedAt:now-1000,expiresAt:now+60_000,oneShot:false,
            },
          }:{}),
        };
      },
    };
    const events:ToolAuditEvent[]=[];
    const executor=new ToolExecutor(
      registry,
      new TaskManager(),
      authority,
      undefined,
      {record(event){events.push(event)}},
    );
    const port=new ToolBackedCodingRepositoryPort(executor,{roomId:"room-1",taskId:"task-1"});
    const signal=new AbortController().signal;

    expect(await port.getHead({repository:"owner/repo",branch:"main",signal})).toBe("a".repeat(40));
    const files=await port.readFiles({repository:"owner/repo",commitSha:"a".repeat(40),paths:["src/a.ts"],signal});
    expect(files[0]?.content).toContain("a=1");

    const input={
      repository:"owner/repo",branch:"main",baseSha:"a".repeat(40),message:"Update a",
      changes:[{kind:"upsert" as const,path:"src/a.ts",content:"export const a=2;\n"}],
      signal,
    };
    const first=await port.commit(input);
    const replay=await port.commit(input);

    expect(first.commitSha).toBe("b".repeat(40));
    expect(replay.commitSha).toBe(first.commitSha);
    expect(backend.commitCount).toBe(1);
    expect(events.some(event=>event.toolId==="coding.repo.commit"&&event.status==="succeeded"&&event.effectStarted)).toBe(true);
  });

  it("denies mutation when write capability/approval is absent",async()=>{
    const backend=new FakeBackend();
    const registry=new ToolRegistry();
    registerCodingRepositoryTools(registry,backend);
    const now=Date.now();
    const executor=new ToolExecutor(
      registry,
      new TaskManager(),
      {
        resolve(){
          return {grants:[{
            grantId:"read-only",capabilities:["coding.repo.read"],
            scope:{roomId:"room-1",taskId:"task-1"},
            issuedAt:now-1000,expiresAt:now+60_000,source:"user",
          }]};
        },
      },
    );
    const port=new ToolBackedCodingRepositoryPort(executor,{roomId:"room-1",taskId:"task-1"});
    await expect(port.commit({
      repository:"owner/repo",branch:"main",baseSha:"a".repeat(40),message:"No",
      changes:[{kind:"upsert",path:"src/a.ts",content:"x"}],
      signal:new AbortController().signal,
    })).rejects.toMatchObject({code:"PERMISSION"});
    expect(backend.commitCount).toBe(0);
  });

  it("propagates external cancellation before the repository effect boundary", async () => {
    let commitCalls = 0;
    const backend: CodingRepositoryPort = {
      async getHead(input) {
        await new Promise<void>((_resolve, reject) => {
          if (input.signal.aborted) {
            reject(new DOMException("Aborted", "AbortError"));
            return;
          }
          input.signal.addEventListener(
            "abort",
            () => reject(new DOMException("Aborted", "AbortError")),
            { once: true },
          );
        });
        return "a".repeat(40);
      },
      async listFiles() { return []; },
      async readFiles() { return []; },
      async commit() {
        commitCalls += 1;
        return { commitSha: "b".repeat(40), changedPaths: ["src/a.ts"] };
      },
    };
    const registry = new ToolRegistry();
    registerCodingRepositoryTools(registry, backend);
    const now = Date.now();
    const executor = new ToolExecutor(
      registry,
      new TaskManager(),
      {
        resolve(invocation, fingerprint) {
          return {
            grants: [{
              grantId: "coding-cancel",
              capabilities: ["coding.repo.read", "coding.repo.write"],
              toolIds: ["coding.repo.commit"],
              scope: { roomId: "room-cancel", taskId: "task-cancel" },
              issuedAt: now - 1000,
              expiresAt: now + 60_000,
              source: "user",
            }],
            approval: {
              approvalId: "approve-cancel",
              invocationFingerprint: fingerprint,
              issuedAt: now - 1000,
              expiresAt: now + 60_000,
              oneShot: false,
            },
          };
        },
      },
    );
    const port = new ToolBackedCodingRepositoryPort(executor, {
      roomId: "room-cancel",
      taskId: "task-cancel",
    });
    const controller = new AbortController();
    const pending = port.commit({
      repository: "owner/repo",
      branch: "main",
      baseSha: "a".repeat(40),
      message: "cancel me",
      changes: [{ kind: "upsert", path: "src/a.ts", content: "x" }],
      signal: controller.signal,
    });
    await Promise.resolve();
    controller.abort("user-cancel");

    await expect(pending).rejects.toMatchObject({ code: "CANCELLED" });
    expect(commitCalls).toBe(0);
  });

});
