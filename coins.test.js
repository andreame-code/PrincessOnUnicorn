import test from 'node:test';
import assert from 'node:assert';
import { createStubGame } from './testHelpers.js';
import { Obstacle } from './src/obstacle.js';
import { Level2 } from './src/levels/level2.js';
import { LEVEL_UP_SCORE } from './src/config.js';

const FRAME = 1 / 60;

test('awards coin for passed obstacle and preserves coins in level 2', () => {
  const game = createStubGame();
  const obstacle = new Obstacle(game.player.x - 0.5, game.groundY, 0.4, 0.8);
  obstacle.coinAwarded = false;
  game.level.obstacles.push(obstacle);

  game.update(FRAME);
  assert.strictEqual(game.coins, 1);

  game.score = LEVEL_UP_SCORE - 1;
  game.update(FRAME);
  assert.strictEqual(game.levelNumber, 2);
  assert.ok(game.level instanceof Level2);
  assert.strictEqual(game.coins, 1);
});

