import test from 'node:test';
import assert from 'node:assert';
import { createStubGame } from './testHelpers.js';
import { Level2 } from './src/levels/level2.js';
import { LEVEL_UP_SCORE } from './src/config.js';

const FRAME = 1 / 60;

test('advances to level 2 after reaching threshold points', () => {
  const game = createStubGame({ skipLevelUpdate: true });
  for (let i = 0; i < LEVEL_UP_SCORE - 1; i++) {
    game.update(FRAME);
  }
  assert.strictEqual(game.levelNumber, 1);
  game.update(FRAME);
  assert.strictEqual(game.levelNumber, 2);
  assert.ok(game.level instanceof Level2);
});

test('resets when action is triggered after game over', () => {
  const game = createStubGame({ skipLevelUpdate: true });
  let resetCalled = false;
  game.reset = () => {
    resetCalled = true;
  };
  game.gameOver = true;
  game.gamePaused = true;
  game.handleInput();
  assert.ok(resetCalled);
});

test('detaches and reattaches input listeners on reset', () => {
  const game = createStubGame({ skipLevelUpdate: true });
  let detachCalls = 0;
  let attachCalls = 0;
  game.input.detach = () => { detachCalls++; };
  game.input.attach = () => { attachCalls++; };
  game.showOverlay = (_text, onClose) => { if (onClose) onClose(); };
  game.reset();
  assert.strictEqual(detachCalls, 1);
  assert.strictEqual(attachCalls, 1);
});
