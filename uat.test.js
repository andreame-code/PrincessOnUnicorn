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
