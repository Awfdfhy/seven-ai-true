(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SevenRpgNarration = api;
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

  const SPEAKER_TYPES = Object.freeze(['narrator', 'player', 'npc', 'system', 'choice']);
  const NARRATION_STYLES = Object.freeze(['descriptive', 'terse', 'poetic', 'journal', 'dramatic', 'minimal']);
  const PACING_MODES = Object.freeze(['slow', 'normal', 'fast', 'climax', 'downtime']);
  const CONSEQUENCE_TYPES = Object.freeze(['immediate', 'delayed', 'persistent', 'reversible', 'irreversible']);
  const CHOICE_TYPES = Object.freeze(['dialogue', 'action', 'moral', 'tactical', 'exploration']);
  const ARC_STATUSES = Object.freeze(['planned', 'active', 'completed', 'abandoned', 'suspended']);
  const SCENE_STATUSES = Object.freeze(['planned', 'active', 'paused', 'completed', 'skipped']);
  const TONE_LEVELS = Object.freeze(['light', 'neutral', 'serious', 'dark', 'horror', 'comedic', 'epic']);

  function createNarrationManager(stateApi) {
    if (!stateApi || typeof stateApi.createState !== 'function') throw Error('SevenRpgState-compatible stateApi required');

    const scenes = new Map();
    const chapters = new Map();
    const arcs = new Map();
    const consequences = new Map();
    const foreshadowing = new Map();
    const dialogueVariants = new Map();
    let idCounter = 0;
    function nextId() { return ++idCounter; }

    // RPG-05-01: Narrator vs dialogue styling
    function createNarrationEntry(input) {
      const i = obj(input);
      const speakerType = SPEAKER_TYPES.includes(i.speakerType) ? i.speakerType : 'narrator';
      const style = speakerType === 'narrator'
        ? (NARRATION_STYLES.includes(i.style) ? i.style : 'descriptive')
        : null;
      return {
        id: i.id || stableId('narr', nextId()),
        speakerType,
        speakerId: text(i.speakerId) || null,
        speakerName: text(i.speakerName) || null,
        content: text(i.content),
        style,
        timestamp: i.timestamp || now(),
        sceneId: text(i.sceneId) || null,
        metadata: obj(i.metadata)
      };
    }

    // RPG-05-02: Character speaker attribution
    function attributeSpeaker(entry, characterMap) {
      const e = obj(entry);
      const map = obj(characterMap);
      if (e.speakerId && map[e.speakerId]) {
        const char = map[e.speakerId];
        return {
          ...e,
          speakerName: text(char.name) || e.speakerName,
          speakerType: 'npc',
          characterId: e.speakerId,
          dialogueStyle: obj(char.voice)
        };
      }
      return e;
    }

    // RPG-05-03: Player agency hard lock
    const agencyLock = { locked: false, reason: null, lockedAt: null, lockedBy: null };

    function lockPlayerAgency(reason, lockedBy) {
      agencyLock.locked = true;
      agencyLock.reason = text(reason) || 'gm-lock';
      agencyLock.lockedAt = now();
      agencyLock.lockedBy = text(lockedBy) || 'system';
      return { ok: true, lock: clone(agencyLock) };
    }

    function unlockPlayerAgency() {
      agencyLock.locked = false;
      agencyLock.reason = null;
      agencyLock.lockedAt = null;
      agencyLock.lockedBy = null;
      return { ok: true };
    }

    function isPlayerAgencyLocked() {
      return agencyLock.locked;
    }

    function canPlayerAct() {
      return !agencyLock.locked;
    }

    function assertPlayerAgency(actionDescription) {
      if (agencyLock.locked) {
        return {
          allowed: false,
          reason: agencyLock.reason,
          message: `Player agency is locked (${agencyLock.reason}). Cannot perform: ${actionDescription}`
        };
      }
      return { allowed: true };
    }

    // RPG-05-04: Scene cards
    function createScene(input) {
      const i = obj(input);
      const id = i.id || stableId('scene', nextId());
      const scene = {
        id,
        title: text(i.title) || 'Untitled Scene',
        chapterId: text(i.chapterId) || null,
        locationId: text(i.locationId) || null,
        timeOfDay: text(i.timeOfDay) || null,
        weather: text(i.weather) || null,
        characters: uniq(i.characters),
        objectives: arr(i.objectives).map(o => ({
          id: o.id || stableId('obj', nextId()),
          description: text(o.description),
          completed: o.completed === true,
          optional: o.optional === true
        })),
        status: SCENE_STATUSES.includes(i.status) ? i.status : 'planned',
        pacing: PACING_MODES.includes(i.pacing) ? i.pacing : 'normal',
        tone: TONE_LEVELS.includes(i.tone) ? i.tone : 'neutral',
        notes: text(i.notes),
        entries: [],
        startedAt: null,
        completedAt: null,
        createdAt: now(),
        updatedAt: now()
      };
      scenes.set(id, scene);
      return scene;
    }

    function getScene(id) { return scenes.get(id) || null; }

    function updateScene(id, updates) {
      const scene = scenes.get(id);
      if (!scene) return { ok: false, reason: 'scene-not-found' };
      const u = obj(updates);
      if (u.title != null) scene.title = text(u.title);
      if (u.locationId != null) scene.locationId = text(u.locationId);
      if (u.status != null && SCENE_STATUSES.includes(u.status)) {
        scene.status = u.status;
        if (u.status === 'active' && !scene.startedAt) scene.startedAt = now();
        if (u.status === 'completed') scene.completedAt = now();
      }
      if (u.pacing != null && PACING_MODES.includes(u.pacing)) scene.pacing = u.pacing;
      if (u.tone != null && TONE_LEVELS.includes(u.tone)) scene.tone = u.tone;
      if (u.notes != null) scene.notes = text(u.notes);
      scene.updatedAt = now();
      return { ok: true, scene };
    }

    function addSceneEntry(sceneId, entry) {
      const scene = scenes.get(sceneId);
      if (!scene) return { ok: false, reason: 'scene-not-found' };
      const e = createNarrationEntry({ ...obj(entry), sceneId });
      scene.entries.push(e);
      scene.updatedAt = now();
      return { ok: true, entry: e };
    }

    function getScenes(filter) {
      const f = obj(filter);
      let result = Array.from(scenes.values());
      if (f.chapterId) result = result.filter(s => s.chapterId === f.chapterId);
      if (f.status) result = result.filter(s => s.status === f.status);
      if (f.locationId) result = result.filter(s => s.locationId === f.locationId);
      return result;
    }

    // RPG-05-05: Chapter titles
    function createChapter(input) {
      const i = obj(input);
      const id = i.id || stableId('ch', nextId());
      const chapter = {
        id,
        title: text(i.title) || 'Untitled Chapter',
        subtitle: text(i.subtitle) || null,
        arcId: text(i.arcId) || null,
        order: Number.isFinite(i.order) ? i.order : 0,
        summary: text(i.summary),
        sceneIds: [],
        status: i.status === 'active' ? 'active' : 'planned',
        createdAt: now(),
        updatedAt: now()
      };
      chapters.set(id, chapter);
      return chapter;
    }

    function getChapter(id) { return chapters.get(id) || null; }

    function updateChapter(id, updates) {
      const ch = chapters.get(id);
      if (!ch) return { ok: false, reason: 'chapter-not-found' };
      const u = obj(updates);
      if (u.title != null) ch.title = text(u.title);
      if (u.subtitle != null) ch.subtitle = text(u.subtitle);
      if (u.summary != null) ch.summary = text(u.summary);
      if (u.order != null) ch.order = Number(u.order) || ch.order;
      ch.updatedAt = now();
      return { ok: true, chapter: ch };
    }

    function getChapters(filter) {
      const f = obj(filter);
      let result = Array.from(chapters.values());
      if (f.arcId) result = result.filter(c => c.arcId === f.arcId);
      if (f.status) result = result.filter(c => c.status === f.status);
      return result.sort((a, b) => a.order - b.order);
    }

    // RPG-05-06: Episode arcs
    function createArc(input) {
      const i = obj(input);
      const id = i.id || stableId('arc', nextId());
      const arc = {
        id,
        title: text(i.title) || 'Untitled Arc',
        description: text(i.description),
        status: ARC_STATUSES.includes(i.status) ? i.status : 'planned',
        chapterIds: [],
        plannedChapters: Math.max(1, Number(i.plannedChapters) || 1),
        themes: uniq(i.themes),
        tone: TONE_LEVELS.includes(i.tone) ? i.tone : 'neutral',
        createdAt: now(),
        updatedAt: now()
      };
      arcs.set(id, arc);
      return arc;
    }

    function getArc(id) { return arcs.get(id) || null; }

    function updateArc(id, updates) {
      const arc = arcs.get(id);
      if (!arc) return { ok: false, reason: 'arc-not-found' };
      const u = obj(updates);
      if (u.title != null) arc.title = text(u.title);
      if (u.description != null) arc.description = text(u.description);
      if (u.status != null && ARC_STATUSES.includes(u.status)) arc.status = u.status;
      if (u.tone != null && TONE_LEVELS.includes(u.tone)) arc.tone = u.tone;
      if (u.plannedChapters != null) arc.plannedChapters = Math.max(1, Number(u.plannedChapters) || arc.plannedChapters);
      arc.updatedAt = now();
      return { ok: true, arc };
    }

    function getArcProgress(arcId) {
      const arc = arcs.get(arcId);
      if (!arc) return null;
      const completed = Array.from(chapters.values()).filter(c => c.arcId === arcId && c.status === 'completed').length;
      return {
        arcId,
        title: arc.title,
        status: arc.status,
        plannedChapters: arc.plannedChapters,
        completedChapters: completed,
        percentage: arc.plannedChapters > 0 ? Math.round(completed / arc.plannedChapters * 100) : 0
      };
    }

    // RPG-05-07: Scene objectives
    function addSceneObjective(sceneId, objective) {
      const scene = scenes.get(sceneId);
      if (!scene) return { ok: false, reason: 'scene-not-found' };
      const o = obj(objective);
      const objRecord = {
        id: o.id || stableId('obj', nextId()),
        description: text(o.description),
        completed: o.completed === true,
        optional: o.optional === true
      };
      scene.objectives.push(objRecord);
      scene.updatedAt = now();
      return { ok: true, objective: objRecord };
    }

    function completeSceneObjective(sceneId, objectiveId, completed) {
      const scene = scenes.get(sceneId);
      if (!scene) return { ok: false, reason: 'scene-not-found' };
      const objective = scene.objectives.find(o => o.id === objectiveId);
      if (!objective) return { ok: false, reason: 'objective-not-found' };
      objective.completed = completed !== false;
      scene.updatedAt = now();
      return { ok: true, objective };
    }

    function getSceneObjectives(sceneId) {
      const scene = scenes.get(sceneId);
      return scene ? clone(scene.objectives) : [];
    }

    // RPG-05-08: Pacing controls
    function setScenePacing(sceneId, pacing) {
      const scene = scenes.get(sceneId);
      if (!scene) return { ok: false, reason: 'scene-not-found' };
      if (!PACING_MODES.includes(pacing)) return { ok: false, reason: 'invalid-pacing' };
      const oldPacing = scene.pacing;
      scene.pacing = pacing;
      scene.updatedAt = now();
      return { ok: true, oldPacing, newPacing: pacing };
    }

    function getPacingRecommendation(sceneId) {
      const scene = scenes.get(sceneId);
      if (!scene) return null;
      const completedObjectives = scene.objectives.filter(o => o.completed).length;
      const totalObjectives = scene.objectives.length;
      if (totalObjectives === 0) return { recommended: 'normal', reason: 'no-objectives' };
      const ratio = completedObjectives / totalObjectives;
      if (ratio < 0.3) return { recommended: 'slow', reason: 'early-scene' };
      if (ratio < 0.7) return { recommended: 'normal', reason: 'mid-scene' };
      return { recommended: 'fast', reason: 'approaching-completion' };
    }

    // RPG-05-09: Recap on return
    function generateRecap(sessionId, options) {
      const o = obj(options);
      const maxEntries = Math.max(1, Number(o.maxEntries) || 10);
      const relevantScenes = Array.from(scenes.values())
        .filter(s => s.status === 'completed')
        .sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''))
        .slice(0, maxEntries);
      const recentChapters = Array.from(chapters.values())
        .filter(c => c.status === 'active' || c.status === 'completed')
        .sort((a, b) => b.order - a.order)
        .slice(0, 3);
      const activeArcs = Array.from(arcs.values()).filter(a => a.status === 'active');
      return {
        sessionId: text(sessionId),
        generatedAt: now(),
        recentScenes: relevantScenes.map(s => ({
          id: s.id, title: s.title, locationId: s.locationId,
          completedAt: s.completedAt, objectivesCompleted: s.objectives.filter(x => x.completed).length
        })),
        currentChapters: recentChapters.map(c => ({ id: c.id, title: c.title, status: c.status })),
        activeArcs: activeArcs.map(a => ({ id: a.id, title: a.title, status: a.status })),
        summary: `Recap: ${relevantScenes.length} recent scenes, ${recentChapters.length} chapters, ${activeArcs.length} active arcs.`
      };
    }

    // RPG-05-10: Story choices optional
    function createChoice(input) {
      const i = obj(input);
      const id = i.id || stableId('choice', nextId());
      const choice = {
        id,
        sceneId: text(i.sceneId) || null,
        prompt: text(i.prompt),
        type: CHOICE_TYPES.includes(i.type) ? i.type : 'action',
        options: arr(i.options).map(opt => ({
          id: opt.id || stableId('opt', nextId()),
          text: text(opt.text),
          consequences: arr(opt.consequences).map(c => c.id || stableId('cons', nextId())),
          metadata: obj(opt.metadata)
        })),
        required: i.required === true,
        selectedOptionId: null,
        resolvedAt: null,
        createdAt: now()
      };
      consequences.set(id, choice);
      return choice;
    }

    function resolveChoice(choiceId, optionId) {
      const choice = consequences.get(choiceId);
      if (!choice) return { ok: false, reason: 'choice-not-found' };
      const option = choice.options.find(o => o.id === optionId);
      if (!option) return { ok: false, reason: 'option-not-found' };
      choice.selectedOptionId = optionId;
      choice.resolvedAt = now();
      return { ok: true, choice, selectedOption: option };
    }

    function getChoice(id) { return consequences.get(id) || null; }

    // RPG-05-11: Dialogue variants
    function createDialogueVariant(input) {
      const i = obj(input);
      const id = i.id || stableId('dvar', nextId());
      const variant = {
        id,
        characterId: text(i.characterId),
        baseText: text(i.baseText),
        style: text(i.style) || 'casual',
        variants: arr(i.variants).map(v => ({
          id: v.id || stableId('dv', nextId()),
          text: text(v.text),
          tone: TONE_LEVELS.includes(v.tone) ? v.tone : 'neutral',
          tags: uniq(v.tags)
        })),
        weight: clamp(i.weight || 1, 0, 10),
        createdAt: now()
      };
      dialogueVariants.set(id, variant);
      return variant;
    }

    function selectDialogueVariant(characterId, contextTags) {
      const tags = uniq(contextTags);
      const allVariants = Array.from(dialogueVariants.values()).filter(v => v.characterId === characterId);
      if (allVariants.length === 0) return null;
      let best = null;
      let bestScore = -1;
      for (const variant of allVariants) {
        for (const dv of variant.variants) {
          const matchCount = dv.tags.filter(t => tags.includes(t)).length;
          const score = matchCount * 10 + variant.weight;
          if (score > bestScore) {
            bestScore = score;
            best = { variantId: variant.id, variant: dv, score };
          }
        }
      }
      return best;
    }

    // RPG-05-12: NPC initiative
    const npcInitiatives = new Map();

    function setNpcInitiative(npcId, initiative) {
      npcInitiatives.set(npcId, {
        npcId,
        initiative: clamp(initiative, 0, 100),
        lastActed: now(),
        turnCount: (npcInitiatives.get(npcId)?.turnCount || 0) + 1
      });
      return { ok: true, initiative: npcInitiatives.get(npcId) };
    }

    function getNpcInitiative(npcId) {
      return npcInitiatives.get(npcId) || { npcId, initiative: 0, lastActed: null, turnCount: 0 };
    }

    function getNpcInitiativeOrder() {
      return Array.from(npcInitiatives.values()).sort((a, b) => b.initiative - a.initiative);
    }

    function shouldNpcAct(npcId, threshold) {
      const data = npcInitiatives.get(npcId);
      const t = clamp(threshold || 50, 0, 100);
      return data ? data.initiative >= t : false;
    }

    // RPG-05-13: Narrative consequences
    function createConsequence(input) {
      const i = obj(input);
      const id = i.id || stableId('cons', nextId());
      const consequence = {
        id,
        sourceType: text(i.sourceType) || 'choice',
        sourceId: text(i.sourceId),
        description: text(i.description),
        type: CONSEQUENCE_TYPES.includes(i.type) ? i.type : 'immediate',
        delayTicks: Number.isFinite(i.delayTicks) ? i.delayTicks : 0,
        effect: obj(i.effect),
        applied: false,
        appliedAt: null,
        reversible: i.reversible !== false,
        createdAt: now()
      };
      consequences.set(id, consequence);
      return consequence;
    }

    function applyConsequence(id) {
      const cons = consequences.get(id);
      if (!cons) return { ok: false, reason: 'consequence-not-found' };
      if (cons.applied) return { ok: false, reason: 'already-applied' };
      cons.applied = true;
      cons.appliedAt = now();
      return { ok: true, consequence: cons };
    }

    function getConsequences(filter) {
      const f = obj(filter);
      let result = Array.from(consequences.values());
      if (f.sourceId) result = result.filter(c => c.sourceId === f.sourceId);
      if (f.type) result = result.filter(c => c.type === f.type);
      if (f.applied != null) result = result.filter(c => c.applied === f.applied);
      return result;
    }

    // RPG-05-14: Foreshadowing tracker
    function addForeshadowing(input) {
      const i = obj(input);
      const id = i.id || stableId('foresh', nextId());
      const entry = {
        id,
        description: text(i.description),
        plantedInSceneId: text(i.plantedInSceneId) || null,
        plantedAtTick: Number.isFinite(i.plantedAtTick) ? i.plantedAtTick : 0,
        payoffSceneId: text(i.payoffSceneId) || null,
        payoffDescription: text(i.payoffDescription) || '',
        resolved: i.resolved === true,
        importance: clamp(i.importance || 0.5, 0, 1),
        tags: uniq(i.tags),
        createdAt: now()
      };
      foreshadowing.set(id, entry);
      return entry;
    }

    function resolveForeshadowing(id, payoffSceneId, payoffDescription) {
      const entry = foreshadowing.get(id);
      if (!entry) return { ok: false, reason: 'foreshadowing-not-found' };
      entry.resolved = true;
      entry.payoffSceneId = text(payoffSceneId) || entry.payoffSceneId;
      entry.payoffDescription = text(payoffDescription) || entry.payoffDescription;
      return { ok: true, entry };
    }

    function getUnresolvedForeshadowing(minImportance) {
      const min = clamp(minImportance || 0, 0, 1);
      return Array.from(foreshadowing.values()).filter(f => !f.resolved && f.importance >= min);
    }

    // RPG-05-15: Tone consistency
    const toneHistory = [];

    function recordTone(sceneId, tone, reason) {
      const t = TONE_LEVELS.includes(tone) ? tone : 'neutral';
      toneHistory.push({
        sceneId: text(sceneId),
        tone: t,
        reason: text(reason),
        timestamp: now()
      });
      toneHistory.splice(0, Math.max(0, toneHistory.length - 200));
      return { ok: true, tone: t };
    }

    function getToneConsistency() {
      if (toneHistory.length < 2) return { consistent: true, message: 'insufficient-data', entries: toneHistory.length };
      const recent = toneHistory.slice(-10);
      const toneCounts = {};
      for (const entry of recent) {
        toneCounts[entry.tone] = (toneCounts[entry.tone] || 0) + 1;
      }
      const dominantTone = Object.entries(toneCounts).sort((a, b) => b[1] - a[1])[0];
      const dominanceRatio = dominantTone[1] / recent.length;
      return {
        consistent: dominanceRatio >= 0.6,
        dominantTone: dominantTone[0],
        dominanceRatio: Math.round(dominanceRatio * 100) / 100,
        toneDistribution: toneCounts,
        entries: recent.length
      };
    }

    function getToneHistory(limit) {
      const l = Math.max(1, Number(limit) || 20);
      return toneHistory.slice(-l);
    }

    // Persistence seam (additive): serializes every closure-scoped Map plus the
    // agency lock and tone history, and never moves the id counter backwards.
    const DEFAULT_AGENCY_LOCK = clone(agencyLock);

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
        scenes: clone(mapsToPlain(scenes)),
        chapters: clone(mapsToPlain(chapters)),
        arcs: clone(mapsToPlain(arcs)),
        consequences: clone(mapsToPlain(consequences)),
        foreshadowing: clone(mapsToPlain(foreshadowing)),
        dialogueVariants: clone(mapsToPlain(dialogueVariants)),
        npcInitiatives: clone(mapsToPlain(npcInitiatives)),
        state: clone({ agencyLock, toneHistory })
      };
    }

    function importState(data) {
      const d = obj(data);
      restoreMap(scenes, d.scenes);
      restoreMap(chapters, d.chapters);
      restoreMap(arcs, d.arcs);
      restoreMap(consequences, d.consequences);
      restoreMap(foreshadowing, d.foreshadowing);
      restoreMap(dialogueVariants, d.dialogueVariants);
      restoreMap(npcInitiatives, d.npcInitiatives);
      const st = plainToMaps(obj(d.state));
      replaceFields(agencyLock, st.agencyLock, DEFAULT_AGENCY_LOCK);
      toneHistory.length = 0;
      for (const entry of arr(st.toneHistory)) toneHistory.push(entry);
      idCounter = Math.max(idCounter, Number(obj(d.counters).id || 0));
      return { ok: true, restored: scenes.size };
    }

    return {
      SPEAKER_TYPES, NARRATION_STYLES, PACING_MODES,
      CONSEQUENCE_TYPES, CHOICE_TYPES, ARC_STATUSES,
      SCENE_STATUSES, TONE_LEVELS,
      createNarrationEntry, attributeSpeaker,
      lockPlayerAgency, unlockPlayerAgency, isPlayerAgencyLocked, canPlayerAct, assertPlayerAgency,
      createScene, getScene, updateScene, addSceneEntry, getScenes,
      createChapter, getChapter, updateChapter, getChapters,
      createArc, getArc, updateArc, getArcProgress,
      addSceneObjective, completeSceneObjective, getSceneObjectives,
      setScenePacing, getPacingRecommendation,
      generateRecap,
      createChoice, resolveChoice, getChoice,
      createDialogueVariant, selectDialogueVariant,
      setNpcInitiative, getNpcInitiative, getNpcInitiativeOrder, shouldNpcAct,
      createConsequence, applyConsequence, getConsequences,
      addForeshadowing, resolveForeshadowing, getUnresolvedForeshadowing,
      recordTone, getToneConsistency, getToneHistory,
      exportState, importState
    };
  }

  return { createNarrationManager };
});
