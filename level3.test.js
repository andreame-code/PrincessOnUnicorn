import test from 'node:test';
import assert from 'node:assert';
import { createStubGame } from './testHelpers.js';
import { LEVEL3_MAP } from './src/levels/level3.js';
import { Goomba } from './src/entities/goomba.js';
import { JUMP_VELOCITY } from './src/config.js';

const FRAME = 1 / 60;

// Ensure the tile map is loaded and entities are generated for each tile type.
test('level 3 builds entities from tile map', () => {
  const game = createStubGame({ search: '?level=3', skipLevelUpdate: true });
  const level = game.level;
  assert.deepStrictEqual(level.map, LEVEL3_MAP);
  assert.ok(level.platforms.length > 0);
  assert.ok(level.pipes.length > 0);
  assert.ok(level.enemies.length > 0);
});

// Distance travelled should increase according to the move speed.
test('level 3 advances using move speed', () => {
  const game = createStubGame({ search: '?level=3' });
  const level = game.level;
  level.update(1); // one second
  assert.strictEqual(level.distance, level.getMoveSpeed());
});

// After travelling the entire level the portal guardian should appear.
test('level 3 spawns guardian after level length', () => {
  const game = createStubGame({ search: '?level=3' });
  const level = game.level;
  let steps = 0;
  while (!level.boss && steps < 5000) {
    level.update(FRAME);
    steps++;
  }
  assert.ok(level.boss);
  assert.strictEqual(level.boss.type, 'guardian');
  assert.strictEqual(game.win, false);
});

test('portal opens and game is won after three hits on guardian', () => {
  const game = createStubGame({ search: '?level=3' });
  const level = game.level;
  let steps = 0;
  while (!level.boss && steps < 5000) {
    level.update(FRAME);
    steps++;
  }
  const boss = level.boss;
  const player = game.player;
  assert.strictEqual(boss.attackPhases.length, 3);
  for (let i = 0; i < 2; i++) {
    player.x = boss.x;
    player.y = boss.y - boss.height / 2 - player.height / 2 + 0.01;
    player.vy = 1;
    level.update(FRAME);
  }
  assert.strictEqual(boss.hits, 2);
  assert.strictEqual(level.portalOpen, false);
  player.x = boss.x;
  player.y = boss.y - boss.height / 2 - player.height / 2 + 0.01;
  player.vy = 1;
  level.update(FRAME);
  assert.ok(level.portalOpen);
  assert.ok(game.win);
});

// Level 3 uses jump instead of shield when pressing the action button
test('level 3 maps space to jump', () => {
  const game = createStubGame({ search: '?level=3', skipLevelUpdate: true });
  const player = game.player;
  game.handleInput();
  assert.strictEqual(player.jumping, true);
  assert.strictEqual(player.shieldActive, false);
});

test('player defeats enemy by landing on it', () => {
  const game = createStubGame({ search: '?level=3' });
  const level = game.level;
  const player = game.player;
  const enemy = new Goomba(player.x + 0.2, game.groundY - 0.5, 1);
  level.enemies = [enemy];
  level.obstacles = [...level.platforms, ...level.pipes, ...level.blocks, enemy];
  player.x = enemy.x;
  player.y = enemy.y - enemy.height / 2 - player.height / 2 + 0.01;
  player.vy = 1; // falling
  level.update(FRAME);
  assert.strictEqual(level.enemies.length, 0);
  assert.strictEqual(game.gameOver, false);
});

test('player is hit when colliding with enemy from side', () => {
  const game = createStubGame({ search: '?level=3' });
  const level = game.level;
  const player = game.player;
  const enemy = new Goomba(player.x + 0.5, game.groundY - 0.5, 1);
  level.enemies = [enemy];
  level.obstacles = [...level.platforms, ...level.pipes, ...level.blocks, enemy];
  player.x = enemy.x - enemy.width / 2 - player.width / 2 + 0.01;
  player.y = enemy.y;
  player.vy = 0;
  level.update(FRAME);
  assert.strictEqual(game.gameOver, true);
});

test('player can double jump in level 3', () => {
  const game = createStubGame({ search: '?level=3', skipLevelUpdate: true });
  const player = game.player;
  player.jump();
  game.update(FRAME);
  player.jump();
  assert.strictEqual(player.jumpCount, 2);
  assert.strictEqual(player.vy, JUMP_VELOCITY);
});

test('player cannot triple jump in level 3', () => {
  const game = createStubGame({ search: '?level=3', skipLevelUpdate: true });
  const player = game.player;
  player.jump();
  game.update(FRAME);
  player.jump();
  game.update(FRAME);
  player.jump();
  assert.strictEqual(player.jumpCount, 2);
});

test('guardian does not appear in level 1 or 2', () => {
  let game = createStubGame({ search: '?level=1' });
  assert.ok(!game.level.boss || game.level.boss.type !== 'guardian');
  game = createStubGame({ search: '?level=2' });
  assert.ok(!game.level.boss || game.level.boss.type !== 'guardian');
});

