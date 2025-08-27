import test from 'node:test';
import assert from 'node:assert';
import { createStubGame } from './testHelpers.js';

test('level 1 obstacles have tree dimensions', () => {
  const game = createStubGame({ search: '?level=1' });
  const obstacle = game.level.createObstacle();
  assert.strictEqual(obstacle.width, 0.32);
  assert.strictEqual(obstacle.height, 0.64);
});

test('level 1 awards coin when obstacle passes', () => {
  const game = createStubGame({ search: '?level=1' });
  const level = game.level;
  const obstacle = level.createObstacle();
  obstacle.x = game.player.x - game.player.width - obstacle.width;
  level.obstacles.push(obstacle);
  const before = game.coins;
  level.update(0);
  assert.strictEqual(game.coins, before + 1);
});
