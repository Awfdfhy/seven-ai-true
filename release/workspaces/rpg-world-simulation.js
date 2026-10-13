(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SevenRpgWorldSimulation = api;
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
  function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

  const LOCATION_TYPES = Object.freeze(['city', 'town', 'village', 'dungeon', 'wilderness', 'landmark', 'structure', 'plane']);
  const WEATHER_TYPES = Object.freeze(['clear', 'cloudy', 'rain', 'storm', 'snow', 'fog', 'heat', 'wind', 'sandstorm', 'blizzard']);
  const TIME_PERIODS = Object.freeze(['dawn', 'morning', 'midday', 'afternoon', 'evening', 'night', 'midnight']);
  const RELATIONSHIP_TYPES = Object.freeze(['allied', 'friendly', 'neutral', 'tense', 'hostile', 'at-war', 'vassal', 'tributary']);
  const INFLUENCE_TYPES = Object.freeze(['military', 'economic', 'cultural', 'religious', 'political', 'spy']);
  const SHOP_TYPES = Object.freeze(['general', 'weapon', 'armor', 'alchemy', 'book', 'tavern', 'blacksmith', 'jeweler', 'fence']);

  function createWorldSimulationManager(stateApi) {
    if (!stateApi || typeof stateApi.createState !== 'function') throw Error('SevenRpgState-compatible stateApi required');

    const locations = new Map();
    const travelLedger = new Map();
    const weatherStates = new Map();
    const calendars = new Map();
    const npcSchedules = new Map();
    const economyLedger = new Map();
    const shops = new Map();
    const kingdoms = new Map();
    const factions = new Map();
    const diplomacy = new Map();
    const territory = new Map();
    let idCounter = 0;
    function nextId() { return ++idCounter; }

    // RPG-09-01: Locations directory
    function createLocation(input) {
      const i = obj(input);
      const id = i.id || stableId('loc', nextId());
      const location = {
        id,
        name: text(i.name) || 'Unknown Location',
        type: LOCATION_TYPES.includes(i.type) ? i.type : 'wilderness',
        description: text(i.description),
        parentId: text(i.parentId) || null,
        connections: uniq(i.connections),
        coordinates: { x: Number(i.coordinates?.x) || 0, y: Number(i.coordinates?.y) || 0 },
        tags: uniq(i.tags),
        dangerLevel: clamp(i.dangerLevel ?? 0, 0, 10),
        population: clamp(i.population ?? 0, 0, 9999999),
        features: uniq(i.features),
        discovered: i.discovered === true,
        metadata: obj(i.metadata),
        createdAt: now(),
        updatedAt: now()
      };
      locations.set(id, location);
      // Add to parent's connections if specified
      if (location.parentId) {
        const parent = locations.get(location.parentId);
        if (parent && !parent.connections.includes(id)) {
          parent.connections.push(id);
          parent.updatedAt = now();
        }
      }
      return location;
    }

    function getLocation(id) { return locations.get(id) || null; }

    function updateLocation(id, updates) {
      const loc = locations.get(id);
      if (!loc) return { ok: false, reason: 'location-not-found' };
      const u = obj(updates);
      if (u.name != null) loc.name = text(u.name);
      if (u.description != null) loc.description = text(u.description);
      if (u.dangerLevel != null) loc.dangerLevel = clamp(u.dangerLevel, 0, 10);
      if (u.population != null) loc.population = clamp(u.population, 0, 9999999);
      if (u.discovered != null) loc.discovered = u.discovered === true;
      if (u.connections != null) loc.connections = uniq(u.connections);
      loc.updatedAt = now();
      return { ok: true, location: loc };
    }

    function getLocations(filter) {
      const f = obj(filter);
      let result = Array.from(locations.values());
      if (f.type) result = result.filter(l => l.type === f.type);
      if (f.parentId) result = result.filter(l => l.parentId === f.parentId);
      if (f.discovered != null) result = result.filter(l => l.discovered === f.discovered);
      if (f.tag) result = result.filter(l => l.tags.includes(f.tag));
      return result;
    }

    function getConnectedLocations(locationId) {
      const loc = locations.get(locationId);
      if (!loc) return [];
      return loc.connections.map(cid => locations.get(cid)).filter(Boolean);
    }

    // RPG-09-02: Interactive world map
    function getWorldMap(options) {
      const o = obj(options);
      const discoveredOnly = o.discoveredOnly !== false;
      const nodes = Array.from(locations.values())
        .filter(l => !discoveredOnly || l.discovered)
        .map(l => ({
          id: l.id, name: l.name, type: l.type,
          x: l.coordinates.x, y: l.coordinates.y,
          dangerLevel: l.dangerLevel, tags: l.tags
        }));
      const edges = [];
      for (const loc of locations.values()) {
        if (discoveredOnly && !loc.discovered) continue;
        for (const connId of loc.connections) {
          const conn = locations.get(connId);
          if (conn && (!discoveredOnly || conn.discovered)) {
            edges.push({ from: loc.id, to: connId });
          }
        }
      }
      return { nodes, edges, nodeCount: nodes.length, edgeCount: edges.length };
    }

    function findPath(fromId, toId) {
      if (!locations.has(fromId) || !locations.has(toId)) return null;
      if (fromId === toId) return [fromId];
      const visited = new Set();
      const queue = [[fromId]];
      while (queue.length > 0) {
        const path = queue.shift();
        const current = path[path.length - 1];
        if (current === toId) return path;
        if (visited.has(current)) continue;
        visited.add(current);
        const loc = locations.get(current);
        if (!loc) continue;
        for (const neighbor of loc.connections) {
          if (!visited.has(neighbor)) {
            queue.push([...path, neighbor]);
          }
        }
      }
      return null; // no path found
    }

    // RPG-09-03: Travel ledger
    function recordTravel(input) {
      const i = obj(input);
      const id = i.id || stableId('travel', nextId());
      const record = {
        id,
        characterId: text(i.characterId),
        fromLocationId: text(i.fromLocationId),
        toLocationId: text(i.toLocationId),
        departureTick: clamp(i.departureTick ?? 0, 0, 999999),
        arrivalTick: clamp(i.arrivalTick ?? 0, 0, 999999),
        duration: clamp(i.arrivalTick ?? 0, 0, 999999) - clamp(i.departureTick ?? 0, 0, 999999),
        method: text(i.method) || 'walking', // walking, riding, sailing, flying, teleport
        companions: uniq(i.companions),
        encounters: arr(i.encounters).map(e => ({
          type: text(e.type),
          description: text(e.description),
          tick: clamp(e.tick ?? 0, 0, 999999),
          resolved: e.resolved === true
        })),
        distance: clamp(i.distance ?? 0, 0, 999999),
        completed: i.completed === true,
        notes: text(i.notes),
        createdAt: now()
      };
      travelLedger.set(id, record);
      // Mark destination as discovered
      const dest = locations.get(record.toLocationId);
      if (dest && !dest.discovered) {
        dest.discovered = true;
        dest.updatedAt = now();
      }
      return record;
    }

    function getTravelHistory(characterId, limit) {
      const l = Math.max(1, Number(limit) || 20);
      return Array.from(travelLedger.values())
        .filter(t => !characterId || t.characterId === characterId)
        .sort((a, b) => b.departureTick - a.departureTick)
        .slice(0, l);
    }

    // RPG-09-04: Weather fiction state
    function setWeather(input) {
      const i = obj(input);
      const id = i.id || stableId('weather', nextId());
      const weather = {
        id,
        locationId: text(i.locationId),
        current: WEATHER_TYPES.includes(i.current) ? i.current : 'clear',
        previous: null,
        temperature: clamp(i.temperature ?? 20, -50, 60),
        windSpeed: clamp(i.windSpeed ?? 5, 0, 100),
        visibility: clamp(i.visibility ?? 10, 0, 100),
        forecast: arr(i.forecast).map(f => ({
          weather: WEATHER_TYPES.includes(f.weather) ? f.weather : 'clear',
          tick: clamp(f.tick ?? 0, 0, 999999),
          temperature: clamp(f.temperature ?? 20, -50, 60)
        })),
        effects: uniq(i.effects), // slippery, reduced-visibility, cold-damage, etc.
        updatedAt: now()
      };
      // Get previous weather
      const existing = Array.from(weatherStates.values()).find(w => w.locationId === weather.locationId);
      if (existing) weather.previous = existing.current;
      weatherStates.set(id, weather);
      return weather;
    }

    function getWeather(locationId) {
      return Array.from(weatherStates.values()).find(w => w.locationId === locationId) || null;
    }

    function advanceWeather(locationId) {
      const weather = getWeather(locationId);
      if (!weather) return { ok: false, reason: 'no-weather-data' };
      if (weather.forecast.length === 0) return { ok: false, reason: 'no-forecast' };
      const next = weather.forecast.shift();
      weather.previous = weather.current;
      weather.current = next.weather;
      weather.temperature = next.temperature;
      weather.updatedAt = now();
      return { ok: true, weather: clone(weather) };
    }

    // RPG-09-05: Calendar
    function createCalendar(input) {
      const i = obj(input);
      const id = i.id || stableId('cal', nextId());
      const calendar = {
        id,
        name: text(i.name) || 'Default Calendar',
        months: arr(i.months).map(m => ({
          name: text(m.name),
          days: clamp(m.days ?? 30, 1, 100),
          seasons: uniq(m.seasons)
        })),
        daysPerWeek: clamp(i.daysPerWeek ?? 7, 1, 20),
        weeksPerMonth: clamp(i.weeksPerMonth ?? 4, 1, 20),
        currentDay: clamp(i.currentDay ?? 1, 1, 999999),
        currentYear: clamp(i.currentYear ?? 1, 1, 999999),
        festivals: arr(i.festivals).map(f => ({
          name: text(f.name),
          day: clamp(f.day ?? 1, 1, 366),
          month: text(f.month),
          duration: clamp(f.duration ?? 1, 1, 30),
          description: text(f.description)
        })),
        metadata: obj(i.metadata),
        createdAt: now()
      };
      calendars.set(id, calendar);
      return calendar;
    }

    function getCalendar(id) { return calendars.get(id) || null; }

    function advanceCalendar(id, days) {
      const cal = calendars.get(id);
      if (!cal) return { ok: false, reason: 'calendar-not-found' };
      const d = Math.max(1, Math.floor(days || 1));
      cal.currentDay += d;
      // Handle year overflow based on total days in year
      const totalDaysInYear = cal.months.reduce((s, m) => s + m.days, 0);
      while (cal.currentDay > totalDaysInYear) {
        cal.currentDay -= totalDaysInYear;
        cal.currentYear++;
      }
      return { ok: true, currentDay: cal.currentDay, currentYear: cal.currentYear };
    }

    function getCurrentDate(calendarId) {
      const cal = calendars.get(calendarId);
      if (!cal) return null;
      let remaining = cal.currentDay;
      for (const month of cal.months) {
        if (remaining <= month.days) {
          return {
            day: remaining,
            month: month.name,
            year: cal.currentYear,
            season: month.seasons[0] || null,
            dateLabel: `${month.name} ${remaining}, Year ${cal.currentYear}`
          };
        }
        remaining -= month.days;
      }
      return { day: cal.currentDay, month: 'Unknown', year: cal.currentYear, dateLabel: `Day ${cal.currentDay}, Year ${cal.currentYear}` };
    }

    // RPG-09-06: Day night cycle
    function getTimeOfDay(tick, options) {
      const o = obj(options);
      const hoursPerDay = clamp(o.hoursPerDay ?? 24, 1, 48);
      const ticksPerHour = clamp(o.ticksPerHour ?? 1, 1, 100);
      const hour = Math.floor((tick / ticksPerHour) % hoursPerDay);
      const periods = [
        { period: 'midnight', from: 0, to: 4 },
        { period: 'dawn', from: 4, to: 6 },
        { period: 'morning', from: 6, to: 11 },
        { period: 'midday', from: 11, to: 13 },
        { period: 'afternoon', from: 13, to: 17 },
        { period: 'evening', from: 17, to: 20 },
        { period: 'night', from: 20, to: 24 }
      ];
      for (const p of periods) {
        if (hour >= p.from && hour < p.to) {
          return { hour, period: p.period, isNight: p.period === 'night' || p.period === 'midnight' };
        }
      }
      return { hour, period: 'night', isNight: true };
    }

    function getLightLevel(tick, options) {
      const time = getTimeOfDay(tick, options);
      const lightMap = {
        midnight: 0.05, dawn: 0.3, morning: 0.8, midday: 1.0,
        afternoon: 0.9, evening: 0.5, night: 0.15
      };
      return { ...time, lightLevel: lightMap[time.period] || 0.5 };
    }

    // RPG-09-07: NPC schedules
    function createNpcSchedule(input) {
      const i = obj(input);
      const id = i.id || stableId('npcsched', nextId());
      const schedule = {
        id,
        npcId: text(i.npcId),
        name: text(i.name) || 'NPC Schedule',
        entries: arr(i.entries).map(e => ({
          id: e.id || stableId('schedentry', nextId()),
          startTime: text(e.startTime) || '08:00',
          endTime: text(e.endTime) || '18:00',
          locationId: text(e.locationId),
          activity: text(e.activity),
          priority: clamp(e.priority ?? 5, 1, 10),
          daysOfWeek: uniq(e.daysOfWeek), // e.g., ['monday', 'tuesday']
          specialDates: uniq(e.specialDates)
        })),
        overrides: [],
        enabled: i.enabled !== false,
        createdAt: now(),
        updatedAt: now()
      };
      npcSchedules.set(id, schedule);
      return schedule;
    }

    function getNpcSchedule(npcId) {
      return Array.from(npcSchedules.values()).find(s => s.npcId === npcId) || null;
    }

    function getNpcActivityAtTime(npcId, timeStr) {
      const schedule = getNpcSchedule(npcId);
      if (!schedule || !schedule.enabled) return null;
      const t = text(timeStr);
      // Check overrides first
      for (const override of schedule.overrides) {
        if (override.time === t) return override;
      }
      // Find matching entry
      for (const entry of schedule.entries) {
        if (t >= entry.startTime && t <= entry.endTime) {
          return entry;
        }
      }
      return null;
    }

    function addScheduleOverride(npcId, override) {
      const schedule = getNpcSchedule(npcId);
      if (!schedule) return { ok: false, reason: 'schedule-not-found' };
      const o = obj(override);
      const record = {
        id: o.id || stableId('override', nextId()),
        time: text(o.time),
        locationId: text(o.locationId),
        activity: text(o.activity),
        reason: text(o.reason),
        expiresAt: text(o.expiresAt) || null
      };
      schedule.overrides.push(record);
      schedule.updatedAt = now();
      return { ok: true, override: record };
    }

    // RPG-09-08: Economy ledger
    function createEconomyLedger(input) {
      const i = obj(input);
      const id = i.id || stableId('econ', nextId());
      const ledger = {
        id,
        name: text(i.name) || 'Economy',
        currency: text(i.currency) || 'gold',
        startingBalance: clamp(i.startingBalance ?? 0, -999999999, 999999999),
        balance: clamp(i.startingBalance ?? 0, -999999999, 999999999),
        transactions: arr(i.transactions).map(t => ({
          id: t.id || stableId('tx', nextId()),
          type: t.type, // income, expense, transfer
          amount: clamp(t.amount ?? 0, -999999999, 999999999),
          description: text(t.description),
          category: text(t.category),
          tick: clamp(t.tick ?? 0, 0, 999999),
          timestamp: now()
        })),
        budgetCategories: obj(i.budgetCategories),
        metadata: obj(i.metadata),
        createdAt: now(),
        updatedAt: now()
      };
      economyLedger.set(id, ledger);
      return ledger;
    }

    function getEconomyLedger(id) { return economyLedger.get(id) || null; }

    function addTransaction(ledgerId, transaction) {
      const ledger = economyLedger.get(ledgerId);
      if (!ledger) return { ok: false, reason: 'ledger-not-found' };
      const t = obj(transaction);
      const record = {
        id: t.id || stableId('tx', nextId()),
        type: text(t.type) || 'expense',
        amount: clamp(t.amount ?? 0, -999999999, 999999999),
        description: text(t.description),
        category: text(t.category),
        tick: clamp(t.tick ?? 0, 0, 999999),
        timestamp: now()
      };
      ledger.transactions.push(record);
      ledger.balance += record.amount;
      ledger.updatedAt = now();
      return { ok: true, transaction: record, newBalance: ledger.balance };
    }

    function getTransactions(ledgerId, filter) {
      const ledger = economyLedger.get(ledgerId);
      if (!ledger) return [];
      const f = obj(filter);
      let result = ledger.transactions;
      if (f.type) result = result.filter(t => t.type === f.type);
      if (f.category) result = result.filter(t => t.category === f.category);
      if (f.since != null) result = result.filter(t => t.tick >= f.since);
      if (f.until != null) result = result.filter(t => t.tick <= f.until);
      return result;
    }

    // RPG-09-09: Shops and barter
    function createShop(input) {
      const i = obj(input);
      const id = i.id || stableId('shop', nextId());
      const shop = {
        id,
        name: text(i.name) || 'Shop',
        type: SHOP_TYPES.includes(i.type) ? i.type : 'general',
        locationId: text(i.locationId),
        ownerId: text(i.ownerId) || null,
        inventory: arr(i.inventory).map(inv => ({
          itemId: text(inv.itemId),
          name: text(inv.name),
          quantity: clamp(inv.quantity ?? 1, 0, 999),
          buyPrice: clamp(inv.buyPrice ?? 100, 0, 999999),
          sellPrice: clamp(inv.sellPrice ?? 50, 0, 999999),
          restockRate: clamp(inv.restockRate ?? 0, 0, 100)
        })),
        haggleRange: clamp(i.haggleRange ?? 0.2, 0, 0.5), // max 50% price adjustment
        reputationDiscount: clamp(i.reputationDiscount ?? 0, 0, 0.5),
        opensAt: text(i.opensAt) || '08:00',
        closesAt: text(i.closesAt) || '20:00',
        metadata: obj(i.metadata),
        createdAt: now(),
        updatedAt: now()
      };
      shops.set(id, shop);
      return shop;
    }

    function getShop(id) { return shops.get(id) || null; }

    function buyItem(shopId, itemId, quantity, buyerReputation) {
      const shop = shops.get(shopId);
      if (!shop) return { ok: false, reason: 'shop-not-found' };
      const item = shop.inventory.find(inv => inv.itemId === itemId);
      if (!item) return { ok: false, reason: 'item-not-in-shop' };
      const qty = Math.max(1, Math.floor(quantity || 1));
      if (item.quantity < qty) return { ok: false, reason: 'insufficient-stock', available: item.quantity };
      const discount = clamp(buyerReputation || 0, 0, shop.reputationDiscount);
      const unitPrice = Math.floor(item.buyPrice * (1 - discount));
      const totalPrice = unitPrice * qty;
      item.quantity -= qty;
      shop.updatedAt = now();
      return { ok: true, itemId, quantity: qty, unitPrice, totalPrice, discount };
    }

    function sellItem(shopId, itemId, quantity, sellerReputation) {
      const shop = shops.get(shopId);
      if (!shop) return { ok: false, reason: 'shop-not-found' };
      const existing = shop.inventory.find(inv => inv.itemId === itemId);
      const qty = Math.max(1, Math.floor(quantity || 1));
      let sellPrice;
      if (existing) {
        sellPrice = existing.sellPrice;
        existing.quantity += qty;
      } else {
        // Determine sell price from shop type
        sellPrice = 50; // default
        shop.inventory.push({
          itemId, name: itemId, quantity: qty,
          buyPrice: Math.floor(sellPrice * 2), sellPrice,
          restockRate: 0
        });
      }
      const reputationBonus = clamp(sellerReputation || 0, 0, 0.3);
      const unitPrice = Math.floor(sellPrice * (1 + reputationBonus));
      const totalPrice = unitPrice * qty;
      shop.updatedAt = now();
      return { ok: true, itemId, quantity: qty, unitPrice, totalPrice };
    }

    function haggle(shopId, basePrice, persuasionRoll) {
      const shop = shops.get(shopId);
      if (!shop) return { ok: false, reason: 'shop-not-found' };
      const roll = clamp(persuasionRoll ?? 10, 1, 20);
      const maxDiscount = shop.haggleRange;
      const discount = roll >= 18 ? maxDiscount : roll >= 15 ? maxDiscount * 0.75 : roll >= 12 ? maxDiscount * 0.5 : roll >= 8 ? maxDiscount * 0.25 : 0;
      const adjustedPrice = Math.floor(basePrice * (1 - discount));
      return {
        ok: true, basePrice, adjustedPrice,
        discount: Math.round(discount * 100) / 100,
        roll, success: discount > 0
      };
    }

    // RPG-09-10: Politics (covered by kingdoms/diplomacy)
    // RPG-09-11: Factions
    function createFaction(input) {
      const i = obj(input);
      const id = i.id || stableId('faction', nextId());
      const faction = {
        id,
        name: text(i.name) || 'Unnamed Faction',
        description: text(i.description),
        type: text(i.type) || 'guild', // guild, kingdom, church, army, thieves, mages
        headquarters: text(i.headquarters) || null,
        leader: text(i.leader) || null,
        members: uniq(i.members),
        memberCount: clamp(i.memberCount ?? 0, 0, 999999),
        wealth: clamp(i.wealth ?? 0, 0, 999999999),
        militaryStrength: clamp(i.militaryStrength ?? 0, 0, 100),
        influence: clamp(i.influence ?? 0, 0, 100),
        goals: uniq(i.goals),
        relations: {}, // factionId -> { type, value }
        reputation: {}, // characterId -> value
        metadata: obj(i.metadata),
        createdAt: now(),
        updatedAt: now()
      };
      factions.set(id, faction);
      return faction;
    }

    function getFaction(id) { return factions.get(id) || null; }

    function updateFactionRelation(factionId, otherFactionId, relationType, value) {
      const faction = factions.get(factionId);
      if (!faction) return { ok: false, reason: 'faction-not-found' };
      const relType = RELATIONSHIP_TYPES.includes(relationType) ? relationType : 'neutral';
      faction.relations[otherFactionId] = {
        type: relType,
        value: clamp(value ?? 0, -100, 100),
        updatedAt: now()
      };
      faction.updatedAt = now();
      return { ok: true, relation: clone(faction.relations[otherFactionId]) };
    }

    function getFactionRelations(factionId) {
      const faction = factions.get(factionId);
      if (!faction) return {};
      return clone(faction.relations);
    }

    // RPG-09-12: Kingdoms
    function createKingdom(input) {
      const i = obj(input);
      const id = i.id || stableId('kingdom', nextId());
      const kingdom = {
        id,
        name: text(i.name) || 'Unnamed Kingdom',
        ruler: text(i.racer) || text(i.ruler) || 'Unknown',
        governmentType: text(i.governmentType) || 'monarchy', // monarchy, republic, theocracy, oligarchy, anarchy
        capital: text(i.capital) || null,
        territories: uniq(i.territories),
        population: clamp(i.population ?? 0, 0, 99999999),
        treasury: clamp(i.treasury ?? 0, 0, 999999999),
        military: {
          armySize: clamp(i.military?.armySize ?? 0, 0, 999999),
          navySize: clamp(i.military?.navySize ?? 0, 0, 99999),
          fortifications: clamp(i.military?.fortifications ?? 0, 0, 100)
        },
        stability: clamp(i.stability ?? 50, 0, 100),
        happiness: clamp(i.happiness ?? 50, 0, 100),
        laws: uniq(i.laws),
        allies: uniq(i.allies),
        enemies: uniq(i.enemies),
        metadata: obj(i.metadata),
        createdAt: now(),
        updatedAt: now()
      };
      kingdoms.set(id, kingdom);
      return kingdom;
    }

    function getKingdom(id) { return kingdoms.get(id) || null; }

    function updateKingdomStability(id, delta, reason) {
      const kingdom = kingdoms.get(id);
      if (!kingdom) return { ok: false, reason: 'kingdom-not-found' };
      kingdom.stability = clamp(kingdom.stability + (delta || 0), 0, 100);
      kingdom.updatedAt = now();
      return { ok: true, newStability: kingdom.stability, reason: text(reason) };
    }

    // RPG-09-13: Diplomacy
    function createDiplomaticRelation(input) {
      const i = obj(input);
      const id = i.id || stableId('diplo', nextId());
      const relation = {
        id,
        fromId: text(i.fromId),
        toId: text(i.toId),
        type: RELATIONSHIP_TYPES.includes(i.type) ? i.type : 'neutral',
        value: clamp(i.value ?? 0, -100, 100),
        treaties: arr(i.treaties).map(t => ({
          id: t.id || stableId('treaty', nextId()),
          name: text(t.name),
          type: text(t.type), // trade, defense, non-aggression, vassalage
          terms: text(t.terms),
          signedAt: text(t.signedAt) || now(),
          expiresAt: text(t.expiresAt) || null,
          active: t.active !== false
        })),
        history: arr(i.history).slice(-100),
        lastInteraction: text(i.lastInteraction) || null,
        metadata: obj(i.metadata),
        createdAt: now(),
        updatedAt: now()
      };
      diplomacy.set(id, relation);
      return relation;
    }

    function getDiplomaticRelation(fromId, toId) {
      for (const rel of diplomacy.values()) {
        if ((rel.fromId === fromId && rel.toId === toId) || (rel.fromId === toId && rel.toId === fromId)) {
          return rel;
        }
      }
      return null;
    }

    function updateDiplomacy(fromId, toId, delta, reason) {
      let rel = getDiplomaticRelation(fromId, toId);
      if (!rel) {
        rel = createDiplomaticRelation({ fromId, toId, value: 0 });
      }
      rel.value = clamp(rel.value + (delta || 0), -100, 100);
      rel.history.push({ delta: delta || 0, reason: text(reason), timestamp: now() });
      rel.history = rel.history.slice(-100);
      rel.lastInteraction = now();
      rel.updatedAt = now();
      // Update type based on value
      if (rel.value >= 80) rel.type = 'allied';
      else if (rel.value >= 40) rel.type = 'friendly';
      else if (rel.value >= -20) rel.type = 'neutral';
      else if (rel.value >= -50) rel.type = 'tense';
      else if (rel.value >= -80) rel.type = 'hostile';
      else rel.type = 'at-war';
      return { ok: true, relation: clone(rel) };
    }

    // RPG-09-14: Territory influence
    function createTerritory(input) {
      const i = obj(input);
      const id = i.id || stableId('terr', nextId());
      const terr = {
        id,
        name: text(i.name) || 'Territory',
        locationId: text(i.locationId) || null,
        controllingFactionId: text(i.controllingFactionId) || null,
        controllingKingdomId: text(i.controllingKingdomId) || null,
        influence: {}, // factionId -> { type, value }
        resources: uniq(i.resources),
        strategicValue: clamp(i.strategicValue ?? 50, 0, 100),
        unrest: clamp(i.unrest ?? 0, 0, 100),
        fortificationLevel: clamp(i.fortificationLevel ?? 0, 0, 100),
        metadata: obj(i.metadata),
        createdAt: now(),
        updatedAt: now()
      };
      territory.set(id, terr);
      return terr;
    }

    function getTerritory(id) { return territory.get(id) || null; }

    function addTerritoryInfluence(territoryId, factionId, influenceType, delta) {
      const terr = territory.get(territoryId);
      if (!terr) return { ok: false, reason: 'territory-not-found' };
      const type = INFLUENCE_TYPES.includes(influenceType) ? influenceType : 'political';
      if (!terr.influence[factionId]) terr.influence[factionId] = {};
      const current = terr.influence[factionId][type] || 0;
      terr.influence[factionId][type] = clamp(current + (delta || 0), 0, 100);
      terr.updatedAt = now();
      return { ok: true, influence: terr.influence[factionId][type] };
    }

    function getTerritoryControl(territoryId) {
      const terr = territory.get(territoryId);
      if (!terr) return null;
      let controllingFaction = null;
      let maxInfluence = -1;
      for (const [factionId, influences] of Object.entries(terr.influence)) {
        const totalInfluence = Object.values(influences).reduce((s, v) => s + v, 0);
        if (totalInfluence > maxInfluence) {
          maxInfluence = totalInfluence;
          controllingFaction = factionId;
        }
      }
      return {
        territoryId,
        controllingFactionId: controllingFaction,
        maxInfluence,
        allInfluence: clone(terr.influence),
        unrest: terr.unrest
      };
    }

    // RPG-09-15: Persistent consequences
    const worldConsequences = new Map();

    function recordWorldConsequence(input) {
      const i = obj(input);
      const id = i.id || stableId('wcons', nextId());
      const consequence = {
        id,
        sourceType: text(i.sourceType) || 'event', // event, quest, combat, diplomacy, player-action
        sourceId: text(i.sourceId),
        description: text(i.description),
        affectedLocations: uniq(i.affectedLocations),
        affectedFactions: uniq(i.affectedFactions),
        affectedKingdoms: uniq(i.affectedKingdoms),
        effects: {
          stabilityDelta: clamp(i.effects?.stabilityDelta ?? 0, -100, 100),
          happinessDelta: clamp(i.effects?.happinessDelta ?? 0, -100, 100),
          economyDelta: clamp(i.effects?.economyDelta ?? 0, -1000000, 1000000),
          militaryDelta: clamp(i.effects?.militaryDelta ?? 0, -100, 100),
          customEffects: obj(i.effects?.customEffects)
        },
        applied: i.applied === true,
        appliedAt: i.applied ? now() : null,
        reversible: i.reversible !== false,
        tick: clamp(i.tick ?? 0, 0, 999999),
        metadata: obj(i.metadata),
        createdAt: now()
      };
      worldConsequences.set(id, consequence);
      return consequence;
    }

    function applyWorldConsequence(id) {
      const cons = worldConsequences.get(id);
      if (!cons) return { ok: false, reason: 'consequence-not-found' };
      if (cons.applied) return { ok: false, reason: 'already-applied' };
      // Apply effects to affected entities
      for (const kingdomId of cons.affectedKingdoms) {
        const kingdom = kingdoms.get(kingdomId);
        if (kingdom) {
          kingdom.stability = clamp(kingdom.stability + cons.effects.stabilityDelta, 0, 100);
          kingdom.happiness = clamp(kingdom.happiness + cons.effects.happinessDelta, 0, 100);
          kingdom.treasury += cons.effects.economyDelta;
          kingdom.military.armySize = Math.max(0, kingdom.military.armySize + cons.effects.militaryDelta);
          kingdom.updatedAt = now();
        }
      }
      for (const factionId of cons.affectedFactions) {
        const faction = factions.get(factionId);
        if (faction) {
          faction.influence = clamp(faction.influence + cons.effects.stabilityDelta, 0, 100);
          faction.wealth += cons.effects.economyDelta;
          faction.updatedAt = now();
        }
      }
      cons.applied = true;
      cons.appliedAt = now();
      return { ok: true, consequence: clone(cons) };
    }

    function getWorldConsequences(filter) {
      const f = obj(filter);
      let result = Array.from(worldConsequences.values());
      if (f.applied != null) result = result.filter(c => c.applied === f.applied);
      if (f.sourceType) result = result.filter(c => c.sourceType === f.sourceType);
      if (f.locationId) result = result.filter(c => c.affectedLocations.includes(f.locationId));
      if (f.factionId) result = result.filter(c => c.affectedFactions.includes(f.factionId));
      return result;
    }

    return {
      LOCATION_TYPES, WEATHER_TYPES, TIME_PERIODS,
      RELATIONSHIP_TYPES, INFLUENCE_TYPES, SHOP_TYPES,
      createLocation, getLocation, updateLocation, getLocations, getConnectedLocations,
      getWorldMap, findPath,
      recordTravel, getTravelHistory,
      setWeather, getWeather, advanceWeather,
      createCalendar, getCalendar, advanceCalendar, getCurrentDate,
      getTimeOfDay, getLightLevel,
      createNpcSchedule, getNpcSchedule, getNpcActivityAtTime, addScheduleOverride,
      createEconomyLedger, getEconomyLedger, addTransaction, getTransactions,
      createShop, getShop, buyItem, sellItem, haggle,
      createFaction, getFaction, updateFactionRelation, getFactionRelations,
      createKingdom, getKingdom, updateKingdomStability,
      createDiplomaticRelation, getDiplomaticRelation, updateDiplomacy,
      createTerritory, getTerritory, addTerritoryInfluence, getTerritoryControl,
      recordWorldConsequence, applyWorldConsequence, getWorldConsequences
    };
  }

  return { createWorldSimulationManager };
});
