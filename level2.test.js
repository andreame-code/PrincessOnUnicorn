import test from 'node:test';
import assert from 'node:assert';
import { createStubGame } from './testHelpers.js';
import { Level2 } from './src/levels/level2.js';
import { Level3 } from './src/levels/level3.js';
import { SHIELD_COOLDOWN } from './src/config.js';

const FRAME = 1 / 60;

test('level 2 maps space to shield only', () => {
  const game = createStubGame({ search: '?level=2', skipLevelUpdate: true });
  const player = game.player;
  game.handleInput();
  assert.strictEqual(player.shieldActive, true);
  assert.strictEqual(player.jumping, false);
});

test('level 2 ignores horizontal movement', () => {
  const game = createStubGame({ search: '?level=2', skipLevelUpdate: true });
  const player = game.player;
  const startX = player.x;
  game.handleInput('ArrowLeft', 'down');
  player.update(0, game.groundY, 1);
  assert.strictEqual(player.x, startX);
});

test('player covers 80% of distance after destroying 15 walls', () => {
  const game = createStubGame({ skipLevelUpdate: true });
  const level = new Level2(game);
  const player = game.player;
  const initialDistance =
    (level.boss.x - level.boss.width / 2) -
    (player.x + player.width / 2);
  player.shieldActive = true;
  for (let i = 0; i < 15; i++) {
    const wall = level.createObstacle();
    wall.x = player.x;
    level.wallCount++;
    level.handleCollision(wall);
  }
  const currentDistance =
    (level.boss.x - level.boss.width / 2) -
    (player.x + player.width / 2);
  assert.ok(Math.abs(currentDistance - initialDistance * 0.2) < 1e-6);
});

test('boss flees after princess destroys all 15 walls', () => {
  const game = createStubGame({ skipLevelUpdate: true });
  const level = new Level2(game);
  const player = game.player;
  player.shieldActive = true;
  for (let i = 0; i < 15; i++) {
    const wall = level.createObstacle();
    wall.x = player.x;
    level.wallCount++;
    level.handleCollision(wall);
  }
  level.update(FRAME);
  assert.ok(level.bossFlee);
  level.timer = 100;
  level.update(FRAME);
  assert.strictEqual(level.wallCount, 15);
  assert.strictEqual(level.obstacles.length, 0);
});

test('boss initial position uses resized canvas width', () => {
  const game = createStubGame({ canvasWidth: 300, innerWidth: 800, innerHeight: 450, search: '?level=2', skipLevelUpdate: true });
  assert.strictEqual(game.canvas.width, 800);
  assert.strictEqual(game.level.boss.x, game.worldWidth - 1 + 0.8 / 2);
});

test('shield remains active when input is spammed', () => {
  const game = createStubGame({ search: '?level=2', skipLevelUpdate: true });
  const player = game.player;
  for (let i = 0; i < 31; i++) {
    game.handleInput();
    player.update(0, game.groundY, FRAME);
  }
  assert.strictEqual(player.shieldActive, true);
});

test('shield remains active for about half a second', () => {
  const game = createStubGame({ search: '?level=2', skipLevelUpdate: true });
  const player = game.player;
  game.handleInput();
  let frames = Math.floor(0.4 / FRAME);
  for (let i = 0; i < frames; i++) {
    player.update(0, game.groundY, FRAME);
  }
  assert.strictEqual(player.shieldActive, true);
  frames = Math.ceil(0.2 / FRAME);
  for (let i = 0; i < frames; i++) {
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
  const gap = 0.05;
  wall.x = player.x + player.width / 2 + gap + wall.width / 2;

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

test('shield activation within grace window blocks attack', () => {
  const game = createStubGame({ search: '?level=2' });
  const level = game.level;
  const player = game.player;
  const wall = level.createObstacle();
  wall.x = player.x;
  level.handleCollision(wall);
  for (let i = 0; i < 6; i++) {
    player.update(0, game.groundY, FRAME);
    level.update(FRAME);
  }
  game.handleInput();
  player.update(0, game.groundY, FRAME);
  level.update(FRAME);
  assert.strictEqual(game.gameOver, false);
  assert.strictEqual(game.coins, 1);
});

test('missing grace window results in game over', () => {
  const game = createStubGame({ search: '?level=2' });
  const level = game.level;
  const player = game.player;
  const wall = level.createObstacle();
  wall.x = player.x;
  level.handleCollision(wall);
  const frames = Math.ceil(0.17 / FRAME);
  for (let i = 0; i < frames; i++) {
    player.update(0, game.groundY, FRAME);
    level.update(FRAME);
  }
  assert.strictEqual(game.gameOver, true);
});

test('game advances to level 3 after defeating level 2 boss', () => {
  const game = createStubGame({ search: '?level=2' });
  const level = game.level;
  level.bossFlee = true;
  level.boss.x = game.worldWidth + 1;
  game.update(FRAME);
  assert.strictEqual(game.levelNumber, 3);
  assert.ok(game.level instanceof Level3);
  assert.strictEqual(game.gameOver, false);
  assert.strictEqual(game.win, false);
});
