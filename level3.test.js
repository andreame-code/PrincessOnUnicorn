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

// After travelling the entire level and clearing entities the level should end.
test('level 3 completes after level length', () => {
  const game = createStubGame({ search: '?level=3' });
  const level = game.level;
  const distanceToPortal = level.portal.x - game.player.x;
  const maxSteps = Math.ceil(distanceToPortal / level.getMoveSpeed() / FRAME) + 60;
  let steps = 0;
  while (!game.win && steps < maxSteps) {
    level.update(FRAME);
    steps++;
  }
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

test('level 3 has a secret of five stars', () => {
  const game = createStubGame({ search: '?level=3', skipLevelUpdate: true });
  const level = game.level;
  assert.strictEqual(level.stars.length, 5);
});

test('collecting a star increases star count', () => {
  const game = createStubGame({ search: '?level=3' });
  const level = game.level;
  const star = level.stars[0];
  star.x = game.player.x;
  star.y = game.player.y;
  level.update(FRAME);
  assert.strictEqual(game.stars, 1);
  assert.strictEqual(level.stars.length, 4);
});

test('checkpoint and portal are unique to level 3', () => {
  const game = createStubGame({ search: '?level=3', skipLevelUpdate: true });
  const level = game.level;
  assert.ok(level.checkpoint);
  assert.ok(level.portal);
  const game1 = createStubGame({ search: '?level=1', skipLevelUpdate: true });
  assert.ok(!game1.level.stars || game1.level.stars.length === 0);
  const game2 = createStubGame({ search: '?level=2', skipLevelUpdate: true });
  assert.ok(!game2.level.stars || game2.level.stars.length === 0);
});

test('cloud platform disappears then respawns', () => {
  const game = createStubGame({ search: '?level=3' });
  const level = game.level;
  level.getMoveSpeed = () => 0;
  const cloud = level.platforms.find(p => p.kind === 'cloud');
  assert.ok(cloud);
  const player = game.player;
  cloud.x = player.x;
  cloud.y = player.y - 1;
  player.y = cloud.y - cloud.height / 2 - player.height / 2 + 0.01;
  player.vy = 0.1;
  game.update(FRAME);
  for (let i = 0; i < Math.ceil(1.2 / FRAME) + 1; i++) game.update(FRAME);
  assert.strictEqual(cloud.visible, false);
  for (let i = 0; i < Math.ceil(3 / FRAME); i++) game.update(FRAME);
  assert.strictEqual(cloud.visible, true);
});

test('falling platform drops after shaking', () => {
  const game = createStubGame({ search: '?level=3' });
  const level = game.level;
  level.getMoveSpeed = () => 0;
  const falling = level.platforms.find(p => p.kind === 'falling');
  assert.ok(falling);
  const player = game.player;
  falling.x = player.x;
  falling.y = player.y - 1;
  player.y = falling.y - falling.height / 2 - player.height / 2 + 0.01;
  player.vy = 0.1;
  game.update(FRAME);
  for (let i = 0; i < Math.ceil(0.3 / FRAME) + 1; i++) game.update(FRAME);
  const yBefore = falling.y;
  game.update(FRAME);
  assert.ok(falling.falling);
  assert.ok(falling.y > yBefore);
});

test('special platforms exist only in level 3', () => {
  const g1 = createStubGame({ search: '?level=1', skipLevelUpdate: true });
  assert.ok(!g1.level.platforms || g1.level.platforms.length === 0);
  const g2 = createStubGame({ search: '?level=2', skipLevelUpdate: true });
  assert.ok(!g2.level.platforms || g2.level.platforms.length === 0);
  const g3 = createStubGame({ search: '?level=3', skipLevelUpdate: true });
  assert.ok(g3.level.platforms.length > 0);
});

test('level 3 duration is between 90 and 150 seconds', () => {
  const game = createStubGame({ search: '?level=3', skipLevelUpdate: true });
  const level = game.level;
  const duration = level.levelLength / level.getMoveSpeed();
  assert.ok(duration >= 90 && duration <= 150);
});

