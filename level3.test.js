import test from 'node:test';
import assert from 'node:assert';
import { createStubGame } from './testHelpers.js';
import { LEVEL3_MAP } from './src/levels/level3.js';
import { Goomba } from './src/entities/goomba.js';
import { ShadowCrow } from './src/entities/shadowCrow.js';
import { RhombusSprite } from './src/entities/rhombusSprite.js';
import { ThornGuard } from './src/entities/thornGuard.js';
import { PortalGuardian } from './src/entities/portalGuardian.js';
import { JUMP_VELOCITY, SHIELD_GRACE } from './src/config.js';
import { Obstacle } from './src/obstacle.js';

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
  const boss = level.boss;
  const player = game.player;
  for (let i = 0; i < 3; i++) {
    player.x = boss.x;
    player.y = boss.y - boss.height / 2 - player.height / 2 + 0.01;
    player.vy = 1;
    level.update(FRAME);
  }
  game.starDust = 30;
  game.hasCrystalKey = true;
  const distanceToPortal = level.portal.x - player.x;
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

test('level 3 spawns exclusive enemies', () => {
  const game = createStubGame({ search: '?level=3', skipLevelUpdate: true });
  const level = game.level;
  assert.ok(level.enemies.some(e => e instanceof ShadowCrow));
  assert.ok(level.enemies.some(e => e instanceof RhombusSprite));
  assert.ok(level.enemies.some(e => e instanceof ThornGuard));
});

test('portal guardian only appears in level 3', () => {
  const l1 = createStubGame({ search: '?level=1', skipLevelUpdate: true }).level;
  const l2 = createStubGame({ search: '?level=2', skipLevelUpdate: true }).level;
  const l3 = createStubGame({ search: '?level=3', skipLevelUpdate: true }).level;
  assert.ok(!(l1.boss instanceof PortalGuardian));
  assert.ok(!(l2.boss instanceof PortalGuardian));
  assert.ok(l3.boss instanceof PortalGuardian);
});

test('portal stays closed until items collected', () => {
  const game = createStubGame({ search: '?level=3' });
  const level = game.level;
  const boss = level.boss;
  const player = game.player;
  assert.strictEqual(level.portal.open, false);
  assert.strictEqual(boss.phase, 1);
  for (let i = 0; i < 3; i++) {
    player.x = boss.x;
    player.y = boss.y - boss.height / 2 - player.height / 2 + 0.01;
    player.vy = 1;
    level.update(FRAME);
    if (i < 2) assert.strictEqual(boss.phase, i + 2);
  }
  assert.ok(boss.defeated);
  assert.strictEqual(level.portal.open, false);
  game.starDust = 30;
  game.hasCrystalKey = true;
  level.update(FRAME);
  assert.strictEqual(level.portal.open, true);
});

test('exclusive enemies only appear in level 3', () => {
  const g1 = createStubGame({ search: '?level=1', skipLevelUpdate: true });
  const g2 = createStubGame({ search: '?level=2', skipLevelUpdate: true });
  const hasExclusive = lvl =>
    !!(
      lvl.enemies &&
      lvl.enemies.some(
        e => e instanceof ShadowCrow || e instanceof RhombusSprite || e instanceof ThornGuard
      )
    );
  assert.strictEqual(hasExclusive(g1.level), false);
  assert.strictEqual(hasExclusive(g2.level), false);
});

test('shadow crow moves in a sinusoidal path', () => {
  const crow = new ShadowCrow(0, 0, 1);
  const startY = crow.y;
  crow.update(0, 0.25);
  const midY = crow.y;
  crow.update(0, 0.25);
  const endY = crow.y;
  assert.notStrictEqual(startY, midY);
  assert.ok(Math.abs(endY - startY) < 1e-6);
});

test('rhombus sprite dashes forward', () => {
  const sprite = new RhombusSprite(0, 0, 1);
  const startX = sprite.x;
  sprite.update(0, 0.5); // trigger dash
  sprite.update(0, 0.1); // perform dash
  assert.ok(sprite.x < startX);
});

