#!/usr/bin/env python3
"""Seven AI continuous 20-agent + Manager engineering superloop.

This controller runs one evidence-gated development cycle at a time. GitHub Actions
keeps a successor run pre-queued before the current cycle begins, so there is no
intentional inter-cycle sleep. A watchdog restarts the chain after infrastructure
failures.

Agents never receive GitHub credentials. They work in disposable git worktrees.
Only the controller integrates candidates, and the workflow pushes the validated
integration branch after this process exits successfully.
"""
from __future__ import annotations

import concurrent.futures
import datetime as dt
import json
import os
import pathlib
import re
import shutil
import subprocess
import sys
import textwrap
import time
from typing import Any

from autonomy_kernel import (
    load_autonomy_contracts,
    validate_autonomy_contracts,
    build_cycle_snapshot,
    record_arena_candidates,
    finalize_cycle,
)
from domain_campaign import (
    load_domain_campaign,
    domain_research_brief,
    audit_domain_research,
    campaign_prompt_summary,
)

ROOT = pathlib.Path.cwd()
PRODUCT_BRANCH = os.environ.get("SEVEN_PRODUCT_BRANCH", "seven-remake-v3")
WORK_BRANCH = os.environ.get("SEVEN_SUPERLOOP_BRANCH", "autoloop/seven-24h-work")
MAX_PARALLEL = max(1, min(20, int(os.environ.get("SEVEN_SUPERLOOP_MAX_PARALLEL", "20"))))
READ_TIMEOUT = int(os.environ.get("SEVEN_AGENT_READ_TIMEOUT", "360"))
WRITE_TIMEOUT = int(os.environ.get("SEVEN_AGENT_WRITE_TIMEOUT", "600"))
MANAGER_TIMEOUT = int(os.environ.get("SEVEN_MANAGER_TIMEOUT", "480"))
AUTO_REPAIR_ATTEMPTS = max(1, min(3, int(os.environ.get("SEVEN_AUTO_REPAIR_ATTEMPTS", "2"))))
MODEL = os.environ.get("SEVEN_SUPERLOOP_MODEL", "kilo-auto/free")
RUN_ID = os.environ.get("GITHUB_RUN_ID", "local")
RUN_NUMBER = os.environ.get("GITHUB_RUN_NUMBER", "0")
RUNNER_TEMP = pathlib.Path(os.environ.get("RUNNER_TEMP", "/tmp"))

CONTROL_ROOT = ROOT / ".seven-team" / "superloop"
TEAM = json.loads((CONTROL_ROOT / "team-v1.json").read_text(encoding="utf-8"))
MANAGER_CONTRACT = (CONTROL_ROOT / "manager.md").read_text(encoding="utf-8")
AGENT_CONTRACT = (CONTROL_ROOT / "agent.md").read_text(encoding="utf-8")
AGENTS: list[dict[str, str]] = list(TEAM["agents"])
AUTONOMY_CONTRACTS = load_autonomy_contracts(ROOT)
DOMAIN_CAMPAIGN = load_domain_campaign(ROOT)

ARTIFACT_ROOT = RUNNER_TEMP / "seven-superloop-artifacts"
WORKTREE_ROOT = RUNNER_TEMP / "seven-superloop-worktrees"
ARTIFACT_ROOT.mkdir(parents=True, exist_ok=True)
WORKTREE_ROOT.mkdir(parents=True, exist_ok=True)

BLOCKED_PATH = re.compile(
    r"(^|/)(\.env(?:\.|$)|.*\.keystore$|.*\.jks$|id_rsa(?:\.|$)|credentials?(?:\.|/|$)|secrets?(?:\.|/|$))",
    re.I,
)


def log(message: str) -> None:
    print(f"[seven-superloop] {message}", flush=True)


def run(
    args: list[str],
    *,
    cwd: pathlib.Path = ROOT,
    timeout: int | None = None,
    check: bool = True,
    env: dict[str, str] | None = None,
) -> subprocess.CompletedProcess[str]:
    proc = subprocess.run(
        args,
        cwd=str(cwd),
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        timeout=timeout,
        env=env,
    )
    if check and proc.returncode != 0:
        raise RuntimeError(f"command failed ({proc.returncode}): {' '.join(args)}\n{proc.stdout[-5000:]}")
    return proc


def git(*args: str, cwd: pathlib.Path = ROOT, check: bool = True) -> subprocess.CompletedProcess[str]:
    return run(["git", *args], cwd=cwd, check=check)


def clip(text: str, limit: int = 7000) -> str:
    text = (text or "").replace("\x00", "")
    if len(text) <= limit:
        return text
    half = max(1000, (limit - 120) // 2)
    return text[:half] + "\n\n...[clipped by superloop]...\n\n" + text[-half:]


def safe_label(value: str) -> str:
    return re.sub(r"[^A-Za-z0-9_.-]+", "-", value)[:80]


def write_artifact(cycle: int, stage: str, name: str, text: str) -> pathlib.Path:
    path = ARTIFACT_ROOT / f"cycle-{cycle:04d}" / stage / f"{safe_label(name)}.md"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text.rstrip() + "\n", encoding="utf-8")
    return path


def git_output(*args: str, cwd: pathlib.Path = ROOT) -> str:
    return git(*args, cwd=cwd).stdout.strip()


def remote_branch_exists(name: str) -> bool:
    proc = git("ls-remote", "--exit-code", "--heads", "origin", name, check=False)
    return proc.returncode == 0 and bool(proc.stdout.strip())


