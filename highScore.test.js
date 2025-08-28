import test from 'node:test';
import assert from 'node:assert';
import { createStubGame, destroyStubGame } from './testHelpers.js';

test.after(() => destroyStubGame());

test('reads high score from localStorage', () => {
  createStubGame({ skipLevelUpdate: true });
  localStorage.clear();
  localStorage.setItem('highScore', '123');
  const game = createStubGame({ skipLevelUpdate: true });
  assert.strictEqual(game.highScore, 123);
});

test('updates high score and persists across reset and new game', () => {
  createStubGame({ skipLevelUpdate: true });
  localStorage.clear();
  const game = createStubGame({ skipLevelUpdate: true });
  game.score = 50;
  game.update(0);
  assert.strictEqual(localStorage.getItem('highScore'), '50');
  assert.strictEqual(game.highScore, 50);
  game.showOverlay = (_text, cb) => { if (cb) cb(); };
  game.reset();
  assert.strictEqual(game.highScore, 50);
  const game2 = createStubGame({ skipLevelUpdate: true });
  assert.strictEqual(game2.highScore, 50);
});
