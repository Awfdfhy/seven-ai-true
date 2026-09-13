"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.resolve(__dirname, "..");
const TASKS_PATH = path.join(ROOT, "eval", "tasks.jsonl");
const BASELINE_PATH = path.join(ROOT, "eval", "baseline.json");

function sha256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function readCurrentEvalIdentity() {
  const tasksBuffer = fs.readFileSync(TASKS_PATH);
  const baseline = JSON.parse(fs.readFileSync(BASELINE_PATH, "utf8"));
  const taskCount = tasksBuffer.toString("utf8").split(/\r?\n/).filter(Boolean).length;
  if (baseline.format !== "seven-eval-baseline") throw new Error("invalid eval baseline format");
  if (!baseline.baselineCommit) throw new Error("eval baseline commit missing");
  return Object.freeze({
    format: "seven-eval-lock",
    version: 1,
    baselineCommit: String(baseline.baselineCommit),
    taskCorpusVersion: Number(baseline.taskCorpusVersion || 0),
    corpusHash: sha256(tasksBuffer),
    taskCount
  });
}

function createEvalLock(metadata = {}) {
  const identity = readCurrentEvalIdentity();
  return Object.freeze({
    ...identity,
    createdAt: new Date().toISOString(),
    purpose: String(metadata.purpose || "candidate-evaluation"),
    experimentId: metadata.experimentId == null ? null : String(metadata.experimentId)
  });
}

function verifyEvalLock(lock) {
  const current = readCurrentEvalIdentity();
  const reasons = [];
  if (!lock || typeof lock !== "object" || Array.isArray(lock)) reasons.push("lock_missing");
  else {
    if (lock.format !== current.format || Number(lock.version) !== current.version) reasons.push("lock_format_mismatch");
    if (String(lock.baselineCommit || "") !== current.baselineCommit) reasons.push("baseline_changed");
    if (Number(lock.taskCorpusVersion) !== current.taskCorpusVersion) reasons.push("corpus_version_changed");
    if (String(lock.corpusHash || "") !== current.corpusHash) reasons.push("corpus_hash_changed");
    if (Number(lock.taskCount) !== current.taskCount) reasons.push("task_count_changed");
  }
  return {
    valid: reasons.length === 0,
    reasons,
    expected: current,
    observed: lock && typeof lock === "object" ? {
      format: lock.format,
      version: lock.version,
      baselineCommit: lock.baselineCommit,
      taskCorpusVersion: lock.taskCorpusVersion,
      corpusHash: lock.corpusHash,
      taskCount: lock.taskCount
    } : null
  };
}

function assertEvalLock(lock) {
  const verification = verifyEvalLock(lock);
  if (!verification.valid) {
    const error = new Error(`evaluation lock invalid: ${verification.reasons.join(",")}`);
    error.code = "EVAL_LOCK_INVALID";
    error.verification = verification;
    throw error;
  }
  return verification;
}

module.exports = { readCurrentEvalIdentity, createEvalLock, verifyEvalLock, assertEvalLock };
