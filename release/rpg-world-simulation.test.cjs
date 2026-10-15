'use strict';
const assert = require('node:assert/strict');
const State = require('./workspaces/rpg-state.js');
const WorldSim = require('./workspaces/rpg-world-simulation.js');

const seed = {
  sessionId: 'worldsim-test', worldId: 'valen-ws',
  timeline: { tick: 5 }, world: { locations: {} },
  characters: {}, quests: {}, canon: { entries: {} }
};

const state = State.createState(seed);
const ws = WorldSim.createWorldSimulationManager(State);

console.log('Testing RPG World Simulation System...');

console.log('\n1. createLocation - city...');
const capital = ws.createLocation({
  id: 'capital', name: 'Valenport', type: 'city',
  description: 'The bustling capital city',
  coordinates: { x: 0, y: 0 }, tags: ['capital', 'trade'],
  dangerLevel: 1, population: 50000, discovered: true
});
assert.equal(capital.name, 'Valenport');
assert.equal(capital.type, 'city');
assert.equal(capital.population, 50000);
console.log('  PASS');

console.log('\n2. createLocation - dungeon with parent...');
const dungeon = ws.createLocation({
  id: 'dragon-lair', name: 'Dragon Lair', type: 'dungeon',
  parentId: 'capital', coordinates: { x: 10, y: 10 },
  dangerLevel: 8, discovered: false
});
assert.equal(dungeon.parentId, 'capital');
assert.ok(capital.connections.includes('dragon-lair'));
console.log('  PASS');

console.log('\n3. getLocations - filter by type...');
const cities = ws.getLocations({ type: 'city' });
assert.equal(cities.length, 1);
assert.equal(cities[0].name, 'Valenport');
const dungeons = ws.getLocations({ type: 'dungeon' });
assert.equal(dungeons.length, 1);
console.log('  PASS');

console.log('\n4. updateLocation...');
const updLoc = ws.updateLocation('dragon-lair', { dangerLevel: 9, discovered: true });
assert.equal(updLoc.ok, true);
assert.equal(updLoc.location.dangerLevel, 9);
assert.equal(updLoc.location.discovered, true);
console.log('  PASS');

console.log('\n5. getConnectedLocations...');
const connected = ws.getConnectedLocations('capital');
assert.ok(connected.some(l => l.id === 'dragon-lair'));
console.log('  PASS');

console.log('\n6. getWorldMap...');
const map = ws.getWorldMap({ discoveredOnly: true });
assert.ok(map.nodes.length >= 2);
assert.ok(map.edges.length >= 1);
console.log('  PASS');

console.log('\n7. findPath...');
const forest = ws.createLocation({ id: 'forest', name: 'Dark Forest', type: 'wilderness', connections: ['capital'], discovered: true });
const path = ws.findPath('forest', 'dragon-lair');
assert.ok(path);
assert.ok(path.includes('capital'));
assert.ok(path.includes('dragon-lair'));
console.log('  PASS');

console.log('\n8. recordTravel + getTravelHistory...');
const travel1 = ws.recordTravel({
  characterId: 'hero1', fromLocationId: 'capital', toLocationId: 'forest',
  departureTick: 10, arrivalTick: 15, method: 'walking', distance: 5
});
assert.equal(travel1.duration, 5);
assert.equal(travel1.method, 'walking');
const history = ws.getTravelHistory('hero1');
assert.equal(history.length, 1);
console.log('  PASS');

console.log('\n9. setWeather + getWeather...');
const weather1 = ws.setWeather({
  locationId: 'capital', current: 'rain', temperature: 15,
  windSpeed: 10, visibility: 5, forecast: [
    { weather: 'cloudy', tick: 20, temperature: 18 },
    { weather: 'clear', tick: 25, temperature: 22 }
  ]
});
assert.equal(weather1.current, 'rain');
assert.equal(weather1.temperature, 15);
assert.equal(weather1.forecast.length, 2);
const gotWeather = ws.getWeather('capital');
assert.equal(gotWeather.current, 'rain');
console.log('  PASS');

console.log('\n10. advanceWeather...');
const advanced = ws.advanceWeather('capital');
assert.equal(advanced.ok, true);
assert.equal(advanced.weather.current, 'cloudy');
assert.equal(advanced.weather.previous, 'rain');
console.log('  PASS');

