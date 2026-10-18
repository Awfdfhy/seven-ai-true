(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SevenRpgPlayerTools = api;
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

  const SLOT_TYPES = Object.freeze(['manual', 'auto', 'quick', 'checkpoint']);
  const BOOKMARK_TYPES = Object.freeze(['scene', 'quote', 'moment', 'location', 'character']);
  const NOTE_CATEGORIES = Object.freeze(['general', 'theory', 'question', 'reminder', 'lore', 'strategy']);
  const GLOSSARY_CATEGORIES = Object.freeze(['character', 'location', 'item', 'faction', 'concept', 'event', 'term']);
  const UNDO_TYPES = Object.freeze(['message', 'choice', 'action', 'movement', 'trade']);

  function createPlayerToolsManager(stateApi) {
    if (!stateApi || typeof stateApi.createState !== 'function') throw Error('SevenRpgState-compatible stateApi required');

    const saveSlots = new Map();
    const bookmarks = new Map();
    const notes = new Map();
    const glossary = new Map();
    const canonRequests = new Map();
    const undoStack = new Map();
    let idCounter = 0;
    function nextId() { return ++idCounter; }

    // RPG-13-01: Save slots
    function createSaveSlot(input) {
      const i = obj(input);
      const id = i.id || stableId('slot', nextId());
      const slot = {
        id,
        name: text(i.name) || 'Save Slot',
        type: SLOT_TYPES.includes(i.type) ? i.type : 'manual',
        sessionId: text(i.sessionId),
        worldId: text(i.worldId),
        description: text(i.description),
        screenshotUrl: text(i.screenshotUrl) || null,
        playtimeMinutes: clamp(i.playtimeMinutes ?? 0, 0, 999999),
        gameVersion: text(i.gameVersion) || '1.0.0',
        dataSize: clamp(i.dataSize ?? 0, 0, 999999999),
        stateSnapshot: clone(i.stateSnapshot) || null,
        checksum: text(i.checksum) || null,
        createdAt: now(),
        updatedAt: now()
      };
      saveSlots.set(id, slot);
      return slot;
    }

    function getSaveSlot(id) { return saveSlots.get(id) || null; }

    function listSaveSlots(filter) {
      const f = obj(filter);
      let result = Array.from(saveSlots.values());
      if (f.type) result = result.filter(s => s.type === f.type);
      if (f.sessionId) result = result.filter(s => s.sessionId === f.sessionId);
      return result.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    }

    function updateSaveSlot(id, updates) {
      const slot = saveSlots.get(id);
      if (!slot) return { ok: false, reason: 'slot-not-found' };
      const u = obj(updates);
      if (u.name != null) slot.name = text(u.name);
      if (u.description != null) slot.description = text(u.description);
      if (u.stateSnapshot != null) slot.stateSnapshot = clone(u.stateSnapshot);
      if (u.playtimeMinutes != null) slot.playtimeMinutes = clamp(u.playtimeMinutes, 0, 999999);
      slot.updatedAt = now();
      return { ok: true, slot };
    }

    function deleteSaveSlot(id) {
      if (!saveSlots.has(id)) return { ok: false, reason: 'slot-not-found' };
      saveSlots.delete(id);
      return { ok: true };
    }

    // RPG-13-02: Quick save checkpoint
    function createQuickSave(input) {
      const i = obj(input);
      const slot = createSaveSlot({
        name: text(i.name) || 'Quick Save',
        type: 'quick',
        sessionId: text(i.sessionId),
        worldId: text(i.worldId),
        stateSnapshot: i.stateSnapshot,
        description: text(i.description) || 'Quick save checkpoint',
        playtimeMinutes: i.playtimeMinutes
      });
      return slot;
    }

    function createCheckpoint(input) {
      const i = obj(input);
      const slot = createSaveSlot({
        name: text(i.name) || 'Checkpoint',
        type: 'checkpoint',
        sessionId: text(i.sessionId),
        worldId: text(i.worldId),
        stateSnapshot: i.stateSnapshot,
        description: text(i.description) || 'Auto checkpoint',
        playtimeMinutes: i.playtimeMinutes
      });
      return slot;
    }

    function getLatestSave(sessionId, type) {
      const slots = Array.from(saveSlots.values())
        .filter(s => s.sessionId === sessionId && (!type || s.type === type))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      return slots[0] || null;
    }

    // RPG-13-03: Story search
    function searchStory(entries, query, options) {
      const o = obj(options);
      const q = text(query).toLowerCase();
      if (!q) return { results: [], totalCount: 0 };
      const arr1 = arr(entries);
      const maxResults = clamp(o.maxResults ?? 20, 1, 100);
      const results = [];
      for (const entry of arr1) {
        const e = obj(entry);
        const content = text(e.content).toLowerCase();
        const speaker = text(e.speakerName || e.speaker).toLowerCase();
        const searchFields = [content, speaker];
        if (o.searchSpeaker !== false) {
          for (const field of searchFields) {
            const idx = field.indexOf(q);
            if (idx >= 0) {
              const context = text(e.content).substring(Math.max(0, idx - 40), idx + q.length + 40);
              results.push({
                entryId: e.id || e.entryId,
                field: field === content ? 'content' : 'speaker',
                context: (idx > 40 ? '...' : '') + context + (idx + q.length < field.length ? '...' : ''),
                speakerName: e.speakerName || e.speaker || null,
                timestamp: e.timestamp || null,
                relevance: 1
              });
              break;
            }
          }
        }
        if (results.length >= maxResults) break;
      }
      return { results, totalCount: results.length, query: text(query) };
    }

    // RPG-13-04: Bookmark scenes
    function createBookmark(input) {
      const i = obj(input);
      const id = i.id || stableId('bmk', nextId());
      const bookmark = {
        id,
        type: BOOKMARK_TYPES.includes(i.type) ? i.type : 'scene',
        title: text(i.title) || 'Bookmark',
        description: text(i.description),
        referenceId: text(i.referenceId), // sceneId, messageId, locationId, etc.
        sessionId: text(i.sessionId),
        sceneId: text(i.sceneId),
        tick: clamp(i.tick ?? 0, 0, 999999),
        tags: uniq(i.tags),
        color: text(i.color) || 'blue',
        pinned: i.pinned === true,
        createdAt: now()
      };
      bookmarks.set(id, bookmark);
      return bookmark;
    }

    function getBookmarks(filter) {
      const f = obj(filter);
      let result = Array.from(bookmarks.values());
      if (f.type) result = result.filter(b => b.type === f.type);
      if (f.sessionId) result = result.filter(b => b.sessionId === f.sessionId);
      if (f.tag) result = result.filter(b => b.tags.includes(f.tag));
      if (f.pinned != null) result = result.filter(b => b.pinned === f.pinned);
      return result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }

    function deleteBookmark(id) {
      if (!bookmarks.has(id)) return { ok: false, reason: 'bookmark-not-found' };
      bookmarks.delete(id);
      return { ok: true };
    }

    // RPG-13-05: Highlight quotes
    function highlightQuote(input) {
      const i = obj(input);
      const bookmark = createBookmark({
        type: 'quote',
        title: text(i.title) || 'Quote',
        description: text(i.quote) || text(i.description),
        referenceId: text(i.messageId),
        sessionId: text(i.sessionId),
        sceneId: text(i.sceneId),
        tags: [...uniq(i.tags), 'quote'],
        color: text(i.color) || 'yellow',
        pinned: true
      });
      return { ...bookmark, quote: text(i.quote), speakerName: text(i.speakerName) };
    }

    function getHighlights(sessionId) {
      return getBookmarks({ type: 'quote', sessionId });
    }

    // RPG-13-06: Export transcript
    function exportTranscript(input) {
      const i = obj(input);
      const entries = arr(i.entries);
      const format = text(i.format) || 'text'; // text, json, markdown
      const includeTimestamps = i.includeTimestamps !== false;
      const includeSpeaker = i.includeSpeaker !== false;
      if (format === 'json') {
        return { ok: true, format: 'json', content: JSON.stringify(entries.map(e => ({
          id: e.id, speaker: includeSpeaker ? (e.speakerName || e.speaker) : null,
          content: e.content, timestamp: includeTimestamps ? e.timestamp : null
        })), null, 2), entryCount: entries.length };
      }
      if (format === 'markdown') {
        const lines = entries.map(e => {
          const parts = [];
          if (includeTimestamps && e.timestamp) parts.push(`*[${e.timestamp}]*`);
          if (includeSpeaker && (e.speakerName || e.speaker)) parts.push(`**${e.speakerName || e.speaker}:**`);
          parts.push(text(e.content));
          return parts.join(' ');
        });
        return { ok: true, format: 'markdown', content: lines.join('\n\n'), entryCount: entries.length };
      }
      // text format
      const lines = entries.map(e => {
        const parts = [];
        if (includeTimestamps && e.timestamp) parts.push(`[${e.timestamp}]`);
        if (includeSpeaker && (e.speakerName || e.speaker)) parts.push(`${e.speakerName || e.speaker}:`);
        parts.push(text(e.content));
        return parts.join(' ');
      });
      return { ok: true, format: 'text', content: lines.join('\n'), entryCount: entries.length };
    }

    // RPG-13-07: Share spoiler free recap
    function generateSpoilerFreeRecap(input) {
      const i = obj(input);
      const entries = arr(i.entries);
      const uptoTick = clamp(i.uptoTick ?? Infinity, 0, 999999);
      const spoilerKeywords = uniq(i.spoilerKeywords || ['dies', 'death', 'killed', 'betrayal', 'traitor', 'secret', 'reveals', 'ending', 'final', 'destroyed']);
      const filtered = entries.filter(e => {
        const tick = clamp(e.tick ?? 0, 0, 999999);
        if (tick > uptoTick) return false;
        const content = text(e.content).toLowerCase();
        for (const keyword of spoilerKeywords) {
          if (content.includes(keyword.toLowerCase())) return false;
        }
        return true;
      });
      const summary = filtered.slice(-10).map(e => text(e.content)).join(' ');
      return {
        ok: true,
        entryCount: filtered.length,
        totalEntries: entries.length,
        redactedCount: entries.length - filtered.length,
        recap: summary.substring(0, 500),
        uptoTick
      };
    }

    // RPG-13-08: Notes journal
    function createNote(input) {
      const i = obj(input);
      const id = i.id || stableId('note', nextId());
      const note = {
        id,
        title: text(i.title) || 'Untitled Note',
        content: text(i.content),
        category: NOTE_CATEGORIES.includes(i.category) ? i.category : 'general',
        tags: uniq(i.tags),
        sessionId: text(i.sessionId),
        linkedEntityIds: uniq(i.linkedEntityIds),
        pinned: i.pinned === true,
        color: text(i.color) || null,
        createdAt: now(),
        updatedAt: now()
      };
      notes.set(id, note);
      return note;
    }

    function getNote(id) { return notes.get(id) || null; }

    function updateNote(id, updates) {
      const note = notes.get(id);
      if (!note) return { ok: false, reason: 'note-not-found' };
      const u = obj(updates);
      if (u.title != null) note.title = text(u.title);
      if (u.content != null) note.content = text(u.content);
      if (u.category != null && NOTE_CATEGORIES.includes(u.category)) note.category = u.category;
      if (u.tags != null) note.tags = uniq(u.tags);
      if (u.pinned != null) note.pinned = u.pinned === true;
      note.updatedAt = now();
      return { ok: true, note };
    }

    function getNotes(filter) {
      const f = obj(filter);
      let result = Array.from(notes.values());
      if (f.category) result = result.filter(n => n.category === f.category);
      if (f.sessionId) result = result.filter(n => n.sessionId === f.sessionId);
      if (f.tag) result = result.filter(n => n.tags.includes(f.tag));
      if (f.pinned != null) result = result.filter(n => n.pinned === f.pinned);
      if (f.search) {
        const q = text(f.search).toLowerCase();
        result = result.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
      }
      return result.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    }

    function deleteNote(id) {
      if (!notes.has(id)) return { ok: false, reason: 'note-not-found' };
      notes.delete(id);
      return { ok: true };
    }

    // RPG-13-09: Player authored canon requests
    function createCanonRequest(input) {
      const i = obj(input);
      const id = i.id || stableId('creq', nextId());
      const request = {
        id,
        title: text(i.title) || 'Canon Request',
        description: text(i.description),
        proposedCanon: text(i.proposedCanon),
        category: text(i.category) || 'world',
        status: 'pending', // pending, approved, rejected, needs-revision
        priority: clamp(i.priority ?? 5, 1, 10),
        sessionId: text(i.sessionId),
        relatedEntityIds: uniq(i.relatedEntityIds),
        justification: text(i.justification),
        gmResponse: null,
        respondedAt: null,
        createdAt: now(),
        updatedAt: now()
      };
      canonRequests.set(id, request);
      return request;
    }

    function getCanonRequest(id) { return canonRequests.get(id) || null; }

    function respondToCanonRequest(id, status, response) {
      const request = canonRequests.get(id);
      if (!request) return { ok: false, reason: 'request-not-found' };
      const validStatuses = ['approved', 'rejected', 'needs-revision'];
      if (!validStatuses.includes(status)) return { ok: false, reason: 'invalid-status' };
      request.status = status;
      request.gmResponse = text(response);
      request.respondedAt = now();
      request.updatedAt = now();
      return { ok: true, request };
    }

    function getCanonRequests(filter) {
      const f = obj(filter);
      let result = Array.from(canonRequests.values());
      if (f.status) result = result.filter(r => r.status === f.status);
      if (f.sessionId) result = result.filter(r => r.sessionId === f.sessionId);
      return result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }

    // RPG-13-10: World glossary
    function addGlossaryEntry(input) {
      const i = obj(input);
      const id = i.id || stableId('gloss', nextId());
      const entry = {
        id,
        term: text(i.term) || 'Unknown Term',
        definition: text(i.definition),
        category: GLOSSARY_CATEGORIES.includes(i.category) ? i.category : 'concept',
        aliases: uniq(i.aliases),
        relatedTerms: uniq(i.relatedTerms),
        firstMentionedTick: clamp(i.firstMentionedTick ?? 0, 0, 999999),
        spoilerLevel: clamp(i.spoilerLevel ?? 0, 0, 3), // 0=public, 1=minor, 2=moderate, 3=major
        sourceEntryId: text(i.sourceEntryId) || null,
        autoGenerated: i.autoGenerated === true,
        verified: i.verified === true,
        createdAt: now(),
        updatedAt: now()
      };
      glossary.set(id, entry);
      return entry;
    }

    function getGlossaryEntry(id) { return glossary.get(id) || null; }

    function searchGlossary(query, options) {
      const o = obj(options);
      const q = text(query).toLowerCase();
      if (!q) return [];
      const maxSpoiler = clamp(o.maxSpoilerLevel ?? 3, 0, 3);
      return Array.from(glossary.values())
        .filter(e => e.spoilerLevel <= maxSpoiler)
        .filter(e => {
          return e.term.toLowerCase().includes(q) ||
                 e.definition.toLowerCase().includes(q) ||
                 e.aliases.some(a => a.toLowerCase().includes(q));
        })
        .map(e => ({
          id: e.id, term: e.term, definition: e.definition,
          category: e.category, aliases: e.aliases, spoilerLevel: e.spoilerLevel
        }));
    }

    function updateGlossaryEntry(id, updates) {
      const entry = glossary.get(id);
      if (!entry) return { ok: false, reason: 'entry-not-found' };
      const u = obj(updates);
      if (u.definition != null) entry.definition = text(u.definition);
      if (u.category != null && GLOSSARY_CATEGORIES.includes(u.category)) entry.category = u.category;
      if (u.aliases != null) entry.aliases = uniq(u.aliases);
      if (u.relatedTerms != null) entry.relatedTerms = uniq(u.relatedTerms);
      if (u.spoilerLevel != null) entry.spoilerLevel = clamp(u.spoilerLevel, 0, 3);
      if (u.verified != null) entry.verified = u.verified === true;
      entry.updatedAt = now();
      return { ok: true, entry };
    }

    // RPG-13-11: NPC directory (reuse glossary)
    function getNpcDirectory(filter) {
      const f = obj(filter);
      let result = Array.from(glossary.values()).filter(e => e.category === 'character');
      if (f.search) {
        const q = text(f.search).toLowerCase();
        result = result.filter(e => e.term.toLowerCase().includes(q) || e.aliases.some(a => a.toLowerCase().includes(q)));
      }
      if (f.maxSpoilerLevel != null) result = result.filter(e => e.spoilerLevel <= f.maxSpoilerLevel);
      return result.map(e => ({
        id: e.id, name: e.term, description: e.definition,
        aliases: e.aliases, spoilerLevel: e.spoilerLevel
      }));
    }

    // RPG-13-12: Relationship viewer
    function getRelationshipOverview(relationships) {
      const rels = obj(relationships);
      const dimensions = ['trust', 'affection', 'respect', 'fear', 'loyalty'];
      const overview = {};
      for (const [charId, rel] of Object.entries(rels)) {
        const summary = {};
        for (const dim of dimensions) {
          const val = rel[dim];
          if (val != null) {
            summary[dim] = {
              value: clamp(val, -1, 1),
              label: val > 0.5 ? 'very-high' : val > 0.2 ? 'high' : val > -0.2 ? 'neutral' : val > -0.5 ? 'low' : 'very-low'
            };
          }
        }
        overview[charId] = summary;
      }
      return overview;
    }

    function getStrongestRelationships(relationships, dimension, limit) {
      const rels = obj(relationships);
      const dim = text(dimension) || 'trust';
      const l = clamp(limit ?? 5, 1, 50);
      return Object.entries(rels)
        .filter(([_, rel]) => rel[dim] != null)
        .map(([charId, rel]) => ({ characterId: charId, value: clamp(rel[dim], -1, 1), dimension: dim }))
        .sort((a, b) => b.value - a.value)
        .slice(0, l);
    }

    // RPG-13-13: Timeline explorer
    function getTimeline(events, filter) {
      const f = obj(filter);
      let result = arr(events);
      if (f.fromTick != null) result = result.filter(e => (e.tick ?? 0) >= f.fromTick);
      if (f.toTick != null) result = result.filter(e => (e.tick ?? 0) <= f.toTick);
      if (f.type) result = result.filter(e => e.type === f.type);
      if (f.tags) {
        const tags = uniq(f.tags);
        result = result.filter(e => tags.some(t => arr(e.tags).includes(t)));
      }
      result.sort((a, b) => (a.tick ?? 0) - (b.tick ?? 0));
      return {
        events: result.slice(0, clamp(f.limit ?? 50, 1, 500)),
        totalCount: result.length,
        fromTick: f.fromTick ?? (result[0]?.tick ?? 0),
        toTick: f.toTick ?? (result[result.length - 1]?.tick ?? 0)
      };
    }

    function getTimelineSummary(events) {
      const evts = arr(events);
      const types = {};
      for (const e of evts) {
        const t = text(e.type) || 'unknown';
        types[t] = (types[t] || 0) + 1;
      }
      const ticks = evts.map(e => e.tick ?? 0);
      return {
        totalEvents: evts.length,
        typeDistribution: types,
        minTick: Math.min(...ticks),
        maxTick: Math.max(...ticks),
        span: Math.max(...ticks) - Math.min(...ticks)
      };
    }

    // RPG-13-14: Session comparison
    function compareSessions(sessionA, sessionB) {
      const a = obj(sessionA);
      const b = obj(sessionB);
      const aEvents = arr(a.events);
      const bEvents = arr(b.events);
      const aCharacters = uniq(aEvents.map(e => e.characterId).filter(Boolean));
      const bCharacters = uniq(bEvents.map(e => e.characterId).filter(Boolean));
      const sharedCharacters = aCharacters.filter(c => bCharacters.includes(c));
      const aLocations = uniq(aEvents.map(e => e.locationId).filter(Boolean));
      const bLocations = uniq(bEvents.map(e => e.locationId).filter(Boolean));
      const sharedLocations = aLocations.filter(l => bLocations.includes(l));
      return {
        sessionA: { id: a.id, name: a.name, eventCount: aEvents.length, characters: aCharacters, locations: aLocations },
        sessionB: { id: b.id, name: b.name, eventCount: bEvents.length, characters: bCharacters, locations: bLocations },
        comparison: {
          eventCountDiff: Math.abs(aEvents.length - bEvents.length),
          sharedCharacters,
          uniqueToA: aCharacters.filter(c => !bCharacters.includes(c)),
          uniqueToB: bCharacters.filter(c => !aCharacters.includes(c)),
          sharedLocations,
          characterOverlap: aCharacters.length > 0 ? Math.round(sharedCharacters.length / Math.max(aCharacters.length, bCharacters.length) * 100) : 0
        }
      };
    }

    // RPG-13-15: Undo uncommitted action
    function recordUndoableAction(input) {
      const i = obj(input);
      const id = i.id || stableId('undo', nextId());
      const action = {
        id,
        type: UNDO_TYPES.includes(i.type) ? i.type : 'action',
        description: text(i.description),
        sessionId: text(i.sessionId),
        preState: clone(i.preState) || null,
        postState: clone(i.postState) || null,
        committed: i.committed === true,
        undone: false,
        undoneAt: null,
        createdAt: now()
      };
      undoStack.set(id, action);
      return action;
    }

    function undoAction(id) {
      const action = undoStack.get(id);
      if (!action) return { ok: false, reason: 'action-not-found' };
      if (action.committed) return { ok: false, reason: 'action-already-committed', message: 'Cannot undo a committed action' };
      if (action.undone) return { ok: false, reason: 'already-undone' };
      action.undone = true;
      action.undoneAt = now();
      return { ok: true, restoredState: action.preState, action };
    }

    function commitAction(id) {
      const action = undoStack.get(id);
      if (!action) return { ok: false, reason: 'action-not-found' };
      if (action.undone) return { ok: false, reason: 'already-undone' };
      action.committed = true;
      return { ok: true, action };
    }

    function getUndoableActions(sessionId) {
      return Array.from(undoStack.values())
        .filter(a => !a.committed && !a.undone)
        .filter(a => !sessionId || a.sessionId === sessionId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }

    function clearUndoHistory(sessionId) {
      let cleared = 0;
      for (const [id, action] of undoStack) {
        if (!sessionId || action.sessionId === sessionId) {
          undoStack.delete(id);
          cleared++;
        }
      }
      return { ok: true, cleared };
    }

    // RPG-02-12: Replay read-only
    const replays = new Map();

    function createReplaySession(input) {
      const i = obj(input);
      const id = i.id || stableId('replay', nextId());
      const replay = {
        id,
        sessionId: text(i.sessionId),
        initialState: clone(i.initialState) || null,
        events: arr(i.events).map(e => clone(e)),
        readOnly: true,
        cursor: 0,
        status: 'ready', // ready, playing, paused, finished
        speed: clamp(i.speed ?? 1, 0.25, 4),
        createdAt: now(),
        metadata: obj(i.metadata)
      };
      replays.set(id, replay);
      return clone(replay);
    }

    function getReplaySession(replayId) {
      const replay = replays.get(replayId);
      return replay ? clone(replay) : null;
    }

    function appendReplayEvent(replayId, event) {
      const replay = replays.get(replayId);
      if (!replay) return { ok: false, reason: 'replay-not-found' };
      replay.events.push(clone(event));
      return { ok: true, eventCount: replay.events.length };
    }

    function getReplayState(replayId, uptoIndex) {
      const replay = replays.get(replayId);
      if (!replay) return { ok: false, reason: 'replay-not-found' };
      if (!replay.initialState) return { ok: false, reason: 'missing-initial-state' };
      const limit = uptoIndex == null ? replay.events.length : clamp(uptoIndex, 0, replay.events.length);
      let state = stateApi.createState(replay.initialState);
      const applied = [];
      const rejected = [];
      for (let n = 0; n < limit; n++) {
        const event = replay.events[n];
        const out = stateApi.applyEvent(state, event);
        if (out && out.ok === true) {
          state = out.state;
          applied.push({ index: n, eventId: event && event.id || null, record: out.record || null });
        } else {
          rejected.push({ index: n, eventId: event && event.id || null, reason: out && out.reason || 'unknown' });
        }
      }
      const validation = stateApi.validateState ? stateApi.validateState(state) : { valid: true };
      return {
        ok: true,
        readOnly: true,
        state: clone(state),
        appliedCount: applied.length,
        rejectedCount: rejected.length,
        applied,
        rejected,
        cursor: limit,
        totalEvents: replay.events.length,
        valid: validation.valid !== false
      };
    }

    function stepReplay(replayId, steps) {
      const replay = replays.get(replayId);
      if (!replay) return { ok: false, reason: 'replay-not-found' };
      const inc = steps == null ? 1 : clamp(Math.trunc(steps), 1, replay.events.length);
      replay.cursor = clamp(replay.cursor + inc, 0, replay.events.length);
      replay.status = replay.cursor >= replay.events.length ? 'finished' : 'playing';
      return { ok: true, cursor: replay.cursor, status: replay.status, totalEvents: replay.events.length };
    }

    function seekReplay(replayId, index) {
      const replay = replays.get(replayId);
      if (!replay) return { ok: false, reason: 'replay-not-found' };
      replay.cursor = clamp(Math.trunc(index), 0, replay.events.length);
      replay.status = replay.cursor >= replay.events.length ? 'finished' : replay.cursor > 0 ? 'paused' : 'ready';
      return { ok: true, cursor: replay.cursor, status: replay.status };
    }

    function mutateReplayState(replayId) {
      const replay = replays.get(replayId);
      if (!replay) return { ok: false, reason: 'replay-not-found' };
      return { ok: false, reason: 'read-only', message: 'Replay sessions are read-only; mutations are not permitted' };
    }

    function deleteReplay(replayId) {
      const existed = replays.delete(replayId);
      return existed ? { ok: true } : { ok: false, reason: 'replay-not-found' };
    }

    // Persistence seam (additive): serializes every closure-scoped Map so a
    // server can save/restore this manager, and never moves the id counter
    // backwards so post-restore ids cannot collide with pre-restore ones.
    function restoreMap(target, raw) {
      const rebuilt = plainToMaps(obj(raw));
      target.clear();
      if (rebuilt instanceof Map) for (const [k, v] of rebuilt) target.set(k, v);
      return target;
    }

    function exportState() {
      return {
        version: 1,
        counters: { id: idCounter },
        saveSlots: clone(mapsToPlain(saveSlots)),
        bookmarks: clone(mapsToPlain(bookmarks)),
        notes: clone(mapsToPlain(notes)),
        glossary: clone(mapsToPlain(glossary)),
        canonRequests: clone(mapsToPlain(canonRequests)),
        undoStack: clone(mapsToPlain(undoStack)),
        replays: clone(mapsToPlain(replays))
      };
    }

    function importState(data) {
      const d = obj(data);
      restoreMap(saveSlots, d.saveSlots);
      restoreMap(bookmarks, d.bookmarks);
      restoreMap(notes, d.notes);
      restoreMap(glossary, d.glossary);
      restoreMap(canonRequests, d.canonRequests);
      restoreMap(undoStack, d.undoStack);
      restoreMap(replays, d.replays);
      idCounter = Math.max(idCounter, Number(obj(d.counters).id || 0));
      const restored = saveSlots.size + notes.size + bookmarks.size + glossary.size + canonRequests.size + undoStack.size + replays.size;
      return { ok: true, restored };
    }

    return {
      SLOT_TYPES, BOOKMARK_TYPES, NOTE_CATEGORIES,
      GLOSSARY_CATEGORIES, UNDO_TYPES,
      createSaveSlot, getSaveSlot, listSaveSlots, updateSaveSlot, deleteSaveSlot,
      createQuickSave, createCheckpoint, getLatestSave,
      searchStory,
      createBookmark, getBookmarks, deleteBookmark,
      highlightQuote, getHighlights,
      exportTranscript,
      generateSpoilerFreeRecap,
      createNote, getNote, updateNote, getNotes, deleteNote,
      createCanonRequest, getCanonRequest, respondToCanonRequest, getCanonRequests,
      addGlossaryEntry, getGlossaryEntry, searchGlossary, updateGlossaryEntry,
      getNpcDirectory,
      getRelationshipOverview, getStrongestRelationships,
      getTimeline, getTimelineSummary,
      compareSessions,
      recordUndoableAction, undoAction, commitAction, getUndoableActions, clearUndoHistory,
      createReplaySession, getReplaySession, appendReplayEvent, getReplayState,
      stepReplay, seekReplay, mutateReplayState, deleteReplay,
      exportState, importState
    };
  }

  return { createPlayerToolsManager };
});
