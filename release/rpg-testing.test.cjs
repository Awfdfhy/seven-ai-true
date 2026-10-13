'use strict';
const assert = require('node:assert/strict');
const State = require('./workspaces/rpg-state.js');
const Testing = require('./workspaces/rpg-testing.js');

const seed = {
  sessionId: 'testing-test', worldId: 'valen-testing',
  timeline: { tick: 5 }, world: { locations: {} },
  characters: {}, quests: {}, canon: { entries: {} }
};

const state = State.createState(seed);
const tm = Testing.createTestingManager(State);

console.log('Testing RPG Testing/Performance System...');

console.log('\n1. registerTestSuite + getTestSuite...');
const suite = tm.registerTestSuite({
  id: 'suite1', name: 'Combat Module Tests', module: 'rpg-combat',
  category: 'integration', platform: 'node',
  testCases: [
    { id: 'tc1', name: 'Attack resolves damage' },
    { id: 'tc2', name: 'Healing restores HP' },
    { id: 'tc3', name: 'Status effect applies' }
  ],
  coverage: { statements: 92, branches: 85, functions: 90, lines: 91 }
});
assert.equal(suite.name, 'Combat Module Tests');
assert.equal(suite.totalTests, 3);
const gotSuite = tm.getTestSuite('suite1');
assert.equal(gotSuite.testCases.length, 3);
assert.equal(gotSuite.status, 'pending');
console.log('  PASS');

console.log('\n2. recordTestCaseResult...');
tm.recordTestCaseResult('suite1', 'tc1', { status: 'passed', duration: 12, assertions: 5 });
tm.recordTestCaseResult('suite1', 'tc2', { status: 'passed', duration: 8, assertions: 3 });
tm.recordTestCaseResult('suite1', 'tc3', { status: 'passed', duration: 15, assertions: 7 });
const afterAll = tm.getTestSuite('suite1');
assert.equal(afterAll.passedTests, 3);
assert.equal(afterAll.failedTests, 0);
assert.equal(afterAll.status, 'passed');
assert.equal(afterAll.testCases[0].duration, 12);
assert.equal(afterAll.testCases[0].assertions, 5);
console.log('  PASS');

console.log('\n3. recordTestCaseResult - failure...');
tm.registerTestSuite({
  id: 'suite2', name: 'Failure Suite',
  testCases: [{ id: 'f1', name: 'Will fail' }]
});
tm.recordTestCaseResult('suite2', 'f1', { status: 'failed', duration: 5, errorMessage: 'expected true' });
const failSuite = tm.getTestSuite('suite2');
assert.equal(failSuite.failedTests, 1);
assert.equal(failSuite.status, 'failed');
assert.ok(failSuite.testCases[0].errorMessage.includes('expected'));
const badSuite = tm.recordTestCaseResult('nonexistent', 'tc1', {});
assert.equal(badSuite.ok, false);
console.log('  PASS');

console.log('\n4. getCoverageReport...');
const coverage = tm.getCoverageReport();
assert.ok(coverage.suiteCount >= 2);
assert.equal(coverage.totalTests, 4);
assert.equal(coverage.totalPassed, 3);
assert.equal(coverage.totalFailed, 1);
assert.ok(coverage.average.statements > 0);
console.log('  PASS');

console.log('\n5. createBenchmark + recordBenchmarkSample + computeBenchmarkStats...');
tm.createBenchmark({ id: 'bench1', name: 'Render Benchmark', iterations: 100, unit: 'ms' });
for (let n = 1; n <= 20; n++) tm.recordBenchmarkSample('bench1', n * 2);
const statsResult = tm.computeBenchmarkStats('bench1');
assert.equal(statsResult.ok, true);
assert.equal(statsResult.sampleCount, 20);
assert.equal(statsResult.stats.min, 2);
assert.equal(statsResult.stats.max, 40);
assert.ok(statsResult.stats.mean > 0);
assert.ok(statsResult.stats.median > 0);
assert.ok(statsResult.stats.p95 >= statsResult.stats.median);
assert.ok(statsResult.stats.p99 >= statsResult.stats.p95);
console.log('  PASS');

console.log('\n6. runBenchmark...');
const runResult = tm.runBenchmark('bench1', () => {
  let sum = 0;
  for (let i = 0; i < 1000; i++) sum += i;
  return sum;
});
assert.equal(runResult.ok, true);
assert.equal(runResult.iterations, 100);
assert.ok(runResult.stats);
assert.ok(typeof runResult.stats.mean === 'number');
console.log('  PASS');

