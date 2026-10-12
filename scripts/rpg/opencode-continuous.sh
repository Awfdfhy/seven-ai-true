#!/usr/bin/env bash
set -uo pipefail

# Runs one bounded OpenCode iteration at a time. Requires an always-on machine,
# a configured OpenCode provider and an existing checkout of the RPG branch.
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PLAN="docs/seven-rpg/OPENCODE_CONTINUOUS_PLAN.md"
LOGDIR="$ROOT/.opencode-rpg-logs"
mkdir -p "$LOGDIR"
cd "$ROOT" || exit 1
command -v opencode >/dev/null 2>&1 || { echo "Install OpenCode CLI first" >&2; exit 127; }
[[ "$(git branch --show-current)" == "rpg/standalone-20261011" ]] || { echo "Refusing to run outside RPG branch" >&2; exit 2; }
[[ -f "$PLAN" ]] || { echo "Plan not found: $PLAN" >&2; exit 3; }
[[ -z "$(git status --porcelain)" ]] || { echo "Working tree must be clean before starting" >&2; exit 4; }

echo "RPG OpenCode loop starting. Logs: $LOGDIR. Stop: kill this process."
while true; do
  stamp="$(date -u +%Y%m%dT%H%M%SZ)"
  logfile="$LOGDIR/$stamp.log"
  echo "[$stamp] Begin iteration" | tee -a "$LOGDIR/status.log"
  prompt="Read $PLAN AND docs/seven-rpg/FEATURE_ROADMAP.md completely. Follow the roadmap priority IDs and non-destructive policies. Inspect current RPG branch, GitHub Actions, then implement ONE highest-priority safely verifiable unfinished task. Run tests and record honest results. Make no unauthorized merges or deletions. If blocked, document why. Conclude this iteration with SHA, evidence, and next task."
  if command -v timeout >/dev/null 2>&1; then
    timeout --signal=TERM --kill-after=30s 90m opencode run "$prompt" >"$logfile" 2>&1
    code=$?
  else
    opencode run "$prompt" >"$logfile" 2>&1
    code=$?
  fi
  echo "[$(date -u +%FT%TZ)] iteration exit=$code log=$logfile" | tee -a "$LOGDIR/status.log"
  sleep 60
done