def prepare_integration_branch() -> tuple[int, str]:
    log("fetching control/product/integration refs")
    git("fetch", "origin", "main", PRODUCT_BRANCH)
    if remote_branch_exists(WORK_BRANCH):
        git("fetch", "origin", f"{WORK_BRANCH}:refs/remotes/origin/{WORK_BRANCH}")
        git("checkout", "-B", WORK_BRANCH, f"origin/{WORK_BRANCH}")
    else:
        git("checkout", "-B", WORK_BRANCH, f"origin/{PRODUCT_BRANCH}")

    sync_note = "product sync: current"
    before = git_output("rev-parse", "HEAD")
    merge = git("merge", "--no-edit", f"origin/{PRODUCT_BRANCH}", check=False)
    if merge.returncode != 0:
        git("merge", "--abort", check=False)
        sync_note = "product sync: blocked by merge conflict; retained prior validated integration branch"
        log(sync_note)
    elif git_output("rev-parse", "HEAD") != before:
        sync_note = "product sync: merged latest product branch"
        log(sync_note)

    state_path = ROOT / ".seven-team" / "superloop-state.json"
    last_cycle = 0
    if state_path.exists():
        try:
            last_cycle = int(json.loads(state_path.read_text(encoding="utf-8")).get("lastCompletedCycle", 0))
        except Exception:
            last_cycle = 0
    return last_cycle + 1, sync_note


def ensure_dependencies() -> pathlib.Path:
    remake = ROOT / "remake"
    log("installing shared remake dependencies")
    run(["npm", "install"], cwd=remake, timeout=300)
    return remake / "node_modules"


def codex_command(prompt: str) -> list[str]:
    return [
        "codex",
        "exec",
        "--skip-git-repo-check",
        "-m",
        MODEL,
        "-c",
        'approval_policy="never"',
        "-c",
        'sandbox_mode="danger-full-access"',
        "-c",
        'model_provider="seven"',
        "-c",
        'model_providers.seven={name="Seven Local Bridge",base_url="http://127.0.0.1:8878/v1",env_key="SEVEN_CODEX_KEY",wire_api="responses",requires_openai_auth=false,supports_websockets=false,request_max_retries=2,stream_max_retries=2}',
        clip(prompt, 150000),
    ]


def run_codex(workdir: pathlib.Path, prompt: str, timeout: int, label: str) -> str:
    prompt = (prompt or "").replace("\x00", "")
    home = RUNNER_TEMP / "seven-superloop-codex" / safe_label(label)
    home.mkdir(parents=True, exist_ok=True)
    env = os.environ.copy()
    env["SEVEN_CODEX_KEY"] = "local-dummy-key"
    env["CODEX_HOME"] = str(home)
    try:
        proc = run(codex_command(prompt), cwd=workdir, timeout=timeout, check=False, env=env)
        output = proc.stdout or ""
        if proc.returncode != 0:
            output += f"\n\n[agent process exit={proc.returncode}]"
        return output
    except subprocess.TimeoutExpired as exc:
        stdout = exc.stdout if isinstance(exc.stdout, str) else ""
        return (stdout or "") + f"\n\n[agent timeout after {timeout}s]"


def manager_readonly(cycle: int, stage: str, base_sha: str, prompt: str) -> str:
    path = make_worktree(f"m-{stage}", base_sha, shared_node_modules=None)
    try:
        full = f"""{MANAGER_CONTRACT}

Cycle: {cycle}
Manager stage: {stage}

{prompt}

Return a concrete manager deliverable. Do not modify files, commit, or push.
"""
        output = run_codex(path, full, MANAGER_TIMEOUT, f"cycle-{cycle}-{stage}-manager")
        if len(output.strip()) < 200:
            output += "\n\nManager fallback: preserve current architecture, prioritize release blockers and require evidence before integration."
        write_artifact(cycle, stage, "M00-manager", output)
        return output
    finally:
        remove_worktree(path)


def make_worktree(label: str, base_sha: str, shared_node_modules: pathlib.Path | None) -> pathlib.Path:
    path = WORKTREE_ROOT / safe_label(label)
    if path.exists():
        shutil.rmtree(path, ignore_errors=True)
    git("worktree", "add", "--detach", str(path), base_sha)
    if shared_node_modules is not None:
        nm = path / "remake" / "node_modules"
        if not nm.exists():
            nm.symlink_to(shared_node_modules, target_is_directory=True)
    return path


def remove_worktree(path: pathlib.Path) -> None:
    git("worktree", "remove", "--force", str(path), check=False)
    shutil.rmtree(path, ignore_errors=True)
    git("worktree", "prune", check=False)


def role_text(agent: dict[str, str]) -> str:
    return f"{agent['id']} — {agent['domain']}\nFocus: {agent['focus']}"


def stage_prompt(
    cycle: int,
    stage: str,
    agent: dict[str, str],
    manager_plan: str,
    evidence: str = "",
) -> str:
    stage_instruction = {
        "research": "RESEARCH deeply. Produce a large evidence-grounded domain report with improvements, feature ideas, missing proof and release blockers. No production edits.",
        "execute": "EXECUTE the Manager assignment. Make real production changes and deterministic tests. Do not commit or push; the controller owns git.",
        "verify": "VERIFY the integrated version for compatibility, actual existence, ownership and behavior. Run meaningful commands. No production edits.",
        "bughunt": "BUGHUNT adversarially. Find reproducible bugs/root causes, especially cross-system failures and untested paths. No production edits.",
        "fix": "FIX the verified root cause(s) assigned by Manager. Add regression proof. Do not commit or push; the controller owns git.",
        "explore": "EXPLORE like a demanding user/tester. Exercise realistic journeys and failure paths with available browser/CLI/build tooling. Use .seven-team/product-intelligence/PRODUCT_QUALITY_RUBRIC.json plus relevant knowledge/visual references. Score only dimensions you have evidence for; missing exact-build visual evidence is UNPROVEN. No production edits.",
    }[stage]
    return f"""{AGENT_CONTRACT}

Cycle: {cycle}
Stage: {stage.upper()}
Specialist: {role_text(agent)}

Manager plan:
{clip(manager_plan, 24000)}

Relevant prior evidence:
{clip(evidence, 9000)}

Task:
{stage_instruction}

Domain campaign assignment:
{domain_research_brief(DOMAIN_CAMPAIGN, agent["id"]) if stage == "research" else "Use relevant completed domain research and roadmap evidence; do not invent missing research."}

Inspect the repository yourself. Give precise evidence and do not claim work you did not perform.
"""


