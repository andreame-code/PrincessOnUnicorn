import test from 'node:test';
import assert from 'node:assert';
import { createStubGame } from './testHelpers.js';

// If the canvas is not yet visible, getBoundingClientRect can return zeros.
// resizeCanvas should fall back to window dimensions so the scale isn't 0.
test('resizeCanvas falls back to window size when bounding rect is zero', () => {
  const game = createStubGame();
  window.innerWidth = 1000;
  window.innerHeight = 500;
  game.canvas.getBoundingClientRect = () => ({ width: 0, height: 0 });
  game.resizeCanvas();
  assert.ok(game.scale > 0);
  assert.ok(Math.abs(game.canvas.width / game.canvas.height - 16 / 9) < 1e-6);
});
