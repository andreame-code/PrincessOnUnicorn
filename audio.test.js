import test from 'node:test';
import assert from 'node:assert';
import { Renderer } from './src/renderer.js';

class AudioMock {
  constructor() {
    this._listeners = {};
    this.volume = 1;
    this.currentTime = 0;
    this.playCalled = false;
  }
  addEventListener(event, handler) {
    this._listeners[event] = handler;
  }
  set src(value) {
    this._src = value;
    setTimeout(() => {
      if (this._listeners.canplaythrough) this._listeners.canplaythrough();
    }, 0);
  }
  play() {
    this.playCalled = true;
  }
}

test('renderer preloads audio assets and sets volume', async () => {
  global.Audio = AudioMock;
  const renderer = new Renderer({ ctx: {} });
  await renderer.preload();
  const jump = renderer.assets.get('jump');
  assert.ok(jump instanceof AudioMock);
  assert.strictEqual(jump.volume, 0.5);
});

test('playSound resets time and plays audio', async () => {
  global.Audio = AudioMock;
  const renderer = new Renderer({ ctx: {} });
  await renderer.preload();
  const jump = renderer.assets.get('jump');
  jump.currentTime = 1;
  renderer.playSound('jump');
  assert.strictEqual(jump.currentTime, 0);
  assert.ok(jump.playCalled);
});
