import test from 'node:test';
import assert from 'node:assert';
import { Game } from './src/game.js';

const FRAME = 1 / 60;

function createStubGame(rng) {
  const noop = () => {};
  const ctx = {
    clearRect: noop,
    fillRect: noop,
    beginPath: noop,
    moveTo: noop,
    lineTo: noop,
    fill: noop,
    arc: noop,
    stroke: noop,
    fillText: noop,
    measureText: () => ({ width: 0 }),
  };
  const canvas = { width: 800, height: 200, getContext: () => ctx };
  const overlay = { classList: { add: noop, remove: noop } };
  const overlayContent = { textContent: '' };
  const overlayButton = { onclick: null };

  global.document = {
    getElementById: (id) => {
      switch (id) {
        case 'game':
          return canvas;
        case 'overlay':
          return overlay;
        case 'overlay-content':
          return overlayContent;
        case 'overlay-button':
          return overlayButton;
        default:
          return null;
      }
    },
    addEventListener: noop,
    removeEventListener: noop,
  };
  global.window = {
    innerWidth: 800,
    location: { search: '' },
    addEventListener: noop,
    removeEventListener: noop,
    requestAnimationFrame: noop,
  };

  const game = new Game(canvas, rng);
  game.showOverlay = noop;
  game.gamePaused = false;
  return game;
}

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
  const game1 = createStubGame(rng1);
  const rng2 = seededRandom(42);
  const game2 = createStubGame(rng2);

  const level1 = game1.level;
  const level2 = game2.level;

  assert.strictEqual(level1.interval, level2.interval);

  level1.timer = level1.interval;
  level2.timer = level2.interval;
  level1.update(FRAME);
  level2.update(FRAME);

  assert.strictEqual(level1.interval, level2.interval);
});