console.log('\n11. createCalendar + getCurrentDate...');
const cal1 = ws.createCalendar({
  id: 'valen-cal', name: 'Valen Calendar',
  months: [
    { name: 'Frostfall', days: 30, seasons: ['winter'] },
    { name: 'Bloomreach', days: 31, seasons: ['spring'] },
    { name: 'Suncrest', days: 30, seasons: ['summer'] },
    { name: 'Harvestmoor', days: 31, seasons: ['autumn'] }
  ],
  currentDay: 15, currentYear: 1247,
  festivals: [{ name: 'Dragon Festival', day: 15, month: 'Suncrest', duration: 3 }]
});
assert.equal(cal1.months.length, 4);
const currentDate = ws.getCurrentDate('valen-cal');
assert.equal(currentDate.day, 15);
assert.equal(currentDate.month, 'Frostfall');
assert.equal(currentDate.year, 1247);
assert.equal(currentDate.season, 'winter');
console.log('  PASS');

console.log('\n12. advanceCalendar...');
const advanced2 = ws.advanceCalendar('valen-cal', 20);
assert.equal(advanced2.ok, true);
// 15 + 20 = 35 absolute day. Frostfall=30 days, so 35 = Bloomreach day 5
assert.equal(advanced2.currentDay, 35); // absolute day count
const newDate = ws.getCurrentDate('valen-cal');
assert.equal(newDate.month, 'Bloomreach');
assert.equal(newDate.day, 5);
console.log('  PASS');

console.log('\n13. getTimeOfDay + getLightLevel...');
const time1 = ws.getTimeOfDay(0);
assert.equal(time1.period, 'midnight');
assert.equal(time1.isNight, true);
const time2 = ws.getTimeOfDay(12, { ticksPerHour: 1 });
assert.equal(time2.period, 'midday');
assert.equal(time2.isNight, false);
const light1 = ws.getLightLevel(12, { ticksPerHour: 1 });
assert.equal(light1.lightLevel, 1.0);
const light2 = ws.getLightLevel(0);
assert.ok(light2.lightLevel < 0.2);
console.log('  PASS');

console.log('\n14. createNpcSchedule + getNpcActivityAtTime...');
const sched1 = ws.createNpcSchedule({
  npcId: 'merchant1', name: 'Merchant Daily',
  entries: [
    { startTime: '08:00', endTime: '12:00', locationId: 'shop', activity: 'opening shop' },
    { startTime: '12:00', endTime: '14:00', locationId: 'tavern', activity: 'lunch break' },
    { startTime: '14:00', endTime: '20:00', locationId: 'shop', activity: 'afternoon trade' }
  ]
});
assert.equal(sched1.entries.length, 3);
const morning = ws.getNpcActivityAtTime('merchant1', '10:00');
assert.ok(morning);
assert.equal(morning.activity, 'opening shop');
const lunch = ws.getNpcActivityAtTime('merchant1', '13:00');
assert.equal(lunch.activity, 'lunch break');
console.log('  PASS');

console.log('\n15. addScheduleOverride...');
const override1 = ws.addScheduleOverride('merchant1', {
  time: '10:00', locationId: 'market', activity: 'special event', reason: 'festival'
});
assert.equal(override1.ok, true);
const overridden = ws.getNpcActivityAtTime('merchant1', '10:00');
assert.equal(overridden.activity, 'special event');
console.log('  PASS');

console.log('\n16. createEconomyLedger + addTransaction...');
const ledger1 = ws.createEconomyLedger({
  id: 'town-econ', name: 'Town Economy', currency: 'gold',
  startingBalance: 1000
});
assert.equal(ledger1.balance, 1000);
const tx1 = ws.addTransaction('town-econ', {
  type: 'income', amount: 500, description: 'Tax revenue', category: 'taxes', tick: 10
});
assert.equal(tx1.ok, true);
assert.equal(tx1.newBalance, 1500);
const tx2 = ws.addTransaction('town-econ', {
  type: 'expense', amount: -200, description: 'Guard wages', category: 'military', tick: 10
});
assert.equal(tx2.newBalance, 1300);
console.log('  PASS');

console.log('\n17. getTransactions - filter...');
const taxTx = ws.getTransactions('town-econ', { category: 'taxes' });
assert.equal(taxTx.length, 1);
const incomeTx = ws.getTransactions('town-econ', { type: 'income' });
assert.equal(incomeTx.length, 1);
console.log('  PASS');