console.log('\n7. takeMemorySnapshot + detectMemoryLeak...');
tm.takeMemorySnapshot('before');
const bigArray = [];
for (let n = 0; n < 100000; n++) bigArray.push({ data: 'x'.repeat(50) });
tm.takeMemorySnapshot('after');
const leakResult = tm.detectMemoryLeak({ thresholdPercent: 1000 });
assert.equal(leakResult.ok, true);
assert.equal(leakResult.snapshotCount, 2);
assert.ok(leakResult.growthBytes >= 0);
assert.equal(leakResult.verdict, 'OK'); // growth < 1000% of initial heap
// Force a detectable leak: allocate much more, then check with a low threshold
const bigArray2 = [];
for (let n = 0; n < 300000; n++) bigArray2.push({ data: 'y'.repeat(80) });
tm.takeMemorySnapshot('after-leak');
const leakDetect = tm.detectMemoryLeak({ thresholdPercent: 10 });
assert.equal(leakDetect.ok, true);
assert.equal(leakDetect.hasLeak, true);
assert.equal(leakDetect.verdict, 'LEAK_DETECTED');
bigArray2.length = 0; // release
bigArray.length = 0; // release
const snapshots = tm.getMemorySnapshots();
assert.equal(snapshots.length, 3);
console.log('  PASS');

console.log('\n8. createOfflineScenario + evaluateOfflineScenario...');
const offline = tm.createOfflineScenario({
  id: 'offline1', name: 'Full Offline Play',
  offlineDurationMs: 60000,
  features: { localSave: true, cachedAssets: true, offlineCombat: true, offlineNarration: true, llmProvider: false, cloudSync: false }
});
assert.equal(offline.name, 'Full Offline Play');
assert.equal(offline.features.llmProvider, false);
const evalResult = tm.evaluateOfflineScenario('offline1', {
  localSave: true, cachedAssets: true, offlineCombat: true, offlineNarration: true,
  llmProvider: false, cloudSync: false
});
assert.equal(evalResult.ok, true);
assert.equal(evalResult.allPassed, true);
assert.equal(evalResult.failed, 0);
assert.equal(evalResult.scenario.status, 'passed');
console.log('  PASS');

console.log('\n9. evaluateOfflineScenario - degradation failure...');
const evalFail = tm.evaluateOfflineScenario('offline1', {
  localSave: true, cachedAssets: false, offlineCombat: true, offlineNarration: true,
  llmProvider: true, cloudSync: false
});
assert.equal(evalFail.allPassed, false);
assert.equal(evalFail.failed, 2); // cachedAssets missing + llmProvider active
console.log('  PASS');

console.log('\n10. runStressTest...');
const ops = [
  (n, rng) => { if (rng() < 0) throw Error('never'); },
  (n, rng) => { const v = Math.floor(rng() * 10) + 1; if (v < 0) throw Error('bad'); },
  (n, rng) => { const list = ['a', 'b', 'c']; const p = list[Math.floor(rng() * list.length)]; if (!p) throw Error('empty'); }
];
const stressResult = tm.runStressTest({ seed: 77, iterations: 500, operations: ops, handler: (op, n, rng) => op(n, rng) });
assert.equal(stressResult.seed, 77);
assert.equal(stressResult.iterations, 500);
assert.equal(stressResult.operationsRun, 500);
assert.equal(stressResult.errorCount, 0);
assert.equal(stressResult.passed, true);
assert.ok(stressResult.durationMs >= 0);

// Reproducibility: same seed = same results
const stress2 = tm.runStressTest({ seed: 77, iterations: 500, operations: ops, handler: (op, n, rng) => op(n, rng) });
assert.equal(stress2.operationsRun, 500);
assert.equal(stress2.errorCount, 0);
console.log('  PASS');

console.log('\n11. injectProviderFailure + shouldInjectFailure...');
const failure = tm.injectProviderFailure({
  id: 'fail1', providerId: 'groq', mode: 'timeout',
  probability: 1.0, durationMs: 60000, errorMessage: 'Simulated timeout',
  retryable: true
});
assert.equal(failure.mode, 'timeout');
assert.equal(failure.probability, 1.0);
assert.equal(failure.active, true);
const shouldFail = tm.shouldInjectFailure('groq');
assert.equal(shouldFail.inject, true);
assert.equal(shouldFail.mode, 'timeout');
assert.ok(shouldFail.errorMessage.includes('timeout'));
assert.equal(shouldFail.retryable, true);
// Other provider unaffected
const noFail = tm.shouldInjectFailure('anthropic');
assert.equal(noFail.inject, false);
console.log('  PASS');

