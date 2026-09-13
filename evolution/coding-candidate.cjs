"use strict";

const { validateChangedPaths } = require("./experiment-lab.cjs");

const REQUIRED_AGENT_METHODS = Object.freeze([
  "getStableHeadSha",
  "prepareCandidate",
  "reproduce",
  "repair",
  "review",
  "regression",
  "getChangedPaths",
  "getCandidateSha",
  "discardCandidate",
  "restoreStable"
]);

function assertCodingAgent(agent) {
  for (const method of REQUIRED_AGENT_METHODS) {
    if (!agent || typeof agent[method] !== "function") throw new Error(`coding agent adapter missing ${method}`);
  }
}

function commitLike(value) {
  return /^[0-9a-f]{7,64}$/i.test(String(value || "").trim());
}

async function restoreIfStableChanged({ agent, baselineSha, reason }) {
  const observed = await agent.getStableHeadSha();
  if (observed === baselineSha) return { stable: true, observed };
  try {
    await agent.restoreStable({ baselineSha, reason });
    const restored = await agent.getStableHeadSha();
    return {
      stable: restored === baselineSha,
      observed,
      restored,
      repaired: restored === baselineSha
    };
  } catch (error) {
    return {
      stable: false,
      observed,
      restored: null,
      repaired: false,
      error: String(error && error.message || error)
    };
  }
}

async function discardBestEffort(agent, context, reason) {
  try {
    await agent.discardCandidate({ ...context, reason });
    return null;
  } catch (error) {
    return String(error && error.message || error);
  }
}