console.log('\n18. createShop + buyItem...');
const shop1 = ws.createShop({
  id: 'general-store', name: 'General Store', type: 'general',
  locationId: 'capital',
  inventory: [
    { itemId: 'health-potion', name: 'Health Potion', quantity: 10, buyPrice: 50, sellPrice: 25 },
    { itemId: 'iron-sword', name: 'Iron Sword', quantity: 3, buyPrice: 100, sellPrice: 50 }
  ],
  haggleRange: 0.2, reputationDiscount: 0.1
});
assert.equal(shop1.inventory.length, 2);
const buy1 = ws.buyItem('general-store', 'health-potion', 3, 0.05);
assert.equal(buy1.ok, true);
assert.equal(buy1.quantity, 3);
assert.equal(buy1.unitPrice, 47); // Math.floor(50 * (1 - 0.05)) = Math.floor(47.5) = 47
assert.equal(buy1.totalPrice, 141);
// Check stock reduced
const shopAfter = ws.getShop('general-store');
const potionStock = shopAfter.inventory.find(i => i.itemId === 'health-potion');
assert.equal(potionStock.quantity, 7);
console.log('  PASS');

console.log('\n19. sellItem...');
const sell1 = ws.sellItem('general-store', 'dragon-scale', 2, 0.1);
assert.equal(sell1.ok, true);
assert.equal(sell1.quantity, 2);
assert.ok(sell1.unitPrice > 0);
console.log('  PASS');

console.log('\n20. haggle...');
const haggle1 = ws.haggle('general-store', 100, 18);
assert.equal(haggle1.ok, true);
assert.equal(haggle1.discount, 0.2); // max haggle range
assert.equal(haggle1.adjustedPrice, 80);
const haggle2 = ws.haggle('general-store', 100, 5);
assert.equal(haggle2.success, false);
assert.equal(haggle2.adjustedPrice, 100);
console.log('  PASS');

console.log('\n21. createFaction + updateFactionRelation...');
const faction1 = ws.createFaction({
  id: 'merchants-guild', name: 'Merchants Guild',
  type: 'guild', headquarters: 'capital', leader: 'Guildmaster Tom',
  memberCount: 50, wealth: 10000, influence: 60
});
assert.equal(faction1.name, 'Merchants Guild');
assert.equal(faction1.influence, 60);
const faction2 = ws.createFaction({
  id: 'thieves-guild', name: 'Thieves Guild', type: 'thieves', influence: 30
});
const rel1 = ws.updateFactionRelation('merchants-guild', 'thieves-guild', 'hostile', -50);
assert.equal(rel1.ok, true);
assert.equal(rel1.relation.type, 'hostile');
assert.equal(rel1.relation.value, -50);
console.log('  PASS');

console.log('\n22. getFactionRelations...');
const relations = ws.getFactionRelations('merchants-guild');
assert.ok(relations['thieves-guild']);
assert.equal(relations['thieves-guild'].type, 'hostile');
console.log('  PASS');

console.log('\n23. createKingdom + updateKingdomStability...');
const kingdom1 = ws.createKingdom({
  id: 'valen-kingdom', name: 'Kingdom of Valen',
  ruler: 'King Aldric', governmentType: 'monarchy',
  capital: 'capital', population: 500000, treasury: 100000,
  military: { armySize: 10000, navySize: 50, fortifications: 70 },
  stability: 70, happiness: 60
});
assert.equal(kingdom1.name, 'Kingdom of Valen');
assert.equal(kingdom1.stability, 70);
const stabResult = ws.updateKingdomStability('valen-kingdom', -10, 'border raid');
assert.equal(stabResult.ok, true);
assert.equal(stabResult.newStability, 60);
console.log('  PASS');

console.log('\n24. createDiplomaticRelation + updateDiplomacy...');
const diplo1 = ws.createDiplomaticRelation({
  fromId: 'valen-kingdom', toId: 'neighboring-kingdom',
  type: 'neutral', value: 0,
  treaties: [{ name: 'Trade Agreement', type: 'trade', terms: 'Free trade between borders' }]
});
assert.equal(diplo1.type, 'neutral');
assert.equal(diplo1.treaties.length, 1);
const diploUpd = ws.updateDiplomacy('valen-kingdom', 'neighboring-kingdom', 45, 'Royal wedding');
assert.equal(diploUpd.ok, true);
assert.equal(diploUpd.relation.type, 'friendly'); // 45 >= 40
assert.equal(diploUpd.relation.value, 45);
console.log('  PASS');