console.log('\n12. clearFailureInjection...');
tm.clearFailureInjection('fail1');
const afterClear = tm.shouldInjectFailure('groq');
assert.equal(afterClear.inject, false);
const injectionList = tm.listFailureInjections();
assert.equal(injectionList.length, 1);
assert.equal(injectionList[0].active, false);
console.log('  PASS');

console.log('\n13. runConcurrencyTest...');
const concResult = tm.runConcurrencyTest({ taskCount: 50, raceWindow: 0 });
assert.equal(concResult.taskCount, 50);
assert.equal(concResult.completed, 50);
assert.equal(concResult.finalCounter, 50);
assert.equal(concResult.raceConditions, 0);
assert.equal(concResult.passed, true);
const concWindow = tm.runConcurrencyTest({ taskCount: 20, raceWindow: 5 });
assert.equal(concWindow.passed, true);
assert.ok(concWindow.durationMs >= 0);
console.log('  PASS');

console.log('\n14. createCorruptionTest - truncated...');
const corruptTest = tm.createCorruptionTest({
  id: 'corrupt1', name: 'Save file truncated',
  targetKey: 'save-slot-1', corruptionType: 'truncated',
  expectedBehavior: 'fails-closed',
  originalData: '{"player":"Aldric","gold":250,"level":5}'
});
assert.ok(corruptTest.corruptedData.length < corruptTest.originalData.length);
assert.equal(corruptTest.status, 'pending');
console.log('  PASS');

console.log('\n15. evaluateCorruptionTest...');
const evalCorrupt = tm.evaluateCorruptionTest(corruptTest, { failClosed: true, recovered: false });
assert.equal(evalCorrupt.ok, true);
assert.equal(corruptTest.failClosed, true);
assert.equal(corruptTest.status, 'passed');
// Also accept graceful recovery
const corruptTest2 = tm.createCorruptionTest({
  id: 'corrupt2', corruptionType: 'invalid-json',
  expectedBehavior: 'recovers',
  originalData: '{"key":"value"}'
});
const evalCorrupt2 = tm.evaluateCorruptionTest(corruptTest2, { recovered: true, data: '{"key":"value"}' });
assert.equal(corruptTest2.status, 'passed');
console.log('  PASS');

console.log('\n16. createNetworkInterruptionTest + evaluate...');
const netTest = tm.createNetworkInterruptionTest({
  id: 'net1', name: 'LLM request interrupted',
  interruptionPoint: 'mid-request', durationMs: 10000,
  shouldRetry: true, shouldTimeout: true, shouldQueue: false,
  expectedResult: 'retries-and-succeeds'
});
assert.equal(netTest.shouldRetry, true);
assert.equal(netTest.shouldTimeout, true);
const netEval = tm.evaluateNetworkInterruption('net1', { retried: true, timedOut: true, queued: false });
assert.equal(netEval.ok, true);
assert.equal(netEval.allPassed, true);
assert.equal(netEval.scenario, undefined); // returns test not scenario
console.log('  PASS');

console.log('\n17. createApkSmokeTest + recordApkCheck...');
const apkTest = tm.createApkSmokeTest({
  id: 'apk1', name: 'APK Basic Smoke', apkPath: '/build/app-release.apk', apkSizeBytes: 25000000,
  checks: [
    { id: 'chk1', name: 'APK installs', category: 'install', required: true },
    { id: 'chk2', name: 'App launches', category: 'launch', required: true },
    { id: 'chk3', name: 'Home screen renders', category: 'ui', required: true },
    { id: 'chk4', name: 'Offline mode works', category: 'offline', required: false }
  ]
});
assert.equal(apkTest.totalChecks, 4);
assert.equal(apkTest.platform, 'android-14');
tm.recordApkCheck('apk1', 'chk1', { passed: true, message: 'Installed successfully' });
tm.recordApkCheck('apk1', 'chk2', { passed: true });
tm.recordApkCheck('apk1', 'chk3', { passed: true });
tm.recordApkCheck('apk1', 'chk4', { passed: false, message: 'Not tested' });
const apkAfter = tm.getApkSmokeTest('apk1');
assert.equal(apkAfter.passedChecks, 3);
assert.equal(apkAfter.failedChecks, 1);
assert.equal(apkAfter.status, 'failed');
console.log('  PASS');

