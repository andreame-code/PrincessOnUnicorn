import test from 'node:test';
import assert from 'node:assert';
import { createStubGame, destroyStubGame } from './testHelpers.js';
import { JUMP_VELOCITY, GRAVITY } from './src/config.js';

const FRAME = 1 / 60;

test.after(() => destroyStubGame());

test('player lands within expected time after jumping', () => {
  const game = createStubGame({ skipLevelUpdate: true });
  const { player, groundY } = game;
  let bounceCalls = 0;
  const originalPlaySound = game.renderer.playSound.bind(game.renderer);
  game.renderer.playSound = key => {
    if (key === 'bounce') bounceCalls++;
    originalPlaySound(key);
  };

  const jumpDuration = (-2 * JUMP_VELOCITY) / GRAVITY;
  const framesToLand = Math.ceil(jumpDuration / FRAME);

  player.jump();
  for (let i = 0; i < framesToLand; i++) {
    game.update(FRAME);
  }

  assert.strictEqual(player.y, groundY - player.height / 2);
  assert.ok(!player.jumping);
  assert.strictEqual(bounceCalls, 1);
});