def run_readonly_phase(
    cycle: int,
    stage: str,
    base_sha: str,
    manager_plan: str,
    evidence_by_agent: dict[str, str] | None,
    shared_node_modules: pathlib.Path,
) -> dict[str, str]:
    log(f"{stage}: launching {len(AGENTS)} specialist agents")
    worktrees: dict[str, pathlib.Path] = {}
    for agent in AGENTS:
        worktrees[agent["id"]] = make_worktree(
            f"c{cycle}-{stage}-{agent['id']}", base_sha, shared_node_modules
        )

    results: dict[str, str] = {}

    def worker(agent: dict[str, str]) -> tuple[str, str]:
        aid = agent["id"]
        prompt = stage_prompt(
            cycle,
            stage,
            agent,
            manager_plan,
            (evidence_by_agent or {}).get(aid, ""),
        )
        output = run_codex(
            worktrees[aid],
            prompt,
            READ_TIMEOUT,
            f"c{cycle}-{stage}-{aid}",
        )
        write_artifact(cycle, stage, aid, output)
        return aid, output

    try:
        with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_PARALLEL) as pool:
            futures = [pool.submit(worker, agent) for agent in AGENTS]
            for future in concurrent.futures.as_completed(futures):
                try:
                    aid, output = future.result()
                    results[aid] = output
                except Exception as exc:
                    aid = f"unknown-{len(results)}"
                    results[aid] = f"agent infrastructure failure: {exc}"
                    log(f"{stage}: {exc}")
    finally:
        for path in worktrees.values():
            remove_worktree(path)

    for agent in AGENTS:
        results.setdefault(agent["id"], "No usable agent output; Manager must treat this specialist as unavailable.")
    return results


def changed_paths(cwd: pathlib.Path) -> list[str]:
    diff = git("diff", "--name-only", cwd=cwd).stdout.splitlines()
    untracked = git("ls-files", "--others", "--exclude-standard", cwd=cwd).stdout.splitlines()
    return sorted(set(x.strip() for x in diff + untracked if x.strip()))


def allowed_candidate_path(path: str) -> bool:
    if BLOCKED_PATH.search(path):
        return False
    return (
        path.startswith("remake/")
        or path.startswith("apk/remake-")
        or path.startswith(".seven-team/product-intelligence/learned/")
        or path == ".github/workflows/seven-remake-android.yml"
    )


def unlink_shared_node_modules(worktree: pathlib.Path) -> None:
    nm = worktree / "remake" / "node_modules"
    try:
        if nm.is_symlink():
            nm.unlink()
    except FileNotFoundError:
        pass


def quick_candidate_gate(worktree: pathlib.Path) -> tuple[bool, str]:
    proc = run(["npm", "run", "typecheck"], cwd=worktree / "remake", timeout=180, check=False)
    return proc.returncode == 0, proc.stdout[-6000:]


def full_gates(cwd: pathlib.Path = ROOT) -> tuple[bool, str]:
    logs: list[str] = []
    commands = [
        (["npm", "audit", "--omit=dev", "--audit-level=moderate"], 180),
        (["npm", "audit", "--audit-level=moderate"], 180),
        (["npm", "run", "typecheck"], 180),
        (["npm", "test"], 300),
        (["npm", "run", "build"], 300),
    ]
    for command, timeout in commands:
        proc = run(command, cwd=cwd / "remake", timeout=timeout, check=False)
        logs.append(f"$ {' '.join(command)}\n{proc.stdout[-6000:]}")
        if proc.returncode != 0:
            return False, "\n\n".join(logs)
    return True, "\n\n".join(logs)