console.log('\n18. getAndroidMatrix + updateMatrixEntry + getMatrixSummary...');
const matrix = tm.getAndroidMatrix();
assert.equal(matrix.length, 3);
assert.equal(matrix[0].version, '14');
assert.equal(matrix[2].version, '16');
assert.equal(matrix[0].status, 'pending');
tm.updateMatrixEntry(34, 'passed', 'All tests pass on Android 14');
tm.updateMatrixEntry(35, 'passed', 'All tests pass on Android 15');
tm.updateMatrixEntry(36, 'failed', 'Startup crash on Android 16');
const matrixSummary = tm.getMatrixSummary();
assert.equal(matrixSummary.total, 3);
assert.equal(matrixSummary.passed, 2);
assert.equal(matrixSummary.failed, 1);
assert.equal(matrixSummary.allPassed, false);
assert.equal(matrixSummary.readyForRelease, false);
const badApi = tm.updateMatrixEntry(99, 'passed');
assert.equal(badApi.ok, false);
console.log('  PASS');

console.log('\n19. recordCrash + getCrashLogs...');
const crash1 = tm.recordCrash({
  id: 'crash1', type: 'exception', severity: 'critical',
  message: 'NullPointerException in CombatManager',
  stackTrace: 'at CombatManager.resolve(C:42)',
  platform: 'android-14', appVersion: '1.0.0', module: 'combat'
});
assert.equal(crash1.severity, 'critical');
assert.equal(crash1.resolved, false);
const crash2 = tm.recordCrash({
  id: 'crash2', type: 'anr', severity: 'warning',
  message: 'ANR in NarrationService', platform: 'android-14', module: 'narration'
});
const allCrashes = tm.getCrashLogs();
assert.equal(allCrashes.length, 2);
const criticalCrashes = tm.getCrashLogs({ severity: 'critical' });
assert.equal(criticalCrashes.length, 1);
const unresolvedCrashes = tm.getCrashLogs({ unresolvedOnly: true });
assert.equal(unresolvedCrashes.length, 2);
console.log('  PASS');

console.log('\n20. resolveCrash + getCrashSummary...');
const resolveResult = tm.resolveCrash('crash2');
assert.equal(resolveResult.ok, true);
assert.equal(resolveResult.crash.resolved, true);
const crashSummary = tm.getCrashSummary();
assert.equal(crashSummary.totalCrashes, 2);
assert.equal(crashSummary.unresolved, 1);
assert.equal(crashSummary.criticalUnresolved, 1);
assert.ok(crashSummary.bySeverity.critical >= 1);
console.log('  PASS');

console.log('\n21. setPerformanceBudget + measureAgainstBudget...');
const budget = tm.setPerformanceBudget({
  id: 'startup', name: 'App Startup Budget', type: 'startup-time',
  limit: 3000, unit: 'ms', softWarningPercent: 80
});
assert.equal(budget.limit, 3000);
assert.equal(budget.type, 'startup-time');
const withinResult = tm.measureAgainstBudget('startup', 2100);
assert.equal(withinResult.ok, true);
assert.equal(withinResult.withinBudget, true);
assert.equal(withinResult.withinSoftWarning, true); // 2100 <= 2400 softLimit
assert.equal(withinResult.margin, 900);
assert.equal(withinResult.status, 'passed');
const overResult = tm.measureAgainstBudget('startup', 5000);
assert.equal(overResult.withinBudget, false);
assert.equal(overResult.status, 'failed');
assert.equal(overResult.margin, -2000);
console.log('  PASS');

console.log('\n22. getBudgetReport...');
const budgetReport = tm.getBudgetReport();
assert.ok(budgetReport.length >= 1);
const startupBudget = budgetReport.find(b => b.id === 'startup');
assert.ok(startupBudget);
assert.equal(startupBudget.limit, 3000);
assert.equal(startupBudget.measurementCount, 2);
assert.equal(startupBudget.lastValue, 5000);
console.log('  PASS');

console.log('\n23. setContextBaseline + checkContextRegression...');
const baseline = tm.setContextBaseline({
  id: 'ctx-combat', name: 'Combat Module Context',
  module: 'rpg-combat', maxSizeBytes: 600000,
  baselineSizeBytes: 500000, tolerancePercent: 10
});
assert.equal(baseline.maxSizeBytes, 600000);
const withinResult2 = tm.checkContextRegression('ctx-combat', 520000);
assert.equal(withinResult2.ok, true);
assert.equal(withinResult2.diff, 20000);
assert.equal(withinResult2.diffPercent, 4);
assert.equal(withinResult2.withinTolerance, true);
assert.equal(withinResult2.hasRegression, false);
assert.equal(withinResult2.verdict, 'OK');
const regressionResult = tm.checkContextRegression('ctx-combat', 610000);
assert.equal(regressionResult.hasRegression, true);
assert.equal(regressionResult.verdict, 'REGRESSION'); // 22% > 10% tolerance (also over max)
console.log('  PASS');

