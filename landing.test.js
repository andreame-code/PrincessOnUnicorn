import test from 'node:test';
import assert from 'node:assert';
import { createStubGame } from './testHelpers.js';
import { JUMP_VELOCITY, GRAVITY } from './src/config.js';

const FRAME = 1 / 60;

test('player lands within expected time after jumping', () => {
  const game = createStubGame({ skipLevelUpdate: true });
  const { player, groundY } = game;

  const jumpDuration = (-2 * JUMP_VELOCITY) / GRAVITY;
  const framesToLand = Math.ceil(jumpDuration / FRAME);

  player.jump();
  for (let i = 0; i < framesToLand; i++) {
    game.update(FRAME);
  }

  assert.strictEqual(player.y, groundY);
  assert.ok(!player.jumping);
});
