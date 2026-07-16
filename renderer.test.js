import test from 'node:test';
import assert from 'node:assert';
import { Renderer } from './src/renderer.js';

test('switching from run to idle never selects a missing sprite frame', () => {
  const drawn = [];
  const noop = () => {};
  const ctx = {
    save: noop,
    restore: noop,
    drawImage: image => {
      assert.ok(image);
      drawn.push(image);
    },
  };
  const game = {
    canvas: { width: 1600, height: 900 },
    ctx,
    scale: 100,
    gamePaused: false,
    gameOver: false,
    level: { disableAutoScroll: true },
    player: {
      x: 8,
      y: 8,
      width: 0.8,
      height: 0.8,
      vx: 0,
      shieldActive: false,
    },
  };
  const renderer = new Renderer(game);
  renderer.playerSprites = {
    idle: [{ id: 'idle-0' }, { id: 'idle-1' }],
    run: [{ id: 'run-0' }, { id: 'run-1' }, { id: 'run-2' }],
  };
  renderer.playerAnimation = 'run';
  renderer.playerFrameIndex = 2;

  renderer.drawPlayer();

  assert.strictEqual(renderer.playerFrameIndex, 0);
  assert.strictEqual(drawn[0].id, 'idle-0');
});
