import test from 'node:test';
import assert from 'node:assert';
import { createStubGame } from './testHelpers.js';
import { Level3 } from './src/levels/level3.js';

const FRAME = 1 / 60;

test('level 3 uses mini cactus obstacles', () => {
  const game = createStubGame({ search: '?level=3', skipLevelUpdate: true });
  const obstacle = game.level.createObstacle();
  assert.strictEqual(obstacle.width, 0.2);
  assert.strictEqual(obstacle.height, 0.4);
});

test('level 3 move speed slightly faster', () => {
  const game = createStubGame({ search: '?level=3', skipLevelUpdate: true });
  const level = game.level;
  assert.strictEqual(level.getMoveSpeed(), game.speed + 0.2);
});

test('level 3 spawn interval is shorter', () => {
  const interval = Level3.getInterval(() => 0);
  assert.strictEqual(interval, 50 / 60);
});

test('level 3 spawns obstacle after interval', () => {
  const game = createStubGame({ search: '?level=3' });
  const level = game.level;
  assert.strictEqual(level.obstacles.length, 0);
  level.timer = level.interval;
  level.update(FRAME);
  assert.strictEqual(level.obstacles.length, 1);
});