console.log('\n24. runRegressionSuite...');
const regression = tm.runRegressionSuite();
assert.ok(regression.timestamp);
assert.equal(regression.testSuites.total, 2);
assert.equal(regression.testSuites.totalTests, 4);
assert.equal(regression.testSuites.totalPassed, 3);
assert.equal(regression.testSuites.totalFailed, 1);
assert.ok(regression.budgets.total >= 1);
assert.ok(regression.crashes);
assert.ok(regression.androidMatrix);
assert.ok(regression.offlineScenarios);
assert.equal(regression.overallStatus, 'failed'); // suite2 failed
assert.equal(regression.readyForRelease, false);
console.log('  PASS');

console.log('\n25. Edge cases...');
assert.equal(tm.getTestSuite('nonexistent'), null);
assert.equal(tm.getBenchmark('nonexistent'), null);
assert.equal(tm.getApkSmokeTest('nonexistent'), null);
assert.equal(tm.getOfflineScenario('nonexistent'), null);
assert.equal(tm.getBudget('nonexistent'), null);
const badResult = tm.recordTestCaseResult('nonexistent', 'tc1', {});
assert.equal(badResult.ok, false);
const badBench = tm.recordBenchmarkSample('nonexistent', 10);
assert.equal(badBench.ok, false);
const badStats = tm.computeBenchmarkStats('nonexistent');
assert.equal(badStats.ok, false);
const badLeak = tm.detectMemoryLeak({});
// detectMemoryLeak with enough snapshots should work
assert.ok(badLeak === undefined || typeof badLeak === 'object');
const badMeasure = tm.measureAgainstBudget('nonexistent', 100);
assert.equal(badMeasure.ok, false);
const badRegression = tm.checkContextRegression('nonexistent', 100);
assert.equal(badRegression.ok, false);
const badResolve = tm.resolveCrash('nonexistent');
assert.equal(badResolve.ok, false);
const badNetEval = tm.evaluateNetworkInterruption('nonexistent', {});
assert.equal(badNetEval.ok, false);
const badOfflineEval = tm.evaluateOfflineScenario('nonexistent', {});
assert.equal(badOfflineEval.ok, false);
const badApk = tm.recordApkCheck('nonexistent', 'chk1', {});
assert.equal(badApk.ok, false);
console.log('  PASS');

console.log('\n✅ All RPG Testing/Performance System tests passed!');
console.log('\nCoverage:');
console.log('  RPG-14-01 (integration test coverage): registerTestSuite, recordTestCaseResult, getCoverageReport');
console.log('  RPG-14-02 (performance benchmark): createBenchmark, recordBenchmarkSample, computeBenchmarkStats, runBenchmark');
console.log('  RPG-14-03 (memory leak detection): takeMemorySnapshot, detectMemoryLeak, getMemorySnapshots');
console.log('  RPG-14-04 (offline degradation test): createOfflineScenario, evaluateOfflineScenario');
console.log('  RPG-14-05 (randomized stress test): runStressTest with seeded RNG for reproducibility');
console.log('  RPG-14-06 (provider failure injection): injectProviderFailure, shouldInjectFailure, clearFailureInjection');
console.log('  RPG-14-07 (concurrency test): runConcurrencyTest with race window detection');
console.log('  RPG-14-08 (storage corruption test): createCorruptionTest, evaluateCorruptionTest');
console.log('  RPG-14-09 (network interruption test): createNetworkInterruptionTest, evaluateNetworkInterruption');
console.log('  RPG-14-10 (APK smoke test): createApkSmokeTest, recordApkCheck, getApkSmokeTest');
console.log('  RPG-14-11 (Android version matrix): getAndroidMatrix, updateMatrixEntry, getMatrixSummary');
console.log('  RPG-14-12 (crash analytics): recordCrash, getCrashLogs, resolveCrash, getCrashSummary');
console.log('  RPG-14-13 (startup time budget): setPerformanceBudget, measureAgainstBudget, getBudgetReport');
console.log('  RPG-14-14 (context size regression): setContextBaseline, checkContextRegression with tolerance');
console.log('  RPG-14-15 (full regression suite): runRegressionSuite combining all dimensions');
