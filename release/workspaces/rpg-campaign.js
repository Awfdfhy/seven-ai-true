(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SevenRpgCampaign = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  function clone(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }
  function obj(v) { return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; }
  function arr(v) { return Array.isArray(v) ? v : []; }
  function text(v) { return typeof v === 'string' ? v.trim() : ''; }
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
  function uniq(xs) { return Array.from(new Set(arr(xs).filter(x => typeof x === 'string' && x.trim()).map(x => x.trim()))); }
  let idCounter = 0;
  function nextId() { return ++idCounter; }
  function stableId(prefix) { return prefix + '-' + String(nextId()).padStart(6, '0'); }
  function now() { return new Date().toISOString(); }
  function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  const CAMPAIGN_STATUS = Object.freeze(['planning', 'active', 'on_hold', 'completed', 'archived']);
  const SESSION_STATUS = Object.freeze(['planned', 'in_progress', 'completed', 'cancelled']);
  const CHECKPOINT_TYPES = Object.freeze(['auto', 'manual', 'milestone', 'pre_combat', 'post_combat', 'level_up']);

  function createCampaignManager(stateApi, worldMgrApi) {
    if (!stateApi || typeof stateApi.createState !== 'function') throw Error('SevenRpgState-compatible stateApi required');

    const campaigns = new Map();
    const sessions = new Map();
    const checkpoints = new Map();

    function createCampaign(input) {
      const i = obj(input);
      const id = i.id || stableId('campaign');
      const name = text(i.name) || 'Unnamed Campaign';
      const worldId = text(i.worldId);
      const description = text(i.description);
      const status = CAMPAIGN_STATUS.includes(i.status) ? i.status : 'planning';
      const difficulty = text(i.difficulty) || 'normal';
      const tone = text(i.tone) || 'heroic';
      const settings = obj(i.settings);
      const metadata = obj(i.metadata);
      const tags = arr(i.tags);

      const campaign = {
        id, name, worldId, description, status, difficulty, tone,
        settings: {
          xpMultiplier: settings.xpMultiplier ?? 1.0,
          deathPenalty: settings.deathPenalty ?? 'normal',
          resourceAbundance: settings.resourceAbundance ?? 1.0,
          combatLethality: settings.combatLethality ?? 1.0,
          autoSave: settings.autoSave !== false,
          autoSaveInterval: settings.autoSaveInterval ?? 300000,
          maxPartySize: settings.maxPartySize ?? 6,
          allowPvP: settings.allowPvP === true,
          matureContent: settings.matureContent === true,
          houseRules: arr(settings.houseRules),
          ...obj(settings)
        },
        tags, metadata,
        createdAt: now(), updatedAt: now(), version: 1,
        sessionIds: [], currentSessionId: null,
        statistics: { totalSessions: 0, totalPlayTime: 0, totalXp: 0, characterDeaths: 0 }
      };
      campaigns.set(id, campaign);
      return campaign;
    }

    function getCampaign(id) {
      return campaigns.get(id);
    }

    function getAllCampaigns(filter) {
      const f = obj(filter);
      let result = Array.from(campaigns.values());
      if (f.status) result = result.filter(c => c.status === f.status);
      if (f.worldId) result = result.filter(c => c.worldId === f.worldId);
      if (f.search) {
        const q = f.search.toLowerCase();
        result = result.filter(c => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
      }
      return result.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    }

    function updateCampaign(id, updates) {
      const campaign = campaigns.get(id);
      if (!campaign) return { ok: false, reason: 'not-found' };
      const next = clone(campaign);
      for (const [key, value] of Object.entries(updates)) {
        if (key !== 'id' && key !== 'createdAt' && key !== 'version' && key !== 'sessionIds' && key !== 'statistics') {
          if (key === 'settings') {
            next.settings = { ...next.settings, ...obj(value) };
          } else {
            next[key] = value;
          }
        }
      }
      next.updatedAt = now();
      next.version = (campaign.version || 1) + 1;
      campaigns.set(id, next);
      return { ok: true, campaign: next };
    }

    function deleteCampaign(id) {
      const campaign = campaigns.get(id);
      if (!campaign) return { ok: false, reason: 'not-found' };
      for (const sessionId of campaign.sessionIds) {
        sessions.delete(sessionId);
      }
      for (const [cpId, cp] of checkpoints.entries()) {
        if (cp.sessionId && campaign.sessionIds.includes(cp.sessionId)) {
          checkpoints.delete(cpId);
        }
      }
      campaigns.delete(id);
      return { ok: true };
    }

    function createSession(input) {
      const i = obj(input);
      const id = i.id || stableId('session');
      const campaignId = text(i.campaignId);
      const campaign = campaigns.get(campaignId);
      if (!campaign) return { ok: false, reason: 'campaign-not-found' };
      if (campaign.currentSessionId && !i.allowMultiple) {
        return { ok: false, reason: 'session-already-active' };
      }

      const name = text(i.name) || `Session ${campaign.sessionIds.length + 1}`;
      const description = text(i.description);
      const status = SESSION_STATUS.includes(i.status) ? i.status : 'planned';
      const scheduledAt = i.scheduledAt || null;
      const metadata = obj(i.metadata);

      const session = {
        id, campaignId, name, description, status,
        scheduledAt, startedAt: null, endedAt: null,
        metadata,
        createdAt: now(), updatedAt: now(), version: 1,
        checkpointIds: [], currentCheckpointId: null,
        participants: arr(i.participants),
        timeline: { events: [], currentIndex: -1 },
        statistics: { duration: 0, xpAwarded: 0, encounters: 0, checkpoints: 0 }
      };

      sessions.set(id, session);
      campaign.sessionIds.push(id);
      campaign.currentSessionId = id;
      campaign.updatedAt = now();
      campaign.version++;
      campaigns.set(campaignId, campaign);

      return { ok: true, session };
    }

    function getSession(id) {
      return sessions.get(id);
    }

    function getSessionByCampaign(campaignId) {
      return Array.from(sessions.values()).filter(s => s.campaignId === campaignId);
    }

    function updateSession(id, updates) {
      const session = sessions.get(id);
      if (!session) return { ok: false, reason: 'not-found' };
      const next = clone(session);
      for (const [key, value] of Object.entries(updates)) {
        if (key !== 'id' && key !== 'createdAt' && key !== 'version' && key !== 'campaignId' && key !== 'checkpointIds' && key !== 'statistics') {
          next[key] = value;
        }
      }
      if (updates.status === 'in_progress' && !session.startedAt) next.startedAt = now();
      if (updates.status === 'completed' && !session.endedAt) next.endedAt = now();
      next.updatedAt = now();
      next.version = (session.version || 1) + 1;
      sessions.set(id, next);
      return { ok: true, session: next };
    }

    function startSession(id) {
      return updateSession(id, { status: 'in_progress' });
    }

    function endSession(id) {
      const session = sessions.get(id);
      if (!session) return { ok: false, reason: 'not-found' };
      const campaign = campaigns.get(session.campaignId);
      const duration = session.endedAt ? new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime() : 0;
      const result = updateSession(id, { status: 'completed' });
      if (result.ok && campaign) {
        campaign.statistics.totalSessions++;
        campaign.statistics.totalPlayTime += duration;
        campaign.currentSessionId = null;
        campaign.updatedAt = now();
        campaign.version++;
        campaigns.set(campaign.id, campaign);
      }
      return result;
    }

    function createCheckpoint(input) {
      const i = obj(input);
      const id = i.id || stableId('cp');
      const sessionId = text(i.sessionId);
      const session = sessions.get(sessionId);
      if (!session) return { ok: false, reason: 'session-not-found' };
      const type = CHECKPOINT_TYPES.includes(i.type) ? i.type : 'manual';
      const label = text(i.label) || `Checkpoint ${session.checkpointIds.length + 1}`;
      const description = text(i.description);
      const stateSnapshot = obj(i.stateSnapshot);
      const metadata = obj(i.metadata);

      const checkpoint = {
        id, sessionId, type, label, description,
        stateSnapshot, metadata,
        createdAt: now(), version: 1,
        isCurrent: true
      };

      for (const cpId of session.checkpointIds) {
        const cp = checkpoints.get(cpId);
        if (cp) { cp.isCurrent = false; checkpoints.set(cpId, cp); }
      }

      checkpoints.set(id, checkpoint);
      session.checkpointIds.push(id);
      session.currentCheckpointId = id;
      session.statistics.checkpoints++;
      session.updatedAt = now();
      session.version++;
      sessions.set(sessionId, session);

      return { ok: true, checkpoint };
    }

    function getCheckpoint(id) {
      return checkpoints.get(id);
    }

    function getCheckpointsBySession(sessionId) {
      const session = sessions.get(sessionId);
      if (!session) return [];
      return session.checkpointIds.map(id => checkpoints.get(id)).filter(Boolean);
    }

    function loadCheckpoint(id, stateApi) {
      const cp = checkpoints.get(id);
      if (!cp) return { ok: false, reason: 'not-found' };
      const session = sessions.get(cp.sessionId);
      if (!session) return { ok: false, reason: 'session-not-found' };

      for (const cpId of session.checkpointIds) {
        const cp = checkpoints.get(cpId);
        if (cp) { cp.isCurrent = false; checkpoints.set(cpId, cp); }
      }
      cp.isCurrent = true;
      checkpoints.set(cp.id, cp);
      session.currentCheckpointId = id;
      session.updatedAt = now();
      sessions.set(cp.sessionId, session);

      return { ok: true, checkpoint: cp, stateSnapshot: cp.stateSnapshot };
    }

    function deleteCheckpoint(id) {
      const cp = checkpoints.get(id);
      if (!cp) return { ok: false, reason: 'not-found' };
      const session = sessions.get(cp.sessionId);
      if (session) {
        session.checkpointIds = session.checkpointIds.filter(cpId => cpId !== id);
        if (session.currentCheckpointId === id) {
          session.currentCheckpointId = session.checkpointIds[session.checkpointIds.length - 1] || null;
        }
        session.updatedAt = now();
        session.version++;
        sessions.set(session.sessionId, session);
      }
      checkpoints.delete(id);
      return { ok: true };
    }

    function addTimelineEvent(sessionId, event) {
      const session = sessions.get(sessionId);
      if (!session) return { ok: false, reason: 'session-not-found' };
      const e = obj(event);
      const timelineEvent = {
        id: stableId('te'),
        type: text(e.type) || 'note',
        description: text(e.description),
        timestamp: e.timestamp || now(),
        author: text(e.author) || 'gm',
        tags: arr(e.tags),
        metadata: obj(e.metadata)
      };
      session.timeline.events.push(timelineEvent);
      session.timeline.currentIndex = session.timeline.events.length - 1;
      session.updatedAt = now();
      session.version++;
      sessions.set(sessionId, session);
      return { ok: true, event: timelineEvent };
    }

    function getTimeline(sessionId, range) {
      const session = sessions.get(sessionId);
      if (!session) return { ok: false, reason: 'session-not-found' };
      let events = session.timeline.events;
      if (range) {
        const r = obj(range);
        if (r.from) events = events.filter(e => e.timestamp >= r.from);
        if (r.to) events = events.filter(e => e.timestamp <= r.to);
      }
      return { ok: true, events };
    }

    function replaySession(sessionId, stateApi, speed) {
      const session = sessions.get(sessionId);
      if (!session) return { ok: false, reason: 'session-not-found' };
      const events = session.timeline.events;
      return {
        ok: true,
        sessionId,
        events: events.map(e => ({
          ...e,
          replayAt: new Date(e.timestamp).getTime() * (speed || 1)
        })),
        totalEvents: events.length,
        totalDuration: session.statistics.duration
      };
    }

    function exportSession(id) {
      const session = sessions.get(id);
      if (!session) return { ok: false, reason: 'not-found' };
      const cpList = session.checkpointIds.map(id => checkpoints.get(id)).filter(Boolean);
      return {
        ok: true,
        data: { session: clone(session), checkpoints: cpList.map(c => clone(c)) }
      };
    }

    function importSession(data, campaignId) {
      const i = obj(data);
      if (!i.session) return { ok: false, reason: 'invalid-data' };
      const session = clone(i.session);
      session.campaignId = campaignId;
      session.id = stableId('session');
      session.createdAt = now();
      session.updatedAt = now();
      session.version = 1;
      const cpMap = {};
      if (i.checkpoints) {
        session.checkpointIds = [];
        session.currentCheckpointId = null;
        for (const cp of i.checkpoints) {
          const newCpId = stableId('cp');
          cpMap[cp.id] = newCpId;
          checkpoints.set(newCpId, { ...clone(cp), id: newCpId, sessionId: session.id });
          session.checkpointIds.push(newCpId);
        }
        session.currentCheckpointId = session.checkpointIds[session.checkpointIds.length - 1] || null;
      }
      sessions.set(session.id, session);
      return { ok: true, session };
    }

    function getCampaignStats(campaignId) {
      const campaign = campaigns.get(campaignId);
      if (!campaign) return null;
      const campaignSessions = getSessionByCampaign(campaignId);
      return {
        campaignId,
        name: campaign.name,
        status: campaign.status,
        sessionCount: campaign.sessionIds.length,
        activeSession: campaign.currentSessionId,
        totalPlayTime: campaign.statistics.totalPlayTime,
        totalXp: campaign.statistics.totalXp,
        characterDeaths: campaign.statistics.characterDeaths,
        averageSessionDuration: campaign.statistics.totalPlayTime / Math.max(1, campaign.sessionIds.length)
      };
    }

    function getSessionStats(sessionId) {
      const session = sessions.get(sessionId);
      if (!session) return null;
      const cpList = session.checkpointIds.map(id => checkpoints.get(id)).filter(Boolean);
      return {
        sessionId,
        name: session.name,
        status: session.status,
        duration: session.endedAt ? new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime() : (session.startedAt ? Date.now() - new Date(session.startedAt).getTime() : 0),
        checkpointCount: session.checkpointIds.length,
        eventCount: session.timeline.events.length,
        xpAwarded: session.statistics.xpAwarded,
        encounters: session.statistics.encounters
      };
    }

    function setOfflineMode(campaignId, enabled) {
      const campaign = campaigns.get(campaignId);
      if (!campaign) return { ok: false, reason: 'not-found' };
      const next = clone(campaign);
      next.settings.offlineMode = enabled;
      if (enabled) {
        next.settings.autoSave = false;
        next.settings.syncInterval = 0;
      }
      campaign.updatedAt = now();
      campaign.version++;
      campaigns.set(campaign.id, next);
      return { ok: true, campaign: next };
    }

    function createBranch(input) {
      const i = obj(input);
      const sourceSessionId = text(i.sourceSessionId);
      const branchSessionId = i.branchSessionId || stableId('session');
      const sourceSession = sessions.get(sourceSessionId);
      if (!sourceSession) return { ok: false, reason: 'source-session-not-found' };
      const name = text(i.name) || `${sourceSession.name} (Branch)`;
      const branchPointId = text(i.branchPointId) || sourceSession.currentCheckpointId;
      const branchPointCp = branchPointId ? checkpoints.get(branchPointId) : null;
      if (branchPointId && !branchPointCp) return { ok: false, reason: 'branch-point-not-found' };

      const branchSession = {
        id: branchSessionId,
        campaignId: sourceSession.campaignId,
        name,
        description: text(i.description),
        status: 'planned',
        scheduledAt: null,
        startedAt: null,
        endedAt: null,
        metadata: { ...sourceSession.metadata, branchOf: sourceSessionId, branchPoint: branchPointId },
        createdAt: now(), updatedAt: now(), version: 1,
        checkpointIds: [], currentCheckpointId: null,
        participants: arr(sourceSession.participants),
        timeline: { events: [], currentIndex: -1 },
        statistics: { duration: 0, xpAwarded: 0, encounters: 0, checkpoints: 0 }
      };

      if (branchPointCp && branchPointCp.stateSnapshot) {
        // Inherit state from branch point
      }

      sessions.set(branchSessionId, branchSession);
      const campaign = campaigns.get(sourceSession.campaignId);
      if (campaign) {
        campaign.sessionIds.push(branchSessionId);
        campaign.updatedAt = now();
        campaign.version++;
        campaigns.set(campaign.id, campaign);
      }

      return { ok: true, session: branchSession };
    }

    function getBranchTree(sessionId) {
      const session = sessions.get(sessionId);
      if (!session) return null;
      const visited = new Set();
      const branches = [];
      function traverse(id, depth) {
        if (visited.has(id)) return;
        visited.add(id);
        const s = sessions.get(id);
        if (!s) return;
        if (s.metadata?.branchOf) {
          branches.push({ sessionId: id, branchOf: s.metadata.branchOf, branchPoint: s.metadata.branchPoint, depth, name: s.name });
        }
        for (const childId of Array.from(sessions.values()).filter(s => s.metadata?.branchOf === id).map(s => s.id)) {
          traverse(childId, depth + 1);
        }
      }
      traverse(sessionId, 0);
      return branches;
    }

    function mergeBranch(input) {
      const i = obj(input);
      const targetSessionId = text(i.targetSessionId);
      const sourceSessionId = text(i.sourceSessionId);
      const strategy = i.strategy || 'timeline_merge';
      const targetSession = sessions.get(targetSessionId);
      const sourceSession = sessions.get(sourceSessionId);
      if (!targetSession || !sourceSession) return { ok: false, reason: 'session-not-found' };
      if (targetSession.campaignId !== sourceSession.campaignId) return { ok: false, reason: 'different-campaigns' };

      const mergedTimeline = [...targetSession.timeline.events];
      if (strategy === 'timeline_merge') {
        for (const e of sourceSession.timeline.events) {
          if (!targetSession.timeline.events.some(e => e.id === e.id)) {
            mergedTimeline.push({ ...e, metadata: { ...e.metadata, mergedFrom: sourceSessionId } });
          }
        }
        mergedTimeline.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
      }
      targetSession.timeline.events = mergedTimeline;
      targetSession.updatedAt = now();
      targetSession.version++;
      sessions.set(targetSessionId, targetSession);
      return { ok: true, session: targetSession };
    }

    return {
      CAMPAIGN_STATUS, SESSION_STATUS, CHECKPOINT_TYPES,
      createCampaign, getCampaign, getAllCampaigns, updateCampaign, deleteCampaign,
      createSession, getSession, getSessionByCampaign, updateSession, startSession, endSession,
      createCheckpoint, getCheckpoint, getCheckpointsBySession, loadCheckpoint, deleteCheckpoint,
      addTimelineEvent, getTimeline, replaySession,
      exportSession, importSession,
      getCampaignStats, getSessionStats,
      setOfflineMode,
      createBranch, getBranchTree, mergeBranch,
      exportState, importState
    };

    function exportState() {
      return {
        version: 1,
        counters: { id: idCounter },
        campaigns: clone(mapsToPlain(Object.fromEntries(campaigns))),
        sessions: clone(mapsToPlain(Object.fromEntries(sessions))),
        checkpoints: clone(mapsToPlain(Object.fromEntries(checkpoints)))
      };
    }

    function importState(data) {
      const d = obj(data);
      campaigns.clear();
      for (const [k, v] of Object.entries(obj(d.campaigns))) campaigns.set(k, plainToMaps(v));
      sessions.clear();
      for (const [k, v] of Object.entries(obj(d.sessions))) sessions.set(k, plainToMaps(v));
      checkpoints.clear();
      for (const [k, v] of Object.entries(obj(d.checkpoints))) checkpoints.set(k, plainToMaps(v));
      idCounter = Math.max(idCounter, Number(obj(d.counters).id || 0));
      return { ok: true, restored: campaigns.size + sessions.size + checkpoints.size };
    }
  }

  function stableId(prefix) { return prefix + '-' + String(nextId()).padStart(6, '0'); }

  return { createCampaignManager };
});