def run_write_phase(
    cycle: int,
    stage: str,
    base_sha: str,
    manager_plan: str,
    evidence_by_agent: dict[str, str],
    shared_node_modules: pathlib.Path,
) -> tuple[dict[str, str], dict[str, str]]:
    log(f"{stage}: launching isolated implementation candidates")
    worktrees: dict[str, pathlib.Path] = {}
    for agent in AGENTS:
        worktrees[agent["id"]] = make_worktree(
            f"c{cycle}-{stage}-{agent['id']}", base_sha, shared_node_modules
        )

    commits: dict[str, str] = {}
    outputs: dict[str, str] = {}

    def worker(agent: dict[str, str]) -> tuple[str, str, str | None]:
        aid = agent["id"]
        wt = worktrees[aid]
        prompt = stage_prompt(cycle, stage, agent, manager_plan, evidence_by_agent.get(aid, ""))
        output = run_codex(wt, prompt, WRITE_TIMEOUT, f"c{cycle}-{stage}-{aid}-1")
        paths = changed_paths(wt)
        if not paths:
            output += "\n\n[controller] First attempt produced no candidate diff; retrying once with explicit implementation instruction."
            output += "\n" + run_codex(
                wt,
                prompt + "\n\nYou produced no code diff. Implement the assigned change now, with tests. Do not only explain it.",
                WRITE_TIMEOUT,
                f"c{cycle}-{stage}-{aid}-2",
            )
            paths = changed_paths(wt)

        if not paths:
            write_artifact(cycle, stage, aid, output + "\n\n[controller] NO_CHANGE")
            return aid, output, None

        bad = [path for path in paths if not allowed_candidate_path(path)]
        if bad:
            output += "\n\n[controller] REJECTED_SCOPE: " + ", ".join(bad)
            write_artifact(cycle, stage, aid, output)
            return aid, output, None

        ok, gate_log = quick_candidate_gate(wt)
        output += "\n\n[controller quick gate]\n" + gate_log
        if not ok:
            output += "\n\n[controller] REJECTED_TYPECHECK"
            write_artifact(cycle, stage, aid, output)
            return aid, output, None

        unlink_shared_node_modules(wt)
        git("add", "-A", cwd=wt)
        status = git("status", "--porcelain", cwd=wt).stdout.strip()
        if not status:
            write_artifact(cycle, stage, aid, output + "\n\n[controller] NO_COMMITTABLE_CHANGE")
            return aid, output, None
        git("-c", "user.name=Seven Superloop Agent", "-c", "user.email=actions@users.noreply.github.com",
            "commit", "-m", f"Superloop cycle {cycle} {stage} {aid}", cwd=wt)
        sha = git_output("rev-parse", "HEAD", cwd=wt)
        output += f"\n\n[controller] CANDIDATE_COMMIT={sha}"
        write_artifact(cycle, stage, aid, output)
        return aid, output, sha

    try:
        with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_PARALLEL) as pool:
            futures = [pool.submit(worker, agent) for agent in AGENTS]
            for future in concurrent.futures.as_completed(futures):
                try:
                    aid, output, sha = future.result()
                    outputs[aid] = output
                    if sha:
                        commits[aid] = sha
                except Exception as exc:
                    log(f"{stage} candidate failure: {exc}")
    finally:
        for path in worktrees.values():
            remove_worktree(path)

    return commits, outputs


def validate_uncommitted_scope() -> tuple[bool, list[str]]:
    paths = changed_paths(ROOT)
    bad = [path for path in paths if not allowed_candidate_path(path)]
    return not bad, bad


def commit_manager_changes(message: str) -> bool:
    paths = changed_paths(ROOT)
    if not paths:
        return False
    ok, bad = validate_uncommitted_scope()
    if not ok:
        log("manager attempted disallowed paths: " + ", ".join(bad))
        git("reset", "--hard", "HEAD")
        git("clean", "-fd")
        return False
    git("add", "-A")
    if not git("status", "--porcelain").stdout.strip():
        return False
    git("-c", "user.name=Seven Superloop Manager", "-c", "user.email=actions@users.noreply.github.com",
        "commit", "-m", message)
    return True


def integrate_candidates(
    cycle: int,
    stage: str,
    stage_base: str,
    commits: dict[str, str],
    manager_plan: str,
    outputs: dict[str, str],
) -> dict[str, Any]:
    log(f"{stage}: Manager integrating {len(commits)} validated candidates")
    accepted: list[str] = []
    rejected: list[str] = []
    for agent in AGENTS:
        aid = agent["id"]
        sha = commits.get(aid)
        if not sha:
            rejected.append(f"{aid}: no candidate")
            continue
        before = git_output("rev-parse", "HEAD")
        cp = git("cherry-pick", sha, check=False)
        if cp.returncode != 0:
            git("cherry-pick", "--abort", check=False)
            rejected.append(f"{aid}: conflict")
            continue
        proc = run(["npm", "run", "typecheck"], cwd=ROOT / "remake", timeout=180, check=False)
        if proc.returncode != 0:
            git("reset", "--hard", before)
            rejected.append(f"{aid}: integration typecheck")
            continue
        accepted.append(aid)

    before_manager = git_output("rev-parse", "HEAD")
    manager_context = "\n".join(
        f"{aid}: {clip(outputs.get(aid, ''), 1800)}" for aid in [a["id"] for a in AGENTS]
    )
    reconcile_prompt = f"""{MANAGER_CONTRACT}

Cycle {cycle}, {stage} integration.
Manager plan:
{clip(manager_plan, 26000)}

Accepted candidates: {accepted}
Rejected/skipped candidates: {rejected}

Candidate evidence:
{clip(manager_context, 42000)}

Inspect the now-integrated repository. Reconcile only real incompatibilities, duplicated ownership,
missing glue, and deterministic test gaps. You MAY edit production code/tests in the allowed Remake
surfaces, but do not commit or push. Keep the integrated set coherent and minimal.

TypeScript safety rule: never access ad-hoc properties through bare globalThis.property or
globalThis["property"] unless the property is declared. Prefer a typed intersection such as
(globalThis as typeof globalThis & {{ SomeProbe?: ProbeType }}).SomeProbe, or keep the probe local.
Do not create throwaway probe tests that fail strict typecheck.
"""
    manager_output = run_codex(ROOT, reconcile_prompt, MANAGER_TIMEOUT, f"c{cycle}-{stage}-reconcile")
    if git_output("rev-parse", "HEAD") != before_manager:
        # Agents/managers are forbidden to own git commits.
        git("reset", "--hard", before_manager)
        manager_output += "\n[controller] Manager-created commit rejected; controller owns git."
    else:
        ok_scope, bad = validate_uncommitted_scope()
        if not ok_scope:
            git("reset", "--hard", "HEAD")
            git("clean", "-fd")
            manager_output += "\n[controller] Manager scope rejected: " + ", ".join(bad)
        else:
            gate_ok, gate_log = full_gates(ROOT)
            if gate_ok:
                commit_manager_changes(f"Superloop cycle {cycle} {stage} manager reconciliation")
            else:
                git("reset", "--hard", before_manager)
                git("clean", "-fd")
                manager_output += "\n[controller] Manager reconciliation failed full gates and was discarded.\n" + gate_log[-8000:]

    final_ok, final_log = full_gates(ROOT)
    if not final_ok:
        log(f"{stage}: integrated set failed final gates; reverting entire stage")
        git("reset", "--hard", stage_base)
        git("clean", "-fd")
        accepted = []
        rejected.append("entire stage reverted: final combined gates failed")

    report = {
        "accepted": accepted,
        "rejected": rejected,
        "head": git_output("rev-parse", "HEAD"),
        "fullGatesPass": final_ok,
    }
    write_artifact(
        cycle,
        f"{stage}-integration",
        "M00-manager",
        manager_output + "\n\n" + json.dumps(report, indent=2),
    )
    return report


