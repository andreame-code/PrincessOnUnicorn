import test from 'node:test';
import assert from 'node:assert';
import { createStubGame } from './testHelpers.js';
import { Level2 } from './src/levels/level2.js';

const FRAME = 1 / 60;

test('boss flees after player covers 70% of distance', () => {
  const game = createStubGame({ skipLevelUpdate: true });
  const level = new Level2(game);
  const initialDistance = level.boss.x - (game.player.x + game.player.width);
  const threshold = initialDistance * 0.3;

  game.player.x = level.boss.x - threshold - game.player.width;
  level.update(FRAME);
  assert.ok(level.bossFlee);
});

test('boss does not flee before player covers 70% of distance', () => {
  const game = createStubGame({ skipLevelUpdate: true });
  const level = new Level2(game);
  const initialDistance = level.boss.x - (game.player.x + game.player.width);
  const almostThreshold = initialDistance * 0.31;

  game.player.x = level.boss.x - almostThreshold - game.player.width;
  level.update(FRAME);
  assert.ok(!level.bossFlee);
});

test('boss initial position uses resized canvas width', () => {
  const game = createStubGame({ canvasWidth: 300, innerWidth: 800, search: '?level=2', skipLevelUpdate: true });
  assert.strictEqual(game.canvas.width, 800);
  assert.strictEqual(game.level.boss.x, 700);
});

test('shield deactivates even when input is spammed', () => {
  const game = createStubGame({ search: '?level=2', skipLevelUpdate: true });
  const player = game.player;
  for (let i = 0; i < 30; i++) {
    game.handleInput();
    player.update(0, game.groundY, FRAME);
  }
  assert.strictEqual(player.shieldActive, false);
});

test('shield can be reactivated after cooldown', () => {
  const game = createStubGame({ search: '?level=2', skipLevelUpdate: true });
  const player = game.player;
  game.handleInput();
  for (let i = 0; i < 60; i++) {
    player.update(0, game.groundY, FRAME);
  }
  game.handleInput();
  assert.strictEqual(player.shieldActive, true);
});
