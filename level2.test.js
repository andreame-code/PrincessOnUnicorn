import test from 'node:test';
import assert from 'node:assert';
import { createStubGame } from './testHelpers.js';
import { Level2 } from './src/levels/level2.js';
import { SHIELD_COOLDOWN } from './src/config.js';

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
  const frames = Math.ceil(SHIELD_COOLDOWN / FRAME);
  for (let i = 0; i <= frames; i++) {
    player.update(0, game.groundY, FRAME);
  }
  game.handleInput();
  assert.strictEqual(player.shieldActive, true);
});

test('shield blocks obstacles slightly earlier', () => {
  const game = createStubGame({ search: '?level=2', skipLevelUpdate: true });
  const level = game.level;
  const player = game.player;
  const wall = level.createObstacle();
  const gap = 5;
  wall.x = player.x + player.width + gap;

  // Without shield the obstacle should pass
  assert.ok(level.handleCollision(wall));

  // With shield active it should collide
  player.activateShield();
  assert.ok(!level.handleCollision(wall));
});

test('shield cooldown bar uses latest cooldown value', () => {
  const game = createStubGame({ search: '?level=2', skipLevelUpdate: true });
  const player = game.player;
  assert.strictEqual(player.shieldCooldownMax, SHIELD_COOLDOWN);
  player.activateShield(0.25, 2);
  assert.strictEqual(player.shieldCooldownMax, 2);
});
