import test from 'node:test';
import assert from 'node:assert';
import { Game } from './src/game.js';
import { Obstacle } from './src/obstacle.js';
import { Level2 } from './src/levels/level2.js';

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
  game.showOverlay = noop;
  game.gamePaused = false;
  return game;
}

test('awards coin for passed obstacle and preserves coins in level 2', () => {
  const game = createStubGame();
  const obstacle = new Obstacle(game.player.x - 30, game.groundY, 20, 40);
  obstacle.coinAwarded = false;
  game.level.obstacles.push(obstacle);

  game.update(1);
  assert.strictEqual(game.coins, 1);

  game.score = 999;
  game.update(1);
  assert.strictEqual(game.levelNumber, 2);
  assert.ok(game.level instanceof Level2);
  assert.strictEqual(game.coins, 1);
});

