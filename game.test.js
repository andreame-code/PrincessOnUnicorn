import test from 'node:test';
import assert from 'node:assert';
import { createStubGame } from './testHelpers.js';
import { Game } from './src/game.js';
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

test('removes resize listener on destroy', () => {
  const game = createStubGame({ skipLevelUpdate: true });
  assert.ok(window._eventListeners.resize);
  game.destroy();
  assert.strictEqual(window._eventListeners.resize, undefined);
});

test('throttles resize events', async () => {
  const game = createStubGame({ skipLevelUpdate: true });
  let calls = 0;
  game.resizeCanvas = () => { calls++; };
  window.dispatchEvent({ type: 'resize' });
  window.dispatchEvent({ type: 'resize' });
  window.dispatchEvent({ type: 'resize' });
  assert.strictEqual(calls, 0);
  await new Promise(r => setTimeout(r, 250));
  assert.strictEqual(calls, 1);
  game.destroy();
});

test('player continues to fall after losing', () => {
  const game = createStubGame({ search: '?level=2', skipLevelUpdate: true });
  // Simulate a game over scenario and trigger the death animation
  game.gameOver = true;
  game.player.die();
  const initialVy = game.player.vy;
  // After update, gravity should increase the vertical velocity
  game.update(FRAME);
  assert.ok(game.player.vy > initialVy);
});

test('toggles pause when pause key is pressed', () => {
  const game = createStubGame({ skipLevelUpdate: true });
  game.showOverlay = Game.prototype.showOverlay.bind(game);
  let showed = false;
  let hid = false;
  const origShow = game.overlay.show.bind(game.overlay);
  game.overlay.show = (text, cb) => {
    showed = true;
    origShow(text, cb);
  };
  const origHide = game.overlay.hide.bind(game.overlay);
  game.overlay.hide = () => {
    hid = true;
    origHide();
  };
  game.gamePaused = false;
  game.input.keyListener({ code: 'KeyP', repeat: false });
  assert.ok(game.gamePaused);
  assert.ok(showed);
  game.input.keyListener({ code: 'KeyP', repeat: false });
  assert.ok(!game.gamePaused);
  assert.ok(hid);
});
