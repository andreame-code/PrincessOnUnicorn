import test, { describe } from 'node:test';
import assert from 'node:assert';
import { withLevel3, FRAME } from './level3TestHelpers.js';
import { createStubGame, destroyStubGame } from './testHelpers.js';
import { LEVEL3_MAP } from './src/levels/level3.js';
import { JUMP_VELOCITY, SHIELD_GRACE } from './src/config.js';
import { Goomba } from './src/entities/goomba.js';
import { Obstacle } from './src/obstacle.js';

// Mechanics and general level features

test.after(() => destroyStubGame());

describe('Level 3 mechanics', () => {
  describe('level basics', () => {
    test('level 3 builds entities from tile map', () => {
      withLevel3({ skipLevelUpdate: true }, ({ level }) => {
        assert.deepStrictEqual(level.map, LEVEL3_MAP);
        assert.ok(level.platforms.length > 0);
        assert.ok(level.pipes.length > 0);
        assert.ok(level.enemies.length > 0);
      });
    });

    test('level 3 does not auto advance without input', () => {
      withLevel3({}, ({ game, level, player }) => {
        game.update(1);
        assert.strictEqual(level.distance, 0);
        player.moveRight();
        game.update(1);
        assert.ok(level.distance > 0);
      });
    });

    test('level 3 completes after level length', () => {
      withLevel3({}, ({ game, level, player }) => {
        const boss = level.boss;
        for (let i = 0; i < 3; i++) {
          player.x = boss.x;
          player.y = boss.y - boss.height / 2 - player.height / 2 + 0.01;
          player.vy = 1;
          level.update(FRAME);
        }
        player.x = level.portal.x;
        player.y = level.portal.y - level.portal.height / 2 - player.height / 2 + 0.01;
        player.vy = 1;
        level.update(FRAME);
        assert.ok(game.win);
      });
    });

    test('level 3 maps space to jump', () => {
      withLevel3({ skipLevelUpdate: true }, ({ game, player }) => {
        game.handleInput();
        game.update(FRAME);
        assert.strictEqual(player.jumping, true);
        assert.strictEqual(player.shieldActive, false);
      });
    });

    test('player stops within 0.4s after releasing move', () => {
      withLevel3({ skipLevelUpdate: true }, ({ game, player }) => {
        player.moveRight();
        for (let i = 0; i < 30; i++) game.update(FRAME);
        player.stopHorizontal();
        for (let i = 0; i < 24; i++) game.update(FRAME);
        assert.ok(Math.abs(player.vx) < 0.01);
      });
    });

    test('level 3 duration is between 90 and 150 seconds', () => {
      withLevel3({ skipLevelUpdate: true }, ({ level }) => {
        const duration = level.levelLength / level.getMoveSpeed();
        assert.ok(duration >= 90 && duration <= 150);
      });
    });
  });

  describe('jumping mechanics', () => {
    test('coyote time allows late jumps', () => {
      withLevel3({}, ({ game, level, player }) => {
        level.getMoveSpeed = () => 0;
        const platform = { x: player.x, y: player.y - 1, width: 1, height: 0.2, visible: true, update: () => {} };
        level.platforms = [platform];
        level.obstacles = [platform];
        player.y = platform.y - platform.height / 2 - player.height / 2;
        player.vy = 0;
        game.update(FRAME);
        level.platforms = [];
        level.obstacles = [];
        game.update(FRAME);
        game.handleInput();
        game.update(FRAME);
        assert.ok(player.jumping);
      });
    });

    test('jump buffer triggers jump on landing', () => {
      withLevel3({}, ({ game, player }) => {
        game.level.getMoveSpeed = () => 0;
        player.y = game.groundY - player.height / 2 - 1;
        player.vy = 0;
        player.jumping = true;
        for (let i = 0; i < 30; i++) {
          if (i === 20) game.handleInput();
          game.update(FRAME);
        }
        assert.ok(player.jumping);
        assert.ok(player.y < game.groundY - player.height / 2);
      });
    });

    test('player can double jump in level 3', () => {
      withLevel3({ skipLevelUpdate: true }, ({ game, player }) => {
        player.jump();
        game.update(FRAME);
        player.jump();
        game.update(FRAME);
        assert.strictEqual(player.jumpCount, 2);
        assert.strictEqual(player.vy, JUMP_VELOCITY);
      });
    });

    test('player cannot triple jump in level 3', () => {
      withLevel3({ skipLevelUpdate: true }, ({ game, player }) => {
        player.jump();
        game.update(FRAME);
        player.jump();
        game.update(FRAME);
        player.jump();
        assert.strictEqual(player.jumpCount, 2);
      });
    });
  });

  describe('platform interactions', () => {
    test('player safely bumps into platform side', () => {
      withLevel3({}, ({ game, level, player }) => {
        level.getMoveSpeed = () => 0;
        const platform = {
          x: player.x + 1,
          y: player.y,
          width: 1,
          height: 0.2,
          visible: true,
          update: () => {},
        };
        level.platforms = [platform];
        level.obstacles = [platform];
        player.x = platform.x - platform.width / 2 - player.width / 2 + 0.1;
        player.vy = 0;
        level.update(FRAME);
        const expectedX = platform.x - platform.width / 2 - player.width / 2;
        assert.ok(Math.abs(player.x - expectedX) < 1e-6);
        assert.strictEqual(game.gameOver, false);
      });
    });

    test('player safely touches platform bottom', () => {
      withLevel3({}, ({ game, level, player }) => {
        level.getMoveSpeed = () => 0;
        const startY = player.y;
        const platform = {
          x: player.x,
          y: startY - 1,
          width: 1,
          height: 0.2,
          visible: true,
          update: () => {},
        };
        level.platforms = [platform];
        level.obstacles = [platform];
        player.y = platform.y + platform.height / 2 + player.height / 2 - 0.05;
        player.vy = -1;
        level.update(FRAME);
        const expectedY = platform.y + platform.height / 2 + player.height / 2;
        assert.ok(Math.abs(player.y - expectedY) < 1e-6);
        assert.strictEqual(game.gameOver, false);
      });
    });

    test('cloud platform disappears then respawns', () => {
      withLevel3({}, ({ game, level, player }) => {
        level.getMoveSpeed = () => 0;
        const cloud = level.platforms.find(p => p.kind === 'cloud');
        assert.ok(cloud);
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
    });

    test('falling platform drops after shaking', () => {
      withLevel3({}, ({ game, level, player }) => {
        level.getMoveSpeed = () => 0;
        const falling = level.platforms.find(p => p.kind === 'falling');
        assert.ok(falling);
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
    });

    test('special platforms exist only in level 3', () => {
      const g1 = createStubGame({ search: '?level=1', skipLevelUpdate: true });
      assert.ok(!g1.level.platforms || g1.level.platforms.length === 0);
      const g2 = createStubGame({ search: '?level=2', skipLevelUpdate: true });
      assert.ok(!g2.level.platforms || g2.level.platforms.length === 0);
      withLevel3({ skipLevelUpdate: true }, ({ level }) => {
        assert.ok(level.platforms.length > 0);
      });
    });
  });

  describe('collectibles and checkpoints', () => {
    test('level 3 has a secret of five stars', () => {
      withLevel3({ skipLevelUpdate: true }, ({ level }) => {
        assert.strictEqual(level.stars.length, 5);
      });
    });

    test('collecting a star increases star count', () => {
      withLevel3({}, ({ game, level }) => {
        const star = level.stars[0];
        star.x = game.player.x;
        star.y = game.player.y;
        level.update(FRAME);
        assert.strictEqual(game.stars, 1);
        assert.strictEqual(level.stars.length, 4);
      });
    });

    test('checkpoint and portal are unique to level 3', () => {
      withLevel3({ skipLevelUpdate: true }, ({ level }) => {
        assert.ok(level.checkpoint);
        assert.ok(level.portal);
      });
      const game1 = createStubGame({ search: '?level=1', skipLevelUpdate: true });
      assert.ok(!game1.level.stars || game1.level.stars.length === 0);
      const game2 = createStubGame({ search: '?level=2', skipLevelUpdate: true });
      assert.ok(!game2.level.stars || game2.level.stars.length === 0);
    });

    test('player respawns at checkpoint in level 3', () => {
      withLevel3({}, ({ game, level, player }) => {
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
  });
});