console.log('\n25. createTerritory + addTerritoryInfluence + getTerritoryControl...');
const terr1 = ws.createTerritory({
  id: 'borderlands', name: 'Borderlands', locationId: 'forest',
  strategicValue: 80, unrest: 20,
  resources: ['iron', 'timber']
});
assert.equal(terr1.name, 'Borderlands');
ws.addTerritoryInfluence('borderlands', 'valen-kingdom', 'military', 60);
ws.addTerritoryInfluence('borderlands', 'valen-kingdom', 'political', 40);
ws.addTerritoryInfluence('borderlands', 'thieves-guild', 'spy', 30);
const control = ws.getTerritoryControl('borderlands');
assert.equal(control.controllingFactionId, 'valen-kingdom');
assert.ok(control.maxInfluence >= 100);
console.log('  PASS');

console.log('\n26. recordWorldConsequence + applyWorldConsequence...');
const cons1 = ws.recordWorldConsequence({
  sourceType: 'quest', sourceId: 'dragon-slayed',
  description: 'Dragon threat eliminated',
  affectedKingdoms: ['valen-kingdom'],
  affectedFactions: ['merchants-guild'],
  effects: { stabilityDelta: 15, happinessDelta: 20, economyDelta: 5000, militaryDelta: 0 },
  tick: 20
});
assert.equal(cons1.applied, false);
const applyCons = ws.applyWorldConsequence(cons1.id);
assert.equal(applyCons.ok, true);
assert.equal(applyCons.consequence.applied, true);
// Verify effects applied to kingdom
const kingdomAfter = ws.getKingdom('valen-kingdom');
assert.equal(kingdomAfter.stability, 75); // 60 + 15
assert.equal(kingdomAfter.happiness, 80); // 60 + 20
assert.equal(kingdomAfter.treasury, 105000); // 100000 + 5000
// Double apply
const doubleApply = ws.applyWorldConsequence(cons1.id);
assert.equal(doubleApply.ok, false);
assert.equal(doubleApply.reason, 'already-applied');
console.log('  PASS');

console.log('\n27. getWorldConsequences - filter...');
const unapplied = ws.getWorldConsequences({ applied: false });
assert.equal(unapplied.length, 0);
const allCons = ws.getWorldConsequences({});
assert.ok(allCons.length >= 1);
console.log('  PASS');

console.log('\n28. Edge cases...');
assert.equal(ws.getLocation('nonexistent'), null);
assert.equal(ws.getWeather('nonexistent'), null);
assert.equal(ws.getCalendar('nonexistent'), null);
assert.equal(ws.getShop('nonexistent'), null);
assert.equal(ws.getKingdom('nonexistent'), null);
assert.equal(ws.getFaction('nonexistent'), null);
assert.equal(ws.getTerritory('nonexistent'), null);
assert.equal(ws.getCurrentDate('nonexistent'), null);
assert.equal(ws.findPath('nonexistent', 'capital'), null);
const badBuy = ws.buyItem('nonexistent', 'item', 1);
assert.equal(badBuy.ok, false);
const badDiplo = ws.updateDiplomacy('a', 'b', 10);
assert.equal(badDiplo.ok, true); // creates new relation
console.log('  PASS');

console.log('\n✅ All RPG World Simulation System tests passed!');
console.log('\nCoverage:');
console.log('  RPG-09-01 (locations directory): createLocation with type/parent/connections');
console.log('  RPG-09-02 (interactive world map): getWorldMap, findPath with BFS');
console.log('  RPG-09-03 (travel ledger): recordTravel, getTravelHistory');
console.log('  RPG-09-04 (weather fiction state): setWeather, getWeather, advanceWeather');
console.log('  RPG-09-05 (calendar): createCalendar, advanceCalendar, getCurrentDate');
console.log('  RPG-09-06 (day night cycle): getTimeOfDay, getLightLevel');
console.log('  RPG-09-07 (NPC schedules): createNpcSchedule, getNpcActivityAtTime, overrides');
console.log('  RPG-09-08 (economy ledger): createEconomyLedger, addTransaction, getTransactions');
console.log('  RPG-09-09 (shops and barter): createShop, buyItem, sellItem, haggle');
console.log('  RPG-09-10 (politics): covered by kingdoms/diplomacy');
console.log('  RPG-09-11 (factions): createFaction, updateFactionRelation');
console.log('  RPG-09-12 (kingdoms): createKingdom, updateKingdomStability');
console.log('  RPG-09-13 (diplomacy): createDiplomaticRelation, updateDiplomacy with auto-type');
console.log('  RPG-09-14 (territory influence): createTerritory, addTerritoryInfluence, getTerritoryControl');
console.log('  RPG-09-15 (persistent consequences): recordWorldConsequence, applyWorldConsequence');