def summarize_reports(reports: dict[str, str], per_agent: int = 3500) -> str:
    chunks = []
    for agent in AGENTS:
        aid = agent["id"]
        chunks.append(f"## {aid} — {agent['domain']}\n{clip(reports.get(aid, ''), per_agent)}")
    return "\n\n".join(chunks)


def manager_write_polish(
    cycle: int,
    compatibility: str,
    bug_plan: str,
    explore_reports: dict[str, str],
) -> tuple[bool, str]:
    before = git_output("rev-parse", "HEAD")
    prompt = f"""{MANAGER_CONTRACT}

Cycle {cycle}, final POLISH stage.

Compatibility manager verdict:
{clip(compatibility, 16000)}

Bug/fix manager plan:
{clip(bug_plan, 16000)}

Exploratory QA:
{clip(summarize_reports(explore_reports, 1500), 36000)}

Inspect the integrated repository. Apply ONLY a final high-value polish/reconciliation pass where
evidence justifies it. Focus on consistency, accessibility, performance, test gaps and release
readiness. Do not add speculative feature sprawl. You may edit allowed Remake surfaces. Do not
commit or push.
"""
    output = run_codex(ROOT, prompt, MANAGER_TIMEOUT, f"c{cycle}-polish-manager")
    if git_output("rev-parse", "HEAD") != before:
        git("reset", "--hard", before)
        output += "\n[controller] Manager-created commit rejected."
        return False, output
    ok_scope, bad = validate_uncommitted_scope()
    if not ok_scope:
        git("reset", "--hard", "HEAD")
        git("clean", "-fd")
        output += "\n[controller] Scope rejected: " + ", ".join(bad)
        return False, output
    if not changed_paths(ROOT):
        return False, output + "\n[controller] No polish diff."
    ok, gates = full_gates(ROOT)
    if not ok:
        git("reset", "--hard", before)
        git("clean", "-fd")
        return False, output + "\n[controller] Polish failed full gates and was discarded.\n" + gates[-8000:]
    commit_manager_changes(f"Superloop cycle {cycle} final polish")
    return True, output + "\n[controller] Polish accepted with full gates."


def repair_final_gates(cycle: int, initial_log: str) -> tuple[bool, str]:
    """Bounded self-healing loop for deterministic final-gate failures."""
    evidence = initial_log
    attempts: list[str] = []
    for attempt in range(1, AUTO_REPAIR_ATTEMPTS + 1):
        before = git_output("rev-parse", "HEAD")
        prompt = f"""{MANAGER_CONTRACT}

Cycle {cycle}, SELF-HEAL FINAL-GATES attempt {attempt}/{AUTO_REPAIR_ATTEMPTS}.

The deterministic release gates failed. Diagnose the exact root cause from the evidence below and
apply the smallest production/test fix needed. Do not add speculative features. Do not commit or push.
Stay inside allowed Remake surfaces. Preserve architecture/security/release evidence.

Strict TypeScript rule: ad-hoc globals must be explicitly typed; never create a probe that fails
strict typecheck. Do not weaken tsconfig, tests, audits, or build gates to make them green.

Failure evidence:
{clip(evidence, 30000)}
"""
        output = run_codex(ROOT, prompt, MANAGER_TIMEOUT, f"c{cycle}-selfheal-gates-{attempt}")

        if git_output("rev-parse", "HEAD") != before:
            git("reset", "--hard", before)
            git("clean", "-fd")
            attempts.append(output + "\n[controller] rejected manager-created commit")
            evidence = attempts[-1]
            continue

        ok_scope, bad = validate_uncommitted_scope()
        if not ok_scope:
            git("reset", "--hard", before)
            git("clean", "-fd")
            attempts.append(output + "\n[controller] rejected scope: " + ", ".join(bad))
            evidence = attempts[-1]
            continue

        if not changed_paths(ROOT):
            attempts.append(output + "\n[controller] no repair diff")
            evidence = attempts[-1]
            continue

        ok, gate_log = full_gates(ROOT)
        attempt_report = output + "\n\n[repair gates]\n" + gate_log
        write_artifact(cycle, "self-heal-final-gates", f"attempt-{attempt}", attempt_report)

        if ok:
            commit_manager_changes(f"Superloop cycle {cycle} self-heal final gates attempt {attempt}")
            return True, "\n\n".join(attempts + [attempt_report])

        git("reset", "--hard", before)
        git("clean", "-fd")
        attempts.append(attempt_report + "\n[controller] repair failed; rolled back")
        evidence = gate_log

    return False, "\n\n".join(attempts)


