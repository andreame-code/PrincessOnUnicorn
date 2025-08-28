import test, { describe } from 'node:test';
import assert from 'node:assert';
import { createLevel3Game, FRAME } from './level3TestHelpers.js';
import { createStubGame } from './testHelpers.js';
import { Goomba } from './src/entities/goomba.js';
import { ShadowCrow } from './src/entities/shadowCrow.js';
import { RhombusSprite } from './src/entities/rhombusSprite.js';
import { ThornGuard } from './src/entities/thornGuard.js';
import { PortalGuardian } from './src/entities/portalGuardian.js';

// Enemy-related tests for Level 3

describe('Level 3 enemies', () => {
  describe('spawning', () => {
    test('level 3 spawns exclusive enemies', () => {
      const game = createLevel3Game({ skipLevelUpdate: true });
      const level = game.level;
      assert.ok(level.enemies.some(e => e instanceof ShadowCrow));
      assert.ok(level.enemies.some(e => e instanceof RhombusSprite));
      assert.ok(level.enemies.some(e => e instanceof ThornGuard));
    });

    test('portal guardian only appears in level 3', () => {
      const l1 = createStubGame({ search: '?level=1', skipLevelUpdate: true }).level;
      const l2 = createStubGame({ search: '?level=2', skipLevelUpdate: true }).level;
      const l3 = createLevel3Game({ skipLevelUpdate: true }).level;
      assert.ok(!(l1.boss instanceof PortalGuardian));
      assert.ok(!(l2.boss instanceof PortalGuardian));
      assert.ok(l3.boss instanceof PortalGuardian);
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
  });

  describe('boss', () => {
    test('defeating portal guardian opens portal', () => {
      const game = createLevel3Game();
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
      assert.strictEqual(level.portal.open, true);
    });
  });

  describe('enemy behaviors', () => {
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
      sprite.update(0, 0.5);
      sprite.update(0, 0.1);
      assert.ok(sprite.x < startX);
    });

    test('thorn guard throws seed walls', () => {
      const guard = new ThornGuard(0, 0, 1);
      const spawned = guard.update(0, 1.1);
      assert.strictEqual(spawned.length, 1);
    });
  });

  describe('combat', () => {
    test('player defeats enemy by landing on it', () => {
      const game = createLevel3Game();
      const level = game.level;
      const player = game.player;
      const enemy = new Goomba(player.x + 0.2, game.groundY - 0.5, 1);
      level.enemies = [enemy];
      level.obstacles = [...level.platforms, ...level.pipes, ...level.blocks, enemy];
      player.x = enemy.x;
      player.y = enemy.y - enemy.height / 2 - player.height / 2 + 0.01;
      player.vy = 1;
      level.update(FRAME);
      assert.strictEqual(level.enemies.length, 0);
      assert.strictEqual(game.gameOver, false);
    });

    test('player is hit when colliding with enemy from side', () => {
      const game = createLevel3Game();
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
  });
});
