import test from 'node:test';
import assert from 'node:assert';
import { createStubGame } from './testHelpers.js';

// If the canvas is not yet visible, getBoundingClientRect can return zeros.
// resizeCanvas should fall back to window dimensions so the scale isn't 0.
test('resizeCanvas falls back to window size when bounding rect is zero', () => {
  const game = createStubGame();
  // define window height for fallback
  window.innerHeight = 600;
  // simulate zero-sized bounding box
  game.canvas.getBoundingClientRect = () => ({ width: 0, height: 0 });
  game.resizeCanvas();
  assert.ok(game.scale > 0);
  assert.strictEqual(game.player.spriteScale, game.scale);
});