def repair_apk(cycle: int, initial_result: str) -> str:
    """Bounded self-healing loop for APK packaging failures after full gates pass."""
    evidence = initial_result
    for attempt in range(1, AUTO_REPAIR_ATTEMPTS + 1):
        before = git_output("rev-parse", "HEAD")
        prompt = f"""{MANAGER_CONTRACT}

Cycle {cycle}, SELF-HEAL APK attempt {attempt}/{AUTO_REPAIR_ATTEMPTS}.

The Remake APK stage did not PASS. Diagnose the exact packaging/build/root-cause evidence below and
apply the smallest safe fix. Do not weaken signing, installed-identity checks, tests, audits or release
gates. Do not commit or push. Stay inside allowed Remake/Android packaging surfaces.

APK failure evidence:
{clip(evidence, 30000)}
"""
        output = run_codex(ROOT, prompt, MANAGER_TIMEOUT, f"c{cycle}-selfheal-apk-{attempt}")

        if git_output("rev-parse", "HEAD") != before:
            git("reset", "--hard", before)
            git("clean", "-fd")
            evidence = output + "\n[controller] rejected manager-created commit"
            write_artifact(cycle, "self-heal-apk", f"attempt-{attempt}", evidence)
            continue

        ok_scope, bad = validate_uncommitted_scope()
        if not ok_scope:
            git("reset", "--hard", before)
            git("clean", "-fd")
            evidence = output + "\n[controller] rejected scope: " + ", ".join(bad)
            write_artifact(cycle, "self-heal-apk", f"attempt-{attempt}", evidence)
            continue

        if not changed_paths(ROOT):
            evidence = output + "\n[controller] no repair diff"
            write_artifact(cycle, "self-heal-apk", f"attempt-{attempt}", evidence)
            continue

        gates_ok, gates = full_gates(ROOT)
        if not gates_ok:
            git("reset", "--hard", before)
            git("clean", "-fd")
            evidence = output + "\n\n[full gates failed after APK repair]\n" + gates
            write_artifact(cycle, "self-heal-apk", f"attempt-{attempt}", evidence)
            continue

        result = attempt_apk(cycle)
        report = output + "\n\n[apk retry]\n" + result
        write_artifact(cycle, "self-heal-apk", f"attempt-{attempt}", report)
        if "APK_STAGE=PASS" in result:
            commit_manager_changes(f"Superloop cycle {cycle} self-heal APK attempt {attempt}")
            return result

        git("reset", "--hard", before)
        git("clean", "-fd")
        evidence = result

    return initial_result + "\nSELF_HEAL_APK=EXHAUSTED"


def attempt_apk(cycle: int) -> str:
    log("APK stage: checking for Remake Android packaging contract")
    pkg_path = ROOT / "remake" / "package.json"
    pkg = json.loads(pkg_path.read_text(encoding="utf-8"))
    scripts = pkg.get("scripts") or {}
    command: list[str] | None = None
    for key in ("android:ci", "android:build", "android:generate"):
        if key in scripts:
            command = ["npm", "run", key]
            break
    shell_contract = ROOT / "apk" / "remake-android-ci.sh"
    if command is None and shell_contract.exists():
        command = ["bash", str(shell_contract)]

    if command is None:
        result = (
            "APK_STAGE=BLOCKED\n"
            "No Remake Android packaging command exists yet. The next cycle must prioritize "
            "a non-legacy packaging path and installed-identity/device evidence."
        )
        write_artifact(cycle, "apk", "release", result)
        return result

    proc = run(command, cwd=ROOT / "remake" if command[:2] == ["npm", "run"] else ROOT,
               timeout=1800, check=False)
    apks = []
    for path in ROOT.rglob("*.apk"):
        rel = path.relative_to(ROOT).as_posix()
        if rel.startswith("remake/") or "remake" in rel.lower():
            apks.append(path)

    apk_dir = ARTIFACT_ROOT / f"cycle-{cycle:04d}" / "apk" / "files"
    apk_dir.mkdir(parents=True, exist_ok=True)
    for path in apks:
        shutil.copy2(path, apk_dir / path.name)

    state = "PASS" if proc.returncode == 0 and apks else "INCONCLUSIVE"
    result = (
        f"APK_STAGE={state}\n"
        f"command={' '.join(command)}\n"
        f"exit={proc.returncode}\n"
        f"apk_count={len(apks)}\n\n"
        + proc.stdout[-12000:]
    )
    write_artifact(cycle, "apk", "release", result)
    return result


def tracked_history(cycle: int, text: str) -> None:
    history_dir = ROOT / ".seven-team" / "superloop-history"
    history_dir.mkdir(parents=True, exist_ok=True)
    (history_dir / f"cycle-{cycle:04d}.md").write_text(clip(text, 30000).rstrip() + "\n", encoding="utf-8")


