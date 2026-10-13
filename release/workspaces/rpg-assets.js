(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SevenRpgAssets = api;
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

  const ASSET_TYPES = Object.freeze(['image', 'audio', 'music', 'font', 'icon', 'texture', 'portrait', 'background', 'sprite', 'video']);
  const AUDIO_TYPES = Object.freeze(['ambient', 'music', 'sfx', 'voice', 'ui', 'nature', 'combat', 'interface']);
  const PORTRAIT_STYLES = Object.freeze(['realistic', 'fantasy', 'anime', 'pixel', 'watercolor', 'sketch', 'gothic']);
  const MUSIC_MOODS = Object.freeze(['peaceful', 'tense', 'combat', 'mystery', 'sad', 'triumphant', 'horror', 'exploration', 'tavern', 'boss']);
  const PALETTE_THEMES = Object.freeze(['default', 'dark-fantasy', 'medieval', 'arcane', 'nature', 'frost', 'shadow', 'royal']);
  const ICON_STYLES = Object.freeze(['flat', 'outline', 'filled', 'duotone', 'pixel-art']);
  const FONT_CATEGORIES = Object.freeze(['body', 'heading', 'monospace', 'decorative', 'arabic']);

  function createAssetsManager(stateApi) {
    if (!stateApi || typeof stateApi.createState !== 'function') throw Error('SevenRpgState-compatible stateApi required');

    const assets = new Map();
    const soundscapeTracks = new Map();
    const musicMappings = new Map();
    const portraits = new Map();
    const palettes = new Map();
    const fontRegistry = new Map();
    const cacheEntries = new Map();
    let idCounter = 0;
    function nextId() { return ++idCounter; }

    // Storage quota tracking
    const storageState = {
      usedBytes: 0,
      quotaBytes: 100 * 1024 * 1024, // 100MB default
      lastUpdated: now()
    };

    // RPG-12-01: Image asset manager
    function registerAsset(input) {
      const i = obj(input);
      const id = i.id || stableId('asset', nextId());
      const asset = {
        id,
        name: text(i.name) || 'Unnamed Asset',
        type: ASSET_TYPES.includes(i.type) ? i.type : 'image',
        mimeType: text(i.mimeType) || 'image/png',
        url: text(i.url) || null,
        dataUrl: text(i.dataUrl) || null,
        width: clamp(i.width ?? 0, 0, 99999),
        height: clamp(i.height ?? 0, 0, 99999),
        sizeBytes: clamp(i.sizeBytes ?? 0, 0, 999999999),
        tags: uniq(i.tags),
        category: text(i.category) || 'general',
        license: text(i.license) || null,
        author: text(i.author) || null,
        metadata: obj(i.metadata),
        registeredAt: now(),
        lastAccessed: null,
        accessCount: 0
      };
      assets.set(id, asset);
      storageState.usedBytes += asset.sizeBytes;
      storageState.lastUpdated = now();
      return asset;
    }

    function getAsset(id) {
      const a = assets.get(id);
      if (!a) return null;
      a.lastAccessed = now();
      a.accessCount++;
      return clone(a);
    }

    function listAssets(filter) {
      const f = obj(filter);
      let result = Array.from(assets.values());
      if (f.type) result = result.filter(a => a.type === f.type);
      if (f.category) result = result.filter(a => a.category === f.category);
      if (f.tag) result = result.filter(a => a.tags.includes(f.tag));
      if (f.search) {
        const q = text(f.search).toLowerCase();
        result = result.filter(a => a.name.toLowerCase().includes(q) || a.tags.some(t => t.toLowerCase().includes(q)));
      }
      return result;
    }

    function deleteAsset(id) {
      const a = assets.get(id);
      if (!a) return { ok: false, reason: 'asset-not-found' };
      storageState.usedBytes = Math.max(0, storageState.usedBytes - a.sizeBytes);
      storageState.lastUpdated = now();
      assets.delete(id);
      return { ok: true, freedBytes: a.sizeBytes };
    }

    // RPG-12-02: Procedural art prompts
    function generateArtPrompt(input) {
      const i = obj(input);
      const subject = text(i.subject) || 'fantasy landscape';
      const style = text(i.style) || 'digital painting';
      const mood = text(i.mood) || 'epic';
      const details = uniq(i.details);
      const lighting = text(i.lighting) || 'dramatic';
      const quality = text(i.quality) || 'highly detailed';
      const promptParts = [
        `${subject}`,
        `${style} style`,
        `${mood} mood`,
        `${lighting} lighting`,
        ...details,
        quality,
        'fantasy RPG art'
      ];
      const negativePrompt = 'low quality, blurry, watermark, text, signature, deformed, ugly';
      return {
        ok: true,
        prompt: promptParts.join(', '),
        negativePrompt,
        style, mood, lighting,
        tags: uniq([style, mood, lighting, ...details]),
        estimatedTokens: Math.ceil(promptParts.join(', ').length / 4)
      };
    }

    function generateCharacterPortraitPrompt(input) {
      const i = obj(input);
      return generateArtPrompt({
        subject: `${text(i.race) || 'human'} ${text(i.class) || 'adventurer'} portrait, ${text(i.name) || 'character'}, ${text(i.features) || 'distinctive features'}, ${text(i.expression) || 'neutral expression'}`,
        style: PORTRAIT_STYLES.includes(i.style) ? i.style : 'fantasy',
        mood: text(i.mood) || 'heroic',
        details: [`${text(i.age) || 'adult'}`, `${text(i.armor) || 'adventuring gear'}`],
        lighting: text(i.lighting) || 'studio',
        quality: 'character portrait, detailed face, RPG style'
      });
    }

    // RPG-12-03: Ambient soundscape
    function createSoundscape(input) {
      const i = obj(input);
      const id = i.id || stableId('scape', nextId());
      const soundscape = {
        id,
        name: text(i.name) || 'Soundscape',
        locationTag: text(i.locationTag) || null,
        tracks: arr(i.tracks).map(t => ({
          assetId: text(t.assetId),
          name: text(t.name) || 'Track',
          volume: clamp(t.volume ?? 0.5, 0, 1),
          loop: t.loop !== false,
          fadeIn: clamp(t.fadeIn ?? 2, 0, 30),
          fadeOut: clamp(t.fadeOut ?? 2, 0, 30),
          layer: clamp(t.layer ?? 0, 0, 10), // higher = foreground
          conditions: obj(t.conditions) // timeOfDay, weather, etc.
        })),
        masterVolume: clamp(i.masterVolume ?? 0.7, 0, 1),
        enabled: i.enabled !== false,
        currentTrackIndex: 0,
        crossfadeDuration: clamp(i.crossfadeDuration ?? 3, 0, 30),
        createdAt: now(),
        updatedAt: now()
      };
      soundscapeTracks.set(id, soundscape);
      return soundscape;
    }

    function getSoundscape(id) { return soundscapeTracks.get(id) || null; }

    function updateSoundscape(id, updates) {
      const scape = soundscapeTracks.get(id);
      if (!scape) return { ok: false, reason: 'soundscape-not-found' };
      const u = obj(updates);
      if (u.enabled != null) scape.enabled = u.enabled !== false;
      if (u.masterVolume != null) scape.masterVolume = clamp(u.masterVolume, 0, 1);
      if (u.currentTrackIndex != null) scape.currentTrackIndex = clamp(u.currentTrackIndex, 0, Math.max(0, scape.tracks.length - 1));
      scape.updatedAt = now();
      return { ok: true, soundscape: clone(scape) };
    }

    function getActiveSoundscapeTracks(soundscapeId, context) {
      const scape = soundscapeTracks.get(soundscapeId);
      if (!scape || !scape.enabled) return [];
      const ctx = obj(context);
      return scape.tracks.filter(t => {
        if (t.layer > 5 && ctx.quietMode) return false;
        const cond = t.conditions;
        if (cond.timeOfDay && ctx.timeOfDay && cond.timeOfDay !== ctx.timeOfDay) return false;
        if (cond.weather && ctx.weather && cond.weather !== ctx.weather) return false;
        return true;
      }).map(t => ({
        ...clone(t),
        effectiveVolume: Math.round(t.volume * scape.masterVolume * 100) / 100
      }));
    }

    // RPG-12-04: Music mood mapping
    function createMusicMapping(input) {
      const i = obj(input);
      const id = i.id || stableId('musicmap', nextId());
      const mapping = {
        id,
        mood: MUSIC_MOODS.includes(i.mood) ? i.mood : 'peaceful',
        assetId: text(i.assetId),
        trackName: text(i.trackName) || 'Unknown Track',
        bpm: clamp(i.bpm ?? 120, 30, 300),
        key: text(i.key) || 'C minor',
        loopStart: clamp(i.loopStart ?? 0, 0, 9999),
        loopEnd: clamp(i.loopEnd ?? 0, 0, 9999),
        fadeTransition: clamp(i.fadeTransition ?? 2, 0, 30),
        priority: clamp(i.priority ?? 5, 1, 10),
        enabled: i.enabled !== false,
        createdAt: now()
      };
      musicMappings.set(id, mapping);
      return mapping;
    }

    function getMusicForMood(mood) {
      const m = text(mood);
      return Array.from(musicMappings.values())
        .filter(mp => mp.mood === m && mp.enabled)
        .sort((a, b) => b.priority - a.priority);
    }

    function updateMusicMapping(id, updates) {
      const mp = musicMappings.get(id);
      if (!mp) return { ok: false, reason: 'mapping-not-found' };
      const u = obj(updates);
      if (u.trackName != null) mp.trackName = text(u.trackName);
      if (u.assetId != null) mp.assetId = text(u.assetId);
      if (u.priority != null) mp.priority = clamp(u.priority, 1, 10);
      if (u.enabled != null) mp.enabled = u.enabled !== false;
      if (u.fadeTransition != null) mp.fadeTransition = clamp(u.fadeTransition, 0, 30);
      return { ok: true, mapping: clone(mp) };
    }

    // RPG-12-05: Sound effect library
    function registerSoundEffect(input) {
      const i = obj(input);
      const id = i.id || stableId('sfx', nextId());
      const sfx = {
        id,
        name: text(i.name) || 'Sound Effect',
        category: AUDIO_TYPES.includes(i.category) ? i.category : 'sfx',
        assetId: text(i.assetId),
        volume: clamp(i.volume ?? 0.8, 0, 1),
        pitch: clamp(i.pitch ?? 1.0, 0.5, 2.0),
        pitchVariation: clamp(i.pitchVariation ?? 0, 0, 0.5),
        cooldown: clamp(i.cooldown ?? 0, 0, 60000), // ms
        maxConcurrent: clamp(i.maxConcurrent ?? 3, 1, 20),
        currentConcurrent: 0,
        lastPlayed: null,
        playCount: 0,
        tags: uniq(i.tags),
        createdAt: now()
      };
      assets.set(id, sfx);
      return sfx;
    }

    function playSoundEffect(sfxId) {
      const sfx = assets.get(sfxId);
      if (!sfx) return { ok: false, reason: 'sfx-not-found' };
      const nowMs = Date.now();
      if (sfx.lastPlayed && sfx.cooldown > 0 && nowMs - sfx.lastPlayed < sfx.cooldown) {
        const waitMs = sfx.cooldown - (nowMs - sfx.lastPlayed);
        return { ok: false, reason: 'cooldown', waitMs };
      }
      if (sfx.currentConcurrent >= sfx.maxConcurrent) {
        return { ok: false, reason: 'max-concurrent' };
      }
      sfx.currentConcurrent++;
      sfx.lastPlayed = nowMs;
      sfx.playCount++;
      const pitch = sfx.pitch + (Math.random() * 2 - 1) * sfx.pitchVariation;
      return {
        ok: true, sfxId,
        effectiveVolume: sfx.volume,
        effectivePitch: Math.round(pitch * 100) / 100,
        playCount: sfx.playCount
      };
    }

    function stopSoundEffect(sfxId) {
      const sfx = assets.get(sfxId);
      if (!sfx) return { ok: false, reason: 'sfx-not-found' };
      sfx.currentConcurrent = Math.max(0, sfx.currentConcurrent - 1);
      return { ok: true, currentConcurrent: sfx.currentConcurrent };
    }

    // RPG-12-06: Voice output settings
    const voiceSettings = {
      enabled: false,
      engine: 'system', // system, neural, offline
      voiceId: null,
      language: 'en',
      rate: 1.0,
      pitch: 1.0,
      volume: 0.9,
      autoPlay: false,
      skipNarration: false,
      characterVoices: {},
      lastUsed: null
    };

    function getVoiceSettings() { return clone(voiceSettings); }

    function setVoiceSetting(key, value) {
      if (!(key in voiceSettings)) return { ok: false, reason: 'invalid-key' };
      const old = voiceSettings[key];
      if (typeof old === 'number') {
        const n = Number(value);
        if (!Number.isFinite(n)) return { ok: false, reason: 'invalid-value' };
        voiceSettings[key] = n;
      } else if (typeof old === 'boolean') {
        voiceSettings[key] = value === true || value === 'true';
      } else if (typeof old === 'string') {
        voiceSettings[key] = text(value);
      } else {
        voiceSettings[key] = value;
      }
      voiceSettings.lastUsed = now();
      return { ok: true, key, value: clone(voiceSettings[key]) };
    }

    function setCharacterVoice(characterId, voiceConfig) {
      const c = obj(voiceConfig);
      voiceSettings.characterVoices[text(characterId)] = {
        voiceId: text(c.voiceId),
        rate: clamp(c.rate ?? 1.0, 0.5, 2.0),
        pitch: clamp(c.pitch ?? 1.0, 0.5, 2.0),
        enabled: c.enabled !== false
      };
      return { ok: true, characterVoices: clone(voiceSettings.characterVoices) };
    }

    function getCharacterVoice(characterId) {
      return voiceSettings.characterVoices[text(characterId)] || null;
    }

    // RPG-12-07: Portrait generation
    function createPortrait(input) {
      const i = obj(input);
      const id = i.id || stableId('portrait', nextId());
      const portrait = {
        id,
        characterId: text(i.characterId),
        characterName: text(i.characterName) || 'Unknown',
        assetId: text(i.assetId) || null,
        promptAssetId: text(i.promptAssetId) || null,
        style: PORTRAIT_STYLES.includes(i.style) ? i.style : 'fantasy',
        expression: text(i.expression) || 'neutral',
        variant: text(i.variant) || 'default', // default, battle, happy, sad, injured
        size: text(i.size) || 'medium', // small, medium, large
        emotion: text(i.emotion) || null,
        quality: clamp(i.quality ?? 3, 1, 5),
        generated: i.generated === true,
        generationPrompt: text(i.generationPrompt) || null,
        createdAt: now()
      };
      portraits.set(id, portrait);
      return portrait;
    }

    function getPortrait(id) { return portraits.get(id) || null; }

    function findPortrait(characterId, variant) {
      const cid = text(characterId);
      const v = text(variant) || 'default';
      return Array.from(portraits.values())
        .filter(p => p.characterId === cid && (p.variant === v || v === 'default'))
        .sort((a, b) => (a.variant === v ? -1 : 1) - (b.variant === v ? -1 : 1) || b.quality - a.quality)[0] || null;
    }

    function listPortraits(filter) {
      const f = obj(filter);
      let result = Array.from(portraits.values());
      if (f.characterId) result = result.filter(p => p.characterId === f.characterId);
      if (f.style) result = result.filter(p => p.style === f.style);
      if (f.variant) result = result.filter(p => p.variant === f.variant);
      return result;
    }

    // RPG-12-08: Scene background art
    function createSceneBackground(input) {
      const i = obj(input);
      const id = i.id || stableId('bg', nextId());
      const bg = {
        id,
        sceneId: text(i.sceneId),
        name: text(i.name) || 'Scene Background',
        assetId: text(i.assetId) || null,
        promptAssetId: text(i.promptAssetId) || null,
        locationTag: text(i.locationTag) || null,
        timeOfDay: text(i.timeOfDay) || 'day',
        weather: text(i.weather) || null,
        mood: MUSIC_MOODS.includes(i.mood) ? i.mood : 'exploration',
        parallaxLayers: clamp(i.parallaxLayers ?? 1, 1, 5),
        overlayColor: text(i.overlayColor) || null,
        overlayOpacity: clamp(i.overlayOpacity ?? 0, 0, 1),
        blurAmount: clamp(i.blurAmount ?? 0, 0, 20),
        tags: uniq(i.tags),
        createdAt: now()
      };
      assets.set(id, bg);
      return bg;
    }

    function findSceneBackground(sceneId, context) {
      const sid = text(sceneId);
      const ctx = obj(context);
      const candidates = Array.from(assets.values()).filter(a => a.sceneId === sid);
      if (candidates.length === 0) return null;
      // Prefer exact context match
      const match = candidates.find(bg => {
        if (ctx.timeOfDay && bg.timeOfDay !== ctx.timeOfDay) return false;
        if (ctx.weather && bg.weather !== ctx.weather) return false;
        return true;
      });
      return clone(match || candidates[0]);
    }

    // RPG-12-09: Icon set
    function createIconSet(input) {
      const i = obj(input);
      const id = i.id || stableId('iconset', nextId());
      const iconSet = {
        id,
        name: text(i.name) || 'Icon Set',
        style: ICON_STYLES.includes(i.style) ? i.style : 'flat',
        gridSize: clamp(i.gridSize ?? 24, 8, 128),
        icons: arr(i.icons).map(ic => ({
          id: ic.id || stableId('icon', nextId()),
          name: text(ic.name) || 'icon',
          unicode: text(ic.unicode) || null,
          assetId: text(ic.assetId) || null,
          tags: uniq(ic.tags),
          category: text(ic.category) || 'general'
        })),
        colorPalette: arr(i.colorPalette).slice(0, 16),
        createdAt: now()
      };
      assets.set(id, iconSet);
      return iconSet;
    }

    function findIcon(iconSetId, name) {
      const set = assets.get(iconSetId);
      if (!set || !set.icons) return null;
      const n = text(name).toLowerCase();
      return set.icons.find(ic => ic.name.toLowerCase() === n) ||
             set.icons.find(ic => ic.tags.some(t => t.toLowerCase() === n)) || null;
    }

    // RPG-12-10: Font management
    function registerFont(input) {
      const i = obj(input);
      const id = i.id || stableId('font', nextId());
      const font = {
        id,
        name: text(i.name) || 'Font',
        family: text(i.family) || text(i.name) || 'sans-serif',
        category: FONT_CATEGORIES.includes(i.category) ? i.category : 'body',
        weight: text(i.weight) || '400',
        style: text(i.style) || 'normal',
        src: text(i.src) || null,
        fallback: text(i.fallback) || 'sans-serif',
        supportsArabic: i.supportsArabic === true,
        supportsCyrillic: i.supportsCyrillic === true,
        sizeBytes: clamp(i.sizeBytes ?? 0, 0, 10000000),
        loaded: i.loaded === true,
        preload: i.preload === true,
        createdAt: now()
      };
      fontRegistry.set(id, font);
      return font;
    }

    function getFont(id) { return fontRegistry.get(id) || null; }

    function listFonts(filter) {
      const f = obj(filter);
      let result = Array.from(fontRegistry.values());
      if (f.category) result = result.filter(ft => ft.category === f.category);
      if (f.supportsArabic) result = result.filter(ft => ft.supportsArabic);
      if (f.loaded != null) result = result.filter(ft => ft.loaded === f.loaded);
      return result;
    }

    function getFontStack(category) {
      const cat = text(category) || 'body';
      const fonts = Array.from(fontRegistry.values())
        .filter(ft => ft.category === cat && ft.loaded)
        .map(ft => `"${ft.family}"`)
        .join(', ');
      const fallback = cat === 'arabic' ? '"Noto Sans Arabic", "Segoe UI", sans-serif' : 'sans-serif';
      return fonts ? `${fonts}, ${fallback}` : fallback;
    }

    // RPG-12-11: Color palette themes
    function createColorPalette(input) {
      const i = obj(input);
      const id = i.id || stableId('palette', nextId());
      const palette = {
        id,
        name: text(i.name) || 'Palette',
        theme: PALETTE_THEMES.includes(i.theme) ? i.theme : 'default',
        colors: {
          primary: text(i.colors?.primary) || '#4A90D9',
          secondary: text(i.colors?.secondary) || '#7B68EE',
          accent: text(i.colors?.accent) || '#E8A838',
          background: text(i.colors?.background) || '#1A1A2E',
          surface: text(i.colors?.surface) || '#16213E',
          text: text(i.colors?.text) || '#EAEAEA',
          textMuted: text(i.colors?.textMuted) || '#A0A0B0',
          success: text(i.colors?.success) || '#4CAF50',
          warning: text(i.colors?.warning) || '#FF9800',
          error: text(i.colors?.error) || '#F44336',
          border: text(i.colors?.border) || '#333355',
          shadow: text(i.colors?.shadow) || '#00000066'
        },
        rarityColors: {
          common: text(i.rarityColors?.common) || '#9E9E9E',
          uncommon: text(i.rarityColors?.uncommon) || '#4CAF50',
          rare: text(i.rarityColors?.rare) || '#2196F3',
          epic: text(i.rarityColors?.epic) || '#9C27B0',
          legendary: text(i.rarityColors?.legendary) || '#FF9800',
          artifact: text(i.rarityColors?.artifact) || '#F44336'
        },
        rtlSafe: i.rtlSafe !== false,
        contrastCompliant: i.contrastCompliant !== false,
        createdAt: now()
      };
      palettes.set(id, palette);
      return palette;
    }

    function getPalette(id) { return palettes.get(id) || null; }

    function listPalettes() {
      return Array.from(palettes.values()).map(p => ({
        id: p.id, name: p.name, theme: p.theme,
        primary: p.colors.primary, contrastCompliant: p.contrastCompliant
      }));
    }

    // RPG-12-12: Asset caching
    function cacheAsset(input) {
      const i = obj(input);
      const id = i.id || stableId('cache', nextId());
      const entry = {
        id,
        assetId: text(i.assetId),
        url: text(i.url),
        sizeBytes: clamp(i.sizeBytes ?? 0, 0, 999999999),
        etag: text(i.etag) || null,
        cachedAt: now(),
        lastAccessed: now(),
        accessCount: 0,
        hitCount: 0,
        missCount: 0,
        expiresAt: i.expiresAt || null,
        priority: clamp(i.priority ?? 5, 1, 10),
        pinned: i.pinned === true
      };
      cacheEntries.set(id, entry);
      return entry;
    }

    function getCacheEntry(id) { return cacheEntries.get(id) || null; }

    function recordCacheHit(cacheId) {
      const entry = cacheEntries.get(cacheId);
      if (!entry) return { ok: false, reason: 'entry-not-found' };
      entry.hitCount++;
      entry.accessCount++;
      entry.lastAccessed = now();
      return { ok: true, hitCount: entry.hitCount };
    }

    function recordCacheMiss(cacheId) {
      const entry = cacheEntries.get(cacheId);
      if (!entry) return { ok: false, reason: 'entry-not-found' };
      entry.missCount++;
      return { ok: true, missCount: entry.missCount };
    }

    function getCacheStats() {
      const entries = Array.from(cacheEntries.values());
      const totalHits = entries.reduce((s, e) => s + e.hitCount, 0);
      const totalMisses = entries.reduce((s, e) => s + e.missCount, 0);
      const totalSize = entries.reduce((s, e) => s + e.sizeBytes, 0);
      return {
        entryCount: entries.length,
        totalHits,
        totalMisses,
        hitRate: totalHits + totalMisses > 0 ? Math.round((totalHits / (totalHits + totalMisses)) * 100) : 0,
        totalSizeBytes: totalSize,
        pinnedCount: entries.filter(e => e.pinned).length
      };
    }

    function evictCache(strategy) {
      const strat = text(strategy) || 'lru'; // lru, size, expired
      const entries = Array.from(cacheEntries.values()).filter(e => !e.pinned);
      if (entries.length === 0) return { ok: true, evicted: 0 };
      let evicted = 0;
      if (strat === 'lru') {
        entries.sort((a, b) => a.lastAccessed.localeCompare(b.lastAccessed));
        // Evict oldest 25%
        const toEvict = Math.max(1, Math.floor(entries.length * 0.25));
        for (let n = 0; n < toEvict; n++) {
          cacheEntries.delete(entries[n].id);
          evicted++;
        }
      } else if (strat === 'expired') {
        const nowIso = now();
        for (const e of entries) {
          if (e.expiresAt && e.expiresAt < nowIso) {
            cacheEntries.delete(e.id);
            evicted++;
          }
        }
      } else if (strat === 'size') {
        entries.sort((a, b) => a.priority - b.priority || a.accessCount - b.accessCount);
        const toEvict = Math.max(1, Math.floor(entries.length * 0.25));
        for (let n = 0; n < toEvict; n++) {
          cacheEntries.delete(entries[n].id);
          evicted++;
        }
      }
      return { ok: true, evicted, strategy: strat };
    }

    // RPG-12-13: Offline assets
    function markOfflineAvailable(assetId) {
      const a = assets.get(assetId);
      if (!a) return { ok: false, reason: 'asset-not-found' };
      a.metadata = obj(a.metadata);
      a.metadata.offlineAvailable = true;
      a.metadata.offlineMarkedAt = now();
      return { ok: true, assetId, offlineAvailable: true };
    }

    function listOfflineAssets() {
      return Array.from(assets.values())
        .filter(a => a.metadata && a.metadata.offlineAvailable === true)
        .map(a => ({ id: a.id, name: a.name, type: a.type, sizeBytes: a.sizeBytes }));
    }

    function removeOfflineAsset(assetId) {
      const a = assets.get(assetId);
      if (!a) return { ok: false, reason: 'asset-not-found' };
      if (a.metadata) {
        delete a.metadata.offlineAvailable;
        delete a.metadata.offlineMarkedAt;
      }
      return { ok: true, assetId };
    }

    // RPG-12-14: Storage quota
    function getStorageInfo() {
      const usedPercent = storageState.quotaBytes > 0
        ? Math.round((storageState.usedBytes / storageState.quotaBytes) * 100)
        : 0;
      return {
        usedBytes: storageState.usedBytes,
        quotaBytes: storageState.quotaBytes,
        freeBytes: Math.max(0, storageState.quotaBytes - storageState.usedBytes),
        usedPercent,
        assetCount: assets.size,
        isNearQuota: usedPercent >= 80,
        isOverQuota: storageState.usedBytes > storageState.quotaBytes,
        lastUpdated: storageState.lastUpdated
      };
    }

    function setStorageQuota(bytes) {
      const b = clamp(bytes, 1024 * 1024, 10 * 1024 * 1024 * 1024); // 1MB to 10GB
      storageState.quotaBytes = b;
      storageState.lastUpdated = now();
      return { ok: true, quotaBytes: b };
    }

    function checkQuotaAvailable(requiredBytes) {
      const req = clamp(requiredBytes, 0, 999999999);
      const free = storageState.quotaBytes - storageState.usedBytes;
      return {
        available: req <= free,
        requiredBytes: req,
        freeBytes: free,
        wouldExceed: req > free
      };
    }

    // RPG-12-15: Accessibility media
    const accessibilityMedia = {
      altTexts: new Map(),
      audioDescriptions: new Map(),
      captions: new Map()
    };

    function setAltText(assetId, text2) {
      const t = text(text2);
      if (!t) return { ok: false, reason: 'empty-alt-text' };
      accessibilityMedia.altTexts.set(text(assetId), t);
      return { ok: true, assetId, altText: t };
    }

    function getAltText(assetId) {
      return accessibilityMedia.altTexts.get(text(assetId)) || null;
    }

    function setAudioDescription(assetId, description) {
      const d = text(description);
      if (!d) return { ok: false, reason: 'empty-description' };
      accessibilityMedia.audioDescriptions.set(text(assetId), {
        assetId: text(assetId),
        description: d,
        language: text(arguments[2]) || 'en',
        createdAt: now()
      });
      return { ok: true, assetId, description: d };
    }

    function getAudioDescription(assetId) {
      return clone(accessibilityMedia.audioDescriptions.get(text(assetId))) || null;
    }

    function setCaption(assetId, captionData) {
      const c = obj(captionData);
      const content = text(c.content);
      if (!content) return { ok: false, reason: 'empty-caption' };
      accessibilityMedia.captions.set(text(assetId), {
        assetId: text(assetId),
        content,
        startMs: clamp(c.startMs ?? 0, 0, 999999),
        endMs: clamp(c.endMs ?? 0, 0, 999999),
        speakerName: text(c.speakerName) || null,
        createdAt: now()
      });
      return { ok: true, assetId, caption: content };
    }

    function getCaption(assetId) {
      return clone(accessibilityMedia.captions.get(text(assetId))) || null;
    }

    function getAccessibilityMediaReport() {
      return {
        altTextCount: accessibilityMedia.altTexts.size,
        audioDescriptionCount: accessibilityMedia.audioDescriptions.size,
        captionCount: accessibilityMedia.captions.size,
        totalAssets: assets.size,
        coveragePercent: assets.size > 0
          ? Math.round((accessibilityMedia.altTexts.size / assets.size) * 100)
          : 0
      };
    }

    return {
      ASSET_TYPES, AUDIO_TYPES, PORTRAIT_STYLES, MUSIC_MOODS,
      PALETTE_THEMES, ICON_STYLES, FONT_CATEGORIES,
      registerAsset, getAsset, listAssets, deleteAsset,
      generateArtPrompt, generateCharacterPortraitPrompt,
      createSoundscape, getSoundscape, updateSoundscape, getActiveSoundscapeTracks,
      createMusicMapping, getMusicForMood, updateMusicMapping,
      registerSoundEffect, playSoundEffect, stopSoundEffect,
      getVoiceSettings, setVoiceSetting, setCharacterVoice, getCharacterVoice,
      createPortrait, getPortrait, findPortrait, listPortraits,
      createSceneBackground, findSceneBackground,
      createIconSet, findIcon,
      registerFont, getFont, listFonts, getFontStack,
      createColorPalette, getPalette, listPalettes,
      cacheAsset, getCacheEntry, recordCacheHit, recordCacheMiss, getCacheStats, evictCache,
      markOfflineAvailable, listOfflineAssets, removeOfflineAsset,
      getStorageInfo, setStorageQuota, checkQuotaAvailable,
      setAltText, getAltText,
      setAudioDescription, getAudioDescription,
      setCaption, getCaption,
      getAccessibilityMediaReport
    };
  }

  return { createAssetsManager };
});
