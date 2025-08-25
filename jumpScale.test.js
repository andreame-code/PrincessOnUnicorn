import test from 'node:test';
import assert from 'node:assert';
import { createStubGame } from './testHelpers.js';
import { JUMP_VELOCITY, GRAVITY } from './src/config.js';

const FRAME = 1 / 60;

function simulate(innerWidth) {
  const game = createStubGame({ innerWidth, skipLevelUpdate: true });
  const { player, groundY } = game;
  const jumpDuration = (-2 * JUMP_VELOCITY) / GRAVITY;
  const framesToLand = Math.ceil(jumpDuration / FRAME);
  player.jump();
  let minY = groundY;
  for (let i = 0; i < framesToLand; i++) {
    game.update(FRAME);
    if (player.y < minY) minY = player.y;
  }
  return { finalY: player.y, minY };
}

test('jump height and timing unaffected by sprite scale', () => {
  const normal = simulate(800); // scale ~1
  const scaled = simulate(1600); // scale ~2
  assert.ok(Math.abs(normal.finalY - scaled.finalY) < 1e-6);
  assert.ok(Math.abs(normal.minY - scaled.minY) < 1e-6);
});
