import test from 'node:test';
import assert from 'node:assert';
import { createStubGame } from './testHelpers.js';

const FRAME = 1 / 60;

test('player lands within one second after jumping', () => {
  const game = createStubGame({ skipLevelUpdate: true });
  const { player, groundY } = game;

  player.jump();
  for (let i = 0; i < 60; i++) {
    game.update(FRAME);
  }

  assert.strictEqual(player.y, groundY);
  assert.ok(!player.jumping);
});