async function runCodingCandidate({ experiment, baselineSha, agent, maxAttempts = 3 } = {}) {
  if (!experiment) throw new Error("experiment required");
  if (!commitLike(baselineSha)) throw new Error("baselineSha must be commit-like");
  assertCodingAgent(agent);
  const attempts = Math.max(1, Math.min(10, Number(maxAttempts) || 3));

  const initialHead = await agent.getStableHeadSha();
  if (initialHead !== baselineSha) {
    return { outcome: "REJECTED_BASE_DRIFT", stage: "PREPARE", expected: baselineSha, observed: initialHead };
  }

  const prepared = await agent.prepareCandidate({
    experiment,
    baselineSha,
    allowedPaths: [...experiment.allowedPaths]
  });
  if (!prepared || prepared.isolated !== true || prepared.baselineSha !== baselineSha || !prepared.workspaceId) {
    await discardBestEffort(agent, { experiment, workspaceId: prepared && prepared.workspaceId }, "invalid_isolation_proof");
    return { outcome: "REJECTED_ISOLATION", stage: "PREPARE" };
  }
  const context = { experiment, baselineSha, workspaceId: String(prepared.workspaceId) };

  const prepareStable = await restoreIfStableChanged({ agent, baselineSha, reason: "stable_changed_during_prepare" });
  if (!prepareStable.stable) {
    return { outcome: "HALT_STABLE_RESTORE_FAILED", stage: "PREPARE", stable: prepareStable };
  }
  if (prepareStable.repaired) {
    await discardBestEffort(agent, context, "stable_mutation_during_prepare");
    return { outcome: "REJECTED_STABLE_MUTATION", stage: "PREPARE", stable: prepareStable };
  }

  const reproduction = await agent.reproduce(context);
  const reproduceStable = await restoreIfStableChanged({ agent, baselineSha, reason: "stable_changed_during_reproduce" });
  if (!reproduceStable.stable) {
    return { outcome: "HALT_STABLE_RESTORE_FAILED", stage: "REPRODUCE", stable: reproduceStable };
  }
  if (reproduceStable.repaired) {
    await discardBestEffort(agent, context, "stable_mutation_during_reproduce");
    return { outcome: "REJECTED_STABLE_MUTATION", stage: "REPRODUCE", stable: reproduceStable };
  }
  if (!reproduction || reproduction.reproduced !== true) {
    const discardError = await discardBestEffort(agent, context, "not_reproduced");
    return { outcome: "REJECTED_NOT_REPRODUCED", stage: "REPRODUCE", reproduction, discardError };
  }

  const history = [{ stage: "REPRODUCE", result: reproduction }];
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const repair = await agent.repair({ ...context, attempt, reproduction });
    history.push({ stage: "REPAIR", attempt, result: repair });
    const repairStable = await restoreIfStableChanged({ agent, baselineSha, reason: `stable_changed_during_repair_${attempt}` });
    if (!repairStable.stable) {
      return { outcome: "HALT_STABLE_RESTORE_FAILED", stage: "REPAIR", attempt, stable: repairStable, history };
    }
    if (repairStable.repaired) {
      await discardBestEffort(agent, context, "stable_mutation_during_repair");
      return { outcome: "REJECTED_STABLE_MUTATION", stage: "REPAIR", attempt, stable: repairStable, history };
    }
    if (!repair || repair.changed !== true) {
      const discardError = await discardBestEffort(agent, context, "repair_made_no_change");
      return { outcome: "REJECTED_NO_CHANGE", stage: "REPAIR", attempt, history, discardError };
    }

    const changedPaths = await agent.getChangedPaths(context);
    const scope = validateChangedPaths(experiment, changedPaths || []);
    if (!scope.valid) {
      const discardError = await discardBestEffort(agent, context, "scope_violation");
      return { outcome: "REJECTED_SCOPE", stage: "SCOPE", attempt, scope, history, discardError };
    }

    const review = await agent.review({ ...context, attempt, changedPaths: scope.changedPaths, repair });
    history.push({ stage: "REVIEW", attempt, result: review });
    const reviewStable = await restoreIfStableChanged({ agent, baselineSha, reason: `stable_changed_during_review_${attempt}` });
    if (!reviewStable.stable) {
      return { outcome: "HALT_STABLE_RESTORE_FAILED", stage: "REVIEW", attempt, stable: reviewStable, history };
    }
    if (reviewStable.repaired) {
      await discardBestEffort(agent, context, "stable_mutation_during_review");
      return { outcome: "REJECTED_STABLE_MUTATION", stage: "REVIEW", attempt, stable: reviewStable, history };
    }
    if (!review || review.approved !== true) {
      if (attempt === attempts) {
        const discardError = await discardBestEffort(agent, context, "review_rejected_max_attempts");
        return { outcome: "REJECTED_REVIEW", stage: "REVIEW", attempt, history, discardError };
      }
      continue;
    }

    const regression = await agent.regression({ ...context, attempt, changedPaths: scope.changedPaths, review });
    history.push({ stage: "REGRESSION_GATE", attempt, result: regression });
    const regressionStable = await restoreIfStableChanged({ agent, baselineSha, reason: `stable_changed_during_regression_${attempt}` });
    if (!regressionStable.stable) {
      return { outcome: "HALT_STABLE_RESTORE_FAILED", stage: "REGRESSION_GATE", attempt, stable: regressionStable, history };
    }
    if (regressionStable.repaired) {
      await discardBestEffort(agent, context, "stable_mutation_during_regression");
      return { outcome: "REJECTED_STABLE_MUTATION", stage: "REGRESSION_GATE", attempt, stable: regressionStable, history };
    }
    if (!regression || regression.passed !== true) {
      if (attempt === attempts) {
        const discardError = await discardBestEffort(agent, context, "regression_failed_max_attempts");
        return { outcome: "REJECTED_REGRESSION", stage: "REGRESSION_GATE", attempt, history, discardError };
      }
      continue;
    }

    const candidateSha = await agent.getCandidateSha(context);
    if (!commitLike(candidateSha) || candidateSha === baselineSha) {
      const discardError = await discardBestEffort(agent, context, "invalid_candidate_sha");
      return { outcome: "REJECTED_CANDIDATE_SHA", stage: "FINALIZE", attempt, candidateSha, history, discardError };
    }

    const finalStable = await restoreIfStableChanged({ agent, baselineSha, reason: "stable_changed_before_candidate_finalize" });
    if (!finalStable.stable) {
      return { outcome: "HALT_STABLE_RESTORE_FAILED", stage: "FINALIZE", attempt, stable: finalStable, history };
    }
    if (finalStable.repaired) {
      await discardBestEffort(agent, context, "stable_mutation_before_finalize");
      return { outcome: "REJECTED_STABLE_MUTATION", stage: "FINALIZE", attempt, stable: finalStable, history };
    }

    return {
      outcome: "PASS",
      stage: "COMPLETE",
      workspaceId: context.workspaceId,
      baselineSha,
      candidateSha,
      changedPaths: scope.changedPaths,
      attempts: attempt,
      history
    };
  }

  const discardError = await discardBestEffort(agent, context, "attempts_exhausted");
  return { outcome: "REJECTED_ATTEMPTS", stage: "COMPLETE", history, discardError };
}

module.exports = {
  REQUIRED_AGENT_METHODS,
  assertCodingAgent,
  commitLike,
  restoreIfStableChanged,
  discardBestEffort,
  runCodingCandidate
};
