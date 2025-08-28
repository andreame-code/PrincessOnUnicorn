import test from 'node:test';
import assert from 'node:assert';
import { createStubGame, destroyStubGame } from './testHelpers.js';

const FRAME = 1 / 60;

test.after(() => destroyStubGame());

test('spawns a new obstacle after interval', () => {
  const game = createStubGame();
  const level = game.level;
  assert.strictEqual(level.obstacles.length, 0);
  level.timer = level.interval;
  level.update(FRAME);
  assert.strictEqual(level.obstacles.length, 1);
});
