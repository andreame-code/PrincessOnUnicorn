import test from 'node:test';
import assert from 'node:assert';
import { Game } from './src/game.js';
import { Level2 } from './src/levels/level2.js';

function createStubGame({ canvasWidth = 800, innerWidth = 800, search = '' } = {}) {
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
  const canvas = { width: canvasWidth, height: 200, getContext: () => ctx };
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
    innerWidth,
    location: { search },
    addEventListener: noop,
    removeEventListener: noop,
    requestAnimationFrame: noop,
  };

  const game = new Game(canvas);
  game.showOverlay = noop;
  game.gamePaused = false;
  game.level.update = noop;
  return game;
}

test('boss flees after player covers 70% of distance', () => {
  const game = createStubGame();
  const level = new Level2(game);
  const initialDistance = level.boss.x - (game.player.x + game.player.width);
  const threshold = initialDistance * 0.3;

  game.player.x = level.boss.x - threshold - game.player.width;
  level.update();
  assert.ok(level.bossFlee);
});

test('boss does not flee before player covers 70% of distance', () => {
  const game = createStubGame();
  const level = new Level2(game);
  const initialDistance = level.boss.x - (game.player.x + game.player.width);
  const almostThreshold = initialDistance * 0.31;

  game.player.x = level.boss.x - almostThreshold - game.player.width;
  level.update();
  assert.ok(!level.bossFlee);
});

test('boss initial position uses resized canvas width', () => {
  const game = createStubGame({ canvasWidth: 300, innerWidth: 800, search: '?level=2' });
  assert.strictEqual(game.canvas.width, 800);
  assert.strictEqual(game.level.boss.x, 700);
});

test('shield deactivates even when input is spammed', () => {
  const game = createStubGame({ search: '?level=2' });
  const player = game.player;
  for (let i = 0; i < 30; i++) {
    game.handleInput();
    player.update(0, game.groundY);
  }
  assert.strictEqual(player.shieldActive, false);
});

test('shield can be reactivated after cooldown', () => {
  const game = createStubGame({ search: '?level=2' });
  const player = game.player;
  game.handleInput();
  for (let i = 0; i < 60; i++) {
    player.update(0, game.groundY);
  }
  game.handleInput();
  assert.strictEqual(player.shieldActive, true);
});
