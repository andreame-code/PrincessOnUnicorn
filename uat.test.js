import test from 'node:test';
import assert from 'node:assert';
import { createStubGame, destroyStubGame } from './testHelpers.js';
import { Level2 } from './src/levels/level2.js';
import { Level3 } from './src/levels/level3.js';
import { LEVEL_UP_SCORE } from './src/config.js';

const FRAME = 1 / 60;

test.after(() => destroyStubGame());

test('game progression leads to final win', () => {
  const game = createStubGame({ skipLevelUpdate: true });

  // Advance through level 1 by accumulating enough score
  for (let i = 0; i <= LEVEL_UP_SCORE; i++) {
    game.update(FRAME);
  }
  assert.strictEqual(game.levelNumber, 2);
  assert.ok(game.level instanceof Level2);

  // Simulate defeating the level 2 boss to advance to level 3
  const level2 = game.level;
  level2.bossFlee = true;
  level2.boss.x = game.worldWidth + 1;
  game.update(FRAME);
  assert.strictEqual(game.levelNumber, 3);
  assert.ok(game.level instanceof Level3);

  // Open the portal and move the player into it to win the game
  const level3 = game.level;
  const player = game.player;
  level3.portal.open = true;
  player.x = level3.portal.x;
  player.y = level3.portal.y - level3.portal.height / 2 - player.height / 2 + 0.01;
  player.vy = 1;
  level3.update(FRAME);

  assert.strictEqual(game.gameOver, true);
  assert.strictEqual(game.win, true);
});

test('level 3 can be traversed with normal movement and timed jumps', () => {
  const game = createStubGame({ search: '?level=3' });
  const { level, player } = game;
  player.moveRight();
  let jumpCooldown = 0;

  for (let frame = 0; frame < 60 * 80 && level.distance < level.levelLength; frame++) {
    const hazards = [...level.pipes, ...level.enemies, ...level.thornWalls].filter(
      hazard => !hazard.defeated
    );
    const dangerAhead = hazards.some(
      hazard => hazard.x - player.x > 0 && hazard.x - player.x < 2.5
    );
    if (jumpCooldown > 0) jumpCooldown--;
    if (dangerAhead && jumpCooldown === 0) {
      player.jump();
      jumpCooldown = 18;
    }
    if (jumpCooldown === 10) player.releaseJump();
    game.update(FRAME);
    assert.strictEqual(game.gameOver, false, 'the readable route should reach the finale');
  }

  assert.strictEqual(level.checkpointReached, true);
  assert.ok(level.distance >= level.levelLength - 0.01);

  player.stopHorizontal();
  for (let hit = 0; hit < 3; hit++) {
    player.x = level.boss.x;
    player.y = level.boss.y - level.boss.height / 2 - player.height / 2 + 0.01;
    player.vy = 1;
    level.update(FRAME);
  }
  player.x = level.portal.x;
  player.y = level.portal.y - level.portal.height / 2 - player.height / 2 + 0.01;
  player.vy = 1;
  level.update(FRAME);

  assert.strictEqual(game.win, true);
});
