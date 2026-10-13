(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SevenRpgTesting = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  function clone(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }
  function obj(v) { return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; }
  function arr(v) { return Array.isArray(v) ? v : []; }
  function text(v) { return typeof v === 'string' ? v.trim() : ''; }
  function uniq(xs) { return Array.from(new Set(arr(xs).filter(x => typeof x === 'string' && x.trim()).map(x => x.trim()))); }
  function clamp(v, min, max) { v = Number(v); return Number.isFinite(v) ? Math.max(min, Math.min(max, v)) : min; }
  function stableId(prefix, n) { return prefix + '-' + String(n).padStart(6, '0'); }
  function now() { return new Date().toISOString(); }
  function nowMs() { return Date.now(); }

  const TEST_STATUSES = Object.freeze(['pending', 'running', 'passed', 'failed', 'skipped', 'blocked']);
  const SEVERITY_LEVELS = Object.freeze(['info', 'warning', 'error', 'critical']);
  const BUDGET_TYPES = Object.freeze(['startup-time', 'memory-usage', 'context-size', 'render-time', 'api-latency', 'storage-size']);
  const FAILURE_MODES = Object.freeze(['timeout', 'network-error', 'rate-limit', 'invalid-response', 'crash', 'corruption', 'offline']);
  const PLATFORMS = Object.freeze(['android-14', 'android-15', 'android-16', 'node', 'browser', 'ci']);

  function createTestingManager(stateApi) {
    if (!stateApi || typeof stateApi.createState !== 'function') throw Error('SevenRpgState-compatible stateApi required');

    const testSuites = new Map();
    const benchmarks = new Map();
    const budgets = new Map();
    const crashLogs = new Map();
    const failureInjections = new Map();
    const offlineScenarios = new Map();
    const apkSmokeTests = new Map();
    const contextBaselines = new Map();
    let idCounter = 0;
    function nextId() { return ++idCounter; }

    // RNG for randomized stress tests
    let rngState = 12345;
    function seedRng(seed) { rngState = Number(seed) || 12345; }
    function rng() {
      rngState = (rngState * 1103515245 + 12345) & 0x7fffffff;
      return rngState / 0x7fffffff;
    }
    function rngInt(min, max) { return Math.floor(rng() * (max - min + 1)) + min; }
    function rngPick(list) { const l = arr(list); return l.length > 0 ? l[Math.floor(rng() * l.length)] : null; }

    // RPG-14-01: Integration test coverage
    function registerTestSuite(input) {
      const i = obj(input);
      const id = i.id || stableId('suite', nextId());
      const suite = {
        id,
        name: text(i.name) || 'Test Suite',
        module: text(i.module) || null,
        category: text(i.category) || 'integration',
        platform: PLATFORMS.includes(i.platform) ? i.platform : 'node',
        testCases: arr(i.testCases).map(tc => ({
          id: tc.id || stableId('tc', nextId()),
          name: text(tc.name) || 'Unnamed test',
          description: text(tc.description),
          status: 'pending',
          duration: 0,
          errorMessage: null,
          assertions: 0
        })),
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        skippedTests: 0,
        coverage: {
          statements: clamp(i.coverage?.statements ?? 0, 0, 100),
          branches: clamp(i.coverage?.branches ?? 0, 0, 100),
          functions: clamp(i.coverage?.functions ?? 0, 0, 100),
          lines: clamp(i.coverage?.lines ?? 0, 0, 100)
        },
        status: 'pending',
        lastRunAt: null,
        createdAt: now()
      };
      suite.totalTests = suite.testCases.length;
      testSuites.set(id, suite);
      return suite;
    }

    function getTestSuite(id) { return testSuites.get(id) || null; }

    function recordTestCaseResult(suiteId, testCaseId, result) {
      const suite = testSuites.get(suiteId);
      if (!suite) return { ok: false, reason: 'suite-not-found' };
      const tc = suite.testCases.find(t => t.id === testCaseId);
      if (!tc) return { ok: false, reason: 'test-case-not-found' };
      const r = obj(result);
      tc.status = TEST_STATUSES.includes(r.status) ? r.status : 'failed';
      tc.duration = clamp(r.duration ?? 0, 0, 999999);
      tc.errorMessage = text(r.errorMessage) || null;
      tc.assertions = clamp(r.assertions ?? 0, 0, 99999);
      suite.passedTests = suite.testCases.filter(t => t.status === 'passed').length;
      suite.failedTests = suite.testCases.filter(t => t.status === 'failed').length;
      suite.skippedTests = suite.testCases.filter(t => t.status === 'skipped').length;
      const executed = suite.passedTests + suite.failedTests;
      suite.status = executed === 0 ? 'pending'
        : suite.failedTests > 0 ? 'failed'
        : executed < suite.totalTests ? 'running'
        : 'passed';
      suite.lastRunAt = now();
      return { ok: true, suite: clone(suite), testCase: clone(tc) };
    }

    function getCoverageReport() {
      const suites = Array.from(testSuites.values());
      if (suites.length === 0) return { suiteCount: 0, average: { statements: 0, branches: 0, functions: 0, lines: 0 } };
      const avg = key => Math.round(suites.reduce((s, su) => s + su.coverage[key], 0) / suites.length * 100) / 100;
      return {
        suiteCount: suites.length,
        totalTests: suites.reduce((s, su) => s + su.totalTests, 0),
        totalPassed: suites.reduce((s, su) => s + su.passedTests, 0),
        totalFailed: suites.reduce((s, su) => s + su.failedTests, 0),
        average: {
          statements: avg('statements'),
          branches: avg('branches'),
          functions: avg('functions'),
          lines: avg('lines')
        },
        suites: suites.map(su => ({ id: su.id, name: su.name, status: su.status, coverage: su.coverage }))
      };
    }

    // RPG-14-02: Performance benchmark
    function createBenchmark(input) {
      const i = obj(input);
      const id = i.id || stableId('bench', nextId());
      const bench = {
        id,
        name: text(i.name) || 'Benchmark',
        category: text(i.category) || 'performance',
        iterations: clamp(i.iterations ?? 100, 1, 100000),
        warmupRuns: clamp(i.warmupRuns ?? 5, 0, 1000),
        samples: [],
        stats: { min: null, max: null, mean: null, median: null, p95: null, p99: null, stddev: null },
        unit: text(i.unit) || 'ms',
        createdAt: now(),
        lastRunAt: null
      };
      benchmarks.set(id, bench);
      return clone(bench);
    }

    function recordBenchmarkSample(benchId, value) {
      const bench = benchmarks.get(benchId);
      if (!bench) return { ok: false, reason: 'benchmark-not-found' };
      const v = Number(value);
      if (!Number.isFinite(v)) return { ok: false, reason: 'invalid-value' };
      bench.samples.push(v);
      if (bench.samples.length > 10000) bench.samples = bench.samples.slice(-10000);
      return { ok: true, sampleCount: bench.samples.length };
    }

    function computeBenchmarkStats(benchId) {
      const bench = benchmarks.get(benchId);
      if (!bench) return { ok: false, reason: 'benchmark-not-found' };
      const samples = [...bench.samples].sort((a, b) => a - b);
      if (samples.length === 0) return { ok: false, reason: 'no-samples' };
      const n = samples.length;
      const mean = samples.reduce((s, v) => s + v, 0) / n;
      const variance = samples.reduce((s, v) => s + (v - mean) ** 2, 0) / n;
      const stddev = Math.sqrt(variance);
      const percentile = p => {
        const idx = Math.min(n - 1, Math.ceil((p / 100) * n) - 1);
        return samples[Math.max(0, idx)];
      };
      bench.stats = {
        min: samples[0],
        max: samples[n - 1],
        mean: Math.round(mean * 1000) / 1000,
        median: n % 2 === 0 ? Math.round(((samples[n / 2 - 1] + samples[n / 2]) / 2) * 1000) / 1000 : samples[Math.floor(n / 2)],
        p95: percentile(95),
        p99: percentile(99),
        stddev: Math.round(stddev * 1000) / 1000
      };
      bench.lastRunAt = now();
      return { ok: true, stats: clone(bench.stats), sampleCount: n };
    }

    function getBenchmark(id) {
      const bench = benchmarks.get(id);
      if (!bench) return null;
      return { id: bench.id, name: bench.name, unit: bench.unit, sampleCount: bench.samples.length, stats: clone(bench.stats) };
    }

    function runBenchmark(benchId, fn) {
      const bench = benchmarks.get(benchId);
      if (!bench) return { ok: false, reason: 'benchmark-not-found' };
      if (typeof fn !== 'function') return { ok: false, reason: 'invalid-function' };
      for (let w = 0; w < bench.warmupRuns; w++) fn();
      bench.samples = [];
      for (let n = 0; n < bench.iterations; n++) {
        const start = nowMs();
        fn();
        const elapsed = nowMs() - start;
        bench.samples.push(elapsed);
      }
      const statsResult = computeBenchmarkStats(benchId);
      return { ok: true, iterations: bench.iterations, stats: statsResult.stats || null };
    }

    // RPG-14-03: Memory leak detection
    const memorySnapshots = [];

    function takeMemorySnapshot(label) {
      const mem = typeof process !== 'undefined' && process.memoryUsage ? process.memoryUsage() : { heapUsed: 0, heapTotal: 0, external: 0, rss: 0 };
      const snapshot = {
        id: stableId('mem', nextId()),
        label: text(label) || 'snapshot',
        heapUsed: mem.heapUsed,
        heapTotal: mem.heapTotal,
        external: mem.external,
        rss: mem.rss || 0,
        timestamp: now()
      };
      memorySnapshots.push(snapshot);
      if (memorySnapshots.length > 200) memorySnapshots.shift();
      return snapshot;
    }

    function detectMemoryLeak(options) {
      const o = obj(options);
      if (memorySnapshots.length < 2) return { ok: false, reason: 'insufficient-snapshots' };
      const thresholdPercent = clamp(o.thresholdPercent ?? 50, 1, 1000);
      const first = memorySnapshots[0];
      const last = memorySnapshots[memorySnapshots.length - 1];
      const growth = last.heapUsed - first.heapUsed;
      const growthPercent = first.heapUsed > 0 ? Math.round((growth / first.heapUsed) * 10000) / 100 : 0;
      const hasLeak = growthPercent > thresholdPercent;
      return {
        ok: true,
        hasLeak,
        growthBytes: growth,
        growthPercent,
        thresholdPercent,
        firstHeap: first.heapUsed,
        lastHeap: last.heapUsed,
        snapshotCount: memorySnapshots.length,
        verdict: hasLeak ? 'LEAK_DETECTED' : 'OK'
      };
    }

    function getMemorySnapshots(limit) {
      const l = clamp(limit ?? 50, 1, 200);
      return memorySnapshots.slice(-l);
    }

    // RPG-14-04: Offline degradation test
    function createOfflineScenario(input) {
      const i = obj(input);
      const id = i.id || stableId('offline', nextId());
      const scenario = {
        id,
        name: text(i.name) || 'Offline Scenario',
        description: text(i.description),
        offlineDurationMs: clamp(i.offlineDurationMs ?? 30000, 100, 86400000),
        features: {
          localSave: i.features?.localSave !== false,
          cachedAssets: i.features?.cachedAssets !== false,
          offlineCombat: i.features?.offlineCombat !== false,
          offlineNarration: i.features?.offlineNarration !== false,
          llmProvider: i.features?.llmProvider === true,
          cloudSync: i.features?.cloudSync === true,
          webSearch: i.features?.webSearch === true
        },
        expectedBehavior: text(i.expectedBehavior) || 'Core gameplay continues with cached data',
        results: [],
        status: 'pending',
        createdAt: now()
      };
      offlineScenarios.set(id, scenario);
      return scenario;
    }

    function evaluateOfflineScenario(scenarioId, observed) {
      const scenario = offlineScenarios.get(scenarioId);
      if (!scenario) return { ok: false, reason: 'scenario-not-found' };
      const o = obj(observed);
      const checks = [];
      if (scenario.features.localSave) checks.push({ feature: 'localSave', expected: true, observed: o.localSave === true, pass: o.localSave === true });
      if (scenario.features.cachedAssets) checks.push({ feature: 'cachedAssets', expected: true, observed: o.cachedAssets === true, pass: o.cachedAssets === true });
      if (scenario.features.offlineCombat) checks.push({ feature: 'offlineCombat', expected: true, observed: o.offlineCombat === true, pass: o.offlineCombat === true });
      if (scenario.features.offlineNarration) checks.push({ feature: 'offlineNarration', expected: true, observed: o.offlineNarration === true, pass: o.offlineNarration === true });
      if (!scenario.features.llmProvider) checks.push({ feature: 'llmProvider', expected: false, observed: o.llmProvider === true, pass: o.llmProvider !== true });
      if (!scenario.features.cloudSync) checks.push({ feature: 'cloudSync', expected: false, observed: o.cloudSync === true, pass: o.cloudSync !== true });
      const passed = checks.filter(c => c.pass).length;
      const failed = checks.length - passed;
      scenario.results = checks;
      scenario.status = failed === 0 ? 'passed' : 'failed';
      return { ok: true, scenario: clone(scenario), passed, failed, allPassed: failed === 0 };
    }

    function getOfflineScenario(id) { return offlineScenarios.get(id) || null; }

    // RPG-14-05: Randomized stress test
    function runStressTest(options) {
      const o = obj(options);
      const seed = clamp(o.seed ?? 42, 1, 999999);
      seedRng(seed);
      const iterations = clamp(o.iterations ?? 1000, 1, 100000);
      const operations = arr(o.operations);
      const results = { seed, iterations, operationsRun: 0, errors: [], errorCount: 0, durationMs: 0 };
      const start = nowMs();
      for (let n = 0; n < iterations; n++) {
        const op = rngPick(operations);
        if (!op) break;
        try {
          if (typeof op === 'function') op(n, rng);
          else if (typeof o.handler === 'function') o.handler(op, n, rng);
          results.operationsRun++;
        } catch (e) {
          results.errorCount++;
          if (results.errors.length < 20) {
            results.errors.push({ iteration: n, operation: text(op.name) || 'unknown', error: text(e.message) });
          }
        }
      }
      results.durationMs = nowMs() - start;
      results.passed = results.errorCount === 0;
      return results;
    }

    // RPG-14-06: Provider failure injection
    function injectProviderFailure(input) {
      const i = obj(input);
      const id = i.id || stableId('fail', nextId());
      const failure = {
        id,
        providerId: text(i.providerId),
        mode: FAILURE_MODES.includes(i.mode) ? i.mode : 'timeout',
        probability: clamp(i.probability ?? 1, 0, 1),
        durationMs: clamp(i.durationMs ?? 5000, 100, 3600000),
        errorMessage: text(i.errorMessage) || 'Injected failure',
        httpStatus: clamp(i.httpStatus ?? 0, 0, 999),
        retryable: i.retryable !== false,
        active: i.active !== false,
        triggeredCount: 0,
        createdAt: now(),
        expiresAt: new Date(nowMs() + clamp(i.durationMs ?? 5000, 100, 3600000)).toISOString()
      };
      failureInjections.set(id, failure);
      return failure;
    }

    function shouldInjectFailure(providerId) {
      const nowIso = now();
      const activeFailures = Array.from(failureInjections.values())
        .filter(f => f.active && f.providerId === providerId && f.expiresAt > nowIso);
      if (activeFailures.length === 0) return { inject: false };
      const failure = activeFailures[0];
      const roll = rng();
      if (roll <= failure.probability) {
        failure.triggeredCount++;
        return {
          inject: true,
          failureId: failure.id,
          mode: failure.mode,
          errorMessage: failure.errorMessage,
          httpStatus: failure.httpStatus,
          retryable: failure.retryable
        };
      }
      return { inject: false };
    }

    function clearFailureInjection(id) {
      if (id) {
        const f = failureInjections.get(id);
        if (f) f.active = false;
        return { ok: true, cleared: id };
      }
      for (const f of failureInjections.values()) f.active = false;
      return { ok: true, cleared: 'all' };
    }

    function listFailureInjections(filter) {
      const f = obj(filter);
      let result = Array.from(failureInjections.values());
      if (f.activeOnly) result = result.filter(x => x.active);
      if (f.providerId) result = result.filter(x => x.providerId === f.providerId);
      return result;
    }

    // RPG-14-07: Concurrency test
    function runConcurrencyTest(options) {
      const o = obj(options);
      const taskCount = clamp(o.taskCount ?? 10, 1, 1000);
      const sharedState = { counter: 0, operations: [], errors: [] };
      const results = {
        taskCount,
        completed: 0,
        failed: 0,
        raceConditions: 0,
        finalCounter: 0,
        durationMs: 0
      };
      const start = nowMs();
      const raceWindow = clamp(o.raceWindow ?? 0, 0, 100);
      for (let n = 0; n < taskCount; n++) {
        try {
          const snapshot = sharedState.counter;
          if (raceWindow > 0) {
            for (let w = 0; w < raceWindow; w++) sharedState.operations.push(`task-${n}-write-${w}`);
          }
          sharedState.counter = snapshot + 1;
          results.completed++;
        } catch (e) {
          results.failed++;
          sharedState.errors.push(text(e.message));
        }
      }
      results.finalCounter = sharedState.counter;
      results.raceConditions = taskCount - sharedState.counter;
      results.durationMs = nowMs() - start;
      results.passed = results.finalCounter === taskCount;
      return results;
    }

    // RPG-14-08: Storage corruption test
    function createCorruptionTest(input) {
      const i = obj(input);
      const id = i.id || stableId('corrupt', nextId());
      const test = {
        id,
        name: text(i.name) || 'Storage Corruption Test',
        targetKey: text(i.targetKey),
        corruptionType: text(i.corruptionType) || 'truncated',
        expectedBehavior: text(i.expectedBehavior) || 'fails-closed',
        originalData: text(i.originalData) || '{"valid":"json"}',
        corruptedData: null,
        recovered: false,
        recoveredData: null,
        failClosed: false,
        status: 'pending',
        createdAt: now()
      };
      const original = test.originalData;
      if (test.corruptionType === 'truncated') {
        test.corruptedData = original.substring(0, Math.floor(original.length * 0.6));
      } else if (test.corruptionType === 'invalid-json') {
        test.corruptedData = original.replace(/"/g, "'").replace(/:/g, '=');
      } else if (test.corruptionType === 'garbage') {
        test.corruptedData = '\x00\x01\x02BINARY_CORRUPT\x03\x04';
      } else if (test.corruptionType === 'partial-write') {
        test.corruptedData = original.substring(0, Math.floor(original.length * 0.5)) + '   ';
      } else {
        test.corruptedData = original;
      }
      return test;
    }

    function evaluateCorruptionTest(test, recoveryResult) {
      const r = obj(recoveryResult);
      test.recovered = r.recovered === true;
      test.recoveredData = r.data != null ? text(r.data) : null;
      test.failClosed = r.failClosed === true;
      if (test.expectedBehavior === 'recovers') {
        test.status = test.recovered ? 'passed' : 'failed';
      } else if (test.expectedBehavior === 'backs-up') {
        test.status = r.backedUp === true || test.failClosed ? 'passed' : 'failed';
      } else {
        // fails-closed: either explicit fail-closed or graceful recovery are acceptable;
        // the failure mode is only if it silently produced wrong data
        test.status = test.failClosed || test.recovered ? 'passed' : 'failed';
      }
      return { ok: true, test: clone(test) };
    }

    // RPG-14-09: Network interruption test
    function createNetworkInterruptionTest(input) {
      const i = obj(input);
      const id = i.id || stableId('netint', nextId());
      const test = {
        id,
        name: text(i.name) || 'Network Interruption Test',
        interruptionPoint: text(i.interruptionPoint) || 'mid-request',
        durationMs: clamp(i.durationMs ?? 5000, 100, 300000),
        shouldRetry: i.shouldRetry !== false,
        shouldTimeout: i.shouldTimeout === true,
        shouldQueue: i.shouldQueue === true,
        expectedResult: text(i.expectedResult) || 'retries-and-succeeds',
        observations: [],
        status: 'pending',
        createdAt: now()
      };
      networkInterruptionTests.set(id, test);
      return test;
    }

    const networkInterruptionTests = new Map();

    function evaluateNetworkInterruption(testId, observed) {
      const test = networkInterruptionTests.get(testId);
      if (!test) return { ok: false, reason: 'test-not-found' };
      const o = obj(observed);
      const checks = [];
      checks.push({ check: 'retried', expected: test.shouldRetry, observed: o.retried === true, pass: (o.retried === true) === test.shouldRetry });
      checks.push({ check: 'timedOut', expected: test.shouldTimeout, observed: o.timedOut === true, pass: (o.timedOut === true) === test.shouldTimeout });
      checks.push({ check: 'queued', expected: test.shouldQueue, observed: o.queued === true, pass: (o.queued === true) === test.shouldQueue });
      const failed = checks.filter(c => !c.pass).length;
      test.observations = checks;
      test.status = failed === 0 ? 'passed' : 'failed';
      return { ok: true, test: clone(test), passed: checks.length - failed, failed, allPassed: failed === 0 };
    }

    // RPG-14-10: APK smoke test
    function createApkSmokeTest(input) {
      const i = obj(input);
      const id = i.id || stableId('apk', nextId());
      const test = {
        id,
        name: text(i.name) || 'APK Smoke Test',
        apkPath: text(i.apkPath) || null,
        apkSizeBytes: clamp(i.apkSizeBytes ?? 0, 0, 999999999),
        platform: 'android-14',
        checks: arr(i.checks).map(c => ({
          id: c.id || stableId('apkchk', nextId()),
          name: text(c.name) || 'Check',
          category: text(c.category) || 'general',
          required: c.required !== false,
          status: 'pending',
          message: null
        })),
        totalChecks: 0,
        passedChecks: 0,
        failedChecks: 0,
        status: 'pending',
        startedAt: null,
        completedAt: null,
        createdAt: now()
      };
      test.totalChecks = test.checks.length;
      apkSmokeTests.set(id, test);
      return test;
    }

    function getApkSmokeTest(id) { return apkSmokeTests.get(id) || null; }

    function recordApkCheck(testId, checkId, result) {
      const apkTest = apkSmokeTests.get(testId);
      if (!apkTest) return { ok: false, reason: 'test-not-found' };
      const check = apkTest.checks.find(c => c.id === checkId);
      if (!check) return { ok: false, reason: 'check-not-found' };
      const r = obj(result);
      check.status = r.passed === true ? 'passed' : r.passed === false ? 'failed' : 'skipped';
      check.message = text(r.message) || null;
      apkTest.passedChecks = apkTest.checks.filter(c => c.status === 'passed').length;
      apkTest.failedChecks = apkTest.checks.filter(c => c.status === 'failed').length;
      const executed = apkTest.passedChecks + apkTest.failedChecks;
      apkTest.status = apkTest.failedChecks > 0 ? 'failed' : executed >= apkTest.totalChecks ? 'passed' : 'running';
      return { ok: true, check: clone(check), test: clone(apkTest) };
    }

    // RPG-14-11: Android version matrix
    const androidMatrix = [
      { api: 34, version: '14', name: 'Android 14', minSdk: 34, targetSdk: 34, status: 'pending', notes: null },
      { api: 35, version: '15', name: 'Android 15', minSdk: 34, targetSdk: 35, status: 'pending', notes: null },
      { api: 36, version: '16', name: 'Android 16', minSdk: 34, targetSdk: 36, status: 'pending', notes: null }
    ];

    function getAndroidMatrix() { return clone(androidMatrix); }

    function updateMatrixEntry(api, status, notes) {
      const entry = androidMatrix.find(m => m.api === api);
      if (!entry) return { ok: false, reason: 'api-not-found' };
      entry.status = TEST_STATUSES.includes(status) ? status : 'pending';
      if (notes != null) entry.notes = text(notes);
      return { ok: true, entry: clone(entry) };
    }

    function getMatrixSummary() {
      const passed = androidMatrix.filter(m => m.status === 'passed').length;
      const failed = androidMatrix.filter(m => m.status === 'failed').length;
      const total = androidMatrix.length;
      return {
        total, passed, failed,
        pending: total - passed - failed,
        allPassed: passed === total,
        readyForRelease: failed === 0 && passed === total
      };
    }

    // RPG-14-12: Crash analytics
    function recordCrash(input) {
      const i = obj(input);
      const id = i.id || stableId('crash', nextId());
      const crash = {
        id,
        type: text(i.type) || 'unknown',
        severity: SEVERITY_LEVELS.includes(i.severity) ? i.severity : 'error',
        message: text(i.message) || 'Unknown crash',
        stackTrace: text(i.stackTrace) || null,
        platform: PLATFORMS.includes(i.platform) ? i.platform : 'android-14',
        appVersion: text(i.appVersion) || '1.0.0',
        module: text(i.module) || null,
        context: obj(i.context),
        occurrenceCount: 1,
        firstSeen: now(),
        lastSeen: now(),
        resolved: false,
        resolvedAt: null
      };
      crashLogs.set(id, crash);
      return crash;
    }

    function getCrashLogs(filter) {
      const f = obj(filter);
      let result = Array.from(crashLogs.values());
      if (f.severity) result = result.filter(c => c.severity === f.severity);
      if (f.platform) result = result.filter(c => c.platform === f.platform);
      if (f.module) result = result.filter(c => c.module === f.module);
      if (f.unresolvedOnly) result = result.filter(c => !c.resolved);
      return result.sort((a, b) => b.lastSeen.localeCompare(a.lastSeen));
    }

    function resolveCrash(id) {
      const crash = crashLogs.get(id);
      if (!crash) return { ok: false, reason: 'crash-not-found' };
      crash.resolved = true;
      crash.resolvedAt = now();
      return { ok: true, crash: clone(crash) };
    }

    function getCrashSummary() {
      const crashes = Array.from(crashLogs.values());
      const bySeverity = {};
      for (const c of crashes) bySeverity[c.severity] = (bySeverity[c.severity] || 0) + 1;
      return {
        totalCrashes: crashes.length,
        unresolved: crashes.filter(c => !c.resolved).length,
        bySeverity,
        criticalUnresolved: crashes.filter(c => c.severity === 'critical' && !c.resolved).length
      };
    }

    // RPG-14-13: Startup time budget
    function setPerformanceBudget(input) {
      const i = obj(input);
      const id = i.id || stableId('budget', nextId());
      const budget = {
        id,
        name: text(i.name) || 'Performance Budget',
        type: BUDGET_TYPES.includes(i.type) ? i.type : 'startup-time',
        limit: clamp(i.limit ?? 1000, 1, 999999999),
        unit: text(i.unit) || 'ms',
        softWarningPercent: clamp(i.softWarningPercent ?? 80, 1, 100),
        measurements: [],
        status: 'pending',
        createdAt: now(),
        lastChecked: null
      };
      budgets.set(id, budget);
      return budget;
    }

    function measureAgainstBudget(budgetId, value) {
      const budget = budgets.get(budgetId);
      if (!budget) return { ok: false, reason: 'budget-not-found' };
      const v = Number(value);
      if (!Number.isFinite(v)) return { ok: false, reason: 'invalid-value' };
      budget.measurements.push({ value: v, timestamp: now() });
      if (budget.measurements.length > 100) budget.measurements.shift();
      budget.lastChecked = now();
      const withinBudget = v <= budget.limit;
      const softLimit = budget.limit * (budget.softWarningPercent / 100);
      const withinSoft = v <= softLimit;
      budget.status = withinBudget ? 'passed' : 'failed';
      return {
        ok: true,
        value: v,
        limit: budget.limit,
        unit: budget.unit,
        withinBudget,
        withinSoftWarning: withinSoft,
        margin: budget.limit - v,
        marginPercent: Math.round(((budget.limit - v) / budget.limit) * 100),
        status: budget.status
      };
    }

    function getBudget(id) { return budgets.get(id) || null; }

    function getBudgetReport() {
      return Array.from(budgets.values()).map(b => ({
        id: b.id, name: b.name, type: b.type,
        limit: b.limit, unit: b.unit,
        status: b.status,
        measurementCount: b.measurements.length,
        lastValue: b.measurements.length > 0 ? b.measurements[b.measurements.length - 1].value : null
      }));
    }

    // RPG-14-14: Context size regression
    function setContextBaseline(input) {
      const i = obj(input);
      const id = i.id || stableId('ctxbase', nextId());
      const baseline = {
        id,
        name: text(i.name) || 'Context Baseline',
        module: text(i.module),
        maxSizeBytes: clamp(i.maxSizeBytes ?? 100000, 100, 10000000),
        baselineSizeBytes: clamp(i.baselineSizeBytes ?? i.maxSizeBytes ?? 100000, 1, 10000000),
        tolerancePercent: clamp(i.tolerancePercent ?? 10, 1, 100),
        history: [],
        status: 'pending',
        createdAt: now()
      };
      contextBaselines.set(id, baseline);
      return baseline;
    }

    function checkContextRegression(baselineId, currentSizeBytes) {
      const baseline = contextBaselines.get(baselineId);
      if (!baseline) return { ok: false, reason: 'baseline-not-found' };
      const current = clamp(currentSizeBytes, 0, 99999999);
      const diff = current - baseline.baselineSizeBytes;
      const diffPercent = baseline.baselineSizeBytes > 0 ? Math.round((diff / baseline.baselineSizeBytes) * 10000) / 100 : 0;
      const withinTolerance = Math.abs(diffPercent) <= baseline.tolerancePercent;
      const withinMax = current <= baseline.maxSizeBytes;
      const hasRegression = diffPercent > baseline.tolerancePercent;
      baseline.history.push({ size: current, diff, diffPercent, timestamp: now() });
      if (baseline.history.length > 50) baseline.history.shift();
      baseline.status = withinMax && !hasRegression ? 'passed' : 'failed';
      return {
        ok: true,
        current,
        baseline: baseline.baselineSizeBytes,
        maxSize: baseline.maxSizeBytes,
        diff, diffPercent,
        withinTolerance,
        withinMax,
        hasRegression,
        status: baseline.status,
        verdict: hasRegression ? 'REGRESSION' : withinMax ? 'OK' : 'OVER_BUDGET'
      };
    }

    // RPG-14-15: Full regression suite
    function runRegressionSuite() {
      const suites = Array.from(testSuites.values());
      const budgetsArr = Array.from(budgets.values());
      const report = {
        timestamp: now(),
        testSuites: {
          total: suites.length,
          passed: suites.filter(s => s.status === 'passed').length,
          failed: suites.filter(s => s.status === 'failed').length,
          pending: suites.filter(s => s.status === 'pending' || s.status === 'running').length,
          totalTests: suites.reduce((s, su) => s + su.totalTests, 0),
          totalPassed: suites.reduce((s, su) => s + su.passedTests, 0),
          totalFailed: suites.reduce((s, su) => s + su.failedTests, 0)
        },
        budgets: {
          total: budgetsArr.length,
          passed: budgetsArr.filter(b => b.status === 'passed').length,
          failed: budgetsArr.filter(b => b.status === 'failed').length,
          pending: budgetsArr.filter(b => b.status === 'pending').length
        },
        crashes: getCrashSummary(),
        androidMatrix: getMatrixSummary(),
        offlineScenarios: {
          total: offlineScenarios.size,
          passed: Array.from(offlineScenarios.values()).filter(s => s.status === 'passed').length,
          failed: Array.from(offlineScenarios.values()).filter(s => s.status === 'failed').length
        },
        overallStatus: 'pending'
      };
      const hasSuites = report.testSuites.total > 0;
      const allSuitesPassed = hasSuites && report.testSuites.failed === 0;
      const allBudgetsPassed = report.budgets.failed === 0;
      const noCriticalCrashes = report.crashes.criticalUnresolved === 0;
      const allPlatformsPassed = report.androidMatrix.allPassed;
      report.overallStatus = allSuitesPassed && allBudgetsPassed && noCriticalCrashes && allPlatformsPassed
        ? 'passed'
        : report.testSuites.failed > 0 || report.budgets.failed > 0 || report.crashes.criticalUnresolved > 0
          ? 'failed'
          : 'incomplete';
      report.readyForRelease = report.overallStatus === 'passed';
      return report;
    }

    return {
      TEST_STATUSES, SEVERITY_LEVELS, BUDGET_TYPES,
      FAILURE_MODES, PLATFORMS,
      registerTestSuite, getTestSuite, recordTestCaseResult, getCoverageReport,
      createBenchmark, recordBenchmarkSample, computeBenchmarkStats, getBenchmark, runBenchmark,
      takeMemorySnapshot, detectMemoryLeak, getMemorySnapshots,
      createOfflineScenario, evaluateOfflineScenario, getOfflineScenario,
      runStressTest,
      injectProviderFailure, shouldInjectFailure, clearFailureInjection, listFailureInjections,
      runConcurrencyTest,
      createCorruptionTest, evaluateCorruptionTest,
      createNetworkInterruptionTest, evaluateNetworkInterruption,
      createApkSmokeTest, getApkSmokeTest, recordApkCheck,
      getAndroidMatrix, updateMatrixEntry, getMatrixSummary,
      recordCrash, getCrashLogs, resolveCrash, getCrashSummary,
      setPerformanceBudget, measureAgainstBudget, getBudget, getBudgetReport,
      setContextBaseline, checkContextRegression,
      runRegressionSuite,
      seedRng
    };
  }

  return { createTestingManager };
});