def save_state(cycle: int, summary: dict[str, Any]) -> None:
    state_path = ROOT / ".seven-team" / "superloop-state.json"
    state_path.parent.mkdir(parents=True, exist_ok=True)
    state = {
        "schemaVersion": 1,
        "enabled": True,
        "lastCompletedCycle": cycle,
        "lastCompletedAt": dt.datetime.now(dt.timezone.utc).isoformat(),
        "workBranch": WORK_BRANCH,
        "productBranch": PRODUCT_BRANCH,
        "runId": RUN_ID,
        "runNumber": RUN_NUMBER,
        "summary": summary,
    }
    state_path.write_text(json.dumps(state, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def commit_cycle_metadata(cycle: int) -> None:
    git("add", ".seven-team/superloop-state.json", ".seven-team/superloop-history", ".seven-team/domain-campaign/generated")
    if git("status", "--porcelain").stdout.strip():
        git("-c", "user.name=Seven Superloop Manager", "-c", "user.email=actions@users.noreply.github.com",
            "commit", "-m", f"Superloop cycle {cycle} manager record")


def main() -> int:
    cycle, sync_note = prepare_integration_branch()
    log(f"starting cycle {cycle}")
    shared_node_modules = ensure_dependencies()
    git("worktree", "prune", check=False)

    base_sha = git_output("rev-parse", "HEAD")
    validate_autonomy_contracts(ROOT, AUTONOMY_CONTRACTS)
    autonomy_context = build_cycle_snapshot(
        ROOT, ARTIFACT_ROOT, cycle, base_sha, AUTONOMY_CONTRACTS, TEAM
    )
    research_plan = manager_readonly(
        cycle,
        "manager-research-plan",
        base_sha,
        f"""Inspect the current repository and release status. Build the research plan for all 20
specialists. We are running a continuous loop:
1 research, 2 implementation, 3 compatibility verification, 4 bug hunt+fix,
5 agent-driven exploratory testing, 6 polish+APK.
Current branch sync note: {sync_note}
Autonomous engineering preflight: {autonomy_context}
Honor the Seven Constitution and proof policy. Treat Reality Lab / visual / Android evidence as UNPROVEN when missing.
Prioritize unresolved release readiness and user-visible product quality. Give all 20 agents distinct,
non-duplicative research assignments. Explicitly assign B10 to curate at least one evidence-backed
product-intelligence lesson when a genuinely useful new reference or product lesson exists; otherwise
B10 must report NO_NEW_INTELLIGENCE rather than inventing one.""",
    )

    research = run_readonly_phase(
        cycle, "research", base_sha, research_plan, None, shared_node_modules
    )
    domain_audit = audit_domain_research(DOMAIN_CAMPAIGN, research)
    write_artifact(cycle, "domain-research", "coverage", json.dumps(domain_audit, indent=2))
    domain_roadmaps = manager_readonly(
        cycle,
        "manager-domain-roadmaps",
        base_sha,
        f"""Create an independent architecture/improvement roadmap for EVERY configured Seven domain.
Research coverage audit:\n{json.dumps(domain_audit, indent=2)}\n\nConfigured domains:\n{campaign_prompt_summary(DOMAIN_CAMPAIGN)}\n\nResearch reports:\n{clip(summarize_reports(research, 3500), 100000)}\n\nFor insufficient domains, explicitly label RESEARCH_INSUFFICIENT and do not fabricate a plan from weak evidence.
For ready domains, produce CURRENT -> TARGET -> NOW/NEXT/LATER -> TESTS -> RISKS -> FIRST SLICE.
Prioritize core domains but preserve separate plans for all domains.""",
    )
    campaign_dir = ROOT / ".seven-team" / "domain-campaign" / "generated"
    campaign_dir.mkdir(parents=True, exist_ok=True)
    (campaign_dir / "latest.md").write_text(domain_roadmaps.rstrip() + "\n", encoding="utf-8")
    hist_dir = campaign_dir / "history"
    hist_dir.mkdir(parents=True, exist_ok=True)
    (hist_dir / f"cycle-{cycle:04d}.md").write_text(domain_roadmaps.rstrip() + "\n", encoding="utf-8")
    (campaign_dir / "latest-audit.json").write_text(json.dumps(domain_audit, indent=2) + "\n", encoding="utf-8")

    execution_plan = manager_readonly(
        cycle,
        "manager-execution-plan",
        base_sha,
        f"""Synthesize these 20 research reports into a compatible execution plan.
Assign every agent a concrete task or an explicit VERIFY-ONLY/no-op if coding would duplicate ownership.
Do not chase quantity; prioritize release blockers and strongest product improvements.
Use the separate domain roadmaps below. Only implement domains with adequate research evidence; if a domain is RESEARCH_INSUFFICIENT, assign more verification/research rather than speculative architecture.

Domain research audit:
{json.dumps(domain_audit, indent=2)}

Domain roadmaps:
{clip(domain_roadmaps, 42000)}

Research reports:
{clip(summarize_reports(research, 4200), 100000)}"""
    )

    feature_base = git_output("rev-parse", "HEAD")
    feature_commits, feature_outputs = run_write_phase(
        cycle, "execute", feature_base, execution_plan, research, shared_node_modules
    )
    arena_evidence = record_arena_candidates(
        ARTIFACT_ROOT, cycle, feature_base, feature_commits, feature_outputs
    )
    feature_integration = integrate_candidates(
        cycle, "features", feature_base, feature_commits, execution_plan, feature_outputs
    )

    verify_base = git_output("rev-parse", "HEAD")
    verify = run_readonly_phase(
        cycle, "verify", verify_base, execution_plan, feature_outputs, shared_node_modules
    )
    compatibility = manager_readonly(
        cycle,
        "manager-compatibility",
        verify_base,
        f"""Judge the integrated implementation using all 20 verification reports.
Check feature existence, ownership, architecture, interactions, regressions and evidence.
Produce a compatibility verdict and route every credible defect into the upcoming bug hunt.

{clip(summarize_reports(verify, 3200), 76000)}""",
    )

    bughunt = run_readonly_phase(
        cycle, "bughunt", verify_base, compatibility, verify, shared_node_modules
    )
    bug_plan = manager_readonly(
        cycle,
        "manager-bug-plan",
        verify_base,
        f"""Synthesize the adversarial bug hunt into root causes. Deduplicate repeated symptoms,
reject speculation without evidence, and assign the highest-confidence fixes across the 20 specialists.
BLOCKER/CRITICAL/HIGH regressions outrank new features.

{clip(summarize_reports(bughunt, 3800), 90000)}""",
    )

    fix_base = git_output("rev-parse", "HEAD")
    fix_commits, fix_outputs = run_write_phase(
        cycle, "fix", fix_base, bug_plan, bughunt, shared_node_modules
    )
    fix_integration = integrate_candidates(
        cycle, "fixes", fix_base, fix_commits, bug_plan, fix_outputs
    )

    explore_base = git_output("rev-parse", "HEAD")
    explore = run_readonly_phase(
        cycle, "explore", explore_base, compatibility, bughunt, shared_node_modules
    )

    polished, polish_output = manager_write_polish(cycle, compatibility, bug_plan, explore)
    write_artifact(cycle, "polish", "M00-manager", polish_output)

    final_ok, final_gate_log = full_gates(ROOT)
    write_artifact(cycle, "final-gates", "automated", final_gate_log)
    if not final_ok:
        log("final gates failed; entering bounded self-heal repair loop")
        final_ok, repair_log = repair_final_gates(cycle, final_gate_log)
        write_artifact(cycle, "final-gates", "self-heal", repair_log)
    if not final_ok:
        raise RuntimeError("final cycle gates failed after bounded self-heal attempts")

    apk_result = attempt_apk(cycle)
    if "APK_STAGE=PASS" not in apk_result:
        log("APK stage did not pass; entering bounded self-heal repair loop")
        apk_result = repair_apk(cycle, apk_result)

    quality_head = git_output("rev-parse", "HEAD")
    product_quality = manager_readonly(
        cycle,
        "manager-product-quality",
        quality_head,
        f"""Act as the independent product-quality synthesis judge.

Read the complete product-intelligence system under .seven-team/product-intelligence/, especially
PRODUCT_QUALITY_RUBRIC.json and JUDGE_PROTOCOL.md. Use the 20-agent exploratory evidence below,
the compatibility verdict, and the APK state. Judge Seven as a complete AI chat product, not as a
feature checklist. Preserve disagreements and mark missing visual/runtime evidence UNPROVEN.

Compatibility:
{clip(compatibility, 16000)}

Exploratory evidence:
{clip(summarize_reports(explore, 2200), 52000)}

APK:
{clip(apk_result, 8000)}

Required final lines:
PRODUCT_QUALITY_VERDICT=CHANGES_REQUIRED or RC or PREMIUM_CANDIDATE or UNPROVEN
PRODUCT_QUALITY_SCORE=<0.0-10.0 or UNPROVEN>
PRODUCT_QUALITY_HARD_FAILS=<integer>
Do not award RC below the rubric threshold or when any hard fail exists.""",
    )

    final_head = git_output("rev-parse", "HEAD")
    final_review = manager_readonly(
        cycle,
        "manager-final-review",
        final_head,
        f"""Produce the final cycle review.
Feature integration: {json.dumps(feature_integration)}
Evolution Arena: {json.dumps(arena_evidence)}
Fix integration: {json.dumps(fix_integration)}
Polish accepted: {polished}
APK result: {clip(apk_result, 6000)}

Independent product-quality synthesis:
{clip(product_quality, 12000)}

Summarize what actually improved, what the team rejected, what remains unproven, and exact next-cycle
research priorities. Do not call missing evidence PASS.""",
    )

    quality_verdict = next(
        (line.split("=", 1)[1].strip() for line in product_quality.splitlines()
         if line.startswith("PRODUCT_QUALITY_VERDICT=")),
        "UNPROVEN",
    )
    quality_score = next(
        (line.split("=", 1)[1].strip() for line in product_quality.splitlines()
         if line.startswith("PRODUCT_QUALITY_SCORE=")),
        "UNPROVEN",
    )

    summary = {
        "cycle": cycle,
        "featureCandidates": len(feature_commits),
        "featuresAccepted": len(feature_integration["accepted"]),
        "fixCandidates": len(fix_commits),
        "fixesAccepted": len(fix_integration["accepted"]),
        "polishAccepted": polished,
        "apkState": next((line.split("=", 1)[1] for line in apk_result.splitlines() if line.startswith("APK_STAGE=")), "UNKNOWN"),
        "productQualityVerdict": quality_verdict,
        "productQualityScore": quality_score,
        "domainResearchReady": domain_audit.get("ready", 0),
        "domainResearchTotal": domain_audit.get("domains", 0),
        "domainResearchInsufficient": domain_audit.get("insufficient", []),
        "head": final_head,
    }
    autonomy_final = finalize_cycle(
        ROOT, ARTIFACT_ROOT, cycle, summary, product_quality, apk_result, AUTONOMY_CONTRACTS
    )
    summary["autonomy"] = autonomy_final

    tracked_history(
        cycle,
        f"# Seven Superloop Cycle {cycle}\n\n"
        f"Run: {RUN_ID}\n\n"
        f"## Machine summary\n\n```json\n{json.dumps(summary, indent=2)}\n```\n\n"
        f"## Manager final review\n\n{final_review}",
    )
    save_state(cycle, summary)
    commit_cycle_metadata(cycle)

    log("cycle complete: " + json.dumps(summary))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        log(f"FATAL: {exc}")
        write_artifact(0, "controller", "fatal", str(exc))
        raise
