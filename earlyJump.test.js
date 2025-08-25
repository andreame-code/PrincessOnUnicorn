import test from 'node:test';
import assert from 'node:assert';
import { createStubGame } from './testHelpers.js';

const FRAME = 1 / 60;

// Ensure that jumping early over an obstacle no longer causes a collision
// once the obstacle has been cleared.
test('player can jump early without landing on obstacle', () => {
  const game = createStubGame();
  const obstacle = game.level.createObstacle();
  obstacle.x = 1.74; // far enough that player previously landed on it
  obstacle.y = game.groundY;
  game.level.obstacles = [obstacle];

  game.player.jump();
  for (let i = 0; i < 120; i++) {
    game.update(FRAME);
  }

  assert.strictEqual(game.gameOver, false);
});
