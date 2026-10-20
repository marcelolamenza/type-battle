import test from 'node:test';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { effectiveness, exactSet, Round, TYPES } from '../game-logic.js';

test('pure Water has exactly Electric and Grass weaknesses', () => {
  const chart = effectiveness(['water']);
  assert.equal(chart.electric, 2); assert.equal(chart.grass, 2);
  assert.deepEqual(TYPES.filter(t => chart[t] === 2).sort(), ['electric','grass']);
});
test('Water/Ground turns Grass into 4x, not an exact 2x answer', () => {
  const chart = effectiveness(['water','ground']);
  assert.equal(chart.grass, 4); assert.notEqual(chart.grass, 2); assert.equal(chart.ice, 1);
});
test('immunities multiply to 0x', () => {
  assert.equal(effectiveness(['ground']).electric, 0);
  assert.equal(effectiveness(['normal','ghost']).ghost, 0);
});
test('resistance and stacked resistance are calculated', () => {
  assert.equal(effectiveness(['water']).fire, 0.5);
  assert.equal(effectiveness(['water','dragon']).fire, 0.25);
});
test('guess must match the entire answer set, with no duplicates', () => {
  assert.equal(exactSet(['electric','grass'], ['electric','grass']), true);
  assert.equal(exactSet(['electric'], ['electric','grass']), false);
  assert.equal(exactSet(['electric','electric','grass'], ['electric','grass']), false);
  assert.equal(exactSet(['fire'], ['electric','grass']), false);
  assert.equal(exactSet([], []), true);
});
test('attempts, hint progression, terminal win/loss, and reset are deterministic', () => {
  const round = new Round(['water']);
  assert.deepEqual(round.revealedTypes, []);
  let result = round.submit(['fire']);
  assert.equal(result.status, 'active'); assert.equal(result.attemptsRemaining, 2);
  assert.deepEqual(result.revealedTypes, ['water']);
  result = round.submit(['electric']);
  assert.equal(result.status, 'active'); assert.equal(result.attemptsRemaining, 1);
  assert.deepEqual(result.revealedTypes, ['water']);
  result = round.submit(['electric','grass']);
  assert.equal(result.status, 'won'); assert.equal(result.attemptsRemaining, 0);
  assert.equal(round.submit(['fire']).status, 'ended');
  const reset = new Round(['water']);
  reset.submit(['fire']); reset.submit(['fire']);
  result = reset.submit(['fire']);
  assert.equal(result.status, 'lost'); assert.equal(result.attemptsRemaining, 0);
  assert.deepEqual(result.revealedTypes, ['water']);
  assert.equal(reset.submit(['electric','grass']).status, 'ended');
});
test('the empty set is a valid completed answer when it is the exact answer', () => {
  assert.equal(exactSet([], []), true);
  const noWeakness = new Round(['water','ground']);
  assert.deepEqual(noWeakness.answers, []);
  assert.equal(noWeakness.submit([]).status, 'won');
});

test('bundled Pokédex has all 1,025 supported species with valid types', () => {
  const species = JSON.parse(readFileSync(new URL('../pokemon.json', import.meta.url), 'utf8'));
  assert.equal(species.length, 1025);
  assert.deepEqual(species.map(p => p.id), Array.from({length:1025}, (_,i) => i + 1));
  assert.ok(species.every(p => p.name && p.types.length >= 1 && p.types.length <= 2 && p.types.every(t => TYPES.includes(t))));
  assert.deepEqual(species.find(p => p.id === 25).types, ['electric']);
  assert.deepEqual(species.find(p => p.id === 194).types, ['water','ground']);
});

test('embedded browser app script parses before deployment', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const start = html.indexOf('<script type="module">');
  assert.notEqual(start, -1);
  const bodyStart = html.indexOf('>', start) + 1;
  const bodyEnd = html.indexOf('</script>', bodyStart);
  assert.notEqual(bodyEnd, -1);
  let source = html.slice(bodyStart, bodyEnd);
  source = source.slice(source.indexOf(';') + 1).replaceAll('import.meta.url', "'https://example.test/type-battle/'");
  assert.doesNotThrow(() => new Function(source));
});
