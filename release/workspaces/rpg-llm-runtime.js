(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SevenRpgLlmRuntime = api;
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
  function mapsToPlain(v) {
    if (v instanceof Map) return { __map: Object.fromEntries([...v].map(([k, x]) => [k, mapsToPlain(x)])) };
    if (Array.isArray(v)) return v.map(mapsToPlain);
    if (v && typeof v === 'object') {
      const out = {};
      for (const [k, x] of Object.entries(v)) out[k] = mapsToPlain(x);
      return out;
    }
    return v;
  }
  function plainToMaps(v) {
    if (Array.isArray(v)) return v.map(plainToMaps);
    if (v && typeof v === 'object') {
      if (Object.prototype.hasOwnProperty.call(v, '__map')) {
        return new Map(Object.entries(v.__map).map(([k, x]) => [k, plainToMaps(x)]));
      }
      const out = {};
      for (const [k, x] of Object.entries(v)) out[k] = plainToMaps(x);
      return out;
    }
    return v;
  }

  const PROVIDER_STATUSES = Object.freeze(['available', 'unavailable', 'rate-limited', 'error', 'checking']);
  const FALLBACK_MODES = Object.freeze(['never', 'on-error', 'on-timeout', 'on-rate-limit', 'always']);
  const RETRY_STRATEGIES = Object.freeze(['none', 'exponential', 'fixed', 'immediate']);
  const CONTEXT_SOURCES = Object.freeze(['world', 'canon', 'memory', 'character', 'scene', 'history', 'rules', 'custom']);
  const RESPONSE_FORMATS = Object.freeze(['text', 'json', 'structured', 'markdown']);
  const TOKEN_ESTIMATE_MODES = Object.freeze(['chars', 'words', 'arabic-aware']);

  function createLlmRuntimeManager(stateApi) {
    if (!stateApi || typeof stateApi.createState !== 'function') throw Error('SevenRpgState-compatible stateApi required');

    const providers = new Map();
    const modelConfigs = new Map();
    const requestLog = new Map();
    const contextEntries = new Map();
    let idCounter = 0;
    function nextId() { return ++idCounter; }

    // RPG-07-01: Provider status
    function registerProvider(input) {
      const i = obj(input);
      const id = i.id || stableId('provider', nextId());
      const provider = {
        id,
        name: text(i.name) || id,
        baseUrl: text(i.baseUrl),
        status: PROVIDER_STATUSES.includes(i.status) ? i.status : 'available',
        apiKey: null, // never stored in plain text
        models: uniq(i.models),
        defaultModel: text(i.defaultModel) || null,
        rateLimit: {
          requestsPerMinute: clamp(i.rateLimit?.requestsPerMinute || 60, 1, 10000),
          tokensPerMinute: clamp(i.rateLimit?.tokensPerMinute || 100000, 100000, 100000000)
        },
        health: {
          lastCheck: null,
          lastSuccess: null,
          lastFailure: null,
          failureCount: 0,
          circuitOpen: false,
          circuitOpenedAt: null
        },
        createdAt: now(),
        updatedAt: now()
      };
      providers.set(id, provider);
      return provider;
    }

    function getProvider(id) { return providers.get(id) || null; }

    function updateProviderStatus(id, status) {
      const provider = providers.get(id);
      if (!provider) return { ok: false, reason: 'provider-not-found' };
      if (!PROVIDER_STATUSES.includes(status)) return { ok: false, reason: 'invalid-status' };
      const oldStatus = provider.status;
      provider.status = status;
      provider.updatedAt = now();
      provider.health.lastCheck = now();
      if (status === 'available') {
        provider.health.lastSuccess = now();
        provider.health.failureCount = 0;
        provider.health.circuitOpen = false;
      } else {
        provider.health.lastFailure = now();
        provider.health.failureCount++;
      }
      return { ok: true, oldStatus, newStatus: status };
    }

    function getProviderStatus(id) {
      const provider = providers.get(id);
      if (!provider) return null;
      return {
        id: provider.id,
        name: provider.name,
        status: provider.status,
        models: provider.models,
        defaultModel: provider.defaultModel,
        health: clone(provider.health)
      };
    }

    function getAllProviderStatuses() {
      return Array.from(providers.values()).map(p => getProviderStatus(p.id));
    }

    function checkProviderHealth(id) {
      const provider = providers.get(id);
      if (!provider) return { ok: false, reason: 'provider-not-found' };
      provider.health.lastCheck = now();
      // Circuit breaker: open after 3+ consecutive failures
      if (provider.health.failureCount >= 3) {
        provider.health.circuitOpen = true;
        provider.health.circuitOpenedAt = now();
        provider.status = 'unavailable';
      }
      return {
        ok: true,
        status: provider.status,
        circuitOpen: provider.health.circuitOpen,
        failureCount: provider.health.failureCount
      };
    }

    // RPG-07-02: Model picker persistence
    function saveModelConfig(input) {
      const i = obj(input);
      const id = i.id || stableId('modelcfg', nextId());
      const config = {
        id,
        providerId: text(i.providerId),
        modelName: text(i.modelName),
        temperature: clamp(i.temperature ?? 0.7, 0, 2),
        maxTokens: clamp(i.maxTokens ?? 4096, 1, 100000),
        topP: clamp(i.topP ?? 1, 0, 1),
        frequencyPenalty: clamp(i.frequencyPenalty ?? 0, -2, 2),
        presencePenalty: clamp(i.presencePenalty ?? 0, -2, 2),
        stopSequences: uniq(i.stopSequences),
        responseFormat: RESPONSE_FORMATS.includes(i.responseFormat) ? i.responseFormat : 'text',
        isDefault: i.isDefault === true,
        metadata: obj(i.metadata),
        createdAt: now(),
        updatedAt: now()
      };
      if (config.isDefault) {
        for (const [cid, c] of modelConfigs) {
          if (c.providerId === config.providerId) c.isDefault = false;
        }
      }
      modelConfigs.set(id, config);
      return config;
    }

    function getModelConfig(id) { return modelConfigs.get(id) || null; }

    function getDefaultModelConfig(providerId) {
      for (const config of modelConfigs.values()) {
        if (config.providerId === providerId && config.isDefault) return config;
      }
      return null;
    }

    function updateModelConfig(id, updates) {
      const config = modelConfigs.get(id);
      if (!config) return { ok: false, reason: 'config-not-found' };
      const u = obj(updates);
      if (u.temperature != null) config.temperature = clamp(u.temperature, 0, 2);
      if (u.maxTokens != null) config.maxTokens = clamp(u.maxTokens, 1, 100000);
      if (u.topP != null) config.topP = clamp(u.topP, 0, 1);
      if (u.responseFormat != null && RESPONSE_FORMATS.includes(u.responseFormat)) config.responseFormat = u.responseFormat;
      if (u.isDefault != null) {
        if (u.isDefault) {
          for (const [cid, c] of modelConfigs) {
            if (c.providerId === config.providerId) c.isDefault = false;
          }
        }
        config.isDefault = u.isDefault === true;
      }
      config.updatedAt = now();
      return { ok: true, config };
    }

    // RPG-07-03: Fallback with explicit consent
    const fallbackConfig = {
      mode: 'never',
      fallbackProviderId: null,
      fallbackModelName: null,
      consentGiven: false,
      consentAt: null
    };

    function configureFallback(input) {
      const i = obj(input);
      if (i.mode != null && !FALLBACK_MODES.includes(i.mode)) return { ok: false, reason: 'invalid-mode' };
      if (i.mode != null && i.mode !== 'never' && i.consentGiven !== true) {
        return { ok: false, reason: 'consent-required', message: 'Fallback requires explicit user consent' };
      }
      if (i.mode != null) fallbackConfig.mode = i.mode;
      if (i.fallbackProviderId != null) fallbackConfig.fallbackProviderId = text(i.fallbackProviderId);
      if (i.fallbackModelName != null) fallbackConfig.fallbackModelName = text(i.fallbackModelName);
      if (i.consentGiven === true) {
        fallbackConfig.consentGiven = true;
        fallbackConfig.consentAt = now();
      }
      return { ok: true, config: clone(fallbackConfig) };
    }

    function shouldFallback(errorType) {
      if (!fallbackConfig.consentGiven) return false;
      const mode = fallbackConfig.mode;
      if (mode === 'never') return false;
      if (mode === 'always') return true;
      if (mode === 'on-error' && errorType === 'error') return true;
      if (mode === 'on-timeout' && errorType === 'timeout') return true;
      if (mode === 'on-rate-limit' && errorType === 'rate-limit') return true;
      return false;
    }

    function revokeFallbackConsent() {
      fallbackConfig.consentGiven = false;
      fallbackConfig.consentAt = null;
      fallbackConfig.mode = 'never';
      return { ok: true };
    }

    // RPG-07-04: Streaming generation
    const activeStreams = new Map();

    function startStreaming(input) {
      const i = obj(input);
      const streamId = i.id || stableId('stream', nextId());
      const stream = {
        id: streamId,
        providerId: text(i.providerId),
        modelConfigId: text(i.modelConfigId),
        prompt: text(i.prompt),
        chunks: [],
        startedAt: now(),
        completedAt: null,
        status: 'streaming',
        error: null,
        totalTokens: 0
      };
      activeStreams.set(streamId, stream);
      return stream;
    }

    function appendStreamChunk(streamId, chunk, tokens) {
      const stream = activeStreams.get(streamId);
      if (!stream) return { ok: false, reason: 'stream-not-found' };
      if (stream.status !== 'streaming') return { ok: false, reason: 'stream-not-active' };
      // Preserve exact chunk text (no trimming) for streaming fidelity
      const chunkText = typeof chunk === 'string' ? chunk : '';
      stream.chunks.push({ text: chunkText, tokens: Number(tokens) || 0, timestamp: now() });
      stream.totalTokens += Number(tokens) || 0;
      return { ok: true, totalTokens: stream.totalTokens };
    }

    function completeStream(streamId, error) {
      const stream = activeStreams.get(streamId);
      if (!stream) return { ok: false, reason: 'stream-not-found' };
      stream.completedAt = now();
      if (error) {
        stream.status = 'error';
        stream.error = text(error);
      } else {
        stream.status = 'completed';
      }
      return { ok: true, stream: clone(stream) };
    }

    function getStream(streamId) {
      const stream = activeStreams.get(streamId);
      return stream ? clone(stream) : null;
    }

    function getStreamText(streamId) {
      const stream = activeStreams.get(streamId);
      return stream ? stream.chunks.map(c => c.text).join('') : '';
    }

    // RPG-07-05: Cancel streaming
    function cancelStream(streamId) {
      const stream = activeStreams.get(streamId);
      if (!stream) return { ok: false, reason: 'stream-not-found' };
      if (stream.status !== 'streaming') return { ok: false, reason: 'stream-not-active' };
      stream.status = 'cancelled';
      stream.completedAt = now();
      return { ok: true, cancelledAt: stream.completedAt, chunksReceived: stream.chunks.length };
    }

    function getActiveStreams() {
      return Array.from(activeStreams.values()).filter(s => s.status === 'streaming').map(s => s.id);
    }

    // RPG-07-06: Retry idempotency
    const retryConfigs = new Map();

    function configureRetry(input) {
      const i = obj(input);
      const id = i.id || stableId('retry', nextId());
      const config = {
        id,
        providerId: text(i.providerId),
        strategy: RETRY_STRATEGIES.includes(i.strategy) ? i.strategy : 'exponential',
        maxRetries: clamp(i.maxRetries ?? 3, 0, 10),
        baseDelayMs: clamp(i.baseDelayMs ?? 1000, 100, 60000),
        maxDelayMs: clamp(i.maxDelayMs ?? 30000, 100, 300000),
        idempotencyKey: text(i.idempotencyKey) || stableId('idem', nextId()),
        createdAt: now()
      };
      retryConfigs.set(id, config);
      return config;
    }

    function calculateRetryDelay(configId, attempt) {
      const config = retryConfigs.get(configId);
      if (!config) return 0;
      if (config.strategy === 'none') return 0;
      if (config.strategy === 'immediate') return 0;
      if (config.strategy === 'fixed') return config.baseDelayMs;
      // exponential
      const delay = config.baseDelayMs * Math.pow(2, Math.max(0, attempt - 1));
      return Math.min(delay, config.maxDelayMs);
    }

    function canRetry(configId, attempt) {
      const config = retryConfigs.get(configId);
      if (!config) return false;
      return attempt < config.maxRetries;
    }

    // RPG-07-07: Timeouts
    const timeouts = new Map();

    function setTimeoutConfig(input) {
      const i = obj(input);
      const id = i.id || stableId('timeout', nextId());
      const config = {
        id,
        providerId: text(i.providerId),
        connectTimeoutMs: clamp(i.connectTimeoutMs ?? 10000, 1000, 120000),
        readTimeoutMs: clamp(i.readTimeoutMs ?? 60000, 1000, 600000),
        totalTimeoutMs: clamp(i.totalTimeoutMs ?? 120000, 1000, 1200000),
        createdAt: now()
      };
      timeouts.set(id, config);
      return config;
    }

    function checkTimeout(configId, elapsedMs) {
      const config = timeouts.get(configId);
      if (!config) return { timedOut: false, reason: 'no-config' };
      if (elapsedMs >= config.totalTimeoutMs) return { timedOut: true, reason: 'total-timeout', limit: config.totalTimeoutMs };
      if (elapsedMs >= config.readTimeoutMs) return { timedOut: true, reason: 'read-timeout', limit: config.readTimeoutMs };
      return { timedOut: false, remaining: config.totalTimeoutMs - elapsedMs };
    }

    // RPG-07-08: Rate limit UX
    const rateLimitState = new Map();

    function checkRateLimit(providerId) {
      const provider = providers.get(providerId);
      if (!provider) return { allowed: false, reason: 'provider-not-found' };
      const state = rateLimitState.get(providerId) || { requestCount: 0, windowStart: Date.now(), tokensUsed: 0 };
      const nowMs = Date.now();
      // Reset window if 60s passed
      if (nowMs - state.windowStart >= 60000) {
        state.requestCount = 0;
        state.windowStart = nowMs;
        state.tokensUsed = 0;
      }
      if (state.requestCount >= provider.rateLimit.requestsPerMinute) {
        const retryAfterMs = 60000 - (nowMs - state.windowStart);
        return {
          allowed: false,
          reason: 'rate-limited',
          retryAfterMs,
          requestsRemaining: 0,
          limit: provider.rateLimit.requestsPerMinute
        };
      }
      return {
        allowed: true,
        requestsRemaining: provider.rateLimit.requestsPerMinute - state.requestCount,
        limit: provider.rateLimit.requestsPerMinute
      };
    }

    function recordRequest(providerId, tokens) {
      const state = rateLimitState.get(providerId) || { requestCount: 0, windowStart: Date.now(), tokensUsed: 0 };
      state.requestCount++;
      state.tokensUsed += Number(tokens) || 0;
      rateLimitState.set(providerId, state);
      return { ok: true, requestCount: state.requestCount };
    }

    function getRateLimitStatus(providerId) {
      const provider = providers.get(providerId);
      if (!provider) return null;
      const state = rateLimitState.get(providerId) || { requestCount: 0, windowStart: Date.now(), tokensUsed: 0 };
      return {
        providerId,
        requestsPerMinute: provider.rateLimit.requestsPerMinute,
        requestsUsed: state.requestCount,
        requestsRemaining: Math.max(0, provider.rateLimit.requestsPerMinute - state.requestCount),
        tokensUsed: state.tokensUsed,
        windowResetAt: new Date(state.windowStart + 60000).toISOString()
      };
    }

    // RPG-07-09: Context injection contract
    function buildContext(input) {
      const i = obj(input);
      const maxTokens = clamp(i.maxTokens ?? 4096, 100, 100000);
      const entries = arr(i.contextEntries);
      const estimatedTokens = estimateTokens(entries.map(e => text(e.content)).join(' '));
      const contextParts = [];
      let usedTokens = 0;
      for (const entry of entries) {
        const e = obj(entry);
        const source = CONTEXT_SOURCES.includes(e.source) ? e.source : 'custom';
        const content = text(e.content);
        const tokens = estimateTokens(content);
        if (usedTokens + tokens > maxTokens) {
          contextParts.push({ source, content: content.substring(0, Math.max(0, (maxTokens - usedTokens) * 4)), truncated: true, tokens: maxTokens - usedTokens });
          usedTokens = maxTokens;
          break;
        }
        contextParts.push({ source, content, truncated: false, tokens });
        usedTokens += tokens;
      }
      return {
        parts: contextParts,
        totalTokens: usedTokens,
        maxTokens,
        truncated: usedTokens >= maxTokens,
        sources: uniq(contextParts.map(p => p.source))
      };
    }

    // RPG-07-10: Structured response parser
    function parseStructuredResponse(raw, format) {
      const f = RESPONSE_FORMATS.includes(format) ? format : 'text';
      if (f === 'text' || f === 'markdown') {
        return { ok: true, format: f, data: text(raw), raw: text(raw) };
      }
      if (f === 'json') {
        try {
          const parsed = JSON.parse(text(raw));
          return { ok: true, format: 'json', data: parsed, raw: text(raw) };
        } catch (e) {
          return { ok: false, format: 'json', error: 'invalid-json', raw: text(raw), message: e.message };
        }
      }
      if (f === 'structured') {
        // Try to extract JSON from potentially malformed text
        const rawText = text(raw);
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0]);
            return { ok: true, format: 'structured', data: parsed, raw: rawText, recovered: true };
          } catch (e) { /* fall through */ }
        }
        return { ok: false, format: 'structured', error: 'no-structure-found', raw: rawText };
      }
      return { ok: false, format: f, error: 'unknown-format' };
    }

    // RPG-07-11: Invalid JSON recovery
    function recoverJson(raw) {
      let s = text(raw);
      // Remove markdown code fences
      s = s.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
      // Try direct parse
      try { return { ok: true, data: JSON.parse(s) }; } catch (e) { /* continue */ }
      // Try to find JSON object
      const start = s.indexOf('{');
      const end = s.lastIndexOf('}');
      if (start >= 0 && end > start) {
        try { return { ok: true, data: JSON.parse(s.substring(start, end + 1)), recovered: 'substring' }; } catch (e) { /* continue */ }
      }
      // Try common fixes: trailing commas, single quotes
      const fixed = s.replace(/,\s*([}\]])/g, '$1').replace(/'/g, '"');
      try { return { ok: true, data: JSON.parse(fixed), recovered: 'fixed' }; } catch (e) { /* continue */ }
      return { ok: false, error: 'unrecoverable', message: 'Could not parse as JSON after recovery attempts' };
    }

    // RPG-07-12: Prompt injection defenses
    const INJECTION_PATTERNS = [
      /ignore\s+(?:all\s+)?(?:previous|prior|above|earlier)\s+instructions/i,
      /you\s+are\s+now\s+(?:a|an|the)\s+/i,
      /disregard\s+(?:your|the|all)\s+(?:rules|guidelines|instructions)/i,
      /new\s+instructions?\s*:/i,
      /system\s*prompt\s*:/i,
      /\[system\]/i,
      /<\|system\|>/i,
      /override\s+(?:your|the)\s+(?:programming|instructions|rules)/i,
      /pretend\s+(?:you\s+are|to\s+be)\s+/i,
      /roleplay\s+as\s+(?:a|an|the)\s+/i
    ];

    function detectInjection(input) {
      const s = text(input);
      if (!s) return { detected: false, confidence: 0, patterns: [] };
      const matched = [];
      for (const pattern of INJECTION_PATTERNS) {
        if (pattern.test(s)) matched.push(pattern.source);
      }
      const confidence = Math.min(1, matched.length / 3);
      return {
        detected: matched.length > 0,
        confidence,
        patterns: matched,
        severity: matched.length >= 2 ? 'high' : matched.length === 1 ? 'medium' : 'none'
      };
    }

    function sanitizeInput(input) {
      const detection = detectInjection(input);
      if (detection.detected && detection.severity === 'high') {
        return { ok: false, reason: 'injection-detected', detection, sanitized: '' };
      }
      if (detection.detected) {
        // Remove flagged patterns
        let s = text(input);
        for (const pattern of INJECTION_PATTERNS) {
          s = s.replace(pattern, '[REMOVED]');
        }
        return { ok: true, sanitized: s, warning: 'potential-injection-removed', detection };
      }
      return { ok: true, sanitized: text(input), detection };
    }

    // RPG-07-13: Local model support optional
    const localModels = new Map();

    function registerLocalModel(input) {
      const i = obj(input);
      const id = i.id || stableId('local', nextId());
      const model = {
        id,
        name: text(i.name) || id,
        format: text(i.format) || 'gguf',
        path: text(i.path),
        sizeBytes: Number(i.sizeBytes) || 0,
        contextLength: clamp(i.contextLength ?? 4096, 256, 1000000),
        enabled: i.enabled !== false,
        loaded: false,
        loadedAt: null,
        createdAt: now()
      };
      localModels.set(id, model);
      return model;
    }

    function getLocalModel(id) { return localModels.get(id) || null; }

    function listLocalModels() {
      return Array.from(localModels.values()).map(m => ({
        id: m.id, name: m.name, format: m.format,
        contextLength: m.contextLength, enabled: m.enabled, loaded: m.loaded
      }));
    }

    function toggleLocalModel(id, enabled) {
      const model = localModels.get(id);
      if (!model) return { ok: false, reason: 'model-not-found' };
      model.enabled = enabled !== false;
      return { ok: true, enabled: model.enabled };
    }

    // RPG-07-14: Usage and token transparency
    const usageLog = [];

    function recordUsage(input) {
      const i = obj(input);
      const record = {
        id: stableId('usage', nextId()),
        providerId: text(i.providerId),
        modelConfigId: text(i.modelConfigId),
        promptTokens: clamp(i.promptTokens ?? 0, 0, 10000000),
        completionTokens: clamp(i.completionTokens ?? 0, 0, 10000000),
        totalTokens: 0,
        estimatedCostUsd: clamp(i.estimatedCostUsd ?? 0, 0, 10000),
        latencyMs: clamp(i.latencyMs ?? 0, 0, 600000),
        timestamp: now()
      };
      record.totalTokens = record.promptTokens + record.completionTokens;
      usageLog.push(record);
      usageLog.splice(0, Math.max(0, usageLog.length - 1000));
      return record;
    }

    function getUsageStats(filter) {
      const f = obj(filter);
      let records = usageLog;
      if (f.providerId) records = records.filter(r => r.providerId === f.providerId);
      if (f.since) records = records.filter(r => r.timestamp >= f.since);
      if (f.until) records = records.filter(r => r.timestamp <= f.until);
      const totalPrompt = records.reduce((s, r) => s + r.promptTokens, 0);
      const totalCompletion = records.reduce((s, r) => s + r.completionTokens, 0);
      const totalCost = records.reduce((s, r) => s + r.estimatedCostUsd, 0);
      const avgLatency = records.length > 0 ? records.reduce((s, r) => s + r.latencyMs, 0) / records.length : 0;
      return {
        requestCount: records.length,
        totalPromptTokens: totalPrompt,
        totalCompletionTokens: totalCompletion,
        totalTokens: totalPrompt + totalCompletion,
        totalCostUsd: Math.round(totalCost * 10000) / 10000,
        avgLatencyMs: Math.round(avgLatency)
      };
    }

    function getRecentUsage(limit) {
      const l = Math.max(1, Number(limit) || 10);
      return usageLog.slice(-l);
    }

    // RPG-07-15: Real inference acceptance (requires live credentials - BLOCKED if absent)
    function checkInferenceReadiness() {
      const availableProviders = Array.from(providers.values()).filter(p =>
        p.status === 'available' && !p.health.circuitOpen && p.models.length > 0
      );
      const hasDefaultConfig = Array.from(modelConfigs.values()).some(c => c.isDefault);
      const hasCredentials = Array.from(providers.values()).some(p => typeof p.apiKey === 'string' && p.apiKey.length > 0);
      const ready = availableProviders.length > 0 && hasDefaultConfig && hasCredentials;
      return {
        ready,
        availableProviders: availableProviders.map(p => p.id),
        hasDefaultConfig, hasCredentials,
        blockedReason: availableProviders.length === 0 ? 'no-available-providers' :
                       !hasDefaultConfig ? 'no-default-model-config' :
                       !hasCredentials ? 'no-credentials' : null
      };
    }

    // Set an API key for a provider. Stored in memory only; never persisted in plain text.
    function setApiKey(providerId, key) {
      const provider = providers.get(providerId);
      if (!provider) return { ok: false, reason: 'provider-not-found' };
      const k = text(key);
      if (!k) return { ok: false, reason: 'invalid-key' };
      provider.apiKey = k;
      provider.updatedAt = now();
      return { ok: true, providerId };
    }

    // Token estimation
    function estimateTokens(textInput) {
      const s = text(textInput);
      if (!s) return 0;
      // Arabic characters are typically 1.5-2 tokens per char
      const arabicChars = (s.match(/[\u0600-\u06FF]/g) || []).length;
      const otherChars = s.length - arabicChars;
      return Math.ceil(arabicChars * 1.5 + otherChars * 0.25);
    }

    // Persistence seam (additive): serializes every closure-scoped Map plus the
    // fallback config and usage log, and never moves the id counter backwards.
    const DEFAULT_FALLBACK_CONFIG = clone(fallbackConfig);

    // Secrets never belong in a save file. setApiKey() holds credentials in memory only, so the
    // persistence seam must redact them: a campaign save or world export is a file a player can
    // share, attach to a bug report, or upload, and a live provider key must not ride along.
    const SECRET_FIELD_NAMES = ['apiKey', 'api_key', 'apikey', 'key', 'token', 'secret',
      'password', 'authorization', 'accessToken', 'refreshToken', 'clientSecret', 'bearer'];
    function redactSecrets(value, depth) {
      const d = depth || 0;
      if (d > 32) return null;
      if (Array.isArray(value)) return value.map(v => redactSecrets(v, d + 1));
      if (value && typeof value === 'object') {
        const out = {};
        for (const k of Object.keys(value)) {
          if (SECRET_FIELD_NAMES.some(s => k.toLowerCase() === s.toLowerCase())) { out[k] = null; continue; }
          out[k] = redactSecrets(value[k], d + 1);
        }
        return out;
      }
      return value;
    }

    function restoreMap(target, raw) {
      const rebuilt = plainToMaps(obj(raw));
      target.clear();
      if (rebuilt instanceof Map) for (const [k, v] of rebuilt) target.set(k, v);
      return target;
    }

    function replaceFields(target, source, fallback) {
      for (const k of Object.keys(target)) delete target[k];
      Object.assign(target, source || clone(fallback));
    }

    function exportState() {
      return {
        version: 1,
        counters: { id: idCounter },
        providers: redactSecrets(clone(mapsToPlain(providers))),
        modelConfigs: clone(mapsToPlain(modelConfigs)),
        requestLog: clone(mapsToPlain(requestLog)),
        contextEntries: clone(mapsToPlain(contextEntries)),
        activeStreams: clone(mapsToPlain(activeStreams)),
        retryConfigs: clone(mapsToPlain(retryConfigs)),
        timeouts: clone(mapsToPlain(timeouts)),
        rateLimitState: clone(mapsToPlain(rateLimitState)),
        localModels: clone(mapsToPlain(localModels)),
        state: clone({ fallbackConfig, usageLog })
      };
    }

    function importState(data) {
      const d = obj(data);
      // Defence in depth: a hand-edited or older save may still carry credential fields.
      // Restore them redacted so import can never resurrect a secret from disk.
      restoreMap(providers, redactSecrets(d.providers));
      restoreMap(modelConfigs, d.modelConfigs);
      restoreMap(requestLog, d.requestLog);
      restoreMap(contextEntries, d.contextEntries);
      restoreMap(activeStreams, d.activeStreams);
      restoreMap(retryConfigs, d.retryConfigs);
      restoreMap(timeouts, d.timeouts);
      restoreMap(rateLimitState, d.rateLimitState);
      restoreMap(localModels, d.localModels);
      const st = plainToMaps(obj(d.state));
      replaceFields(fallbackConfig, st.fallbackConfig, DEFAULT_FALLBACK_CONFIG);
      usageLog.length = 0;
      for (const record of arr(st.usageLog)) usageLog.push(record);
      idCounter = Math.max(idCounter, Number(obj(d.counters).id || 0));
      return { ok: true, restored: providers.size };
    }

    return {
      PROVIDER_STATUSES, FALLBACK_MODES, RETRY_STRATEGIES,
      CONTEXT_SOURCES, RESPONSE_FORMATS, TOKEN_ESTIMATE_MODES,
      registerProvider, getProvider, updateProviderStatus,
      getProviderStatus, getAllProviderStatuses, checkProviderHealth,
      saveModelConfig, getModelConfig, getDefaultModelConfig, updateModelConfig,
      configureFallback, shouldFallback, revokeFallbackConsent,
      startStreaming, appendStreamChunk, completeStream, getStream, getStreamText,
      cancelStream, getActiveStreams,
      configureRetry, calculateRetryDelay, canRetry,
      setTimeoutConfig, checkTimeout,
      checkRateLimit, recordRequest, getRateLimitStatus,
      buildContext, parseStructuredResponse, recoverJson,
      detectInjection, sanitizeInput,
      registerLocalModel, getLocalModel, listLocalModels, toggleLocalModel,
      recordUsage, getUsageStats, getRecentUsage,
      checkInferenceReadiness, estimateTokens, setApiKey,
      exportState, importState
    };
  }

  return { createLlmRuntimeManager };
});
