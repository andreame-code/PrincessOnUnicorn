import test from 'node:test';
import assert from 'node:assert';
import { createStubGame } from './testHelpers.js';

const FRAME = 1 / 60;

test('player remains within vertical bounds when jumping', () => {
  const game = createStubGame({ skipLevelUpdate: true });
  const { player } = game;
  player.jump();
  let minY = Infinity;
  for (let i = 0; i < 120; i++) {
    game.update(FRAME);
    if (player.y < minY) minY = player.y;
  }
  assert.ok(minY >= player.height);
});
