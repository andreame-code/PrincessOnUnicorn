import test from 'node:test';
import assert from 'node:assert';
import { Game } from './src/game.js';
import { Level2 } from './src/levels/level2.js';
import { LEVEL_UP_SCORE } from './src/config.js';

function createStubGame() {
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
  const overlayContent = {};
  const overlayButton = {};

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

  const game = new Game(canvas);
  game.gamePaused = false;
  game.showOverlay = noop;
  game.level.update = noop;
  return game;
}

test('advances to level 2 after reaching required points', () => {
  const game = createStubGame();
  for (let i = 0; i < LEVEL_UP_SCORE - 1; i++) {
    game.update();
  }
  assert.strictEqual(game.levelNumber, 1);
  game.update();
  assert.strictEqual(game.levelNumber, 2);
  assert.ok(game.level instanceof Level2);
});

test('resets when action is triggered after game over', () => {
  const game = createStubGame();
  let resetCalled = false;
  game.reset = () => {
    resetCalled = true;
  };
  game.gameOver = true;
  game.gamePaused = true;
  game.handleInput();
  assert.ok(resetCalled);
});
