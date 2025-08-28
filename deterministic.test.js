import test from 'node:test';
import assert from 'node:assert';
import { createStubGame, destroyStubGame } from './testHelpers.js';

const FRAME = 1 / 60;

test.after(() => destroyStubGame());

function seededRandom(seed) {
  let s = seed;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

test('level 1 obstacle intervals are deterministic with seeded RNG', () => {
  const rng1 = seededRandom(42);
  const game1 = createStubGame({ rng: rng1 });
  const rng2 = seededRandom(42);
  const game2 = createStubGame({ rng: rng2 });

  const level1 = game1.level;
  const level2 = game2.level;

  assert.strictEqual(level1.interval, level2.interval);

  level1.timer = level1.interval;
  level2.timer = level2.interval;
  level1.update(FRAME);
  level2.update(FRAME);

  assert.strictEqual(level1.interval, level2.interval);
});
