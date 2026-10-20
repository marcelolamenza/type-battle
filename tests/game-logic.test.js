import test from 'node:test';
import assert from 'node:assert/strict';
import { effectiveness, exactSet, Round, TYPES } from '../game-logic.js';

test('pure Water has exactly Electric and Grass weaknesses', () => {
  const chart = effectiveness(['water']);
  assert.equal(chart.electric, 2); assert.equal(chart.grass, 2);
  assert.deepEqual(TYPES.filter(t => chart[t] === 2).sort(), ['electric','grass']);
});
test('Water/Ground turns Grass into 4x, not an exact 2x answer', () => {
  const chart = effectiveness(['water','ground']);
  assert.equal(chart.grass, 4); assert.notEqual(chart.grass, 2); assert.equal(chart.ice, 2);
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
  assert.deepEqual(noWeakness.answers, ['ice']);
});