test('thorn guard throws seed walls', () => {
  const guard = new ThornGuard(0, 0, 1);
  const spawned = guard.update(0, 1.1);
  assert.strictEqual(spawned.length, 1);
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

test('level 3 has thirty stardust and a crystal key', () => {
  const game = createStubGame({ search: '?level=3', skipLevelUpdate: true });
  const level = game.level;
  assert.strictEqual(level.starDust.length, 30);
  assert.ok(level.crystalKey);
});

test('collecting stardust increases count', () => {
  const game = createStubGame({ search: '?level=3' });
  const level = game.level;
  const dust = level.starDust[0];
  dust.x = game.player.x;
  dust.y = game.player.y;
  level.update(FRAME);
  assert.strictEqual(game.starDust, 1);
  assert.strictEqual(level.starDust.length, 29);
});

test('collecting crystal key sets flag', () => {
  const game = createStubGame({ search: '?level=3' });
  const level = game.level;
  const key = level.crystalKey;
  key.x = game.player.x;
  key.y = game.player.y;
  level.update(FRAME);
  assert.ok(game.hasCrystalKey);
  assert.strictEqual(level.crystalKey, null);
});

test('stardust, key and portal are unique to level 3', () => {
  const game = createStubGame({ search: '?level=3', skipLevelUpdate: true });
  const level = game.level;
  assert.ok(level.checkpoint);
  assert.ok(level.portal);
  assert.ok(level.crystalKey);
  assert.ok(level.starDust.length > 0);
  const game1 = createStubGame({ search: '?level=1', skipLevelUpdate: true });
  assert.ok(!game1.level.starDust || game1.level.starDust.length === 0);
  assert.ok(!game1.level.crystalKey);
  assert.ok(!game1.level.portal);
  const game2 = createStubGame({ search: '?level=2', skipLevelUpdate: true });
  assert.ok(!game2.level.starDust || game2.level.starDust.length === 0);
  assert.ok(!game2.level.crystalKey);
  assert.ok(!game2.level.portal);
});

test('portal requires stardust and key', () => {
  const game = createStubGame({ search: '?level=3' });
  const level = game.level;
  level.getMoveSpeed = () => 0;
  const portal = level.portal;
  portal.x = game.player.x;
  portal.y = game.player.y;
  level.boss.defeated = true;
  level.update(FRAME);
  assert.strictEqual(game.gameOver, false);
  game.starDust = 30;
  game.hasCrystalKey = true;
  level.update(FRAME);
  assert.strictEqual(game.gameOver, true);
  assert.strictEqual(game.win, true);
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

test('player respawns at checkpoint in level 3', () => {
  const game = createStubGame({ search: '?level=3' });
  const level = game.level;
  const player = game.player;
  const cp = level.checkpoint;
  player.x = cp.x;
  player.y = game.groundY - player.height / 2;
  level.update(FRAME);
  assert.ok(level.checkpointReached);
  const enemy = new Goomba(player.x, player.y, 1);
  level.enemies = [enemy];
  level.obstacles = [
    ...level.platforms.filter(p => p.visible),
    ...level.pipes,
    ...level.blocks,
    enemy,
  ];
  level.update(FRAME);
  assert.strictEqual(level.respawning, true);
  for (let i = 0; i < Math.ceil(1 / FRAME) + 1; i++) level.update(FRAME);
  assert.strictEqual(level.respawning, false);
  assert.strictEqual(game.gameOver, false);
  assert.ok(Math.abs(player.x - level.respawnPoint.x) < 1e-6);
});

test('other levels do not respawn on death', () => {
  const g1 = createStubGame({ search: '?level=1' });
  const p1 = g1.player;
  const o1 = new Obstacle(p1.x, p1.y, 1, 1);
  g1.level.handleCollision(o1);
  assert.strictEqual(g1.gameOver, true);

  const g2 = createStubGame({ search: '?level=2' });
  const p2 = g2.player;
  const o2 = new Obstacle(p2.x, p2.y, 1, 1);
  g2.level.handleCollision(o2);
  g2.level.update(SHIELD_GRACE);
  assert.strictEqual(g2.gameOver, true);
});

