import test from 'node:test';
import assert from 'node:assert';
import { createStubGame } from './testHelpers.js';

const FRAME = 1 / 60;

// Ensure obstacles are mini cactus
// and have the expected dimensions
// and type flag for rendering.
test('level 3 uses mini cactus obstacles', () => {
  const game = createStubGame({ search: '?level=3', skipLevelUpdate: true });
  const obstacle = game.level.createObstacle();
  assert.strictEqual(obstacle.width, 0.2);
  assert.strictEqual(obstacle.height, 0.4);
  assert.strictEqual(obstacle.type, 'cactus');
});

// Distance travelled should increase according to the
// move speed so that layout markers are hit at the
// expected times.
test('level 3 advances using move speed', () => {
  const game = createStubGame({ search: '?level=3' });
  const level = game.level;
  level.update(1); // one second
  assert.strictEqual(level.distance, level.getMoveSpeed());
});

// Obstacles spawn only after travelling the layout distance.
test('level 3 spawns obstacles based on layout', () => {
  const game = createStubGame({ search: '?level=3' });
  const level = game.level;
  for (let i = 0; i < 100; i++) level.update(FRAME);
  assert.strictEqual(level.obstacles.length, 0);
  for (let i = 0; i < 100; i++) level.update(FRAME);
  assert.ok(level.obstacles.length > 0);
});

// After travelling the entire level and clearing obstacles
// the level should signal completion.
test('level 3 completes after level length', () => {
  const game = createStubGame({ search: '?level=3' });
  const level = game.level;
  let steps = 0;
  while (!game.win && steps < 5000) {
    level.update(FRAME);
    steps++;
  }
  assert.ok(game.win);
});
