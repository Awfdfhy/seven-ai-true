'use strict';
const assert = require('node:assert/strict');
const State = require('./workspaces/rpg-state.js');
const StoryGen = require('./workspaces/rpg-story-generator.js')

function clone(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }
function text(v) { return typeof v === 'string' ? v.trim() : ''; }

const seed = {
  sessionId: 'story-test', worldId: 'valen-story',
  timeline: { tick: 5, dateLabel: 'Spring Festival' },
  world: { 
    locations: { capital: { name: 'Capital' }, forest: { name: 'Dark Forest' } },
    weather: { current: 'rainy' },
    timeOfDay: 'evening'
  },
  characters: {
    hero: { control: 'player', locationId: 'capital', identity: { name: 'Hero' } },
    companion: { control: 'ai', locationId: 'capital', identity: { name: 'Companion' } }
  },
  quests: { main: { title: 'Save the Kingdom' } },
  canon: { entries: {} }
};

const state = State.createState(seed);
const gen = StoryGen.createStoryGenerator(State);
const { SCENE_PACING } = gen;

console.log('Testing RPG Story Generator...');

console.log('\n1. registerTemplate...');
const t1 = gen.registerTemplate({
  id: 'test-hook', name: 'Opening Hook', type: 'hook', weight: 5,
  tags: ['opening', 'mystery'],
  requiredContext: ['location'],
  template: 'At {{location}}, {{hook}}'
})
assert.equal(t1.name, 'Opening Hook')
assert.equal(t1.type, 'hook')
assert.equal(t1.weight, 5)
console.log('  PASS')

console.log('\n2. getTemplate...')
const got = gen.getTemplate(t1.id)
assert.equal(got.id, t1.id)
assert.equal(got.template, 'At {{location}}, {{hook}}')
console.log('  PASS')

console.log('\n3. getTemplatesByType...')
gen.registerTemplate({ id: 't2', name: 'Encounter 1', type: 'encounter', weight: 3 })
gen.registerTemplate({ id: 't3', name: 'Encounter 2', type: 'encounter', weight: 5 })
gen.registerTemplate({ id: 't4', name: 'Hook 2', type: 'hook', weight: 2 })
const encounters = gen.getTemplatesByType('encounter')
assert.equal(encounters.length, 2)
assert.ok(encounters.every(e => e.type === 'encounter'))
console.log('  PASS')

console.log('\n4. getTemplatesByTag...')
gen.registerTemplate({ id: 't5', name: 'Combat', type: 'encounter', tags: ['combat', 'forest'] })
gen.registerTemplate({ id: 't6', name: 'Social', type: 'encounter', tags: ['social', 'city'] })
const combatTags = gen.getTemplatesByTag('combat')
assert.ok(combatTags.length >= 1)
assert.ok(combatTags.every(t => t.tags.includes('combat')))
console.log('  PASS')

console.log('\n5. renderTemplate - success...')
const ctx = { location: 'the ancient ruins', state }
const rendered = gen.renderTemplate(t1.id, ctx)
assert.equal(rendered.ok, true)
assert.ok(rendered.output.includes('the ancient ruins'))
assert.ok(rendered.output.length > 0)
console.log('  PASS')

console.log('\n6. renderTemplate - missing context...')
const badCtx = { state }
const badRender = gen.renderTemplate(t1.id, badCtx)
assert.equal(badRender.ok, false)
assert.equal(badRender.reason, 'context-mismatch')
console.log('  PASS')

console.log('\n7. renderTemplate - missing template...')
const missing = gen.renderTemplate('nonexistent', { location: 'here', state })
assert.equal(missing.ok, false)
assert.equal(missing.reason, 'template-not-found')
console.log('  PASS')

console.log('\n7b. renderTemplate - missing variables...')
const tVar = gen.registerTemplate({
  id: 'var-test', name: 'Var Test', type: 'scene',
  requiredContext: [],
  template: 'Hello {{name}} and {{title}}'
})
const missingVar = gen.renderTemplate(tVar.id, { state })
assert.equal(missingVar.ok, false)
assert.equal(missingVar.reason, 'missing-variables')
assert.ok(missingVar.missing.includes('{{name}}'))
assert.ok(missingVar.missing.includes('{{title}}'))
console.log('  PASS')

console.log('\n8. generateStoryHook...')
const hook1 = gen.generateStoryHook(state, { archetype: 'hero_journey' })
assert.ok(typeof hook1 === 'string')
assert.ok(hook1.length > 0)
console.log('  PASS: ' + hook1)

console.log('\n9. generateEncounter...')
const enc = gen.generateEncounter(state, { difficulty: 'hard', type: 'combat' })
assert.equal(enc.type, 'combat')
assert.equal(enc.difficulty, 'hard')
assert.ok(enc.description.length > 0)
console.log('  PASS')

console.log('\n10. generatePlotTwist...')
const twist = gen.generatePlotTwist(state)
assert.ok(typeof twist === 'string')
assert.ok(twist.length > 0)
const twist2 = gen.generatePlotTwist(state, { exclude: [twist] })
assert.notEqual(twist2, twist)
console.log('  PASS')

console.log('\n11. generateNarrativeBeat...')
const beat = gen.generateNarrativeBeat(state)
assert.ok(beat.type)
assert.ok(beat.description.length > 0)
assert.ok(['setup', 'inciting', 'rising', 'climax', 'falling', 'resolution'].includes(beat.type))
console.log('  PASS: ' + beat.type)

console.log('\n12. generateSceneCard...')
const tScene = gen.registerTemplate({
  id: 'scene-test', name: 'Scene', type: 'scene',
  requiredContext: ['npc'],
  template: '{{npc}} approaches the party at {{currentLocation}}.'
})
const scene = gen.generateSceneCard(state, tScene.id, { npc: 'A mysterious stranger' })
assert.equal(scene.ok, true)
assert.ok(scene.scene.content.includes('A mysterious stranger'))
assert.ok(scene.scene.id.startsWith('scene-'))
assert.ok(SCENE_PACING.includes(scene.scene.pacing))
console.log('  PASS')

console.log('\n13. registerTemplate validation...')
const noId = gen.registerTemplate({ name: 'No ID', type: 'hook' })
assert.ok(noId.id.startsWith('template-'))
const noName = gen.registerTemplate({ id: 'noname', type: 'encounter' })
assert.equal(noName.name, 'Unnamed Template')
const badType = gen.registerTemplate({ id: 'badtype', name: 'Bad', type: 'invalid' })
assert.equal(badType.type, 'scene')
console.log('  PASS')

console.log('\n✅ All RPG Story Generator tests passed!')
console.log('\nCoverage: RPG-15-06 (story generator templates)')